import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/service'
import { confirmationEmailTemplate } from '@/lib/email/templates'

interface SignupPayload {
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  website?: string
  description?: string
  serviceTypes: string[]
  serviceAreas: string[]
  yearsOfExperience: number
  certifications: Array<{
    name: string
    issuedBy: string
    expiryDate: string
  }>
  primaryLocation: string
  province: string
  address?: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: SignupPayload = await request.json()

    // Validate required fields
    if (
      !payload.companyName ||
      !payload.contactName ||
      !payload.contactEmail ||
      !payload.contactPhone ||
      !payload.password ||
      !payload.primaryLocation ||
      !payload.province ||
      payload.serviceTypes.length === 0 ||
      payload.serviceAreas.length === 0
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // 1. Create user account with 'contractor' role
    const {
      data: { user },
      error: signupError,
    } = await supabase.auth.admin.createUser({
      email: payload.contactEmail,
      password: payload.password,
      email_confirm: false, // Require email verification
    })

    if (signupError || !user) {
      console.error('Signup error:', signupError)
      return NextResponse.json(
        { error: signupError?.message || 'Failed to create user account' },
        { status: 400 }
      )
    }

    // 2. Create profile with 'contractor' role
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: payload.contactEmail,
      full_name: payload.contactName,
      role: 'contractor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Delete user if profile creation fails
      await supabase.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 400 })
    }

    // 3. Create installer/contractor profile
    const { data: installer, error: installerError } = await supabase
      .from('installers')
      .insert({
        user_id: user.id,
        company_name: payload.companyName,
        contact_email: payload.contactEmail,
        contact_phone: payload.contactPhone,
        website: payload.website || null,
        description: payload.description || null,
        service_areas: payload.serviceAreas,
        service_types: payload.serviceTypes,
        experience_years: payload.yearsOfExperience,
        certifications: payload.certifications.map((cert) => ({
          name: cert.name,
          issued_by: cert.issuedBy,
          expiry_date: cert.expiryDate,
        })),
        primary_location: payload.primaryLocation,
        address: payload.address || null,
        status: 'pending', // Requires admin approval
        featured: false,
        average_rating: 0,
        total_reviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (installerError) {
      console.error('Installer error:', installerError)
      // Delete user if installer creation fails
      await supabase.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: 'Failed to create contractor profile' }, { status: 400 })
    }

    // 4. Create contractor approval record
    const { error: approvalError } = await supabase.from('contractor_approvals').insert({
      installer_id: installer.id,
      status: 'pending',
      requested_at: new Date().toISOString(),
    })

    if (approvalError) {
      console.error('Approval record error:', approvalError)
      // Don't fail - approval record is optional
    }

    // 5. Send confirmation email (non-blocking)
    const confirmationHtml = confirmationEmailTemplate(payload.contactName, payload.companyName)
    await sendEmail({
      to: payload.contactEmail,
      subject: 'Welcome to Cargoplus! Your Application is Under Review',
      html: confirmationHtml,
    })

    return NextResponse.json(
      {
        message: 'Contractor application submitted successfully! Pending admin approval.',
        user_id: user.id,
        installer_id: installer.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
