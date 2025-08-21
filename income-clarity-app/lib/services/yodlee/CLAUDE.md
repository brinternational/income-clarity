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

# Yodlee Services Directory

## Overview
This directory contains all Yodlee integration services for Income Clarity's bank connection feature.

## Architecture
```
FREE USER                    PREMIUM USER
    ↓                             ↓
Manual Entry              Manual + Yodlee Sync
    ↓                             ↓
    └──────────┬─────────────────┘
               ↓
        Unified Data Layer
               ↓
          Super Cards
```

## Services

### yodlee-client.service.ts
- Handles OAuth authentication with Yodlee
- Manages token refresh and caching
- Provides API wrapper for all Yodlee endpoints
- Sandbox mode detection for test users

### yodlee-data-mapper.service.ts
- Maps Yodlee data structures to Income Clarity models
- Categorizes transactions intelligently
- Extracts dividend payments from transactions
- Calculates portfolio metrics from holdings

### yodlee-sync.service.ts
- Orchestrates data synchronization
- Handles account refresh triggers
- Updates database with synced data
- Manages sync state and error recovery

## Data Flow

### 1. Initial Connection
```typescript
User → Settings → Bank Connections → FastLink → Yodlee Auth → Account Link
```

### 2. Data Sync Process
```typescript
Trigger (login/cron/manual) → Fetch from Yodlee → Map Data → Reconcile → Update DB → Invalidate Cache
```

### 3. Data Reconciliation
```typescript
Manual Entry + Yodlee Data → Match by Ticker → User Choice (keep/replace/merge) → Update with Source Flag
```

## Refresh Strategy

| Trigger | Frequency | Priority |
|---------|-----------|----------|
| Login | If >4 hours old | HIGH |
| Nightly | 2 AM daily | MEDIUM |
| Manual | Max 1/hour | HIGH |
| Webhook | Real-time | HIGHEST |

## Environment Variables

```env
YODLEE_API_URL=https://sandbox.api.yodlee.com/ysl
YODLEE_FASTLINK_URL=https://fl4.sandbox.yodlee.com/authenticate/restserver/fastlink
YODLEE_CLIENT_ID=<your-client-id>
YODLEE_CLIENT_SECRET=<your-secret>
YODLEE_ADMIN_LOGIN=<admin-login>
YODLEE_TEST_USER=sbMem68a0d5bfa0b691
```

## Testing

### Test Scripts
- `scripts/test-yodlee-connection.js` - Verify authentication
- `scripts/test-yodlee-fastlink.js` - Test complete flow

### Test Credentials
```
Provider: Dag Site
Username: YodTest.site16441.2
Password: site16441.2
```

## Error Handling

### Common Errors
1. **Y303**: Missing credentials - Check CLIENT_ID and SECRET
2. **Y820**: Sandbox limitation - Use test user
3. **Y901**: Service not supported - Feature unavailable in sandbox

### Retry Logic
- Exponential backoff: 1s, 2s, 4s, 8s
- Max retries: 3
- Circuit breaker after 5 consecutive failures

## Security

1. **Token Storage**: Encrypted using AES-256
2. **Data Isolation**: Row-level security
3. **Audit Logging**: All data access tracked
4. **Rate Limiting**: Prevent API abuse
5. **2FA**: Required for bank changes

## Performance

### Caching
- Redis for Yodlee data (5-min TTL)
- Database query results cached
- Progressive loading in UI

### Optimization
- Batch API calls where possible
- Use webhooks for real-time updates
- Background jobs for heavy operations

## Future Enhancements

1. **Multi-Currency Support**: Handle international accounts
2. **Investment Analysis**: Deeper portfolio insights
3. **Bill Pay Integration**: Manage bills through Yodlee
4. **Budget Tracking**: Use transaction categorization
5. **Credit Score**: Display credit information

## Troubleshooting

### Account Not Syncing
1. Check last sync time
2. Verify Yodlee connection active
3. Test with manual refresh
4. Check error logs in SyncLog table

### Data Mismatch
1. Verify reconciliation settings
2. Check for duplicate accounts
3. Review data source flags
4. Manually trigger reconciliation

### Performance Issues
1. Check cache hit rates
2. Monitor API response times
3. Review database query performance
4. Check background job queue

---

**Remember**: Always test in sandbox before production deployment!