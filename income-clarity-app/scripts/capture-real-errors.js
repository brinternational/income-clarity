const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Capturing real errors from localhost:3000...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleMessages = [];
  const errors = [];
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push(text);
      console.log(`❌ CONSOLE ERROR: ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️  WARNING: ${text}`);
    }
    
    consoleMessages.push({ type, text });
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });
  
  // Capture network failures
  page.on('requestfailed', request => {
    console.log(`🚫 REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    errors.push(`Network: ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    // Test 1: Landing page
    console.log('\n📄 Testing Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/landing-errors.png' });
    
    // Test 2: Login page
    console.log('\n📄 Testing Login Page...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/login-errors.png' });
    
    // Test 3: Try to login
    console.log('\n📄 Testing Login Process...');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/after-login-errors.png' });
    
    // Test 4: Check dashboard if logged in
    const url = page.url();
    console.log(`\n📍 Current URL: ${url}`);
    
    if (url.includes('dashboard')) {
      console.log('\n📄 Testing Dashboard...');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/dashboard-errors.png' });
    }
    
  } catch (error) {
    console.log(`\n💔 Test failed: ${error.message}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ERROR SUMMARY:');
  console.log('='.repeat(60));
  
  if (errors.length === 0) {
    console.log('✅ No errors found!');
  } else {
    console.log(`❌ Found ${errors.length} error(s):\n`);
    errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  }
  
  console.log('\n📸 Screenshots saved to test-results/');
  
  await browser.close();
})();