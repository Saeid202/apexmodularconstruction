import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/contractor/profile
 * Fetch current contractor's profile data
 *
 * Response Format:
 * {
 *   status: "success" | "error",
 *   data?: {
 *     id: string,
 *     companyName: string,
 *     contactName: string,
 *     contactEmail: string,
 *     contactPhone: string,
 *     website?: string,
 *     description?: string,
 *     serviceTypes: string[],
 *     serviceAreas: string[],
 *     yearsExperience: number,
 *     certifications: Array<{name, issuedBy, expiryDate}>,
 *     primaryLocation: string,
 *     province: string,
 *     address?: string,
 *     status: "pending" | "approved" | "rejected" | "suspended",
 *     featured: boolean,
 *     averageRating: number,
 *     totalReviews: number,
 *     createdAt: string,
 *     approvedAt?: string
 *   },
 *   error?: string
 * }
 */
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { status: 'error', error: 'Unauthorized - no user session' },
        { status: 401 }
      )
    }

    // Verify user is a contractor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { status: 'error', error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (profile.role !== 'contractor') {
      return NextResponse.json(
        { status: 'error', error: 'Forbidden - user is not a contractor' },
        { status: 403 }
      )
    }

    // Fetch contractor's installer profile
    const { data: installer, error: installerError } = await supabase
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (installerError || !installer) {
      return NextResponse.json(
        { status: 'error', error: 'Contractor profile not found' },
        { status: 404 }
      )
    }

    // Transform response to match expected format
    const contractorData = {
      id: installer.id,
      companyName: installer.company_name,
      contactName: installer.contact_name || '',
      contactEmail: installer.contact_email,
      contactPhone: installer.contact_phone,
      website: installer.website,
      description: installer.description,
      serviceTypes: installer.service_types || [],
      serviceAreas: installer.service_areas || [],
      yearsExperience: installer.experience_years || 0,
      certifications: installer.certifications || [],
      primaryLocation: installer.primary_location,
      province: installer.province || '',
      address: installer.address,
      status: installer.status || 'pending',
      featured: installer.featured || false,
      averageRating: installer.average_rating || 0,
      totalReviews: installer.total_reviews || 0,
      createdAt: installer.created_at,
      approvedAt: installer.approved_at,
    }

    return NextResponse.json({
      status: 'success',
      data: contractorData,
    })
  } catch (error) {
    console.error('GET /api/contractor/profile error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/contractor/profile
 * Update contractor's profile data
 *
 * Request Body:
 * {
 *   companyName?: string,
 *   contactName?: string,
 *   contactPhone?: string,
 *   website?: string,
 *   description?: string,
 *   serviceTypes?: string[],
 *   serviceAreas?: string[],
 *   yearsExperience?: number,
 *   certifications?: Array<{name, issuedBy, expiryDate}>,
 *   primaryLocation?: string,
 *   province?: string,
 *   address?: string
 * }
 *
 * Response: Same as GET
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const payload = await request.json()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { status: 'error', error: 'Unauthorized - no user session' },
        { status: 401 }
      )
    }

    // Verify user is a contractor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { status: 'error', error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (profile.role !== 'contractor') {
      return NextResponse.json(
        { status: 'error', error: 'Forbidden - user is not a contractor' },
        { status: 403 }
      )
    }

    // Get contractor's installer profile
    const { data: installer, error: fetchError } = await supabase
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !installer) {
      return NextResponse.json(
        { status: 'error', error: 'Contractor profile not found' },
        { status: 404 }
      )
    }

    // Build update object - only include provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (payload.companyName !== undefined) updateData.company_name = payload.companyName
    if (payload.contactName !== undefined) updateData.contact_name = payload.contactName
    if (payload.contactPhone !== undefined) updateData.contact_phone = payload.contactPhone
    if (payload.website !== undefined) updateData.website = payload.website
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.serviceTypes !== undefined) updateData.service_types = payload.serviceTypes
    if (payload.serviceAreas !== undefined) updateData.service_areas = payload.serviceAreas
    if (payload.yearsExperience !== undefined) updateData.experience_years = payload.yearsExperience
    if (payload.certifications !== undefined) updateData.certifications = payload.certifications
    if (payload.primaryLocation !== undefined) updateData.primary_location = payload.primaryLocation
    if (payload.province !== undefined) updateData.province = payload.province
    if (payload.address !== undefined) updateData.address = payload.address

    // Update contractor profile
    const { data: updated, error: updateError } = await supabase
      .from('installers')
      .update(updateData)
      .eq('id', installer.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { status: 'error', error: 'Failed to update profile' },
        { status: 400 }
      )
    }

    // Transform response
    const contractorData = {
      id: updated.id,
      companyName: updated.company_name,
      contactName: updated.contact_name || '',
      contactEmail: updated.contact_email,
      contactPhone: updated.contact_phone,
      website: updated.website,
      description: updated.description,
      serviceTypes: updated.service_types || [],
      serviceAreas: updated.service_areas || [],
      yearsExperience: updated.experience_years || 0,
      certifications: updated.certifications || [],
      primaryLocation: updated.primary_location,
      province: updated.province || '',
      address: updated.address,
      status: updated.status || 'pending',
      featured: updated.featured || false,
      averageRating: updated.average_rating || 0,
      totalReviews: updated.total_reviews || 0,
      createdAt: updated.created_at,
      approvedAt: updated.approved_at,
    }

    return NextResponse.json({
      status: 'success',
      data: contractorData,
    })
  } catch (error) {
    console.error('PUT /api/contractor/profile error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
}
