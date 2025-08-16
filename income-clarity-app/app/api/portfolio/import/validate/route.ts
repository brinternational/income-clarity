import { NextRequest, NextResponse } from 'next/server';
import { portfolioImportService } from '@/lib/services/portfolio-import.service';
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, data: rawData } = body;

    if (!method || !rawData) {
      return NextResponse.json(
        { error: 'Method and data are required' },
        { status: 400 }
      );
    }

    // Validate the data
    const parsedData = await portfolioImportService.validateData(rawData, method);
    
    // Calculate statistics
    const totalRecords = parsedData.length;
    const validRecords = parsedData.filter(item => !item.errors || item.errors.length === 0).length;
    const recordsWithErrors = totalRecords - validRecords;
    const recordsWithWarnings = parsedData.filter(item => item.warnings && item.warnings.length > 0).length;
    
    // Extract all unique symbols for additional validation
    const symbols = [...new Set(parsedData.map(item => item.symbol).filter(Boolean))];
    
    // Detect potential duplicates
    const duplicates = parsedData.filter((item, index, arr) => 
      arr.findIndex(other => other.symbol === item.symbol && other.purchaseDate === item.purchaseDate) !== index
    );

    // Generate suggestions
    const suggestions = [];
    
    if (recordsWithErrors > 0) {
      suggestions.push(`Fix ${recordsWithErrors} records with validation errors`);
    }
    
    if (duplicates.length > 0) {
      suggestions.push(`Review ${duplicates.length} potential duplicate holdings`);
    }
    
    const missingCurrentPrice = parsedData.filter(item => !item.currentPrice).length;
    if (missingCurrentPrice > 0) {
      suggestions.push(`${missingCurrentPrice} holdings missing current prices (will be auto-fetched)`);
    }

    const response = {
      success: true,
      validation: {
        totalRecords,
        validRecords,
        recordsWithErrors,
        recordsWithWarnings,
        duplicates: duplicates.length,
        uniqueSymbols: symbols.length
      },
      data: parsedData,
      suggestions,
      preview: parsedData.slice(0, 10), // First 10 records for preview
      symbols
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Validation failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}

// Helper endpoint to validate individual stock symbols
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];
    
    if (symbols.length === 0) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    // In a real implementation, this would validate against a stock API
    // For demo purposes, we'll do basic validation
    const validationResults = symbols.map(symbol => {
      const cleanSymbol = symbol.trim().toUpperCase();
      const isValid = /^[A-Z]{1,5}$/.test(cleanSymbol);
      
      return {
        symbol: cleanSymbol,
        isValid,
        suggestion: isValid ? null : 'Symbol should be 1-5 uppercase letters',
        marketData: isValid ? {
          currentPrice: Math.random() * 200 + 50, // Mock price
          dividendYield: Math.random() * 5,
          sector: ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial'][Math.floor(Math.random() * 5)]
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      validations: validationResults,
      validCount: validationResults.filter(r => r.isValid).length,
      invalidCount: validationResults.filter(r => !r.isValid).length
    });

  } catch (error) {
    logger.error('Symbol validation failed:', error);
    return NextResponse.json(
      { error: 'Symbol validation failed' },
      { status: 500 }
    );
  }
}