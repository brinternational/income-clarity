# Comprehensive Monitoring and Error Handling System

## Overview

This document provides complete instructions for the production-grade monitoring, error handling, and observability system implemented for the Income Clarity platform. The system ensures reliability, quick issue resolution, and provides insights into application performance and business metrics.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Documentation](#component-documentation)
3. [Error Handling](#error-handling)
4. [Monitoring & Metrics](#monitoring--metrics)
5. [Alerting System](#alerting-system)
6. [Health Checks](#health-checks)
7. [Error Recovery](#error-recovery)
8. [Logging & Audit](#logging--audit)
9. [Dashboard & UI](#dashboard--ui)
10. [Configuration](#configuration)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Monitoring    │    │   External      │
│                 │    │   Services      │    │   Services      │
│ • Error Boundaries   │ • Metrics Collection  │ • Sentry        │
│ • Circuit Breakers   │ • Alert Manager      │ • DataDog       │
│ • Retry Logic   │    │ • Health Checks │    │ • PagerDuty     │
│ • Logging       │    │ • Error Reporter│    │ • Slack         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Dashboard     │
                    │                 │
                    │ • Real-time     │
                    │   Monitoring    │
                    │ • Alert Status  │
                    │ • Error Analytics│
                    └─────────────────┘
```

### Data Flow

1. **Error Detection**: Errors are caught by Error Boundaries or logged directly by services
2. **Error Reporting**: Errors are categorized, deduplicated, and sent to Error Reporter
3. **Metrics Collection**: Business and technical metrics are collected continuously
4. **Alert Evaluation**: Alert rules are evaluated against incoming metrics
5. **Notification Delivery**: Alerts are sent through configured channels
6. **Dashboard Updates**: Real-time updates to monitoring dashboard

## Component Documentation

### Error Boundaries

#### GlobalErrorBoundary
**Location**: `/components/error/GlobalErrorBoundary.tsx`

Catches all React rendering errors and provides user-friendly fallbacks.

**Features**:
- Automatic retry mechanism (3 attempts)
- Error reporting to monitoring service
- User-friendly error display
- Error details copying for support

**Usage**:
```tsx
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

function App() {
  return (
    <GlobalErrorBoundary>
      <YourApp />
    </GlobalErrorBoundary>
  );
}
```

#### SyncErrorBoundary
**Location**: `/components/error/SyncErrorBoundary.tsx`

Specialized error boundary for sync operations with recovery actions.

**Features**:
- Sync-specific error categorization
- Automatic retry with exponential backoff
- Recovery action suggestions
- Integration with circuit breaker

#### PaymentErrorBoundary
**Location**: `/components/error/PaymentErrorBoundary.tsx`

PCI DSS compliant error boundary for payment operations.

**Features**:
- Secure error logging (no sensitive data)
- Payment-specific error messages
- Security incident reporting
- Audit trail compliance

### Monitoring Services

#### MonitoringService
**Location**: `/lib/monitoring/monitoring.service.ts`

Central monitoring service for error tracking and metrics collection.

**Key Methods**:
```typescript
// Track errors with context
trackError(error: Error, category: ErrorCategory, severity: ErrorSeverity, context?: Record<string, any>)

// Track performance metrics
trackPerformance(name: string, value: number, unit?: string, tags?: Record<string, string>)

// Track business metrics
trackBusinessMetric(event: string, value: number, properties?: Record<string, any>, userId?: string)

// Get system health
getHealthStatus(): { status: string; checks: any; metrics: any }
```

#### ErrorReporter
**Location**: `/lib/monitoring/error-reporter.service.ts`

Centralized error reporting with categorization and deduplication.

**Features**:
- Error fingerprinting and grouping
- Alert rule configuration
- Error trend analysis
- Resolution tracking

#### MetricsService
**Location**: `/lib/monitoring/metrics.service.ts`

Comprehensive metrics collection for business and technical metrics.

**Metric Types**:
- **Counters**: Incrementing values (page views, API calls)
- **Gauges**: Point-in-time values (memory usage, active users)
- **Histograms**: Distribution of values (response times)
- **Timers**: Duration measurements

### Logging System

#### LoggerService
**Location**: `/lib/logging/logger.service.ts`

Production-grade structured logging with multiple transports.

**Features**:
- Structured JSON logging
- Context injection
- Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Correlation IDs
- Performance logging

**Usage**:
```typescript
import { logger } from '@/lib/logging/logger.service';

const userLogger = logger.withContext({ userId: '123', requestId: 'req-456' });
userLogger.info('User action performed', { action: 'portfolio_view' });
```

#### AuditLogger
**Location**: `/lib/logging/audit-logger.service.ts`

Compliance-focused audit logging for security and regulatory requirements.

**Features**:
- GDPR/PCI DSS compliance
- Immutable audit trails
- Data sanitization
- Event integrity verification

## Error Handling

### Error Categories

```typescript
enum ErrorCategory {
  AUTHENTICATION = 'auth',
  PAYMENT = 'payment',
  SYNC = 'sync',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit'
}
```

### Error Severity Levels

```typescript
enum ErrorSeverity {
  LOW = 1,      // Log only
  MEDIUM = 2,   // Alert after threshold
  HIGH = 3,     // Alert immediately
  CRITICAL = 4  // Page on-call
}
```

### Error Recovery Strategies

#### Circuit Breaker
**Location**: `/lib/monitoring/recovery/circuit-breaker.ts`

Prevents cascade failures by opening circuit when failure threshold is reached.

**Configuration**:
```typescript
const yodleeBreaker = circuitBreakerRegistry.getBreaker('yodlee', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 120000, // 2 minutes
  monitoringPeriod: 300000 // 5 minutes
});
```

**Usage**:
```typescript
import { withYodleeCircuitBreaker } from '@/lib/monitoring/recovery/circuit-breaker';

const result = await withYodleeCircuitBreaker(
  () => yodleeApi.fetchAccounts(userId),
  () => getCachedAccounts(userId) // fallback
);
```

#### Retry Strategy
**Location**: `/lib/monitoring/recovery/retry-strategy.ts`

Configurable retry logic with exponential backoff and jitter.

**Strategies**:
- **Exponential**: Exponential backoff with jitter
- **Linear**: Linear increase in delay
- **Fixed**: Fixed delay between retries
- **Fibonacci**: Fibonacci sequence delays

**Usage**:
```typescript
import { retryDatabaseOperation } from '@/lib/monitoring/recovery/retry-strategy';

const result = await retryDatabaseOperation(
  'user_update',
  () => updateUser(userId, userData)
);
```

## Monitoring & Metrics

### Business Metrics

Track key business indicators:

```typescript
// User engagement
metricsService.trackUserSignup(userId, 'organic', 'free');
metricsService.trackConversion(userId, 'free', 'premium', 29.99);
metricsService.trackFeatureUsage(userId, 'portfolio', 'view');

// Revenue tracking
metricsService.trackRevenue(29.99, 'subscription', userId);

// Sync operations
metricsService.trackSyncEvent(userId, 'manual', true, 2500);
```

### Technical Metrics

Monitor system performance:

```typescript
// API performance
metricsService.trackApiRequest('/api/portfolios', 'GET', 200, 150, userId);

// Database operations
metricsService.trackDatabaseQuery('SELECT * FROM portfolios', 45, true);

// External API calls
metricsService.trackExternalApiCall('yodlee', '/accounts', 1200, true);

// System resources
metricsService.trackMemoryUsage('api-server', 512000000, 1073741824);
```

### Custom Metrics

Define application-specific metrics:

```typescript
// Increment counters
metricsService.increment('portfolio_imports', 1, { source: 'csv' });

// Set gauge values
metricsService.gauge('active_users', 1247);

// Record histograms
metricsService.histogram('sync_duration', 3500, { sync_type: 'full' });

// Time operations
const timer = metricsService.timer('data_processing');
// ... perform operation
timer.end();
```

## Alerting System

### Alert Rules Configuration
**Location**: `/lib/monitoring/alerts/alert-rules.ts`

Predefined alert rules for common scenarios:

#### Critical Alerts
- Payment processing failures
- Database connection failures
- Security breach attempts

#### Performance Alerts  
- High error rates (>5%)
- Slow response times (>5s)
- High memory usage (>85%)

#### Business Alerts
- Sync failure rate (>25%)
- User signup drops
- Revenue anomalies

### Alert Manager
**Location**: `/lib/monitoring/alerts/alert-manager.ts`

Manages alert lifecycle:

```typescript
// Trigger alert manually
alertManager.triggerAlert('payment-failure', 'Payment gateway timeout', { userId });

// Acknowledge alert
alertManager.acknowledgeAlert(alertId, 'john.doe', 'Investigating payment gateway');

// Suppress alerts
alertManager.suppressAlerts('yodlee', 60, 'Scheduled maintenance', 'ops-team');
```

### Notification Channels

Configure multiple notification channels:

```typescript
// Email notifications
{
  channel: AlertChannel.EMAIL,
  config: {
    to: ['dev-team@incomeClarity.com'],
    subject: 'High Error Rate Alert'
  }
}

// Slack notifications
{
  channel: AlertChannel.SLACK,
  config: {
    webhook: process.env.SLACK_WEBHOOK,
    channel: '#alerts',
    mention: '@channel'
  }
}

// PagerDuty (for critical alerts)
{
  channel: AlertChannel.PAGERDUTY,
  config: {
    serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
    incidentTitle: 'Critical System Failure'
  }
}
```

## Health Checks

### Basic Health Check
**Endpoint**: `GET /api/health`

Returns basic system status:

```json
{
  "status": "healthy",
  "timestamp": "2024-12-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": [
    {
      "name": "application",
      "status": "healthy",
      "responseTime": 5
    }
  ]
}
```

### Detailed Health Check
**Endpoint**: `GET /api/health/detailed`

Comprehensive system health including:
- Database connectivity
- Redis status
- External API availability
- Memory/CPU usage
- Recent errors
- Performance metrics

**Query Parameters**:
- `level`: `basic`, `detailed`, `full`
- `details`: `true` to include detailed information

### Health Check Components

Monitored components:
- **Application**: Node.js process health
- **Database**: SQLite connection and performance
- **Redis**: Cache connectivity (if configured)
- **Yodlee API**: External service availability
- **Email Service**: SMTP/SendGrid status
- **Queue System**: BullMQ health
- **File System**: Read/write permissions
- **Security**: SSL certificate expiry

## Error Recovery

### Circuit Breaker Pattern

Prevent cascade failures:

```typescript
// Database circuit breaker
const dbResult = await withDatabaseCircuitBreaker(
  () => database.query('SELECT * FROM users'),
  () => ({ users: [] }) // fallback
);

// External API circuit breaker
const apiResult = await withYodleeCircuitBreaker(
  () => yodleeApi.getAccounts(),
  () => getCachedAccounts() // fallback
);
```

### Retry Strategies

Handle transient failures:

```typescript
// Exponential backoff for API calls
const result = await retryExternalApiCall(
  'yodlee_accounts',
  () => yodleeApi.getAccounts()
);

// Fixed retry for database operations
const dbResult = await retryDatabaseOperation(
  'user_insert',
  () => insertUser(userData)
);

// Custom retry configuration
const customResult = await retry('custom_operation', operation, {
  maxRetries: 5,
  strategy: RetryStrategy.EXPONENTIAL,
  initialDelay: 1000,
  maxDelay: 30000,
  jitter: true
});
```

## Logging & Audit

### Structured Logging

Use structured logging for better observability:

```typescript
// Context-aware logging
const requestLogger = logger.withContext({
  requestId: 'req-123',
  userId: 'user-456',
  operation: 'portfolio_sync'
});

requestLogger.info('Starting portfolio sync', {
  syncType: 'manual',
  accountCount: 3
});

// Performance logging
const perfLogger = logger.time('database_query');
const result = await database.query(sql);
perfLogger.end('Query completed successfully', { rowCount: result.length });
```

### Audit Logging

Maintain compliance audit trails:

```typescript
// Authentication events
auditLogger.logAuth(
  AuditEventType.LOGIN_SUCCESS,
  userId,
  { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
  'SUCCESS'
);

// Data access events
auditLogger.logDataAccess(
  AuditEventType.PORTFOLIO_VIEW,
  userId,
  'portfolios',
  { requestId: 'req-123' },
  'SUCCESS'
);

// Payment events (PCI DSS compliant)
auditLogger.logPayment(
  AuditEventType.PAYMENT_SUCCESS,
  userId,
  { requestId: 'req-123' },
  'SUCCESS',
  { amount: 29.99, paymentId: 'pay-123' }
);
```

## Dashboard & UI

### Monitoring Dashboard
**Location**: `/app/admin/monitoring/page.tsx`

Real-time monitoring dashboard featuring:

#### System Overview
- Overall health status
- Error rate trending
- Active alerts count
- Average response time

#### Health Checks Tab
- Component-by-component health status
- Response times
- Error details

#### Alerts Tab  
- Active alerts with severity levels
- Alert history and trends
- Acknowledgment status

#### Errors Tab
- Error categorization
- Top error patterns
- Error frequency analysis

#### Metrics Tab
- System performance metrics
- Resource utilization
- Business metrics

### Access Control

Dashboard access restricted to:
- Admin users
- DevOps team
- On-call engineers

## Configuration

### Environment Variables

```bash
# Monitoring Configuration
LOG_LEVEL=INFO
ENABLE_MONITORING=true
METRICS_COLLECTION_INTERVAL=60000

# Error Reporting
SENTRY_DSN=https://...
DATADOG_API_KEY=...

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
PAGERDUTY_SERVICE_KEY=...
EMAIL_ALERTS_FROM=alerts@incomeClarity.com

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
DEFAULT_FAILURE_THRESHOLD=5
DEFAULT_TIMEOUT=60000

# Retry Configuration
DEFAULT_MAX_RETRIES=3
DEFAULT_RETRY_DELAY=1000

# Health Checks
HEALTH_CHECK_INTERVAL=30000
EXTERNAL_HEALTH_CHECK_TIMEOUT=10000
```

### Alert Rule Configuration

Customize alert thresholds:

```typescript
// Add custom alert rule
alertManager.addRule({
  id: 'custom-error-rate',
  name: 'Custom Error Rate Alert',
  severity: AlertSeverity.HIGH,
  conditions: [{
    type: AlertConditionType.RATE,
    metric: 'api_error_rate',
    operator: 'gt',
    threshold: 0.03, // 3%
    timeWindow: 10,
    evaluationPeriod: 5
  }],
  notifications: [{
    channel: AlertChannel.SLACK,
    severity: [AlertSeverity.HIGH],
    config: { channel: '#custom-alerts' },
    cooldown: 30
  }]
});
```

## Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export LOG_LEVEL=WARN
   export ENABLE_MONITORING=true
   ```

2. **External Services**:
   - Configure Sentry for error tracking
   - Set up DataDog for metrics
   - Configure PagerDuty for critical alerts
   - Set up Slack webhooks

3. **Health Check Monitoring**:
   - Configure load balancer health checks
   - Set up external monitoring (Pingdom, etc.)
   - Configure SSL certificate monitoring

4. **Log Management**:
   - Configure log rotation
   - Set up log aggregation (ELK stack)
   - Configure log retention policies

### Docker Deployment

```dockerfile
# Dockerfile additions for monitoring
ENV NODE_ENV=production
ENV LOG_LEVEL=WARN
ENV ENABLE_MONITORING=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: income-clarity
spec:
  template:
    spec:
      containers:
      - name: app
        # Health check probes
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health?level=basic
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Troubleshooting

### Common Issues

#### High Error Rate
1. Check error categories in dashboard
2. Review recent deployments
3. Check external service status
4. Verify database connectivity

#### Slow Response Times
1. Check database query performance
2. Review external API latency
3. Monitor memory usage
4. Check for memory leaks

#### Alert Fatigue
1. Review alert thresholds
2. Implement alert grouping
3. Add cooldown periods
4. Use escalation policies

#### Circuit Breaker Issues
1. Check failure thresholds
2. Review timeout configurations
3. Verify fallback mechanisms
4. Monitor recovery times

### Debug Commands

```bash
# Check application health
curl http://localhost:3000/api/health?level=full&details=true

# View error statistics
curl http://localhost:3000/api/admin/errors/statistics

# Check alert status
curl http://localhost:3000/api/admin/alerts

# View metrics
curl http://localhost:3000/api/admin/metrics

# Circuit breaker status
curl http://localhost:3000/api/admin/circuit-breakers
```

### Log Analysis

Common log queries:

```bash
# Find errors in last hour
grep "ERROR" logs/app-$(date +%Y-%m-%d).log | tail -100

# Check specific user activity
grep "userId.*user-123" logs/app-$(date +%Y-%m-%d).log

# Monitor sync operations
grep "sync" logs/app-$(date +%Y-%m-%d).log | grep -E "(SUCCESS|FAILURE)"

# Payment-related logs
grep "AUDIT.*payment" logs/audit-$(date +%Y-%m-%d).log
```

## Best Practices

### Error Handling
1. **Fail Fast**: Detect and report errors quickly
2. **Graceful Degradation**: Provide fallbacks for failures
3. **Context Preservation**: Include relevant context in error reports
4. **User Experience**: Show user-friendly error messages

### Monitoring
1. **Proactive Monitoring**: Monitor leading indicators
2. **Comprehensive Coverage**: Monitor all critical paths
3. **Alerting Hygiene**: Avoid alert fatigue with proper thresholds
4. **Documentation**: Document all alerts and runbooks

### Performance
1. **Resource Monitoring**: Track memory, CPU, and disk usage
2. **Response Time Tracking**: Monitor API and database performance
3. **Capacity Planning**: Use metrics for scaling decisions
4. **Optimization**: Regularly review and optimize slow operations

### Security
1. **Audit Trails**: Maintain comprehensive audit logs
2. **Data Sanitization**: Never log sensitive information
3. **Access Control**: Restrict monitoring data access
4. **Compliance**: Ensure GDPR, PCI DSS compliance

### Operational Excellence
1. **Runbooks**: Document incident response procedures
2. **On-Call Procedures**: Clear escalation paths
3. **Post-Mortems**: Learn from incidents
4. **Continuous Improvement**: Regularly review and update monitoring

---

This monitoring and error handling system provides comprehensive observability, reliable error recovery, and actionable insights for maintaining a high-quality user experience in the Income Clarity platform.