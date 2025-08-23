#!/usr/bin/env node

/**
 * Quick Text Contrast Validation
 * Tests that the main dark text issues are fixed
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function quickContrastValidation() {
  console.log('🎯 Quick Text Contrast Validation...');
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
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

    // Test Performance Hub specifically (the main issue reported)
    console.log('🔑 Testing Performance Hub (main issue)...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    await page.goto('http://localhost:3000/dashboard/performance');
    await page.waitForTimeout(3000); // Let it load
    
    // Check for dark text on dark background in Performance Hub
    const performanceHubIssues = await page.$$eval('*', elements => {
      return elements
        .filter(el => {
          const style = window.getComputedStyle(el);
          const text = el.textContent?.trim();
          const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0;
          
          // Check for dark text that could be invisible
          const isDarkText = (
            style.color.includes('rgb(15, 23, 42)') ||  // slate-900
            style.color.includes('rgb(30, 41, 59)') ||  // slate-800
            style.color.includes('rgb(0, 0, 0)')        // black
          );
          
          return text && text.length > 0 && isVisible && isDarkText;
        })
        .map(el => ({
          text: el.textContent?.trim().slice(0, 50),
          color: window.getComputedStyle(el).color,
          className: el.className
        }))
        .slice(0, 10); // Limit to first 10 issues
    });

    // Quick dashboard navigation test
    console.log('🧭 Testing Dashboard Navigation...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    const navigationIssues = await page.$$eval('nav, .sidebar', elements => {
      const issues = [];
      elements.forEach(nav => {
        const allTextElements = nav.querySelectorAll('*');
        allTextElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const text = el.textContent?.trim();
          
          if (text && text.length > 0) {
            const isDarkText = (
              style.color.includes('rgb(15, 23, 42)') ||
              style.color.includes('rgb(30, 41, 59)') ||
              style.color.includes('rgb(0, 0, 0)')
            );
            
            if (isDarkText) {
              issues.push({
                text: text.slice(0, 30),
                color: style.color,
                tag: el.tagName.toLowerCase()
              });
            }
          }
        });
      });
      return issues.slice(0, 5); // Limit to first 5 issues
    });

    // Take a quick screenshot for evidence
    const screenshotDir = path.join(__dirname, '..', 'test-results', 'quick-contrast-validation');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    await page.screenshot({
      path: path.join(screenshotDir, 'dashboard-after-contrast-fixes.png'),
      fullPage: false
    });

    // Results
    const totalIssues = performanceHubIssues.length + navigationIssues.length;
    
    console.log('\n📊 QUICK VALIDATION RESULTS:');
    console.log(`🎯 Performance Hub issues: ${performanceHubIssues.length}`);
    console.log(`🧭 Navigation issues: ${navigationIssues.length}`);
    console.log(`📊 Total issues: ${totalIssues}`);
    
    if (totalIssues > 0) {
      console.log('\n🚨 REMAINING ISSUES:');
      
      if (performanceHubIssues.length > 0) {
        console.log('  Performance Hub:');
        performanceHubIssues.forEach(issue => {
          console.log(`    ❌ "${issue.text}" - ${issue.color}`);
        });
      }
      
      if (navigationIssues.length > 0) {
        console.log('  Navigation:');
        navigationIssues.forEach(issue => {
          console.log(`    ❌ ${issue.tag}: "${issue.text}" - ${issue.color}`);
        });
      }
    } else {
      console.log('\n🎉 SUCCESS! No dark text on dark background issues found!');
    }

    console.log(`\n📸 Screenshot saved: ${screenshotDir}/dashboard-after-contrast-fixes.png`);
    
    return totalIssues === 0;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the validation
if (require.main === module) {
  quickContrastValidation()
    .then(success => {
      if (success) {
        console.log('\n🎉 QUICK CONTRAST VALIDATION: PASSED');
        process.exit(0);
      } else {
        console.log('\n⚠️ QUICK CONTRAST VALIDATION: Some issues remain');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Validation failed:', error);
      process.exit(1);
    });
}

module.exports = quickContrastValidation;