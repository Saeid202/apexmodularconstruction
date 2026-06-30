import { redirect } from 'next/navigation'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const createServerClient = async () => {
  const cookieStore = await cookies()
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export default async function ContractorDashboardPage() {
  const supabase: SupabaseClient = await createServerClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has contractor role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Verify authorization - allow contractors and admins
  if (profileError || !profile || (profile.role !== 'contractor' && profile.role !== 'admin')) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#4B1D8F] via-[#5a2d9f] to-[#3a1470] text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-purple-100">
          {profile.full_name || user.email}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Profile</h3>
          <p className="text-sm text-gray-600 mb-4">Update your personal information and company details</p>
          <a
            href="/contractor/profile"
            className="inline-flex items-center text-sm font-semibold text-[#4B1D8F] hover:text-[#3a1570]"
          >
            Manage Profile →
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Business Scope</h3>
          <p className="text-sm text-gray-600 mb-4">Manage your services, certifications, and service areas</p>
          <a
            href="/contractor/business-scope"
            className="inline-flex items-center text-sm font-semibold text-[#4B1D8F] hover:text-[#3a1570]"
          >
            Manage Business Scope →
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
          <p className="text-sm text-gray-600 mb-4">Manage your account settings and password</p>
          <a
            href="/contractor/settings"
            className="inline-flex items-center text-sm font-semibold text-[#4B1D8F] hover:text-[#3a1570]"
          >
            Manage Settings →
          </a>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Full Name</p>
            <p className="text-gray-900 font-semibold">{profile.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Email</p>
            <p className="text-gray-900 font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Role</p>
            <p className="text-gray-900 font-semibold capitalize">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
