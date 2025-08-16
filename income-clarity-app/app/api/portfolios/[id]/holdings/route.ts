import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { holdingsPriceUpdaterService } from '@/lib/services/holdings-price-updater.service';
import { stockPriceService } from '@/lib/services/stock-price.service';
import { milestoneTracker } from '@/lib/services/milestone-tracker.service';
import { logger } from '@/lib/logger'

// Helper function to get user ID from session
async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  const sessionToken = request.cookies.get('session-token')?.value;
  
  if (!sessionToken) {
    return null;
  }

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

// Verify portfolio ownership
async function verifyPortfolioOwnership(portfolioId: string, userId: string): Promise<boolean> {
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId,
    },
  });
  
  return !!portfolio;
}

// GET /api/portfolios/[id]/holdings - List holdings for a portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify portfolio ownership
    const { id } = await params;
    const isOwner = await verifyPortfolioOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holdings = await prisma.holding.findMany({
      where: {
        portfolioId: id,
      },
      orderBy: [
        { ticker: 'asc' },
      ],
    });

    // Check if we should refresh prices (if any are older than 30 minutes)
    const shouldRefreshPrices = holdings.some(holding => {
      if (!holding.currentPrice || !holding.updatedAt) return true;
      const ageInMinutes = (Date.now() - holding.updatedAt.getTime()) / (1000 * 60);
      return ageInMinutes > 30;
    });

    // Auto-refresh prices if needed and Polygon API is available
    if (shouldRefreshPrices && stockPriceService.getHealthStatus().apiConfigured) {
      try {
        logger.log(`🔄 Auto-refreshing prices for portfolio ${id}`);
        await holdingsPriceUpdaterService.updatePortfolioHoldingsPrices(id);
        
        // Re-fetch holdings with updated prices
        const updatedHoldings = await prisma.holding.findMany({
          where: {
            portfolioId: id,
          },
          orderBy: [
            { ticker: 'asc' },
          ],
        });
        
        const holdingsWithValues = updatedHoldings.map(holding => {
          const currentPrice = holding.currentPrice || holding.costBasis;
          const currentValue = holding.shares * currentPrice;
          const costBasisTotal = holding.shares * holding.costBasis;
          const gainLoss = currentValue - costBasisTotal;
          const gainLossPercent = costBasisTotal > 0 ? (gainLoss / costBasisTotal) * 100 : 0;

          return {
            ...holding,
            currentValue: parseFloat(currentValue.toFixed(2)),
            costBasisTotal: parseFloat(costBasisTotal.toFixed(2)),
            gainLoss: parseFloat(gainLoss.toFixed(2)),
            gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
            isPriceReal: !!holding.currentPrice,
            priceAge: holding.updatedAt ? Math.floor((Date.now() - holding.updatedAt.getTime()) / (1000 * 60)) : null,
            dataSource: stockPriceService.getHealthStatus().dataSource
          };
        });

        return NextResponse.json({ 
          holdings: holdingsWithValues,
          priceRefreshPerformed: true,
          dataSource: stockPriceService.getHealthStatus().dataSource
        });
      } catch (refreshError) {
        logger.warn('Failed to refresh prices, using cached data:', refreshError);
        // Continue with existing data
      }
    }

    // Calculate holding values with existing prices
    const holdingsWithValues = holdings.map(holding => {
      const currentPrice = holding.currentPrice || holding.costBasis;
      const currentValue = holding.shares * currentPrice;
      const costBasisTotal = holding.shares * holding.costBasis;
      const gainLoss = currentValue - costBasisTotal;
      const gainLossPercent = costBasisTotal > 0 ? (gainLoss / costBasisTotal) * 100 : 0;

      return {
        ...holding,
        currentValue: parseFloat(currentValue.toFixed(2)),
        costBasisTotal: parseFloat(costBasisTotal.toFixed(2)),
        gainLoss: parseFloat(gainLoss.toFixed(2)),
        gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
        isPriceReal: !!holding.currentPrice,
        priceAge: holding.updatedAt ? Math.floor((Date.now() - holding.updatedAt.getTime()) / (1000 * 60)) : null,
        dataSource: holding.currentPrice ? stockPriceService.getHealthStatus().dataSource : 'cost-basis-fallback'
      };
    });

    return NextResponse.json({ 
      holdings: holdingsWithValues,
      priceRefreshPerformed: false,
      dataSource: stockPriceService.getHealthStatus().dataSource
    });
  } catch (error) {
    logger.error('Error fetching holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}

// POST /api/portfolios/[id]/holdings - Add new holding to portfolio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify portfolio ownership
    const { id } = await params;
    const isOwner = await verifyPortfolioOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      ticker, 
      shares, 
      costBasis, 
      purchaseDate, 
      currentPrice, 
      dividendYield, 
      sector 
    } = body;

    // Validate required fields
    if (!ticker || !shares || !costBasis || !purchaseDate) {
      return NextResponse.json(
        { error: 'Ticker, shares, cost basis, and purchase date are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(parseFloat(shares)) || parseFloat(shares) <= 0) {
      return NextResponse.json(
        { error: 'Shares must be a positive number' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(costBasis)) || parseFloat(costBasis) <= 0) {
      return NextResponse.json(
        { error: 'Cost basis must be a positive number' },
        { status: 400 }
      );
    }

    // Check if holding already exists for this ticker in this portfolio
    const existingHolding = await prisma.holding.findFirst({
      where: {
        portfolioId: id,
        ticker: ticker.toUpperCase(),
      },
    });

    if (existingHolding) {
      return NextResponse.json(
        { error: `Holding for ${ticker.toUpperCase()} already exists in this portfolio` },
        { status: 400 }
      );
    }

    const holding = await prisma.holding.create({
      data: {
        portfolioId: id,
        ticker: ticker.toUpperCase(),
        shares: parseFloat(shares),
        costBasis: parseFloat(costBasis),
        purchaseDate: new Date(purchaseDate),
        currentPrice: currentPrice ? parseFloat(currentPrice) : null,
        dividendYield: dividendYield ? parseFloat(dividendYield) : null,
        sector: sector?.trim() || null,
      },
    });

    // Calculate values for response
    const currentValue = holding.shares * (holding.currentPrice || holding.costBasis);
    const costBasisTotal = holding.shares * holding.costBasis;
    const gainLoss = currentValue - costBasisTotal;
    const gainLossPercent = costBasisTotal > 0 ? (gainLoss / costBasisTotal) * 100 : 0;

    const holdingWithValues = {
      ...holding,
      currentValue: parseFloat(currentValue.toFixed(2)),
      costBasisTotal: parseFloat(costBasisTotal.toFixed(2)),
      gainLoss: parseFloat(gainLoss.toFixed(2)),
      gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
    };

    // Check for milestone achievements after adding new holding
    try {
      // Calculate previous total portfolio value (without this holding)
      const allPortfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: { holdings: true }
      });
      
      let previousTotal = 0;
      let newTotal = 0;
      
      for (const portfolio of allPortfolios) {
        for (const portfolioHolding of portfolio.holdings) {
          const holdingValue = portfolioHolding.shares * (portfolioHolding.currentPrice || portfolioHolding.costBasis);
          newTotal += holdingValue;
          
          // Don't count the newly created holding for previous total
          if (portfolioHolding.id !== holding.id) {
            previousTotal += holdingValue;
          }
        }
      }
      
      await milestoneTracker.checkMilestones(userId, previousTotal, newTotal);
      logger.log(`[HOLDINGS API] Milestone check completed for user ${userId}: ${previousTotal} -> ${newTotal}`);
      
    } catch (milestoneError) {
      logger.error('[HOLDINGS API] Failed to check milestones:', milestoneError);
      // Don't fail the API call if milestone check fails
    }

    return NextResponse.json({ holding: holdingWithValues }, { status: 201 });
  } catch (error) {
    logger.error('Error creating holding:', error);
    return NextResponse.json(
      { error: 'Failed to create holding' },
      { status: 500 }
    );
  }
}