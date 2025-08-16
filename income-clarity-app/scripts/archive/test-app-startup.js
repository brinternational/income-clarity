#!/usr/bin/env node

/**
 * Test if the app can start without errors
 */

// console.log('🔍 Testing app startup...\n');

// Check environment
const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                       !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_');
const hasPolygonKey = process.env.POLYGON_API_KEY && 
                      !process.env.POLYGON_API_KEY.includes('your_');

// console.log('Environment Status:');
// console.log('  Supabase:', hasSupabaseUrl ? '✅ Configured' : '⚠️ Using mock client');
// console.log('  Polygon API:', hasPolygonKey ? '✅ Configured' : '❌ Not configured');

// Try to import key modules
try {
  require('../lib/supabase-client');
  // console.log('  Supabase Client: ✅ Loads without error');
} catch (error) {
  // console.error('  Supabase Client: ❌', error.message);
  process.exit(1);
}

try {
  require('../lib/stock-price-service');
  // console.log('  Stock Service: ✅ Loads without error');
} catch (error) {
  // console.error('  Stock Service: ❌', error.message);
}

// console.log('\n✅ App startup test passed!');
// console.log('The app should now run with: npm run dev');