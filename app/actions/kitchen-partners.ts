'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface KitchenPartner {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  specialties: string[]
  online: boolean
  img: string
}

export async function getKitchenPartners(): Promise<KitchenPartner[]> {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      console.error('Failed to create admin client')
      return []
    }

    // Fetch sellers, prioritizing those with a category
    const { data: sellers, error } = await supabase
      .from('sellers')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Error fetching sellers:', error)
      return []
    }

    if (!sellers || sellers.length === 0) {
      return []
    }

    // Map database sellers to our UI KitchenPartner interface
    // Only map those that have Cabinet Maker category, or just all of them for now
    return sellers.map((seller, index) => ({
      id: seller.id,
      name: seller.business_name || 'Partner',
      location: seller.business_address || 'Global Supplier',
      rating: 4.5 + (index % 5) * 0.1, // Mock rating between 4.5 and 5.0
      reviews: 50 + (index * 23),      // Mock review count
      specialties: seller.specialties || [seller.category || 'Kitchen Design', 'Quick Ship'], 
      online: index % 2 === 0,         // Alternate online status
      img: seller.logo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop"
    }))
  } catch (error) {
    console.error('Failed to fetch kitchen partners:', error)
    return []
  }
}
