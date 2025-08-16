import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

interface TransactionSummary {
  totalTransactions: number
  totalInvested: number
  totalDividends: number
  totalProceeds: number
  netCashFlow: number
}

export async function GET(request: NextRequest) {
  try {
    // For now, we'll use a demo user ID - in production this would come from auth
    // TODO: Implement proper authentication
    const userId = request.headers.get('x-demo-user-id') || 'demo-user'
    
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const portfolioId = searchParams.get('portfolioId')
    const ticker = searchParams.get('ticker')?.toUpperCase()
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items
    const offset = parseInt(searchParams.get('offset') || '0') || (page - 1) * limit

    // Build where clause for filtering
    const where: any = {
      userId
    }

    // Add portfolio filter
    if (portfolioId && portfolioId !== '') {
      where.portfolioId = portfolioId
    }

    // Add ticker filter
    if (ticker && ticker !== '') {
      where.ticker = {
        contains: ticker,
        mode: 'insensitive'
      }
    }

    // Add transaction type filter
    if (type && type !== '') {
      where.type = type
    }

    // Add date range filters
    if (startDate || endDate || dateFrom || dateTo) {
      where.date = {}
      
      if (startDate) {
        where.date.gte = new Date(startDate)
      } else if (dateFrom) {
        where.date.gte = new Date(dateFrom)
      }
      
      if (endDate) {
        where.date.lte = new Date(endDate + 'T23:59:59.999Z')
      } else if (dateTo) {
        where.date.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    // Fetch transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          portfolioId: true,
          ticker: true,
          type: true,
          shares: true,
          amount: true,
          date: true,
          notes: true,
          createdAt: true
        }
      }),
      prisma.transaction.count({ where })
    ])

    // Calculate summary statistics for the filtered results
    const summaryTransactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true
      }
    })

    const summary: TransactionSummary = summaryTransactions.reduce(
      (acc, transaction) => {
        acc.totalTransactions += 1
        
        switch (transaction.type) {
          case 'BUY':
            acc.totalInvested += Math.abs(transaction.amount)
            acc.netCashFlow -= Math.abs(transaction.amount)
            break
          case 'SELL':
            acc.totalProceeds += Math.abs(transaction.amount)
            acc.netCashFlow += Math.abs(transaction.amount)
            break
          case 'DIVIDEND':
          case 'INTEREST':
            acc.totalDividends += Math.abs(transaction.amount)
            acc.netCashFlow += Math.abs(transaction.amount)
            break
          default:
            // SPLIT, MERGER don't affect cash flow directly
            break
        }
        
        return acc
      },
      {
        totalTransactions: 0,
        totalInvested: 0,
        totalDividends: 0,
        totalProceeds: 0,
        netCashFlow: 0
      }
    )

    // Format response data
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      date: transaction.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }))

    const hasMore = offset + limit < totalCount
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      summary,
      pagination: {
        page,
        limit,
        offset,
        totalCount,
        totalPages,
        hasMore,
        hasNext: hasMore,
        hasPrevious: page > 1
      },
      filters: {
        portfolioId,
        ticker,
        type,
        startDate: startDate || dateFrom,
        endDate: endDate || dateTo
      }
    })

  } catch (error) {
    logger.error('Error fetching transactions:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // For creating new transactions
    const userId = request.headers.get('x-demo-user-id') || 'demo-user'
    const body = await request.json()
    
    const { portfolioId, ticker, type, shares, amount, date, notes } = body

    // Validate required fields
    if (!ticker || !type || !amount || !date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: ticker, type, amount, date'
      }, { status: 400 })
    }

    // Validate transaction type
    const validTypes = ['BUY', 'SELL', 'DIVIDEND', 'INTEREST', 'SPLIT', 'MERGER']
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid transaction type. Must be one of: ${validTypes.join(', ')}`
      }, { status: 400 })
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        portfolioId: portfolioId || null,
        ticker: ticker.toUpperCase(),
        type,
        shares: shares ? parseFloat(shares) : null,
        amount: parseFloat(amount),
        date: new Date(date),
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...transaction,
        date: transaction.date.toISOString().split('T')[0]
      },
      message: 'Transaction created successfully'
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creating transaction:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create transaction',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to get user's available tickers for filtering
export async function OPTIONS(request: NextRequest) {
  try {
    const userId = request.headers.get('x-demo-user-id') || 'demo-user'
    
    // Get unique tickers for this user
    const tickers = await prisma.transaction.findMany({
      where: { userId },
      select: { ticker: true },
      distinct: ['ticker'],
      orderBy: { ticker: 'asc' }
    })

    // Get user's portfolios
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        tickers: tickers.map(t => t.ticker),
        portfolios,
        transactionTypes: [
          'BUY', 'SELL', 'DIVIDEND', 'INTEREST', 'SPLIT', 'MERGER'
        ]
      }
    })

  } catch (error) {
    logger.error('Error fetching options:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch options'
    }, { status: 500 })
  }
}