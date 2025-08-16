// Tax Calculator Service - Location-based tax intelligence
import { cache } from 'react';

export interface TaxProfile {
  state: string;
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  federalBracket: number;
  stateBracket: number;
  qualifiedDividendRate: number;
  capitalGainsRate: number;
  effectiveRate: number;
  marginalRate: number;
}

export interface TaxCalculation {
  grossIncome: number;
  federalTax: number;
  stateTax: number;
  netIncome: number;
  effectiveRate: number;
  taxSavings?: number; // vs California baseline
}

export interface StateInfo {
  code: string;
  name: string;
  dividendTaxRate: number;
  capitalGainsRate: number;
  hasNoStateTax: boolean;
  specialNotes?: string;
}

// State tax data for all US states and territories
export const STATE_TAX_DATA: Record<string, StateInfo> = {
  'AL': { code: 'AL', name: 'Alabama', dividendTaxRate: 0.05, capitalGainsRate: 0.05, hasNoStateTax: false },
  'AK': { code: 'AK', name: 'Alaska', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true },
  'AZ': { code: 'AZ', name: 'Arizona', dividendTaxRate: 0.045, capitalGainsRate: 0.045, hasNoStateTax: false },
  'AR': { code: 'AR', name: 'Arkansas', dividendTaxRate: 0.059, capitalGainsRate: 0.047, hasNoStateTax: false },
  'CA': { code: 'CA', name: 'California', dividendTaxRate: 0.133, capitalGainsRate: 0.133, hasNoStateTax: false, specialNotes: 'Highest state tax rate' },
  'CO': { code: 'CO', name: 'Colorado', dividendTaxRate: 0.044, capitalGainsRate: 0.044, hasNoStateTax: false },
  'CT': { code: 'CT', name: 'Connecticut', dividendTaxRate: 0.069, capitalGainsRate: 0.069, hasNoStateTax: false },
  'DE': { code: 'DE', name: 'Delaware', dividendTaxRate: 0.066, capitalGainsRate: 0.066, hasNoStateTax: false },
  'FL': { code: 'FL', name: 'Florida', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: 'No state income tax' },
  'GA': { code: 'GA', name: 'Georgia', dividendTaxRate: 0.057, capitalGainsRate: 0.057, hasNoStateTax: false },
  'HI': { code: 'HI', name: 'Hawaii', dividendTaxRate: 0.11, capitalGainsRate: 0.074, hasNoStateTax: false },
  'ID': { code: 'ID', name: 'Idaho', dividendTaxRate: 0.06, capitalGainsRate: 0.06, hasNoStateTax: false },
  'IL': { code: 'IL', name: 'Illinois', dividendTaxRate: 0.0495, capitalGainsRate: 0.0495, hasNoStateTax: false },
  'IN': { code: 'IN', name: 'Indiana', dividendTaxRate: 0.032, capitalGainsRate: 0.032, hasNoStateTax: false },
  'IA': { code: 'IA', name: 'Iowa', dividendTaxRate: 0.06, capitalGainsRate: 0.06, hasNoStateTax: false },
  'KS': { code: 'KS', name: 'Kansas', dividendTaxRate: 0.057, capitalGainsRate: 0.057, hasNoStateTax: false },
  'KY': { code: 'KY', name: 'Kentucky', dividendTaxRate: 0.045, capitalGainsRate: 0.045, hasNoStateTax: false },
  'LA': { code: 'LA', name: 'Louisiana', dividendTaxRate: 0.045, capitalGainsRate: 0.045, hasNoStateTax: false },
  'ME': { code: 'ME', name: 'Maine', dividendTaxRate: 0.075, capitalGainsRate: 0.075, hasNoStateTax: false },
  'MD': { code: 'MD', name: 'Maryland', dividendTaxRate: 0.0575, capitalGainsRate: 0.0575, hasNoStateTax: false },
  'MA': { code: 'MA', name: 'Massachusetts', dividendTaxRate: 0.05, capitalGainsRate: 0.05, hasNoStateTax: false },
  'MI': { code: 'MI', name: 'Michigan', dividendTaxRate: 0.0425, capitalGainsRate: 0.0425, hasNoStateTax: false },
  'MN': { code: 'MN', name: 'Minnesota', dividendTaxRate: 0.0985, capitalGainsRate: 0.0985, hasNoStateTax: false },
  'MS': { code: 'MS', name: 'Mississippi', dividendTaxRate: 0.05, capitalGainsRate: 0.05, hasNoStateTax: false },
  'MO': { code: 'MO', name: 'Missouri', dividendTaxRate: 0.054, capitalGainsRate: 0.054, hasNoStateTax: false },
  'MT': { code: 'MT', name: 'Montana', dividendTaxRate: 0.0675, capitalGainsRate: 0.0675, hasNoStateTax: false },
  'NE': { code: 'NE', name: 'Nebraska', dividendTaxRate: 0.0684, capitalGainsRate: 0.0684, hasNoStateTax: false },
  'NV': { code: 'NV', name: 'Nevada', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: 'No state income tax' },
  'NH': { code: 'NH', name: 'New Hampshire', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: 'No tax on earned income' },
  'NJ': { code: 'NJ', name: 'New Jersey', dividendTaxRate: 0.108, capitalGainsRate: 0.108, hasNoStateTax: false },
  'NM': { code: 'NM', name: 'New Mexico', dividendTaxRate: 0.059, capitalGainsRate: 0.059, hasNoStateTax: false },
  'NY': { code: 'NY', name: 'New York', dividendTaxRate: 0.109, capitalGainsRate: 0.109, hasNoStateTax: false },
  'NC': { code: 'NC', name: 'North Carolina', dividendTaxRate: 0.045, capitalGainsRate: 0.045, hasNoStateTax: false },
  'ND': { code: 'ND', name: 'North Dakota', dividendTaxRate: 0.019, capitalGainsRate: 0.019, hasNoStateTax: false },
  'OH': { code: 'OH', name: 'Ohio', dividendTaxRate: 0.035, capitalGainsRate: 0.035, hasNoStateTax: false },
  'OK': { code: 'OK', name: 'Oklahoma', dividendTaxRate: 0.0475, capitalGainsRate: 0.0475, hasNoStateTax: false },
  'OR': { code: 'OR', name: 'Oregon', dividendTaxRate: 0.099, capitalGainsRate: 0.099, hasNoStateTax: false },
  'PA': { code: 'PA', name: 'Pennsylvania', dividendTaxRate: 0.0307, capitalGainsRate: 0.0307, hasNoStateTax: false },
  'PR': { code: 'PR', name: 'Puerto Rico', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: '0% tax on qualified dividends under Act 60!' },
  'RI': { code: 'RI', name: 'Rhode Island', dividendTaxRate: 0.0599, capitalGainsRate: 0.0599, hasNoStateTax: false },
  'SC': { code: 'SC', name: 'South Carolina', dividendTaxRate: 0.064, capitalGainsRate: 0.064, hasNoStateTax: false },
  'SD': { code: 'SD', name: 'South Dakota', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: 'No state income tax' },
  'TN': { code: 'TN', name: 'Tennessee', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: 'No state income tax' },
  'TX': { code: 'TX', name: 'Texas', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: 'No state income tax' },
  'UT': { code: 'UT', name: 'Utah', dividendTaxRate: 0.0465, capitalGainsRate: 0.0465, hasNoStateTax: false },
  'VT': { code: 'VT', name: 'Vermont', dividendTaxRate: 0.076, capitalGainsRate: 0.076, hasNoStateTax: false },
  'VA': { code: 'VA', name: 'Virginia', dividendTaxRate: 0.0575, capitalGainsRate: 0.0575, hasNoStateTax: false },
  'WA': { code: 'WA', name: 'Washington', dividendTaxRate: 0, capitalGainsRate: 0.07, hasNoStateTax: true, specialNotes: 'Capital gains tax on high earners' },
  'WV': { code: 'WV', name: 'West Virginia', dividendTaxRate: 0.065, capitalGainsRate: 0.065, hasNoStateTax: false },
  'WI': { code: 'WI', name: 'Wisconsin', dividendTaxRate: 0.0765, capitalGainsRate: 0.0765, hasNoStateTax: false },
  'WY': { code: 'WY', name: 'Wyoming', dividendTaxRate: 0, capitalGainsRate: 0, hasNoStateTax: true, specialNotes: 'No state income tax' }
};

// Federal tax brackets for 2024
const FEDERAL_TAX_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ],
  married_jointly: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 }
  ]
};

// Qualified dividend and capital gains rates
const QUALIFIED_DIVIDEND_RATES = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.20 }
  ],
  married_jointly: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.20 }
  ]
};

class TaxCalculatorService {
  // Calculate federal tax on qualified dividends
  calculateFederalDividendTax(income: number, filingStatus: 'single' | 'married_jointly' = 'single'): number {
    const brackets = QUALIFIED_DIVIDEND_RATES[filingStatus] || QUALIFIED_DIVIDEND_RATES.single;
    
    for (const bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return income * bracket.rate;
      }
    }
    
    return income * 0.20; // Max rate
  }
  
  // Calculate state tax on dividends
  calculateStateDividendTax(income: number, stateCode: string): number {
    const stateInfo = STATE_TAX_DATA[stateCode];
    if (!stateInfo) return 0;
    
    return income * stateInfo.dividendTaxRate;
  }
  
  // Calculate total tax on dividend income
  calculateDividendTax(
    grossIncome: number,
    stateCode: string,
    filingStatus: 'single' | 'married_jointly' = 'single'
  ): TaxCalculation {
    const federalTax = this.calculateFederalDividendTax(grossIncome, filingStatus);
    const stateTax = this.calculateStateDividendTax(grossIncome, stateCode);
    const totalTax = federalTax + stateTax;
    const netIncome = grossIncome - totalTax;
    const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;
    
    // Calculate savings vs California (worst case)
    const californiaTax = this.calculateStateDividendTax(grossIncome, 'CA');
    const californiaTotal = federalTax + californiaTax;
    const taxSavings = californiaTotal - totalTax;
    
    return {
      grossIncome,
      federalTax,
      stateTax,
      netIncome,
      effectiveRate,
      taxSavings
    };
  }
  
  // Compare tax burden across multiple states
  compareStates(
    grossIncome: number,
    states: string[],
    filingStatus: 'single' | 'married_jointly' = 'single'
  ): Array<{ state: StateInfo; calculation: TaxCalculation }> {
    return states.map(stateCode => ({
      state: STATE_TAX_DATA[stateCode],
      calculation: this.calculateDividendTax(grossIncome, stateCode, filingStatus)
    })).sort((a, b) => a.calculation.effectiveRate - b.calculation.effectiveRate);
  }
  
  // Get best states for dividend income
  getBestStatesForDividends(): StateInfo[] {
    return Object.values(STATE_TAX_DATA)
      .filter(state => state.hasNoStateTax || state.dividendTaxRate === 0)
      .sort((a, b) => {
        // Puerto Rico first (Act 60 benefit)
        if (a.code === 'PR') return -1;
        if (b.code === 'PR') return 1;
        // Then other no-tax states
        return a.name.localeCompare(b.name);
      });
  }
  
  // Calculate ROC vs Dividend tax treatment
  calculateROCvsDividend(
    rocAmount: number,
    dividendAmount: number,
    stateCode: string,
    filingStatus: 'single' | 'married_jointly' = 'single'
  ): {
    rocTax: number;
    dividendTax: TaxCalculation;
    totalTax: number;
    effectiveTaxRate: number;
  } {
    // ROC is not immediately taxable (reduces cost basis)
    const rocTax = 0;
    
    // Calculate dividend tax
    const dividendTax = this.calculateDividendTax(dividendAmount, stateCode, filingStatus);
    
    const totalIncome = rocAmount + dividendAmount;
    const totalTax = rocTax + dividendTax.federalTax + dividendTax.stateTax;
    const effectiveTaxRate = totalIncome > 0 ? totalTax / totalIncome : 0;
    
    return {
      rocTax,
      dividendTax,
      totalTax,
      effectiveTaxRate
    };
  }
  
  // Get tax optimization suggestions
  getTaxOptimizationSuggestions(currentState: string, income: number): string[] {
    const suggestions: string[] = [];
    const currentStateInfo = STATE_TAX_DATA[currentState];
    
    if (!currentStateInfo) return suggestions;
    
    // If in high-tax state, suggest relocating
    if (currentStateInfo.dividendTaxRate > 0.05) {
      suggestions.push(`Consider relocating to a no-tax state to save ${(currentStateInfo.dividendTaxRate * 100).toFixed(1)}% on dividends`);
    }
    
    // Puerto Rico Act 60 suggestion for high earners
    if (income > 100000 && currentState !== 'PR') {
      const prSavings = this.calculateDividendTax(income, 'PR').taxSavings;
      suggestions.push(`Puerto Rico Act 60 could save you $${prSavings?.toFixed(0) || 0} annually on dividend taxes`);
    }
    
    // ROC funds suggestion
    if (income > 50000) {
      suggestions.push('Consider funds with Return of Capital (ROC) distributions for tax-deferred income');
    }
    
    // Tax-loss harvesting
    suggestions.push('Implement tax-loss harvesting to offset capital gains');
    
    // Municipal bonds for high earners in high-tax states
    if (currentStateInfo.dividendTaxRate > 0.07) {
      suggestions.push('Consider tax-free municipal bonds for fixed income allocation');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const taxCalculatorService = new TaxCalculatorService();

// Export cached functions for React Server Components
export const calculateDividendTax = cache(
  (grossIncome: number, stateCode: string, filingStatus?: 'single' | 'married_jointly') =>
    taxCalculatorService.calculateDividendTax(grossIncome, stateCode, filingStatus)
);

export const getBestStatesForDividends = cache(() =>
  taxCalculatorService.getBestStatesForDividends()
);

export const getTaxOptimizationSuggestions = cache(
  (currentState: string, income: number) =>
    taxCalculatorService.getTaxOptimizationSuggestions(currentState, income)
);