import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { syncOrchestrator } from '@/lib/services/sync/sync-orchestrator.service';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token' },
        { status: 401 }
      );
    }

    // Find session with user
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({
          where: { id: session.id }
        });
      }

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Trigger login sync in background if needed
    // This runs async and doesn't block the response
    syncOrchestrator.syncOnLogin(session.user.id).catch(error => {
      logger.error('Login sync error:', error);
    });

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        onboarding_completed: session.user.onboarding_completed,
        createdAt: session.user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}