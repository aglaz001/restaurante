import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a minimal mock during build so prerendering doesn't crash
    const mockClient = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ error: null }),
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({}),
      }),
      removeChannel: () => {},
    } as unknown as SupabaseClient
    supabaseInstance = mockClient
    return supabaseInstance
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// For direct exports, return a proxy that lazily initializes
// but never throws during build
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})