#!/usr/bin/env node

/**
 * Local Hero View Test (for development validation only)
 * Tests hero-view implementation on localhost before production deployment
 */

const { chromium } = require('playwright');

const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123'
  }
};

async function testLocalHeroView() {
  console.log('🧪 Testing Local Hero View Implementation...');
  console.log('⚠️  WARNING: This is for development validation only');
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
    // Test hero-view URL directly
    console.log('\n🧪 Testing hero-view URL pattern...');
    const heroUrl = `${CONFIG.BASE_URL}/dashboard/super-cards?level=hero-view&hub=performance`;
    await page.goto(heroUrl, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Check for hero-view elements
    const heroCheck = await page.evaluate(() => {
      const heroViewElement = document.querySelector('.hero-view[data-level="hero-view"]');
      const backButton = document.querySelector('.back-to-dashboard');
      const pageTitle = document.querySelector('h1')?.textContent?.trim();
      
      // Count momentum indicators
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
        hasHeroView: !!heroViewElement,
        hasBackButton: !!backButton,
        pageTitle,
        momentumCount,
        heroViewData: heroViewElement ? heroViewElement.getAttribute('data-hub') : null
      };
    });
    
    console.log('📊 RESULTS:');
    console.log(`   Hero-view element: ${heroCheck.hasHeroView ? '✅ Found' : '❌ Missing'}`);
    console.log(`   Back button: ${heroCheck.hasBackButton ? '✅ Found' : '❌ Missing'}`);
    console.log(`   Page title: "${heroCheck.pageTitle}"`);
    console.log(`   Momentum count: ${heroCheck.momentumCount}/5`);
    console.log(`   Hero data-hub: ${heroCheck.heroViewData}`);
    
    if (heroCheck.hasHeroView && heroCheck.hasBackButton && heroCheck.momentumCount < 4) {
      console.log('🎉 SUCCESS: Hero-view implementation working locally!');
    } else if (heroCheck.momentumCount >= 4) {
      console.log('❌ FAILURE: Still showing momentum dashboard');
    } else {
      console.log('⚠️  UNCLEAR: Mixed results');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 Local Hero View Test Complete');
  console.log('⚠️  Remember: Production testing required per CLAUDE.md rules');
}

// Run test
testLocalHeroView().catch(console.error);