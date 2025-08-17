# Sync Services Directory

## Overview
This directory manages data synchronization between Yodlee and Income Clarity, orchestrating the flow of financial data from bank accounts into the application.

## Architecture
```
User Login/Trigger → Rate Limit Check → Premium Check → Yodlee API
                                                            ↓
Database ← Data Mapper ← Reconciliation ← Raw Data
    ↓
Super Cards UI
```

## Services

### sync-orchestrator.service.ts
Main synchronization coordinator that:
- Manages sync lifecycle (start → fetch → map → save → complete)
- Enforces rate limits per sync type
- Tracks sync history and errors
- Handles different sync triggers (login, manual, scheduled, webhook)

## Sync Types & Rate Limits

| Sync Type | Trigger | Rate Limit | Use Case |
|-----------|---------|------------|----------|
| **LOGIN** | User login | Once per 4 hours | Keep data fresh on login |
| **MANUAL** | User button | Once per hour | User-initiated refresh |
| **SCHEDULED** | Cron job | No limit | Nightly batch updates |
| **WEBHOOK** | Yodlee push | No limit | Real-time updates |

## Data Flow

### 1. Fetch from Yodlee
```typescript
Yodlee API → Accounts → Holdings → Transactions
                ↓           ↓            ↓
            Balance    Portfolio    Income/Expense
```

### 2. Data Mapping
```typescript
Yodlee Format → Data Mapper → Income Clarity Format
{                              {
  symbol: "AAPL"                 ticker: "AAPL"
  quantity: 100        →         shares: 100
  price: {                       currentPrice: 150.00
    amount: 150                  dataSource: "YODLEE"
  }                            }
}
```

### 3. Reconciliation
When Yodlee data matches existing manual entries:
```
Manual Entry + Yodlee Data → User Choice:
  1. Keep Manual (ignore Yodlee)
  2. Replace with Yodlee (delete manual)
  3. Merge (combine quantities)
```

## Database Updates

### Holdings
- New holdings created with `dataSource: YODLEE`
- Existing manual holdings flagged for reconciliation
- Quantities and prices updated on each sync

### Transactions
- Dividends detected and categorized as INCOME
- Expenses categorized based on Yodlee categories
- All transactions linked to source account

### Sync Logs
Every sync creates a log entry tracking:
- Start/end time and duration
- Items synced (accounts, holdings, transactions)
- Success/failure status
- Error messages if failed

## Rate Limiting Strategy

### Implementation
```typescript
// In-memory rate limit map
Map<userId, lastSyncTime>

// Check before sync
if (timeSinceLastSync < rateLimit[syncType]) {
  throw new Error('Rate limit exceeded');
}
```

### Limits by Plan
- **FREE**: No sync (manual entry only)
- **PREMIUM**: Hourly manual, 4-hour login, daily scheduled
- **ENTERPRISE**: No limits, real-time webhooks

## Error Handling

### Common Errors
1. **No Yodlee Connection**: User hasn't linked bank
2. **Rate Limit Exceeded**: Too many sync attempts
3. **API Failure**: Yodlee service down
4. **Invalid Token**: Need to re-authenticate
5. **Data Corruption**: Malformed response

### Recovery Strategy
```typescript
try {
  await performSync();
} catch (error) {
  // Log to SyncLog table
  await logSyncFailure(error);
  
  // Retry with exponential backoff
  if (retryable(error)) {
    scheduleRetry(attempt * 2);
  }
  
  // Notify user if critical
  if (critical(error)) {
    notifyUser(error);
  }
}
```

## Monitoring

### Key Metrics
- **Sync Success Rate**: Target >95%
- **Average Sync Time**: Target <10 seconds
- **Items Per Sync**: Track data volume
- **Error Rate by Type**: Identify patterns

### Health Checks
```sql
-- Recent sync failures
SELECT * FROM sync_logs 
WHERE status = 'FAILED' 
AND startedAt > NOW() - INTERVAL '24 hours';

-- Average sync duration
SELECT AVG(duration) as avg_duration
FROM sync_logs
WHERE status = 'SUCCESS';

-- Users needing sync
SELECT u.id, u.email, yc.lastSyncedAt
FROM users u
JOIN yodlee_connections yc ON u.id = yc.userId
WHERE yc.lastSyncedAt < NOW() - INTERVAL '24 hours';
```

## Testing

### Test Scenarios
1. **First Sync**: New user connects bank
2. **Incremental Sync**: Update existing data
3. **Reconciliation**: Manual + Yodlee conflict
4. **Rate Limiting**: Rapid sync attempts
5. **Error Recovery**: API failures

### Test Data (Sandbox)
```javascript
// Test accounts in sandbox
{
  checking: { id: 1234, balance: 44.78 },
  savings: { id: 5678, balance: 9044.78 },
  creditCard: { id: 9012, balance: -1636.44 }
}
```

## Performance Optimization

### Caching
- Cache Yodlee tokens for 30 minutes
- Cache account lists for 5 minutes
- Invalidate on manual refresh

### Batch Processing
- Group database operations in transactions
- Use bulk inserts for transactions
- Process holdings in parallel

### Progressive Loading
- Sync accounts first (fast)
- Then holdings (medium)
- Finally transactions (slow)

## Security

### Data Protection
- Encrypt Yodlee tokens at rest
- Never log sensitive account numbers
- Sanitize transaction descriptions
- Row-level security on all queries

### Audit Trail
```typescript
// Every sync logged
{
  userId: "xxx",
  syncType: "MANUAL",
  startedAt: "2024-01-01T10:00:00Z",
  completedAt: "2024-01-01T10:00:10Z",
  itemsSynced: 45,
  status: "SUCCESS"
}
```

## API Endpoints

### Manual Sync
**POST /api/sync/manual**
- Triggers user-initiated sync with rate limiting (1/hour)
- Requires premium subscription
- Returns sync results and next allowed sync time

```typescript
// Request
POST /api/sync/manual

// Success Response (200)
{
  "success": true,
  "syncId": "manual-user123-1640995200000",
  "itemsSynced": 42,
  "accounts": 3,
  "holdings": 25,
  "transactions": 14,
  "nextAllowedSync": "2024-01-01T15:00:00Z",
  "errors": []
}

// Rate Limited Response (429)
{
  "error": "Rate limit exceeded",
  "nextAllowedSync": "2024-01-01T14:30:00Z",
  "timeRemaining": 1800
}
```

### Sync Status
**GET /api/sync/status**
- Returns current sync status and connection info
- Shows sync history and statistics
- Available to premium users only

```typescript
// Response (200)
{
  "isEnabled": true,
  "isPremium": true,
  "lastSync": "2024-01-01T10:00:00Z",
  "nextScheduledSync": "2024-01-02T02:00:00Z",
  "isSyncing": false,
  "accountsConnected": 3,
  "canManualSync": true,
  "canLoginSync": false,
  "nextManualSync": "2024-01-01T14:00:00Z",
  "nextLoginSync": "2024-01-01T14:00:00Z",
  "connection": {
    "id": "conn123",
    "connectedAt": "2024-01-01T00:00:00Z",
    "lastSyncedAt": "2024-01-01T10:00:00Z",
    "accounts": [...]
  },
  "syncHistory": [...],
  "stats": {
    "totalSyncs": 45,
    "successfulSyncs": 43,
    "failedSyncs": 2,
    "averageDuration": 8500,
    "totalItemsSynced": 1890
  }
}
```

### Webhook Handler
**POST /api/sync/webhook**
- Receives real-time notifications from Yodlee
- Verifies webhook signature for security
- Triggers immediate sync for supported events

```typescript
// Yodlee Webhook Payload
{
  "event": "REFRESH_COMPLETED",
  "loginName": "user123",
  "data": {
    "user": { "id": "yodlee456" },
    "account": { "id": "account789" }
  }
}

// Supported Events:
// - REFRESH_COMPLETED: Account refresh done
// - ACCOUNT_UPDATED: Account details changed
// - HOLDINGS_UPDATED: Investment holdings changed
// - TRANSACTIONS_UPDATED: New transactions available
// - REFRESH_FAILED: Account refresh failed
```

## Scheduled Sync (Cron)

### Setup Instructions

1. **Install the nightly sync script**:
```bash
# Make script executable
chmod +x /path/to/app/scripts/cron/nightly-sync.js

# Test script manually
cd /path/to/app && node scripts/cron/nightly-sync.js
```

2. **Add to system crontab**:
```bash
# Open crontab editor
crontab -e

# Add nightly sync at 2 AM daily
0 2 * * * cd /path/to/app && node scripts/cron/nightly-sync.js >> /var/log/income-clarity/nightly-sync.log 2>&1
```

3. **Create log directory**:
```bash
sudo mkdir -p /var/log/income-clarity
sudo chown $USER:$USER /var/log/income-clarity
```

### Monitoring Cron Jobs

**Check cron service status**:
```bash
# Check if cron is running
sudo systemctl status cron

# View cron logs
sudo journalctl -u cron

# View app-specific logs
tail -f /var/log/income-clarity/nightly-sync.log
```

**Nightly sync features**:
- Batch processing (10 users at a time)
- Concurrency control (max 3 simultaneous syncs)
- Exponential backoff for retries
- Comprehensive logging and reporting
- Graceful shutdown handling
- Success rate monitoring with alerts

## Sync Scheduler Service

### Queue Management
```typescript
import { syncScheduler } from './sync-scheduler.service';

// Add sync to priority queue
const syncId = await syncScheduler.enqueueSync(
  userId, 
  SyncType.MANUAL, 
  { source: 'dashboard-button' }
);

// Check queue status
const status = syncScheduler.getQueueStatus();
/*
{
  queueLength: 5,
  activeSyncs: 2,
  nextSync: { id: "webhook-user456-1640995200000", ... },
  syncsByType: {
    WEBHOOK: 2,
    MANUAL: 1,
    LOGIN: 1,
    SCHEDULED: 1
  }
}
*/

// Get sync statistics
const stats = await syncScheduler.getSyncStats('user123', 24);
```

### Priority Handling
Syncs are processed by priority:
1. **WEBHOOK** (1) - Real-time updates from Yodlee
2. **MANUAL** (2) - User-initiated refreshes
3. **LOGIN** (3) - Triggered on user login
4. **SCHEDULED** (4) - Nightly batch processing

### Retry Policies
| Sync Type | Max Retries | Backoff | Max Delay |
|-----------|-------------|---------|-----------|
| WEBHOOK | 3 | 2x | 30s |
| MANUAL | 2 | 2x | 1m |
| LOGIN | 1 | 2x | 5m |
| SCHEDULED | 2 | 3x | 10m |

## Database Schema Updates

### Required Tables
```sql
-- Sync queue persistence
CREATE TABLE queued_syncs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  sync_type VARCHAR(50) NOT NULL,
  priority INTEGER NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  retry_count INTEGER DEFAULT 0,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Webhook event logging
CREATE TABLE webhook_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  event VARCHAR(100) NOT NULL,
  login_name VARCHAR(255) NOT NULL,
  payload TEXT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cron job tracking
CREATE TABLE cron_job_logs (
  id VARCHAR(255) PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  summary TEXT,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NOT NULL
);
```

## Environment Variables

```bash
# Yodlee webhook security (optional)
YODLEE_WEBHOOK_SECRET=your_webhook_secret_here

# Production environment
NODE_ENV=production

# Database connection (existing)
DATABASE_URL=your_database_url
```

## Webhook Configuration in Yodlee

1. **Register webhook URL**: `https://your-domain.com/api/sync/webhook`
2. **Select events**:
   - REFRESH_COMPLETED
   - ACCOUNT_UPDATED
   - HOLDINGS_UPDATED
   - TRANSACTIONS_UPDATED
   - REFRESH_FAILED
3. **Configure signature verification** (recommended for production)

## Testing

### Manual Testing
```bash
# Test manual sync endpoint
curl -X POST https://your-domain.com/api/sync/manual \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json"

# Test sync status endpoint
curl https://your-domain.com/api/sync/status \
  -H "Authorization: Bearer your_token"

# Test webhook endpoint (development)
curl -X POST https://your-domain.com/api/sync/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"REFRESH_COMPLETED","loginName":"testuser","data":{}}'

# Test nightly sync script
cd /path/to/app && node scripts/cron/nightly-sync.js
```

### Integration Tests
```typescript
// Test sync orchestrator
describe('Sync Endpoints', () => {
  test('manual sync with rate limiting', async () => {
    // First request should succeed
    const response1 = await POST('/api/sync/manual');
    expect(response1.status).toBe(200);
    
    // Second request should be rate limited
    const response2 = await POST('/api/sync/manual');
    expect(response2.status).toBe(429);
  });
  
  test('webhook signature verification', async () => {
    const payload = JSON.stringify({event: 'TEST'});
    const signature = generateSignature(payload);
    
    const response = await POST('/api/sync/webhook', payload, {
      'yodlee-webhook-signature': signature
    });
    expect(response.status).toBe(200);
  });
});
```

## Future Enhancements

1. **Selective Sync**: Choose which accounts to sync
2. **Historical Import**: Backfill years of data
3. **Real-time Webhooks**: Instant updates ✅ IMPLEMENTED
4. **Sync Scheduling**: User-defined sync times
5. **Conflict Resolution UI**: Visual reconciliation
6. **Sync Analytics Dashboard**: Visual queue and performance metrics
7. **Smart Batching**: Optimize batch sizes based on system load
8. **Sync Notifications**: Email/push notifications for sync completion

## Troubleshooting

### Sync Not Working
1. Check user subscription status
2. Verify Yodlee connection active
3. Review recent sync logs
4. Test with manual refresh
5. Check rate limit status

### Data Mismatch
1. Check dataSource field
2. Review reconciliation status
3. Look for duplicate entries
4. Verify account mapping

### Performance Issues
1. Check sync duration trends
2. Review items per sync
3. Monitor database query times
4. Check Yodlee API response times

---

**Remember**: Always respect rate limits and handle errors gracefully!