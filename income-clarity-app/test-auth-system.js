/**
 * Authentication System Test
 * Tests the complete authentication flow for Income Clarity app
 * 
 * Usage: node test-auth-system.js
 * Make sure the server is running on localhost:3000
 */

const http = require('http');

async function makeRequest(options, data = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: 'Request timeout' });
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAuthSystem() {
  console.log('🧪 Income Clarity Authentication System Test');
  console.log('=' .repeat(50));

  const testResults = {
    login: false,
    sessionValidation: false,
    logout: false
  };

  // Test 1: Login
  console.log('\n1. Testing Login...');
  const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  });

  const loginResult = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }, loginData);

  if (loginResult.error) {
    console.log('❌ Login request failed:', loginResult.error);
    return testResults;
  }

  if (loginResult.status === 200) {
    const sessionCookie = loginResult.headers['set-cookie']?.[0];
    const sessionToken = sessionCookie?.match(/session-token=([^;]+)/)?.[1];
    
    console.log('✅ Login successful');
    console.log(`   User: ${loginResult.body.user.email}`);
    console.log(`   Session token: ${sessionToken?.substring(0, 20)}...`);
    testResults.login = true;

    // Test 2: Session Validation
    console.log('\n2. Testing Session Validation...');
    const meResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Cookie': `session-token=${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (meResult.error) {
      console.log('❌ Session validation failed:', meResult.error);
    } else if (meResult.status === 200) {
      console.log('✅ Session validation successful');
      console.log(`   Authenticated user: ${meResult.body.user.email}`);
      testResults.sessionValidation = true;
    } else {
      console.log('❌ Session validation failed:', meResult.body.error);
    }

    // Test 3: Logout
    console.log('\n3. Testing Logout...');
    const logoutResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Cookie': `session-token=${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (logoutResult.error) {
      console.log('❌ Logout request failed:', logoutResult.error);
    } else if (logoutResult.status === 200) {
      console.log('✅ Logout successful');
      testResults.logout = true;
    } else {
      console.log('❌ Logout failed:', logoutResult.body?.error || 'Unknown error');
    }

  } else {
    console.log('❌ Login failed:', loginResult.body.error);
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Login:              ${testResults.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Session Validation: ${testResults.sessionValidation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Logout:             ${testResults.logout ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(testResults).every(result => result === true);
  console.log(`\n🎯 Overall Status:  ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Authentication system is working correctly!');
    console.log('   - Database connection: Working');
    console.log('   - Test user exists: Yes (test@example.com)');
    console.log('   - Login endpoint: Working');
    console.log('   - Session management: Working');
    console.log('   - Logout endpoint: Working');
  } else {
    console.log('\n⚠️  Some authentication features need attention.');
  }

  return testResults;
}

// Run the test
testAuthSystem().catch(console.error);