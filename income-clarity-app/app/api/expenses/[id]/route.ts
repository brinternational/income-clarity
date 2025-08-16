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

// GET /api/expenses/[id] - Get specific expense record
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense record not found' }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    logger.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense record' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update expense record
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense record not found' }, { status: 404 });
    }

    const expense = await prisma.expense.update({
      where: {
        id: params.id,
      },
      data: {
        amount: parseFloat(amount),
        category,
        merchant: merchant?.trim() || null,
        date: new Date(date),
        notes: description?.trim() || null,
        recurring: isRecurring || false,
        frequency: recurringFrequency || null,
        essential: isEssential !== false,
        priority: priority || 5,
      },
    });

    return NextResponse.json({ expense });
  } catch (error) {
    logger.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense record' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete expense record
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if expense exists and belongs to user
    const expense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense record not found' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Expense record deleted' });
  } catch (error) {
    logger.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense record' },
      { status: 500 }
    );
  }
}