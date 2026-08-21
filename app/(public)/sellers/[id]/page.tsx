import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import SellerStorefrontClient from './SellerStorefrontClient'

interface Props {
  params: {
    id: string
  }
}

export const dynamic = 'force-dynamic'

export default async function SellerStorefrontPage({ params }: Props) {
  const { id } = await params;
  
  const supabase = createAdminClient()
  if (!supabase) return notFound()
  
  // Fetch Seller Profile
  const { data: seller, error: sellerError } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', id)
    .single()

  if (sellerError || !seller) {
    notFound()
  }

  // Fetch Seller's active products
  const { data: products } = await supabase
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
    .eq('seller_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Map products
  const mappedProducts = (products || []).map((p: any) => {
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

  return <SellerStorefrontClient seller={seller} products={mappedProducts} />
}
