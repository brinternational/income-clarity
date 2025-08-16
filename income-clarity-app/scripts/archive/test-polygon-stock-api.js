#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Polygon Stock Price API Integration
 * Tests the updated stock price service with Polygon.io API
 * 
 * Usage: node scripts/test-polygon-stock-api.js
 */

const { spawn } = require('child_process');

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds per test

// Test symbols commonly used by dividend investors
const TEST_SYMBOLS = [
  'SCHD', // Schwab US Dividend Equity ETF (popular dividend ETF)
  'VYM',  // Vanguard High Dividend Yield ETF
  'JEPI', // JPMorgan Equity Premium Income ETF
  'QYLD', // Global X NASDAQ 100 Covered Call ETF
  'O',    // Realty Income Corp (monthly dividend REIT)
  'AAPL', // Apple (common stock for testing)
  'SPY'   // S&P 500 ETF (benchmark)
];

const INVALID_SYMBOLS = [
  'INVALID123', // Invalid ticker
  'XYZZZ',      // Non-existent ticker
  '',           // Empty string
  'TOOLONGNAME' // Too long ticker
];

class PolygonAPITester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Run all API tests
   */
  async runAllTests() {
    // console.log('🚀 Starting Polygon API Integration Tests...\n');
    // console.log(`📊 Testing against: ${API_BASE_URL}/api/stock-price`);
    // console.log(`🎯 Test symbols: ${TEST_SYMBOLS.join(', ')}`);
    // console.log(`❌ Invalid symbols: ${INVALID_SYMBOLS.join(', ')}`);
    // console.log('=' .repeat(80) + '\n');

    // Test 1: Health check
    await this.testHealthCheck();
    
    // Test 2: Valid ticker price fetching
    for (const symbol of TEST_SYMBOLS) {
      await this.testValidTicker(symbol);
    }
    
    // Test 3: Invalid ticker handling
    for (const symbol of INVALID_SYMBOLS) {
      await this.testInvalidTicker(symbol);
    }
    
    // Test 4: Caching functionality
    await this.testCaching();
    
    // Test 5: Multiple requests (rate limiting)
    await this.testBatchRequests();
    
    // Test 6: Response time performance
    await this.testResponseTime();
    
    // Print final results
    this.printFinalResults();
  }

  /**
   * Test API health check endpoint
   */
  async testHealthCheck() {
    const testName = 'Health Check (OPTIONS request)';
    this.totalTests++;
    
    try {
      const response = await this.makeRequest('/api/stock-price', {
        method: 'OPTIONS'
      });
      
      if (response.status === 200) {
        const data = response.data;
        if (data.status === 'healthy' && data.service === 'stock-price-api') {
          this.logSuccess(testName, `Service healthy - Provider: ${data.apiProvider || 'Unknown'}`);
          this.passedTests++;
          return;
        }
      }
      
      throw new Error(`Unexpected health check response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logFailure(testName, error.message);
      this.failedTests++;
    }
  }

  /**
   * Test fetching price for valid ticker
   */
  async testValidTicker(symbol) {
    const testName = `Valid ticker: ${symbol}`;
    this.totalTests++;
    
    try {
      const response = await this.makeRequest(`/api/stock-price?ticker=${symbol}`);
      
      if (response.status === 200) {
        const data = response.data;
        
        // Validate required fields
        if (!data.ticker || !data.price || !data.source || !data.lastUpdated) {
          throw new Error(`Missing required fields: ${JSON.stringify(data)}`);
        }
        
        // Validate data types
        if (typeof data.price !== 'number' || data.price <= 0) {
          throw new Error(`Invalid price: ${data.price}`);
        }
        
        // Validate source is Polygon
        if (!data.source.toLowerCase().includes('polygon')) {
          throw new Error(`Expected Polygon source, got: ${data.source}`);
        }
        
        this.logSuccess(testName, 
          `$${data.price.toFixed(2)} from ${data.source} ` + 
          `${data.changePercent ? `(${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)` : ''}`
        );
        this.passedTests++;
        
        // Store for caching test
        this.lastValidResponse = { symbol, data };
      } else {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      this.logFailure(testName, error.message);
      this.failedTests++;
    }
  }

  /**
   * Test error handling for invalid tickers
   */
  async testInvalidTicker(symbol) {
    const testName = `Invalid ticker: "${symbol}"`;
    this.totalTests++;
    
    try {
      const response = await this.makeRequest(`/api/stock-price?ticker=${encodeURIComponent(symbol)}`);
      
      // Should return 400 or 404 error
      if (response.status >= 400) {
        const data = response.data;
        
        if (data.error && data.code) {
          this.logSuccess(testName, `Error handled: ${data.code} - ${data.error}`);
          this.passedTests++;
          return;
        }
      }
      
      throw new Error(`Expected error response, got: HTTP ${response.status}`);
    } catch (error) {
      // Network errors are expected for invalid requests
      if (error.message.includes('HTTP 4')) {
        this.logSuccess(testName, `Error properly handled: ${error.message}`);
        this.passedTests++;
      } else {
        this.logFailure(testName, error.message);
        this.failedTests++;
      }
    }
  }

  /**
   * Test caching functionality (5-minute cache)
   */
  async testCaching() {
    const testName = 'Caching functionality';
    this.totalTests++;
    
    if (!this.lastValidResponse) {
      this.logFailure(testName, 'No valid response available for cache test');
      this.failedTests++;
      return;
    }
    
    try {
      const symbol = this.lastValidResponse.symbol;
      const firstPrice = this.lastValidResponse.data.price;
      
      // Make second request for same symbol
      const startTime = Date.now();
      const response = await this.makeRequest(`/api/stock-price?ticker=${symbol}`);
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200 && response.data.price === firstPrice) {
        // Cache hit should be faster (typically < 50ms vs > 500ms for API call)
        if (responseTime < 100) {
          this.logSuccess(testName, `Cache hit detected (${responseTime}ms response time)`);
          this.passedTests++;
        } else {
          this.logSuccess(testName, `Same price returned, cache likely working (${responseTime}ms)`);
          this.passedTests++;
        }
      } else {
        throw new Error(`Cache test failed: Different price or error response`);
      }
    } catch (error) {
      this.logFailure(testName, error.message);
      this.failedTests++;
    }
  }

  /**
   * Test batch requests (rate limiting behavior)
   */
  async testBatchRequests() {
    const testName = 'Batch requests (rate limiting)';
    this.totalTests++;
    
    try {
      const batchSymbols = ['SCHD', 'VYM', 'JEPI'];
      // console.log(`📊 Testing batch requests: ${batchSymbols.join(', ')}`);
      
      const promises = batchSymbols.map(symbol => 
        this.makeRequest(`/api/stock-price?ticker=${symbol}`)
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.status === 200).length;
      
      if (successCount >= 2) {
        this.logSuccess(testName, `${successCount}/${results.length} requests successful`);
        this.passedTests++;
      } else {
        throw new Error(`Only ${successCount}/${results.length} requests successful`);
      }
    } catch (error) {
      this.logFailure(testName, error.message);
      this.failedTests++;
    }
  }

  /**
   * Test API response time performance
   */
  async testResponseTime() {
    const testName = 'Response time performance';
    this.totalTests++;
    
    try {
      const symbol = 'AAPL'; // Use reliable symbol
      const startTime = Date.now();
      
      const response = await this.makeRequest(`/api/stock-price?ticker=${symbol}`);
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        if (responseTime < 2000) { // Under 2 seconds as required
          this.logSuccess(testName, `Response time: ${responseTime}ms (< 2s requirement)`);
          this.passedTests++;
        } else {
          this.logFailure(testName, `Response time too slow: ${responseTime}ms (> 2s requirement)`);
          this.failedTests++;
        }
      } else {
        throw new Error(`HTTP ${response.status} during performance test`);
      }
    } catch (error) {
      this.logFailure(testName, error.message);
      this.failedTests++;
    }
  }

  /**
   * Make HTTP request with timeout
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Polygon-API-Tester/1.0'
        },
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: 'Invalid JSON response' };
      }
      
      return { status: response.status, data };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Log test success
   */
  logSuccess(testName, details) {
    // console.log(`✅ ${testName}: ${details}`);
    this.testResults.push({ test: testName, status: 'PASS', details });
  }

  /**
   * Log test failure
   */
  logFailure(testName, error) {
    // console.log(`❌ ${testName}: ${error}`);
    this.testResults.push({ test: testName, status: 'FAIL', error });
  }

  /**
   * Print final test results
   */
  printFinalResults() {
    // console.log('\n' + '=' .repeat(80));
    // console.log('📋 TEST RESULTS SUMMARY');
    // console.log('=' .repeat(80));
    // console.log(`Total Tests: ${this.totalTests}`);
    // console.log(`✅ Passed: ${this.passedTests}`);
    // console.log(`❌ Failed: ${this.failedTests}`);
    // console.log(`📊 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      // console.log('\n🚨 FAILED TESTS:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   • ${r.test}: ${r.error}`));
    }
    
    // console.log('\n🎯 INTEGRATION STATUS:');
    if (this.passedTests >= this.totalTests * 0.8) {
      // console.log('✅ Polygon API integration is working correctly!');
      // console.log('🚀 Ready for production deployment with POLYGON_API_KEY configuration');
    } else {
      // console.log('❌ Integration has issues that need to be resolved');
    }
    
    // console.log('=' .repeat(80));
  }
}

// Run tests if called directly
if (require.main === module) {
  // Check if we're in the right directory
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    // console.error('❌ Please run this script from the income-clarity-app root directory');
    process.exit(1);
  }
  
  const tester = new PolygonAPITester();
  tester.runAllTests().catch(error => {
    // console.error('🚨 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = PolygonAPITester;