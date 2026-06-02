'use server';

import { createServerClient } from '@/lib/supabase/server';
import { HouseConfiguratorSettings, HouseAnchor, AllowedProduct } from '@/types/configurator';

const DEFAULT_WALL_MASK_URL = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/></svg>').toString('base64')}`;

/**
 * Fetches the complete configurator mesh for a house product
 */
export async function getHouseConfigurator(productId: string) {
  const supabase = await createServerClient();

  // 1. Fetch settings
  const { data: settings, error: sError } = await supabase
    .from('house_configurator_settings')
    .select('*')
    .eq('product_id', productId)
    .single();

  if (sError || !settings) return { data: null, error: sError || 'No settings found' };

  // 2. Fetch anchors
  const { data: anchors, error: aError } = await supabase
    .from('house_anchors')
    .select('*')
    .eq('house_id', settings.id)
    .order('z_index', { ascending: true });

  if (aError) return { data: null, error: aError };

  // 3. Fetch allowed products for each anchor
  const { data: allowedProducts, error: apError } = await supabase
    .from('house_anchor_allowed_products')
    .select(`
      *,
      product:products(
        id,
        name,
        price,
        configurator_type,
        images:product_images(url)
      )
    `)
    .in('anchor_id', anchors.map(a => a.id));

  if (apError) return { data: null, error: apError };

  // Combine data
  const result: HouseConfiguratorSettings & { anchors: (HouseAnchor & { allowedProducts: AllowedProduct[] })[] } = {
    ...settings,
    anchors: anchors.map(anchor => ({
      ...anchor,
      allowedProducts: (allowedProducts || [])
        .filter(ap => ap.anchor_id === anchor.id)
        .map(ap => ({
          ...ap,
          product: {
            ...ap.product,
            image_url: (ap.product as any).images?.[0]?.url || ''
          }
        }))
    }))
  };

  return { data: result, error: null };
}

export async function ensureHouseConfigurator(productId: string, baseImageUrl: string) {
  const supabase = await createServerClient();
  if (!baseImageUrl) return { data: null, error: 'Missing base image URL' };

  const { data: existing, error: existingError } = await supabase
    .from('house_configurator_settings')
    .select('id, base_image_url')
    .eq('product_id', productId)
    .maybeSingle();

  if (existingError) return { data: null, error: existingError.message };

  let settingsId = existing?.id;
  if (settingsId) {
    if (existing.base_image_url !== baseImageUrl) {
      await supabase
        .from('house_configurator_settings')
        .update({ base_image_url: baseImageUrl })
        .eq('id', settingsId);
    }
  } else {
    const { data, error } = await supabase
      .from('house_configurator_settings')
      .insert({
        product_id: productId,
        base_image_url: baseImageUrl,
        lighting_metadata: { sun_direction: 'top-left', ambient: 'balanced' },
      })
      .select('id')
      .single();

    if (error || !data?.id) return { data: null, error: error?.message || 'Failed to create configurator settings' };
    settingsId = data.id;
  }

  const { data: anchors, error: anchorsError } = await supabase
    .from('house_anchors')
    .select('id, anchor_type, mask_url')
    .eq('house_id', settingsId);

  if (anchorsError) return { data: null, error: anchorsError.message };
  const wallMaskAnchor = anchors?.find((anchor: any) => anchor.anchor_type === 'wall-mask');
  if (wallMaskAnchor) {
    if (!wallMaskAnchor.mask_url) {
      await supabase.from('house_anchors').update({ mask_url: DEFAULT_WALL_MASK_URL }).eq('id', wallMaskAnchor.id);
    }
  } else {
    const { error: anchorError } = await supabase.from('house_anchors').insert({
      house_id: settingsId,
      anchor_type: 'wall-mask',
      label: 'Wall Color',
      x_pos: 0,
      y_pos: 0,
      width: 100,
      height: 100,
      z_index: 10,
      mask_url: DEFAULT_WALL_MASK_URL,
    });

    if (anchorError) return { data: null, error: anchorError.message };
  }

  return getHouseConfigurator(productId);
}

/**
 * Saves a user's house configuration
 */
export async function saveConfiguration(params: {
  productId: string;
  selections: Record<string, string>;
  totalPrice: number;
}) {
  const supabase = await createServerClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: 'You must be logged in to save configurations' };
  }

  // Insert configuration
  const { data, error } = await supabase
    .from('house_configurations')
    .insert({
      user_id: user.id,
      product_id: params.productId,
      selections: params.selections,
      total_price: params.totalPrice,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  return { data, error: null };
}
