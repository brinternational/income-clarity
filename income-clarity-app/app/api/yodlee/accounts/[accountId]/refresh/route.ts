import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-check';

import { prisma } from '@/lib/prisma';
import { yodleeSyncService } from '@/lib/services/yodlee/yodlee-sync.service';
import { Logger } from '@/lib/logger';

const logger = new Logger('API:Yodlee:AccountRefresh');

interface Params {
  params: {
    accountId: string;
  };
}

// POST /api/yodlee/accounts/[accountId]/refresh - Refresh a specific account
export async function POST(request: Request, { params }: Params) {
  try {
    const { accountId } = params;
    
    // Check authentication
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user and verify ownership
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        yodleeConnection: {
          include: {
            syncedAccounts: true,
          },
        },
      },
    });

    if (!user || !user.yodleeConnection) {
      return NextResponse.json(
        { error: 'No Yodlee connection found' },
        { status: 404 }
      );
    }

    // Find the account
    const account = user.yodleeConnection.syncedAccounts.find(
      acc => acc.id === accountId
    );

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Trigger account refresh
    await yodleeSyncService.refreshAccount(user.id, account.yodleeAccountId);

    // Update last refreshed timestamp
    await prisma.syncedAccount.update({
      where: { id: accountId },
      data: {
        lastRefreshed: new Date(),
      },
    });

    logger.info(`Account ${accountId} refresh initiated`);

    return NextResponse.json({
      success: true,
      message: 'Account refresh initiated',
      accountId,
    });
  } catch (error: any) {
    logger.error('Failed to refresh account', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}