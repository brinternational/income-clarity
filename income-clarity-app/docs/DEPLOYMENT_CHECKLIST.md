# ONE SERVER DEPLOYMENT CHECKLIST
*Simplified for Solo Developer, Single Server Architecture*

## 🎯 ONE SERVER APPROACH

**Income Clarity uses ONE SERVER for everything:**
- Live site: https://incomeclarity.ddns.net
- No dev/staging/prod separation (solo developer, pre-launch)
- Changes to code = immediate changes to live site
- PM2 manages the server (auto-restart on crash)
- **Deploy command**: `pm2 restart income-clarity`

This simplified checklist focuses on what matters for single-server deployment.

## Table of Contents

- [Quick Deploy (Most Common)](#quick-deploy-most-common)
- [Pre-Deploy Checks](#pre-deploy-checks) 
- [PM2 Deployment](#pm2-deployment)
- [Post-Deploy Verification](#post-deploy-verification)
- [Rollback (If Needed)](#rollback-if-needed)
- [When to Rebuild](#when-to-rebuild)

## 🚀 Quick Deploy (Most Common)

**For routine changes (80% of deployments):**

```bash
# 1. Quick verification (optional)
npm run type-check  # Verify TypeScript

# 2. Deploy instantly
pm2 restart income-clarity

# 3. Verify (optional)
curl https://incomeclarity.ddns.net/api/health
```

**That's it!** Changes are live in ~5-10 seconds.

## 🔍 Pre-Deploy Checks

### ✅ Essential Checks (For Major Changes)

**Only run these for significant changes:**

```bash
# 1. TypeScript validation (recommended)
npm run type-check
# Expected: No TypeScript errors

# 2. Build test (for major changes)
npm run build
# Expected: Build succeeds

# 3. Quick test (optional)
npm test
# Expected: Core tests pass
```

**Quality Gates:**
- [ ] All TypeScript errors resolved
- [ ] No ESLint violations
- [ ] Security audit passes
- [ ] Code formatting consistent
- [ ] No console.log statements in production code

### ✅ Simplified Testing (As Needed)

**Run tests only for significant changes:**

```bash
# For major changes only
npm run test:e2e  # Critical user flows
npm test          # Unit tests
```

**Testing Philosophy:**
- Quick changes: Deploy directly (rollback if issues)
- Major changes: Run E2E tests first
- Critical changes: Full test suite

### ✅ Performance (Major Changes Only)

```bash
# Only for significant architectural changes
npm run build:analyze  # Check bundle size
```

## 🚀 PM2 Deployment

### ✅ Standard Deployment Process

**Most deployments are this simple:**

```bash
# The magic command
pm2 restart income-clarity

# PM2 automatically:
# - Builds the app
# - Restarts the process
# - Handles zero-downtime restart
# - Maintains logs
```

**Build Verification:**
- [ ] Build completes without errors or warnings
- [ ] All static assets generated correctly
- [ ] Environment-specific configs loaded
- [ ] Bundle sizes within acceptable limits

### ✅ PM2 Commands Reference

```bash
# Basic operations
pm2 restart income-clarity    # Deploy changes
pm2 status                   # Check status
pm2 logs income-clarity       # View logs
pm2 stop income-clarity       # Stop app
pm2 start income-clarity      # Start app

# Monitoring
pm2 monit                    # Real-time monitoring
pm2 show income-clarity       # Detailed info
```

### ✅ Backup (Before Major Changes)

```bash
# Database backup (before significant changes)
cp prisma/income_clarity.db prisma/income_clarity.db.backup

# Code backup (automatic via git)
git add . && git commit -m "Backup before changes"
```

**Database Checklist:**
- [ ] Database server accessible
- [ ] Connection pooling configured
- [ ] All migrations applied successfully
- [ ] Schema matches Prisma schema
- [ ] Backup strategy verified
- [ ] Read replicas healthy (if applicable)

## ✅ Post-Deploy Verification

### Quick Health Check

```bash
# 1. App is running
curl https://incomeclarity.ddns.net/api/health
# Expected: {"status": "ok"}

# 2. Check PM2 status
pm2 status
# Expected: income-clarity online

# 3. Check logs for errors
pm2 logs income-clarity --lines 20
# Expected: No critical errors
```

**Dependencies Checklist:**
- [ ] Polygon API accessible and within rate limits
- [ ] Yodlee API configured and responding
- [ ] Redis server accessible and responsive
- [ ] Email service configured
- [ ] Monitoring services active
- [ ] CDN/static assets accessible

### Deep Verification (Major Changes)

```bash
# Login test
curl -X POST https://incomeclarity.ddns.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Dashboard test
curl https://incomeclarity.ddns.net/dashboard/super-cards

# Database test
npx prisma db:check
```

**Data Verification:**
- [ ] All database migrations applied
- [ ] Required seed data present
- [ ] Data relationships intact
- [ ] Indexes properly created
- [ ] Foreign key constraints satisfied

## 🔄 Rollback (If Needed)

### Emergency Rollback

```bash
# 1. Stop current app
pm2 stop income-clarity

# 2. Restore previous version
git checkout HEAD~1  # Go back one commit

# 3. Restart
pm2 start income-clarity

# 4. Verify rollback
curl https://incomeclarity.ddns.net/api/health
```

### Database Rollback

```bash
# If database needs rollback
pm2 stop income-clarity
cp prisma/income_clarity.db.backup prisma/income_clarity.db
pm2 start income-clarity
```

### Quick Fix and Redeploy

```bash
# Fix the issue
vim path/to/broken/file.ts

# Deploy fix
pm2 restart income-clarity

# Verify fix
curl https://incomeclarity.ddns.net/api/health
```

**Deployment Verification:**
- [ ] Application starts without errors
- [ ] Health check endpoints respond
- [ ] Database connections established
- [ ] External APIs accessible
- [ ] Error logs clean

## Post-Deployment Verification

### ✅ Functional Testing

**Run these tests immediately after deployment:**

```bash
# 1. API health check
curl -f http://localhost:3000/api/health
# Expected: {"status": "ok", "timestamp": "..."}

# 2. Authentication test
npm run test:auth:production
# Expected: Login/logout flows working

# 3. Critical user flows
npm run test:smoke:production
# Expected: All critical features working

# 4. Database operations
npm run test:db:operations
# Expected: CRUD operations functional
```

### ✅ Performance Monitoring

```bash
# 1. Response time check
npm run monitor:response-times
# Expected: Response times < 2s

# 2. Memory usage
npm run monitor:memory
# Expected: Memory usage stable

# 3. Error rates
npm run monitor:errors
# Expected: Error rate < 1%

# 4. Rate limiting
npm run test:rate-limits
# Expected: Rate limiting working correctly
```

**Performance Checklist:**
- [ ] Average response time < 2 seconds
- [ ] Memory usage stable and within limits
- [ ] CPU usage normal
- [ ] No memory leaks detected
- [ ] Rate limiting functioning correctly
- [ ] Cache hit rates optimal

### ✅ Security Verification

```bash
# 1. SSL certificate check
npm run check:ssl
# Expected: Valid SSL certificate

# 2. Security headers
npm run check:security-headers
# Expected: All security headers present

# 3. API authentication
npm run test:api-auth
# Expected: Unauthorized requests blocked

# 4. Input validation
npm run test:input-validation
```

## 🔄 When to Rebuild

### Rebuild Required For:

1. **Design System Changes**
   ```bash
   rm -rf .next && npm run build
   pm2 restart income-clarity
   ```

2. **New Dependencies**
   ```bash
   npm install [package]
   pm2 restart income-clarity
   ```

3. **Database Schema Changes**
   ```bash
   npx prisma generate
   pm2 restart income-clarity
   ```

4. **Tailwind Config Changes**
   ```bash
   rm -rf .next && npm run build
   pm2 restart income-clarity
   ```
   **Note**: Color tokens must exist in tailwind.config.js

### Rebuild Verification

```bash
# Quick verification
pm2 status                    # App running?
curl https://incomeclarity.ddns.net/api/health  # App responding?
```

## 📊 Simple Monitoring

### Built-in PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Check logs for errors
pm2 logs income-clarity --lines 50

# Status overview
pm2 status
```

### Quick Health Check

```bash
# One-liner health check
curl https://incomeclarity.ddns.net/api/health && pm2 status
```

## 🔧 Common Issues

### App Won't Start

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs income-clarity --lines 20

# Kill port conflicts
sudo lsof -ti:3000 | xargs kill -9
pm2 restart income-clarity
```

### App Running but Not Responding

```bash
# Full restart
pm2 restart income-clarity

# Check logs for errors
pm2 logs income-clarity --lines 50
```

### Design System Styling Issues

```bash
# Rebuild after Tailwind changes
rm -rf .next && npm run build
pm2 restart income-clarity
```

## ✅ Deployment Complete

### Quick Checklist

- [ ] `pm2 restart income-clarity` executed
- [ ] `pm2 status` shows "online" 
- [ ] `curl https://incomeclarity.ddns.net/api/health` returns OK
- [ ] No errors in `pm2 logs income-clarity --lines 20`

### Success Criteria

- App responds to health check
- No critical errors in logs
- PM2 shows stable process
- Site loads normally

---

## 🎯 ONE SERVER PHILOSOPHY

**Simple is Better:**
- Solo developer, pre-launch = simple deployment
- One server = easy to debug, monitor, maintain
- PM2 = reliable process management
- Quick iterations = faster development

**When to Upgrade:**
- Multiple developers
- Customer base > 100 users  
- Revenue justifies staging environment

**Deploy with Confidence:**
`pm2 restart income-clarity` → Live in 5 seconds! 🚀