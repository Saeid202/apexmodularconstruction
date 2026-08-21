-- Migration: 037_house_configurations_rls.sql
-- Enable RLS and setup policies for house_configurations
-- Correct foreign key references in cart_items, inquiries, and order_items

-- 1. Enable Row Level Security (RLS)
ALTER TABLE public.house_configurations ENABLE ROW LEVEL SECURITY;

-- 2. Security Policies
CREATE POLICY "Users can insert their own house configurations" ON public.house_configurations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own house configurations" ON public.house_configurations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sellers can select configurations for their products" ON public.house_configurations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
      AND p.seller_id = auth.uid()
    )
  );

-- 3. Adjust foreign keys on cart_items, inquiries, and order_items
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_configuration_id_fkey;
ALTER TABLE public.cart_items 
  ADD CONSTRAINT cart_items_configuration_id_fkey 
  FOREIGN KEY (configuration_id) 
  REFERENCES public.house_configurations(id) 
  ON DELETE SET NULL;

ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_configuration_id_fkey;
ALTER TABLE public.inquiries 
  ADD CONSTRAINT inquiries_configuration_id_fkey 
  FOREIGN KEY (configuration_id) 
  REFERENCES public.house_configurations(id) 
  ON DELETE SET NULL;

ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_configuration_id_fkey;
ALTER TABLE public.order_items 
  ADD CONSTRAINT order_items_configuration_id_fkey 
  FOREIGN KEY (configuration_id) 
  REFERENCES public.house_configurations(id) 
  ON DELETE SET NULL;
