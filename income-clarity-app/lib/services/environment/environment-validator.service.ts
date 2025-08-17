// Environment Validator Service - Startup checks for reliability
import { stockPriceService } from './stock/stock-price.service';
import { logger } from '@/lib/logger'

interface EnvironmentCheck {
  name: string;
  required: boolean;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  value?: string;
}

interface ValidationResult {
  overall: 'healthy' | 'degraded' | 'failed';
  checks: EnvironmentCheck[];
  timestamp: Date;
  summary: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
}

class EnvironmentValidatorService {
  private lastValidation: ValidationResult | null = null;

  // Validate all environment requirements
  async validateEnvironment(skipApiTest: boolean = false): Promise<ValidationResult> {
    logger.log('🔍 Running environment validation...');
    
    const checks: EnvironmentCheck[] = [];
    const startTime = Date.now();

    // 1. Check Polygon API Key
    const polygonApiKey = process.env.POLYGON_API_KEY;
    checks.push({
      name: 'POLYGON_API_KEY',
      required: false, // Not required - app should work without it
      status: polygonApiKey ? 'pass' : 'warning',
      message: polygonApiKey 
        ? 'Polygon API key is configured' 
        : 'Polygon API key not configured - using simulated data',
      value: polygonApiKey ? `${polygonApiKey.substring(0, 8)}...` : undefined
    });

    // 2. Test Polygon API Connection (if key is available and not skipped)
    if (polygonApiKey && !skipApiTest) {
      try {
        const connectionTest = await stockPriceService.testApiConnection();
        checks.push({
          name: 'Polygon API Connection',
          required: false,
          status: connectionTest.success ? 'pass' : 'warning',
          message: `${connectionTest.message}${connectionTest.latency ? ` (${connectionTest.latency}ms)` : ''}`,
          value: connectionTest.success ? 'Connected' : 'Failed'
        });
      } catch (error) {
        checks.push({
          name: 'Polygon API Connection',
          required: false,
          status: 'warning',
          message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          value: 'Error'
        });
      }
    }

    // 3. Check Database URL
    const databaseUrl = process.env.DATABASE_URL;
    checks.push({
      name: 'DATABASE_URL',
      required: true,
      status: databaseUrl ? 'pass' : 'fail',
      message: databaseUrl 
        ? 'Database URL is configured' 
        : 'Database URL is missing - application will not function',
      value: databaseUrl ? 'Configured' : undefined
    });

    // 4. Check Session Secret
    const sessionSecret = process.env.SESSION_SECRET;
    checks.push({
      name: 'SESSION_SECRET',
      required: true,
      status: sessionSecret ? 'pass' : 'fail',
      message: sessionSecret 
        ? 'Session secret is configured' 
        : 'Session secret is missing - authentication will not work',
      value: sessionSecret ? 'Configured' : undefined
    });

    // 5. Check Node Environment
    const nodeEnv = process.env.NODE_ENV;
    checks.push({
      name: 'NODE_ENV',
      required: false,
      status: nodeEnv ? 'pass' : 'warning',
      message: nodeEnv 
        ? `Running in ${nodeEnv} mode` 
        : 'NODE_ENV not set - defaulting to development',
      value: nodeEnv || 'development'
    });

    // 6. Check Next.js App URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    checks.push({
      name: 'NEXT_PUBLIC_APP_URL',
      required: false,
      status: appUrl ? 'pass' : 'warning',
      message: appUrl 
        ? 'App URL is configured' 
        : 'App URL not set - may affect redirects and external links',
      value: appUrl
    });

    // 7. Check Lite Production Mode
    const liteProductionMode = process.env.LITE_PRODUCTION_MODE;
    checks.push({
      name: 'LITE_PRODUCTION_MODE',
      required: false,
      status: 'pass',
      message: `Lite production mode: ${liteProductionMode === 'true' ? 'enabled' : 'disabled'}`,
      value: liteProductionMode || 'false'
    });

    // Calculate summary
    const summary = {
      passed: checks.filter(c => c.status === 'pass').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      failed: checks.filter(c => c.status === 'fail').length,
      total: checks.length
    };

    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'failed' = 'healthy';
    
    if (summary.failed > 0 && checks.some(c => c.required && c.status === 'fail')) {
      overall = 'failed';
    } else if (summary.warnings > 0 || summary.failed > 0) {
      overall = 'degraded';
    }

    const result: ValidationResult = {
      overall,
      checks,
      timestamp: new Date(),
      summary
    };

    this.lastValidation = result;
    const executionTime = Date.now() - startTime;

    // Log results
    const statusIcon = overall === 'healthy' ? '✅' : overall === 'degraded' ? '⚠️' : '❌';
    logger.log(`${statusIcon} Environment validation completed (${executionTime}ms):`);
    logger.log(`   - ${summary.passed} passed, ${summary.warnings} warnings, ${summary.failed} failed`);
    
    if (overall === 'failed') {
      logger.error('❌ Critical environment issues detected:');
      checks.filter(c => c.required && c.status === 'fail')
            .forEach(c => logger.error(`   - ${c.name}: ${c.message}`));
    } else if (overall === 'degraded') {
      logger.warn('⚠️ Environment issues detected:');
      checks.filter(c => c.status === 'fail' || c.status === 'warning')
            .forEach(c => logger.warn(`   - ${c.name}: ${c.message}`));
    }

    return result;
  }

  // Get last validation result
  getLastValidation(): ValidationResult | null {
    return this.lastValidation;
  }

  // Quick health check (no API calls)
  quickHealthCheck(): {
    status: 'healthy' | 'degraded' | 'failed';
    message: string;
    criticalIssues: string[];
  } {
    const criticalIssues: string[] = [];

    if (!process.env.DATABASE_URL) {
      criticalIssues.push('DATABASE_URL missing');
    }

    if (!process.env.SESSION_SECRET) {
      criticalIssues.push('SESSION_SECRET missing');
    }

    const warnings: string[] = [];
    
    if (!process.env.POLYGON_API_KEY) {
      warnings.push('POLYGON_API_KEY not configured (using simulated data)');
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      warnings.push('NEXT_PUBLIC_APP_URL not set');
    }

    let status: 'healthy' | 'degraded' | 'failed' = 'healthy';
    let message = 'All systems operational';

    if (criticalIssues.length > 0) {
      status = 'failed';
      message = `Critical issues: ${criticalIssues.join(', ')}`;
    } else if (warnings.length > 0) {
      status = 'degraded';
      message = `Non-critical issues: ${warnings.join(', ')}`;
    }

    return {
      status,
      message,
      criticalIssues
    };
  }

  // Startup validation with retries
  async startupValidation(): Promise<ValidationResult> {
    logger.log('🚀 Running startup validation...');
    
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.validateEnvironment(false);
        
        if (result.overall === 'failed') {
          const criticalIssues = result.checks
            .filter(c => c.required && c.status === 'fail')
            .map(c => c.name);
          
          throw new Error(`Critical environment validation failed: ${criticalIssues.join(', ')}`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Startup validation attempt ${attempt}/${maxRetries} failed:`, error);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          logger.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, return a failed result
    logger.error('❌ Startup validation failed after all retries:', lastError);
    throw lastError || new Error('Startup validation failed');
  }
}

// Export singleton instance
export const environmentValidatorService = new EnvironmentValidatorService();
export type { ValidationResult, EnvironmentCheck };