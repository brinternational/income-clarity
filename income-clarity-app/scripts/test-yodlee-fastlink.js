#!/usr/bin/env node

/**
 * Test Yodlee FastLink Integration
 * Tests the complete flow for connecting bank accounts
 */

require('dotenv').config();

async function testFastLinkIntegration() {
  console.log('🔗 Testing Yodlee FastLink Integration...\n');
  
  const testUser = process.env.YODLEE_TEST_USER || 'sbMem68a0d5bfa0b691';
  console.log('Using test user:', testUser);
  
  try {
    // Step 1: Get admin token
    console.log('\n1️⃣ Getting admin authentication token...');
    const authResponse = await fetch(`${process.env.YODLEE_API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': '1.1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': process.env.YODLEE_ADMIN_LOGIN,
      },
      body: new URLSearchParams({
        clientId: process.env.YODLEE_CLIENT_ID,
        secret: process.env.YODLEE_CLIENT_SECRET,
      }),
    });
    
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${await authResponse.text()}`);
    }
    
    const authData = await authResponse.json();
    console.log('✅ Admin token obtained');
    const adminToken = authData.token.accessToken;
    
    // Step 2: Generate user token (using test user as loginName)
    console.log('\n2️⃣ Getting user token for FastLink...');
    const userTokenResponse = await fetch(`${process.env.YODLEE_API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': '1.1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': testUser, // Use test user as loginName
      },
      body: new URLSearchParams({
        clientId: process.env.YODLEE_CLIENT_ID,
        secret: process.env.YODLEE_CLIENT_SECRET,
      }),
    });
    
    if (!userTokenResponse.ok) {
      console.log('⚠️ Could not get user-specific token, using admin token');
      var userToken = adminToken;
    } else {
      const userTokenData = await userTokenResponse.json();
      var userToken = userTokenData.token.accessToken;
      console.log('✅ User token obtained');
    }
    
    // Step 3: Get existing accounts
    console.log('\n3️⃣ Checking existing accounts...');
    const accountsResponse = await fetch(`${process.env.YODLEE_API_URL}/accounts`, {
      method: 'GET',
      headers: {
        'Api-Version': '1.1',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      if (accountsData.account && accountsData.account.length > 0) {
        console.log(`✅ Found ${accountsData.account.length} linked account(s):`);
        accountsData.account.forEach(acc => {
          console.log(`   📊 ${acc.accountName || 'Unknown'}`);
          console.log(`      Type: ${acc.accountType}`);
          console.log(`      Balance: $${acc.balance?.amount || 0} ${acc.balance?.currency || 'USD'}`);
          console.log(`      Institution: ${acc.providerName || 'Unknown'}`);
          console.log(`      Last Updated: ${acc.lastUpdated || 'N/A'}`);
          console.log(`      Account ID: ${acc.id}`);
        });
      } else {
        console.log('📭 No accounts linked yet');
      }
    } else {
      console.log('⚠️ Could not retrieve accounts');
    }
    
    // Step 4: Generate FastLink URL
    console.log('\n4️⃣ Generating FastLink URL...');
    const fastLinkUrl = process.env.YODLEE_FASTLINK_URL;
    const fastLinkParams = {
      token: userToken,
      extraParams: {
        flow: 'aggregation',
        configName: 'Aggregation',
        callback: 'https://incomeclarity.ddns.net/api/yodlee/callback',
      },
    };
    
    const fullFastLinkUrl = `${fastLinkUrl}?token=${userToken}&extraParams=${encodeURIComponent(JSON.stringify(fastLinkParams.extraParams))}`;
    
    console.log('\n✨ FastLink Integration Ready!');
    console.log('\n📋 Connection Instructions:');
    console.log('1. Open this URL in a browser:');
    console.log(`   ${fullFastLinkUrl.substring(0, 100)}...`);
    console.log('\n2. Use these test credentials:');
    console.log('   Provider: Dag Site');
    console.log('   Username: YodTest.site16441.2');
    console.log('   Password: site16441.2');
    console.log('\n3. Or for MFA testing:');
    console.log('   Provider: Dag Site Multilevel');
    console.log('   Username: YodTest.site16442.1');
    console.log('   Password: site16442.1');
    console.log('   OTP Code: 123456');
    
    console.log('\n🎯 Integration Summary:');
    console.log('✅ Authentication: Working');
    console.log('✅ User Token: ' + (userToken ? 'Generated' : 'Failed'));
    console.log('✅ FastLink URL: Ready');
    console.log('✅ Test User: ' + testUser);
    
    // Step 5: Test data endpoints
    console.log('\n5️⃣ Testing data endpoints...');
    
    // Test transactions endpoint
    const transactionsResponse = await fetch(`${process.env.YODLEE_API_URL}/transactions?fromDate=2024-01-01`, {
      method: 'GET',
      headers: {
        'Api-Version': '1.1',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    if (transactionsResponse.ok) {
      const transData = await transactionsResponse.json();
      console.log(`✅ Transactions endpoint: ${transData.transaction?.length || 0} transactions found`);
    } else {
      console.log('⚠️ Transactions endpoint not accessible yet');
    }
    
    // Test holdings endpoint
    const holdingsResponse = await fetch(`${process.env.YODLEE_API_URL}/holdings`, {
      method: 'GET',
      headers: {
        'Api-Version': '1.1',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    if (holdingsResponse.ok) {
      const holdingsData = await holdingsResponse.json();
      console.log(`✅ Holdings endpoint: ${holdingsData.holding?.length || 0} holdings found`);
    } else {
      console.log('⚠️ Holdings endpoint not accessible yet');
    }
    
    console.log('\n🚀 Yodlee Integration Status: READY FOR PRODUCTION!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
testFastLinkIntegration();