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

export default async function ContractorProfilePage({ params }: { params: { id: string } }) {
  const supabase: SupabaseClient = await createServerClient()

  // Fetch contractor details from profiles table
  const { data: installer, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !installer) {
    redirect('/hire-installers')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-8" style={{ background: 'linear-gradient(135deg, #4B1D8F, #5a2d9f)' }}>
            <h1 className="text-3xl font-bold text-white mb-2">{installer.business_name || installer.full_name}</h1>
            <p className="text-purple-200">{installer.city && installer.province ? `${installer.city}, ${installer.province}` : installer.city || installer.province || 'Location not specified'}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">Email</p>
                <p className="text-gray-900">{installer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">Phone</p>
                <p className="text-gray-900">{installer.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">Location</p>
                <p className="text-gray-900">{installer.city && installer.province ? `${installer.city}, ${installer.province}` : installer.city || installer.province || 'Not provided'}</p>
              </div>
              {installer.website && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase mb-1">Website</p>
                  <p className="text-gray-900">{installer.website}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {installer.service_types && installer.service_types.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {installer.service_types.map((service: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: '#D4AF37' }}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Service Areas */}
          {installer.service_areas && installer.service_areas.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Areas</h2>
              <p className="text-gray-700">{installer.service_areas.join(', ')}</p>
            </div>
          )}

          {/* Experience */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
            <p className="text-gray-700">{installer.years_experience || 0} years in the industry</p>
          </div>

          {/* Certifications */}
          {installer.certifications && installer.certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
              <div className="space-y-3">
                {installer.certifications.map((cert: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">{cert.name}</p>
                    <p className="text-sm text-gray-600">Issued by: {cert.issuedBy}</p>
                    {cert.expiryDate && <p className="text-xs text-gray-500">Expires: {cert.expiryDate}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="pt-6 border-t border-gray-100">
            <a
              href="/hire-installers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#4B1D8F', border: '2px solid #D4AF37' }}
            >
              ← Back to Installers
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
