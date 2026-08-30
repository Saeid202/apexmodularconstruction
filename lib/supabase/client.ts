import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

// Use globalThis to persist client across HMR in development to prevent duplicate client initialization
const globalForSupabase = globalThis as unknown as {
  supabaseClient: ReturnType<typeof createSupabaseBrowserClient> | undefined
}

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  let client = globalForSupabase.supabaseClient

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

    globalForSupabase.supabaseClient = client
  }

  // Override auth.getUser only if it hasn't been overridden yet to avoid recursive infinite calls on HMR
  if (client && !(client.auth.getUser as any).__isOverridden) {
    const originalGetUser = client.auth.getUser.bind(client.auth)
    const overriddenGetUser = async (jwt?: string) => {
      try {
        const res = await originalGetUser(jwt)
        if (!res.data) {
          res.data = { user: null }
        }
        return res
      } catch (err: any) {
        const msg = err?.message || ''
        if (msg.includes('released because another request stole it') || msg.includes('Lock') || msg.includes('lock')) {
          // Gracefully handle concurrent lock theft issues (e.g. from React Strict Mode in dev)
          return {
            data: { user: null },
            error: null,
          }
        }
        console.error('Browser safe getUser intercepted error:', err)
        return {
          data: { user: null },
          error: err,
        }
      }
    }
    ;(overriddenGetUser as any).__isOverridden = true
    client.auth.getUser = overriddenGetUser
  }

  return client
}
