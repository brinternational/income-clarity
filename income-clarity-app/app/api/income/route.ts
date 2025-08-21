import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailScheduler } from '@/lib/services/email/email-scheduler.service';
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

// GET /api/income - List user's income records
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    // Build filter conditions
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (category) {
      where.category = category;
    }

    const incomeRecords = await prisma.income.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate totals by category
    const totals = await prisma.income.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true,
      },
    });

    // Calculate grand total
    const grandTotal = totals.reduce((sum, item) => sum + (item._sum.amount || 0), 0);

    return NextResponse.json({
      income: incomeRecords,
      totals: totals.map(t => ({
        category: t.category,
        total: t._sum.amount || 0,
      })),
      grandTotal,
    });
  } catch (error) {
    logger.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income records' },
      { status: 500 }
    );
  }
}

// POST /api/income - Create new income record
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      amount, 
      category, 
      source, 
      date, 
      description,
      isRecurring,
      recurringFrequency,
      taxWithheld 
    } = body;

    // Validate required fields
    if (!amount || !category || !source || !date) {
      return NextResponse.json(
        { error: 'Amount, category, source, and date are required' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const income = await prisma.income.create({
      data: {
        userId,
        amount: parseFloat(amount),
        category,
        source: source.trim(),
        date: new Date(date),
        notes: description?.trim() || null,
        recurring: isRecurring || false,
        frequency: recurringFrequency || null,
        taxable: taxWithheld ? taxWithheld > 0 : true,
        metadata: taxWithheld ? JSON.stringify({ taxWithheld: parseFloat(taxWithheld) }) : null,
      },
    });

    // Send email notification for dividend payments
    if (category === 'dividends' && parseFloat(amount) > 0) {
      try {
        // Get user's total dividend data for context
        const userDividends = await prisma.income.findMany({
          where: {
            userId,
            category: 'dividends',
          },
          orderBy: {
            date: 'desc',
          },
        });

        const monthlyTotal = userDividends
          .filter(d => {
            const divDate = new Date(d.date);
            const currentMonth = new Date();
            return divDate.getMonth() === currentMonth.getMonth() && 
                   divDate.getFullYear() === currentMonth.getFullYear();
          })
          .reduce((sum, d) => sum + d.amount, 0);

        const ytdTotal = userDividends
          .filter(d => {
            const divDate = new Date(d.date);
            const currentYear = new Date().getFullYear();
            return divDate.getFullYear() === currentYear;
          })
          .reduce((sum, d) => sum + d.amount, 0);

        // Extract ticker from source (e.g., "AAPL Dividend" -> "AAPL")
        const ticker = source.split(' ')[0].toUpperCase();

        // Send dividend notification
        await emailScheduler.sendDividendNotification(userId, {
          ticker,
          amount: parseFloat(amount),
          paymentDate: new Date(date).toLocaleDateString(),
          shares: 1, // Would need to calculate from holdings
          ratePerShare: parseFloat(amount), // Simplified
          monthlyTotal,
          ytdTotal,
          yieldOnCost: 3.5, // Would calculate from portfolio data
          portfolioImpact: 0.1 // Would calculate based on total portfolio
        });

        logger.log(`[INCOME API] Dividend notification sent for ${ticker}: $${amount}`);
      } catch (emailError) {
        logger.error('[INCOME API] Failed to send dividend notification:', emailError);
        // Don't fail the API call if email fails
      }
    }

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    logger.error('Error creating income:', error);
    return NextResponse.json(
      { error: 'Failed to create income record' },
      { status: 500 }
    );
  }
}