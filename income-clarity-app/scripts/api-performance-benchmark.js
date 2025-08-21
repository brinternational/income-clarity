#!/usr/bin/env node

/**
 * API Performance Benchmark Suite
 * 
 * Systematically tests all API endpoints for response time issues
 * Identifies endpoints taking >200ms (warning) and >2s (critical)
 * 
 * Usage: node scripts/api-performance-benchmark.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Performance thresholds (ms)
const THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 200,
  WARNING: 500,
  CRITICAL: 2000
};

class PerformanceBenchmark {
  constructor() {
    this.results = [];
    this.sessionToken = null;
    this.startTime = Date.now();
  }

  async authenticate() {
    console.log('🔐 Authenticating test user...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    // Extract session token from Set-Cookie header
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const sessionMatch = setCookie.match(/sessionToken=([^;]+)/);
      if (sessionMatch) {
        this.sessionToken = sessionMatch[1];
      }
    }

    console.log('✅ Authentication successful');
  }

  async measureEndpoint(method, endpoint, body = null, headers = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // Add session token for protected routes
    if (this.sessionToken) {
      headers.Cookie = `sessionToken=${this.sessionToken}`;
    }

    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const startTime = performance.now();
    
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const result = {
        method,
        endpoint,
        status: response.status,
        responseTime,
        category: this.categorizePerformance(responseTime),
        contentLength: response.headers.get('content-length') || 'unknown',
        timestamp: new Date().toISOString()
      };

      // For successful responses, try to get response size
      if (response.ok) {
        try {
          const text = await response.text();
          result.actualSize = text.length;
        } catch (e) {
          result.actualSize = 'unknown';
        }
      }

      this.results.push(result);
      return result;

    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const result = {
        method,
        endpoint,
        status: 'ERROR',
        responseTime,
        category: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      return result;
    }
  }

  categorizePerformance(responseTime) {
    if (responseTime <= THRESHOLDS.EXCELLENT) return 'EXCELLENT';
    if (responseTime <= THRESHOLDS.GOOD) return 'GOOD';
    if (responseTime <= THRESHOLDS.WARNING) return 'WARNING';
    if (responseTime <= THRESHOLDS.CRITICAL) return 'CRITICAL';
    return 'UNACCEPTABLE';
  }

  async runBenchmarks() {
    console.log('🚀 Starting API Performance Benchmark Suite...\n');

    // Core API endpoints to test
    const endpoints = [
      // Health checks
      { method: 'GET', endpoint: '/api/health' },
      { method: 'GET', endpoint: '/api/health/detailed' },
      { method: 'GET', endpoint: '/api/health/environment' },

      // Authentication
      { method: 'GET', endpoint: '/api/auth/me' },
      { method: 'GET', endpoint: '/api/session/health' },

      // Super Cards (Main performance suspects)
      { method: 'GET', endpoint: '/api/super-cards/performance-hub' },
      { method: 'GET', endpoint: '/api/super-cards/performance-hub-fast' },
      { method: 'GET', endpoint: '/api/super-cards/perf-optimized' },
      { method: 'GET', endpoint: '/api/super-cards/income-hub' },
      { method: 'GET', endpoint: '/api/super-cards/tax-strategy-hub' },
      { method: 'GET', endpoint: '/api/super-cards/portfolio-strategy-hub' },
      { method: 'GET', endpoint: '/api/super-cards/financial-planning-hub' },
      { method: 'GET', endpoint: '/api/super-cards/planning-hub' },

      // Portfolio data
      { method: 'GET', endpoint: '/api/portfolios' },
      { method: 'GET', endpoint: '/api/income' },
      { method: 'GET', endpoint: '/api/stock-prices' },
      { method: 'GET', endpoint: '/api/holdings/refresh-prices' },

      // Yodlee integration
      { method: 'GET', endpoint: '/api/yodlee/accounts' },
      { method: 'GET', endpoint: '/api/sync/status' },

      // Performance testing endpoints
      { method: 'GET', endpoint: '/api/test/performance' },
      { method: 'GET', endpoint: '/api/test-performance' }
    ];

    console.log(`📊 Testing ${endpoints.length} endpoints...\n`);

    for (let i = 0; i < endpoints.length; i++) {
      const { method, endpoint, body } = endpoints[i];
      
      process.stdout.write(`[${i + 1}/${endpoints.length}] ${method} ${endpoint}... `);
      
      const result = await this.measureEndpoint(method, endpoint, body);
      
      const emoji = this.getPerformanceEmoji(result.category);
      const statusColor = result.status === 200 ? '✅' : result.status >= 400 ? '❌' : '⚠️';
      
      console.log(`${emoji} ${statusColor} ${result.responseTime}ms (${result.category})`);

      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await this.generateReport();
  }

  getPerformanceEmoji(category) {
    const emojis = {
      'EXCELLENT': '🚀',
      'GOOD': '✅',
      'WARNING': '⚠️',
      'CRITICAL': '🚨',
      'UNACCEPTABLE': '💀',
      'ERROR': '❌'
    };
    return emojis[category] || '❓';
  }

  async generateReport() {
    const totalTime = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 API PERFORMANCE BENCHMARK REPORT');
    console.log('='.repeat(80));

    // Summary statistics
    const successful = this.results.filter(r => r.status === 200);
    const avgResponseTime = successful.length > 0 
      ? Math.round(successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length)
      : 0;

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Endpoints Tested: ${this.results.length}`);
    console.log(`   Successful Responses: ${successful.length}`);
    console.log(`   Average Response Time: ${avgResponseTime}ms`);
    console.log(`   Total Test Duration: ${totalTime}ms\n`);

    // Group by performance category
    const categories = {};
    this.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    });

    // Performance breakdown
    Object.keys(categories).sort().forEach(category => {
      const count = categories[category].length;
      const emoji = this.getPerformanceEmoji(category);
      console.log(`${emoji} ${category}: ${count} endpoints`);
      
      if (['WARNING', 'CRITICAL', 'UNACCEPTABLE', 'ERROR'].includes(category)) {
        categories[category].forEach(result => {
          console.log(`   └─ ${result.method} ${result.endpoint} (${result.responseTime}ms)`);
        });
      }
    });

    // Critical issues requiring immediate attention
    const critical = this.results.filter(r => 
      r.responseTime > THRESHOLDS.CRITICAL || r.category === 'UNACCEPTABLE'
    );

    if (critical.length > 0) {
      console.log('\n🚨 CRITICAL PERFORMANCE ISSUES (>2s):');
      critical.forEach(result => {
        console.log(`   💀 ${result.method} ${result.endpoint}: ${result.responseTime}ms`);
      });
    }

    // Warning-level issues
    const warnings = this.results.filter(r => 
      r.responseTime > THRESHOLDS.WARNING && r.responseTime <= THRESHOLDS.CRITICAL
    );

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNING PERFORMANCE ISSUES (500ms-2s):');
      warnings.forEach(result => {
        console.log(`   🐌 ${result.method} ${result.endpoint}: ${result.responseTime}ms`);
      });
    }

    // Recommendations
    console.log('\n🔧 OPTIMIZATION RECOMMENDATIONS:');
    if (critical.length > 0) {
      console.log('   1. URGENT: Fix critical endpoints (>2s response time)');
    }
    if (warnings.length > 0) {
      console.log('   2. HIGH: Optimize warning-level endpoints (>500ms)');
    }
    console.log('   3. Add caching for expensive calculations');
    console.log('   4. Optimize database queries (add indexes, reduce N+1 queries)');
    console.log('   5. Implement response compression');

    // Save detailed results to file
    const reportFile = path.join(__dirname, '..', 'performance-benchmark-results.json');
    const detailedReport = {
      testStartTime: new Date(this.startTime).toISOString(),
      testDuration: totalTime,
      summary: {
        totalEndpoints: this.results.length,
        successfulRequests: successful.length,
        averageResponseTime: avgResponseTime,
        criticalIssues: critical.length,
        warningIssues: warnings.length
      },
      results: this.results,
      thresholds: THRESHOLDS
    };

    fs.writeFileSync(reportFile, JSON.stringify(detailedReport, null, 2));
    console.log(`\n💾 Detailed results saved to: ${reportFile}`);
    console.log('='.repeat(80));
  }
}

// Main execution
async function main() {
  const benchmark = new PerformanceBenchmark();
  
  try {
    await benchmark.authenticate();
    await benchmark.runBenchmarks();
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceBenchmark;