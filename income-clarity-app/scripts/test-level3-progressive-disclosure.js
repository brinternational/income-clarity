#!/usr/bin/env node

/**
 * Level 3 Progressive Disclosure Test
 * Tests the detailed dashboard view with all 5 Super Cards and tabbed interfaces
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://incomeclarity.ddns.net';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

class Level3ProgressiveDisclosureTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      level3Access: false,
      hubsRendered: [],
      tabsFound: {},
      screenshots: [],
      errors: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing Level 3 Progressive Disclosure Test...');
    
    this.browser = await chromium.launch({
      headless: true, // Run headless on server
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set up error monitoring
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.errors.push(`Console Error: ${msg.text()}`);
      }
    });
    
    this.page.on('pageerror', error => {
      this.results.errors.push(`Page Error: ${error.message}`);
    });
    
    console.log('✅ Browser initialized successfully');
  }

  async login() {
    console.log('🔑 Logging in...');
    
    try {
      await this.page.goto(`${PRODUCTION_URL}/auth/login`);
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
      
      // Fill login form
      await this.page.fill('input[type="email"]', TEST_USER.email);
      await this.page.fill('input[type="password"]', TEST_USER.password);
      
      // Submit login
      await this.page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await this.page.waitForURL('**/dashboard**', { timeout: 30000 });
      console.log('✅ Login successful');
      
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async testLevel3ProgressiveDisclosure() {
    console.log('📊 Testing Level 3 Progressive Disclosure...');
    
    try {
      // Navigate to Level 3 detailed view
      const level3URL = `${PRODUCTION_URL}/dashboard/super-cards?level=detailed`;
      console.log(`🔗 Navigating to: ${level3URL}`);
      
      await this.page.goto(level3URL);
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
      
      // Wait for loading to complete - look for FullContentDashboard content
      console.log('⏳ Waiting for FullContentDashboard to load...');
      try {
        await this.page.waitForSelector('.detailed-dashboard', { timeout: 10000 });
        console.log('✅ Found .detailed-dashboard element');
      } catch (e) {
        console.log('⚠️ .detailed-dashboard not found, checking alternative selectors...');
        
        // Try waiting for the Full Content Dashboard title
        await this.page.waitForSelector('text=Full Content Dashboard', { timeout: 10000 });
        console.log('✅ Found Full Content Dashboard title');
      }
      
      // Wait a bit more for React components to fully render
      await this.page.waitForTimeout(3000);
      
      // Take initial screenshot
      const screenshotPath = path.join(__dirname, 'temp', `level3-detailed-view-${Date.now()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.results.screenshots.push(screenshotPath);
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      
      // Check if Level 3 view is active by looking for Full Content Dashboard elements
      const fullContentTitle = await this.page.locator('text=Full Content Dashboard').count();
      const detailedDashboard = await this.page.locator('.detailed-dashboard').count();
      
      this.results.level3Access = fullContentTitle > 0 || detailedDashboard > 0;
      
      if (!this.results.level3Access) {
        // Additional check - look for "All 5 Intelligence Hubs" text
        const intelligenceHubs = await this.page.locator('text=All 5 Intelligence Hubs').count();
        this.results.level3Access = intelligenceHubs > 0;
      }
      
      if (!this.results.level3Access) {
        console.log('⚠️ Level 3 detailed view indicators not found');
        console.log('🔍 Page content preview:');
        const bodyText = await this.page.textContent('body');
        console.log(bodyText.substring(0, 500) + '...');
      }
      
      console.log('✅ Level 3 detailed view active');
      
      // Test all 5 Super Cards are rendered
      const expectedHubs = ['performance', 'income', 'tax', 'portfolio', 'planning'];
      
      for (const hubId of expectedHubs) {
        const hubElement = await this.page.locator(`#hub-${hubId}`).count();
        
        if (hubElement > 0) {
          this.results.hubsRendered.push(hubId);
          console.log(`✅ ${hubId} hub rendered`);
          
          // Check for tabbed interface within each hub
          const tabs = await this.page.locator(`#hub-${hubId} [role="tab"]`).count();
          this.results.tabsFound[hubId] = tabs;
          
          if (tabs > 0) {
            console.log(`✅ ${hubId} has ${tabs} tabs`);
            
            // Take screenshot of each hub
            const hubScreenshot = path.join(__dirname, 'temp', `hub-${hubId}-${Date.now()}.png`);
            await this.page.locator(`#hub-${hubId}`).screenshot({ path: hubScreenshot });
            this.results.screenshots.push(hubScreenshot);
            
          } else {
            console.log(`⚠️ ${hubId} has no tabs - potential fallback behavior`);
          }
        } else {
          console.log(`❌ ${hubId} hub not found`);
        }
      }
      
      // Test tab interactions on first hub (Performance)
      if (this.results.tabsFound.performance > 0) {
        console.log('🖱️ Testing tab interactions on Performance Hub...');
        
        const performanceHub = this.page.locator('#hub-performance');
        const tabs = performanceHub.locator('[role="tab"]');
        const tabCount = await tabs.count();
        
        for (let i = 0; i < Math.min(tabCount, 3); i++) { // Test first 3 tabs
          const tab = tabs.nth(i);
          const tabText = await tab.textContent();
          
          console.log(`🖱️ Clicking tab: ${tabText}`);
          await tab.click();
          await this.page.waitForTimeout(1000); // Wait for tab content to load
          
          // Take screenshot of tab content
          const tabScreenshot = path.join(__dirname, 'temp', `performance-tab-${i}-${Date.now()}.png`);
          await performanceHub.screenshot({ path: tabScreenshot });
          this.results.screenshots.push(tabScreenshot);
        }
      }
      
      console.log('✅ Level 3 Progressive Disclosure test completed');
      
    } catch (error) {
      throw new Error(`Level 3 test failed: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('📝 Generating test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: `${PRODUCTION_URL}/dashboard/super-cards?level=detailed`,
      results: this.results,
      summary: {
        level3Accessible: this.results.level3Access,
        hubsRendered: this.results.hubsRendered.length,
        totalTabsFound: Object.values(this.results.tabsFound).reduce((sum, count) => sum + count, 0),
        screenshotCount: this.results.screenshots.length,
        errorCount: this.results.errors.length
      }
    };
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'temp', `level3-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 TEST RESULTS SUMMARY:');
    console.log('════════════════════════════════════════');
    console.log(`✅ Level 3 Accessible: ${report.summary.level3Accessible}`);
    console.log(`📋 Hubs Rendered: ${report.summary.hubsRendered}/5`);
    console.log(`📑 Total Tabs Found: ${report.summary.totalTabsFound}`);
    console.log(`📸 Screenshots: ${report.summary.screenshotCount}`);
    console.log(`❌ Errors: ${report.summary.errorCount}`);
    console.log('════════════════════════════════════════');
    
    if (this.results.errors.length > 0) {
      console.log('❌ ERRORS DETECTED:');
      this.results.errors.forEach(error => console.log(`   ${error}`));
    }
    
    console.log(`📄 Full report saved: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function runLevel3Test() {
  const test = new Level3ProgressiveDisclosureTest();
  
  try {
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    await test.initialize();
    await test.login();
    await test.testLevel3ProgressiveDisclosure();
    
    const report = await test.generateReport();
    
    // Success criteria
    const success = report.summary.level3Accessible && 
                   report.summary.hubsRendered >= 5 && 
                   report.summary.totalTabsFound >= 10; // Expect at least 2 tabs per hub
    
    console.log(success ? '🎉 LEVEL 3 PROGRESSIVE DISCLOSURE TEST PASSED!' : '❌ LEVEL 3 PROGRESSIVE DISCLOSURE TEST FAILED!');
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  } finally {
    await test.cleanup();
  }
}

if (require.main === module) {
  runLevel3Test();
}

module.exports = { Level3ProgressiveDisclosureTest };