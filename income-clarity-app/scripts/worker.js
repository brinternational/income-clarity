#!/usr/bin/env node

/**
 * Standalone Worker Script
 * Production-ready job queue worker with graceful shutdown and health monitoring
 * 
 * Usage: 
 *   node scripts/worker.js
 *   NODE_ENV=production node scripts/worker.js --concurrency=5
 *   node scripts/worker.js --queue=sync --concurrency=3
 * 
 * Environment Variables:
 *   REDIS_HOST - Redis server host (default: localhost)
 *   REDIS_PORT - Redis server port (default: 6379)  
 *   REDIS_PASSWORD - Redis password
 *   WORKER_CONCURRENCY - Number of concurrent jobs (default: 3)
 *   WORKER_QUEUES - Comma-separated list of queues to process (default: all)
 *   HEALTH_CHECK_PORT - Port for health check endpoint (default: 3001)
 *   WORKER_NAME - Worker instance name (default: auto-generated)
 */

const { Worker, QueueScheduler } = require('bullmq');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Ensure we're in the correct directory
process.chdir(path.join(__dirname, '..'));

// Load environment variables
require('dotenv').config();

// Configuration
const CONFIG = {
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
  queues: process.env.WORKER_QUEUES ? process.env.WORKER_QUEUES.split(',') : ['sync', 'email', 'cleanup', 'webhook', 'notifications'],
  healthCheckPort: parseInt(process.env.HEALTH_CHECK_PORT || '3001'),
  workerName: process.env.WORKER_NAME || `worker-${process.pid}-${Date.now()}`,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
  },
  shutdownTimeout: 30000, // 30 seconds
  healthCheckInterval: 30000, // 30 seconds
};

// Parse command line arguments
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('--concurrency=')) {
    CONFIG.concurrency = parseInt(arg.split('=')[1]) || CONFIG.concurrency;
  } else if (arg.startsWith('--queue=')) {
    CONFIG.queues = [arg.split('=')[1]];
  } else if (arg.startsWith('--health-port=')) {
    CONFIG.healthCheckPort = parseInt(arg.split('=')[1]) || CONFIG.healthCheckPort;
  }
});

// Global state
const state = {
  workers: new Map(),
  schedulers: new Map(),
  healthServer: null,
  isShuttingDown: false,
  startTime: Date.now(),
  stats: {
    totalProcessed: 0,
    totalFailed: 0,
    currentActive: 0,
    lastActivity: Date.now(),
  }
};

// Logging utility
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level: level.toUpperCase(),
    worker: CONFIG.workerName,
    message,
    ...data
  };
  
  if (level === 'error') {
    console.error(JSON.stringify(logData));
  } else {
    console.log(JSON.stringify(logData));
  }
}

/**
 * Load job processors dynamically
 */
function getJobProcessor(queueName) {
  try {
    switch (queueName) {
      case 'sync':
      case 'webhook':
        const { syncProcessor } = require('./lib/jobs/processors/sync.processor.ts');
        return syncProcessor;
        
      case 'email':
      case 'notifications':
        const { emailProcessor } = require('./lib/jobs/processors/email.processor.ts');
        return emailProcessor;
        
      case 'cleanup':
        const { cleanupProcessor } = require('./lib/jobs/processors/cleanup.processor.ts');
        return cleanupProcessor;
        
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  } catch (error) {
    log('error', 'Failed to load processor', { queueName, error: error.message });
    throw error;
  }
}

/**
 * Initialize workers for specified queues
 */
async function initializeWorkers() {
  log('info', 'Initializing workers', { 
    queues: CONFIG.queues, 
    concurrency: CONFIG.concurrency 
  });

  for (const queueName of CONFIG.queues) {
    try {
      // Get processor for this queue
      const processor = getJobProcessor(queueName);
      
      // Create worker
      const worker = new Worker(queueName, processor, {
        connection: CONFIG.redis,
        concurrency: CONFIG.concurrency,
        removeOnComplete: 100,
        removeOnFail: 50,
      });

      // Add event listeners
      addWorkerEventListeners(worker, queueName);
      
      // Store worker
      state.workers.set(queueName, worker);
      
      // Create scheduler for this queue
      const scheduler = new QueueScheduler(queueName, {
        connection: CONFIG.redis,
      });
      
      state.schedulers.set(queueName, scheduler);
      
      log('info', 'Worker initialized', { 
        queueName, 
        concurrency: CONFIG.concurrency 
      });

    } catch (error) {
      log('error', 'Failed to initialize worker', { 
        queueName, 
        error: error.message 
      });
      throw error;
    }
  }
}

/**
 * Add event listeners to worker
 */
function addWorkerEventListeners(worker, queueName) {
  worker.on('ready', () => {
    log('info', 'Worker ready', { queueName });
  });

  worker.on('active', (job) => {
    state.stats.currentActive++;
    state.stats.lastActivity = Date.now();
    
    log('info', 'Job started', {
      queueName,
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
      active: state.stats.currentActive
    });
  });

  worker.on('completed', (job, result) => {
    state.stats.currentActive--;
    state.stats.totalProcessed++;
    state.stats.lastActivity = Date.now();
    
    log('info', 'Job completed', {
      queueName,
      jobId: job.id,
      jobName: job.name,
      duration: result?.duration,
      active: state.stats.currentActive,
      totalProcessed: state.stats.totalProcessed
    });
  });

  worker.on('failed', (job, error) => {
    state.stats.currentActive--;
    state.stats.totalFailed++;
    state.stats.lastActivity = Date.now();
    
    log('error', 'Job failed', {
      queueName,
      jobId: job?.id,
      jobName: job?.name,
      attempt: job?.attemptsMade,
      error: error.message,
      active: state.stats.currentActive,
      totalFailed: state.stats.totalFailed
    });
  });

  worker.on('stalled', (jobId) => {
    log('warn', 'Job stalled', { queueName, jobId });
  });

  worker.on('error', (error) => {
    log('error', 'Worker error', { 
      queueName, 
      error: error.message,
      stack: error.stack 
    });
  });

  worker.on('closing', () => {
    log('info', 'Worker closing', { queueName });
  });

  worker.on('closed', () => {
    log('info', 'Worker closed', { queueName });
  });
}

/**
 * Setup health check HTTP server
 */
function setupHealthCheck() {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      handleHealthCheck(req, res);
    } else if (req.url === '/metrics') {
      handleMetrics(req, res);
    } else if (req.url === '/status') {
      handleStatus(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(CONFIG.healthCheckPort, () => {
    log('info', 'Health check server started', { 
      port: CONFIG.healthCheckPort 
    });
  });

  state.healthServer = server;
}

/**
 * Handle health check endpoint
 */
function handleHealthCheck(req, res) {
  const uptime = Date.now() - state.startTime;
  const isHealthy = !state.isShuttingDown && state.workers.size > 0;
  
  const health = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    uptime: Math.round(uptime / 1000),
    worker: CONFIG.workerName,
    queues: Array.from(state.workers.keys()),
    active: state.stats.currentActive,
    processed: state.stats.totalProcessed,
    failed: state.stats.totalFailed,
    lastActivity: new Date(state.stats.lastActivity).toISOString(),
    timestamp: new Date().toISOString()
  };

  res.writeHead(isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(health, null, 2));
}

/**
 * Handle metrics endpoint (Prometheus format)
 */
function handleMetrics(req, res) {
  const uptime = Math.round((Date.now() - state.startTime) / 1000);
  
  const metrics = [
    `# HELP worker_uptime_seconds Worker uptime in seconds`,
    `# TYPE worker_uptime_seconds counter`,
    `worker_uptime_seconds{worker="${CONFIG.workerName}"} ${uptime}`,
    '',
    `# HELP worker_jobs_processed_total Total number of jobs processed`,
    `# TYPE worker_jobs_processed_total counter`,
    `worker_jobs_processed_total{worker="${CONFIG.workerName}"} ${state.stats.totalProcessed}`,
    '',
    `# HELP worker_jobs_failed_total Total number of jobs failed`,
    `# TYPE worker_jobs_failed_total counter`,
    `worker_jobs_failed_total{worker="${CONFIG.workerName}"} ${state.stats.totalFailed}`,
    '',
    `# HELP worker_jobs_active Current number of active jobs`,
    `# TYPE worker_jobs_active gauge`,
    `worker_jobs_active{worker="${CONFIG.workerName}"} ${state.stats.currentActive}`,
    '',
    `# HELP worker_queues_count Number of queues being processed`,
    `# TYPE worker_queues_count gauge`,
    `worker_queues_count{worker="${CONFIG.workerName}"} ${state.workers.size}`,
    ''
  ].join('\n');

  res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
  res.end(metrics);
}

/**
 * Handle status endpoint (detailed)
 */
function handleStatus(req, res) {
  const uptime = Date.now() - state.startTime;
  
  const status = {
    worker: {
      name: CONFIG.workerName,
      pid: process.pid,
      uptime: Math.round(uptime / 1000),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
    queues: Array.from(state.workers.keys()).map(queueName => ({
      name: queueName,
      status: state.workers.get(queueName)?.closing ? 'closing' : 'active'
    })),
    stats: {
      ...state.stats,
      successRate: state.stats.totalProcessed > 0 
        ? ((state.stats.totalProcessed - state.stats.totalFailed) / state.stats.totalProcessed * 100).toFixed(2) + '%'
        : 'N/A'
    },
    config: {
      concurrency: CONFIG.concurrency,
      redis: {
        host: CONFIG.redis.host,
        port: CONFIG.redis.port,
        db: CONFIG.redis.db
      }
    },
    timestamp: new Date().toISOString()
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(status, null, 2));
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  if (state.isShuttingDown) {
    log('warn', 'Shutdown already in progress');
    return;
  }

  state.isShuttingDown = true;
  
  log('info', 'Graceful shutdown initiated', { 
    signal, 
    activeJobs: state.stats.currentActive 
  });

  // Set shutdown timeout
  const shutdownTimer = setTimeout(() => {
    log('error', 'Shutdown timeout exceeded, forcing exit');
    process.exit(1);
  }, CONFIG.shutdownTimeout);

  try {
    // Close health check server
    if (state.healthServer) {
      state.healthServer.close();
      log('info', 'Health check server closed');
    }

    // Close all workers
    const workerClosePromises = [];
    for (const [queueName, worker] of state.workers) {
      log('info', 'Closing worker', { queueName });
      workerClosePromises.push(worker.close());
    }

    await Promise.all(workerClosePromises);
    log('info', 'All workers closed');

    // Close all schedulers
    const schedulerClosePromises = [];
    for (const [queueName, scheduler] of state.schedulers) {
      log('info', 'Closing scheduler', { queueName });
      schedulerClosePromises.push(scheduler.close());
    }

    await Promise.all(schedulerClosePromises);
    log('info', 'All schedulers closed');

    clearTimeout(shutdownTimer);
    
    log('info', 'Graceful shutdown completed', {
      totalProcessed: state.stats.totalProcessed,
      totalFailed: state.stats.totalFailed,
      uptime: Math.round((Date.now() - state.startTime) / 1000)
    });

    process.exit(0);

  } catch (error) {
    clearTimeout(shutdownTimer);
    log('error', 'Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
}

/**
 * Setup signal handlers
 */
function setupSignalHandlers() {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  process.on('uncaughtException', (error) => {
    log('error', 'Uncaught exception', { error: error.message, stack: error.stack });
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    log('error', 'Unhandled rejection', { reason, promise });
    gracefulShutdown('unhandledRejection');
  });
}

/**
 * Periodic health monitoring
 */
function startHealthMonitoring() {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);
    
    log('info', 'Worker health check', {
      memory: `${memUsageMB}MB`,
      active: state.stats.currentActive,
      processed: state.stats.totalProcessed,
      failed: state.stats.totalFailed,
      uptime: Math.round((Date.now() - state.startTime) / 1000)
    });

    // Alert if memory usage is too high (over 1GB)
    if (memUsageMB > 1024) {
      log('warn', 'High memory usage detected', { memoryMB: memUsageMB });
    }

    // Alert if no activity for too long (over 5 minutes)
    const timeSinceActivity = Date.now() - state.stats.lastActivity;
    if (timeSinceActivity > 5 * 60 * 1000) {
      log('warn', 'No job activity detected', { 
        minutesSinceActivity: Math.round(timeSinceActivity / 60000) 
      });
    }

  }, CONFIG.healthCheckInterval);
}

/**
 * Main execution function
 */
async function main() {
  log('info', 'Worker starting', { 
    config: CONFIG,
    pid: process.pid,
    nodeVersion: process.version
  });

  try {
    // Setup signal handlers
    setupSignalHandlers();

    // Initialize workers
    await initializeWorkers();

    // Setup health check server
    setupHealthCheck();

    // Start health monitoring
    startHealthMonitoring();

    log('info', 'Worker started successfully', {
      queues: CONFIG.queues,
      concurrency: CONFIG.concurrency,
      healthPort: CONFIG.healthCheckPort
    });

  } catch (error) {
    log('error', 'Failed to start worker', { error: error.message });
    process.exit(1);
  }
}

// Start the worker if this script is run directly
if (require.main === module) {
  main().catch((error) => {
    log('error', 'Worker startup failed', { error: error.message });
    process.exit(1);
  });
}

module.exports = { main, gracefulShutdown };