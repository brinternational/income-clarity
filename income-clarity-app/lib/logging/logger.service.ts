/**
 * Production-grade structured logging service
 * Provides comprehensive logging with context injection, correlation IDs, and structured output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  operation?: string;
  component?: string;
  version?: string;
  environment?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number;
    memory: number;
  };
  metadata?: Record<string, any>;
}

class LoggerService {
  private currentLevel: LogLevel;
  private context: LogContext = {};
  private transports: LogTransport[] = [];

  constructor(
    private component: string,
    initialContext: LogContext = {}
  ) {
    this.currentLevel = this.getLogLevel();
    this.context = {
      component,
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.APP_VERSION || '1.0.0',
      ...initialContext
    };

    // Initialize default transports
    this.addTransport(new ConsoleTransport());
    
    // Only add file transport on server-side
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      this.addTransport(new FileTransport());
      // Add external services in production
      if (process.env.SENTRY_DSN) {
        this.addTransport(new SentryTransport());
      }
    }
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return LogLevel[level as keyof typeof LogLevel] ?? LogLevel.INFO;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  withContext(context: LogContext): LoggerService {
    return new LoggerService(this.component, { ...this.context, ...context });
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, metadata, error);
  }

  // Performance logging
  time(operation: string): PerformanceLogger {
    return new PerformanceLogger(this, operation);
  }

  // Security and audit logging
  audit(event: string, details: Record<string, any>): void {
    this.info(`AUDIT: ${event}`, {
      audit: true,
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Business metrics logging
  metric(name: string, value: number, tags?: Record<string, string>): void {
    this.info(`METRIC: ${name}`, {
      metric: true,
      name,
      value,
      tags,
      timestamp: new Date().toISOString()
    });
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: this.context,
      metadata
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    // Add performance metrics if available
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      entry.performance = {
        duration: 0, // Will be set by PerformanceLogger
        memory: memUsage.heapUsed
      };
    }

    // Send to all transports
    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (transportError) {
        // Fallback to console if transport fails
        console.error('Logger transport failed:', transportError);
        console.log(entry);
      }
    });
  }
}

export class PerformanceLogger {
  private startTime: number;
  private startMemory: number;

  constructor(
    private logger: LoggerService,
    private operation: string
  ) {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage?.()?.heapUsed || 0;
    this.logger.debug(`Starting operation: ${operation}`);
  }

  end(message?: string, metadata?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;
    const memoryDelta = (process.memoryUsage?.()?.heapUsed || 0) - this.startMemory;

    this.logger.info(
      message || `Completed operation: ${this.operation}`,
      {
        operation: this.operation,
        duration,
        memoryDelta,
        ...metadata
      }
    );
  }

  fail(error: Error, metadata?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;
    this.logger.error(
      `Failed operation: ${this.operation}`,
      error,
      {
        operation: this.operation,
        duration,
        ...metadata
      }
    );
  }
}

// Transport interfaces
export interface LogTransport {
  log(entry: LogEntry): void;
}

export class ConsoleTransport implements LogTransport {
  log(entry: LogEntry): void {
    const colorMap = {
      DEBUG: '\x1b[36m', // cyan
      INFO: '\x1b[32m',  // green
      WARN: '\x1b[33m',  // yellow
      ERROR: '\x1b[31m', // red
      FATAL: '\x1b[35m'  // magenta
    };

    const reset = '\x1b[0m';
    const color = colorMap[entry.level as keyof typeof colorMap] || '';

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${color}[${entry.timestamp}] ${entry.level}${reset} ${entry.context.component}: ${entry.message}`,
        entry.metadata ? entry.metadata : '',
        entry.error ? entry.error : ''
      );
    } else {
      // Structured JSON in production
      console.log(JSON.stringify(entry));
    }
  }
}

export class FileTransport implements LogTransport {
  private logFile: string;

  constructor() {
    // Only initialize on server-side
    if (typeof window === 'undefined') {
      const date = new Date().toISOString().split('T')[0];
      this.logFile = `logs/app-${date}.log`;
      
      // Ensure logs directory exists
      try {
        const fs = require('fs');
        if (!fs.existsSync('logs')) {
          fs.mkdirSync('logs', { recursive: true });
        }
      } catch (error) {
        console.error('Could not create logs directory:', error);
      }
    }
  }

  log(entry: LogEntry): void {
    // Only run on server-side
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const logLine = JSON.stringify(entry) + '\n';
        fs.appendFileSync(this.logFile, logLine);
      } catch (error) {
        console.error('File transport failed:', error);
      }
    }
  }
}

export class SentryTransport implements LogTransport {
  log(entry: LogEntry): void {
    // Only log errors and fatals to Sentry to avoid noise
    if (entry.level === 'ERROR' || entry.level === 'FATAL') {
      try {
        // This would integrate with Sentry SDK
        // Sentry.captureException or Sentry.captureMessage
        console.log('Would send to Sentry:', entry);
      } catch (error) {
        console.error('Sentry transport failed:', error);
      }
    }
  }
}

// Factory function for backward compatibility
export function createLogger(component: string, context?: LogContext): LoggerService {
  return new LoggerService(component, context);
}

// Main Logger class for backward compatibility
export class Logger extends LoggerService {
  constructor(component: string, context?: LogContext) {
    super(component, context);
  }
}

// Default logger instance
export const logger = createLogger('Application');

// Request-scoped logger with correlation ID
export function createRequestLogger(requestId: string, userId?: string): LoggerService {
  return createLogger('Request', { requestId, userId });
}

export default LoggerService;