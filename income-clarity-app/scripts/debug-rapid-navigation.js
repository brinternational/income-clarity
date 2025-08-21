#!/usr/bin/env node

/**
 * DETAILED RAPID NAVIGATION DEBUG
 * 
 * This script analyzes exactly what happens during rapid navigation
 * to understand the root cause of the infinite loading issue.
 */

const { chromium } = require('playwright');

async function debugRapidNavigation() {
  console.log('🔬 DETAILED RAPID NAVIGATION DEBUG');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const debugLog = [];
  
  // Capture all console logs
  page.on('console', (msg) => {
    const timestamp = new Date().toISOString();
    debugLog.push({
      timestamp,
      type: 'console',
      level: msg.type(),
      text: msg.text()
    });
    
    if (msg.type() === 'error' || msg.text().includes('DEBUG:')) {
      console.log(`   📝 [${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  // Capture network activity
  page.on('request', (request) => {
    if (request.url().includes('/api/')) {
      const timestamp = new Date().toISOString();
      debugLog.push({
        timestamp,
        type: 'request',
        method: request.method(),
        url: request.url()
      });
      console.log(`   🌐 REQUEST: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', (response) => {
    if (response.url().includes('/api/')) {
      const timestamp = new Date().toISOString();
      debugLog.push({
        timestamp,
        type: 'response',
        status: response.status(),
        url: response.url()
      });
      console.log(`   📡 RESPONSE: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // Step 1: Login
    console.log('\n🔐 STEP 1: Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('   ✅ Login successful');

    // Step 2: Detailed rapid navigation with timing
    console.log('\n🏃 STEP 2: Rapid navigation sequence with detailed monitoring...');
    
    const navigationSequence = [
      'http://localhost:3000/dashboard',
      'http://localhost:3000/dashboard/super-cards-unified',
      'http://localhost:3000/dashboard',
      'http://localhost:3000/dashboard/super-cards-unified',
      'http://localhost:3000/dashboard/super-cards-unified'
    ];

    for (let i = 0; i < navigationSequence.length; i++) {
      const url = navigationSequence[i];
      console.log(`\n   📍 Navigation ${i + 1}: ${url}`);
      
      const navStart = Date.now();
      await page.goto(url);
      
      // Wait a bit and check loading state
      await page.waitForTimeout(200);
      
      const loadingElements = await page.$$('[data-testid*="loading"], .loading, .spinner, [class*="loading"]');
      console.log(`   ⏳ Loading elements found: ${loadingElements.length}`);
      
      const cardsVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
      console.log(`   🎯 Cards visible: ${cardsVisible}`);
      
      if (url.includes('super-cards-unified')) {
        // For unified dashboard, wait a bit longer to see what happens
        console.log(`   ⏱️  Monitoring unified dashboard state for 3 seconds...`);
        
        for (let j = 0; j < 6; j++) {
          await page.waitForTimeout(500);
          const stillLoading = await page.$$('[data-testid*="loading"], .loading, .spinner, [class*="loading"]');
          const nowVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
          console.log(`   📊 ${j * 0.5}s: Loading=${stillLoading.length}, Visible=${nowVisible}`);
          
          if (nowVisible && stillLoading.length === 0) {
            console.log(`   ✅ Cards loaded successfully at ${j * 0.5}s`);
            break;
          }
        }
      }
      
      // Short delay before next navigation
      await page.waitForTimeout(300);
    }

    // Step 3: Final monitoring
    console.log('\n🔍 STEP 3: Final state monitoring for 10 seconds...');
    
    let finallyLoaded = false;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(500);
      
      const loadingElements = await page.$$('[data-testid*="loading"], .loading, .spinner, [class*="loading"]');
      const cardsVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
      
      console.log(`   📊 ${i * 0.5}s: Loading=${loadingElements.length}, Cards=${cardsVisible}`);
      
      if (cardsVisible && loadingElements.length === 0) {
        finallyLoaded = true;
        console.log(`   ✅ FINALLY LOADED at ${i * 0.5}s!`);
        break;
      }
    }

    if (!finallyLoaded) {
      console.log('   ❌ CONFIRMED: Infinite loading after rapid navigation!');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }

  // Generate detailed debug report
  await generateDebugReport(debugLog);
}

async function generateDebugReport(debugLog) {
  const reportPath = '/public/MasterV2/income-clarity/income-clarity-app/RAPID_NAVIGATION_DEBUG.md';
  
  const consoleErrors = debugLog.filter(log => log.type === 'console' && log.level === 'error');
  const apiRequests = debugLog.filter(log => log.type === 'request');
  const apiResponses = debugLog.filter(log => log.type === 'response');
  const debugMessages = debugLog.filter(log => log.type === 'console' && log.text.includes('DEBUG:'));
  
  const report = `# RAPID NAVIGATION DEBUG REPORT

## Summary
- **Total Console Errors**: ${consoleErrors.length}
- **Total API Requests**: ${apiRequests.length}  
- **Total API Responses**: ${apiResponses.length}
- **Debug Messages**: ${debugMessages.length}

## Console Errors
${consoleErrors.map(error => `- **${error.timestamp}**: ${error.text}`).join('\n')}

## Debug Messages (showing component state changes)
${debugMessages.map(debug => `- **${debug.timestamp}**: ${debug.text}`).join('\n')}

## API Request Pattern
${apiRequests.map(req => `- **${req.timestamp}**: ${req.method} ${req.url}`).join('\n')}

## API Response Pattern  
${apiResponses.map(res => `- **${res.timestamp}**: ${res.status} ${res.url}`).join('\n')}

## Analysis

### Race Condition Evidence
${debugMessages.filter(d => d.text.includes('Auth effect triggered')).length > 0 ? 
  `**AUTH STATE FLIPS DETECTED**: ${debugMessages.filter(d => d.text.includes('Auth effect triggered')).length} auth state changes during navigation` :
  '**NO AUTH STATE FLIPS**: Auth state remained stable'}

${apiRequests.filter(r => r.url.includes('super-cards')).length > 5 ? 
  `**EXCESSIVE API CALLS**: ${apiRequests.filter(r => r.url.includes('super-cards')).length} Super Cards API calls detected - indicates race condition` :
  '**NORMAL API CALLS**: Reasonable number of API calls'}

### Recommendations
1. **Component Lifecycle**: Check if components are mounting/unmounting rapidly
2. **Auth State Management**: Ensure auth state doesn't flip during navigation  
3. **Fetch Deduplication**: Implement better fetch deduplication
4. **Loading State Management**: Fix loading state persistence

---
**Report Generated**: ${new Date().toISOString()}
`;

  await require('fs').promises.writeFile(reportPath, report);
  console.log(`\n📋 Detailed debug report saved to: ${reportPath}`);
  console.log('\n🎯 RAPID NAVIGATION DEBUG COMPLETE');
}

// Run the debug
debugRapidNavigation().catch(console.error);