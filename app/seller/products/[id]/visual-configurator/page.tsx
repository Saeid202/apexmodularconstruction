import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, DraftingCompass } from 'lucide-react'
import { getSellerVisualConfiguratorData } from '@/app/actions/seller-configurator'
import VisualConfiguratorBuilder from '@/components/seller/configurator/VisualConfiguratorBuilder'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Visual Configurator',
  description: 'Define seller-managed visual anchors for a customizable product.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SellerVisualConfiguratorPage({ params }: Props) {
  const { id } = await params
  const result = await getSellerVisualConfiguratorData(id)

  if (!result.data && result.error === 'Not authenticated') {
    redirect('/seller/login')
  }

  if (!result.data) {
    notFound()
  }

  const { product, configurator } = result.data
  const sortedImages = [...(product.product_images ?? [])].sort((a, b) => a.position - b.position)
  const mainImage =
    sortedImages.find((image) => image.is_master)?.url ?? configurator?.base_image_url ?? sortedImages[0]?.url ?? ''

  return (
    <div className="min-h-full px-4 py-8" style={{ backgroundColor: '#F5F4F7' }}>
      <div className="mx-auto mb-5 max-w-7xl">
        <Link
          href={`/seller/products/${product.id}/edit`}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: '#4B1D8F' }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Edit Product
        </Link>
      </div>

      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-2xl"
        style={{
          boxShadow:
            '0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F, 0 8px 32px rgba(75,29,143,0.18)',
        }}
      >
        <div
          className="relative px-8 py-6"
          style={{ background: 'linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)' }}
        >
          <span className="absolute left-3 top-3 h-5 w-5 rounded-tl-md border-l-2 border-t-2 border-yellow-400" />
          <span className="absolute right-3 top-3 h-5 w-5 rounded-tr-md border-r-2 border-t-2 border-yellow-400" />

          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#D4AF37' }}
            >
              <DraftingCompass className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">Seller Visual Configurator</h1>
              <p className="mt-0.5 text-sm text-purple-200">{product.name} — define doors, windows, and wall color regions on the base image</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6">
          <VisualConfiguratorBuilder
            product={{ id: product.id, name: product.name, slug: product.slug }}
            initialSettings={configurator}
            mainImage={mainImage}
            groups={product.product_customization_groups}
          />
        </div>
      </div>
    </div>
  )
}
