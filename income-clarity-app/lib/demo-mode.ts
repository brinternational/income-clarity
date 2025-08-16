/**
 * Demo Mode Service - Let users explore Income Clarity without signing up
 * Implements ONBOARD-002: Demo Mode Implementation
 * 
 * Provides realistic sample portfolio data for users to explore features
 * without committing to full registration process
 */

export interface DemoPortfolio {
  holdings: DemoHolding[]
  totalValue: number
  monthlyIncome: number
  yearToDateIncome: number
  dividendYield: number
  performance: {
    totalReturn: number
    totalReturnPercent: number
    spyComparison: number
    aboveSpyLine: boolean
  }
}

export interface DemoHolding {
  symbol: string
  name: string
  quantity: number
  averageCost: number
  currentValue: number
  dividendYield: number
  monthlyIncome: number
  sector: string
  performanceVsSpy: number
  isOutperforming: boolean
}

export interface DemoExpenses {
  monthly: number
  categories: DemoExpenseCategory[]
  totalCovered: number
  coverageRatio: number
  monthsCovered: number
  nextUncoveredExpense: string
}

export interface DemoExpenseCategory {
  name: string
  amount: number
  covered: boolean
  priority: number
  icon: string
}

export interface DemoUser {
  name: string
  location: string
  taxBracket: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  stressFreeLiving: number
}

export class DemoMode {
  private static instance: DemoMode
  
  static getInstance(): DemoMode {
    if (!DemoMode.instance) {
      DemoMode.instance = new DemoMode()
    }
    return DemoMode.instance
  }

  /**
   * Initialize demo user with realistic portfolio and expense data
   */
  async initializeDemoUser(preferences?: Partial<DemoUser>): Promise<{
    user: DemoUser
    portfolio: DemoPortfolio
    expenses: DemoExpenses
    features: DemoFeatures
  }> {
    const user = this.generateDemoUser(preferences)
    const portfolio = this.generateSamplePortfolio(user)
    const expenses = this.generateTypicalExpenses(user)
    const features = this.getDemoFeatures()

    return {
      user,
      portfolio,
      expenses,
      features
    }
  }

  /**
   * Generate realistic sample portfolio based on user profile
   */
  private generateSamplePortfolio(user: DemoUser): DemoPortfolio {
    const portfolioTemplates = this.getPortfolioTemplates()
    const template = portfolioTemplates[user.riskTolerance]
    
    const holdings: DemoHolding[] = template.holdings.map(holding => ({
      ...holding,
      currentValue: holding.quantity * this.getCurrentPrice(holding.symbol),
      monthlyIncome: (holding.quantity * this.getCurrentPrice(holding.symbol) * holding.dividendYield) / 12,
      performanceVsSpy: this.getPerformanceVsSpy(holding.symbol),
      isOutperforming: this.getPerformanceVsSpy(holding.symbol) > 0
    }))

    const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
    const monthlyIncome = holdings.reduce((sum, holding) => sum + holding.monthlyIncome, 0)
    const yearToDateIncome = monthlyIncome * 8 // August YTD
    const averageDividendYield = holdings.reduce((sum, holding) => 
      sum + (holding.dividendYield * (holding.currentValue / totalValue)), 0
    )

    const totalReturn = holdings.reduce((sum, holding) => 
      sum + (holding.currentValue - (holding.quantity * holding.averageCost)), 0
    )
    const totalReturnPercent = (totalReturn / (totalValue - totalReturn)) * 100

    // Calculate SPY comparison (realistic but slightly positive for motivation)
    const spyReturn = 15.2 // 2024 SPY YTD return
    const portfolioReturn = totalReturnPercent
    const spyComparison = portfolioReturn - spyReturn

    return {
      holdings,
      totalValue,
      monthlyIncome,
      yearToDateIncome,
      dividendYield: averageDividendYield,
      performance: {
        totalReturn,
        totalReturnPercent,
        spyComparison,
        aboveSpyLine: spyComparison > 0
      }
    }
  }

  /**
   * Generate realistic expense categories with coverage analysis
   */
  private generateTypicalExpenses(user: DemoUser): DemoExpenses {
    const baseExpenses = this.getExpenseTemplates()[user.riskTolerance]
    const monthlyIncome = 2850 // Will be calculated from portfolio
    
    // Sort expenses by priority for coverage calculation
    const sortedExpenses = baseExpenses.sort((a, b) => a.priority - b.priority)
    let runningTotal = 0
    let coveredCount = 0
    
    const categories = sortedExpenses.map(expense => {
      runningTotal += expense.amount
      const covered = runningTotal <= monthlyIncome
      if (covered) coveredCount++
      
      return {
        ...expense,
        covered
      }
    })

    const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0)
    const totalCovered = categories.filter(cat => cat.covered)
      .reduce((sum, cat) => sum + cat.amount, 0)
    const coverageRatio = totalCovered / totalExpenses
    const monthsCovered = coverageRatio >= 1 ? 999 : Math.floor(coverageRatio * 12)
    const nextUncovered = categories.find(cat => !cat.covered)?.name || 'All expenses covered!'

    return {
      monthly: totalExpenses,
      categories,
      totalCovered,
      coverageRatio,
      monthsCovered,
      nextUncoveredExpense: nextUncovered
    }
  }

  /**
   * Get portfolio templates by risk tolerance
   */
  private getPortfolioTemplates() {
    return {
      conservative: {
        name: "Conservative Dividend Portfolio",
        holdings: [
          {
            symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', quantity: 180,
            averageCost: 75.50, dividendYield: 0.035, sector: 'Diversified'
          },
          {
            symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', quantity: 120,
            averageCost: 108.25, dividendYield: 0.029, sector: 'Diversified'
          },
          {
            symbol: 'DVY', name: 'iShares Select Dividend ETF', quantity: 85,
            averageCost: 125.80, dividendYield: 0.034, sector: 'Diversified'
          },
          {
            symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats', quantity: 65,
            averageCost: 95.40, dividendYield: 0.018, sector: 'Diversified'
          }
        ]
      },
      moderate: {
        name: "Balanced Dividend Growth Portfolio", 
        holdings: [
          {
            symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', quantity: 220,
            averageCost: 75.50, dividendYield: 0.035, sector: 'Diversified'
          },
          {
            symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF', quantity: 180,
            averageCost: 55.75, dividendYield: 0.022, sector: 'Growth'
          },
          {
            symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', quantity: 140,
            averageCost: 172.30, dividendYield: 0.019, sector: 'Growth'
          },
          {
            symbol: 'SPHD', name: 'Invesco S&P 500 High Dividend Low Volatility ETF', quantity: 95,
            averageCost: 42.15, dividendYield: 0.041, sector: 'Value'
          }
        ]
      },
      aggressive: {
        name: "High-Yield Dividend Portfolio",
        holdings: [
          {
            symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', quantity: 150,
            averageCost: 75.50, dividendYield: 0.035, sector: 'Diversified'
          },
          {
            symbol: 'SPHD', name: 'Invesco S&P 500 High Dividend Low Volatility ETF', quantity: 200,
            averageCost: 42.15, dividendYield: 0.041, sector: 'Value'
          },
          {
            symbol: 'HDV', name: 'iShares Core High Dividend ETF', quantity: 110,
            averageCost: 108.90, dividendYield: 0.038, sector: 'Value'
          },
          {
            symbol: 'SPYD', name: 'SPDR Portfolio S&P 500 High Dividend ETF', quantity: 280,
            averageCost: 38.75, dividendYield: 0.042, sector: 'High Yield'
          }
        ]
      }
    }
  }

  /**
   * Get expense templates by risk tolerance (proxy for income level)
   */
  private getExpenseTemplates() {
    return {
      conservative: [
        { name: 'Housing', amount: 1200, priority: 1, icon: '🏠' },
        { name: 'Food & Groceries', amount: 600, priority: 2, icon: '🛒' },
        { name: 'Transportation', amount: 400, priority: 3, icon: '🚗' },
        { name: 'Utilities', amount: 250, priority: 4, icon: '💡' },
        { name: 'Insurance', amount: 300, priority: 5, icon: '🛡️' },
        { name: 'Healthcare', amount: 200, priority: 6, icon: '⚕️' },
        { name: 'Entertainment', amount: 150, priority: 7, icon: '🎬' },
        { name: 'Miscellaneous', amount: 100, priority: 8, icon: '📦' }
      ],
      moderate: [
        { name: 'Housing', amount: 1800, priority: 1, icon: '🏠' },
        { name: 'Food & Groceries', amount: 800, priority: 2, icon: '🛒' },
        { name: 'Transportation', amount: 600, priority: 3, icon: '🚗' },
        { name: 'Utilities', amount: 350, priority: 4, icon: '💡' },
        { name: 'Insurance', amount: 450, priority: 5, icon: '🛡️' },
        { name: 'Healthcare', amount: 300, priority: 6, icon: '⚕️' },
        { name: 'Entertainment', amount: 400, priority: 7, icon: '🎬' },
        { name: 'Travel', amount: 300, priority: 8, icon: '✈️' },
        { name: 'Miscellaneous', amount: 200, priority: 9, icon: '📦' }
      ],
      aggressive: [
        { name: 'Housing', amount: 2500, priority: 1, icon: '🏠' },
        { name: 'Food & Groceries', amount: 1000, priority: 2, icon: '🛒' },
        { name: 'Transportation', amount: 800, priority: 3, icon: '🚗' },
        { name: 'Utilities', amount: 450, priority: 4, icon: '💡' },
        { name: 'Insurance', amount: 600, priority: 5, icon: '🛡️' },
        { name: 'Healthcare', amount: 400, priority: 6, icon: '⚕️' },
        { name: 'Entertainment', amount: 600, priority: 7, icon: '🎬' },
        { name: 'Travel', amount: 500, priority: 8, icon: '✈️' },
        { name: 'Shopping', amount: 400, priority: 9, icon: '🛍️' },
        { name: 'Hobbies', amount: 300, priority: 10, icon: '🎨' },
        { name: 'Miscellaneous', amount: 250, priority: 11, icon: '📦' }
      ]
    }
  }

  /**
   * Generate demo user profile with smart defaults
   */
  private generateDemoUser(preferences?: Partial<DemoUser>): DemoUser {
    const defaultUser: DemoUser = {
      name: 'Demo User',
      location: 'California', // High tax state for dramatic tax intelligence examples
      taxBracket: 0.24, // Federal + State combined
      riskTolerance: 'moderate',
      experienceLevel: 'intermediate', 
      stressFreeLiving: 5000
    }

    return { ...defaultUser, ...preferences }
  }

  /**
   * Get current stock prices (mock data for demo)
   */
  private getCurrentPrice(symbol: string): number {
    const prices: Record<string, number> = {
      'SCHD': 79.45,
      'VYM': 112.80,
      'DVY': 132.15,
      'NOBL': 98.75,
      'DGRO': 58.90,
      'VIG': 180.25,
      'SPHD': 44.60,
      'HDV': 115.30,
      'SPYD': 41.85
    }
    return prices[symbol] || 100
  }

  /**
   * Get performance vs SPY (mock data for demo)
   */
  private getPerformanceVsSpy(symbol: string): number {
    const performance: Record<string, number> = {
      'SCHD': 2.3,   // Outperforming
      'VYM': -1.8,   // Underperforming  
      'DVY': 1.2,    // Slightly outperforming
      'NOBL': -0.5,  // Slightly underperforming
      'DGRO': 0.8,   // Slightly outperforming
      'VIG': -2.1,   // Underperforming
      'SPHD': 4.2,   // Significantly outperforming
      'HDV': 1.9,    // Outperforming
      'SPYD': -3.2   // Underperforming
    }
    return performance[symbol] || 0
  }

  /**
   * Get demo mode feature configuration
   */
  private getDemoFeatures(): DemoFeatures {
    return {
      superCards: 'full',
      dataRefresh: 'simulated',
      persistence: 'session-only',
      realTimeUpdates: false,
      exportFeatures: false,
      premiumFeatures: true, // Show all features in demo
      aiInsights: 'demo-messages',
      notifications: 'simulated',
      socialFeatures: false
    }
  }
}

export interface DemoFeatures {
  superCards: 'full' | 'limited'
  dataRefresh: 'simulated' | 'disabled'
  persistence: 'session-only' | 'none'
  realTimeUpdates: boolean
  exportFeatures: boolean
  premiumFeatures: boolean
  aiInsights: 'demo-messages' | 'disabled'
  notifications: 'simulated' | 'disabled'
  socialFeatures: boolean
}

// Export singleton instance
export const demoMode = DemoMode.getInstance()

/**
 * Demo mode motivational messages based on portfolio performance
 */
export const getDemoMotivationalMessages = (portfolio: DemoPortfolio, expenses: DemoExpenses) => {
  const messages = []
  
  if (portfolio.performance.aboveSpyLine) {
    messages.push({
      type: 'celebration',
      title: '🎉 You\'re beating SPY!',
      message: `Your portfolio is outperforming the S&P 500 by ${portfolio.performance.spyComparison.toFixed(1)}%`,
      action: 'Keep up the great work!'
    })
  }

  if (expenses.coverageRatio >= 1) {
    messages.push({
      type: 'achievement',
      title: '🏆 Above the Zero Line!',
      message: 'Your dividend income covers 100% of your expenses. You\'ve achieved dividend lifestyle!',
      action: 'Consider increasing your stress-free living target'
    })
  } else {
    const remainingNeeded = expenses.monthly - expenses.totalCovered
    const portfolioGrowthNeeded = (remainingNeeded * 12) / portfolio.dividendYield
    
    messages.push({
      type: 'motivation',
      title: '🎯 Almost there!',
      message: `You need $${remainingNeeded.toFixed(0)} more monthly income to reach the zero line`,
      action: `Add ~$${portfolioGrowthNeeded.toFixed(0)} more in dividend stocks`
    })
  }

  if (portfolio.totalValue > 100000) {
    messages.push({
      type: 'milestone',
      title: '💎 Six-Figure Portfolio!',
      message: 'You\'re in the top 10% of dividend investors',
      action: 'Share your success and inspire others'
    })
  }

  return messages
}