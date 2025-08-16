import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Mock user ID - in production, get from authentication
const MOCK_USER_ID = 'user-demo-001';

// Budget update schema (partial)
const budgetUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
  categories: z.array(z.object({
    id: z.string().optional(), // For existing categories
    category: z.string().min(1),
    budgetedAmount: z.number().positive(),
    priority: z.number().int().min(1).max(10),
    essential: z.boolean(),
    notes: z.string().max(500).optional()
  })).optional()
});

// GET /api/budgets/[id] - Get specific budget with progress
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Budget ID is required'
      }, { status: 400 });
    }

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: MOCK_USER_ID
      },
      include: {
        categories: true
      }
    });

    if (!budget) {
      return NextResponse.json({
        success: false,
        error: 'Budget not found'
      }, { status: 404 });
    }

    // Calculate detailed progress
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    
    // Get all expenses within budget period
    const expenses = await prisma.expense.findMany({
      where: {
        userId: MOCK_USER_ID,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate progress for each category
    const categoryProgress = budget.categories.map(category => {
      const categoryExpenses = expenses.filter(exp => exp.category === category.category);
      const actualSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const percentage = category.budgetedAmount > 0 ? (actualSpent / category.budgetedAmount) * 100 : 0;
      const remaining = category.budgetedAmount - actualSpent;
      
      return {
        ...category,
        actualSpent,
        percentage,
        remaining,
        isOverBudget: actualSpent > category.budgetedAmount,
        expenseCount: categoryExpenses.length,
        recentExpenses: categoryExpenses.slice(0, 5), // Last 5 expenses
        averageExpenseAmount: categoryExpenses.length > 0 ? actualSpent / categoryExpenses.length : 0,
        dailyAverage: getDailyAverage(categoryExpenses, startDate, endDate)
      };
    });

    // Calculate overall progress
    const totalActual = categoryProgress.reduce((sum, cat) => sum + cat.actualSpent, 0);
    const overallPercentage = budget.totalBudget > 0 ? (totalActual / budget.totalBudget) * 100 : 0;
    const isOverBudget = totalActual > budget.totalBudget;
    const shouldAlert = overallPercentage >= budget.alertThreshold;

    // Calculate projections based on current spending rate
    const daysInBudget = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, daysInBudget - daysElapsed);
    
    const dailySpendRate = daysElapsed > 0 ? totalActual / daysElapsed : 0;
    const projectedTotal = totalActual + (dailySpendRate * daysRemaining);
    const projectedOverage = projectedTotal > budget.totalBudget ? projectedTotal - budget.totalBudget : 0;

    const budgetWithProgress = {
      ...budget,
      progress: {
        categories: categoryProgress,
        overall: {
          totalBudgeted: budget.totalBudget,
          totalActual,
          percentage: overallPercentage,
          remaining: budget.totalBudget - totalActual,
          isOverBudget,
          shouldAlert
        },
        timeline: {
          daysInBudget,
          daysElapsed,
          daysRemaining,
          percentageComplete: daysInBudget > 0 ? (daysElapsed / daysInBudget) * 100 : 0
        },
        projections: {
          dailySpendRate,
          projectedTotal,
          projectedOverage,
          onTrack: projectedTotal <= budget.totalBudget,
          recommendedDailySpend: daysRemaining > 0 ? (budget.totalBudget - totalActual) / daysRemaining : 0
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: budgetWithProgress
    });

  } catch (error) {
    console.error('GET /api/budgets/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

// PUT /api/budgets/[id] - Update budget
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Budget ID is required'
      }, { status: 400 });
    }

    const validatedData = budgetUpdateSchema.parse(body);
    const { categories, ...budgetData } = validatedData;

    // Update budget and categories in a transaction
    const updatedBudget = await prisma.$transaction(async (tx) => {
      // Check if budget exists and belongs to user
      const existingBudget = await tx.budget.findFirst({
        where: { id, userId: MOCK_USER_ID },
        include: { categories: true }
      });

      if (!existingBudget) {
        throw new Error('Budget not found');
      }

      // Update budget
      const updated = await tx.budget.update({
        where: { id },
        data: budgetData
      });

      // Update categories if provided
      if (categories) {
        // Delete existing categories
        await tx.budgetCategory.deleteMany({
          where: { budgetId: id }
        });

        // Create new categories
        await tx.budgetCategory.createMany({
          data: categories.map(cat => ({
            ...cat,
            id: undefined, // Let DB generate new IDs
            budgetId: id,
            userId: MOCK_USER_ID
          }))
        });

        // Recalculate total budget
        const newTotal = categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
        await tx.budget.update({
          where: { id },
          data: { totalBudget: newTotal }
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: updatedBudget,
      message: 'Budget updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/budgets/[id] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid budget data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update budget'
    }, { status: 500 });
  }
}

// DELETE /api/budgets/[id] - Delete budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Budget ID is required'
      }, { status: 400 });
    }

    // Delete budget and categories in a transaction
    await prisma.$transaction(async (tx) => {
      // Check if budget exists and belongs to user
      const existingBudget = await tx.budget.findFirst({
        where: { id, userId: MOCK_USER_ID }
      });

      if (!existingBudget) {
        throw new Error('Budget not found');
      }

      // Delete categories first (foreign key constraint)
      await tx.budgetCategory.deleteMany({
        where: { budgetId: id }
      });

      // Delete budget
      await tx.budget.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/budgets/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

// Helper function to calculate daily average spending
function getDailyAverage(expenses: any[], startDate: Date, endDate: Date): number {
  if (expenses.length === 0) return 0;
  
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysInPeriod > 0 ? totalAmount / daysInPeriod : 0;
}