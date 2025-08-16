/**
 * Lite Production Service Layer
 * Simple data service for Lite Production mode
 * Uses local storage/memory instead of Supabase
 */

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export class SupabaseService {
  private static instance: SupabaseService
  
  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }
  
  async getCurrentUser(): Promise<User | null> {
    // In Lite Production, always return a default user
    if (process.env.LITE_PRODUCTION_MODE === 'true') {
      return {
        id: 'lite-user-1',
        email: 'user@lite.local',
        name: 'Lite User',
        created_at: new Date().toISOString()
      }
    }
    return null
  }
  
  async upsertUserProfile(data: any): Promise<any> {
    // In Lite Production, just return success
    console.log('Lite Production: User profile update (not persisted)', data)
    return {
      data: {
        id: 'lite-user-1',
        email: 'user@lite.local',
        name: 'Lite User',
        ...data,
        created_at: new Date().toISOString()
      },
      error: null
    }
  }
  
  async getUserProfile(userId: string): Promise<any> {
    // In Lite Production, return default profile
    return {
      data: {
        id: userId || 'lite-user-1',
        email: 'user@lite.local',
        name: 'Lite User',
        created_at: new Date().toISOString()
      },
      error: null
    }
  }
}

export const supabaseService = SupabaseService.getInstance()