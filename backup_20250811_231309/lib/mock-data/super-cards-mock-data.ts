// Comprehensive Mock Data for all 5 Super Cards - LOCAL_MODE
// Realistic data that demonstrates all features perfectly

import { LOCAL_MODE_CONFIG } from '../config/local-mode';

// Mock stock prices (simulate real market data)
export const mockStockPrices = {
  'JEPI': { price: 56.24, change: 0.45, changePercent: 0.81 },
  'SCHD': { price: 78.91, change: -0.23, changePercent: -0.29 },
  'VTI': { price: 242.18, change: 1.85, changePercent: 0.77 },
  'VYM': { price: 115.34, change: 0.67, changePercent: 0.58 },
  'QYLD': { price: 17.82, change: -0.08, changePercent: -0.45 },
  'SPHD': { price: 44.67, change: 0.12, changePercent: 0.27 },
  'SPY': { price: 484.23, change: 2.15, changePercent: 0.45 }, // SPY for comparison
  'QQQ': { price: 412.67, change: 1.89, changePercent: 0.46 },
  'DIVO': { price: 19.45, change: 0.03, changePercent: 0.15 },
  'DGRO': { price: 56.78, change: 0.34, changePercent: 0.60 },
};

// Mock holdings with realistic diversification
export const mockHoldings = [
  {
    id: 'holding-1',
    portfolio_id: 'portfolio-1',
    ticker: 'JEPI',
    shares: 1856,
    avgCost: 52.15,
    currentPrice: 56.24,
    currentValue: 104399.44,
    monthlyIncome: 953.23,  // High monthly income from covered calls
    annualYield: 0.109,     // 10.9% yield
    taxTreatment: 'ordinary' as const,
    strategy: 'covered_call' as const,
    ytdPerformance: 0.142,  // 14.2% YTD - CRUSHING IT
    sector: 'Mixed',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'holding-2',
    portfolio_id: 'portfolio-1', 
    ticker: 'SCHD',
    shares: 1245,
    avgCost: 74.32,
    currentPrice: 78.91,
    currentValue: 98243.95,
    monthlyIncome: 315.67,  // Quality dividend growth
    annualYield: 0.039,     // 3.9% yield
    taxTreatment: 'qualified' as const,
    strategy: 'dividend' as const,
    ytdPerformance: 0.098,  // 9.8% YTD - BEATING SPY
    sector: 'Diversified',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'holding-3',
    portfolio_id: 'portfolio-1',
    ticker: 'VTI', 
    shares: 567,
    avgCost: 235.67,
    currentPrice: 242.18,
    currentValue: 137316.06,
    monthlyIncome: 287.45,  // Lower yield but steady growth
    annualYield: 0.025,     // 2.5% yield
    taxTreatment: 'qualified' as const,
    strategy: 'growth' as const,
    ytdPerformance: 0.089,  // 8.9% YTD - SOLID PERFORMANCE
    sector: 'Total Market',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'holding-4',
    portfolio_id: 'portfolio-1',
    ticker: 'VYM',
    shares: 789,
    avgCost: 108.45,
    currentPrice: 115.34,
    currentValue: 91003.26,
    monthlyIncome: 276.89,  // Solid dividend yield
    annualYield: 0.036,     // 3.6% yield
    taxTreatment: 'qualified' as const,
    strategy: 'dividend' as const,
    ytdPerformance: 0.112,  // 11.2% YTD - EXCELLENT
    sector: 'High Dividend',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'holding-5',
    portfolio_id: 'portfolio-1',
    ticker: 'QYLD',
    shares: 2134,
    avgCost: 18.67,
    currentPrice: 17.82,
    currentValue: 38028.28,
    monthlyIncome: 487.23,  // High monthly distribution
    annualYield: 0.154,     // 15.4% yield - MONSTER YIELD
    taxTreatment: 'ordinary' as const,
    strategy: 'covered_call' as const,
    ytdPerformance: 0.032,  // 3.2% YTD - Lower capital appreciation
    sector: 'NASDAQ 100',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'holding-6',
    portfolio_id: 'portfolio-1',
    ticker: 'SPHD',
    shares: 456,
    avgCost: 42.18,
    currentPrice: 44.67,
    currentValue: 20369.52,
    monthlyIncome: 167.45,  // Steady dividend
    annualYield: 0.045,     // 4.5% yield
    taxTreatment: 'qualified' as const,
    strategy: 'dividend' as const,
    ytdPerformance: 0.073,  // 7.3% YTD - Decent performance
    sector: 'Low Volatility',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString()
  }
];

// Calculate totals
const totalValue = mockHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
const totalMonthlyIncome = mockHoldings.reduce((sum, holding) => sum + holding.monthlyIncome, 0);
const weightedYTDPerformance = mockHoldings.reduce((sum, holding) => 
  sum + (holding.ytdPerformance * (holding.currentValue / totalValue)), 0
);

// Mock expenses breakdown
export const mockExpenses = [
  { id: 'exp-1', name: 'Utilities', amount: 285, category: 'Essential', covered: true },
  { id: 'exp-2', name: 'Insurance', amount: 467, category: 'Essential', covered: true },
  { id: 'exp-3', name: 'Food & Groceries', amount: 789, category: 'Essential', covered: true },
  { id: 'exp-4', name: 'Rent/Mortgage', amount: 1650, category: 'Essential', covered: true },
  { id: 'exp-5', name: 'Transportation', amount: 345, category: 'Essential', covered: true },
  { id: 'exp-6', name: 'Entertainment', amount: 234, category: 'Lifestyle', covered: false },
  { id: 'exp-7', name: 'Shopping', amount: 156, category: 'Lifestyle', covered: false },
  { id: 'exp-8', name: 'Travel', amount: 89, category: 'Lifestyle', covered: false }
];

const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
const coveredExpenses = mockExpenses.filter(exp => exp.covered).reduce((sum, exp) => sum + exp.amount, 0);

// SUPER CARD 1: Performance Hub Data
export const mockPerformanceHubData = {
  portfolio_value: totalValue,
  total_return_1y: weightedYTDPerformance,
  spy_comparison: weightedYTDPerformance - 0.089, // vs SPY 8.9% YTD
  volatility: 0.142,
  sharpe_ratio: 1.67,
  dividend_yield: (totalMonthlyIncome * 12) / totalValue,
  beta: 0.73,
  max_drawdown: -0.067,
  portfolio_performance: {
    '1D': 0.0045,
    '1W': 0.0234,
    '1M': 0.0756,
    '3M': 0.1123,
    '6M': 0.1456,
    '1Y': weightedYTDPerformance,
    'YTD': weightedYTDPerformance
  },
  holdings_performance: mockHoldings.map(holding => ({
    ticker: holding.ticker,
    value: holding.currentValue,
    weight: (holding.currentValue / totalValue) * 100,
    ytd_return: holding.ytdPerformance,
    monthly_income: holding.monthlyIncome,
    contribution_to_performance: holding.ytdPerformance * (holding.currentValue / totalValue)
  })),
  sector_allocation: {
    'Mixed': 21.3,
    'Diversified': 20.1,
    'Total Market': 28.0,
    'High Dividend': 18.6,
    'NASDAQ 100': 7.8,
    'Low Volatility': 4.2
  },
  status: 'excellent',
  last_updated: new Date().toISOString()
};

// SUPER CARD 2: Income Intelligence Hub Data  
export const mockIncomeIntelligenceData = {
  monthly_dividend_income: totalMonthlyIncome,
  annual_dividend_income: totalMonthlyIncome * 12,
  tax_owed: 0, // Puerto Rico advantage!
  net_income: totalMonthlyIncome, // No taxes = full income
  available_to_reinvest: totalMonthlyIncome - totalExpenses,
  yield_on_cost: 0.087, // 8.7% yield on original cost basis
  growth_rate: 0.156, // 15.6% dividend growth rate
  tax_rate: 0.0, // 0% in Puerto Rico
  monthly_breakdown: {
    qualified_dividends: 879.01, // From SCHD, VTI, VYM, SPHD
    ordinary_income: 1440.46, // From JEPI, QYLD (covered calls)
    tax_savings_vs_california: 623.45, // Massive tax advantage
    tax_savings_vs_nyc: 738.92
  },
  income_stability: {
    consistency_score: 0.94, // 94% consistency
    months_covered: 12,
    volatility: 0.067,
    trend: 'increasing'
  },
  projections: {
    '6_months': totalMonthlyIncome * 6 * 1.03,
    '1_year': totalMonthlyIncome * 12 * 1.08,
    '2_years': totalMonthlyIncome * 24 * 1.18,
    '5_years': totalMonthlyIncome * 60 * 1.45
  },
  status: 'thriving',
  last_updated: new Date().toISOString()
};

// SUPER CARD 3: Financial Planning Hub Data
export const mockFinancialPlanningData = {
  expense_coverage_percentage: (totalMonthlyIncome / totalExpenses) * 100,
  fire_progress: (totalValue / (totalExpenses * 12 * 25)) * 100, // 4% rule
  monthly_expenses: totalExpenses,
  covered_expenses: coveredExpenses,
  uncovered_expenses: totalExpenses - coveredExpenses,
  surplus_deficit: totalMonthlyIncome - totalExpenses,
  next_milestone: totalMonthlyIncome > totalExpenses ? 
    'Full Entertainment Coverage' : 'Basic Needs Coverage',
  burn_rate: totalExpenses,
  coast_fire_age: 45, // Age when growth reaches FIRE number
  milestones: {
    utilities: { amount: 285, covered: true, percentage: 100 },
    insurance: { amount: 467, covered: true, percentage: 100 },
    food: { amount: 789, covered: true, percentage: 100 },
    housing: { amount: 1650, covered: true, percentage: 100 },
    transportation: { amount: 345, covered: true, percentage: 100 },
    entertainment: { amount: 234, covered: false, percentage: 0 },
    full_freedom: { amount: totalExpenses, covered: false, percentage: 73.4 }
  },
  projections: {
    months_to_full_coverage: Math.ceil((totalExpenses - totalMonthlyIncome) / (totalMonthlyIncome * 0.08)),
    fire_number: totalExpenses * 12 * 25,
    current_fire_progress: (totalValue / (totalExpenses * 12 * 25)) * 100,
    time_to_fire_years: 12.4
  },
  lifestyle_score: 8.7, // Out of 10
  status: 'on_track',
  last_updated: new Date().toISOString()
};

// SUPER CARD 4: Tax Strategy Hub Data
export const mockTaxStrategyData = {
  overall_score: 9.8, // Almost perfect due to PR location
  tax_efficiency_score: 10.0, // Perfect - no dividend taxes
  location_advantage: 'puerto_rico',
  annual_tax_savings: 7481.4, // vs mainland US
  tax_breakdown: {
    federal_dividend_tax: 0,
    state_dividend_tax: 0, 
    total_tax_rate: 0.0,
    effective_rate: 0.0
  },
  tax_comparison: {
    puerto_rico: { rate: 0.0, annual_tax: 0 },
    california: { rate: 0.133, annual_tax: 3695.2 },
    new_york: { rate: 0.108, annual_tax: 2995.8 },
    texas: { rate: 0.15, annual_tax: 4168.7 }, // Federal only
    florida: { rate: 0.15, annual_tax: 4168.7 }  // Federal only
  },
  optimization_opportunities: [
    {
      strategy: 'maximize_qualified_dividends',
      potential_savings: 234.5,
      status: 'implemented'
    },
    {
      strategy: 'reits_in_tax_advantaged',
      potential_savings: 0,
      status: 'not_applicable'
    }
  ],
  recommendations: [
    'Maintain PR residency for maximum tax efficiency',
    'Consider increasing qualified dividend allocation',
    'Perfect tax optimization already achieved'
  ],
  compliance_status: 'fully_compliant',
  next_review_date: '2024-12-31',
  status: 'optimized',
  last_updated: new Date().toISOString()
};

// SUPER CARD 5: Portfolio Strategy Hub Data
export const mockPortfolioStrategyData = {
  overall_score: 8.9,
  diversification_score: 8.7,
  risk_score: 7.2, // Moderate risk
  rebalancing_needed: false,
  asset_allocation: {
    equity_etfs: 85.6,
    covered_call_funds: 14.4,
    bonds: 0.0,
    cash: 0.0,
    reits: 0.0,
    international: 12.3 // Within equity ETFs
  },
  strategy_breakdown: {
    dividend_growth: 45.8, // SCHD, VYM, VTI
    covered_call: 29.2, // JEPI, QYLD  
    total_market: 28.0, // VTI
    low_volatility: 4.2  // SPHD
  },
  risk_analysis: {
    portfolio_beta: 0.73,
    volatility: 14.2,
    max_drawdown: -6.7,
    var_95: -2.8, // 95% VaR
    sharpe_ratio: 1.67,
    sortino_ratio: 2.34
  },
  recommendations: [
    {
      type: 'rebalancing',
      urgency: 'low',
      description: 'Consider adding international exposure',
      impact: 'medium'
    },
    {
      type: 'optimization',
      urgency: 'low', 
      description: 'Excellent income-focused allocation',
      impact: 'positive'
    }
  ],
  sector_analysis: {
    concentration_risk: 'low',
    top_sectors: [
      { name: 'Technology', weight: 28.4 },
      { name: 'Healthcare', weight: 15.7 },
      { name: 'Financials', weight: 14.2 },
      { name: 'Consumer Discretionary', weight: 12.1 },
      { name: 'Industrials', weight: 10.8 }
    ]
  },
  performance_attribution: {
    security_selection: 2.1,
    asset_allocation: 1.4,
    timing: 0.3,
    fees: -0.2
  },
  status: 'well_optimized',
  last_updated: new Date().toISOString()
};

// Consolidated Super Cards data for API responses
export const mockSuperCardsData = {
  performance: mockPerformanceHubData,
  income: mockIncomeIntelligenceData, 
  lifestyle: mockFinancialPlanningData,
  strategy: mockTaxStrategyData,
  quickActions: mockPortfolioStrategyData
};

// Mock portfolio summary
export const mockPortfolio = {
  id: 'portfolio-1',
  userId: LOCAL_MODE_CONFIG.MOCK_USER.id,
  name: 'Main Portfolio',
  totalValue: totalValue,
  monthlyGrossIncome: totalMonthlyIncome,
  monthlyNetIncome: totalMonthlyIncome, // No taxes in PR!
  monthlyAvailable: totalMonthlyIncome - totalExpenses,
  marginUsed: 85600, // Some margin for growth
  marginCost: 287, // 4% margin rate
  spyComparison: {
    portfolioReturn: weightedYTDPerformance,
    spyReturn: 0.089, // SPY YTD
    outperformance: weightedYTDPerformance - 0.089
  },
  holdings: mockHoldings,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: new Date().toISOString()
};

// Export all mock data
export const mockData = {
  user: LOCAL_MODE_CONFIG.MOCK_USER,
  portfolio: mockPortfolio,
  holdings: mockHoldings,
  expenses: mockExpenses,
  stockPrices: mockStockPrices,
  superCards: mockSuperCardsData
};

export default mockData;