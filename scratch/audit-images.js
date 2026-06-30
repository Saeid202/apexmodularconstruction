import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditImages() {
  console.log('Auditing product images using Storage API...');
  
  const { data: images, error } = await supabase
    .from('product_images')
    .select('id, url, product_id, products(name)');

  if (error) {
    console.error('Error fetching images:', error);
    return;
  }

  console.log(`Checking ${images.length} images...`);
  
  const brokenImages = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const pathMatch = img.url.split('/product-images/')[1];

    if (!pathMatch) {
      process.stdout.write('s'); // skip
      continue;
    }

    // Try to get headers/metadata for the file
    // .list() is safest to check existence without downloading bytes
    const folder = pathMatch.substring(0, pathMatch.lastIndexOf('/'));
    const fileName = pathMatch.substring(pathMatch.lastIndexOf('/') + 1);

    const { data: listData, error: listError } = await supabase
      .storage
      .from('product-images')
      .list(folder, { search: fileName });

    const exists = listData && listData.some(f => f.name === fileName);

    if (!exists) {
      brokenImages.push({
        id: img.id,
        url: img.url,
        productName: img.products?.name || 'Unknown Product',
        productId: img.product_id
      });
      process.stdout.write('X');
    } else {
      process.stdout.write('.');
    }

    if ((i + 1) % 50 === 0) console.log(` (${i + 1}/${images.length})`);
  }

  console.log('\n\n--- AUDIT COMPLETE ---');
  if (brokenImages.length === 0) {
    console.log('No broken images found! (All files exist in storage)');
  } else {
    console.log(`Found ${brokenImages.length} broken image(s):`);
    
    const grouped = brokenImages.reduce((acc, bi) => {
      if (!acc[bi.productId]) acc[bi.productId] = { name: bi.productName, count: 0, ids: [] };
      acc[bi.productId].count++;
      acc[bi.productId].ids.push(bi.id);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([id, info]) => {
      console.log(`\nProduct: ${info.name} (ID: ${id})`);
      console.log(`Status: ${info.count} image(s) missing from storage.`);
    });
    
    console.log('\n--- RECOMMENDATION ---');
    console.log('1. These images were physically deleted from storage by the bug.');
    console.log('2. They cannot be recovered unless you have backups.');
    console.log('3. I can delete the database records for these broken images so you can upload fresh ones.');
    console.log('\nTo delete broken records, run: npx tsx scratch/audit-images.js --fix');
    
    // Check for --fix flag
    if (process.argv.includes('--fix')) {
      console.log('\nDELETING BROKEN RECORDS...');
      const idsToDelete = brokenImages.map(bi => bi.id);
      const { error: delError } = await supabase
        .from('product_images')
        .delete()
        .in('id', idsToDelete);
      
      if (delError) {
        console.error('Error deleting records:', delError);
      } else {
        console.log(`Successfully deleted ${idsToDelete.length} broken image records.`);
        console.log('The products will now show placeholders or allow new uploads.');
      }
    }
  }
}

auditImages();
