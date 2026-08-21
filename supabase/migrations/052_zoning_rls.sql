-- Disable Row Level Security on all zoning-related tables to allow the public anon client to search them
ALTER TABLE parcels DISABLE ROW LEVEL SECURITY;
ALTER TABLE zoning_polygons DISABLE ROW LEVEL SECURITY;
ALTER TABLE zone_standards DISABLE ROW LEVEL SECURITY;
ALTER TABLE permitted_uses DISABLE ROW LEVEL SECURITY;
ALTER TABLE zoning_exceptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE zoning_exception_overrides DISABLE ROW LEVEL SECURITY;
ALTER TABLE overlays DISABLE ROW LEVEL SECURITY;
ALTER TABLE heritage_properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_address_ground_truth DISABLE ROW LEVEL SECURITY;
