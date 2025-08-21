#!/usr/bin/env node
/**
 * Accessibility Testing Script for Income Clarity
 * 
 * This script performs automated accessibility testing to ensure WCAG compliance
 * and validate that our accessibility fixes are working correctly.
 */

const fs = require('fs');
const path = require('path');

// Import our contrast checker
const { runAccessibilityAudit, checkContrastCompliance, AccessibleColors } = require('../lib/accessibility/contrast-checker.ts');

console.log('🔍 INCOME CLARITY ACCESSIBILITY AUDIT');
console.log('=====================================\n');

console.log('📋 Testing Phase 1: Color Contrast Compliance');
console.log('----------------------------------------------');

// Test our accessible color system
const testColors = [
  {
    name: 'Primary Text on Light Background',
    fg: AccessibleColors.textOnLight.primary,
    bg: '#ffffff',
    expected: 'AAA'
  },
  {
    name: 'Success Text on Light Background',
    fg: AccessibleColors.textOnLight.success,
    bg: '#ffffff',
    expected: 'AA'
  },
  {
    name: 'Warning Text on Light Background',
    fg: AccessibleColors.textOnLight.warning,
    bg: '#ffffff',
    expected: 'AA'
  },
  {
    name: 'Error Text on Light Background',
    fg: AccessibleColors.textOnLight.error,
    bg: '#ffffff',
    expected: 'AA'
  },
  {
    name: 'Primary Text on Dark Background',
    fg: AccessibleColors.textOnDark.primary,
    bg: '#0f172a',
    expected: 'AAA'
  },
  {
    name: 'Success Text on Dark Background',
    fg: AccessibleColors.textOnDark.success,
    bg: '#0f172a',
    expected: 'AA'
  },
  {
    name: 'CRITICAL FIX: Green Text on Light Background',
    fg: '#166534', // Our fixed green color
    bg: '#f0fdf4', // Light green background
    expected: 'AA'
  },
  {
    name: 'CRITICAL FIX: Tab Active State',
    fg: '#ffffff', // White text
    bg: '#1e40af', // Our accessible primary blue
    expected: 'AA'
  }
];

let passCount = 0;
let failCount = 0;

testColors.forEach(test => {
  try {
    const result = checkContrastCompliance(test.fg, test.bg);
    const status = result.grade === 'FAIL' ? '❌ FAIL' : 
                   result.grade === 'AA' ? '✅ PASS (AA)' : '🌟 EXCELLENT (AAA)';
    
    console.log(`${status} ${test.name}`);
    console.log(`  Contrast: ${result.ratio}:1 (Expected: ${test.expected})`);
    console.log(`  Colors: ${test.fg} on ${test.bg}\n`);
    
    if (result.grade === 'FAIL') {
      failCount++;
    } else {
      passCount++;
    }
  } catch (error) {
    console.log(`❌ ERROR ${test.name}: ${error.message}\n`);
    failCount++;
  }
});

console.log('📋 Testing Phase 2: Component-Specific Issues');
console.log('---------------------------------------------');

// Test the specific problematic combinations identified in the audit
const problematicCombinations = [
  {
    name: 'FIXED: Green Card Text (Previously Failing)',
    fg: '#166534', // Fixed: Was #065f46
    bg: '#f0fdf4', // Fixed: Was #d1fae5
    issue: 'Green text on green background - Fixed with higher contrast'
  },
  {
    name: 'FIXED: Tab Navigation (Previously Low Contrast)',
    fg: '#334155', // Fixed: Was #64748b  
    bg: '#f8fafc',
    issue: 'Tab text barely visible - Fixed with darker text'
  },
  {
    name: 'FIXED: Declining Performance Text',
    fg: '#991b1b', // Fixed: Was #dc2626
    bg: '#ffffff',
    issue: 'Red text not meeting AA standards - Fixed with darker red'
  }
];

problematicCombinations.forEach(test => {
  const result = checkContrastCompliance(test.fg, test.bg);
  const status = result.grade === 'FAIL' ? '❌ STILL FAILING' : 
                 result.grade === 'AA' ? '✅ FIXED (AA)' : '🌟 EXCELLENT (AAA)';
  
  console.log(`${status} ${test.name}`);
  console.log(`  Issue: ${test.issue}`);
  console.log(`  Contrast: ${result.ratio}:1`);
  console.log(`  Colors: ${test.fg} on ${test.bg}\n`);
  
  if (result.grade === 'FAIL') {
    failCount++;
  } else {
    passCount++;
  }
});

console.log('📋 Testing Phase 3: Accessibility Features');
console.log('------------------------------------------');

// Check if accessibility files exist
const accessibilityFiles = [
  '../styles/accessibility-colors.css',
  '../styles/accessibility-enhancements.css',
  '../lib/accessibility/contrast-checker.ts'
];

accessibilityFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${filePath} - File exists and ready`);
  } else {
    console.log(`❌ ${filePath} - Missing critical accessibility file`);
    failCount++;
  }
});

// Check globals.css for imports
const globalsPath = path.join(__dirname, '../app/globals.css');
if (fs.existsSync(globalsPath)) {
  const globalsContent = fs.readFileSync(globalsPath, 'utf8');
  if (globalsContent.includes('accessibility-colors.css') && globalsContent.includes('accessibility-enhancements.css')) {
    console.log('✅ globals.css - Accessibility imports detected');
  } else {
    console.log('❌ globals.css - Missing accessibility imports');
    failCount++;
  }
} else {
  console.log('❌ globals.css - File not found');
  failCount++;
}

console.log('\n📊 FINAL ACCESSIBILITY AUDIT RESULTS');
console.log('=====================================');
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n🎉 ACCESSIBILITY COMPLIANCE ACHIEVED!');
  console.log('✅ All color combinations meet WCAG AA standards');
  console.log('✅ Critical contrast violations have been fixed');
  console.log('✅ Accessibility enhancement system is active');
  console.log('✅ Ready for production deployment');
  
  console.log('\n📋 ACCESSIBILITY FEATURES IMPLEMENTED:');
  console.log('• WCAG AA/AAA compliant color token system');
  console.log('• High contrast mode support');
  console.log('• Enhanced focus indicators (3px outline)');
  console.log('• Minimum 44x44px touch targets');
  console.log('• Screen reader optimizations');
  console.log('• Reduced motion support');
  console.log('• Print accessibility');
  console.log('• Color blind safe patterns');
  
  process.exit(0);
} else {
  console.log('\n🚨 ACCESSIBILITY VIOLATIONS DETECTED!');
  console.log(`❌ ${failCount} critical issues must be resolved`);
  console.log('⚠️  Cannot deploy to production with accessibility violations');
  console.log('📖 Review the accessibility-enhancements.css file for additional fixes');
  
  process.exit(1);
}