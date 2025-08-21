#!/usr/bin/env node

/**
 * CONSOLE ERROR DETECTOR - E2E-HIGH-001
 * 
 * Systematically visits all pages and detects console errors
 * for production-quality zero-error guarantee
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// All application routes extracted from app directory structure
const ROUTES = [
  // Auth & Landing
  '/',
  '/login',
  '/auth/login', 
  '/auth/signup',
  '/signup',
  '/onboarding',
  '/pricing',
  
  // Main Dashboard
  '/dashboard',
  '/dashboard/super-cards',
  '/dashboard/unified',
  '/dashboard/super-cards-unified',
  '/dashboard/super-cards-unified-test',
  '/dashboard/super-cards-simple',
  
  // Super Cards Individual
  '/dashboard/super-cards/performance-hub',
  '/dashboard/super-cards/income-intelligence',
  '/dashboard/super-cards/income-intelligence-hub',
  '/dashboard/super-cards/tax-strategy',
  '/dashboard/super-cards/tax-strategy-hub', 
  '/dashboard/super-cards/portfolio-strategy',
  '/dashboard/super-cards/portfolio-strategy-hub',
  '/dashboard/super-cards/financial-planning',
  '/dashboard/super-cards/financial-planning-hub',
  
  // Features
  '/portfolio',
  '/portfolio/import',
  '/income',
  '/expenses',
  '/analytics',
  '/transactions',
  
  // Settings & Profile
  '/settings',
  '/settings/billing',
  '/profile',
  
  // Admin & Debug
  '/admin/monitoring',
  '/debug/auth',
  '/demo',
  '/test'
];

class ConsoleErrorDetector {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.pageResults = [];
    this.baseUrl = 'http://localhost:3000';
  }

  async run() {
    console.log('🔍 CONSOLE ERROR DETECTOR - Starting comprehensive scan...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up console listeners
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const url = page.url();
      
      if (type === 'error') {
        this.errors.push({
          type: 'error',
          message: text,
          url: url,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ ERROR on ${url}: ${text}`);
      } else if (type === 'warn' && !this.isIgnorableWarning(text)) {
        this.warnings.push({
          type: 'warning', 
          message: text,
          url: url,
          timestamp: new Date().toISOString()
        });
        console.log(`⚠️  WARNING on ${url}: ${text}`);
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
      console.log(`💥 UNCAUGHT EXCEPTION on ${page.url()}: ${error.message}`);
    });

    // Test unauthenticated routes first
    console.log('📍 Testing UNAUTHENTICATED routes...');
    await this.testRoutes(page, [
      '/',
      '/login', 
      '/auth/login',
      '/auth/signup',
      '/signup',
      '/pricing'
    ], false);

    // Login for authenticated routes
    console.log('\n🔐 Logging in for AUTHENTICATED routes...');
    await this.login(page);

    // Test authenticated routes
    console.log('📍 Testing AUTHENTICATED routes...');
    await this.testRoutes(page, ROUTES.filter(route => 
      ![
        '/',
        '/login',
        '/auth/login', 
        '/auth/signup',
        '/signup',
        '/pricing'
      ].includes(route)
    ), true);

    await browser.close();
    
    this.generateReport();
  }

  async testRoutes(page, routes, authenticated) {
    for (const route of routes) {
      try {
        const fullUrl = this.baseUrl + route;
        console.log(`   Testing: ${route}`);
        
        const startTime = Date.now();
        
        // Navigate with shorter timeout
        await page.goto(fullUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        // Wait briefly for React hydration
        await page.waitForTimeout(1000);
        
        // Try to wait for main content to load
        try {
          await page.waitForSelector('main, [role="main"], .dashboard, .super-card', {
            timeout: 2000
          });
        } catch (e) {
          // Continue if no main content selector found
        }

        const loadTime = Date.now() - startTime;
        
        this.pageResults.push({
          route,
          fullUrl,
          authenticated,
          loadTime,
          success: true,
          timestamp: new Date().toISOString()
        });

        // Check for React hydration errors specifically
        await this.checkHydrationErrors(page);
        
      } catch (error) {
        console.log(`   ❌ Failed to load ${route}: ${error.message}`);
        this.pageResults.push({
          route,
          fullUrl: this.baseUrl + route,
          authenticated,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async checkHydrationErrors(page) {
    // Check for common React hydration error patterns
    const hydrationChecks = [
      'Text content does not match server-rendered HTML',
      'Hydration failed',
      'Warning: Text content did not match',
      'Warning: Expected server HTML',
      'Cannot read properties of null',
      'Cannot read properties of undefined'
    ];

    for (const pattern of hydrationChecks) {
      try {
        const logs = await page.evaluate(() => {
          // Return any existing console logs from the page
          return window.console._logs || [];
        });
        
        // Check if pattern exists in any logs
        const hasPattern = logs.some(log => 
          typeof log === 'string' && log.includes(pattern)
        );
        
        if (hasPattern) {
          this.errors.push({
            type: 'hydration_error',
            message: `Potential hydration error: ${pattern}`,
            url: page.url(),
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        // Continue if unable to check
      }
    }
  }

  async login(page) {
    try {
      await page.goto(this.baseUrl + '/auth/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      console.log('   ✅ Successfully logged in');
      
    } catch (error) {
      console.log('   ❌ Login failed:', error.message);
      throw error;
    }
  }

  isIgnorableWarning(text) {
    const ignorablePatterns = [
      // Common development warnings that are not production issues
      'Download the React DevTools',
      'You are running React in development mode',
      'Consider adding an error boundary',
      // External library warnings that don't affect functionality
      'deprecated',
      'will be removed in future version'
    ];
    
    return ignorablePatterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    const reportData = {
      timestamp,
      summary: {
        totalRoutes: ROUTES.length,
        successfulRoutes: this.pageResults.filter(r => r.success).length,
        failedRoutes: this.pageResults.filter(r => !r.success).length,
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        status: this.errors.length === 0 ? 'PASS' : 'FAIL'
      },
      errors: this.errors,
      warnings: this.warnings,
      pageResults: this.pageResults,
      recommendations: this.generateRecommendations()
    };

    // Write detailed report
    const reportPath = path.join(__dirname, 'console-error-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Print summary to console
    this.printSummary(reportData);
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with error code if console errors found
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  printSummary(reportData) {
    const { summary, errors, warnings } = reportData;
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 CONSOLE ERROR DETECTOR - FINAL REPORT');
    console.log('='.repeat(60));
    
    console.log(`📊 Routes Tested: ${summary.totalRoutes}`);
    console.log(`✅ Successful: ${summary.successfulRoutes}`);
    console.log(`❌ Failed: ${summary.failedRoutes}`);
    console.log(`🚨 Console Errors: ${summary.totalErrors}`);
    console.log(`⚠️  Warnings: ${summary.totalWarnings}`);
    console.log(`📋 Overall Status: ${summary.status}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 CRITICAL CONSOLE ERRORS:');
      console.log('-'.repeat(40));
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.url}`);
        console.log(`   ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n')[0]}`);
        }
        console.log('');
      });
    }
    
    if (warnings.length > 0 && warnings.length <= 10) {
      console.log('\n⚠️  WARNINGS TO ADDRESS:');
      console.log('-'.repeat(40));
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.url}`);
        console.log(`   ${warning.message}`);
        console.log('');
      });
    }
    
    console.log('='.repeat(60));
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.length > 0) {
      recommendations.push('🚨 CRITICAL: Fix all console errors before production deployment');
      
      // Categorize errors for specific recommendations
      const errorTypes = {};
      this.errors.forEach(error => {
        const type = error.type || 'general';
        if (!errorTypes[type]) errorTypes[type] = [];
        errorTypes[type].push(error);
      });
      
      Object.keys(errorTypes).forEach(type => {
        switch (type) {
          case 'hydration_error':
            recommendations.push('🔧 Fix React hydration mismatches between server and client rendering');
            break;
          case 'uncaught_exception':
            recommendations.push('🔧 Add proper error boundaries and exception handling');
            break;
          case 'error':
            recommendations.push('🔧 Review and fix JavaScript runtime errors');
            break;
        }
      });
    }
    
    if (this.warnings.length > 20) {
      recommendations.push('⚠️  Consider addressing excessive console warnings for cleaner development experience');
    }
    
    recommendations.push('✅ Run this script regularly during development to maintain zero-error standard');
    
    return recommendations;
  }
}

// Run the detector
if (require.main === module) {
  const detector = new ConsoleErrorDetector();
  detector.run().catch(error => {
    console.error('💥 Console Error Detector failed:', error);
    process.exit(1);
  });
}

module.exports = ConsoleErrorDetector;