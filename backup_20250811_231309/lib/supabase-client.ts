/**
 * Lite Production Client Stub
 * Minimal implementation for Lite Production mode
 * No actual Supabase connection
 */

// Stub client for Lite Production
class LiteClient {
  auth = {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null })
  }
  
  from(table: string) {
    return {
      select: () => this,
      insert: () => this,
      update: () => this,
      delete: () => this,
      eq: () => this,
      single: () => Promise.resolve({ data: null, error: null }),
      data: null,
      error: null
    }
  }
}

export const createClientComponentClient = () => {
  console.log('Running in Lite Production mode - no Supabase connection')
  return new LiteClient()
}

export const createRouteHandlerClient = () => {
  return createClientComponentClient()
}

export const createBrowserClient = () => {
  return createClientComponentClient()
}

const supabase = createClientComponentClient()
export default supabase