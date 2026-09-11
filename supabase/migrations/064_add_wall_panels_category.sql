-- Add Wall Panels category for seller listings and the building designer catalogue
INSERT INTO categories (name, slug, description)
VALUES (
  'Wall Panels',
  'wall-panels',
  'Insulated, structural, exterior, and interior wall panel systems for modular construction'
)
ON CONFLICT (slug) DO NOTHING;
