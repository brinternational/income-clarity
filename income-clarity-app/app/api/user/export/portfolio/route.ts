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

    logger.info('Portfolio export requested', { userId });

    // Fetch user's portfolios with holdings
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: userId
      },
      include: {
        holdings: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform data for CSV export
    const exportData = [];
    
    for (const portfolio of portfolios) {
      for (const holding of portfolio.holdings) {
        const currentValue = holding.shares && holding.currentPrice 
          ? holding.shares * holding.currentPrice 
          : null;
        
        const totalGain = holding.costBasis && currentValue
          ? currentValue - holding.costBasis
          : null;
        
        const gainPercent = holding.costBasis && totalGain
          ? ((totalGain / holding.costBasis) * 100)
          : null;

        exportData.push({
          'Portfolio': portfolio.name,
          'Portfolio Type': portfolio.type,
          'Institution': portfolio.institution || '',
          'Ticker': holding.ticker,
          'Company Name': holding.name || '',
          'Shares': holding.shares,
          'Average Cost Per Share': holding.averageCost || '',
          'Total Cost Basis': holding.costBasis || '',
          'Current Price': holding.currentPrice || '',
          'Current Value': currentValue || '',
          'Total Gain/Loss': totalGain || '',
          'Gain/Loss %': gainPercent ? gainPercent.toFixed(2) + '%' : '',
          'Dividend Yield': holding.dividendYield ? (holding.dividendYield * 100).toFixed(2) + '%' : '',
          'Sector': holding.sector || '',
          'Purchase Date': holding.purchaseDate ? holding.purchaseDate.toISOString().split('T')[0] : '',
          'Data Source': holding.dataSource,
          'Last Updated': holding.lastUpdated ? holding.lastUpdated.toISOString() : holding.updatedAt.toISOString(),
          'Created Date': holding.createdAt.toISOString().split('T')[0]
        });
      }
    }

    if (exportData.length === 0) {
      return NextResponse.json({ 
        error: 'No portfolio data found to export' 
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
    const filename = `portfolio_export_${timestamp}.csv`;
    
    logger.info('Portfolio export generated', { 
      userId, 
      recordCount: exportData.length, 
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
    logger.error('Error generating portfolio export:', error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio export' },
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