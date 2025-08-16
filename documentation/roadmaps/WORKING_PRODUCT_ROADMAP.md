# Working Product Roadmap - Income Clarity
**Goal**: Transform the prototype into a functional app users can actually use
**Timeline**: 2-3 weeks to MVP

## Phase 1: Authentication & User Accounts (Week 1)
**Without this, nothing else matters**

### Day 1-2: Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Configure authentication
- [ ] Test connection

### Day 3-4: Auth Implementation
- [ ] Fix login/signup pages
- [ ] Connect auth to Supabase
- [ ] Add password reset
- [ ] Session management

### Day 5-7: User Profile
- [ ] Save user settings to database
- [ ] Load user data on login
- [ ] Persist theme preference
- [ ] Basic profile management

## Phase 2: Data Persistence (Week 2)
**Make the app remember user data**

### Portfolio Management
- [ ] Save holdings to database
- [ ] CRUD operations for holdings
- [ ] Calculate real portfolio value
- [ ] Update calculations dynamically

### Expense Tracking
- [ ] Save expenses to database
- [ ] Monthly expense calculations
- [ ] Expense categories
- [ ] Historical tracking

### Income Tracking
- [ ] Track dividend payments
- [ ] Calculate real monthly income
- [ ] Above/below zero line with real data
- [ ] Historical income data

## Phase 3: Minimum Viable Features (Week 3)
**Core features that make it useful**

### Stock Data
- [ ] Basic stock price API (free tier)
- [ ] Update holdings prices daily
- [ ] Calculate real returns
- [ ] SPY comparison with real data

### Essential Features
- [ ] Data export (CSV minimum)
- [ ] Basic dividend calendar
- [ ] Simple tax calculations
- [ ] Mobile responsive testing

### Deployment
- [ ] Deploy to Vercel
- [ ] Configure production database
- [ ] Set up monitoring
- [ ] Beta user testing

## What We're NOT Doing (Yet)
- ❌ 2FA (add later)
- ❌ OAuth providers (add later)
- ❌ Email notifications (add later)
- ❌ Complex tax optimizations (add later)
- ❌ Real-time price updates (add later)
- ❌ Advanced analytics (add later)

## Success Criteria
A user can:
1. Create an account
2. Add their holdings
3. Track their expenses
4. See their real monthly income
5. Know if they're above/below zero
6. Access their data next time they login
7. Export their data

## Technical Decisions
- **Auth**: Supabase Auth (email/password only to start)
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API routes
- **Stock Data**: Alpha Vantage free tier (5 calls/minute)
- **Hosting**: Vercel
- **State**: Replace localStorage with database

## Next Immediate Steps
1. User creates Supabase project
2. Configure environment variables
3. Run migrations
4. Fix authentication flow
5. Start connecting features to database

---

**This is our North Star: A working app that saves data**