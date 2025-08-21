#!/usr/bin/env node

/**
 * AGGRESSIVE USER SCENARIO TESTING
 * 
 * This script tests multiple scenarios that could trigger infinite loading:
 * - Stale browser sessions
 * - Multiple rapid navigations
 * - Authentication edge cases
 * - Cache-related issues
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function runAggressiveTests() {
  console.log('🔥 AGGRESSIVE USER SCENARIO TESTING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = [];

  // Test 1: Simulate browser with stale session
  console.log('\n🧪 TEST 1: Simulating browser with stale session...');
  const result1 = await testStaleSession();
  results.push(result1);

  // Test 2: Rapid navigation stress test
  console.log('\n🧪 TEST 2: Rapid navigation stress test...');
  const result2 = await testRapidNavigation();
  results.push(result2);

  // Test 3: Authentication edge cases
  console.log('\n🧪 TEST 3: Authentication edge cases...');
  const result3 = await testAuthEdgeCases();
  results.push(result3);

  // Test 4: Cache poisoning simulation
  console.log('\n🧪 TEST 4: Cache poisoning simulation...');
  const result4 = await testCachePoisoning();
  results.push(result4);

  // Generate summary
  await generateScenarioReport(results);
}

async function testStaleSession() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const test = {
    name: 'Stale Session Test',
    errors: [],
    loadTime: null,
    success: false
  };

  try {
    // Simulate stale session by setting invalid cookies
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'invalid-stale-token-12345',
        domain: 'localhost',
        path: '/'
      }
    ]);

    console.log('   → Setting up stale session cookies...');
    console.log('   → Navigating directly to unified dashboard...');
    
    const startTime = Date.now();
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');

    // Monitor console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.errors.push({
          timestamp: new Date().toISOString(),
          message: msg.text()
        });
        console.log(`   ❌ Console Error: ${msg.text()}`);
      }
    });

    // Monitor for 30 seconds
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      
      const cardsVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
      if (cardsVisible) {
        loaded = true;
        test.loadTime = Date.now() - startTime;
        test.success = true;
        console.log(`   ✅ Loaded after ${Math.round(test.loadTime / 1000)}s with stale session`);
        break;
      }

      // Check if redirected to login
      const currentUrl = page.url();
      if (currentUrl.includes('/auth/login')) {
        console.log(`   🔄 Redirected to login at ${i}s - expected behavior`);
        test.success = true;
        test.loadTime = (i + 1) * 1000;
        break;
      }
    }

    if (!loaded && !page.url().includes('/auth/login')) {
      console.log('   ❌ INFINITE LOADING DETECTED with stale session!');
      test.success = false;
    }

  } catch (error) {
    test.errors.push({ message: error.message, timestamp: new Date().toISOString() });
    console.log(`   ❌ Test failed: ${error.message}`);
  }

  await browser.close();
  return test;
}

async function testRapidNavigation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const test = {
    name: 'Rapid Navigation Test',
    errors: [],
    loadTime: null,
    success: false
  };

  try {
    // Login first
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });

    console.log('   → Performing rapid navigation sequence...');
    
    // Rapid navigation sequence that might cause race conditions
    const urls = [
      'http://localhost:3000/dashboard',
      'http://localhost:3000/dashboard/super-cards-unified',
      'http://localhost:3000/dashboard',
      'http://localhost:3000/dashboard/super-cards-unified',
      'http://localhost:3000/dashboard/super-cards-unified'
    ];

    for (let i = 0; i < urls.length; i++) {
      console.log(`   → Navigation ${i + 1}: ${urls[i]}`);
      await page.goto(urls[i]);
      await page.waitForTimeout(500); // Short delay to stress test
    }

    // Monitor final state
    const startTime = Date.now();
    let loaded = false;
    
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      
      const cardsVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
      if (cardsVisible) {
        loaded = true;
        test.loadTime = Date.now() - startTime;
        test.success = true;
        console.log(`   ✅ Loaded after rapid navigation in ${Math.round(test.loadTime / 1000)}s`);
        break;
      }
    }

    if (!loaded) {
      console.log('   ❌ INFINITE LOADING DETECTED after rapid navigation!');
      test.success = false;
    }

  } catch (error) {
    test.errors.push({ message: error.message, timestamp: new Date().toISOString() });
    console.log(`   ❌ Test failed: ${error.message}`);
  }

  await browser.close();
  return test;
}

async function testAuthEdgeCases() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const test = {
    name: 'Authentication Edge Cases',
    errors: [],
    scenarios: [],
    success: true
  };

  try {
    // Scenario 1: Direct access without login
    console.log('   → Scenario 1: Direct access without login...');
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/auth/login')) {
      console.log('   ✅ Correctly redirected to login');
      test.scenarios.push({ name: 'Direct access', result: 'SUCCESS - redirected' });
    } else {
      console.log('   ❌ Should have redirected to login');
      test.scenarios.push({ name: 'Direct access', result: 'FAILED - no redirect' });
      test.success = false;
    }

    // Scenario 2: Invalid credentials
    console.log('   → Scenario 2: Invalid credentials...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/auth/login')) {
      console.log('   ✅ Stayed on login page with invalid credentials');
      test.scenarios.push({ name: 'Invalid credentials', result: 'SUCCESS - stayed on login' });
    } else {
      console.log('   ❌ Should have stayed on login page');
      test.scenarios.push({ name: 'Invalid credentials', result: 'FAILED - unexpected redirect' });
      test.success = false;
    }

    // Scenario 3: Valid login then expired session simulation
    console.log('   → Scenario 3: Valid login then session expiry...');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Simulate session expiry by clearing cookies
    await context.clearCookies();
    
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');
    await page.waitForTimeout(5000);
    
    if (page.url().includes('/auth/login')) {
      console.log('   ✅ Correctly redirected to login after session expiry');
      test.scenarios.push({ name: 'Session expiry', result: 'SUCCESS - redirected' });
    } else {
      console.log('   ❌ Should have redirected to login after session expiry');
      test.scenarios.push({ name: 'Session expiry', result: 'FAILED - no redirect' });
      test.success = false;
    }

  } catch (error) {
    test.errors.push({ message: error.message, timestamp: new Date().toISOString() });
    console.log(`   ❌ Test failed: ${error.message}`);
    test.success = false;
  }

  await browser.close();
  return test;
}

async function testCachePoisoning() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const test = {
    name: 'Cache Poisoning Test',
    errors: [],
    loadTime: null,
    success: false
  };

  try {
    // Set up cache with potentially problematic data
    await page.goto('http://localhost:3000');
    
    // Inject problematic localStorage
    await page.evaluate(() => {
      localStorage.setItem('income-clarity-cache', JSON.stringify({
        user: { id: 'invalid-user-id', email: 'cached@example.com' },
        timestamp: Date.now() - 86400000 // 1 day old
      }));
      localStorage.setItem('auth-state', 'invalid-state');
    });

    console.log('   → Injected stale/invalid cache data...');
    console.log('   → Attempting to load unified dashboard...');
    
    const startTime = Date.now();
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');

    // Monitor for loading issues
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      
      const cardsVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
      const loginVisible = page.url().includes('/auth/login');
      
      if (cardsVisible || loginVisible) {
        loaded = true;
        test.loadTime = Date.now() - startTime;
        test.success = true;
        console.log(`   ✅ Handled cache poisoning properly in ${Math.round(test.loadTime / 1000)}s`);
        break;
      }
    }

    if (!loaded) {
      console.log('   ❌ INFINITE LOADING DETECTED with cache poisoning!');
      test.success = false;
    }

  } catch (error) {
    test.errors.push({ message: error.message, timestamp: new Date().toISOString() });
    console.log(`   ❌ Test failed: ${error.message}`);
  }

  await browser.close();
  return test;
}

async function generateScenarioReport(results) {
  const reportPath = '/public/MasterV2/income-clarity/income-clarity-app/USER_SCENARIO_REPORT.md';
  
  const failedTests = results.filter(r => !r.success);
  const summary = failedTests.length === 0 ? 'ALL TESTS PASSED' : `${failedTests.length} TESTS FAILED`;
  
  const report = `# USER SCENARIO INVESTIGATION REPORT

## Summary
**Overall Result**: ${summary}
**Tests Run**: ${results.length}
**Failed Tests**: ${failedTests.length}

## Individual Test Results

${results.map(test => `
### ${test.name}
- **Status**: ${test.success ? '✅ PASSED' : '❌ FAILED'}
- **Load Time**: ${test.loadTime ? `${Math.round(test.loadTime / 1000)}s` : 'N/A'}
- **Errors**: ${test.errors.length}

${test.errors.length > 0 ? `
**Error Details**:
${test.errors.map(error => `- ${error.timestamp}: ${error.message}`).join('\n')}
` : ''}

${test.scenarios ? `
**Scenario Results**:
${test.scenarios.map(scenario => `- ${scenario.name}: ${scenario.result}`).join('\n')}
` : ''}
`).join('\n')}

## Analysis

### Root Cause Assessment
${failedTests.length === 0 ? `
**CONCLUSION**: All user scenarios tested successfully. The infinite loading issue may be:
1. **Environment-specific**: Only occurs in specific browser/OS combinations
2. **Timing-dependent**: Rare race conditions not captured in testing
3. **User-specific**: Related to specific user data or browser state
4. **Network-dependent**: Related to slow network conditions

**RECOMMENDATION**: The dashboard appears to be working correctly in automated testing. The user should:
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check browser console for JavaScript errors
4. Test on a different browser
` : `
**CRITICAL ISSUES FOUND**:
${failedTests.map(test => `- ${test.name}: Authentication or loading failure detected`).join('\n')}

**IMMEDIATE ACTION REQUIRED**: Fix the failing scenarios above.
`}

### Technical Recommendations
1. **Improve Error Handling**: Add better error boundaries and fallback states
2. **Authentication Robustness**: Enhance session management and token validation
3. **Cache Management**: Implement cache invalidation strategies
4. **Loading States**: Add timeout mechanisms for API calls
5. **Monitoring**: Add real-time error tracking in production

---
**Report Generated**: ${new Date().toISOString()}
**Next Steps**: ${failedTests.length === 0 ? 'Monitor production for edge cases' : 'Fix failing scenarios immediately'}
`;

  await fs.promises.writeFile(reportPath, report);
  console.log(`\n📋 User scenario report saved to: ${reportPath}`);
  console.log(`\n🎯 SCENARIO TESTING COMPLETE - ${summary}`);
}

// Run the aggressive tests
runAggressiveTests().catch(console.error);