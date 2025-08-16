# Income Clarity - Production Deployment Guide

Complete guide for deploying Income Clarity to Vercel production environment.

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18.17.0+** installed
2. **Vercel account** (free tier works)
3. **Supabase project** set up with production database
4. **Polygon.io API key** for stock data
5. **Git repository** (optional but recommended)

### One-Command Deployment

```bash
# Navigate to project directory
cd income-clarity-app

# Run automated deployment script
./scripts/vercel-deploy.sh
```

## 📋 Manual Deployment Steps

### Step 1: Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Configure production variables:**
   ```env
   # Required variables
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   POLYGON_API_KEY=your_polygon_api_key
   SESSION_SECRET=your_secure_random_string
   ```

### Step 2: Build Application

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build for production
```

### Step 3: Vercel Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Initialize project:**
   ```bash
   vercel
   ```

### Step 4: Configure Environment Variables

**Option A: Via Vercel CLI**
```bash
# Set each variable individually
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add POLYGON_API_KEY production
# ... continue for all variables
```

**Option B: Via Vercel Dashboard**
1. Go to your project settings on vercel.com
2. Navigate to Environment Variables
3. Add each variable with "Production" scope

### Step 5: Deploy to Production

```bash
# Deploy to production
vercel --prod
```

## 🔧 Configuration Details

### Vercel Configuration

The `vercel.json` file includes:

- **Framework**: Next.js 15 with Turbopack
- **Regions**: Primary (iad1), Secondary (sfo1)
- **Functions**: Optimized timeouts and memory allocation
- **Headers**: Security headers and caching policies
- **Redirects**: Legacy route compatibility
- **Cron Jobs**: Automated maintenance tasks

### Function Optimization

| Function | Timeout | Memory | Purpose |
|----------|---------|--------|---------|
| super-cards | 10s | 512MB | Complex calculations |
| stock-price | 30s | 256MB | External API calls |
| portfolios | 15s | 256MB | Database operations |
| auth/callback | 10s | 128MB | Authentication |
| health | 5s | 64MB | Health checks |

### Security Headers

- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: enabled
- **Referrer-Policy**: strict-origin-when-cross-origin
- **HSTS**: 1 year max-age
- **CSP**: Configured for security

## 🌍 Environment Variables Reference

### Critical (Required)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | `https://abc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public database key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server database key | `eyJ...` |
| `POLYGON_API_KEY` | Stock price API | `ImksH64K...` |
| `SESSION_SECRET` | JWT signing key | `64+ char random string` |

### Optional (Recommended)

| Variable | Purpose | Default |
|----------|---------|---------|
| `REDIS_URL` | L2 caching | Memory only |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Analytics | None |
| `DATADOG_API_KEY` | APM monitoring | None |

### Feature Flags

| Variable | Purpose | Default |
|----------|---------|---------|
| `ENABLE_PUSH_NOTIFICATIONS` | PWA notifications | `true` |
| `ENABLE_PWA_FEATURES` | Progressive web app | `true` |
| `ENABLE_ADVANCED_ANALYTICS` | Detailed tracking | `false` |

## 🔍 Verification Checklist

### Post-Deployment Testing

- [ ] **Health Check**: `https://your-domain.vercel.app/api/health`
- [ ] **Static Assets**: Homepage loads correctly
- [ ] **Authentication**: Login/signup flow works
- [ ] **Database**: Portfolio data persists
- [ ] **Stock API**: Price data loads
- [ ] **Mobile**: Responsive design functions
- [ ] **PWA**: Can be installed as app

### Performance Validation

- [ ] **Lighthouse Score**: >90
- [ ] **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] **Bundle Size**: Initial <500KB
- [ ] **API Response**: <2s for data operations

### Security Validation

- [ ] **Headers**: All security headers present
- [ ] **HTTPS**: Forced redirect to secure
- [ ] **CSP**: Content Security Policy active
- [ ] **Secrets**: No exposed API keys

## 🚨 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

**2. Environment Variable Issues**
```bash
# List current variables
vercel env ls

# Remove and re-add problematic variable
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

**3. Database Connection Issues**
- Verify Supabase URL format
- Check RLS policies are disabled for service role
- Confirm database is not paused

**4. Stock API Issues**
- Verify Polygon.io API key is valid
- Check API quota/limits
- Test direct API call: `curl "https://api.polygon.io/v2/aggs/ticker/SPY/prev?apikey=YOUR_KEY"`

### Performance Issues

**Slow Initial Load**
- Enable Vercel Edge Network
- Implement service worker caching
- Optimize image formats (WebP/AVIF)

**API Timeouts**
- Check function timeout limits
- Implement request batching
- Add Redis caching layer

## 📊 Monitoring Setup

### Vercel Analytics

1. Enable in project settings
2. Add to environment: `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`


2. Add environment variables:
   ```env
   ```

### Health Monitoring

Set up external monitoring:
- **UptimeRobot**: Monitor `/api/health`
- **Pingdom**: Full page monitoring
- **StatusPage**: Public status updates

## 🔄 Update Workflow

### Standard Updates

1. **Development**
   ```bash
   # Make changes locally
   git add .
   git commit -m "feat: description"
   git push origin main
   ```

2. **Automatic Deployment**
   - Vercel deploys automatically on git push
   - Preview deployments for branches
   - Production deployment on main branch

### Hotfix Deployments

```bash
# Emergency fixes
vercel --prod --force

# Skip build if no code changes
vercel --prod --prebuilt
```

## 🎯 Success Criteria

### Launch Ready When:

- [x] **Zero critical vulnerabilities**
- [x] **All environment variables configured**
- [x] **Health endpoint returns 200**
- [x] **Authentication flow works**
- [x] **Stock data loads correctly**
- [x] **Mobile responsive**
- [x] **PWA installable**
- [ ] **Performance meets targets**
- [ ] **Monitoring configured**
- [ ] **Backup procedures tested**

## 📞 Support

### Emergency Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Polygon.io Support**: [polygon.io/contact](https://polygon.io/contact)

### Documentation Links

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**Status**: Ready for production deployment 🚀

Last updated: $(date)