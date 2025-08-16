import { NextRequest } from 'next/server'

/**
 * Server-Sent Events API Route for Super Cards Real-Time Updates
 * Alternative to WebSocket for real-time data streaming
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const cards = searchParams.get('cards')?.split(',') || []

  if (!userId) {
    return new Response('Missing userId parameter', { status: 400 })
  }

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectionMessage = `data: ${JSON.stringify({
        type: 'connection',
        status: 'connected',
        userId,
        subscribedCards: cards,
        timestamp: new Date().toISOString()
      })}\n\n`
      
      controller.enqueue(new TextEncoder().encode(connectionMessage))

      // Set up interval for mock data (in production, this would be real data)
      const interval = setInterval(() => {
        try {
          // Send mock card updates
          const mockUpdate = {
            type: 'card_update',
            payload: {
              card: cards[Math.floor(Math.random() * cards.length)] || 'performance',
              data: {
                portfolioValue: 100000 + Math.random() * 10000,
                totalReturn: (Math.random() - 0.5) * 10,
                spyComparison: (Math.random() - 0.5) * 5,
                timestamp: new Date().toISOString()
              },
              timestamp: new Date().toISOString()
            }
          }

          const message = `data: ${JSON.stringify(mockUpdate)}\n\n`
          controller.enqueue(new TextEncoder().encode(message))

          // Occasionally send market updates
          if (Math.random() > 0.8) {
            const marketUpdate = {
              type: 'market_update',
              payload: {
                symbols: ['SPY', 'SCHD', 'VTI'],
                data: {
                  SPY: { price: 450 + Math.random() * 10, change: (Math.random() - 0.5) * 2 },
                  SCHD: { price: 75 + Math.random() * 5, change: (Math.random() - 0.5) * 1.5 },
                  VTI: { price: 240 + Math.random() * 10, change: (Math.random() - 0.5) * 2 }
                },
                timestamp: new Date().toISOString()
              }
            }

            const marketMessage = `data: ${JSON.stringify(marketUpdate)}\n\n`
            controller.enqueue(new TextEncoder().encode(marketMessage))
          }

          // Occasionally send dividend announcements
          if (Math.random() > 0.95) {
            const dividendUpdate = {
              type: 'dividend_announcement',
              payload: {
                symbol: 'SCHD',
                announcement: {
                  message: 'Quarterly dividend of $0.74 declared',
                  exDate: '2024-12-20',
                  payDate: '2024-12-27',
                  amount: 0.74
                },
                timestamp: new Date().toISOString()
              }
            }

            const dividendMessage = `data: ${JSON.stringify(dividendUpdate)}\n\n`
            controller.enqueue(new TextEncoder().encode(dividendMessage))
          }

        } catch (error) {
          console.error('SSE error:', error)
          controller.error(error)
        }
      }, 5000) // Update every 5 seconds

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          const ping = `data: ${JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          })}\n\n`
          
          controller.enqueue(new TextEncoder().encode(ping))
        } catch (error) {
          console.error('Heartbeat error:', error)
          clearInterval(heartbeat)
          clearInterval(interval)
          controller.error(error)
        }
      }, 30000)

      // Clean up on close
      const cleanup = () => {
        clearInterval(interval)
        clearInterval(heartbeat)
        try {
          controller.close()
        } catch (error) {
          // Controller might already be closed
        }
      }

      // Handle client disconnect
      request.signal.addEventListener('abort', cleanup)
      
      // Set up cleanup timer (close connection after 1 hour)
      setTimeout(cleanup, 60 * 60 * 1000)
    },

    cancel() {
      console.log('SSE connection cancelled for user:', userId)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    }
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control'
    }
  })
}