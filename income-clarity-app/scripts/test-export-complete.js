const { chromium } = require('playwright');

async function completeExportTest() {
  console.log('🚀 Complete Export Functionality Test...');
  console.log('📋 This test will:');
  console.log('   1. Login to get authenticated session');
  console.log('   2. Navigate to settings page');
  console.log('   3. Test each export button');
  console.log('   4. Verify download functionality');
  console.log('');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Step 1: Login and get authenticated session
    console.log('🔐 Step 1: Authenticating...');
    await page.goto('https://incomeclarity.ddns.net/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for successful login and redirect
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('   ✅ Successfully authenticated');
    
    // Step 2: Navigate to settings page
    console.log('⚙️  Step 2: Navigating to settings...');
    await page.goto('https://incomeclarity.ddns.net/settings', { waitUntil: 'networkidle', timeout: 15000 });
    
    // Wait for page to load and check if we're actually on settings
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`   📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('login')) {
      console.log('   ❌ Still on login page - authentication may have failed');
      await page.screenshot({ path: 'auth-failed.png' });
      return;
    }
    
    // Take a screenshot of the settings page
    await page.screenshot({ path: 'settings-complete-test.png', fullPage: true });
    console.log('   📸 Settings page screenshot saved');
    
    // Step 3: Look for export buttons
    console.log('🔍 Step 3: Looking for export functionality...');
    
    // Try different selectors to find export buttons
    const possibleSelectors = [
      'text="Portfolio CSV"',
      'text="Transactions CSV"', 
      'text="Tax Report CSV"',
      'text="Export Your Data"',
      '[data-testid="portfolio-export"]',
      '[data-testid="transactions-export"]',
      '[data-testid="tax-export"]'
    ];
    
    let exportButtonsFound = [];
    for (const selector of possibleSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        const text = await element.textContent();
        console.log(`   ✅ Found: ${selector} - "${text}"`);
        exportButtonsFound.push({ selector, text });
      }
    }
    
    if (exportButtonsFound.length === 0) {
      console.log('   ❌ No export buttons found. Looking for any buttons...');
      const allButtons = await page.locator('button').all();
      console.log(`   📊 Total buttons found: ${allButtons.length}`);
      
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent();
        console.log(`      Button ${i + 1}: "${text}"`);
      }
    }
    
    // Step 4: Test export functionality
    if (exportButtonsFound.length > 0) {
      console.log('📊 Step 4: Testing export functionality...');
      
      // Set up download monitoring
      let downloadCount = 0;
      page.on('download', async download => {
        downloadCount++;
        const filename = download.suggestedFilename();
        console.log(`   📥 Download #${downloadCount}: ${filename}`);
        
        try {
          await download.saveAs(`./${filename}`);
          console.log(`   ✅ Saved: ${filename}`);
        } catch (error) {
          console.log(`   ❌ Failed to save ${filename}: ${error.message}`);
        }
      });
      
      // Test each found export button
      for (const button of exportButtonsFound) {
        console.log(`   🔘 Testing: ${button.text}`);
        try {
          await page.click(button.selector, { timeout: 5000 });
          await page.waitForTimeout(2000); // Wait for any downloads or responses
        } catch (error) {
          console.log(`   ❌ Failed to click ${button.text}: ${error.message}`);
        }
      }
      
      console.log(`   📈 Total downloads triggered: ${downloadCount}`);
      
    } else {
      console.log('   ⚠️  No export buttons found - functionality may not be implemented yet');
    }
    
    // Step 5: Final status
    console.log('\n' + '='.repeat(60));
    console.log('📋 EXPORT FUNCTIONALITY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Authentication: Success`);
    console.log(`✅ Settings page: Accessible`);
    console.log(`📊 Export buttons found: ${exportButtonsFound.length}`);
    console.log(`📥 Downloads triggered: ${downloadCount || 0}`);
    
    if (exportButtonsFound.length > 0) {
      console.log('🎉 Export functionality is partially implemented!');
      console.log('   Next steps: Verify downloads and test data content');
    } else {
      console.log('⚠️  Export functionality needs implementation');
      console.log('   The settings page exists but export buttons are not visible');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'export-test-error.png' });
  } finally {
    await browser.close();
  }
}

// Run the complete test
completeExportTest().catch(console.error);