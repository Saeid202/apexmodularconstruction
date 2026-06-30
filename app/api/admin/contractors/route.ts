import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/contractors
 * List all contractors with optional filtering and pagination
 *
 * Query Parameters:
 * - search?: string (search by company name, email, contact name)
 * - status?: "pending" | "approved" | "rejected" | "suspended" | "all"
 * - serviceType?: string
 * - province?: string
 * - experienceLevel?: "all" | "beginner" | "intermediate" | "expert"
 * - featuredOnly?: boolean
 * - ratingMin?: number
 * - sortBy?: "name" | "status" | "rating" | "created"
 * - sortOrder?: "asc" | "desc"
 * - page?: number (1-indexed)
 * - pageSize?: number (default 10)
 *
 * Response Format:
 * {
 *   status: "success" | "error",
 *   data?: {
 *     contractors: Array<Contractor>,
 *     total: number,
 *     page: number,
 *     pageSize: number,
 *     totalPages: number
 *   },
 *   error?: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user and verify admin
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

    // Get query parameters
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status') || 'all'
    const serviceType = url.searchParams.get('serviceType')
    const province = url.searchParams.get('province')
    const experienceLevel = url.searchParams.get('experienceLevel')
    const featuredOnly = url.searchParams.get('featuredOnly') === 'true'
    const ratingMin = parseFloat(url.searchParams.get('ratingMin') || '0')
    const sortBy = url.searchParams.get('sortBy') || 'created'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(100, parseInt(url.searchParams.get('pageSize') || '10'))

    // Start query
    let query = supabase.from('installers').select('*', { count: 'exact' })

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply featured filter
    if (featuredOnly) {
      query = query.eq('featured', true)
    }

    // Apply rating filter
    if (ratingMin > 0) {
      query = query.gte('average_rating', ratingMin)
    }

    // Apply province filter
    if (province) {
      query = query.eq('province', province)
    }

    // Apply service type filter (partial match in array)
    if (serviceType) {
      query = query.contains('service_types', [serviceType])
    }

    // Execute query
    const { data: allInstallers, error: queryError } = await query

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json(
        { status: 'error', error: 'Failed to fetch contractors' },
        { status: 400 }
      )
    }

    // Filter in memory for complex filters
    interface Installer {
      [key: string]: unknown
    }
    let filtered: Installer[] = allInstallers || []

    // Search filter
    if (search) {
      filtered = filtered.filter((installer: Installer) => {
        const name = (installer.company_name as string)?.toLowerCase() || ''
        const email = (installer.contact_email as string)?.toLowerCase() || ''
        const contact = (installer.contact_name as string)?.toLowerCase() || ''
        return name.includes(search) || email.includes(search) || contact.includes(search)
      })
    }

    // Experience level filter
    if (experienceLevel && experienceLevel !== 'all') {
      filtered = filtered.filter((installer: Installer) => {
        const years = (installer.experience_years as number) || 0
        switch (experienceLevel) {
          case 'beginner':
            return years < 5
          case 'intermediate':
            return years >= 5 && years < 10
          case 'expert':
            return years >= 10
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a: Installer, b: Installer) => {
      let aVal: string | number = 0
      let bVal: string | number = 0

      switch (sortBy) {
        case 'name':
          aVal = (a.company_name as string) || ''
          bVal = (b.company_name as string) || ''
          break
        case 'status':
          aVal = (a.status as string) || ''
          bVal = (b.status as string) || ''
          break
        case 'rating':
          aVal = (a.average_rating as number) || 0
          bVal = (b.average_rating as number) || 0
          break
        case 'created':
        default:
          aVal = new Date(a.created_at as string).getTime()
          bVal = new Date(b.created_at as string).getTime()
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      const numA = typeof aVal === 'string' ? 0 : aVal
      const numB = typeof bVal === 'string' ? 0 : bVal
      const result = numA - numB
      return sortOrder === 'asc' ? result : -result
    })

    // Paginate
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const contractors = filtered.slice(start, end)

    // Transform response
    const transformedContractors = contractors.map((installer: any) => ({
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
    }))

    return NextResponse.json({
      status: 'success',
      data: {
        contractors: transformedContractors,
        total,
        page,
        pageSize,
        totalPages,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/contractors error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
}
