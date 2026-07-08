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
  console.log('Querying database functions...');
  // We try to query from pg_proc via RPC if possible or a view, but usually we can't do direct select.
  // Let's try to execute a simple raw query or list functions using sql-like requests.
  const { data, error } = await supabase
    .from('pg_proc')
    .select('proname');
    
  if (error) {
    console.error('Failed to query pg_proc directly:', error.message);
  } else {
    console.log('Functions:', data);
  }
}

run();
