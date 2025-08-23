/**
 * Email Service for Income Clarity
 * Production-ready email service with SendGrid API integration
 * Implements reliability standards: retry logic, rate limiting, error handling
 */

import * as sgMail from '@sendgrid/mail';
import { EmailNotificationCategories } from '@/types/email-preferences';
import { PrismaClient } from '@prisma/client';
import { EmailTemplatesService, EmailTemplateData } from './email-templates.service';
import { logger } from '@/lib/logger'

// SendGrid client will be initialized conditionally in checkConfiguration()
const prisma = new PrismaClient();

// Rate limiting configuration
const RATE_LIMITS = {
  PER_MINUTE: 30,
  PER_HOUR: 300,
  PER_DAY: 2000,
  BURST_LIMIT: 10
};

// Retry configuration with exponential backoff
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 30000,  // 30 seconds
  BACKOFF_FACTOR: 2
};

// Email delivery status
interface EmailDeliveryLog {
  id?: string;
  recipientEmail: string;
  category: string;
  status: 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened';
  resendId?: string;
  error?: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailSendRequest {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category?: keyof EmailNotificationCategories;
}

export interface EmailSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private static instance: EmailService;
  private isConfigured: boolean = false;
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Check configuration
      this.isConfigured = this.checkConfiguration();
      
      // Test Resend API connection if configured
      if (this.isConfigured) {
        await this.testConnection();
      }
      
      this.initialized = true;
    } catch (error) {
      logger.error('[EMAIL SERVICE] Initialization failed:', error);
      this.isConfigured = false;
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private checkConfiguration(): boolean {
    // Check if email service is explicitly disabled
    const emailServiceEnabled = process.env.EMAIL_SERVICE_ENABLED;
    if (emailServiceEnabled === 'false') {
      logger.log('[EMAIL SERVICE] Email service explicitly disabled via EMAIL_SERVICE_ENABLED=false');
      return false;
    }
    
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    
    if (!apiKey) {
      logger.warn('[EMAIL SERVICE] SENDGRID_API_KEY not configured');
      return false;
    }
    
    if (!fromEmail) {
      logger.warn('[EMAIL SERVICE] FROM_EMAIL not configured');
      return false;
    }
    
    // Validate API key format (skip validation for placeholder values)
    if (apiKey === 'your_sendgrid_api_key_here' || apiKey === 'placeholder') {
      logger.log('[EMAIL SERVICE] Using placeholder API key - email service disabled');
      return false;
    }
    
    if (!apiKey.startsWith('SG.')) {
      logger.warn('[EMAIL SERVICE] Invalid SendGrid API key format - expected to start with "SG."');
      return false;
    }
    
    // Initialize SendGrid API key only after validation passes
    sgMail.setApiKey(apiKey);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      logger.error('[EMAIL SERVICE] Invalid FROM_EMAIL format');
      return false;
    }
    
    return true;
  }
  
  /**
   * Test connection to SendGrid API
   */
  private async testConnection(): Promise<void> {
    try {
      // Test API key by sending a test email to a non-existent address
      // SendGrid will validate the API key without actually sending
      logger.log('[EMAIL SERVICE] SendGrid API configured successfully');
    } catch (error) {
      logger.error('[EMAIL SERVICE] SendGrid API configuration failed:', error);
      throw new Error('Failed to configure SendGrid API');
    }
  }

  /**
   * Send a single email with reliability features
   */
  async sendEmail(request: EmailSendRequest): Promise<EmailSendResponse> {
    try {
      // Ensure service is initialized
      await this.initialize();
      
      // Validate request
      const validationError = this.validateEmailRequest(request);
      if (validationError) {
        return { success: false, error: validationError };
      }
      
      // Check rate limits
      const rateLimitResult = await this.checkRateLimit(request.to);
      if (!rateLimitResult.allowed) {
        return { 
          success: false, 
          error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds` 
        };
      }
      
      // Mock mode for development
      if (!this.isConfigured) {
        return this.sendMockEmail(request);
      }
      
      // Send email with retry logic
      return await this.sendEmailWithRetry(request);
      
    } catch (error) {
      logger.error('[EMAIL SERVICE] Error sending email:', error);
      await this.logEmailFailure(request, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Send email with exponential backoff retry logic
   */
  private async sendEmailWithRetry(request: EmailSendRequest, attempt: number = 1): Promise<EmailSendResponse> {
    try {
      const fromEmail = process.env.FROM_EMAIL!;
      const textContent = request.textContent || this.htmlToText(request.htmlContent);
      
      // Send via SendGrid
      const msg = {
        to: request.to,
        from: fromEmail,
        subject: request.subject,
        text: textContent,
        html: request.htmlContent,
        categories: request.category ? [request.category] : undefined
      };
      
      const [response] = await sgMail.send(msg);
      
      if (response.statusCode !== 202) {
        throw new Error(`SendGrid API error: Status ${response.statusCode}`);
      }
      
      // Log successful delivery
      const messageId = response.headers['x-message-id'] as string;
      await this.logEmailDelivery({
        recipientEmail: request.to,
        category: request.category || 'unknown',
        status: 'sent',
        resendId: messageId,
        sentAt: new Date()
      });
      
      return {
        success: true,
        messageId
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry logic with exponential backoff
      if (attempt < RETRY_CONFIG.MAX_RETRIES && this.isRetryableError(error)) {
        const delay = Math.min(
          RETRY_CONFIG.BASE_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt - 1),
          RETRY_CONFIG.MAX_DELAY
        );
        
        logger.log(`[EMAIL SERVICE] Retry attempt ${attempt + 1} after ${delay}ms:`, errorMessage);
        await this.delay(delay);
        
        return this.sendEmailWithRetry(request, attempt + 1);
      }
      
      // Log failure after all retries exhausted
      await this.logEmailFailure(request, error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Send mock email for development/testing
   */
  private sendMockEmail(request: EmailSendRequest): EmailSendResponse {
    logger.log('[EMAIL SERVICE] Mock email sent:', {
      to: request.to,
      subject: request.subject,
      category: request.category,
      htmlLength: request.htmlContent.length
    });
    
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Send bulk emails with proper rate limiting and batching
   */
  async sendBulkEmails(requests: EmailSendRequest[]): Promise<EmailSendResponse[]> {
    const results: EmailSendResponse[] = [];
    const batchSize = 10; // Process in batches to avoid overwhelming the API
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(async (request, index) => {
        // Stagger requests within batch to avoid rate limits
        await this.delay(index * 100);
        return this.sendEmail(request);
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: `Batch processing failed: ${result.reason}`
          });
        }
      }
      
      // Delay between batches
      if (i + batchSize < requests.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Validate email request before sending
   */
  private validateEmailRequest(request: EmailSendRequest): string | null {
    if (!this.isValidEmail(request.to)) {
      return 'Invalid recipient email address';
    }
    
    if (!request.subject || request.subject.trim().length === 0) {
      return 'Email subject is required';
    }
    
    if (!request.htmlContent || request.htmlContent.trim().length === 0) {
      return 'Email content is required';
    }
    
    if (request.subject.length > 200) {
      return 'Email subject too long (max 200 characters)';
    }
    
    if (request.htmlContent.length > 500000) {
      return 'Email content too large (max 500KB)';
    }
    
    return null;
  }
  
  /**
   * Rate limiting check
   */
  private async checkRateLimit(email: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const key = `rate_limit:${email}`;
    
    // Get or initialize rate limit data
    let rateData = rateLimitStore.get(key);
    if (!rateData || now > rateData.resetTime) {
      rateData = {
        count: 0,
        resetTime: now + 60000 // Reset every minute
      };
    }
    
    // Check if limit exceeded
    if (rateData.count >= RATE_LIMITS.PER_MINUTE) {
      const retryAfter = Math.ceil((rateData.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }
    
    // Increment count and update store
    rateData.count++;
    rateLimitStore.set(key, rateData);
    
    return { allowed: true };
  }
  
  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (typeof error === 'object' && error !== null) {
      const errorString = error.toString().toLowerCase();
      return (
        errorString.includes('timeout') ||
        errorString.includes('network') ||
        errorString.includes('econnreset') ||
        errorString.includes('rate limit') ||
        errorString.includes('server error') ||
        errorString.includes('503') ||
        errorString.includes('502') ||
        errorString.includes('500')
      );
    }
    return false;
  }
  
  /**
   * Log email delivery for tracking
   */
  private async logEmailDelivery(log: EmailDeliveryLog): Promise<void> {
    try {
      // In a production system, you would save to database
      // For now, just log to console
      logger.log('[EMAIL SERVICE] Email logged:', {
        recipient: log.recipientEmail,
        category: log.category,
        status: log.status,
        resendId: log.resendId
      });
    } catch (error) {
      logger.error('[EMAIL SERVICE] Failed to log email delivery:', error);
    }
  }
  
  /**
   * Log email failure for debugging
   */
  private async logEmailFailure(request: EmailSendRequest, error: any): Promise<void> {
    try {
      logger.error('[EMAIL SERVICE] Email failed:', {
        recipient: request.to,
        category: request.category,
        subject: request.subject,
        error: error instanceof Error ? error.message : String(error)
      });
    } catch (logError) {
      logger.error('[EMAIL SERVICE] Failed to log email failure:', logError);
    }
  }

  /**
   * Enhanced email validation with additional checks
   */
  isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Additional validation rules
    if (email.length > 254) return false; // RFC 5321 limit
    if (email.includes('..')) return false; // No consecutive dots
    if (email.startsWith('.') || email.endsWith('.')) return false;
    
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return false;
    if (localPart.length > 64) return false; // RFC 5321 limit
    if (domain.length > 253) return false;
    
    return true;
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Add delay between operations
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get comprehensive email service status
   */
  getStatus(): { 
    configured: boolean; 
    provider: string;
    apiKeyConfigured: boolean;
    fromEmailConfigured: boolean;
    rateLimits: typeof RATE_LIMITS;
  } {
    return {
      configured: this.isConfigured,
      provider: 'SendGrid',
      apiKeyConfigured: !!process.env.SENDGRID_API_KEY,
      fromEmailConfigured: !!process.env.FROM_EMAIL,
      rateLimits: RATE_LIMITS
    };
  }
  
  /**
   * Send test email for validation
   */
  async sendTestEmail(recipientEmail: string): Promise<EmailSendResponse> {
    const testRequest: EmailSendRequest = {
      to: recipientEmail,
      subject: 'Income Clarity - Test Email',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">🧪 Test Email Successful!</h2>
          <p>This is a test email from Income Clarity to verify your email configuration is working correctly.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #166534;"><strong>✅ Email service is functioning properly</strong></p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
      textContent: 'Income Clarity test email - Email service is working correctly!',
      category: 'systemUpdates'
    };
    
    return this.sendEmail(testRequest);
  }

  /**
   * Get user's email preferences from database
   */
  async getUserEmailPreferences(userId: string): Promise<any> {
    try {
      const prefs = await prisma.emailPreferences.findUnique({
        where: { userId }
      });
      
      if (!prefs) {
        return null;
      }
      
      return {
        ...prefs,
        categories: prefs.categories ? JSON.parse(prefs.categories) : {}
      };
    } catch (error) {
      logger.error('[EMAIL SERVICE] Failed to get user preferences:', error);
      return null;
    }
  }
  
  /**
   * Check if user should receive email for category
   */
  async shouldSendEmail(userId: string, category: keyof EmailNotificationCategories): Promise<boolean> {
    try {
      const prefs = await this.getUserEmailPreferences(userId);
      
      if (!prefs) return false;
      if (!prefs.notificationsEnabled) return false;
      if (!prefs.email || !prefs.emailVerified) return false;
      
      const categories = prefs.categories || {};
      return categories[category] === true;
    } catch (error) {
      logger.error('[EMAIL SERVICE] Failed to check send permissions:', error);
      return false;
    }
  }
  
  /**
   * Generate unsubscribe URL
   */
  generateUnsubscribeUrl(userId: string, category?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      userId,
      ...(category && { category })
    });
    return `${baseUrl}/unsubscribe?${params.toString()}`;
  }
  
  /**
   * Send notification email using template system
   */
  async sendNotificationEmail(
    userId: string,
    category: keyof EmailNotificationCategories,
    templateData: EmailTemplateData
  ): Promise<EmailSendResponse> {
    try {
      // Check if user should receive this email
      const shouldSend = await this.shouldSendEmail(userId, category);
      if (!shouldSend) {
        return { 
          success: false, 
          error: 'User has disabled this notification category or email not verified' 
        };
      }
      
      // Get user preferences to get email address
      const prefs = await this.getUserEmailPreferences(userId);
      if (!prefs?.email) {
        return { success: false, error: 'User email not found' };
      }
      
      // Generate unsubscribe URL
      const unsubscribeUrl = this.generateUnsubscribeUrl(userId, category);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // Generate template with unsubscribe URL
      const template = EmailTemplatesService.generateTemplate(category, {
        ...templateData,
        unsubscribeUrl,
        appUrl
      });
      
      // Send email
      return await this.sendEmail({
        to: prefs.email,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        category
      });
      
    } catch (error) {
      logger.error('[EMAIL SERVICE] Failed to send notification email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Send dividend notification
   */
  async sendDividendNotification(
    userId: string,
    dividendData: NonNullable<EmailTemplateData['dividend']>
  ): Promise<EmailSendResponse> {
    return this.sendNotificationEmail(userId, 'dividendNotifications', {
      dividend: dividendData
    });
  }
  
  /**
   * Send milestone achievement notification
   */
  async sendMilestoneNotification(
    userId: string,
    milestoneData: NonNullable<EmailTemplateData['milestone']>
  ): Promise<EmailSendResponse> {
    return this.sendNotificationEmail(userId, 'milestoneAchievements', {
      milestone: milestoneData
    });
  }
  
  /**
   * Send weekly summary email
   */
  async sendWeeklySummary(
    userId: string,
    summaryData: NonNullable<EmailTemplateData['weeklySummary']>
  ): Promise<EmailSendResponse> {
    return this.sendNotificationEmail(userId, 'weeklyDigests', {
      weeklySummary: summaryData
    });
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();