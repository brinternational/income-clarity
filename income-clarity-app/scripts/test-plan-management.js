#!/usr/bin/env node

/**
 * Test Plan Management API and Component Integration
 * Tests the complete plan management workflow
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Testing Plan Management Integration\n');

// Test 1: Verify API endpoint exists
console.log('📁 Test 1: Checking API endpoint file...');
const apiPath = path.join(__dirname, '../app/api/user/plan/route.ts');
if (fs.existsSync(apiPath)) {
  console.log('✅ API endpoint file exists: /app/api/user/plan/route.ts');
} else {
  console.log('❌ API endpoint file missing');
  process.exit(1);
}

// Test 2: Verify component files exist  
console.log('\n📁 Test 2: Checking component files...');
const componentPath = path.join(__dirname, '../components/settings/PlanManagement.tsx');
if (fs.existsSync(componentPath)) {
  console.log('✅ Plan management component exists: /components/settings/PlanManagement.tsx');
} else {
  console.log('❌ Plan management component missing');
  process.exit(1);
}

// Test 3: Check settings page integration
console.log('\n📁 Test 3: Checking settings page integration...');
const settingsPath = path.join(__dirname, '../app/settings/page.tsx');
const settingsContent = fs.readFileSync(settingsPath, 'utf8');

if (settingsContent.includes('PlanManagement')) {
  console.log('✅ PlanManagement component imported in settings page');
} else {
  console.log('❌ PlanManagement component not imported in settings page');
  process.exit(1);
}

if (settingsContent.includes('currentPlan')) {
  console.log('✅ Plan state management found in settings page');
} else {
  console.log('❌ Plan state management missing in settings page');
  process.exit(1);
}

if (settingsContent.includes('fetchCurrentPlan')) {
  console.log('✅ Plan fetching logic found in settings page');
} else {
  console.log('❌ Plan fetching logic missing in settings page');
  process.exit(1);
}

// Test 4: Check API endpoint structure
console.log('\n📁 Test 4: Validating API endpoint structure...');
const apiContent = fs.readFileSync(apiPath, 'utf8');

const requiredMethods = ['GET', 'POST'];
const requiredLogic = ['PlanType', 'UserSubscription', 'upsert'];

let methodsFound = 0;
requiredMethods.forEach(method => {
  if (apiContent.includes(`export async function ${method}`)) {
    console.log(`✅ ${method} method implemented`);
    methodsFound++;
  } else {
    console.log(`❌ ${method} method missing`);
  }
});

let logicFound = 0;
requiredLogic.forEach(logic => {
  if (apiContent.includes(logic)) {
    console.log(`✅ ${logic} logic found`);
    logicFound++;
  } else {
    console.log(`❌ ${logic} logic missing`);
  }
});

// Test 5: Check component structure
console.log('\n📁 Test 5: Validating component structure...');
const componentContent = fs.readFileSync(componentPath, 'utf8');

const requiredComponents = [
  'CurrentPlanDisplay',
  'PlanComparisonModal', 
  'PlanManagement',
  'PLAN_FEATURES'
];

let componentsFound = 0;
requiredComponents.forEach(component => {
  if (componentContent.includes(component)) {
    console.log(`✅ ${component} found`);
    componentsFound++;
  } else {
    console.log(`❌ ${component} missing`);
  }
});

// Test 6: Check required features
console.log('\n📁 Test 6: Checking plan features definition...');
if (componentContent.includes('free:') && componentContent.includes('premium:')) {
  console.log('✅ Both free and premium plan definitions found');
} else {
  console.log('❌ Plan definitions incomplete');
}

if (componentContent.includes('bankSync') && componentContent.includes('analytics')) {
  console.log('✅ Key plan features defined');
} else {
  console.log('❌ Key plan features missing');
}

// Summary
console.log('\n📊 Integration Test Summary:');
console.log(`API Methods: ${methodsFound}/${requiredMethods.length}`);
console.log(`API Logic: ${logicFound}/${requiredLogic.length}`);
console.log(`Components: ${componentsFound}/${requiredComponents.length}`);

if (methodsFound === requiredMethods.length && 
    logicFound === requiredLogic.length && 
    componentsFound === requiredComponents.length) {
  console.log('\n🎉 All integration tests passed!');
  console.log('Plan Management is properly integrated and ready for testing.');
} else {
  console.log('\n❌ Some integration tests failed.');
  process.exit(1);
}

console.log('\n🚀 Next Steps:');
console.log('1. Start the development server: npm run dev:instant');
console.log('2. Navigate to: http://localhost:3000/settings');
console.log('3. Test plan switching functionality');
console.log('4. Verify database updates');
console.log('5. Test modal interactions');