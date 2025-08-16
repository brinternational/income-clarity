import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

// Verify holding ownership through portfolio
async function verifyHoldingOwnership(holdingId: string, userId: string): Promise<any> {
  const holding = await prisma.holding.findUnique({
    where: {
      id: holdingId,
    },
    include: {
      portfolio: true,
    },
  });
  
  if (!holding || holding.portfolio.userId !== userId) {
    return null;
  }
  
  return holding;
}

// GET /api/holdings/[id] - Get specific holding
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const holding = await verifyHoldingOwnership(id, userId);
    
    if (!holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    // Calculate values
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

    return NextResponse.json({ holding: holdingWithValues });
  } catch (error) {
    logger.error('Error fetching holding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holding' },
      { status: 500 }
    );
  }
}

// PUT /api/holdings/[id] - Update holding
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingHolding = await verifyHoldingOwnership(id, userId);
    
    if (!existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
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

    // Check if ticker change would create a duplicate in the same portfolio
    const newTicker = ticker.toUpperCase();
    if (newTicker !== existingHolding.ticker) {
      const duplicateHolding = await prisma.holding.findFirst({
        where: {
          portfolioId: existingHolding.portfolioId,
          ticker: newTicker,
          id: {
            not: id,
          },
        },
      });

      if (duplicateHolding) {
        return NextResponse.json(
          { error: `Holding for ${newTicker} already exists in this portfolio` },
          { status: 400 }
        );
      }
    }

    const holding = await prisma.holding.update({
      where: {
        id: id,
      },
      data: {
        ticker: newTicker,
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

    return NextResponse.json({ holding: holdingWithValues });
  } catch (error) {
    logger.error('Error updating holding:', error);
    return NextResponse.json(
      { error: 'Failed to update holding' },
      { status: 500 }
    );
  }
}

// DELETE /api/holdings/[id] - Delete holding
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existingHolding = await verifyHoldingOwnership(id, userId);
    
    if (!existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    await prisma.holding.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    logger.error('Error deleting holding:', error);
    return NextResponse.json(
      { error: 'Failed to delete holding' },
      { status: 500 }
    );
  }
}