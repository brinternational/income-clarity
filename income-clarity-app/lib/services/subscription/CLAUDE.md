# Subscription Services Directory

## Overview
This directory manages the freemium subscription model for Income Clarity, controlling access to premium features and managing user tiers.

## Architecture
```
FREE TIER                   PREMIUM TIER              ENTERPRISE TIER
    │                            │                          │
    ├─ Manual Entry Only         ├─ Manual + Yodlee        ├─ All Premium +
    ├─ 3 Portfolios Max          ├─ Unlimited Portfolios   ├─ Multi-user
    ├─ Basic Features            ├─ Advanced Features      ├─ API Access
    └─ Community Support         └─ Priority Support       └─ Dedicated Manager
```

## Services

### subscription.service.ts
- Manages user subscription lifecycle
- Handles upgrades/downgrades
- Tracks usage statistics
- Manages free trials
- Integrates with Stripe for payments

### feature-gate.service.ts
- Controls access to premium features
- Enforces resource limits
- Tracks feature usage
- Provides upgrade prompts

## Subscription Plans

### FREE
- **Features**: Manual portfolio entry, basic tracking
- **Limits**: 3 portfolios, no bank sync, 100 API calls/month
- **Target**: Casual investors, beginners

### PREMIUM ($9.99/month)
- **Features**: Yodlee bank sync, unlimited portfolios, real-time data
- **Limits**: 10 bank accounts, daily sync, 10,000 API calls/month
- **Target**: Active investors, FIRE enthusiasts

### ENTERPRISE (Custom pricing)
- **Features**: All Premium + multi-user, API access, custom integrations
- **Limits**: Unlimited everything
- **Target**: Financial advisors, family offices

## Key Features by Tier

### Data Sources
| Feature | FREE | PREMIUM | ENTERPRISE |
|---------|------|---------|------------|
| Manual Entry | ✅ | ✅ | ✅ |
| Bank Sync (Yodlee) | ❌ | ✅ | ✅ |
| Real-time Prices | ❌ | ✅ | ✅ |
| Webhook Updates | ❌ | ❌ | ✅ |

### Portfolio Management
| Feature | FREE | PREMIUM | ENTERPRISE |
|---------|------|---------|------------|
| Portfolio Count | 3 | Unlimited | Unlimited |
| Holdings Tracking | ✅ | ✅ | ✅ |
| Rebalancing Suggestions | ❌ | ✅ | ✅ |
| Multi-user Access | ❌ | ❌ | ✅ |

### Analytics & Reports
| Feature | FREE | PREMIUM | ENTERPRISE |
|---------|------|---------|------------|
| Basic Charts | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Email Reports | ❌ | ✅ | ✅ |
| Custom Reports | ❌ | ❌ | ✅ |

## Usage Examples

### Check Premium Status
```typescript
const isPremium = await subscriptionService.isPremiumUser(userId);
if (!isPremium) {
  // Show upgrade prompt
}
```

### Feature Gating
```typescript
// Check single feature
const canSync = await featureGate.hasAccess(userId, Feature.BANK_SYNC);

// Require feature (throws if no access)
await featureGate.requireFeature(userId, Feature.PORTFOLIO_REBALANCING);

// Check resource limit
const { allowed, remaining } = await featureGate.checkResourceLimit(
  userId, 
  'portfolios', 
  currentPortfolioCount
);
```

### Upgrade Flow
```typescript
// Start free trial
await subscriptionService.startFreeTrial(userId, 14);

// Upgrade to premium
await subscriptionService.upgradeUser(
  userId,
  'PREMIUM',
  stripeCustomerId,
  stripeSubscriptionId
);

// Downgrade
await subscriptionService.downgradeUser(userId);
```

## Database Schema

### UserSubscription
- Tracks active subscriptions
- Stores Stripe IDs for billing
- Records feature usage
- Manages subscription status

### User Premium Fields
- `isPremium`: Quick check flag
- `premiumStartDate`: Subscription start
- `premiumEndDate`: Subscription end (null if active)
- `trialEndDate`: Trial expiration

## Integration Points

### 1. API Endpoints
All premium-only endpoints should check access:
```typescript
// In API route
if (!await featureGate.hasAccess(userId, Feature.BANK_SYNC)) {
  return res.status(402).json({ error: 'Premium feature required' });
}
```

### 2. UI Components
Use FeatureGate component to hide/lock features:
```tsx
<FeatureGate feature={Feature.BANK_SYNC} fallback={<UpgradePrompt />}>
  <BankConnectionSettings />
</FeatureGate>
```

### 3. Background Jobs
Check subscription before running premium jobs:
```typescript
if (await subscriptionService.canSyncBankAccounts(userId)) {
  await syncYodleeData(userId);
}
```

## Stripe Integration (TODO)

### Webhook Events to Handle
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Price IDs
```typescript
const STRIPE_PRICES = {
  PREMIUM_MONTHLY: 'price_xxxxx',
  PREMIUM_YEARLY: 'price_yyyyy',
  ENTERPRISE: 'custom',
};
```

## Testing

### Test Scenarios
1. Free user tries premium feature → Show upgrade
2. Trial expires → Downgrade to free
3. Payment fails → Grace period then downgrade
4. User hits resource limit → Prompt upgrade
5. User upgrades mid-billing → Prorate

### Test Users
- `free@test.com` - Free tier user
- `premium@test.com` - Active premium
- `trial@test.com` - In trial period
- `expired@test.com` - Expired premium

## Monitoring

### Key Metrics
- Conversion rate (Free → Premium)
- Trial conversion rate
- Feature usage by tier
- Churn rate
- MRR growth

### Alerts
- Failed payment processing
- Unusual downgrade spike
- Feature gate errors
- Stripe webhook failures

## Security Considerations

1. **Never trust client-side tier checks** - Always verify on server
2. **Encrypt Stripe IDs** in database
3. **Rate limit upgrade/downgrade APIs**
4. **Audit log all subscription changes**
5. **Implement grace period for payment failures**

## Future Enhancements

1. **Referral Program**: Free months for referrals
2. **Student Discount**: 50% off with .edu email
3. **Family Plans**: Multiple users under one subscription
4. **Usage-Based Pricing**: Pay per sync/API call
5. **Freemium Upsells**: One-time purchases for features

---

**Remember**: Always fail gracefully when premium features are unavailable!