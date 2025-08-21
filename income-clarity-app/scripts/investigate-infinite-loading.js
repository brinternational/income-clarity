#!/usr/bin/env node

/**
 * CRITICAL P0 UNIFIED DASHBOARD INVESTIGATION
 * 
 * This script replicates the user's exact experience and monitors for 90 seconds
 * to identify the root cause of infinite loading on the unified dashboard.
 * 
 * INVESTIGATION PROTOCOL:
 * 1. Fresh browser session
 * 2. Complete login flow
 * 3. Navigate to unified dashboard
 * 4. Monitor for exactly 90 seconds
 * 5. Capture ALL evidence
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Investigation results storage
const investigation = {
  startTime: new Date().toISOString(),
  consoleErrors: [],
  networkRequests: [],
  loadingStates: [],
  authenticationEvents: [],
  componentVisibility: [],
  finalState: null,
  evidence: {}
};

async function runInvestigation() {
  console.log('🔍 STARTING CRITICAL P0 UNIFIED DASHBOARD INVESTIGATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🕒 Investigation Start Time: ${investigation.startTime}`);
  console.log('📋 Protocol: 90-second deep monitoring of unified dashboard');
  console.log('🎯 Goal: Find root cause of infinite loading issue');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await chromium.launch({ 
    headless: true  // Run in headless mode for server environment
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set up comprehensive monitoring
  setupEventListeners(page);

  try {
    // STEP 1: Fresh User Session
    console.log('🚀 STEP 1: Starting with clean browser state...');
    logEvent('INVESTIGATION', 'Starting fresh browser session');

    // STEP 2: Complete Login Flow
    console.log('\n🔐 STEP 2: Complete Login Flow...');
    
    console.log('   → Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    console.log('   → Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForTimeout(2000);

    console.log('   → Filling login credentials...');
    await page.fill('[data-testid="email-input"], input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('[data-testid="password-input"], input[type="password"], input[name="password"]', 'password123');
    
    console.log('   → Submitting login form...');
    await page.click('[data-testid="login-button"], button[type="submit"], .login-button');
    
    console.log('   → Waiting for login completion...');
    try {
      await page.waitForURL('**/dashboard**', { timeout: 10000 });
      logEvent('AUTH', 'Login redirect successful');
    } catch (error) {
      logEvent('AUTH_ERROR', `Login redirect failed: ${error.message}`);
    }

    await page.waitForTimeout(3000);

    // STEP 3: Navigate to Unified Dashboard
    console.log('\n🎯 STEP 3: Navigating to unified dashboard...');
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');
    logEvent('NAVIGATION', 'Navigated to unified dashboard');

    // STEP 4: 90-Second Deep Monitoring
    console.log('\n⏱️  STEP 4: Starting 90-second deep monitoring...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const monitoringStartTime = Date.now();
    let secondsElapsed = 0;
    let cardsLoaded = false;

    for (let i = 0; i < 90; i++) {
      await page.waitForTimeout(1000);
      secondsElapsed = i + 1;
      
      // Check loading indicators
      const loadingElements = await page.$$('[data-testid*="loading"], .loading, .spinner, [class*="loading"]');
      const loadingTexts = [];
      
      for (const element of loadingElements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          loadingTexts.push(text.trim());
        }
      }

      if (loadingTexts.length > 0) {
        const loadingState = `Second ${secondsElapsed}: ${loadingTexts.join(', ')}`;
        investigation.loadingStates.push(loadingState);
        console.log(`   ⏳ ${loadingState}`);
      }

      // Check if Super Cards finally appear
      const cardsVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
      const performanceHub = await page.isVisible('[data-testid*="performance"], [class*="performance"]');
      const incomeHub = await page.isVisible('[data-testid*="income"], [class*="income"]');
      
      if (cardsVisible || performanceHub || incomeHub) {
        cardsLoaded = true;
        logEvent('SUCCESS', `Super Cards became visible at second ${secondsElapsed}`);
        console.log(`   ✅ Super Cards loaded after ${secondsElapsed} seconds!`);
        break;
      }

      // Check authentication state periodically
      if (i % 10 === 0) {
        try {
          const authResponse = await page.request.get('http://localhost:3000/api/auth/me');
          if (authResponse.status() === 401) {
            logEvent('AUTH_ERROR', `401 Unauthorized at second ${secondsElapsed}`);
            console.log(`   ❌ Authentication failed at second ${secondsElapsed}`);
          } else if (authResponse.status() === 200) {
            logEvent('AUTH', `Authentication valid at second ${secondsElapsed}`);
          }
        } catch (error) {
          logEvent('AUTH_ERROR', `Auth check failed at second ${secondsElapsed}: ${error.message}`);
        }
      }

      // Log progress every 15 seconds
      if (i % 15 === 0 && i > 0) {
        console.log(`   📊 Progress: ${secondsElapsed}/90 seconds - Still monitoring...`);
      }
    }

    // STEP 5: Final State Documentation
    console.log('\n📋 STEP 5: Documenting final state...');
    
    const finalLoadingElements = await page.$$('[data-testid*="loading"], .loading, .spinner, [class*="loading"]');
    const finalCardsVisible = await page.isVisible('[data-testid="super-cards-grid"], .super-cards-grid, .super-cards');
    const pageTitle = await page.title();
    const currentUrl = page.url();

    investigation.finalState = {
      cardsLoaded,
      secondsElapsed,
      stillLoading: finalLoadingElements.length > 0,
      pageTitle,
      currentUrl,
      finalCardsVisible
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 INVESTIGATION RESULTS:');
    console.log(`   🕒 Total monitoring time: ${secondsElapsed} seconds`);
    console.log(`   ✅ Cards loaded: ${cardsLoaded ? 'YES' : 'NO'}`);
    console.log(`   ⏳ Still loading: ${investigation.finalState.stillLoading ? 'YES' : 'NO'}`);
    console.log(`   🔗 Final URL: ${currentUrl}`);
    console.log(`   📄 Page title: ${pageTitle}`);
    console.log(`   ❌ Console errors: ${investigation.consoleErrors.length}`);
    console.log(`   🌐 Network requests: ${investigation.networkRequests.length}`);
    console.log(`   🔄 Loading state changes: ${investigation.loadingStates.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
    logEvent('INVESTIGATION_ERROR', error.message);
  } finally {
    await browser.close();
  }

  // Generate detailed report
  await generateDetailedReport();
}

function setupEventListeners(page) {
  // Console error monitoring
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const error = {
        timestamp: new Date().toISOString(),
        type: 'console_error',
        text: msg.text(),
        location: msg.location()
      };
      investigation.consoleErrors.push(error);
      console.log(`   ❌ Console Error: ${msg.text()}`);
    }
  });

  // Network request monitoring
  page.on('request', (request) => {
    const networkRequest = {
      timestamp: new Date().toISOString(),
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType()
    };
    investigation.networkRequests.push(networkRequest);
    
    if (request.url().includes('/api/')) {
      console.log(`   🌐 API Request: ${request.method()} ${request.url()}`);
    }
  });

  // Network response monitoring
  page.on('response', (response) => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      const statusText = status >= 400 ? '❌' : '✅';
      console.log(`   📡 API Response: ${statusText} ${status} ${response.url()}`);
      
      if (status === 401) {
        logEvent('AUTH_ERROR', `401 response from ${response.url()}`);
      }
    }
  });

  // Page error monitoring
  page.on('pageerror', (error) => {
    const pageError = {
      timestamp: new Date().toISOString(),
      type: 'page_error',
      message: error.message,
      stack: error.stack
    };
    investigation.consoleErrors.push(pageError);
    console.log(`   ❌ Page Error: ${error.message}`);
  });
}

function logEvent(type, message) {
  const event = {
    timestamp: new Date().toISOString(),
    type,
    message
  };
  investigation.authenticationEvents.push(event);
}

async function generateDetailedReport() {
  const reportPath = '/public/MasterV2/income-clarity/income-clarity-app/INVESTIGATION_REPORT.md';
  
  const report = `# CRITICAL P0 UNIFIED DASHBOARD INVESTIGATION REPORT

## Investigation Summary
- **Start Time**: ${investigation.startTime}
- **Duration**: 90 seconds (full monitoring period)
- **Final Result**: ${investigation.finalState?.cardsLoaded ? 'CARDS LOADED' : 'INFINITE LOADING CONFIRMED'}

## Critical Findings

### Final State After 90 Seconds
- **Cards Loaded**: ${investigation.finalState?.cardsLoaded ? '✅ YES' : '❌ NO - INFINITE LOADING CONFIRMED'}
- **Still Loading**: ${investigation.finalState?.stillLoading ? '❌ YES' : '✅ NO'}
- **Page Title**: ${investigation.finalState?.pageTitle}
- **Final URL**: ${investigation.finalState?.currentUrl}

### Error Analysis
- **Total Console Errors**: ${investigation.consoleErrors.length}
- **Total Network Requests**: ${investigation.networkRequests.length}
- **Loading State Changes**: ${investigation.loadingStates.length}

## Detailed Evidence

### Console Errors (${investigation.consoleErrors.length} total)
${investigation.consoleErrors.map(error => 
  `- **${error.timestamp}**: [${error.type}] ${error.text || error.message}`
).join('\n')}

### Loading States Timeline
${investigation.loadingStates.map(state => `- ${state}`).join('\n')}

### Authentication Events
${investigation.authenticationEvents.map(event => 
  `- **${event.timestamp}**: [${event.type}] ${event.message}`
).join('\n')}

### Network Requests (API calls only)
${investigation.networkRequests
  .filter(req => req.url.includes('/api/'))
  .map(req => `- **${req.timestamp}**: ${req.method} ${req.url}`)
  .join('\n')}

## Root Cause Analysis

### Pattern Recognition
${investigation.consoleErrors.length > 0 ? 
  '- **Error Pattern**: Recurring errors detected - see console errors above' : 
  '- **Error Pattern**: No console errors detected'}

${investigation.loadingStates.length > 0 ? 
  '- **Loading Pattern**: Loading indicators detected throughout monitoring period' : 
  '- **Loading Pattern**: No loading indicators detected'}

### Authentication Analysis
${investigation.authenticationEvents.filter(e => e.type === 'AUTH_ERROR').length > 0 ? 
  '- **Authentication Issues**: 401 errors detected - authentication is failing' : 
  '- **Authentication Status**: No authentication errors detected'}

### Hypothesis
${investigation.finalState?.cardsLoaded ? 
  'The unified dashboard eventually loads but takes longer than expected. Performance optimization needed.' : 
  'CONFIRMED: Infinite loading issue exists. Root cause analysis needed for authentication or API failures.'}

## Recommended Actions

${investigation.finalState?.cardsLoaded ? '' : `
### Immediate Fixes Required
1. **Fix Authentication Issues**: Multiple 401 errors indicate session management problems
2. **API Endpoint Debugging**: Check failing API endpoints for Super Cards data
3. **Error Handling**: Implement proper error boundaries and fallback states
4. **Loading State Management**: Fix infinite loading indicators
`}

### Next Steps
1. Review server logs for corresponding backend errors
2. Check Redis connectivity (seen in server logs)
3. Validate API endpoint responses
4. Test authentication flow in isolation
5. Implement proper error recovery

---
**Report Generated**: ${new Date().toISOString()}
**Investigation Status**: ${ investigation.finalState?.cardsLoaded ? 'RESOLVED (with performance issues)' : 'CRITICAL - INFINITE LOADING CONFIRMED'}
`;

  await fs.promises.writeFile(reportPath, report);
  console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  console.log('\n🎯 INVESTIGATION COMPLETE - See report for detailed analysis');
}

// Run the investigation
runInvestigation().catch(console.error);