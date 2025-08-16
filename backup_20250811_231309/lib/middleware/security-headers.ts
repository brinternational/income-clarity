/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production deployment
 */

import { NextRequest, NextResponse } from 'next/server'

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: boolean
  xssProtection?: boolean
  frameOptions?: boolean
  contentTypeOptions?: boolean
  referrerPolicy?: boolean
  permissionsPolicy?: boolean
  strictTransportSecurity?: boolean
  expectCt?: boolean
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: true,
  xssProtection: true,
  frameOptions: true,
  contentTypeOptions: true,
  referrerPolicy: true,
  permissionsPolicy: true,
  strictTransportSecurity: true,
  expectCt: true
}

export class SecurityHeadersService {
  /**
   * Generate Content Security Policy header
   */
  private static generateCSP(): string {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://income-clarity.vercel.app'
    
    // Base CSP directives
    const directives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js in development
        "'unsafe-eval'", // Required for Next.js in development
        'https://vercel.live',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://js.sentry-cdn.com',
        ...(isDevelopment ? ['http://localhost:*', 'ws://localhost:*'] : [])
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for CSS-in-JS
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:', // Allow images from any HTTPS source
        ...(isDevelopment ? ['http://localhost:*'] : [])
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'connect-src': [
        "'self'",
        appUrl,
        'https://api.polygon.io',
        'https://cloud.iexapis.com',
        'https://api.supabase.co',
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://upstash.io',
        'https://*.upstash.io',
        'https://api.sentry.io',
        'https://o4504609306984448.ingest.sentry.io',
        'https://www.google-analytics.com',
        ...(isDevelopment ? [
          'http://localhost:*', 
          'ws://localhost:*',
          'http://127.0.0.1:*',
          'ws://127.0.0.1:*'
        ] : [])
      ],
      'frame-src': [
        "'self'",
        'https://vercel.live'
      ],
      'worker-src': [
        "'self'",
        'blob:'
      ],
      'child-src': [
        "'self'"
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
      // Removed upgrade-insecure-requests for development to prevent HTTPS forcing
    }

    // Convert directives object to CSP string
    return Object.entries(directives)
      .filter(([, values]) => values.length > 0)
      .map(([directive, values]) => {
        if (values.length === 1 && values[0] === '') {
          return directive
        }
        return `${directive} ${values.join(' ')}`
      })
      .join('; ')
  }

  /**
   * Generate Permissions Policy header
   */
  private static generatePermissionsPolicy(): string {
    const policies = {
      'accelerometer': '()',
      'ambient-light-sensor': '()',
      'autoplay': '(self)',
      'battery': '()',
      'camera': '()',
      'cross-origin-isolated': '()',
      'display-capture': '()',
      'document-domain': '()',
      'encrypted-media': '()',
      'execution-while-not-rendered': '()',
      'execution-while-out-of-viewport': '()',
      'fullscreen': '(self)',
      'geolocation': '()',
      'gyroscope': '()',
      'magnetometer': '()',
      'microphone': '()',
      'midi': '()',
      'navigation-override': '()',
      'payment': '(self)',
      'picture-in-picture': '()',
      'publickey-credentials-get': '(self)',
      'screen-wake-lock': '()',
      'sync-xhr': '()',
      'usb': '()',
      'web-share': '(self)',
      'xr-spatial-tracking': '()'
    }

    return Object.entries(policies)
      .map(([directive, value]) => `${directive}=${value}`)
      .join(', ')
  }

  /**
   * Apply security headers to response
   */
  static applySecurityHeaders(
    response: NextResponse,
    config: SecurityHeadersConfig = DEFAULT_CONFIG
  ): NextResponse {
    const isProduction = process.env.NODE_ENV === 'production'
    const headers = response.headers

    // Content Security Policy
    if (config.contentSecurityPolicy) {
      const csp = this.generateCSP()
      headers.set('Content-Security-Policy', csp)
      
      // Also set CSP in report-only mode for testing
      if (process.env.NODE_ENV === 'development') {
        headers.set('Content-Security-Policy-Report-Only', csp)
      }
    }

    // X-XSS-Protection (legacy, but still useful)
    if (config.xssProtection) {
      headers.set('X-XSS-Protection', '1; mode=block')
    }

    // X-Frame-Options
    if (config.frameOptions) {
      headers.set('X-Frame-Options', 'DENY')
    }

    // X-Content-Type-Options
    if (config.contentTypeOptions) {
      headers.set('X-Content-Type-Options', 'nosniff')
    }

    // Referrer-Policy
    if (config.referrerPolicy) {
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // Permissions-Policy
    if (config.permissionsPolicy) {
      headers.set('Permissions-Policy', this.generatePermissionsPolicy())
    }

    // Strict-Transport-Security (HSTS)
    if (config.strictTransportSecurity && isProduction) {
      headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    // Expect-CT (Certificate Transparency)
    if (config.expectCt && isProduction) {
      headers.set(
        'Expect-CT',
        'max-age=86400, enforce'
      )
    }

    // Additional security headers
    headers.set('X-DNS-Prefetch-Control', 'off')
    headers.set('X-Download-Options', 'noopen')
    headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    
    // Cross-Origin headers
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    headers.set('Cross-Origin-Resource-Policy', 'same-origin')

    // Server information hiding
    headers.delete('Server')
    headers.delete('X-Powered-By')

    return response
  }

  /**
   * Special headers for API endpoints
   */
  static applyAPISecurityHeaders(response: NextResponse): NextResponse {
    const headers = response.headers
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://income-clarity.vercel.app'

    // CORS headers for API endpoints
    headers.set('Access-Control-Allow-Origin', appUrl)
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    headers.set('Access-Control-Max-Age', '86400')
    headers.set('Access-Control-Allow-Credentials', 'true')

    // API-specific security headers
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')
    
    return response
  }

  /**
   * Get current CSP for debugging
   */
  static getCurrentCSP(): string {
    return this.generateCSP()
  }

  /**
   * Validate CSP against common issues
   */
  static validateCSP(): {
    valid: boolean
    issues: string[]
    recommendations: string[]
  } {
    const csp = this.generateCSP()
    const issues: string[] = []
    const recommendations: string[] = []

    // Check for unsafe directives
    if (csp.includes("'unsafe-inline'")) {
      if (process.env.NODE_ENV === 'production') {
        issues.push("'unsafe-inline' should be avoided in production")
        recommendations.push("Use nonce or hash-based CSP for inline scripts/styles")
      }
    }

    if (csp.includes("'unsafe-eval'")) {
      if (process.env.NODE_ENV === 'production') {
        issues.push("'unsafe-eval' should be avoided in production")
        recommendations.push("Avoid eval() and similar functions")
      }
    }

    // Check for missing important directives
    if (!csp.includes('upgrade-insecure-requests')) {
      if (process.env.NODE_ENV === 'production') {
        issues.push("Missing 'upgrade-insecure-requests' directive")
        recommendations.push("Add upgrade-insecure-requests for HTTPS enforcement")
      }
    }

    if (!csp.includes("object-src 'none'")) {
      issues.push("Missing strict object-src directive")
      recommendations.push("Set object-src to 'none' to prevent plugin execution")
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    }
  }
}

/**
 * Security headers middleware function
 */
export async function securityHeadersMiddleware(
  request: NextRequest,
  response?: NextResponse
): Promise<NextResponse> {
  const res = response || NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Apply appropriate security headers based on route type
  if (pathname.startsWith('/api/')) {
    // API endpoints get API-specific headers
    SecurityHeadersService.applyAPISecurityHeaders(res)
    SecurityHeadersService.applySecurityHeaders(res, {
      ...DEFAULT_CONFIG,
      contentSecurityPolicy: false // Skip CSP for API endpoints
    })
  } else {
    // Web pages get full security headers including CSP
    SecurityHeadersService.applySecurityHeaders(res)
  }

  return res
}

// Export utilities (SecurityHeadersService already exported above)
export { DEFAULT_CONFIG }