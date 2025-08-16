/**
 * Session Validation Middleware
 * Validates and manages user sessions with security checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { jwtVerify, SignJWT } from 'jose'
import { randomUUID } from 'crypto'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from '../config/local-mode'

export interface SessionData {
  userId: string
  email: string
  sessionId: string
  createdAt: number
  expiresAt: number
  mfaVerified: boolean
  ipAddress?: string
  userAgent?: string
}

export interface ValidationResult {
  valid: boolean
  session?: SessionData
  error?: string
  requiresMFA?: boolean
}

export class SessionValidator {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private static readonly MFA_SESSION_DURATION = 4 * 60 * 60 * 1000 // 4 hours for MFA sessions
  private static readonly MAX_SESSION_IDLE = 30 * 60 * 1000 // 30 minutes idle timeout
  private static readonly SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-in-production'
  
  // Track active sessions in memory (in production, use Redis)
  private static activeSessions = new Map<string, {
    lastActivity: number
    ipAddress: string
    userAgent: string
  }>()

  /**
   * Create Supabase client for session validation
   */
  private static createClient(request: NextRequest) {
    // LOCAL_MODE: Skip all Supabase client creation
    if (LocalModeUtils.isEnabled()) {
      LocalModeUtils.log('Session Validation - LOCAL_MODE: Skipping Supabase client creation')
      return null
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Check if we're in mock mode or local development
    const isMockMode = !supabaseUrl || 
                      supabaseUrl === 'https://mock.supabase.co' ||
                      supabaseUrl === 'your_supabase_project_url' ||
                      supabaseUrl === 'http://localhost:54321' ||
                      supabaseUrl.includes('localhost')
    
    if (isMockMode) {
      return null // Return null for mock mode - we'll handle this in validation
    }
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {}, // Cannot set cookies in middleware
        remove() {} // Cannot remove cookies in middleware
      }
    })
  }

  /**
   * Validate session from request
   */
  static async validateSession(request: NextRequest): Promise<ValidationResult> {
    try {
      // Get session token from cookie or authorization header
      const sessionToken = request.cookies.get('session-token')?.value ||
                          request.headers.get('Authorization')?.replace('Bearer ', '')
      
      if (!sessionToken) {
        return { valid: false, error: 'No session token provided' }
      }

      // Verify JWT token
      const secret = new TextEncoder().encode(this.SESSION_SECRET)
      let payload: any
      
      try {
        const verified = await jwtVerify(sessionToken, secret)
        payload = verified.payload
      } catch (error) {
        return { valid: false, error: 'Invalid session token' }
      }

      // Check token expiration
      if (payload.expiresAt < Date.now()) {
        return { valid: false, error: 'Session expired' }
      }

      // Create session data
      const session: SessionData = {
        userId: payload.userId,
        email: payload.email,
        sessionId: payload.sessionId,
        createdAt: payload.createdAt,
        expiresAt: payload.expiresAt,
        mfaVerified: payload.mfaVerified || false,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent
      }

      // Check for session hijacking
      const currentIp = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') ||
                        request.headers.get('cf-connecting-ip') || 'unknown'
      const currentUserAgent = request.headers.get('user-agent')
      
      if (session.ipAddress && session.ipAddress !== currentIp) {
        // console.warn(`Possible session hijacking detected for user ${session.userId}`)
        // In production, trigger security alert
      }

      // Check idle timeout
      const activeSession = this.activeSessions.get(session.sessionId)
      if (activeSession) {
        const idleTime = Date.now() - activeSession.lastActivity
        if (idleTime > this.MAX_SESSION_IDLE) {
          this.activeSessions.delete(session.sessionId)
          return { valid: false, error: 'Session idle timeout' }
        }
      }

      // Update last activity
      this.activeSessions.set(session.sessionId, {
        lastActivity: Date.now(),
        ipAddress: currentIp || '',
        userAgent: currentUserAgent || ''
      })

      // Validate with Supabase (skip if in mock mode)
      const supabase = this.createClient(request)
      
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user || user.id !== session.userId) {
          return { valid: false, error: 'Session validation failed' }
        }

        // Check if MFA is required but not verified
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const hasMFA = factors && factors.totp.length > 0
        
        if (hasMFA && !session.mfaVerified) {
          return { 
            valid: false, 
            session,
            requiresMFA: true,
            error: 'MFA verification required' 
          }
        }
      }
      // If supabase is null (mock mode), skip Supabase validation

      return { valid: true, session }
      
    } catch (error) {
      // console.error('Session validation error:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })