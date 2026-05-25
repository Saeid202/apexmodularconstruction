'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { HouseAnchor } from '@/types/configurator';

export async function saveCalibration(params: {
  productId: string;
  mainImage: string;
  existingSettingsId?: string;
  anchors: HouseAnchor[];
}) {
  const supabase = createAdminClient();

  let settingsId = params.existingSettingsId;

  if (!settingsId) {
    const { data, error } = await supabase
      .from('house_configurator_settings')
      .insert({
        product_id: params.productId,
        base_image_url: params.mainImage,
        lighting_metadata: { sun_direction: 'top-left', ambient: 'balanced' },
      })
      .select('id')
      .single();

    if (error) return { error: error.message };
    settingsId = data.id;
  }

  const { error: deleteError } = await supabase
    .from('house_anchors')
    .delete()
    .eq('house_id', settingsId);

  if (deleteError) return { error: deleteError.message };

  if (params.anchors.length > 0) {
    const { error: insertError } = await supabase
      .from('house_anchors')
      .insert(params.anchors.map(a => ({ ...a, house_id: settingsId })));

    if (insertError) return { error: insertError.message };
  }

  return { error: null, settingsId };
}
