'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import fs from 'fs'
import path from 'path'

const DEV_PROFILES_FILE = path.join(process.cwd(), 'scratch', 'dev_affiliate_profiles.json')

function getDevProfilesFromFile(): Record<string, any> {
  try {
    if (fs.existsSync(DEV_PROFILES_FILE)) {
      const data = fs.readFileSync(DEV_PROFILES_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error reading dev affiliate profiles from file:', err)
  }
  return {}
}

function saveDevProfileToFile(email: string, profile: any) {
  try {
    const profiles = getDevProfilesFromFile()
    profiles[email.toLowerCase()] = profile
    const dir = path.dirname(DEV_PROFILES_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DEV_PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing dev affiliate profile to file:', err)
  }
}

export async function registerAffiliate(formData: FormData): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    const supabase = await createServerClient()
    const adminClient = createAdminClient()

    const fullName = (formData.get('fullName') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const password = formData.get('password') as string
    const phone = (formData.get('phone') as string)?.trim() || null
    const companyName = (formData.get('companyName') as string)?.trim() || null

    if (!fullName || !email || !password) {
      return { success: false, error: 'Full name, email, and password are required' }
    }

    const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const referralCode = `${cleanName}${Math.floor(100 + Math.random() * 900)}`
    const couponCode = `APEX-${cleanName.toUpperCase()}`

    // 1. Check if Supabase client is available or in development bypass mode
    if (!adminClient) {
      // Local dev fallback
      const mockUser = {
        id: 'mock-affiliate-' + Math.random().toString(36).substr(2, 9),
        full_name: fullName,
        email: email,
        phone: phone,
        company_name: companyName,
        referral_code: referralCode,
        coupon_code: couponCode,
        total_earned: 0.00,
        available_balance: 0.00,
        total_sales: 0.00,
        total_orders: 0,
        partner_level: 'Bronze',
        partner_rank: 'Newcomer',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      saveDevProfileToFile(email, mockUser)
      return { success: true, error: null }
    }

    // 2. Real Supabase SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'affiliate',
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create account' }
    }

    const identities = authData.user.identities ?? []
    if (identities.length === 0) {
      return { success: false, error: 'This email is already registered. Please log in instead.' }
    }

    // 3. Ensure auth metadata is updated
    await adminClient.auth.admin.updateUserById(authData.user.id, {
      user_metadata: { role: 'affiliate', full_name: fullName }
    })

    // 4. Update Profiles Table
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ role: 'affiliate' })
      .eq('id', authData.user.id)

    // 5. Insert into Affiliates Table
    const { error: affiliateError } = await adminClient.from('affiliates').insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      phone,
      company_name: companyName,
      referral_code: referralCode,
      coupon_code: couponCode,
      total_earned: 0.00,
      available_balance: 0.00,
      total_sales: 0.00,
      total_orders: 0,
      partner_level: 'Bronze',
      partner_rank: 'Newcomer',
      status: 'active',
    })

    if (affiliateError) {
      console.error('Error inserting into affiliates:', affiliateError)
      return { success: false, error: affiliateError.message }
    }

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error registering affiliate:', err)
    return { success: false, error: err.message || 'Failed to register affiliate' }
  }
}

export async function getAffiliateDashboardData(): Promise<{
  profile: any | null
  error: string | null
}> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const bypassEmail = cookieStore.get('affiliate_bypass_email')?.value

    // If development bypass cookie exists
    if (bypassEmail) {
      const devProfiles = getDevProfilesFromFile()
      let devProfile = devProfiles[bypassEmail.toLowerCase()]

      if (!devProfile) {
        // Build mock dev profile with some seed data
        const cleanEmail = bypassEmail.split('@')[0] || 'Affiliate'
        const referralCode = `${cleanEmail.toLowerCase()}777`
        const couponCode = `APEX-${cleanEmail.toUpperCase()}`

        devProfile = {
          id: '00000000-0000-0000-0000-000000000000',
          full_name: bypassEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Apex Partner',
          email: bypassEmail,
          phone: '+1 (416) 555-0199',
          company_name: 'Apex Growth Marketing',
          referral_code: referralCode,
          coupon_code: couponCode,
          total_earned: 1250.00,
          available_balance: 450.00,
          total_sales: 12500.00,
          total_orders: 15,
          partner_level: 'Bronze',
          partner_rank: 'Newcomer',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        saveDevProfileToFile(bypassEmail, devProfile)
      }
      return { profile: devProfile, error: null }
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { profile: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return { profile: null, error: error.message }
    }

    return { profile: data, error: null }
  } catch (err: any) {
    console.error('Error fetching affiliate data:', err)
    return { profile: null, error: err.message || 'Failed to fetch data' }
  }
}

export async function updateAffiliateProfile(data: {
  fullName: string
  phone: string | null
  companyName: string | null
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const bypass = cookieStore.get('affiliate_bypass_email')?.value

    if (bypass) {
      const devProfiles = getDevProfilesFromFile()
      const devProfile = devProfiles[bypass.toLowerCase()]

      if (devProfile) {
        devProfile.full_name = data.fullName
        devProfile.phone = data.phone
        devProfile.company_name = data.companyName
        devProfile.updated_at = new Date().toISOString()
        saveDevProfileToFile(bypass, devProfile)
      }
      return { success: true, error: null }
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('affiliates')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        company_name: data.companyName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error updating affiliate profile:', err)
    return { success: false, error: err.message || 'Failed to update profile' }
  }
}

export async function getAffiliateCommissions(): Promise<{
  commissions: any[]
  error: string | null
}> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const bypass = cookieStore.get('affiliate_bypass_email')?.value

    if (bypass) {
      // Mock commissions history
      const mockCommissions = [
        {
          id: 'c1',
          customer_name: 'John Miller',
          product_name: 'Elite Modular Cabin A-15',
          sale_amount: 45000.00,
          commission_amount: 2250.00,
          status: 'paid',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'c2',
          customer_name: 'Sarah Jenkins',
          product_name: 'Modern Garden Suite ADU',
          sale_amount: 68000.00,
          commission_amount: 3400.00,
          status: 'pending',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'c3',
          customer_name: 'Robert Chen',
          product_name: 'Custom Window Set (Premium)',
          sale_amount: 8500.00,
          commission_amount: 425.00,
          status: 'pending',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ]
      return { commissions: mockCommissions, error: null }
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { commissions: [], error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { commissions: [], error: error.message }
    }

    return { commissions: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching affiliate commissions:', err)
    return { commissions: [], error: err.message || 'Failed to fetch commissions' }
  }
}

export async function requestAffiliatePayout(data: {
  amount: number
  method: string
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const bypass = cookieStore.get('affiliate_bypass_email')?.value

    if (bypass) {
      const devProfiles = getDevProfilesFromFile()
      const devProfile = devProfiles[bypass.toLowerCase()]

      if (devProfile) {
        if (devProfile.available_balance < data.amount) {
          return { success: false, error: 'Insufficient balance' }
        }
        devProfile.available_balance = parseFloat((devProfile.available_balance - data.amount).toFixed(2))
        devProfile.updated_at = new Date().toISOString()
        saveDevProfileToFile(bypass, devProfile)
      }
      return { success: true, error: null }
    }

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // 1. Fetch available balance
    const { data: profile, error: profileErr } = await supabase
      .from('affiliates')
      .select('available_balance')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return { success: false, error: 'Affiliate profile not found' }
    }

    if (profile.available_balance < data.amount) {
      return { success: false, error: 'Insufficient available balance' }
    }

    // 2. Insert payout request
    const { error: payoutErr } = await supabase
      .from('affiliate_payouts')
      .insert({
        affiliate_id: user.id,
        amount: data.amount,
        payout_method: data.method,
        status: 'pending'
      })

    if (payoutErr) {
      return { success: false, error: payoutErr.message }
    }

    // 3. Deduct available balance
    const newBalance = parseFloat((profile.available_balance - data.amount).toFixed(2))
    const { error: balanceErr } = await supabase
      .from('affiliates')
      .update({ available_balance: newBalance })
      .eq('id', user.id)

    if (balanceErr) {
      return { success: false, error: balanceErr.message }
    }

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error requesting payout:', err)
    return { success: false, error: err.message || 'Failed to submit request' }
  }
}

export interface AffiliateProduct {
  id: string
  name: string
  slug: string
  price: number
  price_type: string
  description: string | null
  image_url: string | null
  category: { name: string; slug: string } | null
  affiliate_enabled: boolean
  affiliate_commission_type: 'percentage' | 'fixed_amount'
  affiliate_commission_value: number
}

const mockProducts: AffiliateProduct[] = [
  {
    id: 'm1',
    name: '120m² Modular Villa',
    slug: '120m2-modular-villa',
    price: 100000.00,
    price_type: 'unit',
    description: 'Luxury 3-bedroom modular villa featuring open-concept layout, floor-to-ceiling windows, premium insulation, and high-end finishes. Ideal for modern families looking for sustainable and fast construction.',
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
    category: { name: 'Prefabricated Houses', slug: 'pre-fabricated' },
    affiliate_enabled: true,
    affiliate_commission_type: 'fixed_amount',
    affiliate_commission_value: 5000.00
  },
  {
    id: 'm2',
    name: 'Modern Garden Suite ADU',
    slug: 'modern-garden-suite',
    price: 68000.00,
    price_type: 'unit',
    description: 'Chic backyard accessory dwelling unit (ADU). Fully equipped studio space with kitchenette, luxury bath, and heating. Perfect for a home office, guest suite, or rental property.',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    category: { name: 'Prefabricated Houses', slug: 'pre-fabricated' },
    affiliate_enabled: true,
    affiliate_commission_type: 'percentage',
    affiliate_commission_value: 5.00
  },
  {
    id: 'm3',
    name: 'Smart Automation Hub Pro',
    slug: 'smart-automation-hub',
    price: 1200.00,
    price_type: 'unit',
    description: 'Next-generation industrial-grade home automation hub with integrated AI. Controls lighting, HVAC, solar storage, security, and robotic appliances.',
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    category: { name: 'Robots', slug: 'robots' },
    affiliate_enabled: true,
    affiliate_commission_type: 'percentage',
    affiliate_commission_value: 8.00
  }
]

export async function getAffiliateProducts(): Promise<{
  products: AffiliateProduct[]
  error: string | null
}> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const bypass = cookieStore.get('affiliate_bypass_email')?.value

    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        price_type,
        description,
        affiliate_enabled,
        affiliate_commission_type,
        affiliate_commission_value,
        product_images (url, is_master),
        categories (name, slug)
      `)
      .eq('affiliate_enabled', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching affiliate products from db:', error)
      return { products: bypass ? mockProducts : [], error: error.message }
    }

    if (!data || data.length === 0) {
      return { products: bypass ? mockProducts : [], error: null }
    }

    const mapped: AffiliateProduct[] = data.map((p: any) => {
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
        category: p.categories ? { name: p.categories.name, slug: p.categories.slug } : null,
        affiliate_enabled: p.affiliate_enabled,
        affiliate_commission_type: p.affiliate_commission_type,
        affiliate_commission_value: Number(p.affiliate_commission_value)
      }
    })

    return { products: mapped, error: null }
  } catch (err: any) {
    console.error('Failed to get affiliate products:', err)
    let isBypass = false
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      isBypass = !!cookieStore.get('affiliate_bypass_email')?.value
    } catch (_) {}
    return { products: isBypass ? mockProducts : [], error: err.message || 'Failed to fetch products' }
  }
}
