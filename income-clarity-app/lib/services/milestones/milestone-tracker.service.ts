/**
 * Milestone Tracker Service for Income Clarity
 * Detects when users reach FIRE milestones and triggers email notifications
 */

import { PrismaClient } from '@prisma/client';
import { emailScheduler } from './email/email-scheduler.service';
import { logger } from '@/lib/logger'

const prisma = new PrismaClient();

interface MilestoneDefinition {
  id: string;
  name: string;
  category: 'utilities' | 'food' | 'housing' | 'transportation' | 'healthcare' | 'lifestyle' | 'complete_fire';
  requiredAmount: number;
  description: string;
}

// Standard FIRE milestone definitions
const FIRE_MILESTONES: MilestoneDefinition[] = [
  {
    id: 'utilities',
    name: 'Utilities Coverage',
    category: 'utilities',
    requiredAmount: 25000, // $1000/month * 25
    description: 'Your dividends can now cover your utility bills forever'
  },
  {
    id: 'food',
    name: 'Food Coverage',
    category: 'food',
    requiredAmount: 75000, // $3000/month * 25
    description: 'Your dividends can now cover your food expenses forever'
  },
  {
    id: 'housing',
    name: 'Housing Coverage',
    category: 'housing',
    requiredAmount: 375000, // $15000/month * 25
    description: 'Your dividends can now cover your housing costs forever'
  },
  {
    id: 'transportation',
    name: 'Transportation Coverage',
    category: 'transportation',
    requiredAmount: 125000, // $5000/month * 25
    description: 'Your dividends can now cover your transportation costs forever'
  },
  {
    id: 'healthcare',
    name: 'Healthcare Coverage',
    category: 'healthcare',
    requiredAmount: 200000, // $8000/month * 25
    description: 'Your dividends can now cover your healthcare expenses forever'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Freedom',
    category: 'lifestyle',
    requiredAmount: 500000, // $20000/month * 25
    description: 'Your dividends can now cover your complete lifestyle forever'
  },
  {
    id: 'complete_fire',
    name: 'Complete FIRE',
    category: 'complete_fire',
    requiredAmount: 1000000, // $40000/month * 25
    description: 'You have achieved complete financial independence!'
  }
];

export class MilestoneTrackerService {
  private static instance: MilestoneTrackerService;
  
  private constructor() {}
  
  public static getInstance(): MilestoneTrackerService {
    if (!MilestoneTrackerService.instance) {
      MilestoneTrackerService.instance = new MilestoneTrackerService();
    }
    return MilestoneTrackerService.instance;
  }
  
  /**
   * Check if user has reached any new milestones
   */
  async checkMilestones(userId: string, previousValue: number, currentValue: number): Promise<void> {
    try {
      // Find milestones achieved with current value but not with previous value
      const newMilestones = FIRE_MILESTONES.filter(milestone => 
        currentValue >= milestone.requiredAmount && previousValue < milestone.requiredAmount
      );
      
      if (newMilestones.length === 0) {
        return;
      }
      
      logger.log(`[MILESTONE TRACKER] User ${userId} achieved ${newMilestones.length} new milestones`);
      
      // Send notification for each milestone achieved
      for (const milestone of newMilestones) {
        await this.sendMilestoneNotification(userId, milestone, currentValue);
        
        // Log milestone achievement in database
        await this.logMilestoneAchievement(userId, milestone, currentValue);
      }
      
    } catch (error) {
      logger.error('[MILESTONE TRACKER] Error checking milestones:', error);
    }
  }
  
  /**
   * Send milestone achievement notification
   */
  private async sendMilestoneNotification(
    userId: string, 
    milestone: MilestoneDefinition, 
    currentValue: number
  ): Promise<void> {
    try {
      // Find next milestone
      const nextMilestone = FIRE_MILESTONES.find(m => m.requiredAmount > currentValue);
      
      // Calculate time to next milestone based on current savings rate
      const timeToNext = await this.estimateTimeToNextMilestone(userId, nextMilestone?.requiredAmount || 0, currentValue);
      
      const progressPercent = (currentValue / milestone.requiredAmount) * 100;
      
      await emailScheduler.sendMilestoneNotification(userId, {
        name: milestone.name,
        targetAmount: milestone.requiredAmount,
        currentAmount: currentValue,
        progressPercent,
        nextMilestone: nextMilestone?.name || 'Complete FIRE achieved!',
        timeToNext,
        category: milestone.category
      });
      
      logger.log(`[MILESTONE TRACKER] Milestone notification sent: ${milestone.name}`);
      
    } catch (error) {
      logger.error(`[MILESTONE TRACKER] Failed to send milestone notification for ${milestone.name}:`, error);
    }
  }
  
  /**
   * Log milestone achievement in database
   */
  private async logMilestoneAchievement(
    userId: string, 
    milestone: MilestoneDefinition, 
    achievedValue: number
  ): Promise<void> {
    try {
      // For now, just log to console
      // In a full implementation, you'd save to a milestones table
      logger.log(`[MILESTONE TRACKER] Logged achievement:`, {
        userId,
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        targetAmount: milestone.requiredAmount,
        achievedValue,
        achievedAt: new Date().toISOString()
      });
      
      // TODO: Save to database
      // await prisma.milestoneAchievement.create({
      //   data: {
      //     userId,
      //     milestoneId: milestone.id,
      //     targetAmount: milestone.requiredAmount,
      //     achievedValue,
      //     achievedAt: new Date()
      //   }
      // });
      
    } catch (error) {
      logger.error('[MILESTONE TRACKER] Failed to log milestone achievement:', error);
    }
  }
  
  /**
   * Estimate time to reach next milestone based on savings rate
   */
  private async estimateTimeToNextMilestone(
    userId: string, 
    targetAmount: number, 
    currentValue: number
  ): Promise<string> {
    try {
      if (targetAmount <= currentValue) {
        return 'Already achieved!';
      }
      
      // Get user's recent income to estimate savings rate
      const recentIncome = await prisma.income.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        }
      });
      
      if (recentIncome.length === 0) {
        return 'Unable to estimate';
      }
      
      const monthlyIncome = recentIncome.reduce((sum, income) => sum + income.amount, 0) / 3; // 3 months average
      const remainingAmount = targetAmount - currentValue;
      
      if (monthlyIncome <= 0) {
        return 'Unable to estimate';
      }
      
      const monthsToTarget = remainingAmount / monthlyIncome;
      
      if (monthsToTarget < 1) {
        return 'Less than 1 month';
      } else if (monthsToTarget < 12) {
        return `${Math.ceil(monthsToTarget)} months`;
      } else {
        const years = Math.floor(monthsToTarget / 12);
        const months = Math.ceil(monthsToTarget % 12);
        return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} months` : ''}`;
      }
      
    } catch (error) {
      logger.error('[MILESTONE TRACKER] Error estimating time to milestone:', error);
      return 'Unable to estimate';
    }
  }
  
  /**
   * Get user's current progress toward all milestones
   */
  async getMilestoneProgress(userId: string): Promise<any[]> {
    try {
      // Calculate current portfolio value
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          holdings: true
        }
      });
      
      let totalValue = 0;
      for (const portfolio of portfolios) {
        for (const holding of portfolio.holdings) {
          totalValue += holding.shares * (holding.currentPrice || holding.costBasis);
        }
      }
      
      // Calculate progress for each milestone
      return FIRE_MILESTONES.map(milestone => {
        const progress = Math.min((totalValue / milestone.requiredAmount) * 100, 100);
        const achieved = totalValue >= milestone.requiredAmount;
        
        return {
          id: milestone.id,
          name: milestone.name,
          category: milestone.category,
          targetAmount: milestone.requiredAmount,
          currentValue: totalValue,
          progress,
          achieved,
          description: milestone.description
        };
      });
      
    } catch (error) {
      logger.error('[MILESTONE TRACKER] Error getting milestone progress:', error);
      return [];
    }
  }
  
  /**
   * Manually trigger milestone check for a user
   */
  async triggerMilestoneCheck(userId: string): Promise<void> {
    try {
      // Get current portfolio value
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          holdings: true
        }
      });
      
      let currentValue = 0;
      for (const portfolio of portfolios) {
        for (const holding of portfolio.holdings) {
          currentValue += holding.shares * (holding.currentPrice || holding.costBasis);
        }
      }
      
      // For manual check, assume previous value was 0 to trigger all applicable milestones
      await this.checkMilestones(userId, 0, currentValue);
      
    } catch (error) {
      logger.error('[MILESTONE TRACKER] Error in manual milestone check:', error);
    }
  }
}

// Export singleton instance
export const milestoneTracker = MilestoneTrackerService.getInstance();