import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function findNearest() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const lon = -79.383627;
  const lat = 43.652826;

  console.log(`Searching nearest zoning polygon to: Lon ${lon}, Lat ${lat}...`);

  const { data, error } = await supabase.rpc('find_zoning_at_point', { lng: lon, lat: lat });
  console.log('Direct match result:', data);

  // Run raw select using PostGIS distance
  const { data: nearest, error: distanceError } = await supabase.from('zoning_polygons').select(`
    objectid,
    zn_zone,
    zn_string,
    zn_exception_no,
    dist:geom <-> ST_SetSRID(ST_Point(${lon}, ${lat}), 4326)::geometry
  `)
  .order('geom <-> ST_SetSRID(ST_Point(?, ?), 4326)', { ascending: true }) // wait, we can just use the standard order or postgres query
  ;

  // Let's do a simple query to select the nearest zoning polygon using order by distance
  const { data: closest, error: closestError } = await supabase.rpc('find_zoning_at_point', { lng: lon, lat: lat });
  
  // Let's write custom sql check via RPC or a simple select.
  // Wait, Supabase doesn't support order by distance in JS directly unless we write a custom RPC function.
  // Let's create a temporary RPC function to find the closest zoning polygon and run it!
}

async function findClosestWithSQL() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Let's check with standard select first
  console.log('Querying closest polygons...');
  
  // Let's register a function to find the nearest zoning polygon and return it
  const { data, error } = await supabase.rpc('find_zoning_at_point', { lng: lon, lat: lat });
}

// Let's make an RPC to get the closest polygon
const createFuncSql = `
CREATE OR REPLACE FUNCTION find_closest_zoning_to_point(lng double precision, lat double precision, max_dist_meters double precision)
RETURNS TABLE (
    objectid integer,
    zn_zone varchar,
    zn_string varchar,
    zn_exception_no integer,
    distance_meters double precision
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        zp.objectid,
        zp.zn_zone,
        zp.zn_string,
        zp.zn_exception_no,
        ST_Distance(zp.geom::geography, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) as distance_meters
    FROM zoning_polygons zp
    WHERE zp.geom IS NOT NULL
    ORDER BY zp.geom <-> ST_SetSRID(ST_Point(lng, lat), 4326)
    LIMIT 5;
END;
$$;
`;

console.log('Please execute the function definition `find_closest_zoning_to_point` first.');
