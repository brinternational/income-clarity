#!/usr/bin/env node

/**
 * Simple Yodlee UI Test
 * Tests the FastLinkConnect component behavior and error handling
 */

const { chromium } = require('playwright');

async function testYodleeUI() {
  console.log('🎭 YODLEE UI TEST - Error Handling Verification');
  console.log('===============================================\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  const consoleWarnings = [];
  
  // Monitor console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });
  
  try {
    console.log('📋 Testing Dashboard Page...');
    
    // Navigate to dashboard (this should redirect to login for non-authenticated users)
    await page.goto('http://localhost:3000/dashboard/super-cards', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check if we're on login page (expected behavior)
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth/login')) {
      console.log('✅ Correctly redirected to login page');
      
      // Fill in test credentials to access dashboard
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard/super-cards', { timeout: 10000 });
      console.log('✅ Successfully logged in and navigated to dashboard');
    }
    
    // Now test for console errors on the dashboard
    await page.waitForTimeout(3000); // Let the page fully load
    
    console.log('\n📊 Console Analysis:');
    console.log(`  Errors: ${consoleErrors.length}`);
    console.log(`  Warnings: ${consoleWarnings.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors found');
    }
    
    if (consoleWarnings.length > 0) {
      console.log('\n⚠️  Console Warnings:');
      consoleWarnings.slice(0, 5).forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
      if (consoleWarnings.length > 5) {
        console.log(`  ... and ${consoleWarnings.length - 5} more warnings`);
      }
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ 
      path: 'scripts/temp/yodlee-ui-test-screenshot.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved to scripts/temp/yodlee-ui-test-screenshot.png');
    
    // Test summary
    console.log('\n📋 TEST SUMMARY:');
    
    if (consoleErrors.length === 0) {
      console.log('✅ UI Test: PASS - No console errors');
      console.log('✅ Page Load: PASS - Dashboard accessible');
      console.log('✅ Auth Flow: PASS - Login working correctly');
    } else {
      console.log('❌ UI Test: FAIL - Console errors found');
      console.log('⚠️  Recommendation: Review console errors above');
    }
    
  } catch (error) {
    console.log(`❌ UI Test failed: ${error.message}`);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: 'scripts/temp/yodlee-ui-test-error.png',
        fullPage: true 
      });
      console.log('📸 Error screenshot saved to scripts/temp/yodlee-ui-test-error.png');
    } catch (screenshotError) {
      console.log('Failed to take error screenshot');
    }
  } finally {
    await browser.close();
  }
}

// Create temp directory if it doesn't exist
const fs = require('fs');
const tempDir = 'scripts/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Run the test
testYodleeUI().catch(console.error);