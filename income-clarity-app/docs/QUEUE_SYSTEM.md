# Income Clarity Background Job Queue System

## Overview

This document provides comprehensive instructions for setting up, deploying, and monitoring the production-ready background job queue system built with BullMQ and Redis.

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Development Setup](#development-setup)
6. [Production Deployment](#production-deployment)
7. [Migration from Legacy System](#migration-from-legacy-system)
8. [Monitoring and Observability](#monitoring-and-observability)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)
11. [Performance Tuning](#performance-tuning)
12. [Security Considerations](#security-considerations)

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │    │   Worker Nodes  │    │   Redis Cluster │
│                 │    │                 │    │                 │
│ • Queue Service │◄──►│ • Sync Worker   │◄──►│ • Job Storage   │
│ • Admin API     │    │ • Email Worker  │    │ • Queue State   │
│ • Web UI        │    │ • Cleanup Worker│    │ • Pub/Sub       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Queue Types

- **Sync Queue**: Yodlee data synchronization, portfolio updates
- **Email Queue**: Transactional emails, notifications
- **Cleanup Queue**: Database maintenance, file cleanup
- **Webhook Queue**: Real-time webhook processing
- **Notifications Queue**: User notifications, alerts

### Job Priorities

- **CRITICAL (10)**: Webhook syncs, payment processing
- **HIGH (5)**: Manual syncs, email notifications
- **NORMAL (3)**: Scheduled syncs
- **LOW (1)**: Cleanup tasks

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **Redis**: 7.0 or higher
- **Memory**: Minimum 2GB RAM for Redis + Workers
- **Storage**: SSD recommended for Redis persistence
- **Network**: Low latency between workers and Redis

### Dependencies

```json
{
  "bullmq": "^5.0.0",
  "ioredis": "^5.3.2"
}
```

## Installation

### 1. Install Dependencies

```bash
npm install bullmq ioredis
```

### 2. Redis Setup

#### Option A: Local Redis
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

#### Option B: Docker Redis
```bash
docker run -d \
  --name income-clarity-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7.2-alpine \
  redis-server --appendonly yes
```

#### Option C: Redis Cloud
- Use Redis Cloud, AWS ElastiCache, or similar managed service
- Configure connection string in environment variables

## Configuration

### Environment Variables

Create `.env` file with the following variables:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Queue Configuration
ENABLE_BULLMQ=true
MIGRATION_MODE=gradual  # gradual, immediate, testing
FALLBACK_TO_LEGACY=true
MIGRATE_EXISTING_JOBS=false
MIGRATE_HIGH_PRIORITY=true
MIGRATE_MEDIUM_PRIORITY=false
MIGRATE_LOW_PRIORITY=false

# Worker Configuration
WORKER_CONCURRENCY=3
WORKER_QUEUES=sync,email,cleanup,webhook,notifications
HEALTH_CHECK_PORT=3001
WORKER_NAME=worker-1

# Admin API
ADMIN_API_KEY=your_secure_admin_key

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
REDIS_COMMANDER_PORT=8081
```

### Redis Configuration

Create `config/redis.conf`:

```bash
# Basic Configuration
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60

# Memory Management
maxmemory 1gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Security
requirepass your_redis_password

# Performance
tcp-backlog 511
databases 16
```

## Development Setup

### 1. Start Redis
```bash
redis-server config/redis.conf
```

### 2. Initialize Queue System
```typescript
import { queueService } from './lib/jobs/queue-wrapper.service';

// Initialize in your application startup
await queueService.initialize();
```

### 3. Start Worker (Development)
```bash
node scripts/worker.js --concurrency=2 --queue=sync
```

### 4. Test Queue System
```typescript
// Add a test job
const jobId = await queueService.enqueueSync(
  'user123',
  SyncType.MANUAL,
  { test: true }
);

// Check status
const status = await queueService.getQueueStatus();
console.log(status);
```

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Scale workers
docker-compose up -d --scale worker-primary=2 --scale worker-email=3

# Monitor logs
docker-compose logs -f worker-primary

# Health check
curl http://localhost:3001/health
```

### Option 2: Manual Deployment

#### 1. Deploy Redis
```bash
# Install and configure Redis on dedicated server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure firewall
sudo ufw allow 6379/tcp
```

#### 2. Deploy Workers
```bash
# On each worker server
git clone your-repo
cd income-clarity-app
npm ci --production
npx prisma generate

# Start worker with PM2
pm2 start scripts/worker.js --name "sync-worker" -- --concurrency=5
pm2 startup
pm2 save
```

#### 3. Load Balancer Configuration
```nginx
upstream queue_workers {
    server worker1:3001;
    server worker2:3001;
    server worker3:3001;
}

server {
    listen 80;
    location /queue/health {
        proxy_pass http://queue_workers;
        proxy_set_header Host $host;
    }
}
```

## Migration from Legacy System

The queue system supports gradual migration from the existing sync scheduler:

### Migration Modes

1. **Testing Mode**: 10% of jobs use BullMQ
2. **Gradual Mode**: Migrate by priority (webhooks first)
3. **Immediate Mode**: All new jobs use BullMQ

### Migration Steps

#### Phase 1: Setup (Week 1)
```bash
# Enable BullMQ in testing mode
export ENABLE_BULLMQ=true
export MIGRATION_MODE=testing
export FALLBACK_TO_LEGACY=true
```

#### Phase 2: High Priority Migration (Week 2)
```bash
export MIGRATION_MODE=gradual
export MIGRATE_HIGH_PRIORITY=true
```

#### Phase 3: Full Migration (Week 3-4)
```bash
export MIGRATE_MEDIUM_PRIORITY=true
export MIGRATE_LOW_PRIORITY=true
export MIGRATE_EXISTING_JOBS=true
```

#### Phase 4: Complete Migration (Week 4+)
```bash
export MIGRATION_MODE=immediate
export FALLBACK_TO_LEGACY=false
```

### Monitoring Migration

```typescript
// Get migration statistics
const stats = await queueService.getDetailedStats();
console.log(`Migration: ${stats.migration.migrationPercentage}% complete`);
```

## Monitoring and Observability

### Health Checks

```bash
# Worker health
curl http://localhost:3001/health

# Detailed status
curl http://localhost:3001/status

# Prometheus metrics
curl http://localhost:3001/metrics
```

### Admin Dashboard

Access queue monitoring via admin API:

```bash
# Queue overview
curl -H "Authorization: Bearer ${ADMIN_API_KEY}" \
     http://localhost:3000/api/admin/queue

# Failed jobs
curl -H "Authorization: Bearer ${ADMIN_API_KEY}" \
     "http://localhost:3000/api/admin/queue?action=failed-jobs&queue=sync"

# Retry failed jobs
curl -X POST -H "Authorization: Bearer ${ADMIN_API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"action":"retry-failed","queueName":"sync"}' \
     http://localhost:3000/api/admin/queue
```

### Metrics to Monitor

#### Key Performance Indicators
- **Job Completion Rate**: >95%
- **Average Processing Time**: <30 seconds
- **Queue Depth**: <100 waiting jobs
- **Error Rate**: <1%
- **Worker Uptime**: >99%

#### Redis Metrics
- Memory usage
- Connection count
- Commands per second
- Keyspace hits/misses

#### Worker Metrics
- CPU usage
- Memory usage
- Active job count
- Success/failure rates

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: queue_system
    rules:
      - alert: QueueDepthHigh
        expr: queue_waiting_jobs > 100
        for: 5m
        
      - alert: JobFailureRateHigh
        expr: rate(worker_jobs_failed_total[5m]) > 0.01
        for: 2m
        
      - alert: WorkerDown
        expr: up{job="queue_worker"} == 0
        for: 1m
        
      - alert: RedisDown
        expr: redis_up == 0
        for: 30s
```

## Troubleshooting

### Common Issues

#### 1. High Memory Usage
```bash
# Check Redis memory
redis-cli info memory

# Solutions:
# - Increase Redis maxmemory
# - Enable key eviction policy
# - Clear old completed jobs
```

#### 2. Jobs Stuck in Waiting
```bash
# Check worker status
curl http://localhost:3001/health

# Restart workers
docker-compose restart worker-primary

# Clear stuck jobs
curl -X POST -H "Authorization: Bearer ${ADMIN_API_KEY}" \
     -d '{"action":"clear-queue","queueName":"sync","jobState":"waiting"}' \
     http://localhost:3000/api/admin/queue
```

#### 3. Connection Issues
```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check network connectivity
telnet redis-host 6379

# Verify credentials
redis-cli -h localhost -p 6379 -a password ping
```

### Debug Mode

Enable detailed logging:

```bash
export DEBUG=bullmq:*
export LOG_LEVEL=debug
node scripts/worker.js
```

### Performance Issues

#### Identify Bottlenecks
```bash
# Check slow Redis operations
redis-cli --latency-history -i 1

# Monitor worker performance
curl http://localhost:3001/metrics | grep worker_

# Database query performance
npm run db:analyze
```

#### Optimization Steps
1. **Scale Workers**: Add more worker processes
2. **Optimize Redis**: Tune memory and persistence settings
3. **Database Indexing**: Ensure proper indexes on job tables
4. **Batch Processing**: Process multiple items per job

## API Reference

### Queue Service API

```typescript
import { queueService } from './lib/jobs/queue-wrapper.service';

// Enqueue sync job
const syncId = await queueService.enqueueSync(
  userId: string,
  syncType: SyncType,
  metadata?: Record<string, any>
);

// Enqueue email job
const emailId = await queueService.enqueueEmail(
  emailType: string,
  emailData: any,
  options?: {
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    delay?: number;
    scheduledAt?: Date;
  }
);

// Process webhook
const webhookId = await queueService.processWebhook(
  userId: string,
  webhookData: any,
  priority?: 'HIGH' | 'CRITICAL'
);

// Get queue statistics
const stats = await queueService.getDetailedStats();

// Health check
const health = await queueService.healthCheck();
```

### Admin API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/queue` | Queue overview |
| GET | `/api/admin/queue?action=health` | System health |
| GET | `/api/admin/queue?action=stats&queue=sync` | Queue statistics |
| GET | `/api/admin/queue?action=failed-jobs&queue=sync` | Failed jobs |
| POST | `/api/admin/queue` | Queue management actions |

### Worker Health Endpoints

| Endpoint | Description |
|----------|-------------|
| `/health` | Basic health check |
| `/status` | Detailed worker status |
| `/metrics` | Prometheus metrics |

## Performance Tuning

### Redis Optimization

```bash
# Tune Redis configuration
echo 'vm.overcommit_memory = 1' >> /etc/sysctl.conf
echo 'net.core.somaxconn = 65535' >> /etc/sysctl.conf

# Disable transparent huge pages
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

### Worker Optimization

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Optimize worker concurrency
export WORKER_CONCURRENCY=8  # CPU cores * 2

# Use cluster mode for CPU-intensive tasks
pm2 start scripts/worker.js -i max
```

### Database Optimization

```sql
-- Add indexes for job queries
CREATE INDEX idx_sync_log_status_created ON sync_log(status, created_at);
CREATE INDEX idx_email_log_status_created ON email_log(status, created_at);

-- Optimize cleanup queries
CREATE INDEX idx_queued_sync_scheduled ON queued_sync(scheduled_at);
```

## Security Considerations

### Redis Security

```bash
# Enable authentication
requirepass strong_password_here

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""

# Network security
bind 127.0.0.1 10.0.0.0/8
protected-mode yes
```

### API Security

```typescript
// Admin API authentication
const isAuthorized = await validateAdminAccess(request);
if (!isAuthorized) {
  return new Response('Unauthorized', { status: 401 });
}

// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Worker Security

```bash
# Run workers as non-root user
USER worker

# Limit file access
chmod 600 .env
chown worker:worker .env

# Use secrets management
export REDIS_PASSWORD=$(vault kv get -field=password secret/redis)
```

## Backup and Recovery

### Redis Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
redis-cli --rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
```

### Queue State Recovery

```typescript
// Recover failed jobs after system restart
const failedJobs = await jobScheduler.getFailedJobs('sync', 0, 1000);

for (const job of failedJobs) {
  if (shouldRetryJob(job)) {
    await jobScheduler.retryJob('sync', job.id);
  }
}
```

## Scaling Guidelines

### Horizontal Scaling

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: queue-worker
spec:
  replicas: 5
  selector:
    matchLabels:
      app: queue-worker
  template:
    spec:
      containers:
      - name: worker
        image: income-clarity-worker:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Vertical Scaling

```bash
# Increase worker resources
export WORKER_CONCURRENCY=16
export NODE_OPTIONS="--max-old-space-size=8192"

# Scale Redis
redis-server --maxmemory 4gb --maxmemory-policy allkeys-lru
```

### Performance Targets

| Metric | Target | Scaling Trigger |
|--------|--------|-----------------|
| Queue Depth | <50 | >100 jobs waiting |
| Processing Time | <30s | >60s average |
| Memory Usage | <80% | >90% utilization |
| CPU Usage | <70% | >85% utilization |
| Error Rate | <1% | >2% failure rate |

---

## Support and Maintenance

For issues or questions:
1. Check this documentation
2. Review logs: `docker-compose logs`
3. Check health endpoints
4. Contact development team

Last updated: 2024-12-14