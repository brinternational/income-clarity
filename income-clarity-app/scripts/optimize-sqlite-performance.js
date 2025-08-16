#!/usr/bin/env node

/**
 * SQLite Performance Optimization Script for Income Clarity Lite
 * Applies performance indexes and PRAGMA optimizations
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../prisma/income_clarity.db');

// console.log('⚡ SQLite Performance Optimization for Income Clarity Lite\n');

if (!fs.existsSync(DB_PATH)) {
  // console.error('❌ Database not found at:', DB_PATH);
  process.exit(1);
}

const db = Database(DB_PATH);

// Backup current database
const backupPath = path.join(__dirname, '../data/backups', `optimization_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
const backupDir = path.dirname(backupPath);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// console.log('📋 Creating backup...');
try {
  db.backup(backupPath);
  // console.log(`✅ Backup created: ${backupPath}`);
} catch (error) {
  // console.error('❌ Failed to create backup:', error.message);
  process.exit(1);
}

// console.log('\n🛠️ Applying SQLite Performance Optimizations...\n');

// 1. Optimize PRAGMA settings for performance
// console.log('1️⃣ Optimizing PRAGMA settings...');

const optimizationPragmas = [
  { name: 'journal_mode', value: 'WAL', description: 'Write-Ahead Logging for better concurrency' },
  { name: 'cache_size', value: '-64000', description: '64MB cache (negative = KB)' },
  { name: 'synchronous', value: 'NORMAL', description: 'Balance between speed and safety' },
  { name: 'temp_store', value: 'MEMORY', description: 'Store temporary tables in memory' },
  { name: 'mmap_size', value: '268435456', description: '256MB memory-mapped I/O' },
  { name: 'optimize', value: null, description: 'Run optimization' }
];

optimizationPragmas.forEach(pragma => {
  try {
    if (pragma.value) {
      db.pragma(`${pragma.name} = ${pragma.value}`);
      const result = db.pragma(pragma.name);
      // console.log(`   ✅ ${pragma.name}: ${result} (${pragma.description})`);
    } else {
      db.pragma(pragma.name);
      // console.log(`   ✅ ${pragma.name}: executed (${pragma.description})`);
    }
  } catch (error) {
    // console.log(`   ❌ ${pragma.name}: ${error.message}`);
  }
});

// 2. Add additional performance indexes
// console.log('\n2️⃣ Adding performance indexes...');

const performanceIndexes = [
  {
    name: 'idx_portfolios_userId_type',
    table: 'portfolios',
    columns: 'userId, type',
    rationale: 'Fast portfolio filtering by user and type'
  },
  {
    name: 'idx_portfolios_userId_isPrimary',
    table: 'portfolios',
    columns: 'userId, isPrimary',
    rationale: 'Quick primary portfolio lookup'
  },
  {
    name: 'idx_holdings_ticker_sector',
    table: 'holdings',
    columns: 'ticker, sector',
    rationale: 'Sector analysis and stock grouping'
  },
  {
    name: 'idx_holdings_portfolioId_currentPrice',
    table: 'holdings',
    columns: 'portfolioId, currentPrice',
    rationale: 'Portfolio value calculations'
  },
  {
    name: 'idx_transactions_userId_type_date',
    table: 'transactions',
    columns: 'userId, type, date',
    rationale: 'Filtered transaction history queries'
  },
  {
    name: 'idx_incomes_userId_category_date',
    table: 'incomes',
    columns: 'userId, category, date',
    rationale: 'Income analysis by category and time'
  },
  {
    name: 'idx_expenses_userId_category_essential',
    table: 'expenses',
    columns: 'userId, category, essential',
    rationale: 'Essential vs discretionary expense analysis'
  },
  {
    name: 'idx_expenses_userId_recurring_date',
    table: 'expenses',
    columns: 'userId, recurring, date',
    rationale: 'Recurring expense tracking'
  },
  {
    name: 'idx_stock_prices_ticker_close',
    table: 'stock_prices',
    columns: 'ticker, close',
    rationale: 'Stock price analysis queries'
  },
  {
    name: 'idx_calculation_cache_expiresAt_cacheKey',
    table: 'calculation_cache',
    columns: 'expiresAt, cacheKey',
    rationale: 'Efficient cache cleanup and lookup'
  },
  {
    name: 'idx_financial_goals_userId_category_targetDate',
    table: 'financial_goals',
    columns: 'userId, category, targetDate',
    rationale: 'Goal tracking and milestone calculations'
  },
  {
    name: 'idx_performance_snapshots_userId_date_totalValue',
    table: 'performance_snapshots',
    columns: 'userId, date, totalValue',
    rationale: 'Performance trending analysis'
  }
];

let indexesCreated = 0;
let indexesFailed = 0;

performanceIndexes.forEach(index => {
  try {
    // Check if index already exists
    const existingIndex = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name = ?").get(index.name);
    
    if (existingIndex) {
      // console.log(`   ⏭️  ${index.name}: already exists`);
      return;
    }

    const createIndexSQL = `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table}(${index.columns})`;
    db.exec(createIndexSQL);
    
    // console.log(`   ✅ ${index.name}: created (${index.rationale})`);
    indexesCreated++;
  } catch (error) {
    // console.log(`   ❌ ${index.name}: ${error.message}`);
    indexesFailed++;
  }
});

// 3. Create performance monitoring functions
// console.log('\n3️⃣ Setting up performance monitoring...');

try {
  // Create a performance log table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS query_performance_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_type TEXT NOT NULL,
      execution_time_ms REAL NOT NULL,
      user_id TEXT,
      parameters TEXT,
      row_count INTEGER,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for performance log
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_query_performance_log_executed_at 
    ON query_performance_log(executed_at)
  `);

  // console.log('   ✅ Performance logging table created');
} catch (error) {
  // console.log(`   ❌ Performance logging setup: ${error.message}`);
}

// 4. Create cache management utilities
// console.log('\n4️⃣ Setting up cache management...');

try {
  // Create cache statistics view
  db.exec(`
    CREATE VIEW IF NOT EXISTS cache_statistics AS
    SELECT 
      COUNT(*) as total_entries,
      COUNT(CASE WHEN expiresAt > CURRENT_TIMESTAMP THEN 1 END) as active_entries,
      COUNT(CASE WHEN expiresAt <= CURRENT_TIMESTAMP THEN 1 END) as expired_entries,
      ROUND(AVG(LENGTH(data) / 1024.0), 2) as avg_size_kb,
      MIN(expiresAt) as oldest_expiry,
      MAX(expiresAt) as newest_expiry
    FROM calculation_cache
  `);

  // console.log('   ✅ Cache statistics view created');
} catch (error) {
  // console.log(`   ❌ Cache management setup: ${error.message}`);
}

// 5. Run optimization and analyze
// console.log('\n5️⃣ Running final optimization...');

try {
  db.pragma('optimize');
  db.exec('ANALYZE');
  // console.log('   ✅ Database optimization and analysis complete');
} catch (error) {
  // console.log(`   ❌ Final optimization: ${error.message}`);
}

// 6. Performance verification
// console.log('\n6️⃣ Verifying optimizations...');

try {
  // Test a complex query to measure improvement
  const testQuery = `
    SELECT 
      p.name as portfolio_name,
      COUNT(h.id) as holdings_count,
      SUM(h.shares * h.currentPrice) as total_value
    FROM portfolios p
    LEFT JOIN holdings h ON p.id = h.portfolioId
    WHERE p.userId = ?
    GROUP BY p.id, p.name
  `;

  const start = process.hrtime.bigint();
  const testResult = db.prepare(testQuery).all('test-user');
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000;

  // console.log(`   ✅ Complex query test: ${duration.toFixed(2)}ms (${testResult.length} rows)`);
} catch (error) {
  // console.log(`   ❌ Performance verification: ${error.message}`);
}

// Generate summary report
// console.log('\n📊 Optimization Summary:');
// console.log(`   📈 Indexes created: ${indexesCreated}`);
// console.log(`   ❌ Indexes failed: ${indexesFailed}`);
// console.log(`   📋 Backup location: ${backupPath}`);

// Check current database size
const currentSize = (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2);
// console.log(`   💾 Database size: ${currentSize} MB`);

// Show index statistics
const totalIndexes = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").get();
// console.log(`   🔍 Total indexes: ${totalIndexes.count}`);

// console.log('\n✅ SQLite optimization complete!');
// console.log('\n🚀 Performance improvements applied:');
// console.log('   • Optimized PRAGMA settings for better I/O performance');
// console.log('   • Added strategic indexes for common query patterns');  
// console.log('   • Enabled Write-Ahead Logging (WAL) for better concurrency');
// console.log('   • Configured 64MB cache and 256MB memory-mapped I/O');
// console.log('   • Set up performance monitoring infrastructure');
// console.log('   • Created cache management utilities');

// console.log('\n📝 Next steps:');
// console.log('   1. Test API endpoints to verify performance improvements');
// console.log('   2. Monitor query performance using the new logging table');
// console.log('   3. Set up automated cache cleanup for expired entries');
// console.log('   4. Run load tests to validate concurrent performance');

db.close();