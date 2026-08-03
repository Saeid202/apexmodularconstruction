/**
 * Cart_Manager — the client-side service responsible for reading, writing and
 * merging cart state between localStorage and Supabase.
 *
 * Every cart mutation should go through here
 * rather than calling the store or the actions directly.
 *
 * The two tiers are selected by auth state, not by feature:
 *   - guest         → Zustand store, persisted to localStorage
 *   - authenticated → `cart_items` in Supabase, mirrored into the store for
 *                     rendering
 *
 * Ownership marker
 * ----------------
 * Merging has to happen exactly once per login, and only for a cart the *guest*
 * built. The store alone can't tell the difference between "items a guest added"
 * and "items mirrored from the server a moment ago" — merging the latter would
 * double every quantity. A marker in localStorage records which user the current
 * local cart belongs to:
 *
 *   absent          → guest-owned; merge it on next login
 *   equals user id  → already a mirror of that user's server cart; do not merge
 *   different id    → left behind by another user on a shared browser; discard
 *
 * That makes `syncCartWithSession` idempotent and safe to call on every page
 * load, which is what keeps it correct for logins that don't pass through
 * `AuthForm` (session restore, magic links, a second tab).
 */

import {
  addCartItem,
  getCartItems,
  mergeGuestCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItemRow,
  type GuestCartItem,
} from '@/app/actions/cart'
import { NOT_AUTHENTICATED } from '@/lib/cart/errors'
import { createBrowserClient } from '@/lib/supabase/client'
import { useCartStore, type CartItem } from '@/lib/stores/cartStore'

const CART_OWNER_KEY = 'cargoplus_cart_owner'

export interface CartMutationResult {
  /** Human-readable failure reason, or null on success. */
  error: string | null
}

/* ------------------------------------------------------------------ *
 * Ownership marker
 * ------------------------------------------------------------------ */

function readCartOwner(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(CART_OWNER_KEY)
  } catch {
    return null
  }
}

function setCartOwner(userId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_OWNER_KEY, userId)
  } catch {
  }
}

function clearCartOwner(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CART_OWNER_KEY)
  } catch {
  }
}

/* ------------------------------------------------------------------ *
 * Session
 * ------------------------------------------------------------------ */

/**
 * Current user id, or null for a guest.
 *
 * Uses `getSession` rather than `getUser` because this runs on every cart
 * mutation and `getUser` makes a network round trip to validate the JWT.
 * `getSession` reads local storage only. A stale session is harmless here: it
 * merely picks the authenticated branch, and the server action then rejects
 * with `NOT_AUTHENTICATED`, which callers below degrade to guest behaviour.
 */
async function getSessionUserId(): Promise<string | null> {
  try {
    const supabase = createBrowserClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ *
 * Row mapping
 * ------------------------------------------------------------------ */

/**
 * Maps a `cart_items` row into the store's shape.
 *
 * `variant_code` comes back as '' for a product with no variant — the database
 * stores it that way so the column can be part of `cart_items_line_identity_key`
 * without COALESCE. The store and every UI branch expect `string | null`, so it
 * is converted back here rather than leaking the storage representation.
 */
function toCartItem(row: CartItemRow): CartItem | null {
  // A row whose product was deleted has nothing to render.
  if (!row.products) return null

  // A configured build carries its own total; the base product price is only a fallback.
  const price = row.house_configurations
    ? Number(row.house_configurations.total_price)
    : row.products.price

  // `customizations` is NOT NULL in the database and defaults to '{}', so "no
  // selections" arrives as an empty object. `buildCartItem` represents the same
  // state as `undefined`. Collapse both to `undefined` here so the store holds
  // one representation regardless of whether a line was built locally or
  // hydrated from the server — the same "one encoding of absent" rule the
  // cart_items constraint enforces, applied a layer up.
  const customizations =
    row.customizations && Object.keys(row.customizations).length > 0
      ? row.customizations
      : undefined

  return {
    productId: row.product_id,
    variantCode: row.variant_code || null,
    variantImageUrl: row.variant_image_url,
    productName: row.products.name,
    productPrice: price,
    quantity: row.quantity,
    customizations,
    configurationId: row.configuration_id,
  }
}

function toGuestCartItem(item: CartItem): GuestCartItem {
  return {
    product_id: item.productId,
    variant_code: item.variantCode,
    variant_image_url: item.variantImageUrl,
    quantity: item.quantity,
    customizations: item.customizations,
    configuration_id: item.configurationId ?? null,
  }
}

/* ------------------------------------------------------------------ *
 * Reads
 * ------------------------------------------------------------------ */

/** Mirrors the authenticated user's server cart into the store. */
async function loadServerCart(): Promise<void> {
  const { data } = await getCartItems()
  if (!data) return

  const items = data
    .map(toCartItem)
    .filter((item): item is CartItem => item !== null)

  useCartStore.getState().replaceItems(items)
}

/**
 * Reconciles local cart state with the current session. Safe to call on any
 * page load, including for guests.
 *
 * Merge guest cart into the user's Supabase cart on authentication, incrementing quantities for
 * duplicates and clear the localStorage cart once the merge completes.
 */
export async function syncCartWithSession(): Promise<void> {
  const userId = await getSessionUserId()

  if (!userId) {
    // No session. Anything local is a guest cart from here on, so release the
    // ownership marker — otherwise items added after a sign-out would look like
    // a server mirror and be silently discarded on the next login instead of
    // merged.
    clearCartOwner()
    return
  }

  const owner = readCartOwner()

  if (owner !== userId) {
    const localItems = useCartStore.getState().items

    if (owner === null && localItems.length > 0) {
      // Guest cart: fold it into the account, incrementing duplicates.
      const { error } = await mergeGuestCartItems(localItems.map(toGuestCartItem))

      if (error) {
        // Leave local state and the marker exactly as they are. Clearing here
        // would destroy the guest cart, and mirroring the server on top of it
        // would do the same — so bail out and let the next call retry.
        return
      }
    }
    // A marker belonging to a *different* user means these items are another
    // account's mirror on a shared browser. They are dropped, never merged.

    useCartStore.getState().clearCart()
    setCartOwner(userId)
  }

  await loadServerCart()
}

/* ------------------------------------------------------------------ *
 * Writes
 * ------------------------------------------------------------------ */

/**
 * Adds an item to whichever tier is active.
 *
 * For authenticated users the server runs first, because it holds the authoritative
 * stock check and the cart is left unchanged when a product is out of stock — an optimistic
 * local insert followed by a rollback would briefly show the item and bump the badge.
 */
export async function addToCart(
  item: Omit<CartItem, 'quantity'>,
  quantity = 1
): Promise<CartMutationResult> {
  const userId = await getSessionUserId()

  if (!userId) {
    clearCartOwner()
    useCartStore.getState().addItem(item, quantity)
    return { error: null }
  }

  // Authenticated, but this cart has not been claimed for them yet — they signed
  // in through a path that skipped the merge (email confirmation link, a second
  // tab, a restored session). Reconcile first, otherwise the pending guest items
  // get discarded by the mirror on the next cart visit.
  if (readCartOwner() !== userId) {
    await syncCartWithSession()
  }

  const { error } = await addCartItem(
    item.productId,
    item.variantCode,
    item.variantImageUrl,
    quantity,
    item.customizations,
    item.configurationId ?? null
  )

  if (error) {
    if (error === NOT_AUTHENTICATED) {
      // The session expired between the local check and the call. Treat this as
      // a guest add rather than losing the item.
      clearCartOwner()
      useCartStore.getState().addItem(item, quantity)
      return { error: null }
    }
    return { error }
  }

  setCartOwner(userId)
  useCartStore.getState().addItem(item, quantity)
  return { error: null }
}

/**
 * Sets a line's quantity.
 *
 * Local state updates first here — unlike `addToCart` — because the row already
 * exists and there is no server-side validation that can reject the change, so
 * an optimistic update carries no risk of showing something untrue.
 */
export async function setCartItemQuantity(
  item: CartItem,
  quantity: number
): Promise<CartMutationResult> {
  useCartStore
    .getState()
    .updateQuantity(item.productId, item.variantCode, quantity, item.customizations, item.configurationId)

  const userId = await getSessionUserId()
  if (!userId) return { error: null }

  const { error } = await updateCartItemQuantity(
    item.productId,
    item.variantCode,
    quantity,
    item.customizations,
    item.configurationId ?? null
  )

  return { error: error === NOT_AUTHENTICATED ? null : error }
}

/** Removes a line from whichever tier is active. */
export async function removeFromCart(item: CartItem): Promise<CartMutationResult> {
  useCartStore
    .getState()
    .removeItem(item.productId, item.variantCode, item.customizations, item.configurationId)

  const userId = await getSessionUserId()
  if (!userId) return { error: null }

  const { error } = await removeCartItem(
    item.productId,
    item.variantCode,
    item.customizations,
    item.configurationId ?? null
  )

  return { error: error === NOT_AUTHENTICATED ? null : error }
}

/**
 * Clears the cart after an order is placed.
 *
 * The server rows are already deleted by `createOrder`, so this only drops the
 * local mirror. The ownership marker is left in place: the cart still belongs to
 * this user, it is simply empty now.
 */
export function clearCartAfterOrder(): void {
  useCartStore.getState().clearCart()
}
