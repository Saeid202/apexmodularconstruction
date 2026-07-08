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
  const accounts = [
    { email: 'seller@cargoplus.site', id: '434bec75-2ef2-46be-874e-44ab8b08fdfe' },
    { email: 'chinaplusgroup@gmail.com', id: 'a87b8a24-6988-43ba-93af-2e84ebbcb407' }
  ];

  for (const acc of accounts) {
    console.log(`Resetting password for ${acc.email}...`);
    const { data, error } = await supabase.auth.admin.updateUserById(
      acc.id,
      { password: 'Password123!' }
    );
    if (error) {
      console.error(`Failed to reset password for ${acc.email}:`, error.message);
    } else {
      console.log(`Successfully reset password for ${acc.email}!`);
    }
  }
}

run();
