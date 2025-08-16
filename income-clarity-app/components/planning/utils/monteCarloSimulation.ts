'use client';

/**
 * Monte Carlo Simulation Utilities for What-If Scenarios
 * Provides probabilistic analysis of financial scenarios with randomized variables
 */

interface SimulationInputs {
  portfolioReturnRate: number;
  dividendGrowthRate: number;
  expenseInflation: number;
  marketVolatility: 'low' | 'medium' | 'high';
  timeHorizon: number;
  initialNetWorth: number;
  monthlyContribution: number;
}

interface SimulationResult {
  finalNetWorth: number;
  dividendIncome: number;
  totalReturn: number;
  worstYear: number;
  bestYear: number;
  volatilityExperienced: number;
}

interface MonteCarloResults {
  percentile5: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile95: number;
  successRate: number;
  averageReturn: number;
  standardDeviation: number;
  confidenceIntervals: {
    low90: number[];
    high90: number[];
    low95: number[];
    high95: number[];
  };
  probabilityOfLoss: number;
  worstCase: SimulationResult;
  bestCase: SimulationResult;
}

/**
 * Generate random return based on market volatility
 */
function generateRandomReturn(baseReturn: number, volatility: 'low' | 'medium' | 'high'): number {
  const volatilityMap = {
    low: 0.08,    // 8% standard deviation
    medium: 0.15, // 15% standard deviation  
    high: 0.25    // 25% standard deviation
  };
  
  const stdDev = volatilityMap[volatility];
  
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  return baseReturn + (z0 * stdDev);
}

/**
 * Simulate market crash with recovery pattern
 */
function simulateMarketCrash(year: number, crashProbability: number = 0.15): number {
  const crashChance = Math.random();
  
  if (crashChance < crashProbability) {
    // Market crash: -20% to -50%
    return -0.2 - (Math.random() * 0.3);
  }
  
  return 0; // No crash
}

/**
 * Run single simulation iteration
 */
function runSingleSimulation(inputs: SimulationInputs): SimulationResult {
  let netWorth = inputs.initialNetWorth;
  let worstYear = 0;
  let bestYear = 0;
  let worstReturn = Infinity;
  let bestReturn = -Infinity;
  let volatilitySum = 0;
  
  const yearlyReturns: number[] = [];
  
  for (let year = 0; year < inputs.timeHorizon; year++) {
    // Generate random market return
    let marketReturn = generateRandomReturn(inputs.portfolioReturnRate / 100, inputs.marketVolatility);
    
    // Check for market crash (15% probability per year)
    const crashReturn = simulateMarketCrash(year, 0.02); // 2% annual crash probability
    if (crashReturn < 0) {
      marketReturn = crashReturn;
    }
    
    // Apply return to portfolio
    const portfolioGrowth = netWorth * marketReturn;
    
    // Add monthly contributions with dividend growth
    const annualContribution = inputs.monthlyContribution * 12;
    const dividendGrowthMultiplier = Math.pow(1 + inputs.dividendGrowthRate / 100, year);
    const adjustedContribution = annualContribution * dividendGrowthMultiplier;
    
    // Update net worth
    netWorth += portfolioGrowth + adjustedContribution;
    
    // Track performance
    yearlyReturns.push(marketReturn);
    volatilitySum += Math.abs(marketReturn);
    
    if (marketReturn < worstReturn) {
      worstReturn = marketReturn;
      worstYear = year;
    }
    
    if (marketReturn > bestReturn) {
      bestReturn = marketReturn;
      bestYear = year;
    }
  }
  
  // Calculate dividend income at end (4% rule)
  const finalDividendIncome = netWorth * 0.04;
  
  // Calculate total return
  const totalInvested = inputs.initialNetWorth + (inputs.monthlyContribution * 12 * inputs.timeHorizon);
  const totalReturn = (netWorth - totalInvested) / totalInvested;
  
  return {
    finalNetWorth: Math.max(0, netWorth), // Can't go below 0
    dividendIncome: finalDividendIncome,
    totalReturn,
    worstYear,
    bestYear,
    volatilityExperienced: volatilitySum / inputs.timeHorizon
  };
}

/**
 * Run full Monte Carlo simulation
 */
export function runMonteCarloSimulation(
  inputs: SimulationInputs, 
  iterations: number = 1000,
  fireTarget: number = 1000000
): MonteCarloResults {
  const results: SimulationResult[] = [];
  
  // Run simulations
  for (let i = 0; i < iterations; i++) {
    results.push(runSingleSimulation(inputs));
  }
  
  // Sort results by final net worth
  const sortedNetWorth = results
    .map(r => r.finalNetWorth)
    .sort((a, b) => a - b);
  
  // Calculate percentiles
  const percentile5 = sortedNetWorth[Math.floor(iterations * 0.05)];
  const percentile25 = sortedNetWorth[Math.floor(iterations * 0.25)];
  const percentile50 = sortedNetWorth[Math.floor(iterations * 0.50)];
  const percentile75 = sortedNetWorth[Math.floor(iterations * 0.75)];
  const percentile95 = sortedNetWorth[Math.floor(iterations * 0.95)];
  
  // Calculate success rate (reaching FIRE target)
  const successfulRuns = results.filter(r => r.finalNetWorth >= fireTarget).length;
  const successRate = (successfulRuns / iterations) * 100;
  
  // Calculate statistics
  const averageNetWorth = sortedNetWorth.reduce((sum, val) => sum + val, 0) / iterations;
  const variance = sortedNetWorth.reduce((sum, val) => sum + Math.pow(val - averageNetWorth, 2), 0) / iterations;
  const standardDeviation = Math.sqrt(variance);
  
  // Calculate average return
  const averageReturn = results.reduce((sum, r) => sum + r.totalReturn, 0) / iterations;
  
  // Calculate probability of loss
  const lossRuns = results.filter(r => r.totalReturn < 0).length;
  const probabilityOfLoss = (lossRuns / iterations) * 100;
  
  // Find best and worst cases
  const worstCase = results.reduce((worst, current) => 
    current.finalNetWorth < worst.finalNetWorth ? current : worst
  );
  const bestCase = results.reduce((best, current) => 
    current.finalNetWorth > best.finalNetWorth ? current : best
  );
  
  // Calculate confidence intervals
  const low90Index = Math.floor(iterations * 0.05);
  const high90Index = Math.floor(iterations * 0.95);
  const low95Index = Math.floor(iterations * 0.025);
  const high95Index = Math.floor(iterations * 0.975);
  
  return {
    percentile5,
    percentile25,
    percentile50,
    percentile75,
    percentile95,
    successRate,
    averageReturn,
    standardDeviation,
    confidenceIntervals: {
      low90: sortedNetWorth.slice(0, low90Index),
      high90: sortedNetWorth.slice(high90Index),
      low95: sortedNetWorth.slice(0, low95Index),
      high95: sortedNetWorth.slice(high95Index)
    },
    probabilityOfLoss,
    worstCase,
    bestCase
  };
}

/**
 * Calculate scenario sensitivity analysis
 */
export function runSensitivityAnalysis(
  baseInputs: SimulationInputs,
  variableToTest: keyof SimulationInputs,
  testRange: number[] = [-20, -10, -5, 5, 10, 20], // Percentage changes
  iterations: number = 500
): { change: number; result: MonteCarloResults }[] {
  const results: { change: number; result: MonteCarloResults }[] = [];
  
  for (const change of testRange) {
    const modifiedInputs = { ...baseInputs };
    
    // Apply percentage change to the variable
    if (typeof modifiedInputs[variableToTest] === 'number') {
      const originalValue = modifiedInputs[variableToTest] as number;
      (modifiedInputs as any)[variableToTest] = originalValue * (1 + change / 100);
    }
    
    const result = runMonteCarloSimulation(modifiedInputs, iterations);
    results.push({ change, result });
  }
  
  return results;
}

/**
 * Generate risk assessment based on simulation results
 */
export function assessRisk(results: MonteCarloResults, inputs: SimulationInputs): {
  riskScore: number; // 0-100 (higher = riskier)
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  riskFactors: string[];
  recommendations: string[];
} {
  let riskScore = 0;
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  
  // Factor 1: Probability of loss
  riskScore += results.probabilityOfLoss * 0.5; // 0-50 points
  if (results.probabilityOfLoss > 10) {
    riskFactors.push(`${results.probabilityOfLoss.toFixed(1)}% chance of losses`);
    recommendations.push('Consider more conservative investments');
  }
  
  // Factor 2: Volatility
  const volatilityMultiplier = inputs.marketVolatility === 'high' ? 20 : inputs.marketVolatility === 'medium' ? 10 : 5;
  riskScore += volatilityMultiplier; // 5-20 points
  if (inputs.marketVolatility === 'high') {
    riskFactors.push('High market volatility selected');
    recommendations.push('Consider reducing volatility through diversification');
  }
  
  // Factor 3: Success rate
  if (results.successRate < 70) {
    riskScore += (70 - results.successRate) * 0.3; // 0-21 points
    riskFactors.push(`Only ${results.successRate.toFixed(1)}% chance of reaching FIRE goal`);
    recommendations.push('Increase contributions or extend timeline');
  }
  
  // Factor 4: Worst case scenario
  const worstCaseReturn = results.worstCase.totalReturn;
  if (worstCaseReturn < -0.5) {
    riskScore += 20; // 20 points for extreme worst case
    riskFactors.push('Worst-case scenario shows major losses');
    recommendations.push('Build larger emergency fund');
  }
  
  // Factor 5: Standard deviation
  const coefficientOfVariation = results.standardDeviation / results.percentile50;
  if (coefficientOfVariation > 0.3) {
    riskScore += 10; // 10 points for high variability
    riskFactors.push('High outcome variability');
    recommendations.push('Consider more stable investment mix');
  }
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  if (riskScore <= 25) riskLevel = 'low';
  else if (riskScore <= 50) riskLevel = 'medium';
  else if (riskScore <= 75) riskLevel = 'high';
  else riskLevel = 'extreme';
  
  // Add general recommendations based on risk level
  if (riskLevel === 'high' || riskLevel === 'extreme') {
    recommendations.push('Consider consulting with a financial advisor');
    recommendations.push('Review and adjust risk tolerance');
  }
  
  return {
    riskScore: Math.min(100, riskScore),
    riskLevel,
    riskFactors,
    recommendations
  };
}

/**
 * Calculate probability of reaching specific milestones
 */
export function calculateMilestoneProbabilities(
  results: MonteCarloResults,
  milestones: number[]
): { milestone: number; probability: number }[] {
  return milestones.map(milestone => {
    // Approximate probability based on percentiles
    let probability = 0;
    
    if (milestone <= results.percentile5) probability = 95;
    else if (milestone <= results.percentile25) probability = 75;
    else if (milestone <= results.percentile50) probability = 50;
    else if (milestone <= results.percentile75) probability = 25;
    else if (milestone <= results.percentile95) probability = 5;
    else probability = 0;
    
    return { milestone, probability };
  });
}