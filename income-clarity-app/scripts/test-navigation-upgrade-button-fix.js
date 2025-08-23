#!/usr/bin/env node

/**
 * Navigation Upgrade Button Fix Validation
 * Tests PREMIUM-GATE-002: Upgrade navigation menu item visibility
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class NavigationUpgradeButtonValidator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseURL = 'https://incomeclarity.ddns.net';
    this.screenshotDir = 'test-results/navigation-upgrade-validation';
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  async init() {
    console.log('🚀 Initializing Navigation Upgrade Button Validation...');
    
    // Ensure screenshot directory exists
    await fs.mkdir(this.screenshotDir, { recursive: true });
    
    this.browser = await chromium.launch({
      headless: true, // Must be headless in server environment
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(10000);
    
    // Monitor console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    console.log('✅ Browser initialized successfully');
  }

  async login() {
    console.log('🔑 Logging in as test user...');
    
    try {
      await this.page.goto(`${this.baseURL}/login`);
      await this.page.waitForLoadState('networkidle');
      
      // Fill login form
      await this.page.fill('input[type="email"]', 'test@example.com');
      await this.page.fill('input[type="password"]', 'password123');
      
      // Click login and wait for navigation
      await this.page.click('button[type="submit"]');
      await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
      
      console.log('✅ Login successful');
      return true;
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      return false;
    }
  }

  async testDesktopNavigation() {
    console.log('🖥️ Testing Desktop Navigation...');
    
    try {
      // Set desktop viewport
      await this.page.setViewportSize({ width: 1280, height: 720 });
      
      // Navigate to Super Cards page
      await this.page.goto(`${this.baseURL}/dashboard/super-cards`);
      await this.page.waitForLoadState('networkidle');
      
      // Check if upgrade button exists in desktop navigation
      const upgradeButton = await this.page.locator('nav button:has-text("Upgrade")').first();
      const isVisible = await upgradeButton.isVisible();
      
      // Get user subscription status from API
      const userResponse = await this.page.request.get(`${this.baseURL}/api/auth/me`);
      const userData = await userResponse.json();
      const isFreeTier = !userData.user?.isPremium && 
                        userData.user?.subscription?.plan !== 'PREMIUM' && 
                        userData.user?.subscription?.plan !== 'ENTERPRISE';
      
      console.log(`📊 User Status: ${isFreeTier ? 'FREE TIER' : 'PREMIUM'}`);
      console.log(`👁️ Upgrade Button Visible: ${isVisible}`);
      
      // Take screenshot of desktop navigation
      await this.page.screenshot({
        path: path.join(this.screenshotDir, `desktop-navigation-${isFreeTier ? 'free' : 'premium'}.png`),
        fullPage: false
      });
      
      // Validate logic: Free users should see upgrade, Premium users should not
      const testPassed = isFreeTier ? isVisible : !isVisible;
      
      this.addTestResult('Desktop Navigation Upgrade Button', testPassed, {
        userTier: isFreeTier ? 'free' : 'premium',
        upgradeButtonVisible: isVisible,
        expected: isFreeTier ? 'visible' : 'hidden',
        screenshotPath: `desktop-navigation-${isFreeTier ? 'free' : 'premium'}.png`
      });
      
      return testPassed;
    } catch (error) {
      console.log('❌ Desktop navigation test failed:', error.message);
      this.addTestResult('Desktop Navigation Upgrade Button', false, {
        error: error.message
      });
      return false;
    }
  }

  async testMobileNavigation() {
    console.log('📱 Testing Mobile Navigation...');
    
    try {
      // Set mobile viewport
      await this.page.setViewportSize({ width: 375, height: 812 });
      
      // Navigate to Super Cards page
      await this.page.goto(`${this.baseURL}/dashboard/super-cards`);
      await this.page.waitForLoadState('networkidle');
      
      // Click mobile menu button
      const menuButton = await this.page.locator('button:has(svg)').filter({ hasText: 'Menu' }).or(
        this.page.locator('nav button').last()
      );
      await menuButton.click();
      
      // Wait for mobile menu to appear
      await this.page.waitForTimeout(500);
      
      // Check if upgrade button exists in mobile navigation
      const mobileUpgradeButton = await this.page.locator('.md\\:hidden button:has-text("Upgrade")').first();
      const isVisible = await mobileUpgradeButton.isVisible();
      
      // Get user subscription status from API
      const userResponse = await this.page.request.get(`${this.baseURL}/api/auth/me`);
      const userData = await userResponse.json();
      const isFreeTier = !userData.user?.isPremium && 
                        userData.user?.subscription?.plan !== 'PREMIUM' && 
                        userData.user?.subscription?.plan !== 'ENTERPRISE';
      
      console.log(`📊 Mobile User Status: ${isFreeTier ? 'FREE TIER' : 'PREMIUM'}`);
      console.log(`👁️ Mobile Upgrade Button Visible: ${isVisible}`);
      
      // Take screenshot of mobile navigation
      await this.page.screenshot({
        path: path.join(this.screenshotDir, `mobile-navigation-${isFreeTier ? 'free' : 'premium'}.png`),
        fullPage: false
      });
      
      // Validate logic: Free users should see upgrade, Premium users should not
      const testPassed = isFreeTier ? isVisible : !isVisible;
      
      this.addTestResult('Mobile Navigation Upgrade Button', testPassed, {
        userTier: isFreeTier ? 'free' : 'premium',
        upgradeButtonVisible: isVisible,
        expected: isFreeTier ? 'visible' : 'hidden',
        screenshotPath: `mobile-navigation-${isFreeTier ? 'free' : 'premium'}.png`
      });
      
      return testPassed;
    } catch (error) {
      console.log('❌ Mobile navigation test failed:', error.message);
      this.addTestResult('Mobile Navigation Upgrade Button', false, {
        error: error.message
      });
      return false;
    }
  }

  async testProfileDropdownNavigation() {
    console.log('👤 Testing Profile Dropdown Navigation...');
    
    try {
      // Set desktop viewport for profile dropdown
      await this.page.setViewportSize({ width: 1280, height: 720 });
      
      // Navigate to Super Cards page
      await this.page.goto(`${this.baseURL}/dashboard/super-cards`);
      await this.page.waitForLoadState('networkidle');
      
      // Click user menu button
      const userMenuButton = await this.page.locator('[data-testid="user-menu"]');
      await userMenuButton.click();
      
      // Wait for dropdown to appear
      await this.page.waitForTimeout(500);
      
      // Check if upgrade button exists in profile dropdown
      const upgradeInDropdown = await this.page.locator('.absolute button:has-text("Upgrade to Premium")').first();
      const isVisible = await upgradeInDropdown.isVisible();
      
      // Get user subscription status from API
      const userResponse = await this.page.request.get(`${this.baseURL}/api/auth/me`);
      const userData = await userResponse.json();
      const isFreeTier = !userData.user?.isPremium && 
                        userData.user?.subscription?.plan !== 'PREMIUM' && 
                        userData.user?.subscription?.plan !== 'ENTERPRISE';
      
      console.log(`📊 Profile Dropdown User Status: ${isFreeTier ? 'FREE TIER' : 'PREMIUM'}`);
      console.log(`👁️ Profile Dropdown Upgrade Visible: ${isVisible}`);
      
      // Take screenshot of profile dropdown
      await this.page.screenshot({
        path: path.join(this.screenshotDir, `profile-dropdown-${isFreeTier ? 'free' : 'premium'}.png`),
        fullPage: false
      });
      
      // Validate logic: Free users should see upgrade, Premium users should not
      const testPassed = isFreeTier ? isVisible : !isVisible;
      
      this.addTestResult('Profile Dropdown Upgrade Button', testPassed, {
        userTier: isFreeTier ? 'free' : 'premium',
        upgradeButtonVisible: isVisible,
        expected: isFreeTier ? 'visible' : 'hidden',
        screenshotPath: `profile-dropdown-${isFreeTier ? 'free' : 'premium'}.png`
      });
      
      return testPassed;
    } catch (error) {
      console.log('❌ Profile dropdown test failed:', error.message);
      this.addTestResult('Profile Dropdown Upgrade Button', false, {
        error: error.message
      });
      return false;
    }
  }

  async testUpgradeButtonFunctionality() {
    console.log('🔗 Testing Upgrade Button Functionality...');
    
    try {
      // Set desktop viewport
      await this.page.setViewportSize({ width: 1280, height: 720 });
      
      // Navigate to Super Cards page
      await this.page.goto(`${this.baseURL}/dashboard/super-cards`);
      await this.page.waitForLoadState('networkidle');
      
      // Try to find and click upgrade button
      const upgradeButton = await this.page.locator('nav button:has-text("Upgrade")').first();
      
      if (await upgradeButton.isVisible()) {
        // Click upgrade button and verify it navigates to pricing
        await upgradeButton.click();
        await this.page.waitForURL('**/pricing**', { timeout: 5000 });
        
        // Take screenshot of pricing page
        await this.page.screenshot({
          path: path.join(this.screenshotDir, 'upgrade-navigation-to-pricing.png'),
          fullPage: false
        });
        
        this.addTestResult('Upgrade Button Navigation', true, {
          destination: 'pricing page',
          screenshotPath: 'upgrade-navigation-to-pricing.png'
        });
        
        return true;
      } else {
        console.log('⚠️ Upgrade button not visible - likely premium user');
        this.addTestResult('Upgrade Button Navigation', true, {
          reason: 'upgrade button hidden for premium user',
          note: 'this is expected behavior'
        });
        return true;
      }
    } catch (error) {
      console.log('❌ Upgrade button functionality test failed:', error.message);
      this.addTestResult('Upgrade Button Navigation', false, {
        error: error.message
      });
      return false;
    }
  }

  addTestResult(testName, passed, details = {}) {
    const result = {
      testName,
      passed,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.results.tests.push(result);
    this.results.summary.total++;
    if (passed) {
      this.results.summary.passed++;
      console.log(`✅ ${testName}: PASSED`);
    } else {
      this.results.summary.failed++;
      console.log(`❌ ${testName}: FAILED`);
    }
    
    if (details.error) {
      console.log(`   Error: ${details.error}`);
    }
  }

  async generateReport() {
    const reportPath = path.join(this.screenshotDir, 'navigation-upgrade-button-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 Test Results Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`📊 Total:  ${this.results.summary.total}`);
    console.log(`📋 Report: ${reportPath}`);
    console.log(`📸 Screenshots: ${this.screenshotDir}/`);
    
    return this.results.summary.failed === 0;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function runNavigationUpgradeButtonValidation() {
  const validator = new NavigationUpgradeButtonValidator();
  
  try {
    await validator.init();
    
    // Login first
    const loginSuccess = await validator.login();
    if (!loginSuccess) {
      throw new Error('Login failed');
    }
    
    // Run all navigation tests
    await validator.testDesktopNavigation();
    await validator.testMobileNavigation();
    await validator.testProfileDropdownNavigation();
    await validator.testUpgradeButtonFunctionality();
    
    // Generate final report
    const allTestsPassed = await validator.generateReport();
    
    if (allTestsPassed) {
      console.log('\n🎉 All navigation upgrade button tests passed!');
      console.log('✅ PREMIUM-GATE-002: Navigation upgrade menu visibility fix validated');
    } else {
      console.log('\n⚠️ Some tests failed. Check the report for details.');
    }
    
    return allTestsPassed;
  } catch (error) {
    console.error('❌ Navigation upgrade button validation failed:', error.message);
    return false;
  } finally {
    await validator.cleanup();
  }
}

// Run validation if called directly
if (require.main === module) {
  runNavigationUpgradeButtonValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { NavigationUpgradeButtonValidator, runNavigationUpgradeButtonValidation };