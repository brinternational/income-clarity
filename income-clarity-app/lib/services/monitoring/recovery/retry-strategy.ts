/**
 * Comprehensive retry strategy implementation with exponential backoff, jitter, and max retry limits
 * Provides different retry patterns for various types of operations and failures
 */

import { logger } from '@/lib/services/logging/logger.service';
import { metricsService } from '../metrics.service';

export enum RetryStrategy {
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  FIXED = 'fixed',
  FIBONACCI = 'fibonacci'
}

export interface RetryConfig {
  maxRetries: number;
  strategy: RetryStrategy;
  initialDelay: number;
  maxDelay: number;
  jitter: boolean;
  jitterFactor: number;
  multiplier: number;
  retryableErrors?: Array<string | RegExp>;
  nonRetryableErrors?: Array<string | RegExp>;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface RetryResult<T> {
  result: T;
  attempts: number;
  totalDelay: number;
  lastError?: Error;
}

export interface RetryAttempt {
  attempt: number;
  startTime: number;
  endTime?: number;
  error?: Error;
  delay?: number;
}

class RetryExecutor {
  private attempts: RetryAttempt[] = [];
  private startTime: number = Date.now();

  constructor(
    private operationName: string,
    private config: RetryConfig
  ) {}

  /**
   * Execute an operation with retry logic
   */
  async execute<T>(operation: () => Promise<T>): Promise<RetryResult<T>> {
    let lastError: Error | undefined;
    let totalDelay = 0;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      const attemptInfo: RetryAttempt = {
        attempt,
        startTime: Date.now()
      };

      try {
        const result = await operation();
        attemptInfo.endTime = Date.now();
        this.attempts.push(attemptInfo);

        // Log successful execution
        if (attempt > 0) {
          logger.info(`Operation '${this.operationName}' succeeded after ${attempt} retries`, {
            attempts: attempt + 1,
            totalDelay,
            duration: Date.now() - this.startTime
          });
        }

        // Track metrics
        metricsService.increment(`retry.${this.operationName}.success`, 1, {
          attempts: (attempt + 1).toString()
        });

        return {
          result,
          attempts: attempt + 1,
          totalDelay,
          lastError
        };

      } catch (error) {
        lastError = error as Error;
        attemptInfo.error = lastError;
        attemptInfo.endTime = Date.now();
        this.attempts.push(attemptInfo);

        // Check if we should retry this error
        if (!this.shouldRetryError(lastError, attempt)) {
          logger.warn(`Operation '${this.operationName}' failed with non-retryable error`, lastError);
          metricsService.increment(`retry.${this.operationName}.non_retryable`, 1);
          throw lastError;
        }

        // Don't retry if we've reached max attempts
        if (attempt >= this.config.maxRetries) {
          logger.error(`Operation '${this.operationName}' failed after ${attempt + 1} attempts`, lastError, {
            totalDelay,
            duration: Date.now() - this.startTime,
            attempts: this.attempts
          });
          
          metricsService.increment(`retry.${this.operationName}.max_retries_exceeded`, 1);
          throw lastError;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt + 1);
        attemptInfo.delay = delay;
        totalDelay += delay;

        // Call retry callback if provided
        if (this.config.onRetry) {
          this.config.onRetry(attempt + 1, lastError, delay);
        }

        logger.warn(`Operation '${this.operationName}' attempt ${attempt + 1} failed, retrying in ${delay}ms`, lastError);
        
        metricsService.increment(`retry.${this.operationName}.attempt`, 1, {
          attempt: (attempt + 1).toString()
        });

        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError;
  }

  /**
   * Get retry execution details
   */
  getExecutionDetails() {
    return {
      operationName: this.operationName,
      config: this.config,
      attempts: this.attempts,
      totalDuration: Date.now() - this.startTime
    };
  }

  private shouldRetryError(error: Error, attempt: number): boolean {
    // Check custom shouldRetry function first
    if (this.config.shouldRetry) {
      return this.config.shouldRetry(error, attempt);
    }

    // Check non-retryable errors
    if (this.config.nonRetryableErrors) {
      for (const pattern of this.config.nonRetryableErrors) {
        if (this.matchesPattern(error, pattern)) {
          return false;
        }
      }
    }

    // Check retryable errors
    if (this.config.retryableErrors && this.config.retryableErrors.length > 0) {
      for (const pattern of this.config.retryableErrors) {
        if (this.matchesPattern(error, pattern)) {
          return true;
        }
      }
      return false; // If retryable errors are specified, only retry those
    }

    // Default retryable conditions
    return this.isDefaultRetryableError(error);
  }

  private matchesPattern(error: Error, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return error.name === pattern || 
             error.message.includes(pattern) ||
             error.constructor.name === pattern;
    } else {
      return pattern.test(error.message) || 
             pattern.test(error.name) ||
             pattern.test(error.constructor.name);
    }
  }

  private isDefaultRetryableError(error: Error): boolean {
    // Common retryable error patterns
    const retryablePatterns = [
      'timeout',
      'network',
      'connection',
      'econnreset',
      'enotfound',
      'econnrefused',
      'socket hang up',
      'rate limit',
      'service unavailable',
      'internal server error',
      '500',
      '502',
      '503',
      '504'
    ];

    const errorText = (error.message + ' ' + error.name).toLowerCase();
    return retryablePatterns.some(pattern => errorText.includes(pattern));
  }

  private calculateDelay(attempt: number): number {
    let delay: number;

    switch (this.config.strategy) {
      case RetryStrategy.EXPONENTIAL:
        delay = this.config.initialDelay * Math.pow(this.config.multiplier, attempt - 1);
        break;

      case RetryStrategy.LINEAR:
        delay = this.config.initialDelay * attempt;
        break;

      case RetryStrategy.FIXED:
        delay = this.config.initialDelay;
        break;

      case RetryStrategy.FIBONACCI:
        delay = this.config.initialDelay * this.fibonacci(attempt);
        break;

      default:
        delay = this.config.initialDelay * Math.pow(2, attempt - 1);
    }

    // Apply max delay limit
    delay = Math.min(delay, this.config.maxDelay);

    // Apply jitter if enabled
    if (this.config.jitter) {
      const jitterAmount = delay * this.config.jitterFactor;
      const jitterRange = jitterAmount * 2;
      const jitterOffset = (Math.random() * jitterRange) - jitterAmount;
      delay = Math.max(0, delay + jitterOffset);
    }

    return Math.round(delay);
  }

  private fibonacci(n: number): number {
    if (n <= 1) return 1;
    if (n === 2) return 2;
    
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Predefined retry configurations for common scenarios
 */
export const RetryConfigs = {
  // Database operations
  database: {
    maxRetries: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    initialDelay: 1000,
    maxDelay: 10000,
    jitter: true,
    jitterFactor: 0.1,
    multiplier: 2,
    retryableErrors: ['ConnectionError', 'TimeoutError', 'DatabaseBusyError'],
    nonRetryableErrors: ['ValidationError', 'ConstraintError', 'AuthenticationError']
  } as RetryConfig,

  // External API calls
  externalApi: {
    maxRetries: 5,
    strategy: RetryStrategy.EXPONENTIAL,
    initialDelay: 500,
    maxDelay: 30000,
    jitter: true,
    jitterFactor: 0.2,
    multiplier: 2,
    retryableErrors: [/5\d\d/, /network/i, /timeout/i, /rate.?limit/i],
    nonRetryableErrors: [/4\d\d/, 'ValidationError', 'AuthenticationError']
  } as RetryConfig,

  // Yodlee API specific
  yodlee: {
    maxRetries: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    initialDelay: 2000,
    maxDelay: 60000,
    jitter: true,
    jitterFactor: 0.15,
    multiplier: 3,
    retryableErrors: ['ServiceUnavailableError', 'RateLimitError', 'TimeoutError'],
    nonRetryableErrors: ['InvalidCredentialsError', 'AccountNotFoundError', 'ValidationError']
  } as RetryConfig,

  // Payment processing
  payment: {
    maxRetries: 2, // Lower retries for payments
    strategy: RetryStrategy.LINEAR,
    initialDelay: 3000,
    maxDelay: 10000,
    jitter: false, // No jitter for payments for consistency
    jitterFactor: 0,
    multiplier: 1,
    retryableErrors: ['NetworkError', 'GatewayTimeoutError'],
    nonRetryableErrors: ['InsufficientFundsError', 'CardDeclinedError', 'ValidationError', 'FraudError']
  } as RetryConfig,

  // Email sending
  email: {
    maxRetries: 4,
    strategy: RetryStrategy.EXPONENTIAL,
    initialDelay: 1000,
    maxDelay: 30000,
    jitter: true,
    jitterFactor: 0.1,
    multiplier: 2,
    retryableErrors: ['RateLimitError', 'ServiceUnavailableError', 'NetworkError'],
    nonRetryableErrors: ['InvalidEmailError', 'QuotaExceededError', 'AuthenticationError']
  } as RetryConfig,

  // File operations
  fileSystem: {
    maxRetries: 3,
    strategy: RetryStrategy.FIXED,
    initialDelay: 500,
    maxDelay: 5000,
    jitter: false,
    jitterFactor: 0,
    multiplier: 1,
    retryableErrors: ['EBUSY', 'EAGAIN', 'ENOENT'],
    nonRetryableErrors: ['EACCES', 'EPERM', 'ENOTDIR']
  } as RetryConfig,

  // Quick operations
  quick: {
    maxRetries: 2,
    strategy: RetryStrategy.FIXED,
    initialDelay: 100,
    maxDelay: 1000,
    jitter: true,
    jitterFactor: 0.1,
    multiplier: 1
  } as RetryConfig,

  // Aggressive retry for critical operations
  aggressive: {
    maxRetries: 10,
    strategy: RetryStrategy.FIBONACCI,
    initialDelay: 100,
    maxDelay: 60000,
    jitter: true,
    jitterFactor: 0.2,
    multiplier: 1
  } as RetryConfig
};

/**
 * Main retry function with configurable strategy
 */
export async function withRetry<T>(
  operationName: string,
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const fullConfig: RetryConfig = {
    maxRetries: 3,
    strategy: RetryStrategy.EXPONENTIAL,
    initialDelay: 1000,
    maxDelay: 30000,
    jitter: true,
    jitterFactor: 0.1,
    multiplier: 2,
    ...config
  };

  const executor = new RetryExecutor(operationName, fullConfig);
  return executor.execute(operation);
}

/**
 * Simplified retry function that returns the result directly
 */
export async function retry<T>(
  operationName: string,
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const result = await withRetry(operationName, operation, config);
  return result.result;
}

/**
 * Retry with predefined configuration
 */
export async function retryWithConfig<T>(
  operationName: string,
  operation: () => Promise<T>,
  configName: keyof typeof RetryConfigs
): Promise<T> {
  const config = RetryConfigs[configName];
  const result = await withRetry(operationName, operation, config);
  return result.result;
}

// Helper functions for common scenarios
export function retryDatabaseOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return retryWithConfig(operationName, operation, 'database');
}

export function retryExternalApiCall<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return retryWithConfig(operationName, operation, 'externalApi');
}

export function retryYodleeOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return retryWithConfig(operationName, operation, 'yodlee');
}

export function retryPaymentOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return retryWithConfig(operationName, operation, 'payment');
}

export function retryEmailOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return retryWithConfig(operationName, operation, 'email');
}

/**
 * Decorator for automatic retry
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operationName = `${target.constructor.name}.${propertyKey}`;
      
      return retry(operationName, async () => {
        return originalMethod.apply(this, args);
      }, config);
    };

    return descriptor;
  };
}

/**
 * Async iterator with retry support
 */
export async function* retryIterator<T>(
  operationName: string,
  operations: Array<() => Promise<T>>,
  config: Partial<RetryConfig> = {}
): AsyncGenerator<RetryResult<T>, void, unknown> {
  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await withRetry(`${operationName}_${i}`, operations[i], config);
      yield result;
    } catch (error) {
      logger.error(`Retry iterator operation ${i} failed permanently`, error as Error);
      throw error;
    }
  }
}

/**
 * Batch retry - retry multiple operations with the same config
 */
export async function retryBatch<T>(
  operationName: string,
  operations: Array<() => Promise<T>>,
  config: Partial<RetryConfig> = {}
): Promise<Array<RetryResult<T>>> {
  const results: Array<RetryResult<T>> = [];
  
  for await (const result of retryIterator(operationName, operations, config)) {
    results.push(result);
  }
  
  return results;
}

/**
 * Create a retry-enabled version of a function
 */
export function createRetryableFunction<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  operationName: string,
  config: Partial<RetryConfig> = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    return retry(operationName, () => fn(...args), config);
  };
}

export default {
  withRetry,
  retry,
  retryWithConfig,
  RetryConfigs,
  RetryStrategy,
  Retry
};