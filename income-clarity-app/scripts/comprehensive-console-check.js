#!/usr/bin/env node

/**
 * COMPREHENSIVE CONSOLE ERROR CHECK
 * Tests all routes systematically with optimized performance
 */

const { chromium } = require('playwright');

// All application routes organized by category
const ALL_ROUTES = {
  public: [
    '/',
    '/login',
    '/auth/login', 
    '/auth/signup',
    '/signup',
    '/pricing'
  ],
  dashboard: [
    '/dashboard',
    '/dashboard/super-cards',
    '/dashboard/unified',
    '/dashboard/super-cards-unified',
    '/dashboard/super-cards-simple'
  ],
  superCards: [
    '/dashboard/super-cards/performance-hub',
    '/dashboard/super-cards/income-intelligence',
    '/dashboard/super-cards/income-intelligence-hub',
    '/dashboard/super-cards/tax-strategy',
    '/dashboard/super-cards/tax-strategy-hub', 
    '/dashboard/super-cards/portfolio-strategy',
    '/dashboard/super-cards/portfolio-strategy-hub',
    '/dashboard/super-cards/financial-planning',
    '/dashboard/super-cards/financial-planning-hub'
  ],
  features: [
    '/portfolio',
    '/portfolio/import',
    '/income',
    '/expenses',
    '/analytics',
    '/transactions'
  ],
  settings: [
    '/settings',
    '/settings/billing',
    '/profile'
  ],
  other: [
    '/onboarding',
    '/admin/monitoring',
    '/debug/auth',
    '/demo',
    '/test'
  ]
};

class ComprehensiveConsoleCheck {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.results = {};
    this.baseUrl = 'http://localhost:3000';
    this.totalTested = 0;
    this.totalPassed = 0;
  }

  async run() {
    console.log('🔍 COMPREHENSIVE CONSOLE ERROR CHECK - Starting...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up console listeners
    this.setupConsoleListeners(page);

    // Test public routes
    await this.testRouteCategory(page, 'Public Routes', ALL_ROUTES.public, false);

    // Login for authenticated routes
    console.log('🔐 Logging in for authenticated routes...');
    await this.login(page);

    // Test all authenticated route categories
    await this.testRouteCategory(page, 'Dashboard Routes', ALL_ROUTES.dashboard, true);
    await this.testRouteCategory(page, 'Super Cards', ALL_ROUTES.superCards, true);
    await this.testRouteCategory(page, 'Feature Pages', ALL_ROUTES.features, true);
    await this.testRouteCategory(page, 'Settings Pages', ALL_ROUTES.settings, true);
    await this.testRouteCategory(page, 'Other Pages', ALL_ROUTES.other, true);

    await browser.close();
    this.generateReport();
  }

  setupConsoleListeners(page) {
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const url = page.url();
      
      if (type === 'error') {
        this.errors.push({ 
          type: 'console_error', 
          message: text, 
          url, 
          route: this.getRouteFromUrl(url),
          timestamp: new Date().toISOString() 
        });
      } else if (type === 'warn' && !this.isIgnorableWarning(text)) {
        this.warnings.push({ 
          type: 'console_warning', 
          message: text, 
          url, 
          route: this.getRouteFromUrl(url),
          timestamp: new Date().toISOString() 
        });
      }
    });

    page.on('pageerror', (error) => {
      this.errors.push({
        type: 'uncaught_exception',
        message: error.message,
        stack: error.stack,
        url: page.url(),
        route: this.getRouteFromUrl(page.url()),
        timestamp: new Date().toISOString()
      });
    });

    page.on('requestfailed', (request) => {
      // Only log critical request failures (not 404s for optional assets)
      if (this.isCriticalRequestFailure(request)) {
        this.errors.push({
          type: 'request_failed',
          message: `Failed to load: ${request.url()}`,
          failure: request.failure()?.errorText,
          url: page.url(),
          route: this.getRouteFromUrl(page.url()),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async testRouteCategory(page, categoryName, routes, authenticated) {
    console.log(`\n📍 Testing ${categoryName}...`);
    this.results[categoryName] = { total: routes.length, passed: 0, failed: 0, errors: [] };
    
    for (const route of routes) {
      await this.testSingleRoute(page, route, categoryName);
    }
  }

  async testSingleRoute(page, route, category) {
    const beforeErrors = this.errors.length;
    const beforeWarnings = this.warnings.length;
    
    try {
      console.log(`   Testing: ${route}`);
      this.totalTested++;
      
      const fullUrl = this.baseUrl + route;
      
      await page.goto(fullUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 8000 
      });
      
      // Wait for JavaScript errors to surface
      await page.waitForTimeout(1200);
      
      const routeErrors = this.errors.length - beforeErrors;
      const routeWarnings = this.warnings.length - beforeWarnings;
      
      if (routeErrors === 0) {
        console.log(`   ✅ ${route} - No errors`);
        this.results[category].passed++;
        this.totalPassed++;
      } else {
        console.log(`   ❌ ${route} - ${routeErrors} error(s)`);
        this.results[category].failed++;
        this.results[category].errors.push(...this.errors.slice(beforeErrors));
      }
      
      if (routeWarnings > 0) {
        console.log(`   ⚠️  ${route} - ${routeWarnings} warning(s)`);
      }
      
    } catch (error) {
      console.log(`   💥 ${route} - Failed to load: ${error.message}`);
      this.results[category].failed++;
    }
  }

  async login(page) {
    try {
      await page.goto(this.baseUrl + '/auth/login', { timeout: 8000 });
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
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
      'future version',
      'Download the React DevTools',
      'Consider adding an error boundary'
    ];
    return ignorablePatterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  isCriticalRequestFailure(request) {
    const url = request.url();
    const failure = request.failure()?.errorText || '';
    
    // Ignore common non-critical failures
    const ignorablePatterns = [
      'favicon.ico',
      '.map',
      '/sw.js',
      'manifest.json'
    ];
    
    return !ignorablePatterns.some(pattern => url.includes(pattern)) &&
           !failure.includes('net::ERR_ABORTED');
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 COMPREHENSIVE CONSOLE ERROR CHECK - FINAL REPORT');
    console.log('='.repeat(70));
    
    // Overall summary
    console.log(`📊 OVERALL SUMMARY:`);
    console.log(`   Total Routes Tested: ${this.totalTested}`);
    console.log(`   ✅ Passed: ${this.totalPassed}`);
    console.log(`   ❌ Failed: ${this.totalTested - this.totalPassed}`);
    console.log(`   🚨 Total Errors: ${this.errors.length}`);
    console.log(`   ⚠️  Total Warnings: ${this.warnings.length}`);
    console.log(`   📋 Status: ${this.errors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

    // Category breakdown
    console.log(`\n📂 CATEGORY BREAKDOWN:`);
    Object.keys(this.results).forEach(category => {
      const result = this.results[category];
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`   ${status} ${category}: ${result.passed}/${result.total} passed`);
    });

    // Error details
    if (this.errors.length > 0) {
      console.log(`\n🚨 ERROR DETAILS:`);
      console.log('-'.repeat(50));
      
      // Group errors by route
      const errorsByRoute = {};
      this.errors.forEach(error => {
        const route = error.route || 'unknown';
        if (!errorsByRoute[route]) errorsByRoute[route] = [];
        errorsByRoute[route].push(error);
      });
      
      Object.keys(errorsByRoute).forEach(route => {
        const routeErrors = errorsByRoute[route];
        console.log(`\n📍 Route: ${route} (${routeErrors.length} error(s))`);
        routeErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. [${error.type}] ${error.message}`);
          if (error.stack) {
            console.log(`      Stack: ${error.stack.split('\n')[0]}`);
          }
        });
      });
    }

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (this.errors.length === 0) {
      console.log('   🎉 Excellent! Zero console errors found across all pages.');
      console.log('   🔄 Continue running this check regularly during development.');
    } else {
      console.log('   🚨 CRITICAL: Fix all console errors before production.');
      console.log('   🔧 Focus on the routes with the most errors first.');
      console.log('   🧪 Re-run this test after each fix to verify resolution.');
    }

    if (this.warnings.length > 10) {
      console.log('   ⚠️  Consider addressing console warnings for cleaner output.');
    }

    console.log('='.repeat(70));

    // Exit with appropriate code
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Run the comprehensive check
if (require.main === module) {
  const checker = new ComprehensiveConsoleCheck();
  checker.run().catch(error => {
    console.error('💥 Comprehensive Console Check failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveConsoleCheck;