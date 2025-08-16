'use client';

/**
 * Advanced Scenario Calculation Utilities
 * Handles complex financial projections with tax optimization and location analysis
 */

interface LocationTaxData {
  name: string;
  stateTaxRate: number;
  qualifiedDividendTax: number;
  capitalGainsTax: number;
  isOptimized: boolean;
  benefits?: string[];
}

interface TaxCalculationResult {
  federalTax: number;
  stateTax: number;
  totalTax: number;
  effectiveRate: number;
  taxSavings?: number;
}

interface ScenarioProjection {
  year: number;
  age: number;
  portfolioValue: number;
  dividendIncome: number;
  capitalGains: number;
  totalTaxes: number;
  netIncome: number;
  expenseCoverage: number;
  netWorth: number;
  realPurchasingPower: number;
}

/**
 * Enhanced tax calculation with location optimization
 */
export function calculateTaxes(
  dividendIncome: number,
  capitalGains: number,
  location: string,
  taxStrategy: 'standard' | 'optimized' | 'aggressive' = 'standard'
): TaxCalculationResult {
  // Federal tax rates
  const federalDividendRate = 0.15; // Qualified dividend rate
  const federalCapitalGainsRate = 0.15;
  
  // Get location-specific tax data
  const locationData = getLocationTaxData(location);
  
  // Calculate base taxes
  let federalDividendTax = dividendIncome * federalDividendRate;
  let federalCapitalGainsTax = capitalGains * federalCapitalGainsRate;
  let stateDividendTax = dividendIncome * locationData.qualifiedDividendTax;
  let stateCapitalGainsTax = capitalGains * locationData.capitalGainsTax;
  
  // Apply tax strategy optimizations
  const optimizationFactor = getOptimizationFactor(taxStrategy);
  
  if (taxStrategy === 'optimized' || taxStrategy === 'aggressive') {
    // Tax-loss harvesting can reduce capital gains by up to 20%
    federalCapitalGainsTax *= (1 - optimizationFactor.capitalGainsReduction);
    stateCapitalGainsTax *= (1 - optimizationFactor.capitalGainsReduction);
    
    // Asset location optimization can reduce taxes by 5-10%
    federalDividendTax *= (1 - optimizationFactor.dividendReduction);
    stateDividendTax *= (1 - optimizationFactor.dividendReduction);
  }
  
  const federalTax = federalDividendTax + federalCapitalGainsTax;
  const stateTax = stateDividendTax + stateCapitalGainsTax;
  const totalTax = federalTax + stateTax;
  const totalIncome = dividendIncome + capitalGains;
  const effectiveRate = totalIncome > 0 ? totalTax / totalIncome : 0;
  
  return {
    federalTax,
    stateTax,
    totalTax,
    effectiveRate,
    taxSavings: calculateTaxSavings(dividendIncome + capitalGains, location, 'California')
  };
}

/**
 * Get tax optimization factors based on strategy
 */
function getOptimizationFactor(strategy: 'standard' | 'optimized' | 'aggressive') {
  switch (strategy) {
    case 'standard':
      return { capitalGainsReduction: 0, dividendReduction: 0 };
    case 'optimized':
      return { capitalGainsReduction: 0.15, dividendReduction: 0.08 };
    case 'aggressive':
      return { capitalGainsReduction: 0.25, dividendReduction: 0.12 };
    default:
      return { capitalGainsReduction: 0, dividendReduction: 0 };
  }
}

/**
 * Calculate tax savings from location optimization
 */
function calculateTaxSavings(
  totalIncome: number, 
  currentLocation: string, 
  compareLocation: string = 'California'
): number {
  const currentTaxData = getLocationTaxData(currentLocation);
  const compareTaxData = getLocationTaxData(compareLocation);
  
  const currentTax = totalIncome * (currentTaxData.qualifiedDividendTax + currentTaxData.capitalGainsTax);
  const compareTax = totalIncome * (compareTaxData.qualifiedDividendTax + compareTaxData.capitalGainsTax);
  
  return Math.max(0, compareTax - currentTax);
}

/**
 * Get location-specific tax data
 */
function getLocationTaxData(location: string): LocationTaxData {
  const taxData: Record<string, LocationTaxData> = {
    'California': {
      name: 'California',
      stateTaxRate: 0.133,
      qualifiedDividendTax: 0.133,
      capitalGainsTax: 0.133,
      isOptimized: false
    },
    'New York': {
      name: 'New York',
      stateTaxRate: 0.109,
      qualifiedDividendTax: 0.0,
      capitalGainsTax: 0.109,
      isOptimized: false
    },
    'Texas': {
      name: 'Texas',
      stateTaxRate: 0.0,
      qualifiedDividendTax: 0.0,
      capitalGainsTax: 0.0,
      isOptimized: true,
      benefits: ['No state income tax', 'No tax on dividends or capital gains']
    },
    'Florida': {
      name: 'Florida',
      stateTaxRate: 0.0,
      qualifiedDividendTax: 0.0,
      capitalGainsTax: 0.0,
      isOptimized: true,
      benefits: ['No state income tax', 'No tax on dividends or capital gains']
    },
    'Puerto Rico': {
      name: 'Puerto Rico',
      stateTaxRate: 0.0,
      qualifiedDividendTax: 0.0,
      capitalGainsTax: 0.0,
      isOptimized: true,
      benefits: [
        'Act 60: 0% tax on dividends and capital gains',
        'Act 22: Individual investors tax incentives',
        'Significant federal tax benefits',
        'Potential 70%+ tax savings vs California'
      ]
    },
    'Nevada': {
      name: 'Nevada',
      stateTaxRate: 0.0,
      qualifiedDividendTax: 0.0,
      capitalGainsTax: 0.0,
      isOptimized: true,
      benefits: ['No state income tax', 'Business-friendly environment']
    },
    'Washington': {
      name: 'Washington',
      stateTaxRate: 0.0,
      qualifiedDividendTax: 0.0,
      capitalGainsTax: 0.0,
      isOptimized: true,
      benefits: ['No state income tax (on most income)', 'Tech industry hub']
    }
  };
  
  return taxData[location] || taxData['California'];
}

/**
 * Project scenario with advanced dividend modeling
 */
export function projectAdvancedScenario(
  initialPortfolioValue: number,
  monthlyContribution: number,
  dividendGrowthRate: number,
  portfolioReturnRate: number,
  dividendCutProbability: number,
  location: string,
  taxStrategy: 'standard' | 'optimized' | 'aggressive',
  timeHorizon: number,
  expenseInflation: number = 3,
  monthlyExpenses: number = 4000
): ScenarioProjection[] {
  const projections: ScenarioProjection[] = [];
  let portfolioValue = initialPortfolioValue;
  let currentExpenses = monthlyExpenses * 12;
  
  for (let year = 0; year < timeHorizon; year++) {
    const age = 30 + year; // Assume starting age of 30
    
    // Calculate dividend income (assume 4% base yield)
    const baseDividendYield = 0.04;
    const adjustedYield = baseDividendYield * Math.pow(1 + dividendGrowthRate / 100, year);
    let dividendIncome = portfolioValue * adjustedYield;
    
    // Apply dividend cuts based on probability
    const cutChance = Math.random() * 100;
    if (cutChance < dividendCutProbability) {
      dividendIncome *= 0.7; // 30% cut
    }
    
    // Calculate capital gains (assume 2% of portfolio value realized annually)
    const capitalGains = portfolioValue * 0.02;
    
    // Calculate taxes
    const taxResult = calculateTaxes(dividendIncome, capitalGains, location, taxStrategy);
    
    // Portfolio growth
    const portfolioGrowth = portfolioValue * (portfolioReturnRate / 100);
    const annualContribution = monthlyContribution * 12;
    portfolioValue += portfolioGrowth + annualContribution;
    
    // Calculate net income after taxes
    const grossIncome = dividendIncome + capitalGains;
    const netIncome = grossIncome - taxResult.totalTax;
    
    // Update expenses with inflation
    currentExpenses *= (1 + expenseInflation / 100);
    
    // Calculate expense coverage
    const expenseCoverage = (netIncome / currentExpenses) * 100;
    
    // Calculate real purchasing power
    const inflationAdjustment = Math.pow(1 + expenseInflation / 100, year);
    const realPurchasingPower = portfolioValue / inflationAdjustment;
    
    projections.push({
      year,
      age,
      portfolioValue,
      dividendIncome,
      capitalGains,
      totalTaxes: taxResult.totalTax,
      netIncome,
      expenseCoverage,
      netWorth: portfolioValue,
      realPurchasingPower
    });
  }
  
  return projections;
}

/**
 * Analyze location optimization opportunities
 */
export function analyzeLocationOptimization(
  currentLocation: string,
  portfolioValue: number,
  annualDividendIncome: number
): {
  currentTaxBurden: TaxCalculationResult;
  recommendations: {
    location: string;
    annualSavings: number;
    tenYearSavings: number;
    benefits: string[];
    movingConsiderations: string[];
  }[];
} {
  const currentTaxBurden = calculateTaxes(
    annualDividendIncome,
    portfolioValue * 0.02, // Assume 2% capital gains
    currentLocation
  );
  
  const optimalLocations = ['Puerto Rico', 'Texas', 'Florida', 'Nevada', 'Washington'];
  
  const recommendations = optimalLocations
    .filter(loc => loc !== currentLocation)
    .map(location => {
      const locationData = getLocationTaxData(location);
      const projectedTax = calculateTaxes(
        annualDividendIncome,
        portfolioValue * 0.02,
        location
      );
      
      const annualSavings = currentTaxBurden.totalTax - projectedTax.totalTax;
      const tenYearSavings = annualSavings * 10;
      
      // Location-specific considerations
      const movingConsiderations = getMovingConsiderations(location);
      
      return {
        location,
        annualSavings,
        tenYearSavings,
        benefits: locationData.benefits || [],
        movingConsiderations
      };
    })
    .filter(rec => rec.annualSavings > 0)
    .sort((a, b) => b.annualSavings - a.annualSavings);
  
  return {
    currentTaxBurden,
    recommendations
  };
}

/**
 * Get location-specific moving considerations
 */
function getMovingConsiderations(location: string): string[] {
  const considerations: Record<string, string[]> = {
    'Puerto Rico': [
      'Must establish bona fide residence',
      'Minimum 183 days per year residency required',
      'One-time $5,000 donation to Puerto Rico',
      'Annual $10,000 charitable contribution',
      'Different culture and language',
      'Hurricane season considerations'
    ],
    'Texas': [
      'No state income tax',
      'Higher property taxes',
      'Hot climate',
      'Business-friendly environment',
      'Major metropolitan areas available'
    ],
    'Florida': [
      'No state income tax',
      'Hurricane risk',
      'High humidity climate',
      'Large retiree community',
      'No estate tax'
    ],
    'Nevada': [
      'No state income tax',
      'Desert climate',
      'Gaming industry presence',
      'Growing tech sector',
      'Water scarcity concerns'
    ],
    'Washington': [
      'No state income tax on most income',
      'Rainy climate',
      'High cost of living in Seattle area',
      'Strong tech industry',
      'No estate tax'
    ]
  };
  
  return considerations[location] || [];
}

/**
 * Calculate FIRE timeline with different scenarios
 */
export function calculateFIRETimeline(
  currentAge: number,
  currentNetWorth: number,
  monthlyContribution: number,
  annualExpenses: number,
  portfolioReturnRate: number,
  withdrawalRate: number = 0.04
): {
  fireAge: number;
  yearsToFire: number;
  targetNetWorth: number;
  totalContributions: number;
  totalGrowth: number;
} {
  const targetNetWorth = annualExpenses / withdrawalRate;
  let netWorth = currentNetWorth;
  let year = 0;
  let totalContributions = 0;
  
  while (netWorth < targetNetWorth && year < 50) { // Max 50 years
    const annualContribution = monthlyContribution * 12;
    const growth = netWorth * (portfolioReturnRate / 100);
    
    netWorth += growth + annualContribution;
    totalContributions += annualContribution;
    year++;
  }
  
  const fireAge = currentAge + year;
  const totalGrowth = netWorth - currentNetWorth - totalContributions;
  
  return {
    fireAge,
    yearsToFire: year,
    targetNetWorth,
    totalContributions,
    totalGrowth
  };
}

/**
 * Analyze contribution impact on FIRE timeline
 */
export function analyzeContributionImpact(
  baseScenario: ReturnType<typeof calculateFIRETimeline>,
  currentContribution: number,
  testContributions: number[] = [500, 750, 1000, 1500, 2000, 3000]
): {
  contribution: number;
  yearsToFire: number;
  timeSaved: number;
  costPerYearSaved: number;
}[] {
  return testContributions.map(contribution => {
    const scenario = calculateFIRETimeline(
      30, // Assume age 30
      50000, // Assume $50k starting
      contribution,
      48000, // Assume $4k monthly expenses
      7 // 7% return
    );
    
    const timeSaved = baseScenario.yearsToFire - scenario.yearsToFire;
    const additionalContribution = (contribution - currentContribution) * 12;
    const costPerYearSaved = timeSaved > 0 ? additionalContribution / timeSaved : Infinity;
    
    return {
      contribution,
      yearsToFire: scenario.yearsToFire,
      timeSaved,
      costPerYearSaved
    };
  });
}

/**
 * Generate scenario insights based on projections
 */
export function generateScenarioInsights(
  projections: ScenarioProjection[],
  location: string
): {
  type: 'success' | 'warning' | 'info' | 'optimization';
  title: string;
  message: string;
  impact: number;
  actionable: boolean;
}[] {
  const insights: any[] = [];
  const finalProjection = projections[projections.length - 1];
  const firstProjection = projections[0];
  
  // Tax optimization insight
  if (location !== 'Puerto Rico' && finalProjection.totalTaxes > 50000) {
    insights.push({
      type: 'optimization',
      title: 'Significant Tax Optimization Opportunity',
      message: `Moving to Puerto Rico could save approximately $${Math.round(finalProjection.totalTaxes * 0.7).toLocaleString()} in taxes over the projection period`,
      impact: finalProjection.totalTaxes * 0.7,
      actionable: true
    });
  }
  
  // Expense coverage milestone
  const coverageAchieved = projections.find(p => p.expenseCoverage >= 100);
  if (coverageAchieved) {
    insights.push({
      type: 'success',
      title: 'Financial Independence Milestone',
      message: `You achieve 100% expense coverage through dividends in year ${coverageAchieved.year + 1} at age ${coverageAchieved.age}`,
      impact: 0,
      actionable: false
    });
  }
  
  // Early warning for low coverage
  if (finalProjection.expenseCoverage < 50) {
    insights.push({
      type: 'warning',
      title: 'Low Dividend Coverage',
      message: `Final dividend coverage is only ${finalProjection.expenseCoverage.toFixed(0)}%. Consider increasing contributions or reducing expenses`,
      impact: -finalProjection.netWorth * 0.3,
      actionable: true
    });
  }
  
  // Portfolio growth insight
  const totalGrowth = finalProjection.portfolioValue - firstProjection.portfolioValue;
  const annualizedReturn = Math.pow(finalProjection.portfolioValue / firstProjection.portfolioValue, 1 / projections.length) - 1;
  
  if (annualizedReturn > 0.08) {
    insights.push({
      type: 'success',
      title: 'Strong Portfolio Growth',
      message: `Your portfolio achieves an annualized return of ${(annualizedReturn * 100).toFixed(1)}%, exceeding typical market returns`,
      impact: totalGrowth * 0.2,
      actionable: false
    });
  }
  
  return insights;
}