/**
 * ============================================================================
 * ENVIRONMENT UTILITIES
 * Critical: Runtime environment detection and validation
 * Prevents environment confusion and deployment errors
 * ============================================================================
 */

export type EnvironmentType = 'development' | 'production' | 'test' | 'staging' | 'lite_production' | 'unknown';

export interface EnvironmentInfo {
  // Runtime environment
  runtime: EnvironmentType;
  
  // Configuration environment
  config: EnvironmentType;
  
  // Public environment identifier
  public: string;
  
  // Application URL
  appUrl: string;
  
  // Special modes
  isLiteProduction: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  
  // Environment consistency
  isConsistent: boolean;
  hasWarnings: boolean;
  warnings: string[];
  errors: string[];
  
  // Meta information
  timestamp: string;
  userAgent?: string;
  hostname?: string;
}

export interface EnvironmentConfig {
  name: string;
  displayName: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  icon: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  allowDeployment: boolean;
  requiresConfirmation: boolean;
}

/**
 * Environment configurations for visual display and validation
 */
export const ENVIRONMENT_CONFIGS: Record<string, EnvironmentConfig> = {
  development: {
    name: 'development',
    displayName: 'DEV',
    color: '#3B82F6', // Blue
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
    icon: '🛠️',
    riskLevel: 'low',
    description: 'Development environment - Safe for testing',
    allowDeployment: true,
    requiresConfirmation: false,
  },
  
  staging: {
    name: 'staging',
    displayName: 'STAGING',
    color: '#F59E0B', // Yellow
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#F59E0B',
    icon: '🧪',
    riskLevel: 'medium',
    description: 'Staging environment - Pre-production testing',
    allowDeployment: true,
    requiresConfirmation: true,
  },
  
  lite_production: {
    name: 'lite_production',
    displayName: 'LITE PROD',
    color: '#8B5CF6', // Purple
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8B5CF6',
    icon: '🌙',
    riskLevel: 'medium',
    description: 'Lite production - SQLite with production features',
    allowDeployment: true,
    requiresConfirmation: true,
  },
  
  production: {
    name: 'production',
    displayName: 'PROD',
    color: '#EF4444', // Red
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    icon: '🚨',
    riskLevel: 'critical',
    description: 'Production environment - Live system with real users',
    allowDeployment: true,
    requiresConfirmation: true,
  },
  
  test: {
    name: 'test',
    displayName: 'TEST',
    color: '#10B981', // Green
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
    icon: '✅',
    riskLevel: 'low',
    description: 'Test environment - Automated testing',
    allowDeployment: false,
    requiresConfirmation: false,
  },
  
  unknown: {
    name: 'unknown',
    displayName: 'UNKNOWN',
    color: '#6B7280', // Gray
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: '#6B7280',
    icon: '❓',
    riskLevel: 'high',
    description: 'Unknown environment - Verify configuration',
    allowDeployment: false,
    requiresConfirmation: true,
  },
};

/**
 * Detects current runtime environment
 */
export function getRuntimeEnvironment(): EnvironmentType {
  // Check Node.js runtime environment
  if (typeof process !== 'undefined' && process.env) {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    
    switch (nodeEnv) {
      case 'development':
      case 'dev':
        return 'development';
      case 'production':
      case 'prod':
        return 'production';
      case 'test':
      case 'testing':
        return 'test';
      case 'staging':
        return 'staging';
      default:
        return 'unknown';
    }
  }
  
  // Browser environment detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    } else if (hostname.includes('incomeclarity.ddns.net')) {
      return 'lite_production';
    } else {
      return 'unknown';
    }
  }
  
  return 'unknown';
}

/**
 * Gets configuration environment from environment variables
 */
export function getConfigEnvironment(): EnvironmentType {
  if (typeof process !== 'undefined' && process.env) {
    // Check NEXT_PUBLIC_ENVIRONMENT first
    const publicEnv = process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase();
    
    switch (publicEnv) {
      case 'development':
        return 'development';
      case 'lite_production':
      case 'lite-production':
        return 'lite_production';
      case 'production':
        return 'production';
      case 'staging':
        return 'staging';
      case 'test':
        return 'test';
    }
    
    // Fallback to NODE_ENV
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    return nodeEnv === 'production' ? 'production' : 
           nodeEnv === 'development' ? 'development' :
           nodeEnv === 'test' ? 'test' :
           'unknown';
  }
  
  return 'unknown';
}

/**
 * Gets comprehensive environment information
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  const runtime = getRuntimeEnvironment();
  const config = getConfigEnvironment();
  const public_env = typeof process !== 'undefined' ? 
    (process.env.NEXT_PUBLIC_ENVIRONMENT || 'unknown') : 'unknown';
  const appUrl = typeof process !== 'undefined' ? 
    (process.env.NEXT_PUBLIC_APP_URL || 'unknown') : 
    (typeof window !== 'undefined' ? window.location.origin : 'unknown');
  
  const isLiteProduction = typeof process !== 'undefined' && 
    process.env.LITE_PRODUCTION_MODE === 'true';
  
  const isDevelopment = runtime === 'development';
  const isProduction = runtime === 'production' || config === 'production' || isLiteProduction;
  const isTest = runtime === 'test';
  
  // Consistency checks
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check for runtime vs config mismatch
  if (runtime !== config && config !== 'unknown') {
    errors.push(`Runtime environment (${runtime}) doesn't match config (${config})`);
  }
  
  // Check for URL vs environment mismatch
  if (appUrl.includes('localhost') && config === 'production') {
    errors.push('Production config with localhost URL');
  }
  
  if (appUrl.includes('incomeclarity.ddns.net') && runtime === 'development') {
    warnings.push('Development runtime with production URL');
  }
  
  // Check for lite production inconsistencies
  if (isLiteProduction && config !== 'production' && public_env !== 'lite_production') {
    warnings.push('Lite production mode enabled but environment not configured properly');
  }
  
  const isConsistent = errors.length === 0;
  const hasWarnings = warnings.length > 0;
  
  return {
    runtime,
    config,
    public: public_env,
    appUrl,
    isLiteProduction,
    isDevelopment,
    isProduction,
    isTest,
    isConsistent,
    hasWarnings,
    warnings,
    errors,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    hostname: typeof window !== 'undefined' ? window.location.hostname : undefined,
  };
}

/**
 * Gets environment configuration for display
 */
export function getEnvironmentConfig(environment?: string): EnvironmentConfig {
  if (!environment) {
    const info = getEnvironmentInfo();
    environment = info.isLiteProduction ? 'lite_production' : info.runtime;
  }
  
  return ENVIRONMENT_CONFIGS[environment] || ENVIRONMENT_CONFIGS.unknown;
}

/**
 * Checks if current environment is safe for deployment
 */
export function isDeploymentSafe(): boolean {
  const info = getEnvironmentInfo();
  return info.isConsistent && info.errors.length === 0;
}

/**
 * Validates environment for specific operation
 */
export function validateEnvironmentForOperation(operation: string): {
  allowed: boolean;
  requiresConfirmation: boolean;
  warnings: string[];
  errors: string[];
} {
  const info = getEnvironmentInfo();
  const config = getEnvironmentConfig();
  
  const warnings: string[] = [...info.warnings];
  const errors: string[] = [...info.errors];
  
  // Check if deployment is allowed
  let allowed = config.allowDeployment;
  let requiresConfirmation = config.requiresConfirmation;
  
  // Override for critical errors
  if (!info.isConsistent) {
    allowed = false;
    errors.push('Environment configuration is inconsistent');
  }
  
  // Special handling for production operations
  if (info.isProduction || config.riskLevel === 'critical') {
    requiresConfirmation = true;
    
    if (operation === 'deploy' || operation === 'restart' || operation === 'stop') {
      warnings.push(`${operation} operation on production environment requires extra caution`);
    }
  }
  
  return {
    allowed,
    requiresConfirmation,
    warnings,
    errors,
  };
}

/**
 * Browser-safe environment detection
 */
export function getBrowserEnvironment(): EnvironmentInfo | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Use client-side environment detection
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  
  let runtime: EnvironmentType = 'unknown';
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    runtime = 'development';
  } else if (hostname.includes('staging')) {
    runtime = 'staging';
  } else if (hostname.includes('incomeclarity.ddns.net')) {
    runtime = 'lite_production';
  }
  
  return {
    runtime,
    config: 'unknown', // Cannot detect config in browser
    public: 'browser',
    appUrl: origin,
    isLiteProduction: hostname.includes('incomeclarity.ddns.net'),
    isDevelopment: runtime === 'development',
    isProduction: runtime === 'lite_production',
    isTest: false,
    isConsistent: true, // Assume consistent in browser
    hasWarnings: false,
    warnings: [],
    errors: [],
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    hostname,
  };
}

/**
 * Environment logging utility
 */
export function logEnvironmentInfo(): void {
  const info = getEnvironmentInfo();
  const config = getEnvironmentConfig();
  
  console.group(`🌐 Environment Information`);
  console.log(`Runtime: ${info.runtime}`);
  console.log(`Config: ${info.config}`);
  console.log(`Public: ${info.public}`);
  console.log(`URL: ${info.appUrl}`);
  console.log(`Display: ${config.displayName} ${config.icon}`);
  console.log(`Risk Level: ${config.riskLevel}`);
  
  if (info.warnings.length > 0) {
    console.warn('Warnings:', info.warnings);
  }
  
  if (info.errors.length > 0) {
    console.error('Errors:', info.errors);
  }
  
  console.groupEnd();
}