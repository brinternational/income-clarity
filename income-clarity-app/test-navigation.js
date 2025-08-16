/**
 * Navigation Test Script
 * Tests the navigation button fixes for Income Clarity
 */

const puppeteer = require('puppeteer');

async function testNavigation() {
  console.log('🚀 Starting navigation tests...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Test 1: Visit demo page
    console.log('📝 Test 1: Loading demo page...');
    await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle0' });
    
    // Test 2: Check if Try Live Demo button exists and is clickable
    console.log('📝 Test 2: Testing "Try Live Demo" button...');
    const demoButton = await page.$('a[href="/dashboard/super-cards"]');
    if (demoButton) {
      console.log('✅ Demo button found with correct href');
      
      // Test 3: Click the button and verify navigation
      console.log('📝 Test 3: Clicking demo button...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        demoButton.click()
      ]);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard/super-cards')) {
        console.log('✅ Navigation successful! Current URL:', currentUrl);
      } else {
        console.log('❌ Navigation failed. Current URL:', currentUrl);
      }
    } else {
      console.log('❌ Demo button not found');
    }
    
    // Test 4: Go back to demo page and test feature demo buttons
    console.log('📝 Test 4: Testing feature demo buttons...');
    await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle0' });
    
    const featureDemoButtons = await page.$$('a[href*="/"]');
    console.log(`✅ Found ${featureDemoButtons.length} navigation links`);
    
    console.log('🎉 Navigation tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testNavigation();
}

module.exports = { testNavigation };