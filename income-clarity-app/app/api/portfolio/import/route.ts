import { NextRequest, NextResponse } from 'next/server';
import { portfolioImportService } from '@/lib/services/portfolio-import.service';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, data: rawData, portfolioId } = body;

    if (!method || !rawData) {
      return NextResponse.json(
        { error: 'Method and data are required' },
        { status: 400 }
      );
    }

    // Validate and parse the data
    const parsedData = await portfolioImportService.validateData(rawData, method);
    
    // Filter valid data (no errors)
    const validData = parsedData.filter(item => !item.errors || item.errors.length === 0);
    
    if (validData.length === 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        errors: parsedData.length,
        warnings: 0,
        details: ['No valid records found to import']
      });
    }

    // Get user from session (in real implementation)
    const userId = 'demo-user'; // Would come from session

    // Create or get portfolio
    let portfolio;
    if (portfolioId) {
      portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId }
      });
    } else {
      // Create default portfolio
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name: 'Imported Portfolio',
          type: 'Taxable',
          isPrimary: true
        }
      });
    }

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Import the holdings
    const importResults = await Promise.allSettled(
      validData.map(async (item) => {
        // Check if holding already exists
        const existingHolding = await prisma.holding.findUnique({
          where: {
            portfolioId_ticker: {
              portfolioId: portfolio.id,
              ticker: item.symbol
            }
          }
        });

        if (existingHolding) {
          // Update existing holding
          return prisma.holding.update({
            where: { id: existingHolding.id },
            data: {
              shares: existingHolding.shares + item.shares,
              costBasis: (existingHolding.costBasis * existingHolding.shares + item.costBasis * item.shares) / (existingHolding.shares + item.shares),
              currentPrice: item.currentPrice,
              dividendYield: item.dividendYield,
              sector: item.sector || existingHolding.sector,
              metadata: JSON.stringify({
                ...JSON.parse(existingHolding.metadata || '{}'),
                notes: item.notes,
                lastImportDate: new Date().toISOString()
              })
            }
          });
        } else {
          // Create new holding
          return prisma.holding.create({
            data: {
              portfolioId: portfolio.id,
              ticker: item.symbol,
              shares: item.shares,
              costBasis: item.costBasis,
              purchaseDate: new Date(item.purchaseDate),
              currentPrice: item.currentPrice,
              dividendYield: item.dividendYield,
              sector: item.sector,
              metadata: JSON.stringify({
                notes: item.notes,
                importDate: new Date().toISOString(),
                importMethod: method
              })
            }
          });
        }
      })
    );

    // Count results
    const successful = importResults.filter(result => result.status === 'fulfilled').length;
    const failed = importResults.filter(result => result.status === 'rejected').length;
    const warnings = parsedData.filter(item => item.warnings && item.warnings.length > 0).length;

    // Create import history record
    await prisma.transaction.create({
      data: {
        userId,
        portfolioId: portfolio.id,
        ticker: 'IMPORT',
        type: 'IMPORT',
        amount: successful,
        date: new Date(),
        notes: `Imported ${successful} holdings via ${method}`,
        metadata: JSON.stringify({
          method,
          totalRecords: parsedData.length,
          successful,
          failed,
          warnings
        })
      }
    });

    const result = {
      success: successful > 0,
      imported: successful,
      errors: failed + (parsedData.length - validData.length),
      warnings,
      details: [
        `Successfully imported ${successful} holdings`,
        ...(failed > 0 ? [`${failed} holdings failed to import`] : []),
        ...(warnings > 0 ? [`${warnings} holdings had warnings`] : [])
      ]
    };

    return NextResponse.json(result);

  } catch (error) {
    logger.error('Portfolio import failed:', error);
    return NextResponse.json(
      { 
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = 'demo-user'; // Would come from session
    
    // Get import history from transactions
    const importHistory = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'IMPORT'
      },
      orderBy: {
        date: 'desc'
      },
      take: 50 // Last 50 imports
    });

    const formattedHistory = importHistory.map(record => {
      const metadata = record.metadata ? JSON.parse(record.metadata) : {};
      
      return {
        id: record.id,
        timestamp: record.date.toISOString(),
        method: metadata.method || 'unknown',
        recordsImported: metadata.successful || 0,
        recordsSkipped: 0,
        recordsWithErrors: metadata.failed || 0,
        status: metadata.successful > 0 ? 
          (metadata.failed > 0 ? 'partial' : 'completed') : 'failed',
        fileName: metadata.fileName,
        size: `${Math.round((record.notes?.length || 0) / 1024 * 100) / 100} KB`,
        canRestore: false, // Would implement restore functionality
        canDownload: false
      };
    });

    return NextResponse.json(formattedHistory);

  } catch (error) {
    logger.error('Failed to fetch import history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}