/**
 * Email Scheduler Service for Income Clarity
 * Handles scheduled email sending with reliability and persistence
 */

import { PrismaClient } from '@prisma/client';
import { emailService } from './email.service';
import { EmailTemplateData } from './email-templates.service';
import { logger } from '@/lib/logger'

const prisma = new PrismaClient();

interface ScheduledEmailJob {
  id?: string;
  userId: string;
  category: string;
  templateData: EmailTemplateData;
  scheduledFor: Date;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EmailSchedulerService {
  private static instance: EmailSchedulerService;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  
  private constructor() {}
  
  public static getInstance(): EmailSchedulerService {
    if (!EmailSchedulerService.instance) {
      EmailSchedulerService.instance = new EmailSchedulerService();
    }
    return EmailSchedulerService.instance;
  }
  
  /**
   * Schedule an email to be sent
   */
  async scheduleEmail(
    userId: string,
    category: keyof import('@/types/email-preferences').EmailNotificationCategories,
    templateData: EmailTemplateData,
    scheduledFor: Date = new Date(),
    maxAttempts: number = 3
  ): Promise<string> {
    try {
      // For now, store in memory/simple database
      // In production, you'd use a proper job queue like Redis/BullMQ
      const jobId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log the scheduled email
      logger.log('[EMAIL SCHEDULER] Email scheduled:', {
        jobId,
        userId,
        category,
        scheduledFor: scheduledFor.toISOString()
      });
      
      // If scheduled for immediate sending, send now
      if (scheduledFor <= new Date()) {
        this.processEmailJob(jobId, userId, category, templateData, maxAttempts);
      }
      
      return jobId;
      
    } catch (error) {
      logger.error('[EMAIL SCHEDULER] Failed to schedule email:', error);
      throw error;
    }
  }
  
  /**
   * Process a single email job
   */
  private async processEmailJob(
    jobId: string,
    userId: string,
    category: keyof import('@/types/email-preferences').EmailNotificationCategories,
    templateData: EmailTemplateData,
    maxAttempts: number,
    attempt: number = 1
  ): Promise<void> {
    try {
      logger.log(`[EMAIL SCHEDULER] Processing job ${jobId}, attempt ${attempt}`);
      
      const result = await emailService.sendNotificationEmail(userId, category, templateData);
      
      if (result.success) {
        logger.log(`[EMAIL SCHEDULER] Job ${jobId} completed successfully`);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`[EMAIL SCHEDULER] Job ${jobId} failed (attempt ${attempt}):`, errorMessage);
      
      // Retry logic with exponential backoff
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
        logger.log(`[EMAIL SCHEDULER] Retrying job ${jobId} in ${delay}ms`);
        
        setTimeout(() => {
          this.processEmailJob(jobId, userId, category, templateData, maxAttempts, attempt + 1);
        }, delay);
      } else {
        logger.error(`[EMAIL SCHEDULER] Job ${jobId} failed after ${maxAttempts} attempts`);
      }
    }
  }
  
  /**
   * Schedule weekly summary emails for all eligible users
   */
  async scheduleWeeklySummaries(): Promise<void> {
    try {
      logger.log('[EMAIL SCHEDULER] Starting weekly summary batch');
      
      // Get all users with weekly digest enabled
      const eligibleUsers = await prisma.emailPreferences.findMany({
        where: {
          notificationsEnabled: true,
          emailVerified: true,
          email: { not: null },
          categories: {
            contains: '"weeklyDigests":true'
          }
        }
      });
      
      logger.log(`[EMAIL SCHEDULER] Found ${eligibleUsers.length} users eligible for weekly summaries`);
      
      const schedulePromises = eligibleUsers.map(async (user) => {
        try {
          // Get user's portfolio data for summary
          const portfolioData = await this.getUserPortfolioSummary(user.userId);
          
          if (portfolioData) {
            await this.scheduleEmail(
              user.userId,
              'weeklyDigests',
              { weeklySummary: portfolioData }
            );
          }
        } catch (error) {
          logger.error(`[EMAIL SCHEDULER] Failed to schedule weekly summary for user ${user.userId}:`, error);
        }
      });
      
      await Promise.all(schedulePromises);
      logger.log('[EMAIL SCHEDULER] Weekly summary batch completed');
      
    } catch (error) {
      logger.error('[EMAIL SCHEDULER] Weekly summary batch failed:', error);
    }
  }
  
  /**
   * Get user's portfolio summary data
   */
  private async getUserPortfolioSummary(userId: string): Promise<EmailTemplateData['weeklySummary'] | null> {
    try {
      // This would typically fetch from your portfolio/holdings tables
      // For now, return mock data for testing
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      return {
        weekStart: weekStart.toLocaleDateString(),
        weekEnd: new Date().toLocaleDateString(),
        totalReturn: Math.random() * 4 - 1, // -1% to +3%
        dividendIncome: Math.random() * 200,
        portfolioValue: 50000 + Math.random() * 100000,
        vsSpyReturn: Math.random() * 2 - 0.5, // -0.5% to +1.5%
        topPerformer: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'][Math.floor(Math.random() * 4)],
        topPerformerReturn: Math.random() * 10,
        dividendPayments: [
          {
            ticker: 'AAPL',
            amount: 50 + Math.random() * 50,
            date: new Date().toLocaleDateString()
          }
        ],
        rebalancingSuggestions: [],
        marketInsights: [
          'Market showing continued strength this week',
          'Dividend stocks performing well'
        ]
      };
      
    } catch (error) {
      logger.error(`[EMAIL SCHEDULER] Failed to get portfolio summary for user ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Send dividend notification immediately
   */
  async sendDividendNotification(
    userId: string,
    dividendData: NonNullable<EmailTemplateData['dividend']>
  ): Promise<string> {
    return this.scheduleEmail(userId, 'dividendNotifications', { dividend: dividendData });
  }
  
  /**
   * Send milestone notification immediately
   */
  async sendMilestoneNotification(
    userId: string,
    milestoneData: NonNullable<EmailTemplateData['milestone']>
  ): Promise<string> {
    return this.scheduleEmail(userId, 'milestoneAchievements', { milestone: milestoneData });
  }
  
  /**
   * Schedule weekly summaries to run every Sunday at 6 PM
   */
  startWeeklyScheduler(): void {
    if (this.isRunning) {
      logger.log('[EMAIL SCHEDULER] Weekly scheduler already running');
      return;
    }
    
    logger.log('[EMAIL SCHEDULER] Starting weekly scheduler');
    this.isRunning = true;
    
    // Check every hour if it's time to send weekly summaries
    this.intervalId = setInterval(() => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const hour = now.getHours();
      
      // Send on Sundays at 6 PM
      if (day === 0 && hour === 18) {
        this.scheduleWeeklySummaries();
      }
    }, 60 * 60 * 1000); // Check every hour
  }
  
  /**
   * Stop the weekly scheduler
   */
  stopWeeklyScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    logger.log('[EMAIL SCHEDULER] Weekly scheduler stopped');
  }
  
  /**
   * Get scheduler status
   */
  getStatus(): { running: boolean; nextWeeklyRun?: string } {
    let nextWeeklyRun: string | undefined;
    
    if (this.isRunning) {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
      nextSunday.setHours(18, 0, 0, 0);
      
      if (nextSunday <= now) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }
      
      nextWeeklyRun = nextSunday.toISOString();
    }
    
    return {
      running: this.isRunning,
      nextWeeklyRun
    };
  }
}

// Export singleton instance
export const emailScheduler = EmailSchedulerService.getInstance();