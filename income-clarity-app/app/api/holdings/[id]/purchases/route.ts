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
async function verifyHoldingOwnership(holdingId: string, userId: string): Promise<boolean> {
  const holding = await prisma.holding.findFirst({
    where: {
      id: holdingId,
    },
    include: {
      portfolio: true,
    },
  });
  
  return holding?.portfolio.userId === userId;
}

// POST /api/holdings/[id]/purchases - Add purchase to existing holding
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify holding ownership
    const { id } = await params;
    const isOwner = await verifyHoldingOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      shares, 
      pricePerShare, 
      purchaseDate
    } = body;

    // Validate required fields
    if (!shares || !pricePerShare || !purchaseDate) {
      return NextResponse.json(
        { error: 'Shares, price per share, and purchase date are required' },
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

    if (isNaN(parseFloat(pricePerShare)) || parseFloat(pricePerShare) <= 0) {
      return NextResponse.json(
        { error: 'Price per share must be a positive number' },
        { status: 400 }
      );
    }

    // Validate date
    const parsedDate = new Date(purchaseDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid purchase date' },
        { status: 400 }
      );
    }

    // Get current holding data
    const currentHolding = await prisma.holding.findUnique({
      where: { id: id },
    });

    if (!currentHolding) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      );
    }

    const newShares = parseFloat(shares);
    const newPricePerShare = parseFloat(pricePerShare);

    // Calculate new average cost basis and total shares
    const existingValue = currentHolding.shares * currentHolding.costBasis;
    const newValue = newShares * newPricePerShare;
    const totalShares = currentHolding.shares + newShares;
    const newAverageCostBasis = (existingValue + newValue) / totalShares;

    // Update the holding with new totals and most recent purchase date
    const updatedHolding = await prisma.holding.update({
      where: { id: id },
      data: {
        shares: totalShares,
        costBasis: parseFloat(newAverageCostBasis.toFixed(6)), // Keep precision for calculations
        purchaseDate: parsedDate > currentHolding.purchaseDate ? parsedDate : currentHolding.purchaseDate,
        updatedAt: new Date(),
      },
    });

    // Calculate values for response
    const currentValue = updatedHolding.shares * (updatedHolding.currentPrice || updatedHolding.costBasis);
    const costBasisTotal = updatedHolding.shares * updatedHolding.costBasis;
    const gainLoss = currentValue - costBasisTotal;
    const gainLossPercent = costBasisTotal > 0 ? (gainLoss / costBasisTotal) * 100 : 0;

    const holdingWithValues = {
      ...updatedHolding,
      currentValue: parseFloat(currentValue.toFixed(2)),
      costBasisTotal: parseFloat(costBasisTotal.toFixed(2)),
      gainLoss: parseFloat(gainLoss.toFixed(2)),
      gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
    };

    // Return purchase summary for user feedback
    const purchaseSummary = {
      holding: holdingWithValues,
      purchaseDetails: {
        sharesAdded: newShares,
        pricePerShare: newPricePerShare,
        totalCost: newShares * newPricePerShare,
        newAverageCost: parseFloat(newAverageCostBasis.toFixed(2)),
        newTotalShares: totalShares,
        purchaseDate: parsedDate,
      },
    };

    return NextResponse.json(purchaseSummary, { status: 200 });
  } catch (error) {
    logger.error('Error adding purchase to holding:', error);
    return NextResponse.json(
      { error: 'Failed to add purchase to holding' },
      { status: 500 }
    );
  }
}