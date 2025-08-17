/**
 * Sync Scheduler Service
 * Manages queued syncs, priority handling, and retry logic
 */

import { PrismaClient } from '@prisma/client';
import { syncOrchestrator, SyncType, SyncStatus } from './sync-orchestrator.service';
import { logger } from '../../logger';

const prisma = new PrismaClient();

export enum SyncPriority {
  WEBHOOK = 1,    // Highest priority - real-time updates
  MANUAL = 2,     // High priority - user initiated
  LOGIN = 3,      // Medium priority - login triggered
  SCHEDULED = 4,  // Low priority - batch processing
}

interface QueuedSync {
  id: string;
  userId: string;
  syncType: SyncType;
  priority: SyncPriority;
  scheduledAt: Date;
  retryCount: number;
  metadata?: Record<string, any>;
}

interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export class SyncScheduler {
  private queue: QueuedSync[] = [];
  private isProcessing = false;
  private maxConcurrentSyncs = 3;
  private activeSyncs = new Set<string>();
  
  private retryPolicies: Record<SyncType, RetryPolicy> = {
    [SyncType.WEBHOOK]: { maxRetries: 3, backoffMultiplier: 2, maxDelayMs: 30000 },
    [SyncType.MANUAL]: { maxRetries: 2, backoffMultiplier: 2, maxDelayMs: 60000 },
    [SyncType.LOGIN]: { maxRetries: 1, backoffMultiplier: 2, maxDelayMs: 300000 },
    [SyncType.SCHEDULED]: { maxRetries: 2, backoffMultiplier: 3, maxDelayMs: 600000 },
  };

  constructor() {
    // Start queue processor
    this.startQueueProcessor();
    
    // Clean up stale syncs on startup
    this.cleanupStaleSyncs();
  }

  /**
   * Add sync to queue
   */
  async enqueueSync(
    userId: string,
    syncType: SyncType,
    metadata?: Record<string, any>
  ): Promise<string> {
    const priority = this.getSyncPriority(syncType);
    const syncId = `${syncType.toLowerCase()}-${userId}-${Date.now()}`;
    
    const queuedSync: QueuedSync = {
      id: syncId,
      userId,
      syncType,
      priority,
      scheduledAt: new Date(),
      retryCount: 0,
      metadata,
    };

    // Check for duplicate syncs
    const existingSync = this.queue.find(
      sync => sync.userId === userId && sync.syncType === syncType
    );
    
    if (existingSync) {
      logger.info('Sync already queued', { userId, syncType, existingId: existingSync.id });
      return existingSync.id;
    }

    // Check if sync is currently active
    if (this.activeSyncs.has(`${userId}-${syncType}`)) {
      logger.info('Sync already active', { userId, syncType });
      return `active-${userId}-${syncType}`;
    }

    // Add to queue and sort by priority
    this.queue.push(queuedSync);
    this.sortQueue();
    
    logger.info('Sync enqueued', { syncId, userId, syncType, priority, queueLength: this.queue.length });
    
    // Store in database for persistence
    await this.persistQueuedSync(queuedSync);
    
    return syncId;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    activeSyncs: number;
    nextSync?: QueuedSync;
    syncsByType: Record<SyncType, number>;
  } {
    const syncsByType = this.queue.reduce((acc, sync) => {
      acc[sync.syncType] = (acc[sync.syncType] || 0) + 1;
      return acc;
    }, {} as Record<SyncType, number>);

    return {
      queueLength: this.queue.length,
      activeSyncs: this.activeSyncs.size,
      nextSync: this.queue[0],
      syncsByType,
    };
  }

  /**
   * Cancel queued sync
   */
  async cancelSync(syncId: string): Promise<boolean> {
    const index = this.queue.findIndex(sync => sync.id === syncId);
    
    if (index === -1) {
      return false;
    }
    
    const canceledSync = this.queue.splice(index, 1)[0];
    
    // Remove from database
    await prisma.queuedSync.deleteMany({
      where: { id: syncId }
    });
    
    logger.info('Sync canceled', { syncId, userId: canceledSync.userId, syncType: canceledSync.syncType });
    
    return true;
  }

  /**
   * Get sync priority based on type
   */
  private getSyncPriority(syncType: SyncType): SyncPriority {
    const priorityMap: Record<SyncType, SyncPriority> = {
      [SyncType.WEBHOOK]: SyncPriority.WEBHOOK,
      [SyncType.MANUAL]: SyncPriority.MANUAL,
      [SyncType.LOGIN]: SyncPriority.LOGIN,
      [SyncType.SCHEDULED]: SyncPriority.SCHEDULED,
    };
    
    return priorityMap[syncType];
  }

  /**
   * Sort queue by priority and scheduled time
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by scheduled time (earlier = higher priority)
      return a.scheduledAt.getTime() - b.scheduledAt.getTime();
    });
  }

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processQueue();
      }
    }, 5000); // Check queue every 5 seconds
  }

  /**
   * Process the sync queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.activeSyncs.size >= this.maxConcurrentSyncs) {
      return;
    }

    this.isProcessing = true;

    try {
      const sync = this.queue.shift();
      if (!sync) {
        return;
      }

      // Mark as active
      const activeKey = `${sync.userId}-${sync.syncType}`;
      this.activeSyncs.add(activeKey);

      // Process sync asynchronously
      this.executeSyncWithRetry(sync).finally(() => {
        this.activeSyncs.delete(activeKey);
      });

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute sync with retry logic
   */
  private async executeSyncWithRetry(sync: QueuedSync): Promise<void> {
    const retryPolicy = this.retryPolicies[sync.syncType];
    
    try {
      logger.info('Executing sync', { 
        syncId: sync.id, 
        userId: sync.userId, 
        syncType: sync.syncType,
        attempt: sync.retryCount + 1
      });

      const result = await syncOrchestrator.performSync(sync.userId, sync.syncType);
      
      if (result.success) {
        logger.info('Sync completed successfully', { 
          syncId: sync.id, 
          itemsSynced: result.itemsSynced 
        });
        
        // Remove from database
        await this.removePersistedSync(sync.id);
      } else {
        throw new Error(result.errors.join(', '));
      }

    } catch (error) {
      logger.error('Sync execution failed', { 
        syncId: sync.id, 
        userId: sync.userId, 
        syncType: sync.syncType,
        attempt: sync.retryCount + 1,
        error: error.message 
      });

      // Check if we should retry
      if (sync.retryCount < retryPolicy.maxRetries) {
        await this.scheduleRetry(sync, retryPolicy);
      } else {
        logger.error('Sync failed permanently', { 
          syncId: sync.id, 
          maxRetries: retryPolicy.maxRetries 
        });
        
        // Remove from database
        await this.removePersistedSync(sync.id);
      }
    }
  }

  /**
   * Schedule sync retry with exponential backoff
   */
  private async scheduleRetry(sync: QueuedSync, retryPolicy: RetryPolicy): Promise<void> {
    sync.retryCount++;
    
    // Calculate delay with exponential backoff
    const baseDelay = 5000; // 5 seconds base delay
    const delay = Math.min(
      baseDelay * Math.pow(retryPolicy.backoffMultiplier, sync.retryCount - 1),
      retryPolicy.maxDelayMs
    );
    
    sync.scheduledAt = new Date(Date.now() + delay);
    
    logger.info('Scheduling sync retry', { 
      syncId: sync.id, 
      retryCount: sync.retryCount,
      delay: Math.round(delay / 1000) + 's',
      scheduledAt: sync.scheduledAt
    });

    // Re-add to queue
    this.queue.push(sync);
    this.sortQueue();
    
    // Update in database
    await this.persistQueuedSync(sync);
  }

  /**
   * Persist queued sync to database
   */
  private async persistQueuedSync(sync: QueuedSync): Promise<void> {
    try {
      await prisma.queuedSync.upsert({
        where: { id: sync.id },
        create: {
          id: sync.id,
          userId: sync.userId,
          syncType: sync.syncType,
          priority: sync.priority,
          scheduledAt: sync.scheduledAt,
          retryCount: sync.retryCount,
          metadata: sync.metadata ? JSON.stringify(sync.metadata) : null,
        },
        update: {
          scheduledAt: sync.scheduledAt,
          retryCount: sync.retryCount,
          metadata: sync.metadata ? JSON.stringify(sync.metadata) : null,
        },
      });
    } catch (error) {
      logger.error('Failed to persist queued sync', { syncId: sync.id, error: error.message });
    }
  }

  /**
   * Remove persisted sync from database
   */
  private async removePersistedSync(syncId: string): Promise<void> {
    try {
      await prisma.queuedSync.deleteMany({
        where: { id: syncId }
      });
    } catch (error) {
      logger.error('Failed to remove persisted sync', { syncId, error: error.message });
    }
  }

  /**
   * Load queued syncs from database on startup
   */
  async loadPersistedQueue(): Promise<void> {
    try {
      const persistedSyncs = await prisma.queuedSync.findMany({
        orderBy: [
          { priority: 'asc' },
          { scheduledAt: 'asc' }
        ]
      });

      for (const persistedSync of persistedSyncs) {
        const queuedSync: QueuedSync = {
          id: persistedSync.id,
          userId: persistedSync.userId,
          syncType: persistedSync.syncType as SyncType,
          priority: persistedSync.priority as SyncPriority,
          scheduledAt: persistedSync.scheduledAt,
          retryCount: persistedSync.retryCount,
          metadata: persistedSync.metadata ? JSON.parse(persistedSync.metadata) : undefined,
        };

        // Only add if not too old (older than 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (queuedSync.scheduledAt > twentyFourHoursAgo) {
          this.queue.push(queuedSync);
        } else {
          // Clean up old entries
          await this.removePersistedSync(queuedSync.id);
        }
      }

      this.sortQueue();
      
      logger.info('Loaded persisted queue', { queueLength: this.queue.length });
      
    } catch (error) {
      logger.error('Failed to load persisted queue', { error: error.message });
    }
  }

  /**
   * Clean up stale sync logs
   */
  private async cleanupStaleSyncs(): Promise<void> {
    try {
      // Mark stale IN_PROGRESS syncs as FAILED
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const staleSyncs = await prisma.syncLog.updateMany({
        where: {
          status: SyncStatus.IN_PROGRESS,
          startedAt: { lt: oneHourAgo }
        },
        data: {
          status: SyncStatus.FAILED,
          errorMessage: 'Sync timed out or interrupted',
          completedAt: new Date()
        }
      });
      
      if (staleSyncs.count > 0) {
        logger.info('Cleaned up stale syncs', { count: staleSyncs.count });
      }
      
    } catch (error) {
      logger.error('Failed to cleanup stale syncs', { error: error.message });
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(userId?: string, hours = 24): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    averageDuration: number;
    byType: Record<SyncType, number>;
  }> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const whereClause = {
      startedAt: { gte: hoursAgo },
      ...(userId && { userId })
    };
    
    const logs = await prisma.syncLog.findMany({
      where: whereClause,
      select: {
        status: true,
        syncType: true,
        duration: true
      }
    });
    
    const byType = logs.reduce((acc, log) => {
      acc[log.syncType as SyncType] = (acc[log.syncType as SyncType] || 0) + 1;
      return acc;
    }, {} as Record<SyncType, number>);
    
    const successful = logs.filter(log => log.status === SyncStatus.SUCCESS);
    const averageDuration = successful.length > 0
      ? successful.reduce((sum, log) => sum + (log.duration || 0), 0) / successful.length
      : 0;
    
    return {
      total: logs.length,
      successful: successful.length,
      failed: logs.filter(log => log.status === SyncStatus.FAILED).length,
      pending: logs.filter(log => log.status === SyncStatus.PENDING).length,
      averageDuration: Math.round(averageDuration),
      byType
    };
  }
}

// Export singleton instance
export const syncScheduler = new SyncScheduler();

// Load persisted queue on startup
syncScheduler.loadPersistedQueue();