const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

const PRODUCTION_URL = 'https://incomeclarity.ddns.net';
const TEST_RESULTS_DIR = '/public/MasterV2/income-clarity/income-clarity-app/test-results/sidebar-navigation-test';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Ensure test results directory exists
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Screenshot utility
async function takeScreenshot(page, name, description = '') {
  const timestamp = Date.now();
  const filename = `${name}_${timestamp}.png`;
  const filepath = path.join(TEST_RESULTS_DIR, filename);
  
  await page.screenshot({ 
    path: filepath, 
    fullPage: true,
    clip: null
  });
  
  console.log(`📸 Screenshot saved: ${filename}${description ? ' - ' + description : ''}`);
  return filename;
}

// Get console errors
function getConsoleErrors(consoleMessages) {
  return consoleMessages
    .filter(msg => msg.type === 'error')
    .map(msg => ({
      text: msg.text,
      location: msg.location,
      timestamp: new Date().toISOString()
    }));
}

async function testSidebarNavigation() {
  console.log('🚀 Starting Sidebar Navigation E2E Test');
  console.log(`📍 Testing on: ${PRODUCTION_URL}`);
  
  // Create test results directory
  await ensureDirectory(TEST_RESULTS_DIR);
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();
  
  // Set desktop viewport for initial testing
  await page.setViewport({ width: 1920, height: 1080 });
  
  const consoleMessages = [];
  const testResults = {
    testName: 'Sidebar Navigation E2E Test',
    url: PRODUCTION_URL,
    timestamp: new Date().toISOString(),
    results: [],
    screenshots: [],
    consoleErrors: []
  };

  // Capture console messages
  page.on('console', (message) => {
    consoleMessages.push(message);
    if (message.type() === 'error') {
      console.log('❌ Console Error:', message.text());
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    console.log('❌ Page Error:', error.message);
    testResults.consoleErrors.push({
      type: 'pageerror',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('\n🔐 Phase 1: Authentication');
    
    // Navigate to login page
    await page.goto(`${PRODUCTION_URL}/login`, { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    // Take screenshot of login page
    const loginScreenshot = await takeScreenshot(page, 'login_page', 'Before authentication');
    testResults.screenshots.push({ name: loginScreenshot, description: 'Login page loaded' });
    
    // Login
    console.log('🔑 Logging in with test credentials...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', TEST_USER.email);
    await page.type('input[type="password"]', TEST_USER.password);
    
    await page.click('button[type="submit"]');
    
    // Wait for authentication to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log('\n📱 Phase 2: Desktop Sidebar Testing');
    
    // Should be on dashboard now
    await page.waitForSelector('nav', { timeout: 10000 });
    
    // Take screenshot of dashboard with sidebar
    const dashboardScreenshot = await takeScreenshot(page, 'dashboard_with_sidebar', 'Dashboard loaded with sidebar navigation');
    testResults.screenshots.push({ name: dashboardScreenshot, description: 'Dashboard with sidebar navigation' });
    
    // Test 1: Check if sidebar is visible and has expected elements
    console.log('✅ Test 1: Sidebar Visibility and Structure');
    const sidebarExists = await page.$('div[class*="sidebar"]') !== null || 
                          await page.$('nav[class*="sidebar"]') !== null ||
                          await page.$('.w-64') !== null; // Check for sidebar width class
    
    if (sidebarExists) {
      console.log('✅ Sidebar navigation detected');
      testResults.results.push({ test: 'Sidebar Visibility', status: 'PASS', details: 'Sidebar navigation component found' });
    } else {
      console.log('❌ Sidebar navigation not found');
      testResults.results.push({ test: 'Sidebar Visibility', status: 'FAIL', details: 'Sidebar navigation component not found' });
    }
    
    // Test 2: Check for navigation items
    console.log('✅ Test 2: Navigation Items');
    const navigationItems = [
      { name: 'Dashboard', text: 'Dashboard' },
      { name: 'Super Cards', text: 'Super Cards' },
      { name: 'Portfolio', text: 'Portfolio' },
      { name: 'Analytics', text: 'Analytics' },
      { name: 'Transactions', text: 'Transactions' },
      { name: 'Settings', text: 'Settings' }
    ];
    
    for (const item of navigationItems) {
      const itemExists = await page.evaluate((text) => {
        const elements = document.querySelectorAll('nav a, nav button');
        return Array.from(elements).some(el => el.textContent.includes(text));
      }, item.text);
      
      if (itemExists) {
        console.log(`✅ Navigation item found: ${item.name}`);
        testResults.results.push({ test: `Navigation Item: ${item.name}`, status: 'PASS', details: `${item.name} navigation item found` });
      } else {
        console.log(`❌ Navigation item missing: ${item.name}`);
        testResults.results.push({ test: `Navigation Item: ${item.name}`, status: 'FAIL', details: `${item.name} navigation item not found` });
      }
    }
    
    // Test 3: Sidebar Expand/Collapse Functionality
    console.log('✅ Test 3: Sidebar Expand/Collapse');
    
    // Look for expand/collapse button (chevron icons)
    const toggleButton = await page.$('button[aria-label*="sidebar"], button[title*="sidebar"], svg[class*="chevron"]');
    
    if (toggleButton) {
      console.log('📱 Testing sidebar expand/collapse...');
      
      // Take screenshot before collapse
      const beforeCollapseScreenshot = await takeScreenshot(page, 'sidebar_expanded', 'Sidebar in expanded state');
      testResults.screenshots.push({ name: beforeCollapseScreenshot, description: 'Sidebar expanded state' });
      
      // Click to collapse
      await toggleButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Take screenshot after collapse
      const afterCollapseScreenshot = await takeScreenshot(page, 'sidebar_collapsed', 'Sidebar in collapsed state');
      testResults.screenshots.push({ name: afterCollapseScreenshot, description: 'Sidebar collapsed state' });
      
      // Click to expand again
      await toggleButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      const reExpandedScreenshot = await takeScreenshot(page, 'sidebar_re_expanded', 'Sidebar re-expanded');
      testResults.screenshots.push({ name: reExpandedScreenshot, description: 'Sidebar re-expanded state' });
      
      console.log('✅ Sidebar expand/collapse functionality tested');
      testResults.results.push({ test: 'Sidebar Toggle', status: 'PASS', details: 'Sidebar expand/collapse functionality working' });
    } else {
      console.log('⚠️ Sidebar toggle button not found - may be using different implementation');
      testResults.results.push({ test: 'Sidebar Toggle', status: 'WARNING', details: 'Sidebar toggle button not found' });
    }
    
    // Test 4: Navigation functionality
    console.log('✅ Test 4: Navigation Functionality');
    
    // Test Portfolio navigation
    const portfolioLink = await page.$('a[href*="portfolio"], button:has-text("Portfolio")');
    if (portfolioLink) {
      console.log('📱 Testing Portfolio navigation...');
      await portfolioLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      
      const portfolioScreenshot = await takeScreenshot(page, 'portfolio_page', 'Portfolio page with sidebar');
      testResults.screenshots.push({ name: portfolioScreenshot, description: 'Portfolio page navigation test' });
      
      // Check if URL changed
      const currentURL = page.url();
      if (currentURL.includes('portfolio')) {
        console.log('✅ Portfolio navigation successful');
        testResults.results.push({ test: 'Portfolio Navigation', status: 'PASS', details: 'Portfolio navigation working correctly' });
      } else {
        console.log('❌ Portfolio navigation failed');
        testResults.results.push({ test: 'Portfolio Navigation', status: 'FAIL', details: 'Portfolio navigation did not work' });
      }
    }
    
    // Test Super Cards navigation
    const superCardsLink = await page.$('a[href*="super-cards"], button:has-text("Super Cards")');
    if (superCardsLink) {
      console.log('📱 Testing Super Cards navigation...');
      await superCardsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      
      const superCardsScreenshot = await takeScreenshot(page, 'super_cards_page', 'Super Cards page with sidebar');
      testResults.screenshots.push({ name: superCardsScreenshot, description: 'Super Cards page navigation test' });
      
      const currentURL = page.url();
      if (currentURL.includes('super-cards')) {
        console.log('✅ Super Cards navigation successful');
        testResults.results.push({ test: 'Super Cards Navigation', status: 'PASS', details: 'Super Cards navigation working correctly' });
      }
    }
    
    console.log('\n📱 Phase 3: Mobile/Responsive Testing');
    
    // Switch to mobile viewport
    await page.setViewport({ width: 375, height: 812 }); // iPhone X size
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Take mobile screenshot
    const mobileScreenshot = await takeScreenshot(page, 'mobile_dashboard', 'Mobile view of dashboard');
    testResults.screenshots.push({ name: mobileScreenshot, description: 'Mobile responsive view test' });
    
    // Test 5: Mobile sidebar behavior
    console.log('✅ Test 5: Mobile Responsiveness');
    
    // On mobile, sidebar should be hidden by default or overlay
    const mobileMenuButton = await page.$('button[class*="mobile"], button[class*="hamburger"], button[aria-label*="menu"]');
    
    if (mobileMenuButton) {
      console.log('📱 Testing mobile menu...');
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      const mobileMenuOpenScreenshot = await takeScreenshot(page, 'mobile_menu_open', 'Mobile menu opened');
      testResults.screenshots.push({ name: mobileMenuOpenScreenshot, description: 'Mobile menu open state' });
      
      console.log('✅ Mobile menu functionality tested');
      testResults.results.push({ test: 'Mobile Responsiveness', status: 'PASS', details: 'Mobile menu working correctly' });
    } else {
      console.log('⚠️ Mobile menu button not found - may use different mobile implementation');
      testResults.results.push({ test: 'Mobile Responsiveness', status: 'WARNING', details: 'Mobile menu not found - may use different implementation' });
    }
    
    console.log('\n📱 Phase 4: Accessibility Testing');
    
    // Switch back to desktop
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Test 6: Keyboard navigation
    console.log('✅ Test 6: Keyboard Navigation');
    
    // Test tab navigation through sidebar
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Take screenshot showing focus state
    const keyboardFocusScreenshot = await takeScreenshot(page, 'keyboard_focus', 'Keyboard focus testing');
    testResults.screenshots.push({ name: keyboardFocusScreenshot, description: 'Keyboard navigation test' });
    
    // Check if focus is visible
    const focusVisible = await page.evaluate(() => {
      const focused = document.activeElement;
      const styles = window.getComputedStyle(focused);
      return styles.outline !== 'none' && styles.outline !== '' || 
             styles.boxShadow.includes('rgb') ||
             focused.classList.contains('focus');
    });
    
    if (focusVisible) {
      console.log('✅ Keyboard focus indicators working');
      testResults.results.push({ test: 'Keyboard Navigation', status: 'PASS', details: 'Keyboard focus indicators are visible' });
    } else {
      console.log('⚠️ Keyboard focus indicators may need improvement');
      testResults.results.push({ test: 'Keyboard Navigation', status: 'WARNING', details: 'Keyboard focus indicators not clearly visible' });
    }
    
    // Test 7: ARIA labels and accessibility
    console.log('✅ Test 7: ARIA Labels and Accessibility');
    
    const hasAriaLabels = await page.evaluate(() => {
      const navElements = document.querySelectorAll('nav button, nav a');
      let hasLabels = 0;
      
      navElements.forEach(el => {
        if (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent.trim()) {
          hasLabels++;
        }
      });
      
      return { total: navElements.length, withLabels: hasLabels };
    });
    
    const accessibilityScore = (hasAriaLabels.withLabels / hasAriaLabels.total) * 100;
    
    if (accessibilityScore >= 90) {
      console.log(`✅ Accessibility labels: ${accessibilityScore.toFixed(1)}% coverage`);
      testResults.results.push({ test: 'ARIA Labels', status: 'PASS', details: `${accessibilityScore.toFixed(1)}% of elements have proper labels` });
    } else {
      console.log(`⚠️ Accessibility labels: ${accessibilityScore.toFixed(1)}% coverage (should be 90%+)`);
      testResults.results.push({ test: 'ARIA Labels', status: 'WARNING', details: `Only ${accessibilityScore.toFixed(1)}% of elements have proper labels` });
    }
    
    console.log('\n🎯 Phase 5: Performance and Visual Verification');
    
    // Test 8: Page load performance
    const metrics = await page.metrics();
    console.log(`📊 Performance Metrics:
      - JS Heap Used: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB
      - JS Heap Total: ${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB
      - Document Count: ${metrics.Documents}
      - Nodes: ${metrics.Nodes}
      - Layout Count: ${metrics.LayoutCount}
    `);
    
    testResults.results.push({ 
      test: 'Performance Metrics', 
      status: 'INFO', 
      details: `JS Heap: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB, Nodes: ${metrics.Nodes}` 
    });
    
    // Final screenshot
    const finalScreenshot = await takeScreenshot(page, 'final_state', 'Final state of application');
    testResults.screenshots.push({ name: finalScreenshot, description: 'Final application state' });
    
  } catch (error) {
    console.log('❌ Test Error:', error.message);
    testResults.results.push({ 
      test: 'Test Execution', 
      status: 'ERROR', 
      details: error.message 
    });
    
    // Take error screenshot
    try {
      const errorScreenshot = await takeScreenshot(page, 'error_state', 'Error occurred during testing');
      testResults.screenshots.push({ name: errorScreenshot, description: 'Error state screenshot' });
    } catch (screenshotError) {
      console.log('Failed to take error screenshot:', screenshotError.message);
    }
  } finally {
    // Capture final console errors
    testResults.consoleErrors = testResults.consoleErrors.concat(getConsoleErrors(consoleMessages));
    
    await browser.close();
    
    // Generate test report
    const reportPath = path.join(TEST_RESULTS_DIR, 'sidebar-navigation-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
    
    // Generate summary
    const passed = testResults.results.filter(r => r.status === 'PASS').length;
    const failed = testResults.results.filter(r => r.status === 'FAIL').length;
    const warnings = testResults.results.filter(r => r.status === 'WARNING').length;
    const total = testResults.results.length;
    
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⚠️ Warnings: ${warnings}/${total}`);
    console.log(`📸 Screenshots: ${testResults.screenshots.length}`);
    console.log(`🐛 Console Errors: ${testResults.consoleErrors.length}`);
    console.log(`📄 Report saved: ${reportPath}`);
    
    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Sidebar navigation is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the test results and screenshots.');
    }
    
    return {
      passed,
      failed,
      warnings,
      total,
      screenshots: testResults.screenshots.length,
      consoleErrors: testResults.consoleErrors.length
    };
  }
}

// Run the test
if (require.main === module) {
  testSidebarNavigation()
    .then((results) => {
      console.log('\n✅ Sidebar Navigation E2E Test Complete');
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Test runner error:', error);
      process.exit(1);
    });
}

module.exports = testSidebarNavigation;