import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDrafts() {
  const targetUrls = [
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_0.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_5.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778559801911_6.jpg"
  ];

  console.log('Checking if target URLs exist in Product Drafts...');
  const { data, error } = await supabase
    .from('product_drafts')
    .select('id, name, main_image_url')
    .or(targetUrls.map(url => `main_image_url.eq.${url}`).join(','));
  
  if (data && data.length > 0) {
    data.forEach(p => {
      console.log(`[EXIST] ${p.main_image_url} is in Product Drafts (Draft: ${p.name})`);
    });
  } else {
    console.log(`[CLEAN] Target URLs are NOT in Product Drafts.`);
  }
}

checkDrafts();
