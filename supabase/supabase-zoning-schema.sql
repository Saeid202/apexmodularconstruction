-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Parcels Table (represents individual surveyed lots/properties)
CREATE TABLE IF NOT EXISTS parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin VARCHAR(50) UNIQUE, -- Property Identification Number
    address VARCHAR(255),
    geom GEOMETRY(Geometry, 4326), -- Polygon or MultiPolygon representing the parcel boundaries
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create spatial index for parcels
CREATE INDEX IF NOT EXISTS idx_parcels_geom ON parcels USING gist(geom);

-- 2. Zoning Polygons Table (drawn from the live ArcGIS Zoning Area layer)
CREATE TABLE IF NOT EXISTS zoning_polygons (
    id SERIAL PRIMARY KEY,
    objectid INTEGER UNIQUE, -- ArcGIS OBJECTID
    zn_zone VARCHAR(50) NOT NULL, -- e.g., RD, RS, RM, RA, CR
    zn_string VARCHAR(255), -- Full zoning string e.g. RD (f10.0; d0.6) (x12)
    zn_exception_no INTEGER, -- Site-specific exception number
    fsi_total DOUBLE PRECISION, -- Total permitted Floor Space Index
    zn_coverage DOUBLE PRECISION, -- Permitted lot coverage percentage
    zbl_chapter VARCHAR(100),
    zbl_section VARCHAR(100),
    zbl_excptn VARCHAR(100),
    bylaw_doclink VARCHAR(255),
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create spatial and lookup indexes for zoning polygons
CREATE INDEX IF NOT EXISTS idx_zoning_polygons_geom ON zoning_polygons USING gist(geom);
CREATE INDEX IF NOT EXISTS idx_zoning_polygons_zone_ex ON zoning_polygons(zn_zone, zn_exception_no);

-- 3. Zone Standards Table (stores base guidelines for each zone code)
CREATE TABLE IF NOT EXISTS zone_standards (
    id SERIAL PRIMARY KEY,
    zone_code VARCHAR(50) UNIQUE NOT NULL, -- RD, RS, RM, RA, CR, etc.
    zone_type VARCHAR(100) NOT NULL, -- e.g., Residential Detached, Commercial Residential
    max_height DOUBLE PRECISION, -- Base height in meters (e.g. 10.0)
    max_fsi DOUBLE PRECISION, -- Base Floor Space Index limit (e.g. 0.6)
    max_coverage DOUBLE PRECISION, -- Base lot coverage percentage (e.g. 35.0)
    min_frontage DOUBLE PRECISION, -- Min lot frontage in meters
    min_setback_front DOUBLE PRECISION, -- Min front setback in meters
    min_setback_rear DOUBLE PRECISION, -- Min rear setback in meters
    min_setback_side DOUBLE PRECISION, -- Min side setback in meters
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Permitted Uses Table (maps allowed/conditional uses to base zones)
CREATE TABLE IF NOT EXISTS permitted_uses (
    id SERIAL PRIMARY KEY,
    zone_code VARCHAR(50) NOT NULL REFERENCES zone_standards(zone_code) ON DELETE CASCADE,
    use_name VARCHAR(150) NOT NULL,
    is_conditional BOOLEAN DEFAULT false, -- True if the use is conditional/requires special criteria
    bylaw_section VARCHAR(100), -- Reference chapter/section in the PDF bylaws
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(zone_code, use_name)
);

-- 5. Zoning Exceptions Table (stores site-specific exception texts, Chapter 900)
CREATE TABLE IF NOT EXISTS zoning_exceptions (
    id SERIAL PRIMARY KEY,
    zone_code VARCHAR(50) NOT NULL,
    exception_number INTEGER NOT NULL,
    description TEXT, -- Raw/parsed zoning exception text
    bylaw_ref VARCHAR(100), -- By-law section citation e.g., 900.11.10(12)
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(zone_code, exception_number)
);

CREATE INDEX IF NOT EXISTS idx_zoning_exceptions_lookup ON zoning_exceptions(zone_code, exception_number);

-- 6. Zoning Exception Overrides Table (explicit overrides for height/FSI/coverage rules)
CREATE TABLE IF NOT EXISTS zoning_exception_overrides (
    id SERIAL PRIMARY KEY,
    exception_id INTEGER NOT NULL REFERENCES zoning_exceptions(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL, -- 'max_height', 'max_fsi', 'max_coverage', 'permitted_uses_addition', 'prohibited_uses'
    rule_value TEXT NOT NULL, -- Overridden value (can be numeric string or text list)
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(exception_id, rule_name)
);

-- 7. Overlays Table (SASP, heritage district, hazard overlays)
CREATE TABLE IF NOT EXISTS overlays (
    id SERIAL PRIMARY KEY,
    overlay_type VARCHAR(50) NOT NULL, -- 'heritage_district', 'hazard_area', 'sasp', 'height_overlay'
    name VARCHAR(255) NOT NULL,
    ref_number VARCHAR(100), -- SASP number or other lookup identifier
    description TEXT,
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create spatial index for overlays
CREATE INDEX IF NOT EXISTS idx_overlays_geom ON overlays USING gist(geom);

-- 8. Heritage Properties Registry Table (individual heritage listed/designated buildings)
CREATE TABLE IF NOT EXISTS heritage_properties (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    status VARCHAR(100), -- 'Designated', 'Listed', 'Part IV', 'Part V'
    bylaw_number VARCHAR(100),
    details TEXT,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create spatial index for heritage properties
CREATE INDEX IF NOT EXISTS idx_heritage_properties_geom ON heritage_properties USING gist(geom);

-- 9. Test Address Ground Truth Table (used for QA / regression testing suite)
CREATE TABLE IF NOT EXISTS test_address_ground_truth (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) UNIQUE NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    expected_zone VARCHAR(50) NOT NULL,
    expected_exception_no INTEGER,
    expected_fsi DOUBLE PRECISION,
    expected_coverage DOUBLE PRECISION,
    is_heritage BOOLEAN DEFAULT false,
    is_hazard BOOLEAN DEFAULT false,
    is_sasp BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed base zone standards for residential zones RD and R (the most common queries)
INSERT INTO zone_standards (zone_code, zone_type, max_height, max_fsi, max_coverage, min_frontage, min_setback_front, min_setback_rear, min_setback_side)
VALUES 
('RD', 'Residential Detached', 10.0, 0.6, 35.0, 12.0, 6.0, 7.5, 0.9)
ON CONFLICT (zone_code) DO NOTHING;

INSERT INTO zone_standards (zone_code, zone_type, max_height, max_fsi, max_coverage, min_frontage, min_setback_front, min_setback_rear, min_setback_side)
VALUES 
('R', 'Residential', 10.0, 0.6, 35.0, 9.0, 6.0, 7.5, 0.9)
ON CONFLICT (zone_code) DO NOTHING;

-- Seed some test address ground truth entries
INSERT INTO test_address_ground_truth (address, lat, lon, expected_zone, expected_exception_no, expected_fsi, expected_coverage, is_heritage, is_hazard, is_sasp, notes)
VALUES
('283 Spadina Rd', 43.6791, -79.4093, 'R', 21, 0.6, 35.0, false, false, false, 'Residential zone with exception 21'),
('150 Laird Dr', 43.7088, -79.3627, 'CR', 5, 2.0, 50.0, false, false, false, 'Commercial Residential zone with exception 5'),
('100 Queen St W', 43.6534, -79.3841, 'CR', NULL, 3.0, 100.0, true, false, false, 'Toronto City Hall, CR zone, heritage designated')
ON CONFLICT (address) DO NOTHING;
