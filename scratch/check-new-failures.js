import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNewUrls() {
  const targetUrls = [
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778560515687_4.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778560515687_3.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778560515687_2.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778560515687_5.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778560515687_1.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778560515687_6.jpeg",
    "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1778560515687_7.jpg"
  ];

  console.log('Checking new failing URLs...');
  for (const url of targetUrls) {
    const pathMatch = url.split('/product-images/')[1];
    if (!pathMatch) {
      console.log(`- Invalid URL format: ${url}`);
      continue;
    }

    const folder = pathMatch.substring(0, pathMatch.lastIndexOf('/'));
    const fileName = pathMatch.substring(pathMatch.lastIndexOf('/') + 1);

    const { data: listData, error: listError } = await supabase
      .storage
      .from('product-images')
      .list(folder, { search: fileName });

    const exists = listData && listData.some(f => f.name === fileName);

    if (exists) {
      console.log(`[EXIST] ${url} exists in storage.`);
    } else {
      console.log(`[MISSING] ${url} is NOT in storage.`);
    }
  }
}

checkNewUrls();
