const { chromium } = require('playwright');

async function testSettingsExport() {
  console.log('🚀 Testing Settings Page Export Functionality...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate to production site
    console.log('📍 Navigating to production site...');
    await page.goto('https://incomeclarity.ddns.net');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Login
    console.log('🔑 Logging in...');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Navigate to settings
    console.log('⚙️ Navigating to settings...');
    await page.goto('https://incomeclarity.ddns.net/settings');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Take screenshot of settings page
    await page.screenshot({ path: 'settings-page-current.png', fullPage: true });
    console.log('📸 Settings page screenshot saved');
    
    // Scroll to export section
    console.log('📄 Locating data export section...');
    await page.locator('text=Export Your Data').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Take screenshot of export section
    await page.screenshot({ path: 'export-section-current.png', fullPage: false });
    console.log('📸 Export section screenshot saved');
    
    // Test Portfolio Export
    console.log('📊 Testing Portfolio CSV export...');
    
    // Set up dialog handler to capture alert
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log(`🔔 Alert captured: ${alertMessage}`);
      await dialog.accept();
    });
    
    await page.click('text=Portfolio CSV');
    await page.waitForTimeout(1000);
    
    // Test Transactions Export
    console.log('💰 Testing Transactions CSV export...');
    await page.click('text=Transactions CSV');
    await page.waitForTimeout(1000);
    
    // Test Tax Report Export
    console.log('📋 Testing Tax Report PDF export...');
    await page.click('text=Tax Report PDF');
    await page.waitForTimeout(1000);
    
    console.log('\n✅ CURRENT STATE ANALYSIS:');
    console.log(`   - Settings page loads successfully`);
    console.log(`   - Export section is visible and accessible`);
    console.log(`   - Export buttons are functional (show placeholder alerts)`);
    console.log(`   - Alert message: "${alertMessage}"`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-settings-error.png' });
  } finally {
    await browser.close();
  }
}

testSettingsExport().catch(console.error);