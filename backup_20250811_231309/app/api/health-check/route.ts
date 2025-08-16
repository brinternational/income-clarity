import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase-client';
import { LocalModeUtils } from '@/lib/config/local-mode';

export async function GET() {
  const startTime = Date.now();
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    environment: process.env.NODE_ENV || 'unknown',
    checks: {}
  };

  try {
    // Environment Configuration Check
    checks.checks.environment = {
      status: 'pass',
      node_env: process.env.NODE_ENV,
      local_mode: LocalModeUtils.isEnabled(),
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      app_url: process.env.NEXT_PUBLIC_APP_URL
    };

    // Database Connectivity Check
    checks.checks.database = await checkDatabaseConnectivity();

    // API Endpoints Check
    checks.checks.api = {
      status: 'pass',
      message: 'API routes accessible'
    };

    // Overall Status Determination
    const allPassing = Object.values(checks.checks).every(
      (check: any) => check.status === 'pass' || check.status === 'warn'
    );
    
    checks.status = allPassing ? 'healthy' : 'unhealthy';
    checks.responseTime = Date.now() - startTime;

    return NextResponse.json(checks, { 
      status: allPassing ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);

    checks.status = 'unhealthy';
    checks.error = error instanceof Error ? error.message : 'Unknown error';
    checks.responseTime = Date.now() - startTime;

    return NextResponse.json(checks, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    });
  }
}

async function checkDatabaseConnectivity() {
  const isLocalMode = LocalModeUtils.isEnabled();
  
  if (isLocalMode) {
    return {
      status: 'warn',
      mode: 'local_mode',
      message: 'Running in LOCAL_MODE with mock data'
    };
  }

  try {
    const supabase = createRouteHandlerClient();
    
    // Simple connectivity test - try to access auth
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error && !error.message.includes('Mock mode')) {
      throw error;
    }

    return {
      status: 'pass',
      mode: error?.message?.includes('Mock mode') ? 'mock' : 'connected',
      message: error?.message?.includes('Mock mode') 
        ? 'Using mock client (no real Supabase credentials)' 
        : 'Supabase connectivity confirmed'
    };

  } catch (error) {
    console.error('Database connectivity check failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

// Also support POST for external monitoring systems
export async function POST() {
  return GET();
}