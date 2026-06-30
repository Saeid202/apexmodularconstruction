import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkHeroSchema() {
  console.log('Fetching a single row from hero_slides to inspect schema...');
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching slides:', error);
    return;
  }

  console.log('Successfully fetched slide row. Column list:');
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
    console.log('Row content:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('No rows in hero_slides table.');
    // Let's fetch the actual table schema info via raw RPC or query a standard system catalog
    console.log('Trying to fetch table info...');
    const { data: cols, error: colError } = await supabase
      .from('hero_slides')
      .select('id')
      .limit(1);
    if (colError) {
      console.error('Table access failed:', colError);
    } else {
      console.log('Table exists. Let us try to select background_overlay explicitly:');
      const { data: testData, error: testError } = await supabase
        .from('hero_slides')
        .select('background_overlay')
        .limit(1);
      if (testError) {
        console.error('background_overlay column check failed:', testError.message);
      } else {
        console.log('background_overlay column exists!');
      }
    }
  }
}

checkHeroSchema();
