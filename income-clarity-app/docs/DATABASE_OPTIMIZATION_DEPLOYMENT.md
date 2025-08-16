# Database Optimization Deployment Guide
*DB-001: Database Materialized Views & Performance Optimization*

## 🎯 Overview

This guide covers the deployment of database performance optimizations for Income Clarity to achieve production-ready response times of <100ms for the Super Cards API.

### Performance Targets
- **API Response Time**: 300ms → <100ms (3x improvement)
- **Concurrent Users**: Support 1000+ users
- **Individual Queries**: <50ms target
- **Database Throughput**: Optimized for concurrent access

## 📦 What's Included

### 1. Materialized Views
Pre-computed views for instant data retrieval:
- `portfolio_performance_summary` - Portfolio metrics and SPY comparisons
- `income_intelligence_summary` - Dividend income and tax calculations  
- `lifestyle_coverage_summary` - Expense coverage and FIRE progress
- `strategy_optimization_summary` - Portfolio strategy analysis
- `user_activities_summary` - User activity tracking

### 2. Performance Indexes
Strategic indexes for query optimization:
- User-centric indexes (most queries filter by user_id)
- Portfolio performance indexes with covering indexes
- Transaction and expense optimization indexes
- Materialized view unique indexes for concurrent refresh

### 3. Optimization Functions
Production-ready functions:
- `refresh_user_materialized_views()` - Concurrent view refresh
- `get_portfolio_performance_optimized()` - Fast portfolio calculations
- `log_slow_query()` - Performance monitoring
- `update_table_statistics()` - Automated maintenance

### 4. Monitoring Infrastructure
Comprehensive performance monitoring:
- Query performance logging
- View refresh tracking
- Slow query analysis views
- Index usage monitoring

### 5. Automatic Maintenance
Scheduled maintenance jobs (requires pg_cron):
- Materialized view refresh (every 5 minutes)
- Statistics updates (hourly during business hours)
- Log cleanup (weekly/monthly)

## 🚀 Deployment

### Prerequisites
1. **PostgreSQL 14.0+** with appropriate permissions
2. **psql client** installed and accessible
3. **Node.js** for execution script
4. **Supabase environment** configured in `.env.local`

### Option 1: Automatic Deployment (Recommended)

```bash
# Basic deployment
node scripts/execute-database-optimization.js

# With backup and validation
node scripts/execute-database-optimization.js --backup --validate

# Dry run to see what would be executed
node scripts/execute-database-optimization.js --dry-run

# Force deployment (skip confirmation)
node scripts/execute-database-optimization.js --force
```

### Option 2: Manual SQL Execution

```bash
# Connect to database
psql "your_database_connection_string"

# Execute optimization script
\i scripts/deploy-database-optimization.sql

# Check deployment status
SELECT * FROM materialized_view_stats;
```

### Option 3: Supabase Dashboard
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/deploy-database-optimization.sql`
3. Execute in SQL Editor
4. Monitor execution progress

## 📊 Validation

### 1. Check Materialized Views
```sql
SELECT * FROM materialized_view_stats;
```

Expected output:
- 5 materialized views created
- All views showing row counts
- Recent refresh timestamps

### 2. Verify Indexes
```sql
SELECT * FROM index_usage_analysis ORDER BY scans DESC LIMIT 10;
```

Expected output:
- 15+ performance indexes
- User-centric indexes showing usage
- Covering indexes for complex queries

### 3. Test API Performance
```bash
# Test Super Cards endpoint
curl -w "%{time_total}\n" http://localhost:3000/api/super-cards?cards=performance

# Expected: <100ms response time
```

### 4. Monitor Query Performance
```sql
SELECT * FROM slow_super_card_queries;
```

Expected output:
- No queries >100ms (after optimization)
- Good cache hit ratios
- Reasonable occurrence counts

## 🔧 Management Commands

### View Refresh
```sql
-- Manual refresh of all materialized views
SELECT refresh_user_materialized_views();

-- Refresh for specific user
SELECT refresh_user_materialized_views('user-uuid-here');
```

### Statistics Update
```sql
-- Update table statistics
SELECT update_table_statistics();
```

### Performance Monitoring
```sql
-- Check slow queries (last 24 hours)
SELECT * FROM slow_super_card_queries;

-- Check index usage
SELECT * FROM index_usage_analysis;

-- View refresh history
SELECT * FROM view_refresh_log ORDER BY refreshed_at DESC LIMIT 10;
```

### Cache Management
```sql
-- Log slow query manually
SELECT log_slow_query('super_card_performance', 'user-id', 150);

-- Check performance log
SELECT * FROM query_performance_log 
WHERE executed_at >= NOW() - INTERVAL '1 hour'
ORDER BY execution_time_ms DESC;
```

## 📈 Monitoring & Maintenance

### 1. API Response Time Monitoring
Monitor the Super Cards API endpoint:
```bash
# Check current response times
curl -s -w "Response Time: %{time_total}s\nHTTP Code: %{http_code}\n" \
  http://localhost:3000/api/super-cards?cards=performance,income
```

### 2. Materialized View Health
```sql
-- Check view freshness
SELECT 
  matviewname,
  pg_size_pretty(pg_total_relation_size(matviewname)) as size,
  CASE 
    WHEN last_refresh.refreshed_at > NOW() - INTERVAL '10 minutes' 
    THEN 'Fresh' 
    ELSE 'Stale' 
  END as freshness_status
FROM pg_matviews 
LEFT JOIN (
  SELECT unnest(view_names) as view_name, MAX(refreshed_at) as refreshed_at
  FROM view_refresh_log GROUP BY unnest(view_names)
) last_refresh ON matviewname = last_refresh.view_name
WHERE schemaname = 'public';
```

### 3. Performance Alerts
Set up alerts for:
- API response times >200ms
- Materialized view refresh failures
- High query execution times
- Index usage drops

### 4. Regular Maintenance Tasks

**Daily:**
- Check API response times
- Review slow query log
- Monitor error rates

**Weekly:**
- Analyze index usage patterns
- Review materialized view sizes
- Check for unused indexes

**Monthly:**
- Update table statistics manually
- Review and archive old logs
- Analyze performance trends

## 🔍 Troubleshooting

### Common Issues

#### 1. Materialized View Creation Fails
```
ERROR: relation "users" does not exist
```
**Solution:** Ensure all base tables exist and have proper permissions.

#### 2. Index Creation Timeout
```
ERROR: canceling statement due to statement timeout
```
**Solution:** Create indexes with `CONCURRENTLY` option (already included in script).

#### 3. API Still Slow After Deployment
**Check:**
1. Materialized views are refreshed: `SELECT * FROM view_refresh_log;`
2. API is using views: Check Super Cards API logs
3. Database connection pooling is active
4. Application cache is working

#### 4. pg_cron Not Available
```
ERROR: extension "pg_cron" is not available
```
**Solution:** Manual maintenance or use application-level scheduling.

### Performance Debugging
```sql
-- Check current database performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%portfolio_performance%'
ORDER BY mean_time DESC;

-- Check buffer cache hit ratio
SELECT 
  datname,
  round(100.0 * blks_hit / (blks_hit + blks_read), 2) AS cache_hit_ratio
FROM pg_stat_database 
WHERE datname = current_database();
```

## 📋 Success Criteria

### ✅ Deployment Successful When:
1. **All 5 materialized views created** with data
2. **15+ performance indexes** active and showing usage
3. **API response time <100ms** for Super Cards endpoints
4. **No queries taking >50ms** in slow query log
5. **Materialized views refresh every 5 minutes** (if pg_cron available)
6. **Monitoring views** return expected data
7. **No critical errors** in deployment log

### 📊 Performance Metrics to Track:
- Average API response time
- 95th percentile response time
- Cache hit ratio for materialized views
- Index scan ratios
- Query execution times
- Concurrent user capacity

## 🔄 Rollback Plan

### If Issues Occur:
1. **Stop API traffic** if critical
2. **Restore from backup** (if created with `--backup` flag)
3. **Drop materialized views** if causing issues:
   ```sql
   DROP MATERIALIZED VIEW IF EXISTS user_activities_summary CASCADE;
   DROP MATERIALIZED VIEW IF EXISTS strategy_optimization_summary CASCADE;
   DROP MATERIALIZED VIEW IF EXISTS lifestyle_coverage_summary CASCADE;
   DROP MATERIALIZED VIEW IF EXISTS income_intelligence_summary CASCADE;
   DROP MATERIALIZED VIEW IF EXISTS portfolio_performance_summary CASCADE;
   ```
4. **Remove indexes** if needed:
   ```sql
   -- List optimization indexes
   SELECT indexname FROM pg_indexes 
   WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
   AND indexname NOT LIKE '%_pkey';
   ```

## 📞 Support

### Log Files Location:
- Deployment logs: `scripts/deployment-log-[timestamp].txt`
- Database query logs: Check `query_performance_log` table
- View refresh logs: Check `view_refresh_log` table

### Performance Monitoring Queries:
See the "Management Commands" section above for ongoing monitoring queries.

---

**Note:** This optimization is designed to work with the existing Super Cards API architecture and caching system. The API will automatically use materialized views when available, falling back to real-time queries if needed.