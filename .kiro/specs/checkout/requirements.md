# Requirements Document

## Introduction

The Checkout feature enables authenticated Apex Modular Construction customers to purchase construction materials sourced from China and delivered to Canada. It covers the full purchase flow: adding items to a cart (with localStorage for guests and Supabase persistence for logged-in users), a three-step checkout process (contact/shipping → order review → Stripe payment), order creation on payment success, and admin order management. All prices are in CAD.

## Glossary

- **Cart**: The collection of products a user intends to purchase, stored in localStorage for guests and in the `cart_items` Supabase table for authenticated users.
- **Cart_Manager**: The client-side service responsible for reading, writing, and merging cart state between localStorage and Supabase.
- **Checkout_Flow**: The three-step wizard at `/checkout` guiding the user through contact/shipping, order review, and payment.
- **Tax_Calculator**: The server-side utility that computes GST, HST, PST, or QST based on the selected Canadian province.
- **Payment_Processor**: The Stripe Elements integration that tokenises card details and confirms payment intent.
- **Order_Service**: The server action responsible for creating an order and its line items in the database after successful payment.
- **Admin_Panel**: The `/admin/orders` interface used by administrators to view and update order statuses.
- **Province**: A Canadian province or territory identified by its two-letter code (e.g., `ON`, `BC`, `QC`).
- **Variant**: A specific product configuration identified by a `variant_code` and optionally a distinct image (`variant_image_url`).
- **Order_Number**: A human-readable unique identifier assigned to each order at creation time.

---

## Requirements

### Requirement 1: Cart Persistence and Merging

**User Story:** As a shopper, I want my cart to be saved whether I am logged in or browsing as a guest, so that I never lose items I have added.

#### Acceptance Criteria

1. WHILE a user is not authenticated, THE Cart_Manager SHALL store cart items in localStorage using a structured JSON format containing `product_id`, `variant_code`, `variant_image_url`, and `quantity`.
2. WHILE a user is authenticated, THE Cart_Manager SHALL persist cart items to the `cart_items` Supabase table, including `variant_code` and `variant_image_url` columns.
3. WHEN a guest user completes authentication, THE Cart_Manager SHALL merge localStorage cart items into the user's Supabase cart, incrementing quantities for duplicate `(product_id, variant_code)` pairs rather than replacing them.
4. WHEN a merge completes, THE Cart_Manager SHALL clear the localStorage cart.
5. THE Cart_Manager SHALL display the total item count as a numeric badge on the cart icon in the site header, updating in real time as items are added or removed.
6. IF a product's `stock_quantity` is zero at the time of adding, THEN THE Cart_Manager SHALL reject the addition and display an "Out of stock" message to the user.

---

### Requirement 2: Add to Cart and Buy Now

**User Story:** As a shopper browsing a product page, I want to add items to my cart or go directly to checkout, so that I can shop at my own pace or purchase immediately.

#### Acceptance Criteria

1. WHEN a user clicks "Add to Cart" on a product page, THE Cart_Manager SHALL add the selected product and variant to the cart and keep the user on the current page.
2. WHEN a user clicks "Buy Now" on a product page, THE Cart_Manager SHALL add the selected product and variant to the cart and redirect the user to `/checkout`.
3. WHEN a user clicks "Add to Cart" or "Buy Now" for a product already in the cart with the same `variant_code`, THE Cart_Manager SHALL increment the existing item's quantity by the selected amount rather than creating a duplicate entry.
4. IF a user clicks "Buy Now" and is not authenticated, THEN THE Checkout_Flow SHALL redirect the user to `/auth/login` with a return URL of `/checkout`.

---

### Requirement 3: Cart Page

**User Story:** As a shopper, I want to review and manage my cart before proceeding to checkout, so that I can confirm my selections and quantities.

#### Acceptance Criteria

1. THE Cart_Manager SHALL render all cart items at `/cart`, displaying product name, variant code, variant image, unit price in CAD, quantity, and line total.
2. WHEN a user changes the quantity of a cart item, THE Cart_Manager SHALL update the stored quantity and recalculate the line total immediately.
3. WHEN a user clicks "Remove" on a cart item, THE Cart_Manager SHALL delete that item from the cart.
4. THE Cart_Manager SHALL display an order summary showing subtotal (sum of all line totals) in CAD.
5. WHEN the cart is empty, THE Cart_Manager SHALL display an empty-cart message and a link to `/products`.
6. WHEN a user clicks "Proceed to Checkout" and is not authenticated, THEN THE Cart_Manager SHALL redirect the user to `/auth/login` with a return URL of `/checkout`.
7. WHEN a user clicks "Proceed to Checkout" and is authenticated, THE Cart_Manager SHALL redirect the user to `/checkout`.

---

### Requirement 4: Checkout Step 1 — Contact and Shipping Address

**User Story:** As a buyer, I want to enter my contact details and Canadian shipping address, so that my order can be delivered to the correct location.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL present Step 1 as a form collecting: full name, email address, phone number, street address, city, Province (dropdown of all 13 Canadian provinces and territories), and postal code.
2. WHEN a user submits Step 1, THE Checkout_Flow SHALL validate that all fields are non-empty and that the postal code matches the Canadian format `[A-Z]\d[A-Z] \d[A-Z]\d`.
3. IF any Step 1 field fails validation, THEN THE Checkout_Flow SHALL display an inline error message adjacent to the invalid field and SHALL NOT advance to Step 2.
4. WHEN Step 1 validation passes, THE Checkout_Flow SHALL persist the shipping address in component state and advance to Step 2.
5. THE Checkout_Flow SHALL pre-populate Step 1 fields with the authenticated user's profile data where available.

---

### Requirement 5: Checkout Step 2 — Order Review

**User Story:** As a buyer, I want to review my order totals including tax before paying, so that I know exactly what I will be charged.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL display all cart items in Step 2 with product name, variant code, unit price in CAD, quantity, and line total.
2. THE Tax_Calculator SHALL compute the applicable tax amount based on the Province selected in Step 1, using the following rates:
   - AB, NT, NU, YT: GST 5%
   - BC, MB, SK: GST 5% + PST (BC 7%, MB 7%, SK 6%)
   - QC: GST 5% + QST 9.975%
   - ON, NB, NL, NS, PE: HST (ON 13%, NB 15%, NL 15%, NS 15%, PE 15%)
3. THE Checkout_Flow SHALL display the subtotal, tax amount (labelled with the applicable tax type and rate), shipping cost labelled as "To be confirmed", and the total (subtotal + tax) in CAD.
4. WHEN a user clicks "Back" in Step 2, THE Checkout_Flow SHALL return to Step 1 with all previously entered values preserved.
5. WHEN a user clicks "Continue to Payment" in Step 2, THE Checkout_Flow SHALL advance to Step 3.

---

### Requirement 6: Checkout Step 3 — Payment

**User Story:** As a buyer, I want to pay securely using my credit card, so that I can complete my purchase.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL render a Stripe Elements card form in Step 3, including card number, expiry, and CVC fields.
2. THE Checkout_Flow SHALL display a "Pay $X.XX CAD" button showing the exact total calculated in Step 2.
3. WHEN a user clicks the pay button, THE Payment_Processor SHALL create a Stripe PaymentIntent on the server for the calculated total in CAD and confirm it using the card details entered.
4. WHILE a payment is being processed, THE Checkout_Flow SHALL disable the pay button and display a loading indicator to prevent duplicate submissions.
5. IF the Stripe payment confirmation fails, THEN THE Checkout_Flow SHALL display the Stripe error message to the user and re-enable the pay button.
6. WHEN a user clicks "Back" in Step 3, THE Checkout_Flow SHALL return to Step 2 with all previously entered values preserved.

---

### Requirement 7: Order Creation on Payment Success

**User Story:** As a buyer, I want my order to be recorded in the system after a successful payment, so that I have a confirmed record of my purchase.

#### Acceptance Criteria

1. WHEN a Stripe payment is confirmed successfully, THE Order_Service SHALL create a record in the `orders` table with: `order_number`, `user_id`, `status` = `pending`, `subtotal`, `tax_amount`, `shipping_cost` = `0`, `total`, `shipping_address`, and `payment_id` from Stripe.
2. WHEN an order is created, THE Order_Service SHALL insert one row per cart item into `order_items`, capturing `product_id`, `product_name`, `product_price`, `variant_code`, `variant_image_url`, `quantity`, and `line_total`.
3. WHEN an order is created, THE Order_Service SHALL set `payment_status` = `paid` on the order record.
4. WHEN an order is created, THE Cart_Manager SHALL clear all cart items for the user from both Supabase and localStorage.
5. WHEN an order is created, THE Checkout_Flow SHALL redirect the user to `/checkout/success?order=<order_number>`.
6. IF the Order_Service fails to write to the database after a confirmed Stripe payment, THEN THE Order_Service SHALL log the Stripe `payment_id` and order details to the server error log and return an error to the client instructing the user to contact support.

---

### Requirement 8: Order Success Page

**User Story:** As a buyer, I want to see a confirmation page after my purchase, so that I know my order was placed successfully.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL render a success page at `/checkout/success` displaying the Order_Number, a summary of purchased items, the total charged in CAD, and the shipping address.
2. THE Checkout_Flow SHALL display a "Continue Shopping" link that navigates to `/products`.
3. IF a user navigates to `/checkout/success` without a valid `order` query parameter, THEN THE Checkout_Flow SHALL redirect the user to `/`.

---

### Requirement 9: Database Schema Changes

**User Story:** As a developer, I want the database schema to support variant tracking and shipping costs, so that orders accurately reflect what was purchased.

#### Acceptance Criteria

1. THE Order_Service SHALL operate against a `cart_items` table that includes `variant_code` (TEXT, nullable) and `variant_image_url` (TEXT, nullable) columns.
2. THE Order_Service SHALL operate against an `order_items` table that includes `variant_code` (TEXT, nullable) and `variant_image_url` (TEXT, nullable) columns.
3. THE Order_Service SHALL operate against an `orders` table that includes a `shipping_cost` (DECIMAL(10,2), NOT NULL, DEFAULT 0) column.
4. THE Order_Service SHALL generate a unique `order_number` using a deterministic format (e.g., `CP-YYYYMMDD-XXXXXX`) that is human-readable and collision-resistant.

---

### Requirement 10: Admin Order Management

**User Story:** As an administrator, I want to view all orders and update their statuses, so that I can manage fulfilment and keep customers informed.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display all orders at `/admin/orders` in a table showing Order_Number, customer email, order date, total in CAD, payment status, and fulfilment status.
2. WHEN an administrator selects an order, THE Admin_Panel SHALL display the full order detail including line items, shipping address, and Stripe payment ID.
3. WHEN an administrator updates an order's fulfilment status, THE Admin_Panel SHALL persist the new status to the `orders` table and display a success confirmation.
4. THE Admin_Panel SHALL support the following fulfilment status values: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`.
5. THE Admin_Panel SHALL be accessible only to users with the `admin` role; WHEN a non-admin user attempts to access `/admin/orders`, THE Admin_Panel SHALL redirect the user to `/`.
