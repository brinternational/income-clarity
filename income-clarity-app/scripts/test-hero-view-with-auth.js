#!/usr/bin/env node

/**
 * Hero View Test with Authentication
 * Tests hero-view implementation with proper login
 */

const { chromium } = require('playwright');

const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123'
  }
};

async function testHeroViewWithAuth() {
  console.log('🧪 Testing Hero View with Authentication...');
  console.log('📍 Testing on:', CONFIG.BASE_URL);
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  try {
    // Step 1: Login first
    console.log('\n🔑 Step 1: Logging in...');
    await page.goto(`${CONFIG.BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Fill login form
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    console.log('✅ Login completed');
    console.log('📍 Post-login URL:', page.url());
    
    // Step 2: Test hero-view URL
    console.log('\n🧪 Step 2: Testing hero-view URL...');
    const heroUrl = `${CONFIG.BASE_URL}/dashboard/super-cards?level=hero-view&hub=performance`;
    console.log('📍 Hero URL:', heroUrl);
    
    await page.goto(heroUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Analyze the page
    const analysis = await page.evaluate(() => {
      const url = window.location.href;
      const title = document.title;
      const h1Text = document.querySelector('h1')?.textContent?.trim() || 'No H1';
      
      // Get search params from URL
      const urlObj = new URL(url);
      const searchParams = Object.fromEntries(urlObj.searchParams);
      
      // Look for hero-view elements
      const heroElements = Array.from(document.querySelectorAll('.hero-view')).map(el => ({
        className: el.className,
        dataLevel: el.getAttribute('data-level'),
        dataHub: el.getAttribute('data-hub'),
        textContent: el.textContent.substring(0, 100)
      }));
      
      const backButtons = Array.from(document.querySelectorAll('.back-to-dashboard')).map(el => ({
        className: el.className,
        textContent: el.textContent.trim()
      }));
      
      // Count momentum indicators (all hubs visible)
      const momentumIndicators = [
        'Performance Hub',
        'Income Intelligence', 
        'Tax Strategy',
        'Portfolio Strategy',
        'Financial Planning'
      ];
      
      let momentumCount = 0;
      momentumIndicators.forEach(indicator => {
        if (document.body.textContent.includes(indicator)) {
          momentumCount++;
        }
      });
      
      return {
        url,
        title,
        h1Text,
        searchParams,
        heroElements,
        backButtons,
        momentumCount
      };
    });
    
    console.log('\n📊 HERO VIEW ANALYSIS:');
    console.log('   Final URL:', analysis.url);
    console.log('   Title:', analysis.title);
    console.log('   H1:', analysis.h1Text);
    console.log('   Search Params:', JSON.stringify(analysis.searchParams, null, 2));
    console.log('   Hero Elements:', analysis.heroElements.length);
    console.log('   Back Buttons:', analysis.backButtons.length);
    console.log('   Momentum Count:', analysis.momentumCount);
    
    // Results
    if (analysis.heroElements.length > 0 && analysis.backButtons.length > 0) {
      console.log('\n🎉 SUCCESS: Hero-view implementation working!');
      console.log('   ✅ Hero elements found');
      console.log('   ✅ Back buttons found');
      console.log(`   ✅ Momentum count: ${analysis.momentumCount} (should be < 4 for hero-view)`);
      
      analysis.heroElements.forEach((hero, i) => {
        console.log(`   📋 Hero Element ${i}: data-level="${hero.dataLevel}", data-hub="${hero.dataHub}"`);
      });
    } else if (analysis.momentumCount >= 4) {
      console.log('\n❌ FAILURE: Still showing momentum dashboard (all hubs visible)');
      console.log('   🔍 This means the Progressive Disclosure logic is not working');
    } else {
      console.log('\n⚠️  UNCLEAR: Mixed results');
      console.log('   🔍 Neither clear hero-view nor clear momentum');
    }
    
    // Take screenshot
    const screenshotPath = '/tmp/hero-view-auth-test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 Hero View Auth Test Complete');
}

// Run test
testHeroViewWithAuth().catch(console.error);