/**
 * Audit logging service for security events, data access, and compliance
 * Ensures immutable audit trails for regulatory compliance (GDPR, SOC 2, PCI DSS)
 */

import LoggerService, { LogContext } from './logger.service';
import crypto from 'crypto';

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  TOKEN_REFRESH = 'auth.token.refresh',
  PASSWORD_CHANGE = 'auth.password.change',
  
  // Authorization events
  ACCESS_GRANTED = 'authz.access.granted',
  ACCESS_DENIED = 'authz.access.denied',
  PERMISSION_CHANGE = 'authz.permission.change',
  
  // Data access events
  DATA_READ = 'data.read',
  DATA_CREATE = 'data.create',
  DATA_UPDATE = 'data.update',
  DATA_DELETE = 'data.delete',
  DATA_EXPORT = 'data.export',
  DATA_IMPORT = 'data.import',
  
  // Financial data events
  PORTFOLIO_VIEW = 'portfolio.view',
  TRANSACTION_VIEW = 'transaction.view',
  ACCOUNT_LINK = 'account.link',
  ACCOUNT_UNLINK = 'account.unlink',
  SYNC_INITIATED = 'sync.initiated',
  SYNC_COMPLETED = 'sync.completed',
  
  // Payment events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILURE = 'payment.failure',
  SUBSCRIPTION_CHANGE = 'subscription.change',
  
  // Admin events
  ADMIN_ACCESS = 'admin.access',
  CONFIG_CHANGE = 'admin.config.change',
  USER_IMPERSONATE = 'admin.user.impersonate',
  SYSTEM_MAINTENANCE = 'admin.maintenance',
  
  // Security events
  SUSPICIOUS_ACTIVITY = 'security.suspicious',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit',
  INVALID_REQUEST = 'security.invalid_request',
  BRUTE_FORCE_ATTEMPT = 'security.brute_force',
  
  // Privacy events
  GDPR_REQUEST = 'privacy.gdpr.request',
  DATA_RETENTION_CLEANUP = 'privacy.retention.cleanup',
  CONSENT_CHANGE = 'privacy.consent.change'
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  result: 'SUCCESS' | 'FAILURE' | 'ERROR';
  details: Record<string, any>;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retentionYears: number;
  checksum: string;
}

export interface AuditContext extends LogContext {
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  sensitivity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class AuditLoggerService {
  private logger: LoggerService;
  private secretKey: string;

  constructor() {
    this.logger = new LoggerService('AuditLogger');
    this.secretKey = process.env.AUDIT_SECRET_KEY || 'default-audit-key';
  }

  /**
   * Log authentication events
   */
  logAuth(
    eventType: AuditEventType,
    userId: string,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any> = {}
  ): void {
    this.createAuditEvent(eventType, context, result, {
      userId,
      ...details
    }, 'MEDIUM', 7); // 7 years for auth events
  }

  /**
   * Log data access events
   */
  logDataAccess(
    eventType: AuditEventType,
    userId: string,
    resource: string,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any> = {}
  ): void {
    this.createAuditEvent(eventType, { ...context, resource }, result, {
      userId,
      resource,
      ...details
    }, 'HIGH', 7);
  }

  /**
   * Log financial operations
   */
  logFinancialOperation(
    eventType: AuditEventType,
    userId: string,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any> = {}
  ): void {
    this.createAuditEvent(eventType, context, result, {
      userId,
      ...details
    }, 'CRITICAL', 10); // 10 years for financial data
  }

  /**
   * Log payment events (PCI DSS compliance)
   */
  logPayment(
    eventType: AuditEventType,
    userId: string,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any> = {}
  ): void {
    // Ensure no sensitive payment data is logged
    const sanitizedDetails = this.sanitizePaymentDetails(details);
    
    this.createAuditEvent(eventType, context, result, {
      userId,
      ...sanitizedDetails
    }, 'CRITICAL', 7);
  }

  /**
   * Log admin operations
   */
  logAdminOperation(
    eventType: AuditEventType,
    adminUserId: string,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any> = {}
  ): void {
    this.createAuditEvent(eventType, context, result, {
      adminUserId,
      ...details
    }, 'CRITICAL', 10);
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    eventType: AuditEventType,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any> = {}
  ): void {
    this.createAuditEvent(eventType, context, result, details, 'CRITICAL', 7);
  }

  /**
   * Log GDPR and privacy events
   */
  logPrivacyEvent(
    eventType: AuditEventType,
    userId: string,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any> = {}
  ): void {
    this.createAuditEvent(eventType, context, result, {
      userId,
      ...details
    }, 'HIGH', 7);
  }

  private createAuditEvent(
    eventType: AuditEventType,
    context: AuditContext,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    details: Record<string, any>,
    sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    retentionYears: number
  ): void {
    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const auditEvent: AuditEvent = {
      id: eventId,
      timestamp,
      eventType,
      userId: context.userId,
      sessionId: context.sessionId,
      requestId: context.requestId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      resource: context.resource,
      action: context.action,
      result,
      details: this.sanitizeDetails(details, sensitivity),
      sensitivity,
      retentionYears,
      checksum: ''
    };

    // Generate checksum for integrity
    auditEvent.checksum = this.generateChecksum(auditEvent);

    // Log to structured logger
    this.logger.info(`AUDIT: ${eventType}`, {
      audit: true,
      auditEvent,
      compliance: {
        gdpr: sensitivity === 'HIGH' || sensitivity === 'CRITICAL',
        pci: eventType.includes('payment'),
        sox: eventType.includes('admin') || eventType.includes('config'),
        retention: `${retentionYears} years`
      }
    });

    // Store in audit database if configured
    if (process.env.AUDIT_DATABASE_URL) {
      this.storeAuditEvent(auditEvent);
    }
  }

  private sanitizeDetails(
    details: Record<string, any>,
    sensitivity: string
  ): Record<string, any> {
    const sanitized = { ...details };

    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'creditCard', 'ssn',
      'accountNumber', 'routingNumber', 'pin', 'cvv'
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Hash PII for high sensitivity events
    if (sensitivity === 'HIGH' || sensitivity === 'CRITICAL') {
      const piiFields = ['email', 'phone', 'address', 'name'];
      piiFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = this.hashValue(sanitized[field]);
        }
      });
    }

    return sanitized;
  }

  private sanitizePaymentDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details };

    // PCI DSS compliance - never log full card numbers
    if (sanitized.cardNumber) {
      sanitized.cardNumber = this.maskCardNumber(sanitized.cardNumber);
    }

    // Remove CVV, PIN, and other sensitive payment data
    delete sanitized.cvv;
    delete sanitized.pin;
    delete sanitized.fullCardNumber;

    return sanitized;
  }

  private maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return '[MASKED]';
    return `****-****-****-${cardNumber.slice(-4)}`;
  }

  private hashValue(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value + this.secretKey)
      .digest('hex')
      .substring(0, 16);
  }

  private generateChecksum(auditEvent: Omit<AuditEvent, 'checksum'>): string {
    const eventString = JSON.stringify(auditEvent, Object.keys(auditEvent).sort());
    return crypto
      .createHash('sha256')
      .update(eventString + this.secretKey)
      .digest('hex');
  }

  private async storeAuditEvent(auditEvent: AuditEvent): Promise<void> {
    // Only run on server-side
    if (typeof window === 'undefined') {
      try {
        // This would integrate with your audit database
        // For now, we'll log to file as backup
        const fs = require('fs');
        const auditFile = `logs/audit-${new Date().toISOString().split('T')[0]}.log`;
        
        if (!fs.existsSync('logs')) {
          fs.mkdirSync('logs', { recursive: true });
        }
        
        fs.appendFileSync(auditFile, JSON.stringify(auditEvent) + '\n');
      } catch (error) {
        this.logger.error('Failed to store audit event', error as Error, {
          auditEventId: auditEvent.id
        });
      }
    }
  }

  /**
   * Verify audit event integrity
   */
  verifyEventIntegrity(auditEvent: AuditEvent): boolean {
    const { checksum, ...eventWithoutChecksum } = auditEvent;
    const calculatedChecksum = this.generateChecksum(eventWithoutChecksum);
    return checksum === calculatedChecksum;
  }

  /**
   * Generate audit report for compliance
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    eventTypes?: AuditEventType[]
  ): Promise<any> {
    // This would query the audit database
    // For now, return structure for compliance report
    return {
      reportId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      period: { startDate, endDate },
      eventTypes: eventTypes || Object.values(AuditEventType),
      summary: {
        totalEvents: 0,
        byEventType: {},
        byUser: {},
        byResult: { SUCCESS: 0, FAILURE: 0, ERROR: 0 }
      },
      compliance: {
        gdprEvents: 0,
        pciEvents: 0,
        soxEvents: 0,
        integrityVerified: true
      }
    };
  }
}

// Singleton instance
export const auditLogger = new AuditLoggerService();

// Helper functions for common audit scenarios
export function auditLogin(userId: string, ipAddress: string, userAgent: string, success: boolean): void {
  auditLogger.logAuth(
    success ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILURE,
    userId,
    { ipAddress, userAgent },
    success ? 'SUCCESS' : 'FAILURE'
  );
}

export function auditDataAccess(
  userId: string,
  resource: string,
  action: string,
  context: AuditContext
): void {
  auditLogger.logDataAccess(
    AuditEventType.DATA_READ,
    userId,
    resource,
    { ...context, action },
    'SUCCESS'
  );
}

export function auditPayment(
  userId: string,
  paymentId: string,
  amount: number,
  success: boolean,
  context: AuditContext
): void {
  auditLogger.logPayment(
    success ? AuditEventType.PAYMENT_SUCCESS : AuditEventType.PAYMENT_FAILURE,
    userId,
    context,
    success ? 'SUCCESS' : 'FAILURE',
    { paymentId, amount: amount.toFixed(2) }
  );
}

export default AuditLoggerService;