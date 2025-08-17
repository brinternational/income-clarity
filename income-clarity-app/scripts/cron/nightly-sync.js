#!/usr/bin/env node

/**
 * Nightly Sync Script
 * Runs scheduled batch synchronization for all premium users with Yodlee connections
 * 
 * Usage: node scripts/cron/nightly-sync.js
 * Cron: 0 2 * * * cd /path/to/app && node scripts/cron/nightly-sync.js
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Ensure we're in the correct directory
process.chdir(path.join(__dirname, '../..'));

// Import sync orchestrator (need to transpile on the fly or use require)
const { syncOrchestrator, SyncType } = require('../../lib/services/sync/sync-orchestrator.service.ts');

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  batchSize: 10,              // Process 10 users at a time
  maxConcurrent: 3,           // Max 3 syncs running simultaneously
  delayBetweenBatches: 30000, // 30 seconds between batches
  maxRetries: 2,              // Retry failed syncs up to 2 times
  timeoutPerSync: 300000,     // 5 minutes timeout per sync
};

// Track script execution
const scriptStartTime = Date.now();
let totalUsers = 0;
let successfulSyncs = 0;
let failedSyncs = 0;
let skippedSyncs = 0;

/**
 * Main execution function
 */
async function main() {
  console.log('🌙 Starting nightly sync batch job...');
  console.log('📅 Started at:', new Date().toISOString());
  
  try {
    // Get all premium users with Yodlee connections
    const usersToSync = await getPremiumUsersWithConnections();
    totalUsers = usersToSync.length;
    
    console.log(`👥 Found ${totalUsers} premium users with bank connections`);
    
    if (totalUsers === 0) {
      console.log('✅ No users to sync, exiting');
      return;
    }
    
    // Process users in batches
    await processBatches(usersToSync);
    
    // Generate final report
    await generateSummaryReport();
    
  } catch (error) {
    console.error('❌ Fatal error in nightly sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get premium users with Yodlee connections that need syncing
 */
async function getPremiumUsersWithConnections() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return await prisma.user.findMany({
    where: {
      subscription: {
        status: 'ACTIVE',
        plan: {
          in: ['PREMIUM', 'ENTERPRISE']
        }
      },
      yodleeConnection: {
        isNot: null,
        OR: [
          { lastSyncedAt: null },
          { lastSyncedAt: { lt: twentyFourHoursAgo } }
        ]
      }
    },
    include: {
      yodleeConnection: {
        include: {
          syncedAccounts: {
            where: { isActive: true },
            select: { id: true }
          }
        }
      },
      subscription: {
        select: { plan: true, status: true }
      }
    },
    orderBy: {
      yodleeConnection: {
        lastSyncedAt: 'asc' // Sync oldest first
      }
    }
  });
}

/**
 * Process users in controlled batches
 */
async function processBatches(users) {
  const batches = chunkArray(users, CONFIG.batchSize);
  
  console.log(`📦 Processing ${batches.length} batches of up to ${CONFIG.batchSize} users each`);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} users)`);
    
    // Process batch with concurrency control
    await processBatchConcurrently(batch);
    
    // Delay between batches to avoid overwhelming the system
    if (i < batches.length - 1) {
      console.log(`⏳ Waiting ${CONFIG.delayBetweenBatches / 1000}s before next batch...`);
      await sleep(CONFIG.delayBetweenBatches);
    }
  }
}

/**
 * Process a batch of users with concurrency control
 */
async function processBatchConcurrently(batch) {
  const semaphore = new Array(CONFIG.maxConcurrent).fill(null);
  
  return Promise.all(
    batch.map(async (user, index) => {
      // Wait for available slot
      await waitForSlot(semaphore, index % CONFIG.maxConcurrent);
      
      try {
        await syncUserWithRetry(user);
      } finally {
        // Release slot
        semaphore[index % CONFIG.maxConcurrent] = null;
      }
    })
  );
}

/**
 * Wait for an available semaphore slot
 */
async function waitForSlot(semaphore, slotIndex) {
  while (semaphore[slotIndex] !== null) {
    await sleep(100); // Check every 100ms
  }
  semaphore[slotIndex] = true;
}

/**
 * Sync a user with retry logic
 */
async function syncUserWithRetry(user, retryCount = 0) {
  const startTime = Date.now();
  
  try {
    console.log(`📊 Syncing user: ${user.email} (${user.yodleeConnection.syncedAccounts.length} accounts)`);
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Sync timeout')), CONFIG.timeoutPerSync);
    });
    
    // Race sync against timeout
    const syncPromise = syncOrchestrator.performSync(user.id, SyncType.SCHEDULED);
    const result = await Promise.race([syncPromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    
    if (result.success) {
      successfulSyncs++;
      console.log(`✅ User ${user.email} synced successfully in ${duration}ms (${result.itemsSynced} items)`);
    } else {
      throw new Error(result.errors.join(', '));
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Sync failed for ${user.email} in ${duration}ms:`, error.message);
    
    // Retry logic
    if (retryCount < CONFIG.maxRetries && !error.message.includes('timeout')) {
      console.log(`🔄 Retrying ${user.email} (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
      await sleep(5000 * (retryCount + 1)); // Exponential backoff
      return await syncUserWithRetry(user, retryCount + 1);
    }
    
    failedSyncs++;
    
    // Log failure to database
    await logSyncFailure(user.id, error.message, duration);
  }
}

/**
 * Log sync failure to database
 */
async function logSyncFailure(userId, errorMessage, duration) {
  try {
    await prisma.syncLog.create({
      data: {
        userId,
        syncType: SyncType.SCHEDULED,
        status: 'FAILED',
        errorMessage,
        duration,
        startedAt: new Date(Date.now() - duration),
        completedAt: new Date()
      }
    });
  } catch (logError) {
    console.error('Failed to log sync failure:', logError);
  }
}

/**
 * Generate and log summary report
 */
async function generateSummaryReport() {
  const totalDuration = Date.now() - scriptStartTime;
  const successRate = totalUsers > 0 ? (successfulSyncs / totalUsers * 100).toFixed(1) : 0;
  
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${Math.round(totalDuration / 1000)}s`,
    users: {
      total: totalUsers,
      successful: successfulSyncs,
      failed: failedSyncs,
      skipped: skippedSyncs
    },
    successRate: `${successRate}%`,
    averageTimePerUser: totalUsers > 0 ? `${Math.round(totalDuration / totalUsers / 1000)}s` : '0s'
  };
  
  console.log('\n📈 NIGHTLY SYNC SUMMARY REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Total Duration: ${report.duration}`);
  console.log(`👥 Users Processed: ${report.users.total}`);
  console.log(`✅ Successful: ${report.users.successful}`);
  console.log(`❌ Failed: ${report.users.failed}`);
  console.log(`⏭️ Skipped: ${report.users.skipped}`);
  console.log(`📊 Success Rate: ${report.successRate}`);
  console.log(`⏱️ Avg Time/User: ${report.averageTimePerUser}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Store report in database
  try {
    await prisma.cronJobLog.create({
      data: {
        jobName: 'nightly-sync',
        status: failedSyncs === 0 ? 'SUCCESS' : 'PARTIAL',
        summary: JSON.stringify(report),
        startedAt: new Date(scriptStartTime),
        completedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to store report:', error);
  }
  
  // Alert if success rate is too low
  if (totalUsers > 0 && parseFloat(successRate) < 80) {
    console.warn(`⚠️ WARNING: Success rate ${successRate} is below 80% threshold!`);
  }
}

/**
 * Utility functions
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle script termination gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await generateSummaryReport();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await generateSummaryReport();
  await prisma.$disconnect();
  process.exit(0);
});

// Handle uncaught errors
process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  await generateSummaryReport();
  await prisma.$disconnect();
  process.exit(1);
});

// Run the script if called directly
if (require.main === module) {
  main().catch(async (error) => {
    console.error('❌ Script failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
}

module.exports = { main };