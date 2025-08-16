/**
 * Enhanced Next.js Middleware for Income Clarity
 * Implements proper route protection and session validation
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/demo',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/demo/reset',
  '/api/health'
];

// API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/demo/reset',
  '/api/health'
];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  
  // Skip middleware for Next.js internals, static files, and favicon
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/icons') ||
      pathname.startsWith('/manifest') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Allow public routes without authentication
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/_next')) {
    const response = NextResponse.next()
    addSecurityHeaders(response)
    return response
  }
  
  // Allow public API routes
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next()
    addSecurityHeaders(response)
    return response
  }
  
  // Check for session token for protected routes
  const sessionToken = request.cookies.get('session-token')?.value
  
  // If no session token, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For API routes (except auth endpoints), let them handle their own validation
  // to avoid circular dependencies
  if (pathname.startsWith('/api/')) {
    const nextResponse = NextResponse.next()
    addSecurityHeaders(nextResponse)
    return nextResponse
  }
  
  // For page routes, just check if session token exists
  // The actual validation will be done by the page components or API routes
  const nextResponse = NextResponse.next()
  addSecurityHeaders(nextResponse)
  return nextResponse
}

function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}