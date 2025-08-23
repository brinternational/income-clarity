# 🚨 CRITICAL PORT PROTECTION RULE - READ FIRST

## ⛔ ABSOLUTE MANDATE - NEVER TOUCH THESE PORTS:
- **PORT 3000**: Income Clarity production server - NEVER KILL
- **PORT 22**: SSH connection to Claude Code CLI - NEVER KILL  
- **PORT 8080**: Any other critical services - NEVER KILL

## 🚫 FORBIDDEN COMMANDS:
- `pkill -f node` (kills Claude Code CLI connection)
- `killall node` (kills everything)
- `npm run dev` with port changes
- Any command that kills ports other than 3000

## ✅ SAFE COMMANDS ONLY:
- `pkill -f custom-server.js` (targets specific server only)
- `lsof -ti:3000 | xargs kill` (port 3000 only)
- Standard npm install/build without server restarts

**VIOLATION = IMMEDIATE TASK FAILURE**

---

# MONITORING SERVICE

## Purpose
Comprehensive monitoring, metrics collection, error reporting, and alerting system for Income Clarity application.

## Structure
```
monitoring/
├── CLAUDE.md
├── rate-limit-monitor.service.ts    # Rate limit monitoring
├── metrics.service.ts               # System metrics collection
├── monitoring.service.ts            # Core monitoring service
├── error-reporter.service.ts        # Error tracking and reporting
├── alerts/
│   ├── alert-manager.ts            # Alert management system
│   └── alert-rules.ts              # Alert rule definitions
└── recovery/
    ├── circuit-breaker.ts          # Circuit breaker pattern
    └── retry-strategy.ts           # Retry logic and strategies
```

## Services

### RateLimitMonitorService
Production-grade monitoring system providing real-time rate limit tracking, API health monitoring, performance metrics collection, automated alerting on thresholds, historical data analysis, and dashboard data aggregation with circuit breaker monitoring.

### MetricsService  
System performance and business metrics collection service.

### MonitoringService
Core monitoring orchestration and health checking service.

### ErrorReporterService
Centralized error tracking, reporting, and analysis service.

### Alert Management
- **AlertManager**: Handles alert lifecycle and notifications
- **AlertRules**: Configurable alert conditions and thresholds

### Recovery Systems
- **CircuitBreaker**: Prevents cascade failures
- **RetryStrategy**: Intelligent retry logic for failed operations

## Current Implementation

### Core Monitoring Architecture
- **Real-time Metrics Collection**: Comprehensive service health tracking
- **Automated Alerting**: 10 pre-configured alert rules with severity levels
- **Historical Data**: 24-hour metrics retention with 7-day alert history
- **SLA Compliance**: Uptime and performance tracking
- **Circuit Breaker Monitoring**: Service availability tracking
- **Multi-format Export**: JSON and Prometheus metrics export

### Key Methods/APIs

#### Monitoring Control
```typescript
// Start/stop monitoring with configurable intervals
async startMonitoring(intervalMs: number = 30000): Promise<void>
stopMonitoring(): void

// Get current system metrics
async getCurrentMetrics(): Promise<MonitoringMetrics>

// Get historical data for time range
getHistoricalMetrics(startTime: Date, endTime: Date): MonitoringMetrics[]
```

#### Alert Management
```typescript
// Get active and all alerts
getActiveAlerts(): Alert[]
getAllAlerts(): Alert[]

// Alert lifecycle management
acknowledgeAlert(alertId: string): boolean
resolveAlert(alertId: string): boolean
```

#### Health & SLA Reporting
```typescript
// Service health summary
async getHealthSummary(): Promise<{overall: 'healthy'|'warning'|'critical', services: Record<string, 'up'|'down'|'degraded'>, activeAlerts: number}>

// SLA compliance metrics
getSLAMetrics(timeRangeHours: number = 24): {uptime: number, availabilityPercentage: number, meanResponseTime: number, errorRate: number, rateLimitViolations: number}

// Export metrics for external systems
exportMetrics(format: 'prometheus' | 'json' = 'json'): string
```

### Configuration

#### Default Alert Rules (10 Pre-configured)
```typescript
ALERT_RULES = [
  // Critical Alerts
  'polygon-rate-limit-critical': remainingRequests <= 1 (5min cooldown)
  'redis-disconnected': !redisConnected (1min cooldown)
  'database-disconnected': !databaseConnected (1min cooldown)
  
  // High Severity
  'polygon-circuit-breaker-open': circuitBreakerState === "open" (2min cooldown)
  'api-error-rate-high': errorRate > 5% (5min cooldown)
  'polygon-service-unavailable': configured && !available (5min cooldown)
  'yodlee-service-unavailable': configured && !available (5min cooldown)
  
  // Medium Severity
  'cache-hit-rate-low': hitRate < 50% (15min cooldown)
  'yodlee-rate-limit-warning': remainingRequests <= 5 (10min cooldown)
  'memory-usage-high': memoryUsage > 85% (15min cooldown)
]
```

#### Monitoring Intervals
- Default monitoring interval: 30 seconds
- Cleanup interval: Automatic (every monitoring cycle)
- Data retention: 24 hours for metrics, 7 days for alerts

### Dependencies
- **Rate Limiter Service**: Rate limit status monitoring
- **Cache Service**: Cache performance metrics
- **Polygon Batch Service**: API health and performance
- **Yodlee Rate Limited Service**: Bank API monitoring
- **Prisma Client**: Database connection monitoring
- **Logger**: Event and error logging

### Integration Points

#### Monitored Services
- **Polygon API**: Rate limits, health, latency, circuit breaker state
- **Yodlee API**: Rate limits, endpoint status, service availability
- **Redis Cache**: Connection status, memory usage, performance
- **Database**: Connection health, query performance
- **Application**: Memory usage, uptime, error rates

#### Metrics Collection Areas
```typescript
MonitoringMetrics = {
  // Rate limiting across all APIs
  rateLimits: {polygon, yodlee, api},
  
  // Cache performance
  cache: {hitRate, memoryUsage, redisConnected, totalKeys},
  
  // Service health
  services: {polygon, yodlee, redis, database},
  
  // Application metrics
  application: {uptime, memoryUsage, activeRequests, errorRate}
}
```

#### Alert Severity Levels
- **Critical**: System-threatening issues (database down, Redis disconnected)
- **High**: Service degradation (circuit breaker open, API unavailable)
- **Medium**: Performance warnings (low cache hit rate, memory usage)
- **Low**: Informational alerts

### Status: Working
- ✅ Real-time monitoring operational (30-second intervals)
- ✅ All 10 alert rules active and functional
- ✅ Service health tracking for all integrations
- ✅ Historical data collection and retention
- ✅ SLA compliance reporting
- ✅ Prometheus metrics export ready
- ✅ Circuit breaker monitoring
- ✅ Automatic cleanup and data management
- ✅ Alert lifecycle management
- ✅ Memory-based fallback when database unavailable

### Alert Configuration Details
- **Cooldown Periods**: Prevent alert spam (1-15 minutes)
- **Condition Evaluation**: JavaScript expression engine
- **Alert States**: Triggered → Acknowledged → Resolved
- **Notification Ready**: Placeholder for email/Slack/PagerDuty integration

### Monitoring Data Flow
1. **Collection**: Every 30 seconds from all services
2. **Evaluation**: Alert rules checked against current metrics
3. **Storage**: In-memory with automatic cleanup
4. **Export**: Available in JSON/Prometheus formats
5. **Analysis**: SLA and trend reporting

### Health Summary States
- **Healthy**: No critical alerts, all services operational
- **Warning**: Non-critical alerts present, services functional
- **Critical**: Critical alerts active, core services impacted

## Recent Changes
- Implemented comprehensive monitoring architecture
- Added 10 production-ready alert rules
- Enhanced service health tracking
- Integrated SLA compliance reporting
- Added Prometheus metrics export capability