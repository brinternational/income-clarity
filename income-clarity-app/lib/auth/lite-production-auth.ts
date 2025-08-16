// Lite Production Authentication System
// Simple auth for personal use without Supabase dependency

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthSession {
  user: User;
  session_token: string;
  expires_at: string;
}

// Simple session storage (for Lite Production only)
const SESSION_KEY = 'income_clarity_session';

export class LiteProductionAuth {
  
  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const session = this.getSession();
    if (!session) return false;
    
    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    return now < expiresAt;
  }
  
  // Get current session
  static getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  }
  
  // Get current user
  static getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }
  
  // Simple signup for first user (you)
  static async signup(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For Lite Production, we'll create a simple user without password hashing
      // This is acceptable since it's for personal use only
      
      const user: User = {
        id: 'lite-production-user-001',
        email: email.toLowerCase(),
        name,
        created_at: new Date().toISOString()
      };
      
      // Create session (valid for 30 days)
      const session: AuthSession = {
        user,
        session_token: 'lite-prod-' + Date.now(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Store in localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      // Store user credentials for future logins (simple storage)
      localStorage.setItem('user_credentials', JSON.stringify({
        email: email.toLowerCase(),
        password, // In real production, this would be hashed
        name
      }));
      
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  }
  
  // Simple login 
  static async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check stored credentials
      const storedCreds = localStorage.getItem('user_credentials');
      if (!storedCreds) {
        return { success: false, error: 'No account found. Please sign up first.' };
      }
      
      const { email: storedEmail, password: storedPassword, name } = JSON.parse(storedCreds);
      
      if (email.toLowerCase() !== storedEmail || password !== storedPassword) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Create new session
      const user: User = {
        id: 'lite-production-user-001',
        email: storedEmail,
        name,
        created_at: new Date().toISOString()
      };
      
      const session: AuthSession = {
        user,
        session_token: 'lite-prod-' + Date.now(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }
  
  // Logout
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }
  
  // Check if this is the first time setup
  static isFirstTimeSetup(): boolean {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('user_credentials');
  }
}