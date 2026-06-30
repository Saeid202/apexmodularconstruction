const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing exact hero_slides query...');
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });
    if (error) {
      console.error('Error fetching hero_slides:', error);
    } else {
      console.log('Successfully fetched hero_slides. Count:', data.length);
      console.log('Sample hero_slide:', data[0]);
    }
  } catch (err) {
    console.error('Caught error fetching hero_slides:', err);
  }

  console.log('\nTesting exact products query...');
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (*),
        categories (*),
        sellers (*)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log('Successfully fetched products. Count:', data.length);
      console.log('Sample product images count:', data[0]?.product_images?.length);
      console.log('Sample product category:', data[0]?.categories);
      console.log('Sample product seller:', data[0]?.sellers);
    }
  } catch (err) {
    console.error('Caught error fetching products:', err);
  }
}

test();
