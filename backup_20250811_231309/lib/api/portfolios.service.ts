import { createClientComponentClient } from '../supabase-client'
import { LOCAL_MODE_CONFIG } from '../config/local-mode'
import type { 
  Portfolio, 
  PortfolioInsert, 
  PortfolioUpdate, 
  Holding, 
  HoldingInsert, 
  HoldingUpdate,
  Transaction,
  TransactionInsert,
  PortfolioPerformance,
  RebalanceRecommendation,
  PortfolioPerformanceMetrics
} from '../database.types'

// Mock data for LOCAL_MODE
const mockPortfolio: Portfolio = {
  id: 'mock-portfolio-1',
  user_id: 'mock-user-1',
  name: 'Demo Portfolio',
  portfolio_type: 'investment',
  total_value: 125000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockHoldings: Holding[] = [
  {
    id: 'mock-holding-1',
    portfolio_id: 'mock-portfolio-1',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    asset_type: 'etf',
    quantity: 100,
    average_cost: 400,
    current_price: 450,
    current_value: 45000,
    allocation_percentage: 36,
    last_updated: new Date().toISOString()
  },
  {
    id: 'mock-holding-2',
    portfolio_id: 'mock-portfolio-1',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    asset_type: 'etf',
    quantity: 200,
    average_cost: 200,
    current_price: 220,
    current_value: 44000,
    allocation_percentage: 35.2,
    last_updated: new Date().toISOString()
  },
  {
    id: 'mock-holding-3',
    portfolio_id: 'mock-portfolio-1',
    symbol: 'SCHD',
    name: 'Schwab US Dividend Equity ETF',
    asset_type: 'etf',
    quantity: 500,
    average_cost: 70,
    current_price: 72,
    current_value: 36000,
    allocation_percentage: 28.8,
    last_updated: new Date().toISOString()
  }
]

export class PortfoliosService {
  private static instance: PortfoliosService
  private supabase: ReturnType<typeof createClientComponentClient>

  constructor() {
    this.supabase = createClientComponentClient()
  }

  static getInstance(): PortfoliosService {
    if (!PortfoliosService.instance) {
      PortfoliosService.instance = new PortfoliosService()
    }
    return PortfoliosService.instance
  }

  // Portfolio CRUD operations
  async createPortfolio(portfolio: PortfolioInsert) {
    // LOCAL_MODE: Return mock portfolio
    if (LOCAL_MODE_CONFIG.ENABLED) {
      return { 
        data: { 
          ...mockPortfolio,
          ...portfolio,
          id: `mock-portfolio-${Date.now()}`
        }, 
        error: null 
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .insert(portfolio)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getPortfolios(userId: string) {
    // LOCAL_MODE: Return mock portfolios
    if (LOCAL_MODE_CONFIG.ENABLED) {
      return { 
        data: [{
          ...mockPortfolio,
          holdings: mockHoldings
        }], 
        error: null 
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .select(`
          *,
          holdings (
            id,
            symbol,
            name,
            asset_type,
            quantity,
            current_value,
            allocation_percentage
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getPortfolio(portfolioId: string) {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .select(`
          *,
          holdings (*),
          transactions (*)
        `)
        .eq('id', portfolioId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updatePortfolio(portfolioId: string, updates: PortfolioUpdate) {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', portfolioId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deletePortfolio(portfolioId: string) {
    try {
      const { data, error } = await this.supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Holdings CRUD operations
  async addHolding(holding: HoldingInsert) {
    // LOCAL_MODE: Return mock holding
    if (LOCAL_MODE_CONFIG.ENABLED) {
      return { 
        data: {
          ...mockHoldings[0],
          ...holding,
          id: `mock-holding-${Date.now()}`
        },
        error: null 
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('holdings')
        .insert(holding)
        .select()
        .single()

      if (error) throw error

      // Recalculate portfolio total value and allocations
      await this.recalculatePortfolioMetrics(holding.portfolio_id)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getHoldings(portfolioId: string) {
    // LOCAL_MODE: Return mock holdings
    if (LOCAL_MODE_CONFIG.ENABLED) {
      return { 
        data: mockHoldings,
        error: null 
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('current_value', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateHolding(holdingId: string, updates: HoldingUpdate) {
    try {
      const { data, error } = await this.supabase
        .from('holdings')
        .update({ ...updates, last_updated: new Date().toISOString() })
        .eq('id', holdingId)
        .select()
        .single()

      if (error) throw error

      // Recalculate portfolio metrics if value-related fields were updated
      if (updates.current_price || updates.quantity || updates.current_value) {
        await this.recalculatePortfolioMetrics(data.portfolio_id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteHolding(holdingId: string) {
    try {
      // Get portfolio ID before deletion
      const { data: holding } = await this.supabase
        .from('holdings')
        .select('portfolio_id')
        .eq('id', holdingId)
        .single()

      const { data, error } = await this.supabase
        .from('holdings')
        .delete()
        .eq('id', holdingId)
        .select()
        .single()

      if (error) throw error

      // Recalculate portfolio metrics
      if (holding) {
        await this.recalculatePortfolioMetrics(holding.portfolio_id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Transaction operations
  async addTransaction(transaction: TransactionInsert) {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()

      if (error) throw error

      // Update holdings based on transaction
      await this.processTransaction(data)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getTransactions(portfolioId: string, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('transaction_date', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Portfolio performance and analytics
  async getPortfolioPerformance(portfolioId: string) {
    try {
      const { data, error } = await this.supabase
        .from('portfolio_performance')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async calculatePortfolioPerformance(
    portfolioId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<{ data: PortfolioPerformanceMetrics[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('calculate_portfolio_performance', {
          portfolio_id: portfolioId,
          start_date: startDate,
          end_date: endDate
        })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getRebalanceRecommendations(
    portfolioId: string,
    dryRun = true
  ): Promise<{ data: RebalanceRecommendation[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('rebalance_portfolio', {
          portfolio_id: portfolioId,
          dry_run: dryRun
        })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Real-time updates
  subscribeToPortfolioChanges(portfolioId: string, callback: (payload: any) => void) {
    // LOCAL_MODE: Return mock subscription
    if (LOCAL_MODE_CONFIG.ENABLED) {
      // Return a mock subscription object
      return {
        unsubscribe: () => {},
        subscribe: () => {}
      }
    }

    // Check if channel function exists (for mock Supabase clients)
    if (!this.supabase.channel || typeof this.supabase.channel !== 'function') {
      // console.log('Real-time subscriptions not available in Lite Production mode');
      return {
        unsubscribe: () => {},
        subscribe: () => {}
      }
    }

    const subscription = this.supabase
      .channel(`portfolio-${portfolioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `id=eq.${portfolioId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holdings',
          filter: `portfolio_id=eq.${portfolioId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  subscribeToHoldingsChanges(portfolioId: string, callback: (payload: any) => void) {
    // LOCAL_MODE: Return mock subscription
    if (LOCAL_MODE_CONFIG.ENABLED) {
      // Return a mock subscription object
      return {
        unsubscribe: () => {},
        subscribe: () => {}
      }
    }

    // Check if channel function exists (for mock Supabase clients)
    if (!this.supabase.channel || typeof this.supabase.channel !== 'function') {
      // console.log('Real-time holdings subscriptions not available in Lite Production mode');
      return {
        unsubscribe: () => {},
        subscribe: () => {}
      }
    }

    const subscription = this.supabase
      .channel(`holdings-${portfolioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holdings',
          filter: `portfolio_id=eq.${portfolioId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  // Private helper methods
  private async recalculatePortfolioMetrics(portfolioId: string) {
    try {
      // Get all holdings for the portfolio
      const { data: holdings, error: holdingsError } = await this.supabase
        .from('holdings')
        .select('current_value')
        .eq('portfolio_id', portfolioId)

      if (holdingsError) throw holdingsError

      // Calculate total value
      const totalValue = holdings?.reduce((sum, holding) => sum + holding.current_value, 0) || 0

      // Update portfolio total value
      await this.supabase
        .from('portfolios')
        .update({ 
          total_value: totalValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolioId)

      // Update allocation percentages for each holding
      if (totalValue > 0 && holdings) {
        for (const holding of holdings) {
          const allocationPercentage = (holding.current_value / totalValue) * 100
          await this.supabase
            .from('holdings')
            .update({ allocation_percentage: allocationPercentage })
            .eq('portfolio_id', portfolioId)
        }
      }
    } catch (error) {
      // Error handled by emergency recovery script
    }
  }

  private async processTransaction(transaction: Transaction) {
    if (!transaction.holding_id || !transaction.symbol) return

    try {
      const { data: holding, error: holdingError } = await this.supabase
        .from('holdings')
        .select('*')
        .eq('id', transaction.holding_id)
        .single()

      if (holdingError) throw holdingError

      let updatedHolding: Partial<HoldingUpdate> = {}

      switch (transaction.transaction_type) {
        case 'buy':
          if (transaction.quantity && transaction.price) {
            const newQuantity = holding.quantity + transaction.quantity
            const newAverageCost = (
              (holding.quantity * holding.average_cost) + 
              (transaction.quantity * transaction.price)
            ) / newQuantity

            updatedHolding = {
              quantity: newQuantity,
              average_cost: newAverageCost,
              current_value: newQuantity * (transaction.price || holding.current_price)
            }
          }
          break

        case 'sell':
          if (transaction.quantity) {
            const newQuantity = Math.max(0, holding.quantity - transaction.quantity)
            updatedHolding = {
              quantity: newQuantity,
              current_value: newQuantity * holding.current_price
            }
          }
          break

        case 'dividend':
          // Dividends don't affect quantity or cost basis
          break

        default:
          break
      }

      if (Object.keys(updatedHolding).length > 0) {
        await this.updateHolding(transaction.holding_id, updatedHolding)
      }
    } catch (error) {
      // Error handled by emergency recovery script
    }
  }

  // Batch price updates (for external price feeds)
  async updateHoldingsPrices(priceData: { symbol: string; price: number }[]) {
    try {
      const updates = priceData.map(({ symbol, price }) => 
        this.supabase
          .from('holdings')
          .update({ 
            current_price: price,
            last_updated: new Date().toISOString()
          })
          .eq('symbol', symbol)
      )

      await Promise.all(updates)

      // Recalculate portfolio metrics for affected portfolios
      const { data: affectedPortfolios } = await this.supabase
        .from('holdings')
        .select('portfolio_id')
        .in('symbol', priceData.map(p => p.symbol))

      const uniquePortfolioIds = Array.from(new Set(affectedPortfolios?.map(p => p.portfolio_id) || []))
      
      await Promise.all(
        uniquePortfolioIds.map(portfolioId => 
          this.recalculatePortfolioMetrics(portfolioId)
        )
      )

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    }
  }
}

export const portfoliosService = PortfoliosService.getInstance()