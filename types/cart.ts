/**
 * The shape of a cart line's `customizations` map.
 *
 * One definition shared by the Zustand store, the cart server actions and the
 * `cart_items.customizations` jsonb column.
 *
 * Keys are `product_customization_groups.id` for seller-authored groups. Values
 * are display-ready: nothing downstream resolves a key back to a group row, and
 * both render surfaces read `groupName`/`optionName` straight out of the value.
 *
 * `priceModifier` is recorded for the audit trail only. Cart totals are computed
 * from `productPrice * quantity`; see `subtotal()` in lib/stores/cartStore.ts.
 */
export interface CartCustomizationEntry {
  groupName: string
  optionName: string
  priceModifier: number
}

export type CartCustomizations = Record<string, CartCustomizationEntry>
