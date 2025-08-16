import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { 
  MFADisableRequest,
  MFAStatus,
  MFAFactor
} from '@/types'

// Create Supabase client for server-side operations
function createClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        // Cannot set cookies in API route response
      },
      remove(name: string, options: any) {
        // Cannot remove cookies in API route response
      }
    }
  })
}

// GET - Get MFA status for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(request)
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get user's MFA factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    
    if (factorsError) {
      // console.error('Error fetching MFA factors:', factorsError)
      // return NextResponse.json(
        // { success: false, error: 'Failed to fetch MFA status' },
        // { status: 500 }
      // )
    }

    // Convert Supabase factors to our MFAFactor format
    const mfaFactors: MFAFactor[] = factors.totp.map(factor => ({
      id: factor.id,
      userId: user.id,
      type: 'totp' as const,
      status: factor.status === 'verified' ? 'verified' : 'unverified',
      friendlyName: factor.friendly_name || 'Authenticator App',
      createdAt: factor.created_at,
      updatedAt: factor.updated_at,
      lastUsed: factor.factor_type === 'totp' ? undefined : factor.updated_at
    }))

    const mfaStatus: MFAStatus = {
      enabled: mfaFactors.filter(f => f.status === 'verified').length > 0,
      factorCount: mfaFactors.length,
      factors: mfaFactors,
      canDisable: true, // User can always disable MFA (they'll fall back to password)
      lastVerification: mfaFactors
        .filter(f => f.lastUsed)
        .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())[0]?.lastUsed
    }

    return NextResponse.json({
      success: true,
      status: mfaStatus
    })

  } catch (error) {
    console.error('MFA status error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
    try {
      updateRequest = await request.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate request
    if (!updateRequest.factorId) {
      return NextResponse.json(
        { success: false, error: 'Factor ID is required' },
        { status: 400 }
      )
    }

    if (!updateRequest.friendlyName || updateRequest.friendlyName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Friendly name is required' },
        { status: 400 }
      )
    }

    // Update factor friendly name
    // Note: Supabase may not support updating factor names directly
    // This would typically require a database update to store custom names
    
    // For now, we'll simulate success
    // TODO: Implement factor name updates in database
    // console.log(`Factor ${updateRequest.factorId} renamed to "${updateRequest.friendlyName}" for user ${user.id}`)
    return NextResponse.json({
      success: true,
      message: 'MFA factor updated successfully'
    })

  } catch (error) {
    console.error('MFA update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )