-- ─── nav_items ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nav_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label           TEXT        NOT NULL,
  href            TEXT        NOT NULL,
  position        INTEGER     NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_items_position ON nav_items(position);
CREATE INDEX IF NOT EXISTS idx_nav_items_active   ON nav_items(is_active);

-- ─── page_contents ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_contents (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        UNIQUE NOT NULL,
  title        TEXT        NOT NULL,
  content      TEXT        NOT NULL DEFAULT '',
  parent_id    UUID        REFERENCES page_contents(id) ON DELETE SET NULL,
  show_in_nav  BOOLEAN     NOT NULL DEFAULT false,
  nav_label    TEXT,
  nav_position INTEGER,
  is_protected BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE INDEX IF NOT EXISTS idx_page_contents_slug        ON page_contents(slug);
CREATE INDEX IF NOT EXISTS idx_page_contents_parent      ON page_contents(parent_id);
CREATE INDEX IF NOT EXISTS idx_page_contents_show_in_nav ON page_contents(show_in_nav);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS nav_items_updated_at ON nav_items;
CREATE TRIGGER nav_items_updated_at
  BEFORE UPDATE ON nav_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS page_contents_updated_at ON page_contents;
CREATE TRIGGER page_contents_updated_at
  BEFORE UPDATE ON page_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE nav_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;

-- Public can read active nav_items
DROP POLICY IF EXISTS "Public read active nav items" ON nav_items;
CREATE POLICY "Public read active nav items"
  ON nav_items FOR SELECT
  USING (is_active = true);

-- Public can read all page_contents (needed for public pages + nav)
DROP POLICY IF EXISTS "Public read page contents" ON page_contents;
CREATE POLICY "Public read page contents"
  ON page_contents FOR SELECT
  USING (true);

-- Admin full access to nav_items
DROP POLICY IF EXISTS "Admin full access nav items" ON nav_items;
CREATE POLICY "Admin full access nav items"
  ON nav_items FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admin full access to page_contents
DROP POLICY IF EXISTS "Admin full access page contents" ON page_contents;
CREATE POLICY "Admin full access page contents"
  ON page_contents FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── Seed protected pages ─────────────────────────────────────────────────────
INSERT INTO page_contents (slug, title, content, is_protected, show_in_nav, nav_position) VALUES
  ('about',    'About Us',         '<p class="lead"><strong>Apex Modular Construction (16481043 Canada Inc.)</strong><br/>Building a Smarter Future for Construction</p><p>Apex Modular Construction is a technology-driven construction platform transforming the way buildings are designed, manufactured, and delivered.</p><p>The traditional construction industry is fragmented. Architects, engineers, contractors, material suppliers, manufacturers, distributors, and developers often operate through disconnected systems—creating unnecessary costs, delays, waste, and complexity.</p><p><strong>Apex is building a different model.</strong></p><p>Our platform connects digital design, building systems, materials, manufacturing, logistics, and construction into one integrated ecosystem.</p><h3>From Design to Reality</h3><p>With Apex, a building can begin digitally. Customers can explore, configure, and customize their building through a technology-enabled design experience. Once the design and specifications are finalized, Apex connects the project with suitable manufacturing and construction partners.</p><p>Instead of treating construction as a series of disconnected activities, we are creating a digital supply chain for buildings.</p><p>Our platform can support the production of:</p><ul><li>Modular and prefab buildings</li><li>Light steel frame structures</li><li>Wall, floor, and roof systems</li><li>Insulated and structural panels</li><li>Prefabricated bathrooms and utility modules</li><li>Doors, windows, flooring, kitchens, and other building materials</li></ul><p>These components can be manufactured through qualified factories and delivered to the project site for efficient assembly.</p><h3>Manufacturing Without Borders</h3><p>Apex is designed as a global platform launched from Canada.</p><p>We connect customers and construction projects with manufacturing capabilities in different markets, while focusing on the requirements of the destination market. This allows us to access competitive manufacturing capacity while building a system that can support local standards, engineering requirements, logistics, and installation.</p><p>Our long-term vision is not simply to import buildings.</p><p>Our vision is to build a global network of building manufacturers and suppliers that can serve local construction markets through one digital platform.</p><h3>Technology at the Core</h3><p>Apex combines construction expertise with artificial intelligence and digital technology.</p><p>Our goal is to simplify complex construction decisions—from selecting building systems and materials to configuring a building, estimating costs, coordinating manufacturing, and managing delivery.</p><p>Over time, Apex will develop an intelligent construction ecosystem where customers, manufacturers, designers, engineers, suppliers, and builders can work through a connected digital platform.</p><h3>A New Construction Economy</h3><p>We believe the future of construction will move from job-site production to factory production, from fragmented supply chains to integrated platforms, and from manual processes to intelligent digital workflows.</p><p>Apex is building the infrastructure for that transition.</p><p class="text-center font-bold" style="color: #4B1D8F; margin-top: 2rem; font-size: 1.25rem;">Design digitally. Manufacture efficiently. Build smarter.</p><p class="text-center text-sm text-gray-500">Apex Modular Construction — Building the Next Generation of Construction.</p>',          true, true, 1),
  ('contact',  'Contact',          '<h1>Contact Us</h1><p>Get in touch with our team.</p>',       true, true, 2)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  is_protected = EXCLUDED.is_protected,
  show_in_nav = EXCLUDED.show_in_nav,
  nav_position = EXCLUDED.nav_position;

-- Remove legacy pages from database if present
DELETE FROM page_contents WHERE slug IN ('privacy', 'terms', 'shipping');
