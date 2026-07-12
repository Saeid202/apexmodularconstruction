INSERT INTO categories (name, slug, description)
VALUES ('Cabinets', 'cabinets', 'Kitchen cabinets, countertops, and storage units')
ON CONFLICT (slug) DO NOTHING;
