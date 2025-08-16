// Tax Bracket Calculations for 2024
// Federal tax brackets and state tax estimation utilities

export interface TaxBracket {
  min: number
  max: number
  rate: number
}

export interface TaxCalculationResult {
  federalTax: number
  stateTax: number
  totalTax: number
  effectiveRate: number
  marginalRate: number
  currentBracket: TaxBracket
  bracketIndex: number
}

export interface StateTaxInfo {
  name: string
  hasIncomeTax: boolean
  flatRate?: number
  brackets?: TaxBracket[]
  qualifiedDividendRate: number
  specialFeatures?: string[]
}

// 2024 Federal Tax Brackets
export const FEDERAL_TAX_BRACKETS_2024: Record<string, TaxBracket[]> = {
  'Single': [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191050, rate: 0.24 },
    { min: 191050, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ],
  'Married Filing Jointly': [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 }
  ],
  'Married Filing Separately': [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 365600, rate: 0.35 },
    { min: 365600, max: Infinity, rate: 0.37 }
  ],
  'Head of Household': [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191050, rate: 0.24 },
    { min: 191050, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ]
}

// State Tax Information
export const STATE_TAX_INFO: Record<string, StateTaxInfo> = {
  'Puerto Rico': {
    name: 'Puerto Rico',
    hasIncomeTax: true,
    flatRate: 0.04,
    qualifiedDividendRate: 0.0, // Special benefit - 0% on qualified dividends
    specialFeatures: ['0% qualified dividends', '4% flat rate on other income', 'No federal taxes for PR residents']
  },
  'Texas': {
    name: 'Texas',
    hasIncomeTax: false,
    qualifiedDividendRate: 0.15, // Federal rate applies
    specialFeatures: ['No state income tax', 'Business-friendly environment']
  },
  'Florida': {
    name: 'Florida',
    hasIncomeTax: false,
    qualifiedDividendRate: 0.15,
    specialFeatures: ['No state income tax', 'No inheritance tax']
  },
  'California': {
    name: 'California',
    hasIncomeTax: true,
    brackets: [
      { min: 0, max: 10099, rate: 0.01 },
      { min: 10099, max: 23942, rate: 0.02 },
      { min: 23942, max: 37788, rate: 0.04 },
      { min: 37788, max: 52455, rate: 0.06 },
      { min: 52455, max: 66295, rate: 0.08 },
      { min: 66295, max: 338639, rate: 0.093 },
      { min: 338639, max: 406364, rate: 0.103 },
      { min: 406364, max: 677278, rate: 0.113 },
      { min: 677278, max: Infinity, rate: 0.123 }
    ],
    qualifiedDividendRate: 0.20,
    specialFeatures: ['Progressive brackets', 'High earner surcharges']
  },
  'New York': {
    name: 'New York',
    hasIncomeTax: true,
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.0585 },
      { min: 80650, max: 215400, rate: 0.0625 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 }
    ],
    qualifiedDividendRate: 0.20,
    specialFeatures: ['NYC additional tax may apply', 'High earner rates']
  },
  'Other': {
    name: 'Other State',
    hasIncomeTax: true,
    flatRate: 0.05,
    qualifiedDividendRate: 0.15,
    specialFeatures: ['Average state tax rate']
  }
}

/**
 * Map ProfileSetupData filing status to tax bracket filing status
 */
function mapFilingStatus(status: string): string {
  const mapping: Record<string, string> = {
    'single': 'Single',
    'married_joint': 'Married Filing Jointly',
    'married_separate': 'Married Filing Separately',
    'head_of_household': 'Head of Household'
  }
  return mapping[status] || 'Single'
}

/**
 * Calculate federal tax based on income and filing status
 */
export function calculateFederalTax(income: number, filingStatus: string): TaxCalculationResult {
  const mappedStatus = mapFilingStatus(filingStatus)
  const brackets = FEDERAL_TAX_BRACKETS_2024[mappedStatus] || FEDERAL_TAX_BRACKETS_2024['Single']
  let tax = 0
  let currentBracket = brackets[0]
  let bracketIndex = 0

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i]
    
    if (income > bracket.min) {
      const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min
      tax += taxableInThisBracket * bracket.rate
      currentBracket = bracket
      bracketIndex = i
    } else {
      break
    }
  }

  const effectiveRate = income > 0 ? tax / income : 0
  const marginalRate = currentBracket.rate

  return {
    federalTax: tax,
    stateTax: 0, // Federal calculation only
    totalTax: tax,
    effectiveRate,
    marginalRate,
    currentBracket,
    bracketIndex
  }
}

/**
 * Calculate state tax based on income and state
 */
export function calculateStateTax(income: number, state: string): number {
  const stateInfo = STATE_TAX_INFO[state] || STATE_TAX_INFO['Other']
  
  if (!stateInfo.hasIncomeTax) {
    return 0
  }

  if (stateInfo.flatRate) {
    return income * stateInfo.flatRate
  }

  if (stateInfo.brackets) {
    let tax = 0
    for (const bracket of stateInfo.brackets) {
      if (income > bracket.min) {
        const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min
        tax += taxableInThisBracket * bracket.rate
      } else {
        break
      }
    }
    return tax
  }

  return 0
}

/**
 * Calculate total tax burden including federal and state
 */
export function calculateTotalTaxBurden(
  income: number, 
  filingStatus: string, 
  state: string
): TaxCalculationResult {
  const federalResult = calculateFederalTax(income, filingStatus)
  const stateTax = calculateStateTax(income, state)
  
  const totalTax = federalResult.federalTax + stateTax
  const effectiveRate = income > 0 ? totalTax / income : 0

  return {
    ...federalResult,
    stateTax,
    totalTax,
    effectiveRate
  }
}

/**
 * Get qualified dividend tax rate for a specific state
 */
export function getQualifiedDividendRate(state: string, filingStatus: string, income: number): number {
  const stateInfo = STATE_TAX_INFO[state] || STATE_TAX_INFO['Other']
  
  // Puerto Rico special case - 0% on qualified dividends
  if (state === 'Puerto Rico') {
    return 0
  }

  const mappedStatus = mapFilingStatus(filingStatus)
  
  // Federal qualified dividend rates (2024)
  if (mappedStatus === 'Single') {
    if (income <= 47025) return 0
    if (income <= 518900) return 0.15
    return 0.20
  } else if (mappedStatus === 'Married Filing Jointly') {
    if (income <= 94050) return 0
    if (income <= 583750) return 0.15
    return 0.20
  } else if (mappedStatus === 'Head of Household') {
    if (income <= 63000) return 0
    if (income <= 551350) return 0.15
    return 0.20
  }
  
  return stateInfo.qualifiedDividendRate
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}