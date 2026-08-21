import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Configurations
const DRY_RUN = false; // Set to FALSE to perform actual database inserts
const BATCH_SIZE = 500; // Optimal batch size for GeoJSON payloads and PostGIS inserts
const ARCGIS_URL = 'https://gis.toronto.ca/arcgis/rest/services/cot_geospatial11/FeatureServer/3/query';

async function syncZoning() {
  console.log('🏁 Starting Toronto Zoning Sync...');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (Log only)' : 'LIVE SYNC (Upserting to Supabase)'}`);
  
  if (!DRY_RUN && (!supabaseUrl || !supabaseServiceKey)) {
    console.error('❌ Missing database credentials! Please check your .env file.');
    process.exit(1);
  }

  const supabase = DRY_RUN ? null : createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  let offset = 0;
  let hasMore = true;
  let totalUpserted = 0;

  while (hasMore) {
    console.log(`\nFetching batch: offset ${offset}, limit ${BATCH_SIZE}...`);
    
    const queryParams = new URLSearchParams({
      where: '1=1',
      outFields: 'OBJECTID,ZN_ZONE,ZN_EXCPTN_NO,FSI_TOTAL,ZN_COVERAGE,ZN_STRING,ZBL_CHAPTER,ZBL_SECTION,ZBL_EXCPTN,BYLAW_DOCLINK',
      outSR: '4326',
      f: 'geojson',
      returnGeometry: 'true',
      resultRecordCount: BATCH_SIZE.toString(),
      resultOffset: offset.toString(),
      orderByFields: 'OBJECTID' // Required for stable pagination in ArcGIS REST queries
    });

    const fetchUrl = `${ARCGIS_URL}?${queryParams.toString()}`;
    
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`ArcGIS request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`ArcGIS Server error: ${JSON.stringify(data.error)}`);
      }

      const features = data.features || [];
      console.log(`Fetched ${features.length} features.`);

      if (features.length === 0) {
        console.log('No more features found. Sync complete.');
        hasMore = false;
        break;
      }

      // Check if we are in dry run
      if (DRY_RUN) {
        console.log('Dry run enabled. First feature properties:');
        console.log(JSON.stringify(features[0].properties, null, 2));
        hasMore = false;
        break;
      }

      // Map features to table structure
      const rows = features.map(feature => {
        const props = feature.properties;
        let geom = feature.geometry;

        // Force multi-polygon type safety for PostGIS schema constraint
        if (geom && geom.type === 'Polygon') {
          geom = {
            type: 'MultiPolygon',
            coordinates: [geom.coordinates]
          };
        }

        return {
          objectid: props.OBJECTID,
          zn_zone: props.ZN_ZONE,
          zn_string: props.ZN_STRING,
          zn_exception_no: props.ZN_EXCPTN_NO,
          fsi_total: props.FSI_TOTAL,
          zn_coverage: props.ZN_COVERAGE,
          zbl_chapter: props.ZBL_CHAPTER,
          zbl_section: props.ZBL_SECTION,
          zbl_excptn: props.ZBL_EXCPTN,
          bylaw_doclink: props.BYLAW_DOCLINK,
          geom: geom
        };
      });

      // Upsert batch to Supabase
      const { error } = await supabase.from('zoning_polygons').upsert(rows, { onConflict: 'objectid' });

      if (error) {
        throw new Error(`Supabase upsert error: ${JSON.stringify(error)}`);
      }

      totalUpserted += rows.length;
      console.log(`✅ Upserted ${rows.length} rows. Total upserted: ${totalUpserted}`);

      // Paginate next batch
      offset += BATCH_SIZE;

      // Safety check: if features count is less than batch size, we reached the end
      if (features.length < BATCH_SIZE) {
        console.log('Reached last page of features.');
        hasMore = false;
      }
      
    } catch (error) {
      console.error('❌ Error during sync execution:', error.message);
      hasMore = false; // Stop the loop on error
    }
  }

  console.log(`\n🎉 Sync job finished. Total zoning polygons synced: ${totalUpserted}`);
}

syncZoning();
