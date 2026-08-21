import { createServerClient } from '../../../lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address query parameter is required' },
        { status: 400 }
      );
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.error('Missing Mapbox Access Token in environment.');
      return NextResponse.json(
        { error: 'Geocoding configuration error' },
        { status: 500 }
      );
    }

    // 1. Geocode the address using Mapbox API constrained to Toronto bounding box
    let searchQuery = address;
    if (!searchQuery.toLowerCase().includes('toronto')) {
      searchQuery += ', Toronto, ON, Canada';
    }

    // Toronto Bounding Box: Min Lon -79.6392, Min Lat 43.5810, Max Lon -79.1169, Max Lat 43.8554
    const torontoBbox = '-79.6392,43.5810,-79.1169,43.8554';
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchQuery
    )}.json?access_token=${mapboxToken}&limit=1&bbox=${torontoBbox}`;

    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding request failed with status ${geocodeResponse.status}`);
    }

    const geocodeData = await geocodeResponse.json();
    const features = geocodeData.features || [];

    if (features.length === 0) {
      return NextResponse.json(
        { error: `Address '${address}' could not be geocoded within Toronto limits.` },
        { status: 404 }
      );
    }

    const bestMatch = features[0];
    const [lng, lat] = bestMatch.center;
    const formattedAddress = bestMatch.place_name;

    // 2. Initialize Supabase Server Client
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // 3. Execute spatial RPCs to find matching zoning and overlays
    const [zoningResult, heritageResult, overlaysResult] = await Promise.all([
      supabase.rpc('find_zoning_at_point', { lng, lat }),
      supabase.rpc('check_heritage_near_point', { lng, lat, max_distance_meters: 15.0 }),
      supabase.rpc('find_overlays_at_point', { lng, lat })
    ]);

    if (zoningResult.error) {
      console.error('Error querying zoning at point:', zoningResult.error);
      return NextResponse.json(
        { error: 'Zoning spatial query failed', details: zoningResult.error.message },
        { status: 500 }
      );
    }

    let zoning = zoningResult.data && zoningResult.data.length > 0 ? zoningResult.data[0] : null;
    const heritage = heritageResult.data && heritageResult.data.length > 0 ? heritageResult.data[0] : null;
    const activeOverlays = overlaysResult.data || [];

    // 3.1 Legacy Zoning Fallback
    let isLegacy = false;
    if (!zoning) {
      console.log(`[Zoning Lookup] No 569-2013 zone found at [${lng}, ${lat}]. Checking Layer 8 (Former Municipality Bylaws)...`);
      try {
        // Query Layer 8 (Former Municipality Bylaws)
        const layer8Url = `https://gis.toronto.ca/arcgis/rest/services/cot_geospatial11/FeatureServer/8/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=pjson`;
        const layer8Resp = await fetch(layer8Url);
        if (layer8Resp.ok) {
          const data = await layer8Resp.json();
          const feat = data.features?.[0];
          if (feat && feat.attributes) {
            const attr = feat.attributes;
            zoning = {
              objectid: attr.OBJECTID,
              zn_zone: attr.BL_NO === '438-86' ? 'Q' : attr.DISTRICT || 'Legacy',
              zn_string: attr.DISPLAY_LABEL || `Former Municipality Bylaw ${attr.BL_NO}`,
              zn_exception_no: null,
              fsi_total: null,
              zn_coverage: null,
              zbl_chapter: attr.BL_NO,
              zbl_section: 'Legacy Bylaw',
              zbl_excptn: null,
              bylaw_doclink: `legacy/${attr.BL_NO}.pdf`
            };
            isLegacy = true;
            console.log(`[Zoning Lookup] Matched Layer 8: Zone "${zoning.zn_zone}" (Bylaw ${attr.BL_NO})`);
          }
        }

        // If still no zone, query Layer 12 (Not Part of This Bylaw)
        if (!zoning) {
          console.log(`[Zoning Lookup] Checking Layer 12 (Not Part of This Bylaw)...`);
          const layer12Url = `https://gis.toronto.ca/arcgis/rest/services/cot_geospatial11/FeatureServer/12/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=pjson`;
          const layer12Resp = await fetch(layer12Url);
          if (layer12Resp.ok) {
            const data = await layer12Resp.json();
            const feat = data.features?.[0];
            if (feat && feat.attributes) {
              const attr = feat.attributes;
              zoning = {
                objectid: attr.OBJECTID,
                zn_zone: attr.ZN_ZONE || 'Legacy',
                zn_string: attr.ZN_STRING || null,
                zn_exception_no: attr.ZN_EXCPTN_NO || null,
                fsi_total: attr.FSI_TOTAL || null,
                zn_coverage: attr.ZN_COVERAGE || null,
                zbl_chapter: attr.ZBL_CHAPTER || null,
                zbl_section: attr.ZBL_SECTION || null,
                zbl_excptn: attr.ZBL_EXCPTN || null,
                bylaw_doclink: attr.BYLAW_DOCLINK || null
              };
              isLegacy = true;
              console.log(`[Zoning Lookup] Matched Layer 12: Zone "${zoning.zn_zone}"`);
            }
          }
        }
      } catch (err: any) {
        console.error('[Zoning Lookup] Failed to fetch legacy fallbacks:', err.message);
      }
    }

    if (!zoning) {
      return NextResponse.json({
        address: formattedAddress,
        coordinates: { lat, lng },
        message: 'No zoning polygon contains this address coordinate point.',
        zoning: null,
        standards: null,
        permitted_uses: [],
        exception: null,
        heritage,
        overlays: activeOverlays
      });
    }

    // 4. Fetch the base zone standards if base zone code is returned
    let standards: any = null;
    let permittedUses: any[] = [];
    if (zoning.zn_zone) {
      const { data: standardsData } = await supabase
        .from('zone_standards')
        .select('*')
        .eq('zone_code', zoning.zn_zone)
        .maybeSingle();

      standards = standardsData;

      const { data: usesData } = await supabase
        .from('permitted_uses')
        .select('use_name, is_conditional, bylaw_section')
        .eq('zone_code', zoning.zn_zone);

      permittedUses = usesData || [];
    }

    // 5. Fetch site-specific exception text and overrides if exception number is returned
    let exception: any = null;
    if (zoning.zn_zone && zoning.zn_exception_no) {
      const { data: exceptionData } = await supabase
        .from('zoning_exceptions')
        .select('id, description, bylaw_ref')
        .eq('zone_code', zoning.zn_zone)
        .eq('exception_number', zoning.zn_exception_no)
        .maybeSingle();

      if (exceptionData) {
        const { data: overridesData } = await supabase
          .from('zoning_exception_overrides')
          .select('rule_name, rule_value')
          .eq('exception_id', exceptionData.id);

        exception = {
          number: zoning.zn_exception_no,
          bylaw_ref: exceptionData.bylaw_ref,
          description: exceptionData.description,
          overrides: overridesData || []
        };
      } else {
        exception = {
          number: zoning.zn_exception_no,
          message: 'Exception details not seeded in the database.'
        };
      }
    }

    // 6. Compile and return response
    return NextResponse.json({
      address: formattedAddress,
      coordinates: { lat, lng },
      zoning: {
        zone_code: zoning.zn_zone,
        zoning_string: zoning.zn_string,
        bylaw_chapter: zoning.zbl_chapter,
        bylaw_section: zoning.zbl_section,
        bylaw_exception: zoning.zbl_excptn,
        bylaw_doclink: zoning.bylaw_doclink,
        is_legacy: isLegacy
      },
      standards: standards ? {
        zone_type: standards.zone_type,
        max_height_meters: standards.max_height,
        max_fsi: standards.max_fsi,
        max_coverage_percent: standards.max_coverage,
        min_frontage_meters: standards.min_frontage,
        setbacks: {
          front_meters: standards.min_setback_front,
          rear_meters: standards.min_setback_rear,
          side_meters: standards.min_setback_side
        }
      } : null,
      permitted_uses: permittedUses,
      exception,
      heritage,
      overlays: activeOverlays
    });

  } catch (error: any) {
    console.error('Zoning lookup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
