#!/usr/bin/env node

// Comprehensive Polygon API Integration Test Script
// Tests all aspects of the Polygon API integration with reliability focus

// Use built-in fetch (Node.js 18+) or polyfill
const fetch = globalThis.fetch || require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const TEST_SYMBOLS = ['SPY', 'QQQ', 'SCHD', 'VTI', 'INVALID_SYMBOL'];

// ANSI color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  startTime: Date.now(),
  tests: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, message = '', details = null) {
  const icons = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️',
    info: 'ℹ️'
  };
  
  const statusColors = {
    pass: 'green',
    fail: 'red',
    warn: 'yellow',
    info: 'blue'
  };

  log(`${icons[status]} ${name}`, statusColors[status]);
  if (message) log(`   ${message}`, statusColors[status]);
  if (details && typeof details === 'object') {
    log(`   Details: ${JSON.stringify(details, null, 2)}`, 'cyan');
  }
  
  testResults.tests.push({
    name,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });

  if (status === 'pass') testResults.passed++;
  else if (status === 'fail') testResults.failed++;
  else if (status === 'warn') testResults.warnings++;
}

async function testAPIEndpoint(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testEnvironmentHealth() {
  log('\n🔍 Testing Environment Health...', 'bold');
  
  // Test quick health check
  const quickHealth = await testAPIEndpoint('/api/health/environment?quick=true');
  if (quickHealth.success) {
    logTest('Quick Health Check', 'pass', `Status: ${quickHealth.data.status}`, quickHealth.data);
  } else {
    logTest('Quick Health Check', 'fail', quickHealth.error || 'Failed to get health status');
  }

  // Test full environment validation
  const fullHealth = await testAPIEndpoint('/api/health/environment');
  if (fullHealth.success) {
    const { overall, summary, checks } = fullHealth.data;
    logTest('Full Environment Validation', overall === 'healthy' ? 'pass' : overall === 'degraded' ? 'warn' : 'fail',
      `Overall: ${overall}, Passed: ${summary.passed}, Warnings: ${summary.warnings}, Failed: ${summary.failed}`,
      { checks: checks.map(c => ({ name: c.name, status: c.status, message: c.message })) });
  } else {
    logTest('Full Environment Validation', 'fail', fullHealth.error || 'Failed to get validation status');
  }
}

async function testStockPricesAPI() {
  log('\n📊 Testing Stock Prices API...', 'bold');
  
  // Test single symbol
  const singleSymbol = await testAPIEndpoint('/api/stock-prices?symbol=SPY');
  if (singleSymbol.success && singleSymbol.data.symbol === 'SPY') {
    logTest('Single Symbol Request (SPY)', 'pass', 
      `Price: $${singleSymbol.data.price}, Source: ${singleSymbol.data.dataSource}`,
      { price: singleSymbol.data.price, dataSource: singleSymbol.data.dataSource });
  } else {
    logTest('Single Symbol Request (SPY)', 'fail', singleSymbol.error || 'Invalid response format');
  }

  // Test multiple symbols
  const multipleSymbols = await testAPIEndpoint('/api/stock-prices?symbols=SPY,QQQ,SCHD');
  if (multipleSymbols.success && multipleSymbols.data.prices) {
    const count = Object.keys(multipleSymbols.data.prices).length;
    logTest('Multiple Symbols Request', 'pass', 
      `Retrieved ${count} symbols, Source: ${multipleSymbols.data.dataSource}`,
      { count, dataSource: multipleSymbols.data.dataSource });
  } else {
    logTest('Multiple Symbols Request', 'fail', multipleSymbols.error || 'Invalid response format');
  }

  // Test invalid symbol handling
  const invalidSymbol = await testAPIEndpoint('/api/stock-prices?symbol=INVALID123');
  if (invalidSymbol.success) {
    logTest('Invalid Symbol Handling', invalidSymbol.data.price ? 'pass' : 'warn', 
      `Handled gracefully with ${invalidSymbol.data.dataSource} data`);
  } else {
    logTest('Invalid Symbol Handling', 'fail', 'Should handle invalid symbols gracefully');
  }
}

async function testAdvancedFeatures() {
  log('\n🚀 Testing Advanced Features...', 'bold');
  
  // Test health status with connection test
  const healthStatus = await testAPIEndpoint('/api/stock-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'health-status', testConnection: true })
  });
  
  if (healthStatus.success && healthStatus.data.health) {
    const { health, connection } = healthStatus.data;
    logTest('API Health Status', 'pass', 
      `API Available: ${health.apiAvailable}, Connection: ${connection ? connection.success : 'Not tested'}`,
      { health, connection });
  } else {
    logTest('API Health Status', 'fail', healthStatus.error || 'Failed to get health status');
  }

  // Test dividend data
  const dividendData = await testAPIEndpoint('/api/stock-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get-dividends', symbol: 'SPY' })
  });
  
  if (dividendData.success && dividendData.data.dividends) {
    const dividendCount = dividendData.data.dividends.length;
    logTest('Dividend Data Retrieval', 'pass', 
      `Retrieved ${dividendCount} dividend records for SPY`,
      { count: dividendCount, dataSource: dividendData.data.dataSource });
  } else {
    logTest('Dividend Data Retrieval', 'fail', dividendData.error || 'Failed to get dividend data');
  }

  // Test SPY benchmark
  const spyBenchmark = await testAPIEndpoint('/api/stock-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'spy-benchmark' })
  });
  
  if (spyBenchmark.success && spyBenchmark.data.symbol === 'SPY') {
    logTest('SPY Benchmark', 'pass', 
      `SPY Price: $${spyBenchmark.data.price}, Change: ${spyBenchmark.data.changePercent?.toFixed(2)}%`);
  } else {
    logTest('SPY Benchmark', 'fail', spyBenchmark.error || 'Failed to get SPY benchmark');
  }

  // Test cache clearing
  const cacheClear = await testAPIEndpoint('/api/stock-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'clear-cache' })
  });
  
  if (cacheClear.success && cacheClear.data.success) {
    logTest('Cache Management', 'pass', 'Cache cleared successfully');
  } else {
    logTest('Cache Management', 'fail', cacheClear.error || 'Failed to clear cache');
  }
}

async function testErrorHandling() {
  log('\n🛡️ Testing Error Handling...', 'bold');
  
  // Test missing parameters
  const missingParams = await testAPIEndpoint('/api/stock-prices');
  if (missingParams.status === 400) {
    logTest('Missing Parameters Handling', 'pass', 'Returns 400 Bad Request as expected');
  } else {
    logTest('Missing Parameters Handling', 'fail', 'Should return 400 for missing parameters');
  }

  // Test invalid action
  const invalidAction = await testAPIEndpoint('/api/stock-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'invalid-action' })
  });
  
  if (invalidAction.status === 400) {
    logTest('Invalid Action Handling', 'pass', 'Returns 400 Bad Request for invalid actions');
  } else {
    logTest('Invalid Action Handling', 'fail', 'Should return 400 for invalid actions');
  }
}

async function testPerformanceAndReliability() {
  log('\n⚡ Testing Performance & Reliability...', 'bold');
  
  const performanceTests = [];
  
  // Test response times
  for (let i = 0; i < 3; i++) {
    const startTime = Date.now();
    const result = await testAPIEndpoint('/api/stock-prices?symbol=SPY');
    const responseTime = Date.now() - startTime;
    
    performanceTests.push({
      attempt: i + 1,
      responseTime,
      success: result.success,
      cached: i > 0 // First request fills cache, subsequent should be faster
    });
  }

  const avgResponseTime = performanceTests.reduce((sum, test) => sum + test.responseTime, 0) / performanceTests.length;
  const cachedResponseTime = performanceTests.slice(1).reduce((sum, test) => sum + test.responseTime, 0) / 2;
  
  if (avgResponseTime < 2000) { // Under 2 seconds
    logTest('Response Time Performance', 'pass', 
      `Average: ${avgResponseTime.toFixed(0)}ms, Cached: ${cachedResponseTime.toFixed(0)}ms`);
  } else {
    logTest('Response Time Performance', 'warn', 
      `Average: ${avgResponseTime.toFixed(0)}ms (slower than expected)`);
  }

  // Test concurrent requests
  const concurrentStart = Date.now();
  const concurrentRequests = await Promise.all([
    testAPIEndpoint('/api/stock-prices?symbol=SPY'),
    testAPIEndpoint('/api/stock-prices?symbol=QQQ'),
    testAPIEndpoint('/api/stock-prices?symbol=SCHD')
  ]);
  const concurrentTime = Date.now() - concurrentStart;
  
  const allSuccessful = concurrentRequests.every(req => req.success);
  if (allSuccessful && concurrentTime < 3000) {
    logTest('Concurrent Request Handling', 'pass', 
      `3 concurrent requests completed in ${concurrentTime}ms`);
  } else {
    logTest('Concurrent Request Handling', allSuccessful ? 'warn' : 'fail', 
      `3 concurrent requests: ${concurrentRequests.filter(r => r.success).length} successful in ${concurrentTime}ms`);
  }
}

async function generateTestReport() {
  const executionTime = Date.now() - testResults.startTime;
  const totalTests = testResults.passed + testResults.failed + testResults.warnings;
  
  log('\n📋 TEST SUMMARY', 'bold');
  log('═══════════════════════════════════════', 'cyan');
  
  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⚠️ Warnings: ${testResults.warnings}`, 'yellow');
  log(`⏱️ Execution Time: ${executionTime}ms`, 'blue');
  log(`📅 Date: ${new Date().toISOString()}`, 'blue');
  
  const successRate = ((testResults.passed / totalTests) * 100).toFixed(1);
  log(`📊 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 75 ? 'yellow' : 'red');
  
  // Overall status
  let overallStatus = 'HEALTHY';
  let statusColor = 'green';
  
  if (testResults.failed > 0) {
    overallStatus = 'CRITICAL';
    statusColor = 'red';
  } else if (testResults.warnings > 2) {
    overallStatus = 'DEGRADED';
    statusColor = 'yellow';
  }
  
  log(`\n🎯 OVERALL STATUS: ${overallStatus}`, statusColor);
  
  if (testResults.failed > 0) {
    log('\n❌ FAILED TESTS:', 'red');
    testResults.tests.filter(t => t.status === 'fail').forEach(test => {
      log(`   - ${test.name}: ${test.message}`, 'red');
    });
  }

  if (testResults.warnings > 0) {
    log('\n⚠️ WARNINGS:', 'yellow');
    testResults.tests.filter(t => t.status === 'warn').forEach(test => {
      log(`   - ${test.name}: ${test.message}`, 'yellow');
    });
  }

  // Generate JSON report
  const reportPath = path.join(__dirname, '../test-results', `polygon-integration-${Date.now()}.json`);
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    ...testResults,
    executionTime,
    overallStatus,
    successRate: parseFloat(successRate),
    timestamp: new Date().toISOString()
  }, null, 2));
  
  log(`\n📄 Detailed report saved: ${reportPath}`, 'cyan');
  
  return overallStatus === 'HEALTHY';
}

async function main() {
  log('🚀 Starting Polygon API Integration Tests', 'bold');
  log('==========================================', 'cyan');
  
  try {
    await testEnvironmentHealth();
    await testStockPricesAPI();
    await testAdvancedFeatures();
    await testErrorHandling();
    await testPerformanceAndReliability();
    
    const success = await generateTestReport();
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main();
}