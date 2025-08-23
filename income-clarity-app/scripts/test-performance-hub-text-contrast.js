#!/usr/bin/env node

/**
 * Test Performance Hub Text Contrast Fix
 * Specifically tests that SPY comparison metrics are visible on dark backgrounds
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPerformanceHubTextContrast() {
  console.log('🎯 Testing Performance Hub Text Contrast Fix...');
  
  let browser;
  try {
    // Launch browser with dark mode
    browser = await chromium.launch({
      headless: true,
      args: [
        '--force-dark-mode',
        '--enable-features=WebContentsForceDarkMode',
        '--force-prefers-color-scheme=dark'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      colorScheme: 'dark',
      extraHTTPHeaders: {
        'sec-ch-prefers-color-scheme': 'dark'
      }
    });

    const page = await context.newPage();

    // Inject dark mode CSS to ensure it's applied
    await page.addInitScript(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('income-clarity-theme', 'accessibility-dark');
    });

    console.log('🌐 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    console.log('🔑 Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('✅ Logged in successfully');

    // Navigate specifically to Performance Hub
    console.log('🎯 Navigating to Performance Hub...');
    await page.goto('http://localhost:3000/dashboard/performance');
    
    // Wait for the Performance Hub to load
    await page.waitForSelector('[data-testid="performance-hub"], .premium-card, .currency-display', { timeout: 10000 });
    
    console.log('📊 Performance Hub loaded, checking text elements...');

    // Check for specific performance metrics that were having contrast issues
    const metricsSelectors = [
      '.currency-display', // Main SPY comparison metric
      '[class*="text-4xl"]', // Large text metrics
      '[class*="text-5xl"]', // Large text metrics
      '[class*="text-6xl"]', // Large text metrics
      '[aria-label*="performance"]', // Performance labels
      '[aria-label*="SPY"]', // SPY comparison labels
      '.text-prosperity-800', // Prosperity color text
      '.text-wealth-800', // Wealth color text
      'text:contains("vs SPY Performance")', // Specific text we know was problematic
      'text:contains("%")', // Percentage displays
    ];

    // Test each metric selector
    const contrastResults = [];
    
    for (const selector of metricsSelectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`🔍 Testing selector: ${selector} (${elements.length} elements found)`);
        
        if (elements.length > 0) {
          for (let i = 0; i < Math.min(elements.length, 3); i++) { // Test max 3 elements per selector
            const element = elements[i];
            
            // Get computed styles
            const styles = await page.evaluate(el => {
              const computedStyle = window.getComputedStyle(el);
              const rect = el.getBoundingClientRect();
              return {
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor,
                textContent: el.textContent?.trim() || '',
                visible: rect.width > 0 && rect.height > 0 && computedStyle.visibility !== 'hidden',
                opacity: computedStyle.opacity
              };
            }, element);
            
            contrastResults.push({
              selector,
              index: i,
              ...styles
            });
            
            console.log(`  📋 Element ${i}: "${styles.textContent}" | Color: ${styles.color} | BG: ${styles.backgroundColor} | Visible: ${styles.visible}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not test selector ${selector}: ${error.message}`);
      }
    }

    // Take screenshot for visual verification
    const screenshotDir = path.join(__dirname, '..', 'test-results', 'contrast-fix-validation');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    await page.screenshot({
      path: path.join(screenshotDir, 'performance-hub-dark-mode-contrast-test.png'),
      fullPage: true
    });
    
    console.log('📸 Screenshot saved: performance-hub-dark-mode-contrast-test.png');

    // Generate contrast analysis report
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Performance Hub Text Contrast Fix Validation',
      totalElementsTested: contrastResults.length,
      contrastResults,
      summary: {
        visibleElements: contrastResults.filter(r => r.visible).length,
        invisibleElements: contrastResults.filter(r => !r.visible).length,
        elementsWithText: contrastResults.filter(r => r.textContent && r.textContent.length > 0).length,
        potentialIssues: contrastResults.filter(r => 
          r.visible && r.color && (
            r.color.includes('rgb(15, 23, 42)') || // slate-900 (dark text)
            r.color.includes('rgb(0, 0, 0)') || // black text
            r.color === 'rgba(0, 0, 0, 0)' // transparent text
          )
        ).length
      }
    };

    // Save detailed report
    fs.writeFileSync(
      path.join(screenshotDir, 'contrast-test-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Print summary
    console.log('\n📊 CONTRAST TEST RESULTS:');
    console.log(`✅ Total elements tested: ${report.totalElementsTested}`);
    console.log(`✅ Visible elements: ${report.summary.visibleElements}`);
    console.log(`⚠️  Invisible elements: ${report.summary.invisibleElements}`);
    console.log(`📝 Elements with text: ${report.summary.elementsWithText}`);
    console.log(`🚨 Potential contrast issues: ${report.summary.potentialIssues}`);

    // Highlight any potential issues
    if (report.summary.potentialIssues > 0) {
      console.log('\n🚨 POTENTIAL CONTRAST ISSUES DETECTED:');
      const problematicElements = contrastResults.filter(r => 
        r.visible && r.color && (
          r.color.includes('rgb(15, 23, 42)') || 
          r.color.includes('rgb(0, 0, 0)') || 
          r.color === 'rgba(0, 0, 0, 0)'
        )
      );
      
      problematicElements.forEach(el => {
        console.log(`  ❌ ${el.selector}[${el.index}]: "${el.textContent}" has potentially invisible color: ${el.color}`);
      });
    } else {
      console.log('\n🎉 NO CONTRAST ISSUES DETECTED - All text appears to have proper contrast!');
    }

    console.log(`\n📄 Detailed report saved to: ${path.join(screenshotDir, 'contrast-test-report.json')}`);
    console.log(`📸 Visual evidence saved to: ${path.join(screenshotDir, 'performance-hub-dark-mode-contrast-test.png')}`);

    return report.summary.potentialIssues === 0;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot if possible
    try {
      const errorDir = path.join(__dirname, '..', 'test-results', 'contrast-fix-validation');
      if (!fs.existsSync(errorDir)) {
        fs.mkdirSync(errorDir, { recursive: true });
      }
      await page.screenshot({
        path: path.join(errorDir, 'performance-hub-contrast-test-ERROR.png'),
        fullPage: true
      });
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.log('Could not save error screenshot');
    }
    
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testPerformanceHubTextContrast()
    .then(success => {
      if (success) {
        console.log('\n🎉 PERFORMANCE HUB TEXT CONTRAST FIX: SUCCESS');
        process.exit(0);
      } else {
        console.log('\n❌ PERFORMANCE HUB TEXT CONTRAST FIX: FAILED');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testPerformanceHubTextContrast;