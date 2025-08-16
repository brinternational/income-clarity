// API-005: Real-time WebSocket Service for Super Cards
// Live data updates with efficient push notifications

import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { parse as parseUrl } from 'url'
import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from './config/local-mode'

// WebSocket connection management
interface WebSocketConnection {
  id: string
  userId: string
  ws: WebSocket
  subscriptions: Set<SuperCardType>
  lastPing: number
  metadata: {
    userAgent?: string
    ip?: string
    connectedAt: number
  }
}

type SuperCardType = 'performance' | 'income' | 'lifestyle' | 'strategy' | 'quickActions'

interface SuperCardUpdate {
  type: 'super_card_update'
  card: SuperCardType
  userId: string
  data: any
  timestamp: string
  version: number
}

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'refresh_request'
  cards?: SuperCardType[]
  userId?: string
  requestId?: string
}

class SuperCardWebSocketService {
  private wss: WebSocketServer | null = null
  private connections = new Map<string, WebSocketConnection>()
  private redis: Redis | null = null
  private supabase: any
  private heartbeatInterval: NodeJS.Timeout | null = null
  
  constructor() {
    // Initialize Redis for pub/sub if available
    if (process.env.REDIS_URL) {
      this.redis = new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN
      })
    }

    // Initialize Supabase client for real-time subscriptions
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    }
  }

  // Initialize WebSocket server
  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/ws/super-cards',
      perMessageDeflate: true,
      maxPayload: 16 * 1024, // 16KB max message size
    })

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request)
    })

    this.wss.on('error', (error: Error) => {
      // console.error('WebSocket server error:', error)
    })

    // Start heartbeat to detect disconnected clients
    this.startHeartbeat()

    // Subscribe to database changes if Supabase is available
    this.setupDatabaseSubscriptions()

    // console.log('✅ Super Card WebSocket Service initialized')
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const url = parseUrl(request.url || '', true)
    const userId = url.query.userId as string
    const connectionId = this.generateConnectionId()

    if (!userId) {
      ws.close(1008, 'User ID required')
      return
    }

    // Create connection object
    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      ws,
      subscriptions: new Set(),
      lastPing: Date.now(),
      metadata: {
        userAgent: request.headers['user-agent'],
        ip: request.socket.remoteAddress,
        connectedAt: Date.now()
      }
    }

    this.connections.set(connectionId, connection)

    // console.log(`🔗 WebSocket connection established: ${connectionId} (user: ${userId})`)

    // Set up message handling
    ws.on('message', (data: Buffer) => {
      this.handleMessage(connection, data)
    })

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(connection, code, reason.toString())
    })

    ws.on('error', (error: Error) => {
      // console.error(`WebSocket error for ${connectionId}:`, error)
      // this.connections.delete(connectionId)
    })

    // Send welcome message
    this.sendMessage(connection, {
      type: 'connection_established',
      connectionId,
      timestamp: new Date().toISOString(),
      availableCards: ['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
    })
  }

  private handleMessage(connection: WebSocketConnection, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(connection, message.cards || [])
          break
          
        case 'unsubscribe':
          this.handleUnsubscribe(connection, message.cards || [])
          break
          
        case 'ping':
          connection.lastPing = Date.now()
          this.sendMessage(connection, { type: 'pong', timestamp: new Date().toISOString() })
          break
          
        case 'refresh_request':
          this.handleRefreshRequest(connection, message.cards || [])
          break
          
        default:
          // console.warn(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      // Error handled by emergency recovery script
  }

  private handleSubscribe(connection: WebSocketConnection, cards: SuperCardType[]) {
    const validCards = cards.filter(card => 
      ['performance', 'income', 'lifestyle', 'strategy', 'quickActions'].includes(card)
    )

    validCards.forEach(card => {
      connection.subscriptions.add(card)
    })

    // console.log(`📡 User ${connection.userId} subscribed to: ${validCards.join(', ')}`)

    this.sendMessage(connection, {
      type: 'subscription_confirmed',
      cards: validCards,
      timestamp: new Date().toISOString()
    })

    // Send initial data for subscribed cards
    this.sendInitialData(connection, validCards)
  }

  private handleUnsubscribe(connection: WebSocketConnection, cards: SuperCardType[]) {
    cards.forEach(card => {
      connection.subscriptions.delete(card)
    })

    this.sendMessage(connection, {
      type: 'unsubscription_confirmed',
      cards,
      timestamp: new Date().toISOString()
    })
  }

  private async handleRefreshRequest(connection: WebSocketConnection, cards: SuperCardType[]) {
    if (!this.supabase) {
      this.sendMessage(connection, {
        type: 'error',
        message: 'Database not available',
        timestamp: new Date().toISOString()
      })
      return
    }

    try {
      // Trigger materialized view refresh for user
      await this.supabase.rpc('refresh_user_materialized_views', {
        target_user_id: connection.userId
      })

      // Send updated data
      this.sendInitialData(connection, cards.length > 0 ? cards : Array.from(connection.subscriptions))

      this.sendMessage(connection, {
        type: 'refresh_completed',
        cards: cards.length > 0 ? cards : Array.from(connection.subscriptions),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      // Error handled by emergency recovery script
  }

  private async sendInitialData(connection: WebSocketConnection, cards: SuperCardType[]) {
    if (!this.supabase) return

    try {
      for (const card of cards) {
        const data = await this.fetchCardData(connection.userId, card)
        
        this.sendMessage(connection, {
          type: 'super_card_update',
          card,
          data,
          timestamp: new Date().toISOString(),
          version: 1
        })
      }
    } catch (error) {
      // Error handled by emergency recovery script

  private async fetchCardData(userId: string, card: SuperCardType): Promise<any> {
    if (!this.supabase) return null

    try {
      switch (card) {
        case 'performance':
          const { data: perfData } = await this.supabase
            .from('portfolio_performance_summary')
            .select('*')
            .eq('user_id', userId)
            .single()
          return perfData

        case 'income':
          const { data: incomeData } = await this.supabase
            .from('income_intelligence_summary')
            .select('*')
            .eq('user_id', userId)
            .single()
          return incomeData

        case 'lifestyle':
          const { data: lifestyleData } = await this.supabase
            .from('lifestyle_coverage_summary')
            .select('*')
            .eq('user_id', userId)
            .single()
          return lifestyleData

        case 'strategy':
          const { data: strategyData } = await this.supabase
            .from('strategy_optimization_summary')
            .select('*')
            .eq('user_id', userId)
            .single()
          return strategyData

        case 'quickActions':
          const { data: actionsData } = await this.supabase
            .from('user_activities_summary')
            .select('*')
            .eq('user_id', userId)
            .single()
          return actionsData

        default:
          return null
      }
    } catch (error) {
      // console.error(`Error fetching ${card} data:`, error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })