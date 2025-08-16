import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Budget creation/update schema
const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  categories: z.array(z.object({
    category: z.string().min(1, 'Category required'),
    budgetedAmount: z.number().positive('Amount must be positive'),
    priority: z.number().int().min(1).max(10).default(5),
    essential: z.boolean().default(false),
    notes: z.string().max(500).optional()
  })).min(1, 'At least one category required'),
  totalBudget: z.number().positive('Total budget must be positive'),
  alertThreshold: z.number().min(0).max(100).default(80), // Percentage
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional()
});

// Query schema for filtering
const budgetQuerySchema = z.object({
  period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  active: z.string().transform(val => val === 'true').optional(),
  year: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  month: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  includeProgress: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => val ? parseInt(val, 10) : 20).optional(),
  offset: z.string().transform(val => val ? parseInt(val, 10) : 0).optional()
});

// Mock user ID - in production, get from authentication
const MOCK_USER_ID = 'user-demo-001';

// GET /api/budgets - List budgets with optional filtering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const { period, active, year, month, includeProgress, limit, offset } = budgetQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = { userId: MOCK_USER_ID };
    
    if (period) where.period = period;
    if (typeof active === 'boolean') where.isActive = active;
    
    // Date filtering
    if (year || month) {
      const filterYear = year || new Date().getFullYear();
      const filterMonth = month || new Date().getMonth() + 1;
      
      const startOfPeriod = new Date(filterYear, filterMonth - 1, 1);
      const endOfPeriod = new Date(filterYear, filterMonth, 0, 23, 59, 59);
      
      where.OR = [
        {
          AND: [
            { startDate: { lte: endOfPeriod } },
            { endDate: { gte: startOfPeriod } }
          ]
        }
      ];
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        categories: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Add progress calculation if requested
    if (includeProgress) {
      for (const budget of budgets) {
        // Calculate actual spending for each category
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        
        const expenses = await prisma.expense.findMany({
          where: {
            userId: MOCK_USER_ID,
            date: {
              gte: startDate,
              lte: endDate
            },
            category: {
              in: budget.categories.map(cat => cat.category)
            }
          }
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
            expenseCount: categoryExpenses.length
          };
        });

        // Calculate overall progress
        const totalActual = categoryProgress.reduce((sum, cat) => sum + cat.actualSpent, 0);
        const overallPercentage = budget.totalBudget > 0 ? (totalActual / budget.totalBudget) * 100 : 0;
        const isOverBudget = totalActual > budget.totalBudget;
        const shouldAlert = overallPercentage >= budget.alertThreshold;

        (budget as any).progress = {
          categories: categoryProgress,
          overall: {
            totalBudgeted: budget.totalBudget,
            totalActual,
            percentage: overallPercentage,
            remaining: budget.totalBudget - totalActual,
            isOverBudget,
            shouldAlert
          }
        };
      }
    }

    const total = await prisma.budget.count({ where });

    return NextResponse.json({
      success: true,
      data: budgets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    // console.error('GET /api/budgets error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch budgets'
    }, { status: 500 });
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = budgetSchema.parse(body);

    const { categories, ...budgetData } = validatedData;

    // Create budget with categories in a transaction
    const budget = await prisma.$transaction(async (tx) => {
      // Create the budget
      const newBudget = await tx.budget.create({
        data: {
          ...budgetData,
          userId: MOCK_USER_ID
        }
      });

      // Create budget categories
      const budgetCategories = await tx.budgetCategory.createMany({
        data: categories.map(cat => ({
          ...cat,
          budgetId: newBudget.id,
          userId: MOCK_USER_ID
        }))
      });

      return {
        ...newBudget,
        categories: budgetCategories
      };
    });

    return NextResponse.json({
      success: true,
      data: budget,
      message: 'Budget created successfully'
    }, { status: 201 });

  } catch (error) {
    // console.error('POST /api/budgets error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid budget data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create budget'
    }, { status: 500 });
  }
}