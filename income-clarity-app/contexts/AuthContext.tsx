'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  onboarding_completed: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile?: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Clear user state if session is invalid
        setUser(null);
        if (response.status === 401) {
          // Session expired, redirect to login if we're on a protected route
          const currentPath = window.location.pathname;
          const publicRoutes = ['/', '/auth/login', '/auth/signup', '/demo'];
          if (!publicRoutes.includes(currentPath)) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []); // Only run once on mount

  // Set up session refresh every 15 minutes when user is logged in
  useEffect(() => {
    if (!user) return;
    
    const refreshInterval = setInterval(() => {
      checkSession();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, [user?.id, checkSession]); // Only re-run when user ID changes

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshUser = useCallback(async (): Promise<void> => {
    await checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    refreshUser,
    isAuthenticated: !!user && !loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Alias for backward compatibility
export const useAuthContext = useAuth;