// Environment Variable Loading Check
// Ensures proper environment configuration for production deployment

export interface EnvironmentCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  localModeEnabled: boolean;
  supabaseConfigured: boolean;
}

export function checkEnvironmentConfiguration(): EnvironmentCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check LOCAL_MODE configuration
  const localModeEnv = process.env.LOCAL_MODE;
  const publicLocalModeEnv = process.env.NEXT_PUBLIC_LOCAL_MODE;
  const localModeEnabled = localModeEnv === 'true' || publicLocalModeEnv === 'true';
  
  // console.log('🔧 Environment Configuration Check:', {
  //   NODE_ENV: process.env.NODE_ENV,
  //   LOCAL_MODE: localModeEnv,
  //   NEXT_PUBLIC_LOCAL_MODE: publicLocalModeEnv,
  //   localModeEnabled
  // });

  // Check Supabase configuration
  // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // const isSupabaseLocalhost = supabaseUrl?.includes('localhost') || supabaseUrl?.includes('127.0.0.1');
  // const isSupabasePlaceholder = supabaseUrl?.includes('placeholder') || supabaseKey?.includes('placeholder');
  // const supabaseConfigured = supabaseUrl && supabaseKey && !isSupabasePlaceholder;

  // Validation logic
  // if (!localModeEnabled && isSupabaseLocalhost) {
    // errors.push('LOCAL_MODE is false but NEXT_PUBLIC_SUPABASE_URL contains localhost. This will cause connection errors.');
  }

  // if (!localModeEnabled && !supabaseConfigured) {
    // warnings.push('LOCAL_MODE is false but Supabase credentials are not properly configured. App will fall back to mock mode.');
  }

  // if (localModeEnv === undefined && publicLocalModeEnv === undefined) {
    // warnings.push('Environment variables are not being loaded. Check your .env file configuration.');
  }

  // if (process.env.NODE_ENV === 'production' && isSupabaseLocalhost) {
    // errors.push('Production environment detected with localhost Supabase URL. This will fail in production.');
  }

  // return {
    // isValid: errors.length === 0,
    // errors,
    // warnings,
    // localModeEnabled,
    // supabaseConfigured: !!supabaseConfigured
  // };
}

// Auto-check on import
// if (typeof window === 'undefined') {
  // Only run on server-side to avoid duplicate client logs
  // const result = checkEnvironmentConfiguration();

  // if (result.errors.length > 0) {
    // console.error('🚨 Environment Configuration Errors:');
    // result.errors.forEach(error => console.error(`  ❌ ${error}`));
  }

  // if (result.warnings.length > 0) {
    // console.warn('⚠️ Environment Configuration Warnings:');
    // result.warnings.forEach(warning => console.warn(`  ⚠️ ${warning}`));
  }

  // if (result.isValid) {
    // console.log('✅ Environment configuration is valid');
  }
}