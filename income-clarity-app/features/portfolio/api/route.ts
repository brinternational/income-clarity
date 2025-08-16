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

// GET /api/portfolios - List user's portfolios
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId,
      },
      include: {
        holdings: {
          select: {
            id: true,
            ticker: true,
            shares: true,
            costBasis: true,
            currentPrice: true,
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate portfolio values
    const portfoliosWithValues = portfolios.map(portfolio => {
      const totalValue = portfolio.holdings.reduce((sum, holding) => {
        return sum + (holding.shares * (holding.currentPrice || holding.costBasis));
      }, 0);
      
      const totalCostBasis = portfolio.holdings.reduce((sum, holding) => {
        return sum + (holding.shares * holding.costBasis);
      }, 0);

      const gainLoss = totalValue - totalCostBasis;
      const gainLossPercent = totalCostBasis > 0 ? (gainLoss / totalCostBasis) * 100 : 0;

      return {
        ...portfolio,
        holdingsCount: portfolio.holdings.length,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalCostBasis: parseFloat(totalCostBasis.toFixed(2)),
        gainLoss: parseFloat(gainLoss.toFixed(2)),
        gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
      };
    });

    return NextResponse.json({ portfolios: portfoliosWithValues });
  } catch (error) {
    logger.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

// POST /api/portfolios - Create new portfolio
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, institution, isPrimary, description } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // If this is being set as primary, unset other primary portfolios
    if (isPrimary) {
      await prisma.portfolio.updateMany({
        where: {
          userId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // CREATE new portfolio in database
    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: name.trim(),
        type,
        institution: institution?.trim() || null,
        isPrimary: isPrimary || false,
      },
      include: {
        holdings: true,
      },
    });

    return NextResponse.json({ portfolio }, { status: 201 });
  } catch (error) {
    logger.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}