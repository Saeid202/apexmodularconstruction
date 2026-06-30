import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/contractors/:id
 * Get single contractor details
 *
 * Response Format:
 * {
 *   status: "success" | "error",
 *   data?: {Contractor},
 *   error?: string
 * }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id } = await params

    // Verify admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { status: 'error', error: 'Forbidden - admin access required' },
        { status: 403 }
      )
    }

    // Fetch contractor
    const { data: installer, error: installerError } = await supabase
      .from('installers')
      .select('*')
      .eq('id', id)
      .single()

    if (installerError || !installer) {
      return NextResponse.json({ status: 'error', error: 'Contractor not found' }, { status: 404 })
    }

    const contractor = {
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
      logo: installer.logo,
      adminNotes: installer.admin_notes,
    }

    return NextResponse.json({
      status: 'success',
      data: contractor,
    })
  } catch (error) {
    console.error('GET /api/admin/contractors/:id error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/contractors/:id
 * Update contractor details
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
 *   certifications?: Array,
 *   primaryLocation?: string,
 *   province?: string,
 *   address?: string,
 *   adminNotes?: string
 * }
 *
 * Response: Same as GET
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id } = await params
    const payload = await request.json()

    // Verify admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { status: 'error', error: 'Forbidden - admin access required' },
        { status: 403 }
      )
    }

    // Verify contractor exists
    const { data: existing, error: fetchError } = await supabase
      .from('installers')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ status: 'error', error: 'Contractor not found' }, { status: 404 })
    }

    // Build update object
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
    if (payload.adminNotes !== undefined) updateData.admin_notes = payload.adminNotes

    // Update contractor
    const { data: updated, error: updateError } = await supabase
      .from('installers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { status: 'error', error: 'Failed to update contractor' },
        { status: 400 }
      )
    }

    const contractor = {
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
      logo: updated.logo,
      adminNotes: updated.admin_notes,
    }

    return NextResponse.json({
      status: 'success',
      data: contractor,
    })
  } catch (error) {
    console.error('PUT /api/admin/contractors/:id error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/contractors/:id
 * Delete a contractor
 *
 * Response:
 * {
 *   status: "success" | "error",
 *   message?: string,
 *   error?: string
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { id } = await params

    // Verify admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { status: 'error', error: 'Forbidden - admin access required' },
        { status: 403 }
      )
    }

    // Delete contractor
    const { error: deleteError } = await supabase.from('installers').delete().eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { status: 'error', error: 'Failed to delete contractor' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'Contractor deleted successfully',
    })
  } catch (error) {
    console.error('DELETE /api/admin/contractors/:id error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
}
