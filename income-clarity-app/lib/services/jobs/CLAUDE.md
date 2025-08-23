# JOBS SERVICE

## Purpose
Background job processing and queue management for Income Clarity application.

## Structure
```
jobs/
├── job-scheduler.service.ts     # Main job scheduling service
├── queue-wrapper.service.ts     # Queue management wrapper
├── migration-service.ts         # Database migration jobs
├── queue-config.ts              # Queue configuration
└── processors/
    ├── cleanup.processor.ts     # Data cleanup jobs
    ├── email.processor.ts       # Email sending jobs
    └── sync.processor.ts        # Data synchronization jobs
```

## Services

### JobSchedulerService
- **Purpose**: Manages job scheduling and execution
- **Technology**: BullMQ with Redis
- **Features**: Cron jobs, delayed jobs, recurring tasks

### QueueWrapperService  
- **Purpose**: Provides abstraction layer for queue operations
- **Features**: Job creation, monitoring, error handling

### Processors
- **Cleanup**: Removes old data, temp files
- **Email**: Processes email sending queue
- **Sync**: Handles background data synchronization

## Configuration
- Queue configuration in `queue-config.ts`
- Redis connection for job persistence
- Error handling and retry strategies

## Usage
```typescript
import { JobSchedulerService } from '@/lib/services/jobs/job-scheduler.service';
import { QueueWrapperService } from '@/lib/services/jobs/queue-wrapper.service';
```

## Dependencies
- Redis (for job persistence)
- BullMQ (queue management)
- Related to sync and email services

## Status
✅ **ACTIVE** - Core background job infrastructure