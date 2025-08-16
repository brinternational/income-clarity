import { createClientComponentClient } from '../supabase-client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database, Holding } from '../database.types'

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']

export class RealtimeService {
  private static instance: RealtimeService
  private supabase: ReturnType<typeof createClientComponentClient>
  private channels: Map<string, RealtimeChannel> = new Map()

  constructor() {
    this.supabase = createClientComponentClient()
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  // Generic subscription method for any table
  subscribeToTable<T extends TableName>(
    tableName: T,
    channelName: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<T>>) => void,
    filter?: string
  ): RealtimeChannel {
    // Remove existing channel if it exists
    this.unsubscribe(channelName)

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(filter && { filter })
        },
        callback
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Portfolio-specific subscriptions
  subscribeToUserPortfolios(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<'portfolios'>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      'portfolios',
      `user-portfolios-${userId}`,
      callback,
      `user_id=eq.${userId}`
    )
  }

  subscribeToPortfolioHoldings(
    portfolioId: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<'holdings'>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      'holdings',
      `portfolio-holdings-${portfolioId}`,
      callback,
      `portfolio_id=eq.${portfolioId}`
    )
  }

  subscribeToPortfolioTransactions(
    portfolioId: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<'transactions'>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      'transactions',
      `portfolio-transactions-${portfolioId}`,
      callback,
      `portfolio_id=eq.${portfolioId}`
    )
  }

  // Expense-specific subscriptions
  subscribeToUserExpenses(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<'expenses'>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      'expenses',
      `user-expenses-${userId}`,
      callback,
      `user_id=eq.${userId}`
    )
  }

  subscribeToUserBudgets(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<'budgets'>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      'budgets',
      `user-budgets-${userId}`,
      callback,
      `user_id=eq.${userId}`
    )
  }

  // Financial goals subscriptions
  subscribeToUserGoals(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<'financial_goals'>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      'financial_goals',
      `user-goals-${userId}`,
      callback,
      `user_id=eq.${userId}`
    )
  }

  // User profile subscriptions
  subscribeToUserProfile(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<TableRow<'users'>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      'users',
      `user-profile-${userId}`,
      callback,
      `id=eq.${userId}`
    )
  }

  // Multi-table subscription for dashboard
  subscribeToUserDashboard(
    userId: string,
    callbacks: {
      onPortfolioChange?: (payload: RealtimePostgresChangesPayload<TableRow<'portfolios'>>) => void
      onHoldingChange?: (payload: RealtimePostgresChangesPayload<TableRow<'holdings'>>) => void
      onExpenseChange?: (payload: RealtimePostgresChangesPayload<TableRow<'expenses'>>) => void
      onBudgetChange?: (payload: RealtimePostgresChangesPayload<TableRow<'budgets'>>) => void
      onGoalChange?: (payload: RealtimePostgresChangesPayload<TableRow<'financial_goals'>>) => void
    }
  ): RealtimeChannel {
    const channelName = `dashboard-${userId}`
    
    // Remove existing channel if it exists
    this.unsubscribe(channelName)

    let channel = this.supabase.channel(channelName)

    // Add portfolio changes
    if (callbacks.onPortfolioChange) {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `user_id=eq.${userId}`
        },
        callbacks.onPortfolioChange
      )
    }

    // Add holdings changes (for user's portfolios)
    if (callbacks.onHoldingChange) {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'holdings'
        },
        (payload: any) => {
          // Filter holdings that belong to user's portfolios
          // This would need additional logic to check portfolio ownership
          callbacks.onHoldingChange!(payload as RealtimePostgresChangesPayload<Holding>)
        }
      )
    }

    // Add expense changes
    if (callbacks.onExpenseChange) {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${userId}`
        },
        callbacks.onExpenseChange
      )
    }

    // Add budget changes
    if (callbacks.onBudgetChange) {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`
        },
        callbacks.onBudgetChange
      )
    }

    // Add goal changes
    if (callbacks.onGoalChange) {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'financial_goals',
          filter: `user_id=eq.${userId}`
        },
        callbacks.onGoalChange
      )
    }

    const subscribedChannel = channel.subscribe()
    this.channels.set(channelName, subscribedChannel)
    return subscribedChannel
  }

  // Price update subscription (for external price feeds)
  subscribeToPriceUpdates(
    symbols: string[],
    callback: (symbol: string, price: number, timestamp: Date) => void
  ): RealtimeChannel {
    const channelName = `price-updates-${symbols.join('-')}`
    
    // Remove existing channel if it exists
    this.unsubscribe(channelName)

    // This would be used with a custom price update system
    // For now, it's a placeholder for external price feed integration
    const channel = this.supabase
      .channel(channelName)
      .on('broadcast', { event: 'price-update' }, (payload) => {
        const { symbol, price, timestamp } = payload.payload
        callback(symbol, price, new Date(timestamp))
      })
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Presence tracking for collaborative features
  subscribeToPresence(
    channelName: string,
    userInfo: { user_id: string; user_name: string; avatar_url?: string },
    callbacks: {
      onJoin?: (key: string, currentPresences: any, newPresences: any) => void
      onLeave?: (key: string, currentPresences: any, leftPresences: any) => void
      onSync?: () => void
    }
  ): RealtimeChannel {
    // Remove existing channel if it exists
    this.unsubscribe(channelName)

    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        callbacks.onSync?.()
      })
      .on('presence', { event: 'join' }, ({ key, currentPresences, newPresences }) => {
        callbacks.onJoin?.(key, currentPresences, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, currentPresences, leftPresences }) => {
        callbacks.onLeave?.(key, currentPresences, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo)
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // Send broadcast message
  async sendBroadcast(channelName: string, event: string, payload: any): Promise<void> {
    const channel = this.channels.get(channelName)
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload
      })
    }
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
  }

  // Get active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }

  // Check if a channel is active
  isChannelActive(channelName: string): boolean {
    return this.channels.has(channelName)
  }

  // Get channel status
  getChannelStatus(channelName: string): string | null {
    const channel = this.channels.get(channelName)
    return channel ? channel.state : null
  }

  // Health check for realtime connection
  getConnectionStatus(): string {
    return (this.supabase.realtime as any).connection?.state || 'disconnected'
  }

  // Reconnect to realtime
  async reconnect(): Promise<void> {
    await this.supabase.realtime.disconnect()
    await this.supabase.realtime.connect()
  }

  // Remove a channel
  removeChannel(channel: RealtimeChannel): void {
    this.supabase.removeChannel(channel)
  }
}

export const realtimeService = RealtimeService.getInstance()

// React hook for easy integration
export const useRealtimeSubscription = (
  subscriptionFn: () => RealtimeChannel,
  dependencies: any[] = []
) => {
  const [channel, setChannel] = React.useState<RealtimeChannel | null>(null)

  React.useEffect(() => {
    const newChannel = subscriptionFn()
    setChannel(newChannel)

    return () => {
      if (newChannel) {
        realtimeService.removeChannel(newChannel)
      }
    }
  }, dependencies)

  return channel
}

// Import React for the hook (this would normally be imported at the top)
import * as React from 'react'

export default realtimeService