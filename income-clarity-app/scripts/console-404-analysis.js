#!/usr/bin/env node

/**
 * Console 404 Resource Error Analysis Script
 * 
 * This script systematically visits all pages of the Income Clarity app
 * and captures detailed information about 404 resource errors in the console.
 * 
 * Usage: node scripts/console-404-analysis.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Define all pages to test
const PAGES_TO_TEST = [
  { name: 'Homepage', url: '/', requiresAuth: false },
  { name: 'Login', url: '/login', requiresAuth: false },
  { name: 'Signup', url: '/signup', requiresAuth: false },
  { name: 'Dashboard', url: '/dashboard', requiresAuth: true },
  { name: 'Super Cards Grid', url: '/dashboard/super-cards', requiresAuth: true },
  { name: 'Unified Dashboard', url: '/dashboard/unified', requiresAuth: true },
  { name: 'Performance Hub', url: '/dashboard/super-cards/performance-hub', requiresAuth: true },
  { name: 'Income Hub', url: '/dashboard/super-cards/income-intelligence-hub', requiresAuth: true },
  { name: 'Tax Strategy Hub', url: '/dashboard/super-cards/tax-strategy-hub', requiresAuth: true },
  { name: 'Portfolio Strategy Hub', url: '/dashboard/super-cards/portfolio-strategy-hub', requiresAuth: true },
  { name: 'Financial Planning Hub', url: '/dashboard/super-cards/financial-planning-hub', requiresAuth: true },
  { name: 'Settings', url: '/settings', requiresAuth: true },
  { name: 'Profile', url: '/profile', requiresAuth: true },
  { name: 'Onboarding', url: '/onboarding', requiresAuth: false },
  { name: 'Pricing', url: '/pricing', requiresAuth: false }
];

// Test credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

class Console404Analyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      totalPages: 0,
      totalErrors: 0,
      errorsByType: {},
      errorsByPage: {},
      consoleErrors: [],
      networkFailures: [],
      missingResources: [],
      fontIssues: [],
      recommendations: []
    };
  }

  async initialize() {
    console.log('🔍 Starting Console 404 Resource Error Analysis...\n');
    
    // Launch browser
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    this.page = await this.browser.newPage();
    
    // Set up console monitoring
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.results.consoleErrors.push({
          type: 'console_error',
          text: text,
          url: this.page.url(),
          timestamp: new Date().toISOString()
        });
        
        // Check for 404-related errors
        if (text.includes('404') || text.includes('Failed to load') || text.includes('net::ERR_')) {
          this.results.missingResources.push({
            type: '404_resource',
            error: text,
            url: this.page.url(),
            timestamp: new Date().toISOString()
          });
        }
      }
      
      if (type === 'warning' && text.includes('preloaded with link preload was not used')) {
        this.results.fontIssues.push({
          type: 'unused_preload',
          warning: text,
          url: this.page.url(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Monitor network failures
    this.page.on('requestfailed', request => {
      const failure = request.failure();
      this.results.networkFailures.push({
        method: request.method(),
        url: request.url(),
        errorText: failure?.errorText || 'Unknown error',
        page: this.page.url(),
        timestamp: new Date().toISOString()
      });
      
      // Track 404 specifically
      if (failure?.errorText?.includes('404') || request.url().includes('404')) {
        this.results.missingResources.push({
          type: 'network_404',
          resourceUrl: request.url(),
          error: failure?.errorText || '404 Not Found',
          page: this.page.url(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Monitor response errors (404s)
    this.page.on('response', response => {
      if (response.status() === 404) {
        this.results.missingResources.push({
          type: 'http_404',
          resourceUrl: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          page: this.page.url(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async performLogin() {
    console.log('🔐 Performing login for authenticated pages...');
    
    try {
      await this.page.goto(`${BASE_URL}/login`);
      await this.page.waitForLoadState('networkidle');
      
      // Fill login form
      const emailInput = this.page.locator('input[type="email"], input[name="email"]');
      const passwordInput = this.page.locator('input[type="password"], input[name="password"]');
      const loginButton = this.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      if (await emailInput.count() > 0) {
        await emailInput.fill(TEST_USER.email);
        await passwordInput.fill(TEST_USER.password);
        await loginButton.click();
        
        // Wait for navigation or error
        await this.page.waitForTimeout(2000);
        
        console.log('✅ Login attempt completed');
      } else {
        console.log('⚠️ Login form not found, may already be logged in');
      }
    } catch (error) {
      console.log(`⚠️ Login process warning: ${error.message}`);
    }
  }

  async analyzePage(pageInfo) {
    const { name, url, requiresAuth } = pageInfo;
    
    console.log(`📄 Analyzing: ${name} (${url})`);
    
    try {
      // Clear previous page errors
      const initialErrorCount = this.results.missingResources.length;
      
      // Navigate to page
      await this.page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle' });
      
      // Wait for page to load completely
      await this.page.waitForTimeout(3000);
      
      // Try to interact with the page to trigger any lazy-loaded resources
      await this.page.evaluate(() => {
        // Scroll to bottom to trigger lazy loading
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await this.page.waitForTimeout(1000);
      
      // Scroll back to top
      await this.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      await this.page.waitForTimeout(1000);
      
      // Count errors found on this page
      const errorsOnPage = this.results.missingResources.length - initialErrorCount;
      this.results.errorsByPage[name] = errorsOnPage;
      
      console.log(`   ✅ Completed (${errorsOnPage} errors found)`);
      
    } catch (error) {
      console.log(`   ❌ Error analyzing ${name}: ${error.message}`);
      this.results.errorsByPage[name] = 'analysis_failed';
    }
  }

  async runAnalysis() {
    await this.initialize();
    
    // Perform login first
    await this.performLogin();
    
    // Analyze each page
    for (const pageInfo of PAGES_TO_TEST) {
      await this.analyzePage(pageInfo);
      this.results.totalPages++;
    }
    
    // Process and categorize results
    this.processResults();
    
    // Generate report
    await this.generateReport();
    
    await this.browser.close();
  }

  processResults() {
    console.log('\n📊 Processing results...');
    
    // Count by error type
    for (const error of this.results.missingResources) {
      const type = error.type || 'unknown';
      this.results.errorsByType[type] = (this.results.errorsByType[type] || 0) + 1;
    }
    
    this.results.totalErrors = this.results.missingResources.length;
    
    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Font preload issues
    if (this.results.fontIssues.length > 0) {
      recommendations.push({
        type: 'font_preload',
        priority: 'medium',
        issue: `${this.results.fontIssues.length} font preload warnings detected`,
        solution: 'Review font preloading in Next.js configuration. Remove unnecessary preloads or fix font paths.',
        files: ['next.config.js', 'app/layout.tsx', 'public/fonts/']
      });
    }
    
    // 404 resources
    const http404s = this.results.missingResources.filter(r => r.type === 'http_404');
    if (http404s.length > 0) {
      recommendations.push({
        type: 'missing_resources',
        priority: 'high',
        issue: `${http404s.length} resources returning 404 errors`,
        solution: 'Check if files exist in public/ directory or if paths are correct',
        resources: http404s.map(r => r.resourceUrl)
      });
    }
    
    // Network failures
    if (this.results.networkFailures.length > 0) {
      recommendations.push({
        type: 'network_failures',
        priority: 'high',
        issue: `${this.results.networkFailures.length} network request failures`,
        solution: 'Review API endpoints and ensure all services are running',
        failures: this.results.networkFailures.map(f => `${f.method} ${f.url}`)
      });
    }
    
    this.results.recommendations = recommendations;
  }

  async generateReport() {
    console.log('\n📋 Generating detailed report...');
    
    const reportDir = path.join(__dirname, '..', 'test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // JSON report
    const jsonReport = path.join(reportDir, 'console-404-analysis.json');
    fs.writeFileSync(jsonReport, JSON.stringify(this.results, null, 2));
    
    // Markdown report
    const mdReport = path.join(reportDir, 'console-404-analysis.md');
    const markdownContent = this.generateMarkdownReport();
    fs.writeFileSync(mdReport, markdownContent);
    
    // Console summary
    this.printSummary();
    
    console.log(`\n📄 Reports generated:`);
    console.log(`   JSON: ${jsonReport}`);
    console.log(`   Markdown: ${mdReport}`);
  }

  generateMarkdownReport() {
    return `# Console 404 Resource Error Analysis Report

Generated: ${this.results.timestamp}

## Summary

- **Total Pages Analyzed**: ${this.results.totalPages}
- **Total 404 Errors**: ${this.results.totalErrors}
- **Console Errors**: ${this.results.consoleErrors.length}
- **Network Failures**: ${this.results.networkFailures.length}
- **Font Issues**: ${this.results.fontIssues.length}

## Errors by Type

${Object.entries(this.results.errorsByType).map(([type, count]) => `- **${type}**: ${count}`).join('\n')}

## Errors by Page

${Object.entries(this.results.errorsByPage).map(([page, count]) => `- **${page}**: ${count}`).join('\n')}

## Missing Resources

${this.results.missingResources.map(error => `
### ${error.type}
- **Resource**: ${error.resourceUrl || error.error}
- **Page**: ${error.page}
- **Time**: ${error.timestamp}
`).join('\n')}

## Font Issues

${this.results.fontIssues.map(issue => `
- **Warning**: ${issue.warning}
- **Page**: ${issue.url}
`).join('\n')}

## Recommendations

${this.results.recommendations.map(rec => `
### ${rec.type} (Priority: ${rec.priority})

**Issue**: ${rec.issue}

**Solution**: ${rec.solution}

${rec.files ? `**Files to check**: ${rec.files.join(', ')}` : ''}
${rec.resources ? `**Resources**: ${rec.resources.slice(0, 5).join(', ')}${rec.resources.length > 5 ? '...' : ''}` : ''}
${rec.failures ? `**Failures**: ${rec.failures.slice(0, 5).join(', ')}${rec.failures.length > 5 ? '...' : ''}` : ''}
`).join('\n')}

## Next Steps

1. Review and fix high-priority issues first
2. Check that all referenced files exist in the correct locations
3. Update font preloading configuration if needed
4. Re-run this analysis after fixes to validate improvements
`;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONSOLE 404 ERROR ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    console.log(`🏠 Pages Analyzed: ${this.results.totalPages}`);
    console.log(`❌ Total 404 Errors: ${this.results.totalErrors}`);
    console.log(`🚨 Console Errors: ${this.results.consoleErrors.length}`);
    console.log(`🔗 Network Failures: ${this.results.networkFailures.length}`);
    console.log(`🔤 Font Issues: ${this.results.fontIssues.length}`);
    
    if (this.results.totalErrors === 0) {
      console.log('\n🎉 EXCELLENT! No 404 resource errors found!');
    } else {
      console.log('\n⚠️ ISSUES DETECTED:');
      
      Object.entries(this.results.errorsByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
      
      console.log('\n🔧 Priority fixes needed:');
      this.results.recommendations
        .filter(r => r.priority === 'high')
        .forEach(rec => {
          console.log(`   📌 ${rec.issue}`);
        });
    }
    
    console.log('\n📋 Full report available in test-results/ directory');
    console.log('='.repeat(60));
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new Console404Analyzer();
  analyzer.runAnalysis().catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = Console404Analyzer;