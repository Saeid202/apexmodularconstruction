'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Architect } from '@/types/database'
import fs from 'fs'
import path from 'path'

const DEV_PROFILES_FILE = path.join(process.cwd(), 'scratch', 'dev_architect_profiles.json')

function getDevProfilesFromFile(): Record<string, any> {
  try {
    if (fs.existsSync(DEV_PROFILES_FILE)) {
      const data = fs.readFileSync(DEV_PROFILES_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error reading dev profiles from file:', err)
  }
  return {}
}

function saveDevProfileToFile(email: string, profile: any) {
  try {
    const profiles = getDevProfilesFromFile()
    profiles[email.toLowerCase()] = profile
    if (profile.subdomain) {
      profiles[`subdomain:${profile.subdomain.toLowerCase()}`] = profile
    }
    const dir = path.dirname(DEV_PROFILES_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DEV_PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing dev profile to file:', err)
  }
}

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
    // Check for developer/bypass cookie first
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const bypassEmail = cookieStore.get('architect_bypass_email')?.value
    if (bypassEmail) {
      // Check file first
      const devProfiles = getDevProfilesFromFile()
      let devProfile = devProfiles[bypassEmail.toLowerCase()]

      if (!devProfile) {
        // Fallback to cookie
        const devProfileStr = cookieStore.get('architect_dev_profile')?.value
        if (devProfileStr) {
          try {
            devProfile = JSON.parse(devProfileStr)
            if (devProfile) {
              saveDevProfileToFile(bypassEmail, devProfile)
            }
          } catch {}
        }
      }

      if (!devProfile) {
        devProfile = {
          id: '00000000-0000-0000-0000-000000000000',
          full_name: bypassEmail.split('@')[0] || 'Architect',
          email: bypassEmail,
          phone: null,
          firm_name: null,
          bio: 'Bypass Dev Profile',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          website: null,
          address: null,
          professional_role: null,
          experience_years: null,
          specialization: null,
          subdomain: 'demo-studio',
          branding: {
            title: 'Apex Architect Studio',
            tagline: 'Premium Modular & Custom Home Designs',
            primaryColor: '#10B981',
            secondaryColor: '#0F172A',
            instagram: 'https://instagram.com',
            linkedin: 'https://linkedin.com',
          },
        }
        // Save initial default dev profile to file
        saveDevProfileToFile(bypassEmail, devProfile)
      }

      return {
        profile: devProfile,
        error: null,
      }
    }

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { profile: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase.from('architects').select('*').eq('id', user.id).single()

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
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const bypass = cookieStore.get('architect_bypass_email')?.value
      if (bypass) {
        // Read existing dev profile
        const devProfiles = getDevProfilesFromFile()
        let devProfile: any = devProfiles[bypass.toLowerCase()]

        if (!devProfile) {
          const existingCookie = cookieStore.get('architect_dev_profile')?.value
          if (existingCookie) {
            try {
              devProfile = JSON.parse(existingCookie)
            } catch {}
          }
        }

        if (!devProfile) {
          devProfile = {
            id: '00000000-0000-0000-0000-000000000000',
            full_name: data.fullName,
            email: bypass,
            phone: data.phone,
            firm_name: data.firmName,
            bio: data.bio || null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            website: data.website || null,
            address: data.address || null,
            professional_role: data.professionalRole || null,
            experience_years: data.experienceYears || null,
            specialization: data.specialization || null,
            subdomain: data.subdomain || 'demo-studio',
            branding: data.branding || {},
          }
        } else {
          devProfile = {
            ...devProfile,
            full_name: data.fullName,
            phone: data.phone,
            firm_name: data.firmName,
            bio: data.bio !== undefined ? data.bio : devProfile.bio,
            website: data.website !== undefined ? data.website : devProfile.website,
            address: data.address !== undefined ? data.address : devProfile.address,
            professional_role: data.professionalRole !== undefined ? data.professionalRole : devProfile.professional_role,
            experience_years: data.experienceYears !== undefined ? data.experienceYears : devProfile.experience_years,
            specialization: data.specialization !== undefined ? data.specialization : devProfile.specialization,
            subdomain: data.subdomain !== undefined ? data.subdomain : devProfile.subdomain,
            branding: data.branding !== undefined ? data.branding : devProfile.branding,
            updated_at: new Date().toISOString(),
          }
        }

        // Save to file
        saveDevProfileToFile(bypass, devProfile)

        // Save to cookie (as fallback)
        cookieStore.set('architect_dev_profile', JSON.stringify(devProfile), {
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: '/',
        })

        return { success: true, error: null }
      }
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('architects')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        firm_name: data.firmName,
        bio: data.bio,
        website: data.website || null,
        address: data.address || null,
        professional_role: data.professionalRole || null,
        experience_years: data.experienceYears || null,
        specialization: data.specialization || null,
        subdomain: data.subdomain !== undefined ? data.subdomain : undefined,
        branding: data.branding !== undefined ? data.branding : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

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
    // Check developer bypass profile from local file first
    try {
      const devProfiles = getDevProfilesFromFile()
      const devProfile = devProfiles[`subdomain:${subdomain.toLowerCase()}`]
      if (devProfile) {
        console.log(`[Dev Bypass File] Resolved profile for subdomain "${subdomain}" from JSON file`)
        return { profile: devProfile, error: null }
      }

      // Check developer bypass profile cookie fallback
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const devProfileStr = cookieStore.get('architect_dev_profile')?.value
      if (devProfileStr) {
        const devProfileParsed = JSON.parse(devProfileStr)
        if (devProfileParsed && devProfileParsed.subdomain === subdomain) {
          console.log(`[Dev Bypass Cookie] Resolved profile for subdomain "${subdomain}" from cookie`)
          return { profile: devProfileParsed, error: null }
        }
      }
    } catch (cookieErr) {
      console.error('Error reading dev profile from file or cookie:', cookieErr)
    }

    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('architects')
      .select('*')
      .eq('subdomain', subdomain)
      .single()

    if (error) {
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
