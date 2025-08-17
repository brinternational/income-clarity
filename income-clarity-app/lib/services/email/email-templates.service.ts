/**
 * Email Template Service for Income Clarity
 * Comprehensive template system with HTML/text versions
 * Responsive design and Income Clarity branding
 */

import { EmailNotificationCategories } from '@/types/email-preferences';

export interface EmailTemplateData {
  // Common data
  userFirstName?: string;
  unsubscribeUrl?: string;
  appUrl?: string;
  
  // Dividend notification data
  dividend?: {
    ticker: string;
    amount: number;
    paymentDate: string;
    shares: number;
    ratePerShare: number;
    monthlyTotal: number;
    ytdTotal: number;
    yieldOnCost: number;
    portfolioImpact: number;
  };
  
  // Milestone data
  milestone?: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercent: number;
    nextMilestone: string;
    timeToNext: string;
    category: 'utilities' | 'food' | 'housing' | 'transportation' | 'healthcare' | 'lifestyle' | 'complete_fire';
  };
  
  // Weekly summary data
  weeklySummary?: {
    weekStart: string;
    weekEnd: string;
    totalReturn: number;
    dividendIncome: number;
    portfolioValue: number;
    vsSpyReturn: number;
    topPerformer: string;
    topPerformerReturn: number;
    dividendPayments: Array<{
      ticker: string;
      amount: number;
      date: string;
    }>;
    rebalancingSuggestions: Array<{
      action: string;
      ticker: string;
      reason: string;
    }>;
    marketInsights: string[];
  };
  
  // Portfolio alert data
  portfolioAlert?: {
    ticker: string;
    change: number;
    currentValue: number;
    dollarChange: number;
    vsSpyChange: number;
    alertReason: string;
  };
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export class EmailTemplatesService {
  private static readonly BRAND_COLORS = {
    primary: '#1f2937',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f9fafb',
    text: '#374151',
    muted: '#6b7280'
  };
  
  private static readonly BASE_STYLES = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #374151;
        margin: 0;
        padding: 0;
        background-color: #f9fafb;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #1f2937 0%, #3b82f6 100%);
        color: white;
        padding: 32px 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        margin: 8px 0 0 0;
        font-size: 16px;
        opacity: 0.9;
      }
      .content {
        padding: 32px 24px;
      }
      .metric-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin: 16px 0;
      }
      .metric-positive {
        background: #f0fdf4;
        border-color: #bbf7d0;
        color: #166534;
      }
      .metric-negative {
        background: #fef2f2;
        border-color: #fecaca;
        color: #991b1b;
      }
      .metric-warning {
        background: #fffbeb;
        border-color: #fed7aa;
        color: #92400e;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 16px 0;
      }
      .footer {
        background: #f8fafc;
        padding: 24px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }
      .unsubscribe {
        color: #6b7280;
        text-decoration: none;
        font-size: 12px;
      }
      @media only screen and (max-width: 600px) {
        .container { margin: 0; border-radius: 0; }
        .content, .header, .footer { padding: 20px; }
        .header h1 { font-size: 24px; }
      }
    </style>
  `;
  
  /**
   * Generate dividend notification email
   */
  static generateDividendNotification(data: EmailTemplateData): EmailTemplate {
    const { dividend, userFirstName = 'Investor', unsubscribeUrl, appUrl = 'https://incomeclarity.com' } = data;
    
    if (!dividend) {
      throw new Error('Dividend data is required for dividend notification template');
    }
    
    const subject = `💰 Dividend Payment: $${dividend.amount.toFixed(2)} from ${dividend.ticker}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Dividend Payment Received</title>
        ${this.BASE_STYLES}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Dividend Received!</h1>
            <p>Your ${dividend.ticker} holdings just paid out</p>
          </div>
          
          <div class="content">
            <p>Hi ${userFirstName},</p>
            
            <p>Great news! You've received a dividend payment of <strong>$${dividend.amount.toFixed(2)}</strong> from your ${dividend.ticker} holdings.</p>
            
            <div class="metric-card metric-positive">
              <h3 style="margin: 0 0 16px 0;">Payment Details</h3>
              <p><strong>Stock:</strong> ${dividend.ticker}</p>
              <p><strong>Payment Date:</strong> ${dividend.paymentDate}</p>
              <p><strong>Shares:</strong> ${dividend.shares.toLocaleString()}</p>
              <p><strong>Rate per Share:</strong> $${dividend.ratePerShare.toFixed(3)}</p>
              <p><strong>Total Amount:</strong> $${dividend.amount.toFixed(2)}</p>
            </div>
            
            <div class="metric-card">
              <h3 style="margin: 0 0 16px 0;">Portfolio Impact</h3>
              <p><strong>Monthly Dividend Total:</strong> $${dividend.monthlyTotal.toFixed(2)}</p>
              <p><strong>Year-to-Date Total:</strong> $${dividend.ytdTotal.toFixed(2)}</p>
              <p><strong>Yield on Cost:</strong> ${dividend.yieldOnCost.toFixed(2)}%</p>
              <p><strong>Portfolio Income Boost:</strong> ${dividend.portfolioImpact.toFixed(2)}%</p>
            </div>
            
            <p>This dividend payment brings you closer to your financial independence goals. Keep up the great work!</p>
            
            <a href="${appUrl}/dashboard" class="button">View Portfolio Dashboard</a>
          </div>
          
          <div class="footer">
            <p><strong>Income Clarity</strong> - Your Path to Financial Independence</p>
            <p style="margin: 16px 0 0 0;">
              <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe from dividend notifications</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
Dividend Payment Received - Income Clarity

Hi ${userFirstName},

Great news! You've received a dividend payment of $${dividend.amount.toFixed(2)} from your ${dividend.ticker} holdings.

Payment Details:
- Stock: ${dividend.ticker}
- Payment Date: ${dividend.paymentDate}
- Shares: ${dividend.shares.toLocaleString()}
- Rate per Share: $${dividend.ratePerShare.toFixed(3)}
- Total Amount: $${dividend.amount.toFixed(2)}

Portfolio Impact:
- Monthly Dividend Total: $${dividend.monthlyTotal.toFixed(2)}
- Year-to-Date Total: $${dividend.ytdTotal.toFixed(2)}
- Yield on Cost: ${dividend.yieldOnCost.toFixed(2)}%
- Portfolio Income Boost: ${dividend.portfolioImpact.toFixed(2)}%

This dividend payment brings you closer to your financial independence goals. Keep up the great work!

View your portfolio: ${appUrl}/dashboard

---
Income Clarity - Your Path to Financial Independence
Unsubscribe: ${unsubscribeUrl}
    `;
    
    return { subject, htmlContent, textContent };
  }
  
  /**
   * Generate milestone achievement email
   */
  static generateMilestoneAchievement(data: EmailTemplateData): EmailTemplate {
    const { milestone, userFirstName = 'Investor', unsubscribeUrl, appUrl = 'https://incomeclarity.com' } = data;
    
    if (!milestone) {
      throw new Error('Milestone data is required for milestone achievement template');
    }
    
    const milestoneEmojis = {
      utilities: '⚡',
      food: '🍽️',
      housing: '🏠',
      transportation: '🚗',
      healthcare: '🏥',
      lifestyle: '🌟',
      complete_fire: '🎯'
    };
    
    const emoji = milestoneEmojis[milestone.category] || '🎉';
    const subject = `${emoji} Milestone Achieved: ${milestone.name}!`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Milestone Achievement</title>
        ${this.BASE_STYLES}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Congratulations!</h1>
            <p>You've reached a major financial milestone</p>
          </div>
          
          <div class="content">
            <p>Hi ${userFirstName},</p>
            
            <p>🎉 <strong>Amazing news!</strong> You've just achieved your <strong>${milestone.name}</strong> milestone!</p>
            
            <div class="metric-card metric-positive">
              <h3 style="margin: 0 0 16px 0;">Milestone Details</h3>
              <p><strong>Achievement:</strong> ${milestone.name}</p>
              <p><strong>Target Amount:</strong> $${milestone.targetAmount.toLocaleString()}</p>
              <p><strong>Current Amount:</strong> $${milestone.currentAmount.toLocaleString()}</p>
              <p><strong>Progress:</strong> ${milestone.progressPercent.toFixed(1)}%</p>
            </div>
            
            <div class="metric-card">
              <h3 style="margin: 0 0 16px 0;">What's Next?</h3>
              <p><strong>Next Milestone:</strong> ${milestone.nextMilestone}</p>
              <p><strong>Estimated Time:</strong> ${milestone.timeToNext}</p>
            </div>
            
            <p>This is a significant step toward your financial independence! Your dedication to building passive income is paying off.</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <p style="font-size: 18px; font-weight: 600; color: #10b981;">🎯 Keep up the momentum!</p>
            </div>
            
            <a href="${appUrl}/planning" class="button">View Your FIRE Progress</a>
            
            <div style="margin: 24px 0; padding: 16px; background: #eff6ff; border-radius: 8px;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">💡 Share Your Success</p>
              <p style="margin: 8px 0 0 0; color: #1e40af;">Consider celebrating this milestone with friends and family. Your journey can inspire others!</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Income Clarity</strong> - Your Path to Financial Independence</p>
            <p style="margin: 16px 0 0 0;">
              <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe from milestone notifications</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
Milestone Achievement - Income Clarity

Hi ${userFirstName},

🎉 Amazing news! You've just achieved your ${milestone.name} milestone!

Milestone Details:
- Achievement: ${milestone.name}
- Target Amount: $${milestone.targetAmount.toLocaleString()}
- Current Amount: $${milestone.currentAmount.toLocaleString()}
- Progress: ${milestone.progressPercent.toFixed(1)}%

What's Next?
- Next Milestone: ${milestone.nextMilestone}
- Estimated Time: ${milestone.timeToNext}

This is a significant step toward your financial independence! Your dedication to building passive income is paying off.

🎯 Keep up the momentum!

View your FIRE progress: ${appUrl}/planning

💡 Share Your Success
Consider celebrating this milestone with friends and family. Your journey can inspire others!

---
Income Clarity - Your Path to Financial Independence
Unsubscribe: ${unsubscribeUrl}
    `;
    
    return { subject, htmlContent, textContent };
  }
  
  /**
   * Generate weekly summary email
   */
  static generateWeeklySummary(data: EmailTemplateData): EmailTemplate {
    const { weeklySummary, userFirstName = 'Investor', unsubscribeUrl, appUrl = 'https://incomeclarity.com' } = data;
    
    if (!weeklySummary) {
      throw new Error('Weekly summary data is required for weekly summary template');
    }
    
    const subject = `📈 Your Weekly Summary - ${weeklySummary.weekStart} to ${weeklySummary.weekEnd}`;
    const returnColor = weeklySummary.totalReturn >= 0 ? '#10b981' : '#ef4444';
    const returnSign = weeklySummary.totalReturn >= 0 ? '+' : '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Weekly Portfolio Summary</title>
        ${this.BASE_STYLES}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Weekly Summary</h1>
            <p>${weeklySummary.weekStart} to ${weeklySummary.weekEnd}</p>
          </div>
          
          <div class="content">
            <p>Hi ${userFirstName},</p>
            
            <p>Here's your portfolio performance summary for this week:</p>
            
            <div class="metric-card ${weeklySummary.totalReturn >= 0 ? 'metric-positive' : 'metric-negative'}">
              <h3 style="margin: 0 0 16px 0;">📊 Weekly Performance</h3>
              <p><strong>Total Return:</strong> <span style="color: ${returnColor};">${returnSign}${weeklySummary.totalReturn.toFixed(2)}%</span></p>
              <p><strong>Portfolio Value:</strong> $${weeklySummary.portfolioValue.toLocaleString()}</p>
              <p><strong>vs SPY:</strong> ${weeklySummary.vsSpyReturn > 0 ? '+' : ''}${weeklySummary.vsSpyReturn.toFixed(2)}%</p>
              <p><strong>Top Performer:</strong> ${weeklySummary.topPerformer} (${weeklySummary.topPerformerReturn > 0 ? '+' : ''}${weeklySummary.topPerformerReturn.toFixed(2)}%)</p>
            </div>
            
            ${weeklySummary.dividendIncome > 0 ? `
            <div class="metric-card metric-positive">
              <h3 style="margin: 0 0 16px 0;">💰 Dividend Income</h3>
              <p><strong>This Week:</strong> $${weeklySummary.dividendIncome.toFixed(2)}</p>
              ${weeklySummary.dividendPayments.map(payment => 
                `<p>• ${payment.ticker}: $${payment.amount.toFixed(2)} (${payment.date})</p>`
              ).join('')}
            </div>
            ` : ''}
            
            ${weeklySummary.rebalancingSuggestions.length > 0 ? `
            <div class="metric-card metric-warning">
              <h3 style="margin: 0 0 16px 0;">⚖️ Rebalancing Suggestions</h3>
              ${weeklySummary.rebalancingSuggestions.map(suggestion =>
                `<p><strong>${suggestion.action} ${suggestion.ticker}:</strong> ${suggestion.reason}</p>`
              ).join('')}
            </div>
            ` : ''}
            
            ${weeklySummary.marketInsights.length > 0 ? `
            <div class="metric-card">
              <h3 style="margin: 0 0 16px 0;">💡 Market Insights</h3>
              ${weeklySummary.marketInsights.map(insight =>
                `<p>• ${insight}</p>`
              ).join('')}
            </div>
            ` : ''}
            
            <a href="${appUrl}/dashboard" class="button">View Full Dashboard</a>
          </div>
          
          <div class="footer">
            <p><strong>Income Clarity</strong> - Your Path to Financial Independence</p>
            <p style="margin: 16px 0 0 0;">
              <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe from weekly summaries</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
Weekly Portfolio Summary - Income Clarity

Hi ${userFirstName},

Here's your portfolio performance summary for ${weeklySummary.weekStart} to ${weeklySummary.weekEnd}:

📊 Weekly Performance:
- Total Return: ${returnSign}${weeklySummary.totalReturn.toFixed(2)}%
- Portfolio Value: $${weeklySummary.portfolioValue.toLocaleString()}
- vs SPY: ${weeklySummary.vsSpyReturn > 0 ? '+' : ''}${weeklySummary.vsSpyReturn.toFixed(2)}%
- Top Performer: ${weeklySummary.topPerformer} (${weeklySummary.topPerformerReturn > 0 ? '+' : ''}${weeklySummary.topPerformerReturn.toFixed(2)}%)

${weeklySummary.dividendIncome > 0 ? `
💰 Dividend Income:
- This Week: $${weeklySummary.dividendIncome.toFixed(2)}
${weeklySummary.dividendPayments.map(payment => 
  `- ${payment.ticker}: $${payment.amount.toFixed(2)} (${payment.date})`
).join('\n')}
` : ''}

${weeklySummary.rebalancingSuggestions.length > 0 ? `
⚖️ Rebalancing Suggestions:
${weeklySummary.rebalancingSuggestions.map(suggestion =>
  `- ${suggestion.action} ${suggestion.ticker}: ${suggestion.reason}`
).join('\n')}
` : ''}

${weeklySummary.marketInsights.length > 0 ? `
💡 Market Insights:
${weeklySummary.marketInsights.map(insight =>
  `- ${insight}`
).join('\n')}
` : ''}

View your full dashboard: ${appUrl}/dashboard

---
Income Clarity - Your Path to Financial Independence
Unsubscribe: ${unsubscribeUrl}
    `;
    
    return { subject, htmlContent, textContent };
  }
  
  /**
   * Generate template for any notification category
   */
  static generateTemplate(
    category: keyof EmailNotificationCategories,
    data: EmailTemplateData
  ): EmailTemplate {
    switch (category) {
      case 'dividendNotifications':
        return this.generateDividendNotification(data);
      case 'milestoneAchievements':
        return this.generateMilestoneAchievement(data);
      case 'weeklyDigests':
        return this.generateWeeklySummary(data);
      case 'monthlyReports':
        return this.generateWeeklySummary({ 
          ...data, 
          weeklySummary: data.weeklySummary ? {
            ...data.weeklySummary,
            weekStart: 'Month Start',
            weekEnd: 'Month End'
          } : undefined 
        });
      default:
        return this.generateGenericNotification(category, data);
    }
  }
  
  /**
   * Generate generic notification template
   */
  private static generateGenericNotification(
    category: keyof EmailNotificationCategories, 
    data: EmailTemplateData
  ): EmailTemplate {
    const { userFirstName = 'Investor', unsubscribeUrl, appUrl = 'https://incomeclarity.com' } = data;
    
    const categoryNames = {
      portfolioAlerts: 'Portfolio Alert',
      taxOptimization: 'Tax Optimization',
      systemUpdates: 'System Update',
      marketAlerts: 'Market Alert'
    };
    
    const categoryName = categoryNames[category as keyof typeof categoryNames] || 'Notification';
    
    const subject = `Income Clarity - ${categoryName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${categoryName}</title>
        ${this.BASE_STYLES}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Income Clarity</h1>
            <p>${categoryName}</p>
          </div>
          
          <div class="content">
            <p>Hi ${userFirstName},</p>
            <p>You have a new ${categoryName.toLowerCase()} from Income Clarity.</p>
            <a href="${appUrl}/dashboard" class="button">View Dashboard</a>
          </div>
          
          <div class="footer">
            <p><strong>Income Clarity</strong> - Your Path to Financial Independence</p>
            <p style="margin: 16px 0 0 0;">
              <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
${categoryName} - Income Clarity

Hi ${userFirstName},

You have a new ${categoryName.toLowerCase()} from Income Clarity.

View your dashboard: ${appUrl}/dashboard

---
Income Clarity - Your Path to Financial Independence
Unsubscribe: ${unsubscribeUrl}
    `;
    
    return { subject, htmlContent, textContent };
  }
}