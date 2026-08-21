-- Add Sofa category for product classification
INSERT INTO public.categories (name, slug, description)
VALUES ('Sofa', 'sofas', 'Premium sofa and home furniture options')
ON CONFLICT (slug) DO NOTHING;
