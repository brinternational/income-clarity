#!/usr/bin/env node

/**
 * Production Contrast Verification Script
 * Tests text contrast on the actual production URL
 */

const { chromium } = require('playwright');

async function testProductionContrast() {
  console.log('🎯 Testing Production Text Contrast...');
  console.log('🔍 URL: https://incomeclarity.ddns.net');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to production
    console.log('📍 Loading production site...');
    await page.goto('https://incomeclarity.ddns.net', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take screenshot
    await page.screenshot({ path: 'production-contrast-test.png', fullPage: true });
    console.log('📸 Screenshot saved: production-contrast-test.png');
    
    // Test key elements for text visibility
    console.log('🔍 Testing text element visibility...');
    
    const textElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, p, span, a, button, nav');
      const results = [];
      
      elements.forEach((el, index) => {
        if (el.textContent && el.textContent.trim()) {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const backgroundColor = style.backgroundColor;
          
          results.push({
            index,
            text: el.textContent.trim().substring(0, 50),
            color,
            backgroundColor,
            element: el.tagName
          });
        }
      });
      
      return results;
    });
    
    // Analyze results
    let contrastIssues = 0;
    let totalElements = textElements.length;
    
    console.log('\n📊 PRODUCTION TEXT ANALYSIS:');
    console.log(`📝 Total text elements: ${totalElements}`);
    
    // Check for problematic color combinations
    textElements.forEach(el => {
      const isDarkText = el.color.includes('rgb(15, 23, 42)') || el.color.includes('rgb(0, 0, 0)');
      const isLightBg = el.backgroundColor === 'rgba(0, 0, 0, 0)' || el.backgroundColor.includes('rgb(255, 255, 255)');
      const isProblematic = el.color.includes('rgb(15, 23, 42)') && !isLightBg;
      
      if (isProblematic) {
        contrastIssues++;
        console.log(`❌ ${el.element}: "${el.text}" - Color: ${el.color}`);
      }
    });
    
    // Login and test dashboard
    console.log('\n🔑 Testing authenticated pages...');
    await page.goto('https://incomeclarity.ddns.net/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Screenshot dashboard
    await page.screenshot({ path: 'production-dashboard-contrast-test.png', fullPage: true });
    console.log('📸 Dashboard screenshot saved: production-dashboard-contrast-test.png');
    
    // Test dashboard text
    const dashboardElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('nav, .sidebar, [role="navigation"], h1, h2, h3');
      const results = [];
      
      elements.forEach((el, index) => {
        if (el.textContent && el.textContent.trim()) {
          const style = window.getComputedStyle(el);
          results.push({
            text: el.textContent.trim().substring(0, 50),
            color: style.color,
            element: el.tagName
          });
        }
      });
      
      return results;
    });
    
    let dashboardIssues = 0;
    dashboardElements.forEach(el => {
      if (el.color.includes('rgb(15, 23, 42)')) {
        dashboardIssues++;
        console.log(`❌ Dashboard ${el.element}: "${el.text}" - Color: ${el.color}`);
      }
    });
    
    // Final results
    console.log('\n📊 FINAL RESULTS:');
    console.log(`✅ Landing page elements tested: ${totalElements}`);
    console.log(`❌ Landing page contrast issues: ${contrastIssues}`);
    console.log(`❌ Dashboard contrast issues: ${dashboardIssues}`);
    
    if (contrastIssues === 0 && dashboardIssues === 0) {
      console.log('🎉 SUCCESS: No contrast issues detected on production!');
    } else {
      console.log('⚠️  ISSUES DETECTED: Text contrast problems persist');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testProductionContrast().catch(console.error);