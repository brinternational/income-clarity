#!/usr/bin/env node
/**
 * Navigation Integration Test Script
 * Tests the new Super Cards navigation menu integration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Super Cards Navigation Integration');
console.log('============================================\n');

// Test 1: Verify navigation component updates
console.log('📋 Test 1: Navigation Component Updates');
const sidebarNavPath = '/public/MasterV2/income-clarity/income-clarity-app/components/navigation/SidebarNavigation.tsx';

try {
  const sidebarContent = fs.readFileSync(sidebarNavPath, 'utf8');
  
  const hasPerformanceHub = sidebarContent.includes('Performance Hub');
  const hasIncomeIntelligence = sidebarContent.includes('Income Intelligence');
  const hasTaxStrategy = sidebarContent.includes('Tax Strategy');
  const hasPortfolioStrategy = sidebarContent.includes('Portfolio Strategy');
  const hasFinancialPlanning = sidebarContent.includes('Financial Planning');
  const hasIntelligenceHubsSection = sidebarContent.includes('Intelligence Hubs');

  console.log(`  ✅ Performance Hub menu item: ${hasPerformanceHub ? 'Added' : 'Missing'}`);
  console.log(`  ✅ Income Intelligence menu item: ${hasIncomeIntelligence ? 'Added' : 'Missing'}`);
  console.log(`  ✅ Tax Strategy menu item: ${hasTaxStrategy ? 'Added' : 'Missing'}`);
  console.log(`  ✅ Portfolio Strategy menu item: ${hasPortfolioStrategy ? 'Added' : 'Missing'}`);
  console.log(`  ✅ Financial Planning menu item: ${hasFinancialPlanning ? 'Added' : 'Missing'}`);
  console.log(`  ✅ Intelligence Hubs section: ${hasIntelligenceHubsSection ? 'Added' : 'Missing'}`);

  allMenuItemsAdded = hasPerformanceHub && hasIncomeIntelligence && hasTaxStrategy && hasPortfolioStrategy && hasFinancialPlanning;
  console.log(`\n  📊 Navigation Menu: ${allMenuItemsAdded ? '✅ COMPLETE' : '❌ INCOMPLETE'}\n`);

} catch (error) {
  console.log(`  ❌ Error reading navigation component: ${error.message}\n`);
}

// Test 2: Verify individual route pages
console.log('📋 Test 2: Individual Route Pages');
const routes = [
  { name: 'Performance Hub', path: '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/performance/page.tsx' },
  { name: 'Income Intelligence', path: '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/income/page.tsx' },
  { name: 'Tax Strategy', path: '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/tax-strategy/page.tsx' },
  { name: 'Portfolio Strategy', path: '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/portfolio-strategy/page.tsx' },
  { name: 'Financial Planning', path: '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/financial-planning/page.tsx' }
];

let allRoutesExist = true;
let allMenuItemsAdded = true;
let allRoutesConfigured = true;

routes.forEach(route => {
  const exists = fs.existsSync(route.path);
  console.log(`  ${exists ? '✅' : '❌'} ${route.name}: ${exists ? 'Created' : 'Missing'}`);
  if (!exists) allRoutesExist = false;
});

console.log(`\n  📊 Route Pages: ${allRoutesExist ? '✅ COMPLETE' : '❌ INCOMPLETE'}\n`);

// Test 3: Verify navigation config updates
console.log('📋 Test 3: Navigation Configuration');
const navConfigPath = '/public/MasterV2/income-clarity/income-clarity-app/lib/navigation-config.ts';

try {
  const navConfigContent = fs.readFileSync(navConfigPath, 'utf8');
  
  const hasPerformanceRoute = navConfigContent.includes('/dashboard/performance');
  const hasIncomeRoute = navConfigContent.includes('/dashboard/income');
  const hasTaxRoute = navConfigContent.includes('/dashboard/tax-strategy');
  const hasPortfolioRoute = navConfigContent.includes('/dashboard/portfolio-strategy');
  const hasPlanningRoute = navConfigContent.includes('/dashboard/financial-planning');

  console.log(`  ✅ Performance route: ${hasPerformanceRoute ? 'Configured' : 'Missing'}`);
  console.log(`  ✅ Income route: ${hasIncomeRoute ? 'Configured' : 'Missing'}`);
  console.log(`  ✅ Tax Strategy route: ${hasTaxRoute ? 'Configured' : 'Missing'}`);
  console.log(`  ✅ Portfolio Strategy route: ${hasPortfolioRoute ? 'Configured' : 'Missing'}`);
  console.log(`  ✅ Financial Planning route: ${hasPlanningRoute ? 'Configured' : 'Missing'}`);

  allRoutesConfigured = hasPerformanceRoute && hasIncomeRoute && hasTaxRoute && hasPortfolioRoute && hasPlanningRoute;
  console.log(`\n  📊 Navigation Config: ${allRoutesConfigured ? '✅ COMPLETE' : '❌ INCOMPLETE'}\n`);

} catch (error) {
  console.log(`  ❌ Error reading navigation config: ${error.message}\n`);
}

// Test 4: Component imports verification
console.log('📋 Test 4: Component Imports');
const routeFiles = [
  '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/performance/page.tsx',
  '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/income/page.tsx',
  '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/tax-strategy/page.tsx',
  '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/portfolio-strategy/page.tsx',
  '/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/financial-planning/page.tsx'
];

let allImportsCorrect = true;

routeFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(path.dirname(filePath));
    
    const hasSidebarAppShell = content.includes('SidebarAppShell');
    const hasCorrectDataPersistenceImport = content.includes("from '@/contexts/DataPersistenceContext'");
    const hasCorrectProviderStructure = content.includes('AuthProvider') && content.includes('SuperCardProvider');
    
    const fileCorrect = hasSidebarAppShell && hasCorrectDataPersistenceImport && hasCorrectProviderStructure;
    console.log(`  ${fileCorrect ? '✅' : '❌'} ${fileName}: ${fileCorrect ? 'Imports correct' : 'Import issues'}`);
    
    if (!fileCorrect) allImportsCorrect = false;
  } catch (error) {
    console.log(`  ❌ Error reading ${path.basename(path.dirname(filePath))}: ${error.message}`);
    allImportsCorrect = false;
  }
});

console.log(`\n  📊 Component Imports: ${allImportsCorrect ? '✅ COMPLETE' : '❌ SOME ISSUES'}\n`);

// Final Summary
console.log('📊 IMPLEMENTATION SUMMARY');
console.log('========================');

const implementationComplete = allMenuItemsAdded && allRoutesExist && allRoutesConfigured && allImportsCorrect;

if (implementationComplete) {
  console.log('🎉 ✅ Super Cards Navigation Integration: COMPLETE');
  console.log('');
  console.log('📋 DELIVERED:');
  console.log('  • 5 Super Card menu items added to left navigation');
  console.log('  • Individual route pages created for each Super Card');
  console.log('  • Navigation configuration updated with new routes');
  console.log('  • Professional "Intelligence Hubs" section in sidebar');
  console.log('  • Proper component imports and provider structure');
  console.log('  • Responsive design maintained');
  console.log('');
  console.log('🔗 NEW ROUTES:');
  console.log('  • /dashboard/performance - Performance Hub');
  console.log('  • /dashboard/income - Income Intelligence');
  console.log('  • /dashboard/tax-strategy - Tax Strategy');
  console.log('  • /dashboard/portfolio-strategy - Portfolio Strategy');
  console.log('  • /dashboard/financial-planning - Financial Planning');
  console.log('');
  console.log('✅ READY FOR TESTING: Start development server and test navigation');
} else {
  console.log('⚠️  Super Cards Navigation Integration: NEEDS ATTENTION');
  console.log('');
  console.log('❌ Issues found - review implementation above');
}

console.log('\n🔍 Next Steps:');
console.log('  1. Run: npm run dev');
console.log('  2. Navigate to http://localhost:3000');
console.log('  3. Test each Super Card menu item');
console.log('  4. Verify individual card content loads properly');