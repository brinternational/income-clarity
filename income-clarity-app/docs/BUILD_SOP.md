# Build Standard Operating Procedure (SOP)
*Ensuring Clean, Reliable Builds Every Time*

## 🚨 CRITICAL: Why Builds Fail

### Common Root Causes
1. **Database Dependencies**: Prisma client not generated or wrong import paths
2. **Environment Variables**: Missing required keys in `.env.local`
3. **Type Errors**: TypeScript strict mode catching issues
4. **Import Cycles**: Circular dependencies between modules
5. **API Route Issues**: Routes trying to access databases/services at build time
6. **Memory Issues**: Build process running out of memory

## ✅ Pre-Build Checklist (MANDATORY)

### 1. Environment Setup
```bash
# Verify all required environment variables exist
cat .env.local | grep -E "POLYGON|SUPABASE|SESSION|PRISMA"

# Required variables:
POLYGON_API_KEY=xxx
DATABASE_URL=file:./prisma/income_clarity.db
SESSION_SECRET=xxx
```

### 2. Database Preparation
```bash
# ALWAYS run before build
npx prisma generate
npx prisma db push  # Sync schema with database
```

### 3. Clean Previous Build
```bash
# Remove all build artifacts
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
```

## 🏗️ Build Process SOP

### Step 1: Validate Dependencies
```bash
# Check for missing dependencies
npm ls --depth=0

# Fix any missing dependencies
npm install

# Audit for vulnerabilities (optional)
npm audit
```

### Step 2: Type Check First (Fast Fail)
```bash
# Run TypeScript check BEFORE build
npm run type-check

# If errors, fix them before proceeding
# Common fixes:
# - Add missing types
# - Fix import paths
# - Resolve any 'any' types
```

### Step 3: Lint Check (Code Quality)
```bash
# Run linter
npm run lint

# Auto-fix what's possible
npm run lint -- --fix
```

### Step 4: Database Setup
```bash
# Generate Prisma client with correct output path
npx prisma generate

# Verify the client was generated
ls -la lib/generated/prisma/
```

### Step 5: Build with Monitoring
```bash
# Build with verbose output to catch issues
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or for debugging:
NEXT_TELEMETRY_DISABLED=1 npm run build
```

## 🔧 API Route Best Practices

### NEVER Do This in API Routes:
```typescript
// ❌ BAD: Database calls at module level
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const data = await prisma.user.findMany(); // FAILS at build time!

// ❌ BAD: Environment checks at module level
if (!process.env.POLYGON_API_KEY) {
  throw new Error('Missing API key'); // FAILS at build time!
}
```

### ALWAYS Do This:
```typescript
// ✅ GOOD: Database calls inside handlers
import { PrismaClient } from '@/lib/generated/prisma';

let prisma: PrismaClient;

export async function GET(request: NextRequest) {
  // Initialize inside the handler
  if (!prisma) {
    prisma = new PrismaClient();
  }
  
  // Environment checks inside handler
  if (!process.env.POLYGON_API_KEY) {
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }
  
  try {
    const data = await prisma.user.findMany();
    return NextResponse.json(data);
  } catch (error) {
    // Graceful error handling
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
```

## 📝 Code Organization Rules

### 1. Import Paths
```typescript
// ✅ GOOD: Use absolute imports
import { PrismaClient } from '@/lib/generated/prisma';
import { calculateDividends } from '@/lib/calculations';

// ❌ BAD: Relative imports that break
import { PrismaClient } from '../../../lib/generated/prisma';
```

### 2. Prisma Client Singleton
Create `/lib/db.ts`:
```typescript
import { PrismaClient } from '@/lib/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Then use in API routes:
```typescript
import { prisma } from '@/lib/db';

export async function GET() {
  const data = await prisma.user.findMany();
  // ...
}
```

### 3. Environment Variable Validation
Create `/lib/env.ts`:
```typescript
export const env = {
  polygonApiKey: process.env.POLYGON_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret',
  
  isValid() {
    return !!(this.polygonApiKey && this.databaseUrl);
  }
};
```

## 🚀 Quick Fix Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "prebuild": "npm run clean && npm run db:generate",
    "build": "next build",
    "clean": "rm -rf .next node_modules/.cache",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "fix:build": "npm run clean && npm run db:generate && npm run build",
    "dev:clean": "npm run clean && npm run dev"
  }
}
```

## 🔍 Debugging Build Failures

### 1. Verbose Build Output
```bash
# See what's happening
NEXT_TELEMETRY_DISABLED=1 npm run build --verbose
```

### 2. Check API Routes Individually
```bash
# Test each API route in isolation
node -e "require('./app/api/stock-price/route.ts')"
```

### 3. Memory Issues
```bash
# Increase Node memory for large builds
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### 4. Clear All Caches
```bash
# Nuclear option - clear everything
rm -rf .next
rm -rf node_modules
rm -rf .turbo
npm cache clean --force
npm install
npm run build
```

## 📊 Build Health Monitoring

### Daily Build Check
```bash
#!/bin/bash
# save as scripts/daily-build-check.sh

echo "🔍 Running daily build health check..."

# Clean environment
rm -rf .next

# Generate Prisma
npx prisma generate

# Type check
if ! npm run type-check; then
  echo "❌ Type check failed"
  exit 1
fi

# Lint
if ! npm run lint; then
  echo "❌ Lint failed"
  exit 1
fi

# Build
if ! npm run build; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build health check passed!"
```

## 🎯 Prevention Strategy

### 1. Pre-Commit Hooks
Install husky:
```bash
npm install -D husky
npx husky install
npx husky add .husky/pre-commit "npm run type-check && npm run lint"
```

### 2. CI/CD Pipeline
`.github/workflows/build.yml`:
```yaml
name: Build Check
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npx prisma generate
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
```

## 📋 Build Issue Resolution Flowchart

```
Build Failed?
├── Check error message
│   ├── "Cannot find module" → npm install
│   ├── "Prisma client" → npx prisma generate
│   ├── "Type error" → npm run type-check --fix
│   └── "Memory" → NODE_OPTIONS="--max-old-space-size=8192"
├── Clean build artifacts
│   └── rm -rf .next && npm run build
├── Check environment variables
│   └── Ensure .env.local has all required keys
└── Nuclear option
    └── rm -rf node_modules && npm install && npm run build
```

## 🏆 Golden Rules

1. **NEVER** commit without running `npm run build` first
2. **ALWAYS** run `npx prisma generate` after schema changes
3. **KEEP** API routes stateless and defensive
4. **USE** the Prisma singleton pattern
5. **TEST** builds locally before deploying
6. **DOCUMENT** any new environment variables
7. **MONITOR** build times - if >5 minutes, investigate

## 🆘 Emergency Contacts

If builds are consistently failing:
1. Check this SOP first
2. Review recent commits for breaking changes
3. Verify all services (database, APIs) are accessible
4. Check system resources (disk space, memory)

## ✅ Current Status

**Latest Build**: SUCCESS ✅  
**Lite Production Deployment**: LIVE at https://incomeclarity.ddns.net ✅  
**Environment**: Development mode with hot reload (Lite Production)
**Performance**: <1s response time  
**Issues**: All resolved with Prisma singleton pattern  

### Recent Deployment Success (2025-08-11)
- ✅ Fixed cross-origin blocking with Next.js allowedDevOrigins
- ✅ Resolved font 403 errors with nginx configuration
- ✅ Fixed server hanging issues in development mode
- ✅ Successful development server deployment with hot reload
- ✅ All API endpoints responding with HTTP 200
- ✅ SSL certificates working with nginx proxy

---

*Last Updated: 2025-08-11*  
*Version: 1.1 - Production Deployment Success*