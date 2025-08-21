#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        sessions: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (user && user.sessions.length > 0) {
      console.log(`Session Token: ${user.sessions[0].sessionToken}`);
      console.log(`Expires At: ${user.sessions[0].expiresAt}`);
    } else {
      console.log('No active session found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();