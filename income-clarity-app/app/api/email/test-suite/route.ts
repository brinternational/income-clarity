import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/services/email.service';
import { emailScheduler } from '@/lib/services/email-scheduler.service';
import { milestoneTracker } from '@/lib/services/milestone-tracker.service';
import { logger } from '@/lib/logger'

/**
 * Comprehensive email system test suite
 * POST /api/email/test-suite
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, runAll = false } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    const results = {
      testStart: new Date().toISOString(),
      email,
      tests: {} as Record<string, any>,
      summary: {} as any
    };
    
    logger.log(`[EMAIL TEST SUITE] Starting comprehensive test for ${email}`);
    
    // Test 1: Email Service Status
    logger.log('[EMAIL TEST SUITE] Test 1: Email Service Status');
    try {
      results.tests.serviceStatus = emailService.getStatus();
      logger.log('✓ Email service status retrieved');
    } catch (error) {
      results.tests.serviceStatus = { error: error instanceof Error ? error.message : 'Unknown error' };
      logger.log('✗ Email service status failed');
    }
    
    // Test 2: Basic Connection Test
    logger.log('[EMAIL TEST SUITE] Test 2: Basic Connection Test');
    try {
      const connectionResult = await emailService.sendTestEmail(email);
      results.tests.connectionTest = connectionResult;
      logger.log(`✓ Connection test ${connectionResult.success ? 'passed' : 'failed'}`);
    } catch (error) {
      results.tests.connectionTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      logger.log('✗ Connection test failed with exception');
    }
    
    if (runAll) {
      // Test 3: Dividend Notification
      logger.log('[EMAIL TEST SUITE] Test 3: Dividend Notification');
      try {
        const dividendResult = await emailScheduler.sendDividendNotification('test-user', {
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
        results.tests.dividendNotification = { success: true, jobId: dividendResult };
        logger.log('✓ Dividend notification sent');
      } catch (error) {
        results.tests.dividendNotification = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        logger.log('✗ Dividend notification failed');
      }
      
      // Test 4: Milestone Achievement
      logger.log('[EMAIL TEST SUITE] Test 4: Milestone Achievement');
      try {
        const milestoneResult = await emailScheduler.sendMilestoneNotification('test-user', {
          name: 'Utilities Coverage',
          targetAmount: 50000,
          currentAmount: 50250,
          progressPercent: 100.5,
          nextMilestone: 'Food Coverage',
          timeToNext: '8 months',
          category: 'utilities'
        });
        results.tests.milestoneAchievement = { success: true, jobId: milestoneResult };
        logger.log('✓ Milestone achievement notification sent');
      } catch (error) {
        results.tests.milestoneAchievement = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        logger.log('✗ Milestone achievement notification failed');
      }
      
      // Test 5: Weekly Summary
      logger.log('[EMAIL TEST SUITE] Test 5: Weekly Summary');
      try {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        
        const summaryResult = await emailService.sendWeeklySummary('test-user', {
          weekStart: weekStart.toLocaleDateString(),
          weekEnd: new Date().toLocaleDateString(),
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
        });
        results.tests.weeklySummary = summaryResult;
        logger.log(`✓ Weekly summary ${summaryResult.success ? 'sent' : 'failed'}`);
      } catch (error) {
        results.tests.weeklySummary = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        logger.log('✗ Weekly summary failed');
      }
      
      // Test 6: Email Scheduler Status
      logger.log('[EMAIL TEST SUITE] Test 6: Email Scheduler Status');
      try {
        results.tests.schedulerStatus = emailScheduler.getStatus();
        logger.log('✓ Email scheduler status retrieved');
      } catch (error) {
        results.tests.schedulerStatus = { error: error instanceof Error ? error.message : 'Unknown error' };
        logger.log('✗ Email scheduler status failed');
      }
      
      // Test 7: Milestone Progress
      logger.log('[EMAIL TEST SUITE] Test 7: Milestone Progress');
      try {
        const milestoneProgress = await milestoneTracker.getMilestoneProgress('test-user');
        results.tests.milestoneProgress = { success: true, count: milestoneProgress.length };
        logger.log(`✓ Milestone progress retrieved (${milestoneProgress.length} milestones)`);
      } catch (error) {
        results.tests.milestoneProgress = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        logger.log('✗ Milestone progress failed');
      }
      
      // Test 8: Email Validation
      logger.log('[EMAIL TEST SUITE] Test 8: Email Validation');
      const validationTests = [
        { email: 'valid@example.com', expected: true },
        { email: 'invalid-email', expected: false },
        { email: 'test@domain.co.uk', expected: true },
        { email: 'bad@', expected: false },
        { email: '', expected: false }
      ];
      
      results.tests.emailValidation = validationTests.map(test => ({
        email: test.email,
        expected: test.expected,
        actual: emailService.isValidEmail(test.email),
        passed: emailService.isValidEmail(test.email) === test.expected
      }));
      
      const validationPassed = results.tests.emailValidation.every((test: any) => test.passed);
      logger.log(`${validationPassed ? '✓' : '✗'} Email validation tests ${validationPassed ? 'passed' : 'failed'}`);
    }
    
    // Calculate summary
    const testKeys = Object.keys(results.tests);
    let passedTests = 0;
    let totalTests = testKeys.length;
    
    for (const testKey of testKeys) {
      const test = results.tests[testKey];
      if (testKey === 'emailValidation') {
        if (test.every((t: any) => t.passed)) passedTests++;
      } else if (test.success !== false && !test.error) {
        passedTests++;
      }
    }
    
    results.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
      testEnd: new Date().toISOString()
    };
    
    logger.log(`[EMAIL TEST SUITE] Test suite completed: ${passedTests}/${totalTests} tests passed (${results.summary.successRate})`);
    
    return NextResponse.json({
      success: true,
      message: `Email test suite completed: ${passedTests}/${totalTests} tests passed`,
      results
    });
    
  } catch (error) {
    logger.error('[EMAIL TEST SUITE] Test suite failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test suite failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get test suite status and available tests
 * GET /api/email/test-suite
 */
export async function GET() {
  try {
    const serviceStatus = emailService.getStatus();
    const schedulerStatus = emailScheduler.getStatus();
    
    return NextResponse.json({
      success: true,
      status: {
        emailService: serviceStatus,
        emailScheduler: schedulerStatus,
        availableTests: [
          'serviceStatus',
          'connectionTest',
          'dividendNotification',
          'milestoneAchievement',
          'weeklySummary',
          'schedulerStatus',
          'milestoneProgress',
          'emailValidation'
        ]
      }
    });
  } catch (error) {
    logger.error('Test suite status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get test suite status' },
      { status: 500 }
    );
  }
}