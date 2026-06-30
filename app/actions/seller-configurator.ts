'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { HouseAnchor } from '@/types/configurator'

type SellerConfiguratorGroup = Database['public']['Tables']['product_customization_groups']['Row'] & {
  options: Database['public']['Tables']['product_customization_options']['Row'][]
}

type SellerConfiguratorProduct = {
  id: string
  name: string
  slug: string
  seller_id: string
  product_images: Array<{ id: string; url: string; is_master: boolean | null; position: number }>
  product_customization_groups: SellerConfiguratorGroup[]
}

export async function getSellerVisualConfiguratorData(productId: string): Promise<{
  data: {
    product: SellerConfiguratorProduct
    configurator: { id: string; base_image_url: string; anchors: HouseAnchor[] } | null
  } | null
  error: string | null
}> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { data: null, error: 'Not authenticated' }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        seller_id,
        product_images(id, url, is_master, position),
        product_customization_groups(
          *,
          options:product_customization_options(*)
        )
      `
      )
      .eq('id', productId)
      .eq('seller_id', user.id)
      .single()

    if (productError || !product) {
      return { data: null, error: productError?.message || 'Product not found or access denied' }
    }

    const { data: settings } = await supabase
      .from('house_configurator_settings')
      .select(
        `
        id,
        base_image_url,
        anchors:house_anchors(*)
      `
      )
      .eq('product_id', productId)
      .maybeSingle()

    return {
      data: {
        product: product as SellerConfiguratorProduct,
        configurator: settings
          ? {
              id: settings.id,
              base_image_url: settings.base_image_url,
              anchors: ((settings as { anchors?: HouseAnchor[] }).anchors ?? []).sort(
                (a, b) => (a.z_index ?? 0) - (b.z_index ?? 0)
              ),
            }
          : null,
      },
      error: null,
    }
  } catch (error) {
    console.error('getSellerVisualConfiguratorData error:', error)
    return { data: null, error: 'Failed to load visual configurator data' }
  }
}

export async function saveCustomizationGroupAnchorLinks(params: {
  productId: string
  groups: Array<{
    id: string
    target_anchor_id: string | null
    visual_type: 'door' | 'window' | 'wall-color' | 'generic'
  }>
}): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', params.productId)
      .eq('seller_id', user.id)
      .single()

    if (productError || !product) {
      return { error: productError?.message || 'Product not found or access denied' }
    }

    for (const group of params.groups) {
      const { error } = await supabase
        .from('product_customization_groups')
        .update({
          target_anchor_id: group.target_anchor_id,
          visual_type: group.visual_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', group.id)
        .eq('product_id', params.productId)

      if (error) return { error: error.message }
    }

    revalidatePath(`/seller/products/${params.productId}/visual-configurator`)
    revalidatePath(`/seller/products/${params.productId}/edit`)
    return { error: null }
  } catch (error) {
    console.error('saveCustomizationGroupAnchorLinks error:', error)
    return { error: 'Failed to save customization mappings' }
  }
}
