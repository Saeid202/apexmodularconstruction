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
  console.log('Querying one row from architects table...');
  const { data: rows, error } = await supabase
    .from('architects')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching from architects:', error);
  } else {
    console.log('Successfully queried architects!');
    if (rows.length === 0) {
      console.log('No rows in architects table.');
      // Let's check metadata by trying to insert a dummy or looking at error
      const { error: insertError } = await supabase
        .from('architects')
        .insert({ id: '00000000-0000-0000-0000-000000000000', branding: {} });
      console.log('Dummy insert response:', insertError);
    } else {
      console.log('Columns of architects:', Object.keys(rows[0]));
    }
  }
}

run();
