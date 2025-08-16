/**
 * Holdings API Routes - CRUD Operations
 * Manage individual holdings within portfolios
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { z } from 'zod'

const DEFAULT_USER_ID = 'default-user'

// Validation schema for creating holdings
const HoldingCreateSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  ticker: z.string().min(1, 'Ticker symbol is required').max(10),
  shares: z.number().positive('Shares must be positive'),
  costBasis: z.number().positive('Cost basis must be positive'),
  purchaseDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  currentPrice: z.number().positive().optional(),
  dividendYield: z.number().min(0).max(1).optional(),
  sector: z.string().optional()
})

const HoldingUpdateSchema = HoldingCreateSchema.partial().omit({ portfolioId: true })

// GET /api/holdings - Get holdings for a portfolio
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const portfolioId = url.searchParams.get('portfolioId')
    
    if (!portfolioId) {
      return NextResponse.json({
        success: false,
        error: 'Portfolio ID is required'
      }, { status: 400 })
    }

    console.log('📊 Fetching holdings for portfolio:', portfolioId)
    // Verify user owns the portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id: portfolioId,
        userId: DEFAULT_USER_ID
      }
    })

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        error: 'Portfolio not found'
      }, { status: 404 })
    }

    // Get holdings for this portfolio
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: portfolioId },
      orderBy: [
        { shares: 'desc' },
        { ticker: 'asc' }
      ]
    })

    // Calculate current values and metrics for each holding
    const holdingsWithMetrics = holdings.map(holding => {
      const currentValue = holding.shares * (holding.currentPrice || 0)
      const gainLoss = currentValue - holding.costBasis
      const returnPercentage = holding.costBasis > 0 ? (gainLoss / holding.costBasis) * 100 : 0
      const annualDividendIncome = currentValue * (holding.dividendYield || 0)

      return {
        ...holding,
        metrics: {
          currentValue,
          gainLoss,
          returnPercentage,
          annualDividendIncome,
          monthlyDividendIncome: annualDividendIncome / 12
        }
      }
    })

    console.log('✅ Retrieved', holdings.length, 'holdings')
    return NextResponse.json({
      success: true,
      data: holdingsWithMetrics,
      count: holdings.length,
      portfolioId: portfolioId
    })

  } catch (error) {
    console.error('❌ Error fetching holdings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )