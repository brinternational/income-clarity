# Income Clarity - Email Notification System

## Overview

The Income Clarity email notification system provides reliable, production-ready email notifications for portfolio events, milestones, and periodic summaries. Built with Resend API integration, the system includes comprehensive error handling, rate limiting, retry logic, and unsubscribe functionality.

## 🚀 Features

### Core Features
- ✅ **Resend API Integration** - Modern, reliable email delivery
- ✅ **Responsive HTML Templates** - Beautiful, mobile-friendly email designs
- ✅ **Comprehensive Email Categories** - 8 different notification types
- ✅ **User Preference Management** - Granular control over notifications
- ✅ **Email Verification System** - Secure email address validation
- ✅ **Unsubscribe Functionality** - One-click unsubscribe with branded pages

### Reliability Features
- ✅ **Retry Logic with Exponential Backoff** - Automatic retry for failed sends
- ✅ **Rate Limiting** - Prevents API abuse and ensures deliverability
- ✅ **Error Handling & Logging** - Comprehensive error tracking
- ✅ **Batch Processing** - Efficient bulk email handling
- ✅ **Circuit Breaker Pattern** - Graceful degradation during outages

### Automation Features
- ✅ **Dividend Notifications** - Automatic emails when dividends are recorded
- ✅ **Milestone Achievements** - FIRE milestone celebration emails
- ✅ **Weekly Summaries** - Scheduled portfolio performance reports
- ✅ **Background Job System** - Scalable email scheduling

## 📧 Email Categories

| Category | Description | Trigger | Template |
|----------|-------------|---------|----------|
| `dividendNotifications` | Dividend payment alerts | New dividend income recorded | Dividend details, portfolio impact |
| `milestoneAchievements` | FIRE milestone celebrations | Portfolio value crosses threshold | Progress visualization, next goals |
| `weeklyDigests` | Weekly portfolio summaries | Scheduled (Sundays 6 PM) | Performance, dividends, insights |
| `monthlyReports` | Monthly performance reports | Scheduled (1st of month) | Comprehensive portfolio analysis |
| `portfolioAlerts` | Significant price movements | Manual trigger | Price changes, vs SPY performance |
| `taxOptimization` | Tax strategy suggestions | Manual trigger | Tax-saving opportunities |
| `marketAlerts` | Important market news | Manual trigger | Market events affecting portfolio |
| `systemUpdates` | App updates and maintenance | Manual trigger | Feature updates, maintenance notices |

## 🛠 Technical Architecture

### Core Services

#### EmailService (`/lib/services/email.service.ts`)
- **Singleton pattern** for consistent configuration
- **Resend API integration** with error handling
- **Rate limiting** (30/min, 300/hour, 2000/day)
- **Retry logic** with exponential backoff (3 attempts max)
- **Email validation** with RFC compliance
- **Template integration** for consistent branding

#### EmailTemplatesService (`/lib/services/email-templates.service.ts`)
- **Responsive HTML templates** with Income Clarity branding
- **Text fallbacks** for all templates
- **Dynamic content rendering** with user data
- **Unsubscribe link generation** for compliance
- **Mobile-optimized design** with progressive enhancement

#### EmailSchedulerService (`/lib/services/email-scheduler.service.ts`)
- **Background job processing** for scheduled emails
- **Weekly summary automation** (Sundays 6 PM)
- **Retry mechanism** for failed jobs
- **Batch processing** for bulk operations
- **Memory-based queue** (upgradeable to Redis)

#### MilestoneTrackerService (`/lib/services/milestone-tracker.service.ts`)
- **FIRE milestone definitions** (7 standard milestones)
- **Progress calculation** based on portfolio value
- **Achievement detection** with threshold crossing
- **Time estimation** for next milestones
- **Notification triggers** for celebrations

### API Endpoints

#### Core Email Management
- `GET|POST /api/user/email-preferences` - Manage user preferences
- `POST /api/email/verify` - Send/handle email verification
- `GET|POST /api/email/unsubscribe` - Handle unsubscribe requests

#### Testing & Administration
- `GET|POST /api/email/test` - Test email functionality
- `GET|POST /api/email/test-suite` - Comprehensive test suite
- `GET|POST /api/email/scheduler` - Manage email scheduler
- `GET|POST /api/email/milestones` - Milestone management

### Database Integration

#### Email Preferences Table
```sql
CREATE TABLE emailPreferences (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  email TEXT,
  emailVerified BOOLEAN DEFAULT FALSE,
  emailVerificationToken TEXT,
  notificationsEnabled BOOLEAN DEFAULT FALSE,
  frequency TEXT CHECK (frequency IN ('immediate', 'daily', 'weekly')),
  categories TEXT, -- JSON string
  lastEmailSent DATETIME,
  emailVerifiedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📋 Setup Instructions

### 1. Environment Configuration

Add to `.env.local` and `.env.production`:

```bash
# Resend API Configuration
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# App URL for unsubscribe links
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Domain Verification

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Configure DNS records as shown
4. Wait for verification (usually < 5 minutes)
5. Update `FROM_EMAIL` to use verified domain

### 3. Install Dependencies

```bash
npm install resend
```

### 4. Database Migration

The email preferences table is included in the main migration:
```bash
npx prisma db push
```

### 5. Test Email System

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "connection"}'

# Run comprehensive test suite
curl -X POST http://localhost:3000/api/email/test-suite \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "runAll": true}'
```

## 📊 Usage Examples

### Send Dividend Notification
```typescript
import { emailScheduler } from '@/lib/services/email-scheduler.service';

await emailScheduler.sendDividendNotification('user-id', {
  ticker: 'AAPL',
  amount: 125.50,
  paymentDate: '2024-08-15',
  shares: 100,
  ratePerShare: 1.255,
  monthlyTotal: 457.25,
  ytdTotal: 3245.75,
  yieldOnCost: 3.8,
  portfolioImpact: 0.25
});
```

### Send Milestone Notification
```typescript
await emailScheduler.sendMilestoneNotification('user-id', {
  name: 'Utilities Coverage',
  targetAmount: 50000,
  currentAmount: 50250,
  progressPercent: 100.5,
  nextMilestone: 'Food Coverage',
  timeToNext: '8 months',
  category: 'utilities'
});
```

### Check User Email Preferences
```typescript
import { emailService } from '@/lib/services/email.service';

const canSend = await emailService.shouldSendEmail('user-id', 'dividendNotifications');
if (canSend) {
  // Send notification
}
```

## 🎯 FIRE Milestones

The system includes 7 predefined FIRE milestones:

1. **Utilities Coverage** - $25,000 ($1,000/month × 25)
2. **Food Coverage** - $75,000 ($3,000/month × 25)  
3. **Transportation Coverage** - $125,000 ($5,000/month × 25)
4. **Healthcare Coverage** - $200,000 ($8,000/month × 25)
5. **Housing Coverage** - $375,000 ($15,000/month × 25)
6. **Lifestyle Freedom** - $500,000 ($20,000/month × 25)
7. **Complete FIRE** - $1,000,000 ($40,000/month × 25)

Milestones are automatically detected when:
- New holdings are added to portfolios
- Portfolio values are updated
- Manual milestone checks are triggered

## 🔄 Email Scheduling

### Weekly Summaries
- **Schedule**: Every Sunday at 6:00 PM
- **Recipients**: Users with `weeklyDigests: true`
- **Content**: Portfolio performance, dividends, insights
- **Retry**: 3 attempts with exponential backoff

### Background Processing
- **Job Queue**: In-memory (upgradeable to Redis/BullMQ)
- **Batch Size**: 10 emails per batch
- **Rate Limiting**: 30 emails/minute
- **Error Handling**: Failed jobs retry automatically

## 🛡 Security & Compliance

### Email Validation
- RFC 5321 compliant validation
- Domain verification checks
- Bounce detection and handling

### Unsubscribe Compliance
- One-click unsubscribe in all emails
- Branded unsubscribe pages
- Granular category unsubscribe options
- Immediate preference updates

### Rate Limiting
- **Per minute**: 30 emails
- **Per hour**: 300 emails  
- **Per day**: 2,000 emails
- **Burst protection**: 10 emails max burst

### Error Handling
- Comprehensive error logging
- Retry logic for transient failures
- Graceful degradation during outages
- Circuit breaker for API failures

## 🧪 Testing

### Manual Testing
```bash
# Test basic connectivity
POST /api/email/test
{
  "email": "test@example.com",
  "type": "connection"
}

# Test dividend notification
POST /api/email/test
{
  "email": "test@example.com", 
  "type": "dividend"
}

# Test milestone notification
POST /api/email/test
{
  "email": "test@example.com",
  "type": "milestone"
}
```

### Comprehensive Test Suite
```bash
# Run all tests
POST /api/email/test-suite
{
  "email": "test@example.com",
  "runAll": true
}
```

### Scheduler Testing
```bash
# Start scheduler
POST /api/email/scheduler
{ "action": "start" }

# Trigger weekly summaries
POST /api/email/scheduler  
{ "action": "trigger_weekly" }

# Check status
GET /api/email/scheduler
```

## 📈 Monitoring

### Key Metrics
- **Delivery Rate**: % of emails successfully sent
- **Open Rate**: % of emails opened (if tracking enabled)
- **Unsubscribe Rate**: % of users who unsubscribe
- **Error Rate**: % of failed email sends
- **Response Time**: API response times for email operations

### Log Monitoring
```bash
# Email service logs
grep "EMAIL SERVICE" logs/app.log

# Scheduler logs  
grep "EMAIL SCHEDULER" logs/app.log

# Milestone tracking logs
grep "MILESTONE TRACKER" logs/app.log
```

## 🔧 Troubleshooting

### Common Issues

#### "Email provider not configured"
- Check `RESEND_API_KEY` is set
- Verify API key format starts with `re_`
- Ensure `FROM_EMAIL` is configured

#### "Domain not verified"
- Add domain to Resend dashboard
- Configure DNS records
- Wait for verification (up to 24 hours)

#### "Rate limit exceeded"
- Check current rate limits in logs
- Implement request throttling
- Consider upgrading Resend plan

#### "Email not verified"
- Send verification email to user
- Check verification token validity
- Verify email verification flow

### Debug Mode
Enable detailed logging:
```bash
DEBUG_MODE=true
```

## 🚀 Production Deployment

### Checklist
- [ ] Configure `RESEND_API_KEY` in production
- [ ] Verify domain in Resend dashboard
- [ ] Set correct `NEXT_PUBLIC_APP_URL`
- [ ] Test email sending in production
- [ ] Monitor delivery rates
- [ ] Set up error alerting
- [ ] Configure log aggregation

### Performance Optimization
- Use Redis for job queue in high-volume scenarios
- Implement database connection pooling
- Set up CDN for email assets
- Monitor API rate limits

### Scaling Considerations
- Move to dedicated email queue service (Redis/BullMQ)
- Implement horizontal scaling for email workers
- Use dedicated database for email logs
- Consider email analytics service integration

## 📞 Support

For issues with the email system:

1. **Check logs** for error messages
2. **Run test suite** to validate configuration  
3. **Verify environment** variables are set correctly
4. **Test Resend API** directly if needed
5. **Check domain verification** status

This email system provides a solid foundation for reliable, scalable email notifications that will enhance user engagement and provide valuable portfolio insights.