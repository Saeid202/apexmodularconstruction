import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null as any
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a no-op client during build time when env vars aren't available
    return null as any
  }

  const cookieStore = await cookies()

  const client = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  // Override auth.getUser to be robust against null data and invalid refresh tokens
  const originalGetUser = client.auth.getUser.bind(client.auth)
  client.auth.getUser = async (jwt?: string) => {
    try {
      const res = await originalGetUser(jwt)
      
      // If error indicates an invalid/missing refresh token, try to clear the cookies
      if (res.error?.message?.toLowerCase().includes('refresh token')) {
        try {
          const allCookies = cookieStore.getAll()
          allCookies.forEach((c) => {
            if (c.name.startsWith('sb-') || c.name.includes('auth-token')) {
              cookieStore.delete(c.name)
            }
          })
        } catch {
          // Ignore write errors in read-only contexts like Server Components
        }
      }
      
      // Ensure res.data is never null/undefined to prevent destructuring crashes
      if (!res.data) {
        res.data = { user: null }
      }
      
      return res
    } catch (err: any) {
      console.error('Safe getUser intercepted error:', err)
      return {
        data: { user: null },
        error: err,
      }
    }
  }

  return client
}
