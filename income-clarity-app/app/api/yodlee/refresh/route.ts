import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-check';

import { prisma } from '@/lib/prisma';
import { yodleeSyncService } from '@/lib/services/yodlee/yodlee-sync.service';
import { Logger } from '@/lib/logger';

const logger = new Logger('API:Yodlee:Refresh');

export async function POST(request: Request) {
  try {
    // Check authentication
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has Yodlee connection
    const hasConnection = await yodleeSyncService.hasYodleeConnection(user.id);
    if (!hasConnection) {
      return NextResponse.json(
        { error: 'No Yodlee connection found. Please connect your accounts first.' },
        { status: 400 }
      );
    }

    // Get last sync time
    const lastSyncTime = await yodleeSyncService.getLastSyncTime(user.id);
    
    // Check if recently synced (within last 5 minutes)
    if (lastSyncTime && Date.now() - lastSyncTime.getTime() < 5 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        message: 'Data was recently synced',
        lastSyncTime,
      });
    }

    // Trigger sync (async)
    yodleeSyncService.syncUserData(user.id).catch(error => {
      logger.error('Failed to sync user data', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Data refresh initiated',
      lastSyncTime,
    });
  } catch (error: any) {
    logger.error('Failed to refresh data', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}