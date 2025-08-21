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

# EMAIL SERVICE - CLAUDE.md

## 📧 Email Service Architecture (SendGrid Integration)

**STATUS**: Configured - Needs API Key  
**PROVIDER**: SendGrid  
**ENVIRONMENT**: Development (Mock Mode)

### Current State Overview
- ✅ Email service architecture complete
- ✅ Template system operational
- ✅ Scheduler system ready
- ⚠️ **API KEY REQUIRED**: SENDGRID_API_KEY not configured
- ✅ Mock mode working for development
- ✅ Rate limiting implemented
- ✅ Retry logic with exponential backoff

### Service Files Structure
```
/lib/services/email/
├── email.service.ts              # Core email service (SendGrid)
├── email-templates.service.ts    # HTML/text template system
├── email-scheduler.service.ts    # Scheduled email handling
└── email-init.service.ts         # Service initialization
```

## 🛠️ Core Email Service (email.service.ts)

### Key Features
- **SendGrid Integration**: Production-ready email delivery
- **Rate Limiting**: 30/min, 300/hour, 2000/day
- **Retry Logic**: 3 attempts with exponential backoff
- **Mock Mode**: Development mode when API key not configured
- **Email Validation**: Enhanced validation with RFC compliance
- **Bulk Email Support**: Batch processing with rate limiting

### Critical Methods
```typescript
// Core email sending
sendEmail(request: EmailSendRequest): Promise<EmailSendResponse>
sendBulkEmails(requests: EmailSendRequest[]): Promise<EmailSendResponse[]>

// Notification system
sendNotificationEmail(userId, category, templateData): Promise<EmailSendResponse>
sendDividendNotification(userId, dividendData): Promise<EmailSendResponse>
sendMilestoneNotification(userId, milestoneData): Promise<EmailSendResponse>
sendWeeklySummary(userId, summaryData): Promise<EmailSendResponse>

// Testing & validation
sendTestEmail(recipientEmail: string): Promise<EmailSendResponse>
getStatus(): ServiceStatus
```

### Environment Variables Required
```bash
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Current Configuration Status
- ✅ Service initialized and ready
- ⚠️ **SENDGRID_API_KEY**: Placeholder value (needs real key)
- ⚠️ **FROM_EMAIL**: Needs verified domain email
- ✅ Mock mode active for development

## 📧 Template System (email-templates.service.ts)

### Template Types Available
1. **Dividend Notifications**: Payment received alerts
2. **Milestone Achievements**: FIRE progress milestones
3. **Weekly Summaries**: Portfolio performance reports
4. **Generic Notifications**: System updates, alerts

### Template Features
- **Responsive Design**: Mobile-optimized HTML
- **Income Clarity Branding**: Consistent brand colors
- **Rich Content**: Financial metrics, progress indicators
- **Text Fallbacks**: Plain text versions for all templates
- **Unsubscribe Links**: Automatic unsubscribe URL generation

### Key Template Methods
```typescript
// Template generation
generateDividendNotification(data: EmailTemplateData): EmailTemplate
generateMilestoneAchievement(data: EmailTemplateData): EmailTemplate
generateWeeklySummary(data: EmailTemplateData): EmailTemplate
generateTemplate(category, data): EmailTemplate
```

### Template Data Structure
```typescript
interface EmailTemplateData {
  userFirstName?: string;
  unsubscribeUrl?: string;
  appUrl?: string;
  dividend?: DividendData;
  milestone?: MilestoneData;
  weeklySummary?: WeeklySummaryData;
  portfolioAlert?: PortfolioAlertData;
}
```

## ⏰ Email Scheduler (email-scheduler.service.ts)

### Scheduling Features
- **Weekly Summaries**: Automatic Sunday 6 PM delivery
- **Immediate Sending**: Real-time notifications
- **Retry Logic**: Failed email retry with backoff
- **Batch Processing**: Eligible user batch operations
- **Error Handling**: Comprehensive error tracking

### Key Scheduler Methods
```typescript
// Scheduling
scheduleEmail(userId, category, templateData, scheduledFor): Promise<string>
scheduleWeeklySummaries(): Promise<void>

// Direct notifications
sendDividendNotification(userId, dividendData): Promise<string>
sendMilestoneNotification(userId, milestoneData): Promise<string>

// Scheduler control
startWeeklyScheduler(): void
stopWeeklyScheduler(): void
getStatus(): { running: boolean; nextWeeklyRun?: string }
```

### Weekly Summary Process
1. **Find Eligible Users**: Email verified, notifications enabled
2. **Generate Portfolio Data**: Real-time portfolio summaries
3. **Batch Schedule**: Process all users with rate limiting
4. **Error Handling**: Individual user error isolation

## 🚀 Service Initialization (email-init.service.ts)

### Auto-Initialization
- **Production Mode**: Auto-starts after 5-second delay
- **Development Mode**: Manual initialization
- **Scheduler Setup**: Weekly summary scheduler activation

### Initialization Methods
```typescript
initializeEmailServices(): void     // Start all email services
shutdownEmailServices(): void      // Clean shutdown
isEmailServicesInitialized(): boolean  // Status check
```

## 🔧 Configuration Requirements

### Environment Setup
```bash
# Required for production
SENDGRID_API_KEY=SG.real_api_key_from_sendgrid
FROM_EMAIL=noreply@incomeclarity.com  # Must be verified domain

# Optional configuration
NEXT_PUBLIC_APP_URL=https://incomeclarity.com
NODE_ENV=production
```

### SendGrid Setup Required
1. **Create SendGrid Account**
2. **Generate API Key** with full send permissions
3. **Verify Sender Domain** in SendGrid console
4. **Configure Environment Variables**

## 📊 Current Status & Next Steps

### Working Features
- ✅ Template system generating beautiful emails
- ✅ Scheduler system ready for production
- ✅ Rate limiting and retry logic implemented
- ✅ Mock mode for development testing
- ✅ User preference checking

### Requires Configuration
- ⚠️ **SendGrid API Key** for production sending
- ⚠️ **Domain Verification** for from_email
- ⚠️ **Email Preferences** database schema completion

### Testing Commands
```bash
# Test email service status
curl http://localhost:3000/api/email/status

# Send test email (development)
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🚨 Important Notes

### Development Mode
- **Mock Mode Active**: All emails logged, not sent
- **Real Templates**: Full template rendering works
- **Rate Limiting**: Active even in mock mode
- **Scheduler**: Can be tested without real sending

### Production Requirements
- **API Key**: Must start with "SG." format
- **Domain Verification**: FROM_EMAIL must be verified
- **Rate Limits**: Respect SendGrid's sending limits
- **Monitoring**: Log all send attempts and failures

### Integration Points
- **User Preferences**: Checks email_preferences table
- **Portfolio Data**: Integrates with holdings/portfolio services
- **Notification Categories**: Respects user notification settings
- **Unsubscribe Handling**: Auto-generates unsubscribe URLs

## 📈 Performance Metrics

### Rate Limiting
- **Per Minute**: 30 emails
- **Per Hour**: 300 emails  
- **Per Day**: 2000 emails
- **Burst Limit**: 10 emails
- **Backoff**: Exponential retry delay

### Reliability Features
- **3 Retry Attempts** with exponential backoff
- **Error Logging** for all failures
- **Delivery Tracking** for successful sends
- **Rate Limit Handling** with automatic delays
- **Batch Processing** to avoid API overwhelming