/**
 * Enhanced Authentication Middleware
 * Provides comprehensive authentication and authorization protection
 * for the Income Clarity application
 */

import { NextRequest, NextResponse } from 'next/server'
import { SessionValidator, ValidationResult } from './session-validation'
import { RateLimitService } from './rate-limit'
import { InputSanitizer } from './input-sanitizer'
import crypto from 'crypto'

export interface AuthConfig {
  requireAuth: boolean
  requireMFA: boolean
  allowedRoles?: string[]
  rateLimit?: {
    requests: number
    window: string
  }
  csrfProtection?: boolean
  contentValidation?: boolean
}

export interface SecurityEvent {
  type: 'auth_success' | 'auth_failure' | 'rate_limit' | 'csrf_violation' | 'injection_attempt'
  userId?: string
  ip: string
  userAgent: string
  timestamp: Date
  details: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const ROUTE_CONFIGS: Record<string, AuthConfig> = {
  // Public routes - no auth required
  '/api/health': { requireAuth: false, requireMFA: false },
  '/api/demo': { requireAuth: false, requireMFA: false },
  '/auth': { requireAuth: false, requireMFA: false },
  
  // Authentication routes - basic protection
  '/api/auth/login': { 
    requireAuth: false, 
    requireMFA: false,
    rateLimit: { requests: 5, window: '15m' },
    csrfProtection: true,
    contentValidation: true
  },
  '/api/auth/register': { 
    requireAuth: false, 
    requireMFA: false,
    rateLimit: { requests: 3, window: '60m' },
    csrfProtection: true,
    contentValidation: true
  },
  
  // User data routes - require authentication
  '/api/portfolios': { 
    requireAuth: true, 
    requireMFA: false,
    contentValidation: true
  },
  '/api/expenses': { 
    requireAuth: true, 
    requireMFA: false,
    contentValidation: true
  },
  '/api/income': { 
    requireAuth: true, 
    requireMFA: false,
    contentValidation: true
  },
  '/api/holdings': { 
    requireAuth: true, 
    requireMFA: false,
    contentValidation: true
  },
  
  // Sensitive operations - require MFA
  '/api/profile/security': { 
    requireAuth: true, 
    requireMFA: true,
    rateLimit: { requests: 10, window: '60m' },
    csrfProtection: true,
    contentValidation: true
  },
  '/api/transactions/create': { 
    requireAuth: true, 
    requireMFA: true,
    rateLimit: { requests: 20, window: '60m' },
    csrfProtection: true,
    contentValidation: true
  },
  '/api/backup': { 
    requireAuth: true, 
    requireMFA: true,
    rateLimit: { requests: 5, window: '60m' },
    csrfProtection: true
  },
  
  // Admin routes - highest security
  '/api/admin': { 
    requireAuth: true, 
    requireMFA: true,
    allowedRoles: ['admin'],
    rateLimit: { requests: 30, window: '60m' },
    csrfProtection: true,
    contentValidation: true
  }
}

const DEFAULT_CONFIG: AuthConfig = {
  requireAuth: true,
  requireMFA: false,
  contentValidation: true
}

export class AuthenticationMiddleware {
  private static securityEvents: SecurityEvent[] = []
  private static csrfTokens = new Map<string, { token: string, expires: number }>()
  
  /**
   * Get security configuration for route
   */
  private static getRouteConfig(pathname: string): AuthConfig {
    // Check for exact matches first
    const exactMatch = ROUTE_CONFIGS[pathname]
    if (exactMatch) return exactMatch
    
    // Check for prefix matches
    for (const [route, config] of Object.entries(ROUTE_CONFIGS)) {
      if (pathname.startsWith(route + '/') || pathname.startsWith(route)) {
        return config
      }
    }
    
    return DEFAULT_CONFIG
  }
  
  /**
   * Generate CSRF token
   */
  static generateCSRFToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + (60 * 60 * 1000) // 1 hour
    
    this.csrfTokens.set(sessionId, { token, expires })
    
    // Cleanup expired tokens
    this.cleanupExpiredTokens()
    
    return token
  }
  
  /**
   * Validate CSRF token
   */
  private static validateCSRFToken(sessionId: string, token: string): boolean {
    const stored = this.csrfTokens.get(sessionId)
    if (!stored) return false
    
    if (stored.expires < Date.now()) {
      this.csrfTokens.delete(sessionId)
      return false
    }
    
    return stored.token === token
  }
  
  /**
   * Clean up expired CSRF tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [sessionId, data] of this.csrfTokens) {
      if (data.expires < now) {
        this.csrfTokens.delete(sessionId)
      }
    }
  }
  
  /**
   * Log security event
   */
  private static logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event)
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift()
    }
    
    // Log high/critical events immediately
    if (event.severity === 'high' || event.severity === 'critical') {
      // console.error('SECURITY EVENT:', {
      //   type: event.type,
      //   severity: event.severity,
      //   userId: event.userId,
      //   ip: event.ip,
      //   timestamp: event.timestamp,
      //   details: event.details
      })

      // In production, send to monitoring service
      // if (process.env.NODE_ENV === 'production') {
        // TODO: Send to Sentry, DataDog, or other monitoring service
      }
    }
  }

  // /**
   // * Validate request content for security issues
   // */
  // private static async validateRequestContent(request: NextRequest): Promise<{
    // valid: boolean
    // issues?: string[]
  // }> {
    // const issues: string[] = []

    // try {
      // Check Content-Type for POST/PUT requests
      // if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        // const contentType = request.headers.get('content-type')
        // if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
          // issues.push('Invalid or missing Content-Type header')
        }
      }

      // Validate request body if present
      // if (request.body) {
        // const body = await request.clone().text()

        // if (body.length > 10 * 1024 * 1024) { // 10MB limit
          // issues.push('Request body too large')
        }

        // Check for potential SQL injection patterns
        // const sqlInjectionPatterns = [
          // /('|(\-\-)|(;)|(\|)|(\*)|(%))/i,
          // /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
          // /(script|javascript|vbscript|onload|onerror)/i
        // ]

        // for (const pattern of sqlInjectionPatterns) {
          // if (pattern.test(body)) {
            // issues.push('Potential injection attempt detected')
            // break
          }
        }
      }

      // Validate headers
      // const userAgent = request.headers.get('user-agent')
      // if (!userAgent || userAgent.length < 10) {
        // issues.push('Suspicious or missing User-Agent')
      }

      // return {
        // valid: issues.length === 0,
        // issues: issues.length > 0 ? issues : undefined
      }
    // } catch (error) {
      // return {
        // valid: false,
        // issues: ['Content validation error']
      }
    }
  }

  // /**
   // * Check if user has required role
   // */
  // private static async checkUserRole(userId: string, requiredRoles: string[]): Promise<boolean> {
    // TODO: Implement role checking from database
    // For now, assume all authenticated users have basic access
    // Admin roles would need to be stored in user profile

    // Placeholder implementation
    // if (requiredRoles.includes('admin')) {
      // Check if user is admin (implement your admin logic here)
      // return false // Deny admin access for security until properly implemented
    }

    // return true // Allow basic authenticated access
  }

  // /**
   // * Main authentication middleware
   // */
  // static async authenticate(request: NextRequest): Promise<NextResponse | null> {
    // const pathname = request.nextUrl.pathname
    // const method = request.method
    // const ip = request.headers.get('x-forwarded-for') ||
               // request.headers.get('x-real-ip') ||
               // request.headers.get('cf-connecting-ip') || 'unknown'
    // const userAgent = request.headers.get('user-agent') || 'unknown'

    // const config = this.getRouteConfig(pathname)

    // try {
      // 1. Content validation
      // if (config.contentValidation) {
        // const contentValidation = await this.validateRequestContent(request)
        // if (!contentValidation.valid) {
          // this.logSecurityEvent({
            // type: 'injection_attempt',
            // ip,
            // userAgent,
            // timestamp: new Date(),
            // details: { issues: contentValidation.issues, pathname, method },
            // severity: 'high'
          })

          // return NextResponse.json(
            // { error: 'Request validation failed', issues: contentValidation.issues },
            // { status: 400 }
          // )
        }
      }

      // 2. Rate limiting
      // if (config.rateLimit) {
        // const rateLimitResult = await RateLimitService.checkRateLimit(request)
        // if (!rateLimitResult.success) {
          // this.logSecurityEvent({
            // type: 'rate_limit',
            // ip,
            // userAgent,
            // timestamp: new Date(),
            // details: { pathname, method, limit: rateLimitResult.limit },
            // severity: 'medium'
          })

          // return NextResponse.json(
            // { error: 'Rate limit exceeded' },
            // {
              // status: 429,
              // headers: {
                // 'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
              }
            }
          // )
        }
      }

      // 3. Authentication check
      // if (!config.requireAuth) {
        // return null // Allow unauthenticated access
      }

      // const validation = await SessionValidator.validateSession(request)

      // if (!validation.valid) {
        // this.logSecurityEvent({
          // type: 'auth_failure',
          // ip,
          // userAgent,
          // timestamp: new Date(),
          // details: { pathname, method, error: validation.error },
          // severity: 'medium'
        })

        // if (pathname.startsWith('/api/')) {
          // return NextResponse.json(
            // { error: validation.error || 'Authentication required' },
            // { status: 401 }
          // )
        }

        // Redirect to login for web routes
        // const loginUrl = new URL('/auth/login', request.url)
        // return NextResponse.redirect(loginUrl)
      }

      // const session = validation.session!

      // 4. MFA check
      // if (config.requireMFA && !session.mfaVerified) {
        // this.logSecurityEvent({
          // type: 'auth_failure',
          // userId: session.userId,
          // ip,
          // userAgent,
          // timestamp: new Date(),
          // details: { pathname, method, error: 'MFA required' },
          // severity: 'medium'
        })

        // if (pathname.startsWith('/api/')) {
          // return NextResponse.json(
            // { error: 'MFA verification required' },
            // { status: 403 }
          // )
        }

        // const mfaUrl = new URL('/auth/mfa', request.url)
        // return NextResponse.redirect(mfaUrl)
      }

      // 5. Role-based access check
      // if (config.allowedRoles && config.allowedRoles.length > 0) {
        // const hasRole = await this.checkUserRole(session.userId, config.allowedRoles)
        // if (!hasRole) {
          // this.logSecurityEvent({
            // type: 'auth_failure',
            // userId: session.userId,
            // ip,
            // userAgent,
            // timestamp: new Date(),
            // details: { pathname, method, error: 'Insufficient permissions', requiredRoles: config.allowedRoles },
            // severity: 'high'
          })

          // return NextResponse.json(
            // { error: 'Insufficient permissions' },
            // { status: 403 }
          // )
        }
      }

      // 6. CSRF protection for state-changing operations
      // if (config.csrfProtection && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // const csrfToken = request.headers.get('x-csrf-token') ||
                         // request.headers.get('x-xsrf-token')

        // if (!csrfToken || !this.validateCSRFToken(session.sessionId, csrfToken)) {
          // this.logSecurityEvent({
            // type: 'csrf_violation',
            // userId: session.userId,
            // ip,
            // userAgent,
            // timestamp: new Date(),
            // details: { pathname, method },
            // severity: 'high'
          })

          // return NextResponse.json(
            // { error: 'CSRF token validation failed' },
            // { status: 403 }
          // )
        }
      }

      // Log successful authentication
      // this.logSecurityEvent({
        // type: 'auth_success',
        // userId: session.userId,
        // ip,
        // userAgent,
        // timestamp: new Date(),
        // details: { pathname, method },
        // severity: 'low'
      })

      // Add security headers to response
      // const response = NextResponse.next()
      // response.headers.set('X-User-ID', session.userId)
      // response.headers.set('X-Session-ID', session.sessionId)
      // response.headers.set('X-Auth-Status', 'authenticated')

      // if (config.csrfProtection) {
        // const csrfToken = this.generateCSRFToken(session.sessionId)
        // response.headers.set('X-CSRF-Token', csrfToken)
      }

      // return null // Continue with request

    // } catch (error) {
      // console.error('Authentication middleware error:', error)

      // this.logSecurityEvent({
        // type: 'auth_failure',
        // ip,
        // userAgent,
        // timestamp: new Date(),
        // details: { pathname, method, error: error instanceof Error ? error.message : 'Unknown error' },
        // severity: 'critical'
      })

      // return NextResponse.json(
        // { error: 'Authentication service unavailable' },
        // { status: 503 }
      // )
    }
  }

  // /**
   // * Get security events (admin function)
   // */
  // static getSecurityEvents(limit: number = 100): SecurityEvent[] {
    // return this.securityEvents.slice(-limit)
  }

  // /**
   // * Get security statistics
   // */
  // static getSecurityStats(): {
    // totalEvents: number
    // eventsByType: Record<string, number>
    // eventsBySeverity: Record<string, number>
    // recentEvents: SecurityEvent[]
  // } {
    // const eventsByType: Record<string, number> = {}
    // const eventsBySeverity: Record<string, number> = {}

    // for (const event of this.securityEvents) {
      // eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      // eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
    }

    // return {
      // totalEvents: this.securityEvents.length,
      // eventsByType,
      // eventsBySeverity,
      // recentEvents: this.securityEvents.slice(-10)
    }
  }
}

// /**
 // * Middleware function for Next.js
 // */
// export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })