/**
 * Circuit breaker pattern implementation for preventing cascade failures
 * Automatically opens when failure threshold is reached and provides fallback mechanisms
 */

import { logger } from '@/lib/logging/logger.service';
import { metricsService } from '../metrics.service';

export enum CircuitState {
  CLOSED = 'CLOSED',      // Normal operation
  OPEN = 'OPEN',          // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;        // Number of failures before opening
  successThreshold: number;        // Number of successes to close from half-open
  timeout: number;                 // Time to wait before trying half-open (ms)
  monitoringPeriod: number;        // Time window for counting failures (ms)
  expectedErrors?: Array<string>;  // Error types that don't count as failures
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  uptime: number;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttempt?: Date;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private createdAt: Date = new Date();

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {
    logger.info(`Circuit breaker '${name}' initialized`, {
      config: this.config,
      state: this.state
    });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        logger.info(`Circuit breaker '${this.name}' transitioning to HALF_OPEN`);
      } else {
        metricsService.increment(`circuit_breaker.${this.name}.rejected`, 1);
        if (fallback) {
          logger.warn(`Circuit breaker '${this.name}' is OPEN, using fallback`);
          return await fallback();
        }
        throw new CircuitBreakerOpenError(`Circuit breaker '${this.name}' is OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      
      // If we have a fallback and circuit is open, use it
      if (this.state === CircuitState.OPEN && fallback) {
        logger.warn(`Circuit breaker '${this.name}' failed, using fallback`, error as Error);
        return await fallback();
      }
      
      throw error;
    }
  }

  /**
   * Execute with automatic retry on failure
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000,
    fallback?: () => Promise<T>
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(operation, fallback);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if circuit is open
        if (error instanceof CircuitBreakerOpenError) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = backoffMs * Math.pow(2, attempt);
        logger.warn(`Circuit breaker '${this.name}' attempt ${attempt + 1} failed, retrying in ${delay}ms`, error as Error);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      uptime: Date.now() - this.createdAt.getTime()
    };
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = undefined;
    
    logger.info(`Circuit breaker '${this.name}' manually reset to CLOSED`);
    metricsService.increment(`circuit_breaker.${this.name}.reset`, 1);
  }

  /**
   * Force circuit breaker to open state
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = new Date(Date.now() + this.config.timeout);
    
    logger.warn(`Circuit breaker '${this.name}' manually forced to OPEN`);
    metricsService.increment(`circuit_breaker.${this.name}.forced_open`, 1);
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit breaker is available for requests
   */
  isAvailable(): boolean {
    return this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN;
  }

  private onSuccess(): void {
    this.totalSuccesses++;
    this.lastSuccessTime = new Date();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        
        logger.info(`Circuit breaker '${this.name}' transitioned to CLOSED after successful recovery`);
        metricsService.increment(`circuit_breaker.${this.name}.closed`, 1);
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in closed state
      this.failureCount = 0;
    }

    metricsService.increment(`circuit_breaker.${this.name}.success`, 1);
  }

  private onFailure(error: Error): void {
    this.totalFailures++;
    this.lastFailureTime = new Date();

    // Check if this is an expected error that shouldn't count as failure
    if (this.isExpectedError(error)) {
      logger.debug(`Circuit breaker '${this.name}' ignoring expected error: ${error.message}`);
      return;
    }

    this.failureCount++;
    metricsService.increment(`circuit_breaker.${this.name}.failure`, 1);

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state opens the circuit
      this.state = CircuitState.OPEN;
      this.nextAttempt = new Date(Date.now() + this.config.timeout);
      
      logger.warn(`Circuit breaker '${this.name}' transitioned to OPEN from HALF_OPEN due to failure`);
      metricsService.increment(`circuit_breaker.${this.name}.opened`, 1);
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we should open the circuit
      if (this.shouldOpen()) {
        this.state = CircuitState.OPEN;
        this.nextAttempt = new Date(Date.now() + this.config.timeout);
        
        logger.error(`Circuit breaker '${this.name}' transitioned to OPEN due to failure threshold`, error);
        metricsService.increment(`circuit_breaker.${this.name}.opened`, 1);
      }
    }
  }

  private shouldOpen(): boolean {
    // Check if we've exceeded the failure threshold within the monitoring period
    if (this.failureCount >= this.config.failureThreshold) {
      // Check if failures occurred within the monitoring period
      if (this.lastFailureTime) {
        const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
        return timeSinceLastFailure <= this.config.monitoringPeriod;
      }
      return true;
    }
    return false;
  }

  private shouldAttemptReset(): boolean {
    if (!this.nextAttempt) {
      return true;
    }
    return Date.now() >= this.nextAttempt.getTime();
  }

  private isExpectedError(error: Error): boolean {
    if (!this.config.expectedErrors) {
      return false;
    }

    return this.config.expectedErrors.some(expectedError => {
      return error.name === expectedError || 
             error.message.includes(expectedError) ||
             error.constructor.name === expectedError;
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Circuit Breaker Registry for managing multiple circuit breakers
 */
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();
  private defaultConfigs: Map<string, CircuitBreakerConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  /**
   * Get or create a circuit breaker
   */
  getBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const breakerConfig = config || this.getDefaultConfig(name);
      this.breakers.set(name, new CircuitBreaker(name, breakerConfig));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breakers and their metrics
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    
    this.breakers.forEach((breaker, name) => {
      metrics[name] = breaker.getMetrics();
    });
    
    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
    logger.info('All circuit breakers reset');
  }

  /**
   * Get circuit breaker by name (if exists)
   */
  getBreakerByName(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * Remove a circuit breaker
   */
  removeBreaker(name: string): boolean {
    return this.breakers.delete(name);
  }

  private initializeDefaultConfigs(): void {
    // Database operations
    this.defaultConfigs.set('database', {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
      expectedErrors: ['ConnectionError', 'TimeoutError']
    });

    // External API calls
    this.defaultConfigs.set('external_api', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 60000, // 1 minute
      monitoringPeriod: 120000, // 2 minutes
      expectedErrors: ['NetworkError', 'TimeoutError', 'RateLimitError']
    });

    // Yodlee API
    this.defaultConfigs.set('yodlee', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 120000, // 2 minutes
      monitoringPeriod: 300000, // 5 minutes
      expectedErrors: ['UnauthorizedError', 'RateLimitError', 'MaintenanceError']
    });

    // Email service
    this.defaultConfigs.set('email', {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      expectedErrors: ['RateLimitError', 'QuotaExceededError']
    });

    // Redis operations
    this.defaultConfigs.set('redis', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
      expectedErrors: ['ConnectionError', 'TimeoutError']
    });

    // Payment processing
    this.defaultConfigs.set('payment', {
      failureThreshold: 2, // Lower threshold for payments
      successThreshold: 3,
      timeout: 300000, // 5 minutes
      monitoringPeriod: 600000, // 10 minutes
      expectedErrors: ['ValidationError', 'InsufficientFundsError']
    });
  }

  private getDefaultConfig(name: string): CircuitBreakerConfig {
    // Try to find a matching default config
    for (const [pattern, config] of this.defaultConfigs.entries()) {
      if (name.includes(pattern)) {
        return config;
      }
    }

    // Default configuration
    return {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000,
      monitoringPeriod: 120000,
      expectedErrors: []
    };
  }
}

// Global registry instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

// Helper functions for common use cases
export function withCircuitBreaker<T>(
  name: string,
  operation: () => Promise<T>,
  fallback?: () => Promise<T>,
  config?: CircuitBreakerConfig
): Promise<T> {
  const breaker = circuitBreakerRegistry.getBreaker(name, config);
  return breaker.execute(operation, fallback);
}

export function withDatabaseCircuitBreaker<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  return withCircuitBreaker('database', operation, fallback);
}

export function withYodleeCircuitBreaker<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  return withCircuitBreaker('yodlee', operation, fallback);
}

export function withEmailCircuitBreaker<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  return withCircuitBreaker('email', operation, fallback);
}

export function withPaymentCircuitBreaker<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  return withCircuitBreaker('payment', operation, fallback);
}

export { CircuitBreaker };
export default CircuitBreaker;