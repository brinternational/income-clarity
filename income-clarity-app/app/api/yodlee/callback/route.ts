import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-check';

import { prisma } from '@/lib/prisma';
import { yodleeSyncService } from '@/lib/services/yodlee/yodlee-sync.service';
import { Logger } from '@/lib/logger';

const logger = new Logger('API:Yodlee:Callback');

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

    // Get request body
    const body = await request.json();
    const { accounts, status, providerAccountId } = body;

    logger.info(`Yodlee callback received: status=${status}, accounts=${accounts?.length || 0}`);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { yodleeConnection: true },
    });

    if (!user || !user.yodleeConnection) {
      return NextResponse.json(
        { error: 'No Yodlee connection found' },
        { status: 404 }
      );
    }

    // Update connection status
    await prisma.yodleeConnection.update({
      where: { userId: user.id },
      data: {
        lastSyncedAt: new Date(),
        isActive: true,
      },
    });

    // Trigger data sync
    if (status === 'SUCCESS' && accounts?.length > 0) {
      // Sync data asynchronously
      yodleeSyncService.syncUserData(user.id).catch(error => {
        logger.error('Failed to sync user data after callback', error);
      });

      return NextResponse.json({
        success: true,
        message: `Successfully linked ${accounts.length} account(s)`,
        accountsLinked: accounts.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed',
    });
  } catch (error: any) {
    logger.error('Failed to process Yodlee callback', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}