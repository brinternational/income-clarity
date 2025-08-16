#!/usr/bin/env node

/**
 * Direct test of Polygon.io API key
 * Tests the API key without needing the Next.js server running
 */

require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.POLYGON_API_KEY;

// console.log('🔍 Testing Polygon.io API Key...\n');

if (!API_KEY) {
  // console.error('❌ No API key found in environment variables');
  // console.log('Please ensure POLYGON_API_KEY is set in .env.local');
  process.exit(1);
}

// console.log('✅ API Key found:', API_KEY.substring(0, 8) + '...' + API_KEY.substring(API_KEY.length - 4));

async function testPolygonAPI() {
  const ticker = 'SPY';
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${API_KEY}`;
  
  // console.log(`\n📊 Fetching ${ticker} data from Polygon.io...`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      // console.log('✅ API connection successful!');
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        // console.log('\n📈 Stock Data:');
        // console.log(`  Symbol: ${result.T}`);
        // console.log(`  Close: $${result.c}`);
        // console.log(`  Volume: ${result.v?.toLocaleString()}`);
        // console.log(`  Date: ${new Date(result.t).toLocaleDateString()}`);
      }
      
      // Test rate limit info
      // console.log('\n⏱️ Rate Limit Info:');
      const remaining = response.headers.get('x-request-remaining');
      const limit = response.headers.get('x-request-limit');
      if (remaining && limit) {
        // console.log(`  Remaining API calls: ${remaining}/${limit}`);
      } else {
        // console.log('  Free tier: 5 calls per minute');
      }
      
      return true;
    } else {
      // console.error('❌ API request failed:', data.status);
      // console.error('Message:', data.message || 'Unknown error');
      
      if (data.status === 'ERROR' && data.message?.includes('API key')) {
        // console.log('\n🔑 API Key Issue Detected:');
        // console.log('  - Check if your key is active at https://polygon.io/dashboard');
        // console.log('  - Ensure you have not exceeded rate limits');
        // console.log('  - Verify the key is copied correctly');
      }
      
      return false;
    }
  } catch (error) {
    // console.error('❌ Network error:', error.message);
    // console.log('\n🌐 Troubleshooting:');
    // console.log('  - Check your internet connection');
    // console.log('  - Verify Polygon.io service status: https://status.polygon.io');
    return false;
  }
}

// Run the test
testPolygonAPI().then(success => {
  // console.log('\n' + '='.repeat(60));
  if (success) {
    // console.log('✅ Polygon API integration is working correctly!');
    // console.log('Your API key is valid and ready to use.');
  } else {
    // console.log('❌ Polygon API test failed.');
    // console.log('Please check the error messages above.');
  }
  // console.log('='.repeat(60));
  process.exit(success ? 0 : 1);
});