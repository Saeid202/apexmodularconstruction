import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkDb() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // 1. Check total count
  const { count, error: countErr } = await supabase
    .from('zoning_polygons')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total records in zoning_polygons: ${count}`);

  // 2. Search for exception 929
  const { data: exc, error: excErr } = await supabase
    .from('zoning_polygons')
    .select('id, objectid, zn_zone, zn_string, zn_exception_no')
    .eq('zn_exception_no', 929);
  
  console.log(`Found with exception 929:`, exc);

  // 3. Search for exception 869
  const { data: exc2 } = await supabase
    .from('zoning_polygons')
    .select('id, objectid, zn_zone, zn_string, zn_exception_no')
    .eq('zn_exception_no', 869);
  
  console.log(`Found with exception 869:`, exc2);
}

checkDb();
