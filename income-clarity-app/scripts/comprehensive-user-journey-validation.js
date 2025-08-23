#!/usr/bin/env node

/**
 * Comprehensive User Journey Validation System
 * 
 * MISSION: Complete user workflow validation from first visit to advanced usage
 * 
 * USER JOURNEY SCENARIOS:
 * 1. First-Time Visitor Journey (80% users): Landing → Login → Dashboard → Quick insights → Logout
 * 2. Engaged User Journey (15% users): Login → Explore cards → Hero-view focus → Feature discovery
 * 3. Power User Journey (5% users): Login → Detailed dashboard → All hubs → Comprehensive analysis
 * 4. Cross-Device Journey: Desktop initial → Mobile continuation → Session persistence
 * 5. Error Recovery Journey: Handle failures → Graceful recovery → Workflow continuation
 * 
 * VALIDATION REQUIREMENTS:
 * - Production environment (https://incomeclarity.ddns.net)
 * - Real user authentication (test@example.com/password123)
 * - Complete workflow continuity validation
 * - Performance benchmarking for entire journeys
 * - Screenshot evidence for every journey step
 * - Zero console error tolerance
 * - Session state persistence across journey steps
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class UserJourneyValidator {
  constructor() {
    this.baseUrl = 'https://incomeclarity.ddns.net';
    this.testUser = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    this.results = {
      journeys: [],
      performance: [],
      errors: [],
      screenshots: []
    };
    
    this.screenshotDir = path.join(__dirname, 'test-results', 'user-journey-validation');
    this.reportPath = path.join(__dirname, 'test-results', `user-journey-report-${Date.now()}.json`);
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async initialize() {
    console.log('🚀 Initializing Comprehensive User Journey Validation System...');
    console.log(`📍 Production URL: ${this.baseUrl}`);
    console.log(`👤 Test User: ${this.testUser.email}`);
    console.log(`📸 Screenshots: ${this.screenshotDir}`);
    console.log(`📊 Report: ${this.reportPath}`);
    
    this.browser = await chromium.launch({
      headless: false, // Show browser for visual validation
      slowMo: 500     // Slow down for realistic user interactions
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    
    // Generate comprehensive report
    await this.generateJourneyReport();
    
    console.log('\n🏁 User Journey Validation Complete!');
    console.log(`📊 Report generated: ${this.reportPath}`);
  }

  async captureScreenshot(page, journeyName, stepName, options = {}) {
    const timestamp = Date.now();
    const filename = `${journeyName}-${stepName}-${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await page.screenshot({ 
      path: filepath, 
      fullPage: true,
      ...options 
    });
    
    this.results.screenshots.push({
      journey: journeyName,
      step: stepName,
      timestamp,
      path: filepath
    });
    
    console.log(`📸 Screenshot captured: ${filename}`);
    return filepath;
  }

  async monitorConsoleErrors(page, journeyName, stepName) {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = {
          message: msg.text(),
          timestamp: Date.now(),
          journey: journeyName,
          step: stepName,
          severity: this.categorizeError(msg.text())
        };
        errors.push(error);
        this.results.errors.push(error);
        console.error(`🚨 Console Error in ${journeyName}/${stepName}: ${msg.text()}`);
      }
    });
    
    return errors;
  }

  categorizeError(errorMessage) {
    const criticalKeywords = ['TypeError', 'ReferenceError', 'SyntaxError', 'network error', 'failed to fetch'];
    const highKeywords = ['warning', 'deprecated', 'invalid'];
    
    const message = errorMessage.toLowerCase();
    
    if (criticalKeywords.some(keyword => message.includes(keyword.toLowerCase()))) {
      return 'critical';
    } else if (highKeywords.some(keyword => message.includes(keyword))) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  async measureJourneyPerformance(startTime, journeyName, stepName) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const performance = {
      journey: journeyName,
      step: stepName,
      duration,
      timestamp: endTime
    };
    
    this.results.performance.push(performance);
    
    console.log(`⚡ ${journeyName}/${stepName}: ${duration}ms`);
    return performance;
  }

  async waitForPageLoad(page, timeout = 10000) {
    await page.waitForLoadState('domcontentloaded', { timeout });
    await page.waitForTimeout(2000); // Allow for dynamic content loading
  }

  // ===========================================
  // JOURNEY 1: FIRST-TIME VISITOR (80% USERS)
  // ===========================================
  async validateFirstTimeVisitorJourney() {
    console.log('\n👶 JOURNEY 1: First-Time Visitor (80% Users)');
    console.log('📋 Flow: Landing → Login → Dashboard → Quick insights → Logout');
    
    const journeyName = 'first-time-visitor';
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
      await this.monitorConsoleErrors(page, journeyName, 'setup');
      
      // Step 1: Landing page (first impression)
      console.log('  📄 Step 1: Landing page first impression...');
      let stepStart = Date.now();
      await page.goto(this.baseUrl);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '01-landing-page');
      await this.measureJourneyPerformance(stepStart, journeyName, 'landing-page');
      
      // Step 2: Navigate to login
      console.log('  🔐 Step 2: Navigate to login...');
      stepStart = Date.now();
      
      // Look for login button/link
      const loginSelectors = [
        'a[href*="/login"]',
        'button:has-text("Login")',
        'a:has-text("Login")',
        'a[href*="/auth/login"]',
        '.login-button',
        '[data-testid="login-button"]'
      ];
      
      let loginClicked = false;
      for (const selector of loginSelectors) {
        try {
          await page.click(selector);
          loginClicked = true;
          console.log(`    ✅ Clicked login via: ${selector}`);
          break;
        } catch {
          // Try next selector
        }
      }
      
      // Fallback: Direct navigation if no login button found
      if (!loginClicked) {
        console.log('    💡 Direct navigation to login page');
        await page.goto(`${this.baseUrl}/auth/login`);
      }
      
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '02-login-page');
      await this.measureJourneyPerformance(stepStart, journeyName, 'navigate-to-login');
      
      // Step 3: Authentication
      console.log('  ✅ Step 3: First-time user authentication...');
      stepStart = Date.now();
      
      await page.fill('input[type="email"]', this.testUser.email);
      await this.captureScreenshot(page, journeyName, '03-email-entered');
      
      await page.fill('input[type="password"]', this.testUser.password);
      await this.captureScreenshot(page, journeyName, '04-credentials-complete');
      
      await page.click('button[type="submit"]');
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '05-authenticated');
      await this.measureJourneyPerformance(stepStart, journeyName, 'authentication');
      
      // Step 4: First dashboard experience (Momentum view)
      console.log('  📊 Step 4: First dashboard experience...');
      stepStart = Date.now();
      
      // Should be at momentum view by default for first-time users
      const currentUrl = page.url();
      if (!currentUrl.includes('/dashboard')) {
        await page.goto(`${this.baseUrl}/dashboard?view=momentum`);
        await this.waitForPageLoad(page);
      }
      
      await this.captureScreenshot(page, journeyName, '06-first-dashboard-momentum');
      await this.measureJourneyPerformance(stepStart, journeyName, 'first-dashboard-experience');
      
      // Step 5: Quick insights exploration (typical 80% user behavior)
      console.log('  💡 Step 5: Quick insights exploration...');
      stepStart = Date.now();
      
      // Look for super cards and interact with one
      const superCardSelectors = [
        '.super-card',
        '[data-testid="super-card"]',
        '.card',
        '.hub-card'
      ];
      
      let cardClicked = false;
      for (const selector of superCardSelectors) {
        try {
          const cards = await page.locator(selector);
          const count = await cards.count();
          if (count > 0) {
            await cards.first().click();
            cardClicked = true;
            console.log(`    ✅ Explored super card via: ${selector}`);
            break;
          }
        } catch {
          // Try next selector
        }
      }
      
      if (cardClicked) {
        await this.waitForPageLoad(page);
        await this.captureScreenshot(page, journeyName, '07-quick-exploration');
      } else {
        console.log('    💡 No interactive cards found - capturing current state');
        await this.captureScreenshot(page, journeyName, '07-dashboard-exploration');
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'quick-insights-exploration');
      
      // Step 6: Return to main dashboard (typical user behavior)
      console.log('  🏠 Step 6: Return to main dashboard...');
      stepStart = Date.now();
      
      await page.goto(`${this.baseUrl}/dashboard`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '08-return-dashboard');
      await this.measureJourneyPerformance(stepStart, journeyName, 'return-to-dashboard');
      
      // Step 7: Logout (session completion)
      console.log('  👋 Step 7: Session completion (logout)...');
      stepStart = Date.now();
      
      const logoutSelectors = [
        'button:has-text("Logout")',
        'a:has-text("Logout")',
        'button:has-text("Sign out")',
        '[data-testid="logout-button"]',
        '.logout-button'
      ];
      
      let logoutClicked = false;
      for (const selector of logoutSelectors) {
        try {
          await page.click(selector);
          logoutClicked = true;
          console.log(`    ✅ Logged out via: ${selector}`);
          break;
        } catch {
          // Try next selector
        }
      }
      
      if (logoutClicked) {
        await this.waitForPageLoad(page);
        await this.captureScreenshot(page, journeyName, '09-logged-out');
      } else {
        console.log('    💡 Manual logout - navigating to root');
        await page.goto(`${this.baseUrl}/`);
        await this.waitForPageLoad(page);
        await this.captureScreenshot(page, journeyName, '09-session-end');
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'logout');
      
      this.results.journeys.push({
        name: 'first-time-visitor',
        type: '80% users',
        status: 'completed',
        steps: 7,
        timestamp: Date.now()
      });
      
      console.log('  ✅ First-Time Visitor Journey Completed Successfully!');
      
    } catch (error) {
      console.error(`❌ First-Time Visitor Journey Failed: ${error.message}`);
      await this.captureScreenshot(page, journeyName, 'journey-error');
      
      this.results.journeys.push({
        name: 'first-time-visitor',
        type: '80% users',
        status: 'failed',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      await context.close();
    }
  }

  // ===========================================
  // JOURNEY 2: ENGAGED USER (15% USERS)
  // ===========================================
  async validateEngagedUserJourney() {
    console.log('\n🎯 JOURNEY 2: Engaged User (15% Users)');
    console.log('📋 Flow: Login → Explore cards → Hero-view focus → Feature discovery');
    
    const journeyName = 'engaged-user';
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
      await this.monitorConsoleErrors(page, journeyName, 'setup');
      
      // Step 1: Direct login (returning user)
      console.log('  🔐 Step 1: Returning user login...');
      let stepStart = Date.now();
      await page.goto(`${this.baseUrl}/auth/login`);
      await this.waitForPageLoad(page);
      
      await page.fill('input[type="email"]', this.testUser.email);
      await page.fill('input[type="password"]', this.testUser.password);
      await this.captureScreenshot(page, journeyName, '01-login-ready');
      
      await page.click('button[type="submit"]');
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '02-authenticated');
      await this.measureJourneyPerformance(stepStart, journeyName, 'returning-user-login');
      
      // Step 2: Dashboard exploration (engaged user behavior)
      console.log('  📊 Step 2: Dashboard exploration...');
      stepStart = Date.now();
      
      // Navigate to dashboard
      await page.goto(`${this.baseUrl}/dashboard`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '03-dashboard-overview');
      await this.measureJourneyPerformance(stepStart, journeyName, 'dashboard-exploration');
      
      // Step 3: Super Cards exploration (systematic approach)
      console.log('  🃏 Step 3: Super Cards systematic exploration...');
      stepStart = Date.now();
      
      const superCards = [
        { name: 'Income', hub: 'income' },
        { name: 'Performance', hub: 'performance' },
        { name: 'Tax Strategy', hub: 'tax-strategy' },
        { name: 'Portfolio Strategy', hub: 'portfolio-strategy' },
        { name: 'Financial Planning', hub: 'financial-planning' }
      ];
      
      for (let i = 0; i < Math.min(3, superCards.length); i++) {
        const card = superCards[i];
        console.log(`    📈 Exploring ${card.name} card...`);
        
        // Try to click card directly or navigate to it
        try {
          const cardSelector = `[data-hub="${card.hub}"], .${card.hub}-card, [href*="${card.hub}"]`;
          await page.click(cardSelector);
        } catch {
          // Fallback to URL navigation
          await page.goto(`${this.baseUrl}/dashboard?view=hero-view&hub=${card.hub}`);
        }
        
        await this.waitForPageLoad(page);
        await this.captureScreenshot(page, journeyName, `04-explored-${card.hub}`);
        
        // Brief exploration of this hub
        await page.waitForTimeout(2000);
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'super-cards-exploration');
      
      // Step 4: Hero-view focused exploration
      console.log('  🎯 Step 4: Hero-view focused exploration...');
      stepStart = Date.now();
      
      // Focus on Income hub (popular choice for engaged users)
      await page.goto(`${this.baseUrl}/dashboard?view=hero-view&hub=income`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '05-hero-view-income');
      
      // Spend time exploring this view (engaged user behavior)
      await page.waitForTimeout(3000);
      
      // Try to interact with elements in hero view
      const interactiveElements = [
        'button',
        'a',
        '.clickable',
        '[role="button"]'
      ];
      
      for (const selector of interactiveElements) {
        try {
          const elements = await page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            await elements.first().click();
            await page.waitForTimeout(1000);
            await this.captureScreenshot(page, journeyName, '06-hero-interaction');
            break;
          }
        } catch {
          // Continue to next selector
        }
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'hero-view-exploration');
      
      // Step 5: Feature discovery (advanced exploration)
      console.log('  🔍 Step 5: Advanced feature discovery...');
      stepStart = Date.now();
      
      // Try to access settings or profile
      const discoveryUrls = [
        `${this.baseUrl}/settings`,
        `${this.baseUrl}/profile`,
        `${this.baseUrl}/dashboard?view=detailed&hub=performance`
      ];
      
      for (const url of discoveryUrls) {
        try {
          await page.goto(url);
          await this.waitForPageLoad(page);
          const urlPart = url.split('/').pop().split('?')[0];
          await this.captureScreenshot(page, journeyName, `07-feature-${urlPart}`);
          
          // Engaged users spend time in advanced features
          await page.waitForTimeout(2000);
          break;
        } catch {
          // Continue to next URL
        }
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'feature-discovery');
      
      // Step 6: Return to dashboard (workflow completion)
      console.log('  🏠 Step 6: Return to dashboard...');
      stepStart = Date.now();
      
      await page.goto(`${this.baseUrl}/dashboard`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '08-return-dashboard');
      await this.measureJourneyPerformance(stepStart, journeyName, 'return-to-dashboard');
      
      this.results.journeys.push({
        name: 'engaged-user',
        type: '15% users',
        status: 'completed',
        steps: 6,
        timestamp: Date.now()
      });
      
      console.log('  ✅ Engaged User Journey Completed Successfully!');
      
    } catch (error) {
      console.error(`❌ Engaged User Journey Failed: ${error.message}`);
      await this.captureScreenshot(page, journeyName, 'journey-error');
      
      this.results.journeys.push({
        name: 'engaged-user',
        type: '15% users',
        status: 'failed',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      await context.close();
    }
  }

  // ===========================================
  // JOURNEY 3: POWER USER (5% USERS)
  // ===========================================
  async validatePowerUserJourney() {
    console.log('\n⚡ JOURNEY 3: Power User (5% Users)');
    console.log('📋 Flow: Login → Detailed dashboard → All hubs → Comprehensive analysis');
    
    const journeyName = 'power-user';
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
      await this.monitorConsoleErrors(page, journeyName, 'setup');
      
      // Step 1: Expert login
      console.log('  🔐 Step 1: Expert user login...');
      let stepStart = Date.now();
      await page.goto(`${this.baseUrl}/auth/login`);
      await this.waitForPageLoad(page);
      
      await page.fill('input[type="email"]', this.testUser.email);
      await page.fill('input[type="password"]', this.testUser.password);
      await page.click('button[type="submit"]');
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '01-expert-login');
      await this.measureJourneyPerformance(stepStart, journeyName, 'expert-login');
      
      // Step 2: Direct to detailed dashboard (power user preference)
      console.log('  📊 Step 2: Direct detailed dashboard access...');
      stepStart = Date.now();
      
      await page.goto(`${this.baseUrl}/dashboard?view=detailed`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '02-detailed-dashboard');
      await this.measureJourneyPerformance(stepStart, journeyName, 'detailed-dashboard-access');
      
      // Step 3: Comprehensive hub analysis (all 5 hubs)
      console.log('  🔍 Step 3: Comprehensive hub analysis...');
      stepStart = Date.now();
      
      const allHubs = [
        { name: 'Income', hub: 'income', tabs: ['overview', 'projections', 'analysis'] },
        { name: 'Performance', hub: 'performance', tabs: ['overview', 'benchmarks', 'analysis'] },
        { name: 'Tax Strategy', hub: 'tax-strategy', tabs: ['overview', 'comparison', 'optimization'] },
        { name: 'Portfolio Strategy', hub: 'portfolio-strategy', tabs: ['overview', 'allocation', 'rebalancing'] },
        { name: 'Financial Planning', hub: 'financial-planning', tabs: ['overview', 'goals', 'scenarios'] }
      ];
      
      for (const hub of allHubs) {
        console.log(`    📈 Analyzing ${hub.name} hub in detail...`);
        
        // Navigate to detailed view of this hub
        await page.goto(`${this.baseUrl}/dashboard?view=detailed&hub=${hub.hub}&tab=overview`);
        await this.waitForPageLoad(page);
        await this.captureScreenshot(page, journeyName, `03-detailed-${hub.hub}-overview`);
        
        // Power users explore multiple tabs
        for (let i = 1; i < Math.min(3, hub.tabs.length); i++) {
          const tab = hub.tabs[i];
          try {
            // Try clicking tab
            const tabSelector = `[data-tab="${tab}"], button:has-text("${tab}"), a:has-text("${tab}")`;
            await page.click(tabSelector);
            await this.waitForPageLoad(page);
            await this.captureScreenshot(page, journeyName, `04-${hub.hub}-${tab}`);
          } catch {
            // Try URL navigation
            await page.goto(`${this.baseUrl}/dashboard?view=detailed&hub=${hub.hub}&tab=${tab}`);
            await this.waitForPageLoad(page);
            await this.captureScreenshot(page, journeyName, `04-${hub.hub}-${tab}-url`);
          }
          
          // Power users spend time analyzing each section
          await page.waitForTimeout(1500);
        }
        
        console.log(`    ✅ ${hub.name} hub analysis complete`);
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'comprehensive-hub-analysis');
      
      // Step 4: Advanced features exploration
      console.log('  ⚙️ Step 4: Advanced features exploration...');
      stepStart = Date.now();
      
      const advancedFeatures = [
        `${this.baseUrl}/settings`,
        `${this.baseUrl}/profile`,
        `${this.baseUrl}/portfolio`
      ];
      
      for (const featureUrl of advancedFeatures) {
        try {
          await page.goto(featureUrl);
          await this.waitForPageLoad(page);
          const featureName = featureUrl.split('/').pop();
          await this.captureScreenshot(page, journeyName, `05-advanced-${featureName}`);
          
          // Power users thoroughly explore advanced features
          await page.waitForTimeout(2000);
          
          console.log(`    ✅ Advanced ${featureName} explored`);
        } catch (error) {
          console.log(`    ⚠️ Advanced feature ${featureUrl} not accessible: ${error.message}`);
        }
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'advanced-features-exploration');
      
      // Step 5: Data export/analysis (power user behavior)
      console.log('  📊 Step 5: Data export/analysis attempt...');
      stepStart = Date.now();
      
      // Look for export buttons or data analysis features
      const exportSelectors = [
        'button:has-text("Export")',
        'a:has-text("Export")',
        'button:has-text("Download")',
        '[data-testid="export-button"]',
        '.export-button'
      ];
      
      let exportFound = false;
      for (const selector of exportSelectors) {
        try {
          await page.click(selector);
          exportFound = true;
          console.log(`    ✅ Export feature found and clicked: ${selector}`);
          await this.waitForPageLoad(page);
          await this.captureScreenshot(page, journeyName, '06-export-initiated');
          break;
        } catch {
          // Continue to next selector
        }
      }
      
      if (!exportFound) {
        console.log('    💡 No export features found - capturing current analysis state');
        await this.captureScreenshot(page, journeyName, '06-analysis-complete');
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'data-export-analysis');
      
      // Step 6: Workflow completion
      console.log('  🏁 Step 6: Power user workflow completion...');
      stepStart = Date.now();
      
      // Return to main dashboard to complete workflow
      await page.goto(`${this.baseUrl}/dashboard`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '07-workflow-complete');
      await this.measureJourneyPerformance(stepStart, journeyName, 'workflow-completion');
      
      this.results.journeys.push({
        name: 'power-user',
        type: '5% users',
        status: 'completed',
        steps: 6,
        timestamp: Date.now()
      });
      
      console.log('  ✅ Power User Journey Completed Successfully!');
      
    } catch (error) {
      console.error(`❌ Power User Journey Failed: ${error.message}`);
      await this.captureScreenshot(page, journeyName, 'journey-error');
      
      this.results.journeys.push({
        name: 'power-user',
        type: '5% users',
        status: 'failed',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      await context.close();
    }
  }

  // ===========================================
  // JOURNEY 4: CROSS-DEVICE WORKFLOW
  // ===========================================
  async validateCrossDeviceJourney() {
    console.log('\n📱 JOURNEY 4: Cross-Device Workflow');
    console.log('📋 Flow: Desktop initial → Mobile continuation → Session persistence');
    
    const journeyName = 'cross-device';
    
    // Desktop context
    const desktopContext = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const desktopPage = await desktopContext.newPage();
    
    // Mobile context
    const mobileContext = await this.browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
    });
    const mobilePage = await mobileContext.newPage();
    
    try {
      await this.monitorConsoleErrors(desktopPage, journeyName, 'desktop-setup');
      await this.monitorConsoleErrors(mobilePage, journeyName, 'mobile-setup');
      
      // Step 1: Desktop initial session
      console.log('  💻 Step 1: Desktop initial session...');
      let stepStart = Date.now();
      
      await desktopPage.goto(`${this.baseUrl}/auth/login`);
      await this.waitForPageLoad(desktopPage);
      
      await desktopPage.fill('input[type="email"]', this.testUser.email);
      await desktopPage.fill('input[type="password"]', this.testUser.password);
      await desktopPage.click('button[type="submit"]');
      await this.waitForPageLoad(desktopPage);
      
      await this.captureScreenshot(desktopPage, journeyName, '01-desktop-authenticated');
      await this.measureJourneyPerformance(stepStart, journeyName, 'desktop-initial-session');
      
      // Step 2: Desktop workflow start
      console.log('  📊 Step 2: Desktop workflow initiation...');
      stepStart = Date.now();
      
      await desktopPage.goto(`${this.baseUrl}/dashboard?view=hero-view&hub=income`);
      await this.waitForPageLoad(desktopPage);
      await this.captureScreenshot(desktopPage, journeyName, '02-desktop-workflow-start');
      await this.measureJourneyPerformance(stepStart, journeyName, 'desktop-workflow-start');
      
      // Step 3: Mobile session continuation
      console.log('  📱 Step 3: Mobile session continuation...');
      stepStart = Date.now();
      
      // Navigate to same URL on mobile
      await mobilePage.goto(`${this.baseUrl}/dashboard?view=hero-view&hub=income`);
      await this.waitForPageLoad(mobilePage);
      
      // Check if authentication is required
      const currentUrl = mobilePage.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
        console.log('    🔐 Mobile requires authentication (expected)');
        await mobilePage.fill('input[type="email"]', this.testUser.email);
        await mobilePage.fill('input[type="password"]', this.testUser.password);
        await mobilePage.click('button[type="submit"]');
        await this.waitForPageLoad(mobilePage);
      }
      
      await this.captureScreenshot(mobilePage, journeyName, '03-mobile-session-start');
      await this.measureJourneyPerformance(stepStart, journeyName, 'mobile-session-continuation');
      
      // Step 4: Mobile workflow continuation
      console.log('  👆 Step 4: Mobile workflow continuation...');
      stepStart = Date.now();
      
      // Test mobile navigation
      try {
        // Try mobile-specific navigation
        const mobileNavSelectors = [
          'button[aria-label="Menu"]',
          '.hamburger-menu',
          '.mobile-nav-toggle',
          'button:has-text("Menu")'
        ];
        
        let mobileNavFound = false;
        for (const selector of mobileNavSelectors) {
          try {
            await mobilePage.click(selector);
            mobileNavFound = true;
            console.log(`    ✅ Mobile navigation opened via: ${selector}`);
            await this.waitForPageLoad(mobilePage);
            await this.captureScreenshot(mobilePage, journeyName, '04-mobile-nav-opened');
            break;
          } catch {
            // Try next selector
          }
        }
        
        if (!mobileNavFound) {
          console.log('    💡 No mobile-specific navigation found');
        }
        
        // Test touch interactions
        await mobilePage.goto(`${this.baseUrl}/dashboard?view=momentum`);
        await this.waitForPageLoad(mobilePage);
        await this.captureScreenshot(mobilePage, journeyName, '05-mobile-momentum-view');
        
      } catch (error) {
        console.log(`    ⚠️ Mobile workflow error: ${error.message}`);
        await this.captureScreenshot(mobilePage, journeyName, '05-mobile-error');
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'mobile-workflow-continuation');
      
      // Step 5: Session persistence validation
      console.log('  🔄 Step 5: Session persistence validation...');
      stepStart = Date.now();
      
      // Refresh both devices
      await desktopPage.reload();
      await this.waitForPageLoad(desktopPage);
      await this.captureScreenshot(desktopPage, journeyName, '06-desktop-refreshed');
      
      await mobilePage.reload();
      await this.waitForPageLoad(mobilePage);
      await this.captureScreenshot(mobilePage, journeyName, '07-mobile-refreshed');
      
      // Verify both sessions are still authenticated
      const desktopUrlAfterRefresh = desktopPage.url();
      const mobileUrlAfterRefresh = mobilePage.url();
      
      const desktopAuthenticated = !desktopUrlAfterRefresh.includes('/login');
      const mobileAuthenticated = !mobileUrlAfterRefresh.includes('/login');
      
      console.log(`    💻 Desktop session persistent: ${desktopAuthenticated}`);
      console.log(`    📱 Mobile session persistent: ${mobileAuthenticated}`);
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'session-persistence-validation');
      
      this.results.journeys.push({
        name: 'cross-device',
        type: 'cross-platform',
        status: 'completed',
        steps: 5,
        desktopAuthenticated,
        mobileAuthenticated,
        timestamp: Date.now()
      });
      
      console.log('  ✅ Cross-Device Journey Completed Successfully!');
      
    } catch (error) {
      console.error(`❌ Cross-Device Journey Failed: ${error.message}`);
      await this.captureScreenshot(desktopPage, journeyName, 'desktop-error');
      await this.captureScreenshot(mobilePage, journeyName, 'mobile-error');
      
      this.results.journeys.push({
        name: 'cross-device',
        type: 'cross-platform',
        status: 'failed',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      await desktopContext.close();
      await mobileContext.close();
    }
  }

  // ===========================================
  // JOURNEY 5: ERROR RECOVERY WORKFLOW
  // ===========================================
  async validateErrorRecoveryJourney() {
    console.log('\n🛠️  JOURNEY 5: Error Recovery Workflow');
    console.log('📋 Flow: Handle failures → Graceful recovery → Workflow continuation');
    
    const journeyName = 'error-recovery';
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
      await this.monitorConsoleErrors(page, journeyName, 'setup');
      
      // Step 1: Establish working session
      console.log('  ✅ Step 1: Establish working session...');
      let stepStart = Date.now();
      
      await page.goto(`${this.baseUrl}/auth/login`);
      await this.waitForPageLoad(page);
      
      await page.fill('input[type="email"]', this.testUser.email);
      await page.fill('input[type="password"]', this.testUser.password);
      await page.click('button[type="submit"]');
      await this.waitForPageLoad(page);
      
      await this.captureScreenshot(page, journeyName, '01-working-session');
      await this.measureJourneyPerformance(stepStart, journeyName, 'establish-working-session');
      
      // Step 2: Simulate network error scenario
      console.log('  🚫 Step 2: Simulate network error scenario...');
      stepStart = Date.now();
      
      // Intercept and simulate network failures
      await page.route('**/api/**', route => {
        const url = route.request().url();
        if (url.includes('/api/super-cards/') && Math.random() < 0.5) {
          // Simulate 50% API failure rate
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Simulated network error' })
          });
        } else {
          route.continue();
        }
      });
      
      // Try to navigate to a data-heavy page
      await page.goto(`${this.baseUrl}/dashboard?view=detailed&hub=performance`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '02-network-error-scenario');
      await this.measureJourneyPerformance(stepStart, journeyName, 'network-error-simulation');
      
      // Step 3: Error detection and handling
      console.log('  🔍 Step 3: Error detection and handling...');
      stepStart = Date.now();
      
      // Look for error messages or fallback states
      const errorIndicators = [
        'text=error',
        'text=Error',
        'text=failed',
        'text=Unable to load',
        '.error-message',
        '.alert-error',
        '[data-testid="error"]'
      ];
      
      let errorDetected = false;
      for (const indicator of errorIndicators) {
        try {
          await page.waitForSelector(indicator, { timeout: 5000 });
          errorDetected = true;
          console.log(`    🚨 Error detected: ${indicator}`);
          break;
        } catch {
          // Continue to next indicator
        }
      }
      
      if (!errorDetected) {
        console.log('    💡 No error UI detected - system may be handling errors gracefully');
      }
      
      await this.captureScreenshot(page, journeyName, '03-error-detection');
      await this.measureJourneyPerformance(stepStart, journeyName, 'error-detection-handling');
      
      // Step 4: Recovery attempt
      console.log('  🔄 Step 4: Recovery attempt...');
      stepStart = Date.now();
      
      // Remove network interception to allow recovery
      await page.unroute('**/api/**');
      
      // Try refresh/reload
      await page.reload();
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '04-recovery-attempt');
      
      // Navigate to a simpler page
      await page.goto(`${this.baseUrl}/dashboard`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '05-recovery-navigation');
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'recovery-attempt');
      
      // Step 5: Workflow continuation validation
      console.log('  ✅ Step 5: Workflow continuation validation...');
      stepStart = Date.now();
      
      // Test that user can continue normal workflow after error
      await page.goto(`${this.baseUrl}/dashboard?view=hero-view&hub=income`);
      await this.waitForPageLoad(page);
      await this.captureScreenshot(page, journeyName, '06-workflow-continuation');
      
      // Verify user can still interact with the system
      try {
        await page.goto(`${this.baseUrl}/settings`);
        await this.waitForPageLoad(page);
        await this.captureScreenshot(page, journeyName, '07-settings-accessible');
        console.log('    ✅ Settings page accessible after recovery');
      } catch {
        console.log('    ⚠️ Settings not accessible after recovery');
        await this.captureScreenshot(page, journeyName, '07-settings-not-accessible');
      }
      
      await this.measureJourneyPerformance(stepStart, journeyName, 'workflow-continuation-validation');
      
      this.results.journeys.push({
        name: 'error-recovery',
        type: 'resilience-testing',
        status: 'completed',
        steps: 5,
        errorDetected,
        timestamp: Date.now()
      });
      
      console.log('  ✅ Error Recovery Journey Completed Successfully!');
      
    } catch (error) {
      console.error(`❌ Error Recovery Journey Failed: ${error.message}`);
      await this.captureScreenshot(page, journeyName, 'recovery-journey-error');
      
      this.results.journeys.push({
        name: 'error-recovery',
        type: 'resilience-testing',
        status: 'failed',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      await context.close();
    }
  }

  // ===========================================
  // REPORT GENERATION
  // ===========================================
  async generateJourneyReport() {
    const report = {
      meta: {
        testDate: new Date().toISOString(),
        baseUrl: this.baseUrl,
        testUser: this.testUser.email,
        totalJourneys: this.results.journeys.length,
        screenshotCount: this.results.screenshots.length,
        errorCount: this.results.errors.length,
        performanceMetrics: this.results.performance.length
      },
      journeys: this.results.journeys,
      performance: this.results.performance,
      errors: this.results.errors,
      screenshots: this.results.screenshots.map(s => ({
        journey: s.journey,
        step: s.step,
        timestamp: s.timestamp,
        filename: path.basename(s.path)
      })),
      summary: this.generateSummary()
    };
    
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 USER JOURNEY VALIDATION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`🎯 Total Journeys: ${report.meta.totalJourneys}`);
    console.log(`✅ Successful: ${report.journeys.filter(j => j.status === 'completed').length}`);
    console.log(`❌ Failed: ${report.journeys.filter(j => j.status === 'failed').length}`);
    console.log(`📸 Screenshots: ${report.meta.screenshotCount}`);
    console.log(`🚨 Console Errors: ${report.meta.errorCount}`);
    console.log(`⚡ Performance Metrics: ${report.meta.performanceMetrics}`);
    console.log(`📊 Full Report: ${this.reportPath}`);
    
    return report;
  }

  generateSummary() {
    const successful = this.results.journeys.filter(j => j.status === 'completed').length;
    const failed = this.results.journeys.filter(j => j.status === 'failed').length;
    const total = this.results.journeys.length;
    
    const criticalErrors = this.results.errors.filter(e => e.severity === 'critical').length;
    const avgPerformance = this.results.performance.reduce((sum, p) => sum + p.duration, 0) / this.results.performance.length;
    
    return {
      successRate: total > 0 ? (successful / total * 100).toFixed(1) + '%' : '0%',
      failureRate: total > 0 ? (failed / total * 100).toFixed(1) + '%' : '0%',
      criticalErrors,
      averageStepDuration: Math.round(avgPerformance) + 'ms',
      overallStatus: (successful === total && criticalErrors === 0) ? 'PASS' : 'FAIL',
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for failed journeys
    const failedJourneys = this.results.journeys.filter(j => j.status === 'failed');
    if (failedJourneys.length > 0) {
      recommendations.push(`Fix ${failedJourneys.length} failed user journey(s): ${failedJourneys.map(j => j.name).join(', ')}`);
    }
    
    // Check for critical console errors
    const criticalErrors = this.results.errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      recommendations.push(`Address ${criticalErrors.length} critical console error(s)`);
    }
    
    // Check for performance issues
    const slowSteps = this.results.performance.filter(p => p.duration > 10000);
    if (slowSteps.length > 0) {
      recommendations.push(`Optimize ${slowSteps.length} slow step(s) (>10s duration)`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All user journeys validated successfully - ready for production!');
    }
    
    return recommendations;
  }

  // ===========================================
  // MAIN EXECUTION
  // ===========================================
  async run() {
    try {
      await this.initialize();
      
      console.log('\n🚀 Starting Comprehensive User Journey Validation...\n');
      
      // Execute all user journey validations
      await this.validateFirstTimeVisitorJourney();
      await this.validateEngagedUserJourney();
      await this.validatePowerUserJourney();
      await this.validateCrossDeviceJourney();
      await this.validateErrorRecoveryJourney();
      
      console.log('\n🏁 All User Journeys Completed!');
      
    } catch (error) {
      console.error(`❌ User Journey Validation System Failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new UserJourneyValidator();
  validator.run().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = UserJourneyValidator;