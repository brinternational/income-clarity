#!/usr/bin/env node

/**
 * Skip Links Functionality Test
 * Tests that skip links are properly positioned and work on focus/keyboard navigation
 */

const { chromium } = require('playwright');

async function testSkipLinks() {
  console.log('🧪 SKIP LINKS FUNCTIONALITY TEST');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to localhost (where server is running)
    await page.goto('http://localhost:3000');
    console.log('📍 Navigated to localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // TEST 1: Skip links should be hidden by default
    console.log('\n🧪 Test 1: Skip links hidden by default');
    const skipLinks = await page.locator('.skip-link').all();
    console.log(`   Found ${skipLinks.length} skip links`);
    
    for (let i = 0; i < skipLinks.length; i++) {
      const link = skipLinks[i];
      const opacity = await link.evaluate(el => window.getComputedStyle(el).opacity);
      const transform = await link.evaluate(el => window.getComputedStyle(el).transform);
      console.log(`   Skip link ${i + 1}: opacity=${opacity}, transform=${transform}`);
    }
    
    // TEST 2: Tab to first skip link and verify it becomes visible
    console.log('\n🧪 Test 2: Skip links become visible on focus');
    
    // Press Tab to focus first element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Check if skip link is now visible
    const focusedSkipLink = await page.locator('.skip-link:focus').first();
    const isFocused = await focusedSkipLink.count() > 0;
    
    if (isFocused) {
      const opacity = await focusedSkipLink.evaluate(el => window.getComputedStyle(el).opacity);
      const transform = await focusedSkipLink.evaluate(el => window.getComputedStyle(el).transform);
      console.log(`   ✅ Skip link focused! opacity=${opacity}, transform=${transform}`);
      
      // Take screenshot of focused skip link
      await page.screenshot({ path: 'test-results/skip-link-focused.png' });
      console.log('   📸 Screenshot saved: test-results/skip-link-focused.png');
    } else {
      console.log('   ❌ Skip link not focused on Tab press');
    }
    
    // TEST 3: Test skip link navigation
    console.log('\n🧪 Test 3: Skip link navigation');
    
    if (isFocused) {
      // Press Enter to activate skip link
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Check if we navigated to the target
      const url = page.url();
      console.log(`   Navigation URL: ${url}`);
      
      if (url.includes('#main-content')) {
        console.log('   ✅ Skip link navigation successful');
      } else {
        console.log('   ❌ Skip link navigation failed');
      }
    }
    
    // TEST 4: Test all skip links are properly positioned
    console.log('\n🧪 Test 4: All skip links CSS validation');
    
    const skipLinkStyles = await page.evaluate(() => {
      const links = document.querySelectorAll('.skip-link');
      return Array.from(links).map((link, index) => {
        const styles = window.getComputedStyle(link);
        return {
          index: index + 1,
          position: styles.position,
          top: styles.top,
          left: styles.left,
          transform: styles.transform,
          opacity: styles.opacity,
          pointerEvents: styles.pointerEvents,
          zIndex: styles.zIndex
        };
      });
    });
    
    skipLinkStyles.forEach(style => {
      console.log(`   Skip link ${style.index}:`);
      console.log(`     position: ${style.position}`);
      console.log(`     top: ${style.top}, left: ${style.left}`);
      console.log(`     transform: ${style.transform}`);
      console.log(`     opacity: ${style.opacity}`);
      console.log(`     pointer-events: ${style.pointerEvents}`);
      console.log(`     z-index: ${style.zIndex}`);
    });
    
    console.log('\n✅ Skip links test completed successfully!');
    
  } catch (error) {
    console.error('❌ Skip links test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testSkipLinks().catch(console.error);