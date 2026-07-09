-- 1. Function to find the base zoning polygon containing a coordinate point
CREATE OR REPLACE FUNCTION find_zoning_at_point(lng double precision, lat double precision)
RETURNS TABLE (
    objectid integer,
    zn_zone varchar,
    zn_string varchar,
    zn_exception_no integer,
    fsi_total double precision,
    zn_coverage double precision,
    zbl_chapter varchar,
    zbl_section varchar,
    zbl_excptn varchar,
    bylaw_doclink varchar
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
        zp.fsi_total,
        zp.zn_coverage,
        zp.zbl_chapter,
        zp.zbl_section,
        zp.zbl_excptn,
        zp.bylaw_doclink
    FROM zoning_polygons zp
    WHERE zp.geom IS NOT NULL 
      AND ST_Contains(zp.geom, ST_SetSRID(ST_Point(lng, lat), 4326))
    LIMIT 1;
END;
$$;

-- 2. Function to check if a heritage property is nearby (within a radius)
CREATE OR REPLACE FUNCTION check_heritage_near_point(lng double precision, lat double precision, max_distance_meters double precision DEFAULT 15)
RETURNS TABLE (
    id integer,
    address varchar,
    status varchar,
    bylaw_number varchar,
    details text,
    distance double precision
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hp.id,
        hp.address,
        hp.status,
        hp.bylaw_number,
        hp.details,
        ST_Distance(hp.geom::geography, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) as distance
    FROM heritage_properties hp
    WHERE hp.geom IS NOT NULL
      AND ST_DWithin(
          hp.geom::geography, 
          ST_SetSRID(ST_Point(lng, lat), 4326)::geography, 
          max_distance_meters
      )
    ORDER BY distance
    LIMIT 1;
END;
$$;

-- 3. Function to find overlays (hazard, SASP, etc.) containing the coordinate point
CREATE OR REPLACE FUNCTION find_overlays_at_point(lng double precision, lat double precision)
RETURNS TABLE (
    id integer,
    overlay_type varchar,
    name varchar,
    ref_number varchar,
    description text
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.overlay_type,
        o.name,
        o.ref_number,
        o.description
    FROM overlays o
    WHERE o.geom IS NOT NULL 
      AND ST_Contains(o.geom, ST_SetSRID(ST_Point(lng, lat), 4326));
END;
$$;
