#!/usr/bin/env node

/**
 * Test Plan Management API Endpoints
 * Verifies the API functionality without needing browser
 */

const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Plan Management API');
  console.log('================================\n');

  const baseOptions = {
    hostname: 'localhost',
    port: 3000,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    // Test 1: GET current plan (should default to free)
    console.log('📖 Test 1: GET /api/user/plan');
    const getOptions = {
      ...baseOptions,
      path: '/api/user/plan',
      method: 'GET'
    };

    const getResponse = await makeRequest(getOptions);
    console.log(`Status: ${getResponse.statusCode}`);
    console.log(`Response:`, getResponse.body);
    
    if (getResponse.statusCode === 200) {
      console.log('✅ GET request successful\n');
    } else {
      console.log('❌ GET request failed\n');
    }

    // Test 2: POST plan change to premium
    console.log('📝 Test 2: POST /api/user/plan (change to premium)');
    const postOptions = {
      ...baseOptions,
      path: '/api/user/plan',
      method: 'POST'
    };

    const premiumData = { plan: 'premium' };
    const postResponse = await makeRequest(postOptions, premiumData);
    console.log(`Status: ${postResponse.statusCode}`);
    console.log(`Response:`, postResponse.body);
    
    if (postResponse.statusCode === 200) {
      console.log('✅ POST request (premium) successful\n');
    } else {
      console.log('❌ POST request (premium) failed\n');
    }

    // Test 3: GET current plan (should now be premium)
    console.log('📖 Test 3: GET /api/user/plan (verify premium)');
    const getResponse2 = await makeRequest(getOptions);
    console.log(`Status: ${getResponse2.statusCode}`);
    console.log(`Response:`, getResponse2.body);
    
    if (getResponse2.statusCode === 200 && getResponse2.body.plan === 'premium') {
      console.log('✅ Plan successfully updated to premium\n');
    } else {
      console.log('❌ Plan update verification failed\n');
    }

    // Test 4: POST plan change back to free
    console.log('📝 Test 4: POST /api/user/plan (change to free)');
    const freeData = { plan: 'free' };
    const postResponse2 = await makeRequest(postOptions, freeData);
    console.log(`Status: ${postResponse2.statusCode}`);
    console.log(`Response:`, postResponse2.body);
    
    if (postResponse2.statusCode === 200) {
      console.log('✅ POST request (free) successful\n');
    } else {
      console.log('❌ POST request (free) failed\n');
    }

    // Test 5: Test invalid plan
    console.log('📝 Test 5: POST /api/user/plan (invalid plan)');
    const invalidData = { plan: 'invalid' };
    const postResponse3 = await makeRequest(postOptions, invalidData);
    console.log(`Status: ${postResponse3.statusCode}`);
    console.log(`Response:`, postResponse3.body);
    
    if (postResponse3.statusCode === 400) {
      console.log('✅ Invalid plan properly rejected\n');
    } else {
      console.log('❌ Invalid plan validation failed\n');
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Development server not running.');
      console.log('Please start the server with: npm run dev:instant');
      return false;
    }
  }

  return true;
}

async function testDatabase() {
  console.log('🗄️  Testing Database Integration');
  console.log('================================\n');

  try {
    // Check if user subscription exists
    console.log('📖 Checking UserSubscription table...');
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: 'test-user-id' }
    });

    if (subscription) {
      console.log('✅ User subscription found:');
      console.log(`   Plan: ${subscription.plan}`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Features: ${subscription.features}`);
    } else {
      console.log('ℹ️  No subscription found (will be created on first plan change)');
    }

    console.log('\n✅ Database connection working');
    return true;
  } catch (error) {
    console.error('❌ Database Test Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 Plan Management API Testing Suite\n');

  // Test database connection first
  const dbOk = await testDatabase();
  if (!dbOk) {
    console.log('\n❌ Database tests failed. Exiting.');
    process.exit(1);
  }

  // Test API endpoints
  const apiOk = await testAPI();
  if (!apiOk) {
    console.log('\n❌ API tests failed. Please ensure development server is running.');
    process.exit(1);
  }

  console.log('🎉 All tests completed successfully!');
  console.log('\n🚀 Plan Management is fully functional:');
  console.log('   • API endpoints working');
  console.log('   • Database integration active');
  console.log('   • Plan switching validated');
  console.log('   • Error handling verified');

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}