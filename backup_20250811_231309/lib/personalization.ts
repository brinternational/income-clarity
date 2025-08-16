/**
 * Personalization Engine - Customize experience based on user profile
 * Implements ONBOARD-007: Personalization Engine
 * 
 * Provides personalized insights, recommendations, and celebrates 
 * user achievements based on their unique financial situation
 */

export interface UserProfile {
  name?: string
  location?: string
  taxBracket?: number
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  portfolioValue?: number
  monthlyIncome?: number
  monthlyExpenses?: number
  stressFreeLiving?: number
  age?: number
  retirementGoal?: number
  investmentTimeframe?: string
}

export interface PersonalizedInsight {
  id: string
  type: 'celebration' | 'milestone' | 'achievement' | 'optimization' | 'warning' | 'goal'
  title: string
  message: string
  action?: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  shareWorthy: boolean
  icon: string
  color: 'success' | 'warning' | 'error' | 'info'
  impact?: string
  timeframe?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  category: 'portfolio' | 'income' | 'coverage' | 'performance' | 'optimization'
  rarity: 'common' | 'rare' | 'legendary'
  shareText?: string
}

export interface PersonalizationSettings {
  celebrateAchievements: boolean
  showComparisons: boolean
  pushMotivation: boolean
  shareableContent: boolean
  detailLevel: 'basic' | 'detailed' | 'expert'
  focusArea: 'income' | 'growth' | 'safety' | 'optimization'
}

export class PersonalizationEngine {
  private static instance: PersonalizationEngine
  
  static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine()
    }
    return PersonalizationEngine.instance
  }

  /**
   * Generate personalized insights based on user profile and current state
   */
  async personalizeForUser(profile: UserProfile, settings?: PersonalizationSettings): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = []
    const defaultSettings: PersonalizationSettings = {
      celebrateAchievements: true,
      showComparisons: true,
      pushMotivation: true,
      shareableContent: true,
      detailLevel: 'detailed',
      focusArea: 'income',
      ...settings
    }

    // Location-based insights
    if (profile.location) {
      insights.push(...this.generateLocationInsights(profile))
    }

    // Portfolio milestone insights
    if (profile.portfolioValue) {
      insights.push(...this.generatePortfolioMilestoneInsights(profile))
    }

    // Income coverage insights
    if (profile.monthlyIncome && profile.monthlyExpenses) {
      insights.push(...this.generateIncomeCoverageInsights(profile))
    }

    // Performance insights
    insights.push(...this.generatePerformanceInsights(profile))

    // Optimization opportunities
    insights.push(...this.generateOptimizationInsights(profile))

    // Goal progress insights
    if (profile.stressFreeLiving || profile.retirementGoal) {
      insights.push(...this.generateGoalProgressInsights(profile))
    }

    // Experience-level insights
    if (profile.experienceLevel) {
      insights.push(...this.generateExperienceLevelInsights(profile))
    }

    // Sort by priority and personalization settings
    return this.prioritizeInsights(insights, defaultSettings)
  }

  /**
   * Check for newly unlocked achievements
   */
  checkAchievements(profile: UserProfile, previousProfile?: UserProfile): Achievement[] {
    const newAchievements: Achievement[] = []
    const achievements = this.getAllAchievements()

    for (const achievement of achievements) {
      if (this.isAchievementUnlocked(achievement, profile) && 
          !this.isAchievementUnlocked(achievement, previousProfile)) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        })
      }
    }

    return newAchievements
  }

  /**
   * Get personalized dashboard greeting
   */
  getPersonalizedGreeting(profile: UserProfile): string {
    const hour = new Date().getHours()
    let timeGreeting = 'Good morning'
    if (hour >= 12) timeGreeting = 'Good afternoon'  
    if (hour >= 17) timeGreeting = 'Good evening'
    if (hour >= 22 || hour < 6) timeGreeting = 'Working late'

    const name = profile.name || 'there'
    
    // Add personalized context
    if (profile.monthlyIncome && profile.monthlyExpenses) {
      const coverageRatio = profile.monthlyIncome / profile.monthlyExpenses
      if (coverageRatio >= 1) {
        return `${timeGreeting}, ${name}! 🎉 You're above the zero line!`
      } else {
        const progress = Math.round(coverageRatio * 100)
        return `${timeGreeting}, ${name}! You're ${progress}% to the zero line 📈`
      }
    }

    if (profile.portfolioValue && profile.portfolioValue > 100000) {
      return `${timeGreeting}, ${name}! 💎 Your portfolio is looking strong!`
    }

    return `${timeGreeting}, ${name}! Ready to grow your dividend income? 🚀`
  }

  /**
   * Get personalized motivational message
   */
  getMotivationalMessage(profile: UserProfile): PersonalizedInsight | null {
    if (profile.monthlyIncome && profile.monthlyExpenses) {
      const coverageRatio = profile.monthlyIncome / profile.monthlyExpenses
      const remainingNeeded = Math.max(0, profile.monthlyExpenses - profile.monthlyIncome)
      
      if (coverageRatio >= 1.5) {
        return {
          id: 'motivation-exceed',
          type: 'celebration',
          title: '🔥 Crushing It!',
          message: `Your dividend income exceeds your expenses by ${Math.round((coverageRatio - 1) * 100)}%!`,
          priority: 'high',
          shareWorthy: true,
          icon: '🏆',
          color: 'success',
          action: 'Share your success story'
        }
      } else if (coverageRatio >= 1) {
        return {
          id: 'motivation-achieved',
          type: 'achievement',
          title: '🎯 Mission Accomplished!',
          message: 'You\'ve achieved dividend lifestyle! Your income covers all expenses.',
          priority: 'high',
          shareWorthy: true,
          icon: '✅',
          color: 'success',
          action: 'Celebrate and set new goals'
        }
      } else if (coverageRatio >= 0.8) {
        return {
          id: 'motivation-close',
          type: 'goal',
          title: '🎯 So Close!',
          message: `Just $${remainingNeeded.toFixed(0)} more monthly income to reach the zero line!`,
          priority: 'high',
          shareWorthy: false,
          icon: '🎯',
          color: 'warning',
          action: 'Add to your dividend portfolio',
          timeframe: 'You could achieve this in 3-6 months'
        }
      } else {
        const portfolioGrowthNeeded = (remainingNeeded * 12) / 0.035
        return {
          id: 'motivation-building', 
          type: 'goal',
          title: '🚀 Building Momentum',
          message: `You're ${Math.round(coverageRatio * 100)}% to dividend lifestyle. Keep going!`,
          priority: 'medium',
          shareWorthy: false,
          icon: '📈',
          color: 'info',
          action: `Add ~$${portfolioGrowthNeeded.toFixed(0)} more in dividend stocks`,
          timeframe: 'Steady progress toward financial freedom'
        }
      }
    }

    return null
  }

  /**
   * Generate location-based insights
   */
  private generateLocationInsights(profile: UserProfile): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = []
    
    if (profile.location === 'Puerto Rico') {
      insights.push({
        id: 'location-pr-advantage',
        type: 'celebration',
        title: '🏝️ Tax Paradise!',
        message: 'You have a HUGE tax advantage! 0% tax on dividends in Puerto Rico.',
        action: 'Maximize your dividend-focused strategy',
        priority: 'high',
        shareWorthy: true,
        icon: '🎉',
        color: 'success',
        impact: 'Could save $5,000+ annually vs. high-tax states'
      })
    } else if (['California', 'New York', 'Hawaii', 'New Jersey'].includes(profile.location || '')) {
      const stateTax = profile.location === 'California' ? 13.3 : 
                     profile.location === 'New York' ? 10.9 :
                     profile.location === 'Hawaii' ? 11 : 9.9
      
      insights.push({
        id: 'location-high-tax',
        type: 'optimization',
        title: '📊 Tax Strategy Important',
        message: `${profile.location} has high dividend taxes (${stateTax}%). Focus on tax-efficient strategies.`,
        action: 'Consider dividend growth over high yield',
        priority: 'high',
        shareWorthy: false,
        icon: '🧠',
        color: 'warning',
        impact: 'Reduce tax drag on your portfolio'
      })
    } else if (['Texas', 'Florida', 'Nevada', 'Washington', 'Tennessee'].includes(profile.location || '')) {
      insights.push({
        id: 'location-tax-friendly',
        type: 'achievement',
        title: '💰 Tax Advantage State!',
        message: `${profile.location} has no state income tax on dividends. Great choice!`,
        action: 'Take advantage with higher-yield strategies',
        priority: 'medium',
        shareWorthy: true,
        icon: '🎯',
        color: 'success',
        impact: 'Save thousands vs. high-tax states'
      })
    }

    return insights
  }

  /**
   * Generate portfolio milestone insights
   */
  private generatePortfolioMilestoneInsights(profile: UserProfile): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = []
    const portfolioValue = profile.portfolioValue || 0

    if (portfolioValue >= 1000000) {
      insights.push({
        id: 'portfolio-millionaire',
        type: 'milestone',
        title: '🏆 MILLIONAIRE STATUS!',
        message: 'You\'ve joined the millionaire club! You\'re in the top 1% of dividend investors.',
        action: 'Share your incredible achievement',
        priority: 'urgent',
        shareWorthy: true,
        icon: '💎',
        color: 'success',
        impact: 'Elite dividend investor status achieved!'
      })
    } else if (portfolioValue >= 500000) {
      insights.push({
        id: 'portfolio-half-million',
        type: 'milestone',
        title: '💎 Half Million Milestone!',
        message: 'Your portfolio hit $500K! You\'re in the top 5% of dividend investors.',
        action: 'Keep building toward $1M',
        priority: 'high',
        shareWorthy: true,
        icon: '🚀',
        color: 'success',
        impact: 'Major milestone achieved!'
      })
    } else if (portfolioValue >= 250000) {
      insights.push({
        id: 'portfolio-quarter-million',
        type: 'milestone',
        title: '🎯 Quarter Million Mark!',
        message: 'Your portfolio reached $250K! Serious dividend income potential.',
        action: 'Optimize for higher yield',
        priority: 'high',
        shareWorthy: true,
        icon: '📈',
        color: 'success'
      })
    } else if (portfolioValue >= 100000) {
      insights.push({
        id: 'portfolio-six-figures',
        type: 'milestone',
        title: '💎 Six-Figure Portfolio!',
        message: 'You\'ve hit six figures! You\'re in the top 10% of dividend investors.',
        action: 'Focus on sustainable dividend growth',
        priority: 'high',
        shareWorthy: true,
        icon: '🎉',
        color: 'success'
      })
    } else if (portfolioValue >= 50000) {
      insights.push({
        id: 'portfolio-growing',
        type: 'goal',
        title: '📈 Great Progress!',
        message: 'Your portfolio is building nicely. $100K is your next major milestone.',
        action: 'Stay consistent with your investing',
        priority: 'medium',
        shareWorthy: false,
        icon: '🚀',
        color: 'info'
      })
    }

    return insights
  }

  /**
   * Generate income coverage insights
   */
  private generateIncomeCoverageInsights(profile: UserProfile): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = []
    
    if (!profile.monthlyIncome || !profile.monthlyExpenses) return insights
    
    const coverageRatio = profile.monthlyIncome / profile.monthlyExpenses
    const monthlyGap = profile.monthlyExpenses - profile.monthlyIncome

    if (coverageRatio >= 2.0) {
      insights.push({
        id: 'coverage-double',
        type: 'celebration',
        title: '🔥 Double Coverage!',
        message: 'Your dividend income is DOUBLE your expenses! You\'ve achieved elite status.',
        action: 'Consider aggressive growth or early retirement',
        priority: 'urgent',
        shareWorthy: true,
        icon: '👑',
        color: 'success',
        impact: 'Elite dividend lifestyle achieved!'
      })
    } else if (coverageRatio >= 1.5) {
      insights.push({
        id: 'coverage-comfortable',
        type: 'achievement',
        title: '😎 Comfortable Living!',
        message: `Your income exceeds expenses by ${Math.round((coverageRatio - 1) * 100)}%. Living stress-free!`,
        action: 'Enjoy your financial freedom',
        priority: 'high',
        shareWorthy: true,
        icon: '🏖️',
        color: 'success'
      })
    } else if (coverageRatio >= 1.0) {
      insights.push({
        id: 'coverage-achieved',
        type: 'achievement',
        title: '🎉 ABOVE THE ZERO LINE!',
        message: 'You\'ve achieved dividend lifestyle! Your income covers 100% of expenses.',
        action: 'Celebrate and set new stretch goals',
        priority: 'high',
        shareWorthy: true,
        icon: '🎯',
        color: 'success',
        impact: 'Dividend lifestyle achieved!'
      })
    } else if (coverageRatio >= 0.8) {
      insights.push({
        id: 'coverage-close',
        type: 'goal',
        title: '⚡ Almost There!',
        message: `You\'re ${Math.round(coverageRatio * 100)}% to the zero line. Just $${monthlyGap.toFixed(0)} more monthly income needed!`,
        action: 'Add dividend stocks to close the gap',
        priority: 'high',
        shareWorthy: false,
        icon: '🎯',
        color: 'warning',
        timeframe: 'You could achieve this in 3-6 months'
      })
    }

    return insights
  }

  /**
   * Generate performance insights (mock data for now)
   */
  private generatePerformanceInsights(profile: UserProfile): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = []
    
    // Mock performance comparison (would be real data in production)
    const portfolioReturn = 12.4 // Mock YTD return
    const spyReturn = 15.2      // Mock SPY YTD return
    const outperformance = portfolioReturn - spyReturn

    if (outperformance > 2) {
      insights.push({
        id: 'performance-outperform',
        type: 'celebration',
        title: '🚀 Beating SPY!',
        message: `Your portfolio is outperforming the S&P 500 by ${outperformance.toFixed(1)}%!`,
        action: 'Share your success strategy',
        priority: 'high',
        shareWorthy: true,
        icon: '📈',
        color: 'success',
        impact: 'Superior investment performance'
      })
    } else if (outperformance > -2) {
      insights.push({
        id: 'performance-keeping-up',
        type: 'goal',
        title: '📊 Staying Competitive',
        message: `You\'re keeping pace with the S&P 500. Focus on dividend growth.`,
        priority: 'medium',
        shareWorthy: false,
        icon: '⚖️',
        color: 'info'
      })
    }

    return insights
  }

  /**
   * Generate optimization insights
   */
  private generateOptimizationInsights(profile: UserProfile): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = []
    
    if (profile.experienceLevel === 'beginner' && profile.portfolioValue && profile.portfolioValue > 10000) {
      insights.push({
        id: 'optimization-diversification',
        type: 'optimization',
        title: '🎓 Next Level Strategy',
        message: 'With your growing portfolio, consider diversifying beyond basic ETFs.',
        action: 'Explore dividend aristocrats and international exposure',
        priority: 'medium',
        shareWorthy: false,
        icon: '📚',
        color: 'info',
        impact: 'Reduce risk and improve long-term returns'
      })
    }

    if (profile.age && profile.age < 40 && profile.riskTolerance === 'conservative') {
      insights.push({
        id: 'optimization-age-risk',
        type: 'optimization',
        title: '⏰ Time Advantage',
        message: 'At your age, you have time to take more risk for higher growth.',
        action: 'Consider adding dividend growth funds',
        priority: 'medium',
        shareWorthy: false,
        icon: '🕒',
        color: 'warning',
        impact: 'Potentially reach goals years sooner'
      })
    }

    return insights
  }

  /**
   * Generate goal progress insights
   */
  private generateGoalProgressInsights(profile: UserProfile): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = []
    
    if (profile.stressFreeLiving && profile.monthlyIncome) {
      const progressToGoal = profile.monthlyIncome / profile.stressFreeLiving
      
      if (progressToGoal >= 1) {
        insights.push({
          id: 'goal-stress-free-achieved',
          type: 'celebration',
          title: '😌 Stress-Free Living!',
          message: 'You\'ve reached your stress-free living target! Time to enjoy life.',
          action: 'Set new aspirational goals',
          priority: 'high',
          shareWorthy: true,
          icon: '🏖️',
          color: 'success'
        })
      } else if (progressToGoal >= 0.7) {
        const remaining = profile.stressFreeLiving - profile.monthlyIncome
        insights.push({
          id: 'goal-stress-free-close',
          type: 'goal',
          title: '🎯 Stress-Free Goal Close!',
          message: `Just $${remaining.toFixed(0)} more monthly income to reach your stress-free target.`,
          priority: 'medium',
          shareWorthy: false,
          icon: '🎯',
          color: 'info'
        })
      }
    }

    return insights
  }

  /**
   * Generate experience-level insights
   */
  private generateExperienceLevelInsights(profile: UserProfile): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = []
    
    if (profile.experienceLevel === 'expert' && profile.portfolioValue && profile.portfolioValue > 100000) {
      insights.push({
        id: 'experience-advanced-strategies',
        type: 'optimization',
        title: '⚡ Advanced Strategies',
        message: 'As an expert with significant capital, consider covered call strategies.',
        action: 'Explore JEPI, QYLD, or DIY covered calls',
        priority: 'low',
        shareWorthy: false,
        icon: '🧠',
        color: 'info',
        impact: 'Potentially increase yield by 3-5%'
      })
    } else if (profile.experienceLevel === 'beginner') {
      insights.push({
        id: 'experience-learning',
        type: 'goal',
        title: '🎓 Learning Journey',
        message: 'Great job starting your dividend journey! Focus on broad ETFs first.',
        action: 'Master the basics before advancing',
        priority: 'medium',
        shareWorthy: false,
        icon: '📖',
        color: 'info'
      })
    }

    return insights
  }

  /**
   * Check if achievement is unlocked
   */
  private isAchievementUnlocked(achievement: Achievement, profile?: UserProfile): boolean {
    if (!profile) return false
    
    switch (achievement.id) {
      case 'first-portfolio':
        return (profile.portfolioValue || 0) > 0
      
      case 'ten-thousand':
        return (profile.portfolioValue || 0) >= 10000
        
      case 'six-figures':
        return (profile.portfolioValue || 0) >= 100000
        
      case 'above-zero':
        return profile.monthlyIncome && profile.monthlyExpenses && 
               profile.monthlyIncome >= profile.monthlyExpenses
               
      case 'stress-free-living':
        return profile.monthlyIncome && profile.stressFreeLiving &&
               profile.monthlyIncome >= profile.stressFreeLiving
               
      default:
        return false
    }
  }

  /**
   * Get all available achievements
   */
  private getAllAchievements(): Achievement[] {
    return [
      {
        id: 'first-portfolio',
        title: '🎯 First Steps',
        description: 'Created your first portfolio',
        icon: '🌱',
        category: 'portfolio',
        rarity: 'common',
        shareText: 'Just started my dividend investing journey with Income Clarity!'
      },
      {
        id: 'ten-thousand',
        title: '💎 Five Figures',
        description: 'Portfolio reached $10,000',
        icon: '📈',
        category: 'portfolio',
        rarity: 'common',
        shareText: 'Hit $10K in my dividend portfolio! Building toward financial freedom.'
      },
      {
        id: 'six-figures',
        title: '🏆 Six-Figure Club',
        description: 'Portfolio reached $100,000',
        icon: '💎',
        category: 'portfolio',
        rarity: 'rare',
        shareText: 'Joined the six-figure dividend portfolio club! 🎉'
      },
      {
        id: 'above-zero',
        title: '🎉 Above the Zero Line!',
        description: 'Monthly dividend income covers all expenses',
        icon: '🎯',
        category: 'coverage',
        rarity: 'rare',
        shareText: 'My dividends now cover 100% of my expenses! Living the dividend lifestyle! 🚀'
      },
      {
        id: 'stress-free-living',
        title: '😌 Stress-Free Living',
        description: 'Reached your stress-free income target',
        icon: '🏖️',
        category: 'income',
        rarity: 'legendary',
        shareText: 'Achieved stress-free living through dividend income! Time to enjoy life! 😎'
      }
    ]
  }

  /**
   * Prioritize insights based on settings and relevance
   */
  private prioritizeInsights(insights: PersonalizedInsight[], settings: PersonalizationSettings): PersonalizedInsight[] {
    return insights
      .filter(insight => {
        // Filter based on settings
        if (!settings.celebrateAchievements && ['celebration', 'milestone', 'achievement'].includes(insight.type)) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        // Sort by priority
        const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, settings.detailLevel === 'basic' ? 3 : settings.detailLevel === 'detailed' ? 8 : 15)
  }
}

// Export singleton instance
export const personalizationEngine = PersonalizationEngine.getInstance()