#!/usr/bin/env node

/**
 * Comprehensive Text Contrast Audit
 * Tests all pages for dark text on dark background issues
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function auditPageTextContrast(page, pageName, url) {
  console.log(`🔍 Auditing ${pageName} at ${url}...`);
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Let animations settle
  
  // Get all text-containing elements
  const textElements = await page.$$eval('*', elements => {
    return elements
      .filter(el => {
        const text = el.textContent?.trim();
        const hasText = text && text.length > 0;
        const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0;
        const computedStyle = window.getComputedStyle(el);
        const notHidden = computedStyle.visibility !== 'hidden' && computedStyle.display !== 'none';
        
        return hasText && isVisible && notHidden;
      })
      .map(el => {
        const computedStyle = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        return {
          tagName: el.tagName.toLowerCase(),
          className: el.className || '',
          textContent: el.textContent?.trim().slice(0, 100) || '', // Limit text length
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor,
          fontSize: computedStyle.fontSize,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
  });
  
  // Analyze contrast issues
  const contrastIssues = textElements.filter(el => {
    const color = el.color;
    const bgColor = el.backgroundColor;
    
    // Check for dark text colors that could be invisible on dark backgrounds
    const isDarkText = (
      color.includes('rgb(15, 23, 42)') ||  // slate-900
      color.includes('rgb(30, 41, 59)') ||  // slate-800  
      color.includes('rgb(51, 65, 85)') ||  // slate-700
      color.includes('rgb(0, 0, 0)') ||     // black
      color === 'rgba(0, 0, 0, 0)' ||      // transparent
      color.includes('rgb(71, 85, 105)')    // slate-600
    );
    
    // Check for dark backgrounds
    const isDarkBackground = (
      bgColor.includes('rgb(15, 23, 42)') || // slate-900
      bgColor.includes('rgb(30, 41, 59)') || // slate-800
      bgColor.includes('rgb(51, 65, 85)') || // slate-700
      bgColor === 'rgba(0, 0, 0, 0)'        // transparent (inherits dark bg)
    );
    
    return isDarkText && (isDarkBackground || bgColor === 'rgba(0, 0, 0, 0)');
  });
  
  return { textElements, contrastIssues };
}

async function runComprehensiveTextContrastAudit() {
  console.log('🎯 Running Comprehensive Text Contrast Audit...');
  
  let browser;
  try {
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
      colorScheme: 'dark'
    });

    const page = await context.newPage();

    // Force dark mode
    await page.addInitScript(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('income-clarity-theme', 'accessibility-dark');
    });

    const results = {};
    
    // Test pages
    const pagesToTest = [
      { name: 'Landing Page', url: 'http://localhost:3000/' },
      { name: 'Login Page', url: 'http://localhost:3000/auth/login' },
    ];
    
    for (const pageInfo of pagesToTest) {
      results[pageInfo.name] = await auditPageTextContrast(page, pageInfo.name, pageInfo.url);
    }
    
    // Test authenticated pages
    console.log('🔑 Authenticating for protected pages...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');  
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
    const authenticatedPages = [
      { name: 'Dashboard', url: 'http://localhost:3000/dashboard' },
      { name: 'Performance Hub', url: 'http://localhost:3000/dashboard/performance' },
      { name: 'Super Cards', url: 'http://localhost:3000/dashboard/super-cards' },
    ];
    
    for (const pageInfo of authenticatedPages) {
      try {
        results[pageInfo.name] = await auditPageTextContrast(page, pageInfo.name, pageInfo.url);
      } catch (error) {
        console.log(`⚠️ Could not test ${pageInfo.name}: ${error.message}`);
        results[pageInfo.name] = { textElements: [], contrastIssues: [], error: error.message };
      }
    }

    // Take screenshot evidence
    const screenshotDir = path.join(__dirname, '..', 'test-results', 'comprehensive-contrast-audit');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Screenshot each page for evidence
    for (const pageInfo of [...pagesToTest, ...authenticatedPages]) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForTimeout(1000);
        
        const filename = pageInfo.name.toLowerCase().replace(/\s+/g, '-') + '-contrast-audit.png';
        await page.screenshot({
          path: path.join(screenshotDir, filename),
          fullPage: true
        });
        console.log(`📸 Screenshot saved: ${filename}`);
      } catch (error) {
        console.log(`⚠️ Could not screenshot ${pageInfo.name}`);
      }
    }
    
    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      testName: 'Comprehensive Text Contrast Audit',
      pages: Object.keys(results).length,
      totalResults: results,
      summary: {
        totalTextElements: Object.values(results).reduce((sum, result) => sum + (result.textElements?.length || 0), 0),
        totalContrastIssues: Object.values(results).reduce((sum, result) => sum + (result.contrastIssues?.length || 0), 0),
        pagesWithIssues: Object.entries(results).filter(([_, result]) => (result.contrastIssues?.length || 0) > 0).length,
        pagesSummary: Object.entries(results).map(([pageName, result]) => ({
          pageName,
          textElements: result.textElements?.length || 0,
          contrastIssues: result.contrastIssues?.length || 0,
          hasError: !!result.error
        }))
      }
    };

    // Save detailed report
    fs.writeFileSync(
      path.join(screenshotDir, 'comprehensive-contrast-audit-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Print summary
    console.log('\n📊 COMPREHENSIVE TEXT CONTRAST AUDIT RESULTS:');
    console.log(`📄 Pages tested: ${report.pages}`);
    console.log(`📝 Total text elements: ${report.summary.totalTextElements}`);
    console.log(`🚨 Total contrast issues: ${report.summary.totalContrastIssues}`);
    console.log(`⚠️ Pages with issues: ${report.summary.pagesWithIssues}`);
    
    // Print per-page summary
    console.log('\n📋 Per-Page Results:');
    report.summary.pagesSummary.forEach(page => {
      const status = page.contrastIssues === 0 ? '✅' : '❌';
      const error = page.hasError ? ' (ERROR)' : '';
      console.log(`  ${status} ${page.pageName}: ${page.textElements} elements, ${page.contrastIssues} issues${error}`);
    });
    
    // Highlight issues if any
    if (report.summary.totalContrastIssues > 0) {
      console.log('\n🚨 DETAILED CONTRAST ISSUES:');
      Object.entries(results).forEach(([pageName, result]) => {
        if (result.contrastIssues && result.contrastIssues.length > 0) {
          console.log(`\n  📄 ${pageName}:`);
          result.contrastIssues.slice(0, 5).forEach((issue, index) => { // Show max 5 issues per page
            console.log(`    ❌ ${issue.tagName}.${issue.className}: "${issue.textContent.slice(0, 50)}..." - Color: ${issue.color}`);
          });
          if (result.contrastIssues.length > 5) {
            console.log(`    ... and ${result.contrastIssues.length - 5} more issues`);
          }
        }
      });
    } else {
      console.log('\n🎉 EXCELLENT! No contrast issues detected across all pages!');
    }

    console.log(`\n📄 Detailed report: ${path.join(screenshotDir, 'comprehensive-contrast-audit-report.json')}`);
    console.log(`📸 Screenshots: ${screenshotDir}/`);

    return report.summary.totalContrastIssues === 0;

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the audit
if (require.main === module) {
  runComprehensiveTextContrastAudit()
    .then(success => {
      if (success) {
        console.log('\n🎉 COMPREHENSIVE TEXT CONTRAST AUDIT: PASSED - No contrast issues detected!');
        process.exit(0);
      } else {
        console.log('\n❌ COMPREHENSIVE TEXT CONTRAST AUDIT: FAILED - Contrast issues detected!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Audit execution failed:', error);
      process.exit(1);
    });
}

module.exports = runComprehensiveTextContrastAudit;