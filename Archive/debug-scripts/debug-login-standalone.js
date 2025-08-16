const { chromium } = require('playwright');

async function debugDemoLogin() {
  console.log('🚀 Starting Income Clarity Demo Login Debug...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000    // Slow down actions for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Monitor console messages
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  
  // Monitor JavaScript errors
  page.on('pageerror', error => {
    console.error(`[JS ERROR] ${error.message}`);
    console.error(`[STACK] ${error.stack}`);
  });
  
  // Monitor network requests
  const networkLogs = [];
  page.on('request', request => {
    networkLogs.push({
      type: 'REQUEST',
      url: request.url(),
      method: request.method()
    });
    console.log(`[NETWORK] → ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    networkLogs.push({
      type: 'RESPONSE',
      url: response.url(),
      status: response.status()
    });
    if (response.status() >= 400) {
      console.log(`[NETWORK ERROR] ← ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('\n1️⃣ Navigating to login page...');
    await page.goto('http://localhost:3003/auth/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Login page loaded');
    
    // Clear any existing localStorage
    await page.evaluate(() => {
      localStorage.clear();
      console.log('LocalStorage cleared');
    });
    
    console.log('\n2️⃣ Looking for demo login button...');
    
    // Wait for and locate the demo button
    const demoButton = page.locator('button:has-text("Try Demo Account")');
    
    await demoButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Demo button found and visible');
    
    // Check if button is enabled
    const isEnabled = await demoButton.isEnabled();
    console.log(`Button enabled: ${isEnabled}`);
    
    // Get button text to confirm it's the right one
    const buttonText = await demoButton.textContent();
    console.log(`Button text: "${buttonText}"`);
    
    console.log('\n3️⃣ Checking initial state...');
    
    // Check initial localStorage state
    const initialState = await page.evaluate(() => ({
      demoMode: localStorage.getItem('demo-mode'),
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    }));
    
    console.log('Initial state:', initialState);
    
    console.log('\n4️⃣ Clicking demo login button...');
    
    // Click the demo button
    await demoButton.click();
    console.log('✅ Demo button clicked');
    
    // Wait for any loading states
    await page.waitForTimeout(2000);
    
    // Check if button shows loading state
    try {
      const loadingText = await page.locator('button:has-text("Setting up demo...")').textContent({ timeout: 1000 });
      console.log(`Loading state detected: "${loadingText}"`);
    } catch (e) {
      console.log('No loading state detected (may be too fast)');
    }
    
    console.log('\n5️⃣ Checking post-click state...');
    
    // Wait a bit more for processing
    await page.waitForTimeout(3000);
    
    // Check localStorage after demo login
    const postClickState = await page.evaluate(() => ({
      demoMode: localStorage.getItem('demo-mode'),
      demoUser: localStorage.getItem('demo-user') ? 'PRESENT' : 'MISSING',
      demoProfile: localStorage.getItem('demo-profile') ? 'PRESENT' : 'MISSING',
      demoSession: localStorage.getItem('demo-session') ? 'PRESENT' : 'MISSING',
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    }));
    
    console.log('Post-click state:', postClickState);
    
    console.log('\n6️⃣ Checking for navigation...');
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth/login')) {
      console.log('⚠️  Still on login page - checking for errors...');
      
      // Look for any error messages
      const errorElements = await page.locator('[class*="red"], [class*="error"], .text-red-600').all();
      
      if (errorElements.length > 0) {
        console.log('❌ Error messages found:');
        for (const element of errorElements) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`   - ${text.trim()}`);
          }
        }
      } else {
        console.log('No visible error messages found');
      }
      
      // Check if button is still in loading state
      const stillLoading = await page.locator('button:has-text("Setting up demo...")').count();
      if (stillLoading > 0) {
        console.log('⚠️  Button appears stuck in loading state');
      }
      
    } else if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard!');
      
      // Wait for dashboard to load
      await page.waitForTimeout(2000);
      
      // Look for demo user data
      const demoDataElements = [
        'Demo User',
        'Puerto Rico',
        'demo@incomeclarity.app'
      ];
      
      for (const data of demoDataElements) {
        try {
          const element = await page.locator(`text=${data}`).first();
          const isVisible = await element.isVisible({ timeout: 2000 });
          console.log(`Demo data "${data}": ${isVisible ? 'VISIBLE' : 'NOT VISIBLE'}`);
        } catch (e) {
          console.log(`Demo data "${data}": NOT FOUND`);
        }
      }
    } else {
      console.log(`⚠️  Unexpected redirect to: ${currentUrl}`);
    }
    
    console.log('\n7️⃣ Final diagnostic information...');
    
    // Collect all console logs from the browser
    console.log('\nBrowser console activity summary:');
    console.log(`Total network requests: ${networkLogs.filter(n => n.type === 'REQUEST').length}`);
    console.log(`Total network responses: ${networkLogs.filter(n => n.type === 'RESPONSE').length}`);
    
    // Check React DevTools or any global state
    const globalState = await page.evaluate(() => {
      const result = {
        reactDevTools: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined',
        nextRouter: typeof window.__NEXT_ROUTER__ !== 'undefined',
        windowProps: Object.keys(window).filter(key => 
          key.includes('auth') || key.includes('demo') || key.includes('user')
        )
      };
      return result;
    });
    
    console.log('Global browser state:', globalState);
    
    // Wait a moment before closing
    console.log('\n⏱️  Waiting 5 seconds before closing browser...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ Error during demo login test:');
    console.error(error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🏁 Demo login debug session completed');
  }
}

// Run the debug session
debugDemoLogin().catch(console.error);