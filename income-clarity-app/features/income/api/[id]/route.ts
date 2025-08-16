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

// GET /api/income/[id] - Get specific income record
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

    const income = await prisma.income.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!income) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    return NextResponse.json({ income });
  } catch (error) {
    logger.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income record' },
      { status: 500 }
    );
  }
}

// PUT /api/income/[id] - Update income record
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

    // Check if income exists and belongs to user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingIncome) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    const income = await prisma.income.update({
      where: {
        id: params.id,
      },
      data: {
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

    return NextResponse.json({ income });
  } catch (error) {
    logger.error('Error updating income:', error);
    return NextResponse.json(
      { error: 'Failed to update income record' },
      { status: 500 }
    );
  }
}

// DELETE /api/income/[id] - Delete income record
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

    // Check if income exists and belongs to user
    const income = await prisma.income.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!income) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    await prisma.income.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Income record deleted' });
  } catch (error) {
    logger.error('Error deleting income:', error);
    return NextResponse.json(
      { error: 'Failed to delete income record' },
      { status: 500 }
    );
  }
}