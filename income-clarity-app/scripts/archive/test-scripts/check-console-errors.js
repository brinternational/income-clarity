const { chromium } = require('playwright');

async function checkConsoleErrors() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const urls = [
    { name: 'Homepage', url: 'https://incomeclarity.ddns.net' },
    { name: 'Login Page', url: 'https://incomeclarity.ddns.net/auth/login' },
    { name: 'Signup Page', url: 'https://incomeclarity.ddns.net/auth/signup' }
  ];
  
  let totalErrors = 0;
  const allErrors = [];
  
  // Listen for ALL console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        url: page.url()
      };
      allErrors.push(error);
      totalErrors++;
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    allErrors.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
      url: page.url()
    });
    totalErrors++;
  });
  
  // Listen for request failures
  page.on('requestfailed', request => {
    allErrors.push({
      type: 'requestfailed',
      url: request.url(),
      failure: request.failure(),
      pageUrl: page.url()
    });
    totalErrors++;
  });
  
  // console.log('=== INCOME CLARITY CONSOLE ERROR CHECK ===\n');
  
  for (const site of urls) {
    // console.log(`\nChecking ${site.name}: ${site.url}`);
    // console.log('-'.repeat(50));
    
    const pageErrors = [];
    
    // Track errors for this specific page
    const errorHandler = msg => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text());
      }
    };
    page.on('console', errorHandler);
    
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for any delayed errors
      
      if (pageErrors.length === 0) {
        // console.log('✅ NO CONSOLE ERRORS');
      } else {
        // console.log(`❌ Found ${pageErrors.length} console error(s):`);
        pageErrors.forEach((error, index) => {
          // console.log(`   ${index + 1}. ${error}`);
        });
      }
    } catch (error) {
      // console.log(`❌ Failed to load page: ${error.message}`);
    }
    
    page.off('console', errorHandler);
  }
  
  // console.log('\n' + '='.repeat(50));
  // console.log(`TOTAL ERRORS FOUND: ${totalErrors}`);
  
  if (totalErrors > 0) {
    // console.log('\n=== DETAILED ERROR LOG ===');
    allErrors.forEach((error, index) => {
      // console.log(`\nError ${index + 1}:`);
      // console.log(JSON.stringify(error, null, 2));
    });
  } else {
    // console.log('🎉 ZERO CONSOLE ERRORS ON ALL PAGES!');
  }
  
  await browser.close();
  process.exit(totalErrors > 0 ? 1 : 0);
}

checkConsoleErrors().catch(console.error);