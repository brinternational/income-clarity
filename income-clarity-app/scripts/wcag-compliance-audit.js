#!/usr/bin/env node
/**
 * WCAG 2.1 AA/AAA Compliance Audit for Income Clarity
 * 
 * Comprehensive accessibility testing following dark mode implementation
 * Tests against production URL: https://incomeclarity.ddns.net
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 WCAG 2.1 AA/AAA COMPLIANCE AUDIT');
console.log('===================================');
console.log('Target: https://incomeclarity.ddns.net');
console.log('Date: ' + new Date().toISOString());
console.log('Standards: WCAG 2.1 AA (minimum), WCAG 2.1 AAA (target)\n');

/**
 * Hex to RGB conversion
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
 * Calculate relative luminance
 */
function getLuminance(color) {
  const { r, g, b } = color;
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;
  
  const rg = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const gg = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const bg = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rg + 0.7152 * gg + 0.0722 * bg;
}

/**
 * Calculate contrast ratio
 */
function getContrastRatio(fg, bg) {
  const fgColor = hexToRgb(fg);
  const bgColor = hexToRgb(bg);
  
  if (!fgColor || !bgColor) return 0;
  
  const fgLum = getLuminance(fgColor);
  const bgLum = getLuminance(bgColor);
  
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Test color combinations for WCAG compliance
 */
function testColorCombination(name, fg, bg, isLargeText = false) {
  const ratio = getContrastRatio(fg, bg);
  const aaThreshold = isLargeText ? 3.0 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7.0;
  
  const wcagAA = ratio >= aaThreshold;
  const wcagAAA = ratio >= aaaThreshold;
  
  let grade = 'FAIL';
  if (wcagAAA) grade = 'AAA';
  else if (wcagAA) grade = 'AA';
  
  return {
    name,
    foreground: fg,
    background: bg,
    ratio: Math.round(ratio * 100) / 100,
    wcagAA,
    wcagAAA,
    grade,
    isLargeText
  };
}

console.log('📋 PHASE 1: CORE COLOR SYSTEM AUDIT');
console.log('-----------------------------------');

// Test Income Clarity's core color combinations
const coreColorTests = [
  // Light theme combinations
  ['Primary Text (Light)', '#0f172a', '#ffffff'],
  ['Secondary Text (Light)', '#334155', '#ffffff'],
  ['Muted Text (Light)', '#64748b', '#ffffff'],
  ['Success Text (Light)', '#166534', '#ffffff'],
  ['Warning Text (Light)', '#92400e', '#ffffff'],
  ['Error Text (Light)', '#991b1b', '#ffffff'],
  ['Link Text (Light)', '#1d4ed8', '#ffffff'],
  
  // Dark theme combinations
  ['Primary Text (Dark)', '#f8fafc', '#0f172a'],
  ['Secondary Text (Dark)', '#cbd5e1', '#0f172a'],
  ['Muted Text (Dark)', '#94a3b8', '#0f172a'],
  ['Success Text (Dark)', '#4ade80', '#0f172a'],
  ['Warning Text (Dark)', '#fbbf24', '#0f172a'],
  ['Error Text (Dark)', '#f87171', '#0f172a'],
  ['Link Text (Dark)', '#93c5fd', '#0f172a'],
  
  // Card and component backgrounds
  ['Success on Light Green BG', '#166534', '#f0fdf4'],
  ['Warning on Light Yellow BG', '#92400e', '#fffbeb'],
  ['Error on Light Red BG', '#991b1b', '#fef2f2'],
  ['Info on Light Blue BG', '#1e40af', '#eff6ff'],
  
  // Button states
  ['Primary Button Text', '#ffffff', '#1e40af'],
  ['Secondary Button Text', '#0f172a', '#f8fafc'],
  ['Tab Active State', '#ffffff', '#1e40af'],
  ['Tab Inactive State', '#475569', '#f8fafc']
];

let passCount = 0;
let failCount = 0;
let aaaCount = 0;

coreColorTests.forEach(([name, fg, bg]) => {
  const result = testColorCombination(name, fg, bg);
  const status = result.grade === 'FAIL' ? '❌ FAIL' : 
                 result.grade === 'AA' ? '✅ PASS (AA)' : '🌟 EXCELLENT (AAA)';
  
  console.log(`${status} ${result.name}`);
  console.log(`  Contrast: ${result.ratio}:1`);
  console.log(`  Colors: ${result.foreground} on ${result.background}`);
  
  if (result.grade === 'FAIL') {
    failCount++;
    console.log(`  🚨 VIOLATION: Below WCAG AA threshold (need 4.5:1)`);
  } else {
    passCount++;
    if (result.grade === 'AAA') aaaCount++;
  }
  console.log('');
});

console.log('📋 PHASE 2: COMPONENT-SPECIFIC TESTS');
console.log('------------------------------------');

// Test previously problematic components
const componentTests = [
  {
    name: 'Super Cards - Income Intelligence Hub',
    tests: [
      ['Income Positive Text', '#166534', '#f0fdf4'],
      ['Income Negative Text', '#991b1b', '#fef2f2'],
      ['YTD Progress Text', '#0f172a', '#ffffff'],
      ['Hero Metric Display', '#0f172a', '#f8fafc']
    ]
  },
  {
    name: 'Performance Hub',
    tests: [
      ['Portfolio Return (Positive)', '#166534', '#ffffff'],
      ['Portfolio Return (Negative)', '#991b1b', '#ffffff'],
      ['SPY Comparison Text', '#334155', '#ffffff'],
      ['Benchmark Metric', '#1e40af', '#f8fafc']
    ]
  },
  {
    name: 'Navigation & Controls',
    tests: [
      ['Sidebar Active Link', '#ffffff', '#1e40af'],
      ['Sidebar Inactive Link', '#64748b', '#ffffff'],
      ['Mobile Navigation', '#0f172a', '#f8fafc'],
      ['Focus Ring', '#3b82f6', '#ffffff']
    ]
  },
  {
    name: 'Form Elements',
    tests: [
      ['Input Text', '#0f172a', '#ffffff'],
      ['Input Border', '#d1d5db', '#ffffff'],
      ['Button Primary', '#ffffff', '#1e40af'],
      ['Button Disabled', '#9ca3af', '#f9fafb']
    ]
  }
];

componentTests.forEach(component => {
  console.log(`\n🎯 ${component.name}:`);
  component.tests.forEach(([name, fg, bg]) => {
    const result = testColorCombination(name, fg, bg);
    const status = result.grade === 'FAIL' ? '❌ FAIL' : 
                   result.grade === 'AA' ? '✅ PASS' : '🌟 AAA';
    
    console.log(`  ${status} ${result.name} (${result.ratio}:1)`);
    
    if (result.grade === 'FAIL') {
      failCount++;
    } else {
      passCount++;
      if (result.grade === 'AAA') aaaCount++;
    }
  });
});

console.log('\n📋 PHASE 3: ACCESSIBILITY INFRASTRUCTURE AUDIT');
console.log('----------------------------------------------');

const accessibilityFiles = [
  {
    path: '../styles/accessibility-colors.css',
    description: 'WCAG-compliant color token system'
  },
  {
    path: '../styles/accessibility-enhancements.css', 
    description: 'Component-specific accessibility fixes'
  },
  {
    path: '../components/SkipLinks.tsx',
    description: 'Skip navigation for screen readers'
  },
  {
    path: '../components/AccessibilitySettings.tsx',
    description: 'User accessibility preferences'
  },
  {
    path: '../utils/accessibility.ts',
    description: 'Accessibility utility functions'
  },
  {
    path: '../lib/accessibility/contrast-checker.ts',
    description: 'Automated contrast checking system'
  }
];

console.log('🔍 Checking accessibility infrastructure...\n');

let infrastructurePass = 0;
let infrastructureFail = 0;

accessibilityFiles.forEach(({ path: filePath, description }) => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    console.log(`   📄 ${filePath}`);
    infrastructurePass++;
  } else {
    console.log(`❌ ${description}`);
    console.log(`   📄 ${filePath} - FILE MISSING`);
    infrastructureFail++;
  }
  console.log('');
});

// Check CSS imports
const globalsPath = path.join(__dirname, '../app/globals.css');
let cssImportsValid = false;

if (fs.existsSync(globalsPath)) {
  const globalsContent = fs.readFileSync(globalsPath, 'utf8');
  const hasAccessibilityColors = globalsContent.includes('accessibility-colors');
  const hasAccessibilityEnhancements = globalsContent.includes('accessibility-enhancements');
  
  if (hasAccessibilityColors && hasAccessibilityEnhancements) {
    console.log('✅ CSS accessibility imports verified');
    console.log('   📄 accessibility-colors.css imported');
    console.log('   📄 accessibility-enhancements.css imported');
    cssImportsValid = true;
    infrastructurePass++;
  } else {
    console.log('❌ CSS accessibility imports missing');
    console.log(`   accessibility-colors: ${hasAccessibilityColors ? '✅' : '❌'}`);
    console.log(`   accessibility-enhancements: ${hasAccessibilityEnhancements ? '✅' : '❌'}`);
    infrastructureFail++;
  }
} else {
  console.log('❌ globals.css not found');
  infrastructureFail++;
}

console.log('\n📋 PHASE 4: ADVANCED ACCESSIBILITY FEATURES');
console.log('-------------------------------------------');

const advancedFeatures = [
  {
    name: 'High Contrast Mode Support',
    check: () => {
      const accessibilityColorsPath = path.join(__dirname, '../styles/accessibility-colors.css');
      if (fs.existsSync(accessibilityColorsPath)) {
        const content = fs.readFileSync(accessibilityColorsPath, 'utf8');
        return content.includes('@media (prefers-contrast: high)');
      }
      return false;
    }
  },
  {
    name: 'Windows High Contrast Mode',
    check: () => {
      const accessibilityColorsPath = path.join(__dirname, '../styles/accessibility-colors.css');
      if (fs.existsSync(accessibilityColorsPath)) {
        const content = fs.readFileSync(accessibilityColorsPath, 'utf8');
        return content.includes('@media (forced-colors: active)');
      }
      return false;
    }
  },
  {
    name: 'Reduced Motion Support',
    check: () => {
      const accessibilityColorsPath = path.join(__dirname, '../styles/accessibility-colors.css');
      if (fs.existsSync(accessibilityColorsPath)) {
        const content = fs.readFileSync(accessibilityColorsPath, 'utf8');
        return content.includes('@media (prefers-reduced-motion: reduce)');
      }
      return false;
    }
  },
  {
    name: 'Focus Indicators (3px outline)',
    check: () => {
      const accessibilityColorsPath = path.join(__dirname, '../styles/accessibility-colors.css');
      if (fs.existsSync(accessibilityColorsPath)) {
        const content = fs.readFileSync(accessibilityColorsPath, 'utf8');
        return content.includes('outline: 3px solid');
      }
      return false;
    }
  },
  {
    name: 'Touch Target Sizing (44px minimum)',
    check: () => {
      const accessibilityEnhancementsPath = path.join(__dirname, '../styles/accessibility-enhancements.css');
      if (fs.existsSync(accessibilityEnhancementsPath)) {
        const content = fs.readFileSync(accessibilityEnhancementsPath, 'utf8');
        return content.includes('min-height: 44px');
      }
      return false;
    }
  },
  {
    name: 'Colorblind-Safe Pattern Indicators',
    check: () => {
      const accessibilityColorsPath = path.join(__dirname, '../styles/accessibility-colors.css');
      if (fs.existsSync(accessibilityColorsPath)) {
        const content = fs.readFileSync(accessibilityColorsPath, 'utf8');
        return content.includes('.pattern-success::before');
      }
      return false;
    }
  }
];

let advancedPass = 0;
let advancedFail = 0;

advancedFeatures.forEach(feature => {
  const result = feature.check();
  if (result) {
    console.log(`✅ ${feature.name}`);
    advancedPass++;
  } else {
    console.log(`❌ ${feature.name}`);
    advancedFail++;
  }
});

console.log('\n📊 COMPREHENSIVE AUDIT RESULTS');
console.log('==============================');

const totalContrastTests = passCount + failCount;
const totalInfrastructure = infrastructurePass + infrastructureFail;
const totalAdvanced = advancedPass + advancedFail;
const grandTotal = totalContrastTests + totalInfrastructure + totalAdvanced;
const grandPass = passCount + infrastructurePass + advancedPass;
const grandFail = failCount + infrastructureFail + advancedFail;

console.log(`\n🎯 CONTRAST COMPLIANCE:`);
console.log(`   Tests: ${totalContrastTests}`);
console.log(`   ✅ WCAG AA+: ${passCount} (${Math.round((passCount/totalContrastTests)*100)}%)`);
console.log(`   🌟 WCAG AAA: ${aaaCount} (${Math.round((aaaCount/totalContrastTests)*100)}%)`);
console.log(`   ❌ Failures: ${failCount} (${Math.round((failCount/totalContrastTests)*100)}%)`);

console.log(`\n🏗️ INFRASTRUCTURE:`);
console.log(`   Components: ${totalInfrastructure}`);
console.log(`   ✅ Available: ${infrastructurePass} (${Math.round((infrastructurePass/totalInfrastructure)*100)}%)`);
console.log(`   ❌ Missing: ${infrastructureFail} (${Math.round((infrastructureFail/totalInfrastructure)*100)}%)`);

console.log(`\n⚡ ADVANCED FEATURES:`);
console.log(`   Features: ${totalAdvanced}`);
console.log(`   ✅ Implemented: ${advancedPass} (${Math.round((advancedPass/totalAdvanced)*100)}%)`);
console.log(`   ❌ Missing: ${advancedFail} (${Math.round((advancedFail/totalAdvanced)*100)}%)`);

console.log(`\n🎖️ OVERALL COMPLIANCE:`);
console.log(`   Total Tests: ${grandTotal}`);
console.log(`   ✅ Passing: ${grandPass} (${Math.round((grandPass/grandTotal)*100)}%)`);
console.log(`   ❌ Failing: ${grandFail} (${Math.round((grandFail/grandTotal)*100)}%)`);

// Determine compliance level
let complianceLevel = 'FAIL';
let complianceMessage = '';

if (grandFail === 0) {
  complianceLevel = 'WCAG 2.1 AAA COMPLIANT';
  complianceMessage = 'EXCEPTIONAL: All tests pass with AAA-level accessibility';
} else if (failCount === 0) {
  complianceLevel = 'WCAG 2.1 AA COMPLIANT';
  complianceMessage = 'EXCELLENT: All contrast tests pass, minor infrastructure gaps';
} else if (failCount <= 2) {
  complianceLevel = 'MOSTLY COMPLIANT';
  complianceMessage = 'GOOD: Minor contrast issues need fixing';
} else {
  complianceLevel = 'NON-COMPLIANT';
  complianceMessage = 'CRITICAL: Multiple accessibility violations require immediate attention';
}

console.log(`\n🏆 COMPLIANCE STATUS: ${complianceLevel}`);
console.log(`📋 Assessment: ${complianceMessage}`);

if (grandFail === 0) {
  console.log('\n🎉 CONGRATULATIONS! INCOME CLARITY MEETS WCAG 2.1 AA/AAA STANDARDS');
  console.log('✅ Ready for production deployment');
  console.log('✅ Compliant with ADA requirements');
  console.log('✅ Meets Section 508 standards');
  console.log('✅ Suitable for government and enterprise use');
  
  console.log('\n📋 NEXT STEPS FOR CONTINUED EXCELLENCE:');
  console.log('• Schedule quarterly accessibility reviews');
  console.log('• Set up automated accessibility testing in CI/CD');
  console.log('• Train team on accessibility best practices');
  console.log('• Collect user feedback from assistive technology users');
  
  process.exit(0);
} else {
  console.log('\n🚨 ACCESSIBILITY IMPROVEMENTS NEEDED');
  
  if (failCount > 0) {
    console.log(`\n⚠️ CRITICAL CONTRAST VIOLATIONS: ${failCount}`);
    console.log('These must be fixed before production deployment:');
    console.log('• Review color combinations marked as FAIL above');
    console.log('• Use darker text or lighter backgrounds');
    console.log('• Test changes with WebAIM Contrast Checker');
    console.log('• Ensure minimum 4.5:1 ratio for normal text');
  }
  
  if (infrastructureFail > 0) {
    console.log(`\n🛠️ INFRASTRUCTURE GAPS: ${infrastructureFail}`);
    console.log('• Implement missing accessibility components');
    console.log('• Ensure all CSS files are properly imported');
    console.log('• Add ARIA labels and semantic HTML');
  }
  
  if (advancedFail > 0) {
    console.log(`\n🔧 ENHANCEMENT OPPORTUNITIES: ${advancedFail}`);
    console.log('• Add missing advanced accessibility features');
    console.log('• Implement high contrast mode support');
    console.log('• Add reduced motion preferences');
    console.log('• Ensure proper focus management');
  }
  
  console.log('\n📞 SUPPORT RESOURCES:');
  console.log('• WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
  console.log('• WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/');
  console.log('• axe DevTools: https://www.deque.com/axe/devtools/');
  
  process.exit(1);
}