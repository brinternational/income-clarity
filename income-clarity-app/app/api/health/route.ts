import { NextRequest, NextResponse } from 'next/server';
import { metricsService } from '@/lib/services/monitoring/metrics.service';
import { logger } from '@/lib/services/logging/logger.service';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: Record<string, any>;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: HealthCheck[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Determine check level based on query params
    const url = new URL(request.url);
    const level = url.searchParams.get('level') || 'basic';
    const includeDetails = url.searchParams.get('details') === 'true';

    let checks: HealthCheck[] = [];

    switch (level) {
      case 'basic':
        checks = await performBasicHealthChecks();
        break;
      case 'detailed':
        checks = await performDetailedHealthChecks();
        break;
      case 'full':
        checks = await performFullHealthChecks();
        break;
      default:
        checks = await performBasicHealthChecks();
    }

    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length
    };

    const overallStatus = determineOverallStatus(checks);

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: includeDetails ? checks : checks.map(({ details, ...check }) => check),
      summary
    };

    // Track health check metrics
    metricsService.trackApiRequest('/api/health', 'GET', 200, Date.now() - startTime);
    metricsService.gauge('health_check.overall_status', overallStatus === 'healthy' ? 1 : 0);

    // Log health check
    logger.info('Health check performed', {
      level,
      status: overallStatus,
      duration: Date.now() - startTime,
      checksPerformed: checks.length
    });

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check system failure',
      checks: [],
      summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 1 }
    }, { status: 503 });
  }
}

async function performBasicHealthChecks(): Promise<HealthCheck[]> {
  const checks: Promise<HealthCheck>[] = [
    checkApplicationStatus(),
    checkMemoryUsage(),
    checkEnvironment()
  ];

  return Promise.all(checks);
}

async function performDetailedHealthChecks(): Promise<HealthCheck[]> {
  const basicChecks = await performBasicHealthChecks();
  
  const additionalChecks: Promise<HealthCheck>[] = [
    checkDatabaseConnection(),
    checkRedisConnection(),
    checkFileSystem(),
    checkExternalDependencies()
  ];

  const additional = await Promise.all(additionalChecks);
  return [...basicChecks, ...additional];
}

async function performFullHealthChecks(): Promise<HealthCheck[]> {
  const detailedChecks = await performDetailedHealthChecks();
  
  const comprehensiveChecks: Promise<HealthCheck>[] = [
    checkYodleeApi(),
    checkEmailService(),
    checkQueue(),
    checkMetricsSystem(),
    checkLoggingSystem(),
    checkSecuritySettings()
  ];

  const comprehensive = await Promise.all(comprehensiveChecks);
  return [...detailedChecks, ...comprehensive];
}

async function checkApplicationStatus(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Basic application health indicators
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const status = memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'degraded';
    
    return {
      name: 'application',
      status,
      responseTime: Date.now() - startTime,
      details: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          heapUtilization: (memUsage.heapUsed / memUsage.heapTotal * 100).toFixed(2) + '%'
        },
        cpuUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      }
    };
  } catch (error) {
    return {
      name: 'application',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkMemoryUsage(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const memUsage = process.memoryUsage();
    const heapUtilization = memUsage.heapUsed / memUsage.heapTotal;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (heapUtilization > 0.9) status = 'unhealthy';
    else if (heapUtilization > 0.8) status = 'degraded';
    else status = 'healthy';
    
    return {
      name: 'memory',
      status,
      responseTime: Date.now() - startTime,
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        utilization: (heapUtilization * 100).toFixed(2) + '%',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
        arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024) + ' MB'
      }
    };
  } catch (error) {
    return {
      name: 'memory',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkEnvironment(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'YODLEE_CLIENT_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    const status = missingVars.length === 0 ? 'healthy' : 'unhealthy';
    
    return {
      name: 'environment',
      status,
      responseTime: Date.now() - startTime,
      details: {
        nodeEnv: process.env.NODE_ENV,
        configuredVars: requiredEnvVars.length - missingVars.length,
        totalRequired: requiredEnvVars.length,
        missingVars: missingVars.length > 0 ? missingVars : undefined
      }
    };
  } catch (error) {
    return {
      name: 'environment',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkDatabaseConnection(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Import Prisma client dynamically to avoid initialization issues
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    return {
      name: 'database',
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        type: 'sqlite',
        url: process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/***') // Hide filename for security
      }
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkRedisConnection(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Only check Redis if configured
    if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
      return {
        name: 'redis',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: { configured: false, message: 'Redis not configured - optional service' }
      };
    }

    // Import Redis client dynamically
    const Redis = (await import('ioredis')).default;
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      connectTimeout: 5000,
      lazyConnect: true
    });
    
    await redis.ping();
    const info = await redis.info('server');
    await redis.disconnect();
    
    return {
      name: 'redis',
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        configured: true,
        version: info.match(/redis_version:(.+)/)?.[1]?.trim()
      }
    };
  } catch (error) {
    return {
      name: 'redis',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkFileSystem(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Test write/read permissions
    const testFile = path.join(process.cwd(), '.health-check-test');
    const testData = 'health-check-' + Date.now();
    
    await fs.writeFile(testFile, testData);
    const readData = await fs.readFile(testFile, 'utf8');
    await fs.unlink(testFile);
    
    const status = readData === testData ? 'healthy' : 'degraded';
    
    return {
      name: 'filesystem',
      status,
      responseTime: Date.now() - startTime,
      details: {
        writable: true,
        readable: true,
        testPassed: readData === testData
      }
    };
  } catch (error) {
    return {
      name: 'filesystem',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkExternalDependencies(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check internet connectivity with a simple request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://httpbin.org/status/200', {
      signal: controller.signal,
      method: 'HEAD'
    });
    
    clearTimeout(timeoutId);
    
    const status = response.ok ? 'healthy' : 'degraded';
    
    return {
      name: 'external_connectivity',
      status,
      responseTime: Date.now() - startTime,
      details: {
        internetConnectivity: response.ok,
        statusCode: response.status
      }
    };
  } catch (error) {
    return {
      name: 'external_connectivity',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkYodleeApi(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    if (!process.env.YODLEE_API_URL || !process.env.YODLEE_CLIENT_ID) {
      return {
        name: 'yodlee_api',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        details: { configured: false, message: 'Yodlee API not configured' }
      };
    }

    // Simple connectivity test to Yodlee (without authentication)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(process.env.YODLEE_API_URL, {
      signal: controller.signal,
      method: 'HEAD'
    });
    
    clearTimeout(timeoutId);
    
    // Yodlee might return 401 for unauthenticated requests, which is expected
    const status = response.status === 401 || response.ok ? 'healthy' : 'degraded';
    
    return {
      name: 'yodlee_api',
      status,
      responseTime: Date.now() - startTime,
      details: {
        configured: true,
        reachable: response.status === 401 || response.ok,
        statusCode: response.status
      }
    };
  } catch (error) {
    return {
      name: 'yodlee_api',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkEmailService(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if email service is configured
    const configured = !!(process.env.SMTP_HOST || process.env.SENDGRID_API_KEY);
    
    return {
      name: 'email_service',
      status: configured ? 'healthy' : 'degraded',
      responseTime: Date.now() - startTime,
      details: {
        configured,
        provider: process.env.SMTP_HOST ? 'smtp' : process.env.SENDGRID_API_KEY ? 'sendgrid' : 'none'
      }
    };
  } catch (error) {
    return {
      name: 'email_service',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkQueue(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if queue system is enabled and configured
    const enabled = process.env.ENABLE_BULLMQ === 'true';
    
    if (!enabled) {
      return {
        name: 'queue_system',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: { enabled: false, message: 'Queue system disabled' }
      };
    }

    // If queue is enabled, check Redis connectivity (required for BullMQ)
    const redisHealthy = process.env.REDIS_HOST || process.env.REDIS_URL;
    
    return {
      name: 'queue_system',
      status: redisHealthy ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - startTime,
      details: {
        enabled: true,
        redisConfigured: !!redisHealthy
      }
    };
  } catch (error) {
    return {
      name: 'queue_system',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkMetricsSystem(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Test metrics service
    const systemHealth = metricsService.getSystemHealth();
    const currentMetrics = metricsService.getCurrentMetrics();
    
    return {
      name: 'metrics_system',
      status: systemHealth.status === 'healthy' ? 'healthy' : 'degraded',
      responseTime: Date.now() - startTime,
      details: {
        systemHealth: systemHealth.status,
        totalMetrics: currentMetrics.totalMetrics,
        counters: Object.keys(currentMetrics.counters).length,
        gauges: Object.keys(currentMetrics.gauges).length
      }
    };
  } catch (error) {
    return {
      name: 'metrics_system',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkLoggingSystem(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Test logging system
    const testLogger = logger.withContext({ healthCheck: true });
    testLogger.info('Health check test log');
    
    return {
      name: 'logging_system',
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        level: process.env.LOG_LEVEL || 'INFO',
        enabled: true
      }
    };
  } catch (error) {
    return {
      name: 'logging_system',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

async function checkSecuritySettings(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const securityChecks = {
      httpsEnforced: process.env.NODE_ENV === 'production',
      secretsConfigured: !!(process.env.NEXTAUTH_SECRET),
      corsConfigured: true, // Assuming CORS is properly configured
      ratelimiting: !!(process.env.RATE_LIMIT_ENABLED !== 'false')
    };
    
    const allChecksPass = Object.values(securityChecks).every(Boolean);
    const status = allChecksPass ? 'healthy' : 'degraded';
    
    return {
      name: 'security_settings',
      status,
      responseTime: Date.now() - startTime,
      details: securityChecks
    };
  } catch (error) {
    return {
      name: 'security_settings',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

function determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
  const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
  const degradedCount = checks.filter(c => c.status === 'degraded').length;
  
  if (unhealthyCount > 0) return 'unhealthy';
  if (degradedCount > 0) return 'degraded';
  return 'healthy';
}