-- Add Rental Equipment Category
INSERT INTO categories (name, slug, description, image_url) 
VALUES (
  'Rental Equipment', 
  'rental-equipment', 
  'Heavy machinery, cranes, lifts, and rigging tools for construction sites',
  'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80'
)
ON CONFLICT (slug) DO NOTHING;
