const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually to get credentials
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found at:', envPath);
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log('Fetching all products and categories to identify non-prefab products...');
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, name, category_id, category:categories(slug)');

  if (pError) {
    console.error('Error fetching products:', pError.message);
    return;
  }

  const nonPrefabProducts = products.filter(p => p.category?.slug !== 'pre-fabricated');
  console.log(`Found ${nonPrefabProducts.length} non-prefab products.`);

  for (const product of nonPrefabProducts) {
    console.log(`Checking configurator for: ${product.name} (ID: ${product.id})...`);
    
    // Check if a configurator exists
    const { data: configurators, error: cError } = await supabase
      .from('house_configurator_settings')
      .select('id')
      .eq('product_id', product.id);

    if (cError) {
      console.error(`Error checking configurator for ${product.name}:`, cError.message);
      continue;
    }

    if (configurators && configurators.length > 0) {
      for (const conf of configurators) {
        console.log(`Deleting anchors for configurator ${conf.id}...`);
        const { error: anchorDelError } = await supabase
          .from('house_anchors')
          .delete()
          .eq('house_id', conf.id);

        if (anchorDelError) {
          console.error(`Error deleting anchors:`, anchorDelError.message);
        }

        console.log(`Deleting configurator settings ${conf.id}...`);
        const { error: confDelError } = await supabase
          .from('house_configurator_settings')
          .delete()
          .eq('id', conf.id);

        if (confDelError) {
          console.error(`Error deleting configurator settings:`, confDelError.message);
        }
      }
      
      // Update the product's configurator_type to 'none' if it was set to something else
      const { error: prodUpdateError } = await supabase
        .from('products')
        .update({ configurator_type: 'none' })
        .eq('id', product.id);

      if (prodUpdateError) {
        console.error(`Error updating product configurator_type:`, prodUpdateError.message);
      } else {
        console.log(`Successfully cleaned up configurator for ${product.name}.`);
      }
    }
  }

  console.log('Cleanup completed.');
}

run();
