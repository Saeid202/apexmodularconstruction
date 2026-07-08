const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually to get credentials
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log('Querying Sofa product...');
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(*),
      product_images(*),
      product_customization_groups(
        *,
        options:product_customization_options(*)
      )
    `)
    .eq('slug', 'sofa');

  if (error) {
    console.error('Error fetching product:', error);
    process.exit(1);
  }

  console.log('Product details:', JSON.stringify(products, null, 2));

  if (products && products.length > 0) {
    const p = products[0];
    const { data: configurator } = await supabase
      .from('house_configurator_settings')
      .select(`
        *,
        anchors:house_anchors(*)
      `)
      .eq('product_id', p.id);
    console.log('Configurator settings:', JSON.stringify(configurator, null, 2));
  }
}

run();
