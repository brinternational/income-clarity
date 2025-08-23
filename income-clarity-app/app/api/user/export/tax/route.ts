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

    logger.info('Tax report export requested', { userId });

    // Get URL search params for tax year (default to current year)
    const { searchParams } = new URL(request.url);
    const taxYear = searchParams.get('year') || new Date().getFullYear().toString();
    
    // Calculate date range for tax year
    const startDate = new Date(`${taxYear}-01-01`);
    const endDate = new Date(`${taxYear}-12-31`);

    // Fetch dividend income for tax year
    const dividendIncome = await prisma.transaction.findMany({
      where: {
        userId: userId,
        type: 'DIVIDEND',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Fetch interest income for tax year
    const interestIncome = await prisma.transaction.findMany({
      where: {
        userId: userId,
        type: 'INTEREST',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Fetch capital gains/losses (SELL transactions)
    const capitalGains = await prisma.transaction.findMany({
      where: {
        userId: userId,
        type: 'SELL',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Fetch other income
    const otherIncome = await prisma.income.findMany({
      where: {
        userId: userId,
        taxable: true,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Transform data for tax report CSV export
    const exportData = [];
    
    // Add dividend income
    for (const dividend of dividendIncome) {
      exportData.push({
        'Tax Year': taxYear,
        'Date': dividend.date.toISOString().split('T')[0],
        'Income Type': 'Dividend Income',
        'Source/Ticker': dividend.ticker,
        'Description': `Dividend from ${dividend.ticker}`,
        'Amount': dividend.amount,
        'Tax Category': 'Dividend Income (1099-DIV)',
        'Form': '1099-DIV',
        'Taxable': 'Yes',
        'Notes': dividend.notes || ''
      });
    }

    // Add interest income
    for (const interest of interestIncome) {
      exportData.push({
        'Tax Year': taxYear,
        'Date': interest.date.toISOString().split('T')[0],
        'Income Type': 'Interest Income',
        'Source/Ticker': interest.ticker,
        'Description': `Interest from ${interest.ticker}`,
        'Amount': interest.amount,
        'Tax Category': 'Interest Income (1099-INT)',
        'Form': '1099-INT',
        'Taxable': 'Yes',
        'Notes': interest.notes || ''
      });
    }

    // Add capital gains/losses (simplified - would need cost basis tracking for accurate calculation)
    for (const sale of capitalGains) {
      exportData.push({
        'Tax Year': taxYear,
        'Date': sale.date.toISOString().split('T')[0],
        'Income Type': 'Capital Gain/Loss',
        'Source/Ticker': sale.ticker,
        'Description': `Sale of ${sale.shares} shares of ${sale.ticker}`,
        'Amount': sale.amount,
        'Tax Category': 'Capital Gains (Schedule D)',
        'Form': 'Schedule D',
        'Taxable': 'Yes',
        'Notes': `${sale.notes || ''} - Note: Cost basis calculation needed for accurate gain/loss`
      });
    }

    // Add other taxable income
    for (const income of otherIncome) {
      exportData.push({
        'Tax Year': taxYear,
        'Date': income.date.toISOString().split('T')[0],
        'Income Type': 'Other Income',
        'Source/Ticker': income.source,
        'Description': `${income.source} - ${income.category}`,
        'Amount': income.amount,
        'Tax Category': income.category === 'SALARY' ? 'W-2 Wages' : 'Other Income (1099-MISC)',
        'Form': income.category === 'SALARY' ? 'W-2' : '1099-MISC',
        'Taxable': income.taxable ? 'Yes' : 'No',
        'Notes': income.notes || income.description || ''
      });
    }

    // Sort by date
    exportData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    // Add summary rows at the end
    const totalDividends = dividendIncome.reduce((sum, div) => sum + div.amount, 0);
    const totalInterest = interestIncome.reduce((sum, int) => sum + int.amount, 0);
    const totalCapitalGains = capitalGains.reduce((sum, cg) => sum + cg.amount, 0);
    const totalOtherIncome = otherIncome.reduce((sum, inc) => sum + inc.amount, 0);
    const grandTotal = totalDividends + totalInterest + totalCapitalGains + totalOtherIncome;

    // Add summary section
    exportData.push({
      'Tax Year': '',
      'Date': '',
      'Income Type': '--- SUMMARY ---',
      'Source/Ticker': '',
      'Description': '',
        'Amount': '',
      'Tax Category': '',
      'Form': '',
      'Taxable': '',
      'Notes': ''
    });

    exportData.push({
      'Tax Year': taxYear,
      'Date': '',
      'Income Type': 'Total Dividend Income',
      'Source/Ticker': '',
      'Description': `${dividendIncome.length} dividend transactions`,
      'Amount': totalDividends,
      'Tax Category': 'Summary',
      'Form': '',
      'Taxable': 'Yes',
      'Notes': ''
    });

    exportData.push({
      'Tax Year': taxYear,
      'Date': '',
      'Income Type': 'Total Interest Income',
      'Source/Ticker': '',
      'Description': `${interestIncome.length} interest transactions`,
      'Amount': totalInterest,
      'Tax Category': 'Summary',
      'Form': '',
      'Taxable': 'Yes',
      'Notes': ''
    });

    exportData.push({
      'Tax Year': taxYear,
      'Date': '',
      'Income Type': 'Total Capital Gains',
      'Source/Ticker': '',
      'Description': `${capitalGains.length} sale transactions`,
      'Amount': totalCapitalGains,
      'Tax Category': 'Summary',
      'Form': '',
      'Taxable': 'Yes',
      'Notes': 'Cost basis calculation needed for accurate gain/loss'
    });

    exportData.push({
      'Tax Year': taxYear,
      'Date': '',
      'Income Type': 'Total Other Income',
      'Source/Ticker': '',
      'Description': `${otherIncome.length} other income items`,
      'Amount': totalOtherIncome,
      'Tax Category': 'Summary',
      'Form': '',
      'Taxable': 'Yes',
      'Notes': ''
    });

    exportData.push({
      'Tax Year': taxYear,
      'Date': '',
      'Income Type': 'GRAND TOTAL TAXABLE INCOME',
      'Source/Ticker': '',
      'Description': 'Total from Income Clarity data',
      'Amount': grandTotal,
      'Tax Category': 'Summary',
      'Form': '',
      'Taxable': 'Yes',
      'Notes': 'Consult tax professional for complete tax preparation'
    });

    if (exportData.length === 0) {
      return NextResponse.json({ 
        error: `No tax data found for year ${taxYear}` 
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
    const filename = `tax_report_${taxYear}_${timestamp}.csv`;
    
    logger.info('Tax report export generated', { 
      userId, 
      taxYear,
      recordCount: exportData.length - 6, // Subtract summary rows
      dividendCount: dividendIncome.length,
      interestCount: interestIncome.length,
      capitalGainsCount: capitalGains.length,
      otherIncomeCount: otherIncome.length,
      totalAmount: grandTotal,
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
    logger.error('Error generating tax report export:', error);
    return NextResponse.json(
      { error: 'Failed to generate tax report export' },
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