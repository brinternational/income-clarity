import type { 
  Portfolio as SupabasePortfolio, 
  Holding as SupabaseHolding 
} from './database.types';
import type { Portfolio, Holding, User } from '@/types';

/**
 * Converts Supabase portfolio data to the format expected by the calculation functions
 */
export function adaptPortfolioData(
  supabasePortfolio: SupabasePortfolio,
  supabaseHoldings: SupabaseHolding[]
): Portfolio | null {
  if (!supabasePortfolio) return null;

  // Calculate monthly income from dividend-paying holdings
  const monthlyGrossIncome = supabaseHoldings.reduce((total, holding) => {
    if (holding.dividend_yield && holding.current_value) {
      // Convert annual dividend yield to monthly income
      return total + (holding.current_value * holding.dividend_yield / 12);
    }
    return total;
  }, 0);

  // Calculate SPY comparison (simplified - would need real market data in production)
  const spyReturn = 0.082; // 8.2% - would come from market data API
  const portfolioReturn = calculatePortfolioReturn(supabaseHoldings);
  const outperformance = portfolioReturn - spyReturn;

  // Convert holdings to expected format
  const adaptedHoldings = supabaseHoldings.map((holding, index) => ({
    id: holding.id,
    ticker: holding.symbol,
    shares: holding.quantity,
    currentValue: holding.current_value,
    monthlyIncome: holding.dividend_yield ? (holding.current_value * holding.dividend_yield / 12) : 0,
    annualYield: holding.dividend_yield || 0,
    taxTreatment: determineTaxTreatment(holding.symbol),
    strategy: determineStrategy(holding.symbol, holding.asset_type),
    ytdPerformance: calculateYTDPerformance(holding)
  }));

  return {
    id: supabasePortfolio.id,
    userId: supabasePortfolio.user_id,
    totalValue: supabasePortfolio.total_value,
    monthlyGrossIncome,
    monthlyNetIncome: monthlyGrossIncome, // Would need tax calculations for real implementation
    monthlyAvailable: 0, // Would be calculated based on expenses
    marginUsed: 0, // Would need margin data from holdings metadata
    marginCost: 0, // Would be calculated from margin usage
    spyComparison: {
      portfolioReturn,
      spyReturn,
      outperformance
    },
    holdings: adaptedHoldings as any
  };
}

/**
 * Calculate portfolio return based on holdings performance
 */
function calculatePortfolioReturn(holdings: SupabaseHolding[]): number {
  if (!holdings.length) return 0;

  const totalValue = holdings.reduce((sum, holding) => sum + holding.current_value, 0);
  
  if (totalValue === 0) return 0;

  // Weighted average return calculation (simplified)
  // In production, this would use actual price history
  const weightedReturn = holdings.reduce((sum, holding) => {
    const weight = holding.current_value / totalValue;
    const estimatedReturn = estimateHoldingReturn(holding);
    return sum + (weight * estimatedReturn);
  }, 0);

  return weightedReturn;
}

/**
 * Estimate holding return based on asset type and sector
 */
function estimateHoldingReturn(holding: SupabaseHolding): number {
  // Simplified estimation - in production would use actual price data
  switch (holding.asset_type) {
    case 'stock':
      return 0.10; // 10% average for stocks
    case 'etf':
      if (holding.symbol.includes('SPY') || holding.symbol.includes('VOO')) {
        return 0.082; // SPY-like returns
      }
      if (holding.dividend_yield && holding.dividend_yield > 0.05) {
        return 0.095; // Dividend-focused ETFs
      }
      return 0.085; // General ETF return
    case 'bond':
      return 0.04; // 4% for bonds
    case 'crypto':
      return 0.15; // 15% for crypto (high volatility)
    default:
      return 0.07; // 7% default
  }
}

/**
 * Determine tax treatment based on symbol/asset type
 */
function determineTaxTreatment(symbol: string): 'qualified' | 'ordinary' | 'tax_free' {
  // Simplified logic - would need comprehensive database in production
  if (symbol.includes('MUB') || symbol.includes('TFI')) {
    return 'tax_free';
  }
  
  // Covered call ETFs typically generate ordinary income
  if (symbol.includes('JEPI') || symbol.includes('JEPQ') || symbol.includes('XYLD')) {
    return 'ordinary';
  }
  
  // Most dividend ETFs and stocks generate qualified dividends
  return 'qualified';
}

/**
 * Determine investment strategy based on symbol and asset type
 */
function determineStrategy(symbol: string, assetType: SupabaseHolding['asset_type']): 'dividend' | 'growth' | 'covered_call' | 'bond' | 'commodity' {
  // Covered call strategies
  if (symbol.includes('JEPI') || symbol.includes('JEPQ') || symbol.includes('XYLD') || symbol.includes('QYLD')) {
    return 'covered_call';
  }
  
  // Dividend-focused
  if (symbol.includes('SCHD') || symbol.includes('VYM') || symbol.includes('HDV') || symbol.includes('DGRO')) {
    return 'dividend';
  }
  
  // Growth
  if (symbol.includes('VTI') || symbol.includes('VOO') || symbol.includes('QQQ') || symbol.includes('ARKK')) {
    return 'growth';
  }
  
  // Asset type based
  switch (assetType) {
    case 'bond':
      return 'bond';
    case 'commodity':
      return 'commodity';
    default:
      return 'growth';
  }
}

/**
 * Calculate YTD performance for a holding
 */
function calculateYTDPerformance(holding: SupabaseHolding): number {
  // Simplified calculation - in production would use price history
  if (holding.current_price && holding.average_cost) {
    return (holding.current_price - holding.average_cost) / holding.average_cost;
  }
  
  // Fallback to estimated performance
  return estimateHoldingReturn(holding);
}

/**
 * Convert Supabase user to expected User format
 */
export function adaptUserData(supabaseUser: any, profile: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: profile?.full_name || supabaseUser.email,
    location: {
      country: "US", // Default - would come from user profile
      state: "CA", // Default - would come from user profile
      taxRates: {
        capitalGains: 0.20, // Default rates - would be calculated based on location
        ordinaryIncome: 0.24,
        qualified: 0.15
      }
    },
    goals: {
      monthlyExpenses: 3800, // Default - would come from user profile
      targetCoverage: 1.0,
      stressFreeLiving: 5000
    }
  };
}

/**
 * Convert category totals to expense array format
 */
export function adaptExpenseData(categoryTotals: Record<string, number>) {
  return Object.entries(categoryTotals).map(([name, amount]) => ({
    name: formatCategoryName(name),
    amount
  }));
}

/**
 * Format category names for display
 */
function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}