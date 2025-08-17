# 🗂️ MASTER SERVICE CATALOG
*The complete index of all services, features, and infrastructure*
*Created: 2025-08-17 | Purpose: Instant feature location for META orchestrator*

## 📋 HOW TO USE THIS CATALOG

1. **META**: Check here FIRST before searching
2. **Find by keywords**: Each entry has KEYWORDS for smart matching
3. **Navigate to folder**: Use WHERE path
4. **Read local CLAUDE.md**: Has all context needed
5. **Keep CLAUDE.md clean**: Update with current state only, remove old/stale info

## 🧹 CLAUDE.md MAINTENANCE RULES

**DO**:
- Keep current state only (e.g., "Port: 3000" not "Changed from 5000 to 3000")
- Update immediately after changes
- Remove outdated information
- Keep it concise and factual

**DON'T**:
- Keep historical bug fixes (just say "Login: Working")
- Leave stale configuration
- Add dates for every small change
- Keep information about removed features

---

## 🔥 CORE SERVICES

### API RATE LIMITING
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/rate-limiter/`
- **DOCS**: `/lib/services/rate-limiter/rate-limiter.service.ts`
- **STATUS**: ✅ Complete
- **KEYWORDS**: rate-limit, throttle, api-limit, 429, too-many-requests, throttling, rate, limit
- **COMPLEXITY**: 40k tokens
- **FEATURES**:
  - Redis-based with memory fallback
  - Per-API limits (Polygon, Yodlee)
  - Circuit breaker pattern
  - Exponential backoff
  - Queue management

### CACHING SERVICE
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/cache/`
- **STATUS**: ✅ Integrated in rate-limiter
- **KEYWORDS**: cache, redis, memory, storage, performance, speed
- **COMPLEXITY**: 20k tokens

### POLYGON API INTEGRATION
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/polygon/`
- **DOCS**: `/lib/services/polygon/polygon-batch.service.ts`
- **STATUS**: ✅ Complete
- **KEYWORDS**: polygon, stock, price, market, quotes, real-time, stocks
- **COMPLEXITY**: 30k tokens
- **FEATURES**:
  - Batch processing
  - Rate limiting aware
  - Price caching
  - Error handling

### YODLEE INTEGRATION
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/yodlee/`
- **DOCS**: `/lib/services/yodlee/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: yodlee, bank, plaid, fastlink, accounts, sync, banking
- **COMPLEXITY**: 60k tokens
- **FEATURES**:
  - OAuth 2.0 authentication
  - FastLink integration
  - Account syncing
  - Transaction import

### SUBSCRIPTION MANAGEMENT
- **WHO**: saas-cx-strategist
- **WHERE**: `/lib/services/subscription/`
- **DOCS**: `/lib/services/subscription/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: subscription, premium, tier, payment, billing, freemium
- **COMPLEXITY**: 40k tokens
- **FEATURES**:
  - FREE/PREMIUM/ENTERPRISE tiers
  - Feature gating
  - Trial management
  - Usage limits

### DATA SYNCHRONIZATION
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/sync/`
- **DOCS**: `/lib/services/sync/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: sync, synchronize, refresh, update, fetch, pull
- **COMPLEXITY**: 50k tokens
- **FEATURES**:
  - Orchestrated syncing
  - Rate limit compliance
  - Error recovery
  - Progress tracking

### DATA RECONCILIATION
- **WHO**: code-quality-manager
- **WHERE**: `/lib/services/reconciliation/`
- **DOCS**: `/lib/services/reconciliation/CLAUDE.md`
- **STATUS**: 🚧 In Progress
- **KEYWORDS**: reconcile, merge, duplicate, conflict, match
- **COMPLEXITY**: 40k tokens

### EMAIL SERVICE
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/email/`
- **FILES**: `email.service.ts`, `email-templates.service.ts`, `email-scheduler.service.ts`, `email-init.service.ts`
- **DOCS**: `/lib/services/email/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete (needs API key)
- **KEYWORDS**: email, notification, sendgrid, mail, alert, notify, scheduler
- **COMPLEXITY**: 30k tokens

### STOCK PRICE SERVICE
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/stock/`
- **FILE**: `stock-price.service.ts`
- **DOCS**: `/lib/services/stock/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: stock, price, quote, market, polygon, real-time
- **COMPLEXITY**: 25k tokens

### SUPER CARDS DATABASE
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/super-cards-db/`
- **FILE**: `super-cards-database.service.ts`
- **DOCS**: `/lib/services/super-cards-db/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: super-cards, database, hub, data, aggregation
- **COMPLEXITY**: 40k tokens

### TAX CALCULATOR
- **WHO**: saas-cx-strategist
- **WHERE**: `/lib/services/tax/`
- **FILE**: `tax-calculator.service.ts`
- **DOCS**: `/lib/services/tax/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: tax, calculator, federal, state, rate, bracket
- **COMPLEXITY**: 25k tokens

### PORTFOLIO IMPORT
- **WHO**: ux-performance-specialist
- **WHERE**: `/lib/services/portfolio-import/`
- **FILE**: `portfolio-import.service.ts`
- **DOCS**: `/lib/services/portfolio-import/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: import, csv, excel, upload, portfolio, parse
- **COMPLEXITY**: 30k tokens

### MILESTONE TRACKER
- **WHO**: saas-cx-strategist
- **WHERE**: `/lib/services/milestones/`
- **FILE**: `milestone-tracker.service.ts`
- **DOCS**: `/lib/services/milestones/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: milestone, goals, progress, tracking, achievements, fire
- **COMPLEXITY**: 25k tokens

### HOLDINGS PRICE UPDATER
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/holdings-updater/`
- **FILE**: `holdings-price-updater.service.ts`
- **DOCS**: `/lib/services/holdings-updater/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: holdings, price, update, refresh, sync, portfolio
- **COMPLEXITY**: 25k tokens

### HISTORICAL DATA SERVICE
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/historical/`
- **FILE**: `historical-data.service.ts`
- **DOCS**: `/lib/services/historical/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: historical, data, prices, history, time-series, charts
- **COMPLEXITY**: 30k tokens

### ENVIRONMENT VALIDATOR
- **WHO**: reliability-api-engineer
- **WHERE**: `/lib/services/environment/`
- **FILE**: `environment-validator.service.ts`
- **DOCS**: `/lib/services/environment/CLAUDE.md` (pending)
- **STATUS**: ✅ Complete
- **KEYWORDS**: environment, env, config, validation, variables, settings
- **COMPLEXITY**: 20k tokens

---

## 🎨 UI COMPONENTS

### SUPER CARDS COMPONENTS
- **WHO**: ux-performance-specialist
- **WHERE**: `/components/super-cards/`
- **DOCS**: `/components/super-cards/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: super-card, hub, dashboard, widget, card
- **COMPLEXITY**: 80k tokens
- **INCLUDES**:
  - PerformanceHub
  - IncomeIntelligenceHub
  - TaxStrategyHub
  - PortfolioStrategyHub
  - FinancialPlanningHub

### PORTFOLIO COMPONENTS
- **WHO**: ux-performance-specialist
- **WHERE**: `/components/portfolio/`
- **DOCS**: `/components/portfolio/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: portfolio, holdings, positions, assets, investments
- **COMPLEXITY**: 40k tokens

### INCOME COMPONENTS
- **WHO**: ux-performance-specialist
- **WHERE**: `/components/income/`
- **DOCS**: `/components/income/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: income, dividends, salary, revenue, earnings
- **COMPLEXITY**: 30k tokens

### PREMIUM COMPONENTS
- **WHO**: ux-performance-specialist
- **WHERE**: `/components/premium/`
- **DOCS**: `/components/premium/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: premium, upgrade, paywall, subscription, upsell
- **COMPLEXITY**: 25k tokens

### YODLEE UI COMPONENTS
- **WHO**: ux-performance-specialist
- **WHERE**: `/components/yodlee/`
- **DOCS**: `/components/yodlee/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: fastlink, bank-connect, account-link, yodlee-ui
- **COMPLEXITY**: 30k tokens

### DESIGN SYSTEM
- **WHO**: ux-performance-specialist
- **WHERE**: `/components/design-system/`
- **STATUS**: ✅ Complete
- **KEYWORDS**: design, ui, components, buttons, forms, inputs
- **COMPLEXITY**: 50k tokens

---

## 🛣️ API ROUTES

### SUPER CARDS APIS
- **WHO**: reliability-api-engineer
- **WHERE**: `/app/api/super-cards/`
- **DOCS**: `/app/api/super-cards/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: api, endpoint, super-cards, hub, route
- **COMPLEXITY**: 40k tokens
- **ENDPOINTS**:
  - `/performance-hub`
  - `/income-hub`
  - `/tax-strategy-hub`
  - `/portfolio-strategy-hub`
  - `/financial-planning-hub`

### YODLEE APIS
- **WHO**: reliability-api-engineer
- **WHERE**: `/app/api/yodlee/`
- **DOCS**: `/app/api/yodlee/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: yodlee-api, fastlink-token, accounts, refresh
- **COMPLEXITY**: 30k tokens

### AUTH APIS
- **WHO**: reliability-api-engineer
- **WHERE**: `/app/api/auth/`
- **STATUS**: ✅ Complete
- **KEYWORDS**: auth, login, signup, logout, session, authentication
- **COMPLEXITY**: 25k tokens

---

## 📱 PAGES

### DASHBOARD
- **WHO**: ux-performance-specialist
- **WHERE**: `/app/dashboard/`
- **VARIATIONS**:
  - `super-cards/` - Main dashboard
  - `super-cards-unified/` - All cards on one page
  - `super-cards-simple/` - Simplified view
- **DOCS**: Each has its own CLAUDE.md
- **STATUS**: ✅ Complete
- **KEYWORDS**: dashboard, home, main, overview

### SETTINGS
- **WHO**: ux-performance-specialist
- **WHERE**: `/app/settings/`
- **DOCS**: `/app/settings/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: settings, preferences, config, options

### PROFILE
- **WHO**: ux-performance-specialist
- **WHERE**: `/app/profile/`
- **DOCS**: `/app/profile/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: profile, user, account, personal

### ONBOARDING
- **WHO**: ux-performance-specialist
- **WHERE**: `/app/onboarding/`
- **DOCS**: `/app/onboarding/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: onboarding, setup, wizard, getting-started

---

## 🏗️ INFRASTRUCTURE

### NAVIGATION
- **WHO**: ux-performance-specialist
- **WHERE**: `/infrastructure/navigation/`
- **STATUS**: ✅ Complete
- **KEYWORDS**: navigation, menu, nav, header, footer

### THEME SYSTEM
- **WHO**: ux-performance-specialist
- **WHERE**: `/infrastructure/theme/`
- **STATUS**: ✅ Complete
- **KEYWORDS**: theme, dark-mode, light-mode, colors

### PWA
- **WHO**: ux-performance-specialist
- **WHERE**: `/infrastructure/pwa/`
- **STATUS**: ✅ Complete
- **KEYWORDS**: pwa, progressive, app, manifest, service-worker

### ERROR HANDLING
- **WHO**: reliability-api-engineer
- **WHERE**: `/infrastructure/`
- **DOCS**: `/infrastructure/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: error, exception, catch, boundary, fallback

---

## 🧪 TESTING

### E2E TESTS
- **WHO**: quality-assurance-specialist
- **WHERE**: `/e2e/`
- **STATUS**: ✅ Complete (98% coverage)
- **KEYWORDS**: e2e, playwright, test, integration

### UNIT TESTS
- **WHO**: quality-assurance-specialist
- **WHERE**: `/__tests__/`
- **STATUS**: ✅ Complete
- **KEYWORDS**: test, jest, unit, spec

### TEST SCRIPTS
- **WHO**: quality-assurance-specialist
- **WHERE**: `/scripts/`
- **DOCS**: `/scripts/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: test, script, verify, check

---

## 🔧 SCRIPTS & UTILITIES

### DATABASE SCRIPTS
- **WHO**: reliability-api-engineer
- **WHERE**: `/scripts/`
- **KEYWORDS**: seed, backup, migrate, database, db
- **FILES**:
  - `seed-demo-data.js`
  - `backup-database.js`
  - `setup-test-user.js`

### TEST SCRIPTS
- **WHO**: quality-assurance-specialist
- **WHERE**: `/scripts/`
- **KEYWORDS**: test, verify, check, validate
- **FILES**:
  - `test-yodlee-connection.js`
  - `test-subscription-system.js`
  - `test-polygon-integration.js`

### SERVER SCRIPTS
- **WHO**: reliability-api-engineer
- **WHERE**: `/scripts/`
- **KEYWORDS**: server, port, start, kill, run
- **FILES**:
  - `kill-port-3000.sh`
  - `meta-startup-check.sh`
  - `meta-context-health-check.sh`

---

## 📊 FEATURES (By Business Domain)

### PORTFOLIO MANAGEMENT
- **WHO**: ux-performance-specialist
- **WHERE**: `/features/portfolio/`
- **DOCS**: `/features/portfolio/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: portfolio, holdings, stocks, investments, assets

### INCOME TRACKING
- **WHO**: ux-performance-specialist
- **WHERE**: `/features/income/`
- **DOCS**: `/features/income/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: income, salary, dividends, revenue, cash-flow

### TAX STRATEGY
- **WHO**: saas-cx-strategist
- **WHERE**: `/features/tax-strategy/`
- **DOCS**: `/features/tax-strategy/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: tax, strategy, optimization, deduction, bracket

### FINANCIAL PLANNING
- **WHO**: saas-cx-strategist
- **WHERE**: `/features/financial-planning/`
- **DOCS**: `/features/financial-planning/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: fire, retirement, planning, goals, milestones

### SUPER CARDS (MAIN FEATURE)
- **WHO**: ux-performance-specialist
- **WHERE**: `/features/super-cards/`
- **DOCS**: `/features/super-cards/CLAUDE.md`
- **STATUS**: ✅ Complete
- **KEYWORDS**: super-cards, hubs, dashboard, intelligence, analytics

---

## 🚀 QUICK LOOKUP PATTERNS

### By Problem Type:
- **"API is slow"** → Rate Limiting, Caching
- **"Can't connect bank"** → Yodlee Integration
- **"Prices not updating"** → Stock Price Service, Polygon API
- **"Can't upgrade"** → Subscription Management
- **"Data mismatch"** → Data Reconciliation
- **"UI broken"** → Component in /components or /features
- **"Can't login"** → Auth APIs
- **"Email not sending"** → Email Service

### By Technology:
- **Redis** → Rate Limiting, Caching
- **Prisma** → Database, Super Cards Database
- **Polygon** → Stock Price, Polygon API
- **Yodlee** → Yodlee Integration, Sync
- **SendGrid** → Email Service
- **BullMQ** → Queue system (in sync)

### By User Action:
- **"Import portfolio"** → Portfolio Import Service
- **"Connect bank"** → Yodlee Integration
- **"View dashboard"** → Super Cards Components
- **"Change settings"** → Settings Page
- **"Upgrade account"** → Subscription Management

---

## 📝 HOW TO UPDATE THIS CATALOG

When adding a new service/feature:
1. Add entry in appropriate section
2. Include all required fields (WHO, WHERE, DOCS, STATUS, KEYWORDS)
3. Add multiple keywords for smart matching
4. Update complexity estimate
5. Keep STATUS current

When removing a service/feature:
1. Mark as DEPRECATED first
2. Remove after confirming no dependencies
3. Clean up related CLAUDE.md files

---

**Last Updated**: 2025-08-17
**Total Services**: 30+
**Total Features**: 5 major
**Total Components**: 15+
**Coverage**: 95% of codebase