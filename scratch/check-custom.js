import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCustomizations() {
  const targetUrls = [
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_0.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_5.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_6.jpg"
  ];

  console.log('Checking if target URLs exist in Customization Options...');
  for (const url of targetUrls) {
    const { data, error } = await supabase
      .from('product_customization_options')
      .select('id, name')
      .eq('image_url', url);
    
    if (data && data.length > 0) {
      console.log(`[EXIST] ${url} is in Customization Options (Option: ${data[0].name})`);
    } else {
      console.log(`[CLEAN] ${url} is NOT in Customization Options.`);
    }
  }
}

checkCustomizations();
