import bcryptjs from 'bcryptjs';
import { simpleDB } from '@/lib/database/simple-db';

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class SimpleAuth {
  // Create user account
  static async createUser(email: string, password: string, name?: string): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = simpleDB.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(password, 12);

      // Create user
      const result = simpleDB.createUser(email, passwordHash, name);
      
      // Get created user
      const user = simpleDB.getUserById(result.lastInsertRowid as number);
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        }
      };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  // Login user
  static async loginUser(email: string, password: string): Promise<AuthResult> {
    try {
      // Get user by email
      const user = simpleDB.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValid = await bcryptjs.compare(password, user.password_hash);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Get user by ID
  static getUserById(id: number): User | null {
    try {
      const user = simpleDB.getUserById(id);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Create demo user for testing
  static async createDemoUser(): Promise<AuthResult> {
    const demoEmail = 'test@example.com';
    const demoPassword = 'password123';
    const demoName = 'Demo User';

    // Check if demo user exists
    const existingUser = simpleDB.getUserByEmail(demoEmail);
    if (existingUser) {
      return {
        success: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          created_at: existingUser.created_at
        }
      };
    }

    // Create demo user
    return this.createUser(demoEmail, demoPassword, demoName);
  }
}

export default SimpleAuth;