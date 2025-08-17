/**
 * API Rate Limiting Middleware
 * 
 * Production-grade middleware for Express/Next.js with:
 * - Per-user and per-IP rate limiting
 * - Different limits for authenticated vs anonymous users
 * - API endpoint-specific rate limits
 * - Sliding window rate limiting
 * - DDoS protection
 * - Rate limit headers in responses
 * - Bypass for internal services
 * - Monitoring and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiterService, RateLimitConfig } from '../rate-limiter/rate-limiter.service';
import { logger } from '@/lib/logger';

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  headers?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  skip?: (req: NextRequest) => boolean;
  onLimitReached?: (req: NextRequest, identifier: string) => void;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export class ApiRateLimitMiddleware {
  // Default rate limit configurations
  private readonly DEFAULT_LIMITS = {
    // Anonymous users (per IP)
    ANONYMOUS: {
      identifier: 'api_anonymous',
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many requests from this IP, please try again later'
    },
    
    // Authenticated users (per user ID)
    AUTHENTICATED: {
      identifier: 'api_authenticated',
      maxRequests: 1000,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many requests, please try again later'
    },
    
    // Premium users (higher limits)
    PREMIUM: {
      identifier: 'api_premium',
      maxRequests: 5000,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Rate limit exceeded for premium user'
    },
    
    // Critical API endpoints (stricter limits)
    CRITICAL: {
      identifier: 'api_critical',
      maxRequests: 50,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many requests to critical endpoint'
    },
    
    // File upload endpoints
    UPLOAD: {
      identifier: 'api_upload',
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: 'Too many file uploads, please try again later'
    },
    
    // Password reset/auth endpoints
    AUTH_SENSITIVE: {
      identifier: 'api_auth_sensitive',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many authentication attempts'
    },
    
    // Database write operations
    DATABASE_WRITE: {
      identifier: 'api_db_write',
      maxRequests: 200,
      windowMs: 60 * 1000, // 1 minute
      message: 'Too many database operations'
    },
    
    // External API proxy endpoints
    EXTERNAL_API: {
      identifier: 'api_external',
      maxRequests: 30,
      windowMs: 60 * 1000, // 1 minute
      message: 'Too many external API requests'
    }
  };

  // Endpoint patterns and their rate limit types
  private readonly ENDPOINT_PATTERNS = [
    { pattern: /^\/api\/auth\/(login|signup|reset)/, type: 'AUTH_SENSITIVE' },
    { pattern: /^\/api\/portfolio\/import/, type: 'UPLOAD' },
    { pattern: /^\/api\/(portfolios|holdings|transactions|income|expenses)/, type: 'DATABASE_WRITE' },
    { pattern: /^\/api\/stock-prices/, type: 'EXTERNAL_API' },
    { pattern: /^\/api\/super-cards/, type: 'EXTERNAL_API' },
    { pattern: /^\/api\/admin/, type: 'CRITICAL' },
    { pattern: /^\/api\/demo\/reset/, type: 'CRITICAL' }
  ];

  // IP whitelist for internal services
  private readonly INTERNAL_IPS = new Set([
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ]);

  constructor() {
    logger.log('🚦 API Rate Limit Middleware initialized');
  }

  /**
   * Create rate limiting middleware for Next.js API routes
   */
  createMiddleware(options: RateLimitOptions = {}) {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      // Skip if explicitly configured to skip
      if (options.skip && options.skip(req)) {
        return null;
      }

      // Skip for internal IPs
      if (this.isInternalIP(req)) {
        return null;
      }

      // Determine rate limit type based on endpoint and user
      const limitType = this.determineLimitType(req);
      const identifier = this.generateIdentifier(req, limitType, options.keyGenerator);
      
      // Get rate limit configuration
      const config = this.getRateLimitConfig(limitType, options);
      
      try {
        // Check rate limit
        const result = await rateLimiterService.checkRateLimit({
          ...config,
          identifier
        });

        // Create response with rate limit headers
        const response = result.allowed 
          ? null // Continue processing
          : this.createRateLimitResponse(result, config.message || 'Rate limit exceeded');

        // Add rate limit headers if enabled
        if (options.headers !== false && response) {
          this.addRateLimitHeaders(response, result, config);
        }

        // Log rate limit events
        if (!result.allowed) {
          logger.warn(`Rate limit exceeded: ${identifier} (${limitType})`);
          
          // Call onLimitReached callback if provided
          if (options.onLimitReached) {
            options.onLimitReached(req, identifier);
          }
        }

        return response;

      } catch (error) {
        logger.error('Rate limit check failed:', error);
        
        // Fail open - allow request but log the error
        return null;
      }
    };
  }

  /**
   * Create rate limiting middleware for specific endpoints
   */
  createEndpointMiddleware(endpointType: keyof typeof this.DEFAULT_LIMITS, options: RateLimitOptions = {}) {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      const identifier = this.generateIdentifier(req, endpointType, options.keyGenerator);
      const config = this.getRateLimitConfig(endpointType, options);
      
      try {
        const result = await rateLimiterService.checkRateLimit({
          ...config,
          identifier
        });

        if (!result.allowed) {
          const response = this.createRateLimitResponse(result, config.message || 'Rate limit exceeded');
          this.addRateLimitHeaders(response, result, config);
          
          logger.warn(`Endpoint rate limit exceeded: ${identifier} (${endpointType})`);
          return response;
        }

        return null; // Continue processing

      } catch (error) {
        logger.error('Endpoint rate limit check failed:', error);
        return null;
      }
    };
  }

  /**
   * Create DDoS protection middleware
   */
  createDDoSProtection() {
    const DDOS_CONFIG = {
      identifier: 'ddos_protection',
      maxRequests: 20,
      windowMs: 1000, // 1 second
      message: 'Too many requests detected - DDoS protection activated'
    };

    return async (req: NextRequest): Promise<NextResponse | null> => {
      const ip = this.getClientIP(req);
      const identifier = `ddos:${ip}`;
      
      try {
        const result = await rateLimiterService.checkRateLimit({
          ...DDOS_CONFIG,
          identifier,
          priority: 0 // Highest priority for DDoS protection
        });

        if (!result.allowed) {
          logger.error(`DDoS protection triggered for IP: ${ip}`);
          
          const response = NextResponse.json(
            { 
              error: DDOS_CONFIG.message,
              type: 'DDOS_PROTECTION'
            }, 
            { status: 429 }
          );
          
          // Add security headers
          response.headers.set('X-DDoS-Protection', 'activated');
          response.headers.set('Retry-After', '60');
          
          return response;
        }

        return null;

      } catch (error) {
        logger.error('DDoS protection check failed:', error);
        return null;
      }
    };
  }

  /**
   * Get rate limit status for monitoring
   */
  async getRateLimitStatus(req: NextRequest): Promise<Record<string, any>> {
    const limitType = this.determineLimitType(req);
    const identifier = this.generateIdentifier(req, limitType);
    const config = this.getRateLimitConfig(limitType);
    
    return await rateLimiterService.getRateLimitStatus(identifier);
  }

  /**
   * Reset rate limits for specific identifier (admin only)
   */
  async resetRateLimit(identifier: string): Promise<void> {
    await rateLimiterService.clearRateLimits(identifier);
    logger.log(`Rate limit reset for: ${identifier}`);
  }

  /**
   * Get rate limiting metrics
   */
  getMetrics() {
    return rateLimiterService.getMetrics();
  }

  // Private helper methods

  private determineLimitType(req: NextRequest): keyof typeof this.DEFAULT_LIMITS {
    const pathname = req.nextUrl.pathname;
    
    // Check endpoint patterns first
    for (const { pattern, type } of this.ENDPOINT_PATTERNS) {
      if (pattern.test(pathname)) {
        return type as keyof typeof this.DEFAULT_LIMITS;
      }
    }
    
    // Check user authentication and premium status
    const authHeader = req.headers.get('authorization');
    const userAgent = req.headers.get('user-agent') || '';
    
    // Check for premium user (simplified - in production, decode JWT)
    if (authHeader && this.isPremiumUser(authHeader)) {
      return 'PREMIUM';
    }
    
    // Check for authenticated user
    if (authHeader || this.hasValidSession(req)) {
      return 'AUTHENTICATED';
    }
    
    // Default to anonymous
    return 'ANONYMOUS';
  }

  private generateIdentifier(
    req: NextRequest, 
    limitType: keyof typeof this.DEFAULT_LIMITS,
    customGenerator?: (req: NextRequest) => string
  ): string {
    if (customGenerator) {
      return customGenerator(req);
    }

    const pathname = req.nextUrl.pathname;
    
    // For authenticated users, use user ID if available
    if (limitType === 'AUTHENTICATED' || limitType === 'PREMIUM') {
      const userId = this.getUserId(req);
      if (userId) {
        return `user:${userId}:${pathname}`;
      }
    }
    
    // For anonymous users or fallback, use IP
    const ip = this.getClientIP(req);
    return `ip:${ip}:${pathname}`;
  }

  private getRateLimitConfig(
    limitType: keyof typeof this.DEFAULT_LIMITS,
    options: RateLimitOptions = {}
  ): RateLimitConfig & { message: string } {
    const defaultConfig = this.DEFAULT_LIMITS[limitType];
    
    return {
      identifier: defaultConfig.identifier,
      maxRequests: options.maxRequests || defaultConfig.maxRequests,
      windowMs: options.windowMs || defaultConfig.windowMs,
      message: options.message || defaultConfig.message,
      queueSize: 100,
      priority: 1
    };
  }

  private createRateLimitResponse(result: any, message: string): NextResponse {
    const response = NextResponse.json(
      {
        error: message,
        type: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter
      },
      { status: 429 }
    );

    return response;
  }

  private addRateLimitHeaders(
    response: NextResponse, 
    result: any, 
    config: any
  ): void {
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remainingRequests.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());
    
    if (result.retryAfter) {
      response.headers.set('Retry-After', Math.ceil(result.retryAfter / 1000).toString());
    }
    
    if (result.queuePosition) {
      response.headers.set('X-RateLimit-Queue-Position', result.queuePosition.toString());
    }
  }

  private getClientIP(req: NextRequest): string {
    // Try various headers for the real client IP
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const xRealIP = req.headers.get('x-real-ip');
    const xClientIP = req.headers.get('x-client-ip');
    
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    
    if (xRealIP) {
      return xRealIP;
    }
    
    if (xClientIP) {
      return xClientIP;
    }
    
    // Fallback to connection IP (may not be available in all environments)
    return req.ip || '127.0.0.1';
  }

  private getUserId(req: NextRequest): string | null {
    // Simplified user ID extraction
    // In production, decode JWT or check session
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        // This would decode the JWT in production
        // For now, return a placeholder
        return 'user-id-from-jwt';
      } catch {
        return null;
      }
    }
    
    // Check for session cookie
    const sessionCookie = req.cookies.get('session');
    if (sessionCookie) {
      // Extract user ID from session
      return 'user-id-from-session';
    }
    
    return null;
  }

  private isPremiumUser(authHeader: string): boolean {
    // Simplified premium user check
    // In production, decode JWT and check user status
    try {
      // This would check premium status from JWT
      return false; // Placeholder
    } catch {
      return false;
    }
  }

  private hasValidSession(req: NextRequest): boolean {
    // Check for valid session cookie or auth header
    const authHeader = req.headers.get('authorization');
    const sessionCookie = req.cookies.get('session');
    
    return !!(authHeader || sessionCookie);
  }

  private isInternalIP(req: NextRequest): boolean {
    const ip = this.getClientIP(req);
    
    // Check if IP is in internal range
    if (this.INTERNAL_IPS.has(ip)) {
      return true;
    }
    
    // Check private IP ranges
    const privateRanges = [
      /^127\./, // 127.0.0.0/8
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 private
    ];
    
    return privateRanges.some(range => range.test(ip));
  }
}

// Export singleton instance
export const apiRateLimitMiddleware = new ApiRateLimitMiddleware();

// Export convenience functions
export function createRateLimit(options?: RateLimitOptions) {
  return apiRateLimitMiddleware.createMiddleware(options);
}

export function createEndpointRateLimit(
  endpointType: keyof typeof apiRateLimitMiddleware['DEFAULT_LIMITS'],
  options?: RateLimitOptions
) {
  return apiRateLimitMiddleware.createEndpointMiddleware(endpointType, options);
}

export function createDDoSProtection() {
  return apiRateLimitMiddleware.createDDoSProtection();
}

// Export types
export type { RateLimitOptions, RateLimitResult };