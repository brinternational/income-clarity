/**
 * Tax Efficiency Scoring System - TAX-009
 * 
 * Comprehensive scoring system that evaluates portfolio and location tax efficiency
 * on a 100-point scale with personalized recommendations for optimization.
 * 
 * Scoring Categories:
 * 1. Location Score (40 points) - Based on state/territory tax advantages
 * 2. Portfolio Composition Score (30 points) - Quality of holdings tax treatment
 * 3. Account Type Score (20 points) - Tax-advantaged account usage
 * 4. Strategy Score (10 points) - Active tax management techniques
 */

import { STATE_TAX_INFO } from '@/lib/tax-brackets'
import { Holding, Portfolio, User } from '@/types'

export interface TaxEfficiencyScore {
  totalScore: number
  grade: string
  breakdown: {
    location: TaxCategoryScore
    portfolio: TaxCategoryScore
    accounts: TaxCategoryScore
    strategy: TaxCategoryScore
  }
  recommendations: TaxRecommendation[]
  potentialSavings: number
  lastUpdated: Date
}

export interface TaxCategoryScore {
  score: number
  maxScore: number
  percentage: number
  factors: string[]
}

export interface TaxRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: 'location' | 'portfolio' | 'accounts' | 'strategy'
  title: string
  description: string
  potentialSavings: number
  impact: 'major' | 'moderate' | 'minor'
  actionItems: string[]
  timeToImplement: 'immediate' | 'short-term' | 'long-term'
}

export interface TaxEfficiencyData {
  userLocation: string
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household'
  holdings: Holding[]
  annualDividendIncome: number
  accountTypes?: {
    taxable: number
    traditionalIra: number
    rothIra: number
    k401: number
  }
  strategies?: {
    taxLossHarvesting: boolean
    rocTracking: boolean
    assetLocation: boolean
    qualifiedHoldingPeriods: boolean
  }
}

/**
 * Main function to calculate comprehensive tax efficiency score
 */
export function calculateTaxEfficiencyScore(data: TaxEfficiencyData): TaxEfficiencyScore {
  const locationScore = calculateLocationScore(data.userLocation, data.annualDividendIncome)
  const portfolioScore = calculatePortfolioScore(data.holdings, data.annualDividendIncome)
  const accountScore = calculateAccountScore(data.accountTypes)
  const strategyScore = calculateStrategyScore(data.strategies)
  
  const totalScore = locationScore.score + portfolioScore.score + accountScore.score + strategyScore.score
  const grade = getGradeFromScore(totalScore)
  
  const recommendations = generateRecommendations(data, {
    location: locationScore,
    portfolio: portfolioScore,
    accounts: accountScore,
    strategy: strategyScore
  })
  
  const potentialSavings = calculatePotentialSavings(data, recommendations)
  
  return {
    totalScore,
    grade,
    breakdown: {
      location: locationScore,
      portfolio: portfolioScore,
      accounts: accountScore,
      strategy: strategyScore
    },
    recommendations,
    potentialSavings,
    lastUpdated: new Date()
  }
}

/**
 * Calculate location-based tax score (40 points max)
 */
function calculateLocationScore(location: string, annualIncome: number): TaxCategoryScore {
  const stateInfo = STATE_TAX_INFO[location] || STATE_TAX_INFO['Other']
  let score = 0
  const factors: string[] = []
  
  // Puerto Rico - Maximum advantage (40/40 points)
  if (location === 'Puerto Rico') {
    score = 40
    factors.push('0% tax on qualified dividends')
    factors.push('Federal tax benefits for PR residents')
    factors.push('Maximum tax optimization achieved')
    return {
      score,
      maxScore: 40,
      percentage: 100,
      factors
    }
  }
  
  // No state income tax states (35/40 points)
  if (['Texas', 'Florida', 'Nevada', 'Tennessee', 'New Hampshire', 'South Dakota', 'Wyoming', 'Alaska', 'Washington'].includes(location)) {
    score = 35
    factors.push('No state income tax')
    factors.push('Only federal taxes apply')
    if (annualIncome > 50000) {
      factors.push('Still paying 15-20% federal on qualified dividends')
    }
    return {
      score,
      maxScore: 40,
      percentage: 87.5,
      factors
    }
  }
  
  // High-tax states - Major disadvantage
  if (['California', 'New York', 'New Jersey', 'Connecticut', 'Hawaii'].includes(location)) {
    score = location === 'California' ? 10 : 15
    factors.push(`High state tax burden (${(stateInfo.qualifiedDividendRate * 100).toFixed(1)}%)`)
    factors.push('Combined federal + state rates up to 37.3%')
    factors.push('Major optimization opportunity available')
    return {
      score,
      maxScore: 40,
      percentage: (score / 40) * 100,
      factors
    }
  }
  
  // Medium-tax states (20-30 points)
  score = stateInfo.hasIncomeTax ? 25 : 30
  if (stateInfo.hasIncomeTax) {
    factors.push(`Moderate state tax rate`)
    factors.push('Room for improvement with relocation')
  } else {
    factors.push('Good tax environment')
    factors.push('Minor optimization opportunities remain')
  }
  
  return {
    score,
    maxScore: 40,
    percentage: (score / 40) * 100,
    factors
  }
}

/**
 * Calculate portfolio composition score (30 points max)
 */
function calculatePortfolioScore(holdings: Holding[], annualIncome: number): TaxCategoryScore {
  if (!holdings || holdings.length === 0) {
    return {
      score: 15,
      maxScore: 30,
      percentage: 50,
      factors: ['No portfolio data available', 'Default moderate score assigned']
    }
  }
  
  let score = 0
  const factors: string[] = []
  
  // Calculate qualified dividend percentage (20 points max)
  const totalIncome = holdings.reduce((sum, holding) => sum + (holding.monthlyDividend || 0) * 12, 0)
  const qualifiedIncome = holdings.filter(h => h.taxTreatment === 'qualified')
    .reduce((sum, holding) => sum + (holding.monthlyDividend || 0) * 12, 0)
  
  const qualifiedPercentage = totalIncome > 0 ? (qualifiedIncome / totalIncome) * 100 : 0
  
  // Qualified dividend scoring
  if (qualifiedPercentage >= 90) {
    score += 20
    factors.push(`Excellent: ${qualifiedPercentage.toFixed(1)}% qualified dividends`)
  } else if (qualifiedPercentage >= 75) {
    score += 16
    factors.push(`Good: ${qualifiedPercentage.toFixed(1)}% qualified dividends`)
  } else if (qualifiedPercentage >= 50) {
    score += 12
    factors.push(`Fair: ${qualifiedPercentage.toFixed(1)}% qualified dividends`)
  } else {
    score += 6
    factors.push(`Poor: Only ${qualifiedPercentage.toFixed(1)}% qualified dividends`)
  }
  
  // Tax-efficient ETFs and funds (10 points max)
  const taxEfficientTickers = ['VTI', 'VXUS', 'VEU', 'VWO', 'VNQ', 'VYM', 'VGIT', 'VTEB']
  const taxEfficientHoldings = holdings.filter(h => 
    taxEfficientTickers.some(ticker => h.ticker.toUpperCase().includes(ticker.toUpperCase()))
  )
  
  const taxEfficientPercentage = holdings.length > 0 ? (taxEfficientHoldings.length / holdings.length) * 100 : 0
  
  if (taxEfficientPercentage >= 50) {
    score += 10
    factors.push(`${taxEfficientPercentage.toFixed(1)}% tax-efficient ETFs/funds`)
  } else if (taxEfficientPercentage >= 25) {
    score += 7
    factors.push(`${taxEfficientPercentage.toFixed(1)}% tax-efficient holdings`)
  } else if (taxEfficientPercentage >= 10) {
    score += 4
    factors.push(`Some tax-efficient holdings (${taxEfficientPercentage.toFixed(1)}%)`)
  } else {
    score += 1
    factors.push('Limited tax-efficient holdings')
  }
  
  // Penalty for high ordinary dividend exposure
  const ordinaryIncome = holdings.filter(h => h.taxTreatment === 'ordinary')
    .reduce((sum, holding) => sum + (holding.monthlyDividend || 0) * 12, 0)
  const ordinaryPercentage = totalIncome > 0 ? (ordinaryIncome / totalIncome) * 100 : 0
  
  if (ordinaryPercentage > 25) {
    score = Math.max(score - 5, 0)
    factors.push(`Warning: ${ordinaryPercentage.toFixed(1)}% ordinary dividends (high tax)`)
  }
  
  return {
    score,
    maxScore: 30,
    percentage: (score / 30) * 100,
    factors
  }
}

/**
 * Calculate account type optimization score (20 points max)
 */
function calculateAccountScore(accountTypes?: TaxEfficiencyData['accountTypes']): TaxCategoryScore {
  if (!accountTypes) {
    return {
      score: 10,
      maxScore: 20,
      percentage: 50,
      factors: ['No account type data available', 'Assuming basic taxable account setup']
    }
  }
  
  let score = 0
  const factors: string[] = []
  
  const totalAssets = accountTypes.taxable + accountTypes.traditionalIra + accountTypes.rothIra + accountTypes.k401
  
  if (totalAssets === 0) {
    return {
      score: 0,
      maxScore: 20,
      percentage: 0,
      factors: ['No assets detected']
    }
  }
  
  const taxablePercentage = (accountTypes.taxable / totalAssets) * 100
  const taxAdvantagePercentage = ((accountTypes.traditionalIra + accountTypes.rothIra + accountTypes.k401) / totalAssets) * 100
  
  // Base score for having tax-advantaged accounts (15 points max)
  if (taxAdvantagePercentage >= 60) {
    score += 15
    factors.push(`Excellent: ${taxAdvantagePercentage.toFixed(1)}% in tax-advantaged accounts`)
  } else if (taxAdvantagePercentage >= 40) {
    score += 12
    factors.push(`Good: ${taxAdvantagePercentage.toFixed(1)}% in tax-advantaged accounts`)
  } else if (taxAdvantagePercentage >= 20) {
    score += 8
    factors.push(`Fair: ${taxAdvantagePercentage.toFixed(1)}% in tax-advantaged accounts`)
  } else if (taxAdvantagePercentage > 0) {
    score += 4
    factors.push(`Basic: ${taxAdvantagePercentage.toFixed(1)}% in tax-advantaged accounts`)
  } else {
    factors.push('No tax-advantaged accounts detected')
  }
  
  // Asset location optimization bonus (5 points max)
  if (accountTypes.rothIra > 0) {
    score += 3
    factors.push('Roth IRA provides tax-free growth')
  }
  
  if (accountTypes.k401 > 0) {
    score += 2
    factors.push('401(k) provides tax-deferred growth')
  }
  
  return {
    score: Math.min(score, 20),
    maxScore: 20,
    percentage: (Math.min(score, 20) / 20) * 100,
    factors
  }
}

/**
 * Calculate tax strategy score (10 points max)
 */
function calculateStrategyScore(strategies?: TaxEfficiencyData['strategies']): TaxCategoryScore {
  if (!strategies) {
    return {
      score: 2,
      maxScore: 10,
      percentage: 20,
      factors: ['No tax strategy data available', 'Assuming basic buy-and-hold approach']
    }
  }
  
  let score = 0
  const factors: string[] = []
  
  // Tax loss harvesting (3 points)
  if (strategies.taxLossHarvesting) {
    score += 3
    factors.push('Tax loss harvesting active')
  } else {
    factors.push('Tax loss harvesting not implemented')
  }
  
  // Return of capital tracking (3 points)
  if (strategies.rocTracking) {
    score += 3
    factors.push('Return of capital tracking active')
  } else {
    factors.push('ROC tracking not implemented')
  }
  
  // Qualified holding periods (4 points)
  if (strategies.qualifiedHoldingPeriods) {
    score += 4
    factors.push('Maintaining qualified holding periods')
  } else {
    factors.push('Not optimizing holding periods for tax rates')
  }
  
  return {
    score,
    maxScore: 10,
    percentage: (score / 10) * 100,
    factors
  }
}

/**
 * Convert numerical score to letter grade
 */
function getGradeFromScore(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Generate personalized tax optimization recommendations
 */
function generateRecommendations(
  data: TaxEfficiencyData,
  scores: {
    location: TaxCategoryScore
    portfolio: TaxCategoryScore
    accounts: TaxCategoryScore
    strategy: TaxCategoryScore
  }
): TaxRecommendation[] {
  const recommendations: TaxRecommendation[] = []
  
  // Location recommendations
  if (scores.location.score < 35 && data.annualDividendIncome > 30000) {
    const puertoRicoSavings = calculateLocationSavings(data.userLocation, 'Puerto Rico', data.annualDividendIncome)
    
    if (puertoRicoSavings > 5000) {
      recommendations.push({
        id: 'relocate-puerto-rico',
        priority: 'high',
        category: 'location',
        title: 'Consider Puerto Rico Relocation',
        description: `Moving to Puerto Rico would eliminate taxes on qualified dividends, saving approximately $${puertoRicoSavings.toLocaleString()} annually.`,
        potentialSavings: puertoRicoSavings,
        impact: 'major',
        actionItems: [
          'Research Act 60 investor incentives',
          'Consult with PR tax attorney',
          'Evaluate 183-day residency requirements',
          'Plan transition timeline'
        ],
        timeToImplement: 'long-term'
      })
    }
    
    // No-tax state alternatives
    const noTaxStates = ['Texas', 'Florida', 'Nevada', 'Tennessee']
    const currentStateInNoTax = noTaxStates.includes(data.userLocation)
    
    if (!currentStateInNoTax && data.userLocation !== 'Puerto Rico') {
      const stateSavings = calculateLocationSavings(data.userLocation, 'Texas', data.annualDividendIncome)
      
      if (stateSavings > 2000) {
        recommendations.push({
          id: 'relocate-no-tax-state',
          priority: 'medium',
          category: 'location',
          title: 'Consider No-Tax State Move',
          description: `Moving to Texas, Florida, or similar no-tax states could save $${stateSavings.toLocaleString()} annually in state taxes.`,
          potentialSavings: stateSavings,
          impact: 'moderate',
          actionItems: [
            'Research business/lifestyle factors',
            'Compare cost of living differences',
            'Plan domicile change process'
          ],
          timeToImplement: 'long-term'
        })
      }
    }
  }
  
  // Portfolio recommendations
  if (scores.portfolio.percentage < 75) {
    const qualifiedHoldings = data.holdings.filter(h => h.taxTreatment === 'qualified').length
    const totalHoldings = data.holdings.length
    
    if (qualifiedHoldings < totalHoldings * 0.8) {
      recommendations.push({
        id: 'increase-qualified-dividends',
        priority: 'high',
        category: 'portfolio',
        title: 'Optimize for Qualified Dividends',
        description: 'Switch ordinary dividend holdings to qualified dividend stocks/ETFs for better tax treatment.',
        potentialSavings: data.annualDividendIncome * 0.15, // Estimated 15% tax differential
        impact: 'moderate',
        actionItems: [
          'Replace REITs with dividend-focused ETFs where possible',
          'Consider VXUS over emerging market bond funds',
          'Review individual stocks for qualified status'
        ],
        timeToImplement: 'short-term'
      })
    }
    
    // Tax-efficient ETF recommendation
    const taxEfficientTickers = ['VTI', 'VXUS', 'VEU', 'VYM', 'VTEB']
    const hasEfficientETFs = data.holdings.some(h => 
      taxEfficientTickers.some(ticker => h.ticker.toUpperCase().includes(ticker))
    )
    
    if (!hasEfficientETFs) {
      recommendations.push({
        id: 'add-tax-efficient-etfs',
        priority: 'medium',
        category: 'portfolio',
        title: 'Add Tax-Efficient ETFs',
        description: 'Include broad market ETFs like VTI, VXUS, or VYM for better tax efficiency.',
        potentialSavings: data.annualDividendIncome * 0.05, // Estimated 5% efficiency gain
        impact: 'moderate',
        actionItems: [
          'Research Vanguard tax-managed funds',
          'Consider VTI for domestic exposure',
          'Evaluate VTEB for tax-free income'
        ],
        timeToImplement: 'short-term'
      })
    }
  }
  
  // Account type recommendations
  if (scores.accounts.percentage < 60) {
    recommendations.push({
      id: 'maximize-tax-advantaged',
      priority: 'high',
      category: 'accounts',
      title: 'Maximize Tax-Advantaged Accounts',
      description: 'Move more assets to IRA, Roth IRA, or 401(k) accounts for tax-deferred/tax-free growth.',
      potentialSavings: data.annualDividendIncome * 0.20, // Estimated 20% of income in tax savings
      impact: 'major',
      actionItems: [
        'Max out 401(k) contributions ($23,000 in 2024)',
        'Contribute to IRA/Roth IRA ($7,000 limit)',
        'Consider backdoor Roth conversion',
        'Implement asset location strategy'
      ],
      timeToImplement: 'immediate'
    })
  }
  
  // Strategy recommendations
  if (scores.strategy.percentage < 50) {
    if (!data.strategies?.taxLossHarvesting) {
      recommendations.push({
        id: 'implement-tax-loss-harvesting',
        priority: 'medium',
        category: 'strategy',
        title: 'Implement Tax Loss Harvesting',
        description: 'Systematically realize losses to offset gains and reduce tax burden.',
        potentialSavings: data.annualDividendIncome * 0.03, // Estimated 3% of income
        impact: 'minor',
        actionItems: [
          'Set up automated tax loss harvesting',
          'Review holdings quarterly for opportunities',
          'Avoid wash sale rules'
        ],
        timeToImplement: 'immediate'
      })
    }
    
    if (!data.strategies?.rocTracking) {
      recommendations.push({
        id: 'track-return-of-capital',
        priority: 'low',
        category: 'strategy',
        title: 'Track Return of Capital',
        description: 'Properly track ROC distributions to avoid overpaying taxes on non-taxable returns.',
        potentialSavings: data.annualDividendIncome * 0.02, // Estimated 2% of income
        impact: 'minor',
        actionItems: [
          'Set up ROC tracking spreadsheet',
          'Review fund distributions annually',
          'Adjust cost basis properly'
        ],
        timeToImplement: 'short-term'
      })
    }
  }
  
  // Sort by priority and potential savings
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return b.potentialSavings - a.potentialSavings
  }).slice(0, 5) // Return top 5 recommendations
}

/**
 * Calculate potential tax savings from location change
 */
function calculateLocationSavings(currentLocation: string, targetLocation: string, annualIncome: number): number {
  const currentInfo = STATE_TAX_INFO[currentLocation] || STATE_TAX_INFO['Other']
  const targetInfo = STATE_TAX_INFO[targetLocation] || STATE_TAX_INFO['Other']
  
  const currentRate = currentInfo.qualifiedDividendRate
  const targetRate = targetInfo.qualifiedDividendRate
  
  return (currentRate - targetRate) * annualIncome
}

/**
 * Calculate total potential savings from all recommendations
 */
function calculatePotentialSavings(data: TaxEfficiencyData, recommendations: TaxRecommendation[]): number {
  return recommendations.reduce((total, rec) => total + rec.potentialSavings, 0)
}

/**
 * Get color for score visualization
 */
export function getScoreColor(score: number): { bg: string; text: string; ring: string } {
  if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500' }
  if (score >= 80) return { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-500' }
  if (score >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-500' }
  if (score >= 60) return { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-500' }
  return { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-500' }
}

/**
 * Get grade description for user clarity
 */
export function getGradeDescription(grade: string): string {
  const descriptions = {
    'A+': 'Tax optimization genius! You are maximizing every opportunity.',
    'A': 'Excellent tax efficiency with very minor optimization opportunities.',
    'B': 'Good tax management with some room for improvement.',
    'C': 'Average efficiency with several optimization opportunities missed.',
    'D': 'Poor tax efficiency - action needed to improve your situation.',
    'F': 'Critical tax inefficiency - major improvements needed immediately.'
  }
  return descriptions[grade as keyof typeof descriptions] || 'Tax efficiency needs evaluation.'
}