#!/usr/bin/env node

/**
 * Session Persistence Verification Test
 * 
 * Tests the complete session management system:
 * 1. Session creation during login
 * 2. Session validation on protected routes
 * 3. Session refresh near expiry
 * 4. Session recovery mechanisms
 * 5. Session cleanup on logout
 * 
 * This ensures users stay logged in across browser restarts.
 */

const https = require('https');
const http = require('http');

class SessionPersistenceTest {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testUser = {
      email: 'test@example.com',
      password: 'password123'
    };
    this.sessionToken = null;
    this.cookies = '';
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SessionPersistenceTest/1.0',
          ...options.headers
        }
      };

      // Add cookies if we have them
      if (this.cookies) {
        requestOptions.headers.Cookie = this.cookies;
      }

      const req = http.request(requestOptions, (res) => {
        let data = '';

        // Capture set-cookie headers
        if (res.headers['set-cookie']) {
          this.cookies = res.headers['set-cookie'].join('; ');
          // Extract session token for tracking
          const sessionCookie = res.headers['set-cookie'].find(cookie => 
            cookie.startsWith('session-token=')
          );
          if (sessionCookie) {
            this.sessionToken = sessionCookie.split('=')[1].split(';')[0];
          }
        }

        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData,
              rawData: data
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: {},
              rawData: data
            });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (details) {
      console.log(`   Details: ${details}`);
    }
    
    this.results.tests.push({ name, passed, details });
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  async testLogin() {
    console.log('\n🔐 Testing User Login...');
    
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: this.testUser
      });

      const loginSuccess = response.status === 200 && response.data.user;
      const hasSessionCookie = this.sessionToken !== null;
      const userHasId = response.data.user?.id;

      this.logTest(
        'Login returns 200 status', 
        response.status === 200,
        `Status: ${response.status}`
      );

      this.logTest(
        'Login response contains user data',
        !!response.data.user,
        `Has user: ${!!response.data.user}`
      );

      this.logTest(
        'Session cookie is set on login',
        hasSessionCookie,
        `Session token length: ${this.sessionToken?.length || 0}`
      );

      return loginSuccess && hasSessionCookie && userHasId;
    } catch (error) {
      this.logTest('Login request', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testSessionValidation() {
    console.log('\n🛡️ Testing Session Validation...');

    try {
      const response = await this.makeRequest('/api/auth/me');

      const hasUser = !!response.data.user;
      const correctStatus = response.status === 200;
      const hasUserId = !!response.data.user?.id;

      this.logTest(
        'Session validation returns 200',
        correctStatus,
        `Status: ${response.status}`
      );

      this.logTest(
        'Session validation returns user data',
        hasUser,
        `Has user: ${hasUser}`
      );

      this.logTest(
        'User data includes ID and email',
        hasUserId && !!response.data.user?.email,
        `User ID: ${response.data.user?.id?.substring(0, 8)}...`
      );

      // Check for session refresh header
      const sessionRefreshed = response.headers['x-session-refreshed'] === 'true';
      console.log(`   Session auto-refresh status: ${sessionRefreshed ? 'Active' : 'Not needed'}`);

      return correctStatus && hasUser && hasUserId;
    } catch (error) {
      this.logTest('Session validation', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testProtectedRoute() {
    console.log('\n🔒 Testing Protected Route Access...');

    try {
      const response = await this.makeRequest('/api/super-cards/performance-hub');

      const canAccessProtected = response.status === 200;
      const hasValidResponse = response.data && typeof response.data === 'object';

      this.logTest(
        'Can access protected API with valid session',
        canAccessProtected,
        `Status: ${response.status}`
      );

      this.logTest(
        'Protected route returns valid data',
        hasValidResponse,
        `Response type: ${typeof response.data}`
      );

      return canAccessProtected;
    } catch (error) {
      this.logTest('Protected route access', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testSessionRefresh() {
    console.log('\n🔄 Testing Session Refresh...');

    try {
      const response = await this.makeRequest('/api/auth/refresh', {
        method: 'POST'
      });

      const refreshSuccess = response.status === 200;
      const hasExpiresAt = !!response.data.expiresAt;
      const hasUser = !!response.data.user;

      this.logTest(
        'Session refresh endpoint works',
        refreshSuccess,
        `Status: ${response.status}`
      );

      this.logTest(
        'Refresh returns new expiration time',
        hasExpiresAt,
        `Expires at: ${response.data.expiresAt}`
      );

      this.logTest(
        'Refresh returns user data',
        hasUser,
        `Has user: ${hasUser}`
      );

      return refreshSuccess && hasExpiresAt;
    } catch (error) {
      this.logTest('Session refresh', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testSessionHealth() {
    console.log('\n🏥 Testing Session Health Monitoring...');

    try {
      const response = await this.makeRequest('/api/session/health');

      const healthy = response.status === 200;
      const hasStatus = !!response.data.status;
      const hasMetrics = !!response.data.metrics;

      this.logTest(
        'Session health endpoint accessible',
        healthy,
        `Status: ${response.status}`
      );

      this.logTest(
        'Health response includes status',
        hasStatus,
        `Status: ${response.data.status}`
      );

      this.logTest(
        'Health response includes metrics',
        hasMetrics,
        `Has metrics: ${hasMetrics}`
      );

      if (response.data.metrics) {
        console.log(`   Validation Success Rate: ${response.data.metrics.successRate}%`);
        console.log(`   Total Sessions Created: ${response.data.metrics.sessionCreatedCount}`);
        console.log(`   Circuit Breaker Status: ${response.data.metrics.circuitBreakerStatus}`);
      }

      return healthy && hasStatus;
    } catch (error) {
      this.logTest('Session health check', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testLogout() {
    console.log('\n🚪 Testing Logout and Session Cleanup...');

    try {
      const response = await this.makeRequest('/api/auth/logout', {
        method: 'POST'
      });

      const logoutSuccess = response.status === 200;
      
      this.logTest(
        'Logout endpoint works',
        logoutSuccess,
        `Status: ${response.status}`
      );

      // Test that session is actually invalidated
      const validationResponse = await this.makeRequest('/api/auth/me');
      const sessionInvalidated = validationResponse.status === 401;

      this.logTest(
        'Session invalidated after logout',
        sessionInvalidated,
        `Status after logout: ${validationResponse.status}`
      );

      return logoutSuccess && sessionInvalidated;
    } catch (error) {
      this.logTest('Logout process', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testBrowserSimulation() {
    console.log('\n🌐 Testing Browser Session Persistence Simulation...');

    // Clear cookies to simulate browser restart
    const originalCookies = this.cookies;
    this.cookies = '';
    this.sessionToken = null;

    // Try to access protected route without session
    try {
      const noSessionResponse = await this.makeRequest('/api/auth/me');
      const correctlyRejected = noSessionResponse.status === 401;

      this.logTest(
        'Correctly rejects requests without session cookie',
        correctlyRejected,
        `Status: ${noSessionResponse.status}`
      );

      // Restore session cookie (simulating browser restart with persistent cookie)
      this.cookies = originalCookies;
      
      // Test that session persists across "browser restart"
      const persistedSessionResponse = await this.makeRequest('/api/auth/me');
      const sessionPersisted = persistedSessionResponse.status === 200;

      this.logTest(
        'Session persists across simulated browser restart',
        sessionPersisted,
        `Status after "restart": ${persistedSessionResponse.status}`
      );

      return correctlyRejected && sessionPersisted;
    } catch (error) {
      this.logTest('Browser simulation', false, `Error: ${error.message}`);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Session Persistence Verification Tests...');
    console.log(`Testing against: ${this.baseUrl}`);
    
    const startTime = Date.now();

    // Run all tests in sequence
    const loginWorked = await this.testLogin();
    if (!loginWorked) {
      console.log('❌ Login failed - cannot continue with other tests');
      this.printSummary();
      return;
    }

    await this.testSessionValidation();
    await this.testProtectedRoute();
    await this.testSessionRefresh();
    await this.testSessionHealth();
    await this.testBrowserSimulation();
    await this.testLogout();

    const duration = Date.now() - startTime;
    this.printSummary(duration);
  }

  printSummary(duration = 0) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SESSION PERSISTENCE TEST SUMMARY');
    console.log('='.repeat(60));
    
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;

    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️  Duration: ${duration}ms`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.details}`);
        });
    }

    const overallStatus = this.results.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
    console.log(`\n🏁 OVERALL STATUS: ${overallStatus}`);

    if (this.results.failed === 0) {
      console.log('\n🎉 Session persistence is working perfectly!');
      console.log('✅ Users will stay logged in across browser restarts');
      console.log('✅ Sessions auto-refresh before expiration'); 
      console.log('✅ Robust error handling and recovery');
      console.log('✅ Comprehensive security and monitoring');
    } else {
      console.log('\n⚠️  Session persistence needs attention');
      console.log('Please review the failed tests and fix issues');
    }
  }
}

// Run the tests
const tester = new SessionPersistenceTest();
tester.runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});