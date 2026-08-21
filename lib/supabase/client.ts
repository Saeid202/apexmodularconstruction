import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  if (!client) {
    client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          // Read cookies from document.cookie
          const cookies: { name: string; value: string }[] = []
          if (typeof document !== 'undefined' && document.cookie) {
            document.cookie.split(';').forEach((cookie) => {
              const [name, ...rest] = cookie.trim().split('=')
              if (name && rest.length > 0) {
                cookies.push({ name, value: rest.join('=') })
              }
            })
          }
          return cookies
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookie = `${name}=${value}`
              if (options.maxAge) cookie += `; max-age=${options.maxAge}`
              if (options.path) cookie += `; path=${options.path}`
              if (options.domain) cookie += `; domain=${options.domain}`
              if (options.sameSite) cookie += `; samesite=${options.sameSite}`
              if (options.secure) cookie += '; secure'
              document.cookie = cookie
            })
          } catch {
            // Ignore cookie errors on client
          }
        },
      },
    })

    // Override auth.getUser to be robust against null data on client-side
    const originalGetUser = client.auth.getUser.bind(client.auth)
    client.auth.getUser = async (jwt?: string) => {
      try {
        const res = await originalGetUser(jwt)
        if (!res.data) {
          res.data = { user: null }
        }
        return res
      } catch (err: any) {
        console.error('Browser safe getUser intercepted error:', err)
        return {
          data: { user: null },
          error: err,
        }
      }
    }
  }

  return client
}
