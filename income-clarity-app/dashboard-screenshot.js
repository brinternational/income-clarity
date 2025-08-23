const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    colorScheme: 'dark',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Login
    console.log('Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    console.log('Waiting for dashboard...');
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });
    await page.waitForTimeout(2000); // Let it fully render
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-with-nuclear-css.png',
      fullPage: false 
    });
    console.log('Dashboard screenshot saved to test-results/dashboard-with-nuclear-css.png');
    
    // Check text color
    const textColor = await page.evaluate(() => {
      const elem = document.querySelector('.text-foreground');
      if (elem) {
        return window.getComputedStyle(elem).color;
      }
      return null;
    });
    console.log('Text color on dashboard:', textColor);
    
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  await browser.close();
})();
