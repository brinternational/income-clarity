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

// GET /api/expenses - List user's expense records
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

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate totals by category
    const totals = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true,
      },
    });

    // Calculate grand total
    const grandTotal = totals.reduce((sum, item) => sum + (item._sum.amount || 0), 0);

    // Get monthly average
    const monthlyAverage = grandTotal; // Simplified for now

    return NextResponse.json({
      expenses,
      totals: totals.map(t => ({
        category: t.category,
        total: t._sum.amount || 0,
      })),
      grandTotal,
      monthlyAverage,
    });
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense records' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create new expense record
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
      merchant, 
      date, 
      description,
      isRecurring,
      recurringFrequency,
      isEssential,
      priority
    } = body;

    // Validate required fields
    if (!amount || !category || !date) {
      return NextResponse.json(
        { error: 'Amount, category, and date are required' },
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

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: parseFloat(amount),
        category,
        merchant: merchant?.trim() || null,
        date: new Date(date),
        notes: description?.trim() || null,
        recurring: isRecurring || false,
        frequency: recurringFrequency || null,
        essential: isEssential !== false, // Default to true
        priority: priority || 5,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    logger.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense record' },
      { status: 500 }
    );
  }
}