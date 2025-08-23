const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Checking what error appears on dashboard after login...\n');
  
  const browser = await chromium.launch({ headless: true }); // Headless mode
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  try {
    // 1. Navigate to site
    console.log('1️⃣ Going to site...');
    await page.goto('http://localhost:3000');
    
    // 2. Login
    console.log('2️⃣ Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 3. Wait for dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('3️⃣ Reached dashboard!');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // 4. Check for error elements
    console.log('\n4️⃣ Checking for error elements...');
    
    // Look for common error selectors
    const errorSelectors = [
      '.error',
      '[role="alert"]',
      '.alert-error',
      '.alert-danger',
      '[data-error]',
      '.text-red-500',
      '.text-danger',
      '.bg-red-50',
      'div:has-text("error")',
      'div:has-text("Error")',
      'div:has-text("failed")',
      'div:has-text("Failed")'
    ];
    
    for (const selector of errorSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`\n❌ Found ${elements.length} element(s) matching: ${selector}`);
        
        // Get text content of first few
        for (let i = 0; i < Math.min(3, elements.length); i++) {
          try {
            const text = await elements[i].textContent();
            if (text && text.trim()) {
              console.log(`   Content ${i+1}: "${text.trim().substring(0, 100)}..."`);
            }
            
            // Get HTML to see structure
            const html = await elements[i].evaluate(el => el.outerHTML);
            console.log(`   HTML: ${html.substring(0, 200)}...`);
          } catch (e) {
            // Element might not be visible
          }
        }
      }
    }
    
    // 5. Check what's actually visible on dashboard
    console.log('\n5️⃣ Dashboard content check...');
    
    // Check for main dashboard elements
    const mainContent = await page.locator('main, [role="main"]').first();
    if (await mainContent.isVisible()) {
      const text = await mainContent.textContent();
      console.log(`Main content preview: "${text.substring(0, 200)}..."`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard-error-check.png', fullPage: true });
    console.log('\n📸 Screenshot saved: test-results/dashboard-error-check.png');
    
    // Keep browser open for 5 seconds to see
    console.log('\n👀 Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log(`\n💥 Error: ${error.message}`);
  }
  
  await browser.close();
  console.log('\n✅ Check complete!');
})();