# Implementation Plan: Checkout

## Overview

Implement the full checkout flow for Apex Modular Construction: Zustand cart store with localStorage/Supabase sync, a three-step checkout wizard (shipping → review → Stripe payment), order creation, success page, and admin order management. All in TypeScript/Next.js using Server Actions consistent with existing patterns.

## Tasks

- [x] 1. Database migration — add variant and shipping_cost columns
  - Create `supabase/migrations/019_checkout_variants_shipping.sql`
  - Add `variant_code` and `variant_image_url` to `cart_items` and `order_items`
  - Drop old `cart_items_user_id_product_id_key` unique constraint and add `cart_items_user_product_variant_key`
  - Add `shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0` to `orders`
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Tax calculator utility
  - [x] 2.1 Implement `lib/tax/calculator.ts`
    - Define `CanadianProvince` union type for all 13 province/territory codes
    - Define `TaxBreakdown` interface
    - Implement `calculateTax(subtotal: number, province: CanadianProvince): TaxBreakdown` as a pure function using the rate table from the design
    - Round `taxAmount` to 2 decimal places
    - _Requirements: 5.2_

  - [ ]* 2.2 Write property test for tax calculation correctness (Property 13)
    - **Property 13: Tax calculation is correct for every Canadian province**
    - **Validates: Requirements 5.2**
    - Use fast-check; for each province code and arbitrary positive subtotal, assert `taxAmount === round2(subtotal * rate[province])`

  - [ ]* 2.3 Write property test for order total equals subtotal plus tax (Property 14)
    - **Property 14: Order total equals subtotal plus tax**
    - **Validates: Requirements 5.3**
    - For arbitrary subtotal and province, assert `total === subtotal + taxAmount`

- [x] 3. Zustand cart store
  - [x] 3.1 Implement `lib/stores/cartStore.ts`
    - Define `CartItem` and `CartStore` interfaces per the design
    - Implement `addItem`, `removeItem`, `updateQuantity`, `clearCart`
    - Implement `loadFromLocalStorage` / `loadFromSupabase` / `mergeGuestCart` / `syncToSupabase`
    - Implement derived `itemCount()` and `subtotal()` selectors
    - Persist guest cart to localStorage key `cargoplus_cart`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 3.2 Write property test for localStorage round-trip (Property 1)
    - **Property 1: localStorage cart serialization round-trip**
    - **Validates: Requirements 1.1**
    - Use fast-check; for arbitrary cart items, assert `deserialize(serialize(items))` deep-equals `items`

  - [ ]* 3.3 Write property test for cart merge increments quantities (Property 2)
    - **Property 2: Cart merge increments quantities for duplicates**
    - **Validates: Requirements 1.3**
    - For two arbitrary carts with possible overlapping `(product_id, variant_code)` pairs, assert merged quantities equal the sum of both carts for shared pairs and all non-overlapping items are present

  - [ ]* 3.4 Write property test for cart merge clears localStorage (Property 3)
    - **Property 3: Cart merge clears localStorage**
    - **Validates: Requirements 1.4**
    - For any non-empty localStorage cart, after successful merge, assert localStorage cart is empty

  - [ ]* 3.5 Write property test for cart badge count (Property 4)
    - **Property 4: Cart badge count equals sum of quantities**
    - **Validates: Requirements 1.5**
    - For arbitrary cart items, assert `itemCount() === items.reduce((s, i) => s + i.quantity, 0)`

  - [ ]* 3.6 Write property test for out-of-stock rejection (Property 5)
    - **Property 5: Out-of-stock products are rejected**
    - **Validates: Requirements 1.6**
    - For any product with `stock_quantity = 0`, assert cart contents unchanged after add attempt

  - [ ]* 3.7 Write property test for duplicate add increments quantity (Property 6)
    - **Property 6: Adding a duplicate item increments quantity**
    - **Validates: Requirements 2.3**
    - For arbitrary cart containing a `(product_id, variant_code)` pair, adding the same pair with quantity `n` should increase existing quantity by `n` with no new row

- [x] 4. Cart Server Actions
  - [x] 4.1 Implement `app/actions/cart.ts`
    - Implement `addCartItem`, `removeCartItem`, `updateCartItemQuantity`, `getCartItems`, `clearCartItems`, `mergeGuestCartItems`
    - All actions use the authenticated Supabase client; include `variant_code` and `variant_image_url` in all reads/writes
    - `addCartItem` must check `stock_quantity > 0` before inserting; return `{ error: 'Out of stock' }` if zero
    - _Requirements: 1.2, 1.6, 2.3_

- [x] 5. Cart page (`/cart`)
  - [x] 5.1 Implement `app/cart/page.tsx` and cart item components
    - Read cart from `useCartStore`; render each item with product name, variant code, variant image, unit price, quantity input, line total, and Remove button
    - Display order summary with subtotal
    - Show empty-cart message with link to `/products` when cart is empty
    - "Proceed to Checkout" button: redirect unauthenticated users to `/auth/login?returnUrl=/checkout`, authenticated users to `/checkout`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Write property test for line total equals unit price times quantity (Property 8)
    - **Property 8: Line total equals unit price times quantity**
    - **Validates: Requirements 3.2**
    - For arbitrary price `p > 0` and quantity `q > 0`, assert `lineTotal === round2(p * q)`

  - [ ]* 5.3 Write property test for subtotal equals sum of line totals (Property 10)
    - **Property 10: Subtotal equals sum of all line totals**
    - **Validates: Requirements 3.4**
    - For arbitrary cart items, assert `subtotal === sum(items.map(i => lineTotal(i)))`

  - [ ]* 5.4 Write property test for removing an item (Property 9)
    - **Property 9: Removing an item removes it from the cart**
    - **Validates: Requirements 3.3**
    - For any cart with at least one item, after removing that item, assert it no longer appears and all other items are unchanged

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Stripe infrastructure
  - [x] 7.1 Implement `lib/stripe/server.ts`
    - Export a singleton `Stripe` instance using `STRIPE_SECRET_KEY`
    - _Requirements: 6.3_

  - [x] 7.2 Implement `lib/stripe/client.ts`
    - Export a `loadStripe()` singleton using `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    - _Requirements: 6.1_

  - [x] 7.3 Implement `app/actions/payment.ts`
    - Implement `createPaymentIntent(amountCents: number)` Server Action
    - Create a Stripe PaymentIntent with `currency: 'cad'`; return `{ clientSecret, error }`
    - _Requirements: 6.3_

- [x] 8. Checkout flow — Step 1 (Shipping)
  - [x] 8.1 Implement `app/checkout/steps/ShippingStep.tsx`
    - Form fields: full name, email, phone, address line 1, city, province dropdown (all 13 provinces/territories), postal code
    - Validate all fields non-empty and postal code matches `[A-Z]\d[A-Z] \d[A-Z]\d`
    - Display inline errors per field on failed validation; do not advance step
    - Pre-populate from authenticated user's profile where available
    - On valid submit, call `onComplete(shippingData)` to advance to Step 2
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 8.2 Write property test for postal code validation (Property 11)
    - **Property 11: Postal code validation accepts valid and rejects invalid formats**
    - **Validates: Requirements 4.2**
    - For arbitrary strings matching `[A-Z]\d[A-Z] \d[A-Z]\d`, assert accepted; for arbitrary strings not matching, assert rejected

  - [ ]* 8.3 Write property test for invalid form does not advance step (Property 12)
    - **Property 12: Invalid form submission does not advance the step**
    - **Validates: Requirements 4.3**
    - For any Step 1 submission with at least one invalid/empty field, assert step remains at 1 and at least one error is displayed

- [x] 9. Checkout flow — Step 2 (Review)
  - [x] 9.1 Implement `app/checkout/steps/ReviewStep.tsx`
    - Display all cart items: product name, variant code, unit price, quantity, line total
    - Call `calculateTax(province, subtotal)` and display subtotal, tax (labelled with type and rate), shipping as "To be confirmed", and total
    - "Back" button restores Step 1 with previously entered values
    - "Continue to Payment" advances to Step 3
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 9.2 Write property test for cart item display fields (Property 7)
    - **Property 7: Cart item display includes all required fields**
    - **Validates: Requirements 3.1, 5.1**
    - For any cart item, assert rendered row includes product name, variant code, variant image, unit price, quantity, and line total

  - [ ]* 9.3 Write property test for step back navigation preserves values (Property 15)
    - **Property 15: Step back navigation preserves previously entered values**
    - **Validates: Requirements 5.4, 6.6**
    - For any valid Step 1 data, navigating to Step 2 then back should restore all Step 1 values exactly

- [x] 10. Checkout flow — Step 3 (Payment)
  - [x] 10.1 Implement `app/checkout/steps/PaymentStep.tsx`
    - Render Stripe Elements card form (card number, expiry, CVC)
    - Display "Pay $X.XX CAD" button with exact total from Step 2
    - On click: call `createPaymentIntent`, then `stripe.confirmCardPayment`; disable button and show loading indicator during processing
    - On Stripe error: display error message and re-enable button
    - On success: call `createOrder` then redirect to `/checkout/success?order=<orderNumber>`
    - "Back" button returns to Step 2 with values preserved
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 10.2 Write property test for pay button label shows exact total (Property 16)
    - **Property 16: Pay button label shows exact total**
    - **Validates: Requirements 6.2**
    - For any calculated total `t`, assert button label is exactly `"Pay $X.XX CAD"` where `X.XX` is `t` formatted to 2 decimal places

- [x] 11. Checkout flow — orchestrator and page
  - [x] 11.1 Implement `app/checkout/CheckoutFlow.tsx`
    - Client Component managing `step` state (`1 | 2 | 3`), `shippingData`, `taxBreakdown`, `clientSecret`, `isProcessing`, `error`
    - Render `ShippingStep`, `ReviewStep`, or `PaymentStep` based on current step
    - _Requirements: 4.4, 5.5, 6.3_

  - [x] 11.2 Implement `app/checkout/page.tsx`
    - Server Component; check authentication — redirect unauthenticated users to `/auth/login?returnUrl=/checkout`
    - Load user profile and pass to `CheckoutFlow` for pre-population
    - _Requirements: 2.4_

- [x] 12. Order Service
  - [x] 12.1 Implement `app/actions/orders.ts`
    - Implement `createOrder(input: CreateOrderInput)`: generate `order_number` (`CP-YYYYMMDD-XXXXXX` using `crypto.randomBytes`), insert into `orders` and `order_items`, set `payment_status = 'paid'`, clear cart items; retry once on order number collision
    - Implement `getOrderByNumber(orderNumber: string)`: fetch order with items for success page
    - On DB write failure after Stripe success: log `payment_id` + order details to server error log; return `{ error: 'Contact support' }`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.4_

  - [ ]* 12.2 Write property test for order record completeness (Property 17)
    - **Property 17: Order creation produces a complete and correct order record**
    - **Validates: Requirements 7.1, 7.3**
    - For arbitrary valid checkout inputs, assert all required fields present with correct values (`status = 'pending'`, `payment_status = 'paid'`, `total = subtotal + tax_amount`, etc.)

  - [ ]* 12.3 Write property test for one order_item per cart item (Property 18)
    - **Property 18: Order creation produces one order_item per cart item**
    - **Validates: Requirements 7.2**
    - For arbitrary cart with 1–20 items, assert `order_items.length === cart.length` with correct fields on each row

  - [ ]* 12.4 Write property test for order creation clears cart (Property 19)
    - **Property 19: Order creation clears the user's cart**
    - **Validates: Requirements 7.4**
    - For any user with a non-empty cart, after successful order creation, assert both Supabase `cart_items` and localStorage cart are empty

  - [ ]* 12.5 Write property test for order number format and uniqueness (Property 21)
    - **Property 21: Order number matches format and is unique**
    - **Validates: Requirements 9.4**
    - Generate N order numbers; assert all match `^CP-\d{8}-[A-Z0-9]{6}$` and all are distinct

- [x] 13. Order success page
  - [x] 13.1 Implement `app/checkout/success/page.tsx`
    - Server Component; read `?order=` query param — redirect to `/` if missing or invalid
    - Call `getOrderByNumber` and render: order number, purchased items (name, quantity, price), total in CAD, shipping address
    - Display "Continue Shopping" link to `/products`
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 13.2 Write property test for success page displays all required information (Property 20)
    - **Property 20: Success page displays all required order information**
    - **Validates: Requirements 8.1**
    - For any order, assert success page renders order number, all items, total, and shipping address

- [ ] 14. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Header cart badge
  - Implement `components/layout/CartBadge.tsx`
  - Client Component subscribing to `useCartStore().itemCount()`
  - Render numeric badge on cart icon; update reactively
  - Wire into the site header layout
  - _Requirements: 1.5_

- [ ] 16. Admin order management
  - [x] 16.1 Implement `app/actions/admin-orders.ts`
    - Implement `getAllOrders()`, `getOrderDetail(orderId)`, `updateOrderStatus(orderId, status)`
    - `updateOrderStatus` must validate status is one of `{pending, processing, shipped, delivered, cancelled, refunded}`; return error for invalid values
    - _Requirements: 10.1, 10.3, 10.4_

  - [ ]* 16.2 Write property test for only valid fulfilment status values accepted (Property 24)
    - **Property 24: Only valid fulfilment status values are accepted**
    - **Validates: Requirements 10.4**
    - For arbitrary strings not in the valid set, assert `updateOrderStatus` returns an error

  - [x] 16.3 Implement `app/admin/orders/OrdersTable.tsx`
    - Client Component rendering orders table: order number, customer email, order date, total in CAD, payment status, fulfilment status
    - _Requirements: 10.1_

  - [x] 16.4 Implement `app/admin/orders/page.tsx` (list) and `app/admin/orders/[id]/page.tsx` (detail)
    - List page: Server Component with admin auth guard (redirect non-admin to `/`); render `OrdersTable`
    - Detail page: display line items, shipping address, Stripe payment ID; include status update UI
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

  - [ ]* 16.5 Write property test for non-admin users cannot access admin orders (Property 25)
    - **Property 25: Non-admin users cannot access admin orders**
    - **Validates: Requirements 10.5**
    - For any authenticated user without the `admin` role, assert request to `/admin/orders` results in redirect to `/`

  - [ ]* 16.6 Write property test for admin orders table displays all required fields (Property 22)
    - **Property 22: Admin orders table displays all required fields**
    - **Validates: Requirements 10.1**
    - For any order, assert table row displays order number, customer email, order date, total, payment status, and fulfilment status

  - [ ]* 16.7 Write property test for admin order detail displays complete information (Property 23)
    - **Property 23: Admin order detail displays complete information**
    - **Validates: Requirements 10.2**
    - For any order with line items, assert detail view displays all line items, shipping address, and Stripe payment ID

- [ ] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations per property
- Tag format for property tests: `// Feature: checkout, Property N: <property text>`
- Unit tests cover specific examples (one per province for tax, postal code examples, order number format)
- Integration tests cover Stripe PaymentIntent creation (test mode) and Supabase cart/order persistence
