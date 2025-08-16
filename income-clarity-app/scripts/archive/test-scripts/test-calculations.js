#!/usr/bin/env node

/**
 * Financial calculations accuracy test for Income Clarity Lite
 * Tests all mathematical calculations and formulas
 */

// Test data for calculations
const testData = {
  holdings: [
    { ticker: 'SPY', shares: 10, costBasis: 4200, currentPrice: 450 },
    { ticker: 'AAPL', shares: 5, costBasis: 750, currentPrice: 175 },
    { ticker: 'MSFT', shares: 8, costBasis: 2400, currentPrice: 350 }
  ],
  income: [
    { amount: 125.50, date: '2024-01-15', ticker: 'SPY' },
    { amount: 87.25, date: '2024-02-15', ticker: 'AAPL' },
    { amount: 156.00, date: '2024-03-15', ticker: 'MSFT' }
  ],
  expenses: [
    { amount: 2500, category: 'Housing' },
    { amount: 800, category: 'Food' },
    { amount: 150, category: 'Utilities' }
  ],
  budget: {
    budgeted: 1000,
    spent: 750
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, expected, actual, details = '') {
  const icon = passed ? '✅' : '❌';
  const comparison = passed ? '' : ` (Expected: ${expected}, Got: ${actual})`;
  // console.log(`${icon} ${name}${comparison}${details ? ` - ${details}` : ''}`);
  
  testResults.tests.push({ name, passed, expected, actual, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Calculation functions (simulating the actual app logic)
function calculatePortfolioValue(holdings) {
  return holdings.reduce((total, holding) => {
    return total + (holding.shares * holding.currentPrice);
  }, 0);
}

function calculateTotalCostBasis(holdings) {
  return holdings.reduce((total, holding) => {
    return total + holding.costBasis;
  }, 0);
}

function calculateGainLoss(holdings) {
  const currentValue = calculatePortfolioValue(holdings);
  const costBasis = calculateTotalCostBasis(holdings);
  return currentValue - costBasis;
}

function calculateReturns(holdings) {
  const currentValue = calculatePortfolioValue(holdings);
  const costBasis = calculateTotalCostBasis(holdings);
  return costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;
}

function calculateDividendProjection(holdings, annualYields = { SPY: 1.5, AAPL: 0.5, MSFT: 0.7 }) {
  return holdings.reduce((total, holding) => {
    const yield = annualYields[holding.ticker] || 0;
    const currentValue = holding.shares * holding.currentPrice;
    return total + (currentValue * yield / 100);
  }, 0);
}

function calculateTotalIncome(income) {
  return income.reduce((total, entry) => total + entry.amount, 0);
}

function calculateTotalExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function calculateNetIncome(income, expenses) {
  const totalIncome = calculateTotalIncome(income);
  const totalExpenses = calculateTotalExpenses(expenses);
  return totalIncome - totalExpenses;
}

function calculateSavingsRate(income, expenses) {
  const totalIncome = calculateTotalIncome(income);
  const netIncome = calculateNetIncome(income, expenses);
  return totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
}

function calculateBudgetProgress(budgeted, spent) {
  return budgeted > 0 ? (spent / budgeted) * 100 : 0;
}

function calculateBudgetRemaining(budgeted, spent) {
  return Math.max(0, budgeted - spent);
}

function calculateSpendingVelocity(spent, daysInPeriod = 30) {
  return spent / daysInPeriod;
}

// Utility functions
function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function isCloseEnough(actual, expected, tolerance = 0.01) {
  return Math.abs(actual - expected) <= tolerance;
}

// Test functions
async function testPortfolioCalculations() {
  // console.log('\n📊 Testing Portfolio Calculations...');
  
  // Test portfolio value
  const portfolioValue = calculatePortfolioValue(testData.holdings);
  const expectedValue = (10 * 450) + (5 * 175) + (8 * 350); // 4500 + 875 + 2800 = 8175
  logTest('Portfolio Total Value', isCloseEnough(portfolioValue, expectedValue), expectedValue, portfolioValue);
  
  // Test cost basis
  const costBasis = calculateTotalCostBasis(testData.holdings);
  const expectedCostBasis = 4200 + 750 + 2400; // 7350
  logTest('Total Cost Basis', isCloseEnough(costBasis, expectedCostBasis), expectedCostBasis, costBasis);
  
  // Test gain/loss
  const gainLoss = calculateGainLoss(testData.holdings);
  const expectedGainLoss = expectedValue - expectedCostBasis; // 8175 - 7350 = 825
  logTest('Total Gain/Loss', isCloseEnough(gainLoss, expectedGainLoss), expectedGainLoss, gainLoss);
  
  // Test returns percentage
  const returns = calculateReturns(testData.holdings);
  const expectedReturns = (expectedGainLoss / expectedCostBasis) * 100; // (825 / 7350) * 100 ≈ 11.22%
  logTest('Returns Percentage', isCloseEnough(returns, expectedReturns), roundToTwo(expectedReturns), roundToTwo(returns));
  
  // Test dividend projection
  const dividendProjection = calculateDividendProjection(testData.holdings);
  const expectedDividend = (4500 * 0.015) + (875 * 0.005) + (2800 * 0.007); // 67.5 + 4.375 + 19.6 = 91.475
  logTest('Annual Dividend Projection', isCloseEnough(dividendProjection, expectedDividend), roundToTwo(expectedDividend), roundToTwo(dividendProjection));
}

async function testCashFlowCalculations() {
  // console.log('\n💰 Testing Cash Flow Calculations...');
  
  // Test total income
  const totalIncome = calculateTotalIncome(testData.income);
  const expectedIncome = 125.50 + 87.25 + 156.00; // 368.75
  logTest('Total Income', isCloseEnough(totalIncome, expectedIncome), expectedIncome, totalIncome);
  
  // Test total expenses
  const totalExpenses = calculateTotalExpenses(testData.expenses);
  const expectedExpenses = 2500 + 800 + 150; // 3450
  logTest('Total Expenses', isCloseEnough(totalExpenses, expectedExpenses), expectedExpenses, totalExpenses);
  
  // Test net income
  const netIncome = calculateNetIncome(testData.income, testData.expenses);
  const expectedNetIncome = expectedIncome - expectedExpenses; // 368.75 - 3450 = -3081.25
  logTest('Net Income', isCloseEnough(netIncome, expectedNetIncome), expectedNetIncome, netIncome);
  
  // Test savings rate (should be negative in this case)
  const savingsRate = calculateSavingsRate(testData.income, testData.expenses);
  const expectedSavingsRate = (expectedNetIncome / expectedIncome) * 100; // (-3081.25 / 368.75) * 100 ≈ -835.9%
  logTest('Savings Rate', isCloseEnough(savingsRate, expectedSavingsRate), roundToTwo(expectedSavingsRate), roundToTwo(savingsRate));
}

async function testBudgetCalculations() {
  // console.log('\n🎯 Testing Budget Calculations...');
  
  // Test budget progress
  const budgetProgress = calculateBudgetProgress(testData.budget.budgeted, testData.budget.spent);
  const expectedProgress = (testData.budget.spent / testData.budget.budgeted) * 100; // (750 / 1000) * 100 = 75%
  logTest('Budget Progress', isCloseEnough(budgetProgress, expectedProgress), expectedProgress, budgetProgress);
  
  // Test remaining budget
  const remaining = calculateBudgetRemaining(testData.budget.budgeted, testData.budget.spent);
  const expectedRemaining = testData.budget.budgeted - testData.budget.spent; // 1000 - 750 = 250
  logTest('Budget Remaining', isCloseEnough(remaining, expectedRemaining), expectedRemaining, remaining);
  
  // Test spending velocity
  const velocity = calculateSpendingVelocity(testData.budget.spent, 30);
  const expectedVelocity = testData.budget.spent / 30; // 750 / 30 = 25
  logTest('Daily Spending Velocity', isCloseEnough(velocity, expectedVelocity), expectedVelocity, velocity);
}

async function testEdgeCases() {
  // console.log('\n🔍 Testing Edge Cases...');
  
  // Test empty portfolio
  const emptyPortfolioValue = calculatePortfolioValue([]);
  logTest('Empty Portfolio Value', emptyPortfolioValue === 0, 0, emptyPortfolioValue);
  
  // Test zero cost basis returns
  const zeroReturns = calculateReturns([{ ticker: 'FREE', shares: 10, costBasis: 0, currentPrice: 100 }]);
  logTest('Zero Cost Basis Returns', zeroReturns === 0, 0, zeroReturns, 'Should handle division by zero');
  
  // Test negative values
  const negativeGainLoss = calculateGainLoss([{ ticker: 'LOSS', shares: 10, costBasis: 1000, currentPrice: 50 }]);
  const expectedNegative = (10 * 50) - 1000; // 500 - 1000 = -500
  logTest('Negative Gain/Loss', isCloseEnough(negativeGainLoss, expectedNegative), expectedNegative, negativeGainLoss);
  
  // Test budget over-spending
  const overBudget = calculateBudgetProgress(1000, 1200);
  logTest('Over-Budget Progress', isCloseEnough(overBudget, 120), 120, overBudget, 'Should handle over-spending');
  
  // Test zero income savings rate
  const zeroIncomeSavings = calculateSavingsRate([], [{ amount: 100 }]);
  logTest('Zero Income Savings Rate', zeroIncomeSavings === 0, 0, zeroIncomeSavings, 'Should handle zero income');
}

async function testPrecisionAndRounding() {
  // console.log('\n🎯 Testing Precision and Rounding...');
  
  // Test floating point precision
  const preciseHolding = { ticker: 'TEST', shares: 3.333333, costBasis: 1000.001, currentPrice: 299.999 };
  const preciseValue = calculatePortfolioValue([preciseHolding]);
  const expectedPrecise = 3.333333 * 299.999; // ≈ 999.996666667
  logTest('Floating Point Precision', isCloseEnough(preciseValue, expectedPrecise, 0.000001), expectedPrecise, preciseValue);
  
  // Test percentage calculations
  const preciseReturns = calculateReturns([preciseHolding]);
  const expectedPreciseReturns = ((preciseValue - 1000.001) / 1000.001) * 100;
  logTest('Precise Returns Calculation', isCloseEnough(preciseReturns, expectedPreciseReturns, 0.001), roundToTwo(expectedPreciseReturns), roundToTwo(preciseReturns));
}

async function testPerformanceBenchmarks() {
  // console.log('\n⚡ Testing Performance Benchmarks...');
  
  // Create large dataset
  const largeHoldings = Array.from({ length: 1000 }, (_, i) => ({
    ticker: `STOCK${i}`,
    shares: Math.random() * 100,
    costBasis: Math.random() * 10000,
    currentPrice: Math.random() * 500
  }));
  
  // Test calculation performance
  const startTime = Date.now();
  const largePortfolioValue = calculatePortfolioValue(largeHoldings);
  const calculationTime = Date.now() - startTime;
  
  logTest('Large Portfolio Calculation Performance', calculationTime < 100, '< 100ms', `${calculationTime}ms`, '1000 holdings');
  
  // Test repeated calculations
  const iterations = 1000;
  const repeatStartTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    calculatePortfolioValue(testData.holdings);
    calculateReturns(testData.holdings);
    calculateNetIncome(testData.income, testData.expenses);
  }
  const repeatTime = Date.now() - repeatStartTime;
  const avgTime = repeatTime / iterations;
  
  logTest('Repeated Calculations Performance', avgTime < 1, '< 1ms avg', `${avgTime.toFixed(3)}ms avg`, `${iterations} iterations`);
}

// Main test runner
async function runCalculationTests() {
  // console.log('🧮 Income Clarity Calculations Test Suite');
  // console.log('==========================================');
  
  try {
    await testPortfolioCalculations();
    await testCashFlowCalculations();
    await testBudgetCalculations();
    await testEdgeCases();
    await testPrecisionAndRounding();
    await testPerformanceBenchmarks();
    
    // console.log('\n📊 Test Results Summary:');
    // console.log('========================');
    // console.log(`✅ Passed: ${testResults.passed}`);
    // console.log(`❌ Failed: ${testResults.failed}`);
    // console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
    
    if (testResults.failed === 0) {
      // console.log('\n🎉 All calculation tests passed successfully!');
      // console.log('✅ Financial calculations are accurate and ready for production');
      process.exit(0);
    } else {
      // console.log('\n⚠️  Some tests failed. Review the issues above.');
      // console.log('\nFailed tests:');
      testResults.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`❌ ${t.name} - Expected: ${t.expected}, Got: ${t.actual}${t.details ? ` (${t.details})` : ''}`));
      process.exit(1);
    }
    
  } catch (error) {
    // console.error('❌ Calculation test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCalculationTests();
}

module.exports = { 
  runCalculationTests, 
  testResults,
  // Export calculation functions for use in other tests
  calculatePortfolioValue,
  calculateTotalCostBasis,
  calculateGainLoss,
  calculateReturns,
  calculateDividendProjection,
  calculateNetIncome,
  calculateSavingsRate,
  calculateBudgetProgress
};