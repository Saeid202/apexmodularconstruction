-- ============================================
-- Apex Modular Construction E-Commerce Platform
-- Sample Data Seed
-- ============================================
-- Run this migration to populate the database with sample data for development

-- ============================================
-- CATEGORIES
-- ============================================

INSERT INTO categories (name, slug, description) VALUES
  ('Steel & Metal', 'steel-metal', 'Structural steel, rebar, and metal products'),
  ('Robots', 'robots', 'Industrial robots and automation equipment'),
  ('Cement & Concrete', 'cement-concrete', 'Cement, concrete, and related materials'),
  ('Tiles & Flooring', 'tiles-flooring', 'Ceramic tiles, stone, and flooring materials'),
  ('Safety Equipment', 'safety-equipment', 'PPE and construction safety gear')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- HERO SLIDES
-- ============================================

INSERT INTO hero_slides (title, subtitle, image_url, cta_text, cta_link, position, is_active) VALUES
  (
    'Quality Construction Materials from China',
    'Trusted suppliers, competitive prices, delivered to Canada',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
    'Shop Now',
    '/products',
    0,
    true
  ),
  (
    'Industrial Robots & Automation',
    'Cutting-edge robotics for Canadian businesses',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&q=80',
    'Explore Robots',
    '/products?category=robots',
    1,
    true
  ),
  (
    'Bulk Orders Welcome',
    'Special pricing for contractors and construction companies',
    'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=1920&q=80',
    'Contact Us',
    '/contact',
    2,
    true
  )
ON CONFLICT DO NOTHING;

-- Note: To insert products, you first need sellers in the database.
-- Sellers are created when users register with role='seller' through Supabase Auth.
-- After creating seller accounts, you can insert products with the seller IDs.

-- Example product insert (requires valid seller_id):
-- INSERT INTO products (name, slug, description, price, category_id, seller_id, status, specifications) VALUES
--   ('Heavy-Duty Steel Rebar Bundle', 'heavy-duty-steel-rebar-bundle', 'High-tensile steel rebar', 299.99, 'cat-1', 'YOUR_SELLER_ID', 'active', '{"grade": "60", "diameter": "20mm"}');
