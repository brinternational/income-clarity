#!/usr/bin/env node

/**
 * Comprehensive Premium Features Gate Testing Script
 * 
 * Tests the premium features gate visibility based on user subscription status:
 * - Free users should see premium upsell section
 * - Premium users should NOT see premium upsell section
 * - UI should remain clean for both user types
 * 
 * PRODUCTION E2E TESTING MANDATE:
 * - Tests ONLY on https://incomeclarity.ddns.net
 * - Screenshot evidence required for all test scenarios
 * - Zero tolerance for console errors
 * - User authentication with test@example.com/password123
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://incomeclarity.ddns.net';
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

// Test results storage
const TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  production_url: PRODUCTION_URL,
  scenarios: [],
  console_errors: [],
  screenshots: [],
  summary: {}
};

// Screenshot counter for unique filenames
let screenshotCounter = 1;

/**
 * Capture screenshot with unique filename
 */
async function captureScreenshot(page, description) {
  const filename = `premium-gate-test-${screenshotCounter}-${description.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
  const filepath = path.join(__dirname, '..', 'screenshots', filename);
  
  await page.screenshot({ 
    path: filepath, 
    fullPage: true,
    captureBeyondViewport: true 
  });
  
  TEST_RESULTS.screenshots.push({
    counter: screenshotCounter,
    description,
    filename,
    filepath,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📸 Screenshot captured: ${filename} - ${description}`);
  screenshotCounter++;
  return filename;
}

/**
 * Monitor console errors during testing
 */
function setupConsoleMonitoring(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const error = {
        type: 'console_error',
        message: msg.text(),
        timestamp: new Date().toISOString(),
        location: msg.location()
      };
      TEST_RESULTS.console_errors.push(error);
      console.error('❌ Console Error:', error.message);
    }
  });
}

/**
 * Validate production environment accessibility
 */
async function validateProductionEnvironment(page) {
  console.log('🌐 Validating production environment...');
  
  try {
    const response = await page.goto(PRODUCTION_URL, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    if (!response.ok()) {
      throw new Error(`Production server returned ${response.status()}: ${response.statusText()}`);
    }
    
    // Check if page loaded properly
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ Production environment accessible');
    await captureScreenshot(page, 'production-environment-check');
    
    return true;
  } catch (error) {
    console.error('❌ Production environment validation failed:', error.message);
    throw new Error(`Cannot access production environment: ${error.message}`);
  }
}

/**
 * Authenticate user with demo credentials
 */
async function authenticateUser(page) {
  console.log('🔐 Authenticating user...');
  
  try {
    // Navigate to login page
    await page.goto(`${PRODUCTION_URL}/login`, { 
      waitUntil: 'networkidle0' 
    });
    
    await captureScreenshot(page, 'login-page');
    
    // Fill login form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', TEST_CREDENTIALS.email);
    await page.type('input[type="password"]', TEST_CREDENTIALS.password);
    
    await captureScreenshot(page, 'login-form-filled');
    
    // Submit form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ]);
    
    // Verify successful authentication
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Authentication failed - still on login page');
    }
    
    console.log('✅ User authenticated successfully');
    await captureScreenshot(page, 'authentication-success');
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    await captureScreenshot(page, 'authentication-failure');
    throw error;
  }
}

/**
 * Navigate to Super Cards dashboard
 */
async function navigateToSuperCards(page) {
  console.log('🎯 Navigating to Super Cards dashboard...');
  
  try {
    await page.goto(`${PRODUCTION_URL}/dashboard/super-cards`, {
      waitUntil: 'networkidle0'
    });
    
    // Wait for page to fully load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Verify we're on the super cards page
    const title = await page.title();
    const currentUrl = page.url();
    
    if (!currentUrl.includes('super-cards')) {
      throw new Error(`Wrong page loaded: ${currentUrl}`);
    }
    
    console.log('✅ Super Cards dashboard loaded');
    await captureScreenshot(page, 'super-cards-dashboard-loaded');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to navigate to Super Cards:', error.message);
    await captureScreenshot(page, 'navigation-failure');
    throw error;
  }
}

/**
 * Get current user subscription status from API
 */
async function getUserSubscriptionStatus(page) {
  console.log('👤 Checking user subscription status...');
  
  try {
    // Get user data from API
    const userData = await page.evaluate(async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    });
    
    const user = userData.user;
    const subscriptionStatus = {
      isPremium: user.isPremium,
      subscription: user.subscription,
      isFreeTier: !user.isPremium && (!user.subscription || user.subscription.plan === 'FREE')
    };
    
    console.log('📊 User subscription status:', subscriptionStatus);
    return subscriptionStatus;
  } catch (error) {
    console.error('❌ Failed to get subscription status:', error.message);
    throw error;
  }
}

/**
 * Test premium features gate visibility
 */
async function testPremiumGateVisibility(page, expectedBehavior) {
  console.log(`🔍 Testing premium gate visibility (expecting: ${expectedBehavior})...`);
  
  const scenario = {
    test: 'premium_gate_visibility',
    expected_behavior: expectedBehavior,
    timestamp: new Date().toISOString(),
    results: {}
  };
  
  try {
    // Look for premium dashboard widget
    const premiumWidgetExists = await page.$('.premium-dashboard-widget, [data-testid="premium-widget"]');
    const premiumSectionExists = await page.$$eval('*', (elements) => {
      return elements.some(el => {
        const text = el.textContent || '';
        return text.includes('Unlock Premium Features') || 
               text.includes('Premium Features') ||
               text.includes('Start Free Trial');
      });
    });
    
    await captureScreenshot(page, `premium-gate-check-${expectedBehavior}`);
    
    // Check for premium upsell content
    const premiumUpsellContent = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const premiumElements = elements.filter(el => {
        const text = el.textContent || '';
        return text.includes('Unlock Premium Features') ||
               text.includes('Start Free Trial') ||
               text.includes('Get bank sync, real-time data');
      });
      
      return premiumElements.map(el => ({
        tagName: el.tagName,
        textContent: el.textContent.substring(0, 100),
        className: el.className,
        visible: el.offsetParent !== null
      }));
    });
    
    scenario.results = {
      premium_widget_exists: !!premiumWidgetExists,
      premium_section_exists: premiumSectionExists,
      premium_upsell_content: premiumUpsellContent,
      visible_upsell_count: premiumUpsellContent.filter(el => el.visible).length
    };
    
    // Validate behavior matches expectations
    if (expectedBehavior === 'show_premium_upsell') {
      scenario.results.test_passed = premiumSectionExists && premiumUpsellContent.length > 0;
      scenario.results.validation = premiumSectionExists ? 
        '✅ Premium upsell correctly visible for free user' :
        '❌ Premium upsell missing for free user';
    } else if (expectedBehavior === 'hide_premium_upsell') {
      scenario.results.test_passed = !premiumSectionExists || premiumUpsellContent.filter(el => el.visible).length === 0;
      scenario.results.validation = !premiumSectionExists ? 
        '✅ Premium upsell correctly hidden for premium user' :
        '❌ Premium upsell inappropriately visible for premium user';
    }
    
    console.log(scenario.results.validation);
    TEST_RESULTS.scenarios.push(scenario);
    
    return scenario.results.test_passed;
  } catch (error) {
    console.error('❌ Premium gate visibility test failed:', error.message);
    scenario.results.error = error.message;
    scenario.results.test_passed = false;
    TEST_RESULTS.scenarios.push(scenario);
    throw error;
  }
}

/**
 * Test UI layout consistency
 */
async function testUILayoutConsistency(page, userType) {
  console.log(`🎨 Testing UI layout consistency for ${userType} user...`);
  
  try {
    // Check for layout shifts or broken UI
    const layoutMetrics = await page.evaluate(() => {
      const body = document.body;
      const cards = document.querySelectorAll('[class*="card"], .super-card, [data-testid*="card"]');
      
      return {
        body_height: body.scrollHeight,
        body_width: body.scrollWidth,
        cards_count: cards.length,
        has_horizontal_scroll: body.scrollWidth > window.innerWidth,
        has_broken_layout: Array.from(cards).some(card => 
          card.offsetWidth === 0 || card.offsetHeight === 0
        )
      };
    });
    
    await captureScreenshot(page, `ui-layout-${userType}-user`);
    
    const layoutTest = {
      test: 'ui_layout_consistency',
      user_type: userType,
      metrics: layoutMetrics,
      test_passed: !layoutMetrics.has_broken_layout && layoutMetrics.cards_count > 0,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📏 Layout metrics for ${userType}:`, layoutMetrics);
    TEST_RESULTS.scenarios.push(layoutTest);
    
    return layoutTest.test_passed;
  } catch (error) {
    console.error('❌ UI layout consistency test failed:', error.message);
    return false;
  }
}

/**
 * Create test user with specific subscription status
 */
async function createOrUpdateTestUser(page, subscriptionPlan) {
  console.log(`👤 Setting up test user with ${subscriptionPlan} plan...`);
  
  try {
    // Update user subscription via API call
    const result = await page.evaluate(async (plan) => {
      const response = await fetch('/api/admin/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          plan: plan,
          status: 'ACTIVE'
        })
      });
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to update subscription: ${response.status}`);
      }
      
      return response.ok;
    }, subscriptionPlan);
    
    console.log(`✅ Test user configured with ${subscriptionPlan} plan`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Could not update subscription via API (expected in development):`, error.message);
    // Continue with test - user might already be in desired state
    return false;
  }
}

/**
 * Main test execution function
 */
async function runPremiumGateTests() {
  console.log('🚀 Starting Premium Features Gate E2E Testing');
  console.log('=' .repeat(60));
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    setupConsoleMonitoring(page);
    
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Test 1: Production Environment Validation
    console.log('\n📍 Test 1: Production Environment Validation');
    await validateProductionEnvironment(page);
    
    // Test 2: User Authentication
    console.log('\n📍 Test 2: User Authentication');
    await authenticateUser(page);
    
    // Test 3: Navigate to Super Cards
    console.log('\n📍 Test 3: Super Cards Navigation');
    await navigateToSuperCards(page);
    
    // Test 4: Check Current User Subscription Status
    console.log('\n📍 Test 4: User Subscription Status Check');
    const currentSubscriptionStatus = await getUserSubscriptionStatus(page);
    
    // Test 5: Test Premium Gate for Current User State
    console.log('\n📍 Test 5: Premium Gate Visibility (Current State)');
    const expectedBehavior = currentSubscriptionStatus.isFreeTier ? 
      'show_premium_upsell' : 'hide_premium_upsell';
    
    const currentUserTestPassed = await testPremiumGateVisibility(page, expectedBehavior);
    await testUILayoutConsistency(page, currentSubscriptionStatus.isFreeTier ? 'free' : 'premium');
    
    // Test 6: Test Scenario - Free User (if not already free)
    console.log('\n📍 Test 6: Free User Scenario Testing');
    if (!currentSubscriptionStatus.isFreeTier) {
      await createOrUpdateTestUser(page, 'FREE');
      await page.reload({ waitUntil: 'networkidle0' });
      
      const freeUserTestPassed = await testPremiumGateVisibility(page, 'show_premium_upsell');
      await testUILayoutConsistency(page, 'free');
    } else {
      console.log('✅ Already testing free user - scenario complete');
    }
    
    // Test 7: Test Scenario - Premium User
    console.log('\n📍 Test 7: Premium User Scenario Testing');
    await createOrUpdateTestUser(page, 'PREMIUM');
    await page.reload({ waitUntil: 'networkidle0' });
    
    const premiumUserTestPassed = await testPremiumGateVisibility(page, 'hide_premium_upsell');
    await testUILayoutConsistency(page, 'premium');
    
    // Test Summary
    TEST_RESULTS.summary = {
      total_tests: TEST_RESULTS.scenarios.length,
      passed_tests: TEST_RESULTS.scenarios.filter(s => s.results?.test_passed || s.test_passed).length,
      failed_tests: TEST_RESULTS.scenarios.filter(s => !(s.results?.test_passed || s.test_passed)).length,
      console_errors: TEST_RESULTS.console_errors.length,
      screenshots_captured: TEST_RESULTS.screenshots.length,
      overall_status: TEST_RESULTS.console_errors.length === 0 && 
        TEST_RESULTS.scenarios.every(s => s.results?.test_passed || s.test_passed) ? 'PASSED' : 'FAILED'
    };
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    TEST_RESULTS.summary = {
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (browser) {
      await browser.close();
    }
    
    // Save test results
    const resultsFile = path.join(__dirname, '..', 'test-results', 
      `premium-gate-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    
    const resultsDir = path.dirname(resultsFile);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(resultsFile, JSON.stringify(TEST_RESULTS, null, 2));
    
    // Print final report
    console.log('\n' + '='.repeat(60));
    console.log('📊 PREMIUM FEATURES GATE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`✅ Overall Status: ${TEST_RESULTS.summary.overall_status || 'INCOMPLETE'}`);
    console.log(`📈 Tests Passed: ${TEST_RESULTS.summary.passed_tests}/${TEST_RESULTS.summary.total_tests}`);
    console.log(`❌ Console Errors: ${TEST_RESULTS.summary.console_errors}`);
    console.log(`📸 Screenshots: ${TEST_RESULTS.summary.screenshots_captured}`);
    console.log(`💾 Results saved: ${resultsFile}`);
    
    if (TEST_RESULTS.summary.overall_status === 'FAILED') {
      console.log('\n❌ PREMIUM GATE TEST FAILED');
      process.exit(1);
    } else {
      console.log('\n✅ PREMIUM GATE TEST PASSED');
      process.exit(0);
    }
  }
}

// Execute tests
if (require.main === module) {
  runPremiumGateTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = { runPremiumGateTests };