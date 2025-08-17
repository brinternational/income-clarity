/**
 * Email Job Processor
 * Handles all email sending jobs with proper templating, error handling, and delivery tracking
 */

import { Job, Processor } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../logger';
import { JOB_TYPES } from '../queue-config';

const prisma = new PrismaClient();

// Email job data interfaces
interface BaseEmailJobData {
  to: string | string[];
  subject?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  scheduledAt?: Date;
  expiresAt?: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

interface WelcomeEmailData extends BaseEmailJobData {
  userId: string;
  userName: string;
  verificationToken?: string;
}

interface SyncNotificationEmailData extends BaseEmailJobData {
  userId: string;
  syncType: string;
  status: 'success' | 'failure';
  itemsSynced?: number;
  errorMessage?: string;
  duration?: number;
}

interface DigestEmailData extends BaseEmailJobData {
  userId: string;
  portfolioSummary: {
    totalValue: number;
    totalGainLoss: number;
    gainLossPercentage: number;
    topPerformers: Array<{ symbol: string; gainLoss: number }>;
    bottomPerformers: Array<{ symbol: string; gainLoss: number }>;
  };
  weeklyStats: {
    syncCount: number;
    lastSyncDate: Date;
    alertsTriggered: number;
  };
}

interface SubscriptionReminderData extends BaseEmailJobData {
  userId: string;
  subscriptionPlan: string;
  expiryDate: Date;
  renewalUrl: string;
  daysUntilExpiry: number;
}

type EmailJobData = 
  | WelcomeEmailData 
  | SyncNotificationEmailData 
  | DigestEmailData 
  | SubscriptionReminderData 
  | BaseEmailJobData;

/**
 * Main email job processor
 */
export const emailProcessor: Processor<EmailJobData> = async (job: Job<EmailJobData>) => {
  const startTime = Date.now();
  let emailLogId: string | null = null;

  try {
    logger.info('Processing email job', {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts.attempts,
      to: job.data.to,
      subject: job.data.subject
    });

    // Create email log entry for tracking
    const emailLog = await prisma.emailLog.create({
      data: {
        jobId: job.id?.toString(),
        jobType: job.name,
        recipient: Array.isArray(job.data.to) ? job.data.to.join(',') : job.data.to,
        subject: job.data.subject || 'No Subject',
        status: 'SENDING',
        attempt: job.attemptsMade + 1,
        scheduledAt: job.data.scheduledAt || new Date(),
        userId: job.data.userId,
        metadata: job.data.metadata ? JSON.stringify(job.data.metadata) : null,
      }
    });

    emailLogId = emailLog.id;
    await job.updateProgress(10);

    // Route to specific email handler based on job type
    let result: { success: boolean; messageId?: string; message: string };

    switch (job.name) {
      case JOB_TYPES.EMAIL.WELCOME:
        result = await processWelcomeEmail(job as Job<WelcomeEmailData>);
        break;
        
      case JOB_TYPES.EMAIL.SYNC_SUCCESS:
      case JOB_TYPES.EMAIL.SYNC_FAILURE:
        result = await processSyncNotificationEmail(job as Job<SyncNotificationEmailData>);
        break;
        
      case JOB_TYPES.EMAIL.WEEKLY_DIGEST:
        result = await processDigestEmail(job as Job<DigestEmailData>);
        break;
        
      case JOB_TYPES.EMAIL.SUBSCRIPTION_REMINDER:
        result = await processSubscriptionReminderEmail(job as Job<SubscriptionReminderData>);
        break;
        
      case JOB_TYPES.EMAIL.PASSWORD_RESET:
        result = await processPasswordResetEmail(job);
        break;
        
      case JOB_TYPES.EMAIL.UPGRADE:
        result = await processUpgradeEmail(job);
        break;
        
      default:
        result = await processGenericEmail(job);
    }

    const duration = Date.now() - startTime;

    // Update email log with success
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        status: 'SENT',
        messageId: result.messageId,
        sentAt: new Date(),
        duration,
        response: result.message
      }
    });

    logger.info('Email job completed successfully', {
      jobId: job.id,
      jobName: job.name,
      duration,
      messageId: result.messageId,
      to: job.data.to
    });

    await job.updateProgress(100);

    return {
      success: true,
      duration,
      messageId: result.messageId,
      message: result.message
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Update email log with failure
    if (emailLogId) {
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          duration,
          failedAt: new Date()
        }
      });
    }

    logger.error('Email job failed', {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      to: job.data.to
    });

    // Determine if this is a retryable error
    const isRetryable = determineIfEmailRetryable(error);
    
    if (!isRetryable) {
      logger.error('Email job marked as non-retryable', {
        jobId: job.id,
        errorType: error.name,
        errorMessage: error.message
      });
    }

    throw error;
  }
};

/**
 * Process welcome email
 */
async function processWelcomeEmail(job: Job<WelcomeEmailData>): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const { to, userId, userName, verificationToken } = job.data;

  await job.updateProgress(20);

  const emailData = {
    to,
    subject: 'Welcome to Income Clarity!',
    template: 'welcome',
    templateData: {
      userName,
      verificationToken,
      verificationUrl: verificationToken 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}`
        : null,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@incomeclarity.com'
    }
  };

  await job.updateProgress(50);

  const result = await sendEmailWithService(emailData);

  await job.updateProgress(90);

  return result;
}

/**
 * Process sync notification email
 */
async function processSyncNotificationEmail(job: Job<SyncNotificationEmailData>): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const { 
    to, 
    userId, 
    syncType, 
    status, 
    itemsSynced, 
    errorMessage, 
    duration 
  } = job.data;

  await job.updateProgress(20);

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true }
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  await job.updateProgress(40);

  const isSuccess = status === 'success';
  const emailData = {
    to,
    subject: isSuccess 
      ? `Sync Complete - ${itemsSynced} items updated`
      : `Sync Failed - ${syncType}`,
    template: isSuccess ? 'sync-success' : 'sync-failure',
    templateData: {
      userName: `${user.firstName} ${user.lastName}`.trim() || 'User',
      syncType,
      itemsSynced: itemsSynced || 0,
      duration: duration ? Math.round(duration / 1000) : 0,
      errorMessage,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@incomeclarity.com'
    }
  };

  await job.updateProgress(70);

  const result = await sendEmailWithService(emailData);

  await job.updateProgress(90);

  return result;
}

/**
 * Process weekly digest email
 */
async function processDigestEmail(job: Job<DigestEmailData>): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const { to, userId, portfolioSummary, weeklyStats } = job.data;

  await job.updateProgress(20);

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true }
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  await job.updateProgress(40);

  const emailData = {
    to,
    subject: `Your Weekly Portfolio Summary - ${new Date().toLocaleDateString()}`,
    template: 'weekly-digest',
    templateData: {
      userName: `${user.firstName} ${user.lastName}`.trim() || 'User',
      portfolioSummary: {
        ...portfolioSummary,
        formattedTotalValue: formatCurrency(portfolioSummary.totalValue),
        formattedGainLoss: formatCurrency(portfolioSummary.totalGainLoss),
        gainLossColor: portfolioSummary.totalGainLoss >= 0 ? 'green' : 'red',
        gainLossSymbol: portfolioSummary.totalGainLoss >= 0 ? '+' : ''
      },
      weeklyStats,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?userId=${userId}&type=digest`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@incomeclarity.com'
    }
  };

  await job.updateProgress(70);

  const result = await sendEmailWithService(emailData);

  await job.updateProgress(90);

  return result;
}

/**
 * Process subscription reminder email
 */
async function processSubscriptionReminderEmail(job: Job<SubscriptionReminderData>): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const { 
    to, 
    userId, 
    subscriptionPlan, 
    expiryDate, 
    renewalUrl, 
    daysUntilExpiry 
  } = job.data;

  await job.updateProgress(20);

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true }
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  await job.updateProgress(40);

  const emailData = {
    to,
    subject: `Subscription Reminder - ${daysUntilExpiry} days remaining`,
    template: 'subscription-reminder',
    templateData: {
      userName: `${user.firstName} ${user.lastName}`.trim() || 'User',
      subscriptionPlan,
      expiryDate: expiryDate.toLocaleDateString(),
      renewalUrl,
      daysUntilExpiry,
      urgency: daysUntilExpiry <= 3 ? 'high' : daysUntilExpiry <= 7 ? 'medium' : 'low',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@incomeclarity.com'
    }
  };

  await job.updateProgress(70);

  const result = await sendEmailWithService(emailData);

  await job.updateProgress(90);

  return result;
}

/**
 * Process password reset email
 */
async function processPasswordResetEmail(job: Job<BaseEmailJobData>): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const { to, templateData } = job.data;

  await job.updateProgress(20);

  const emailData = {
    to,
    subject: 'Password Reset Request - Income Clarity',
    template: 'password-reset',
    templateData: {
      resetUrl: templateData?.resetUrl,
      userName: templateData?.userName || 'User',
      expiresIn: templateData?.expiresIn || '24 hours',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@incomeclarity.com'
    }
  };

  await job.updateProgress(70);

  const result = await sendEmailWithService(emailData);

  await job.updateProgress(90);

  return result;
}

/**
 * Process upgrade notification email
 */
async function processUpgradeEmail(job: Job<BaseEmailJobData>): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const { to, templateData } = job.data;

  await job.updateProgress(20);

  const emailData = {
    to,
    subject: 'Account Upgraded Successfully!',
    template: 'upgrade-success',
    templateData: {
      userName: templateData?.userName || 'User',
      newPlan: templateData?.newPlan,
      features: templateData?.features || [],
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@incomeclarity.com'
    }
  };

  await job.updateProgress(70);

  const result = await sendEmailWithService(emailData);

  await job.updateProgress(90);

  return result;
}

/**
 * Process generic email
 */
async function processGenericEmail(job: Job<BaseEmailJobData>): Promise<{
  success: boolean;
  messageId?: string;
  message: string;
}> {
  const { to, subject, templateId, templateData } = job.data;

  await job.updateProgress(20);

  if (!subject) {
    throw new Error('Subject is required for generic emails');
  }

  const emailData = {
    to,
    subject,
    template: templateId,
    templateData
  };

  await job.updateProgress(70);

  const result = await sendEmailWithService(emailData);

  await job.updateProgress(90);

  return result;
}

/**
 * Send email using the configured email service
 */
async function sendEmailWithService(emailData: {
  to: string | string[];
  subject: string;
  template?: string;
  templateData?: Record<string, any>;
}): Promise<{ success: boolean; messageId?: string; message: string }> {
  try {
    // Import email service dynamically to avoid circular dependencies
    const { emailService } = await import('../../services/email.service');

    const result = await emailService.sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      template: emailData.template,
      templateData: emailData.templateData
    });

    return {
      success: true,
      messageId: result.messageId,
      message: result.message || 'Email sent successfully'
    };

  } catch (error) {
    logger.error('Email service failed', {
      error: error.message,
      to: emailData.to,
      subject: emailData.subject
    });

    throw new Error(`Email service failed: ${error.message}`);
  }
}

/**
 * Determine if an email error is retryable
 */
function determineIfEmailRetryable(error: Error): boolean {
  const nonRetryableErrors = [
    'invalid email address',
    'recipient not found',
    'mailbox full',
    'blocked recipient',
    'authentication failed',
    'invalid template',
    'malformed request'
  ];

  const retryableErrors = [
    'rate limit exceeded',
    'service unavailable',
    'temporary failure',
    'timeout',
    'network error',
    'connection refused'
  ];

  const errorMessage = error.message.toLowerCase();

  // Check for explicitly non-retryable errors
  if (nonRetryableErrors.some(msg => errorMessage.includes(msg))) {
    return false;
  }

  // Check for explicitly retryable errors
  if (retryableErrors.some(msg => errorMessage.includes(msg))) {
    return true;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Export job data types for use in other modules
export type {
  BaseEmailJobData,
  WelcomeEmailData,
  SyncNotificationEmailData,
  DigestEmailData,
  SubscriptionReminderData,
  EmailJobData
};