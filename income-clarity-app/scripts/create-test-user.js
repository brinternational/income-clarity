const { PrismaClient } = require('../lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('Test user already exists with email: test@example.com');
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash: hashedPassword }
      });
      
      console.log('Updated test user password to: password123');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create the test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: hashedPassword
      }
    });

    console.log('Test user created successfully:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('User ID:', user.id);

    // Create default user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: 'light',
        currency: 'USD',
        locale: 'en-US',
        timezone: 'America/New_York'
      }
    });

    // Create default tax profile
    await prisma.taxProfile.create({
      data: {
        userId: user.id,
        state: 'PR', // Puerto Rico
        filingStatus: 'single',
        federalBracket: 0.22,
        stateBracket: 0.0,
        qualifiedDividendRate: 0.0, // 0% in Puerto Rico
        capitalGainsRate: 0.0,
        effectiveRate: 0.20,
        marginalRate: 0.22,
        taxYear: 2024
      }
    });

    console.log('Test user setup completed with default settings and tax profile');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();