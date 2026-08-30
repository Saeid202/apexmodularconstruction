import RentalEquipmentClient from './RentalEquipmentClient'
import { getProducts } from '@/app/actions/products'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata = {
  title: 'Construction Equipment Rentals | Apex Modular Construction',
  description: 'Rent heavy machinery including cranes, forklifts, and boom lifts for prefabricated modular construction projects.',
}

export default async function RentalEquipmentPage() {
  // Fetch active products belonging to the rental-equipment category
  const result = await getProducts({ categorySlug: 'rental-equipment', limit: 100 })
  const dbProducts = result.data || []

  return <RentalEquipmentClient initialProducts={dbProducts} />
}
