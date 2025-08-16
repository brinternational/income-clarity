import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EMAIL_CATEGORY_DESCRIPTIONS } from '@/types/email-preferences';
import { logger } from '@/lib/logger'

// Initialize Prisma client
const prisma = new PrismaClient();

// Mock session management
const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
  return 'test-user-id';
};

// POST - Send test email
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { category } = body;

    if (!category || !EMAIL_CATEGORY_DESCRIPTIONS[category]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid category specified'
      }, { status: 400 });
    }

    // Fetch email preferences to get user's email
    const emailPrefs = await prisma.emailPreferences.findUnique({
      where: { userId }
    });

    if (!emailPrefs || !emailPrefs.email) {
      return NextResponse.json({
        success: false,
        error: 'No email address configured'
      }, { status: 400 });
    }

    if (!emailPrefs.emailVerified) {
      return NextResponse.json({
        success: false,
        error: 'Email address not verified'
      }, { status: 400 });
    }

    // Generate test email content based on category
    const categoryInfo = EMAIL_CATEGORY_DESCRIPTIONS[category];
    const testEmailContent = generateTestEmail(category, categoryInfo);

    // TODO: In production, send actual email
    // For now, just log and return success
    logger.log(`[MOCK] Test email would be sent to: ${emailPrefs.email}`);
    logger.log(`[MOCK] Category: ${category}`);
    logger.log(`[MOCK] Subject: ${testEmailContent.subject}`);
    logger.log(`[MOCK] Content: ${testEmailContent.content}`);

    // Update last email sent timestamp
    await prisma.emailPreferences.update({
      where: { userId },
      data: {
        lastEmailSent: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Test ${categoryInfo.title.toLowerCase()} email sent successfully`,
      emailSent: true,
      // Include content in development for testing
      ...(process.env.NODE_ENV === 'development' && { 
        testContent: testEmailContent 
      })
    });

  } catch (error) {
    logger.error('Error sending test email:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email'
    }, { status: 500 });
  }
}

// Generate test email content based on category
function generateTestEmail(category: string, categoryInfo: { title: string; description: string }) {
  const baseContent = {
    portfolioAlerts: {
      subject: '🚨 Portfolio Alert: JEPI Up 3.2% Today',
      content: 'Your holding JEPI has increased 3.2% today, outperforming SPY by 1.8%. Your portfolio is now up $1,247 for the day.'
    },
    dividendNotifications: {
      subject: '💰 Dividend Payment Received: $127.45',
      content: 'You received a dividend payment of $127.45 from your JEPI holdings. This brings your monthly dividend income to $1,892.'
    },
    taxOptimization: {
      subject: '📊 Tax Optimization Opportunity: Save $340',
      content: 'Our analysis found a potential tax-loss harvesting opportunity that could save you $340 in taxes this year.'
    },
    milestoneAchievements: {
      subject: '🎉 Milestone Achievement: Utilities Covered!',
      content: 'Congratulations! Your dividend income now covers your monthly utilities expense of $245. You\'re making great progress toward financial independence.'
    },
    systemUpdates: {
      subject: '🔄 Income Clarity: New Features Available',
      content: 'We\'ve added new tax optimization features and improved portfolio analytics. Check out what\'s new in your dashboard.'
    },
    monthlyReports: {
      subject: '📈 Your Monthly Portfolio Report - November 2024',
      content: 'Your portfolio gained 2.3% this month, generating $1,847 in dividends. View your complete monthly performance report.'
    },
    weeklyDigests: {
      subject: '📊 Weekly Portfolio Digest - Nov 18-24',
      content: 'This week your portfolio returned 1.1%, receiving $127 in dividends. Here\'s your weekly summary and market insights.'
    },
    marketAlerts: {
      subject: '⚡ Market Alert: Fed Rate Decision Impact',
      content: 'The Fed\'s rate decision may impact dividend stocks. Here\'s how it affects your portfolio and what to consider.'
    }
  };

  return baseContent[category as keyof typeof baseContent] || {
    subject: `Test ${categoryInfo.title}`,
    content: `This is a test email for ${categoryInfo.title}: ${categoryInfo.description}`
  };
}