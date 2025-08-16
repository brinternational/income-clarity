import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from './database.types'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from './config/local-mode'
import { createOfflineMockClient } from './supabase-client'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Server-side Supabase client for use in Server Components and Route Handlers
export const createServerComponentClient = async () => {
  // LOCAL_MODE: Return offline mock client immediately - NO network calls
  if (LocalModeUtils.isEnabled()) {
    LocalModeUtils.log('Server Component Client - LOCAL_MODE: Using pure offline mock client');
    return createOfflineMockClient<Database>()
  }
  
  const cookieStore = await cookies()
  const url = supabaseUrl || 'https://mock.supabase.co'
  const key = supabaseAnonKey || 'mock-key'
  
  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Middleware client for use in middleware.ts
export const createMiddlewareClient = (
  request: NextRequest
) => {
  // LOCAL_MODE: Return offline mock client immediately - NO network calls
  if (LocalModeUtils.isEnabled()) {
    LocalModeUtils.log('Middleware Client - LOCAL_MODE: Using pure offline mock client');
    return createOfflineMockClient<Database>()
  }
  
  const url = supabaseUrl || 'https://mock.supabase.co'
  const key = supabaseAnonKey || 'mock-key'
  
  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          const updatedResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            updatedResponse.cookies.set(name, value, options)
          })
          // Note: Supabase SSR expects void return, but we can't return the response here
          // The response handling is done elsewhere in the middleware
        },
      },
    }
  )
}

// Service role client for admin operations (server-side only)
export const createServiceRoleClient = () => {
  // LOCAL_MODE: Return offline mock client immediately - NO network calls
  if (LocalModeUtils.isEnabled()) {
    LocalModeUtils.log('Service Role Client - LOCAL_MODE: Using pure offline mock client');
    return createOfflineMockClient<Database>()
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = supabaseUrl || 'https://mock.supabase.co'
  
  if (!serviceRoleKey) {
    // console.warn('Missing SUPABASE_SERVICE_ROLE_KEY environment variable - using mock')
    // return createClient<Database>(url, 'mock-service-key', {
      // auth: {
        // autoRefreshToken: false,
        // persistSession: false
      }
    })
  }
  
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}