import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/service'
import { rejectionEmailTemplate } from '@/lib/email/templates'

/**
 * POST /api/admin/contractors/:id/reject
 * Reject a pending contractor
 *
 * Request Body:
 * {
 *   rejectionReason?: string
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
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get contractor
    const { data: installer, error: fetchError } = await supabase
      .from('installers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !installer) {
      return NextResponse.json({ status: 'error', error: 'Contractor not found' }, { status: 404 })
    }

    // Update contractor status
    const { data: updated, error: updateError } = await supabase
      .from('installers')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Reject error:', updateError)
      return NextResponse.json(
        { status: 'error', error: 'Failed to reject contractor' },
        { status: 400 }
      )
    }

    // Update contractor approval record if exists
    const { data: approval } = await supabase
      .from('contractor_approvals')
      .select('id')
      .eq('installer_id', id)
      .single()

    if (approval) {
      await supabase
        .from('contractor_approvals')
        .update({
          status: 'rejected',
          rejection_reason: payload.rejectionReason || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', approval.id)
    }

    // Send rejection email (non-blocking)
    const rejectionHtml = rejectionEmailTemplate(
      installer.contact_name || '',
      installer.company_name,
      payload.rejectionReason
    )
    await sendEmail({
      to: installer.contact_email,
      subject: 'Cargoplus Contractor Application Status',
      html: rejectionHtml,
    })

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

    return NextResponse.json({
      status: 'success',
      message: 'Contractor rejected successfully. Rejection email sent.',
      data: contractor,
    })
  } catch (error) {
    console.error('POST /api/admin/contractors/:id/reject error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
}
