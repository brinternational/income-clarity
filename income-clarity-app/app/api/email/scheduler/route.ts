import { NextRequest, NextResponse } from 'next/server';
import { emailScheduler } from '@/lib/services/email/email-scheduler.service';
import { logger } from '@/lib/logger'

/**
 * Get scheduler status
 * GET /api/email/scheduler
 */
export async function GET() {
  try {
    const status = emailScheduler.getStatus();
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Scheduler status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get scheduler status' },
      { status: 500 }
    );
  }
}

/**
 * Control scheduler (start/stop/trigger)
 * POST /api/email/scheduler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'start':
        emailScheduler.startWeeklyScheduler();
        return NextResponse.json({
          success: true,
          message: 'Email scheduler started'
        });
        
      case 'stop':
        emailScheduler.stopWeeklyScheduler();
        return NextResponse.json({
          success: true,
          message: 'Email scheduler stopped'
        });
        
      case 'trigger_weekly':
        await emailScheduler.scheduleWeeklySummaries();
        return NextResponse.json({
          success: true,
          message: 'Weekly summaries triggered'
        });
        
      case 'send_test_dividend':
        const { userId = 'test-user' } = body;
        await emailScheduler.sendDividendNotification(userId, {
          ticker: 'AAPL',
          amount: 125.50,
          paymentDate: new Date().toLocaleDateString(),
          shares: 100,
          ratePerShare: 1.255,
          monthlyTotal: 457.25,
          ytdTotal: 3245.75,
          yieldOnCost: 3.8,
          portfolioImpact: 0.25
        });
        return NextResponse.json({
          success: true,
          message: 'Test dividend notification sent'
        });
        
      case 'send_test_milestone':
        const { userId: milestoneUserId = 'test-user' } = body;
        await emailScheduler.sendMilestoneNotification(milestoneUserId, {
          name: 'Utilities Coverage',
          targetAmount: 50000,
          currentAmount: 50250,
          progressPercent: 100.5,
          nextMilestone: 'Food Coverage',
          timeToNext: '8 months',
          category: 'utilities'
        });
        return NextResponse.json({
          success: true,
          message: 'Test milestone notification sent'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: start, stop, trigger_weekly, send_test_dividend, send_test_milestone' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    logger.error('Scheduler control error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to control scheduler' },
      { status: 500 }
    );
  }
}