import { logger } from '@/lib/logger';

/**
 * Safe JSON Parsing Utility
 * Prevents crashes from malformed JSON data in session management
 */

export interface SafeParseResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export interface SafeParseOptions<T> {
  fallback?: T;
  validator?: (data: any) => data is T;
  logErrors?: boolean;
  context?: string;
}

/**
 * Safely parse JSON string with comprehensive error handling
 * Prevents application crashes from corrupted localStorage/sessionStorage data
 */
export function safeJsonParse<T = any>(
  jsonString: string | null | undefined,
  options: SafeParseOptions<T> = {}
): SafeParseResult<T> {
  const { fallback = null, validator, logErrors = true, context = 'unknown' } = options;

  // Handle null/undefined input
  if (!jsonString) {
    return {
      success: false,
      data: fallback as T,
      error: 'Empty or null JSON string'
    };
  }

  // Handle empty string
  if (jsonString.trim() === '') {
    return {
      success: false,
      data: fallback as T,
      error: 'Empty JSON string'
    };
  }

  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate parsed data if validator provided
    if (validator && !validator(parsed)) {
      const error = `Parsed data failed validation in context: ${context}`;
      if (logErrors) {
        logger.warn('Safe JSON Parse - Validation failed:', {
          context,
          data: parsed,
          originalString: jsonString.substring(0, 100) + '...'
        });
      }
      return {
        success: false,
        data: fallback as T,
        error
      };
    }

    return {
      success: true,
      data: parsed as T,
      error: undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    
    if (logErrors) {
      logger.error('Safe JSON Parse - Parsing failed:', {
        context,
        error: errorMessage,
        originalString: jsonString.substring(0, 100) + '...'
      });
    }

    return {
      success: false,
      data: fallback as T,
      error: `JSON parsing failed: ${errorMessage}`
    };
  }
}

/**
 * Safe localStorage getter with JSON parsing
 */
export function safeGetLocalStorage<T = any>(
  key: string,
  options: SafeParseOptions<T> = {}
): SafeParseResult<T> {
  if (typeof window === 'undefined') {
    return {
      success: false,
      data: options.fallback as T,
      error: 'Not in browser environment'
    };
  }

  try {
    const value = localStorage.getItem(key);
    return safeJsonParse(value, {
      ...options,
      context: `localStorage.${key}`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown localStorage error';
    if (options.logErrors !== false) {
      logger.error('Safe localStorage get failed:', {
        key,
        error: errorMessage
      });
    }
    return {
      success: false,
      data: options.fallback as T,
      error: `localStorage access failed: ${errorMessage}`
    };
  }
}

/**
 * Safe localStorage setter with JSON stringification
 */
export function safeSetLocalStorage(
  key: string,
  value: any,
  logErrors: boolean = true
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown localStorage error';
    if (logErrors) {
      logger.error('Safe localStorage set failed:', {
        key,
        error: errorMessage,
        value: typeof value === 'object' ? '[Object]' : value
      });
    }
    return false;
  }
}

/**
 * Safe sessionStorage getter with JSON parsing
 */
export function safeGetSessionStorage<T = any>(
  key: string,
  options: SafeParseOptions<T> = {}
): SafeParseResult<T> {
  if (typeof window === 'undefined') {
    return {
      success: false,
      data: options.fallback as T,
      error: 'Not in browser environment'
    };
  }

  try {
    const value = sessionStorage.getItem(key);
    return safeJsonParse(value, {
      ...options,
      context: `sessionStorage.${key}`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown sessionStorage error';
    if (options.logErrors !== false) {
      logger.error('Safe sessionStorage get failed:', {
        key,
        error: errorMessage
      });
    }
    return {
      success: false,
      data: options.fallback as T,
      error: `sessionStorage access failed: ${errorMessage}`
    };
  }
}

/**
 * Type validators for common data structures
 */
export const validators = {
  isAuthSession: (data: any): data is { user: any; session_token: string; expires_at: string } => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.session_token === 'string' &&
      typeof data.expires_at === 'string' &&
      typeof data.user === 'object'
    );
  },

  isCredentials: (data: any): data is { email: string; password: string; name: string } => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.email === 'string' &&
      typeof data.password === 'string' &&
      typeof data.name === 'string'
    );
  },

  isNotificationArray: (data: any): data is any[] => {
    return Array.isArray(data);
  },

  isCacheEntry: (data: any): data is { timestamp: number; ttl: number; data: any } => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.timestamp === 'number' &&
      typeof data.ttl === 'number' &&
      'data' in data
    );
  }
};

/**
 * Cleanup corrupted localStorage/sessionStorage entries
 */
export function cleanupCorruptedStorage(): void {
  if (typeof window === 'undefined') return;

  const testKeys = [
    'income_clarity_session',
    'user_credentials',
    'income-clarity-notifications',
    'income-clarity-dismissed-badges',
    'income-clarity-visited-tabs',
    'income-clarity-achievements'
  ];

  testKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const result = safeJsonParse(value, { logErrors: false });
        if (!result.success) {
          logger.warn(`Removing corrupted localStorage entry: ${key}`);
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      logger.warn(`Error checking localStorage key ${key}, removing:`, error);
      try {
        localStorage.removeItem(key);
      } catch (removeError) {
        // Ignore removal errors
      }
    }
  });
}