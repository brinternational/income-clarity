#!/usr/bin/env node

/**
 * Hero View Fix Verification Script
 * Tests that the Progressive Disclosure URL patterns work correctly
 */

const { chromium } = require('playwright');

const CONFIG = {
  BASE_URL: 'https://incomeclarity.ddns.net',
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123'
  }
};

const HERO_VIEW_URLS = [
  {
    url: '/dashboard/super-cards?level=hero-view&hub=performance',
    expectedHub: 'Performance Hub'
  },
  {
    url: '/dashboard/super-cards?level=hero-view&hub=income-tax',
    expectedHub: 'Income Intelligence'
  },
  {
    url: '/dashboard/super-cards?level=hero-view&hub=portfolio',
    expectedHub: 'Portfolio Strategy'
  },
  {
    url: '/dashboard/super-cards?level=hero-view&hub=planning',
    expectedHub: 'Financial Planning'
  }
];

async function testHeroViewFix() {
  console.log('🧪 Testing Hero View Fix Implementation...');
  
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
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  try {
    // Step 1: Login
    console.log('🔑 Attempting login...');
    await page.goto(`${CONFIG.BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 15000 });
    
    try {
      await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
      await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Wait for redirect - more flexible than specific URL
      await page.waitForTimeout(3000);
      console.log('✅ Login attempt completed');
      console.log('📍 Current URL:', page.url());
      
    } catch (loginError) {
      console.log('⚠️  Login timeout - continuing with direct URL tests');
    }
    
    // Step 2: Test each Hero View URL
    for (const test of HERO_VIEW_URLS) {
      console.log(`\n🧪 Testing: ${test.url}`);
      console.log(`   Expected Hub: ${test.expectedHub}`);
      
      const fullURL = `${CONFIG.BASE_URL}${test.url}`;
      await page.goto(fullURL, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Check for hero-view elements
      const heroViewDetection = await page.evaluate(() => {
        const heroViewElement = document.querySelector('.hero-view[data-level="hero-view"]');
        const backButton = document.querySelector('.back-to-dashboard');
        const heroTitle = document.querySelector('h1');
        
        // Count all hub titles visible (momentum check)
        const allHubTitles = [
          'Performance Hub',
          'Income Intelligence', 
          'Tax Strategy',
          'Portfolio Strategy',
          'Financial Planning'
        ];
        
        let visibleHubCount = 0;
        allHubTitles.forEach(title => {
          if (document.body.textContent.includes(title)) {
            visibleHubCount++;
          }
        });
        
        return {
          hasHeroView: !!heroViewElement,
          hasBackButton: !!backButton,
          heroTitle: heroTitle ? heroTitle.textContent.trim() : null,
          visibleHubCount,
          pageText: document.body.textContent.substring(0, 500) // First 500 chars for debugging
        };
      });
      
      // Analysis
      console.log(`   🔍 Hero view element: ${heroViewDetection.hasHeroView ? '✅ Found' : '❌ Missing'}`);
      console.log(`   🔍 Back button: ${heroViewDetection.hasBackButton ? '✅ Found' : '❌ Missing'}`);
      console.log(`   🔍 Page title: "${heroViewDetection.heroTitle}"`);
      console.log(`   🔍 Visible hub count: ${heroViewDetection.visibleHubCount}`);
      
      if (heroViewDetection.visibleHubCount >= 4) {
        console.log('   ❌ RESULT: Still showing momentum dashboard (all hubs visible)');
      } else if (heroViewDetection.hasHeroView && heroViewDetection.hasBackButton) {
        console.log('   ✅ RESULT: Hero view working correctly!');
      } else {
        console.log('   ⚠️  RESULT: Uncertain - not momentum but hero view elements unclear');
        console.log('   📝 Page preview:', heroViewDetection.pageText.substring(0, 200) + '...');
      }
      
      // Take screenshot for debugging
      const screenshotPath = `/tmp/hero-view-${test.url.replace(/[/?&=]/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`   📸 Screenshot saved: ${screenshotPath}`);
    }
    
    // Step 3: Test momentum default (no parameters)
    console.log('\n🧪 Testing momentum default (no parameters)...');
    await page.goto(`${CONFIG.BASE_URL}/dashboard/super-cards`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const momentumCheck = await page.evaluate(() => {
      const allHubTitles = [
        'Performance Hub',
        'Income Intelligence', 
        'Tax Strategy',
        'Portfolio Strategy',
        'Financial Planning'
      ];
      
      let visibleHubCount = 0;
      allHubTitles.forEach(title => {
        if (document.body.textContent.includes(title)) {
          visibleHubCount++;
        }
      });
      
      return { visibleHubCount };
    });
    
    console.log(`   🔍 Momentum dashboard hub count: ${momentumCheck.visibleHubCount}`);
    if (momentumCheck.visibleHubCount >= 4) {
      console.log('   ✅ RESULT: Momentum dashboard working correctly (shows all hubs)');
    } else {
      console.log('   ❌ RESULT: Momentum dashboard not showing all hubs');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 Hero View Fix Test Complete');
}

// Run test
testHeroViewFix().catch(console.error);