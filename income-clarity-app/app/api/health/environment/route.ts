// API endpoint for environment validation and health checks
import { NextRequest, NextResponse } from 'next/server';
import { environmentValidatorService } from '@/lib/services/environment/environment-validator.service';
import { logger } from '@/lib/logger'

// GET /api/health/environment - Get environment validation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skipApiTest = searchParams.get('skipApiTest') === 'true';
    const quick = searchParams.get('quick') === 'true';

    if (quick) {
      // Quick health check without API calls
      const quickCheck = environmentValidatorService.quickHealthCheck();
      
      return NextResponse.json({
        quick: true,
        status: quickCheck.status,
        message: quickCheck.message,
        criticalIssues: quickCheck.criticalIssues,
        timestamp: new Date().toISOString()
      });
    }

    // Full validation
    const validation = await environmentValidatorService.validateEnvironment(skipApiTest);
    
    return NextResponse.json({
      ...validation,
      timestamp: validation.timestamp.toISOString()
    });

  } catch (error) {
    logger.error('Environment validation API error:', error);
    return NextResponse.json({
      overall: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/health/environment - Run fresh validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skipApiTest = false, forceRefresh = false } = body;

    // Check if we have a recent validation and don't need to refresh
    if (!forceRefresh) {
      const lastValidation = environmentValidatorService.getLastValidation();
      if (lastValidation) {
        const age = Date.now() - lastValidation.timestamp.getTime();
        if (age < 60000) { // Less than 1 minute old
          return NextResponse.json({
            ...lastValidation,
            cached: true,
            age: Math.floor(age / 1000),
            timestamp: lastValidation.timestamp.toISOString()
          });
        }
      }
    }

    // Run fresh validation
    const validation = await environmentValidatorService.validateEnvironment(skipApiTest);
    
    return NextResponse.json({
      ...validation,
      cached: false,
      timestamp: validation.timestamp.toISOString()
    });

  } catch (error) {
    logger.error('Environment validation POST error:', error);
    return NextResponse.json({
      overall: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}