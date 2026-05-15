'use server';

import { createClient } from '@/lib/supabase/server';
import { HouseConfiguratorSettings, HouseAnchor, AllowedProduct } from '@/types/configurator';

/**
 * Fetches the complete configurator mesh for a house product
 */
export async function getHouseConfigurator(productId: string) {
  const supabase = await createClient();

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

/**
 * Saves a user's house configuration
 */
export async function saveConfiguration(params: {
  productId: string;
  selections: Record<string, string>;
  totalPrice: number;
}) {
  const supabase = await createClient();
  
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
