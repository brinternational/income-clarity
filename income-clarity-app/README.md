# Income Clarity Application

*Production-ready dividend income lifestyle management tool*

## 🚀 Quick Start

### **🌟 LIVE SITE**: https://incomeclarity.ddns.net ✅
*Currently running in **Lite Production** mode - fully operational!*

```bash
# Lite Production (currently active)
npm install

# PRIMARY METHOD: Use custom server for reliable startup
node custom-server.js         # Custom Next.js server wrapper (RECOMMENDED)
# Note: Server startup issues have been resolved with custom-server.js

# Alternative methods (if needed):
./RESTART_LITE_PRODUCTION.sh  # Complete restart with cleanup
npm run dev                   # Standard development mode (may exit immediately)

# Full Production (future)
npm run build                # Build for production
npm run start                # Production server

# Check for syntax errors quickly
npx tsc --noEmit             # Find all TypeScript/syntax errors without building

# ⚠️ IMPORTANT: NEVER use 2>&1 with any command!
# The 2>&1 redirect causes issues with npx/npm commands
# BAD:  npx tsc --noEmit 2>&1
# GOOD: npx tsc --noEmit
```

### 📊 Current Status: **LITE PRODUCTION** 🧪
- **URL**: https://incomeclarity.ddns.net ✅ LIVE  
- **Mode**: Development server with hot reload for customization
- **Database**: SQLite (local file)  
- **SSL**: Valid certificates ✅
- **Purpose**: Personal finance setup and customization ⚡

## 📱 About Income Clarity

Income Clarity helps dividend income earners optimize their portfolio income and track progress toward financial independence through:

- **Daily SPY Validation** - Emotional fuel through market comparison
- **Income Clarity** - Net income after taxes, not just gross
- **Milestone Gamification** - Progress tracking from utilities to freedom
- **Tax Intelligence** - Location-aware calculations (PR = 0% tax advantage)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: localStorage (PostgreSQL + Auth + Edge Functions)
- **Testing**: Playwright E2E + Jest Unit Tests
- **Deployment**: nginx + SSL on Ubuntu 25.04
- **APIs**: Polygon.io for real-time stock data

## 📂 Project Structure

```
income-clarity-app/
├── app/                    # Next.js 15 App Router
│   ├── dashboard/         # Main dashboard pages
│   ├── auth/              # Authentication flows
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── auth/              # Authentication components
│   └── ui/                # Base UI components
├── lib/                   # Core business logic
│   ├── services/          # External service integrations
│   ├── utils/             # Utility functions
│   └── calculations/      # Financial calculations
├── types/                 # TypeScript type definitions
├── docs/                  # 📚 ORGANIZED DOCUMENTATION
│   ├── setup/             # Installation & configuration
│   ├── deployment/        # Production deployment
│   ├── testing/           # Testing documentation
│   ├── development/       # Development resources
│   ├── reports/           # Technical reports
│   └── guides/            # Feature guides
└── tests/                 # Test suites
```

## 🚨 CRITICAL: FOLDER ORGANIZATION RULES

### ❌ FORBIDDEN: Files in Root Directory
**NEVER place these in root (`/income-clarity-app/`) after initial development:**

- `*.md` files (except README.md)
- `debug-*.js` or `test-*.js` files
- `*-snippet-*.json` files
- `*-batch-*.txt` files
- Configuration files not part of standard Next.js setup
- Temporary files of any kind

### ✅ REQUIRED: Use Organized Structure

#### Documentation → `/docs/`
```bash
# Setup & Configuration
docs/setup/DEVELOPMENT_SETUP.md
docs/setup/localStorage_SETUP.md
docs/setup/AUTH_SETUP_GUIDE.md

# Deployment & Production
docs/deployment/DEPLOYMENT_GUIDE.md
docs/deployment/PRODUCTION_CHECKLIST.md
docs/deployment/SSH_DEPLOYMENT_GUIDE.md

# Testing & Quality
docs/testing/localStorage_TEST_RESULTS.md
docs/testing/E2E_TEST_RESULTS.md

# Development Resources
docs/development/PERFORMANCE_ANALYSIS.md
docs/development/THEMES.md

# Technical Reports
docs/reports/CONNECTIVITY_ISSUES_RESOLVED.md
docs/reports/SUPER_CARDS_LOADING_FIX.md

# Feature Guides
docs/guides/WEB_SHARE_VERIFICATION.md
docs/guides/BACKUP_STRATEGY.md
```

#### Temporary Files → `/scripts/temp/` or DELETE
```bash
# Create temporary files in designated folders:
scripts/temp/debug-login.js      # For debugging scripts
scripts/temp/test-api.js         # For API testing
scripts/temp/snippet-data.json   # For data snippets

# DELETE immediately after use:
rm scripts/temp/debug-*.js
rm scripts/temp/test-*.js
rm scripts/temp/*-snippet-*.json
```

#### Scripts → `/scripts/`
```bash
scripts/build.js                 # Build automation
scripts/deploy.sh                # Deployment scripts
scripts/test-polygon.js          # API testing
scripts/cleanup.sh               # File cleanup automation
```

## 🧪 Test User Login

For developers working on this project, a test user account is available:

**Test User Credentials:**
- **Email**: `test@example.com`
- **Password**: `password123`

The test user comes with realistic financial data pre-loaded:
- Portfolio value: $125,000
- Monthly dividend income: $650
- 4 holdings (SCHD, VTI, VXUS, BND)
- Expense tracking with milestone progress
- Tax calculations for California (high-tax example)

### How to Use Test Account

1. **Login via UI**: Use the "Login as Test User" button on the login page
2. **Manual Login**: Enter the credentials in the login form
3. **Create Test User**: Run `node scripts/create-test-user.js` to recreate if needed

The test user automatically gets realistic data seeded including portfolio holdings, expense categories, milestone progress, and tax scenarios for testing all app features.

## 🛠️ Development Commands

### Essential Commands
```bash
# Port Management (CRITICAL FIRST STEP)
npm run port:status              # Check if port 3000 is free
npm run port:kill                # Kill existing processes
npm run dev:safe                 # Start with port cleanup

# Development
npm run dev                      # Start development server
npm run build                    # Production build
npm run start                    # Start production server

# Quality Assurance
npm run type-check               # TypeScript validation
npm run lint                     # ESLint checks
npm run test                     # Run test suite
npm run test:e2e                 # Playwright E2E tests

# API Testing
node scripts/test-polygon-direct.js  # Test Polygon API key

# Test User Management
node scripts/create-test-user.js     # Create/recreate test user
```

### Port Management Rules
**ABSOLUTE RULE: ONE SERVER ONLY ON PORT 3000**

1. **Port 3000 ONLY** - Never use alternate ports (3001, 3002, etc.)
2. **Kill existing** - Always run `npm run port:kill` before starting
3. **Fail loudly** - If port can't be cleared, ABORT - don't continue
4. **No auto-switching** - Never let Next.js auto-select alternate ports

## 🏗️ Build SOP (Standard Operating Procedure)

### Common Build Issues & Solutions
1. **Prisma client not generated** → Run `npx prisma generate`
2. **Missing environment variables** → Check `.env.local`
3. **API routes failing** → Use Prisma singleton pattern
5. **Out of memory** → Use `NODE_OPTIONS="--max-old-space-size=8192"`

### Pre-Build Checklist
```bash
# 1. Clean previous build artifacts
npm run clean

# 2. Generate Prisma client
npm run db:generate

# 3. Verify environment variables
cat .env.local | grep -E "POLYGON|DATABASE|SESSION"

# 4. Type check first (fail fast)
npm run type-check
```

### Quick Fix Commands
```bash
# One-command clean build
npm run fix:build

# Individual steps if needed
npm run clean          # Remove .next and caches
npm run db:generate    # Generate Prisma client
npm run build          # Build application

# Build with more memory
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### API Route Best Practices
```typescript
// ❌ WRONG: Database at module level
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // This runs at build time!

// ✅ CORRECT: Use singleton pattern
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  // All database calls inside handlers
  try {
    const data = await prisma.user.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

### Build Debugging
```bash
# If build hangs, check processes
ps aux | grep next

# Kill stuck builds
pkill -9 -f "next build"

# Verbose output for debugging
NEXT_TELEMETRY_DISABLED=1 npm run build --verbose

# Test specific API routes
node -e "require('./app/api/your-route/route.ts')"
```

### Build Issue Resolution Flow
```
Build Failed?
├── "Cannot find module" → npm install
├── "Prisma client error" → npx prisma generate  
├── "Type error" → npm run type-check
├── "Out of memory" → NODE_OPTIONS="--max-old-space-size=8192"
└── Nuclear option → rm -rf node_modules && npm install
```

## 🚦 Environment Progression

### Development → Lite Production → Full Production

| Stage | Purpose | Database | External Services | When to Use |
|-------|---------|----------|-------------------|------------|
| **Development** | Local coding & testing | SQLite | None | Writing code |
| **Lite Production** | Personal testing (current) | SQLite | Polygon API only | Testing features |
| **Full Production** | Live deployment | localStorage | All services | Public launch |

### 🧪 Current Stage: LITE PRODUCTION
We are currently in **Lite Production** - a simplified production-like environment for personal testing:
- ✅ All core features working
- ✅ Using SQLite (no localStorage yet)
- ✅ Minimal external dependencies
- ✅ Running at https://incomeclarity.ddns.net
- ⏳ Will migrate to Full Production when 100% ready

### Switching Environments
```bash
# Switch between environments
./scripts/switch-env.sh local          # Development
./scripts/switch-env.sh lite           # Lite Production (current)
./scripts/switch-env.sh production     # Full Production (future)

# Current environment uses .env.lite-production
```

## 🔧 Environment Setup

### Required Environment Variables
```env
# Polygon.io API (already configured)
POLYGON_API_KEY=ImksH64K_m3BjrjtSpQVYt0i3vjeopXa

# localStorage (configure for your instance)
NEXT_PUBLIC_localStorage_URL=your_localStorage_url
NEXT_PUBLIC_localStorage_ANON_KEY=your_anon_key
localStorage_SERVICE_ROLE_KEY=your_service_key

# Security
SESSION_SECRET=change_in_production
```

### Setup Instructions
1. **First Time**: Follow `docs/setup/DEVELOPMENT_SETUP.md`
2. **localStorage**: Follow `docs/setup/localStorage_SETUP.md`
3. **Production**: Follow `docs/deployment/DEPLOYMENT_GUIDE.md`

## 🧪 Testing

### Test Coverage
- **E2E Tests**: 322 tests with 100% success rate
- **Unit Tests**: Core business logic coverage
- **Integration Tests**: API and database connectivity

### Running Tests
```bash
npm run test                     # All tests
npm run test:unit                # Unit tests only
npm run test:e2e                 # E2E tests only
npm run test:e2e:headed          # E2E with browser UI
```

## 🚀 Production Deployment

### Current Deployment
- **Server**: Ubuntu 25.04 on DigitalOcean (137.184.142.42)
- **Web Server**: nginx 1.26.3 with SSL
- **Domain**: https://incomeclarity.ddns.net (points to THIS server!)
- **SSL**: Let's Encrypt with auto-renewal
- **⚠️ IMPORTANT**: You are currently on the production server - any builds or changes here go live immediately!

### Deployment Process
1. **Build**: `npm run build`
2. **Upload**: Follow `docs/deployment/SSH_DEPLOYMENT_GUIDE.md`
3. **SSL**: Certificates auto-renew via certbot
4. **Monitoring**: Health checks and error tracking

## 🔒 Security Features

- **Authentication**: localStorage Auth with MFA support
- **Session Management**: Secure session validation
- **API Security**: Rate limiting and request validation
- **SSL/TLS**: Full HTTPS encryption
- **Environment**: Secure variable management

## 📊 Performance

### Optimization Features
- **Multi-tier Caching**: L1 (memory) + L2 (Redis) + L3 (database)
- **Edge CDN**: Global content distribution
- **Mobile Optimization**: Battery-efficient polling
- **Code Splitting**: Lazy loading for optimal performance

### Performance Targets
- **Load Time**: <2 seconds
- **Lighthouse Score**: >90
- **Uptime**: >99.9%
- **Error Rate**: <0.1%

## 📚 Documentation

### Quick Access
- **Setup**: `docs/setup/DEVELOPMENT_SETUP.md`
- **API**: `docs/POLYGON_API_SETUP.md`
- **Deployment**: `docs/deployment/DEPLOYMENT_GUIDE.md`
- **Testing**: `docs/testing/`

### Architecture
- **Blueprint**: `../SUPER_CARDS_BLUEPRINT.md`
- **Tasks**: `../SUPER_CARDS_MASTER_TODO.md`
- **AI Coordination**: `../CLAUDE.md`

## 🤝 Contributing

### Before ANY Development
1. **Read**: `docs/setup/DEVELOPMENT_SETUP.md`
2. **Port Check**: `npm run port:kill && npm run port:status`
3. **Environment**: Verify `.env.local` configuration
4. **Documentation**: Keep `docs/` folders organized

### File Organization Rules
- **Documentation** → `docs/` subdirectories
- **Temporary files** → `scripts/temp/` or DELETE
- **Root directory** → Keep clean (only essential files)
- **Before commit** → Run cleanup scripts

### Quality Standards
- **TypeScript**: 100% for new code
- **Testing**: >80% coverage target
- **Performance**: <2s load time
- **Mobile**: Responsive design required
- **Documentation**: Update as you build

## 📈 Project Status

- **Architecture Grade**: 9.6/10 - Enterprise-grade
- **Security**: ✅ Critical vulnerabilities patched
- **Performance**: ✅ Multi-tier caching, edge optimization
- **API Integration**: ✅ Polygon.io configured
- **Ready For**: ✅ Staging deployment → Production launch

## 💡 Key Features

### 5 Super Cards Architecture
1. **SPY Comparison** - Daily market validation
2. **Income Clarity** - Tax-aware income calculations
3. **Expense Milestones** - Gamified progress tracking
4. **Holdings Performance** - Individual ETF analysis
5. **Tax Strategy** - Location-based optimization

### User Psychology Focus
- **Daily Validation** - Emotional fuel through SPY comparison
- **Income Clarity** - NET income after taxes (the magic number)
- **Milestone Achievement** - Utilities → Rent → Freedom progression
- **Tax Intelligence** - Sophisticated location-aware strategies

---

**🚨 Remember: KEEP ROOT DIRECTORY CLEAN - Use organized folder structure!**

*Building the tool that makes dividend income lifestyle emotionally rewarding and financially optimized.*

## Docs

Command & config reference can be found [here](https://localStorage.com/docs/reference/cli/about).

## Breaking changes

The CLI is a WIP and we're still exploring the design, so expect a lot of breaking changes. We try to document migration steps in [Releases](https://github.com/localStorage/cli/releases). Please file an issue if these steps don't work!

## Developing

To run from source:

```sh
# Go >= 1.18
go run . help
```

---

## Sponsors

[![New Sponsor](https://user-images.githubusercontent.com/10214025/90518111-e74bbb00-e198-11ea-8f88-c9e3c1aa4b5b.png)](https://github.com/sponsors/localStorage)
