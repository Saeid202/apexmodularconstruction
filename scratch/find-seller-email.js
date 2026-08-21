const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log('Querying seller profile...');
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', 'a87b8a24-6988-43ba-93af-2e84ebbcb407')
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('Seller profile:', profile);
  }

  console.log('Querying all profiles with role seller or admin...');
  const { data: profiles, error: err2 } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['seller', 'admin']);
    
  if (err2) {
    console.error('Error fetching profiles:', err2);
  } else {
    console.log('All seller/admin profiles:', profiles);
  }
}

run();
