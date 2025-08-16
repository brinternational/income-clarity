/**
 * Smart Defaults and Suggestions Service
 * Implements ONBOARD-004: Smart Defaults and Suggestions
 * 
 * Provides location-based tax defaults, portfolio suggestions, 
 * and personalized recommendations based on user profile
 */

export interface TaxDefaults {
  federalRate: number
  stateRate: number
  combinedRate: number
  qualifiedDividendRate: number
  message: string
  optimization?: string
  color?: 'success' | 'warning' | 'error'
}

export interface PortfolioTemplate {
  name: string
  description: string
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  targetYield: number
  suggestedETFs: string[]
  rationale: string
  sampleHoldings: SampleHolding[]
}

export interface SampleHolding {
  symbol: string
  name: string
  weight: number
  yield: number
  sector: string
  rationale: string
}

export interface PersonalizedSuggestion {
  type: 'tax' | 'portfolio' | 'goal' | 'optimization'
  title: string
  description: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  impact: string
  icon?: string
}

export class SmartDefaults {
  private static instance: SmartDefaults
  
  static getInstance(): SmartDefaults {
    if (!SmartDefaults.instance) {
      SmartDefaults.instance = new SmartDefaults()
    }
    return SmartDefaults.instance
  }

  /**
   * Get tax defaults based on user location
   */
  getTaxDefaults(location: string): TaxDefaults {
    const taxData = this.getStateTaxData()
    const stateData = taxData[location] || taxData['default']
    
    // Federal qualified dividend rates (2024)
    const federalRate = 0.15 // Most common bracket
    const stateRate = stateData.rate
    const combinedRate = federalRate + stateRate
    const qualifiedDividendRate = Math.min(combinedRate, 0.23) // Cap at 20% + 3.8% NIIT

    return {
      federalRate,
      stateRate,
      combinedRate,
      qualifiedDividendRate,
      message: stateData.message,
      optimization: stateData.optimization,
      color: stateData.color
    }
  }

  /**
   * Get portfolio templates based on goals and risk tolerance
   */
  getPortfolioTemplates(riskTolerance?: string, monthlyTarget?: number): PortfolioTemplate[] {
    const templates: PortfolioTemplate[] = [
      {
        name: "Conservative Dividend Focus",
        description: "High-quality dividend stocks with 30+ year track records",
        riskLevel: 'conservative',
        targetYield: 3.2,
        suggestedETFs: ['SCHD', 'VYM', 'DVY', 'NOBL'],
        rationale: "Focus on dividend aristocrats and stable companies. Lower volatility with consistent income growth.",
        sampleHoldings: [
          { symbol: 'SCHD', name: 'Schwab US Dividend Equity', weight: 40, yield: 3.5, sector: 'Diversified', rationale: 'Quality factor screens' },
          { symbol: 'VYM', name: 'Vanguard High Dividend Yield', weight: 30, yield: 2.9, sector: 'Large Cap Value', rationale: 'Broad market exposure' },
          { symbol: 'DVY', name: 'iShares Select Dividend', weight: 20, yield: 3.4, sector: 'Dividend Focused', rationale: '10+ year dividend history' },
          { symbol: 'NOBL', name: 'S&P 500 Dividend Aristocrats', weight: 10, yield: 1.8, sector: 'Aristocrats', rationale: '25+ year dividend growth' }
        ]
      },
      {
        name: "Balanced Dividend Growth", 
        description: "Mix of current income and dividend growth potential",
        riskLevel: 'moderate',
        targetYield: 2.8,
        suggestedETFs: ['SCHD', 'DGRO', 'VIG', 'SPHD'],
        rationale: "Balance between current yield and future dividend growth. Suitable for most investors.",
        sampleHoldings: [
          { symbol: 'SCHD', name: 'Schwab US Dividend Equity', weight: 35, yield: 3.5, sector: 'Quality Value', rationale: 'Best of both worlds' },
          { symbol: 'DGRO', name: 'iShares Core Dividend Growth', weight: 25, yield: 2.2, sector: 'Dividend Growth', rationale: 'Growth focus' },
          { symbol: 'VIG', name: 'Vanguard Dividend Appreciation', weight: 25, yield: 1.9, sector: 'Dividend Growth', rationale: '10+ year growth streak' },
          { symbol: 'SPHD', name: 'S&P 500 High Div Low Vol', weight: 15, yield: 4.1, sector: 'Low Volatility', rationale: 'Higher yield component' }
        ]
      },
      {
        name: "High-Yield Income Focus",
        description: "Maximum current income with higher risk tolerance",
        riskLevel: 'aggressive',
        targetYield: 4.2,
        suggestedETFs: ['SPHD', 'HDV', 'SPYD', 'JEPI'],
        rationale: "Prioritize current income over growth. Suitable for those needing immediate cash flow.",
        sampleHoldings: [
          { symbol: 'SPHD', name: 'S&P 500 High Div Low Vol', weight: 30, yield: 4.1, sector: 'High Yield', rationale: 'Low volatility screening' },
          { symbol: 'HDV', name: 'iShares Core High Dividend', weight: 25, yield: 3.8, sector: 'High Yield Value', rationale: 'Quality high yield' },
          { symbol: 'SPYD', name: 'SPDR S&P 500 High Dividend', weight: 25, yield: 4.2, sector: 'Equal Weight High Yield', rationale: 'Top 80 S&P yielders' },
          { symbol: 'JEPI', name: 'JPM Equity Premium Income', weight: 20, yield: 7.5, sector: 'Covered Call', rationale: 'Enhanced yield strategy' }
        ]
      }
    ]

    if (riskTolerance) {
      return templates.filter(template => template.riskLevel === riskTolerance)
    }

    return templates
  }

  /**
   * Generate personalized suggestions based on user profile
   */
  getPersonalizedSuggestions(profile: {
    location?: string
    riskTolerance?: string
    monthlyExpenses?: number
    currentPortfolioValue?: number
    currentMonthlyIncome?: number
    experienceLevel?: string
  }): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = []

    // Tax optimization suggestions
    if (profile.location) {
      const taxDefaults = this.getTaxDefaults(profile.location)
      
      if (profile.location === 'Puerto Rico') {
        suggestions.push({
          type: 'tax',
          title: '🎉 Incredible Tax Advantage!',
          description: 'Puerto Rico has 0% tax on dividends! This is a massive advantage for dividend investors.',
          action: 'Maximize your dividend-focused strategy',
          priority: 'high',
          impact: 'Could save $1000s annually in taxes',
          icon: '🏝️'
        })
      } else if (taxDefaults.stateRate > 0.10) {
        suggestions.push({
          type: 'tax',
          title: 'High Tax State Strategy',
          description: `${profile.location} has high dividend taxes (${(taxDefaults.stateRate * 100).toFixed(1)}%). Consider tax-efficient strategies.`,
          action: 'Focus on dividend growth vs high yield',
          priority: 'high',
          impact: 'Reduce tax drag on portfolio',
          icon: '📊'
        })
      } else if (taxDefaults.stateRate === 0) {
        suggestions.push({
          type: 'tax',
          title: 'Tax-Friendly State Advantage',
          description: `${profile.location} has no state income tax! You can focus more on high-yield strategies.`,
          action: 'Consider higher-yielding investments',
          priority: 'medium',
          impact: 'Take advantage of tax benefits',
          icon: '💰'
        })
      }
    }

    // Portfolio optimization suggestions
    if (profile.currentPortfolioValue && profile.monthlyExpenses) {
      const monthlyIncome = profile.currentMonthlyIncome || 0
      const coverageRatio = monthlyIncome / profile.monthlyExpenses
      
      if (coverageRatio >= 1) {
        suggestions.push({
          type: 'goal',
          title: '🏆 Above the Zero Line!',
          description: 'Your dividend income covers your expenses! You\'ve achieved dividend lifestyle.',
          action: 'Consider increasing your stress-free living target',
          priority: 'high',
          impact: 'You\'re in the top 5% of dividend investors!',
          icon: '🎯'
        })
      } else {
        const remainingNeeded = profile.monthlyExpenses - monthlyIncome
        const portfolioGrowthNeeded = (remainingNeeded * 12) / 0.035 // Assuming 3.5% yield
        
        suggestions.push({
          type: 'goal',
          title: '🎯 Path to Zero Line',
          description: `You need $${remainingNeeded.toFixed(0)} more monthly income to cover all expenses.`,
          action: `Add ~$${portfolioGrowthNeeded.toFixed(0)} in dividend stocks`,
          priority: 'high',
          impact: 'Achieve financial independence',
          icon: '📈'
        })
      }
    }

    // Experience-based suggestions
    if (profile.experienceLevel === 'beginner') {
      suggestions.push({
        type: 'portfolio',
        title: 'Start with Diversified ETFs',
        description: 'As a beginner, focus on broad dividend ETFs rather than individual stocks.',
        action: 'Consider SCHD or VYM as core holdings',
        priority: 'high',
        impact: 'Reduce risk while learning',
        icon: '🎓'
      })
    } else if (profile.experienceLevel === 'advanced') {
      suggestions.push({
        type: 'optimization',
        title: 'Advanced Strategies Available',
        description: 'With your experience, consider covered call strategies and sector rotation.',
        action: 'Explore JEPI or QYLD for enhanced yield',
        priority: 'medium',
        impact: 'Potentially increase income 50-100%',
        icon: '⚡'
      })
    }

    // Risk tolerance suggestions
    if (profile.riskTolerance === 'conservative' && profile.currentMonthlyIncome && profile.monthlyExpenses) {
      if (profile.currentMonthlyIncome / profile.monthlyExpenses < 0.5) {
        suggestions.push({
          type: 'portfolio',
          title: 'Consider Moderate Risk',
          description: 'Your conservative approach may slow progress toward covering expenses.',
          action: 'Consider adding some dividend growth funds',
          priority: 'medium',
          impact: 'Potentially reach goals 2-3 years sooner',
          icon: '⚖️'
        })
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /**
   * Get optimal expense target based on location and income
   */
  getExpenseRecommendations(location: string, estimatedIncome?: number): {
    conservative: number
    moderate: number  
    comfortable: number
    rationale: string
  } {
    const costOfLiving = this.getCostOfLivingData()
    const locationData = costOfLiving[location] || costOfLiving['default']
    
    const baseExpenses = {
      conservative: locationData.baseExpenses * 0.8,
      moderate: locationData.baseExpenses,
      comfortable: locationData.baseExpenses * 1.3
    }

    return {
      ...baseExpenses,
      rationale: locationData.rationale
    }
  }

  /**
   * State tax data for personalized recommendations
   */
  private getStateTaxData(): Record<string, {
    rate: number
    message: string
    optimization?: string
    color: 'success' | 'warning' | 'error'
  }> {
    return {
      'Puerto Rico': {
        rate: 0,
        message: '🎉 0% tax on dividends! Massive advantage for dividend investing.',
        optimization: 'Maximize high-yield dividend strategies',
        color: 'success'
      },
      'California': {
        rate: 0.133,
        message: 'High tax state (13.3%). Focus on tax-efficient dividend growth strategies.',
        optimization: 'Consider dividend growth over high yield',
        color: 'error'
      },
      'New York': {
        rate: 0.109,
        message: 'High tax state (10.9%). Tax-efficient strategies recommended.',
        optimization: 'Focus on qualified dividends and growth',
        color: 'error'
      },
      'Texas': {
        rate: 0,
        message: '🎉 No state income tax! Great for dividend investing.',
        optimization: 'Take advantage with higher-yield strategies',
        color: 'success'
      },
      'Florida': {
        rate: 0,
        message: '🎉 No state income tax! Ideal for retirees and dividend investors.',
        optimization: 'Maximize yield without state tax concerns',
        color: 'success'
      },
      'Nevada': {
        rate: 0,
        message: 'No state income tax advantage. Focus on total return.',
        color: 'success'
      },
      'Washington': {
        rate: 0,
        message: 'No state income tax on dividends. Great location for investors.',
        color: 'success'
      },
      'Tennessee': {
        rate: 0,
        message: 'No state income tax. Good for dividend-focused strategies.',
        color: 'success'
      },
      'New Hampshire': {
        rate: 0.05,
        message: 'Low dividend tax (5%). Better than most states.',
        color: 'warning'
      },
      'Pennsylvania': {
        rate: 0.031,
        message: 'Moderate tax rate (3.1%). Reasonable for dividend investing.',
        color: 'warning'
      },
      'Massachusetts': {
        rate: 0.05,
        message: 'Moderate tax rate (5%). Consider tax-efficient strategies.',
        color: 'warning'
      },
      'default': {
        rate: 0.05,
        message: 'Estimated 5% state tax rate. Confirm your state\'s actual rates.',
        color: 'warning'
      }
    }
  }

  /**
   * Cost of living data for expense recommendations  
   */
  private getCostOfLivingData(): Record<string, {
    baseExpenses: number
    rationale: string
  }> {
    return {
      'California': {
        baseExpenses: 4500,
        rationale: 'High cost of living, especially housing. Budget accordingly.'
      },
      'New York': {
        baseExpenses: 4200,
        rationale: 'High cost of living in metro areas. Consider location arbitrage.'
      },
      'Texas': {
        baseExpenses: 3200,
        rationale: 'Moderate cost of living with no state income tax benefits.'
      },
      'Florida': {
        baseExpenses: 3000,
        rationale: 'Moderate cost, no state tax. Popular for retirees.'
      },
      'Puerto Rico': {
        baseExpenses: 2400,
        rationale: 'Lower cost of living plus tax advantages make this very attractive.'
      },
      'default': {
        baseExpenses: 3500,
        rationale: 'National average expenses. Adjust based on your local area.'
      }
    }
  }
}

// Export singleton instance
export const smartDefaults = SmartDefaults.getInstance()

/**
 * Get quick start suggestions for immediate next steps
 */
export const getQuickStartSuggestions = (profile: {
  hasPortfolio: boolean
  hasExpenses: boolean  
  hasGoals: boolean
  location?: string
}) => {
  const suggestions = []

  if (!profile.hasPortfolio) {
    suggestions.push({
      title: 'Create Your First Portfolio',
      description: 'Start tracking your dividend investments',
      action: 'Add Holdings',
      urgency: 'high',
      timeEstimate: '5 minutes'
    })
  }

  if (!profile.hasExpenses) {
    suggestions.push({
      title: 'Set Up Expense Tracking', 
      description: 'Know what your dividends need to cover',
      action: 'Add Expenses',
      urgency: 'high',
      timeEstimate: '3 minutes'
    })
  }

  if (!profile.hasGoals) {
    suggestions.push({
      title: 'Define Your Goals',
      description: 'Set targets for financial independence',
      action: 'Set Goals',
      urgency: 'medium',
      timeEstimate: '2 minutes'
    })
  }

  if (profile.location && profile.hasPortfolio) {
    const taxDefaults = smartDefaults.getTaxDefaults(profile.location)
    if (taxDefaults.optimization) {
      suggestions.push({
        title: 'Optimize for Your Location',
        description: taxDefaults.optimization,
        action: 'Review Strategy',
        urgency: 'medium',
        timeEstimate: '10 minutes'
      })
    }
  }

  return suggestions
}