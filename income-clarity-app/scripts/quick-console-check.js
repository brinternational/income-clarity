#!/usr/bin/env node

/**
 * QUICK CONSOLE ERROR CHECK
 * Fast console error detection for immediate feedback
 */

const { chromium } = require('playwright');

// Priority routes to check first
const PRIORITY_ROUTES = [
  '/',
  '/auth/login',
  '/dashboard',
  '/dashboard/super-cards',
  '/dashboard/super-cards/performance-hub',
  '/dashboard/super-cards/income-intelligence',
  '/dashboard/super-cards/tax-strategy',
  '/dashboard/super-cards/portfolio-strategy',
  '/dashboard/super-cards/financial-planning'
];

class QuickConsoleCheck {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.baseUrl = 'http://localhost:3000';
  }

  async run() {
    console.log('🔍 QUICK CONSOLE ERROR CHECK - Starting...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up console listeners
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const url = page.url();
      
      if (type === 'error') {
        this.errors.push({ type: 'error', message: text, url, timestamp: new Date().toISOString() });
        console.log(`❌ ERROR on ${this.getRouteFromUrl(url)}: ${text}`);
      } else if (type === 'warn' && !this.isIgnorableWarning(text)) {
        this.warnings.push({ type: 'warning', message: text, url, timestamp: new Date().toISOString() });
        console.log(`⚠️  WARNING on ${this.getRouteFromUrl(url)}: ${text}`);
      }
    });

    // Set up uncaught exception listeners
    page.on('pageerror', (error) => {
      this.errors.push({
        type: 'uncaught_exception',
        message: error.message,
        stack: error.stack,
        url: page.url(),
        timestamp: new Date().toISOString()
      });
      console.log(`💥 UNCAUGHT EXCEPTION on ${this.getRouteFromUrl(page.url())}: ${error.message}`);
    });

    // Test unauthenticated routes
    console.log('📍 Testing UNAUTHENTICATED routes...');
    for (const route of ['/', '/auth/login']) {
      await this.testRoute(page, route, false);
    }

    // Login
    console.log('\n🔐 Logging in...');
    await this.login(page);

    // Test authenticated routes
    console.log('📍 Testing AUTHENTICATED routes...');
    for (const route of PRIORITY_ROUTES.filter(r => r !== '/' && r !== '/auth/login')) {
      await this.testRoute(page, route, true);
    }

    await browser.close();
    this.printSummary();
  }

  async testRoute(page, route, authenticated) {
    try {
      const fullUrl = this.baseUrl + route;
      console.log(`   Testing: ${route}`);
      
      await page.goto(fullUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      // Brief wait for console errors to surface
      await page.waitForTimeout(1500);
      
    } catch (error) {
      console.log(`   ❌ Failed to load ${route}: ${error.message}`);
    }
  }

  async login(page) {
    try {
      await page.goto(this.baseUrl + '/auth/login', { timeout: 10000 });
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForURL('**/dashboard**', { timeout: 10000 });
      console.log('   ✅ Successfully logged in');
      
    } catch (error) {
      console.log('   ❌ Login failed:', error.message);
      throw error;
    }
  }

  getRouteFromUrl(url) {
    try {
      return new URL(url).pathname;
    } catch (e) {
      return url;
    }
  }

  isIgnorableWarning(text) {
    const ignorablePatterns = [
      'React DevTools',
      'development mode',
      'error boundary',
      'deprecated',
      'future version'
    ];
    return ignorablePatterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🔍 QUICK CONSOLE CHECK - RESULTS');
    console.log('='.repeat(50));
    
    console.log(`🚨 Console Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`📋 Status: ${this.errors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORS FOUND:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${this.getRouteFromUrl(error.url)}`);
        console.log(`   ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n')[0]}`);
        }
      });
    }
    
    console.log('='.repeat(50));
    
    // Exit with error code if console errors found
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }
}

// Run the checker
if (require.main === module) {
  const checker = new QuickConsoleCheck();
  checker.run().catch(error => {
    console.error('💥 Quick Console Check failed:', error);
    process.exit(1);
  });
}

module.exports = QuickConsoleCheck;