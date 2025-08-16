// Mock authentication for development/testing
// This provides a consistent mock user ID for testing Supabase integration

export const MOCK_USER_ID = '550e8400-e29b-41d4-a716-446655440000'
export const MOCK_USER_EMAIL = 'demo@incomeclarity.app'

export interface MockUser {
  id: string
  email: string
  created_at: string
}

export const getMockUser = (): MockUser => ({
  id: MOCK_USER_ID,
  email: MOCK_USER_EMAIL,
  created_at: new Date().toISOString()
})

/**
 * For testing, we'll use this mock user until real auth is implemented
 * This allows us to test Supabase integration without requiring full auth flow
 */
export const createMockSupabaseSession = async () => {
  // This would normally come from Supabase auth, but for testing we use mock
  return {
    user: getMockUser(),
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: getMockUser()
    }
  }
}