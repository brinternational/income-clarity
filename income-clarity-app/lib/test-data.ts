// Test data for the test user account
// This creates realistic financial data for testing the app

export const TEST_USER_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

export const TEST_USER_PROFILE = {
  age: 35,
  taxLocation: 'california',
  riskTolerance: 'moderate',
  experience: 'intermediate',
  investmentGoals: ['income', 'growth'],
  monthlyExpenses: 4500,
  preferredStrategy: 'diversified'
};

export const TEST_PORTFOLIO_DATA = {
  totalValue: 125000,
  monthlyDividendIncome: 650,
  holdings: [
    {
      symbol: 'SCHD',
      shares: 850,
      avgPrice: 72.50,
      currentPrice: 75.20,
      dividendYield: 3.4,
      nextExDate: '2024-03-15'
    },
    {
      symbol: 'VTI',
      shares: 200,
      avgPrice: 220.00,
      currentPrice: 225.80,
      dividendYield: 1.8,
      nextExDate: '2024-03-20'
    },
    {
      symbol: 'VXUS',
      shares: 300,
      avgPrice: 55.00,
      currentPrice: 56.90,
      dividendYield: 2.9,
      nextExDate: '2024-03-25'
    },
    {
      symbol: 'BND',
      shares: 400,
      avgPrice: 75.50,
      currentPrice: 74.80,
      dividendYield: 4.1,
      nextExDate: '2024-03-10'
    }
  ]
};

export const TEST_EXPENSE_DATA = {
  housing: 1800,
  utilities: 250,
  food: 600,
  transportation: 400,
  insurance: 350,
  entertainment: 300,
  healthcare: 200,
  miscellaneous: 600
};

export const TEST_MILESTONES = [
  {
    name: 'Utilities Covered',
    amount: 250,
    category: 'utilities',
    achieved: true,
    achievedDate: '2023-08-15'
  },
  {
    name: 'Insurance Covered',
    amount: 350,
    category: 'insurance', 
    achieved: true,
    achievedDate: '2023-11-20'
  },
  {
    name: 'Food Covered',
    amount: 600,
    category: 'food',
    achieved: true,
    achievedDate: '2024-01-10'
  },
  {
    name: 'Housing Covered',
    amount: 1800,
    category: 'housing',
    achieved: false,
    progress: 0.36 // 650/1800
  },
  {
    name: 'Transportation Covered',
    amount: 400,
    category: 'transportation',
    achieved: false,
    progress: 0
  },
  {
    name: 'Full Independence',
    amount: 4500,
    category: 'all',
    achieved: false,
    progress: 0.14 // 650/4500
  }
];

export const TEST_TAX_DATA = {
  federalRate: 0.15, // Qualified dividends
  stateRate: 0.133, // California max
  effectiveRate: 0.283,
  estimatedAnnualTax: 2200,
  quarterlyPayments: 550,
  nextPaymentDate: '2024-03-15'
};

// Function to seed test data for authenticated test user
export function seedTestUserData(userId: number) {
  // In a real implementation, this would save to database
  // For now, we'll store in localStorage when user logs in
  const testData = {
    userId,
    profile: TEST_USER_PROFILE,
    portfolio: TEST_PORTFOLIO_DATA,
    expenses: TEST_EXPENSE_DATA,
    milestones: TEST_MILESTONES,
    tax: TEST_TAX_DATA,
    lastUpdated: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('testUserData', JSON.stringify(testData));
    localStorage.setItem('userProfile', JSON.stringify(TEST_USER_PROFILE));
    localStorage.setItem('portfolioData', JSON.stringify(TEST_PORTFOLIO_DATA));
    localStorage.setItem('expenseData', JSON.stringify(TEST_EXPENSE_DATA));
  }

  return testData;
}

// Function to load test data
export function loadTestUserData() {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem('testUserData');
  return data ? JSON.parse(data) : null;
}

// Function to clear test data
export function clearTestUserData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('testUserData');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('portfolioData');
  localStorage.removeItem('expenseData');
}