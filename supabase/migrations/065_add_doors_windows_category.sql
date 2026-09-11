-- Add a catalogue category for doors that can be imported into the building designer.
INSERT INTO categories (name, slug, description)
VALUES (
  'Doors & Windows',
  'doors-windows',
  'Exterior and interior doors and windows for building projects'
)
ON CONFLICT (slug) DO NOTHING;
