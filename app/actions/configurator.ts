'use server'

import { createServerClient } from '@/lib/supabase/server'
import { HouseConfiguratorSettings, HouseAnchor, AllowedProduct } from '@/types/configurator'

const DEFAULT_WALL_MASK_URL = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/></svg>').toString('base64')}`

type WallMaskAnchorRow = Pick<HouseAnchor, 'id' | 'anchor_type' | 'mask_url'>
type LegacyWallMaskAnchorRow = Pick<HouseAnchor, 'id' | 'anchor_type'>
type AllowedProductRow = AllowedProduct & {
  product?: AllowedProduct['product'] & { images?: Array<{ url: string }> }
}

function isMissingMaskUrlColumnError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? ''
  return message.includes('house_anchors.mask_url') && message.includes('does not exist')
}

async function ensureWallMaskAnchor(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  settingsId: string
) {
  const { data: anchors, error } = await supabase
    .from('house_anchors')
    .select('id, anchor_type, mask_url')
    .eq('house_id', settingsId)

  if (error) {
    if (!isMissingMaskUrlColumnError(error)) {
      return { data: null, error: error.message, changed: false }
    }

    const { data: legacyAnchors, error: legacyError } = await supabase
      .from('house_anchors')
      .select('id, anchor_type')
      .eq('house_id', settingsId)

    if (legacyError) {
      return { data: null, error: legacyError.message, changed: false }
    }

    const legacyWallMaskAnchor = legacyAnchors?.find(
      (anchor: LegacyWallMaskAnchorRow) => anchor.anchor_type === 'wall-mask'
    )

    if (legacyWallMaskAnchor) {
      return { data: null, error: null, changed: false }
    }

    const { error: legacyInsertError } = await supabase.from('house_anchors').insert({
      house_id: settingsId,
      anchor_type: 'wall-mask',
      label: 'Wall Color',
      x_pos: 0,
      y_pos: 0,
      width: 100,
      height: 100,
      z_index: 10,
    })

    if (legacyInsertError) {
      return { data: null, error: legacyInsertError.message, changed: false }
    }

    return { data: null, error: null, changed: true }
  }

  const wallMaskAnchor = anchors?.find(
    (anchor: WallMaskAnchorRow) => anchor.anchor_type === 'wall-mask'
  )
  if (wallMaskAnchor) {
    if (!wallMaskAnchor.mask_url) {
      const { error: updateError } = await supabase
        .from('house_anchors')
        .update({ mask_url: DEFAULT_WALL_MASK_URL })
        .eq('id', wallMaskAnchor.id)

      if (updateError) {
        return { data: null, error: updateError.message, changed: false }
      }

      return { data: null, error: null, changed: true }
    }

    return { data: null, error: null, changed: false }
  }

  const { error: insertError } = await supabase.from('house_anchors').insert({
    house_id: settingsId,
    anchor_type: 'wall-mask',
    label: 'Wall Color',
    x_pos: 0,
    y_pos: 0,
    width: 100,
    height: 100,
    z_index: 10,
    mask_url: DEFAULT_WALL_MASK_URL,
  })

  if (insertError) {
    return { data: null, error: insertError.message, changed: false }
  }

  return { data: null, error: null, changed: true }
}

/**
 * Fetches the complete configurator mesh for a house product
 */
export async function getHouseConfigurator(productId: string) {
  const supabase = await createServerClient()

  // 1. Fetch settings
  const { data: settings, error: sError } = await supabase
    .from('house_configurator_settings')
    .select('*')
    .eq('product_id', productId)
    .single()

  if (sError || !settings) return { data: null, error: sError || 'No settings found' }

  const ensuredWallMask = await ensureWallMaskAnchor(supabase, settings.id)
  if (ensuredWallMask.error) return { data: null, error: ensuredWallMask.error }

  // 2. Fetch anchors
  const { data: anchors, error: aError } = await supabase
    .from('house_anchors')
    .select('*')
    .eq('house_id', settings.id)
    .order('z_index', { ascending: true })

  if (aError) return { data: null, error: aError }

  // 3. Fetch allowed products for each anchor
  const anchorIds = anchors.map((anchor) => anchor.id).filter(Boolean)
  const { data: allowedProducts, error: apError } =
    anchorIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from('house_anchor_allowed_products')
          .select(
            `
          *,
          product:products(
            id,
            name,
            price,
            configurator_type,
            images:product_images(url)
          )
        `
          )
          .in('anchor_id', anchorIds)

  if (apError) return { data: null, error: apError }

  // Combine data
  const result: HouseConfiguratorSettings & {
    anchors: (HouseAnchor & { allowedProducts: AllowedProduct[] })[]
  } = {
    ...settings,
    anchors: anchors.map((anchor) => ({
      ...anchor,
      mask_url:
        anchor.anchor_type === 'wall-mask'
          ? ((anchor as HouseAnchor).mask_url ?? DEFAULT_WALL_MASK_URL)
          : (anchor as HouseAnchor).mask_url,
      allowedProducts: (allowedProducts || [])
        .filter((ap) => ap.anchor_id === anchor.id)
        .map((ap) => {
          const product = (ap as AllowedProductRow).product

          return {
            ...ap,
            product: {
              ...product,
              image_url: product?.images?.[0]?.url || '',
            },
          }
        }),
    })),
  }

  return { data: result, error: null }
}

export async function ensureHouseConfigurator(productId: string, baseImageUrl: string) {
  const supabase = await createServerClient()
  if (!baseImageUrl) return { data: null, error: 'Missing base image URL' }

  const { data: existing, error: existingError } = await supabase
    .from('house_configurator_settings')
    .select('id, base_image_url')
    .eq('product_id', productId)
    .maybeSingle()

  if (existingError) return { data: null, error: existingError.message }

  let settingsId = existing?.id
  if (settingsId) {
    if (existing.base_image_url !== baseImageUrl) {
      await supabase
        .from('house_configurator_settings')
        .update({ base_image_url: baseImageUrl })
        .eq('id', settingsId)
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
      .single()

    if (error || !data?.id)
      return { data: null, error: error?.message || 'Failed to create configurator settings' }
    settingsId = data.id
  }

  const ensuredWallMask = await ensureWallMaskAnchor(supabase, settingsId)
  if (ensuredWallMask.error) return { data: null, error: ensuredWallMask.error }

  return getHouseConfigurator(productId)
}

/**
 * Saves a user's house configuration
 */
export async function saveConfiguration(params: {
  productId: string
  selections: Record<string, string>
  totalPrice: number
}) {
  const supabase = await createServerClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return { data: null, error: 'You must be logged in to save configurations' }
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
    .single()

  if (error) return { data: null, error: error.message }

  return { data, error: null }
}
