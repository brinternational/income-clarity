#!/usr/bin/env node

/**
 * Debug Hero View Implementation
 * Shows what's actually being rendered for hero-view URLs
 */

const { chromium } = require('playwright');

const CONFIG = {
  BASE_URL: 'http://localhost:3000'
};

async function debugHeroView() {
  console.log('🔍 Debugging Hero View Implementation...');
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
    console.log(`🖥️  Console [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    // Test hero-view URL directly
    console.log('\n🧪 Testing hero-view URL...');
    const heroUrl = `${CONFIG.BASE_URL}/dashboard/super-cards?level=hero-view&hub=performance`;
    console.log('📍 URL:', heroUrl);
    
    await page.goto(heroUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Get page info
    const pageInfo = await page.evaluate(() => {
      const url = window.location.href;
      const title = document.title;
      const h1Text = document.querySelector('h1')?.textContent?.trim() || 'No H1';
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
      
      // Get search params from URL
      const urlObj = new URL(url);
      const searchParams = Object.fromEntries(urlObj.searchParams);
      
      // Get all text content for debugging
      const bodyText = document.body.textContent.substring(0, 500);
      
      return {
        url,
        title,
        h1Text,
        searchParams,
        heroElements,
        backButtons,
        bodyText
      };
    });
    
    console.log('\n📊 PAGE ANALYSIS:');
    console.log('   URL:', pageInfo.url);
    console.log('   Title:', pageInfo.title);
    console.log('   H1:', pageInfo.h1Text);
    console.log('   Search Params:', JSON.stringify(pageInfo.searchParams, null, 2));
    console.log('   Hero Elements Count:', pageInfo.heroElements.length);
    console.log('   Back Buttons Count:', pageInfo.backButtons.length);
    
    if (pageInfo.heroElements.length > 0) {
      console.log('\n✅ HERO ELEMENTS FOUND:');
      pageInfo.heroElements.forEach((hero, i) => {
        console.log(`   [${i}] Class: ${hero.className}`);
        console.log(`       Data Level: ${hero.dataLevel}`);
        console.log(`       Data Hub: ${hero.dataHub}`);
        console.log(`       Content: ${hero.textContent}...`);
      });
    }
    
    if (pageInfo.backButtons.length > 0) {
      console.log('\n✅ BACK BUTTONS FOUND:');
      pageInfo.backButtons.forEach((btn, i) => {
        console.log(`   [${i}] Class: ${btn.className}`);
        console.log(`       Text: ${btn.textContent}`);
      });
    }
    
    console.log('\n📄 BODY PREVIEW:');
    console.log('  ', pageInfo.bodyText.substring(0, 200) + '...');
    
    // Take screenshot
    const screenshotPath = '/tmp/debug-hero-view.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
    
    console.log('\n✅ Page analysis complete');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 Debug Complete');
}

// Run debug
debugHeroView().catch(console.error);