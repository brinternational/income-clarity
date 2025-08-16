import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from './config/local-mode'
import { createOfflineMockClient } from './supabase-client'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client for use in React components
export const createClientComponentClient = () => {
  // FORCE LOCAL_MODE check - ensure no network calls in LOCAL_MODE
  const isLocalMode = LocalModeUtils.isEnabled()
  
  // console.log('🔧 SUPABASE CLIENT (LEGACY) CREATION:', {
    // LOCAL_MODE_ENABLED: isLocalMode,
    // NEXT_PUBLIC_LOCAL_MODE: process.env.NEXT_PUBLIC_LOCAL_MODE,
    // LOCAL_MODE: process.env.LOCAL_MODE,
    // hasWindow: typeof window !== 'undefined'
  })
  
  if (isLocalMode) {
    // console.log('🏠 LOCAL_MODE: Legacy Supabase client bypassed - using offline mock client')
    // LocalModeUtils.log('Supabase Main Client - LOCAL_MODE: Using pure offline mock client');
    return createOfflineMockClient<Database>()
  }
  
  // Check if we have valid Supabase configuration or should use mock
  const isValidUrl = supabaseUrl && 
                    supabaseUrl !== 'your_supabase_project_url' && 
                    supabaseUrl.startsWith('https://') && 
                    supabaseUrl.includes('.supabase.co')
                    
  const url = isValidUrl ? supabaseUrl : 'https://mock.supabase.co'
  const key = (isValidUrl && supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key') 
              ? supabaseAnonKey 
              : 'mock-key'
  
  return createBrowserClient<Database>(url, key)
}

// Real-time configuration
export const realtimeConfig = {
  heartbeat: {
    intervalMs: 30000
  },
  reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000)
}

// Auth configuration
export const authConfig = {
  // Auth providers configuration
  providers: {
    google: {
      enabled: true,
      scopes: 'openid email profile'
    },
    github: {
      enabled: true,
      scopes: 'user:email'
    },
    apple: {
      enabled: true,
      scopes: 'name email'
    }
  },
  // Magic link configuration
  magicLink: {
    enabled: true,
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  },
  // Session configuration
  session: {
    expiresIn: 3600, // 1 hour
    refreshThreshold: 600 // 10 minutes before expiry
  }
}

export type SupabaseClient = ReturnType<typeof createClientComponentClient>