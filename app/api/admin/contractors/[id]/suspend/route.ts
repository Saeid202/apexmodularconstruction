import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/contractors/:id/suspend
 * Toggle suspension status of a contractor (suspended/active)
 *
 * Request Body:
 * {
 *   suspended?: boolean (optional - if not provided, toggles current state)
 * }
 *
 * Response:
 * {
 *   status: "success" | "error",
 *   message?: string,
 *   data?: {Contractor},
 *   error?: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { id } = await params
    let payload: { suspended?: boolean } = {}

    try {
      payload = await request.json()
    } catch {
      // No body is okay, we'll toggle
    }

    // Verify admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { status: 'error', error: 'Unauthorized' },
        { status: 401 }
      )
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

    // Get contractor
    const { data: installer, error: fetchError } = await supabase
      .from('installers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !installer) {
      return NextResponse.json(
        { status: 'error', error: 'Contractor not found' },
        { status: 404 }
      )
    }

    // Determine new suspension state
    const currentStatus = installer.status || 'approved'
    const isSuspended = currentStatus === 'suspended'
    const newSuspended = payload.suspended !== undefined ? payload.suspended : !isSuspended

    // Determine new status
    const newStatus = newSuspended ? 'suspended' : 'approved'

    // Update contractor status
    const { data: updated, error: updateError } = await supabase
      .from('installers')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Suspend/activate error:', updateError)
      return NextResponse.json(
        { status: 'error', error: 'Failed to update suspension status' },
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
    }

    const action = newSuspended ? 'suspended' : 'activated'
    return NextResponse.json({
      status: 'success',
      message: `Contractor ${action} successfully`,
      data: contractor,
    })
  } catch (error) {
    console.error('POST /api/admin/contractors/:id/suspend error:', error)
    return NextResponse.json(
      { status: 'error', error: 'Internal server error' },
      { status: 500 }
    )
  }
}
