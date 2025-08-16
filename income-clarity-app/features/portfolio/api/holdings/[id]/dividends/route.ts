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
async function verifyHoldingOwnership(holdingId: string, userId: string): Promise<{ holding: any; isOwner: boolean }> {
  const holding = await prisma.holding.findFirst({
    where: {
      id: holdingId,
    },
    include: {
      portfolio: true,
    },
  });
  
  return {
    holding,
    isOwner: holding?.portfolio.userId === userId
  };
}

// POST /api/holdings/[id]/dividends - Record dividend payment
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
    const { holding, isOwner } = await verifyHoldingOwnership(id, userId);
    if (!isOwner || !holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      dividendPerShare,
      paymentDate,
      exDate,
      paymentType = 'REGULAR',
      totalShares,
      notes
    } = body;

    // Validate required fields
    if (!dividendPerShare || !paymentDate) {
      return NextResponse.json(
        { error: 'Dividend per share and payment date are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(parseFloat(dividendPerShare)) || parseFloat(dividendPerShare) <= 0) {
      return NextResponse.json(
        { error: 'Dividend per share must be a positive number' },
        { status: 400 }
      );
    }

    const shares = totalShares || holding.shares;
    if (isNaN(parseFloat(shares)) || parseFloat(shares) <= 0) {
      return NextResponse.json(
        { error: 'Total shares must be a positive number' },
        { status: 400 }
      );
    }

    // Validate payment date
    const parsedPaymentDate = new Date(paymentDate);
    if (isNaN(parsedPaymentDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid payment date' },
        { status: 400 }
      );
    }

    // Validate payment date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (parsedPaymentDate > today) {
      return NextResponse.json(
        { error: 'Payment date cannot be in the future' },
        { status: 400 }
      );
    }

    // Validate ex-dividend date if provided
    let parsedExDate = null;
    if (exDate) {
      parsedExDate = new Date(exDate);
      if (isNaN(parsedExDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid ex-dividend date' },
          { status: 400 }
        );
      }

      // Ex-date should be before or same as payment date
      if (parsedExDate > parsedPaymentDate) {
        return NextResponse.json(
          { error: 'Ex-dividend date must be before or same as payment date' },
          { status: 400 }
        );
      }
    }

    const dividendAmount = parseFloat(dividendPerShare);
    const sharesCount = parseFloat(shares);
    const totalDividendAmount = dividendAmount * sharesCount;

    // Calculate annual yield if current price is available
    let annualYield = null;
    if (holding.currentPrice && holding.dividendYield) {
      // Estimate annual dividend based on payment type
      let annualEstimate = dividendAmount;
      switch (paymentType) {
        case 'QUARTERLY':
          annualEstimate = dividendAmount * 4;
          break;
        case 'MONTHLY':
          annualEstimate = dividendAmount * 12;
          break;
        case 'SEMI_ANNUALLY':
          annualEstimate = dividendAmount * 2;
          break;
        case 'ANNUALLY':
          annualEstimate = dividendAmount;
          break;
        default:
          // For REGULAR, SPECIAL, etc., use quarterly as default assumption
          annualEstimate = dividendAmount * 4;
      }
      annualYield = (annualEstimate / holding.currentPrice) * 100;
    }

    // Use database transaction for data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          portfolioId: holding.portfolioId,
          ticker: holding.ticker,
          type: 'DIVIDEND',
          shares: sharesCount,
          amount: totalDividendAmount,
          date: parsedPaymentDate,
          notes: notes || `Dividend payment: $${dividendAmount.toFixed(4)} per share`,
          metadata: JSON.stringify({
            dividendPerShare: dividendAmount,
            sharesCount,
            paymentType,
            exDate: parsedExDate?.toISOString(),
            annualYield: annualYield?.toFixed(2)
          }),
        },
      });

      // Create income record
      const income = await tx.income.create({
        data: {
          userId,
          source: holding.ticker,
          category: 'DIVIDEND',
          amount: totalDividendAmount,
          date: parsedPaymentDate,
          recurring: paymentType !== 'SPECIAL',
          frequency: paymentType === 'QUARTERLY' ? 'QUARTERLY' : 
                    paymentType === 'MONTHLY' ? 'MONTHLY' : 
                    paymentType === 'ANNUALLY' ? 'ANNUALLY' :
                    paymentType === 'SEMI_ANNUALLY' ? 'QUARTERLY' : // Approximate
                    'QUARTERLY', // Default
          taxable: true,
          notes: notes || `${holding.ticker} dividend: ${sharesCount} shares @ $${dividendAmount.toFixed(4)}`,
          metadata: JSON.stringify({
            ticker: holding.ticker,
            dividendPerShare: dividendAmount,
            sharesCount,
            paymentType,
            exDate: parsedExDate?.toISOString(),
            holdingId: holding.id,
            annualYield: annualYield?.toFixed(2)
          }),
        },
      });

      return { transaction, income };
    });

    // Calculate response data for user feedback
    const dividendSummary = {
      transaction: result.transaction,
      income: result.income,
      dividendDetails: {
        ticker: holding.ticker,
        sharesCount,
        dividendPerShare: dividendAmount,
        totalDividend: totalDividendAmount,
        paymentDate: parsedPaymentDate,
        exDate: parsedExDate,
        paymentType,
        annualYield: annualYield ? parseFloat(annualYield.toFixed(2)) : null,
        notes,
      },
    };

    return NextResponse.json(dividendSummary, { status: 201 });
  } catch (error) {
    logger.error('Error recording dividend payment:', error);
    return NextResponse.json(
      { error: 'Failed to record dividend payment' },
      { status: 500 }
    );
  }
}