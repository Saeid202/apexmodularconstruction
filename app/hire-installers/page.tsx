import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import HireInstallersClient from './HireInstallersClient'

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

export default async function HireInstallersPage() {
  const supabase: SupabaseClient = await createServerClient()

  // Fetch all contractors from profiles table with contractor role
  const { data: contractors, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'contractor')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contractors:', error)
  }

  return <HireInstallersClient installers={contractors || []} />
}
