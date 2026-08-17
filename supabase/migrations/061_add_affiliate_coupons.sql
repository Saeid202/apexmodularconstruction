-- Create affiliate_coupons table
CREATE TABLE IF NOT EXISTS public.affiliate_coupons (
    coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    commission_amount NUMERIC(10, 2) NOT NULL,
    customer_discount_amount NUMERIC(10, 2) NOT NULL,
    affiliate_remaining_amount NUMERIC(10, 2) NOT NULL,
    coupon_code VARCHAR(50) UNIQUE NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT customer_discount_check CHECK (customer_discount_amount <= commission_amount),
    CONSTRAINT affiliate_remaining_check CHECK (affiliate_remaining_amount = commission_amount - customer_discount_amount)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.affiliate_coupons ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Affiliates can manage their own coupons"
    ON public.affiliate_coupons
    FOR ALL
    USING (affiliate_id = auth.uid())
    WITH CHECK (affiliate_id = auth.uid());

CREATE POLICY "Public/customers can read coupons"
    ON public.affiliate_coupons
    FOR SELECT
    USING (true);
