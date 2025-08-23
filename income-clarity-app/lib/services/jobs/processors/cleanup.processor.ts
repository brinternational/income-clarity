/**
 * Cleanup Job Processor
 * Handles database maintenance, file cleanup, and system optimization tasks
 */

import { Job, Processor } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../logger';
import { JOB_TYPES } from '../queue-config';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Cleanup job data interfaces
interface BaseCleanupJobData {
  dryRun?: boolean;
  batchSize?: number;
  maxAge?: number; // in days
  metadata?: Record<string, any>;
}

interface SyncLogsCleanupData extends BaseCleanupJobData {
  retentionDays?: number;
  statusesToClean?: string[];
  keepSuccessfulLogs?: boolean;
}

interface SessionsCleanupData extends BaseCleanupJobData {
  expiredOnly?: boolean;
  inactiveThresholdDays?: number;
}

interface CacheCleanupData extends BaseCleanupJobData {
  cacheTypes?: string[];
  sizeThresholdMB?: number;
}

interface OldDataCleanupData extends BaseCleanupJobData {
  tables?: string[];
  archiveBeforeDelete?: boolean;
  customConditions?: Record<string, any>;
}

interface TempFilesCleanupData extends BaseCleanupJobData {
  directories?: string[];
  filePatterns?: string[];
  ageDays?: number;
}

type CleanupJobData = 
  | SyncLogsCleanupData 
  | SessionsCleanupData 
  | CacheCleanupData 
  | OldDataCleanupData 
  | TempFilesCleanupData;

/**
 * Main cleanup job processor
 */
export const cleanupProcessor: Processor<CleanupJobData> = async (job: Job<CleanupJobData>) => {
  const startTime = Date.now();

  try {
    logger.info('Processing cleanup job', {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts.attempts,
      dryRun: job.data.dryRun || false
    });

    await job.updateProgress(0);

    // Route to specific cleanup handler based on job type
    let result: { 
      success: boolean; 
      itemsProcessed: number; 
      itemsDeleted: number;
      spaceFreed?: number;
      message: string; 
    };

    switch (job.name) {
      case JOB_TYPES.CLEANUP.SYNC_LOGS:
        result = await processSyncLogsCleanup(job as Job<SyncLogsCleanupData>);
        break;
        
      case JOB_TYPES.CLEANUP.SESSIONS:
        result = await processSessionsCleanup(job as Job<SessionsCleanupData>);
        break;
        
      case JOB_TYPES.CLEANUP.CACHE:
        result = await processCacheCleanup(job as Job<CacheCleanupData>);
        break;
        
      case JOB_TYPES.CLEANUP.OLD_DATA:
        result = await processOldDataCleanup(job as Job<OldDataCleanupData>);
        break;
        
      case JOB_TYPES.CLEANUP.TEMP_FILES:
        result = await processTempFilesCleanup(job as Job<TempFilesCleanupData>);
        break;
        
      default:
        throw new Error(`Unknown cleanup job type: ${job.name}`);
    }

    const duration = Date.now() - startTime;

    // Log cleanup completion
    await logCleanupResult(job.name, {
      ...result,
      duration,
      dryRun: job.data.dryRun || false
    });

    logger.info('Cleanup job completed successfully', {
      jobId: job.id,
      jobName: job.name,
      duration,
      itemsProcessed: result.itemsProcessed,
      itemsDeleted: result.itemsDeleted,
      spaceFreed: result.spaceFreed,
      dryRun: job.data.dryRun || false
    });

    await job.updateProgress(100);

    return {
      success: true,
      duration,
      ...result
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Cleanup job failed', {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });

    throw error;
  }
};

/**
 * Process sync logs cleanup
 */
async function processSyncLogsCleanup(job: Job<SyncLogsCleanupData>): Promise<{
  success: boolean;
  itemsProcessed: number;
  itemsDeleted: number;
  message: string;
}> {
  const { 
    dryRun = false, 
    retentionDays = 30, 
    statusesToClean = ['FAILED', 'SUCCESS'],
    keepSuccessfulLogs = true,
    batchSize = 1000
  } = job.data;

  await job.updateProgress(10);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Build where clause
  const whereClause: any = {
    createdAt: { lt: cutoffDate }
  };

  if (keepSuccessfulLogs) {
    // Only clean failed logs and some old successful logs
    whereClause.OR = [
      { status: 'FAILED' },
      { 
        AND: [
          { status: 'SUCCESS' },
          { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Keep successful logs for 7 days only
        ]
      }
    ];
  } else {
    whereClause.status = { in: statusesToClean };
  }

  await job.updateProgress(20);

  // Count total logs to be processed
  const totalLogs = await prisma.syncLog.count({ where: whereClause });

  if (totalLogs === 0) {
    return {
      success: true,
      itemsProcessed: 0,
      itemsDeleted: 0,
      message: 'No sync logs to clean up'
    };
  }

  await job.updateProgress(30);

  let deletedCount = 0;

  if (!dryRun) {
    // Delete in batches to avoid locking issues
    while (deletedCount < totalLogs) {
      const batch = await prisma.syncLog.findMany({
        where: whereClause,
        select: { id: true },
        take: batchSize,
        orderBy: { createdAt: 'asc' }
      });

      if (batch.length === 0) break;

      await prisma.syncLog.deleteMany({
        where: { id: { in: batch.map(log => log.id) } }
      });

      deletedCount += batch.length;

      // Update progress
      const progress = 30 + (60 * (deletedCount / totalLogs));
      await job.updateProgress(Math.min(progress, 90));

      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  await job.updateProgress(90);

  return {
    success: true,
    itemsProcessed: totalLogs,
    itemsDeleted: dryRun ? 0 : deletedCount,
    message: dryRun 
      ? `Would delete ${totalLogs} sync logs older than ${retentionDays} days`
      : `Deleted ${deletedCount} sync logs older than ${retentionDays} days`
  };
}

/**
 * Process sessions cleanup
 */
async function processSessionsCleanup(job: Job<SessionsCleanupData>): Promise<{
  success: boolean;
  itemsProcessed: number;
  itemsDeleted: number;
  message: string;
}> {
  const { 
    dryRun = false, 
    expiredOnly = true,
    inactiveThresholdDays = 30,
    batchSize = 500
  } = job.data;

  await job.updateProgress(10);

  const now = new Date();
  const whereClause: any = {};

  if (expiredOnly) {
    whereClause.expiresAt = { lt: now };
  } else {
    // Clean sessions that haven't been used in X days
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - inactiveThresholdDays);
    
    whereClause.OR = [
      { expiresAt: { lt: now } },
      { lastAccessedAt: { lt: inactiveDate } }
    ];
  }

  await job.updateProgress(20);

  // Count total sessions to be processed
  const totalSessions = await prisma.session.count({ where: whereClause });

  if (totalSessions === 0) {
    return {
      success: true,
      itemsProcessed: 0,
      itemsDeleted: 0,
      message: 'No sessions to clean up'
    };
  }

  await job.updateProgress(30);

  let deletedCount = 0;

  if (!dryRun) {
    // Delete in batches
    while (deletedCount < totalSessions) {
      const batch = await prisma.session.findMany({
        where: whereClause,
        select: { id: true },
        take: batchSize,
        orderBy: { expiresAt: 'asc' }
      });

      if (batch.length === 0) break;

      await prisma.session.deleteMany({
        where: { id: { in: batch.map(session => session.id) } }
      });

      deletedCount += batch.length;

      // Update progress
      const progress = 30 + (60 * (deletedCount / totalSessions));
      await job.updateProgress(Math.min(progress, 90));

      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  await job.updateProgress(90);

  return {
    success: true,
    itemsProcessed: totalSessions,
    itemsDeleted: dryRun ? 0 : deletedCount,
    message: dryRun 
      ? `Would delete ${totalSessions} expired/inactive sessions`
      : `Deleted ${deletedCount} expired/inactive sessions`
  };
}

/**
 * Process cache cleanup
 */
async function processCacheCleanup(job: Job<CacheCleanupData>): Promise<{
  success: boolean;
  itemsProcessed: number;
  itemsDeleted: number;
  spaceFreed: number;
  message: string;
}> {
  const { 
    dryRun = false,
    cacheTypes = ['redis', 'file'],
    sizeThresholdMB = 100
  } = job.data;

  await job.updateProgress(10);

  let totalItemsProcessed = 0;
  let totalItemsDeleted = 0;
  let totalSpaceFreed = 0;

  // Redis cache cleanup
  if (cacheTypes.includes('redis')) {
    await job.updateProgress(20);
    
    try {
      const { getRedisInstance } = await import('../queue-config');
      const redis = getRedisInstance();
      
      // Get all cache keys
      const cacheKeys = await redis.keys('cache:*');
      totalItemsProcessed += cacheKeys.length;
      
      if (!dryRun && cacheKeys.length > 0) {
        // Delete expired cache entries
        const expiredKeys: string[] = [];
        
        for (const key of cacheKeys) {
          const ttl = await redis.ttl(key);
          if (ttl === -2 || ttl === 0) { // Key doesn't exist or has no expiry
            expiredKeys.push(key);
          }
        }
        
        if (expiredKeys.length > 0) {
          await redis.del(...expiredKeys);
          totalItemsDeleted += expiredKeys.length;
        }
      }
      
      await job.updateProgress(40);
      
    } catch (error) {
      logger.warn('Redis cache cleanup failed', { error: error.message });
    }
  }

  // File cache cleanup
  if (cacheTypes.includes('file')) {
    await job.updateProgress(50);
    
    try {
      const cacheDir = path.join(process.cwd(), 'tmp', 'cache');
      
      try {
        const files = await fs.readdir(cacheDir);
        totalItemsProcessed += files.length;
        
        let fileSizeFreed = 0;
        
        for (const file of files) {
          const filePath = path.join(cacheDir, file);
          const stats = await fs.stat(filePath);
          
          // Check if file is older than 24 hours
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          if (stats.mtime < oneDayAgo) {
            if (!dryRun) {
              await fs.unlink(filePath);
              totalItemsDeleted++;
            }
            fileSizeFreed += stats.size;
          }
        }
        
        totalSpaceFreed += fileSizeFreed;
        
      } catch (error) {
        // Cache directory might not exist, which is fine
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
      
      await job.updateProgress(70);
      
    } catch (error) {
      logger.warn('File cache cleanup failed', { error: error.message });
    }
  }

  await job.updateProgress(90);

  const spaceFreedMB = Math.round(totalSpaceFreed / (1024 * 1024) * 100) / 100;

  return {
    success: true,
    itemsProcessed: totalItemsProcessed,
    itemsDeleted: dryRun ? 0 : totalItemsDeleted,
    spaceFreed: spaceFreedMB,
    message: dryRun 
      ? `Would delete ${totalItemsProcessed} cache items, freeing ${spaceFreedMB}MB`
      : `Deleted ${totalItemsDeleted} cache items, freed ${spaceFreedMB}MB`
  };
}

/**
 * Process old data cleanup
 */
async function processOldDataCleanup(job: Job<OldDataCleanupData>): Promise<{
  success: boolean;
  itemsProcessed: number;
  itemsDeleted: number;
  message: string;
}> {
  const { 
    dryRun = false,
    tables = ['emailLog', 'cronJobLog'],
    archiveBeforeDelete = false,
    maxAge = 90, // 90 days default
    batchSize = 500
  } = job.data;

  await job.updateProgress(10);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAge);

  let totalProcessed = 0;
  let totalDeleted = 0;

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const progress = 10 + (80 * (i / tables.length));
    await job.updateProgress(progress);

    try {
      // Get count of old records
      let count = 0;
      
      switch (table) {
        case 'emailLog':
          count = await prisma.emailLog.count({
            where: { createdAt: { lt: cutoffDate } }
          });
          break;
          
        case 'cronJobLog':
          count = await prisma.cronJobLog.count({
            where: { createdAt: { lt: cutoffDate } }
          });
          break;
          
        default:
          logger.warn('Unknown table for cleanup', { table });
          continue;
      }

      totalProcessed += count;

      if (count > 0 && !dryRun) {
        // Archive if requested
        if (archiveBeforeDelete) {
          await archiveTableData(table, cutoffDate);
        }

        // Delete old records in batches
        let deleted = 0;
        while (deleted < count) {
          let batchResult;
          
          switch (table) {
            case 'emailLog':
              batchResult = await prisma.emailLog.deleteMany({
                where: { createdAt: { lt: cutoffDate } }
              });
              break;
              
            case 'cronJobLog':
              batchResult = await prisma.cronJobLog.deleteMany({
                where: { createdAt: { lt: cutoffDate } }
              });
              break;
          }

          const batchDeleted = batchResult?.count || 0;
          deleted += batchDeleted;
          totalDeleted += batchDeleted;

          if (batchDeleted === 0) break;

          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    } catch (error) {
      logger.error('Table cleanup failed', { table, error: error.message });
    }
  }

  await job.updateProgress(90);

  return {
    success: true,
    itemsProcessed: totalProcessed,
    itemsDeleted: dryRun ? 0 : totalDeleted,
    message: dryRun 
      ? `Would delete ${totalProcessed} old records from ${tables.length} tables`
      : `Deleted ${totalDeleted} old records from ${tables.length} tables`
  };
}

/**
 * Process temporary files cleanup
 */
async function processTempFilesCleanup(job: Job<TempFilesCleanupData>): Promise<{
  success: boolean;
  itemsProcessed: number;
  itemsDeleted: number;
  spaceFreed: number;
  message: string;
}> {
  const { 
    dryRun = false,
    directories = ['tmp', 'uploads/temp'],
    filePatterns = ['*.tmp', '*.temp', '*.log'],
    ageDays = 7
  } = job.data;

  await job.updateProgress(10);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ageDays);

  let totalProcessed = 0;
  let totalDeleted = 0;
  let totalSpaceFreed = 0;

  for (let i = 0; i < directories.length; i++) {
    const directory = directories[i];
    const progress = 10 + (80 * (i / directories.length));
    await job.updateProgress(progress);

    try {
      const dirPath = path.resolve(directory);
      
      try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          
          try {
            const stats = await fs.stat(filePath);
            
            // Skip directories
            if (stats.isDirectory()) continue;
            
            // Check if file matches patterns and age
            const matchesPattern = filePatterns.some(pattern => {
              const regex = new RegExp(pattern.replace('*', '.*'));
              return regex.test(file);
            });
            
            if (matchesPattern && stats.mtime < cutoffDate) {
              totalProcessed++;
              
              if (!dryRun) {
                await fs.unlink(filePath);
                totalDeleted++;
              }
              
              totalSpaceFreed += stats.size;
            }
            
          } catch (fileError) {
            // Skip files that can't be accessed
            logger.debug('Cannot access file', { file: filePath, error: fileError.message });
          }
        }
        
      } catch (dirError) {
        // Directory might not exist, which is fine
        if (dirError.code !== 'ENOENT') {
          logger.warn('Cannot access directory', { directory: dirPath, error: dirError.message });
        }
      }
      
    } catch (error) {
      logger.error('Directory cleanup failed', { directory, error: error.message });
    }
  }

  await job.updateProgress(90);

  const spaceFreedMB = Math.round(totalSpaceFreed / (1024 * 1024) * 100) / 100;

  return {
    success: true,
    itemsProcessed: totalProcessed,
    itemsDeleted: dryRun ? 0 : totalDeleted,
    spaceFreed: spaceFreedMB,
    message: dryRun 
      ? `Would delete ${totalProcessed} temp files, freeing ${spaceFreedMB}MB`
      : `Deleted ${totalDeleted} temp files, freed ${spaceFreedMB}MB`
  };
}

/**
 * Archive table data before deletion
 */
async function archiveTableData(tableName: string, cutoffDate: Date): Promise<void> {
  const archiveDir = path.join(process.cwd(), 'archives');
  
  try {
    await fs.mkdir(archiveDir, { recursive: true });
    
    const archiveFile = path.join(
      archiveDir, 
      `${tableName}_archive_${cutoffDate.toISOString().split('T')[0]}.json`
    );
    
    let data: any[] = [];
    
    switch (tableName) {
      case 'emailLog':
        data = await prisma.emailLog.findMany({
          where: { createdAt: { lt: cutoffDate } }
        });
        break;
        
      case 'cronJobLog':
        data = await prisma.cronJobLog.findMany({
          where: { createdAt: { lt: cutoffDate } }
        });
        break;
    }
    
    if (data.length > 0) {
      await fs.writeFile(archiveFile, JSON.stringify(data, null, 2));
      logger.info('Data archived', { 
        table: tableName, 
        records: data.length, 
        file: archiveFile 
      });
    }
    
  } catch (error) {
    logger.error('Archive failed', { 
      table: tableName, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Log cleanup operation result
 */
async function logCleanupResult(jobType: string, result: {
  itemsProcessed: number;
  itemsDeleted: number;
  duration: number;
  dryRun: boolean;
  spaceFreed?: number;
  message: string;
}): Promise<void> {
  try {
    await prisma.cronJobLog.create({
      data: {
        jobName: `cleanup-${jobType}`,
        status: 'SUCCESS',
        summary: JSON.stringify({
          itemsProcessed: result.itemsProcessed,
          itemsDeleted: result.itemsDeleted,
          spaceFreed: result.spaceFreed,
          dryRun: result.dryRun,
          message: result.message
        }),
        duration: result.duration,
        startedAt: new Date(Date.now() - result.duration),
        completedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Failed to log cleanup result', { error: error.message });
  }
}

// Export job data types for use in other modules
export type {
  BaseCleanupJobData,
  SyncLogsCleanupData,
  SessionsCleanupData,
  CacheCleanupData,
  OldDataCleanupData,
  TempFilesCleanupData,
  CleanupJobData
};