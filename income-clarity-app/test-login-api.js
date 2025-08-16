#!/usr/bin/env node

/**
 * Test script to validate login API with production database
 * This ensures the authentication flow works before deploying
 */

const { PrismaClient } = require('./lib/generated/prisma');
const bcrypt = require('bcryptjs');

async function testLoginFlow() {
  console.log('🔐 Testing Login API Flow...');
  
  const prisma = new PrismaClient();

  try {
    // Test 1: Database connectivity
    console.log('\n1️⃣ Testing database connectivity...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test 2: Verify test user exists
    console.log('\n2️⃣ Verifying test user exists...');
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    console.log('✅ Test user found:', user.email);
    console.log('   User ID:', user.id);
    console.log('   Onboarding completed:', user.onboarding_completed);

    // Test 3: Verify password hash
    console.log('\n3️⃣ Testing password verification...');
    const testPassword = 'password123';
    const isValidPassword = await bcrypt.compare(testPassword, user.passwordHash);
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      console.log('   Stored hash:', user.passwordHash);
      return;
    }
    console.log('✅ Password verification successful');

    // Test 4: Test session creation
    console.log('\n4️⃣ Testing session creation...');
    const sessionToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt
      }
    });

    console.log('✅ Session created successfully');
    console.log('   Session ID:', session.id);
    console.log('   Session Token:', sessionToken.substring(0, 16) + '...');
    console.log('   Expires:', expiresAt.toISOString());

    // Test 5: Clean up test session
    console.log('\n5️⃣ Cleaning up test session...');
    await prisma.session.delete({
      where: { id: session.id }
    });
    console.log('✅ Test session deleted');

    console.log('\n🎉 ALL TESTS PASSED! Login API should work in production.');
    console.log('\nTest Results Summary:');
    console.log('✅ Database connectivity: PASS');
    console.log('✅ Test user exists: PASS');
    console.log('✅ Password verification: PASS');
    console.log('✅ Session creation: PASS');
    console.log('✅ Session cleanup: PASS');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nError details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    if (error.stack) {
      console.error('  Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the test
if (require.main === module) {
  testLoginFlow()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed with error:', error);
      process.exit(1);
    });
}

module.exports = { testLoginFlow };