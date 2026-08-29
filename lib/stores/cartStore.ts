import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { customizationsKey } from '@/lib/cart/canonicalJson'
import type { CartCustomizations } from '@/types/cart'

export interface CartItem {
  productId: string
  variantCode: string | null
  variantImageUrl: string | null
  productName: string
  productPrice: number
  quantity: number
  customizations?: CartCustomizations
  configurationId?: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty: number) => void
  removeItem: (productId: string, variantCode: string | null, customizations?: CartItem['customizations'], configurationId?: string | null) => void
  updateQuantity: (productId: string, variantCode: string | null, qty: number, customizations?: CartItem['customizations'], configurationId?: string | null) => void
  replaceItems: (items: CartItem[]) => void /* Overwrites the whole cart in one update */
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
}

const CART_KEY = 'apex_cart'

function isSameItem(
  a: CartItem,
  b: {
    productId: string;
    variantCode: string | null;
    customizations?: CartItem['customizations'];
    configurationId?: string | null;
  }
) {
  const baseMatch =
    a.productId === b.productId &&
    a.variantCode === b.variantCode &&
    (a.configurationId || null) === (b.configurationId || null);
  if (!baseMatch) return false;

  // Compare customizations. Canonical form, not raw JSON.stringify — these
  // objects are also compared server-side against values read back out of a
  // jsonb column, which does not preserve key order.
  return customizationsKey(a.customizations) === customizationsKey(b.customizations);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty) => {
        set((state) => {
          const existing = state.items.find((i) => isSameItem(i, item))
          if (existing) {
            return {
              items: state.items.map((i) =>
                isSameItem(i, item) ? { ...i, quantity: i.quantity + qty } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: qty }] }
        })
      },

      removeItem: (productId, variantCode, customizations, configurationId) => {
        set((state) => ({
          items: state.items.filter((i) => !isSameItem(i, { productId, variantCode, customizations, configurationId })),
        }))
      },

      updateQuantity: (productId, variantCode, qty, customizations, configurationId) => {
        set((state) => ({
          items: state.items.map((i) =>
            isSameItem(i, { productId, variantCode, customizations, configurationId }) ? { ...i, quantity: qty } : i
          ),
        }))
      },

      replaceItems: (items) => set({ items }),

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => {
        const total = get().items.reduce((sum, i) => sum + i.productPrice * i.quantity, 0)
        return Math.round(total * 100) / 100
      },
    }),
    {
      name: CART_KEY,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
)
