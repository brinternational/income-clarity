import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Expense validation schema
const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  merchant: z.string().max(100, 'Merchant name too long').optional(),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().datetime('Invalid date format'),
  recurring: z.boolean().default(false),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  priority: z.number().int().min(1).max(10).default(5),
  essential: z.boolean().default(true),
  notes: z.string().max(500, 'Notes too long').optional(),
  metadata: z.string().optional()
});

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  recurring: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  essential: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  minAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  sortBy: z.enum(['date', 'amount', 'category', 'priority']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Mock user ID - in production, get from authentication
const MOCK_USER_ID = 'user-demo-001';

// GET /api/expenses - List expenses with filtering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validatedQuery = querySchema.parse(queryParams);
    
    const {
      page,
      limit,
      category,
      startDate,
      endDate,
      recurring,
      essential,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder
    } = validatedQuery;

    // Build where clause
    const where: any = {
      userId: MOCK_USER_ID
    };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (recurring !== undefined) {
      where.recurring = recurring;
    }

    if (essential !== undefined) {
      where.essential = essential;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.expense.count({ where })
    ]);

    // Calculate summary statistics
    const summaryData = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      _avg: {
        amount: true,
        priority: true
      }
    });

    // Get category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      success: true,
      data: expenses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      summary: {
        totalAmount: summaryData._sum.amount || 0,
        count: summaryData._count.id,
        averageAmount: summaryData._avg.amount || 0,
        averagePriority: summaryData._avg.priority || 0,
        categoryBreakdown: categoryBreakdown.map(item => ({
          category: item.category,
          amount: item._sum.amount || 0,
          count: item._count.id
        }))
      }
    });

  } catch (error) {
    // console.error('GET /api/expenses error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch expenses'
    }, { status: 500 });
  }
}

// POST /api/expenses - Create expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = expenseSchema.parse(body);

    // Validate frequency is provided for recurring expenses
    if (validatedData.recurring && !validatedData.frequency) {
      return NextResponse.json({
        success: false,
        error: 'Frequency is required for recurring expenses'
      }, { status: 400 });
    }

    // Create expense entry
    const expense = await prisma.expense.create({
      data: {
        userId: MOCK_USER_ID,
        category: validatedData.category,
        merchant: validatedData.merchant || null,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        recurring: validatedData.recurring,
        frequency: validatedData.frequency || null,
        priority: validatedData.priority,
        essential: validatedData.essential,
        notes: validatedData.notes || null,
        metadata: validatedData.metadata || null
      }
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    }, { status: 201 });

  } catch (error) {
    // console.error('POST /api/expenses error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create expense'
    }, { status: 500 });
  }
}