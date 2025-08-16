import { createServerComponentClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>
}) {
  const params = await searchParams;
  const supabase = await createServerComponentClient()

  // Handle auth callback
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    
    if (!error) {
      // Successful authentication - redirect to dashboard
      redirect('/dashboard')
    } else {
      // console.error('Auth callback error:', error)
      // Redirect to login with error
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Handle OAuth errors
  if (params.error) {
    // console.error('OAuth error:', params.error, params.error_description)
    // redirect(`/auth/login?error=${encodeURIComponent(params.error_description || params.error)}`)
  }

  // If no code or error, redirect to login
  redirect('/auth' + '/login')
}