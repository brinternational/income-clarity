#!/usr/bin/env node

/**
 * DOM STATE INVESTIGATION
 * 
 * This script investigates what's actually being rendered in the DOM
 * when the infinite loading issue occurs.
 */

const { chromium } = require('playwright');

async function investigateDOMState() {
  console.log('🔬 DOM STATE INVESTIGATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });

    // Trigger rapid navigation
    console.log('\n🏃 Triggering rapid navigation...');
    await page.goto('http://localhost:3000/dashboard');
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');
    await page.goto('http://localhost:3000/dashboard');
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');
    await page.goto('http://localhost:3000/dashboard/super-cards-unified');
    
    // Wait a moment for any async operations
    await page.waitForTimeout(3000);

    console.log('\n🔍 Analyzing DOM state...');

    // Check what's actually in the DOM
    const bodyContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyClasses: document.body.className,
        hasMainContent: !!document.querySelector('main'),
        hasNavigation: !!document.querySelector('nav, [data-testid*="nav"]'),
        hasLoadingSpinner: !!document.querySelector('.animate-spin, [data-testid*="loading"]'),
        hasSuperCards: !!document.querySelector('[data-testid*="super-cards"], .super-cards'),
        hasPerformanceHub: !!document.querySelector('[data-testid="performance-hub"]'),
        hasIncomeHub: !!document.querySelector('[data-testid="income-intelligence-hub"]'),
        hasTaxHub: !!document.querySelector('[data-testid="tax-strategy-hub"]'),
        hasPortfolioHub: !!document.querySelector('[data-testid="portfolio-strategy-hub"]'),
        hasFinancialHub: !!document.querySelector('[data-testid="financial-planning-hub"]'),
        hasRefreshButton: !!document.querySelector('[data-testid="refresh-data"]'),
        hasAuthMessage: document.body.textContent.includes('Verifying authentication') || document.body.textContent.includes('Redirecting to login'),
        visibleElements: Array.from(document.querySelectorAll('*')).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
        }).length,
        totalElements: document.querySelectorAll('*').length
      };
    });

    console.log('\n📊 DOM Analysis Results:');
    console.log(`   🌐 URL: ${bodyContent.url}`);
    console.log(`   📄 Title: ${bodyContent.title}`);
    console.log(`   🎯 Has Main Content: ${bodyContent.hasMainContent}`);
    console.log(`   🧭 Has Navigation: ${bodyContent.hasNavigation}`);
    console.log(`   ⏳ Has Loading Spinner: ${bodyContent.hasLoadingSpinner}`);
    console.log(`   🎪 Has Super Cards Container: ${bodyContent.hasSuperCards}`);
    console.log(`   📈 Has Performance Hub: ${bodyContent.hasPerformanceHub}`);
    console.log(`   💰 Has Income Hub: ${bodyContent.hasIncomeHub}`);
    console.log(`   💼 Has Tax Hub: ${bodyContent.hasTaxHub}`);
    console.log(`   📊 Has Portfolio Hub: ${bodyContent.hasPortfolioHub}`);
    console.log(`   🎯 Has Financial Hub: ${bodyContent.hasFinancialHub}`);
    console.log(`   🔄 Has Refresh Button: ${bodyContent.hasRefreshButton}`);
    console.log(`   🔐 Has Auth Message: ${bodyContent.hasAuthMessage}`);
    console.log(`   👁️  Visible Elements: ${bodyContent.visibleElements}`);
    console.log(`   🌍 Total Elements: ${bodyContent.totalElements}`);

    // Get the actual HTML structure of key areas
    console.log('\n🏗️ HTML Structure Analysis:');
    
    const mainHTML = await page.evaluate(() => {
      const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
      return main ? main.innerHTML.substring(0, 1000) + '...' : 'No main content found';
    });
    
    console.log(`   📝 Main content preview: ${mainHTML.substring(0, 200)}...`);

    // Check for any React error boundaries or hydration issues
    const reactErrors = await page.evaluate(() => {
      const errors = [];
      
      // Check for React error boundaries
      const errorBoundaries = document.querySelectorAll('[data-reactroot] .error, .react-error, .error-boundary');
      if (errorBoundaries.length > 0) {
        errors.push(`React error boundaries found: ${errorBoundaries.length}`);
      }
      
      // Check for hydration mismatches
      const hydrationWarnings = Array.from(document.querySelectorAll('*')).some(el => 
        el.getAttribute && el.getAttribute('data-reactroot') && el.innerHTML.includes('hydration')
      );
      if (hydrationWarnings) {
        errors.push('Hydration warnings detected');
      }
      
      // Check if React has actually mounted
      const hasReactRoot = !!document.querySelector('[data-reactroot]');
      if (!hasReactRoot) {
        errors.push('No React root found - React may not have mounted');
      }
      
      return errors;
    });

    if (reactErrors.length > 0) {
      console.log('\n❌ React Issues Detected:');
      reactErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ No obvious React issues detected');
    }

    // Check JavaScript console for any runtime errors
    const jsErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    // Trigger a refresh to see if that resolves it
    console.log('\n🔄 Testing manual refresh...');
    await page.reload();
    await page.waitForTimeout(3000);

    const afterRefreshState = await page.evaluate(() => {
      return {
        hasSuperCards: !!document.querySelector('[data-testid*="super-cards"], .super-cards'),
        hasPerformanceHub: !!document.querySelector('[data-testid="performance-hub"]'),
        hasLoadingSpinner: !!document.querySelector('.animate-spin, [data-testid*="loading"]')
      };
    });

    console.log('\n📊 After Refresh State:');
    console.log(`   🎪 Has Super Cards: ${afterRefreshState.hasSuperCards}`);
    console.log(`   📈 Has Performance Hub: ${afterRefreshState.hasPerformanceHub}`);
    console.log(`   ⏳ Has Loading Spinner: ${afterRefreshState.hasLoadingSpinner}`);

    if (afterRefreshState.hasSuperCards && !bodyContent.hasSuperCards) {
      console.log('\n🎯 KEY FINDING: Manual refresh FIXES the issue!');
      console.log('   This confirms the problem is in the component state management during navigation.');
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the investigation
investigateDOMState().catch(console.error);