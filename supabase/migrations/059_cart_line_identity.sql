-- ============================================================================
-- Cart line identity for customizable items
-- ============================================================================

SET LOCAL search_path = public, extensions;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Columns the application already writes but the database never received.
-- ----------------------------------------------------------------------------

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS variant_code text,
  ADD COLUMN IF NOT EXISTS variant_image_url text;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_code text,
  ADD COLUMN IF NOT EXISTS variant_image_url text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) DEFAULT 0 NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. One encoding of "absent" for each identity column.
--
-- NULL and '{}' would otherwise be two spellings of "no selections" that
-- NULLS NOT DISTINCT treats as different lines, and that hash to different
-- digests. One spelling means the constraint catches every real duplicate.
-- variant_code gets the same treatment so lookups need a single query shape
-- instead of branching on null.
-- ----------------------------------------------------------------------------

UPDATE public.cart_items SET variant_code = '' WHERE variant_code IS NULL;
ALTER TABLE public.cart_items ALTER COLUMN variant_code SET DEFAULT '';
ALTER TABLE public.cart_items ALTER COLUMN variant_code SET NOT NULL;

UPDATE public.cart_items SET customizations = '{}'::jsonb WHERE customizations IS NULL;
ALTER TABLE public.cart_items ALTER COLUMN customizations SET DEFAULT '{}'::jsonb;
ALTER TABLE public.cart_items ALTER COLUMN customizations SET NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. Fixed-width digest of the selections, derived by the database.
--
-- GENERATED ALWAYS means it cannot drift from `customizations` and cannot be
-- written by the application even by mistake. STORED keeps it inspectable, which
-- an expression index would not allow.
--
-- Dropped and recreated rather than added conditionally: an earlier revision of
-- this migration used md5, and ADD COLUMN IF NOT EXISTS would silently leave
-- that in place. The column holds no independent data, so recreating it is free.
-- ----------------------------------------------------------------------------

ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_line_identity_key;

ALTER TABLE public.cart_items
  DROP COLUMN IF EXISTS customizations_digest;

ALTER TABLE public.cart_items
  ADD COLUMN customizations_digest bytea NOT NULL
  GENERATED ALWAYS AS (digest(customizations::text, 'sha256')) STORED;

-- ----------------------------------------------------------------------------
-- 4. Replace the 001 constraint with the real line identity.
-- ----------------------------------------------------------------------------

ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_product_variant_key;

DROP INDEX IF EXISTS public.cart_items_line_identity_key;

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_line_identity_key
  UNIQUE NULLS NOT DISTINCT
  (user_id, product_id, variant_code, customizations_digest, configuration_id);
