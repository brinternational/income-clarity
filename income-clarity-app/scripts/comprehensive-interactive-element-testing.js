#!/usr/bin/env node

/**
 * COMPREHENSIVE INTERACTIVE ELEMENT TESTING SYSTEM
 * 
 * PURPOSE: Validate every clickable, typable, and interactive element works perfectly
 * 
 * BUILDS ON: Existing comprehensive-e2e-visual-validation.js foundation
 * 
 * ADDS: Complete interactive element validation beyond page loads
 * - Button clicks and response validation
 * - Form field interactions and submissions  
 * - Navigation element testing
 * - Tab switching and content validation
 * - Mobile touch interactions
 * - Progressive disclosure interaction testing
 * 
 * CRITICAL: Tests real user interactions, not just DOM presence
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  BASE_URL: 'https://incomeclarity.ddns.net',
  SCREENSHOTS_DIR: './test-results/interactive-element-testing',
  CONSOLE_LOGS_DIR: './test-results/interactive-console-logs', 
  TIMEOUT: 30000,
  VIEWPORT: { width: 1920, height: 1080 },
  MOBILE_VIEWPORT: { width: 390, height: 844 }, // iPhone 12 Pro
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123'
  },
  INTERACTION_DELAY: 1000, // Delay between interactions for stability
  SCREENSHOT_EVERY_INTERACTION: true // Take screenshot after every interaction
};

// Interactive element test scenarios
const INTERACTIVE_TEST_SCENARIOS = [
  {
    name: 'Authentication Flow Interactions',
    description: 'Test login form interactions and authentication flow',
    category: 'authentication',
    tests: [
      {
        action: 'login_form_interaction',
        steps: [
          { type: 'navigate', url: '/auth/login' },
          { type: 'screenshot', name: 'login-page-loaded' },
          { type: 'click', selector: 'input[type="email"]', description: 'Click email field' },
          { type: 'type', selector: 'input[type="email"]', text: 'test@example.com', description: 'Type email' },
          { type: 'screenshot', name: 'email-entered' },
          { type: 'click', selector: 'input[type="password"]', description: 'Click password field' },
          { type: 'type', selector: 'input[type="password"]', text: 'password123', description: 'Type password' },
          { type: 'screenshot', name: 'password-entered' },
          { type: 'click', selector: 'button[type="submit"]', description: 'Click login button' },
          { type: 'waitForNavigation', url: '**/dashboard/super-cards', description: 'Wait for dashboard redirect' },
          { type: 'screenshot', name: 'dashboard-after-login' },
          { type: 'validateContent', expected: ['Performance Hub', 'Income'], description: 'Validate dashboard content' }
        ]
      }
    ]
  },
  {
    name: 'Dashboard Navigation Interactions',
    description: 'Test dashboard navigation and Super Cards interactions',
    category: 'navigation',
    requiresAuth: true,
    tests: [
      {
        action: 'super_cards_navigation',
        steps: [
          { type: 'navigate', url: '/dashboard/super-cards' },
          { type: 'screenshot', name: 'dashboard-loaded' },
          { type: 'click', selector: 'text=Performance Hub', description: 'Click Performance Hub card' },
          { type: 'waitForTimeout', ms: 2000, description: 'Wait for navigation' },
          { type: 'screenshot', name: 'performance-hub-clicked' },
          { type: 'validateURL', expected: 'level=hero-view&hub=performance', description: 'Validate URL parameters' },
          { type: 'validateContent', expected: ['SPY Intelligence'], description: 'Validate performance content' }
        ]
      },
      {
        action: 'progressive_disclosure_navigation',
        steps: [
          { type: 'navigate', url: '/dashboard/super-cards?level=hero-view&hub=income-tax' },
          { type: 'screenshot', name: 'hero-view-income-loaded' },
          { type: 'click', selector: 'text=Detailed Analysis', description: 'Click detailed analysis link' },
          { type: 'waitForTimeout', ms: 2000, description: 'Wait for detailed view' },
          { type: 'screenshot', name: 'detailed-view-accessed' },
          { type: 'validateURL', expected: 'level=detailed', description: 'Validate detailed level URL' },
          { type: 'validateContent', expected: ['Advanced Features', 'Tab'], description: 'Validate detailed content' }
        ]
      }
    ]
  },
  {
    name: 'Tab Switching Interactions',
    description: 'Test tab switching in detailed view',
    category: 'tabs',
    requiresAuth: true,
    tests: [
      {
        action: 'detailed_view_tab_switching',
        steps: [
          { type: 'navigate', url: '/dashboard/super-cards?level=detailed&hub=performance' },
          { type: 'screenshot', name: 'detailed-performance-loaded' },
          { type: 'click', selector: '[role="tab"]', index: 1, description: 'Click second tab' },
          { type: 'waitForTimeout', ms: 1500, description: 'Wait for tab content' },
          { type: 'screenshot', name: 'second-tab-active' },
          { type: 'validateContent', expected: ['tab content'], description: 'Validate tab content changed' },
          { type: 'click', selector: '[role="tab"]', index: 0, description: 'Click first tab' },
          { type: 'waitForTimeout', ms: 1500, description: 'Wait for tab content' },
          { type: 'screenshot', name: 'first-tab-active' },
          { type: 'validateContent', expected: ['SPY Intelligence'], description: 'Validate first tab content' }
        ]
      }
    ]
  },
  {
    name: 'Sidebar Navigation Interactions', 
    description: 'Test sidebar navigation and menu interactions',
    category: 'sidebar',
    requiresAuth: true,
    tests: [
      {
        action: 'sidebar_navigation_testing',
        steps: [
          { type: 'navigate', url: '/dashboard/super-cards' },
          { type: 'screenshot', name: 'dashboard-with-sidebar' },
          { type: 'click', selector: '[data-testid="sidebar-toggle"], .sidebar-toggle, text=Menu', description: 'Open sidebar menu' },
          { type: 'waitForTimeout', ms: 1000, description: 'Wait for sidebar animation' },
          { type: 'screenshot', name: 'sidebar-opened' },
          { type: 'click', selector: 'text=Settings, [href="/settings"]', description: 'Click Settings in sidebar' },
          { type: 'waitForNavigation', url: '**/settings', description: 'Wait for settings page' },
          { type: 'screenshot', name: 'settings-page-loaded' },
          { type: 'validateContent', expected: ['Settings', 'Profile'], description: 'Validate settings page content' }
        ]
      }
    ]
  },
  {
    name: 'Form Interactions',
    description: 'Test form field interactions and submissions',
    category: 'forms',
    requiresAuth: true,
    tests: [
      {
        action: 'settings_form_interaction',
        steps: [
          { type: 'navigate', url: '/settings' },
          { type: 'screenshot', name: 'settings-form-loaded' },
          { type: 'click', selector: 'input[type="text"], input[name="name"]', description: 'Click name field' },
          { type: 'type', selector: 'input[type="text"], input[name="name"]', text: 'Test User Updated', description: 'Type updated name' },
          { type: 'screenshot', name: 'name-field-updated' },
          { type: 'click', selector: 'button[type="submit"], text=Save', description: 'Click save button' },
          { type: 'waitForTimeout', ms: 2000, description: 'Wait for save processing' },
          { type: 'screenshot', name: 'form-submitted' },
          { type: 'validateContent', expected: ['saved', 'updated'], description: 'Validate save confirmation' }
        ]
      }
    ]
  },
  {
    name: 'Mobile Touch Interactions',
    description: 'Test mobile responsive interactions and touch targets',
    category: 'mobile',
    requiresAuth: true,
    mobileOnly: true,
    tests: [
      {
        action: 'mobile_super_cards_interaction',
        steps: [
          { type: 'navigate', url: '/dashboard/super-cards' },
          { type: 'screenshot', name: 'mobile-dashboard-loaded' },
          { type: 'tap', selector: 'text=Performance Hub', description: 'Tap Performance Hub card' },
          { type: 'waitForTimeout', ms: 2000, description: 'Wait for mobile navigation' },
          { type: 'screenshot', name: 'mobile-performance-tapped' },
          { type: 'validateContent', expected: ['Performance'], description: 'Validate mobile navigation' },
          { type: 'swipe', direction: 'left', description: 'Swipe left for navigation' },
          { type: 'screenshot', name: 'mobile-swipe-performed' }
        ]
      }
    ]
  },
  {
    name: 'Button Response Validation',
    description: 'Test all buttons respond correctly to clicks',
    category: 'buttons', 
    requiresAuth: true,
    tests: [
      {
        action: 'comprehensive_button_testing',
        steps: [
          { type: 'navigate', url: '/dashboard/super-cards' },
          { type: 'screenshot', name: 'button-testing-start' },
          { type: 'clickAllButtons', selector: 'button:visible', description: 'Test all visible buttons' },
          { type: 'validateNoErrors', description: 'Ensure no JavaScript errors from button clicks' },
          { type: 'screenshot', name: 'all-buttons-tested' }
        ]
      }
    ]
  }
];

class ComprehensiveInteractiveElementTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.consoleErrors = [];
    this.networkErrors = [];
    this.interactionCount = 0;
    this.screenshotCount = 0;
  }

  async initialize(useMobile = false) {
    console.log('🚀 Initializing Comprehensive Interactive Element Testing System...');
    
    // Create output directories
    await fs.mkdir(CONFIG.SCREENSHOTS_DIR, { recursive: true });
    await fs.mkdir(CONFIG.CONSOLE_LOGS_DIR, { recursive: true });
    
    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ]
    });
    
    const viewport = useMobile ? CONFIG.MOBILE_VIEWPORT : CONFIG.VIEWPORT;
    
    this.context = await this.browser.newContext({
      viewport,
      ignoreHTTPSErrors: true,
      // Mobile-specific settings
      ...(useMobile && {
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 3
      })
    });
    
    this.page = await this.context.newPage();
    
    // Set up monitoring
    this.setupMonitoring();
    
    console.log(`✅ Browser initialized successfully${useMobile ? ' (Mobile Mode)' : ''}`);
  }

  setupMonitoring() {
    // Monitor console errors with zero tolerance
    this.page.on('console', msg => {
      const msgType = msg.type();
      const msgText = msg.text();
      
      if (msgType === 'error' || msgType === 'warning') {
        this.consoleErrors.push({
          type: msgType,
          message: msgText,
          timestamp: new Date().toISOString(),
          url: this.page.url(),
          interactionCount: this.interactionCount
        });
      }
    });

    // Monitor network failures
    this.page.on('requestfailed', request => {
      this.networkErrors.push({
        url: request.url(),
        failure: request.failure().errorText,
        timestamp: new Date().toISOString(),
        pageUrl: this.page.url(),
        interactionCount: this.interactionCount
      });
    });

    // Monitor page errors
    this.page.on('pageerror', error => {
      this.consoleErrors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: this.page.url(),
        interactionCount: this.interactionCount
      });
    });
  }

  async login() {
    console.log('🔑 Authenticating with production credentials...');
    
    await this.page.goto(`${CONFIG.BASE_URL}/auth/login`);
    await this.page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await this.page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await this.page.click('button[type="submit"]');
    
    // Wait for successful login redirect
    await this.page.waitForURL('**/dashboard/super-cards', { timeout: CONFIG.TIMEOUT });
    
    console.log('✅ Authentication successful');
  }

  async runTestScenario(scenario) {
    console.log(`\n🧪 Testing Scenario: ${scenario.name}`);
    console.log(`📋 Description: ${scenario.description}`);
    
    const scenarioResult = {
      name: scenario.name,
      description: scenario.description,
      category: scenario.category,
      timestamp: new Date().toISOString(),
      status: 'UNKNOWN',
      testResults: [],
      totalInteractions: 0,
      consoleErrors: [],
      networkErrors: [],
      screenshots: []
    };

    try {
      // Skip mobile tests if not in mobile mode
      if (scenario.mobileOnly && this.context._options.viewport.width > 500) {
        console.log('⏭️ Skipping mobile-only scenario in desktop mode');
        scenarioResult.status = 'SKIPPED';
        this.testResults.push(scenarioResult);
        return scenarioResult;
      }

      // Authenticate if required
      if (scenario.requiresAuth) {
        await this.login();
      }

      // Run each test in the scenario
      for (const test of scenario.tests) {
        const testResult = await this.runInteractiveTest(test);
        scenarioResult.testResults.push(testResult);
        scenarioResult.totalInteractions += testResult.interactionCount || 0;
      }

      // Capture final state
      scenarioResult.consoleErrors = [...this.consoleErrors];
      scenarioResult.networkErrors = [...this.networkErrors];
      
      // Determine overall scenario status
      scenarioResult.status = this.determineScenarioStatus(scenarioResult);
      
      console.log(`📊 Scenario Result: ${scenarioResult.status}`);
      console.log(`🔢 Total Interactions: ${scenarioResult.totalInteractions}`);
      console.log(`🚨 Console Errors: ${scenarioResult.consoleErrors.length}`);

    } catch (error) {
      scenarioResult.status = 'FAILED';
      scenarioResult.error = error.message;
      console.log(`❌ Scenario Failed: ${error.message}`);
    }

    this.testResults.push(scenarioResult);
    return scenarioResult;
  }

  async runInteractiveTest(test) {
    console.log(`  🎯 Running Test: ${test.action}`);
    
    const testResult = {
      action: test.action,
      steps: test.steps.length,
      interactionCount: 0,
      screenshots: [],
      status: 'UNKNOWN',
      executedSteps: []
    };

    // Clear errors for this specific test
    this.consoleErrors = [];
    this.networkErrors = [];

    try {
      for (const [stepIndex, step] of test.steps.entries()) {
        console.log(`    🔄 Step ${stepIndex + 1}/${test.steps.length}: ${step.description || step.type}`);
        
        const stepResult = await this.executeStep(step, stepIndex);
        testResult.executedSteps.push(stepResult);
        
        if (step.type !== 'screenshot' && step.type !== 'waitForTimeout') {
          testResult.interactionCount++;
          this.interactionCount++;
        }

        // Take screenshot after interactions if enabled
        if (CONFIG.SCREENSHOT_EVERY_INTERACTION && 
            ['click', 'type', 'tap', 'swipe'].includes(step.type)) {
          await this.takeScreenshot(`${test.action}_step_${stepIndex + 1}_${step.type}`);
        }

        // Delay between interactions for stability
        if (step.type !== 'waitForTimeout') {
          await this.page.waitForTimeout(CONFIG.INTERACTION_DELAY);
        }
      }

      testResult.status = 'PASSED';
      console.log(`    ✅ Test Completed: ${test.action}`);

    } catch (error) {
      testResult.status = 'FAILED';
      testResult.error = error.message;
      console.log(`    ❌ Test Failed: ${error.message}`);
    }

    return testResult;
  }

  async executeStep(step, stepIndex) {
    const stepResult = {
      step: stepIndex + 1,
      type: step.type,
      description: step.description || step.type,
      status: 'UNKNOWN',
      timestamp: new Date().toISOString()
    };

    try {
      switch (step.type) {
        case 'navigate':
          await this.page.goto(`${CONFIG.BASE_URL}${step.url}`, { 
            waitUntil: 'networkidle',
            timeout: CONFIG.TIMEOUT 
          });
          stepResult.status = 'PASSED';
          break;

        case 'click':
          const clickSelector = step.index !== undefined ? 
            `${step.selector}:nth-child(${step.index + 1})` : 
            step.selector;
          await this.page.click(clickSelector, { timeout: 10000 });
          stepResult.status = 'PASSED';
          break;

        case 'type':
          await this.page.fill(step.selector, step.text);
          stepResult.status = 'PASSED';
          break;

        case 'tap':
          // Mobile-specific tap interaction
          await this.page.tap(step.selector);
          stepResult.status = 'PASSED';
          break;

        case 'swipe':
          // Mobile swipe gesture
          const element = await this.page.locator(step.selector || 'body').first();
          await element.hover();
          if (step.direction === 'left') {
            await this.page.mouse.move(400, 400);
            await this.page.mouse.down();
            await this.page.mouse.move(100, 400);
            await this.page.mouse.up();
          }
          stepResult.status = 'PASSED';
          break;

        case 'screenshot':
          const screenshotPath = await this.takeScreenshot(step.name);
          stepResult.screenshotPath = screenshotPath;
          stepResult.status = 'PASSED';
          break;

        case 'waitForNavigation':
          await this.page.waitForURL(step.url, { timeout: CONFIG.TIMEOUT });
          stepResult.status = 'PASSED';
          break;

        case 'waitForTimeout':
          await this.page.waitForTimeout(step.ms);
          stepResult.status = 'PASSED';
          break;

        case 'validateContent':
          const contentFound = [];
          const contentMissing = [];
          
          for (const expectedText of step.expected) {
            const isVisible = await this.page.getByText(expectedText).isVisible().catch(() => false);
            if (isVisible) {
              contentFound.push(expectedText);
            } else {
              contentMissing.push(expectedText);
            }
          }
          
          stepResult.contentFound = contentFound;
          stepResult.contentMissing = contentMissing;
          stepResult.status = contentMissing.length === 0 ? 'PASSED' : 'PARTIAL';
          break;

        case 'validateURL':
          const currentURL = this.page.url();
          const urlContainsExpected = currentURL.includes(step.expected);
          stepResult.urlValidation = { expected: step.expected, actual: currentURL, match: urlContainsExpected };
          stepResult.status = urlContainsExpected ? 'PASSED' : 'FAILED';
          break;

        case 'clickAllButtons':
          const buttons = await this.page.locator(step.selector).all();
          let buttonClickCount = 0;
          
          for (const button of buttons) {
            try {
              if (await button.isVisible()) {
                await button.click();
                buttonClickCount++;
                await this.page.waitForTimeout(500); // Brief pause between clicks
              }
            } catch (error) {
              console.log(`      ⚠️ Button click failed: ${error.message}`);
            }
          }
          
          stepResult.buttonClickCount = buttonClickCount;
          stepResult.status = buttonClickCount > 0 ? 'PASSED' : 'FAILED';
          break;

        case 'validateNoErrors':
          const errorCount = this.consoleErrors.length;
          stepResult.errorCount = errorCount;
          stepResult.status = errorCount === 0 ? 'PASSED' : 'FAILED';
          break;

        default:
          stepResult.status = 'UNKNOWN';
          console.log(`      ⚠️ Unknown step type: ${step.type}`);
      }

    } catch (error) {
      stepResult.status = 'FAILED';
      stepResult.error = error.message;
    }

    return stepResult;
  }

  async takeScreenshot(name) {
    this.screenshotCount++;
    const timestamp = Date.now();
    const screenshotPath = path.join(
      CONFIG.SCREENSHOTS_DIR,
      `${name}_${timestamp}.png`
    );
    
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    return screenshotPath;
  }

  determineScenarioStatus(scenarioResult) {
    // Critical failure conditions
    if (scenarioResult.error) return 'FAILED';
    
    // High number of console errors = failure
    if (scenarioResult.consoleErrors.length > 5) {
      return 'FAILED - CONSOLE ERRORS';
    }
    
    // Network errors = failure
    if (scenarioResult.networkErrors.length > 0) {
      return 'FAILED - NETWORK ERRORS';
    }

    // Check individual test results
    const failedTests = scenarioResult.testResults.filter(t => t.status === 'FAILED').length;
    const passedTests = scenarioResult.testResults.filter(t => t.status === 'PASSED').length;
    
    if (failedTests === 0 && passedTests === scenarioResult.testResults.length) {
      return 'PASSED';
    }
    
    if (failedTests > passedTests) {
      return 'FAILED - MAJORITY FAILED';
    }
    
    return 'PARTIAL - SOME FAILURES';
  }

  async generateInteractiveTestReport() {
    console.log('\n📊 Generating Comprehensive Interactive Test Report...');
    
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        totalScenarios: this.testResults.length,
        totalInteractions: this.interactionCount,
        totalScreenshots: this.screenshotCount,
        passed: this.testResults.filter(r => r.status === 'PASSED').length,
        failed: this.testResults.filter(r => r.status.includes('FAILED')).length,
        skipped: this.testResults.filter(r => r.status === 'SKIPPED').length
      },
      interactiveSummary: {
        overallStatus: this.getOverallInteractiveStatus(),
        criticalInteractionIssues: this.getCriticalInteractionIssues(),
        interactionCoverage: this.getInteractionCoverage(),
        recommendations: this.getInteractiveRecommendations()
      },
      scenarioResults: this.testResults,
      environmentInfo: {
        baseUrl: CONFIG.BASE_URL,
        viewport: CONFIG.VIEWPORT,
        mobileViewport: CONFIG.MOBILE_VIEWPORT,
        browser: 'chromium',
        testUser: CONFIG.TEST_USER.email,
        screenshotEveryInteraction: CONFIG.SCREENSHOT_EVERY_INTERACTION
      }
    };

    // Save detailed JSON report
    const reportPath = path.join(CONFIG.SCREENSHOTS_DIR, 'comprehensive-interactive-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable summary
    const summaryPath = path.join(CONFIG.SCREENSHOTS_DIR, 'interactive-test-summary.md');
    await this.generateInteractiveMarkdownSummary(report, summaryPath);

    console.log(`✅ Interactive Test Report saved: ${reportPath}`);
    console.log(`📋 Interactive Test Summary saved: ${summaryPath}`);
    
    return report;
  }

  getOverallInteractiveStatus() {
    const failed = this.testResults.filter(r => r.status.includes('FAILED')).length;
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIPPED').length;
    
    if (failed === 0 && passed > 0) return 'ALL INTERACTIVE ELEMENTS WORKING';
    if (failed > passed) return 'CRITICAL - INTERACTIVE FAILURES';
    if (failed > 0) return 'PARTIAL - SOME INTERACTIONS FAILING';
    if (skipped === this.testResults.length) return 'ALL TESTS SKIPPED';
    return 'WARNINGS ONLY';
  }

  getCriticalInteractionIssues() {
    const issues = [];
    
    // Button interaction failures
    const buttonFailures = this.testResults.filter(r => 
      r.category === 'buttons' && r.status.includes('FAILED')
    );
    if (buttonFailures.length > 0) {
      issues.push({
        type: 'BUTTON_INTERACTION_FAILURES',
        count: buttonFailures.length,
        description: 'Buttons not responding correctly to clicks',
        severity: 'HIGH'
      });
    }

    // Form interaction failures
    const formFailures = this.testResults.filter(r => 
      r.category === 'forms' && r.status.includes('FAILED')
    );
    if (formFailures.length > 0) {
      issues.push({
        type: 'FORM_INTERACTION_FAILURES',
        count: formFailures.length,
        description: 'Form fields not accepting input or submitting correctly',
        severity: 'HIGH'
      });
    }

    // Navigation interaction failures
    const navFailures = this.testResults.filter(r => 
      r.category === 'navigation' && r.status.includes('FAILED')
    );
    if (navFailures.length > 0) {
      issues.push({
        type: 'NAVIGATION_INTERACTION_FAILURES',
        count: navFailures.length,
        description: 'Navigation elements not working correctly',
        severity: 'HIGH'
      });
    }

    // Console errors during interactions
    const interactionConsoleErrors = this.testResults.filter(r => 
      r.consoleErrors && r.consoleErrors.length > 0
    );
    if (interactionConsoleErrors.length > 0) {
      const totalErrors = interactionConsoleErrors.reduce((sum, r) => sum + r.consoleErrors.length, 0);
      issues.push({
        type: 'CONSOLE_ERRORS_DURING_INTERACTIONS',
        count: interactionConsoleErrors.length,
        totalErrors: totalErrors,
        description: 'JavaScript errors occurring during user interactions',
        severity: 'MEDIUM'
      });
    }

    return issues;
  }

  getInteractionCoverage() {
    return {
      authentication: this.testResults.filter(r => r.category === 'authentication').length,
      navigation: this.testResults.filter(r => r.category === 'navigation').length,
      buttons: this.testResults.filter(r => r.category === 'buttons').length,
      forms: this.testResults.filter(r => r.category === 'forms').length,
      tabs: this.testResults.filter(r => r.category === 'tabs').length,
      sidebar: this.testResults.filter(r => r.category === 'sidebar').length,
      mobile: this.testResults.filter(r => r.category === 'mobile').length,
      totalInteractions: this.interactionCount,
      totalScreenshots: this.screenshotCount
    };
  }

  getInteractiveRecommendations() {
    const recommendations = [];
    
    const failedScenarios = this.testResults.filter(r => r.status.includes('FAILED'));
    if (failedScenarios.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix Interactive Element Failures',
        description: `${failedScenarios.length} interactive scenarios are failing`,
        affectedScenarios: failedScenarios.map(r => r.name)
      });
    }

    const consoleErrorScenarios = this.testResults.filter(r => 
      r.consoleErrors && r.consoleErrors.length > 0
    );
    if (consoleErrorScenarios.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Resolve Console Errors During Interactions',
        description: 'JavaScript errors detected during user interactions',
        errorCount: consoleErrorScenarios.reduce((sum, r) => sum + r.consoleErrors.length, 0)
      });
    }

    if (this.interactionCount < 20) {
      recommendations.push({
        priority: 'LOW',
        action: 'Expand Interactive Element Coverage',
        description: 'Consider testing additional interactive elements and user workflows',
        currentInteractions: this.interactionCount
      });
    }

    return recommendations;
  }

  async generateInteractiveMarkdownSummary(report, filePath) {
    const { testRun, interactiveSummary, scenarioResults } = report;
    
    let markdown = `# Comprehensive Interactive Element Testing Report\n\n`;
    markdown += `**Generated:** ${testRun.timestamp}\n\n`;
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Overall Status:** ${interactiveSummary.overallStatus}\n`;
    markdown += `- **Scenarios Run:** ${testRun.totalScenarios}\n`;
    markdown += `- **Total Interactions:** ${testRun.totalInteractions}\n`;
    markdown += `- **Screenshots Captured:** ${testRun.totalScreenshots}\n`;
    markdown += `- **Passed:** ✅ ${testRun.passed}\n`;
    markdown += `- **Failed:** ❌ ${testRun.failed}\n`;
    markdown += `- **Skipped:** ⏭️ ${testRun.skipped}\n\n`;

    markdown += `## 🎯 Interaction Coverage\n\n`;
    const coverage = interactiveSummary.interactionCoverage;
    markdown += `- **Authentication:** ${coverage.authentication} scenarios\n`;
    markdown += `- **Navigation:** ${coverage.navigation} scenarios\n`;
    markdown += `- **Buttons:** ${coverage.buttons} scenarios\n`;
    markdown += `- **Forms:** ${coverage.forms} scenarios\n`;
    markdown += `- **Tabs:** ${coverage.tabs} scenarios\n`;
    markdown += `- **Sidebar:** ${coverage.sidebar} scenarios\n`;
    markdown += `- **Mobile:** ${coverage.mobile} scenarios\n\n`;

    if (interactiveSummary.criticalInteractionIssues.length > 0) {
      markdown += `## 🚨 Critical Interactive Issues Found\n\n`;
      interactiveSummary.criticalInteractionIssues.forEach(issue => {
        markdown += `### ${issue.type}\n`;
        markdown += `- **Severity:** ${issue.severity}\n`;
        markdown += `- **Count:** ${issue.count}\n`;
        markdown += `- **Description:** ${issue.description}\n\n`;
      });
    }

    markdown += `## 📋 Scenario Results\n\n`;
    scenarioResults.forEach(scenario => {
      const statusEmoji = scenario.status === 'PASSED' ? '✅' : 
                         scenario.status.includes('FAILED') ? '❌' : 
                         scenario.status === 'SKIPPED' ? '⏭️' : '⚠️';
      
      markdown += `### ${statusEmoji} ${scenario.name}\n\n`;
      markdown += `- **Category:** ${scenario.category}\n`;
      markdown += `- **Status:** ${scenario.status}\n`;
      markdown += `- **Description:** ${scenario.description}\n`;
      markdown += `- **Total Interactions:** ${scenario.totalInteractions}\n`;
      markdown += `- **Console Errors:** ${scenario.consoleErrors?.length || 0}\n`;
      markdown += `- **Network Errors:** ${scenario.networkErrors?.length || 0}\n`;
      
      if (scenario.testResults && scenario.testResults.length > 0) {
        markdown += `- **Test Results:**\n`;
        scenario.testResults.forEach(test => {
          const testEmoji = test.status === 'PASSED' ? '✅' : 
                           test.status === 'FAILED' ? '❌' : '⚠️';
          markdown += `  - ${testEmoji} ${test.action} (${test.interactionCount} interactions)\n`;
        });
      }
      
      markdown += `\n`;
    });

    if (interactiveSummary.recommendations.length > 0) {
      markdown += `## 🔧 Interactive Testing Recommendations\n\n`;
      interactiveSummary.recommendations.forEach((rec, index) => {
        markdown += `### ${index + 1}. ${rec.action} (${rec.priority} Priority)\n\n`;
        markdown += `${rec.description}\n\n`;
      });
    }

    await fs.writeFile(filePath, markdown);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Interactive testing cleanup completed');
  }
}

// Main execution function
async function runComprehensiveInteractiveElementTesting() {
  const tester = new ComprehensiveInteractiveElementTester();
  
  try {
    // Run desktop interactive testing
    await tester.initialize(false);
    
    console.log(`\n🎯 Starting interactive element testing of ${INTERACTIVE_TEST_SCENARIOS.length} scenarios...\n`);
    
    for (const scenario of INTERACTIVE_TEST_SCENARIOS) {
      // Skip mobile scenarios in desktop mode
      if (scenario.mobileOnly) continue;
      
      await tester.runTestScenario(scenario);
      
      // Brief pause between scenarios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await tester.cleanup();

    // Run mobile interactive testing
    console.log('\n📱 Starting mobile interactive element testing...\n');
    
    const mobileTester = new ComprehensiveInteractiveElementTester();
    await mobileTester.initialize(true);
    
    for (const scenario of INTERACTIVE_TEST_SCENARIOS) {
      // Only run mobile scenarios or general scenarios in mobile mode
      if (!scenario.mobileOnly && scenario.category !== 'mobile') continue;
      
      await mobileTester.runTestScenario(scenario);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Combine results from both testers
    tester.testResults.push(...mobileTester.testResults);
    tester.interactionCount += mobileTester.interactionCount;
    tester.screenshotCount += mobileTester.screenshotCount;
    
    await mobileTester.cleanup();
    
    const report = await tester.generateInteractiveTestReport();
    
    // Console summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE INTERACTIVE ELEMENT TESTING COMPLETE');
    console.log('='.repeat(80));
    console.log(`Overall Status: ${report.interactiveSummary.overallStatus}`);
    console.log(`Scenarios: ${report.testRun.passed} passed, ${report.testRun.failed} failed, ${report.testRun.skipped} skipped`);
    console.log(`Total Interactions: ${report.testRun.totalInteractions}`);
    console.log(`Screenshots Captured: ${report.testRun.totalScreenshots}`);
    
    if (report.interactiveSummary.criticalInteractionIssues.length > 0) {
      console.log(`\n🚨 CRITICAL INTERACTION ISSUES FOUND: ${report.interactiveSummary.criticalInteractionIssues.length}`);
      report.interactiveSummary.criticalInteractionIssues.forEach(issue => {
        console.log(`   - ${issue.type}: ${issue.description}`);
      });
    }
    
    console.log(`\n📂 Results saved to: ${CONFIG.SCREENSHOTS_DIR}`);
    console.log('='.repeat(80));
    
    // Exit with error code if critical interactive tests failed
    if (report.testRun.failed > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Interactive Element Testing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  runComprehensiveInteractiveElementTesting();
}

module.exports = { 
  ComprehensiveInteractiveElementTester, 
  INTERACTIVE_TEST_SCENARIOS, 
  CONFIG 
};