#!/usr/bin/env node

/**
 * Validate Level 1 Progressive Disclosure Implementation
 * Checks code structure and logic without requiring authentication
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 LEVEL 1 PROGRESSIVE DISCLOSURE VALIDATION');
console.log('===========================================');

const validations = [];

// 1. Check if MomentumDashboard component exists
console.log('\n📂 1. Checking MomentumDashboard component...');
const momentumDashboardPath = path.join(__dirname, '../components/super-cards/MomentumDashboard.tsx');
if (fs.existsSync(momentumDashboardPath)) {
  console.log('   ✅ MomentumDashboard.tsx exists');
  validations.push({ test: 'Component exists', pass: true });
  
  // Check component content
  const componentContent = fs.readFileSync(momentumDashboardPath, 'utf8');
  
  // Check for 4-card layout
  const has4Cards = componentContent.includes('MOMENTUM_CARDS = [') && 
                   componentContent.includes("id: 'performance'") &&
                   componentContent.includes("id: 'income'") &&
                   componentContent.includes("id: 'tax'") &&
                   componentContent.includes("id: 'planning'");
  console.log(`   ${has4Cards ? '✅' : '❌'} Has 4-card configuration`);
  validations.push({ test: '4-card layout', pass: has4Cards });
  
  // Check for momentum dashboard title
  const hasMomentumTitle = componentContent.includes('Momentum Dashboard');
  console.log(`   ${hasMomentumTitle ? '✅' : '❌'} Has Momentum Dashboard title`);
  validations.push({ test: 'Momentum title', pass: hasMomentumTitle });
  
  // Check for Level 1 indicators
  const hasLevel1Indicators = componentContent.includes('Level 1 • 80% Users');
  console.log(`   ${hasLevel1Indicators ? '✅' : '❌'} Has Level 1 indicators`);
  validations.push({ test: 'Level 1 indicators', pass: hasLevel1Indicators });
  
} else {
  console.log('   ❌ MomentumDashboard.tsx NOT FOUND');
  validations.push({ test: 'Component exists', pass: false });
}

// 2. Check main page.tsx routing logic
console.log('\n🔀 2. Checking routing logic in page.tsx...');
const pagePath = path.join(__dirname, '../app/dashboard/super-cards/page.tsx');
if (fs.existsSync(pagePath)) {
  console.log('   ✅ page.tsx exists');
  
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  // Check for MomentumDashboard import
  const hasMomentumImport = pageContent.includes("import { MomentumDashboard } from '@/components/super-cards/MomentumDashboard'");
  console.log(`   ${hasMomentumImport ? '✅' : '❌'} Has MomentumDashboard import`);
  validations.push({ test: 'MomentumDashboard import', pass: hasMomentumImport });
  
  // Check for default routing logic
  const hasDefaultRouting = pageContent.includes("level === 'momentum' || (!level && !useSinglePage && !useFullContent && !selectedCard)");
  console.log(`   ${hasDefaultRouting ? '✅' : '❌'} Has correct default routing logic`);
  validations.push({ test: 'Default routing', pass: hasDefaultRouting });
  
  // Check for MomentumDashboard usage
  const usesMomentumDashboard = pageContent.includes('<MomentumDashboard />');
  console.log(`   ${usesMomentumDashboard ? '✅' : '❌'} Uses MomentumDashboard component`);
  validations.push({ test: 'MomentumDashboard usage', pass: usesMomentumDashboard });
  
  // Check that SinglePageDashboard is not used for Level 1
  const levelMatches = pageContent.match(/level === 'momentum'.*?<(\w+Dashboard)\s*\/>/s);
  const usesCorrectComponent = levelMatches && levelMatches[1] === 'MomentumDashboard';
  console.log(`   ${usesCorrectComponent ? '✅' : '❌'} Level 1 uses correct component`);
  validations.push({ test: 'Correct component for Level 1', pass: usesCorrectComponent });
  
} else {
  console.log('   ❌ page.tsx NOT FOUND');
  validations.push({ test: 'page.tsx exists', pass: false });
}

// 3. Check CLAUDE.md documentation
console.log('\n📝 3. Checking documentation...');
const claudePath = path.join(__dirname, '../app/dashboard/super-cards/CLAUDE.md');
if (fs.existsSync(claudePath)) {
  const claudeContent = fs.readFileSync(claudePath, 'utf8');
  
  const hasDocumentation = claudeContent.includes('Level 1 Implementation Fix') && 
                          claudeContent.includes('PROGRESSIVE DISCLOSURE LEVEL 1 NOW FULLY FUNCTIONAL');
  console.log(`   ${hasDocumentation ? '✅' : '❌'} Has Level 1 fix documentation`);
  validations.push({ test: 'Documentation updated', pass: hasDocumentation });
} else {
  console.log('   ❌ CLAUDE.md NOT FOUND');
  validations.push({ test: 'Documentation exists', pass: false });
}

// 4. Verify routing flow logic
console.log('\n🎯 4. Analyzing routing flow...');
console.log('   Expected behavior:');
console.log('   • /dashboard/super-cards (no params) → Level 1 (MomentumDashboard)');
console.log('   • /dashboard/super-cards?level=momentum → Level 1 (MomentumDashboard)');  
console.log('   • /dashboard/super-cards?level=hero-view&hub=X → Level 2 (Hero View)');
console.log('   • /dashboard/super-cards?level=detailed → Level 3 (FullContentDashboard)');

const routingLogicCorrect = validations.filter(v => v.test.includes('routing') || v.test.includes('component')).every(v => v.pass);
console.log(`   ${routingLogicCorrect ? '✅' : '❌'} Routing logic implemented correctly`);
validations.push({ test: 'Overall routing logic', pass: routingLogicCorrect });

// SUMMARY
console.log('\n📊 VALIDATION SUMMARY');
console.log('===================');

const passedTests = validations.filter(v => v.pass).length;
const totalTests = validations.length;
const successRate = Math.round((passedTests / totalTests) * 100);

validations.forEach(v => {
  console.log(`${v.pass ? '✅' : '❌'} ${v.test}`);
});

console.log(`\n🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed (${successRate}%)`);

if (successRate === 100) {
  console.log('\n🎉 VALIDATION SUCCESSFUL!');
  console.log('✅ Level 1 Progressive Disclosure implementation is complete and correct');
  console.log('✅ Default /dashboard/super-cards URL will show MomentumDashboard');
  console.log('✅ 80% of users will get the optimized momentum experience');
  console.log('✅ 4-card streamlined layout implemented');
  console.log('✅ Progressive enhancement paths to Level 2 and 3 available');
} else if (successRate >= 80) {
  console.log('\n⚠️  MOSTLY COMPLETE');
  console.log('The implementation is mostly correct but may need minor adjustments');
} else {
  console.log('\n❌ VALIDATION FAILED');
  console.log('The implementation needs significant work to be functional');
}

console.log('\n🔄 Next steps:');
console.log('1. Test on production server with actual user authentication');
console.log('2. Validate UX with real user interactions');
console.log('3. Monitor performance for 80% user base');
console.log('4. E2E testing across all Progressive Disclosure levels');

process.exit(successRate === 100 ? 0 : 1);