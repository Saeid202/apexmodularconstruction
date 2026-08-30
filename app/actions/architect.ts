'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Architect } from '@/types/database'
import { hostCandidates } from '@/lib/domains'

export async function registerArchitect(formData: FormData): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    const supabase = await createServerClient()
    const adminClient = createAdminClient()

    if (!adminClient) {
      return { success: false, error: 'Failed to initialize database connection' }
    }

    const fullName = (formData.get('fullName') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const password = formData.get('password') as string
    const phone = (formData.get('phone') as string)?.trim() || null
    const firmName = (formData.get('firmName') as string)?.trim() || null
    const bio = (formData.get('bio') as string)?.trim() || null

    if (!fullName || !email || !password) {
      return { success: false, error: 'Full name, email, and password are required' }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'architect',
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

    const { data: authUserCheck, error: authUserCheckError } =
      await adminClient.auth.admin.getUserById(authData.user.id)

    if (authUserCheckError || !authUserCheck?.user) {
      return {
        success: false,
        error: 'Account creation is still processing. Please try again in a few seconds.',
      }
    }

    const { error: architectError } = await adminClient.from('architects').upsert(
      {
        id: authData.user.id,
        full_name: fullName,
        email,
        phone,
        firm_name: firmName,
        bio,
        status: 'active',
      },
      { onConflict: 'id' }
    )

    if (architectError) {
      return { success: false, error: architectError.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Error registering architect:', err)
    return { success: false, error: 'Failed to register architect' }
  }
}

export async function getArchitectDashboardData(): Promise<{
  profile: Architect | null
  error: string | null
}> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { profile: null, error: 'Not authenticated' }
    }

    let { data, error } = await supabase.from('architects').select('*').eq('id', user.id).single()

    if (error && (error.code === 'PGRST116' || error.message.includes('no rows'))) {
      // 1. Auto-create/ensure profiles row exists
      const { data: profileCheck } = await supabase.from('profiles').select('id').eq('id', user.id).single()
      if (!profileCheck) {
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Architect',
          role: 'architect'
        })
        if (profileErr) console.error('Failed to auto-create profile row:', profileErr)
      } else {
        await supabase.from('profiles').update({ role: 'architect' }).eq('id', user.id)
      }

      // 2. Auto-create architects row
      const defaultProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Architect',
        status: 'active',
        subdomain: user.user_metadata?.subdomain || `studio-${user.id.slice(0, 8)}`,
        branding: {
          title: user.user_metadata?.full_name || 'Architect Studio',
          tagline: 'Apex Authorized Architect Studio',
          primaryColor: '#10B981',
          secondaryColor: '#0F172A',
          layout: []
        }
      }
      const { data: inserted, error: insertError } = await supabase
        .from('architects')
        .insert(defaultProfile)
        .select()
        .single()
      
      if (insertError) {
        console.error('Failed to auto-create architect profile:', insertError)
      } else {
        data = inserted
        error = null
      }
    }

    if (error) {
      return { profile: null, error: error.message }
    }

    return { profile: data, error: null }
  } catch (err) {
    console.error('Error fetching architect dashboard data:', err)
    return { profile: null, error: 'Failed to fetch data' }
  }
}

export async function updateArchitectProfile(data: {
  fullName: string
  phone: string | null
  firmName: string | null
  bio?: string | null
  website?: string | null
  address?: string | null
  professionalRole?: string | null
  experienceYears?: number | null
  specialization?: string | null
  subdomain?: string | null
  branding?: any
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // 1. Ensure profile table exists & matches role
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email || '',
      full_name: data.fullName,
      role: 'architect'
    }, { onConflict: 'id' })

    // 2. Upsert architect details
    const { error } = await supabase
      .from('architects')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: data.fullName,
        phone: data.phone,
        firm_name: data.firmName,
        bio: data.bio || null,
        website: data.website || null,
        address: data.address || null,
        professional_role: data.professionalRole || null,
        experience_years: data.experienceYears || null,
        specialization: data.specialization || null,
        subdomain: data.subdomain !== undefined ? data.subdomain : undefined,
        branding: data.branding !== undefined ? data.branding : undefined,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error updating architect profile:', err)
    return { success: false, error: err.message || 'Failed to update profile' }
  }
}

export async function getArchitectProfileBySubdomain(subdomain: string): Promise<{
  profile: any | null
  error: string | null
}> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('architects')
      .select('*')
      .eq('subdomain', subdomain)
      .single()

    if (error) {
      // Fallback only for the demo studio config if not seeded yet
      if (subdomain === 'demo-studio') {
        return {
          profile: {
            id: '00000000-0000-0000-0000-000000000000',
            full_name: 'Sarah Connor',
            email: 'sarah@apex.com',
            phone: '+1 (555) 019-2834',
            firm_name: 'Sarah Connor Architect Studio',
            bio: 'Designing premium modular homes with high thermal efficiency and sustainable structures.',
            status: 'active',
            website: 'https://connor-architects.com',
            address: '100 Industrial Parkway, Suite A, Toronto, ON',
            professional_role: 'Architect',
            experience_years: 12,
            specialization: 'Modular Construction',
            subdomain: 'demo-studio',
            branding: {
              title: 'Connor Studio',
              tagline: 'Premium Modular Construction & Prefab Designs',
              primaryColor: '#10B981',
              secondaryColor: '#0F172A',
              instagram: 'https://instagram.com',
              linkedin: 'https://linkedin.com',
            }
          },
          error: null
        }
      }
      return { profile: null, error: error.message }
    }
    return { profile: data, error: null }
  } catch (err: any) {
    console.error('Error fetching architect profile by subdomain:', err)
    return { profile: null, error: err.message || 'Failed to fetch profile' }
  }
}

export async function uploadArchitectImage(formData: FormData): Promise<{
  success: boolean
  url: string | null
  error: string | null
}> {
  try {
    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, url: null, error: 'No file provided' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, url: null, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, url: null, error: 'Image must be under 5MB' }
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `architects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const adminClient = createAdminClient()
    if (!adminClient) {
      return { success: false, url: null, error: 'Failed to initialize database connection' }
    }

    const { error } = await adminClient.storage
      .from('cms-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) {
      return { success: false, url: null, error: error.message }
    }

    const { data: urlData } = adminClient.storage.from('cms-images').getPublicUrl(fileName)
    return { success: true, url: urlData.publicUrl, error: null }
  } catch (err: any) {
    console.error('Error uploading architect image:', err)
    return { success: false, url: null, error: err.message || 'Upload failed' }
  }
}

export async function getArchitectProfileByCustomDomain(host: string): Promise<{
  profile: any | null
  error: string | null
}> {
  try {
    const candidates = hostCandidates(host)
    if (candidates.length === 0) {
      return { profile: null, error: 'Invalid host' }
    }

    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('architects')
      .select('*')
      .in('branding->>customDomain', candidates)
      .limit(1)

    if (error) {
      return { profile: null, error: error.message }
    }
    if (!data || data.length === 0) {
      return { profile: null, error: 'No studio found for this domain' }
    }
    return { profile: data[0], error: null }
  } catch (err: any) {
    console.error('Error fetching architect profile by custom domain:', err)
    return { profile: null, error: err.message || 'Failed to fetch profile' }
  }
}
