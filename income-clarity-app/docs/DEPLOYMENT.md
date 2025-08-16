# Income Clarity - Production Deployment Guide

## 🚀 Deployment Overview

This guide covers the complete production deployment process for Income Clarity, including infrastructure setup, environment configuration, and monitoring.

## 📋 Pre-Deployment Checklist

### ✅ Code Readiness
- [ ] All tests passing (`npm run test:all`)
- [ ] Build completes successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] Security audit clean (`npm audit`)
- [ ] Performance optimization complete
- [ ] Code reviewed and approved

### ✅ Infrastructure Requirements
- [ ] **Vercel Account**: For hosting and serverless functions
- [ ] **Supabase Project**: For database and authentication
- [ ] **Upstash Redis**: For caching (optional but recommended)
- [ ] **Domain Name**: Custom domain configured
- [ ] **SSL Certificate**: Automatic via Vercel
- [ ] **Stock API Key**: Polygon.io or Alpha Vantage

### ✅ Environment Configuration
- [ ] Production environment variables configured
- [ ] Database schema migrated
- [ ] RLS policies applied
- [ ] Cron jobs configured
- [ ] Monitoring services set up

## 🔧 Environment Setup

### 1. Production Environment Variables

Copy `.env.production` and configure the following:

```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Cache (Upstash Redis)
REDIS_URL=rediss://[redis-host]:[port]
REDIS_TOKEN=[redis-token]

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=[secure-random-secret]

# Stock Data API
POLYGON_API_KEY=[your-polygon-key]

# Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=[your-ga-id]

# Cron Security
CRON_SECRET=[random-secret-for-cron-auth]
```

### 2. Database Migration

Run the production migration script:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# Run migration
\i scripts/production-migration.sql

# Verify tables created
\dt

# Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

### 3. Vercel Configuration

The `vercel.json` file is pre-configured with:

- **Functions**: API routes with appropriate timeouts
- **Cron Jobs**: Automated maintenance tasks
- **Headers**: Security and caching headers
- **Redirects**: Legacy route handling
- **Regions**: Optimized for US East Coast (iad1)

## 🚀 Deployment Process

### Option 1: Automated Deployment

Use the provided deployment script:

```bash
# Make sure you're in the app directory
cd income-clarity-app

# Run deployment script
./scripts/deploy.sh --env production --target vercel --url https://your-domain.com

# Or with custom options
./scripts/deploy.sh \
  --env production \
  --target vercel \
  --url https://your-domain.com \
  --skip-backup
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm ci --only=production

# 2. Run tests
npm run test:all

# 3. Build application
npm run build

# 4. Deploy to Vercel
vercel --prod --confirm

# 5. Configure environment variables in Vercel dashboard
# 6. Set up custom domain
# 7. Configure cron jobs
```

## 📊 Monitoring and Health Checks

### Health Check Endpoints

- **Basic Health**: `GET /api/health`
- **Detailed Health**: `GET /api/health?details=true`
- **Prometheus Metrics**: `GET /api/health?format=prometheus`
- **Quick Health**: `HEAD /api/health` (for load balancers)

### Monitoring Setup

   ```bash
   # Configure in environment variables
   ```

2. **Google Analytics** (Usage Analytics):
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-[measurement-id]
   ```

3. **Vercel Analytics** (Performance):
   ```bash
   VERCEL_ANALYTICS=true
   NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS=true
   ```

## 🔄 Cron Jobs

The following cron jobs are automatically configured:

### 1. Refresh Materialized Views
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Endpoint**: `/api/cron/refresh-views`
- **Purpose**: Keep performance views up-to-date

### 2. Stock Price Cache Update
- **Schedule**: Every 2 hours (`0 */2 * * *`)
- **Endpoint**: `/api/cron/stock-price-cache`
- **Purpose**: Update stock prices for better performance

### 3. Dividend Alerts
- **Schedule**: Weekdays at 9 AM (`0 9 * * MON-FRI`)
- **Endpoint**: `/api/cron/dividend-alerts`
- **Purpose**: Send upcoming dividend notifications

### 4. Backup Check
- **Schedule**: Daily at 2 AM (`0 2 * * *`)
- **Endpoint**: `/api/cron/backup-check`
- **Purpose**: Verify backup integrity

## 💾 Backup and Recovery

### Automated Backups

```bash
# Run backup script
./scripts/backup.sh

# Or with environment variables
BACKUP_DIR=/path/to/backups \
RETENTION_DAYS=30 \
./scripts/backup.sh
```

### Manual Backup

```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Configuration backup
tar -czf config_backup.tar.gz \
  package.json \
  package-lock.json \
  next.config.mjs \
  vercel.json \
  scripts/
```

### Recovery Process

1. **Database Recovery**:
   ```bash
   psql $DATABASE_URL < backup_20241201.sql
   ```

2. **Application Recovery**:
   ```bash
   # Redeploy from backup
   vercel --prod --confirm
   ```

## 🔒 Security Configuration

### Security Headers

Configured in `middleware.ts`:

- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection
- **X-XSS-Protection**: XSS filtering

### Authentication

- **Demo Mode**: Available without authentication
- **Supabase Auth**: Email/password and OAuth providers
- **Row Level Security**: Database-level user isolation

### API Security

- **Rate Limiting**: Implemented in middleware
- **CORS**: Configured for production domain
- **Input Validation**: All user inputs validated
- **SQL Injection**: Prevented via parameterized queries

## 📈 Performance Optimization

### Caching Strategy

1. **Edge Caching**: Static assets cached for 1 year
2. **API Caching**: Dynamic data cached for 2-5 minutes
3. **Redis Caching**: User-specific data cached in Redis
4. **Database Views**: Materialized views for complex queries

### Bundle Optimization

- **Code Splitting**: Automatic via Next.js
- **Tree Shaking**: Unused code eliminated
- **Compression**: Gzip/Brotli compression enabled
- **Image Optimization**: WebP/AVIF formats used

## 📋 Launch Verification Checklist

### ✅ Functionality Testing
- [ ] Home page loads correctly
- [ ] Demo mode works without authentication
- [ ] Authentication flow works
- [ ] Dashboard displays properly
- [ ] All Super Cards functional
- [ ] Portfolio management works
- [ ] Performance calculations accurate
- [ ] Mobile experience optimized

### ✅ Performance Testing
- [ ] Lighthouse score >90
- [ ] Page load time <2 seconds
- [ ] API response time <500ms
- [ ] Database queries optimized
- [ ] CDN properly configured

### ✅ Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Authentication working
- [ ] RLS policies active
- [ ] No sensitive data exposed
- [ ] CORS properly configured

### ✅ Monitoring Verification
- [ ] Health checks responding
- [ ] Error tracking active
- [ ] Analytics collecting data
- [ ] Cron jobs running
- [ ] Backup system working
- [ ] Alerts configured

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Database Connection Issues**:
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT version();"
   ```

3. **Environment Variable Issues**:
   ```bash
   # Check Vercel environment variables
   vercel env ls
   ```

4. **Cron Job Failures**:
   ```bash
   # Test cron endpoint manually
   curl -H "Authorization: Bearer $CRON_SECRET" \
        https://your-domain.com/api/cron/refresh-views
   ```

### Emergency Procedures

1. **Rollback Deployment**:
   ```bash
   vercel rollback [deployment-url] --confirm
   ```

2. **Enable Maintenance Mode**:
   ```bash
   # Set environment variable
   vercel env add MAINTENANCE_MODE true
   ```

3. **Database Recovery**:
   ```bash
   # Restore from backup
   psql $DATABASE_URL < latest_backup.sql
   ```

## 📞 Support Contacts

- **Infrastructure**: Vercel Support
- **Database**: Supabase Support
- **Domain**: Domain registrar support
- **Development Team**: [Your contact information]

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Platform Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Performance Best Practices](../performance-optimizations.md)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

---

*Last Updated: December 2024*
*Version: 1.0.0*