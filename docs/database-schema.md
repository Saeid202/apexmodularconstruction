# Apex Modular Construction Database Schema Documentation

This document describes the complete database schema for the Apex Modular Construction e-commerce platform.

## Overview

The database is built on PostgreSQL via Supabase and supports:
- User management with multiple roles (customer, seller, admin)
- Product catalog with categories and images
- Shopping cart functionality
- Order processing and tracking
- Customer inquiries
- Landing page hero slides

## Entity Relationship Diagram

```
profiles ||--o{ orders : "places"
profiles ||--o{ cart_items : "has"
profiles ||--o| sellers : "is_seller"

sellers ||--o{ products : "lists"

categories ||--o{ products : "contains"
categories ||--o| categories : "parent"

products ||--o{ product_images : "has"
products ||--o{ cart_items : "in"
products ||--o{ order_items : "ordered_in"

orders ||--o{ order_items : "contains"
```

## Tables

### profiles

Extends Supabase `auth.users` with additional profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| email | TEXT | NOT NULL | User email address |
| full_name | TEXT | | User's full name |
| phone | TEXT | | Phone number |
| avatar_url | TEXT | | URL to avatar image |
| role | TEXT | NOT NULL, DEFAULT 'customer', CHECK (customer, seller, admin) | User role |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:** Users can read and update their own profile.

---

### sellers

Additional information for seller accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| business_name | TEXT | NOT NULL | Business name |
| business_email | TEXT | NOT NULL | Business contact email |
| business_phone | TEXT | | Business phone number |
| business_address | TEXT | | Business address |
| description | TEXT | | Business description |
| logo_url | TEXT | | URL to business logo |
| status | TEXT | NOT NULL, DEFAULT 'pending', CHECK (pending, active, suspended) | Seller status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `pending` - Awaiting admin approval
- `active` - Approved and can list products
- `suspended` - Account suspended, products hidden

---

### categories

Product categories with hierarchical support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| name | TEXT | NOT NULL, UNIQUE | Category name |
| slug | TEXT | NOT NULL, UNIQUE | URL-friendly identifier |
| description | TEXT | | Category description |
| image_url | TEXT | | Category image URL |
| parent_id | UUID | REFERENCES categories(id) | Parent category for hierarchy |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**RLS Policies:** Public read access.

---

### products

Product listings in the marketplace.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| name | TEXT | NOT NULL | Product name |
| slug | TEXT | NOT NULL, UNIQUE | URL-friendly identifier |
| description | TEXT | | Product description |
| price | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Current price in CAD |
| compare_at_price | DECIMAL(10,2) | CHECK >= 0 | Original price for discounts |
| stock_quantity | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 | Available inventory |
| category_id | UUID | REFERENCES categories(id), NOT NULL | Category reference |
| seller_id | UUID | REFERENCES sellers(id), NOT NULL | Seller reference |
| status | TEXT | NOT NULL, DEFAULT 'pending', CHECK (pending, active, rejected, archived) | Product status |
| specifications | JSONB | DEFAULT '{}' | Product specifications |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status Values:**
- `pending` - Awaiting admin approval
- `active` - Visible in catalog
- `rejected` - Rejected by admin
- `archived` - No longer available

**RLS Policies:**
- Public can view active products
- Sellers can manage their own products

---

### product_images

Images associated with products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| product_id | UUID | REFERENCES products(id) ON DELETE CASCADE | Product reference |
| url | TEXT | NOT NULL | Image URL |
| alt_text | TEXT | | Alt text for accessibility |
| position | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

---

### cart_items

Shopping cart items for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | User reference |
| product_id | UUID | REFERENCES products(id) ON DELETE CASCADE | Product reference |
| quantity | INTEGER | NOT NULL, DEFAULT 1, CHECK > 0 | Quantity in cart |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Constraints:** UNIQUE(user_id, product_id) - One cart item per product per user.

**RLS Policies:** Users can manage their own cart items.

---

### orders

Customer orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| order_number | TEXT | NOT NULL, UNIQUE | Human-readable order number |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE SET NULL | User reference |
| status | TEXT | NOT NULL, DEFAULT 'pending', CHECK (pending, processing, shipped, delivered, cancelled, refunded) | Order status |
| subtotal | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Subtotal before tax |
| tax_amount | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Tax amount |
| total | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Total including tax |
| shipping_address | JSONB | NOT NULL | Shipping address details |
| billing_address | JSONB | | Billing address (if different) |
| payment_status | TEXT | NOT NULL, DEFAULT 'pending', CHECK (pending, paid, failed, refunded) | Payment status |
| payment_id | TEXT | | External payment reference |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Order Status Values:**
- `pending` - Order created, awaiting payment
- `processing` - Payment received, preparing shipment
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `refunded` - Order refunded

**RLS Policies:** Users can view their own orders.

---

### order_items

Individual items within an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| order_id | UUID | REFERENCES orders(id) ON DELETE CASCADE | Order reference |
| product_id | UUID | REFERENCES products(id) ON DELETE SET NULL | Product reference (nullable if product deleted) |
| product_name | TEXT | NOT NULL | Product name at time of order |
| product_price | DECIMAL(10,2) | NOT NULL | Price at time of order |
| quantity | INTEGER | NOT NULL, CHECK > 0 | Quantity ordered |
| line_total | DECIMAL(10,2) | NOT NULL | product_price * quantity |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

---

### inquiries

Customer inquiries from contact form.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| name | TEXT | NOT NULL | Contact name |
| email | TEXT | NOT NULL | Contact email |
| subject | TEXT | NOT NULL | Inquiry subject |
| message | TEXT | NOT NULL | Inquiry message |
| status | TEXT | NOT NULL, DEFAULT 'new', CHECK (new, in_progress, resolved) | Inquiry status |
| response | TEXT | | Admin response |
| responded_at | TIMESTAMPTZ | | Response timestamp |
| responded_by | UUID | REFERENCES auth.users(id) | Admin who responded |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Status Values:**
- `new` - New inquiry
- `in_progress` - Being handled
- `resolved` - Resolved

---

### hero_slides

Hero slider slides for landing page.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| title | TEXT | NOT NULL | Slide title |
| subtitle | TEXT | | Slide subtitle |
| image_url | TEXT | NOT NULL | Background image URL |
| cta_text | TEXT | | Call-to-action button text |
| cta_link | TEXT | | Call-to-action link |
| position | INTEGER | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT true | Whether slide is active |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**RLS Policies:** Public can view active hero slides.

---

## Indexes

The following indexes are created for optimal query performance:

| Index Name | Table | Column(s) | Purpose |
|------------|-------|-----------|---------|
| idx_products_category | products | category_id | Filter by category |
| idx_products_seller | products | seller_id | Filter by seller |
| idx_products_status | products | status | Filter by status |
| idx_products_slug | products | slug | Lookup by slug |
| idx_product_images_product | product_images | product_id | Get product images |
| idx_cart_items_user | cart_items | user_id | Get user's cart |
| idx_orders_user | orders | user_id | Get user's orders |
| idx_orders_status | orders | status | Filter by status |
| idx_order_items_order | order_items | order_id | Get order items |
| idx_inquiries_status | inquiries | status | Filter by status |
| idx_sellers_status | sellers | status | Filter by status |

---

## Row Level Security (RLS)

All tables have Row Level Security enabled. Key policies:

### Public Access
- Anyone can view active products
- Anyone can view categories
- Anyone can view active hero slides

### User Access
- Users can manage their own cart items
- Users can view their own orders

### Seller Access
- Sellers can manage their own products

### Admin Access
- Admin operations use the service role client which bypasses RLS

---

## Running the Migrations

### Migration Order

1. `001_initial_schema.sql` - Core database tables and RLS policies
2. `002_storage_buckets.sql` - Storage buckets and policies

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration
7. Repeat steps 3-6 for `supabase/migrations/002_storage_buckets.sql`
8. Verify success by checking the **Table Editor** - all tables should be visible
9. Verify storage buckets in **Storage** section

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push the migrations
supabase db push
```

### Verifying the Migration

After running, verify in Supabase Dashboard:

1. **Table Editor** - Should show all 10 tables
2. **Database > Extensions** - Should show `uuid-ossp` enabled
3. **Database > Indexes** - Should show all created indexes
4. **Authentication > Policies** - Should show RLS policies
5. **Storage** - Should show 3 buckets: product-images, seller-logos, hero-slides

---

## Storage Buckets

Storage buckets are created via the `002_storage_buckets.sql` migration. Three public buckets are available:

### Buckets

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `product-images` | Yes | Product listing images uploaded by sellers |
| `seller-logos` | Yes | Business logos for seller profiles |
| `hero-slides` | Yes | Landing page hero slider images (admin managed) |

### Storage Policies

#### product-images

| Policy | Operation | Description |
|--------|-----------|-------------|
| Public can view product images | SELECT | Anyone can view product images |
| Sellers can upload product images | INSERT | Authenticated sellers can upload |
| Sellers can update own product images | UPDATE | Sellers can modify their uploads |
| Sellers can delete own product images | DELETE | Sellers can remove their uploads |

#### seller-logos

| Policy | Operation | Description |
|--------|-----------|-------------|
| Public can view seller logos | SELECT | Anyone can view seller logos |
| Sellers can upload seller logos | INSERT | Authenticated sellers can upload |
| Sellers can update own seller logos | UPDATE | Sellers can modify their logo |

#### hero-slides

| Policy | Operation | Description |
|--------|-----------|-------------|
| Public can view hero slides | SELECT | Anyone can view hero slides |

> **Note:** Hero slides are managed by admins via the service role client, which bypasses RLS policies.

### File Upload Guidelines

- **Product Images**: Recommended size 800x800px, max 5MB, formats: JPG, PNG, WebP
- **Seller Logos**: Recommended size 200x200px, max 2MB, formats: JPG, PNG, WebP, SVG
- **Hero Slides**: Recommended size 1920x600px, max 10MB, formats: JPG, PNG, WebP

---

## TypeScript Types

After setting up the database, generate TypeScript types:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Generate types
supabase gen types typescript --project-id your-project-id > types/database.ts
```

This creates strongly-typed interfaces for all tables.
