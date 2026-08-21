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
  const { data, error } = await supabase
    .rpc('get_table_columns', { table_name: 'house_anchors' });

  if (error) {
    // If RPC doesn't exist, try querying a row directly or use another way
    console.log('RPC error, fetching one row instead...');
    const { data: row, error: rowError } = await supabase
      .from('house_anchors')
      .select('*')
      .limit(1);
    
    if (rowError) {
      console.error('Error fetching row:', rowError);
    } else {
      console.log('Row keys:', Object.keys(row[0] || {}));
    }
  } else {
    console.log('Columns:', data);
  }
}

run();
