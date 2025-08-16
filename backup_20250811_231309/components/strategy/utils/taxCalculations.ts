/**
 * Tax Calculations Utility
 * Comprehensive tax calculation engine for portfolio rebalancing
 */

export interface TaxRates {
  federal: {
    ordinaryIncome: number;
    shortTermCapitalGains: number;
    longTermCapitalGains: number;
    qualifiedDividends: number;
  };
  state: {
    ordinaryIncome: number;
    capitalGains: number;
    dividends: number;
  };
  specialRules?: {
    act60?: boolean; // Puerto Rico Act 60
    act22?: boolean; // Puerto Rico Act 22
    nomadTax?: boolean; // Digital nomad tax benefits
  };
}

export interface TaxLot {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate: Date;
  method: 'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID';
}

export interface CapitalGainLoss {
  ticker: string;
  shares: number;
  proceeds: number;
  costBasis: number;
  gainLoss: number;
  holdingPeriod: number;
  isLongTerm: boolean;
  taxRate: number;
  taxOwed: number;
}

/**
 * Get tax rates for a specific location
 */
export const getTaxRatesForLocation = (location: string): TaxRates => {
  const baseFederalRates = {
    ordinaryIncome: 0.24, // Assumed 24% bracket
    shortTermCapitalGains: 0.24, // Same as ordinary income
    longTermCapitalGains: 0.15, // 15% bracket
    qualifiedDividends: 0.15 // Same as long-term capital gains
  };

  const locationRates: Record<string, TaxRates> = {
    'Puerto Rico': {
      federal: {
        ...baseFederalRates,
        // Puerto Rico residents pay no federal tax on PR-source income
        ordinaryIncome: 0,
        shortTermCapitalGains: 0,
        longTermCapitalGains: 0,
        qualifiedDividends: 0
      },
      state: {
        ordinaryIncome: 0,
        capitalGains: 0,
        dividends: 0
      },
      specialRules: {
        act60: true, // 0% on investment income
        act22: true  // Additional benefits for relocated individuals
      }
    },
    'California': {
      federal: baseFederalRates,
      state: {
        ordinaryIncome: 0.093, // 9.3% bracket (simplified)
        capitalGains: 0.093,   // CA taxes capital gains as ordinary income
        dividends: 0.093
      }
    },
    'New York': {
      federal: baseFederalRates,
      state: {
        ordinaryIncome: 0.068, // 6.85% bracket (simplified)
        capitalGains: 0.068,
        dividends: 0.068
      }
    },
    'Texas': {
      federal: baseFederalRates,
      state: {
        ordinaryIncome: 0,
        capitalGains: 0,
        dividends: 0
      }
    },
    'Florida': {
      federal: baseFederalRates,
      state: {
        ordinaryIncome: 0,
        capitalGains: 0,
        dividends: 0
      }
    },
    'Nevada': {
      federal: baseFederalRates,
      state: {
        ordinaryIncome: 0,
        capitalGains: 0,
        dividends: 0
      }
    },
    'Washington': {
      federal: baseFederalRates,
      state: {
        ordinaryIncome: 0,
        capitalGains: 0.07, // WA capital gains tax on high earners
        dividends: 0
      }
    }
  };

  return locationRates[location] || locationRates['California'];
};

/**
 * Calculate capital gains tax for a sale
 */
export const calculateCapitalGainsTax = (
  ticker: string,
  shares: number,
  salePrice: number,
  taxLots: TaxLot[],
  taxRates: TaxRates,
  method: 'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID' = 'HIFO'
): CapitalGainLoss => {
  // Filter lots for this ticker
  const availableLots = taxLots
    .filter(lot => lot.ticker === ticker)
    .sort((a, b) => {
      switch (method) {
        case 'FIFO':
          return a.purchaseDate.getTime() - b.purchaseDate.getTime();
        case 'LIFO':
          return b.purchaseDate.getTime() - a.purchaseDate.getTime();
        case 'HIFO':
          return b.costBasis - a.costBasis; // Highest cost first
        default:
          return 0;
      }
    });

  let remainingShares = shares;
  let totalCostBasis = 0;
  let totalProceeds = shares * salePrice;
  let weightedHoldingPeriod = 0;

  // Select lots based on method
  for (const lot of availableLots) {
    if (remainingShares <= 0) break;

    const sharesToSell = Math.min(remainingShares, lot.shares);
    const lotCostBasis = sharesToSell * lot.costBasis;
    const holdingDays = Math.floor(
      (Date.now() - lot.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    totalCostBasis += lotCostBasis;
    weightedHoldingPeriod += holdingDays * sharesToSell;
    remainingShares -= sharesToSell;
  }

  const gainLoss = totalProceeds - totalCostBasis;
  const avgHoldingPeriod = weightedHoldingPeriod / shares;
  const isLongTerm = avgHoldingPeriod > 365;

  // Calculate tax rate
  let effectiveTaxRate = 0;
  
  if (taxRates.specialRules?.act60) {
    // Puerto Rico Act 60: 0% on investment income
    effectiveTaxRate = 0;
  } else {
    const federalRate = isLongTerm 
      ? taxRates.federal.longTermCapitalGains 
      : taxRates.federal.shortTermCapitalGains;
    const stateRate = taxRates.state.capitalGains;
    effectiveTaxRate = federalRate + stateRate;
  }

  const taxOwed = Math.max(0, gainLoss * effectiveTaxRate);

  return {
    ticker,
    shares,
    proceeds: totalProceeds,
    costBasis: totalCostBasis,
    gainLoss,
    holdingPeriod: avgHoldingPeriod,
    isLongTerm,
    taxRate: effectiveTaxRate,
    taxOwed: gainLoss > 0 ? taxOwed : -Math.abs(gainLoss * effectiveTaxRate) // Tax benefit for losses
  };
};

/**
 * Identify tax loss harvesting opportunities
 */
export const identifyHarvestingOpportunities = (
  holdings: Array<{
    ticker: string;
    shares: number;
    currentPrice: number;
    costBasis: number;
    purchaseDate: Date;
  }>,
  taxRates: TaxRates,
  minLossThreshold: number = 500
): Array<{
  ticker: string;
  unrealizedLoss: number;
  taxBenefit: number;
  replacement: string;
  washSaleRisk: boolean;
}> => {
  const opportunities = [];

  for (const holding of holdings) {
    const currentValue = holding.shares * holding.currentPrice;
    const costBasis = holding.shares * holding.costBasis;
    const unrealizedLoss = costBasis - currentValue;

    if (unrealizedLoss > minLossThreshold) {
      const holdingPeriod = Math.floor(
        (Date.now() - holding.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isLongTerm = holdingPeriod > 365;
      
      let taxRate = 0;
      if (!taxRates.specialRules?.act60) {
        const federalRate = isLongTerm 
          ? taxRates.federal.longTermCapitalGains 
          : taxRates.federal.shortTermCapitalGains;
        taxRate = federalRate + taxRates.state.capitalGains;
      }

      const taxBenefit = unrealizedLoss * taxRate;

      opportunities.push({
        ticker: holding.ticker,
        unrealizedLoss,
        taxBenefit,
        replacement: findSimilarETF(holding.ticker),
        washSaleRisk: hasWashSaleRisk(holding.ticker) // Would check recent trades
      });
    }
  }

  return opportunities.sort((a, b) => b.taxBenefit - a.taxBenefit);
};

/**
 * Calculate wash sale risk
 */
export const hasWashSaleRisk = (ticker: string): boolean => {
  // In production, this would check actual trade history
  // For now, return random risk assessment
  const riskFactors = [
    ticker.includes('ARK'), // High volatility stocks
    ticker.includes('QQQ'), // Tech-heavy ETFs
    Math.random() > 0.8     // Random factor
  ];
  
  return riskFactors.some(risk => risk);
};

/**
 * Find similar ETF to avoid wash sale
 */
export const findSimilarETF = (ticker: string): string => {
  const alternatives: Record<string, string> = {
    // Technology
    'QQQ': 'VGT',
    'ARKK': 'VGT',
    'ARKQ': 'ROBO',
    'ARKW': 'WCLD',
    
    // Broad Market
    'SPY': 'IVV',
    'VTI': 'ITOT',
    'VOO': 'SPLG',
    
    // Dividends
    'SCHD': 'VYM',
    'VYM': 'SCHD',
    'NOBL': 'DGRW',
    
    // Bonds
    'AGG': 'BND',
    'BND': 'AGG',
    'TLT': 'VGLT',
    
    // International
    'VXUS': 'FTIHX',
    'VEA': 'IEFA',
    'VWO': 'IEMG',
    
    // Real Estate
    'VNQ': 'SCHH',
    'SCHH': 'VNQ',
    'REM': 'MORT'
  };

  return alternatives[ticker] || 'VTI'; // Default to total market
};

/**
 * Calculate optimal rebalancing date
 */
export const calculateOptimalRebalanceDate = (
  holdings: Array<{
    ticker: string;
    shares: number;
    purchaseDate: Date;
  }>
): Date => {
  // Find the earliest date when most holdings become long-term
  const longTermDates = holdings.map(holding => {
    const longTermDate = new Date(holding.purchaseDate);
    longTermDate.setDate(longTermDate.getDate() + 366); // 366 days for long-term
    return longTermDate;
  });

  // Sort and find median date
  longTermDates.sort((a, b) => a.getTime() - b.getTime());
  const medianIndex = Math.floor(longTermDates.length / 2);
  
  return longTermDates[medianIndex] || new Date();
};

/**
 * Estimate quarterly tax payments
 */
export const estimateQuarterlyTaxes = (
  annualGains: number,
  taxRates: TaxRates
): Array<{
  quarter: string;
  dueDate: Date;
  estimatedPayment: number;
}> => {
  if (taxRates.specialRules?.act60) {
    // Puerto Rico residents typically don't need quarterly payments on investment income
    return [];
  }

  const currentYear = new Date().getFullYear();
  const quarterlyGain = annualGains / 4;
  const effectiveTaxRate = taxRates.federal.shortTermCapitalGains + taxRates.state.capitalGains;
  const quarterlyTax = quarterlyGain * effectiveTaxRate;

  return [
    {
      quarter: 'Q1',
      dueDate: new Date(currentYear, 3, 15), // April 15
      estimatedPayment: quarterlyTax
    },
    {
      quarter: 'Q2',
      dueDate: new Date(currentYear, 5, 15), // June 15
      estimatedPayment: quarterlyTax
    },
    {
      quarter: 'Q3',
      dueDate: new Date(currentYear, 8, 15), // September 15
      estimatedPayment: quarterlyTax
    },
    {
      quarter: 'Q4',
      dueDate: new Date(currentYear + 1, 0, 15), // January 15 next year
      estimatedPayment: quarterlyTax
    }
  ];
};

/**
 * Calculate location-based tax advantage
 */
export const calculateLocationAdvantage = (
  currentLocation: string,
  comparisonLocation: string,
  annualGains: number
): {
  currentTax: number;
  comparisonTax: number;
  annualSavings: number;
  breakEvenMonths: number;
} => {
  const currentRates = getTaxRatesForLocation(currentLocation);
  const comparisonRates = getTaxRatesForLocation(comparisonLocation);

  const currentEffectiveRate = currentRates.federal.longTermCapitalGains + currentRates.state.capitalGains;
  const comparisonEffectiveRate = comparisonRates.federal.longTermCapitalGains + comparisonRates.state.capitalGains;

  const currentTax = annualGains * currentEffectiveRate;
  const comparisonTax = annualGains * comparisonEffectiveRate;
  const annualSavings = comparisonTax - currentTax;

  // Estimate relocation costs and break-even time
  const estimatedRelocationCost = 15000; // Simplified estimate
  const breakEvenMonths = annualSavings > 0 ? Math.ceil(estimatedRelocationCost / (annualSavings / 12)) : Infinity;

  return {
    currentTax,
    comparisonTax,
    annualSavings,
    breakEvenMonths
  };
};