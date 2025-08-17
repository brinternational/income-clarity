# TESTING MANDATE - COMPREHENSIVE QUALITY ASSURANCE

*Effective: 2025-08-16*
*Status: MANDATORY for all agent testing tasks*

## 🚨 CRITICAL: ALL TESTING MUST BE COMPREHENSIVE

When ANY agent is assigned a testing task, they MUST perform ALL of the following:

## 1. CODE QUALITY TESTING ✅
```bash
# TypeScript compilation
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format:check

# Cyclomatic complexity check
npm run complexity:check
```

## 2. DATA ACCURACY TESTING ✅
```bash
# Database integrity
node scripts/test-database-integrity.js

# Data sync validation
node scripts/test-sync-accuracy.js

# Calculation verification
node scripts/test-calculations.js
```

## 3. PLAYWRIGHT E2E TESTING ✅
```javascript
// MANDATORY: Check for console errors
test('No console errors on all pages', async ({ page }) => {
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Test all major routes
  const routes = [
    '/',
    '/dashboard/super-cards',
    '/settings',
    '/profile',
    '/onboarding',
    '/pricing'
  ];
  
  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
  }
  
  expect(errors).toHaveLength(0);
});
```

## 4. SYNC & INTEGRATION TESTING ✅
```bash
# Yodlee sync testing
node scripts/test-yodlee-sync.js

# Background job testing
node scripts/test-background-jobs.js

# API endpoint testing
node scripts/test-api-endpoints.js
```

## 5. PERFORMANCE TESTING ✅
```bash
# Lighthouse scores
npm run lighthouse

# Bundle size analysis
npm run analyze

# API response times
node scripts/test-api-performance.js
```

## 📋 TESTING CHECKLIST TEMPLATE

Every test report MUST include:

```markdown
## TEST REPORT - [Feature/Component Name]
Date: [Date]
Agent: [Agent Type]

### 1. CODE QUALITY
- [ ] TypeScript: PASS/FAIL
- [ ] ESLint: PASS/FAIL (X errors, Y warnings)
- [ ] Prettier: PASS/FAIL
- [ ] Complexity: PASS/FAIL (Max: X)

### 2. DATA ACCURACY
- [ ] Database Integrity: PASS/FAIL
- [ ] Sync Accuracy: PASS/FAIL
- [ ] Calculations: PASS/FAIL
- [ ] Test Data: [Description]

### 3. PLAYWRIGHT E2E
- [ ] Console Errors: NONE/[List]
- [ ] Page Load: PASS/FAIL
- [ ] User Flows: PASS/FAIL
- [ ] Screenshots: [Attached/Location]

### 4. SYNC & INTEGRATION
- [ ] Yodlee Sync: PASS/FAIL
- [ ] Background Jobs: PASS/FAIL
- [ ] API Endpoints: PASS/FAIL
- [ ] Error Handling: PASS/FAIL

### 5. PERFORMANCE
- [ ] Lighthouse Score: [Score]/100
- [ ] Bundle Size: [Size] KB
- [ ] API Response: [Avg] ms
- [ ] Memory Usage: [Usage] MB

### ISSUES FOUND
1. [Issue description, severity, file:line]
2. [Issue description, severity, file:line]

### RECOMMENDATIONS
1. [Action item]
2. [Action item]
```

## 🔧 REQUIRED TEST SCRIPTS

Create these if they don't exist:

### `/scripts/test-comprehensive.js`
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const { chromium } = require('playwright');

async function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE TESTING SUITE');
  
  // 1. Code Quality
  console.log('\n📝 Code Quality Tests...');
  execSync('npm run type-check', { stdio: 'inherit' });
  execSync('npm run lint', { stdio: 'inherit' });
  
  // 2. Playwright E2E
  console.log('\n🎭 Playwright E2E Tests...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  const routes = ['/', '/dashboard/super-cards', '/settings', '/profile'];
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`);
    await page.waitForLoadState('networkidle');
    console.log(`✅ ${route} - No errors`);
  }
  
  await browser.close();
  
  if (errors.length > 0) {
    console.error('❌ Console errors found:', errors);
    process.exit(1);
  }
  
  // 3. Data Accuracy
  console.log('\n📊 Data Accuracy Tests...');
  // Add data validation tests
  
  console.log('\n✅ ALL TESTS PASSED!');
}

runComprehensiveTests().catch(console.error);
```

## 🚀 AGENT INSTRUCTIONS

When delegating testing tasks:

```typescript
Task({
  subagent_type: "quality-assurance-specialist",
  prompt: `COMPREHENSIVE TESTING REQUIRED - Follow TESTING_MANDATE.md
  
  Test: [Component/Feature]
  
  MANDATORY REQUIREMENTS:
  1. Run ALL code quality checks (TypeScript, ESLint, Prettier)
  2. Verify data accuracy and sync operations
  3. Execute Playwright E2E with console error monitoring
  4. Test all integrations (Yodlee, background jobs, APIs)
  5. Measure performance metrics
  
  Use the testing checklist template from TESTING_MANDATE.md
  
  CRITICAL: Report ANY console errors found in Playwright testing
  
  Deliverables:
  - Complete test report using template
  - List of all issues found with severity
  - Recommendations for fixes
  - Screenshots of any UI issues`
})
```

## ⚠️ ZERO TOLERANCE POLICY

- **NO** partial testing
- **NO** skipping Playwright console error checks
- **NO** "looks good to me" without data
- **NO** testing without the checklist

## 📊 QUALITY GATES

Tests MUST meet these thresholds:

- TypeScript: 0 errors
- ESLint: <10 warnings, 0 errors
- Console Errors: 0
- API Response: <500ms average
- Lighthouse: >80 score
- Test Coverage: >70%

---

**REMEMBER**: Quality is not optional. Every test must be comprehensive.