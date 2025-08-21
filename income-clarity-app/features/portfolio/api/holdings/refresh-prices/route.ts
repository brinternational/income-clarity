// API endpoint for manual holdings price refresh
import { NextRequest, NextResponse } from 'next/server';
import { holdingsPriceUpdaterService } from '@/lib/services/holdings-updater/holdings-price-updater.service';
import { stockPriceService } from '@/lib/services/stock/stock-price.service';
import { logger } from '@/lib/logger'

// Helper function to get user ID from session
async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  const sessionToken = request.cookies.get('session-token')?.value;
  
  if (!sessionToken) {
    return null;
  }

  // Import prisma here to avoid circular dependency
  const { prisma } = await import('@/lib/db');
  
  const session = await prisma.session.findUnique({
    where: {
      sessionToken,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  return session?.user.id || null;
}

// POST /api/holdings/refresh-prices - Manual price refresh
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { portfolioId, holdingId, forceUpdate = false } = body;

    // Validate API key availability
    const healthStatus = stockPriceService.getHealthStatus();
    if (!healthStatus.apiConfigured) {
      return NextResponse.json({
        error: 'Polygon API key not configured',
        dataSource: 'simulated',
        healthStatus
      }, { status: 503 });
    }

    // Test API connection if requested
    if (body.testConnection) {
      const connectionTest = await stockPriceService.testApiConnection();
      return NextResponse.json({
        success: connectionTest.success,
        message: connectionTest.message,
        latency: connectionTest.latency,
        healthStatus
      });
    }

    // Handle specific holding refresh
    if (holdingId) {
      const result = await holdingsPriceUpdaterService.refreshHoldingPrice(holdingId);
      
      return NextResponse.json({
        success: result.success,
        holding: result.holding,
        error: result.error,
        dataSource: healthStatus.dataSource,
        timestamp: new Date().toISOString()
      });
    }

    // Handle portfolio-specific refresh
    if (portfolioId) {
      const { prisma } = await import('@/lib/db');
      
      // Verify portfolio ownership
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          id: portfolioId,
          userId,
        },
      });
      
      if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
      }

      const result = await holdingsPriceUpdaterService.updatePortfolioHoldingsPrices(portfolioId);
      
      return NextResponse.json({
        success: result.success,
        updated: result.updated,
        errors: result.errors,
        totalHoldings: result.totalHoldings,
        skipped: result.skipped,
        executionTime: result.executionTime,
        dataSource: result.dataSource,
        timestamp: new Date().toISOString()
      });
    }

    // Handle global refresh (all user's holdings)
    try {
      const updateStatus = holdingsPriceUpdaterService.getUpdateStatus();
      
      // Check if update is already in progress
      if (updateStatus.isUpdating && !forceUpdate) {
        return NextResponse.json({
          error: 'Price update already in progress',
          status: updateStatus,
          message: 'Use forceUpdate: true to override'
        }, { status: 429 });
      }

      const result = await holdingsPriceUpdaterService.updateAllHoldingsPrices(forceUpdate);
      
      return NextResponse.json({
        success: result.success,
        updated: result.updated,
        errors: result.errors,
        totalHoldings: result.totalHoldings,
        skipped: result.skipped,
        executionTime: result.executionTime,
        dataSource: result.dataSource,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Price refresh error:', error);
      
      if (error instanceof Error && error.message.includes('wait')) {
        return NextResponse.json({
          error: error.message,
          status: holdingsPriceUpdaterService.getUpdateStatus()
        }, { status: 429 });
      }

      return NextResponse.json({
        error: 'Failed to refresh prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    logger.error('Holdings refresh API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// GET /api/holdings/refresh-prices - Get update status and health
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const healthStatus = stockPriceService.getHealthStatus();
    const updateStatus = holdingsPriceUpdaterService.getUpdateStatus();

    return NextResponse.json({
      health: healthStatus,
      updateStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Holdings refresh status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}