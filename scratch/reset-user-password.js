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
  const emailInput = process.argv[2];
  const newPassword = process.argv[3];

  if (!emailInput || !newPassword) {
    console.log('Usage: node scratch/reset-user-password.js <email> <new_password>');
    console.log('\nExample: node scratch/reset-user-password.js saeid.shabani64@gmail.com mySuperSecretPassword123');
    
    // Also list current users for convenience
    console.log('\nFetching current user list...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError.message);
    } else {
      console.log('Registered Users:');
      users.forEach(u => console.log(`- ${u.email} (Role: ${u.user_metadata?.role || 'none'})`));
    }
    return;
  }

  console.log(`Searching for user with email: ${emailInput}...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const targetUser = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
  if (!targetUser) {
    console.error(`User not found with email: ${emailInput}`);
    return;
  }

  console.log(`Resetting password for ${targetUser.email} (ID: ${targetUser.id})...`);
  const { data, error } = await supabase.auth.admin.updateUserById(
    targetUser.id,
    { password: newPassword }
  );

  if (error) {
    console.error(`Failed to reset password:`, error.message);
    return;
  }

  console.log(`Successfully reset password for ${targetUser.email} to: ${newPassword}`);
}

run();
