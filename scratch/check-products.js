import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProductsTable() {
  const targetUrls = [
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_0.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_5.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_6.jpg"
  ];

  console.log('Checking if target URLs exist in Products Table...');
  // We'll search across multiple columns just in case
  const { data, error } = await supabase
    .from('products')
    .select('id, name, main_image_url')
    .or(targetUrls.map(url => `main_image_url.eq.${url}`).join(','));
  
  if (data && data.length > 0) {
    data.forEach(p => {
      console.log(`[EXIST] ${p.main_image_url} is in Products Table (Product: ${p.name})`);
    });
  } else {
    console.log(`[CLEAN] Target URLs are NOT in the main image URL column of the Products table.`);
  }
}

checkProductsTable();
