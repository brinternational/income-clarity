# Premium Components Directory

## Overview
This directory contains components for managing premium feature access, upgrade prompts, and subscription tier enforcement in the Income Clarity freemium platform.

## Components

### FeatureGate.tsx
**Purpose**: Controls access to premium features with graceful degradation
**Features**:
- Feature-based access control
- Blurred content with lock overlay for premium features
- Configurable fallback components
- Support for different subscription tiers (Free, Premium, Enterprise)
- Customizable upgrade actions

**Supported Features**:
- `BANK_SYNC`: Bank account synchronization
- `REAL_TIME_PRICES`: Live market data
- `ADVANCED_ANALYTICS`: Deep portfolio insights
- `UNLIMITED_PORTFOLIOS`: Remove portfolio limits
- `EMAIL_REPORTS`: Automated reports
- `API_ACCESS`: Programmatic access (Enterprise)
- `MULTI_USER`: Team collaboration (Enterprise)
- `CUSTOM_INTEGRATIONS`: Third-party tools (Enterprise)

**Usage**:
```tsx
<FeatureGate feature="BANK_SYNC" fallback={<UpgradePrompt />}>
  <BankConnectionSettings />
</FeatureGate>

<MiniFeatureGate feature="REAL_TIME_PRICES" size="sm" />

// Hook for feature checking
const { hasFeature, isPremium, isEnterprise } = useFeatureAccess();
```

### UpgradePrompt.tsx
**Purpose**: Comprehensive upgrade modal and prompts for conversion
**Features**:
- Feature-specific benefit highlighting
- Pricing comparison table
- Multiple trigger types (button, modal, inline)
- Benefits vs pricing tab navigation
- Stripe integration ready
- Social proof and testimonials

**Components**:
- `UpgradePrompt`: Full-featured upgrade interface
- `CompactUpgradePrompt`: Minimal upgrade badge
- `UpgradeModal`: Detailed modal with pricing

**Usage**:
```tsx
<UpgradePrompt feature="BANK_SYNC" trigger="button" />
<UpgradePrompt feature="ADVANCED_ANALYTICS" trigger="inline" />
<CompactUpgradePrompt feature="REAL_TIME_PRICES" />
```

### PremiumOnboarding.tsx
**Purpose**: Guided onboarding flow for new premium subscribers
**Features**:
- Step-by-step setup wizard
- Bank account connection flow
- Data import assistance
- Feature tour integration
- Progress tracking and skip options
- Celebration and success states

**Flow Steps**:
1. Welcome & premium features showcase
2. Bank account connection (Yodlee integration)
3. Portfolio data import (auto-sync or CSV upload)
4. Feature tour and exploration
5. Success state with quick actions

**Usage**:
```tsx
<PremiumOnboarding
  onComplete={() => console.log('Onboarding complete')}
  onSkip={() => console.log('User skipped onboarding')}
  autoStart={true}
/>
```

### BankConnectionSettings.tsx
**Purpose**: Comprehensive bank account management interface
**Features**:
- Connected accounts list with status indicators
- Manual and automatic sync controls
- Account-specific sync settings
- Real-time sync progress tracking
- Add/remove accounts with Yodlee integration
- Error handling and reconnection flows

**Account Management**:
- Display account balances and last sync times
- Configure sync frequency (daily, weekly, manual)
- Toggle transaction and balance sync
- Handle connection errors gracefully
- Bulk sync operations

**Usage**:
```tsx
<BankConnectionSettings />
// Automatically handles feature gating and premium access
```

### PremiumDashboardWidget.tsx
**Purpose**: Dashboard widget showing premium status and quick actions
**Features**:
- Subscription status and trial countdown
- Bank sync statistics and controls
- Usage metrics and limits tracking
- Quick action buttons for common tasks
- Expandable detailed view
- Upgrade prompts for trial users

**Displays**:
- Connected accounts count and sync success rate
- Trial expiration warnings
- Usage against plan limits (portfolios, API calls, storage)
- Subscription details and renewal dates

**Usage**:
```tsx
<PremiumDashboardWidget />
// Shows different content based on user's subscription tier
```

### FeatureComparisonTable.tsx
**Purpose**: Responsive comparison table for subscription plans
**Features**:
- Three-tier plan comparison (Free, Premium, Enterprise)
- Grouped features by category
- Visual indicators for included/excluded features
- Highlight current user's plan
- Compact and full view modes
- Integrated upgrade actions

**Categories**:
- Portfolio Management
- Data Sources
- Analytics & Insights
- Reports & Communication
- Collaboration & Access
- Support & Service

**Usage**:
```tsx
<FeatureComparisonTable
  compact={false}
  highlightPlan="PREMIUM"
  showActions={true}
/>

// Compact version for modals/sidebars
<FeatureComparisonTable compact={true} showActions={false} />
```

## Feature Configuration

### Subscription Tiers
```typescript
FREE TIER:
- 3 portfolios max
- Manual data entry only
- Basic analytics
- Community support

PREMIUM ($9.99/month):
- Unlimited portfolios  
- Bank account sync
- Real-time market data
- Advanced analytics
- Email reports
- Priority support

ENTERPRISE (Custom):
- Everything in Premium
- Multi-user access
- API access
- Custom integrations
- Dedicated support
- White-label options
```

### Feature Access Matrix
| Feature | FREE | PREMIUM | ENTERPRISE |
|---------|------|---------|------------|
| Manual Entry | ✅ | ✅ | ✅ |
| Bank Sync | ❌ | ✅ | ✅ |
| Real-time Prices | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Email Reports | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Multi-user | ❌ | ❌ | ✅ |

## Integration with Super Cards

### Free User Experience
- **Locked Features**: Blurred with upgrade prompts
- **Limited Data**: Clear indicators of manual-only data
- **Upgrade CTAs**: Strategic placement in high-value areas
- **Feature Previews**: Show benefits without functionality

### Premium User Experience  
- **Full Access**: All features unlocked
- **Sync Status**: Real-time bank sync indicators
- **Advanced Features**: Analytics, reports, real-time data
- **Value Communication**: Continued benefit reinforcement

### Conversion Strategy
- **Progressive Disclosure**: Unlock features as users engage
- **Value-First**: Show benefits before asking for payment
- **Social Proof**: Success stories and usage statistics
- **Risk Reduction**: Free trial periods and guarantees

## UX/UI Design Patterns

### Lock States
- **Subtle Blur**: Content visible but not functional
- **Lock Icons**: Clear premium indicators
- **Benefit Copy**: Specific value propositions
- **Single CTA**: Clear upgrade path

### Upgrade Prompts
- **Contextual**: Appear when users need the feature
- **Non-Intrusive**: Don't block core workflows
- **Value-Focused**: Benefits over features
- **Dismissible**: Users maintain control

### Success States
- **Smooth Unlocks**: Immediate access after upgrade
- **Progress Indicators**: Show upgrade benefits
- **Onboarding**: Guide users through new features
- **Celebration**: Acknowledge the upgrade

## Accessibility & Performance

### Accessibility
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Reader Support**: Descriptive labels and roles
- **Focus Management**: Clear focus indicators
- **Color Independence**: No color-only information

### Performance
- **Lazy Loading**: Modal content loaded on demand
- **Memoization**: Prevent unnecessary re-renders
- **Bundle Optimization**: Tree-shaking for unused features
- **Cache Strategy**: Feature access checks cached locally

## Analytics & Conversion Tracking

### Key Metrics
- **Feature Engagement**: Which locked features users try
- **Upgrade Funnel**: From prompt to conversion
- **Churn Prevention**: Value demonstration effectiveness
- **User Segmentation**: Behavior by subscription tier

### Event Tracking
```typescript
// Feature gate interactions
trackEvent('feature_gate_shown', { feature, user_tier });
trackEvent('upgrade_prompt_clicked', { feature, prompt_type });
trackEvent('upgrade_completed', { plan, conversion_source });
```

## Future Enhancements

### Advanced Features
- **Usage-Based Limits**: Soft limits with upgrade prompts
- **Feature Trials**: Temporary access to premium features
- **Granular Permissions**: Feature-specific subscriptions
- **Team Management**: Multi-user access controls

### Personalization
- **Dynamic Pricing**: Based on usage patterns
- **Custom Plans**: Tailored feature bundles
- **Regional Pricing**: Market-specific pricing
- **Lifecycle Campaigns**: Targeted upgrade flows

### Integration
- **Payment Providers**: Stripe, PayPal, Apple Pay
- **Analytics Platforms**: Mixpanel, Amplitude
- **Support Systems**: Intercom, Zendesk
- **Email Marketing**: Mailchimp, SendGrid

---

## Pages & Routes

### /pricing
**Full-featured pricing page** with three-tier structure, feature comparison, testimonials, FAQ, and conversion optimization. Includes monthly/yearly toggle with 20% annual discount.

### /settings/billing
**Comprehensive billing management** with current plan display, payment method management, invoice history, and subscription controls. Handles upgrades, downgrades, and cancellation flows.

## Integration Points

### Dashboard Integration
```tsx
// Add to main dashboard
import { PremiumDashboardWidget } from '@/components/premium';

<PremiumDashboardWidget />
```

### Settings Integration
```tsx
// Add to settings pages
import { BankConnectionSettings, FeatureComparisonTable } from '@/components/premium';

<BankConnectionSettings />
<FeatureComparisonTable compact={true} />
```

### Onboarding Integration
```tsx
// Trigger after successful upgrade
import { PremiumOnboarding } from '@/components/premium';

const [showOnboarding, setShowOnboarding] = useState(false);

{showOnboarding && (
  <PremiumOnboarding
    onComplete={() => setShowOnboarding(false)}
    onSkip={() => setShowOnboarding(false)}
  />
)}
```

## API Integration Requirements

### Stripe Integration (TODO)
- Payment processing for subscriptions
- Webhook handling for subscription events
- Customer portal for billing management
- Trial and discount management

### Yodlee Integration (TODO)
- FastLink token generation
- Account connection flow
- Transaction sync automation
- Error handling and reconnection

### Feature Flag Service (TODO)
- Real-time feature access checking
- Usage tracking and limits enforcement
- Subscription status synchronization

**Implementation Status**: ✅ Complete UI components created. Integration points documented. Ready for backend API connections and Stripe/Yodlee setup.