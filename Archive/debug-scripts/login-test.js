const { chromium } = require('playwright');

async function testLoginPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Testing login page at http://localhost:3003/auth/login');
    
    // Navigate to login page
    await page.goto('http://localhost:3003/auth/login', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'login-page-debug.png', fullPage: true });
    
    // Check if page title is correct
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for any console errors
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => logs.push(`Error: ${error.message}`));
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(2000);
    
    // Look for demo login button
    const demoButton = await page.locator('button:has-text("Try Demo")').first();
    if (await demoButton.isVisible()) {
      console.log('Demo button found!');
      
      // Click demo button
      await demoButton.click();
      
      // Wait for navigation or response
      await page.waitForTimeout(3000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log('Current URL after demo click:', currentUrl);
      
      if (currentUrl.includes('/')) {
        console.log('SUCCESS: Demo login redirected to dashboard');
      } else {
        console.log('Demo login may not have worked properly');
      }
    } else {
      console.log('Demo button not found - checking for other login elements');
      
      // Look for any buttons
      const buttons = await page.locator('button').count();
      console.log(`Found ${buttons} buttons on page`);
      
      // Look for forms
      const forms = await page.locator('form').count();
      console.log(`Found ${forms} forms on page`);
    }
    
    // Check CSS loading
    const stylesheets = await page.evaluate(() => {
      return Array.from(document.styleSheets).map(sheet => ({
        href: sheet.href,
        rules: sheet.rules ? sheet.rules.length : 'Access denied'
      }));
    });
    
    console.log('Loaded stylesheets:', stylesheets);
    
    // Print any console logs
    if (logs.length > 0) {
      console.log('Console logs:');
      logs.forEach(log => console.log('  ', log));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginPage().catch(console.error);