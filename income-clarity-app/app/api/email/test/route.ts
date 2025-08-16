import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/services/email.service';
import { EmailTemplateData } from '@/lib/services/email-templates.service';
import { logger } from '@/lib/logger'

/**
 * Test email functionality
 * POST /api/email/test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type = 'connection', userId = 'test-user' } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (type) {
      case 'connection':
        result = await emailService.sendTestEmail(email);
        break;
        
      case 'dividend':
        const dividendData: EmailTemplateData = {
          dividend: {
            ticker: 'AAPL',
            amount: 125.50,
            paymentDate: new Date().toLocaleDateString(),
            shares: 100,
            ratePerShare: 1.255,
            monthlyTotal: 457.25,
            ytdTotal: 3245.75,
            yieldOnCost: 3.8,
            portfolioImpact: 0.25
          }
        };
        result = await emailService.sendDividendNotification(userId, dividendData.dividend!);
        break;
        
      case 'milestone':
        const milestoneData: EmailTemplateData = {
          milestone: {
            name: 'Utilities Coverage',
            targetAmount: 50000,
            currentAmount: 50250,
            progressPercent: 100.5,
            nextMilestone: 'Food Coverage',
            timeToNext: '8 months',
            category: 'utilities'
          }
        };
        result = await emailService.sendMilestoneNotification(userId, milestoneData.milestone!);
        break;
        
      case 'weekly':
        const weeklyData: EmailTemplateData = {
          weeklySummary: {
            weekStart: 'Aug 7, 2024',
            weekEnd: 'Aug 14, 2024',
            totalReturn: 2.35,
            dividendIncome: 145.75,
            portfolioValue: 125750,
            vsSpyReturn: 0.85,
            topPerformer: 'MSFT',
            topPerformerReturn: 5.2,
            dividendPayments: [
              { ticker: 'AAPL', amount: 75.25, date: 'Aug 12' },
              { ticker: 'MSFT', amount: 70.50, date: 'Aug 14' }
            ],
            rebalancingSuggestions: [
              {
                action: 'Consider buying',
                ticker: 'VTI',
                reason: 'Portfolio underweight in broad market ETFs'
              }
            ],
            marketInsights: [
              'Technology sector showing strong momentum this week',
              'Dividend stocks outperforming growth stocks recently'
            ]
          }
        };
        result = await emailService.sendWeeklySummary(userId, weeklyData.weeklySummary!);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type. Use: connection, dividend, milestone, weekly' },
          { status: 400 }
        );
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully (${type})`,
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Failed to send test email: ${result.error}`
      }, { status: 500 });
    }
    
  } catch (error) {
    logger.error('Email test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

/**
 * Get email service status
 * GET /api/email/test
 */
export async function GET() {
  try {
    const status = emailService.getStatus();
    return NextResponse.json({
      success: true,
      status,
      message: status.configured 
        ? 'Email service is properly configured' 
        : 'Email service is not configured - will use mock mode'
    });
  } catch (error) {
    logger.error('Email status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get email service status' },
      { status: 500 }
    );
  }
}