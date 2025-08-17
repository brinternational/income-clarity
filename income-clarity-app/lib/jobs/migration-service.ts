/**
 * Migration Service
 * Handles migration from the old sync scheduler to BullMQ queues
 * Provides backward compatibility and gradual migration path
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { jobScheduler } from './job-scheduler.service';
import { syncScheduler } from '../services/sync/sync-scheduler.service';
import { JOB_TYPES, QUEUE_NAMES } from './queue-config';
import { SyncType } from '../services/sync/sync-orchestrator.service';

const prisma = new PrismaClient();

export interface MigrationConfig {
  enableBullMQ: boolean;
  migrationMode: 'gradual' | 'immediate' | 'testing';
  fallbackToLegacy: boolean;
  migrateExistingJobs: boolean;
  queuePriorities: Record<string, boolean>; // Which queues to migrate first
}

/**
 * Queue Migration Service
 */
export class QueueMigrationService {
  private config: MigrationConfig;
  private isInitialized = false;

  constructor(config: MigrationConfig) {
    this.config = config;
  }

  /**
   * Initialize the migration service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Migration service already initialized');
      return;
    }

    try {
      logger.info('Initializing queue migration service', { config: this.config });

      // Initialize BullMQ if enabled
      if (this.config.enableBullMQ) {
        await jobScheduler.initialize();
        logger.info('BullMQ job scheduler initialized');
      }

      // Migrate existing jobs if requested
      if (this.config.migrateExistingJobs) {
        await this.migrateExistingQueuedSyncs();
      }

      this.isInitialized = true;
      logger.info('Queue migration service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize migration service', { error: error.message });
      throw error;
    }
  }

  /**
   * Enqueue sync job with intelligent routing
   */
  async enqueueSync(
    userId: string,
    syncType: SyncType,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Determine which system to use based on configuration and queue health
      const useBullMQ = await this.shouldUseBullMQ(syncType);

      if (useBullMQ) {
        return await this.enqueueSyncBullMQ(userId, syncType, metadata);
      } else {
        return await this.enqueueSyncLegacy(userId, syncType, metadata);
      }

    } catch (error) {
      logger.error('Failed to enqueue sync job', {
        userId,
        syncType,
        error: error.message
      });

      // Fallback to legacy system if BullMQ fails and fallback is enabled
      if (this.config.fallbackToLegacy && this.config.enableBullMQ) {
        logger.warn('Falling back to legacy sync scheduler', { userId, syncType });
        return await this.enqueueSyncLegacy(userId, syncType, metadata);
      }

      throw error;
    }
  }

  /**
   * Enqueue sync using BullMQ
   */
  private async enqueueSyncBullMQ(
    userId: string,
    syncType: SyncType,
    metadata?: Record<string, any>
  ): Promise<string> {
    const jobType = this.mapSyncTypeToJobType(syncType);
    const queueName = this.getQueueForSyncType(syncType);

    const job = await jobScheduler.addJob(
      queueName,
      jobType,
      {
        userId,
        syncType,
        metadata: {
          ...metadata,
          migratedFrom: 'legacy',
          timestamp: new Date().toISOString()
        }
      },
      {
        priority: this.getSyncPriority(syncType),
        attempts: 3
      }
    );

    logger.info('Sync job enqueued via BullMQ', {
      userId,
      syncType,
      jobId: job.id,
      queueName
    });

    return job.id?.toString() || `bullmq-${Date.now()}`;
  }

  /**
   * Enqueue sync using legacy system
   */
  private async enqueueSyncLegacy(
    userId: string,
    syncType: SyncType,
    metadata?: Record<string, any>
  ): Promise<string> {
    const syncId = await syncScheduler.enqueueSync(userId, syncType, metadata);

    logger.info('Sync job enqueued via legacy scheduler', {
      userId,
      syncType,
      syncId
    });

    return syncId;
  }

  /**
   * Determine whether to use BullMQ based on configuration and system health
   */
  private async shouldUseBullMQ(syncType: SyncType): Promise<boolean> {
    if (!this.config.enableBullMQ) {
      return false;
    }

    switch (this.config.migrationMode) {
      case 'immediate':
        return true;
        
      case 'testing':
        // Only use BullMQ for a small percentage of jobs during testing
        return Math.random() < 0.1; // 10% of jobs
        
      case 'gradual':
        // Gradually migrate based on sync type priority
        return this.isQueueMigrated(syncType);
        
      default:
        return false;
    }
  }

  /**
   * Check if a sync type has been migrated to BullMQ
   */
  private isQueueMigrated(syncType: SyncType): boolean {
    const syncTypePriority = {
      [SyncType.WEBHOOK]: 'high',
      [SyncType.MANUAL]: 'medium',
      [SyncType.LOGIN]: 'medium',
      [SyncType.SCHEDULED]: 'low'
    };

    const priority = syncTypePriority[syncType] || 'low';
    return this.config.queuePriorities[priority] || false;
  }

  /**
   * Map sync type to BullMQ job type
   */
  private mapSyncTypeToJobType(syncType: SyncType): string {
    const mapping = {
      [SyncType.WEBHOOK]: JOB_TYPES.SYNC.YODLEE_WEBHOOK,
      [SyncType.MANUAL]: JOB_TYPES.SYNC.YODLEE_MANUAL,
      [SyncType.LOGIN]: JOB_TYPES.SYNC.YODLEE_LOGIN,
      [SyncType.SCHEDULED]: JOB_TYPES.SYNC.YODLEE_SCHEDULED
    };

    return mapping[syncType] || JOB_TYPES.SYNC.YODLEE_MANUAL;
  }

  /**
   * Get queue name for sync type
   */
  private getQueueForSyncType(syncType: SyncType): string {
    if (syncType === SyncType.WEBHOOK) {
      return QUEUE_NAMES.WEBHOOK;
    }
    return QUEUE_NAMES.SYNC;
  }

  /**
   * Get priority for sync type
   */
  private getSyncPriority(syncType: SyncType): 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' {
    const priorityMap = {
      [SyncType.WEBHOOK]: 'CRITICAL' as const,
      [SyncType.MANUAL]: 'HIGH' as const,
      [SyncType.LOGIN]: 'NORMAL' as const,
      [SyncType.SCHEDULED]: 'LOW' as const
    };

    return priorityMap[syncType] || 'NORMAL';
  }

  /**
   * Migrate existing queued syncs from legacy system to BullMQ
   */
  private async migrateExistingQueuedSyncs(): Promise<void> {
    try {
      logger.info('Starting migration of existing queued syncs');

      // Get queued syncs from legacy system
      const queuedSyncs = await prisma.queuedSync.findMany({
        orderBy: [
          { priority: 'asc' },
          { scheduledAt: 'asc' }
        ]
      });

      let migratedCount = 0;
      let skippedCount = 0;

      for (const queuedSync of queuedSyncs) {
        try {
          // Check if this sync type should be migrated
          const syncType = queuedSync.syncType as SyncType;
          
          if (!this.isQueueMigrated(syncType)) {
            skippedCount++;
            continue;
          }

          // Add to BullMQ
          const metadata = queuedSync.metadata ? JSON.parse(queuedSync.metadata) : {};
          
          await this.enqueueSyncBullMQ(
            queuedSync.userId,
            syncType,
            {
              ...metadata,
              migratedFromId: queuedSync.id,
              originalScheduledAt: queuedSync.scheduledAt.toISOString()
            }
          );

          // Remove from legacy queue
          await prisma.queuedSync.delete({
            where: { id: queuedSync.id }
          });

          migratedCount++;

        } catch (error) {
          logger.error('Failed to migrate queued sync', {
            queuedSyncId: queuedSync.id,
            error: error.message
          });
        }
      }

      logger.info('Completed migration of existing queued syncs', {
        total: queuedSyncs.length,
        migrated: migratedCount,
        skipped: skippedCount
      });

    } catch (error) {
      logger.error('Failed to migrate existing queued syncs', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancel sync job
   */
  async cancelSync(syncId: string): Promise<boolean> {
    try {
      // Try BullMQ first if it looks like a BullMQ job ID
      if (this.config.enableBullMQ && syncId.includes('-')) {
        const [queueName] = syncId.split('-');
        if (Object.values(QUEUE_NAMES).includes(queueName)) {
          return await jobScheduler.removeJob(queueName, syncId);
        }
      }

      // Fall back to legacy system
      return await syncScheduler.cancelSync(syncId);

    } catch (error) {
      logger.error('Failed to cancel sync', { syncId, error: error.message });
      return false;
    }
  }

  /**
   * Get sync queue status
   */
  async getQueueStatus(): Promise<{
    legacy?: any;
    bullmq?: any;
    migration: {
      enabled: boolean;
      mode: string;
      bullmqHealthy: boolean;
    };
  }> {
    const status: any = {
      migration: {
        enabled: this.config.enableBullMQ,
        mode: this.config.migrationMode,
        bullmqHealthy: false
      }
    };

    // Get legacy status
    try {
      status.legacy = syncScheduler.getQueueStatus();
    } catch (error) {
      status.legacy = { error: error.message };
    }

    // Get BullMQ status if enabled
    if (this.config.enableBullMQ) {
      try {
        const health = await jobScheduler.healthCheck();
        status.bullmq = await jobScheduler.getAllQueueStats();
        status.migration.bullmqHealthy = health.status === 'healthy';
      } catch (error) {
        status.bullmq = { error: error.message };
      }
    }

    return status;
  }

  /**
   * Update migration configuration
   */
  updateConfig(newConfig: Partial<MigrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Migration configuration updated', { config: this.config });
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats(): Promise<{
    totalJobs: number;
    bullmqJobs: number;
    legacyJobs: number;
    migrationPercentage: number;
    systemHealth: {
      legacy: boolean;
      bullmq: boolean;
    };
  }> {
    try {
      const legacyStatus = syncScheduler.getQueueStatus();
      const legacyJobs = legacyStatus.queueLength;

      let bullmqJobs = 0;
      let bullmqHealthy = false;

      if (this.config.enableBullMQ) {
        try {
          const health = await jobScheduler.healthCheck();
          bullmqHealthy = health.status === 'healthy';
          
          const stats = await jobScheduler.getAllQueueStats();
          bullmqJobs = Object.values(stats).reduce((total: number, queueStats: any) => {
            if (queueStats.error) return total;
            return total + (queueStats.waiting || 0) + (queueStats.active || 0);
          }, 0);
        } catch (error) {
          logger.error('Failed to get BullMQ stats', { error: error.message });
        }
      }

      const totalJobs = legacyJobs + bullmqJobs;
      const migrationPercentage = totalJobs > 0 ? (bullmqJobs / totalJobs) * 100 : 0;

      return {
        totalJobs,
        bullmqJobs,
        legacyJobs,
        migrationPercentage: Math.round(migrationPercentage * 100) / 100,
        systemHealth: {
          legacy: legacyStatus.queueLength >= 0, // Simple health check
          bullmq: bullmqHealthy
        }
      };

    } catch (error) {
      logger.error('Failed to get migration stats', { error: error.message });
      throw error;
    }
  }
}

// Create default migration configuration
const defaultMigrationConfig: MigrationConfig = {
  enableBullMQ: process.env.ENABLE_BULLMQ === 'true',
  migrationMode: (process.env.MIGRATION_MODE as any) || 'gradual',
  fallbackToLegacy: process.env.FALLBACK_TO_LEGACY !== 'false',
  migrateExistingJobs: process.env.MIGRATE_EXISTING_JOBS === 'true',
  queuePriorities: {
    high: process.env.MIGRATE_HIGH_PRIORITY === 'true',
    medium: process.env.MIGRATE_MEDIUM_PRIORITY === 'true',
    low: process.env.MIGRATE_LOW_PRIORITY === 'true'
  }
};

// Export singleton instance
export const queueMigrationService = new QueueMigrationService(defaultMigrationConfig);