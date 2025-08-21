#!/usr/bin/env node

/**
 * UI Contrast Testing Script
 * Tests the new premium design system for accessibility and visual quality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: {
    email: 'test@example.com',
    password: 'password123'
  },
  screenshots: {
    dir: './screenshots',
    quality: 90,
    fullPage: true
  }
};

async function testUIContrast() {
  console.log('🎨 Testing UI Contrast and Premium Design...');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(TEST_CONFIG.screenshots.dir)) {
    fs.mkdirSync(TEST_CONFIG.screenshots.dir, { recursive: true });
  }

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Login first
    console.log('🔐 Logging in...');
    await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', TEST_CONFIG.testUser.email);
    await page.type('input[name="password"]', TEST_CONFIG.testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Test Performance Hub - the main component we fixed
    console.log('📊 Testing Performance Hub UI...');
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/super-cards/performance-hub`);
    await page.waitForSelector('.premium-card', { timeout: 10000 });

    // Wait for animations and data to load
    await page.waitForTimeout(3000);

    // Take screenshot of Performance Hub
    const performanceScreenshot = path.join(TEST_CONFIG.screenshots.dir, 'performance-hub-fixed.png');
    await page.screenshot({ 
      path: performanceScreenshot,
      fullPage: TEST_CONFIG.screenshots.fullPage,
      quality: TEST_CONFIG.screenshots.quality 
    });
    console.log(`📸 Performance Hub screenshot saved: ${performanceScreenshot}`);

    // Test text visibility - look for any invisible text elements
    console.log('🔍 Checking for invisible text elements...');
    const invisibleTextElements = await page.evaluate(() => {
      const issues = [];
      const allTextElements = document.querySelectorAll('*');
      
      for (const element of allTextElements) {
        if (element.textContent && element.textContent.trim()) {
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Check for white text on white backgrounds
          if (color === 'rgb(255, 255, 255)' && 
              (backgroundColor === 'rgb(255, 255, 255)' || backgroundColor === 'rgba(0, 0, 0, 0)')) {
            issues.push({
              element: element.tagName,
              text: element.textContent.trim().substring(0, 50),
              color: color,
              backgroundColor: backgroundColor,
              className: element.className
            });
          }
        }
      }
      return issues;
    });

    if (invisibleTextElements.length > 0) {
      console.log('❌ Found potential text visibility issues:');
      invisibleTextElements.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.element} - "${issue.text}" (${issue.className})`);
      });
    } else {
      console.log('✅ No white-on-white text issues detected!');
    }

    // Check if premium card styling is applied
    console.log('🎨 Verifying premium design system...');
    const premiumElements = await page.evaluate(() => {
      const cards = document.querySelectorAll('.premium-card');
      const heroMetrics = document.querySelectorAll('.hero-metric-container');
      const tabs = document.querySelectorAll('.premium-tabs');
      
      return {
        premiumCards: cards.length,
        heroMetrics: heroMetrics.length,
        premiumTabs: tabs.length,
        hasGlassmorphism: cards.length > 0 && window.getComputedStyle(cards[0]).backdropFilter !== 'none'
      };
    });

    console.log(`🎯 Premium Design Elements Found:`);
    console.log(`  - Premium Cards: ${premiumElements.premiumCards}`);
    console.log(`  - Hero Metrics: ${premiumElements.heroMetrics}`);
    console.log(`  - Premium Tabs: ${premiumElements.premiumTabs}`);
    console.log(`  - Glassmorphism: ${premiumElements.hasGlassmorphism ? '✅' : '❌'}`);

    // Test different viewport sizes for responsiveness
    console.log('📱 Testing mobile responsiveness...');
    await page.setViewport({ width: 375, height: 812 }); // iPhone X
    await page.waitForTimeout(1000);
    
    const mobileScreenshot = path.join(TEST_CONFIG.screenshots.dir, 'performance-hub-mobile.png');
    await page.screenshot({ 
      path: mobileScreenshot,
      fullPage: TEST_CONFIG.screenshots.fullPage,
      quality: TEST_CONFIG.screenshots.quality 
    });
    console.log(`📸 Mobile screenshot saved: ${mobileScreenshot}`);

    // Test dark mode (if implemented)
    console.log('🌙 Testing dark mode...');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1000);
    
    const darkScreenshot = path.join(TEST_CONFIG.screenshots.dir, 'performance-hub-dark.png');
    await page.screenshot({ 
      path: darkScreenshot,
      fullPage: TEST_CONFIG.screenshots.fullPage,
      quality: TEST_CONFIG.screenshots.quality 
    });
    console.log(`📸 Dark mode screenshot saved: ${darkScreenshot}`);

    // Test contrast ratios for key text elements
    console.log('🎯 Testing WCAG contrast ratios...');
    const contrastResults = await page.evaluate(() => {
      function getContrastRatio(color1, color2) {
        // Simple contrast calculation (simplified for testing)
        function getLuminance(color) {
          const rgb = color.match(/\d+/g).map(Number);
          const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
        
        const l1 = getLuminance(color1);
        const l2 = getLuminance(color2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      const textElements = document.querySelectorAll('.hero-metric-value, .metric-card-value, .premium-tab');
      const results = [];
      
      for (const element of textElements) {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor || window.getComputedStyle(element.parentElement).backgroundColor;
        
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const ratio = getContrastRatio(color, backgroundColor);
          results.push({
            element: element.className,
            ratio: ratio.toFixed(2),
            wcagAA: ratio >= 4.5,
            wcagAAA: ratio >= 7
          });
        }
      }
      return results;
    });

    console.log('📊 Contrast Ratio Results:');
    contrastResults.forEach(result => {
      const status = result.wcagAAA ? '✅ AAA' : (result.wcagAA ? '✅ AA' : '❌ FAIL');
      console.log(`  ${result.element}: ${result.ratio}:1 ${status}`);
    });

    console.log('\n🎉 UI Testing Complete!');
    console.log(`📁 Screenshots saved in: ${path.resolve(TEST_CONFIG.screenshots.dir)}/`);

  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
  
  return true;
}

// Run the test
if (require.main === module) {
  testUIContrast()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUIContrast };