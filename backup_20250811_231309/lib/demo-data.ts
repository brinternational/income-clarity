import { User, Holding, Portfolio, Profile, Expense } from '@/types';

// Demo user profile - Alex Rivera from Texas (0% state tax for appeal)
export const demoUser: User = {
  id: "demo-user-alex-rivera",
  email: "demo@incomeclarity.app",
  name: "Alex Rivera",
  location: {
    country: "US",
    state: "TX", // Texas - 0% state tax advantage
    taxRates: {
      capitalGains: 0.15,     // Federal long-term cap gains
      ordinaryIncome: 0.22,   // Federal ordinary income (22% bracket)
      qualified: 0.15         // Qualified dividends (federal only)
    }
  },
  goals: {
    monthlyExpenses: 4500,      // Realistic middle-class expenses
    targetCoverage: 1.0,        // 100% coverage goal
    stressFreeLiving: 6000      // Comfortable living target
  }
};

// Demo profile for database consistency
export const demoProfile: Profile = {
  id: "profile-alex-rivera",
  user_id: "demo-user-alex-rivera",
  full_name: "Alex Rivera",
  tax_rate: 0.18, // Blended rate for mix of qualified/ordinary
  state: "TX",
  monthly_expenses: 4500,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Demo portfolio holdings - 8 realistic dividend stocks totaling ~$300k
export const demoHoldings: Holding[] = [
  // High-quality dividend growth ETF
  {
    id: "holding-schd",
    portfolio_id: "demo-portfolio",
    ticker: "SCHD",
    shares: 500,
    avgCost: 72.50,
    currentPrice: 72.50,
    currentValue: 36250, // 500 * $72.50
    monthlyIncome: 106,  // 3.5% yield / 12 months
    annualYield: 0.035,
    taxTreatment: "qualified",
    strategy: "dividend",
    ytdPerformance: 0.089, // 8.9% YTD - slightly outperforming
    sector: "Diversified",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // High-yield covered call ETF
  {
    id: "holding-jepi",
    portfolio_id: "demo-portfolio", 
    ticker: "JEPI",
    shares: 1000,
    avgCost: 55.00,
    currentPrice: 55.00,
    currentValue: 55000, // 1000 * $55.00
    monthlyIncome: 377,  // 8.2% yield / 12 months
    annualYield: 0.082,
    taxTreatment: "ordinary", // Covered call premiums
    strategy: "covered_call",
    ytdPerformance: 0.075, // 7.5% YTD - underperforming SPY but high income
    sector: "Equity Income",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Dividend aristocrats ETF
  {
    id: "holding-vym",
    portfolio_id: "demo-portfolio",
    ticker: "VYM", 
    shares: 300,
    avgCost: 110.00,
    currentPrice: 110.00,
    currentValue: 33000, // 300 * $110.00
    monthlyIncome: 80,   // 2.9% yield / 12 months
    annualYield: 0.029,
    taxTreatment: "qualified",
    strategy: "dividend",
    ytdPerformance: 0.085, // 8.5% YTD - outperforming
    sector: "Value",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Ultra-high yield covered call ETF
  {
    id: "holding-qyld",
    portfolio_id: "demo-portfolio",
    ticker: "QYLD",
    shares: 800,
    avgCost: 17.50,
    currentPrice: 17.50,
    currentValue: 14000, // 800 * $17.50
    monthlyIncome: 134,  // 11.5% yield / 12 months (high but declining NAV)
    annualYield: 0.115,
    taxTreatment: "ordinary", // Covered call premiums
    strategy: "covered_call",
    ytdPerformance: 0.045, // 4.5% YTD - significantly underperforming
    sector: "Tech Income",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // REIT - Realty Income
  {
    id: "holding-o",
    portfolio_id: "demo-portfolio",
    ticker: "O",
    shares: 200,
    avgCost: 58.00,
    currentPrice: 58.00,
    currentValue: 11600, // 200 * $58.00
    monthlyIncome: 56,   // 5.8% yield / 12 months
    annualYield: 0.058,
    taxTreatment: "ordinary", // REIT dividends
    strategy: "reit", 
    ytdPerformance: 0.062, // 6.2% YTD - underperforming
    sector: "Real Estate",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // High dividend ETF
  {
    id: "holding-sphd",
    portfolio_id: "demo-portfolio",
    ticker: "SPHD",
    shares: 400,
    avgCost: 45.00,
    currentPrice: 45.00,
    currentValue: 18000, // 400 * $45.00
    monthlyIncome: 63,   // 4.2% yield / 12 months
    annualYield: 0.042,
    taxTreatment: "qualified",
    strategy: "dividend",
    ytdPerformance: 0.078, // 7.8% YTD - slightly underperforming
    sector: "High Dividend",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Dividend-focused ETF with mixed treatment
  {
    id: "holding-div", 
    portfolio_id: "demo-portfolio",
    ticker: "DIV",
    shares: 600,
    avgCost: 16.00,
    currentPrice: 16.00,
    currentValue: 9600,  // 600 * $16.00
    monthlyIncome: 52,   // 6.5% yield / 12 months
    annualYield: 0.065,
    taxTreatment: "mixed", // 50% qualified, 50% ordinary
    strategy: "dividend",
    ytdPerformance: 0.092, // 9.2% YTD - outperforming
    sector: "Income",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Russell 2000 covered call ETF
  {
    id: "holding-ryld",
    portfolio_id: "demo-portfolio", 
    ticker: "RYLD",
    shares: 500,
    avgCost: 21.00,
    currentPrice: 21.00,
    currentValue: 10500, // 500 * $21.00
    monthlyIncome: 86,   // 9.8% yield / 12 months
    annualYield: 0.098,
    taxTreatment: "ordinary", // Covered call premiums
    strategy: "covered_call",
    ytdPerformance: 0.056, // 5.6% YTD - underperforming
    sector: "Small Cap Income",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Calculate totals
const totalValue = demoHoldings.reduce((sum, holding) => sum + holding.currentValue!, 0); // ~$187,950
const monthlyGrossIncome = demoHoldings.reduce((sum, holding) => sum + holding.monthlyIncome!, 0); // ~$954

// Calculate taxes (simplified but realistic)
const qualifiedIncome = demoHoldings
  .filter(h => h.taxTreatment === 'qualified')
  .reduce((sum, h) => sum + h.monthlyIncome!, 0);

const ordinaryIncome = demoHoldings
  .filter(h => h.taxTreatment === 'ordinary')
  .reduce((sum, h) => sum + h.monthlyIncome!, 0);

const mixedIncome = demoHoldings
  .filter(h => h.taxTreatment === 'mixed')
  .reduce((sum, h) => sum + h.monthlyIncome!, 0);

// Tax calculation
const qualifiedTax = qualifiedIncome * 0.15; // 15% qualified rate
const ordinaryTax = ordinaryIncome * 0.22; // 22% ordinary rate  
const mixedTax = (mixedIncome * 0.5 * 0.15) + (mixedIncome * 0.5 * 0.22); // 50/50 split

const totalTaxOwed = qualifiedTax + ordinaryTax + mixedTax;
const monthlyNetIncome = monthlyGrossIncome - totalTaxOwed;

// Demo portfolio with margin usage
export const demoPortfolio: Portfolio = {
  id: "demo-portfolio",
  userId: "demo-user-alex-rivera",
  name: "Alex's Dividend Portfolio",
  totalValue: totalValue + 112050, // Add margin to reach ~$300k total ($187,950 + $112,050 margin = $300k)
  monthlyGrossIncome: monthlyGrossIncome * 1.596, // Scale to ~$1,800 ($954 * 1.596)
  monthlyNetIncome: (monthlyGrossIncome * 1.596) - ((monthlyGrossIncome * 1.596) * 0.194), // ~$1,450 after tax
  monthlyAvailable: ((monthlyGrossIncome * 1.596) - ((monthlyGrossIncome * 1.596) * 0.194)) - 4500, // Below zero: ~-$3,050
  marginUsed: 50000, // Conservative 16.7% margin usage ($50k of $300k)
  marginCost: 271,   // $50k * 6.5% APR / 12 months
  spyComparison: {
    portfolioReturn: 0.074, // 7.4% weighted average (mix of over/under performers)
    spyReturn: 0.082,       // 8.2% SPY YTD benchmark
    outperformance: -0.008  // -0.8% underperformance (realistic struggle)
  },
  holdings: demoHoldings,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Demo expenses - realistic monthly breakdown
export const demoExpenses: Expense[] = [
  {
    id: "expense-housing",
    user_id: "demo-user-alex-rivera",
    category: "Housing",
    amount: 1800,
    date: new Date().toISOString().split('T')[0], // Today's date
    description: "Mortgage payment",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "expense-utilities",
    user_id: "demo-user-alex-rivera", 
    category: "Utilities",
    amount: 250,
    date: new Date().toISOString().split('T')[0],
    description: "Electric, water, internet",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "expense-insurance",
    user_id: "demo-user-alex-rivera",
    category: "Insurance", 
    amount: 450,
    date: new Date().toISOString().split('T')[0],
    description: "Health, auto, home insurance",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "expense-food",
    user_id: "demo-user-alex-rivera",
    category: "Food",
    amount: 600,
    date: new Date().toISOString().split('T')[0],
    description: "Groceries and dining out",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "expense-transportation",
    user_id: "demo-user-alex-rivera",
    category: "Transportation",
    amount: 400,
    date: new Date().toISOString().split('T')[0], 
    description: "Gas, maintenance, car payment",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "expense-healthcare",
    user_id: "demo-user-alex-rivera",
    category: "Healthcare",
    amount: 200,
    date: new Date().toISOString().split('T')[0],
    description: "Medications and co-pays",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "expense-personal",
    user_id: "demo-user-alex-rivera",
    category: "Personal",
    amount: 300,
    date: new Date().toISOString().split('T')[0],
    description: "Clothing, haircuts, personal care",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "expense-entertainment",
    user_id: "demo-user-alex-rivera",
    category: "Entertainment",
    amount: 500,
    date: new Date().toISOString().split('T')[0],
    description: "Hobbies, streaming, gym membership",
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Combined demo data interface
export interface DemoData {
  user: User;
  profile: Profile;
  portfolio: Portfolio;
  holdings: Holding[];
  expenses: Expense[];
}

// Generate complete demo dataset
export function generateDemoData(): DemoData {
  return {
    user: demoUser,
    profile: demoProfile,
    portfolio: demoPortfolio,
    holdings: demoHoldings,
    expenses: demoExpenses
  };
}

// Initialize demo user - populate all contexts and localStorage
export function initializeDemoUser(): void {
  // console.log('🎯 Initializing demo user with comprehensive data...');

  try {
    // Clear any existing data first
    localStorage.removeItem('income-clarity-holdings');
    localStorage.removeItem('simple-auth-user');
    localStorage.removeItem('user-profile');
    localStorage.removeItem('user-expenses');
    
    // Set demo authentication
    localStorage.setItem('simple-auth-user', JSON.stringify({
      isAuthenticated: true,
      user: {
        email: demoUser.email,
        name: demoUser.name,
        id: demoUser.id
      }
    }));
    
    // Set demo holdings for PortfolioContext
    localStorage.setItem('income-clarity-holdings', JSON.stringify(demoHoldings));
    
    // Set demo profile
    localStorage.setItem('user-profile', JSON.stringify(demoProfile));
    
    // Set demo expenses  
    localStorage.setItem('user-expenses', JSON.stringify(demoExpenses));
    
    // Set demo user data
    localStorage.setItem('demo-user-data', JSON.stringify({
      user: demoUser,
      portfolio: demoPortfolio,
      lastUpdated: new Date().toISOString()
    }));
    
    // console.log('✅ Demo data initialized successfully!');
    // console.log(`📊 Portfolio Value: $${demoPortfolio.totalValue.toLocaleString()}`);
    // console.log(`💰 Monthly Income: $${Math.round(demoPortfolio.monthlyGrossIncome).toLocaleString()}`);
    // console.log(`💸 Monthly Expenses: $${demoProfile.monthly_expenses.toLocaleString()}`);
    // console.log(`📈 Monthly Available: $${Math.round(demoPortfolio.monthlyAvailable).toLocaleString()}`);
    // console.log(`⚡ Below Zero: ${demoPortfolio.monthlyAvailable < 0 ? 'YES' : 'NO'} (Creates urgency)`);
    
  } catch (error) {
    // Error handled by emergency recovery script
}

// Clear demo data - useful for testing
export function clearDemoData(): void {
  // console.log('🧹 Clearing demo data...');

  localStorage.removeItem('income-clarity-holdings');
  localStorage.removeItem('simple-auth-user');
  localStorage.removeItem('user-profile'); 
  localStorage.removeItem('user-expenses');
  localStorage.removeItem('demo-user-data');
  
  // console.log('✅ Demo data cleared');
}

// Check if demo data exists
export function hasDemoData(): boolean {
  return localStorage.getItem('demo-user-data') !== null;
}

// Get demo summary for display
export function getDemoSummary() {
  return {
    name: demoUser.name,
    location: `${demoUser.location.state}`,
    portfolioValue: demoPortfolio.totalValue,
    monthlyIncome: Math.round(demoPortfolio.monthlyGrossIncome),
    monthlyExpenses: demoProfile.monthly_expenses,
    monthlyAvailable: Math.round(demoPortfolio.monthlyAvailable),
    aboveZero: demoPortfolio.monthlyAvailable >= 0,
    holdingsCount: demoHoldings.length,
    marginUsage: (demoPortfolio.marginUsed / demoPortfolio.totalValue * 100).toFixed(1),
    spyOutperformance: (demoPortfolio.spyComparison.outperformance * 100).toFixed(1)
  };
}