/**
 * Demo Reset API Endpoint
 * DEMO-008: Reset Button API
 * 
 * Clears existing data and re-seeds with demo portfolio
 * Only available in development mode for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  // Security: Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { 
        error: 'Reset API only available in development mode',
        success: false,
        message: 'This endpoint is disabled in production for security.'
      }, 
      { status: 403 }
    );
  }

  try {
    logger.log('🔄 Demo reset API called - starting database reset...');
    
    // Import the enhanced seed function
    // Use the new comprehensive demo seeding script
    const { main: seedMain } = await import('../../../../scripts/seed-demo-data.js');
    
    logger.log('🌱 Starting seed process...');
    
    // Run the seed script
    await seedMain();
    
    logger.log('✅ Demo reset completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Demo data reset successfully',
      timestamp: new Date().toISOString(),
      data: {
        user: 'test@example.com',
        password: 'password123',
        portfolioType: 'Dividend Growth Portfolio',
        stockCount: 9,
        portfolioValue: '~$124,000',
        annualDividends: '~$4,200',
        fireProgress: '67% dividend coverage',
        features: [
          '9 popular dividend stocks (AAPL, MSFT, JNJ, KO, VZ, T, PFE, XOM, O)',
          '2-year purchase history with dollar-cost averaging strategy',
          '12+ months of comprehensive dividend payment history',
          'Realistic mix of profitable and losing positions',
          'Diversified across 6 sectors (Technology, Healthcare, Consumer, Telecom, Energy, Real Estate)',
          'FIRE progress tracking with 67% expense coverage',
          'Complete transaction history (BUY, SELL, DIVIDEND, DRIP, tax loss harvesting)',
          'Monthly REIT dividends vs quarterly stock dividends',
          '44 future dividend schedules for planning',
          'Stock price data with benchmark comparisons (SPY, QQQ, VTI)',
          'Comprehensive income and expense tracking',
          'All 5 Super Cards populated with meaningful data'
        ]
      }
    });

  } catch (error: any) {
    logger.error('❌ Demo reset failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Demo reset failed',
        message: error.message || 'An unexpected error occurred during database reset',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          cause: error.cause
        } : undefined
      },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Reset API only available in development mode' }, 
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Demo Reset API',
    description: 'POST to this endpoint to reset demo data',
    environment: process.env.NODE_ENV,
    available: process.env.NODE_ENV === 'development',
    requirements: [
      'DEMO-008: Reset button functionality',
      'Development environment only',
      'Clears all data and re-seeds with realistic demo portfolio',
      'Returns success/error status with detailed information'
    ]
  });
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to reset demo data.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to reset demo data.' },
    { status: 405 }
  );
}