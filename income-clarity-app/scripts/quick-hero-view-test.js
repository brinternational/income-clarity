#!/usr/bin/env node

/**
 * Quick Hero View Test
 * Tests if Hero View URLs are working after Progressive Disclosure fix
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
  '/dashboard/super-cards?level=hero-view&hub=performance',
  '/dashboard/super-cards?level=hero-view&hub=income-tax',
  '/dashboard/super-cards?level=hero-view&hub=portfolio',
  '/dashboard/super-cards?level=hero-view&hub=planning'
];

async function quickHeroViewTest() {
  console.log('🧪 Quick Hero View Test Starting...');
  
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
    // Login
    console.log('🔑 Logging in...');
    await page.goto(`${CONFIG.BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/super-cards', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Test each Hero View URL
    for (const testUrl of HERO_VIEW_URLS) {
      console.log(`\n🧪 Testing: ${testUrl}`);
      
      const fullURL = `${CONFIG.BASE_URL}${testUrl}`;
      await page.goto(fullURL, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Check for momentum fallback indicators
      const momentumIndicators = [
        'Performance Hub',
        'Income Tax Hub', 
        'Portfolio Hub',
        'Planning Hub'
      ];
      
      let momentumCount = 0;
      for (const indicator of momentumIndicators) {
        try {
          const isVisible = await page.getByText(indicator).isVisible();
          if (isVisible) momentumCount++;
        } catch (e) {
          // Ignore visibility check errors
        }
      }
      
      // Check for hero view indicators
      let hasHeroViewUI = false;
      try {
        const heroIndicators = await page.locator('.hero-view, [data-level="hero-view"], .back-to-dashboard').count();
        hasHeroViewUI = heroIndicators > 0;
      } catch (e) {
        // Ignore selector errors
      }
      
      // Results
      if (momentumCount >= 4) {
        console.log('❌ STILL FALLBACK - Seeing all 4 hub cards (momentum dashboard)');
      } else if (hasHeroViewUI) {
        console.log('✅ HERO VIEW SUCCESS - Focused hub content detected');
      } else {
        console.log('⚠️  UNCLEAR - Not momentum, but hero view UI uncertain');
      }
      
      console.log(`   Momentum indicators: ${momentumCount}/4`);
      console.log(`   Hero view UI: ${hasHeroViewUI ? 'detected' : 'not detected'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run test
quickHeroViewTest().catch(console.error);