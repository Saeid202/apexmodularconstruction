import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testPoints = [
  { name: '283 Spadina Rd', lon: -79.408786, lat: 43.678869 },
  { name: '150 Laird Dr', lon: -79.363215, lat: 43.708843 },
  { name: '100 Queen St W', lon: -79.383627, lat: 43.652826 }
];

async function test() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  for (const pt of testPoints) {
    console.log(`\nTesting ${pt.name} (Lon ${pt.lon}, Lat ${pt.lat})...`);
    const { data, error } = await supabase.rpc('find_zoning_at_point', { lng: pt.lon, lat: pt.lat });
    if (error) {
      console.error(`  Error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`  Matched: Zone "${data[0].zn_zone}", Exception ${data[0].zn_exception_no}, String "${data[0].zn_string}"`);
    } else {
      console.log(`  No matching polygon found.`);
    }
  }
}

test();
