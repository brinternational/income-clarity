'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LiteProductionAuth } from '@/lib/auth/lite-production-auth';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirstTimeSetup: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const LiteProductionAuthContext = createContext<AuthContextType | undefined>(undefined);

export function LiteProductionAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const initAuth = () => {
      setLoading(true);
      
      const isFirstTime = LiteProductionAuth.isFirstTimeSetup();
      setIsFirstTimeSetup(isFirstTime);
      
      if (!isFirstTime) {
        const currentUser = LiteProductionAuth.getCurrentUser();
        setUser(currentUser);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await LiteProductionAuth.login(email, password);
    
    if (result.success) {
      const currentUser = LiteProductionAuth.getCurrentUser();
      setUser(currentUser);
      setIsFirstTimeSetup(false);
    }
    
    return result;
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await LiteProductionAuth.signup(email, password, name);
    
    if (result.success) {
      const currentUser = LiteProductionAuth.getCurrentUser();
      setUser(currentUser);
      setIsFirstTimeSetup(false);
    }
    
    return result;
  };

  const logout = () => {
    LiteProductionAuth.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && LiteProductionAuth.isAuthenticated(),
    isFirstTimeSetup,
    login,
    signup,
    logout,
  };

  return (
    <LiteProductionAuthContext.Provider value={value}>
      {children}
    </LiteProductionAuthContext.Provider>
  );
}

export function useLiteProductionAuth() {
  const context = useContext(LiteProductionAuthContext);
  if (context === undefined) {
    throw new Error('useLiteProductionAuth must be used within a LiteProductionAuthProvider');
  }
  return context;
}