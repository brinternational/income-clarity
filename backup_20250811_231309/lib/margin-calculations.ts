/**
 * MARGIN CALL PROBABILITY CALCULATOR
 * 
 * Advanced Monte Carlo simulation for calculating margin call probability
 * based on portfolio volatility, margin usage, and market conditions.
 * 
 * Key Features:
 * - Monte Carlo simulation (1000+ iterations)
 * - Normal distribution modeling of returns
 * - Multiple time horizons (30, 60, 90 days)
 * - Safe drawdown calculations
 * - Risk level categorization
 * - Comprehensive recommendations
 */

export interface MarginCallProbabilityRequest {
  portfolioValue: number;
  marginUsed: number;
  maintenanceRequirement: number; // Default 25% (0.25)
  annualVolatility: number; // Default 16% (0.16) - SPY historical
  daysToLookAhead?: number[]; // Default [30, 60, 90]
  iterations?: number; // Default 5000 for accuracy
}

export interface MarginCallProbabilityResponse {
  probability30Days: number;
  probability60Days: number;
  probability90Days: number;
  riskLevel: 'low' | 'moderate' | 'high';
  safeDrawdownPercentage: number;
  safeDrawdownDollars: number;
  recommendations: string[];
  calculationDetails: {
    currentMarginRatio: number;
    liquidationThreshold: number;
    breakEvenPoint: number;
    stressTestScenarios: StressTestScenario[];
  };
}

export interface StressTestScenario {
  name: string;
  marketDrop: number;
  probability: number;
  marginCallTriggered: boolean;
  daysToRecovery: number;
}

/**
 * Calculate margin call probability using Monte Carlo simulation
 */
export function calculateMarginCallProbability(
  request: MarginCallProbabilityRequest
): MarginCallProbabilityResponse {
  // Input validation
  validateInputs(request);
  
  // Set defaults
  const {
    portfolioValue,
    marginUsed,
    maintenanceRequirement = 0.25, // 25% maintenance requirement
    annualVolatility = 0.16, // 16% annual volatility (SPY historical)
    daysToLookAhead = [30, 60, 90],
    iterations = 5000
  } = request;

  // Current margin ratio
  const currentMarginRatio = marginUsed / portfolioValue;
  
  // Calculate liquidation threshold (when equity falls below maintenance requirement)
  // Equity = Portfolio Value - Margin Used
  // Maintenance Requirement = Equity / Portfolio Value
  // So: (Portfolio Value - Margin Used) / Portfolio Value >= Maintenance Requirement
  // Rearranging: Portfolio Value >= Margin Used / (1 - Maintenance Requirement)
  
  // The minimum portfolio value where margin call is triggered
  const liquidationThreshold = marginUsed / (1 - maintenanceRequirement);
  
  // How much the portfolio can drop before margin call (as percentage)
  const liquidationDrawdownPercentage = Math.max(0, (portfolioValue - liquidationThreshold) / portfolioValue);

  // Run Monte Carlo simulations for each time horizon
  const probabilities: { [key: number]: number } = {};
  
  for (const days of daysToLookAhead) {
    probabilities[days] = runMonteCarloSimulation(
      portfolioValue,
      marginUsed,
      liquidationThreshold,
      annualVolatility,
      days,
      iterations
    );
  }

  // Calculate safe drawdown (maximum drop before margin call)
  const safeDrawdownPercentage = Math.max(0, liquidationDrawdownPercentage * 100);
  const safeDrawdownDollars = Math.max(0, portfolioValue - liquidationThreshold);

  // Determine risk level based on highest probability
  const maxProbability = Math.max(...Object.values(probabilities));
  const riskLevel: 'low' | 'moderate' | 'high' = 
    maxProbability < 5 ? 'low' :
    maxProbability < 20 ? 'moderate' : 'high';

  // Generate recommendations
  const recommendations = generateRecommendations(
    currentMarginRatio,
    maxProbability,
    safeDrawdownPercentage,
    riskLevel
  );

  // Run stress test scenarios
  const stressTestScenarios = runStressTestScenarios(
    portfolioValue,
    marginUsed,
    liquidationThreshold
  );

  return {
    probability30Days: probabilities[30] || 0,
    probability60Days: probabilities[60] || 0,
    probability90Days: probabilities[90] || 0,
    riskLevel,
    safeDrawdownPercentage,
    safeDrawdownDollars,
    recommendations,
    calculationDetails: {
      currentMarginRatio: currentMarginRatio * 100,
      liquidationThreshold,
      breakEvenPoint: liquidationDrawdownPercentage * 100,
      stressTestScenarios
    }
  };
}

/**
 * Monte Carlo simulation for margin call probability
 */
function runMonteCarloSimulation(
  portfolioValue: number,
  marginUsed: number,
  liquidationThreshold: number,
  annualVolatility: number,
  days: number,
  iterations: number
): number {
  let marginCallCount = 0;
  
  // Convert annual volatility to period volatility
  // Time scaling: volatility scales with square root of time
  const periodVolatility = annualVolatility * Math.sqrt(days / 365);
  
  // Assume average market return (drift) - historically about 10% annually
  const annualDrift = 0.10;
  const periodDrift = annualDrift * (days / 365);
  
  for (let i = 0; i < iterations; i++) {
    // Generate random return using normal distribution with drift
    // Return = Drift + Random Component
    const randomComponent = generateNormalRandom() * periodVolatility;
    const totalReturn = periodDrift + randomComponent;
    
    // Calculate portfolio value after the return
    const newPortfolioValue = portfolioValue * (1 + totalReturn);
    
    // Check if margin call is triggered
    // Margin call occurs when equity ratio falls below maintenance requirement
    const newEquity = newPortfolioValue - marginUsed;
    const newEquityRatio = newPortfolioValue > 0 ? newEquity / newPortfolioValue : 0;
    
    // Use a buffer slightly above the maintenance requirement to account for volatility
    const maintenanceRequirement = 1 - (marginUsed / liquidationThreshold);
    if (newEquityRatio < maintenanceRequirement || newPortfolioValue <= liquidationThreshold) {
      marginCallCount++;
    }
  }
  
  return (marginCallCount / iterations) * 100; // Return as percentage
}

/**
 * Generate normally distributed random numbers using Box-Muller transformation
 */
function generateNormalRandom(): number {
  // Use Box-Muller transformation to convert uniform random to normal distribution
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Input validation
 */
function validateInputs(request: MarginCallProbabilityRequest): void {
  const { portfolioValue, marginUsed, maintenanceRequirement = 0.25, annualVolatility = 0.16 } = request;
  
  if (portfolioValue <= 0) {
    throw new Error('Portfolio value must be positive');
  }
  
  if (marginUsed < 0) {
    throw new Error('Margin used cannot be negative');
  }
  
  if (marginUsed >= portfolioValue) {
    throw new Error('Margin used cannot exceed portfolio value');
  }
  
  if (maintenanceRequirement <= 0 || maintenanceRequirement >= 1) {
    throw new Error('Maintenance requirement must be between 0 and 1');
  }
  
  if (annualVolatility < 0 || annualVolatility > 2) {
    throw new Error('Annual volatility must be between 0 and 2 (0-200%)');
  }
}

/**
 * Generate actionable recommendations based on risk analysis
 */
function generateRecommendations(
  currentMarginRatio: number,
  maxProbability: number,
  safeDrawdownPercentage: number,
  riskLevel: 'low' | 'moderate' | 'high'
): string[] {
  const recommendations: string[] = [];
  
  // Risk-based recommendations
  if (riskLevel === 'high') {
    recommendations.push('⚠️ HIGH RISK: Consider reducing margin usage immediately');
    recommendations.push(`Current margin call probability exceeds 20% - reduce position size by ${Math.ceil((maxProbability - 15) * 2)}%`);
  } else if (riskLevel === 'moderate') {
    recommendations.push('⚡ MODERATE RISK: Monitor positions closely and consider hedging strategies');
    recommendations.push('Set up automated alerts for portfolio value drops exceeding 10%');
  } else {
    recommendations.push('✅ LOW RISK: Current margin usage appears sustainable');
    if (currentMarginRatio < 20) {
      recommendations.push('Consider gradually increasing margin usage to optimize returns');
    }
  }
  
  // Drawdown-specific recommendations
  if (safeDrawdownPercentage < 10) {
    recommendations.push('🚨 CRITICAL: Less than 10% buffer before margin call - reduce margin immediately');
  } else if (safeDrawdownPercentage < 20) {
    recommendations.push('⚠️ WARNING: Limited downside protection - consider adding cash reserves');
  } else if (safeDrawdownPercentage > 30) {
    recommendations.push('💡 OPPORTUNITY: Strong downside protection allows for potential margin increase');
  }
  
  // Margin ratio recommendations
  if (currentMarginRatio > 50) {
    recommendations.push('📉 OVER-LEVERAGED: Margin usage exceeds 50% - reduce to safer levels');
  } else if (currentMarginRatio > 30) {
    recommendations.push('⚖️ BALANCED: Monitor market conditions closely for position adjustments');
  }
  
  // General risk management
  recommendations.push('📊 Always maintain emergency cash reserves separate from investment accounts');
  recommendations.push('🔄 Consider portfolio diversification to reduce concentration risk');
  
  return recommendations;
}

/**
 * Run historical stress test scenarios
 */
function runStressTestScenarios(
  portfolioValue: number,
  marginUsed: number,
  liquidationThreshold: number
): StressTestScenario[] {
  const scenarios = [
    { name: '2008 Financial Crisis', drop: 37, probability: 2, duration: 547 },
    { name: '2020 COVID Crash', drop: 34, probability: 1, duration: 33 },
    { name: '2022 Bear Market', drop: 24, probability: 5, duration: 282 },
    { name: 'Mild Correction', drop: 15, probability: 15, duration: 90 },
    { name: 'Severe Correction', drop: 30, probability: 3, duration: 200 }
  ];
  
  return scenarios.map(scenario => {
    const newPortfolioValue = portfolioValue * (1 - scenario.drop / 100);
    const marginCallTriggered = newPortfolioValue <= liquidationThreshold;
    
    return {
      name: scenario.name,
      marketDrop: scenario.drop,
      probability: scenario.probability,
      marginCallTriggered,
      daysToRecovery: scenario.duration
    };
  });
}

/**
 * Utility function to calculate safe margin levels
 */
export function calculateSafeMarginLevel(
  portfolioValue: number,
  targetDrawdownBuffer: number = 0.25, // 25% buffer
  maintenanceRequirement: number = 0.25
): number {
  // Calculate maximum safe margin usage with buffer
  const maxSafePortfolioValue = portfolioValue * (1 - targetDrawdownBuffer);
  const maxSafeMarginUsed = maxSafePortfolioValue * (1 - maintenanceRequirement);
  
  return Math.max(0, maxSafeMarginUsed);
}

/**
 * Calculate interest cost and yield requirements
 */
export function calculateMarginCostAnalysis(
  marginUsed: number,
  marginRate: number = 0.055, // 5.5% annual margin rate
  portfolioDividendYield: number = 0.04 // 4% dividend yield
): {
  annualInterestCost: number;
  monthlyInterestCost: number;
  breakEvenYieldRequired: number;
  netYieldAfterCost: number;
  profitabilityRatio: number;
} {
  const annualInterestCost = marginUsed * marginRate;
  const monthlyInterestCost = annualInterestCost / 12;
  
  const annualDividendIncome = marginUsed * portfolioDividendYield;
  const netYieldAfterCost = portfolioDividendYield - marginRate;
  const profitabilityRatio = portfolioDividendYield / marginRate;
  
  return {
    annualInterestCost,
    monthlyInterestCost,
    breakEvenYieldRequired: marginRate,
    netYieldAfterCost,
    profitabilityRatio
  };
}