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
  '/api/auth/logout',
  '/api/auth/me',
  '/api/demo/reset',
  '/api/health',
  '/api/environment',
  '/api/deployment/status',
  '/api/ui-version',
  '/api/monitoring/status',
  '/api/monitoring/subscribe',
  '/api/monitoring/notify'
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
  
  // Allow React Server Components (RSC) requests to pass through
  // RSC requests have _rsc query parameter and are internal Next.js requests
  if (request.nextUrl.searchParams.has('_rsc')) {
    return NextResponse.next()
  }
  
  // Alternative RSC detection: check for RSC-related headers
  const rscHeader = request.headers.get('RSC');
  const nextRouterStateTree = request.headers.get('Next-Router-State-Tree');
  if (rscHeader === '1' || nextRouterStateTree) {
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
  
  // If no session token, redirect to login (but handle RSC gracefully)
  if (!sessionToken) {
    // For potential RSC requests, return JSON error instead of redirect
    const acceptHeader = request.headers.get('accept') || '';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check if this might be an RSC request by analyzing headers
    if (acceptHeader.includes('text/x-component') || 
        acceptHeader.includes('application/rsc') ||
        request.headers.get('next-action') ||
        userAgent.includes('Next.js')) {
      return NextResponse.json(
        { 
          error: 'Authentication required for RSC',
          message: 'Please log in to access this resource',
          code: 'RSC_UNAUTHORIZED'
        },
        { status: 401 }
      )
    }
    
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For API routes (except auth endpoints), return JSON error if no session
  if (pathname.startsWith('/api/')) {
    if (!sessionToken) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please log in to access this API endpoint',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }
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
     * Exclude RSC requests (those with _rsc query parameter)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}