#!/usr/bin/env node

/**
 * Clear Performance Hub Cache Script
 * Forces fresh API data generation with updated chartData
 */

const { cacheService } = require('../lib/services/cache/cache.service');

async function clearPerformanceCache() {
  console.log('🚀 Clearing Performance Hub cache...');
  
  const cacheKeys = [
    'performance_hub_1Y_test@example.com',
    'performance_hub_1M_test@example.com',
    'performance_hub_3M_test@example.com',
    'performance_hub_6M_test@example.com',
    'performance_hub_All_test@example.com'
  ];
  
  for (const key of cacheKeys) {
    try {
      await cacheService.delete(key);
      console.log(`✅ Cleared cache: ${key}`);
    } catch (error) {
      console.log(`⚠️ Cache key not found: ${key}`);
    }
  }
  
  console.log('🔄 Cache cleared! Next API call will generate fresh data with chartData.');
  process.exit(0);
}

clearPerformanceCache().catch(console.error);