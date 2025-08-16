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

// GET /api/portfolios/[id] - Get specific portfolio with holdings
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
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: id,
        userId,
      },
      include: {
        holdings: {
          orderBy: [
            { ticker: 'asc' },
          ],
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Calculate portfolio values
    const totalValue = portfolio.holdings.reduce((sum, holding) => {
      return sum + (holding.shares * (holding.currentPrice || holding.costBasis));
    }, 0);
    
    const totalCostBasis = portfolio.holdings.reduce((sum, holding) => {
      return sum + (holding.shares * holding.costBasis);
    }, 0);

    const gainLoss = totalValue - totalCostBasis;
    const gainLossPercent = totalCostBasis > 0 ? (gainLoss / totalCostBasis) * 100 : 0;

    const portfolioWithValues = {
      ...portfolio,
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalCostBasis: parseFloat(totalCostBasis.toFixed(2)),
      gainLoss: parseFloat(gainLoss.toFixed(2)),
      gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
    };

    return NextResponse.json({ portfolio: portfolioWithValues });
  } catch (error) {
    logger.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

// PUT /api/portfolios/[id] - Update portfolio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, institution, isPrimary } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Check if portfolio exists and belongs to user
    const { id } = await params;
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: id,
        userId,
      },
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // If this is being set as primary, unset other primary portfolios
    if (isPrimary && !existingPortfolio.isPrimary) {
      await prisma.portfolio.updateMany({
        where: {
          userId,
          isPrimary: true,
          id: {
            not: id,
          },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const portfolio = await prisma.portfolio.update({
      where: {
        id: id,
      },
      data: {
        name: name.trim(),
        type,
        institution: institution?.trim() || null,
        isPrimary: isPrimary || false,
      },
      include: {
        holdings: true,
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    logger.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolios/[id] - Delete portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if portfolio exists and belongs to user
    const { id } = await params;
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: id,
        userId,
      },
      include: {
        holdings: true,
      },
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Check if portfolio has holdings
    if (existingPortfolio.holdings.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete portfolio with holdings. Please remove all holdings first.',
          holdingsCount: existingPortfolio.holdings.length
        },
        { status: 400 }
      );
    }

    await prisma.portfolio.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    logger.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}