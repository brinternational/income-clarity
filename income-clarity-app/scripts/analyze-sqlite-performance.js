#!/usr/bin/env node

/**
 * SQLite Performance Analysis Script for Income Clarity Lite
 * Analyzes current query performance and provides optimization recommendations
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../prisma/income_clarity.db');

// console.log('🔍 SQLite Performance Analysis for Income Clarity Lite\n');

if (!fs.existsSync(DB_PATH)) {
  // console.error('❌ Database not found at:', DB_PATH);
  process.exit(1);
}

const db = Database(DB_PATH);

// Enable query timing and optimization info
db.pragma('optimize');

// Function to measure query performance
function measureQuery(name, query, params = []) {
  // console.log(`\n📊 Testing: ${name}`);
  
  const start = process.hrtime.bigint();
  let result;
  try {
    const stmt = db.prepare(query);
    result = stmt.all(params);
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // console.log(`   ⏱️  Time: ${duration.toFixed(2)}ms`);
    // console.log(`   📋 Rows: ${result.length}`);
    
    // Show EXPLAIN QUERY PLAN
    const explainStmt = db.prepare(`EXPLAIN QUERY PLAN ${query}`);
    const plan = explainStmt.all(params);
    // console.log(`   🔍 Query Plan:`);
    plan.forEach(row => {
      // console.log(`      ${row.detail}`);
    });
    
    return { duration, rowCount: result.length, plan };
  } catch (error) {
    // console.log(`   ❌ Error: ${error.message}`);
    return { duration: -1, rowCount: 0, plan: [], error: error.message };
  }
}

// Get database info
// console.log('📋 Database Information:');
// console.log('   Path:', DB_PATH);
// console.log('   Size:', (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2) + ' MB');

// Check table sizes
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
// console.log('\n📊 Table Statistics:');
tables.forEach(table => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
  // console.log(`   ${table.name}: ${count.count} rows`);
});

// Check existing indexes
// console.log('\n🔍 Existing Indexes:');
const indexes = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").all();
indexes.forEach(index => {
  // console.log(`   ${index.name} on ${index.tbl_name}`);
  if (index.sql) {
    // console.log(`      ${index.sql}`);
  }
});

// console.log('\n⚡ Performance Tests:');

// Common query patterns to test
const queryTests = [
  {
    name: 'User portfolios lookup',
    query: 'SELECT * FROM portfolios WHERE userId = ?',
    params: ['user-1'] // We'll use a placeholder since we don't know actual user IDs
  },
  {
    name: 'Portfolio holdings with prices',
    query: 'SELECT h.*, p.name as portfolio_name FROM holdings h JOIN portfolios p ON h.portfolioId = p.id WHERE p.userId = ?',
    params: ['user-1']
  },
  {
    name: 'Recent transactions by user',
    query: 'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 50',
    params: ['user-1']
  },
  {
    name: 'Income by category and date range',
    query: 'SELECT * FROM incomes WHERE userId = ? AND date >= ? AND date <= ? ORDER BY date DESC',
    params: ['user-1', '2024-01-01', '2024-12-31']
  },
  {
    name: 'Expenses by category and date range',
    query: 'SELECT * FROM expenses WHERE userId = ? AND date >= ? AND date <= ? ORDER BY date DESC',
    params: ['user-1', '2024-01-01', '2024-12-31']
  },
  {
    name: 'Stock prices for ticker',
    query: 'SELECT * FROM stock_prices WHERE ticker = ? ORDER BY date DESC LIMIT 30',
    params: ['SPY']
  },
  {
    name: 'Dividend schedule lookup',
    query: 'SELECT * FROM dividend_schedules WHERE ticker = ? AND exDate >= ? ORDER BY exDate',
    params: ['SPY', '2024-01-01']
  },
  {
    name: 'Performance snapshots for user',
    query: 'SELECT * FROM performance_snapshots WHERE userId = ? ORDER BY date DESC LIMIT 12',
    params: ['user-1']
  },
  {
    name: 'Cache lookup',
    query: 'SELECT * FROM calculation_cache WHERE cacheKey = ? AND expiresAt > datetime("now")',
    params: ['portfolio_performance_user-1']
  }
];

const results = [];

// Get first real user ID if available
let realUserId = null;
try {
  const firstUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (firstUser) {
    realUserId = firstUser.id;
    // console.log(`   Using real user ID: ${realUserId}`);
  }
} catch (e) {
  // console.log('   No users found, using placeholder IDs');
}

// Run performance tests
queryTests.forEach(test => {
  let params = test.params;
  if (realUserId && params[0] === 'user-1') {
    params = [realUserId, ...params.slice(1)];
  }
  
  const result = measureQuery(test.name, test.query, params);
  results.push({
    name: test.name,
    ...result
  });
});

// Analyze results and provide recommendations
// console.log('\n📈 Performance Summary:');
let slowQueries = 0;
let totalTime = 0;

results.forEach(result => {
  if (result.duration > 0) {
    totalTime += result.duration;
    if (result.duration > 100) {
      slowQueries++;
      // console.log(`   ⚠️  SLOW: ${result.name} (${result.duration.toFixed(2)}ms)`);
    } else if (result.duration > 50) {
      // console.log(`   🟡 MEDIUM: ${result.name} (${result.duration.toFixed(2)}ms)`);
    } else {
      // console.log(`   ✅ FAST: ${result.name} (${result.duration.toFixed(2)}ms)`);
    }
  }
});

// console.log(`\n📊 Overall Performance:`);
// console.log(`   Total test time: ${totalTime.toFixed(2)}ms`);
// console.log(`   Average query time: ${(totalTime / results.filter(r => r.duration > 0).length).toFixed(2)}ms`);
// console.log(`   Slow queries (>100ms): ${slowQueries}`);

// Recommendations based on analysis
// console.log('\n💡 Optimization Recommendations:');

const recommendations = [
  {
    condition: () => !indexes.find(idx => idx.name.includes('userId')),
    message: 'Add userId indexes on main tables for user-specific queries'
  },
  {
    condition: () => !indexes.find(idx => idx.name.includes('date')),
    message: 'Add date indexes for time-based queries'
  },
  {
    condition: () => !indexes.find(idx => idx.name.includes('ticker')),
    message: 'Add ticker indexes for stock-related queries'
  },
  {
    condition: () => slowQueries > 0,
    message: 'Consider adding composite indexes for multi-column WHERE clauses'
  },
  {
    condition: () => totalTime > 500,
    message: 'Enable SQLite optimization pragmas for better performance'
  }
];

recommendations.forEach((rec, index) => {
  if (rec.condition()) {
    // console.log(`   ${index + 1}. ${rec.message}`);
  }
});

// Check PRAGMA settings
// console.log('\n🛠️  Current SQLite Configuration:');
const pragmas = [
  'cache_size',
  'journal_mode',
  'synchronous',
  'temp_store',
  'mmap_size',
  'optimize'
];

pragmas.forEach(pragma => {
  try {
    const result = db.pragma(pragma);
    // console.log(`   ${pragma}: ${result}`);
  } catch (e) {
    // console.log(`   ${pragma}: unable to check`);
  }
});

db.close();

// console.log('\n✅ Performance analysis complete!');
// console.log('\n📝 Next steps:');
// console.log('   1. Review slow queries and add appropriate indexes');
// console.log('   2. Implement query result caching where beneficial');
// console.log('   3. Optimize SQLite PRAGMA settings');
// console.log('   4. Re-run this analysis after optimizations');