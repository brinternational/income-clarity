const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function getTestUserId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (user) {
      console.log('Test user found:');
      console.log('Email:', user.email);
      console.log('User ID:', user.id);
      return user.id;
    } else {
      console.log('Test user not found. Run: node scripts/create-test-user.js');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTestUserId();