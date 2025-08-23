const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testExportFunctionality() {
  console.log('🚀 Testing Export Functionality on Production...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  
  // Track download events
  let downloadPromise;
  
  try {
    // Navigate to login
    console.log('🔑 Logging into production...');
    await page.goto('https://incomeclarity.ddns.net/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Navigate to settings
    console.log('⚙️ Navigating to settings page...');
    await page.goto('https://incomeclarity.ddns.net/settings', { waitUntil: 'networkidle', timeout: 15000 });
    
    // Take screenshot of settings page
    await page.screenshot({ path: 'settings-export-test.png', fullPage: true });
    console.log('📸 Settings page screenshot saved');
    
    // Scroll to export section
    await page.locator('text=Export Your Data').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Test each export function
    const exportTests = [
      { type: 'portfolio', buttonText: 'Portfolio CSV', description: '📊 Testing Portfolio Export' },
      { type: 'transactions', buttonText: 'Transactions CSV', description: '💰 Testing Transactions Export' },
      { type: 'tax', buttonText: 'Tax Report CSV', description: '📋 Testing Tax Report Export' }
    ];
    
    const testResults = [];
    
    for (const test of exportTests) {
      console.log(`${test.description}...`);
      
      try {
        // Set up download listener
        downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        
        // Click the export button
        await page.click(`text=${test.buttonText}`);
        
        // Wait for download to start
        const download = await downloadPromise;
        
        // Get download info
        const filename = download.suggestedFilename();
        console.log(`   ✅ Download started: ${filename}`);
        
        // Save the download
        const downloadPath = `./${filename}`;
        await download.saveAs(downloadPath);
        
        // Check if file exists and has content
        const stats = await fs.stat(downloadPath);
        const hasContent = stats.size > 0;
        
        console.log(`   ✅ File saved: ${downloadPath} (${stats.size} bytes)`);
        
        // Read first few lines to verify CSV structure
        if (filename.endsWith('.csv')) {
          const content = await fs.readFile(downloadPath, 'utf-8');
          const lines = content.split('\n').slice(0, 3); // First 3 lines
          console.log(`   ✅ CSV Preview:`);
          lines.forEach((line, i) => {
            console.log(`      ${i === 0 ? 'Headers' : `Row ${i}`}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          });
        }
        
        testResults.push({
          type: test.type,
          success: true,
          filename,
          size: stats.size,
          message: 'Export successful'
        });
        
        // Wait a bit between tests
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`   ❌ Export failed: ${error.message}`);
        testResults.push({
          type: test.type,
          success: false,
          error: error.message,
          message: 'Export failed'
        });
      }
    }
    
    // Generate test report
    console.log('\n' + '='.repeat(80));
    console.log('📋 EXPORT FUNCTIONALITY TEST RESULTS');
    console.log('='.repeat(80));
    
    testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} | ${result.type.toUpperCase()} Export`);
      if (result.success) {
        console.log(`   📁 File: ${result.filename}`);
        console.log(`   📊 Size: ${result.size} bytes`);
      } else {
        console.log(`   🔥 Error: ${result.error}`);
      }
      console.log(`   💬 Status: ${result.message}`);
      console.log('');
    });
    
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    
    console.log('='.repeat(80));
    console.log(`📈 SUCCESS RATE: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    
    if (successCount === totalCount) {
      console.log('🎉 ALL EXPORT TESTS PASSED! Data export functionality is working correctly.');
    } else {
      console.log('⚠️  Some export tests failed. Export functionality needs attention.');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'export-test-final.png', fullPage: true });
    console.log('📸 Final test screenshot saved');
    
    return { successCount, totalCount, results: testResults };
    
  } catch (error) {
    console.error('❌ Test script error:', error);
    await page.screenshot({ path: 'export-test-error.png' });
    return { successCount: 0, totalCount: 3, results: [], error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
testExportFunctionality()
  .then(results => {
    console.log('\n🏁 Test completed');
    if (results.successCount === results.totalCount) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  });