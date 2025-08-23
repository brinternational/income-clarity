const { chromium } = require('playwright');

async function testProgressiveDisclosureUrls() {
  console.log('🚀 Testing Progressive Disclosure URLs...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // Login first
    console.log('🔑 Logging in...');
    await page.goto('https://incomeclarity.ddns.net/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('✅ Login successful');

    // Test URLs according to current implementation (level & hub parameters)
    const testUrls = [
      // Level 1: Momentum Dashboard  
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards',
        name: 'Level 1: Momentum Dashboard (Default)',
        expected: 'momentum-dashboard'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?level=momentum',
        name: 'Level 1: Momentum Dashboard (Explicit)',
        expected: 'momentum-dashboard'
      },
      
      // Level 2: Hero Views 
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?level=hero-view&hub=performance',
        name: 'Level 2: Performance Hub Hero View',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?level=hero-view&hub=income-tax',
        name: 'Level 2: Income Intelligence Hero View',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?level=hero-view&hub=tax-strategy',
        name: 'Level 2: Tax Strategy Hero View',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?level=hero-view&hub=portfolio-strategy',
        name: 'Level 2: Portfolio Strategy Hero View',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?level=hero-view&hub=financial-planning',
        name: 'Level 2: Financial Planning Hero View',
        expected: 'hero-view'
      },
      
      // Level 3: Detailed Views
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?level=detailed',
        name: 'Level 3: Detailed View',
        expected: 'detailed-dashboard'
      },

      // Test user's expected URLs (view & card parameters)
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=hero-view&card=income',
        name: 'USER EXPECTED: Hero View Income (view & card params)',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=detailed&card=income',
        name: 'USER EXPECTED: Detailed View Income (view & card params)',
        expected: 'detailed-dashboard'
      }
    ];

    const results = [];
    
    for (const test of testUrls) {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      try {
        await page.goto(test.url, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Wait for page to fully load
        await page.waitForTimeout(2000);
        
        // Check for Progressive Disclosure level indicators
        const momentumExists = await page.locator('[data-level="momentum"]').count() > 0;
        const heroExists = await page.locator('[data-level="hero-view"]').count() > 0;
        const detailedExists = await page.locator('[data-level="detailed"]').count() > 0;
        
        // Check for error states
        const hasError = await page.locator('text="not found"').count() > 0 ||
                         await page.locator('text="Invalid"').count() > 0 ||
                         await page.locator('text="Hub"').count() > 0;
        
        // Get page title
        const title = await page.title();
        
        let status = '❌ FAILED';
        let details = 'Unknown state';
        
        if (hasError) {
          status = '❌ ERROR';
          details = 'Error message displayed';
        } else if (momentumExists && test.expected === 'momentum-dashboard') {
          status = '✅ SUCCESS';
          details = 'Momentum Dashboard loaded';
        } else if (heroExists && test.expected === 'hero-view') {
          status = '✅ SUCCESS';
          details = 'Hero View loaded';
        } else if (detailedExists && test.expected === 'detailed-dashboard') {
          status = '✅ SUCCESS';
          details = 'Detailed View loaded';
        } else {
          status = '❌ FAILED';
          details = `Expected ${test.expected}, but got momentum:${momentumExists}, hero:${heroExists}, detailed:${detailedExists}`;
        }
        
        console.log(`   ${status}: ${details}`);
        results.push({ name: test.name, url: test.url, status, details, title });
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.push({ name: test.name, url: test.url, status: '❌ ERROR', details: error.message, title: 'Error' });
      }
    }

    // Summary
    console.log('\n📊 PROGRESSIVE DISCLOSURE TEST RESULTS:');
    console.log('='.repeat(50));
    
    const successCount = results.filter(r => r.status === '✅ SUCCESS').length;
    const failCount = results.filter(r => r.status === '❌ FAILED').length;
    const errorCount = results.filter(r => r.status === '❌ ERROR').length;
    
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);  
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`Success Rate: ${Math.round((successCount / results.length) * 100)}%`);
    
    if (failCount > 0 || errorCount > 0) {
      console.log('\n🚨 FAILED/ERROR TESTS:');
      results.filter(r => r.status !== '✅ SUCCESS').forEach(r => {
        console.log(`- ${r.name}: ${r.details}`);
      });
    }

  } finally {
    await browser.close();
  }
}

testProgressiveDisclosureUrls().catch(console.error);
