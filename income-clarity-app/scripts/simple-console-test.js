#!/usr/bin/env node

/**
 * SIMPLE CONSOLE ERROR TEST
 * Direct test of the two problematic routes without login
 */

const { chromium } = require('playwright');

async function testDirectRoutes() {
  console.log('🎯 SIMPLE CONSOLE ERROR TEST\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let totalErrors = 0;
  const errors = [];

  // Set up console listeners
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      totalErrors++;
      errors.push({
        type: 'console_error',
        message: msg.text(),
        url: page.url()
      });
    }
  });

  page.on('pageerror', (error) => {
    totalErrors++;
    errors.push({
      type: 'page_error',
      message: error.message,
      url: page.url()
    });
  });

  // Test admin monitoring directly (likely needs auth redirect)
  console.log('Testing /admin/monitoring...');
  try {
    await page.goto('http://localhost:3000/admin/monitoring', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log(`   Navigation error: ${e.message}`);
  }

  // Test debug auth directly  
  console.log('Testing /debug/auth...');
  try {
    await page.goto('http://localhost:3000/debug/auth', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log(`   Navigation error: ${e.message}`);
  }

  await browser.close();

  console.log('\n=== RESULTS ===');
  console.log(`Total console errors: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log('🎉 SUCCESS! No console errors found!');
  } else {
    console.log('\nErrors found:');
    errors.forEach((error, i) => {
      console.log(`${i+1}. [${error.type}] ${error.message}`);
    });
  }
  
  process.exit(totalErrors > 0 ? 1 : 0);
}

testDirectRoutes().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});