/**
 * Sync Status API Endpoint
 * Returns current sync status and connection information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-check';

import { syncOrchestrator } from '../../../../lib/services/sync/sync-orchestrator.service';
import { subscriptionService } from '../../../../lib/services/subscription/subscription.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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
          isEnabled: false,
          isPremium: false,
          upgradeUrl: '/subscription/upgrade',
          accountsConnected: 0,
          lastSync: null,
          nextSync: null,
          isSyncing: false,
          message: 'Premium subscription required for bank sync'
        },
        { status: 200 }
      );
    }

    // Get sync status from orchestrator
    const syncStatus = await syncOrchestrator.getSyncStatus(userId);

    // Get last few sync logs for history
    const syncHistory = await prisma.syncLog.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        syncType: true,
        status: true,
        startedAt: true,
        completedAt: true,
        itemsSynced: true,
        duration: true,
        errorMessage: true
      }
    });

    // Calculate next allowed manual sync
    const lastManualSync = await prisma.syncLog.findFirst({
      where: {
        userId,
        syncType: 'MANUAL'
      },
      orderBy: { startedAt: 'desc' }
    });

    const nextManualSync = lastManualSync 
      ? new Date(lastManualSync.startedAt.getTime() + 60 * 60 * 1000)
      : new Date();

    // Calculate next allowed login sync
    const lastLoginSync = await prisma.syncLog.findFirst({
      where: {
        userId,
        syncType: 'LOGIN'
      },
      orderBy: { startedAt: 'desc' }
    });

    const nextLoginSync = lastLoginSync 
      ? new Date(lastLoginSync.startedAt.getTime() + 4 * 60 * 60 * 1000)
      : new Date();

    // Check if sync can be performed now
    const canManualSync = nextManualSync <= new Date() && !syncStatus.isSyncing;
    const canLoginSync = nextLoginSync <= new Date() && !syncStatus.isSyncing;

    // Get connection details
    const connection = await prisma.yodleeConnection.findUnique({
      where: { userId },
      include: {
        syncedAccounts: {
          select: {
            id: true,
            accountName: true,
            accountType: true,
            institution: true,
            balance: true,
            currency: true,
            lastRefreshed: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json({
      isEnabled: syncStatus.isEnabled,
      isPremium: true,
      lastSync: syncStatus.lastSync,
      nextScheduledSync: syncStatus.nextSync,
      isSyncing: syncStatus.isSyncing,
      accountsConnected: syncStatus.accountsConnected,
      
      // Rate limit information
      canManualSync,
      canLoginSync,
      nextManualSync: nextManualSync.toISOString(),
      nextLoginSync: nextLoginSync.toISOString(),
      
      // Connection details
      connection: connection ? {
        id: connection.id,
        connectedAt: connection.createdAt,
        lastSyncedAt: connection.lastSyncedAt,
        accounts: connection.syncedAccounts
      } : null,
      
      // Sync history
      syncHistory: syncHistory.map(log => ({
        id: log.id,
        type: log.syncType,
        status: log.status,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
        itemsSynced: log.itemsSynced,
        duration: log.duration,
        error: log.errorMessage
      })),
      
      // Summary stats
      stats: {
        totalSyncs: syncHistory.length,
        successfulSyncs: syncHistory.filter(log => log.status === 'SUCCESS').length,
        failedSyncs: syncHistory.filter(log => log.status === 'FAILED').length,
        averageDuration: syncHistory.length > 0 
          ? Math.round(syncHistory.filter(log => log.duration).reduce((sum, log) => sum + (log.duration || 0), 0) / syncHistory.filter(log => log.duration).length)
          : 0,
        totalItemsSynced: syncHistory.reduce((sum, log) => sum + (log.itemsSynced || 0), 0)
      }
    });

  } catch (error) {
    console.error('Sync status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get sync status',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}