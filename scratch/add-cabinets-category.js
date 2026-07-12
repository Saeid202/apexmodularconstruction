const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function addCabinetsCategory() {
  console.log("Inserting 'Cabinets' category...");
  const { data, error } = await supabase
    .from('categories')
    .insert([
      { name: 'Cabinets', slug: 'cabinets', description: 'Kitchen cabinets, countertops, and storage units' }
    ])
    .select();

  if (error) {
    if (error.code === '23505') {
      console.log("Cabinets category already exists!");
    } else {
      console.error("Error inserting category:", error);
    }
  } else {
    console.log("Successfully added Cabinets category:", data);
  }
}

addCabinetsCategory();
