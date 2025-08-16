import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Income validation schema for updates
const updateIncomeSchema = z.object({
  source: z.string().min(1, 'Source is required').max(100, 'Source too long').optional(),
  category: z.enum(['SALARY', 'DIVIDEND', 'INTEREST', 'CAPITAL_GAINS', 'OTHER']).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  date: z.string().datetime('Invalid date format').optional(),
  recurring: z.boolean().optional(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  taxable: z.boolean().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  metadata: z.string().optional()
});

// Mock user ID - in production, get from authentication
const MOCK_USER_ID = 'user-demo-001';

// PUT /api/income/[id] - Update income entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Income ID is required'
      }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateIncomeSchema.parse(body);

    // Check if income exists and belongs to user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: MOCK_USER_ID
      }
    });

    if (!existingIncome) {
      return NextResponse.json({
        success: false,
        error: 'Income entry not found'
      }, { status: 404 });
    }

    // Validate frequency requirement for recurring income
    const isRecurring = validatedData.recurring !== undefined 
      ? validatedData.recurring 
      : existingIncome.recurring;
      
    const frequency = validatedData.frequency || existingIncome.frequency;
    
    if (isRecurring && !frequency) {
      return NextResponse.json({
        success: false,
        error: 'Frequency is required for recurring income'
      }, { status: 400 });
    }

    // Update income entry
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        ...(validatedData.source && { source: validatedData.source }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
        ...(validatedData.date && { date: new Date(validatedData.date) }),
        ...(validatedData.recurring !== undefined && { recurring: validatedData.recurring }),
        ...(validatedData.frequency !== undefined && { frequency: validatedData.frequency }),
        ...(validatedData.taxable !== undefined && { taxable: validatedData.taxable }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.metadata !== undefined && { metadata: validatedData.metadata })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedIncome,
      message: 'Income entry updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/income/[id] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update income entry'
    }, { status: 500 });
  }
}

// DELETE /api/income/[id] - Delete income entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Income ID is required'
      }, { status: 400 });
    }

    // Check if income exists and belongs to user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: MOCK_USER_ID
      }
    });

    if (!existingIncome) {
      return NextResponse.json({
        success: false,
        error: 'Income entry not found'
      }, { status: 404 });
    }

    // Delete income entry
    await prisma.income.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Income entry deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/income/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

// GET /api/income/[id] - Get single income entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Income ID is required'
      }, { status: 400 });
    }

    const income = await prisma.income.findFirst({
      where: {
        id,
        userId: MOCK_USER_ID
      }
    });

    if (!income) {
      return NextResponse.json({
        success: false,
        error: 'Income entry not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: income
    });

  } catch (error) {
    console.error('GET /api/income/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}