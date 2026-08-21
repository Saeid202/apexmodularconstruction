const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase URL or Service Role Key in environment variables.");
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const emailArg = process.argv[2];

  if (!emailArg) {
    console.log("Usage: node scratch/turn-user-to-affiliate.js <user-email>");
    console.log("\nListing first 10 users in database for reference:");
    
    // Fetch profiles to help the developer see who exists
    const { data: profiles, error: err } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(10);
      
    if (err) {
      console.error("Error listing profiles:", err);
    } else {
      console.log(JSON.stringify(profiles, null, 2));
    }
    
    // Also list auth users
    const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
      console.error("Error listing auth users:", authErr);
    } else {
      console.log("\nAuth Users list:");
      users.forEach(u => console.log(`- Email: ${u.email} | ID: ${u.id} | Metadata:`, u.user_metadata));
    }
    return;
  }

  const targetEmail = emailArg.trim().toLowerCase();
  console.log(`Searching for user with email: "${targetEmail}"...`);

  // 1. Find the user in auth.users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error fetching auth users:", listError);
    return;
  }

  const user = users.find(u => u.email?.toLowerCase() === targetEmail);
  if (!user) {
    console.error(`Error: User with email "${targetEmail}" not found in auth.users.`);
    return;
  }

  const userId = user.id;
  const fullName = user.user_metadata?.full_name || 'Affiliate Partner';
  console.log(`Found user: ${fullName} (ID: ${userId})`);

  // 2. Update role in auth user metadata
  console.log("Updating auth user metadata to role = 'affiliate'...");
  const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { ...user.user_metadata, role: 'affiliate' }
  });

  if (authUpdateError) {
    console.error("Error updating auth metadata:", authUpdateError);
    return;
  }
  console.log("Successfully updated auth metadata role to 'affiliate'.");

  // 3. Update profiles table
  console.log("Updating profiles table role to 'affiliate'...");
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'affiliate' })
    .eq('id', userId);

  if (profileError) {
    console.error("Error updating profiles table:", profileError);
    return;
  }
  console.log("Successfully updated profiles table.");

  // 4. Check if affiliate profile exists, if not insert it
  console.log("Checking if affiliate profile already exists...");
  const { data: existingAffiliate, error: fetchAffiliateError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (fetchAffiliateError) {
    console.error("Error checking affiliates table:", fetchAffiliateError);
    return;
  }

  if (existingAffiliate) {
    console.log("Affiliate profile already exists in the affiliates table:", existingAffiliate);
  } else {
    // Insert new affiliate record
    const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'partner';
    const referralCode = `${cleanName}${Math.floor(100 + Math.random() * 900)}`;
    const couponCode = `APEX-${cleanName.toUpperCase()}`;

    console.log(`Inserting affiliate profile with referral code: "${referralCode}" and coupon: "${couponCode}"...`);
    
    const { error: insertError } = await supabase
      .from('affiliates')
      .insert({
        id: userId,
        full_name: fullName,
        email: targetEmail,
        referral_code: referralCode,
        coupon_code: couponCode,
        total_earned: 0.00,
        available_balance: 0.00,
        total_sales: 0.00,
        total_orders: 0,
        partner_level: 'Bronze',
        partner_rank: 'Newcomer',
        status: 'active'
      });

    if (insertError) {
      console.error("Error inserting affiliate record:", insertError);
      return;
    }
    console.log("Successfully created affiliate profile record in the affiliates table!");
  }

  console.log(`\nSuccess: User "${targetEmail}" is now an affiliate!`);
}

run();
