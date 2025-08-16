#!/usr/bin/env node

/**
 * Comprehensive API endpoint testing for Income Clarity Lite
 * Tests all CRUD operations and API routes
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testData = {
  user: {
    email: `test-${Date.now()}@incomeclarity.local`,
    password: 'TestPassword123!',
    settings: { theme: 'dark', currency: 'USD' },
    taxProfile: { state: 'CA', filingStatus: 'single' }
  },
  portfolio: {
    name: 'Test Portfolio',
    type: 'Taxable',
    isPrimary: true
  },
  holding: {
    ticker: 'SPY',
    shares: 10.0,
    costBasis: 4200.0,
    purchaseDate: new Date().toISOString()
  },
  transaction: {
    type: 'buy',
    ticker: 'AAPL',
    shares: 5,
    price: 150.00,
    date: new Date().toISOString()
  },
  income: {
    source: 'Dividend',
    amount: 125.50,
    ticker: 'SPY',
    date: new Date().toISOString(),
    isRecurring: true,
    frequency: 'quarterly'
  },
  expense: {
    category: 'Housing',
    description: 'Rent payment',
    amount: 2500.00,
    date: new Date().toISOString(),
    isRecurring: true,
    frequency: 'monthly'
  },
  budget: {
    category: 'Food',
    budgeted: 800.00,
    spent: 0,
    period: 'monthly',
    startDate: new Date().toISOString()
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  // console.log(`${icon} ${name}${details ? ` - ${details}` : ''}`);
  
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test functions
async function testHealthCheck() {
  // console.log('\n🏥 Testing Health Check API...');
  
  const { status, data } = await makeRequest(`${API_BASE}/health`);
  logTest('Health Check', status === 200 && data.status === 'ok');
}

async function testPortfoliosCRUD() {
  // console.log('\n📊 Testing Portfolios API...');
  
  // Test GET empty portfolios
  let { status, data } = await makeRequest(`${API_BASE}/portfolios`);
  logTest('GET Portfolios (empty)', status === 200 && Array.isArray(data));
  
  // Test POST create portfolio
  ({ status, data } = await makeRequest(`${API_BASE}/portfolios`, {
    method: 'POST',
    body: JSON.stringify(testData.portfolio)
  }));
  logTest('POST Portfolio', status === 201 && data.id);
  
  if (status === 201) {
    const portfolioId = data.id;
    
    // Test GET specific portfolio
    ({ status, data } = await makeRequest(`${API_BASE}/portfolios/${portfolioId}`));
    logTest('GET Portfolio by ID', status === 200 && data.name === testData.portfolio.name);
    
    // Test PUT update portfolio
    const updatedPortfolio = { ...testData.portfolio, name: 'Updated Test Portfolio' };
    ({ status, data } = await makeRequest(`${API_BASE}/portfolios/${portfolioId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedPortfolio)
    }));
    logTest('PUT Portfolio', status === 200 && data.name === 'Updated Test Portfolio');
    
    // Test DELETE portfolio
    ({ status } = await makeRequest(`${API_BASE}/portfolios/${portfolioId}`, {
      method: 'DELETE'
    }));
    logTest('DELETE Portfolio', status === 200 || status === 204);
    
    return portfolioId;
  }
}

async function testHoldingsCRUD() {
  // console.log('\n💼 Testing Holdings API...');
  
  // First create a portfolio
  let { status, data } = await makeRequest(`${API_BASE}/portfolios`, {
    method: 'POST',
    body: JSON.stringify(testData.portfolio)
  });
  
  if (status !== 201) {
    logTest('Holdings - Create Portfolio', false, 'Failed to create test portfolio');
    return;
  }
  
  const portfolioId = data.id;
  
  // Test POST create holding
  const holdingData = { ...testData.holding, portfolioId };
  ({ status, data } = await makeRequest(`${API_BASE}/holdings`, {
    method: 'POST',
    body: JSON.stringify(holdingData)
  }));
  logTest('POST Holding', status === 201 && data.id);
  
  if (status === 201) {
    const holdingId = data.id;
    
    // Test GET holdings
    ({ status, data } = await makeRequest(`${API_BASE}/holdings?portfolioId=${portfolioId}`));
    logTest('GET Holdings', status === 200 && Array.isArray(data) && data.length > 0);
    
    // Test PUT update holding
    const updatedHolding = { ...holdingData, shares: 15.0 };
    ({ status, data } = await makeRequest(`${API_BASE}/holdings/${holdingId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedHolding)
    }));
    logTest('PUT Holding', status === 200 && data.shares === 15.0);
    
    // Test DELETE holding
    ({ status } = await makeRequest(`${API_BASE}/holdings/${holdingId}`, {
      method: 'DELETE'
    }));
    logTest('DELETE Holding', status === 200 || status === 204);
  }
  
  // Cleanup portfolio
  await makeRequest(`${API_BASE}/portfolios/${portfolioId}`, { method: 'DELETE' });
}

async function testTransactionsAPI() {
  // console.log('\n💳 Testing Transactions API...');
  
  // Test GET transactions (empty)
  let { status, data } = await makeRequest(`${API_BASE}/transactions`);
  logTest('GET Transactions', status === 200 && Array.isArray(data));
  
  // Test POST create transaction
  ({ status, data } = await makeRequest(`${API_BASE}/transactions`, {
    method: 'POST',
    body: JSON.stringify(testData.transaction)
  }));
  logTest('POST Transaction', status === 201 && data.id);
  
  if (status === 201) {
    // Test GET transactions with filters
    ({ status, data } = await makeRequest(`${API_BASE}/transactions?ticker=AAPL`));
    logTest('GET Transactions (filtered)', status === 200 && data.length > 0);
    
    // Cleanup
    await makeRequest(`${API_BASE}/transactions/${data[0].id}`, { method: 'DELETE' });
  }
}

async function testIncomeCRUD() {
  // console.log('\n💰 Testing Income API...');
  
  // Test GET income (empty)
  let { status, data } = await makeRequest(`${API_BASE}/income`);
  logTest('GET Income', status === 200 && Array.isArray(data));
  
  // Test POST create income
  ({ status, data } = await makeRequest(`${API_BASE}/income`, {
    method: 'POST',
    body: JSON.stringify(testData.income)
  }));
  logTest('POST Income', status === 201 && data.id);
  
  if (status === 201) {
    const incomeId = data.id;
    
    // Test GET income summary
    ({ status, data } = await makeRequest(`${API_BASE}/income/summary`));
    logTest('GET Income Summary', status === 200 && typeof data.totalIncome === 'number');
    
    // Test PUT update income
    const updatedIncome = { ...testData.income, amount: 150.75 };
    ({ status, data } = await makeRequest(`${API_BASE}/income/${incomeId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedIncome)
    }));
    logTest('PUT Income', status === 200 && data.amount === 150.75);
    
    // Test DELETE income
    ({ status } = await makeRequest(`${API_BASE}/income/${incomeId}`, {
      method: 'DELETE'
    }));
    logTest('DELETE Income', status === 200 || status === 204);
  }
}

async function testExpensesCRUD() {
  // console.log('\n💸 Testing Expenses API...');
  
  // Test GET expenses (empty)
  let { status, data } = await makeRequest(`${API_BASE}/expenses`);
  logTest('GET Expenses', status === 200 && Array.isArray(data));
  
  // Test POST create expense
  ({ status, data } = await makeRequest(`${API_BASE}/expenses`, {
    method: 'POST',
    body: JSON.stringify(testData.expense)
  }));
  logTest('POST Expense', status === 201 && data.id);
  
  if (status === 201) {
    const expenseId = data.id;
    
    // Test GET expenses summary
    ({ status, data } = await makeRequest(`${API_BASE}/expenses/summary`));
    logTest('GET Expenses Summary', status === 200 && typeof data.totalExpenses === 'number');
    
    // Test PUT update expense
    const updatedExpense = { ...testData.expense, amount: 2600.00 };
    ({ status, data } = await makeRequest(`${API_BASE}/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedExpense)
    }));
    logTest('PUT Expense', status === 200 && data.amount === 2600.00);
    
    // Test DELETE expense
    ({ status } = await makeRequest(`${API_BASE}/expenses/${expenseId}`, {
      method: 'DELETE'
    }));
    logTest('DELETE Expense', status === 200 || status === 204);
  }
}

async function testBudgetsCRUD() {
  // console.log('\n🎯 Testing Budgets API...');
  
  // Test GET budgets (empty)
  let { status, data } = await makeRequest(`${API_BASE}/budgets`);
  logTest('GET Budgets', status === 200 && Array.isArray(data));
  
  // Test POST create budget
  ({ status, data } = await makeRequest(`${API_BASE}/budgets`, {
    method: 'POST',
    body: JSON.stringify(testData.budget)
  }));
  logTest('POST Budget', status === 201 && data.id);
  
  if (status === 201) {
    const budgetId = data.id;
    
    // Test GET budget analysis
    ({ status, data } = await makeRequest(`${API_BASE}/budgets/analysis`));
    logTest('GET Budget Analysis', status === 200 && typeof data === 'object');
    
    // Test PUT update budget
    const updatedBudget = { ...testData.budget, budgeted: 900.00 };
    ({ status, data } = await makeRequest(`${API_BASE}/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedBudget)
    }));
    logTest('PUT Budget', status === 200 && data.budgeted === 900.00);
    
    // Test DELETE budget
    ({ status } = await makeRequest(`${API_BASE}/budgets/${budgetId}`, {
      method: 'DELETE'
    }));
    logTest('DELETE Budget', status === 200 || status === 204);
  }
}

async function testCashFlowAPI() {
  // console.log('\n💱 Testing Cash Flow API...');
  
  const { status, data } = await makeRequest(`${API_BASE}/cash-flow`);
  logTest('GET Cash Flow', status === 200 && typeof data.netIncome === 'number');
}

// Response time testing
async function testResponseTimes() {
  // console.log('\n⏱️  Testing API Response Times...');
  
  const endpoints = [
    '/health',
    '/portfolios',
    '/holdings',
    '/transactions',
    '/income',
    '/expenses',
    '/budgets',
    '/cash-flow'
  ];
  
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    const { status } = await makeRequest(`${API_BASE}${endpoint}`);
    const responseTime = Date.now() - startTime;
    
    const target = endpoint === '/health' ? 100 : 500; // Health should be faster
    logTest(`${endpoint} Response Time`, responseTime < target, `${responseTime}ms (target: <${target}ms)`);
  }
}

// Main test runner
async function runAPITests() {
  // console.log('🚀 Income Clarity API Test Suite');
  // console.log('=================================');
  
  try {
    await testHealthCheck();
    await testPortfoliosCRUD();
    await testHoldingsCRUD();
    await testTransactionsAPI();
    await testIncomeCRUD();
    await testExpensesCRUD();
    await testBudgetsCRUD();
    await testCashFlowAPI();
    await testResponseTimes();
    
    // console.log('\n📊 Test Results Summary:');
    // console.log('========================');
    // console.log(`✅ Passed: ${testResults.passed}`);
    // console.log(`❌ Failed: ${testResults.failed}`);
    // console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
    
    if (testResults.failed === 0) {
      // console.log('\n🎉 All API tests passed successfully!');
      // console.log('✅ API is ready for production use');
      process.exit(0);
    } else {
      // console.log('\n⚠️  Some tests failed. Review the issues above.');
      // console.log('\nFailed tests:');
      testResults.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`❌ ${t.name}${t.details ? ` - ${t.details}` : ''}`));
      process.exit(1);
    }
    
  } catch (error) {
    // console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const { status } = await makeRequest(`${BASE_URL}/api/health`);
    if (status !== 200) {
      throw new Error('Server not responding');
    }
  } catch (error) {
    // console.error('❌ Server is not running on', BASE_URL);
    // console.error('💡 Please start the server first:');
    // console.error('   npm run dev');
    // console.error('   # or');
    // console.error('   npm run start');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    await checkServer();
    await runAPITests();
  })();
}

module.exports = { runAPITests, testResults };