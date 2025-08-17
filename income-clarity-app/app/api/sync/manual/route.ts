/**
 * Manual Sync API Endpoint
 * Handles user-initiated sync requests with rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-check';

import { syncOrchestrator, SyncType } from '../../../../lib/services/sync/sync-orchestrator.service';
import { subscriptionService } from '../../../../lib/services/subscription/subscription.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = authUser.id;

    // Check premium status
    const isPremium = await subscriptionService.isPremiumUser(userId);
    if (!isPremium) {
      return NextResponse.json(
        { 
          error: 'Premium subscription required',
          upgradeUrl: '/subscription/upgrade'
        },
        { status: 403 }
      );
    }

    // Check if user has Yodlee connection
    const connection = await prisma.yodleeConnection.findUnique({
      where: { userId },
      include: { syncedAccounts: true }
    });

    if (!connection) {
      return NextResponse.json(
        { 
          error: 'No bank accounts connected',
          connectUrl: '/dashboard/settings/connections'
        },
        { status: 400 }
      );
    }

    // Check rate limit for manual sync (1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSync = await prisma.syncLog.findFirst({
      where: {
        userId,
        syncType: SyncType.MANUAL,
        startedAt: {
          gte: oneHourAgo
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    if (recentSync) {
      const nextAllowedSync = new Date(recentSync.startedAt.getTime() + 60 * 60 * 1000);
      const timeRemaining = Math.ceil((nextAllowedSync.getTime() - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          nextAllowedSync: nextAllowedSync.toISOString(),
          timeRemaining
        },
        { status: 429 }
      );
    }

    // Check if sync is already in progress
    const activeSyncLog = await prisma.syncLog.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      orderBy: { startedAt: 'desc' }
    });

    if (activeSyncLog) {
      return NextResponse.json(
        {
          error: 'Sync already in progress',
          syncId: activeSyncLog.id,
          startedAt: activeSyncLog.startedAt
        },
        { status: 409 }
      );
    }

    // Start sync (this will run async)
    const syncResult = await syncOrchestrator.performSync(userId, SyncType.MANUAL);

    // Generate sync ID for tracking
    const syncId = `manual-${userId}-${Date.now()}`;

    return NextResponse.json(
      {
        success: syncResult.success,
        syncId,
        itemsSynced: syncResult.itemsSynced,
        accounts: syncResult.accounts,
        holdings: syncResult.holdings,
        transactions: syncResult.transactions,
        nextAllowedSync: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        errors: syncResult.errors
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Manual sync error:', error);
    
    // Return specific error messages for common issues
    if (error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    
    if (error.message.includes('No Yodlee connection')) {
      return NextResponse.json(
        { 
          error: 'Bank connection not found',
          connectUrl: '/dashboard/settings/connections'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Sync failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}