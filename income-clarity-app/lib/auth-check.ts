// Simple auth check utility to replace next-auth dependencies
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session-token');
    
    if (!sessionCookie) {
      return null;
    }

    // Find session in database using sessionToken (not id)
    const session = await prisma.session.findUnique({
      where: { sessionToken: sessionCookie.value },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return user;
}