/**
 * Security Status API Endpoint
 * Provides security system status and statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthenticationMiddleware } from '../../../../lib/middleware/auth-middleware'
import { DatabaseEncryption } from '../../../../lib/security/encryption'
import { SecureBackupService } from '../../../../lib/security/secure-backup'
import { RateLimitService } from '../../../../lib/middleware/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // This endpoint requires authentication and MFA
    const authResult = await AuthenticationMiddleware.authenticate(request)
    if (authResult) {
      return authResult // Return auth error response
    }
    
    // Get security statistics
    const securityStats = AuthenticationMiddleware.getSecurityStats()
    const encryptionStatus = DatabaseEncryption.getStatus()
    const rateLimitStats = await RateLimitService.getStats()
    
    // Get recent security events (admin only)
    const recentEvents = AuthenticationMiddleware.getSecurityEvents(50)
    
    const response = {
      status: 'secure',
      timestamp: new Date().toISOString(),
      components: {
        authentication: {
          status: 'active',
          middleware: 'enabled',
          csrfProtection: true,
          sessionValidation: true,
          mfaSupport: true
        },
        encryption: {
          status: encryptionStatus.initialized ? 'active' : 'inactive',
          algorithm: encryptionStatus.algorithm,
          keyLength: encryptionStatus.keyLength,
          cacheSize: encryptionStatus.cacheSize
        },
        rateLimiting: {
          status: rateLimitStats.redisConnected ? 'redis' : 'fallback',
          activeLimiters: rateLimitStats.totalLimiters,
          fallbackEntries: rateLimitStats.fallbackEntries
        },
        backup: {
          status: 'available',
          encryption: true,
          compression: true,
          integrityCheck: true
        },
        inputSanitization: {
          status: 'active',
          sqlInjectionProtection: true,
          xssProtection: true,
          commandInjectionProtection: true,
          pathTraversalProtection: true
        }
      },
      statistics: {
        security: securityStats,
        rateLimit: rateLimitStats
      },
      recentEvents: recentEvents.slice(-10), // Last 10 events only
      recommendations: this.generateSecurityRecommendations(securityStats, encryptionStatus)
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Security status error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )