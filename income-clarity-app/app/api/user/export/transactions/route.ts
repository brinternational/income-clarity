import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

// Initialize Prisma client
const prisma = new PrismaClient();

// Mock session management - In production, use proper authentication
const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
  // For development/demo purposes, return a fixed test user ID
  // In production, extract from session/JWT token
  return 'test-user-id';
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Transactions export requested', { userId });

    // Get URL search params for optional date range filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const transactionType = searchParams.get('type'); // BUY, SELL, DIVIDEND, etc.

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Build type filter
    const typeFilter = transactionType ? { type: transactionType } : {};

    // Build where clause
    const whereClause: any = {
      userId: userId,
      ...typeFilter
    };

    if (Object.keys(dateFilter).length > 0) {
      whereClause.date = dateFilter;
    }

    // Fetch user's transactions
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc'
      }
    });

    // Also fetch income and expense data for comprehensive transaction export
    const incomes = await prisma.income.findMany({
      where: {
        userId: userId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {})
      },
      orderBy: {
        date: 'desc'
      }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {})
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Transform data for CSV export
    const exportData = [];
    
    // Add investment transactions
    for (const transaction of transactions) {
      exportData.push({
        'Date': transaction.date.toISOString().split('T')[0],
        'Type': 'Investment',
        'Category': transaction.type,
        'Description': `${transaction.type} ${transaction.ticker}`,
        'Ticker': transaction.ticker,
        'Shares': transaction.shares || '',
        'Amount': transaction.amount,
        'Notes': transaction.notes || '',
        'Portfolio ID': transaction.portfolioId || '',
        'Created Date': transaction.createdAt.toISOString().split('T')[0]
      });
    }

    // Add income transactions
    for (const income of incomes) {
      exportData.push({
        'Date': income.date.toISOString().split('T')[0],
        'Type': 'Income',
        'Category': income.category,
        'Description': `${income.source} - ${income.category}`,
        'Ticker': '',
        'Shares': '',
        'Amount': income.amount,
        'Notes': income.notes || income.description || '',
        'Portfolio ID': income.portfolioId || '',
        'Created Date': income.createdAt.toISOString().split('T')[0]
      });
    }

    // Add expense transactions
    for (const expense of expenses) {
      exportData.push({
        'Date': expense.date.toISOString().split('T')[0],
        'Type': 'Expense',
        'Category': expense.category,
        'Description': `${expense.merchant || 'Expense'} - ${expense.category}`,
        'Ticker': '',
        'Shares': '',
        'Amount': -Math.abs(expense.amount), // Expenses as negative amounts
        'Notes': expense.notes || expense.description || '',
        'Portfolio ID': expense.portfolioId || '',
        'Created Date': expense.createdAt.toISOString().split('T')[0]
      });
    }

    // Sort all transactions by date (most recent first)
    exportData.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

    if (exportData.length === 0) {
      return NextResponse.json({ 
        error: 'No transaction data found to export' 
      }, { status: 404 });
    }

    // Generate CSV content
    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Set response headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `transactions_export_${timestamp}.csv`;
    
    logger.info('Transactions export generated', { 
      userId, 
      recordCount: exportData.length,
      transactionCount: transactions.length,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
      filename 
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    logger.error('Error generating transactions export:', error);
    return NextResponse.json(
      { error: 'Failed to generate transactions export' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}