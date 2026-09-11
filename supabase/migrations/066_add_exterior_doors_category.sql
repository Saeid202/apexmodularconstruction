-- Add the category used by Seller Centre for exterior door catalogue products.
INSERT INTO categories (name, slug, description)
VALUES (
  'Exterior Doors',
  'exterior-doors',
  'Exterior entry and access doors for building projects'
)
ON CONFLICT (slug) DO NOTHING;
