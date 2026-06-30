import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBucket() {
  console.log('Checking bucket "product-images" configuration...');
  const { data, error } = await supabase.storage.getBucket('product-images');
  
  if (error) {
    console.error('Error fetching bucket:', error);
  } else {
    console.log('Bucket Info:', JSON.stringify(data, null, 2));
  }
}

checkBucket();
