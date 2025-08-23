const { chromium } = require('playwright');

async function quickSettingsTest() {
  console.log('🚀 Quick Settings Export Test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    // Navigate directly to production site and see what loads
    console.log('📍 Loading production site...');
    await page.goto('https://incomeclarity.ddns.net', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Take screenshot of what we see
    await page.screenshot({ path: 'production-landing.png', fullPage: true });
    console.log('📸 Production landing screenshot saved');
    
    // Click View Demo to access the demo environment
    console.log('🎯 Clicking View Demo button...');
    const viewDemoButton = page.locator('button:has-text("View Demo"), a:has-text("View Demo")');
    if (await viewDemoButton.count() > 0) {
      await viewDemoButton.click();
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await page.screenshot({ path: 'after-demo-click.png', fullPage: true });
      console.log('📸 After demo click screenshot saved');
    }
    
    // Now look for login elements
    await page.waitForTimeout(2000);
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
    const loginButton = await page.locator('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]').first();
    
    console.log('🔍 Checking login elements after demo...');
    const emailExists = await emailInput.count() > 0;
    const passwordExists = await passwordInput.count() > 0;
    const buttonExists = await loginButton.count() > 0;
    
    console.log(`   - Email input found: ${emailExists}`);
    console.log(`   - Password input found: ${passwordExists}`);
    console.log(`   - Login button found: ${buttonExists}`);
    
    if (emailExists && passwordExists && buttonExists) {
      console.log('🔑 Attempting login...');
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await page.screenshot({ path: 'after-login.png', fullPage: true });
      console.log('📸 After login screenshot saved');
      
      // Try to access settings directly
      console.log('⚙️ Accessing settings page...');
      await page.goto('https://incomeclarity.ddns.net/settings', { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: 'settings-page.png', fullPage: true });
      console.log('📸 Settings page screenshot saved');
      
      // Look for export section
      const exportSection = await page.locator('text="Export Your Data"').count() > 0;
      console.log(`   - Export section found: ${exportSection}`);
      
      if (exportSection) {
        // Test clicking export buttons and capture alerts
        let alertMessages = [];
        page.on('dialog', async dialog => {
          alertMessages.push(dialog.message());
          await dialog.accept();
        });
        
        // Try portfolio export
        const portfolioButton = page.locator('text="Portfolio CSV"');
        if (await portfolioButton.count() > 0) {
          console.log('📊 Testing Portfolio CSV...');
          await portfolioButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Try transactions export
        const transactionButton = page.locator('text="Transactions CSV"');
        if (await transactionButton.count() > 0) {
          console.log('💰 Testing Transactions CSV...');
          await transactionButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Try tax report export
        const taxButton = page.locator('text="Tax Report PDF"');
        if (await taxButton.count() > 0) {
          console.log('📋 Testing Tax Report PDF...');
          await taxButton.click();
          await page.waitForTimeout(1000);
        }
        
        console.log('\n✅ EXPORT TEST RESULTS:');
        alertMessages.forEach((msg, i) => {
          console.log(`   Alert ${i + 1}: "${msg}"`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
}

quickSettingsTest().catch(console.error);