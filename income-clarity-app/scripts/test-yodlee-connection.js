#!/usr/bin/env node

/**
 * Test Yodlee API Connection
 * Verifies that the Yodlee credentials are working correctly
 */

require('dotenv').config();

async function testYodleeConnection() {
  console.log('🔍 Testing Yodlee Connection...\n');
  
  // Check environment variables
  const requiredVars = [
    'YODLEE_API_URL',
    'YODLEE_CLIENT_ID',
    'YODLEE_ADMIN_LOGIN',
  ];
  
  console.log('📋 Checking environment variables:');
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing: ${varName}`);
      process.exit(1);
    }
    console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
  }
  
  console.log('\n🔐 Attempting to authenticate with Yodlee...');
  
  try {
    // Test authentication - Client credentials with loginName header
    const bodyData = new URLSearchParams();
    bodyData.append('clientId', process.env.YODLEE_CLIENT_ID);
    bodyData.append('secret', process.env.YODLEE_CLIENT_SECRET);
    
    console.log('Request body (clientId):', process.env.YODLEE_CLIENT_ID.substring(0, 20) + '...');
    console.log('Request body (secret):', process.env.YODLEE_CLIENT_SECRET ? 'PROVIDED' : 'MISSING');
    
    const authResponse = await fetch(`${process.env.YODLEE_API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': '1.1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': process.env.YODLEE_ADMIN_LOGIN,
      },
      body: bodyData.toString(),
    });
    
    console.log(`Response Status: ${authResponse.status} ${authResponse.statusText}`);
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Authentication failed:', errorText);
      return;
    }
    
    const authData = await authResponse.json();
    console.log('✅ Authentication successful!');
    console.log('Token received:', authData.token.accessToken.substring(0, 20) + '...');
    console.log('Token expires in:', authData.token.expiresIn, 'seconds');
    
    // Test getting API info
    console.log('\n📊 Testing API Info endpoint...');
    const infoResponse = await fetch(`${process.env.YODLEE_API_URL}/apiKey`, {
      method: 'GET',
      headers: {
        'Api-Version': '1.1',
        'Authorization': `Bearer ${authData.token.accessToken}`,
      },
    });
    
    if (infoResponse.ok) {
      const infoData = await infoResponse.json();
      console.log('✅ API Info retrieved successfully');
      console.log('API Keys:', JSON.stringify(infoData, null, 2));
    } else {
      console.log('⚠️ Could not retrieve API info (this is normal for sandbox)');
    }
    
    // Use existing test user for sandbox
    console.log('\n👤 Using test user:', process.env.YODLEE_TEST_USER);
    
    // Get user token for test user
    console.log('\n🎫 Getting user access token...');
    const userTokenResponse = await fetch(`${process.env.YODLEE_API_URL}/user/accessTokens`, {
      method: 'POST',
      headers: {
        'Api-Version': '1.1',
        'Authorization': `Bearer ${authData.token.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': process.env.YODLEE_TEST_USER,
      },
      body: new URLSearchParams({
        appIds: '10003600', // FastLink app ID
      }),
    });
    
    if (userTokenResponse.ok) {
      const tokenData = await userTokenResponse.json();
      console.log('✅ User token obtained');
      console.log('User Access Token:', tokenData.user.accessTokens[0].value.substring(0, 20) + '...');
      
      // Test getting accounts for the user
      console.log('\n💳 Getting user accounts...');
      const accountsResponse = await fetch(`${process.env.YODLEE_API_URL}/accounts`, {
        method: 'GET',
        headers: {
          'Api-Version': '1.1',
          'Authorization': `Bearer ${tokenData.user.accessTokens[0].value}`,
        },
      });
      
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        console.log('✅ Accounts retrieved');
        if (accountsData.account && accountsData.account.length > 0) {
          console.log(`Found ${accountsData.account.length} account(s):`);
          accountsData.account.forEach(acc => {
            console.log(`  - ${acc.accountName} (${acc.accountType}): $${acc.balance?.amount || 0}`);
          });
        } else {
          console.log('No accounts linked yet (this is normal for new users)');
        }
      } else {
        console.log('⚠️ Could not get accounts:', await accountsResponse.text());
      }
      
    } else {
      const errorText = await userTokenResponse.text();
      console.log('⚠️ Could not get user token:', errorText);
    }
    
    console.log('\n✨ Yodlee connection test complete!');
    console.log('\n📝 Summary:');
    console.log('- Environment: Sandbox');
    console.log('- API URL:', process.env.YODLEE_API_URL);
    console.log('- FastLink URL:', process.env.YODLEE_FASTLINK_URL);
    console.log('- Authentication: ✅ Working');
    console.log('\n🚀 Ready to integrate with Income Clarity!');
    
  } catch (error) {
    console.error('❌ Error testing Yodlee connection:', error);
    process.exit(1);
  }
}

// Run the test
testYodleeConnection();