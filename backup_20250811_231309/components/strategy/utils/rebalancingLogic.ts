/**
 * Rebalancing Logic Utility
 * Advanced portfolio rebalancing algorithms with tax optimization
 */

export interface RebalancingTrigger {
  type: 'threshold' | 'calendar' | 'volatility' | 'opportunity';
  threshold?: number; // Percentage deviation for threshold-based
  frequency?: 'monthly' | 'quarterly' | 'annually'; // For calendar-based
  volatilityLevel?: 'low' | 'medium' | 'high'; // For volatility-based
}

export interface AssetClass {
  name: string;
  ticker: string;
  targetWeight: number;
  currentWeight: number;
  currentValue: number;
  minWeight?: number;
  maxWeight?: number;
  taxEfficiency: number; // 0-1 scale
  sector: string;
}

export interface RebalancingAction {
  action: 'buy' | 'sell';
  ticker: string;
  currentShares: number;
  targetShares: number;
  sharesToTrade: number;
  dollarAmount: number;
  currentPrice: number;
  priority: 'high' | 'medium' | 'low';
  taxImpact: number;
  reason: string;
}

export interface RebalancingStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  rebalanceFrequency: 'monthly' | 'quarterly' | 'annually';
  thresholdTolerance: number;
  taxOptimized: boolean;
  targetAllocation: Record<string, number>;
}

export interface PortfolioMetrics {
  totalValue: number;
  efficiency: number; // 0-100 scale
  maxDeviation: number;
  needsRebalancing: number; // Count of positions
  totalPositions: number;
  status: 'balanced' | 'needs_rebalancing' | 'critical';
}

/**
 * Predefined rebalancing strategies
 */
export const REBALANCING_STRATEGIES: RebalancingStrategy[] = [
  {
    id: 'conservative',
    name: 'Conservative Income',
    description: 'Focus on stability with dividend income and bonds',
    riskLevel: 'conservative',
    rebalanceFrequency: 'quarterly',
    thresholdTolerance: 0.05, // 5%
    taxOptimized: true,
    targetAllocation: {
      'dividend_stocks': 40,
      'bonds': 40,
      'reits': 15,
      'cash': 5
    }
  },
  {
    id: 'moderate',
    name: 'Balanced Growth',
    description: 'Balanced approach with growth and income',
    riskLevel: 'moderate',
    rebalanceFrequency: 'quarterly',
    thresholdTolerance: 0.10, // 10%
    taxOptimized: true,
    targetAllocation: {
      'stocks': 60,
      'bonds': 20,
      'reits': 10,
      'international': 10
    }
  },
  {
    id: 'aggressive',
    name: 'Growth Focused',
    description: 'Maximum growth with higher risk tolerance',
    riskLevel: 'aggressive',
    rebalanceFrequency: 'monthly',
    thresholdTolerance: 0.15, // 15%
    taxOptimized: false,
    targetAllocation: {
      'stocks': 80,
      'international': 15,
      'alternatives': 5
    }
  },
  {
    id: 'dividend_income',
    name: 'High Dividend Income',
    description: 'Maximize monthly dividend income',
    riskLevel: 'moderate',
    rebalanceFrequency: 'quarterly',
    thresholdTolerance: 0.08, // 8%
    taxOptimized: true,
    targetAllocation: {
      'dividend_stocks': 50,
      'reits': 25,
      'bonds': 20,
      'cash': 5
    }
  },
  {
    id: 'tax_efficient',
    name: 'Tax-Optimized Portfolio',
    description: 'Minimize tax drag while maintaining returns',
    riskLevel: 'moderate',
    rebalanceFrequency: 'annually', // Less frequent to avoid short-term gains
    thresholdTolerance: 0.12, // 12%
    taxOptimized: true,
    targetAllocation: {
      'index_funds': 70,
      'tax_managed_funds': 20,
      'municipal_bonds': 10
    }
  }
];

/**
 * Calculate portfolio metrics
 */
export const calculatePortfolioMetrics = (
  assets: AssetClass[],
  totalValue: number
): PortfolioMetrics => {
  let maxDeviation = 0;
  let needsRebalancing = 0;
  let weightedEfficiency = 0;

  assets.forEach(asset => {
    const deviation = Math.abs(asset.currentWeight - asset.targetWeight);
    maxDeviation = Math.max(maxDeviation, deviation);
    
    if (deviation > 0.05) { // 5% threshold
      needsRebalancing++;
    }
    
    weightedEfficiency += asset.taxEfficiency * asset.currentWeight;
  });

  const efficiency = (1 - maxDeviation) * 100 * (weightedEfficiency / 100);
  const status = needsRebalancing === 0 
    ? 'balanced' 
    : needsRebalancing > assets.length / 2 
    ? 'critical' 
    : 'needs_rebalancing';

  return {
    totalValue,
    efficiency: Math.max(0, efficiency),
    maxDeviation,
    needsRebalancing,
    totalPositions: assets.length,
    status
  };
};

/**
 * Generate rebalancing actions
 */
export const generateRebalancingActions = (
  assets: AssetClass[],
  totalValue: number,
  strategy: RebalancingStrategy,
  taxOptimized: boolean = true
): RebalancingAction[] => {
  const actions: RebalancingAction[] = [];
  const threshold = strategy.thresholdTolerance;

  // Calculate required changes
  assets.forEach(asset => {
    const deviation = asset.currentWeight - asset.targetWeight;
    const deviationPercent = Math.abs(deviation);

    if (deviationPercent > threshold) {
      const targetValue = totalValue * asset.targetWeight;
      const targetShares = Math.floor(targetValue / asset.currentValue * asset.currentShares);
      const sharesToTrade = Math.abs(targetShares - asset.currentShares);
      const dollarAmount = sharesToTrade * (asset.currentValue / asset.currentShares);

      // Estimate tax impact (simplified)
      const estimatedGainLoss = dollarAmount * 0.1; // Assume 10% average gain
      const taxRate = taxOptimized ? 0.15 : 0.24; // Long-term vs short-term
      const taxImpact = deviation > 0 // Selling
        ? estimatedGainLoss * taxRate 
        : 0; // No tax on buying

      actions.push({
        action: deviation > 0 ? 'sell' : 'buy',
        ticker: asset.ticker,
        currentShares: asset.currentShares,
        targetShares,
        sharesToTrade,
        dollarAmount,
        currentPrice: asset.currentValue / asset.currentShares,
        priority: deviationPercent > threshold * 2 ? 'high' : 'medium',
        taxImpact,
        reason: `Rebalance ${deviation > 0 ? 'overweight' : 'underweight'} ${asset.name} (${(deviationPercent * 100).toFixed(1)}% deviation)`
      });
    }
  });

  // Sort by priority and tax efficiency
  return actions.sort((a, b) => {
    // High priority first
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    
    // Then by tax impact (lower is better)
    return a.taxImpact - b.taxImpact;
  });
};

/**
 * Check if rebalancing is needed
 */
export const shouldRebalance = (
  assets: AssetClass[],
  trigger: RebalancingTrigger,
  lastRebalanceDate?: Date
): {
  shouldRebalance: boolean;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
} => {
  switch (trigger.type) {
    case 'threshold':
      const maxDeviation = Math.max(...assets.map(asset => 
        Math.abs(asset.currentWeight - asset.targetWeight)
      ));
      
      if (maxDeviation > (trigger.threshold || 0.10)) {
        return {
          shouldRebalance: true,
          reason: `Maximum deviation of ${(maxDeviation * 100).toFixed(1)}% exceeds threshold`,
          urgency: maxDeviation > 0.15 ? 'high' : 'medium'
        };
      }
      break;

    case 'calendar':
      if (!lastRebalanceDate) {
        return {
          shouldRebalance: true,
          reason: 'No previous rebalancing recorded',
          urgency: 'medium'
        };
      }
      
      const daysSinceRebalance = Math.floor(
        (Date.now() - lastRebalanceDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const requiredDays = trigger.frequency === 'monthly' ? 30 :
                          trigger.frequency === 'quarterly' ? 90 : 365;
      
      if (daysSinceRebalance >= requiredDays) {
        return {
          shouldRebalance: true,
          reason: `${trigger.frequency} rebalancing is due`,
          urgency: 'medium'
        };
      }
      break;

    case 'volatility':
      // Mock volatility check (would use actual market data)
      const isHighVolatility = Math.random() > 0.7; // 30% chance of high volatility
      
      if (isHighVolatility && trigger.volatilityLevel === 'high') {
        return {
          shouldRebalance: true,
          reason: 'High market volatility detected',
          urgency: 'high'
        };
      }
      break;

    case 'opportunity':
      // Check for tax loss harvesting opportunities
      const hasLossOpportunity = assets.some(asset => 
        asset.currentValue < asset.targetWeight * 10000 // Mock loss check
      );
      
      if (hasLossOpportunity) {
        return {
          shouldRebalance: true,
          reason: 'Tax loss harvesting opportunity available',
          urgency: 'medium'
        };
      }
      break;
  }

  return {
    shouldRebalance: false,
    reason: 'Portfolio is within acceptable parameters',
    urgency: 'low'
  };
};

/**
 * Generate rebalancing schedule
 */
export const generateRebalancingSchedule = (
  strategy: RebalancingStrategy,
  startDate: Date = new Date()
): Array<{
  date: Date;
  type: 'scheduled' | 'threshold_check' | 'tax_optimization';
  description: string;
}> => {
  const schedule = [];
  const current = new Date(startDate);
  
  // Generate next 12 months of scheduled rebalancing
  for (let i = 0; i < 12; i++) {
    const scheduleDate = new Date(current);
    
    switch (strategy.rebalanceFrequency) {
      case 'monthly':
        scheduleDate.setMonth(current.getMonth() + i);
        break;
      case 'quarterly':
        scheduleDate.setMonth(current.getMonth() + (i * 3));
        break;
      case 'annually':
        scheduleDate.setFullYear(current.getFullYear() + i);
        break;
    }

    if (scheduleDate > startDate) {
      schedule.push({
        date: scheduleDate,
        type: 'scheduled' as const,
        description: `${strategy.name} scheduled rebalancing`
      });
    }
  }

  // Add threshold checks (weekly for active strategies)
  if (strategy.riskLevel === 'aggressive') {
    for (let i = 1; i <= 52; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + (i * 7));
      
      schedule.push({
        date: checkDate,
        type: 'threshold_check' as const,
        description: 'Weekly threshold deviation check'
      });
    }
  }

  // Add tax optimization dates (quarterly)
  for (let i = 1; i <= 4; i++) {
    const taxDate = new Date(startDate);
    taxDate.setMonth(startDate.getMonth() + (i * 3));
    
    schedule.push({
      date: taxDate,
      type: 'tax_optimization' as const,
      description: 'Quarterly tax loss harvesting review'
    });
  }

  return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Calculate rebalancing costs
 */
export const calculateRebalancingCosts = (
  actions: RebalancingAction[],
  tradingFees: {
    commission: number; // Per trade
    spreadCost: number; // Percentage
  } = { commission: 0, spreadCost: 0.005 } // Default: no commission, 0.5% spread
): {
  tradingCosts: number;
  taxCosts: number;
  totalCost: number;
  costPerAction: number;
} => {
  const tradingCosts = actions.reduce((total, action) => {
    const commissionCost = tradingFees.commission;
    const spreadCost = action.dollarAmount * tradingFees.spreadCost;
    return total + commissionCost + spreadCost;
  }, 0);

  const taxCosts = actions.reduce((total, action) => 
    total + Math.max(0, action.taxImpact), 0);

  const totalCost = tradingCosts + taxCosts;

  return {
    tradingCosts,
    taxCosts,
    totalCost,
    costPerAction: actions.length > 0 ? totalCost / actions.length : 0
  };
};

/**
 * Optimize trade execution order
 */
export const optimizeTradeOrder = (
  actions: RebalancingAction[],
  cashAvailable: number = 0
): {
  optimizedActions: RebalancingAction[];
  requiredCash: number;
  reasoning: string[];
} => {
  const sellActions = actions.filter(a => a.action === 'sell');
  const buyActions = actions.filter(a => a.action === 'buy');
  const reasoning: string[] = [];

  // Sort sells by priority and tax efficiency (harvest losses first)
  const optimizedSells = sellActions.sort((a, b) => {
    // Tax losses first (negative tax impact)
    if (a.taxImpact < 0 && b.taxImpact >= 0) return -1;
    if (b.taxImpact < 0 && a.taxImpact >= 0) return 1;
    
    // Then by priority
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    
    // Finally by tax impact (lower is better)
    return a.taxImpact - b.taxImpact;
  });

  // Sort buys by priority and efficiency
  const optimizedBuys = buyActions.sort((a, b) => {
    // High priority first
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    
    // Then by dollar amount (smaller trades first to preserve cash)
    return a.dollarAmount - b.dollarAmount;
  });

  // Calculate cash flow
  const sellProceeds = optimizedSells.reduce((sum, action) => sum + action.dollarAmount, 0);
  const buyRequirement = optimizedBuys.reduce((sum, action) => sum + action.dollarAmount, 0);
  const requiredCash = Math.max(0, buyRequirement - sellProceeds - cashAvailable);

  if (optimizedSells.length > 0) {
    reasoning.push(`Execute ${optimizedSells.length} sell orders first to generate cash`);
  }
  if (requiredCash > 0) {
    reasoning.push(`Additional $${requiredCash.toLocaleString()} cash needed for purchases`);
  }
  reasoning.push(`Tax loss harvesting saves $${Math.abs(optimizedSells.filter(a => a.taxImpact < 0).reduce((sum, a) => sum + a.taxImpact, 0)).toLocaleString()}`);

  return {
    optimizedActions: [...optimizedSells, ...optimizedBuys],
    requiredCash,
    reasoning
  };
};

/**
 * Calculate portfolio drift over time
 */
export const calculateHistoricalDrift = (
  targetAllocation: Record<string, number>,
  historicalPrices: Record<string, number[]>, // Price history for each asset
  timePoints: number = 12 // Number of historical points
): Array<{
  date: Date;
  maxDrift: number;
  assetDrifts: Record<string, number>;
}> => {
  const history = [];
  const today = new Date();

  for (let i = timePoints - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);

    const assetValues: Record<string, number> = {};
    let totalValue = 0;

    // Calculate asset values at this point in time
    Object.keys(targetAllocation).forEach(asset => {
      const priceHistory = historicalPrices[asset] || [];
      const priceIndex = Math.max(0, priceHistory.length - i - 1);
      const price = priceHistory[priceIndex] || 100; // Default price
      
      assetValues[asset] = price * targetAllocation[asset]; // Simplified
      totalValue += assetValues[asset];
    });

    // Calculate drifts
    const assetDrifts: Record<string, number> = {};
    let maxDrift = 0;

    Object.keys(targetAllocation).forEach(asset => {
      const currentWeight = assetValues[asset] / totalValue;
      const drift = currentWeight - targetAllocation[asset] / 100;
      assetDrifts[asset] = drift;
      maxDrift = Math.max(maxDrift, Math.abs(drift));
    });

    history.push({
      date,
      maxDrift,
      assetDrifts
    });
  }

  return history;
};