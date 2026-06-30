'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { HouseAnchor } from '@/types/configurator'

function isMissingMaskUrlColumnError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? ''
  return message.includes('house_anchors.mask_url') && message.includes('does not exist')
}

const stripMaskUrl = (anchor: HouseAnchor) => {
  const anchorWithoutMask = { ...anchor }
  delete anchorWithoutMask.mask_url
  return anchorWithoutMask
}

export async function saveCalibration(params: {
  productId: string
  mainImage: string
  existingSettingsId?: string
  anchors: HouseAnchor[]
}): Promise<{ error: string | null; settingsId?: string; anchors?: HouseAnchor[] }> {
  const supabase = createAdminClient()

  let settingsId = params.existingSettingsId

  if (!settingsId) {
    const { data, error } = await supabase
      .from('house_configurator_settings')
      .insert({
        product_id: params.productId,
        base_image_url: params.mainImage,
        lighting_metadata: { sun_direction: 'top-left', ambient: 'balanced' },
      })
      .select('id')
      .single()

    if (error) return { error: error.message }
    settingsId = data.id
  }

  const { error: deleteError } = await supabase
    .from('house_anchors')
    .delete()
    .eq('house_id', settingsId)

  if (deleteError) return { error: deleteError.message }

  if (params.anchors.length > 0) {
    const anchorsToInsert = params.anchors.map((a) => ({ ...a, house_id: settingsId }))
    const { error: insertError } = await supabase.from('house_anchors').insert(anchorsToInsert)

    if (insertError) {
      if (!isMissingMaskUrlColumnError(insertError)) {
        return { error: insertError.message }
      }

      const { error: legacyInsertError } = await supabase
        .from('house_anchors')
        .insert(params.anchors.map((a) => ({ ...stripMaskUrl(a), house_id: settingsId })))

      if (legacyInsertError) return { error: legacyInsertError.message }
    }
  }

  const { data: savedAnchors, error: anchorsLoadError } = await supabase
    .from('house_anchors')
    .select('*')
    .eq('house_id', settingsId)
    .order('z_index', { ascending: true })

  if (anchorsLoadError) return { error: anchorsLoadError.message, settingsId }

  return { error: null, settingsId, anchors: (savedAnchors as HouseAnchor[]) ?? [] }
}
