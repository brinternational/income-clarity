# Monitoring Setup Guide

## Overview


### What's Already Configured
2. **Configuration files created**:
3. **Next.js integration** - Configured in `next.config.mjs`
5. **Performance monitoring** - Automatic tracing for API calls
6. **Session replay** - Records user sessions when errors occur

### Features Implemented

#### Error Tracking
- Automatic error capture on client and server
- Source maps for production debugging
- User context and breadcrumbs
- Filtered sensitive data (API keys, auth tokens)
- Ignored non-critical errors (browser extensions, network timeouts)

#### Performance Monitoring
- Page load performance
- API call tracing
- Database query monitoring
- Component render performance
- Core Web Vitals tracking

#### Session Replay
- 10% of all sessions recorded
- 100% of sessions with errors
- Privacy-safe (sensitive data masked)

## 🚀 Setup Instructions


   - Create free account (50K events/month)

2. **Create a Project**
   - Select "Next.js" as platform
   - Name it "income-clarity-app"

3. **Get Your DSN**
   - Navigate to Settings → Projects → income-clarity-app

### Step 2: Configure Environment Variables

Add to `.env.local` for development:
```env
```

Add to Vercel for production:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add the same variables for Production environment

### Step 3: Generate Auth Token (for source maps)

   - Navigate to Settings → Account → API → Auth Tokens
   - Click "Create New Token"

2. **Configure Token Scopes**
   - `project:releases` - Create and list releases
   - `org:read` - Read organization details
   - Name it "income-clarity-source-maps"

3. **Copy Token**

### Step 4: Test Integration

#### Local Testing
```bash
# Start dev server
npm run dev

# Trigger a test error

```

#### Production Testing
After deployment, monitor:
- Real user errors
- Performance metrics
- Session replays

## 📊 Monitoring Dashboard

### Key Metrics to Track

#### Errors
- **Error Rate**: Should be <0.1%
- **Crash Rate**: Should be <0.01%
- **User Impact**: Number of users affected

#### Performance
- **Page Load**: Target <2s
- **API Response**: Target <200ms
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1

#### User Sessions
- **Session Duration**: Track engagement
- **Error Sessions**: Sessions with errors
- **Rage Clicks**: User frustration indicators

### Alert Configuration

1. **Error Spike**: >10 errors in 5 minutes
2. **New Error Types**: First occurrence of new errors
3. **Performance Regression**: Page load >3s
4. **High Error Rate**: >1% of sessions with errors

## 🔧 Advanced Configuration

### Custom Error Context

Add user context in your app:
```typescript

// Set user context after login
  id: user.id,
  email: user.email,
  subscription: user.subscription_tier,
});

// Add custom context
  holdings_count: holdings.length,
  total_value: portfolioValue,
});
```

### Custom Performance Monitoring

Track specific operations:
```typescript
// Track API calls
  name: 'portfolio.calculate',
  op: 'calculation',
});

// Your code here
const result = calculatePortfolio();

transaction.finish();
```

### Breadcrumbs

Add custom breadcrumbs for debugging:
```typescript
  category: 'portfolio',
  message: 'User updated holdings',
  level: 'info',
  data: {
    holdings_count: holdings.length,
  },
});
```

## 🚨 Privacy & Security

### Data Scrubbing
- Passwords
- API keys
- Credit card numbers
- Social security numbers

### Additional Privacy Settings
- Data Scrubbing: Settings → Security & Privacy
- PII Handling: Disable "Store Native Crash Reports"
- IP Collection: Can be disabled if needed

### GDPR Compliance
- User consent for session replay
- Data retention: 30 days default
- User deletion requests supported

## 📈 Best Practices

### 1. Use Environments
- `development` - Local development
- `staging` - Testing environment
- `production` - Live users

### 2. Release Tracking
Releases are automatically tracked via Git SHA:
```env
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=abc123def456
```

### 3. Performance Budgets
Set performance thresholds:
- Warn at 2s page load
- Alert at 3s page load
- Critical at 5s page load

### 4. Error Grouping
Use fingerprinting for similar errors:
```typescript
  fingerprint: ['database', 'connection', error.code],
});
```

## 🔍 Troubleshooting

### "No events received"
- Check DSN is correct
- Verify `NODE_ENV=production` for production

### "Source maps not working"
- Check token has correct permissions
- Verify release name matches

### "Too many events"
- Adjust `tracesSampleRate` (currently 0.1 = 10%)
- Filter out non-critical errors

## 📚 Additional Resources


## ✅ Checklist

- [ ] Add DSN to environment variables
- [ ] Generate auth token for source maps
- [ ] Deploy to staging and test
- [ ] Configure alerts
- [ ] Monitor production metrics

---

