'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { runMonteCarloSimulation, assessRisk } from '../utils/monteCarloSimulation';
import { 
  projectAdvancedScenario, 
  analyzeLocationOptimization, 
  calculateFIRETimeline,
  analyzeContributionImpact,
  generateScenarioInsights
} from '../utils/scenarioCalculations';

interface ScenarioInputs {
  dividendGrowthRate: number;
  dividendCutProbability: number;
  expenseInflation: number;
  portfolioReturnRate: number;
  marketVolatility: 'low' | 'medium' | 'high';
  location: string;
  taxStrategy: 'standard' | 'optimized' | 'aggressive';
  monthlyContribution: number;
  contributionGrowthRate: number;
  timeHorizon: number;
  retirementAge: number;
}

interface UseScenarioModelingProps {
  baselineData: {
    currentAge: number;
    currentIncome: number;
    currentExpenses: number;
    currentNetWorth: number;
    currentSavingsRate: number;
  };
  monteCarloRuns?: number;
}

interface ScenarioResults {
  projectedNetWorth: number[];
  projectedIncome: number[];
  expenseCoverage: number[];
  fireDate: string | null;
  totalTaxes: number;
  riskScore: number;
  confidenceLevel: number;
  finalNetWorth: number;
  fireAge: number;
  monthlyIncomeAtFire: number;
  monteCarloResults?: any;
  aiInsights?: any[];
  locationOptimization?: any;
  contributionAnalysis?: any;
}

export function useScenarioModeling({
  baselineData,
  monteCarloRuns = 1000
}: UseScenarioModelingProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<ScenarioResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cachedResults, setCachedResults] = useState<Map<string, ScenarioResults>>(new Map());
  
  // Performance optimization - cache results based on inputs
  const generateCacheKey = useCallback((inputs: ScenarioInputs): string => {
    return JSON.stringify({
      ...inputs,
      baseline: baselineData,
      runs: monteCarloRuns
    });
  }, [baselineData, monteCarloRuns]);
  
  /**
   * Main calculation function with enhanced features
   */
  const calculateScenario = useCallback(async (inputs: ScenarioInputs): Promise<ScenarioResults> => {
    const cacheKey = generateCacheKey(inputs);
    
    // Check cache first
    if (cachedResults.has(cacheKey)) {
      return cachedResults.get(cacheKey)!;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      // Run advanced scenario projection
      const projections = projectAdvancedScenario(
        baselineData.currentNetWorth,
        inputs.monthlyContribution,
        inputs.dividendGrowthRate,
        inputs.portfolioReturnRate,
        inputs.dividendCutProbability,
        inputs.location,
        inputs.taxStrategy,
        inputs.timeHorizon,
        inputs.expenseInflation,
        baselineData.currentExpenses / 12
      );
      
      // Calculate FIRE timeline
      const fireTimeline = calculateFIRETimeline(
        baselineData.currentAge,
        baselineData.currentNetWorth,
        inputs.monthlyContribution,
        baselineData.currentExpenses,
        inputs.portfolioReturnRate
      );
      
      // Run Monte Carlo simulation for probabilistic analysis
      let monteCarloResults = null;
      if (monteCarloRuns > 0) {
        const mcInputs = {
          portfolioReturnRate: inputs.portfolioReturnRate,
          dividendGrowthRate: inputs.dividendGrowthRate,
          expenseInflation: inputs.expenseInflation,
          marketVolatility: inputs.marketVolatility,
          timeHorizon: inputs.timeHorizon,
          initialNetWorth: baselineData.currentNetWorth,
          monthlyContribution: inputs.monthlyContribution
        };
        
        monteCarloResults = runMonteCarloSimulation(
          mcInputs,
          monteCarloRuns,
          fireTimeline.targetNetWorth
        );
      }
      
      // Analyze location optimization opportunities
      const locationOptimization = analyzeLocationOptimization(
        inputs.location,
        baselineData.currentNetWorth,
        projections[0]?.dividendIncome || 0
      );
      
      // Analyze contribution impact
      const contributionAnalysis = analyzeContributionImpact(
        fireTimeline,
        inputs.monthlyContribution
      );
      
      // Generate AI insights
      const aiInsights = generateScenarioInsights(projections, inputs.location);
      
      // Calculate risk assessment
      let riskScore = 0.5; // Default moderate risk
      if (monteCarloResults) {
        const riskAssessment = assessRisk(monteCarloResults, {
          portfolioReturnRate: inputs.portfolioReturnRate,
          dividendGrowthRate: inputs.dividendGrowthRate,
          expenseInflation: inputs.expenseInflation,
          marketVolatility: inputs.marketVolatility,
          timeHorizon: inputs.timeHorizon,
          initialNetWorth: baselineData.currentNetWorth,
          monthlyContribution: inputs.monthlyContribution
        });
        riskScore = riskAssessment.riskScore / 100;
      }
      
      // Calculate confidence level
      let confidenceLevel = 70; // Base confidence
      if (inputs.marketVolatility === 'low') confidenceLevel += 15;
      if (inputs.marketVolatility === 'high') confidenceLevel -= 10;
      if (inputs.dividendCutProbability < 10) confidenceLevel += 10;
      if (inputs.taxStrategy === 'optimized') confidenceLevel += 5;
      confidenceLevel = Math.min(95, Math.max(50, confidenceLevel));
      
      // Build results object
      const results: ScenarioResults = {
        projectedNetWorth: projections.map(p => p.netWorth),
        projectedIncome: projections.map(p => p.dividendIncome),
        expenseCoverage: projections.map(p => p.expenseCoverage),
        fireDate: fireTimeline.yearsToFire < 50 
          ? new Date(Date.now() + fireTimeline.yearsToFire * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
        totalTaxes: projections.reduce((sum, p) => sum + p.totalTaxes, 0),
        riskScore,
        confidenceLevel,
        finalNetWorth: projections[projections.length - 1]?.netWorth || 0,
        fireAge: fireTimeline.fireAge,
        monthlyIncomeAtFire: (projections[projections.length - 1]?.dividendIncome || 0) / 12,
        monteCarloResults,
        aiInsights,
        locationOptimization,
        contributionAnalysis
      };
      
      // Cache the results
      setCachedResults(prev => new Map(prev).set(cacheKey, results));
      
      return results;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, [baselineData, monteCarloRuns, generateCacheKey, cachedResults]);
  
  /**
   * Compare multiple scenarios side by side
   */
  const compareScenarios = useCallback(async (
    scenarios: { name: string; inputs: ScenarioInputs }[]
  ): Promise<{ name: string; results: ScenarioResults }[]> => {
    setIsCalculating(true);
    
    try {
      const comparisons = await Promise.all(
        scenarios.map(async scenario => ({
          name: scenario.name,
          results: await calculateScenario(scenario.inputs)
        }))
      );
      
      return comparisons;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, [calculateScenario]);
  
  /**
   * Run sensitivity analysis on a specific variable
   */
  const runSensitivityAnalysis = useCallback(async (
    baseInputs: ScenarioInputs,
    variable: keyof ScenarioInputs,
    testRange: number[] = [-20, -10, -5, 5, 10, 20]
  ): Promise<{ change: number; results: ScenarioResults }[]> => {
    setIsCalculating(true);
    
    try {
      const sensitivityResults = await Promise.all(
        testRange.map(async change => {
          const modifiedInputs = { ...baseInputs };
          
          // Apply percentage change to the variable
          if (typeof modifiedInputs[variable] === 'number') {
            const originalValue = modifiedInputs[variable] as number;
            (modifiedInputs as any)[variable] = originalValue * (1 + change / 100);
          }
          
          const results = await calculateScenario(modifiedInputs);
          return { change, results };
        })
      );
      
      return sensitivityResults;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sensitivity analysis failed');
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, [calculateScenario]);
  
  /**
   * Optimize scenario parameters for best outcome
   */
  const optimizeScenario = useCallback(async (
    baseInputs: ScenarioInputs,
    objective: 'minimize_fire_age' | 'maximize_net_worth' | 'minimize_taxes'
  ): Promise<{ optimizedInputs: ScenarioInputs; results: ScenarioResults; improvements: string[] }> => {
    setIsCalculating(true);
    
    try {
      let bestInputs = { ...baseInputs };
      let bestResults = await calculateScenario(baseInputs);
      const improvements: string[] = [];
      
      // Test different optimization strategies based on objective
      const optimizations = [];
      
      if (objective === 'minimize_fire_age' || objective === 'maximize_net_worth') {
        // Try increasing contribution by 10%, 25%, 50%
        optimizations.push(
          { name: 'Increase contributions by 25%', modify: (inputs: ScenarioInputs) => ({ ...inputs, monthlyContribution: inputs.monthlyContribution * 1.25 }) },
          { name: 'Increase portfolio returns by 1%', modify: (inputs: ScenarioInputs) => ({ ...inputs, portfolioReturnRate: inputs.portfolioReturnRate + 1 }) },
          { name: 'Reduce market volatility', modify: (inputs: ScenarioInputs) => ({ ...inputs, marketVolatility: 'low' as const }) }
        );
      }
      
      if (objective === 'minimize_taxes') {
        // Try tax-optimized location and strategy
        optimizations.push(
          { name: 'Move to Puerto Rico', modify: (inputs: ScenarioInputs) => ({ ...inputs, location: 'Puerto Rico' }) },
          { name: 'Use aggressive tax strategy', modify: (inputs: ScenarioInputs) => ({ ...inputs, taxStrategy: 'aggressive' as const }) },
          { name: 'Optimize location and strategy', modify: (inputs: ScenarioInputs) => ({ ...inputs, location: 'Puerto Rico', taxStrategy: 'aggressive' as const }) }
        );
      }
      
      // Test each optimization
      for (const optimization of optimizations) {
        const testInputs = optimization.modify(baseInputs);
        const testResults = await calculateScenario(testInputs);
        
        let isBetter = false;
        
        switch (objective) {
          case 'minimize_fire_age':
            isBetter = testResults.fireAge < bestResults.fireAge;
            break;
          case 'maximize_net_worth':
            isBetter = testResults.finalNetWorth > bestResults.finalNetWorth;
            break;
          case 'minimize_taxes':
            isBetter = testResults.totalTaxes < bestResults.totalTaxes;
            break;
        }
        
        if (isBetter) {
          bestInputs = testInputs;
          bestResults = testResults;
          improvements.push(optimization.name);
        }
      }
      
      return {
        optimizedInputs: bestInputs,
        results: bestResults,
        improvements
      };
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed');
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, [calculateScenario]);
  
  /**
   * Clear cache to free memory
   */
  const clearCache = useCallback(() => {
    setCachedResults(new Map());
  }, []);
  
  /**
   * Export scenario data
   */
  const exportScenario = useCallback((inputs: ScenarioInputs, results: ScenarioResults) => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        tool: 'Income Clarity What-If Scenarios'
      },
      baselineData,
      inputs,
      results,
      calculations: {
        monteCarloRuns,
        assumptions: {
          withdrawalRate: 0.04,
          inflationRate: inputs.expenseInflation,
          taxRates: 'Location-specific'
        }
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [baselineData, monteCarloRuns]);
  
  return {
    // State
    isCalculating,
    results,
    error,
    
    // Core functions
    calculateScenario,
    compareScenarios,
    runSensitivityAnalysis,
    optimizeScenario,
    
    // Utility functions
    clearCache,
    exportScenario,
    
    // Cache info
    cacheSize: cachedResults.size
  };
}