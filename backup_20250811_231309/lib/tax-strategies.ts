/**
 * Tax Strategy Comparison Engine - TAX-011
 * 
 * THE COMPETITIVE MOAT: Compare 4 investment strategies across all US states + PR
 * Shows which strategy wins based on location's tax laws, especially PR's 0% advantage!
 * 
 * Strategies:
 * 1. Sell SPY Strategy - Capital gains tax on share sales
 * 2. Dividend Income Strategy - Dividend tax on ETFs (SCHD/JEPI)
 * 3. Covered Call Strategy - Ordinary income tax on options
 * 4. 60/40 Portfolio - Mixed taxation balanced portfolio
 */

import { STATE_TAX_RATES, calculateFederalTax, calculateTotalTax } from './state-tax-rates';

export interface StrategyInput {
  portfolioValue: number;
  targetAnnualIncome: number;
  location: string;
  filingStatus: 'single' | 'marriedJoint';
}

export interface StrategyResult {
  strategyName: string;
  strategyType: 'capital_gains' | 'qualified_dividends' | 'ordinary_income' | 'mixed';
  icon: string;
  grossIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  yieldRequired: number;
  isWinner: boolean;
  description: string;
  pros: string[];
  cons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  complexity: 'Simple' | 'Moderate' | 'Complex';
}

export interface ComparisonResult {
  strategies: StrategyResult[];
  winner: StrategyResult;
  locationAdvantage: {
    isPuertoRico: boolean;
    advantage: string;
    description: string;
    savingsVsHighTax: number;
    icon: string;
  };
  summary: {
    bestStrategy: string;
    potentialSavings: number;
    taxEfficiency: number;
  };
}

/**
 * Main function to compare all 4 strategies for given input
 */
export function compareInvestmentStrategies(input: StrategyInput): ComparisonResult {
  const strategies: StrategyResult[] = [
    calculateSellSPYStrategy(input),
    calculateDividendStrategy(input),
    calculateCoveredCallStrategy(input),
    calculate60_40Strategy(input)
  ];

  // Find winner (highest net income)
  const winner = strategies.reduce((best, current) => 
    current.netIncome > best.netIncome ? current : best
  );

  // Mark winner
  strategies.forEach(strategy => {
    strategy.isWinner = strategy.strategyName === winner.strategyName;
  });

  const locationAdvantage = analyzeLocationAdvantage(input.location, input.targetAnnualIncome);
  
  const summary = {
    bestStrategy: winner.strategyName,
    potentialSavings: calculatePotentialSavings(strategies, input.location),
    taxEfficiency: (winner.netIncome / winner.grossIncome) * 100
  };

  return {
    strategies,
    winner,
    locationAdvantage,
    summary
  };
}

/**
 * Strategy 1: Sell SPY Shares for Income (Capital Gains)
 * Sell $X worth of SPY shares annually to generate target income
 */
function calculateSellSPYStrategy(input: StrategyInput): StrategyResult {
  const { targetAnnualIncome, location, filingStatus } = input;
  
  // For capital gains, we need to sell enough to net the target after taxes
  // Use iterative calculation to find gross amount needed
  let grossIncome = targetAnnualIncome;
  let iterations = 0;
  
  while (iterations < 10) {
    const taxInfo = calculateCapitalGainsTax(grossIncome, location, filingStatus);
    const netIncome = grossIncome - taxInfo.total;
    
    if (Math.abs(netIncome - targetAnnualIncome) < 100) break;
    
    // Adjust gross income based on shortfall
    const adjustment = (targetAnnualIncome - netIncome) / (1 - taxInfo.effectiveRate);
    grossIncome += adjustment;
    iterations++;
  }

  const finalTaxInfo = calculateCapitalGainsTax(grossIncome, location, filingStatus);
  
  return {
    strategyName: 'Sell SPY Strategy',
    strategyType: 'capital_gains',
    icon: '📈',
    grossIncome,
    federalTax: finalTaxInfo.federal,
    stateTax: finalTaxInfo.state,
    totalTax: finalTaxInfo.total,
    netIncome: grossIncome - finalTaxInfo.total,
    effectiveRate: finalTaxInfo.effectiveRate,
    yieldRequired: (grossIncome / input.portfolioValue) * 100,
    isWinner: false,
    description: 'Sell SPY shares annually for income',
    pros: [
      'Flexible timing',
      'Lower tax rates than ordinary income',
      'Can offset with losses'
    ],
    cons: [
      'Depletes principal over time',
      'Market timing risk',
      'Transaction costs'
    ],
    riskLevel: 'Medium',
    complexity: 'Simple'
  };
}

/**
 * Strategy 2: Dividend Income Strategy (Qualified Dividends)
 * Hold dividend-paying ETFs like SCHD, JEPI for steady income
 */
function calculateDividendStrategy(input: StrategyInput): StrategyResult {
  const { targetAnnualIncome, location, filingStatus } = input;
  
  const taxInfo = calculateTotalTax(targetAnnualIncome, location, 'qualified', filingStatus);
  const netIncome = targetAnnualIncome - taxInfo.total;
  
  return {
    strategyName: 'Dividend Income Strategy',
    strategyType: 'qualified_dividends',
    icon: '💰',
    grossIncome: targetAnnualIncome,
    federalTax: taxInfo.federal,
    stateTax: taxInfo.state,
    totalTax: taxInfo.total,
    netIncome,
    effectiveRate: taxInfo.effectiveRate,
    yieldRequired: (targetAnnualIncome / input.portfolioValue) * 100,
    isWinner: false,
    description: 'Hold dividend ETFs (SCHD, JEPI, VYM)',
    pros: [
      'Predictable income stream',
      'Principal preservation',
      'Qualified dividend tax rates',
      'Compound growth potential'
    ],
    cons: [
      'Dividend cuts possible',
      'Limited growth potential',
      'Concentration risk'
    ],
    riskLevel: 'Low',
    complexity: 'Simple'
  };
}

/**
 * Strategy 3: Covered Call Strategy (Ordinary Income)
 * Sell covered calls on holdings for premium income
 */
function calculateCoveredCallStrategy(input: StrategyInput): StrategyResult {
  const { targetAnnualIncome, location, filingStatus } = input;
  
  // Covered calls are taxed as ordinary income
  const taxInfo = calculateTotalTax(targetAnnualIncome, location, 'ordinary', filingStatus);
  const netIncome = targetAnnualIncome - taxInfo.total;
  
  return {
    strategyName: 'Covered Call Strategy',
    strategyType: 'ordinary_income',
    icon: '📊',
    grossIncome: targetAnnualIncome,
    federalTax: taxInfo.federal,
    stateTax: taxInfo.state,
    totalTax: taxInfo.total,
    netIncome,
    effectiveRate: taxInfo.effectiveRate,
    yieldRequired: (targetAnnualIncome / input.portfolioValue) * 100,
    isWinner: false,
    description: 'Sell covered calls on stock holdings',
    pros: [
      'Generate income on existing holdings',
      'Monthly premium collection',
      'Downside protection'
    ],
    cons: [
      'Caps upside potential',
      'Ordinary income tax rates',
      'Complex execution',
      'Assignment risk'
    ],
    riskLevel: 'Medium',
    complexity: 'Complex'
  };
}

/**
 * Strategy 4: 60/40 Portfolio (Mixed Taxation)
 * Traditional balanced portfolio with stocks and bonds
 */
function calculate60_40Strategy(input: StrategyInput): StrategyResult {
  const { targetAnnualIncome, location, filingStatus } = input;
  
  // Assume 70% qualified dividends, 30% ordinary income (bonds/REITs)
  const qualifiedPortion = targetAnnualIncome * 0.7;
  const ordinaryPortion = targetAnnualIncome * 0.3;
  
  const qualifiedTax = calculateTotalTax(qualifiedPortion, location, 'qualified', filingStatus);
  const ordinaryTax = calculateTotalTax(ordinaryPortion, location, 'ordinary', filingStatus);
  
  const totalFederalTax = qualifiedTax.federal + ordinaryTax.federal;
  const totalStateTax = qualifiedTax.state + ordinaryTax.state;
  const totalTax = totalFederalTax + totalStateTax;
  const netIncome = targetAnnualIncome - totalTax;
  const effectiveRate = totalTax / targetAnnualIncome;
  
  return {
    strategyName: '60/40 Portfolio',
    strategyType: 'mixed',
    icon: '⚖️',
    grossIncome: targetAnnualIncome,
    federalTax: totalFederalTax,
    stateTax: totalStateTax,
    totalTax,
    netIncome,
    effectiveRate,
    yieldRequired: (targetAnnualIncome / input.portfolioValue) * 100,
    isWinner: false,
    description: '60% stocks, 40% bonds traditional portfolio',
    pros: [
      'Diversification',
      'Lower volatility',
      'Time-tested approach',
      'Rebalancing opportunities'
    ],
    cons: [
      'Mixed tax treatment',
      'Lower expected returns',
      'Bond duration risk',
      'Inflation risk'
    ],
    riskLevel: 'Low',
    complexity: 'Moderate'
  };
}

/**
 * Calculate capital gains tax (different from dividend tax)
 */
function calculateCapitalGainsTax(
  income: number,
  stateCode: string,
  filingStatus: 'single' | 'marriedJoint'
): {
  federal: number;
  state: number;
  total: number;
  effectiveRate: number;
} {
  // Capital gains use same rates as qualified dividends federally
  const federal = calculateFederalTax(income, 'qualified', filingStatus);
  
  // State capital gains rates often match dividend rates
  const stateInfo = STATE_TAX_RATES[stateCode.toUpperCase()];
  const state = stateInfo ? income * stateInfo.rate : 0;
  
  const total = federal + state;
  
  return {
    federal,
    state,
    total,
    effectiveRate: income > 0 ? total / income : 0
  };
}

/**
 * Analyze location advantage with focus on Puerto Rico
 */
function analyzeLocationAdvantage(location: string, annualIncome: number) {
  const locationCode = location.toUpperCase();
  const isPuertoRico = locationCode === 'PR' || location.toLowerCase().includes('puerto rico');
  
  if (isPuertoRico) {
    // Calculate savings vs high-tax states
    const californiaTax = calculateTotalTax(annualIncome, 'CA', 'qualified');
    const puertoRicoTax = calculateTotalTax(annualIncome, 'PR', 'qualified');
    const savingsVsHighTax = californiaTax.total - puertoRicoTax.total;
    
    return {
      isPuertoRico: true,
      advantage: 'Maximum Tax Advantage',
      description: '0% tax on qualified dividends under Act 60',
      savingsVsHighTax,
      icon: '🏝️'
    };
  }
  
  // Check if it's a no-tax state
  const noTaxStates = ['TX', 'FL', 'NV', 'TN', 'NH', 'SD', 'WY', 'AK', 'WA'];
  if (noTaxStates.includes(locationCode)) {
    const californiaTax = calculateTotalTax(annualIncome, 'CA', 'qualified');
    const currentTax = calculateTotalTax(annualIncome, locationCode, 'qualified');
    const savingsVsHighTax = californiaTax.total - currentTax.total;
    
    return {
      isPuertoRico: false,
      advantage: 'No State Tax',
      description: 'Only federal taxes apply',
      savingsVsHighTax,
      icon: '🏠'
    };
  }
  
  // High tax states
  const highTaxStates = ['CA', 'NY', 'NJ', 'CT', 'HI'];
  if (highTaxStates.includes(locationCode)) {
    const puertoRicoTax = calculateTotalTax(annualIncome, 'PR', 'qualified');
    const currentTax = calculateTotalTax(annualIncome, locationCode, 'qualified');
    const savingsVsHighTax = currentTax.total - puertoRicoTax.total;
    
    return {
      isPuertoRico: false,
      advantage: 'High Tax Burden',
      description: `Move to PR and save $${Math.round(savingsVsHighTax).toLocaleString()}/year!`,
      savingsVsHighTax,
      icon: '💸'
    };
  }
  
  // Medium tax states
  const puertoRicoTax = calculateTotalTax(annualIncome, 'PR', 'qualified');
  const currentTax = calculateTotalTax(annualIncome, locationCode, 'qualified');
  const savingsVsHighTax = currentTax.total - puertoRicoTax.total;
  
  return {
    isPuertoRico: false,
    advantage: 'Moderate Tax Burden',
    description: 'Room for optimization with relocation',
    savingsVsHighTax,
    icon: '📍'
  };
}

/**
 * Calculate potential savings by moving to Puerto Rico
 */
function calculatePotentialSavings(strategies: StrategyResult[], currentLocation: string): number {
  const currentLocationCode = currentLocation.toUpperCase();
  
  if (currentLocationCode === 'PR') return 0;
  
  // Find the winning strategy's tax burden
  const winner = strategies.find(s => s.isWinner);
  if (!winner) return 0;
  
  // Calculate what the same strategy would cost in PR (0% on qualified dividends)
  let prTax = 0;
  
  switch (winner.strategyType) {
    case 'qualified_dividends':
      prTax = calculateFederalTax(winner.grossIncome, 'qualified'); // Only federal in PR
      break;
    case 'capital_gains':
      prTax = calculateFederalTax(winner.grossIncome, 'qualified'); // Same as qualified
      break;
    case 'ordinary_income':
      prTax = calculateFederalTax(winner.grossIncome, 'ordinary'); // Still ordinary income
      break;
    case 'mixed':
      // 70% qualified (PR = 0% state), 30% ordinary
      const qualifiedPortion = winner.grossIncome * 0.7;
      const ordinaryPortion = winner.grossIncome * 0.3;
      prTax = calculateFederalTax(qualifiedPortion, 'qualified') + 
              calculateFederalTax(ordinaryPortion, 'ordinary');
      break;
  }
  
  return winner.totalTax - prTax;
}

/**
 * Get recommended portfolio allocation for each strategy
 */
export function getStrategyAllocation(strategyType: StrategyResult['strategyType']): {
  description: string;
  allocations: Array<{ asset: string; percentage: number; ticker: string }>;
} {
  switch (strategyType) {
    case 'capital_gains':
      return {
        description: 'Growth-focused ETF for capital appreciation',
        allocations: [
          { asset: 'S&P 500 ETF', percentage: 100, ticker: 'SPY' }
        ]
      };
    
    case 'qualified_dividends':
      return {
        description: 'High-quality dividend ETFs',
        allocations: [
          { asset: 'Dividend Aristocrats', percentage: 40, ticker: 'SCHD' },
          { asset: 'Equity Premium Income', percentage: 30, ticker: 'JEPI' },
          { asset: 'High Dividend Yield', percentage: 30, ticker: 'VYM' }
        ]
      };
    
    case 'ordinary_income':
      return {
        description: 'Blue-chip stocks for covered calls',
        allocations: [
          { asset: 'S&P 500 ETF', percentage: 50, ticker: 'SPY' },
          { asset: 'Tech Stocks', percentage: 30, ticker: 'QQQ' },
          { asset: 'Individual Stocks', percentage: 20, ticker: 'AAPL, MSFT' }
        ]
      };
    
    case 'mixed':
      return {
        description: 'Balanced stock and bond allocation',
        allocations: [
          { asset: 'Total Stock Market', percentage: 60, ticker: 'VTI' },
          { asset: 'Total Bond Market', percentage: 40, ticker: 'BND' }
        ]
      };
    
    default:
      return {
        description: 'Diversified portfolio',
        allocations: [
          { asset: 'Mixed Assets', percentage: 100, ticker: 'Various' }
        ]
      };
  }
}

/**
 * Get color scheme for strategy visualization
 */
export function getStrategyColors(strategyType: StrategyResult['strategyType']): {
  bg: string;
  border: string;
  text: string;
  accent: string;
} {
  switch (strategyType) {
    case 'capital_gains':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        accent: 'text-blue-600'
      };
    
    case 'qualified_dividends':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        accent: 'text-green-600'
      };
    
    case 'ordinary_income':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        accent: 'text-orange-600'
      };
    
    case 'mixed':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        accent: 'text-purple-600'
      };
    
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        accent: 'text-gray-600'
      };
  }
}