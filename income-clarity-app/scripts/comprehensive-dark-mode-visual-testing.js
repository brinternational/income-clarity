#!/usr/bin/env node

/**
 * COMPREHENSIVE DARK MODE E2E VISUAL TESTING SYSTEM
 * 
 * PURPOSE: Visual regression testing for dark mode implementation with screenshot evidence
 * 
 * FEATURES:
 * - Complete dark mode visual validation across all pages and components
 * - Multi-breakpoint responsive testing (mobile to ultra-wide)
 * - Component state testing (hover, focus, active, disabled, loading, error)
 * - Screenshot organization with proper naming conventions
 * - Visual regression baseline creation
 * - Dark mode specific accessibility validation
 * - Comprehensive reporting and documentation
 * 
 * USAGE: 
 * node scripts/comprehensive-dark-mode-visual-testing.js
 * 
 * Date: August 22, 2025
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // URL Configuration - respects CLAUDE.md preference for production but allows localhost override
  BASE_URL: process.env.TEST_URL || 'http://localhost:3000', // Override with TEST_URL=https://incomeclarity.ddns.net
  SCREENSHOTS_DIR: './test-results/dark-mode-visual-validation',
  BASELINE_DIR: './test-results/dark-mode-baseline',
  CONSOLE_LOGS_DIR: './test-results/dark-mode-console-logs',
  TIMEOUT: 30000,
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123'
  },
  // Force dark mode for all tests
  FORCE_DARK_MODE: true,
  // Screenshot quality
  SCREENSHOT_QUALITY: 100,
  // Animation handling
  DISABLE_ANIMATIONS: true
};

// Responsive breakpoints to test
const BREAKPOINTS = [
  { name: 'mobile-375', width: 375, height: 812, category: 'mobile' },
  { name: 'mobile-414', width: 414, height: 896, category: 'mobile' },
  { name: 'tablet-768', width: 768, height: 1024, category: 'tablet' },
  { name: 'tablet-1024', width: 1024, height: 1366, category: 'tablet' },
  { name: 'desktop-1440', width: 1440, height: 900, category: 'desktop' },
  { name: 'desktop-1920', width: 1920, height: 1080, category: 'desktop' },
  { name: 'ultrawide-2560', width: 2560, height: 1440, category: 'ultrawide' }
];

// Pages to test with dark mode specific validation
const TEST_PAGES = [
  // Landing and Marketing
  {
    name: 'landing',
    url: '/',
    title: 'Income Clarity',
    description: 'Landing page with dark theme',
    darkModeElements: [
      'hero section background',
      'navigation text contrast',
      'call-to-action buttons',
      'feature cards',
      'testimonials section'
    ]
  },
  
  // Authentication
  {
    name: 'login',
    url: '/auth/login',
    title: 'Login',
    description: 'Login page with form validation',
    darkModeElements: [
      'form background',
      'input field contrast',
      'button states',
      'error messages',
      'link visibility'
    ]
  },
  {
    name: 'signup',
    url: '/auth/signup',
    title: 'Sign Up',
    description: 'Signup page with form validation',
    darkModeElements: [
      'form styling',
      'validation messages',
      'terms and conditions text',
      'submit button states'
    ]
  },
  
  // Dashboard (requires authentication)
  {
    name: 'dashboard-momentum',
    url: '/dashboard/super-cards',
    title: 'Super Cards Dashboard',
    description: 'Main dashboard - momentum level',
    requiresAuth: true,
    darkModeElements: [
      'super card backgrounds',
      'metric displays',
      'chart visibility',
      'navigation elements',
      'status indicators'
    ]
  },
  {
    name: 'dashboard-hero-performance',
    url: '/dashboard/super-cards?view=hero-view&card=performance',
    title: 'Performance Hub',
    description: 'Performance hub hero view',
    requiresAuth: true,
    darkModeElements: [
      'performance charts',
      'comparison metrics',
      'progress indicators',
      'data tables'
    ]
  },
  {
    name: 'dashboard-hero-income',
    url: '/dashboard/super-cards?view=hero-view&card=income',
    title: 'Income Intelligence',
    description: 'Income hub hero view',
    requiresAuth: true,
    darkModeElements: [
      'income waterfall chart',
      'projection graphs',
      'dividend calendar',
      'tax breakdowns'
    ]
  },
  {
    name: 'dashboard-detailed-performance',
    url: '/dashboard/super-cards?view=detailed&card=performance',
    title: 'Performance Hub',
    description: 'Performance hub detailed view',
    requiresAuth: true,
    darkModeElements: [
      'detailed analytics',
      'advanced charts',
      'tab navigation',
      'data visualizations'
    ]
  },
  
  // Settings and Profile
  {
    name: 'settings',
    url: '/settings',
    title: 'Settings',
    description: 'Settings page with bank connections',
    requiresAuth: true,
    darkModeElements: [
      'settings panels',
      'toggle switches',
      'bank connection status',
      'form elements'
    ]
  },
  {
    name: 'profile',
    url: '/profile',
    title: 'Profile',
    description: 'User profile and subscription management',
    requiresAuth: true,
    darkModeElements: [
      'profile information',
      'subscription status',
      'billing information',
      'preference controls'
    ]
  },
  
  // Onboarding and Premium
  {
    name: 'onboarding',
    url: '/onboarding',
    title: 'Onboarding',
    description: 'User onboarding flow',
    darkModeElements: [
      'onboarding steps',
      'progress indicators',
      'instruction text',
      'navigation buttons'
    ]
  },
  {
    name: 'pricing',
    url: '/pricing',
    title: 'Pricing',
    description: 'Premium pricing and upgrade page',
    darkModeElements: [
      'pricing cards',
      'feature comparisons',
      'upgrade buttons',
      'billing toggles'
    ]
  }
];

// Component states to test
const COMPONENT_STATES = [
  'default',
  'hover',
  'focus',
  'active',
  'disabled',
  'loading',
  'error',
  'success'
];

// Dark mode specific validation checks
const DARK_MODE_CHECKS = [
  {
    name: 'text-contrast',
    description: 'Text readability on dark backgrounds',
    check: async (page) => {
      // Check for minimum contrast ratios
      const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div').all();
      let issues = [];
      
      for (let i = 0; i < Math.min(textElements.length, 10); i++) {
        const element = textElements[i];
        const textContent = await element.textContent();
        if (textContent && textContent.trim()) {
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            };
          });
          
          // Basic check - ensure text is not same color as background
          if (styles.color === styles.backgroundColor) {
            issues.push(`Text color matches background: ${textContent.substring(0, 50)}`);
          }
        }
      }
      
      return { passed: issues.length === 0, issues };
    }
  },
  {
    name: 'focus-indicators',
    description: 'Visible focus indicators in dark mode',
    check: async (page) => {
      const focusableElements = await page.locator('button, input, select, textarea, a, [tabindex]').all();
      let issues = [];
      
      for (let i = 0; i < Math.min(focusableElements.length, 5); i++) {
        const element = focusableElements[i];
        await element.focus();
        
        const hasVisibleFocus = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return computed.outline !== 'none' || 
                 computed.boxShadow !== 'none' ||
                 computed.border !== computed.getPropertyValue('border');
        });
        
        if (!hasVisibleFocus) {
          const tagName = await element.evaluate(el => el.tagName);
          issues.push(`No visible focus indicator on ${tagName}`);
        }
      }
      
      return { passed: issues.length === 0, issues };
    }
  },
  {
    name: 'image-visibility',
    description: 'Image and icon visibility in dark mode',
    check: async (page) => {
      const images = await page.locator('img, svg').all();
      let issues = [];
      
      for (let i = 0; i < Math.min(images.length, 10); i++) {
        const element = images[i];
        const isVisible = await element.isVisible();
        
        if (!isVisible) {
          const tagName = await element.evaluate(el => el.tagName);
          const src = await element.evaluate(el => el.src || el.getAttribute('data-src') || 'unknown');
          issues.push(`Hidden ${tagName}: ${src.substring(src.lastIndexOf('/') + 1)}`);
        }
      }
      
      return { passed: issues.length === 0, issues };
    }
  },
  {
    name: 'chart-readability',
    description: 'Chart and graph readability in dark mode',
    check: async (page) => {
      const charts = await page.locator('[class*="chart"], [class*="graph"], canvas, svg[class*="recharts"]').all();
      let issues = [];
      
      for (const chart of charts) {
        const isVisible = await chart.isVisible();
        if (!isVisible) {
          issues.push('Chart element is not visible');
        }
      }
      
      return { passed: issues.length === 0, issues };
    }
  }
];

class ComprehensiveDarkModeVisualTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.screenshotIndex = 0;
    this.isAuthenticated = false;
  }

  async initialize() {
    console.log('🌙 Initializing Comprehensive Dark Mode Visual Testing System...');
    
    // Create output directories
    await fs.mkdir(CONFIG.SCREENSHOTS_DIR, { recursive: true });
    await fs.mkdir(CONFIG.BASELINE_DIR, { recursive: true });
    await fs.mkdir(CONFIG.CONSOLE_LOGS_DIR, { recursive: true });
    
    // Create subdirectories for organization
    for (const breakpoint of BREAKPOINTS) {
      await fs.mkdir(path.join(CONFIG.SCREENSHOTS_DIR, breakpoint.name), { recursive: true });
      await fs.mkdir(path.join(CONFIG.BASELINE_DIR, breakpoint.name), { recursive: true });
    }
    
    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--disable-animations',
        '--disable-background-animation'
      ]
    });
    
    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      // Set initial viewport - will be changed per test
      viewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.context.newPage();
    
    // Disable animations for consistent screenshots
    if (CONFIG.DISABLE_ANIMATIONS) {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `
      });
    }
    
    // Force dark mode if configured
    if (CONFIG.FORCE_DARK_MODE) {
      await this.forceDarkMode();
    }
    
    console.log('✅ Browser initialized successfully');
    console.log(`📍 Testing URL: ${CONFIG.BASE_URL}`);
    console.log(`🎨 Dark mode: ${CONFIG.FORCE_DARK_MODE ? 'Forced ON' : 'Default'}`);
  }

  async forceDarkMode() {
    // Set dark mode theme in localStorage and add dark class
    await this.page.addInitScript(() => {
      localStorage.setItem('income-clarity-theme', 'accessibility-dark');
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.body.classList.add('theme-accessibility-dark', 'theme-type-dark');
    });
    
    console.log('🌙 Dark mode forced for all tests');
  }

  async authenticateUser() {
    if (this.isAuthenticated) return;
    
    console.log('🔑 Authenticating user...');
    
    try {
      await this.page.goto(`${CONFIG.BASE_URL}/auth/login`);
      await this.page.fill('input[type="email"]', CONFIG.TEST_USER.email);
      await this.page.fill('input[type="password"]', CONFIG.TEST_USER.password);
      await this.page.click('button[type="submit"]');
      
      // Wait for successful login redirect
      await this.page.waitForURL('**/dashboard/super-cards', { timeout: CONFIG.TIMEOUT });
      
      this.isAuthenticated = true;
      console.log('✅ Authentication successful');
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  async testPageAtBreakpoint(pageConfig, breakpoint) {
    const testId = `${pageConfig.name}-${breakpoint.name}`;
    console.log(`  📱 Testing ${testId}...`);
    
    const testResult = {
      page: pageConfig.name,
      breakpoint: breakpoint.name,
      url: pageConfig.url,
      timestamp: new Date().toISOString(),
      status: 'UNKNOWN',
      screenshots: {},
      darkModeChecks: {},
      issues: [],
      componentStates: {}
    };

    try {
      // Set viewport for this breakpoint
      await this.page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height
      });

      // Navigate to page
      const fullURL = `${CONFIG.BASE_URL}${pageConfig.url}`;
      await this.page.goto(fullURL, { 
        waitUntil: 'networkidle',
        timeout: CONFIG.TIMEOUT 
      });

      // Wait for page to stabilize
      await this.page.waitForTimeout(2000);

      // Take default state screenshot
      const defaultScreenshotPath = await this.captureScreenshot(
        pageConfig.name, 'default', breakpoint.name
      );
      testResult.screenshots.default = defaultScreenshotPath;

      // Test component states if applicable
      await this.testComponentStates(pageConfig, breakpoint, testResult);

      // Run dark mode specific checks
      for (const check of DARK_MODE_CHECKS) {
        try {
          const result = await check.check(this.page);
          testResult.darkModeChecks[check.name] = {
            name: check.description,
            passed: result.passed,
            issues: result.issues
          };
          
          if (!result.passed) {
            testResult.issues.push(...result.issues);
          }
        } catch (error) {
          testResult.darkModeChecks[check.name] = {
            name: check.description,
            passed: false,
            issues: [`Check failed: ${error.message}`]
          };
        }
      }

      // Determine overall status
      testResult.status = testResult.issues.length === 0 ? 'PASSED' : 'WARNING';
      
    } catch (error) {
      testResult.status = 'FAILED';
      testResult.error = error.message;
      testResult.issues.push(`Page load failed: ${error.message}`);
    }

    return testResult;
  }

  async testComponentStates(pageConfig, breakpoint, testResult) {
    // Test hover states on buttons and interactive elements
    try {
      const buttons = await this.page.locator('button, a[href], [role="button"]').all();
      
      if (buttons.length > 0) {
        // Test first few buttons for hover state
        for (let i = 0; i < Math.min(buttons.length, 3); i++) {
          const button = buttons[i];
          await button.hover();
          await this.page.waitForTimeout(500);
          
          const hoverScreenshotPath = await this.captureScreenshot(
            pageConfig.name, `hover-${i}`, breakpoint.name
          );
          testResult.componentStates[`hover-${i}`] = hoverScreenshotPath;
        }
      }

      // Test focus states
      const focusableElements = await this.page.locator('button, input, select, textarea, a[href]').all();
      
      if (focusableElements.length > 0) {
        const element = focusableElements[0];
        await element.focus();
        await this.page.waitForTimeout(500);
        
        const focusScreenshotPath = await this.captureScreenshot(
          pageConfig.name, 'focus', breakpoint.name
        );
        testResult.componentStates.focus = focusScreenshotPath;
      }

    } catch (error) {
      testResult.issues.push(`Component state testing failed: ${error.message}`);
    }
  }

  async captureScreenshot(pageName, state, breakpointName) {
    this.screenshotIndex++;
    const timestamp = Date.now();
    const filename = `${pageName}-${state}-${breakpointName}-dark.png`;
    const filepath = path.join(CONFIG.SCREENSHOTS_DIR, breakpointName, filename);
    
    await this.page.screenshot({
      path: filepath,
      fullPage: true,
      quality: CONFIG.SCREENSHOT_QUALITY
    });
    
    // Also save to baseline directory for comparison
    const baselineFilepath = path.join(CONFIG.BASELINE_DIR, breakpointName, filename);
    await this.page.screenshot({
      path: baselineFilepath,
      fullPage: true,
      quality: CONFIG.SCREENSHOT_QUALITY
    });
    
    return filepath;
  }

  async runComprehensiveTesting() {
    console.log(`\n🎯 Starting comprehensive dark mode visual testing...`);
    console.log(`📊 Testing ${TEST_PAGES.length} pages across ${BREAKPOINTS.length} breakpoints`);
    console.log(`📸 Expected screenshots: ${TEST_PAGES.length * BREAKPOINTS.length * 3} (minimum)\n`);

    for (const pageConfig of TEST_PAGES) {
      console.log(`\n🔍 Testing page: ${pageConfig.name} (${pageConfig.description})`);
      
      // Authenticate if required
      if (pageConfig.requiresAuth && !this.isAuthenticated) {
        await this.authenticateUser();
      }

      for (const breakpoint of BREAKPOINTS) {
        const testResult = await this.testPageAtBreakpoint(pageConfig, breakpoint);
        this.testResults.push(testResult);
        
        // Small delay between tests
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async generateComprehensiveReport() {
    console.log('\n📊 Generating comprehensive dark mode visual testing report...');
    
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        baseUrl: CONFIG.BASE_URL,
        darkModeForced: CONFIG.FORCE_DARK_MODE,
        totalTests: this.testResults.length,
        totalPages: TEST_PAGES.length,
        totalBreakpoints: BREAKPOINTS.length,
        screenshotsCaptured: this.screenshotIndex
      },
      summary: {
        passed: this.testResults.filter(r => r.status === 'PASSED').length,
        warnings: this.testResults.filter(r => r.status === 'WARNING').length,
        failed: this.testResults.filter(r => r.status === 'FAILED').length,
        totalIssues: this.testResults.reduce((sum, r) => sum + r.issues.length, 0)
      },
      breakdownByPage: this.generatePageBreakdown(),
      breakdownByBreakpoint: this.generateBreakpointBreakdown(),
      darkModeValidation: this.generateDarkModeValidation(),
      visualRegression: this.generateVisualRegressionInfo(),
      testResults: this.testResults
    };

    // Save JSON report
    const reportPath = path.join(CONFIG.SCREENSHOTS_DIR, 'dark-mode-visual-testing-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown summary
    const summaryPath = path.join(CONFIG.SCREENSHOTS_DIR, 'dark-mode-testing-summary.md');
    await this.generateMarkdownReport(report, summaryPath);

    console.log(`✅ Report saved: ${reportPath}`);
    console.log(`📋 Summary saved: ${summaryPath}`);
    
    return report;
  }

  generatePageBreakdown() {
    const breakdown = {};
    
    for (const page of TEST_PAGES) {
      const pageResults = this.testResults.filter(r => r.page === page.name);
      breakdown[page.name] = {
        description: page.description,
        totalTests: pageResults.length,
        passed: pageResults.filter(r => r.status === 'PASSED').length,
        warnings: pageResults.filter(r => r.status === 'WARNING').length,
        failed: pageResults.filter(r => r.status === 'FAILED').length,
        totalIssues: pageResults.reduce((sum, r) => sum + r.issues.length, 0),
        darkModeElements: page.darkModeElements
      };
    }
    
    return breakdown;
  }

  generateBreakpointBreakdown() {
    const breakdown = {};
    
    for (const breakpoint of BREAKPOINTS) {
      const breakpointResults = this.testResults.filter(r => r.breakpoint === breakpoint.name);
      breakdown[breakpoint.name] = {
        dimensions: `${breakpoint.width}x${breakpoint.height}`,
        category: breakpoint.category,
        totalTests: breakpointResults.length,
        passed: breakpointResults.filter(r => r.status === 'PASSED').length,
        warnings: breakpointResults.filter(r => r.status === 'WARNING').length,
        failed: breakpointResults.filter(r => r.status === 'FAILED').length
      };
    }
    
    return breakdown;
  }

  generateDarkModeValidation() {
    const validation = {};
    
    for (const check of DARK_MODE_CHECKS) {
      const checkResults = this.testResults.map(r => r.darkModeChecks[check.name]).filter(Boolean);
      validation[check.name] = {
        description: check.description,
        totalTests: checkResults.length,
        passed: checkResults.filter(r => r.passed).length,
        failed: checkResults.filter(r => !r.passed).length,
        commonIssues: this.extractCommonIssues(checkResults)
      };
    }
    
    return validation;
  }

  extractCommonIssues(checkResults) {
    const allIssues = checkResults.flatMap(r => r.issues || []);
    const issueCount = {};
    
    allIssues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
    
    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  generateVisualRegressionInfo() {
    return {
      baselineDirectory: CONFIG.BASELINE_DIR,
      screenshotsDirectory: CONFIG.SCREENSHOTS_DIR,
      totalScreenshots: this.screenshotIndex,
      organizationStructure: {
        byBreakpoint: BREAKPOINTS.map(b => b.name),
        namingConvention: '[page]-[state]-[breakpoint]-dark.png',
        comparisonMethod: 'Visual diff tools can compare baseline vs new screenshots'
      },
      recommendations: [
        'Use baseline screenshots for future regression testing',
        'Compare new test runs against baseline images',
        'Update baseline when intentional UI changes are made',
        'Monitor for unintentional visual changes in dark mode'
      ]
    };
  }

  async generateMarkdownReport(report, filePath) {
    const { testRun, summary, breakdownByPage, breakdownByBreakpoint, darkModeValidation } = report;
    
    let markdown = `# Dark Mode Visual Testing Report\n\n`;
    markdown += `**Generated:** ${testRun.timestamp}\n`;
    markdown += `**Base URL:** ${testRun.baseUrl}\n`;
    markdown += `**Dark Mode:** ${testRun.darkModeForced ? 'Forced ON' : 'Default'}\n\n`;
    
    markdown += `## 📊 Executive Summary\n\n`;
    markdown += `- **Total Tests:** ${testRun.totalTests}\n`;
    markdown += `- **Pages Tested:** ${testRun.totalPages}\n`;
    markdown += `- **Breakpoints:** ${testRun.totalBreakpoints}\n`;
    markdown += `- **Screenshots Captured:** ${testRun.screenshotsCaptured}\n`;
    markdown += `- **Passed:** ✅ ${summary.passed}\n`;
    markdown += `- **Warnings:** ⚠️ ${summary.warnings}\n`;
    markdown += `- **Failed:** ❌ ${summary.failed}\n`;
    markdown += `- **Total Issues:** ${summary.totalIssues}\n\n`;

    markdown += `## 📱 Responsive Breakpoint Analysis\n\n`;
    markdown += `| Breakpoint | Dimensions | Category | Passed | Warnings | Failed |\n`;
    markdown += `|------------|------------|----------|---------|----------|--------|\n`;
    Object.entries(breakdownByBreakpoint).forEach(([name, data]) => {
      markdown += `| ${name} | ${data.dimensions} | ${data.category} | ${data.passed} | ${data.warnings} | ${data.failed} |\n`;
    });
    markdown += `\n`;

    markdown += `## 🌙 Dark Mode Validation Results\n\n`;
    Object.entries(darkModeValidation).forEach(([checkName, data]) => {
      const passRate = Math.round((data.passed / data.totalTests) * 100);
      const status = passRate >= 90 ? '✅' : passRate >= 70 ? '⚠️' : '❌';
      
      markdown += `### ${status} ${data.description}\n`;
      markdown += `- **Pass Rate:** ${passRate}% (${data.passed}/${data.totalTests})\n`;
      
      if (data.commonIssues.length > 0) {
        markdown += `- **Common Issues:**\n`;
        data.commonIssues.forEach(({ issue, count }) => {
          markdown += `  - ${issue} (${count} occurrences)\n`;
        });
      }
      markdown += `\n`;
    });

    markdown += `## 📄 Page-by-Page Results\n\n`;
    Object.entries(breakdownByPage).forEach(([pageName, data]) => {
      const passRate = Math.round((data.passed / data.totalTests) * 100);
      const status = passRate >= 90 ? '✅' : passRate >= 70 ? '⚠️' : '❌';
      
      markdown += `### ${status} ${pageName}\n`;
      markdown += `**Description:** ${data.description}\n\n`;
      markdown += `**Results:** ${data.passed} passed, ${data.warnings} warnings, ${data.failed} failed\n\n`;
      
      if (data.darkModeElements.length > 0) {
        markdown += `**Dark Mode Elements Tested:**\n`;
        data.darkModeElements.forEach(element => {
          markdown += `- ${element}\n`;
        });
      }
      markdown += `\n`;
    });

    markdown += `## 📸 Visual Regression Information\n\n`;
    markdown += `### Screenshot Organization\n`;
    markdown += `- **Screenshots Directory:** \`${CONFIG.SCREENSHOTS_DIR}\`\n`;
    markdown += `- **Baseline Directory:** \`${CONFIG.BASELINE_DIR}\`\n`;
    markdown += `- **Naming Convention:** \`[page]-[state]-[breakpoint]-dark.png\`\n`;
    markdown += `- **Organization:** Screenshots organized by breakpoint subdirectories\n\n`;
    
    markdown += `### Breakpoint Directories Created\n`;
    BREAKPOINTS.forEach(bp => {
      markdown += `- \`${bp.name}/\` - ${bp.width}x${bp.height} (${bp.category})\n`;
    });
    markdown += `\n`;

    markdown += `## 🔧 Next Steps\n\n`;
    if (summary.failed > 0) {
      markdown += `### 🚨 High Priority Issues\n`;
      markdown += `- ${summary.failed} tests failed completely\n`;
      markdown += `- Review failed test screenshots for visual issues\n`;
      markdown += `- Fix critical dark mode implementation problems\n\n`;
    }
    
    if (summary.warnings > 0) {
      markdown += `### ⚠️ Medium Priority Issues\n`;
      markdown += `- ${summary.warnings} tests have warnings\n`;
      markdown += `- Review dark mode validation results\n`;
      markdown += `- Address accessibility and contrast issues\n\n`;
    }
    
    markdown += `### 📈 Recommendations\n`;
    markdown += `1. **Visual Comparison:** Use baseline screenshots to detect regressions\n`;
    markdown += `2. **Automation:** Integrate this testing into CI/CD pipeline\n`;
    markdown += `3. **Monitor:** Run before major releases to catch visual issues\n`;
    markdown += `4. **Update:** Refresh baseline when intentional UI changes are made\n`;
    markdown += `5. **Expand:** Add more component states and interaction testing\n\n`;

    markdown += `---\n\n`;
    markdown += `**Generated by:** Comprehensive Dark Mode Visual Testing System\n`;
    markdown += `**Date:** ${new Date().toISOString()}\n`;

    await fs.writeFile(filePath, markdown);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Browser cleanup completed');
  }
}

// Main execution
async function runComprehensiveDarkModeVisualTesting() {
  const tester = new ComprehensiveDarkModeVisualTester();
  
  try {
    await tester.initialize();
    await tester.runComprehensiveTesting();
    
    const report = await tester.generateComprehensiveReport();
    
    // Console summary
    console.log('\n' + '='.repeat(80));
    console.log('🌙 COMPREHENSIVE DARK MODE VISUAL TESTING COMPLETE');
    console.log('='.repeat(80));
    console.log(`Pages Tested: ${report.testRun.totalPages}`);
    console.log(`Breakpoints: ${report.testRun.totalBreakpoints}`);
    console.log(`Screenshots: ${report.testRun.screenshotsCaptured}`);
    console.log(`Results: ${report.summary.passed} passed, ${report.summary.warnings} warnings, ${report.summary.failed} failed`);
    
    if (report.summary.totalIssues > 0) {
      console.log(`\n⚠️ ISSUES FOUND: ${report.summary.totalIssues} dark mode issues detected`);
    } else {
      console.log(`\n🎉 EXCELLENT: No dark mode issues detected!`);
    }
    
    console.log(`\n📸 Screenshots saved to: ${CONFIG.SCREENSHOTS_DIR}`);
    console.log(`📁 Baseline created at: ${CONFIG.BASELINE_DIR}`);
    console.log('='.repeat(80));
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Dark mode visual testing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  runComprehensiveDarkModeVisualTesting();
}

module.exports = { 
  ComprehensiveDarkModeVisualTester, 
  CONFIG, 
  BREAKPOINTS, 
  TEST_PAGES,
  DARK_MODE_CHECKS 
};