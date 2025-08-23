#!/usr/bin/env node

/**
 * Quick Level 3 Progressive Disclosure Test
 * Simple test to verify the detailed dashboard works after the fix
 */

const { chromium } = require('playwright');

const PRODUCTION_URL = 'https://incomeclarity.ddns.net';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function quickLevel3Test() {
  let browser;
  let page;

  try {
    console.log('🚀 Quick Level 3 Test - Starting...');
    
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // Login
    console.log('🔑 Logging in...');
    await page.goto(`${PRODUCTION_URL}/auth/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Test Level 3
    console.log('🔗 Testing Level 3: /dashboard/super-cards?level=detailed');
    await page.goto(`${PRODUCTION_URL}/dashboard/super-cards?level=detailed`, { timeout: 60000 });
    
    // Wait for the page to be ready
    await page.waitForFunction(() => {
      return document.querySelector('body') && !document.querySelector('body').textContent.includes('Loading...');
    }, { timeout: 30000 });
    
    await page.waitForTimeout(5000); // Give React time to render
    
    // Check for Full Content Dashboard
    const hasFullContentTitle = await page.locator('text=Full Content Dashboard').count() > 0;
    const hasIntelligenceHubs = await page.locator('text=All 5 Intelligence Hubs').count() > 0;
    
    console.log(`📊 Full Content Dashboard Title: ${hasFullContentTitle ? '✅' : '❌'}`);
    console.log(`📊 Intelligence Hubs Text: ${hasIntelligenceHubs ? '✅' : '❌'}`);
    
    // Check for each hub section
    const hubs = ['performance', 'income', 'tax', 'portfolio', 'planning'];
    let hubsFound = 0;
    let tabsFound = 0;
    
    for (const hubId of hubs) {
      const hubExists = await page.locator(`#hub-${hubId}`).count() > 0;
      if (hubExists) {
        hubsFound++;
        console.log(`✅ Hub found: ${hubId}`);
        
        // Check for tabs in this hub
        const tabCount = await page.locator(`#hub-${hubId} [role="tab"]`).count();
        tabsFound += tabCount;
        
        if (tabCount > 0) {
          console.log(`  📑 Tabs in ${hubId}: ${tabCount}`);
        } else {
          console.log(`  ⚠️ No tabs found in ${hubId}`);
        }
      } else {
        console.log(`❌ Hub missing: ${hubId}`);
      }
    }
    
    // Take final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ 
      path: `/public/MasterV2/income-clarity/income-clarity-app/scripts/temp/level3-quick-test-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Summary
    console.log('\n📊 QUICK TEST RESULTS:');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Level 3 Accessible: ${hasFullContentTitle || hasIntelligenceHubs}`);
    console.log(`📋 Hubs Found: ${hubsFound}/5`);
    console.log(`📑 Total Tabs Found: ${tabsFound}`);
    console.log('═══════════════════════════════════════════');
    
    const success = (hasFullContentTitle || hasIntelligenceHubs) && hubsFound >= 5 && tabsFound >= 10;
    console.log(success ? '🎉 LEVEL 3 PROGRESSIVE DISCLOSURE FIXED!' : '⚠️ Still some issues to resolve');
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Quick test failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

quickLevel3Test();