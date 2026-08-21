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
  console.log('Testing insert into house_anchors with mask_url...');
  const { data, error } = await supabase
    .from('house_anchors')
    .insert({
      house_id: 'a7e93157-0e49-48a9-9607-eae6bedf8832',
      anchor_type: 'wall-mask',
      label: 'Test Mask URL Column',
      x_pos: 0,
      y_pos: 0,
      width: 10,
      height: 10,
      z_index: 10,
      mask_url: 'http://test.com/mask.png'
    })
    .select();
  
  if (error) {
    console.error('Insert failed:', error.message);
  } else {
    console.log('Insert succeeded! Row:', data);
    // Cleanup
    const { error: deleteError } = await supabase
      .from('house_anchors')
      .delete()
      .eq('id', data[0].id);
    console.log('Cleanup error:', deleteError);
  }
}

run();
