#!/usr/bin/env node

/**
 * Super Cards API Test Script
 * Tests all 5 Super Cards API endpoints with both empty and populated data scenarios
 */

const baseUrl = 'http://localhost:3000';
const testUserId = '08b7b21f-e5df-47f0-b811-85a19316d0a7'; // Test user ID from database

async function testSuperCard(card, description) {
  console.log(`\n🧪 Testing ${card} - ${description}`);
  console.log('─'.repeat(50));
  
  try {
    const url = `${baseUrl}/api/super-cards?card=${card}&userId=${testUserId}&timeRange=30d`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      if (data.isEmpty) {
        console.log(`✅ Empty state detected - This is expected with no data`);
        console.log(`📄 Response: { success: true, isEmpty: true }`);
      } else {
        console.log(`✅ Data retrieved successfully`);
        console.log(`📊 Data keys: ${Object.keys(data.data || {}).join(', ')}`);
        console.log(`📄 Sample data:`, JSON.stringify(data.data, null, 2).substring(0, 200) + '...');
      }
    } else {
      console.log(`❌ API Error: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Super Cards API Test Suite');
  console.log('Testing SQLite integration and empty state handling');
  console.log('═'.repeat(60));

  // Test all 5 Super Cards
  await testSuperCard('performance', 'Portfolio Performance Metrics');
  await testSuperCard('income', 'Income Intelligence Analysis');
  await testSuperCard('tax', 'Tax Strategy Calculations');
  await testSuperCard('strategy', 'Portfolio Strategy & Rebalancing');
  await testSuperCard('planning', 'Financial Planning & FIRE Progress');

  console.log('\n🏁 Test Complete');
  console.log('═'.repeat(60));
  console.log('Expected Results:');
  console.log('✅ All cards should return { success: true, isEmpty: true } with no data');
  console.log('✅ Add test data to see populated responses');
  console.log('✅ No HTTP errors or crashes');
  console.log('\nNext Steps:');
  console.log('1. Visit http://localhost:3000/dashboard/super-cards');
  console.log('2. Verify empty states display correctly');
  console.log('3. Add test data via UI to see populated cards');
}

// Run the tests
runTests().catch(console.error);