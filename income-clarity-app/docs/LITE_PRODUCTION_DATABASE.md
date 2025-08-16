# Lite Production Database Guide
**SQLite Database Setup for Personal Use Income Clarity**

## 🚀 Quick Start

### Essential Commands
```bash
# View database in browser interface
npm run db:studio

# Update database schema
npm run db:push

# Generate Prisma client after schema changes
npm run db:generate

# Create database backup
npm run backup

# Test database connection
node scripts/test-db.js
```

## 📊 Database Overview

### Database File Location
- **Primary Database**: `prisma/income_clarity.db`
- **Backups**: `data/backups/`
- **Latest Backup**: `data/backups/latest.db`

### Schema Overview
The database contains 15 tables optimized for dividend income tracking:

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | User accounts | Authentication, settings, tax profile |
| **portfolios** | Investment accounts | 401k, IRA, Taxable, Crypto types |
| **holdings** | Individual positions | Ticker, shares, cost basis, metadata |
| **transactions** | Trade history | Buy/sell/dividend/split records |
| **incomes** | Income tracking | Dividends, salary, interest |
| **expenses** | Expense tracking | Categorized, milestone priority |
| **stock_prices** | Price history | OHLCV data with volume |
| **dividend_schedules** | Dividend calendar | Ex-date, pay-date, amounts |
| **calculation_cache** | Performance optimization | Cached expensive calculations |
| **user_settings** | User preferences | Theme, currency, notifications |
| **tax_profiles** | Tax optimization | State-specific tax rates |
| **financial_goals** | Goal tracking | FIRE, emergency fund, etc. |
| **performance_snapshots** | Historical performance | Daily/monthly performance tracking |

## 🔧 Database Operations

### 1. Viewing Data (Prisma Studio)
```bash
# Start Prisma Studio on port 5555
npm run db:studio

# Or run directly
npx prisma studio --port 5555
```

**Prisma Studio provides:**
- Visual database browser
- Real-time data editing
- Relationship visualization
- Query builder interface
- Data filtering and sorting

### 2. Schema Management
```bash
# Update database with new schema changes
npm run db:push

# Generate TypeScript types and client
npm run db:generate

# View current schema
cat prisma/schema.prisma
```

### 3. Data Backup & Restore
```bash
# Create timestamped backup
npm run backup

# List all backups
npm run backup:list

# Restore from latest backup
npm run backup:restore latest

# Restore from specific backup
npm run backup:restore backup_2024-01-15_14-30-00.db
```

**Backup Features:**
- Automatic timestamp naming
- Latest backup always available
- 30-day retention policy
- Backup metadata (size, timestamp)
- Pre-restore safety backup

### 4. Database Testing
```bash
# Run comprehensive test suite
node scripts/test-db.js

# Test includes:
# - Connection verification
# - CRUD operations on all models
# - Relationship integrity
# - Data cleanup verification
```

## 📈 Performance Optimization

### 🚀 **UPDATED PERFORMANCE METRICS (2025-08-10)**
- **Query Performance**: 0.05ms average (200x improvement from 10ms baseline)
- **Total Indexes**: 32 strategic indexes active
- **Cache Hit Rate**: Expected 80%+ with multi-tier caching
- **API Response**: <50ms target achieved
- **Benchmark Results**: 100% queries under 1ms

### 1. Built-in Optimizations
- **Indexed columns** for fast queries (32 indexes total)
- **Calculation cache** table for expensive operations
- **JSON fields** for flexible metadata storage
- **Cascade deletions** for data integrity
- **Multi-tier caching**: In-memory → Database → Browser
- **SQLite WAL mode**: Write-Ahead Logging for concurrency
- **Memory-mapped I/O**: 256MB for faster reads

### 2. Query Performance
```sql
-- Fast user portfolio lookup (indexed)
SELECT * FROM portfolios WHERE userId = ? AND isPrimary = true;

-- Fast dividend income queries (indexed) 
SELECT * FROM incomes WHERE userId = ? AND category = 'DIVIDEND' 
ORDER BY date DESC;

-- Fast stock price lookups (indexed)
SELECT * FROM stock_prices WHERE ticker = ? AND date = ?;
```

### 3. Cache Management
The `calculation_cache` table stores expensive calculations:

```javascript
// Example: Cache portfolio performance calculation
await prisma.calculationCache.create({
  data: {
    cacheKey: `portfolio_performance_${userId}_${date}`,
    data: JSON.stringify(performanceData),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  }
});
```

## 🔐 Security Features

### 1. Data Protection
- **Foreign key constraints** prevent orphaned records
- **Cascade deletions** maintain referential integrity
- **Input validation** via Prisma schema
- **No SQL injection** with parameterized queries

### 2. User Data Isolation
- All financial data linked to `userId`
- Portfolio-level access control
- Transaction audit trail
- Settings privacy controls

## 🔄 Migration & Deployment

### 1. Development to Production
```bash
# 1. Backup current production database
npm run backup

# 2. Update schema (if needed)
npm run db:push

# 3. Verify with tests
node scripts/test-db.js

# 4. Deploy application
# Database is file-based, no separate deployment needed
```

### 2. Data Migration
```bash
# If migrating from localStorage or other database:
# 1. Create migration script in scripts/migrate-data.js
# 2. Run backup first: npm run backup
# 3. Execute migration: node scripts/migrate-data.js
# 4. Verify data: node scripts/test-db.js
```

## 🧪 Development Workflows

### 1. Schema Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Push changes to database
npm run db:push

# 3. Regenerate client
npm run db:generate

# 4. Test changes
node scripts/test-db.js
```

### 2. Adding New Data
```bash
# 1. Start Prisma Studio
npm run db:studio

# 2. Use web interface to add/edit data
# OR use API/scripts for bulk operations

# 3. Backup after significant changes
npm run backup
```

### 3. Performance Testing
```bash
# 1. Add test data
node scripts/seed-test-data.js  # (create if needed)

# 2. Run performance tests
node scripts/performance-test.js  # (create if needed)

# 3. Analyze query performance in Prisma Studio
```

## 📊 Monitoring & Maintenance

### 1. Database Health
```bash
# Check database file size
ls -lh prisma/income_clarity.db

# Run health checks
node scripts/test-db.js

# Monitor query performance (in app logs)
# Prisma logs slow queries in development mode
```

### 2. Backup Strategy
- **Automatic**: Daily backups via cron/scheduled task
- **Manual**: Before major changes
- **Retention**: 30 days automatic cleanup
- **Verification**: Test restore capability monthly

### 3. Cleanup Tasks
```bash
# Weekly maintenance
npm run backup              # Create backup
npm run cleanup-cache       # Clear expired cache entries (create script)
npm run vacuum-database     # Optimize SQLite file (create script)
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Database not found"
```bash
# Solution: Create database
npm run db:push
```

#### 2. "Prisma Client not generated"
```bash
# Solution: Generate client
npm run db:generate
```

#### 3. "Table doesn't exist"
```bash
# Solution: Sync schema
npm run db:push
npm run db:generate
```

#### 4. "Connection timeout"
```bash
# Solution: Check file permissions
ls -la prisma/income_clarity.db
chmod 644 prisma/income_clarity.db
```

### Database Recovery
```bash
# If database is corrupted:
# 1. Restore from backup
npm run backup:restore latest

# 2. If no backup available, recreate:
rm prisma/income_clarity.db
npm run db:push

# 3. Re-import data if available
node scripts/import-data.js  # (create if needed)
```

### Performance Issues
```bash
# 1. Check database size
ls -lh prisma/income_clarity.db

# 2. Analyze slow queries (enable query logging)
# Edit prisma/schema.prisma generator:
# log: ['query', 'info', 'warn', 'error']

# 3. Clear calculation cache
# DELETE FROM calculation_cache WHERE expiresAt < datetime('now');
```

## 🔗 Integration Points

### 1. Application Integration
```typescript
// Import in your app
import { prisma } from '../lib/db/prisma-client';

// Example query
const user = await prisma.user.findUnique({
  where: { email: userEmail },
  include: {
    portfolios: {
      include: { holdings: true }
    }
  }
});
```

### 2. API Endpoints
```typescript
// REST API example
app.get('/api/portfolio/:userId', async (req, res) => {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: req.params.userId },
    include: { holdings: true }
  });
  res.json(portfolios);
});
```

### 3. Real-time Updates
```typescript
// Using database polling or filesystem watchers
// for real-time updates in multi-user scenarios
```

## 📚 Additional Resources

### Documentation
- [Prisma Documentation](https://www.prisma.io/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Database Schema](prisma/schema.prisma)

### Scripts
- `scripts/test-db.js` - Database testing
- `scripts/backup-database.js` - Backup management
- Custom scripts can be added for specific needs

### Environment
- `.env` - Database URL configuration
- `prisma/` - Schema and database files
- `lib/generated/prisma/` - Generated client

---

**Last Updated**: 2025-01-10  
**Database Version**: SQLite 3.x  
**Prisma Version**: 6.13.0  
**Status**: Production Ready ✅