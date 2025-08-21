#!/usr/bin/env node
/**
 * Performance Baseline Test
 * Tests all API endpoints to establish current performance baseline
 * Identifies endpoints that are slow (>2s) for optimization
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Define all API endpoints to test
const API_ENDPOINTS = [
  // Health and basic endpoints
  { name: 'Health Check', url: '/api/health', method: 'GET', critical: true },
  
  // Super Cards APIs (Main dashboard data)
  { name: 'Performance Hub', url: '/api/super-cards/performance-hub', method: 'GET', critical: true },
  { name: 'Income Hub', url: '/api/super-cards/income-hub', method: 'GET', critical: true },
  { name: 'Tax Strategy Hub', url: '/api/super-cards/tax-strategy-hub', method: 'GET', critical: true },
  { name: 'Portfolio Strategy Hub', url: '/api/super-cards/portfolio-strategy-hub', method: 'GET', critical: true },
  { name: 'Financial Planning Hub', url: '/api/super-cards/financial-planning-hub', method: 'GET', critical: true },
  
  // Auth endpoints (without actual credentials - just response time test)
  { name: 'Auth Check', url: '/api/auth/me', method: 'GET', critical: true, expectedStatus: [200, 401] },
  
  // Portfolio endpoints
  { name: 'Portfolios List', url: '/api/portfolios', method: 'GET', critical: false },
  
  // Additional endpoints that might exist
  { name: 'Demo Reset', url: '/api/demo/reset', method: 'POST', critical: false, expectedStatus: [200, 404, 405] }
];

// Performance thresholds
const THRESHOLDS = {
  EXCELLENT: 200,   // <200ms
  GOOD: 500,       // <500ms
  ACCEPTABLE: 1000, // <1s
  SLOW: 2000,      // <2s
  VERY_SLOW: 5000  // <5s
};

class PerformanceTest {
  constructor() {
    this.results = [];
    this.summary = {
      total: 0,
      excellent: 0,
      good: 0,
      acceptable: 0,
      slow: 0,
      verySlow: 0,
      errors: 0
    };
  }

  async testEndpoint(endpoint) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const url = `${BASE_URL}${endpoint.url}`;
      
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      
      const request = http.request(url, {
        method: endpoint.method,
        timeout: 10000 // 10s timeout
      }, (response) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        let data = '';
        response.on('data', chunk => data += chunk);
        
        response.on('end', () => {
          const result = {
            name: endpoint.name,
            url: endpoint.url,
            method: endpoint.method,
            status: response.statusCode,
            duration: duration,
            critical: endpoint.critical,
            success: this.isSuccessStatus(response.statusCode, endpoint.expectedStatus),
            responseSize: data.length,
            category: this.categorizePerformance(duration)
          };
          
          this.results.push(result);
          this.updateSummary(result);
          
          // Log result with color coding
          const statusColor = result.success ? '\x1b[32m' : '\x1b[31m'; // Green/Red
          const perfColor = this.getPerformanceColor(duration);
          console.log(`  ${statusColor}Status: ${response.statusCode}\x1b[0m | ${perfColor}Time: ${duration}ms\x1b[0m | Size: ${data.length}b`);
          
          resolve(result);
        });
      });
      
      request.on('error', (error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const result = {
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: 'ERROR',
          duration: duration,
          critical: endpoint.critical,
          success: false,
          error: error.message,
          category: 'ERROR'
        };
        
        this.results.push(result);
        this.summary.errors++;
        
        console.log(`  \x1b[31mERROR: ${error.message}\x1b[0m`);
        resolve(result);
      });
      
      request.on('timeout', () => {
        request.destroy();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const result = {
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          status: 'TIMEOUT',
          duration: duration,
          critical: endpoint.critical,
          success: false,
          error: 'Request timeout',
          category: 'TIMEOUT'
        };
        
        this.results.push(result);
        this.summary.errors++;
        
        console.log(`  \x1b[31mTIMEOUT after ${duration}ms\x1b[0m`);
        resolve(result);
      });
      
      if (endpoint.method === 'POST') {
        request.write('{}'); // Send empty JSON for POST requests
      }
      
      request.end();
    });
  }

  isSuccessStatus(status, expectedStatuses = [200]) {
    return expectedStatuses.includes(status);
  }

  categorizePerformance(duration) {
    if (duration <= THRESHOLDS.EXCELLENT) return 'EXCELLENT';
    if (duration <= THRESHOLDS.GOOD) return 'GOOD';
    if (duration <= THRESHOLDS.ACCEPTABLE) return 'ACCEPTABLE';
    if (duration <= THRESHOLDS.SLOW) return 'SLOW';
    if (duration <= THRESHOLDS.VERY_SLOW) return 'VERY_SLOW';
    return 'CRITICAL';
  }

  getPerformanceColor(duration) {
    if (duration <= THRESHOLDS.EXCELLENT) return '\x1b[32m'; // Green
    if (duration <= THRESHOLDS.GOOD) return '\x1b[36m'; // Cyan
    if (duration <= THRESHOLDS.ACCEPTABLE) return '\x1b[33m'; // Yellow
    if (duration <= THRESHOLDS.SLOW) return '\x1b[35m'; // Magenta
    return '\x1b[31m'; // Red
  }

  updateSummary(result) {
    if (result.success) {
      this.summary.total++;
      switch (result.category) {
        case 'EXCELLENT': this.summary.excellent++; break;
        case 'GOOD': this.summary.good++; break;
        case 'ACCEPTABLE': this.summary.acceptable++; break;
        case 'SLOW': this.summary.slow++; break;
        case 'VERY_SLOW': this.summary.verySlow++; break;
      }
    }
  }

  async runAllTests() {
    console.log('\n🚀 Starting Performance Baseline Test\n');
    console.log(`Testing ${API_ENDPOINTS.length} endpoints...\n`);

    // Test each endpoint
    for (const endpoint of API_ENDPOINTS) {
      await this.testEndpoint(endpoint);
      // Small delay between requests to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE BASELINE REPORT');
    console.log('='.repeat(80));

    // Summary Statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log(`Total Successful Tests: ${this.summary.total}`);
    console.log(`Errors: ${this.summary.errors}`);
    console.log();
    console.log(`🟢 Excellent (<${THRESHOLDS.EXCELLENT}ms): ${this.summary.excellent}`);
    console.log(`🔵 Good (<${THRESHOLDS.GOOD}ms): ${this.summary.good}`);
    console.log(`🟡 Acceptable (<${THRESHOLDS.ACCEPTABLE}ms): ${this.summary.acceptable}`);
    console.log(`🟣 Slow (<${THRESHOLDS.SLOW}ms): ${this.summary.slow}`);
    console.log(`🔴 Very Slow (>${THRESHOLDS.SLOW}ms): ${this.summary.verySlow}`);

    // Critical Issues
    const criticalIssues = this.results.filter(r => 
      (r.critical && !r.success) || 
      (r.critical && r.duration > THRESHOLDS.SLOW) ||
      r.category === 'CRITICAL'
    );

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL PERFORMANCE ISSUES:');
      criticalIssues.forEach(issue => {
        console.log(`  ❌ ${issue.name}: ${issue.duration}ms (${issue.status})`);
      });
    }

    // Slow Endpoints (>2s)
    const slowEndpoints = this.results.filter(r => 
      r.success && r.duration > THRESHOLDS.SLOW
    );

    if (slowEndpoints.length > 0) {
      console.log('\n⏱️  SLOW ENDPOINTS (>2s):');
      slowEndpoints.forEach(endpoint => {
        console.log(`  🐌 ${endpoint.name}: ${endpoint.duration}ms`);
      });
    }

    // Detailed Results
    console.log('\n📋 DETAILED RESULTS:');
    console.log('Name'.padEnd(25) + 'Status'.padEnd(10) + 'Time'.padEnd(10) + 'Category'.padEnd(12) + 'Critical');
    console.log('-'.repeat(70));
    
    this.results.forEach(result => {
      const name = result.name.padEnd(25);
      const status = String(result.status).padEnd(10);
      const time = `${result.duration}ms`.padEnd(10);
      const category = result.category.padEnd(12);
      const critical = result.critical ? '⭐' : '';
      
      console.log(`${name}${status}${time}${category}${critical}`);
    });

    // Performance Recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
    
    if (this.summary.slow + this.summary.verySlow > 0) {
      console.log('  🔧 Immediate Actions Needed:');
      console.log('    - Set up Redis for caching and rate limiting');
      console.log('    - Optimize database queries in slow endpoints');
      console.log('    - Implement response caching for frequently accessed data');
      console.log('    - Add pagination for large data sets');
    }
    
    if (this.summary.errors > 0) {
      console.log('  🚨 Fix Critical Errors:');
      console.log('    - Investigate failed endpoints');
      console.log('    - Implement proper error handling');
      console.log('    - Add health checks and monitoring');
    }

    if (this.summary.excellent < this.summary.total * 0.7) {
      console.log('  📈 Performance Optimizations:');
      console.log('    - Implement API response caching');
      console.log('    - Optimize database queries');
      console.log('    - Add request/response compression');
      console.log('    - Consider CDN for static assets');
    }

    console.log('\n✅ Baseline test complete! Use this data for optimization planning.\n');
    
    // Save results to file for reference
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-baseline-${timestamp}.json`;
    
    try {
      require('fs').writeFileSync(filename, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: this.summary,
        results: this.results,
        thresholds: THRESHOLDS
      }, null, 2));
      
      console.log(`📁 Results saved to: ${filename}`);
    } catch (error) {
      console.log('❌ Could not save results file:', error.message);
    }
  }
}

// Run the performance test
if (require.main === module) {
  const test = new PerformanceTest();
  test.runAllTests().catch(console.error);
}

module.exports = PerformanceTest;