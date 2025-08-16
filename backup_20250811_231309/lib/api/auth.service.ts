/**
 * Lite Production Auth Service
 * Simple authentication for single-user Lite Production mode
 * No Supabase, no external dependencies
 */

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface AuthResponse {
  user: User | null
  error: Error | null
}

class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  
  private constructor() {
    // In Lite Production, auto-login as the default user
    if (process.env.LITE_PRODUCTION_MODE === 'true') {
      this.currentUser = {
        id: 'lite-user-1',
        email: 'user@lite.local',
        name: 'Lite User',
        created_at: new Date().toISOString()
      }
    }
  }
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }
  
  async signIn(email: string, password: string): Promise<AuthResponse> {
    // In Lite Production, any login succeeds
    if (process.env.LITE_PRODUCTION_MODE === 'true') {
      this.currentUser = {
        id: 'lite-user-1',
        email: email || 'user@lite.local',
        name: 'Lite User',
        created_at: new Date().toISOString()
      }
      return { user: this.currentUser, error: null }
    }
    
    return { user: null, error: new Error('Auth not configured') }
  }
  
  async signOut(): Promise<void> {
    // In Lite Production, just clear the current user
    this.currentUser = null
  }
  
  async getUser(): Promise<User | null> {
    // In Lite Production, always return the default user
    if (process.env.LITE_PRODUCTION_MODE === 'true' && !this.currentUser) {
      this.currentUser = {
        id: 'lite-user-1',
        email: 'user@lite.local',
        name: 'Lite User',
        created_at: new Date().toISOString()
      }
    }
    return this.currentUser
  }
  
  async getCurrentUser() {
    const user = await this.getUser()
    return { user, error: null }
  }
  
  async getCurrentSession() {
    const user = await this.getUser()
    return { 
      session: user ? { user } : null, 
      error: null 
    }
  }
  
  async updateUser(updates: Partial<User>): Promise<AuthResponse> {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates }
      return { user: this.currentUser, error: null }
    }
    return { user: null, error: new Error('No user logged in') }
  }
  
  async updatePassword(newPassword: string) {
    // In Lite Production, password changes are not persisted
    return { data: { user: this.currentUser }, error: null }
  }
  
  async resetPassword(email: string, redirectTo?: string) {
    // In Lite Production, password reset always succeeds
    return { data: { user: this.currentUser }, error: null }
  }
  
  async updateUserProfile(userId: string, updates: any) {
    // In Lite Production, profile updates are stored in memory only
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = { ...this.currentUser, ...updates }
      return { data: this.currentUser, error: null }
    }
    return { data: null, error: new Error('User not found') }
  }
  
  async getUserProfile(userId: string) {
    if (this.currentUser && this.currentUser.id === userId) {
      return { data: this.currentUser, error: null }
    }
    return { data: null, error: new Error('User not found') }
  }
  
  async createUserProfile(user: any, additionalData?: any) {
    // In Lite Production, just return the current user
    return { data: this.currentUser, error: null }
  }
  
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // In Lite Production, auth state doesn't change
    return {
      data: { subscription: { unsubscribe: () => {} } }
    }
  }
  
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}

export const authService = AuthService.getInstance()
export { AuthService }