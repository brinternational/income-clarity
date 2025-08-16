import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Expense validation schema for updates
const updateExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required').max(50, 'Category too long').optional(),
  merchant: z.string().max(100, 'Merchant name too long').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  date: z.string().datetime('Invalid date format').optional(),
  recurring: z.boolean().optional(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  essential: z.boolean().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  metadata: z.string().optional()
});

// Mock user ID - in production, get from authentication
const MOCK_USER_ID = 'user-demo-001';

// PUT /api/expenses/[id] - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Expense ID is required'
      }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: MOCK_USER_ID
      }
    });

    if (!existingExpense) {
      return NextResponse.json({
        success: false,
        error: 'Expense not found'
      }, { status: 404 });
    }

    // Validate frequency requirement for recurring expenses
    const isRecurring = validatedData.recurring !== undefined 
      ? validatedData.recurring 
      : existingExpense.recurring;
      
    const frequency = validatedData.frequency || existingExpense.frequency;
    
    if (isRecurring && !frequency) {
      return NextResponse.json({
        success: false,
        error: 'Frequency is required for recurring expenses'
      }, { status: 400 });
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.merchant !== undefined && { merchant: validatedData.merchant }),
        ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
        ...(validatedData.date && { date: new Date(validatedData.date) }),
        ...(validatedData.recurring !== undefined && { recurring: validatedData.recurring }),
        ...(validatedData.frequency !== undefined && { frequency: validatedData.frequency }),
        ...(validatedData.priority !== undefined && { priority: validatedData.priority }),
        ...(validatedData.essential !== undefined && { essential: validatedData.essential }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.metadata !== undefined && { metadata: validatedData.metadata })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedExpense,
      message: 'Expense updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/expenses/[id] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update expense'
    }, { status: 500 });
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Expense ID is required'
      }, { status: 400 });
    }

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: MOCK_USER_ID
      }
    });

    if (!existingExpense) {
      return NextResponse.json({
        success: false,
        error: 'Expense not found'
      }, { status: 404 });
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

// GET /api/expenses/[id] - Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Expense ID is required'
      }, { status: 400 });
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: MOCK_USER_ID
      }
    });

    if (!expense) {
      return NextResponse.json({
        success: false,
        error: 'Expense not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('GET /api/expenses/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}