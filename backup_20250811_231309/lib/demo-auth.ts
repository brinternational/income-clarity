// Demo authentication for development/testing
// This bypasses Supabase for quick testing

import type { User } from '@supabase/supabase-js';
import type { Database } from './database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

// Demo user data
export const DEMO_USER: User = {
  id: 'demo-user-001',
  app_metadata: {},
  user_metadata: {
    name: 'Demo User',
    location: 'Puerto Rico'
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email: 'demo@incomeclarity.app',
  email_confirmed_at: new Date().toISOString(),
  phone: undefined,
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  is_anonymous: false,
  factors: undefined
};

export const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-001',
  email: 'demo@incomeclarity.app',
  full_name: 'Demo User',
  avatar_url: null,
  phone: null,
  date_of_birth: null,
  risk_tolerance: 'moderate',
  financial_goals: {
    annual_income_goal: 50000,
    fire_number: 1500000
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  subscription_tier: 'free',
  subscription_expires_at: null,
  preferences: {
    location: 'Puerto Rico',
    currency: 'USD'
  }
};

export const DEMO_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: DEMO_USER
};

// Check if we're in demo mode
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('demo-mode') === 'true';
}

// Enable demo mode
export function enableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo-mode', 'true');
    localStorage.setItem('demo-user', JSON.stringify(DEMO_USER));
    localStorage.setItem('demo-profile', JSON.stringify(DEMO_PROFILE));
    localStorage.setItem('demo-session', JSON.stringify(DEMO_SESSION));
  }
}

// Disable demo mode
export function disableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-mode');
    localStorage.removeItem('demo-user');
    localStorage.removeItem('demo-profile');
    localStorage.removeItem('demo-session');
  }
}

// Get demo data
export function getDemoData() {
  if (!isDemoMode()) return null;
  
  return {
    user: DEMO_USER,
    profile: DEMO_PROFILE,
    session: DEMO_SESSION
  };
}