#!/usr/bin/env node

/**
 * Production Hero View Test
 * Tests the hero-view functionality on the production environment
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
  }
];

async function productionHeroViewTest() {
  console.log('🧪 Production Hero View Test Starting...');
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
  
  try {
    // Step 1: Login with more flexible handling
    console.log('🔑 Logging in...');
    await page.goto(`${CONFIG.BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Fill login form
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect - more flexible
    await page.waitForTimeout(5000);
    console.log('✅ Login completed');
    console.log('📍 Post-login URL:', page.url());
    
    // Step 2: Test each Hero View URL
    for (const test of HERO_VIEW_URLS) {
      console.log(`\n🧪 Testing: ${test.url}`);
      console.log(`   Expected Hub: ${test.expectedHub}`);
      
      const fullURL = `${CONFIG.BASE_URL}${test.url}`;
      await page.goto(fullURL, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Check for hero-view elements
      const analysis = await page.evaluate(() => {
        const heroViewElement = document.querySelector('.hero-view[data-level="hero-view"]');
        const backButton = document.querySelector('.back-to-dashboard');
        const h1Text = document.querySelector('h1')?.textContent?.trim();
        
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
          h1Text,
          visibleHubCount,
          dataLevel: heroViewElement?.getAttribute('data-level'),
          dataHub: heroViewElement?.getAttribute('data-hub'),
          url: window.location.href
        };
      });
      
      // Results
      console.log(`   🔍 URL: ${analysis.url}`);
      console.log(`   🔍 H1 Title: "${analysis.h1Text}"`);
      console.log(`   🔍 Hero view element: ${analysis.hasHeroView ? '✅ Found' : '❌ Missing'}`);
      console.log(`   🔍 Back button: ${analysis.hasBackButton ? '✅ Found' : '❌ Missing'}`);
      console.log(`   🔍 Visible hub count: ${analysis.visibleHubCount}`);
      
      if (analysis.hasHeroView && analysis.hasBackButton && analysis.visibleHubCount < 4) {
        console.log(`   🎉 SUCCESS: Hero view working for ${test.url}!`);
        console.log(`      Data Level: ${analysis.dataLevel}`);
        console.log(`      Data Hub: ${analysis.dataHub}`);
      } else if (analysis.visibleHubCount >= 4) {
        console.log(`   ❌ FAILURE: Still showing momentum dashboard (${analysis.visibleHubCount} hubs visible)`);
      } else {
        console.log(`   ⚠️  PARTIAL: Mixed results - may need investigation`);
      }
      
      // Take screenshot for debugging
      const screenshotName = `/tmp/prod-hero-${test.url.replace(/[/?&=]/g, '-')}.png`;
      await page.screenshot({ path: screenshotName, fullPage: false });
      console.log(`   📸 Screenshot: ${screenshotName}`);
    }
    
    // Step 3: Test momentum default
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
      console.log('   ✅ SUCCESS: Momentum dashboard working correctly (shows all hubs)');
    } else {
      console.log('   ❌ FAILURE: Momentum dashboard not showing all hubs');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 Production Hero View Test Complete');
}

// Run test
productionHeroViewTest().catch(console.error);