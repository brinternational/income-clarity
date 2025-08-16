#!/usr/bin/env node

/**
 * Test Portfolio Creation - Verify RLS Fix
 * 
 * This script tests if the RLS policy fix worked by attempting
 * to create a portfolio with the mock user ID.
 * 
 * Usage: node scripts/test-portfolio-creation.js
 */

const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MOCK_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

async function testPortfolioCreation() {
  // console.log('🧪 Testing Portfolio Creation with Mock User\n');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // console.error('❌ Error: Supabase environment variables not found');
    process.exit(1);
  }

  // console.log(`🔗 Testing against: ${SUPABASE_URL}`);
  // console.log(`👤 Mock User ID: ${MOCK_USER_ID}\n`);

  try {
    // Test 1: Check if mock user exists
    // console.log('Test 1: Checking if mock user exists...');
    const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${MOCK_USER_ID}&select=id,email,full_name`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      // console.error('❌ Failed to query user:', userData);
      return;
    }

    if (userData.length === 0) {
      // console.log('⚠️  Mock user not found. RLS policies may not be applied yet.');
      // console.log('   Run the SQL from scripts/fix-rls-simple.js first.');
      return;
    }

    // console.log('✅ Mock user found:', userData[0]);

    // Test 2: Attempt to create a portfolio
    // console.log('\nTest 2: Attempting to create a test portfolio...');
    const portfolioData = {
      user_id: MOCK_USER_ID,
      name: 'RLS Test Portfolio',
      portfolio_type: 'investment',
      is_primary: false,
      total_value: 0,
      rebalance_threshold: 5
    };

    const portfolioResponse = await fetch(`${SUPABASE_URL}/rest/v1/portfolios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(portfolioData)
    });

    const portfolioResult = await portfolioResponse.json();

    if (!portfolioResponse.ok) {
      // console.error('❌ Portfolio creation failed:', portfolioResult);
      // console.log('\n🔧 This means the RLS policies need to be applied.');
      // console.log('   Run: node scripts/fix-rls-simple.js');
      // console.log('   Then copy the SQL to your Supabase dashboard.');
      return;
    }

    // console.log('✅ Portfolio created successfully:', portfolioResult[0]);

    // Test 3: Clean up the test portfolio
    // console.log('\nTest 3: Cleaning up test portfolio...');
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/portfolios?id=eq.${portfolioResult[0].id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (deleteResponse.ok) {
      // console.log('✅ Test portfolio cleaned up');
    } else {
      // console.log('⚠️  Could not clean up test portfolio (not critical)');
    }

    // console.log('\n🎉 SUCCESS! RLS policies are working correctly!');
    // console.log('   Your app should now be able to create portfolios without 401 errors.');

  } catch (error) {
    // console.error('❌ Test failed:', error.message);
    // console.log('\n💡 This might indicate network issues or incorrect environment variables.');
  }
}

testPortfolioCreation();