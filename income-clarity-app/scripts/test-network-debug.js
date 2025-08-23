const { chromium } = require('playwright');

async function debugNetworkRequests() {
  console.log('🔍 Network Debug Test for Export Functionality...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor network requests
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    if (request.url().includes('export')) {
      console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('export')) {
      console.log(`📡 RESPONSE: ${response.status()} ${response.url()}`);
      responses.push({
        status: response.status(),
        url: response.url(),
        headers: response.headers()
      });
    }
  });
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔴 CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto('https://incomeclarity.ddns.net/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Go to settings
    console.log('⚙️ Going to settings...');
    await page.goto('https://incomeclarity.ddns.net/settings', { waitUntil: 'networkidle' });
    
    // Click export buttons and monitor network
    console.log('📊 Testing export buttons...');
    
    const buttons = ['Portfolio CSV', 'Transactions CSV', 'Tax Report CSV'];
    
    for (const buttonText of buttons) {
      console.log(`\n🔘 Testing: ${buttonText}`);
      
      try {
        // Wait for button and click
        const button = page.locator(`text="${buttonText}"`);
        if (await button.count() > 0) {
          await button.click();
          
          // Wait for any network activity
          await page.waitForTimeout(3000);
          
          console.log(`   Requests made: ${requests.length}`);
          console.log(`   Responses received: ${responses.length}`);
          
        } else {
          console.log(`   ❌ Button not found: ${buttonText}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error clicking ${buttonText}: ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('NETWORK DEBUG SUMMARY');
    console.log('='.repeat(50));
    
    console.log('\n📡 REQUESTS:');
    requests.forEach((req, i) => {
      console.log(`   ${i + 1}. ${req.method} ${req.url}`);
    });
    
    console.log('\n📡 RESPONSES:');
    responses.forEach((res, i) => {
      console.log(`   ${i + 1}. ${res.status} ${res.url}`);
      console.log(`      Content-Type: ${res.headers['content-type'] || 'Not set'}`);
    });
    
    if (requests.length === 0) {
      console.log('\n⚠️ No export requests were made!');
      console.log('This suggests the frontend export function might have an error.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugNetworkRequests().catch(console.error);