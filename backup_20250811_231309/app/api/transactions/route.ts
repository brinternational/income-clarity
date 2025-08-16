/**
 * Transactions API Routes - CRUD Operations
 * Track buy/sell/dividend transactions for portfolio analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { z } from 'zod'

const DEFAULT_USER_ID = 'default-user'

// Validation schema for creating transactions
const TransactionCreateSchema = z.object({
  portfolioId: z.string().optional(),
  ticker: z.string().min(1, 'Ticker symbol is required').max(10),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'INTEREST', 'SPLIT', 'MERGER']),
  shares: z.number().optional(),
  amount: z.number('Amount is required'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  notes: z.string().optional()
})

// GET /api/transactions - Get transactions with filtering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const portfolioId = url.searchParams.get('portfolioId')
    const ticker = url.searchParams.get('ticker')
    const type = url.searchParams.get('type')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    console.log('📊 Fetching transactions with filters:', { portfolioId, ticker, type, limit, offset })
    // Build where clause
    const whereClause: any = {
      userId: DEFAULT_USER_ID
    }

    if (portfolioId) {
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

      whereClause.portfolioId = portfolioId
    }

    if (ticker) {
      whereClause.ticker = ticker.toUpperCase()
    }

    if (type) {
      whereClause.type = type.toUpperCase()
    }

    // Get transactions
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.transaction.count({
        where: whereClause
      })
    ])

    // Calculate summary statistics
    const summary = {
      totalTransactions: totalCount,
      totalInvested: 0,
      totalDividends: 0,
      totalProceeds: 0,
      netCashFlow: 0
    }

    transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'BUY':
          summary.totalInvested += Math.abs(transaction.amount)
          summary.netCashFlow -= Math.abs(transaction.amount)
          break
        case 'SELL':
          summary.totalProceeds += Math.abs(transaction.amount)
          summary.netCashFlow += Math.abs(transaction.amount)
          break
        case 'DIVIDEND':
        case 'INTEREST':
          summary.totalDividends += Math.abs(transaction.amount)
          summary.netCashFlow += Math.abs(transaction.amount)
          break
      }
    })

    console.log('✅ Retrieved', transactions.length, 'transactions')
    return NextResponse.json({
      success: true,
      data: transactions,
      summary,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + transactions.length < totalCount
      }
    })

  } catch (error) {
    console.error('❌ Error fetching transactions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )