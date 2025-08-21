#!/usr/bin/env node
/**
 * Authenticated Performance Test
 * Tests all API endpoints with proper authentication to reveal real performance bottlenecks
 * Creates session-based requests to test actual data processing performance
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

// Define all authenticated API endpoints to test
const API_ENDPOINTS = [
  // Health check (no auth needed)
  { name: 'Health Check', url: '/api/health', method: 'GET', critical: true, needsAuth: false },
  
  // Super Cards APIs (Main dashboard data - these are the heavy ones)
  { name: 'Performance Hub', url: '/api/super-cards/performance-hub', method: 'GET', critical: true, needsAuth: true },
  { name: 'Income Hub', url: '/api/super-cards/income-hub', method: 'GET', critical: true, needsAuth: true },
  { name: 'Tax Strategy Hub', url: '/api/super-cards/tax-strategy-hub', method: 'GET', critical: true, needsAuth: true },
  { name: 'Portfolio Strategy Hub', url: '/api/super-cards/portfolio-strategy-hub', method: 'GET', critical: true, needsAuth: true },
  { name: 'Financial Planning Hub', url: '/api/super-cards/financial-planning-hub', method: 'GET', critical: true, needsAuth: true },
  
  // Portfolio endpoints
  { name: 'Portfolios List', url: '/api/portfolios', method: 'GET', critical: false, needsAuth: true },
  { name: 'Holdings List', url: '/api/holdings', method: 'GET', critical: false, needsAuth: true },
];

// Performance thresholds for authenticated endpoints (expected to be slower due to data processing)
const THRESHOLDS = {
  EXCELLENT: 200,   // <200ms
  GOOD: 500,       // <500ms  
  ACCEPTABLE: 1000, // <1s
  SLOW: 2000,      // <2s (our target to fix)
  VERY_SLOW: 5000  // <5s
};

class AuthenticatedPerformanceTest {
  constructor() {
    this.results = [];
    this.sessionCookie = null;
    this.authToken = null;
    this.summary = {
      total: 0,
      excellent: 0,
      good: 0,
      acceptable: 0,
      slow: 0,
      verySlow: 0,
      errors: 0,
      authFailures: 0
    };
  }

  async authenticate() {
    return new Promise((resolve, reject) => {
      console.log('🔐 Authenticating with test credentials...');
      
      const postData = JSON.stringify(TEST_CREDENTIALS);
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            // Extract session cookie from Set-Cookie header
            const cookies = res.headers['set-cookie'];
            if (cookies) {
              this.sessionCookie = cookies.map(cookie => cookie.split(';')[0]).join('; ');
            }
            
            // Try to extract auth token from response
            try {
              const responseData = JSON.parse(data);
              if (responseData.token) {
                this.authToken = responseData.token;
              }
            } catch (e) {
              // Response might not be JSON
            }
            
            console.log('✅ Authentication successful');
            console.log('🍪 Session cookie:', this.sessionCookie ? 'Set' : 'Not set');
            console.log('🎟️  Auth token:', this.authToken ? 'Set' : 'Not set');
            resolve(true);
          } else {
            console.log('❌ Authentication failed:', res.statusCode, data);
            reject(new Error(`Authentication failed: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        console.log('❌ Auth request error:', error.message);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  async testEndpoint(endpoint) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const url = `${BASE_URL}${endpoint.url}`;
      
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      
      const headers = {
        'User-Agent': 'Performance-Test/1.0'
      };
      
      // Add authentication headers if needed
      if (endpoint.needsAuth) {
        if (this.sessionCookie) {
          headers['Cookie'] = this.sessionCookie;
        }
        if (this.authToken) {
          headers['Authorization'] = `Bearer ${this.authToken}`;
        }
      }
      
      const request = http.request(url, {
        method: endpoint.method,
        headers: headers,
        timeout: 15000 // 15s timeout for heavy data processing
      }, (response) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        let data = '';
        response.on('data', chunk => data += chunk);
        
        response.on('end', () => {
          let parsedData = null;
          let dataComplexity = 'unknown';
          
          try {
            parsedData = JSON.parse(data);
            // Analyze data complexity
            dataComplexity = this.analyzeDataComplexity(parsedData);
          } catch (e) {
            // Not JSON or parsing error
          }
          
          const result = {
            name: endpoint.name,
            url: endpoint.url,
            method: endpoint.method,
            status: response.statusCode,
            duration: duration,
            critical: endpoint.critical,
            needsAuth: endpoint.needsAuth,
            success: response.statusCode === 200,
            responseSize: data.length,
            dataComplexity: dataComplexity,
            category: this.categorizePerformance(duration),
            isAuthFailure: endpoint.needsAuth && response.statusCode === 401
          };
          
          this.results.push(result);
          this.updateSummary(result);
          
          // Log result with detailed info
          const statusColor = result.success ? '\x1b[32m' : '\x1b[31m'; // Green/Red
          const perfColor = this.getPerformanceColor(duration);
          const authInfo = endpoint.needsAuth ? '🔐' : '🌐';
          console.log(`  ${authInfo} ${statusColor}Status: ${response.statusCode}\x1b[0m | ${perfColor}Time: ${duration}ms\x1b[0m | Size: ${data.length}b | Data: ${dataComplexity}`);
          
          // Log critical performance issues immediately
          if (duration > THRESHOLDS.SLOW && result.success) {
            console.log(`  🚨 SLOW RESPONSE DETECTED: ${duration}ms > ${THRESHOLDS.SLOW}ms threshold`);
          }
          
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
          needsAuth: endpoint.needsAuth,
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
          needsAuth: endpoint.needsAuth,
          success: false,
          error: 'Request timeout (>15s)',
          category: 'TIMEOUT'
        };
        
        this.results.push(result);
        this.summary.errors++;
        
        console.log(`  \x1b[31mTIMEOUT after ${duration}ms\x1b[0m`);
        resolve(result);
      });
      
      request.end();
    });
  }

  analyzeDataComplexity(data) {
    if (!data || typeof data !== 'object') return 'simple';
    
    let complexity = 'simple';
    let itemCount = 0;
    
    if (Array.isArray(data)) {
      itemCount = data.length;
      if (itemCount > 100) complexity = 'large-array';
      else if (itemCount > 10) complexity = 'medium-array';
      else complexity = 'small-array';
    } else if (typeof data === 'object') {
      const keys = Object.keys(data);
      itemCount = keys.length;
      
      // Check for nested complexity
      let hasNestedArrays = false;
      let hasNestedObjects = false;
      
      for (const key of keys.slice(0, 10)) { // Check first 10 keys
        const value = data[key];
        if (Array.isArray(value)) {
          hasNestedArrays = true;
          if (value.length > 50) {
            complexity = 'complex-nested';
            break;
          }
        } else if (typeof value === 'object' && value !== null) {
          hasNestedObjects = true;
        }
      }
      
      if (complexity !== 'complex-nested') {
        if (hasNestedArrays && hasNestedObjects) complexity = 'complex';
        else if (hasNestedArrays || hasNestedObjects) complexity = 'moderate';
        else if (itemCount > 20) complexity = 'large-object';
        else complexity = 'simple-object';
      }
    }
    
    return `${complexity} (${itemCount} items)`;
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
    } else if (result.isAuthFailure) {
      this.summary.authFailures++;
    }
  }

  async runAllTests() {
    console.log('\n🚀 Starting Authenticated Performance Test\n');
    console.log(`Testing ${API_ENDPOINTS.length} endpoints with authentication...\n`);

    try {
      // First, authenticate
      await this.authenticate();
    } catch (error) {
      console.log('❌ Authentication failed, testing without auth:', error.message);
    }

    // Test each endpoint
    for (const endpoint of API_ENDPOINTS) {
      await this.testEndpoint(endpoint);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUTHENTICATED PERFORMANCE REPORT');
    console.log('='.repeat(80));

    // Summary Statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log(`Total Successful Tests: ${this.summary.total}`);
    console.log(`Auth Failures: ${this.summary.authFailures}`);
    console.log(`Other Errors: ${this.summary.errors}`);
    console.log();
    console.log(`🟢 Excellent (<${THRESHOLDS.EXCELLENT}ms): ${this.summary.excellent}`);
    console.log(`🔵 Good (<${THRESHOLDS.GOOD}ms): ${this.summary.good}`);
    console.log(`🟡 Acceptable (<${THRESHOLDS.ACCEPTABLE}ms): ${this.summary.acceptable}`);
    console.log(`🟣 Slow (<${THRESHOLDS.SLOW}ms): ${this.summary.slow}`);
    console.log(`🔴 Very Slow (>${THRESHOLDS.SLOW}ms): ${this.summary.verySlow}`);

    // Critical Performance Issues - THE MAIN TARGET
    const slowEndpoints = this.results.filter(r => 
      r.success && r.duration > THRESHOLDS.SLOW
    );

    if (slowEndpoints.length > 0) {
      console.log('\n🎯 PERFORMANCE OPTIMIZATION TARGETS (>2s):');
      slowEndpoints.forEach(endpoint => {
        console.log(`  🐌 ${endpoint.name}: ${endpoint.duration}ms (${endpoint.dataComplexity})`);
      });
    } else {
      console.log('\n✅ No endpoints found with >2s response times!');
    }

    // Authentication Issues
    const authIssues = this.results.filter(r => r.isAuthFailure);
    if (authIssues.length > 0) {
      console.log('\n🔐 AUTHENTICATION ISSUES:');
      authIssues.forEach(issue => {
        console.log(`  ❌ ${issue.name}: Authentication failed (401)`);
      });
      console.log('\n💡 Note: Authentication issues prevent testing real data processing performance.');
    }

    // Detailed Results with Data Complexity Analysis
    console.log('\n📋 DETAILED RESULTS:');
    console.log('Name'.padEnd(25) + 'Status'.padEnd(8) + 'Time'.padEnd(10) + 'Category'.padEnd(12) + 'Data Complexity'.padEnd(20) + 'Auth');
    console.log('-'.repeat(90));
    
    this.results.forEach(result => {
      const name = result.name.padEnd(25);
      const status = String(result.status).padEnd(8);
      const time = `${result.duration}ms`.padEnd(10);
      const category = result.category.padEnd(12);
      const complexity = (result.dataComplexity || 'n/a').padEnd(20);
      const auth = result.needsAuth ? '🔐' : '🌐';
      
      console.log(`${name}${status}${time}${category}${complexity}${auth}`);
    });

    // Actionable Recommendations
    console.log('\n🔧 ACTIONABLE PERFORMANCE RECOMMENDATIONS:');
    
    if (slowEndpoints.length > 0) {
      console.log('\n  🎯 IMMEDIATE ACTIONS (Fix >2s endpoints):');
      slowEndpoints.forEach(endpoint => {
        console.log(`    - Optimize ${endpoint.name}: ${endpoint.duration}ms`);
        if (endpoint.dataComplexity.includes('large') || endpoint.dataComplexity.includes('complex')) {
          console.log(`      → Data complexity issue: ${endpoint.dataComplexity}`);
          console.log(`      → Consider: pagination, caching, query optimization`);
        }
      });
    }
    
    if (this.summary.authFailures > 0) {
      console.log('\n  🔐 AUTHENTICATION SETUP NEEDED:');
      console.log('    - Ensure test user exists: npm run setup-test-user');
      console.log('    - Fix session management for performance testing');
      console.log('    - Implement proper auth headers or session cookies');
    }

    // Redis Connection Issues (from previous observations)
    console.log('\n  ⚡ INFRASTRUCTURE OPTIMIZATIONS:');
    console.log('    - Install and configure Redis for caching');
    console.log('    - Fix Redis connection spam (every 500ms reconnection attempts)');
    console.log('    - Implement proper Redis fallback without performance penalty');
    console.log('    - Add response caching for expensive data calculations');

    if (this.summary.excellent < this.summary.total * 0.5) {
      console.log('\n  📈 GENERAL PERFORMANCE IMPROVEMENTS:');
      console.log('    - Database query optimization (add indexes, reduce N+1 queries)');
      console.log('    - Implement API response compression');
      console.log('    - Add pagination for large datasets');
      console.log('    - Consider implementing GraphQL for selective data loading');
      console.log('    - Add request/response size monitoring');
    }

    console.log('\n✅ Authenticated performance test complete!\n');
    
    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `authenticated-performance-${timestamp}.json`;
    
    try {
      require('fs').writeFileSync(filename, JSON.stringify({
        timestamp: new Date().toISOString(),
        testType: 'authenticated',
        authentication: {
          attempted: true,
          sessionCookie: !!this.sessionCookie,
          authToken: !!this.authToken
        },
        summary: this.summary,
        results: this.results,
        thresholds: THRESHOLDS,
        slowEndpoints: slowEndpoints,
        recommendations: {
          immediateActions: slowEndpoints.length,
          authIssues: this.summary.authFailures,
          infrastructureNeeded: ['Redis', 'Caching', 'Query Optimization']
        }
      }, null, 2));
      
      console.log(`📁 Detailed results saved to: ${filename}`);
    } catch (error) {
      console.log('❌ Could not save results file:', error.message);
    }
  }
}

// Run the authenticated performance test
if (require.main === module) {
  const test = new AuthenticatedPerformanceTest();
  test.runAllTests().catch(console.error);
}

module.exports = AuthenticatedPerformanceTest;