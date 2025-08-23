/**
 * Job Scheduler Service
 * Central service for managing job queues, scheduling recurring jobs, and monitoring job lifecycle
 */

import { Queue, Worker, Job, RepeatOptions } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { 
  QUEUE_NAMES, 
  JOB_TYPES, 
  getBullMQConnection, 
  getJobOptions,
  CRON_PATTERNS,
  RATE_LIMITS,
  getRedisInstance
} from './queue-config';
import { syncProcessor } from './processors/sync.processor';
import { emailProcessor } from './processors/email.processor';
import { cleanupProcessor } from './processors/cleanup.processor';

const prisma = new PrismaClient();

/**
 * Job Scheduler Service - Manages all job queues and workers
 */
export class JobSchedulerService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private isInitialized = false;

  constructor() {
    // Bind methods to preserve context
    this.handleGracefulShutdown = this.handleGracefulShutdown.bind(this);
  }

  /**
   * Initialize all queues, workers, and schedulers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Job scheduler already initialized');
      return;
    }

    try {
      logger.info('Initializing job scheduler service...');

      const connection = getBullMQConnection();

      // Initialize queues
      await this.initializeQueues(connection);

      // Initialize workers
      await this.initializeWorkers(connection);

      // Setup recurring jobs
      await this.setupRecurringJobs();

      // Setup graceful shutdown handlers
      this.setupGracefulShutdown();

      this.isInitialized = true;

      logger.info('Job scheduler service initialized successfully', {
        queues: this.queues.size,
        workers: this.workers.size
      });

    } catch (error) {
      logger.error('Failed to initialize job scheduler service', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize all job queues
   */
  private async initializeQueues(connection: any): Promise<void> {
    for (const [queueKey, queueName] of Object.entries(QUEUE_NAMES)) {
      try {
        const queue = new Queue(queueName, {
          connection,
          defaultJobOptions: getJobOptions(queueKey as keyof typeof QUEUE_NAMES),
        });

        // Add queue event listeners
        this.addQueueEventListeners(queue, queueName);

        this.queues.set(queueName, queue);

        logger.info('Queue initialized', { queueName });

      } catch (error) {
        logger.error('Failed to initialize queue', { queueName, error: error.message });
        throw error;
      }
    }
  }

  /**
   * Initialize all job workers
   */
  private async initializeWorkers(connection: any): Promise<void> {
    // Sync Worker
    const syncWorker = new Worker(QUEUE_NAMES.SYNC, syncProcessor, {
      connection,
      concurrency: 3, // Process up to 3 sync jobs concurrently
      limiter: RATE_LIMITS[QUEUE_NAMES.SYNC],
    });

    this.addWorkerEventListeners(syncWorker, 'sync');
    this.workers.set(QUEUE_NAMES.SYNC, syncWorker);

    // Email Worker
    const emailWorker = new Worker(QUEUE_NAMES.EMAIL, emailProcessor, {
      connection,
      concurrency: 5, // Process up to 5 email jobs concurrently
      limiter: RATE_LIMITS[QUEUE_NAMES.EMAIL],
    });

    this.addWorkerEventListeners(emailWorker, 'email');
    this.workers.set(QUEUE_NAMES.EMAIL, emailWorker);

    // Cleanup Worker
    const cleanupWorker = new Worker(QUEUE_NAMES.CLEANUP, cleanupProcessor, {
      connection,
      concurrency: 1, // Only one cleanup job at a time
      limiter: RATE_LIMITS[QUEUE_NAMES.CLEANUP],
    });

    this.addWorkerEventListeners(cleanupWorker, 'cleanup');
    this.workers.set(QUEUE_NAMES.CLEANUP, cleanupWorker);

    // Webhook Worker (shares sync processor for webhook syncs)
    const webhookWorker = new Worker(QUEUE_NAMES.WEBHOOK, syncProcessor, {
      connection,
      concurrency: 5, // High concurrency for webhooks
      limiter: RATE_LIMITS[QUEUE_NAMES.WEBHOOK],
    });

    this.addWorkerEventListeners(webhookWorker, 'webhook');
    this.workers.set(QUEUE_NAMES.WEBHOOK, webhookWorker);

    // Notifications Worker (shares email processor)
    const notificationsWorker = new Worker(QUEUE_NAMES.NOTIFICATIONS, emailProcessor, {
      connection,
      concurrency: 10, // High concurrency for notifications
      limiter: RATE_LIMITS[QUEUE_NAMES.NOTIFICATIONS],
    });

    this.addWorkerEventListeners(notificationsWorker, 'notifications');
    this.workers.set(QUEUE_NAMES.NOTIFICATIONS, notificationsWorker);

    logger.info('All workers initialized', { workerCount: this.workers.size });
  }


  /**
   * Setup recurring jobs
   */
  private async setupRecurringJobs(): Promise<void> {
    const syncQueue = this.getQueue(QUEUE_NAMES.SYNC);
    const cleanupQueue = this.getQueue(QUEUE_NAMES.CLEANUP);
    const emailQueue = this.getQueue(QUEUE_NAMES.EMAIL);

    // Nightly sync for all premium users
    await syncQueue.add(
      JOB_TYPES.SYNC.YODLEE_SCHEDULED,
      { 
        type: 'batch_sync',
        triggerType: 'cron',
        metadata: { source: 'nightly_cron' }
      },
      {
        repeat: { pattern: CRON_PATTERNS.NIGHTLY_SYNC },
        priority: 3,
        jobId: 'nightly-sync-cron'
      }
    );

    // Weekly cleanup jobs
    await cleanupQueue.add(
      JOB_TYPES.CLEANUP.SYNC_LOGS,
      { 
        retentionDays: 30,
        keepSuccessfulLogs: true,
        dryRun: false
      },
      {
        repeat: { pattern: CRON_PATTERNS.CLEANUP_WEEKLY },
        priority: 1,
        jobId: 'sync-logs-cleanup-cron'
      }
    );

    await cleanupQueue.add(
      JOB_TYPES.CLEANUP.SESSIONS,
      { 
        expiredOnly: true,
        dryRun: false
      },
      {
        repeat: { pattern: '0 */2 * * *' }, // Every 2 hours
        priority: 1,
        jobId: 'sessions-cleanup-cron'
      }
    );

    // Stock prices update every 4 hours during market hours
    await syncQueue.add(
      JOB_TYPES.SYNC.STOCK_PRICES,
      { 
        forceUpdate: false,
        batchSize: 100
      },
      {
        repeat: { pattern: CRON_PATTERNS.STOCK_PRICES },
        priority: 2,
        jobId: 'stock-prices-update-cron'
      }
    );

    // Weekly digest emails (Monday 9 AM)
    await emailQueue.add(
      JOB_TYPES.EMAIL.WEEKLY_DIGEST,
      { 
        type: 'batch_digest',
        triggerType: 'cron'
      },
      {
        repeat: { pattern: CRON_PATTERNS.EMAIL_DIGEST },
        priority: 3,
        jobId: 'weekly-digest-cron'
      }
    );

    logger.info('Recurring jobs scheduled successfully');
  }

  /**
   * Add a job to a specific queue
   */
  async addJob<T = any>(
    queueName: string,
    jobType: string,
    data: T,
    options: {
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
      delay?: number;
      attempts?: number;
      backoff?: any;
      repeat?: RepeatOptions;
      jobId?: string;
    } = {}
  ): Promise<Job<T>> {
    try {
      const queue = this.getQueue(queueName);
      
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      const jobOptions = {
        ...getJobOptions(queueName as keyof typeof QUEUE_NAMES, options.priority),
        ...options,
        priority: options.priority ? this.getPriorityValue(options.priority) : undefined
      };

      const job = await queue.add(jobType, data, jobOptions);

      logger.info('Job added to queue', {
        queueName,
        jobType,
        jobId: job.id,
        priority: options.priority,
        delay: options.delay
      });

      return job;

    } catch (error) {
      logger.error('Failed to add job to queue', {
        queueName,
        jobType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Remove a job from queue
   */
  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      const queue = this.getQueue(queueName);
      
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      const job = await queue.getJob(jobId);
      
      if (!job) {
        return false;
      }

      await job.remove();

      logger.info('Job removed from queue', { queueName, jobId });
      
      return true;

    } catch (error) {
      logger.error('Failed to remove job from queue', {
        queueName,
        jobId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(queueName: string, jobId: string): Promise<boolean> {
    try {
      const queue = this.getQueue(queueName);
      
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      const job = await queue.getJob(jobId);
      
      if (!job) {
        return false;
      }

      await job.retry();

      logger.info('Job retried', { queueName, jobId });
      
      return true;

    } catch (error) {
      logger.error('Failed to retry job', {
        queueName,
        jobId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    try {
      const queue = this.getQueue(queueName);
      
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      const stats = await queue.getJobCounts();

      return stats;

    } catch (error) {
      logger.error('Failed to get queue stats', {
        queueName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const queueName of this.queues.keys()) {
      try {
        stats[queueName] = await this.getQueueStats(queueName);
      } catch (error) {
        stats[queueName] = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Get failed jobs from a queue
   */
  async getFailedJobs(queueName: string, start = 0, end = 50): Promise<Job[]> {
    try {
      const queue = this.getQueue(queueName);
      
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      return await queue.getFailed(start, end);

    } catch (error) {
      logger.error('Failed to get failed jobs', {
        queueName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Clear all jobs from a queue
   */
  async clearQueue(queueName: string, jobState: 'completed' | 'failed' | 'waiting' | 'active' = 'completed'): Promise<number> {
    try {
      const queue = this.getQueue(queueName);
      
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      const cleared = await queue.clean(0, 1000, jobState);

      logger.info('Queue cleared', { queueName, jobState, cleared });

      return cleared.length;

    } catch (error) {
      logger.error('Failed to clear queue', {
        queueName,
        jobState,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Pause/Resume queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    if (queue) {
      await queue.pause();
      logger.info('Queue paused', { queueName });
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    if (queue) {
      await queue.resume();
      logger.info('Queue resumed', { queueName });
    }
  }

  /**
   * Get queue by name
   */
  private getQueue(queueName: string): Queue | undefined {
    return this.queues.get(queueName);
  }

  /**
   * Convert priority string to number
   */
  private getPriorityValue(priority: string): number {
    const priorities = {
      'CRITICAL': 10,
      'HIGH': 5,
      'NORMAL': 3,
      'LOW': 1,
    };
    return priorities[priority] || 3;
  }

  /**
   * Add event listeners to queue
   */
  private addQueueEventListeners(queue: Queue, queueName: string): void {
    queue.on('error', (error) => {
      logger.error('Queue error', { queueName, error: error.message });
    });

    queue.on('waiting', (job) => {
      logger.debug('Job waiting', { queueName, jobId: job.id, jobName: job.name });
    });

    queue.on('removed', (job) => {
      logger.debug('Job removed', { queueName, jobId: job.id, jobName: job.name });
    });
  }

  /**
   * Add event listeners to worker
   */
  private addWorkerEventListeners(worker: Worker, workerName: string): void {
    worker.on('completed', (job, result) => {
      logger.info('Job completed', {
        worker: workerName,
        jobId: job.id,
        jobName: job.name,
        duration: result?.duration
      });
    });

    worker.on('failed', (job, error) => {
      logger.error('Job failed', {
        worker: workerName,
        jobId: job?.id,
        jobName: job?.name,
        attempt: job?.attemptsMade,
        error: error.message
      });
    });

    worker.on('error', (error) => {
      logger.error('Worker error', { 
        worker: workerName, 
        error: error.message 
      });
    });

    worker.on('stalled', (jobId) => {
      logger.warn('Job stalled', { 
        worker: workerName, 
        jobId 
      });
    });

    worker.on('progress', (job, progress) => {
      logger.debug('Job progress', {
        worker: workerName,
        jobId: job.id,
        progress
      });
    });
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    process.on('SIGTERM', this.handleGracefulShutdown);
    process.on('SIGINT', this.handleGracefulShutdown);
  }

  /**
   * Graceful shutdown of all workers and queues
   */
  async handleGracefulShutdown(signal?: string): Promise<void> {
    logger.info('Graceful shutdown initiated', { signal });

    try {
      // Close all workers first
      for (const [name, worker] of this.workers) {
        logger.info('Closing worker', { name });
        await worker.close();
      }


      // Close all queues
      for (const [name, queue] of this.queues) {
        logger.info('Closing queue', { name });
        await queue.close();
      }

      // Close Redis connection
      const redis = getRedisInstance();
      await redis.quit();

      logger.info('Graceful shutdown completed');

    } catch (error) {
      logger.error('Error during graceful shutdown', { error: error.message });
    }

    process.exit(0);
  }

  /**
   * Health check for the job scheduler system
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    queues: Record<string, boolean>;
    workers: Record<string, boolean>;
    redis: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const queueHealth: Record<string, boolean> = {};
    const workerHealth: Record<string, boolean> = {};

    // Check Redis connection
    let redisHealthy = false;
    try {
      const redis = getRedisInstance();
      await redis.ping();
      redisHealthy = true;
    } catch (error) {
      errors.push(`Redis: ${error.message}`);
    }

    // Check queues
    for (const [name, queue] of this.queues) {
      try {
        await queue.getJobCounts();
        queueHealth[name] = true;
      } catch (error) {
        queueHealth[name] = false;
        errors.push(`Queue ${name}: ${error.message}`);
      }
    }

    // Check workers (simplified check)
    for (const [name, worker] of this.workers) {
      try {
        // Workers don't have a direct health check, so we check if they're not closed
        workerHealth[name] = !worker.closing;
      } catch (error) {
        workerHealth[name] = false;
        errors.push(`Worker ${name}: ${error.message}`);
      }
    }

    const isHealthy = redisHealthy && 
                     Object.values(queueHealth).every(h => h) && 
                     Object.values(workerHealth).every(h => h);

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      queues: queueHealth,
      workers: workerHealth,
      redis: redisHealthy,
      errors
    };
  }
}

// Export singleton instance
export const jobScheduler = new JobSchedulerService();