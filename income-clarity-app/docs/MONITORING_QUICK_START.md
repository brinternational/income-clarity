# Monitoring System Quick Start Guide

## Overview

This guide provides quick setup instructions for the comprehensive monitoring and error handling system. The system is production-ready and includes error boundaries, circuit breakers, retry logic, health checks, alerting, and audit logging.

## 🚀 Quick Setup

### 1. Environment Configuration

Add these environment variables to your `.env` file:

```bash
# Logging
LOG_LEVEL=INFO                    # DEBUG, INFO, WARN, ERROR, FATAL
AUDIT_SECRET_KEY=your-secret-key  # For audit log integrity

# External Services (Optional)
SENTRY_DSN=https://your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook
PAGERDUTY_SERVICE_KEY=your-pagerduty-key

# Alert Configuration
EMAIL_ALERTS_FROM=alerts@yourapp.com
RATE_LIMIT_ENABLED=true
```

### 2. Install Dependencies

```bash
# Core dependencies (if not already installed)
npm install ioredis  # For Redis support (optional)
```

### 3. Add Error Boundaries to Your App

```tsx
// app/layout.tsx or your root component
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
```

For specific components:

```tsx
// For sync operations
import { SyncErrorBoundary } from '@/components/error/SyncErrorBoundary';

function SyncComponent() {
  return (
    <SyncErrorBoundary userId={userId} onSyncRetry={handleRetry}>
      <YourSyncUI />
    </SyncErrorBoundary>
  );
}

// For payment operations
import { PaymentErrorBoundary } from '@/components/error/PaymentErrorBoundary';

function PaymentComponent() {
  return (
    <PaymentErrorBoundary userId={userId} paymentAmount={amount}>
      <YourPaymentUI />
    </PaymentErrorBoundary>
  );
}
```

### 4. Add Basic Monitoring to Your Services

```typescript
// Replace existing logging
import { logger } from '@/lib/logging/logger.service';
import { monitoringService } from '@/lib/monitoring/monitoring.service';

// Enhanced logging with context
const serviceLogger = logger.withContext({ 
  component: 'UserService',
  version: '1.0.0'
});

// Track business metrics
monitoringService.trackBusinessMetric('user_signup', 1, { source: 'organic' });

// Track API performance
export async function apiHandler(req: Request) {
  const startTime = Date.now();
  
  try {
    const result = await processRequest(req);
    
    // Track successful request
    monitoringService.trackPerformance(
      'api_request',
      Date.now() - startTime,
      'ms',
      { endpoint: req.url, method: req.method }
    );
    
    return result;
  } catch (error) {
    // Track error
    monitoringService.trackError(
      error as Error,
      'external_api',
      'MEDIUM',
      { endpoint: req.url }
    );
    throw error;
  }
}
```

### 5. Add Circuit Breakers to External API Calls

```typescript
import { withYodleeCircuitBreaker } from '@/lib/monitoring/recovery/circuit-breaker';

// Protect external API calls
export async function fetchYodleeAccounts(userId: string) {
  return withYodleeCircuitBreaker(
    () => yodleeApi.getAccounts(userId),
    () => getCachedAccounts(userId) // fallback
  );
}
```

### 6. Add Retry Logic to Transient Operations

```typescript
import { retryDatabaseOperation, retryExternalApiCall } from '@/lib/monitoring/recovery/retry-strategy';

// Database operations with retry
export async function saveUser(userData: UserData) {
  return retryDatabaseOperation(
    'user_save',
    () => database.users.create(userData)
  );
}

// External API calls with retry
export async function fetchStockPrices(symbols: string[]) {
  return retryExternalApiCall(
    'stock_prices',
    () => stockApi.getPrices(symbols)
  );
}
```

## 📊 Access Health Checks

### Basic Health Check
```bash
curl http://localhost:3000/api/health
```

### Detailed Health Check
```bash
curl http://localhost:3000/api/health?level=detailed&details=true
```

### Full System Health
```bash
curl http://localhost:3000/api/health?level=full&details=true
```

## 📈 Monitoring Dashboard

Access the monitoring dashboard at: `http://localhost:3000/admin/monitoring`

**Features:**
- Real-time system health
- Active alerts
- Error analytics
- Performance metrics
- Resource utilization

## 🔔 Alert Configuration

The system comes with pre-configured alert rules:

### Critical Alerts
- Payment processing failures (immediate PagerDuty)
- Database connection failures (immediate Slack + PagerDuty)
- Security breach attempts (email + PagerDuty)

### Performance Alerts  
- API error rate > 5% (Slack notification)
- Response time > 5s (Slack notification)
- Memory usage > 85% (Slack notification)

### Business Alerts
- Sync failure rate > 25% (Slack notification)
- User signup drops (Slack notification, business hours only)
- Revenue drops > 30% (email + Slack)

## 🛠 Customization

### Add Custom Alert Rules

```typescript
import { alertManager } from '@/lib/monitoring/alerts/alert-manager';
import { AlertSeverity, AlertChannel } from '@/lib/monitoring/alerts/alert-rules';

alertManager.addRule({
  id: 'custom-error-rate',
  name: 'Custom API Error Rate',
  description: 'Alert when custom API error rate is high',
  severity: AlertSeverity.HIGH,
  enabled: true,
  conditions: [{
    type: 'rate',
    metric: 'custom_api_errors',
    operator: 'gt',
    threshold: 0.03, // 3%
    timeWindow: 10,
    evaluationPeriod: 5
  }],
  notifications: [{
    channel: AlertChannel.SLACK,
    severity: [AlertSeverity.HIGH],
    config: { 
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#your-channel' 
    },
    cooldown: 30
  }],
  tags: { team: 'your-team', category: 'api' },
  metadata: {
    createdAt: new Date().toISOString(),
    createdBy: 'your-team',
    lastModified: new Date().toISOString(),
    triggerCount: 0
  }
});
```

### Add Custom Metrics

```typescript
import { metricsService } from '@/lib/monitoring/metrics.service';

// Track feature usage
metricsService.trackFeatureUsage(userId, 'portfolio', 'export', 1);

// Track business conversion
metricsService.trackConversion(userId, 'free', 'premium', 29.99);

// Track custom events
metricsService.increment('custom_event', 1, { category: 'feature' });
metricsService.gauge('active_sessions', currentSessions);
```

### Configure Audit Logging

```typescript
import { auditLogger, AuditEventType } from '@/lib/logging/audit-logger.service';

// Log user actions
auditLogger.logDataAccess(
  AuditEventType.PORTFOLIO_VIEW,
  userId,
  'portfolios',
  { requestId, ipAddress },
  'SUCCESS'
);

// Log security events
auditLogger.logSecurityEvent(
  AuditEventType.SUSPICIOUS_ACTIVITY,
  { ipAddress, userAgent },
  'ERROR',
  { reason: 'Multiple failed login attempts' }
);
```

## 🔧 Troubleshooting

### Common Issues

**1. Health checks failing**
- Check database connectivity
- Verify environment variables
- Check file system permissions

**2. Alerts not triggering**
- Verify alert rule configuration
- Check notification channel setup
- Review alert cooldown periods

**3. High memory usage**
- Review metric collection frequency
- Check log retention settings
- Monitor error report accumulation

### Debug Commands

```bash
# Check system health
curl http://localhost:3000/api/health?level=full

# View recent errors (if admin endpoint is enabled)
curl http://localhost:3000/api/admin/errors

# Check circuit breaker status
curl http://localhost:3000/api/admin/circuit-breakers
```

## 📚 Next Steps

1. **Review Documentation**: Read the full [MONITORING_SYSTEM.md](./MONITORING_SYSTEM.md) for comprehensive details

2. **Configure External Services**: Set up Sentry, DataDog, or other monitoring services

3. **Customize Alert Rules**: Adjust thresholds based on your application's behavior

4. **Set Up Dashboards**: Configure external dashboards (Grafana, DataDog, etc.)

5. **Train Your Team**: Ensure team members understand alert procedures and runbooks

## 🚨 Production Checklist

Before deploying to production:

- [ ] Configure external monitoring services (Sentry, DataDog)
- [ ] Set up PagerDuty for critical alerts
- [ ] Configure Slack webhooks for team notifications
- [ ] Test alert delivery to all channels
- [ ] Set up log rotation and retention
- [ ] Configure SSL certificate monitoring
- [ ] Test circuit breaker and retry mechanisms
- [ ] Verify health check endpoints
- [ ] Document incident response procedures
- [ ] Set up monitoring dashboard access controls

## 💡 Best Practices

1. **Start Simple**: Begin with basic health checks and essential alerts
2. **Gradual Rollout**: Add more comprehensive monitoring over time
3. **Alert Hygiene**: Avoid alert fatigue with proper thresholds
4. **Regular Review**: Periodically review and adjust alert rules
5. **Documentation**: Keep runbooks and procedures up to date
6. **Testing**: Regularly test alert delivery and recovery mechanisms

---

The monitoring system is now ready to provide comprehensive observability for your application. For detailed configuration options and advanced features, refer to the complete documentation.