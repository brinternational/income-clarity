#!/usr/bin/env node

// Test authentication flow
const baseUrl = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  // Test 1: Login with test user
  console.log('1️⃣ Testing login...');
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('   User:', loginData.user);
      
      // Extract cookie for next requests
      const cookies = loginResponse.headers.get('set-cookie');
      
      // Test 2: Get current user
      console.log('\n2️⃣ Testing session check...');
      const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      const meData = await meResponse.json();
      
      if (meResponse.ok) {
        console.log('✅ Session valid!');
        console.log('   User ID:', meData.id);
        console.log('   Email:', meData.email);
      } else {
        console.log('❌ Session check failed:', meData.error);
      }
      
      // Test 3: Logout
      console.log('\n3️⃣ Testing logout...');
      const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      if (logoutResponse.ok) {
        console.log('✅ Logout successful!');
      } else {
        console.log('❌ Logout failed');
      }
      
      // Test 4: Verify session is gone
      console.log('\n4️⃣ Verifying session cleared...');
      const verifyResponse = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      if (verifyResponse.status === 401) {
        console.log('✅ Session properly cleared!');
      } else {
        console.log('⚠️ Session might not be properly cleared');
      }
      
    } else {
      console.log('❌ Login failed:', loginData.error);
      console.log('\n⚠️ Make sure test user exists. Run:');
      console.log('   node scripts/seed-test-user.js');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n⚠️ Make sure the server is running:');
    console.log('   npm run dev');
  }
  
  console.log('\n✨ Authentication test complete!');
}

// Run the test
testAuth();