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
    { email: 'saeid.shabani64@gmail.com', id: '9721b67d-6cd0-4d94-8d22-214fa8138d32' },
    { email: 'chinaplusgroup@gmail.com', id: 'a87b8a24-6988-43ba-93af-2e84ebbcb407' },
    { email: 'seller@cargoplus.site', id: '434bec75-2ef2-46be-874e-44ab8b08fdfe' },
    { email: 'apexmodular1@hotmail.com', id: 'f97ccaaf-39a5-4c5a-a052-f47ae489d895' },
    { email: 'saeid_shabani@outlook.com', id: '256b90a8-1764-447b-b8b0-f7741174ce4d' },
    { email: 'shabani_saeid@hotmail.com', id: '8115ff3b-6d66-43c0-a2e6-f02287bee5fe' }
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
      console.log(`Successfully reset password for ${acc.email} to Password123!`);
    }
  }
}

run();
