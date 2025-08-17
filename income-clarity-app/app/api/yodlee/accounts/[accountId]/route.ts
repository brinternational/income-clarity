import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-check';

import { prisma } from '@/lib/prisma';
import { yodleeClient } from '@/lib/services/yodlee/yodlee-client.service';
import { yodleeSyncService } from '@/lib/services/yodlee/yodlee-sync.service';
import { Logger } from '@/lib/logger';

const logger = new Logger('API:Yodlee:Account');

interface Params {
  params: {
    accountId: string;
  };
}

// DELETE /api/yodlee/accounts/[accountId] - Disconnect an account
export async function DELETE(request: Request, { params }: Params) {
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

    // Delete from Yodlee
    try {
      const userToken = await yodleeClient.getUserToken(user.yodleeConnection.yodleeUserId);
      await yodleeClient.deleteAccount(userToken, account.yodleeAccountId);
    } catch (error) {
      logger.error('Failed to delete account from Yodlee', error);
      // Continue with local deletion even if Yodlee deletion fails
    }

    // Delete from database
    await prisma.syncedAccount.delete({
      where: { id: accountId },
    });

    logger.info(`Account ${accountId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully',
    });
  } catch (error: any) {
    logger.error('Failed to delete account', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}