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
  const slug = 'expandable-container-house-code2';
  
  // 1. Get the current product
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, specifications')
    .eq('slug', slug)
    .single();

  if (fetchError || !product) {
    console.error('Error fetching product:', fetchError);
    return;
  }

  // 2. Update specifications
  const newSpecs = {
    ...(product.specifications || {}),
    sketchfab_embed_url: 'https://sketchfab.com/models/d824234600c748ac829fdf80d657a709/embed?preload=1&transparent=1'
  };

  const { data, error } = await supabase
    .from('products')
    .update({ specifications: newSpecs })
    .eq('slug', slug)
    .select();

  if (error) {
    console.error('Error updating product:', error);
  } else {
    console.log('Successfully updated product with 3D model URL:', data[0]?.specifications);
  }
}

run();
