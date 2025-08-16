#!/usr/bin/env node

/**
 * Performance Benchmark - Before/After Optimization Comparison
 * Tests API response times and database query performance
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../prisma/income_clarity.db');

// console.log('🏁 Performance Benchmark - Post-Optimization Analysis\n');

const db = Database(DB_PATH);

// Test queries that would be used by the API
const benchmarkQueries = [
  {
    name: 'Dashboard Portfolio Summary',
    query: `
      SELECT 
        p.id,
        p.name,
        p.type,
        COUNT(h.id) as holdings_count,
        SUM(h.shares * COALESCE(h.currentPrice, h.costBasis)) as estimated_value,
        SUM(h.costBasis * h.shares) as total_cost_basis
      FROM portfolios p
      LEFT JOIN holdings h ON p.id = h.portfolioId
      WHERE p.userId = ?
      GROUP BY p.id, p.name, p.type
    `,
    params: ['test-user']
  },
  {
    name: 'Monthly Income Analysis',
    query: `
      SELECT 
        category,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM incomes 
      WHERE userId = ? 
        AND date >= DATE('now', '-30 days')
      GROUP BY category
      ORDER BY total_amount DESC
    `,
    params: ['test-user']
  },
  {
    name: 'Expense Breakdown by Category',
    query: `
      SELECT 
        category,
        essential,
        COUNT(*) as expense_count,
        SUM(amount) as total_spent,
        AVG(amount) as avg_expense
      FROM expenses 
      WHERE userId = ? 
        AND date >= DATE('now', '-30 days')
      GROUP BY category, essential
      ORDER BY total_spent DESC
    `,
    params: ['test-user']
  },
  {
    name: 'Holdings Performance with Sectors',
    query: `
      SELECT 
        h.ticker,
        h.sector,
        h.shares,
        h.costBasis,
        h.currentPrice,
        h.dividendYield,
        (h.currentPrice - h.costBasis) as unrealized_gain_per_share,
        ((h.currentPrice - h.costBasis) / h.costBasis * 100) as gain_percentage
      FROM holdings h
      JOIN portfolios p ON h.portfolioId = p.id
      WHERE p.userId = ?
      ORDER BY h.sector, h.ticker
    `,
    params: ['test-user']
  },
  {
    name: 'Recent Transaction History',
    query: `
      SELECT 
        t.ticker,
        t.type,
        t.amount,
        t.shares,
        t.date,
        t.notes
      FROM transactions t
      WHERE t.userId = ?
      ORDER BY t.date DESC, t.createdAt DESC
      LIMIT 50
    `,
    params: ['test-user']
  },
  {
    name: 'Financial Goals Progress',
    query: `
      SELECT 
        fg.name,
        fg.category,
        fg.targetAmount,
        fg.currentAmount,
        (fg.currentAmount / fg.targetAmount * 100) as progress_percentage,
        fg.targetDate
      FROM financial_goals fg
      WHERE fg.userId = ? AND fg.isActive = 1
      ORDER BY fg.priority ASC, fg.targetDate ASC
    `,
    params: ['test-user']
  },
  {
    name: 'Performance Snapshots Trend',
    query: `
      SELECT 
        date,
        totalValue,
        totalCostBasis,
        totalReturn,
        dividendIncome,
        spyReturn,
        netIncome
      FROM performance_snapshots
      WHERE userId = ?
      ORDER BY date DESC
      LIMIT 12
    `,
    params: ['test-user']
  },
  {
    name: 'Cache Lookup Performance',
    query: `
      SELECT data 
      FROM calculation_cache 
      WHERE cacheKey = ? 
        AND expiresAt > DATETIME('now')
      LIMIT 1
    `,
    params: ['portfolio_performance_test-user']
  },
  {
    name: 'Tax Profile Analysis',
    query: `
      SELECT 
        tp.state,
        tp.filingStatus,
        tp.federalBracket,
        tp.stateBracket,
        tp.qualifiedDividendRate,
        tp.effectiveRate,
        us.theme,
        us.currency,
        us.timezone
      FROM tax_profiles tp
      LEFT JOIN user_settings us ON tp.userId = us.userId
      WHERE tp.userId = ?
    `,
    params: ['test-user']
  },
  {
    name: 'Stock Price Historical Data',
    query: `
      SELECT 
        date,
        open,
        high,
        low,
        close,
        volume
      FROM stock_prices
      WHERE ticker = ?
      ORDER BY date DESC
      LIMIT 30
    `,
    params: ['SPY']
  }
];

// Function to run benchmark tests
function runBenchmark(name, query, params = []) {
  const iterations = 10;
  const times = [];
  
  // console.log(`📊 Testing: ${name}`);
  
  // Warm up the query (run once to prime any caches)
  try {
    const stmt = db.prepare(query);
    stmt.all(params);
  } catch (e) {
    // console.log(`   ❌ Error: ${e.message}`);
    return { name, error: e.message };
  }
  
  // Run multiple iterations for accurate timing
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    try {
      const stmt = db.prepare(query);
      const result = stmt.all(params);
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      times.push({ duration, rowCount: result.length });
    } catch (e) {
      // console.log(`   ❌ Iteration ${i + 1} error: ${e.message}`);
      continue;
    }
  }
  
  if (times.length === 0) {
    return { name, error: 'All iterations failed' };
  }
  
  const avgTime = times.reduce((sum, t) => sum + t.duration, 0) / times.length;
  const minTime = Math.min(...times.map(t => t.duration));
  const maxTime = Math.max(...times.map(t => t.duration));
  const avgRows = Math.round(times.reduce((sum, t) => sum + t.rowCount, 0) / times.length);
  
  // console.log(`   ⏱️  Avg: ${avgTime.toFixed(2)}ms | Min: ${minTime.toFixed(2)}ms | Max: ${maxTime.toFixed(2)}ms`);
  // console.log(`   📋 Rows: ${avgRows} | Iterations: ${iterations}`);
  
  // Show query plan for complex queries
  if (avgTime > 1.0 || name.includes('Dashboard') || name.includes('Performance')) {
    try {
      const explainStmt = db.prepare(`EXPLAIN QUERY PLAN ${query}`);
      const plan = explainStmt.all(params);
      // console.log(`   🔍 Query Plan:`);
      plan.forEach(row => {
        // console.log(`      ${row.detail}`);
      });
    } catch (e) {
      // Query plan might not work for all queries
    }
  }
  
  return {
    name,
    avgTime,
    minTime,
    maxTime,
    avgRows,
    iterations
  };
}

// console.log('🚀 Running Performance Benchmarks...\n');

// Get real user ID if available
let testUserId = 'test-user';
try {
  const firstUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (firstUser) {
    testUserId = firstUser.id;
    // console.log(`Using real user ID: ${testUserId}\n`);
  }
} catch (e) {
  // console.log('Using placeholder user ID\n');
}

// Run all benchmark tests
const results = [];
benchmarkQueries.forEach(test => {
  let params = test.params;
  if (params[0] === 'test-user') {
    params = [testUserId, ...params.slice(1)];
  }
  
  const result = runBenchmark(test.name, test.query, params);
  results.push(result);
  // console.log(); // Add spacing between tests
});

// Analyze results and generate report
// console.log('📈 Performance Summary Report\n');

const validResults = results.filter(r => !r.error);
const totalQueries = validResults.length;
const totalTime = validResults.reduce((sum, r) => sum + r.avgTime, 0);
const avgQueryTime = totalTime / totalQueries;

// console.log(`📊 Overall Performance Metrics:`);
// console.log(`   Total queries tested: ${totalQueries}`);
// console.log(`   Average query time: ${avgQueryTime.toFixed(2)}ms`);
// console.log(`   Total benchmark time: ${totalTime.toFixed(2)}ms`);

// Categorize performance
const fastQueries = validResults.filter(r => r.avgTime < 1.0);
const mediumQueries = validResults.filter(r => r.avgTime >= 1.0 && r.avgTime < 10.0);
const slowQueries = validResults.filter(r => r.avgTime >= 10.0);

// console.log(`\n🚦 Performance Categories:`);
// console.log(`   🟢 Fast (<1ms): ${fastQueries.length} queries`);
// console.log(`   🟡 Medium (1-10ms): ${mediumQueries.length} queries`);
// console.log(`   🔴 Slow (>10ms): ${slowQueries.length} queries`);

if (slowQueries.length > 0) {
  // console.log(`\n⚠️  Slow Queries Requiring Attention:`);
  slowQueries.forEach(q => {
    // console.log(`   • ${q.name}: ${q.avgTime.toFixed(2)}ms`);
  });
}

// Database statistics
// console.log(`\n📋 Database Statistics:`);
const dbSize = (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2);
// console.log(`   Database size: ${dbSize} MB`);

const indexCount = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").get();
// console.log(`   Total indexes: ${indexCount.count}`);

const tableStats = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
// console.log(`   Tables: ${tableStats.length}`);

// Check WAL mode status
try {
  const walMode = db.pragma('journal_mode');
  // console.log(`   Journal mode: ${walMode}`);
} catch (e) {
  // console.log(`   Journal mode: unable to check`);
}

// Cache statistics
try {
  const cacheStats = db.prepare('SELECT * FROM cache_statistics').get();
  if (cacheStats) {
    // console.log(`   Cache entries: ${cacheStats.total_entries} (${cacheStats.active_entries} active, ${cacheStats.expired_entries} expired)`);
  }
} catch (e) {
  // console.log(`   Cache statistics: not available`);
}

// console.log(`\n✅ Performance benchmark complete!`);
// console.log(`\n🎯 Performance Targets:`);
// console.log(`   ✅ API queries <100ms: ${validResults.filter(r => r.avgTime < 100).length}/${totalQueries}`);
// console.log(`   ✅ Database queries <50ms: ${validResults.filter(r => r.avgTime < 50).length}/${totalQueries}`);
// console.log(`   ✅ Dashboard queries <10ms: ${validResults.filter(r => r.name.includes('Dashboard') && r.avgTime < 10).length}/1`);

// Show errors if any
const errorResults = results.filter(r => r.error);
if (errorResults.length > 0) {
  // console.log(`\n❌ Failed Queries:`);
  errorResults.forEach(r => {
    // console.log(`   • ${r.name}: ${r.error}`);
  });
}

db.close();