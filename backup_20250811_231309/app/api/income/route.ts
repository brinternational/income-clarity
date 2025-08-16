import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Income validation schema
const incomeSchema = z.object({
  source: z.string().min(1, 'Source is required').max(100, 'Source too long'),
  category: z.enum(['SALARY', 'DIVIDEND', 'INTEREST', 'CAPITAL_GAINS', 'OTHER']),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().datetime('Invalid date format'),
  recurring: z.boolean().default(false),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  taxable: z.boolean().default(true),
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
  sortBy: z.enum(['date', 'amount', 'source', 'category']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Mock user ID - in production, get from authentication
const MOCK_USER_ID = 'user-demo-001';

// GET /api/income - List all income entries with filtering
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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [incomes, total] = await Promise.all([
      prisma.income.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.income.count({ where })
    ]);

    // Calculate summary statistics
    const summaryData = await prisma.income.aggregate({
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
      data: incomes,
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
        count: summaryData._count.id
      }
    });

  } catch (error) {
    // console.error('GET /api/income error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch income entries'
    }, { status: 500 });
  }
}

// POST /api/income - Create new income entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = incomeSchema.parse(body);

    // Validate frequency is provided for recurring income
    if (validatedData.recurring && !validatedData.frequency) {
      return NextResponse.json({
        success: false,
        error: 'Frequency is required for recurring income'
      }, { status: 400 });
    }

    // Create income entry
    const income = await prisma.income.create({
      data: {
        userId: MOCK_USER_ID,
        source: validatedData.source,
        category: validatedData.category,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        recurring: validatedData.recurring,
        frequency: validatedData.frequency || null,
        taxable: validatedData.taxable,
        notes: validatedData.notes || null,
        metadata: validatedData.metadata || null
      }
    });

    return NextResponse.json({
      success: true,
      data: income,
      message: 'Income entry created successfully'
    }, { status: 201 });

  } catch (error) {
    // console.error('POST /api/income error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create income entry'
    }, { status: 500 });
  }
}