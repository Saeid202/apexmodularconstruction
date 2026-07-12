'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface PartnerProduct {
  id: string
  name: string
  slug: string
  price: number
  price_type: string
  description: string | null
  image_url: string | null
}

export async function getPartnerProducts(sellerId: string): Promise<PartnerProduct[]> {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      console.error('Failed to create admin client for products')
      return []
    }

    // Fetch active products for this specific seller
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        price_type,
        description,
        product_images (url, is_master)
      `)
      .eq('seller_id', sellerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching partner products:', error)
      return []
    }

    if (!products) return []

    // Map the relational data to a flat structure for the UI
    return products.map((p: any) => {
      // Find the master image, or fallback to the first image, or null
      let imageUrl = null
      if (p.product_images && p.product_images.length > 0) {
        const master = p.product_images.find((img: any) => img.is_master)
        imageUrl = master ? master.url : p.product_images[0].url
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        price_type: p.price_type,
        description: p.description,
        image_url: imageUrl,
      }
    })
  } catch (error) {
    console.error('Failed to fetch partner products:', error)
    return []
  }
}
