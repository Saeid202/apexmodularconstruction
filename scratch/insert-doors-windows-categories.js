const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://odvgrfeponeddcottcpq.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRole) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function run() {
  console.log('Inserting parent category "Doors & Windows"...');
  
  // 1. Insert parent category
  const { data: parentData, error: parentError } = await supabase
    .from('categories')
    .upsert(
      {
        name: 'Doors & Windows',
        slug: 'doors-windows',
        description: 'Doors and Windows including exterior, interior, sliding doors, windows, and hardware.'
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .single();

  if (parentError) {
    console.error('Error inserting parent category:', parentError);
    process.exit(1);
  }

  const parentId = parentData.id;
  console.log(`Parent category "Doors & Windows" ID: ${parentId}`);

  // 2. Insert subcategories
  const subcategories = [
    { name: 'Exterior Doors', slug: 'exterior-doors', parent_id: parentId },
    { name: 'Interior Doors', slug: 'interior-doors', parent_id: parentId },
    { name: 'Entry Doors', slug: 'entry-doors', parent_id: parentId },
    { name: 'Sliding / Patio Doors', slug: 'sliding-patio-doors', parent_id: parentId },
    { name: 'Windows', slug: 'windows', parent_id: parentId },
    { name: 'Skylights', slug: 'skylights', parent_id: parentId },
    { name: 'Door / Window Hardware', slug: 'door-window-hardware', parent_id: parentId },
  ];

  console.log('Inserting subcategories...');
  for (const sub of subcategories) {
    const { error } = await supabase
      .from('categories')
      .upsert(sub, { onConflict: 'slug' });
    
    if (error) {
      console.error(`Error inserting subcategory ${sub.name}:`, error);
    } else {
      console.log(`Successfully upserted: ${sub.name}`);
    }
  }

  console.log('Done!');
}

run();
