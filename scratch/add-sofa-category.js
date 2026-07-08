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
  console.log('Inserting Sofa category...');
  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name: 'Sofa',
        slug: 'sofas',
        description: 'Premium sofa and home furniture options'
      }
    ])
    .select();

  if (error) {
    if (error.code === '23505') {
      console.log('Sofa category already exists!');
    } else {
      console.error('Error inserting category:', error);
    }
  } else {
    console.log('Successfully inserted Sofa category:', data);
  }
}

run();
