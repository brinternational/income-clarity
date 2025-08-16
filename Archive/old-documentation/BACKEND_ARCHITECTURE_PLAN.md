# Income Clarity - Backend Architecture Plan
**Created**: August 7, 2025  
**Status**: Planning Document v1.0

## Overview

This document outlines the backend architecture for migrating Income Clarity from a localhost React app to a production-ready SaaS application.

## Technology Stack

### Core Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes + Supabase Client
- **Hosting**: Vercel (Next.js optimized)
- **File Storage**: Supabase Storage (for exports/reports)
- **Real-time**: Supabase Realtime (future: collaboration)

### External APIs
- **Stock Data**: IEX Cloud (50k requests/month free tier)
- **Backup Option**: Alpha Vantage or Polygon.io
- **Payment Processing**: Stripe (when monetizing)

## Database Schema

### Core Tables

```sql
-- Users table (managed by Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP
)

-- User profiles (extended user data)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  display_name TEXT,
  target_monthly_income DECIMAL(10,2),
  current_age INTEGER,
  retirement_goal INTEGER,
  tax_filing_status TEXT,
  state_of_residence TEXT,
  theme_preference TEXT DEFAULT 'banking-classic',
  haptic_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Portfolios (users can have multiple)
portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  total_value DECIMAL(12,2),
  margin_enabled BOOLEAN DEFAULT false,
  margin_maintenance DECIMAL(5,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Holdings (actual investments)
holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  shares DECIMAL(12,4) NOT NULL,
  cost_basis DECIMAL(12,2),
  current_price DECIMAL(10,2),
  annual_dividend DECIMAL(10,4),
  dividend_yield DECIMAL(5,2),
  is_qualified BOOLEAN DEFAULT true,
  sector TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(portfolio_id, symbol)
)

-- Dividend payments (historical and projected)
dividend_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID REFERENCES holdings ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios,
  ex_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  amount_per_share DECIMAL(10,4),
  total_amount DECIMAL(10,2),
  is_qualified BOOLEAN DEFAULT true,
  is_special BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'projected', -- projected, confirmed, paid
  created_at TIMESTAMP
)

-- Monthly expenses
expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- User settings (singleton per user)
user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  portfolio_update_frequency TEXT DEFAULT 'daily',
  email_notifications BOOLEAN DEFAULT true,
  dividend_reminder_days INTEGER DEFAULT 3,
  tax_reminder_enabled BOOLEAN DEFAULT true,
  accessibility_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- API cache (reduce external API calls)
api_cache (
  symbol TEXT PRIMARY KEY,
  cache_type TEXT NOT NULL, -- 'quote', 'dividend', 'profile'
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP
)
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
-- etc...

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR ALL USING (auth.uid() = user_id);

-- Cascade permissions through foreign keys
CREATE POLICY "Users can view portfolio holdings" ON holdings
  FOR ALL USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );
```

## API Structure

### Next.js API Routes

```
/api/
├── auth/
│   ├── login.ts
│   ├── logout.ts
│   ├── register.ts
│   └── session.ts
├── portfolio/
│   ├── index.ts (GET all, POST new)
│   ├── [id].ts (GET, PUT, DELETE single)
│   └── sync.ts (sync with external data)
├── holdings/
│   ├── index.ts
│   ├── [id].ts
│   └── bulk-update.ts
├── dividends/
│   ├── calendar.ts
│   ├── history.ts
│   └── projections.ts
├── market/
│   ├── quote.ts (cached stock quotes)
│   ├── batch-quotes.ts
│   └── spy-performance.ts
└── user/
    ├── profile.ts
    ├── settings.ts
    └── export.ts
```

### API Response Format

```typescript
// Success response
{
  success: true,
  data: any,
  meta?: {
    page?: number,
    total?: number,
    cached?: boolean
  }
}

// Error response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Authentication Flow

### Registration
1. User submits email/password
2. Supabase creates auth user
3. Trigger creates profile record
4. Welcome email sent
5. Redirect to onboarding

### Login
1. Email/password to Supabase Auth
2. Receive JWT token
3. Store in httpOnly cookie
4. Fetch user profile
5. Initialize app state

### Session Management
- JWT refresh every 55 minutes
- Refresh token rotation
- Logout clears all tokens

## Data Migration Strategy

### Phase 1: Parallel Operation
1. Deploy backend while keeping localStorage
2. New users → database
3. Existing users → localStorage with sync option
4. Migration prompt for existing users

### Phase 2: Migration Tools
```typescript
// Migration endpoint
POST /api/migrate
{
  localData: {
    profile: {},
    portfolio: {},
    holdings: [],
    expenses: []
  }
}
```

### Phase 3: Deprecate localStorage
1. Set migration deadline
2. Auto-migrate on login
3. Remove localStorage code

## Caching Strategy

### API Response Caching
- Stock quotes: 5 minutes
- Dividend data: 24 hours
- SPY benchmark: 15 minutes
- User data: No cache (always fresh)

### Implementation
```typescript
const cache = {
  async get(key: string) {
    const result = await supabase
      .from('api_cache')
      .select('*')
      .eq('symbol', key)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    return result.data?.data;
  },
  
  async set(key: string, data: any, ttl: number) {
    await supabase
      .from('api_cache')
      .upsert({
        symbol: key,
        data,
        expires_at: new Date(Date.now() + ttl).toISOString()
      });
  }
};
```

## Security Considerations

### API Security
- Rate limiting: 100 requests/minute per user
- API key rotation every 90 days
- Request signing for sensitive operations
- Input validation on all endpoints

### Data Security
- All data encrypted at rest (Supabase)
- TLS for all communications
- No financial credentials stored
- PII minimization

### Authentication Security
- Passwords: bcrypt with cost factor 10
- 2FA support (TOTP)
- Session timeout: 7 days
- Account lockout after 5 failed attempts

## Performance Targets

### Response Times
- API endpoints: < 200ms (p95)
- Database queries: < 50ms (p95)
- External API calls: < 1s (cached)
- Page load: < 2s (initial)

### Optimization Strategies
- Database indexes on common queries
- Aggressive caching for market data
- CDN for static assets
- Edge functions for simple calculations

## Monitoring & Logging

### Application Monitoring
- Vercel Analytics (built-in)
- Sentry for error tracking
- Custom performance metrics

### Key Metrics
- User signup/login rates
- API response times
- Cache hit rates
- Error rates by endpoint
- Daily active users

## Cost Projections

### Monthly Costs (0-1000 users)
- Supabase: $0 (free tier)
- Vercel: $0 (hobby tier)
- IEX Cloud: $0 (50k requests)
- Domain: $1/month
- **Total**: ~$1/month

### Monthly Costs (1000-10k users)
- Supabase: $25 (Pro tier)
- Vercel: $20 (Pro tier)
- IEX Cloud: $9 (Launch tier)
- Monitoring: $15
- **Total**: ~$69/month

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Configure authentication
- [ ] Set up Vercel project

### Phase 2: Core APIs (Week 2)
- [ ] User profile endpoints
- [ ] Portfolio CRUD
- [ ] Holdings management
- [ ] Basic dividend tracking

### Phase 3: Integration (Week 3)
- [ ] Connect frontend to APIs
- [ ] Implement caching
- [ ] Add market data APIs
- [ ] Migration tools

### Phase 4: Polish (Week 4)
- [ ] Error handling
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta deployment

## Next Steps

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize project
   supabase init
   
   # Start local development
   supabase start
   ```

2. **Set up Database**
   - Run schema migration
   - Create RLS policies
   - Set up triggers

3. **Configure Vercel**
   - Connect GitHub repo
   - Set environment variables
   - Configure domains

4. **Begin API Development**
   - Start with auth endpoints
   - Build portfolio management
   - Add market data integration

---

*This is a living document that will be updated as implementation progresses.*