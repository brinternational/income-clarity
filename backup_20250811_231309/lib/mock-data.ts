import { User, Holding, Portfolio } from '@/types';

export const mockUser: User = {
  id: "user-1",
  email: "investor@example.com",
  name: "Demo User",
  location: {
    country: "PR",
    state: "PR",
    taxRates: {
      capitalGains: 0.0,      // PR advantage
      ordinaryIncome: 0.0,    // PR advantage
      qualified: 0.0          // PR advantage
    }
  },
  goals: {
    monthlyExpenses: 3800,
    targetCoverage: 1.0,
    stressFreeLiving: 5000
  }
};

export const mockHoldings: Holding[] = [
  {
    id: "holding-1",
    portfolio_id: "portfolio-1",
    ticker: "JEPI",
    shares: 1200,
    avgCost: 100000,
    currentPrice: 100,
    currentValue: 120000,
    monthlyIncome: 850,
    annualYield: 0.085,
    taxTreatment: "ordinary",   // Covered call income
    strategy: "covered_call",
    ytdPerformance: 0.124,       // 12.4% YTD - OUTPERFORMING
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "holding-2", 
    portfolio_id: "portfolio-1",
    ticker: "SCHD",
    shares: 800,
    avgCost: 73000,
    currentPrice: 100,
    currentValue: 80000,
    monthlyIncome: 253,
    annualYield: 0.038,
    taxTreatment: "qualified",  // Qualified dividends
    strategy: "dividend",
    ytdPerformance: 0.102,       // 10.2% YTD - OUTPERFORMING
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "holding-3",
    portfolio_id: "portfolio-1",
    ticker: "VTI",
    shares: 1000,
    avgCost: 185000,
    currentPrice: 200,
    currentValue: 200000,
    monthlyIncome: 300,
    annualYield: 0.018,
    taxTreatment: "qualified",
    strategy: "growth",
    ytdPerformance: 0.082,       // 8.2% YTD - MATCHES SPY
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "holding-4",
    portfolio_id: "portfolio-1",
    ticker: "VYM",
    shares: 600,
    avgCost: 65000,
    currentPrice: 115,
    currentValue: 69000,
    monthlyIncome: 195,
    annualYield: 0.034,
    taxTreatment: "qualified",
    strategy: "dividend",
    ytdPerformance: 0.115,       // 11.5% YTD - OUTPERFORMING
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "holding-5",
    portfolio_id: "portfolio-1",
    ticker: "QYLD",
    shares: 400,
    avgCost: 42000,
    currentPrice: 98,
    currentValue: 39200,
    monthlyIncome: 420,
    annualYield: 0.128,
    taxTreatment: "ordinary",
    strategy: "covered_call",
    ytdPerformance: 0.045,       // 4.5% YTD - UNDERPERFORMING
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "holding-6",
    portfolio_id: "portfolio-1",
    ticker: "SPHD",
    shares: 300,
    avgCost: 32000,
    currentPrice: 95,
    currentValue: 28500,
    monthlyIncome: 140,
    annualYield: 0.059,
    taxTreatment: "qualified",
    strategy: "dividend",
    ytdPerformance: 0.068,       // 6.8% YTD - UNDERPERFORMING
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockPortfolio: Portfolio = {
  id: "portfolio-1",
  userId: "user-1",
  totalValue: 456700,          // Updated total
  monthlyGrossIncome: 2158,    // Updated income
  monthlyNetIncome: 2158,      // No tax in PR
  monthlyAvailable: -1642,     // After expenses
  marginUsed: 60000,
  marginCost: 200,
  spyComparison: {
    portfolioReturn: 0.095,     // 9.5% weighted average
    spyReturn: 0.082,           // 8.2% SPY YTD
    outperformance: 0.013       // 1.3% outperformance
  },
  holdings: mockHoldings
};

export const mockExpenses = [
  { name: "Utilities", amount: 200 },
  { name: "Insurance", amount: 400 },
  { name: "Food", amount: 800 },
  { name: "Rent", amount: 1500 },
  { name: "Entertainment", amount: 600 },
  { name: "Miscellaneous", amount: 300 }
];