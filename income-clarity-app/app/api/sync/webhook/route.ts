/**
 * Yodlee Webhook API Endpoint
 * Handles real-time notifications from Yodlee when account data changes
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncOrchestrator, SyncType } from '../../../../lib/services/sync/sync-orchestrator.service';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Yodlee webhook events we care about
const SUPPORTED_EVENTS = [
  'REFRESH_COMPLETED',
  'ACCOUNT_UPDATED', 
  'HOLDINGS_UPDATED',
  'TRANSACTIONS_UPDATED',
  'REFRESH_FAILED'
];

interface YodleeWebhookPayload {
  event: string;
  loginName: string;
  data: {
    user?: {
      id: string;
      loginName: string;
    };
    account?: {
      id: string;
      accountName: string;
      accountType: string;
    };
    providerAccount?: {
      id: string;
      providerId: string;
      refreshInfo?: {
        status: string;
        statusCode: string;
        statusMessage: string;
        lastRefreshed: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload: YodleeWebhookPayload = JSON.parse(body);

    // Verify webhook signature (if configured)
    const signature = request.headers.get('yodlee-webhook-signature');
    if (process.env.YODLEE_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.YODLEE_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.warn('Invalid webhook signature:', signature);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Log webhook event
    console.log('Yodlee webhook received:', {
      event: payload.event,
      loginName: payload.loginName,
      timestamp: new Date().toISOString()
    });

    // Check if this is a supported event
    if (!SUPPORTED_EVENTS.includes(payload.event)) {
      console.log('Unsupported webhook event:', payload.event);
      return NextResponse.json(
        { message: 'Event not processed', event: payload.event },
        { status: 200 }
      );
    }

    // Find user by Yodlee connection
    const connection = await prisma.yodleeConnection.findFirst({
      where: {
        OR: [
          { yodleeUserId: payload.data.user?.id },
          { yodleeUserId: payload.loginName }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            subscription: {
              select: {
                plan: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!connection) {
      console.warn('No connection found for webhook:', payload.loginName);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is premium
    const isPremium = connection.user.subscription?.status === 'ACTIVE';
    if (!isPremium) {
      console.log('Webhook for non-premium user:', connection.user.email);
      return NextResponse.json(
        { message: 'User not premium' },
        { status: 200 }
      );
    }

    // Log webhook to database
    await prisma.webhookLog.create({
      data: {
        userId: connection.userId,
        event: payload.event,
        loginName: payload.loginName,
        payload: JSON.stringify(payload),
        processedAt: new Date()
      }
    });

    // Handle different event types
    switch (payload.event) {
      case 'REFRESH_COMPLETED':
        // Account refresh completed successfully - trigger sync
        await handleRefreshCompleted(connection.userId, payload);
        break;
        
      case 'ACCOUNT_UPDATED':
        // Account details changed - trigger sync
        await handleAccountUpdated(connection.userId, payload);
        break;
        
      case 'HOLDINGS_UPDATED':
        // Investment holdings changed - trigger sync
        await handleHoldingsUpdated(connection.userId, payload);
        break;
        
      case 'TRANSACTIONS_UPDATED':
        // New transactions available - trigger sync
        await handleTransactionsUpdated(connection.userId, payload);
        break;
        
      case 'REFRESH_FAILED':
        // Account refresh failed - log error
        await handleRefreshFailed(connection.userId, payload);
        break;
        
      default:
        console.log('Unhandled webhook event:', payload.event);
    }

    return NextResponse.json(
      { 
        message: 'Webhook processed successfully',
        event: payload.event,
        user: connection.user.email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log webhook error to database if possible
    try {
      await prisma.webhookLog.create({
        data: {
          userId: 'unknown',
          event: 'ERROR',
          loginName: 'unknown',
          payload: JSON.stringify({ error: error.message }),
          processedAt: new Date()
        }
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle refresh completed webhook
 */
async function handleRefreshCompleted(userId: string, payload: YodleeWebhookPayload) {
  console.log('Processing refresh completed webhook for user:', userId);
  
  // Trigger sync with webhook type (no rate limiting)
  const syncResult = await syncOrchestrator.performSync(userId, SyncType.WEBHOOK);
  
  console.log('Webhook sync result:', {
    success: syncResult.success,
    itemsSynced: syncResult.itemsSynced,
    errors: syncResult.errors
  });
}

/**
 * Handle account updated webhook
 */
async function handleAccountUpdated(userId: string, payload: YodleeWebhookPayload) {
  console.log('Processing account updated webhook for user:', userId);
  
  // Trigger sync to get updated account info
  await syncOrchestrator.performSync(userId, SyncType.WEBHOOK);
}

/**
 * Handle holdings updated webhook
 */
async function handleHoldingsUpdated(userId: string, payload: YodleeWebhookPayload) {
  console.log('Processing holdings updated webhook for user:', userId);
  
  // Trigger sync to get updated holdings
  await syncOrchestrator.performSync(userId, SyncType.WEBHOOK);
}

/**
 * Handle transactions updated webhook
 */
async function handleTransactionsUpdated(userId: string, payload: YodleeWebhookPayload) {
  console.log('Processing transactions updated webhook for user:', userId);
  
  // Trigger sync to get new transactions
  await syncOrchestrator.performSync(userId, SyncType.WEBHOOK);
}

/**
 * Handle refresh failed webhook
 */
async function handleRefreshFailed(userId: string, payload: YodleeWebhookPayload) {
  console.error('Refresh failed webhook for user:', userId, payload.data);
  
  // Log the failure but don't trigger sync
  const errorMessage = payload.data.providerAccount?.refreshInfo?.statusMessage || 'Refresh failed';
  
  // Create a failed sync log entry
  await prisma.syncLog.create({
    data: {
      userId,
      syncType: SyncType.WEBHOOK,
      status: 'FAILED',
      errorMessage,
      startedAt: new Date(),
      completedAt: new Date(),
      itemsSynced: 0
    }
  });
}

// OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, yodlee-webhook-signature',
    },
  });
}