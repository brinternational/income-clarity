/**
 * Queue Wrapper Service
 * Provides a unified interface for both legacy sync scheduler and new BullMQ system
 * Acts as a compatibility layer during migration
 */

import { logger } from '../logger';
import { queueMigrationService } from './migration-service';
import { SyncType } from '../services/sync/sync-orchestrator.service';
import { JOB_TYPES, QUEUE_NAMES } from './queue-config';
import { jobScheduler } from './job-scheduler.service';

/**
 * Unified Queue Service Interface
 * This service provides the same interface as the original sync scheduler
 * but intelligently routes to either legacy or BullMQ based on configuration
 */
export class QueueWrapperService {
  private isInitialized = false;

  /**
   * Initialize the queue wrapper service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing queue wrapper service');
      
      // Initialize migration service
      await queueMigrationService.initialize();
      
      this.isInitialized = true;
      logger.info('Queue wrapper service initialized');

    } catch (error) {
      logger.error('Failed to initialize queue wrapper service', { error: error.message });
      throw error;
    }
  }

  /**
   * Enqueue sync job (compatible with legacy interface)
   */
  async enqueueSync(
    userId: string,
    syncType: SyncType,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await queueMigrationService.enqueueSync(userId, syncType, metadata);
  }

  /**
   * Cancel sync job (compatible with legacy interface)
   */
  async cancelSync(syncId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await queueMigrationService.cancelSync(syncId);
  }

  /**
   * Get queue status (enhanced with both legacy and BullMQ info)
   */
  async getQueueStatus(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await queueMigrationService.getQueueStatus();
  }

  /**
   * Add email job to queue
   */
  async enqueueEmail(
    emailType: string,
    emailData: any,
    options: {
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
      delay?: number;
      scheduledAt?: Date;
    } = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Map email type to job type
      const jobType = this.mapEmailTypeToJobType(emailType);
      
      const job = await jobScheduler.addJob(
        QUEUE_NAMES.EMAIL,
        jobType,
        emailData,
        {
          priority: options.priority || 'NORMAL',
          delay: options.delay,
          scheduledAt: options.scheduledAt
        }
      );

      logger.info('Email job enqueued', {
        emailType,
        jobId: job.id,
        priority: options.priority
      });

      return job.id?.toString() || `email-${Date.now()}`;

    } catch (error) {
      logger.error('Failed to enqueue email job', {
        emailType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Add cleanup job to queue
   */
  async enqueueCleanup(
    cleanupType: string,
    cleanupData: any,
    options: {
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
      delay?: number;
    } = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const jobType = this.mapCleanupTypeToJobType(cleanupType);
      
      const job = await jobScheduler.addJob(
        QUEUE_NAMES.CLEANUP,
        jobType,
        cleanupData,
        {
          priority: options.priority || 'LOW',
          delay: options.delay
        }
      );

      logger.info('Cleanup job enqueued', {
        cleanupType,
        jobId: job.id,
        priority: options.priority
      });

      return job.id?.toString() || `cleanup-${Date.now()}`;

    } catch (error) {
      logger.error('Failed to enqueue cleanup job', {
        cleanupType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Schedule recurring sync job
   */
  async scheduleRecurringSync(
    pattern: string,
    syncData: any,
    options: {
      jobId?: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    } = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const job = await jobScheduler.addJob(
        QUEUE_NAMES.SYNC,
        JOB_TYPES.SYNC.YODLEE_SCHEDULED,
        syncData,
        {
          repeat: { pattern },
          priority: options.priority || 'LOW',
          jobId: options.jobId
        }
      );

      logger.info('Recurring sync scheduled', {
        pattern,
        jobId: job.id,
        priority: options.priority
      });

      return job.id?.toString() || `recurring-${Date.now()}`;

    } catch (error) {
      logger.error('Failed to schedule recurring sync', {
        pattern,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process webhook sync immediately
   */
  async processWebhook(
    userId: string,
    webhookData: any,
    priority: 'HIGH' | 'CRITICAL' = 'CRITICAL'
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const job = await jobScheduler.addJob(
        QUEUE_NAMES.WEBHOOK,
        JOB_TYPES.SYNC.YODLEE_WEBHOOK,
        {
          userId,
          syncType: SyncType.WEBHOOK,
          webhookData,
          triggeredAt: new Date().toISOString()
        },
        {
          priority,
          attempts: 5
        }
      );

      logger.info('Webhook job enqueued', {
        userId,
        jobId: job.id,
        priority
      });

      return job.id?.toString() || `webhook-${Date.now()}`;

    } catch (error) {
      logger.error('Failed to process webhook', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get comprehensive queue statistics
   */
  async getDetailedStats(): Promise<{
    migration: any;
    queues: Record<string, any>;
    totals: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    health: {
      overall: 'healthy' | 'degraded' | 'unhealthy';
      details: any;
    };
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [migrationStats, queueStatus, queueStats, healthCheck] = await Promise.all([
        queueMigrationService.getMigrationStats(),
        queueMigrationService.getQueueStatus(),
        jobScheduler.getAllQueueStats(),
        jobScheduler.healthCheck()
      ]);

      // Calculate totals
      const totals = Object.values(queueStats).reduce((acc: any, stats: any) => {
        if (stats.error) return acc;
        
        return {
          waiting: acc.waiting + (stats.waiting || 0),
          active: acc.active + (stats.active || 0),
          completed: acc.completed + (stats.completed || 0),
          failed: acc.failed + (stats.failed || 0),
        };
      }, { waiting: 0, active: 0, completed: 0, failed: 0 });

      // Determine overall health
      let overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (healthCheck.status === 'unhealthy') {
        overallHealth = 'unhealthy';
      } else if (healthCheck.errors.length > 0 || !migrationStats.systemHealth.bullmq) {
        overallHealth = 'degraded';
      }

      return {
        migration: migrationStats,
        queues: queueStats,
        totals,
        health: {
          overall: overallHealth,
          details: {
            ...healthCheck,
            migration: queueStatus.migration
          }
        }
      };

    } catch (error) {
      logger.error('Failed to get detailed stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Pause/Resume queue operations
   */
  async pauseQueue(queueName: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await jobScheduler.pauseQueue(queueName);
  }

  async resumeQueue(queueName: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await jobScheduler.resumeQueue(queueName);
  }

  /**
   * Retry failed jobs
   */
  async retryFailedJobs(queueName: string, limit = 50): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const failedJobs = await jobScheduler.getFailedJobs(queueName, 0, limit);
      let retriedCount = 0;

      for (const job of failedJobs) {
        if (job.id) {
          const success = await jobScheduler.retryJob(queueName, job.id.toString());
          if (success) {
            retriedCount++;
          }
        }
      }

      logger.info('Failed jobs retried', {
        queueName,
        total: failedJobs.length,
        retried: retriedCount
      });

      return retriedCount;

    } catch (error) {
      logger.error('Failed to retry failed jobs', {
        queueName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Clear completed jobs from queue
   */
  async clearCompletedJobs(queueName: string): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await jobScheduler.clearQueue(queueName, 'completed');
  }

  /**
   * Map email type to BullMQ job type
   */
  private mapEmailTypeToJobType(emailType: string): string {
    const mapping: Record<string, string> = {
      'welcome': JOB_TYPES.EMAIL.WELCOME,
      'sync-success': JOB_TYPES.EMAIL.SYNC_SUCCESS,
      'sync-failure': JOB_TYPES.EMAIL.SYNC_FAILURE,
      'weekly-digest': JOB_TYPES.EMAIL.WEEKLY_DIGEST,
      'password-reset': JOB_TYPES.EMAIL.PASSWORD_RESET,
      'upgrade': JOB_TYPES.EMAIL.UPGRADE,
      'subscription-reminder': JOB_TYPES.EMAIL.SUBSCRIPTION_REMINDER,
    };

    return mapping[emailType] || emailType;
  }

  /**
   * Map cleanup type to BullMQ job type
   */
  private mapCleanupTypeToJobType(cleanupType: string): string {
    const mapping: Record<string, string> = {
      'sync-logs': JOB_TYPES.CLEANUP.SYNC_LOGS,
      'sessions': JOB_TYPES.CLEANUP.SESSIONS,
      'cache': JOB_TYPES.CLEANUP.CACHE,
      'old-data': JOB_TYPES.CLEANUP.OLD_DATA,
      'temp-files': JOB_TYPES.CLEANUP.TEMP_FILES,
    };

    return mapping[cleanupType] || cleanupType;
  }

  /**
   * Update migration configuration at runtime
   */
  updateMigrationConfig(config: any): void {
    queueMigrationService.updateConfig(config);
  }

  /**
   * Health check for the entire queue system
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    errors: string[];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [jobSchedulerHealth, migrationStats] = await Promise.all([
        jobScheduler.healthCheck(),
        queueMigrationService.getMigrationStats()
      ]);

      const checks = {
        jobScheduler: jobSchedulerHealth.status === 'healthy',
        redis: jobSchedulerHealth.redis,
        migration: migrationStats.systemHealth.bullmq || migrationStats.systemHealth.legacy,
        workers: Object.values(jobSchedulerHealth.workers).every(w => w),
        queues: Object.values(jobSchedulerHealth.queues).every(q => q),
      };

      const errors: string[] = [...jobSchedulerHealth.errors];
      
      const healthyChecks = Object.values(checks).filter(c => c).length;
      const totalChecks = Object.values(checks).length;
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (healthyChecks === totalChecks) {
        status = 'healthy';
      } else if (healthyChecks >= totalChecks * 0.7) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        status,
        checks,
        errors
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        checks: {},
        errors: [error.message]
      };
    }
  }
}

// Export singleton instance
export const queueService = new QueueWrapperService();