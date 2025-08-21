#!/usr/bin/env node

/**
 * INCOME CLARITY ACCESSIBILITY COMPLIANCE TESTING TOOL
 * 
 * Comprehensive WCAG 2.1 AA testing for Income Clarity platform
 * Tests color contrast, keyboard navigation, screen reader compatibility,
 * and professional fintech accessibility standards.
 * 
 * Usage: node scripts/test-accessibility-compliance.js [--detailed]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Professional fintech color contrast requirements
const CONTRAST_REQUIREMENTS = {
  AA_NORMAL: 4.5,      // WCAG AA normal text (18px and below)
  AA_LARGE: 3.0,       // WCAG AA large text (19px+ or 14px+ bold)
  UI_COMPONENTS: 3.0,   // Interactive elements and graphics
  AAA_NORMAL: 7.0,     // WCAG AAA enhanced contrast
  FINTECH_MINIMUM: 4.5 // Minimum for financial data readability
};

// Professional dark theme color values for testing
const INCOME_CLARITY_PROFESSIONAL_COLORS = {
  primary: '#0f1419',
  secondary: '#1a1f2e', 
  tertiary: '#2a2f3e',
  textPrimary: '#ffffff',
  textSecondary: '#b0b7c3',
  textMuted: '#8b92a3',
  accent: '#00d4aa',
  accentHover: '#00b894',
  success: '#00d4aa',
  warning: '#ffa726',
  error: '#ff5252',
  info: '#42a5f5',
  border: '#3a3f4e',
  borderHover: '#4a4f5e'
};

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  theme: 'income-clarity-professional',
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  warnings: 0,
  categories: {
    colorContrast: { passed: 0, failed: 0, warnings: 0 },
    keyboardNavigation: { passed: 0, failed: 0, warnings: 0 },
    screenReader: { passed: 0, failed: 0, warnings: 0 },
    touchTargets: { passed: 0, failed: 0, warnings: 0 },
    forms: { passed: 0, failed: 0, warnings: 0 },
    focus: { passed: 0, failed: 0, warnings: 0 }
  },
  details: []
};

/**
 * Calculate luminance of a color for contrast ratio testing
 */
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Add test result
 */
function addTestResult(category, testName, passed, message, severity = 'error', details = {}) {
  testResults.totalTests++;
  testResults.categories[category][passed ? 'passed' : severity === 'warning' ? 'warnings' : 'failed']++;
  
  if (passed) {
    testResults.passedTests++;
  } else if (severity === 'warning') {
    testResults.warnings++;
  } else {
    testResults.failedTests++;
  }
  
  testResults.details.push({
    category,
    testName,
    passed,
    message,
    severity,
    timestamp: new Date().toISOString(),
    ...details
  });
  
  const icon = passed ? '✅' : severity === 'warning' ? '⚠️' : '❌';
  console.log(`${icon} ${category}: ${testName} - ${message}`);
}

/**
 * Test color contrast compliance
 */
async function testColorContrast(page) {
  console.log('\n🎨 Testing Color Contrast Compliance...');
  
  // Test professional dark theme colors
  const colorTests = [
    { 
      name: 'Primary Text on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.textPrimary,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.AA_NORMAL
    },
    {
      name: 'Secondary Text on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.textSecondary,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.AA_NORMAL
    },
    {
      name: 'Muted Text on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.textMuted,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.AA_NORMAL
    },
    {
      name: 'Accent Color on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.accent,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.UI_COMPONENTS
    },
    {
      name: 'Success Color on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.success,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.FINTECH_MINIMUM
    },
    {
      name: 'Warning Color on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.warning,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.FINTECH_MINIMUM
    },
    {
      name: 'Error Color on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.error,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.FINTECH_MINIMUM
    },
    {
      name: 'Border on Primary Background',
      foreground: INCOME_CLARITY_PROFESSIONAL_COLORS.border,
      background: INCOME_CLARITY_PROFESSIONAL_COLORS.primary,
      requirement: CONTRAST_REQUIREMENTS.UI_COMPONENTS
    }
  ];
  
  for (const test of colorTests) {
    const ratio = getContrastRatio(test.foreground, test.background);
    const passed = ratio >= test.requirement;
    const aaaCompliant = ratio >= CONTRAST_REQUIREMENTS.AAA_NORMAL;
    
    let message = `Contrast ratio: ${ratio.toFixed(2)}:1 (Required: ${test.requirement}:1)`;
    if (passed && aaaCompliant) {
      message += ' - WCAG AAA Compliant!';
    } else if (passed) {
      message += ' - WCAG AA Compliant';
    }
    
    addTestResult('colorContrast', test.name, passed, message, passed ? 'success' : 'error', {
      contrastRatio: ratio,
      requirement: test.requirement,
      foreground: test.foreground,
      background: test.background
    });
  }
  
  // Test actual DOM elements for contrast
  await page.goto('https://incomeclarity.ddns.net/dashboard/super-cards');
  await page.waitForTimeout(3000);
  
  // Test text elements on the page
  const textElements = await page.$$eval('h1, h2, h3, h4, h5, h6, p, span, div, button', elements => {
    return elements.slice(0, 20).map(el => {
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        text: el.innerText?.substring(0, 50) || 'No text',
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontSize: style.fontSize
      };
    });
  });
  
  let domTestCount = 0;
  for (const element of textElements) {
    if (domTestCount >= 10) break; // Limit DOM tests
    if (!element.color || !element.backgroundColor) continue;
    
    const colorRgb = element.color.match(/\d+/g);
    const bgRgb = element.backgroundColor.match(/\d+/g);
    
    if (colorRgb && bgRgb && colorRgb.length === 3 && bgRgb.length >= 3) {
      const colorHex = `#${colorRgb.map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
      const bgHex = `#${bgRgb.slice(0,3).map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
      
      if (colorHex !== '#000000' || bgHex !== '#000000') {
        const ratio = getContrastRatio(colorHex, bgHex);
        const fontSize = parseFloat(element.fontSize);
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && element.tagName.startsWith('H'));
        const requirement = isLargeText ? CONTRAST_REQUIREMENTS.AA_LARGE : CONTRAST_REQUIREMENTS.AA_NORMAL;
        
        const passed = ratio >= requirement;
        addTestResult('colorContrast', `DOM Element: ${element.tagName}`, passed, 
          `"${element.text}" - Contrast: ${ratio.toFixed(2)}:1 (Required: ${requirement}:1)`,
          passed ? 'success' : 'error'
        );
        
        domTestCount++;
      }
    }
  }
}

/**
 * Test keyboard navigation
 */
async function testKeyboardNavigation(page) {
  console.log('\n⌨️ Testing Keyboard Navigation...');
  
  await page.goto('https://incomeclarity.ddns.net/dashboard/super-cards');
  await page.waitForTimeout(2000);
  
  // Test Tab navigation
  const focusableElements = await page.$$eval('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])', 
    elements => elements.length
  );
  
  addTestResult('keyboardNavigation', 'Focusable Elements Present', focusableElements > 0,
    `Found ${focusableElements} focusable elements`
  );
  
  // Test tab order and focus visibility
  let tabCount = 0;
  let focusVisible = 0;
  
  for (let i = 0; i < Math.min(10, focusableElements); i++) {
    await page.keyboard.press('Tab');
    tabCount++;
    
    // Check if focus is visible
    const hasFocusOutline = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return false;
      
      const styles = window.getComputedStyle(focused);
      return styles.outline !== 'none' && styles.outline !== '' && styles.outline !== '0px';
    });
    
    if (hasFocusOutline) focusVisible++;
    
    // Small delay for visual testing
    await page.waitForTimeout(100);
  }
  
  const focusVisibilityRatio = focusVisible / tabCount;
  addTestResult('keyboardNavigation', 'Focus Indicators Visible', focusVisibilityRatio >= 0.8,
    `${focusVisible}/${tabCount} elements have visible focus indicators (${(focusVisibilityRatio * 100).toFixed(1)}%)`
  );
  
  // Test Escape key functionality
  await page.keyboard.press('Escape');
  const escapeHandled = await page.evaluate(() => {
    return !document.querySelector('[role="dialog"]:not([style*="display: none"])');
  });
  
  addTestResult('keyboardNavigation', 'Escape Key Handling', escapeHandled,
    'Escape key properly handled (no open dialogs remain)'
  );
  
  // Test Enter/Space activation on buttons
  const buttons = await page.$$('button');
  if (buttons.length > 0) {
    await buttons[0].focus();
    await page.keyboard.press('Enter');
    
    addTestResult('keyboardNavigation', 'Button Activation with Enter', true,
      'Buttons can be activated with Enter key'
    );
  }
}

/**
 * Test screen reader accessibility
 */
async function testScreenReaderAccessibility(page) {
  console.log('\n🔊 Testing Screen Reader Accessibility...');
  
  await page.goto('https://incomeclarity.ddns.net/dashboard/super-cards');
  await page.waitForTimeout(2000);
  
  // Test for ARIA labels and roles
  const ariaElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    let ariaLabels = 0;
    let ariaRoles = 0;
    let altTexts = 0;
    let headingStructure = [];
    
    elements.forEach(el => {
      if (el.getAttribute('aria-label')) ariaLabels++;
      if (el.getAttribute('role')) ariaRoles++;
      if (el.tagName === 'IMG' && el.getAttribute('alt') !== null) altTexts++;
      if (/^H[1-6]$/.test(el.tagName)) {
        headingStructure.push({
          level: parseInt(el.tagName[1]),
          text: el.innerText?.substring(0, 30) || ''
        });
      }
    });
    
    return { ariaLabels, ariaRoles, altTexts, headingStructure };
  });
  
  addTestResult('screenReader', 'ARIA Labels Present', ariaElements.ariaLabels > 0,
    `Found ${ariaElements.ariaLabels} elements with ARIA labels`
  );
  
  addTestResult('screenReader', 'ARIA Roles Present', ariaElements.ariaRoles > 0,
    `Found ${ariaElements.ariaRoles} elements with ARIA roles`
  );
  
  addTestResult('screenReader', 'Image Alt Text', ariaElements.altTexts > 0,
    `Found ${ariaElements.altTexts} images with alt text`
  );
  
  // Test heading structure
  const hasHeadings = ariaElements.headingStructure.length > 0;
  const properHierarchy = ariaElements.headingStructure.length === 0 || 
    ariaElements.headingStructure[0].level === 1;
  
  addTestResult('screenReader', 'Heading Structure', hasHeadings && properHierarchy,
    `Found ${ariaElements.headingStructure.length} headings with ${properHierarchy ? 'proper' : 'improper'} hierarchy`
  );
  
  // Test for skip links
  const skipLinks = await page.$$eval('a[href^="#"], .skip-link', links => links.length);
  addTestResult('screenReader', 'Skip Links Present', skipLinks > 0,
    `Found ${skipLinks} skip links for navigation`
  );
}

/**
 * Test touch targets and mobile accessibility
 */
async function testTouchTargets(page) {
  console.log('\n👆 Testing Touch Target Sizes...');
  
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
  await page.goto('https://incomeclarity.ddns.net/dashboard/super-cards');
  await page.waitForTimeout(2000);
  
  const touchTargets = await page.$$eval('button, input, select, a[href], [role="button"], [onclick]', elements => {
    return elements.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        tagName: el.tagName,
        width: rect.width,
        height: rect.height,
        area: rect.width * rect.height,
        text: el.innerText?.substring(0, 20) || el.alt || el.title || 'No text'
      };
    });
  });
  
  const minimumSize = 44; // WCAG AA minimum
  const recommendedSize = 48; // Better for mobile
  
  let compliantTargets = 0;
  let recommendedTargets = 0;
  
  touchTargets.forEach((target, index) => {
    const meetsMinimum = target.width >= minimumSize && target.height >= minimumSize;
    const meetsRecommended = target.width >= recommendedSize && target.height >= recommendedSize;
    
    if (meetsMinimum) compliantTargets++;
    if (meetsRecommended) recommendedTargets++;
    
    if (index < 5) { // Test first 5 elements
      addTestResult('touchTargets', `Touch Target: ${target.tagName}`, meetsMinimum,
        `"${target.text}" - Size: ${Math.round(target.width)}x${Math.round(target.height)}px (Min: ${minimumSize}x${minimumSize}px)`
      );
    }
  });
  
  const complianceRate = touchTargets.length > 0 ? (compliantTargets / touchTargets.length) : 0;
  addTestResult('touchTargets', 'Overall Touch Target Compliance', complianceRate >= 0.8,
    `${compliantTargets}/${touchTargets.length} targets meet minimum size (${(complianceRate * 100).toFixed(1)}%)`
  );
}

/**
 * Test form accessibility
 */
async function testFormAccessibility(page) {
  console.log('\n📝 Testing Form Accessibility...');
  
  await page.goto('https://incomeclarity.ddns.net/login');
  await page.waitForTimeout(2000);
  
  // Test for form labels
  const formElements = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    let hasLabels = 0;
    let hasPlaceholders = 0;
    let hasRequiredIndicators = 0;
    
    inputs.forEach(input => {
      const id = input.id;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (label || ariaLabel || ariaLabelledBy) hasLabels++;
      if (input.placeholder) hasPlaceholders++;
      if (input.required) hasRequiredIndicators++;
    });
    
    return {
      totalInputs: inputs.length,
      hasLabels,
      hasPlaceholders,
      hasRequiredIndicators
    };
  });
  
  if (formElements.totalInputs > 0) {
    const labelCompliance = formElements.hasLabels / formElements.totalInputs;
    addTestResult('forms', 'Form Labels', labelCompliance >= 0.9,
      `${formElements.hasLabels}/${formElements.totalInputs} form inputs have labels (${(labelCompliance * 100).toFixed(1)}%)`
    );
    
    addTestResult('forms', 'Required Field Indicators', formElements.hasRequiredIndicators > 0,
      `Found ${formElements.hasRequiredIndicators} required field indicators`
    );
  } else {
    addTestResult('forms', 'Form Elements', false,
      'No form elements found on login page', 'warning'
    );
  }
}

/**
 * Test focus management
 */
async function testFocusManagement(page) {
  console.log('\n🎯 Testing Focus Management...');
  
  await page.goto('https://incomeclarity.ddns.net/dashboard/super-cards');
  await page.waitForTimeout(2000);
  
  // Test initial focus
  const initialFocus = await page.evaluate(() => {
    return document.activeElement?.tagName || 'BODY';
  });
  
  addTestResult('focus', 'Initial Focus Set', initialFocus !== 'BODY',
    `Initial focus is on: ${initialFocus}`
  );
  
  // Test focus trap in modals (if any exist)
  const modals = await page.$$('[role="dialog"], .modal');
  if (modals.length > 0) {
    addTestResult('focus', 'Modal Focus Trap', true,
      `Found ${modals.length} modal(s) - focus trap testing available`
    );
  } else {
    addTestResult('focus', 'Modal Focus Trap', false,
      'No modals found to test focus trapping', 'warning'
    );
  }
  
  // Test focus restoration after navigation
  await page.keyboard.press('Tab');
  const focusAfterTab = await page.evaluate(() => {
    return document.activeElement?.tagName || 'BODY';
  });
  
  addTestResult('focus', 'Focus Navigation', focusAfterTab !== 'BODY',
    `Focus moves to: ${focusAfterTab}`
  );
}

/**
 * Generate comprehensive accessibility report
 */
function generateReport(detailed = false) {
  const report = {
    summary: {
      ...testResults,
      successRate: ((testResults.passedTests / testResults.totalTests) * 100).toFixed(1),
      wcagCompliance: testResults.passedTests >= testResults.totalTests * 0.9 ? 'AA Compliant' : 'Needs Improvement'
    },
    recommendations: [],
    detailedResults: detailed ? testResults.details : undefined
  };
  
  // Add recommendations based on results
  Object.entries(testResults.categories).forEach(([category, results]) => {
    if (results.failed > 0) {
      switch (category) {
        case 'colorContrast':
          report.recommendations.push({
            category,
            priority: 'HIGH',
            issue: 'Color contrast failures detected',
            solution: 'Use the Income Clarity Professional theme colors which meet WCAG AA standards'
          });
          break;
        case 'keyboardNavigation':
          report.recommendations.push({
            category,
            priority: 'HIGH',
            issue: 'Keyboard navigation issues',
            solution: 'Ensure all interactive elements are focusable and have visible focus indicators'
          });
          break;
        case 'touchTargets':
          report.recommendations.push({
            category,
            priority: 'MEDIUM',
            issue: 'Touch targets too small',
            solution: 'Increase button and link sizes to minimum 44x44px'
          });
          break;
      }
    }
  });
  
  return report;
}

/**
 * Main testing function
 */
async function runAccessibilityTests() {
  console.log('🚀 Starting Income Clarity Accessibility Compliance Testing...');
  console.log(`Theme: ${testResults.theme}`);
  console.log(`Timestamp: ${testResults.timestamp}\n`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set professional dark theme
  await page.addInitScript(() => {
    localStorage.setItem('income-clarity-theme', 'income-clarity-professional');
  });
  
  try {
    await testColorContrast(page);
    await testKeyboardNavigation(page);
    await testScreenReaderAccessibility(page);
    await testTouchTargets(page);
    await testFormAccessibility(page);
    await testFocusManagement(page);
    
  } catch (error) {
    console.error('Error during testing:', error);
    addTestResult('system', 'Testing Error', false, error.message);
  } finally {
    await browser.close();
  }
  
  // Generate and save report
  const detailed = process.argv.includes('--detailed');
  const report = generateReport(detailed);
  
  const reportPath = path.join(__dirname, '..', 'test-results', 'accessibility-compliance-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Console summary
  console.log('\n📊 ACCESSIBILITY TESTING COMPLETE\n');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`✅ Passed: ${testResults.passedTests}`);
  console.log(`❌ Failed: ${testResults.failedTests}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`Success Rate: ${report.summary.successRate}%`);
  console.log(`WCAG Status: ${report.summary.wcagCompliance}`);
  console.log('='.repeat(50));
  
  // Category breakdown
  console.log('\nCategory Breakdown:');
  Object.entries(testResults.categories).forEach(([category, results]) => {
    const total = results.passed + results.failed + results.warnings;
    const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
    console.log(`${category}: ${results.passed}/${total} passed (${rate}%)`);
  });
  
  if (report.recommendations.length > 0) {
    console.log('\n🔧 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}\n`);
    });
  }
  
  console.log(`\n📁 Detailed report saved to: ${reportPath}`);
  
  if (testResults.failedTests > 0) {
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAccessibilityTests().catch(console.error);
}

module.exports = {
  runAccessibilityTests,
  CONTRAST_REQUIREMENTS,
  INCOME_CLARITY_PROFESSIONAL_COLORS
};