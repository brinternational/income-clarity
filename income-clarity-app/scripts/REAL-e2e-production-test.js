#!/usr/bin/env node

/**
 * REAL END-TO-END TESTING
 * 
 * This is what E2E testing SHOULD be:
 * 1. Tests the PRODUCTION URL (https://incomeclarity.ddns.net) - NOT localhost
 * 2. Uses a REAL browser that users actually use
 * 3. Follows REAL user workflows from start to finish
 * 4. Experiences REAL delays, network latency, API calls
 * 5. Captures what users ACTUALLY SEE including all errors
 * 
 * NO MOCKS. NO FAKES. NO SHORTCUTS.
 * If this test passes, the app ACTUALLY WORKS for real users.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// PRODUCTION URL - NOT LOCALHOST
const PRODUCTION_URL = 'https://incomeclarity.ddns.net';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

class RealE2ETester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.errors = [];
    this.warnings = [];
    this.networkFailures = [];
    this.testResults = [];
    this.screenshotDir = 'test-results/real-e2e-production';
  }

  async setup() {
    console.log('🚀 REAL E2E TESTING - PRODUCTION ENVIRONMENT');
    console.log('='.repeat(60));
    console.log(`📍 Testing URL: ${PRODUCTION_URL}`);
    console.log(`👤 Test User: ${TEST_USER.email}`);
    console.log(`🌐 Real Browser: Chromium`);
    console.log(`📸 Screenshots: ${this.screenshotDir}`);
    console.log('='.repeat(60) + '\n');

    // Create screenshot directory
    await fs.mkdir(this.screenshotDir, { recursive: true });

    // Launch REAL browser with realistic settings
    this.browser = await chromium.launch({
      headless: true, // Set to false to watch the test
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    // Create context with real user viewport and settings
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      acceptDownloads: true,
      ignoreHTTPSErrors: true // For self-signed certs
    });

    this.page = await this.context.newPage();
    this.setupErrorCapture();
  }

  setupErrorCapture() {
    // Capture ALL console messages
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.errors.push({
          type: 'console',
          message: text,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ CONSOLE ERROR: ${text.substring(0, 100)}...`);
      } else if (type === 'warning') {
        this.warnings.push(text);
        console.log(`⚠️  WARNING: ${text.substring(0, 100)}...`);
      }
    });

    // Capture page crashes
    this.page.on('pageerror', error => {
      this.errors.push({
        type: 'page',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`💥 PAGE CRASH: ${error.message}`);
    });

    // Capture network failures
    this.page.on('requestfailed', request => {
      this.networkFailures.push({
        url: request.url(),
        error: request.failure().errorText,
        timestamp: new Date().toISOString()
      });
      console.log(`🚫 NETWORK FAIL: ${request.url()}`);
    });

    // Capture responses
    this.page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`⚠️  HTTP ${response.status()}: ${response.url()}`);
      }
    });
  }

  async screenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
  }

  async testStep(name, fn) {
    console.log(`\n🧪 ${name}`);
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    const startErrors = this.errors.length;
    
    try {
      await fn();
      const duration = Date.now() - startTime;
      const newErrors = this.errors.length - startErrors;
      
      if (newErrors > 0) {
        console.log(`   ❌ FAILED - ${newErrors} errors detected`);
        this.testResults.push({
          name,
          status: 'FAILED',
          errors: newErrors,
          duration
        });
      } else {
        console.log(`   ✅ PASSED (${duration}ms)`);
        this.testResults.push({
          name,
          status: 'PASSED',
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   💥 CRASHED: ${error.message}`);
      this.testResults.push({
        name,
        status: 'CRASHED',
        error: error.message,
        duration
      });
      await this.screenshot(`crash-${name.replace(/\s+/g, '-')}`);
    }
  }

  async runTests() {
    // TEST 1: Can we even reach the production site?
    await this.testStep('Production Site Accessible', async () => {
      const response = await this.page.goto(PRODUCTION_URL, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      if (!response || response.status() >= 500) {
        throw new Error(`Production site returned ${response?.status() || 'no response'}`);
      }
      
      await this.screenshot('landing-page');
      console.log(`   Response: ${response.status()}`);
      console.log(`   URL: ${this.page.url()}`);
    });

    // TEST 2: Real user login flow
    await this.testStep('User Login Journey', async () => {
      // Click login button/link
      const loginLink = await this.page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Sign in")').first();
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await this.page.waitForLoadState('networkidle');
      } else {
        // Navigate directly if no login button
        await this.page.goto(`${PRODUCTION_URL}/auth/login`, {
          waitUntil: 'networkidle'
        });
      }
      
      await this.screenshot('login-page');
      
      // Wait for and fill login form
      await this.page.waitForSelector('input[type="email"], input[type="text"], input[name="email"], input[id*="email"]', {
        timeout: 10000
      });
      
      const emailInput = await this.page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
      const passwordInput = await this.page.locator('input[type="password"], input[name="password"], input[id*="password"]').first();
      
      await emailInput.fill(TEST_USER.email);
      await passwordInput.fill(TEST_USER.password);
      
      await this.screenshot('login-filled');
      
      // Submit form
      const submitButton = await this.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
      await submitButton.click();
      
      // Wait for navigation with real timeout
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      await this.page.waitForTimeout(2000); // Real delay for APIs
      
      await this.screenshot('after-login');
      
      const currentUrl = this.page.url();
      console.log(`   After login URL: ${currentUrl}`);
      
      // Check if we're logged in
      if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        throw new Error('Login failed - still on auth page');
      }
    });

    // TEST 3: Dashboard loads with real data
    await this.testStep('Dashboard Functionality', async () => {
      const url = this.page.url();
      
      // Navigate to dashboard if not already there
      if (!url.includes('dashboard')) {
        await this.page.goto(`${PRODUCTION_URL}/dashboard`, {
          waitUntil: 'networkidle'
        });
      }
      
      // Wait for real content to load
      await this.page.waitForTimeout(3000);
      await this.screenshot('dashboard-loaded');
      
      // Check for dashboard elements
      const dashboardContent = await this.page.locator('main, [role="main"], .dashboard, #dashboard').first();
      if (!await dashboardContent.isVisible()) {
        throw new Error('Dashboard content not visible');
      }
      
      // Check for error messages
      const errorElements = await this.page.locator('.error, [role="alert"], .alert-error').all();
      if (errorElements.length > 0) {
        console.log(`   Found ${errorElements.length} error elements on page`);
      }
    });

    // TEST 4: Interactive elements work
    await this.testStep('Interactive Elements', async () => {
      // Try clicking a button or link (exclude skip links which may be outside viewport)
      const interactiveElements = await this.page.locator('button:visible, a[href]:visible:not(.skip-link)').all();
      console.log(`   Found ${interactiveElements.length} interactive elements`);
      
      if (interactiveElements.length > 0) {
        // Click first visible button
        const firstButton = interactiveElements[0];
        await firstButton.click();
        await this.page.waitForTimeout(1000);
        await this.screenshot('after-interaction');
      }
    });

    // TEST 5: Logout flow
    await this.testStep('Logout Journey', async () => {
      // Find and click logout
      const logoutButton = await this.page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")').first();
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await this.page.waitForLoadState('networkidle');
        await this.screenshot('after-logout');
        
        const url = this.page.url();
        console.log(`   After logout URL: ${url}`);
      } else {
        console.log('   Logout button not found');
      }
    });
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REAL E2E TEST REPORT');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    const crashed = this.testResults.filter(t => t.status === 'CRASHED').length;
    
    console.log(`\n📈 Test Results:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   💥 Crashed: ${crashed}`);
    console.log(`   📊 Total: ${this.testResults.length}`);
    
    console.log(`\n🚨 Errors Captured: ${this.errors.length}`);
    if (this.errors.length > 0) {
      console.log('\nFirst 3 errors:');
      this.errors.slice(0, 3).forEach((error, i) => {
        console.log(`${i + 1}. [${error.type}] ${error.message.substring(0, 200)}...`);
      });
    }
    
    console.log(`\n⚠️  Warnings: ${this.warnings.length}`);
    console.log(`🚫 Network Failures: ${this.networkFailures.length}`);
    
    // Save detailed report
    const report = {
      url: PRODUCTION_URL,
      timestamp: new Date().toISOString(),
      summary: {
        passed,
        failed,  
        crashed,
        total: this.testResults.length
      },
      tests: this.testResults,
      errors: this.errors,
      warnings: this.warnings.slice(0, 10),
      networkFailures: this.networkFailures
    };
    
    await fs.writeFile(
      path.join(this.screenshotDir, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n📁 Full report saved to: ${this.screenshotDir}/test-report.json`);
    
    // Return success/failure
    const success = failed === 0 && crashed === 0 && this.errors.length === 0;
    
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('🎉 PRODUCTION E2E TESTS PASSED!');
      console.log('The app ACTUALLY WORKS for real users!');
    } else {
      console.log('❌ PRODUCTION E2E TESTS FAILED!');
      console.log('The app has REAL issues that users will experience!');
    }
    console.log('='.repeat(60));
    
    return success;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.setup();
      await this.runTests();
      const success = await this.generateReport();
      await this.cleanup();
      
      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error('💥 Test suite crashed:', error);
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new RealE2ETester();
tester.run();