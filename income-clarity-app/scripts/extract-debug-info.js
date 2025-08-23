#!/usr/bin/env node

/**
 * Extract Debug Info from Hero View Page
 * Gets the debug information to understand why Progressive Disclosure isn't working
 */

const { chromium } = require('playwright');

const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TEST_USER: {
    email: 'test@example.com',
    password: 'password123'
  }
};

async function extractDebugInfo() {
  console.log('🔍 Extracting Debug Information...');
  
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
    // Step 1: Login
    await page.goto(`${CONFIG.BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', CONFIG.TEST_USER.email);
    await page.fill('input[type="password"]', CONFIG.TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Step 2: Navigate to hero-view URL
    const heroUrl = `${CONFIG.BASE_URL}/dashboard/super-cards?level=hero-view&hub=performance`;
    await page.goto(heroUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Step 3: Extract debug information
    const debugInfo = await page.evaluate(() => {
      // Look for our debug div
      const debugDiv = document.querySelector('div[style*="position: fixed"][style*="top: 10px"]');
      
      return {
        debugDivExists: !!debugDiv,
        debugText: debugDiv ? debugDiv.textContent : null,
        url: window.location.href,
        consoleMessages: [] // We'll capture these separately
      };
    });
    
    console.log('\n📊 DEBUG EXTRACTION RESULTS:');
    console.log('   URL:', debugInfo.url);
    console.log('   Debug Div Exists:', debugInfo.debugDivExists);
    
    if (debugInfo.debugText) {
      console.log('   Debug Content:');
      const lines = debugInfo.debugText.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`     ${line.trim()}`);
      });
    } else {
      console.log('   ❌ No debug information found');
      console.log('   🔍 This means our debug div is not rendering');
    }
    
    // Step 4: Check for Progressive Disclosure elements
    const pageElements = await page.evaluate(() => {
      return {
        heroViewElements: document.querySelectorAll('.hero-view').length,
        backButtons: document.querySelectorAll('.back-to-dashboard').length,
        hubTitles: [
          'Performance Hub',
          'Income Intelligence', 
          'Tax Strategy',
          'Portfolio Strategy',
          'Financial Planning'
        ].map(title => ({
          title,
          visible: document.body.textContent.includes(title)
        }))
      };
    });
    
    console.log('\n📋 PAGE ELEMENTS:');
    console.log('   Hero View Elements:', pageElements.heroViewElements);
    console.log('   Back Buttons:', pageElements.backButtons);
    console.log('   Hub Titles:');
    pageElements.hubTitles.forEach(hub => {
      console.log(`     ${hub.title}: ${hub.visible ? '✅ Visible' : '❌ Hidden'}`);
    });
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 Debug Extraction Complete');
}

// Run extraction
extractDebugInfo().catch(console.error);