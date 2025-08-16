/**
 * Retention Hooks System - Keep users engaged from day 1
 * Implements ONBOARD-008: Retention Hooks
 * 
 * Daily checks, weekly reports, achievements, and social proof
 * to maintain user engagement and build habit formation
 */

import { useState, useEffect } from 'react'

export interface RetentionStrategy {
  type: 'daily_check' | 'weekly_report' | 'achievement' | 'milestone' | 'social_proof' | 'educational'
  timing: 'immediate' | 'scheduled' | 'triggered'
  priority: 'high' | 'medium' | 'low'
  channel: 'in_app' | 'email' | 'push' | 'sms'
  message: string
  action?: string
  data?: any
}

export interface UserEngagement {
  lastLogin: Date
  loginStreak: number
  longestStreak: number
  totalLogins: number
  featuresUsed: string[]
  achievementsUnlocked: number
  portfolioUpdates: number
  shareCount: number
  engagementScore: number
}

export interface RetentionInsight {
  id: string
  title: string
  message: string
  type: 'celebration' | 'motivation' | 'education' | 'social' | 'milestone'
  urgency: 'immediate' | 'today' | 'this_week' | 'low'
  action?: string
  shareWorthy: boolean
  icon: string
}

export class RetentionHooks {
  private static instance: RetentionHooks
  
  static getInstance(): RetentionHooks {
    if (!RetentionHooks.instance) {
      RetentionHooks.instance = new RetentionHooks()
    }
    return RetentionHooks.instance
  }

  /**
   * Get daily engagement strategies for user
   */
  getDailyStrategies(engagement: UserEngagement, portfolioData?: any): RetentionStrategy[] {
    const strategies: RetentionStrategy[] = []
    const now = new Date()
    const daysSinceLastLogin = Math.floor((now.getTime() - engagement.lastLogin.getTime()) / (1000 * 60 * 60 * 24))

    // Daily check-in message (4:30 PM ET - after market close)
    strategies.push({
      type: 'daily_check',
      timing: 'scheduled',
      priority: 'high',
      channel: 'in_app',
      message: this.getDailyCheckMessage(engagement, portfolioData),
      action: 'View Dashboard',
      data: { scheduledTime: '16:30', timezone: 'America/New_York' }
    })

    // Re-engagement for users who haven't logged in
    if (daysSinceLastLogin >= 1) {
      const urgency = daysSinceLastLogin >= 7 ? 'high' : daysSinceLastLogin >= 3 ? 'medium' : 'low'
      
      strategies.push({
        type: 'milestone',
        timing: 'immediate',
        priority: urgency,
        channel: 'push',
        message: this.getReEngagementMessage(daysSinceLastLogin, engagement),
        action: 'Check Portfolio'
      })
    }

    // Streak maintenance
    if (engagement.loginStreak >= 3) {
      strategies.push({
        type: 'achievement',
        timing: 'triggered',
        priority: 'medium',
        channel: 'in_app',
        message: `🔥 ${engagement.loginStreak} day streak! You're building great investing habits.`,
        action: 'Keep it going!'
      })
    }

    return strategies
  }

  /**
   * Generate weekly report content
   */
  generateWeeklyReport(userId: string, portfolioData: any, previousWeekData?: any): {
    subject: string
    content: string
    insights: RetentionInsight[]
    shareableStats: any
  } {
    const insights = this.generateWeeklyInsights(portfolioData, previousWeekData)
    
    return {
      subject: this.getWeeklyReportSubject(portfolioData),
      content: this.formatWeeklyReportContent(portfolioData, insights),
      insights,
      shareableStats: this.generateShareableWeeklyStats(portfolioData)
    }
  }

  /**
   * Get achievement-based retention hooks
   */
  getAchievementHooks(newAchievements: any[], userProfile: any): RetentionStrategy[] {
    const hooks: RetentionStrategy[] = []

    newAchievements.forEach(achievement => {
      // Immediate celebration
      hooks.push({
        type: 'achievement',
        timing: 'immediate',
        priority: 'high',
        channel: 'in_app',
        message: `🎉 ${achievement.title} unlocked! ${achievement.description}`,
        action: 'Share Achievement',
        data: { achievement }
      })

      // Social sharing opportunity
      if (achievement.shareWorthy) {
        hooks.push({
          type: 'social_proof',
          timing: 'triggered',
          priority: 'medium',
          channel: 'in_app',
          message: 'Share your success and inspire other dividend investors!',
          action: 'Share on Social',
          data: { shareText: achievement.shareText }
        })
      }

      // Follow-up educational content
      if (achievement.category === 'portfolio' && achievement.rarity === 'epic') {
        hooks.push({
          type: 'educational',
          timing: 'scheduled',
          priority: 'medium',
          channel: 'email',
          message: 'Now that you\'ve reached this milestone, here are advanced strategies to consider...',
          action: 'Learn More',
          data: { delayHours: 24 }
        })
      }
    })

    return hooks
  }

  /**
   * Generate retention insights for dashboard
   */
  getRetentionInsights(engagement: UserEngagement, portfolioData: any): RetentionInsight[] {
    const insights: RetentionInsight[] = []

    // Performance insights
    if (portfolioData.performanceVsSpy > 0) {
      insights.push({
        id: 'performance-win',
        title: '🎯 Outperforming SPY!',
        message: `Your portfolio is beating the S&P 500 by ${portfolioData.performanceVsSpy.toFixed(1)}%`,
        type: 'celebration',
        urgency: 'today',
        action: 'Share your success',
        shareWorthy: true,
        icon: '📈'
      })
    }

    // Income progress
    const coverageRatio = portfolioData.monthlyIncome / portfolioData.monthlyExpenses
    if (coverageRatio >= 0.8 && coverageRatio < 1) {
      insights.push({
        id: 'almost-zero-line',
        title: '⚡ So Close to Zero Line!',
        message: `You're ${Math.round(coverageRatio * 100)}% to dividend independence`,
        type: 'motivation',
        urgency: 'this_week',
        action: 'Add more dividend stocks',
        shareWorthy: false,
        icon: '🎯'
      })
    }

    // Streak celebration
    if (engagement.loginStreak >= 7) {
      insights.push({
        id: 'streak-milestone',
        title: '🔥 Weekly Streak!',
        message: `${engagement.loginStreak} days of consistent tracking builds wealth!`,
        type: 'milestone',
        urgency: 'today',
        action: 'Keep the streak alive',
        shareWorthy: true,
        icon: '⚡'
      })
    }

    // Educational opportunities
    if (engagement.featuresUsed.length < 3) {
      insights.push({
        id: 'feature-discovery',
        title: '🚀 Unlock More Features',
        message: 'You\'re only using a fraction of Income Clarity\'s power!',
        type: 'education',
        urgency: 'low',
        action: 'Take a tour',
        shareWorthy: false,
        icon: '🎓'
      })
    }

    // Social proof
    const communityStats = this.getCommunityStats()
    if (portfolioData.portfolioValue >= communityStats.averagePortfolioValue) {
      insights.push({
        id: 'above-average',
        title: '💎 Above Average!',
        message: `Your portfolio is larger than ${communityStats.percentileRank}% of users`,
        type: 'social',
        urgency: 'low',
        action: 'Share your journey',
        shareWorthy: true,
        icon: '👑'
      })
    }

    return insights.sort((a, b) => {
      const urgencyOrder = { immediate: 0, today: 1, this_week: 2, low: 3 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
  }

  /**
   * Get social proof messages
   */
  getSocialProofMessages(): Array<{
    message: string
    context: string
    credibility: 'high' | 'medium' | 'low'
  }> {
    return [
      {
        message: "Join 10,000+ dividend investors tracking their journey to financial independence",
        context: "landing_page",
        credibility: 'high'
      },
      {
        message: "95% of users see improved portfolio performance within 3 months",
        context: "onboarding",
        credibility: 'medium'
      },
      {
        message: "Our users collectively track $2.3 billion in dividend investments",
        context: "dashboard",
        credibility: 'high'
      },
      {
        message: "Average user increases dividend income by 40% in first year",
        context: "achievement",
        credibility: 'medium'
      },
      {
        message: "2,847 users reached the zero line this month",
        context: "motivation",
        credibility: 'high'
      },
      {
        message: "Top performers save $3,200 annually through tax optimization",
        context: "feature_highlight",
        credibility: 'medium'
      }
    ]
  }

  /**
   * Generate habit-forming suggestions
   */
  getHabitFormingSuggestions(engagement: UserEngagement): Array<{
    habit: string
    frequency: string
    difficulty: 'easy' | 'medium' | 'hard'
    impact: 'high' | 'medium' | 'low'
    description: string
  }> {
    return [
      {
        habit: 'Daily Portfolio Check',
        frequency: 'Every morning with coffee',
        difficulty: 'easy',
        impact: 'high',
        description: 'Quick 2-minute glance at performance vs SPY'
      },
      {
        habit: 'Weekly Holdings Review',
        frequency: 'Sunday evenings',
        difficulty: 'medium',
        impact: 'high',
        description: 'Review individual stock performance and rebalance'
      },
      {
        habit: 'Monthly Goal Assessment',
        frequency: 'First of each month',
        difficulty: 'medium',
        impact: 'medium',
        description: 'Check progress toward zero line and adjust targets'
      },
      {
        habit: 'Quarterly Strategy Review',
        frequency: 'End of each quarter',
        difficulty: 'hard',
        impact: 'high',
        description: 'Comprehensive portfolio analysis and optimization'
      }
    ]
  }

  /**
   * Generate personalized email content
   */
  generatePersonalizedEmail(userId: string, type: 'weekly_report' | 'achievement' | 'milestone' | 'educational', data: any): {
    subject: string
    htmlContent: string
    textContent: string
    cta: string
  } {
    switch (type) {
      case 'weekly_report':
        return this.generateWeeklyReportEmail(data)
      case 'achievement':
        return this.generateAchievementEmail(data)
      case 'milestone':
        return this.generateMilestoneEmail(data)
      case 'educational':
        return this.generateEducationalEmail(data)
      default:
        throw new Error(`Unknown email type: ${type}`)
    }
  }

  // Private helper methods

  private getDailyCheckMessage(engagement: UserEngagement, portfolioData?: any): string {
    const messages = [
      "📊 Market closed! How did your dividend portfolio perform vs SPY today?",
      "💰 Another day of dividend income building! Check your progress.",
      "🎯 Getting closer to the zero line every day. See today's update!",
      "📈 Your wealth is growing while you sleep. Check today's results!",
      "⚡ Dividend income is the path to freedom. How are you doing today?"
    ]

    if (portfolioData?.performanceVsSpy > 0) {
      return "🎉 Great day! Your portfolio outperformed SPY. Check your dashboard!"
    }

    return messages[Math.floor(Math.random() * messages.length)]
  }

  private getReEngagementMessage(daysSinceLogin: number, engagement: UserEngagement): string {
    if (daysSinceLogin >= 7) {
      return `🔥 Your ${engagement.loginStreak} day streak is about to break! Come back and keep building wealth.`
    } else if (daysSinceLogin >= 3) {
      return "💎 Your dividend portfolio missed you! Check how it performed while you were away."
    } else {
      return "📊 Market update ready! See how your dividend strategy is working."
    }
  }

  private generateWeeklyInsights(portfolioData: any, previousWeekData?: any): RetentionInsight[] {
    const insights: RetentionInsight[] = []
    
    // Performance insights
    if (previousWeekData) {
      const weeklyReturn = ((portfolioData.totalValue - previousWeekData.totalValue) / previousWeekData.totalValue) * 100
      
      if (weeklyReturn > 0) {
        insights.push({
          id: 'weekly-gain',
          title: '📈 Weekly Winner!',
          message: `Your portfolio gained ${weeklyReturn.toFixed(2)}% this week`,
          type: 'celebration',
          urgency: 'today',
          shareWorthy: true,
          icon: '🎉'
        })
      }
    }

    // Income insights
    if (portfolioData.weeklyDividends > 0) {
      insights.push({
        id: 'weekly-income',
        title: '💰 Dividend Income',
        message: `You earned $${portfolioData.weeklyDividends.toFixed(2)} in dividends this week`,
        type: 'milestone',
        urgency: 'today',
        shareWorthy: false,
        icon: '💵'
      })
    }

    return insights
  }

  private getWeeklyReportSubject(portfolioData: any): string {
    const subjects = [
      `Your weekly dividend report: $${portfolioData.weeklyIncome?.toFixed(2) || '0'} earned`,
      "📊 Weekly Portfolio Update: Performance vs SPY",
      "💰 This Week's Dividend Income Summary",
      "🎯 Weekly Progress Toward Zero Line"
    ]
    
    return subjects[Math.floor(Math.random() * subjects.length)]
  }

  private formatWeeklyReportContent(portfolioData: any, insights: RetentionInsight[]): string {
    return `
      <h2>Your Weekly Dividend Report</h2>
      <p>Here's how your dividend portfolio performed this week:</p>
      
      <h3>Key Metrics:</h3>
      <ul>
        <li>Portfolio Value: $${portfolioData.totalValue?.toLocaleString()}</li>
        <li>Weekly Income: $${portfolioData.weeklyIncome?.toFixed(2)}</li>
        <li>Zero Line Progress: ${Math.round((portfolioData.monthlyIncome / portfolioData.monthlyExpenses) * 100)}%</li>
        <li>Performance vs SPY: ${portfolioData.performanceVsSpy > 0 ? '+' : ''}${portfolioData.performanceVsSpy?.toFixed(1)}%</li>
      </ul>
      
      <h3>This Week's Insights:</h3>
      ${insights.map(insight => `<p><strong>${insight.title}</strong>: ${insight.message}</p>`).join('')}
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View Full Dashboard</a></p>
    `
  }

  private generateShareableWeeklyStats(portfolioData: any): any {
    return {
      weeklyReturn: portfolioData.weeklyReturn,
      dividendIncome: portfolioData.weeklyIncome,
      spyComparison: portfolioData.performanceVsSpy,
      zeroLineProgress: Math.round((portfolioData.monthlyIncome / portfolioData.monthlyExpenses) * 100)
    }
  }

  private getCommunityStats(): any {
    // Mock community stats - would come from database in production
    return {
      totalUsers: 10547,
      averagePortfolioValue: 48750,
      percentileRank: 72,
      usersAboveZeroLine: 2847
    }
  }

  private generateWeeklyReportEmail(data: any): any {
    return {
      subject: `Your Weekly Dividend Report - $${data.weeklyIncome.toFixed(2)} Earned`,
      htmlContent: this.formatWeeklyReportContent(data, []),
      textContent: `Weekly dividend income: $${data.weeklyIncome.toFixed(2)}. Check your dashboard for full details.`,
      cta: 'View Dashboard'
    }
  }

  private generateAchievementEmail(data: any): any {
    return {
      subject: `🎉 Achievement Unlocked: ${data.achievement.title}`,
      htmlContent: `<h2>Congratulations!</h2><p>You've unlocked: <strong>${data.achievement.title}</strong></p><p>${data.achievement.description}</p>`,
      textContent: `Achievement unlocked: ${data.achievement.title} - ${data.achievement.description}`,
      cta: 'Share Achievement'
    }
  }

  private generateMilestoneEmail(data: any): any {
    return {
      subject: `🎯 Milestone Reached: ${data.milestone.title}`,
      htmlContent: `<h2>Major Milestone!</h2><p>You've reached: <strong>${data.milestone.title}</strong></p>`,
      textContent: `Milestone reached: ${data.milestone.title}`,
      cta: 'View Progress'
    }
  }

  private generateEducationalEmail(data: any): any {
    return {
      subject: `💡 Dividend Strategy Tip: ${data.topic}`,
      htmlContent: `<h2>Learn & Grow</h2><p>${data.content}</p>`,
      textContent: data.content,
      cta: 'Learn More'
    }
  }
}

// Export singleton instance
export const retentionHooks = RetentionHooks.getInstance()

/**
 * Hook for managing retention in React components
 */
export function useRetentionHooks(userId: string, portfolioData: any) {
  const [insights, setInsights] = useState<RetentionInsight[]>([])
  const [strategies, setStrategies] = useState<RetentionStrategy[]>([])

  useEffect(() => {
    if (userId && portfolioData) {
      // Get engagement data
      const engagement: UserEngagement = {
        lastLogin: new Date(),
        loginStreak: parseInt(localStorage.getItem(`login-streak-${userId}`) || '1'),
        longestStreak: parseInt(localStorage.getItem(`longest-streak-${userId}`) || '1'),
        totalLogins: parseInt(localStorage.getItem(`total-logins-${userId}`) || '1'),
        featuresUsed: JSON.parse(localStorage.getItem(`features-used-${userId}`) || '[]'),
        achievementsUnlocked: parseInt(localStorage.getItem(`achievements-${userId}`) || '0'),
        portfolioUpdates: parseInt(localStorage.getItem(`portfolio-updates-${userId}`) || '0'),
        shareCount: parseInt(localStorage.getItem(`share-count-${userId}`) || '0'),
        engagementScore: 0.8
      }

      // Update login streak
      const today = new Date().toDateString()
      const lastLoginDate = localStorage.getItem(`last-login-date-${userId}`)
      
      if (lastLoginDate !== today) {
        const newStreak = engagement.loginStreak + 1
        localStorage.setItem(`login-streak-${userId}`, newStreak.toString())
        localStorage.setItem(`last-login-date-${userId}`, today)
        localStorage.setItem(`total-logins-${userId}`, (engagement.totalLogins + 1).toString())
      }

      // Get retention insights and strategies
      const retentionInsights = retentionHooks.getRetentionInsights(engagement, portfolioData)
      const dailyStrategies = retentionHooks.getDailyStrategies(engagement, portfolioData)
      
      setInsights(retentionInsights)
      setStrategies(dailyStrategies)
    }
  }, [userId, portfolioData])

  const trackFeatureUsage = (feature: string) => {
    const featuresUsed = JSON.parse(localStorage.getItem(`features-used-${userId}`) || '[]')
    if (!featuresUsed.includes(feature)) {
      featuresUsed.push(feature)
      localStorage.setItem(`features-used-${userId}`, JSON.stringify(featuresUsed))
    }
  }

  const incrementShareCount = () => {
    const currentCount = parseInt(localStorage.getItem(`share-count-${userId}`) || '0')
    localStorage.setItem(`share-count-${userId}`, (currentCount + 1).toString())
  }

  return {
    insights,
    strategies,
    trackFeatureUsage,
    incrementShareCount
  }
}

/**
 * Retention notification scheduler
 */
export class RetentionScheduler {
  private static scheduleNotification(strategy: RetentionStrategy, userId: string) {
    // In production, this would integrate with a job queue or notification service
    // console.log('Scheduled retention notification:', {
      // type: strategy.type,
      // message: strategy.message,
      // userId,
      // timing: strategy.timing,
      // channel: strategy.channel
    })
  }

  static scheduleUserRetention(userId: string, engagement: UserEngagement, portfolioData: any) {
    const strategies = retentionHooks.getDailyStrategies(engagement, portfolioData)
    
    strategies.forEach(strategy => {
      if (strategy.timing === 'scheduled') {
        this.scheduleNotification(strategy, userId)
      }
    })
  }
}