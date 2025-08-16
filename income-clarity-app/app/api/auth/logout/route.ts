import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (sessionToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { sessionToken }
      });
    }

    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // Clear session cookie
    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    logger.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}