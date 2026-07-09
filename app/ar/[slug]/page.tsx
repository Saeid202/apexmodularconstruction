import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/app/actions/products'
import { mockProducts } from '@/lib/mock-data'
import { ARLoader } from './ARLoader'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  if (result.data) {
    return {
      title: `View ${result.data.name} in AR`,
      description: `See the ${result.data.name} in your room using Augmented Reality.`,
    }
  }
  return { title: 'AR View' }
}

export default async function ARPage({ params }: Props) {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  
  let glbUrl = ''
  let usdzUrl = ''
  let productName = ''

  if (result.data) {
    productName = result.data.name
    // Fallback for sofa-2 for testing if not set
    glbUrl = (result.data.specifications as any)?.ar_glb_url || (slug === 'sofa-2' ? 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb' : '')
    usdzUrl = (result.data.specifications as any)?.ar_usdz_url || ''
  } else {
    const mock = mockProducts.find((p) => p.slug === slug)
    if (mock) {
      productName = mock.name
      glbUrl = mock.specifications?.ar_glb_url || ''
      usdzUrl = mock.specifications?.ar_usdz_url || ''
    } else {
      notFound()
    }
  }

  if (!glbUrl && !usdzUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">AR Not Available</h1>
          <p className="text-gray-400">Sorry, there is no 3D model available for this product.</p>
        </div>
      </div>
    )
  }

  return <ARLoader glbUrl={glbUrl} usdzUrl={usdzUrl} productName={productName} />
}
