const { chromium } = require('playwright');

async function testUserExpectedUrls() {
  console.log('🚀 Testing User Expected URLs (view & card parameters)...');
  
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

    // Test the 9 critical URLs that user expects to work
    const testUrls = [
      // Level 1: Momentum Dashboard (80% users)
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards',
        name: 'Level 1: Default Momentum Dashboard',
        expected: 'momentum-dashboard'
      },
      
      // Level 2: Hero Views (15% users) - User expected format
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=hero-view&card=income',
        name: 'Level 2: Income Intelligence Hero View (USER FORMAT)',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=hero-view&card=performance',
        name: 'Level 2: Performance Hub Hero View (USER FORMAT)',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=hero-view&card=tax-strategy',
        name: 'Level 2: Tax Strategy Hero View (USER FORMAT)',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=hero-view&card=portfolio-strategy',
        name: 'Level 2: Portfolio Strategy Hero View (USER FORMAT)',
        expected: 'hero-view'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=hero-view&card=financial-planning',
        name: 'Level 2: Financial Planning Hero View (USER FORMAT)',
        expected: 'hero-view'
      },
      
      // Level 3: Detailed Views (5% users) - User expected format
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=detailed&card=income',
        name: 'Level 3: Income Intelligence Detailed View (USER FORMAT)',
        expected: 'detailed-dashboard'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=detailed&card=performance',
        name: 'Level 3: Performance Hub Detailed View (USER FORMAT)',
        expected: 'detailed-dashboard'
      },
      { 
        url: 'https://incomeclarity.ddns.net/dashboard/super-cards?view=detailed&card=portfolio',
        name: 'Level 3: Portfolio Strategy Detailed View (USER FORMAT)',
        expected: 'detailed-dashboard'
      }
    ];

    const results = [];
    
    for (const test of testUrls) {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      try {
        await page.goto(test.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        // Check for Progressive Disclosure level indicators
        const momentumExists = await page.locator('[data-level="momentum"]').count() > 0;
        const heroExists = await page.locator('[data-level="hero-view"]').count() > 0;
        const detailedExists = await page.locator('[data-level="detailed"]').count() > 0;
        
        // Check for error states
        const hasError = await page.locator('text="not found"').count() > 0 ||
                         await page.locator('text="Invalid"').count() > 0;
        
        // Check for parameter scheme indicator
        const schemeIndicator = await page.locator('[data-scheme="view-card"]').count() > 0;
        
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
          details = `Hero View loaded${schemeIndicator ? ' (view-card scheme)' : ''}`;
        } else if (detailedExists && test.expected === 'detailed-dashboard') {
          status = '✅ SUCCESS';
          details = `Detailed View loaded${schemeIndicator ? ' (view-card scheme)' : ''}`;
        } else {
          status = '❌ FAILED';
          details = `Expected ${test.expected}, but got momentum:${momentumExists}, hero:${heroExists}, detailed:${detailedExists}`;
        }
        
        console.log(`   ${status}: ${details}`);
        results.push({ name: test.name, url: test.url, status, details });
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.push({ name: test.name, url: test.url, status: '❌ ERROR', details: error.message });
      }
    }

    // Summary
    console.log('\n📊 USER EXPECTED URLS TEST RESULTS:');
    console.log('='.repeat(60));
    
    const successCount = results.filter(r => r.status === '✅ SUCCESS').length;
    const failCount = results.filter(r => r.status === '❌ FAILED').length;
    const errorCount = results.filter(r => r.status === '❌ ERROR').length;
    
    console.log(`Total Critical URLs: ${results.length}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);  
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`SUCCESS RATE: ${Math.round((successCount / results.length) * 100)}%`);
    
    if (successCount === results.length) {
      console.log('\n🎉 PROGRESSIVE DISCLOSURE ARCHITECTURE FULLY FIXED!');
      console.log('   All 9 critical URLs are now working correctly');
      console.log('   80/15/5 user engagement model is operational');
    } else if (successCount >= 7) {
      console.log('\n🚀 MAJOR PROGRESS! Most critical URLs working');
    } else {
      console.log('\n🚨 CRITICAL ISSUES REMAIN:');
      results.filter(r => r.status !== '✅ SUCCESS').forEach(r => {
        console.log(`- ${r.name}: ${r.details}`);
      });
    }

  } finally {
    await browser.close();
  }
}

testUserExpectedUrls().catch(console.error);
