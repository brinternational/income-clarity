# LOGGING SERVICE

## Purpose
Centralized logging and audit trail system for Income Clarity application.

## Structure
```
logging/
├── logger.service.ts        # Main logging service
└── audit-logger.service.ts  # Audit trail logging
```

## Services

### LoggerService
- **Purpose**: Centralized application logging
- **Features**: 
  - Structured logging with log levels
  - Request/response logging
  - Error tracking and correlation
  - Performance metrics logging

### AuditLoggerService
- **Purpose**: Security and compliance audit trails
- **Features**:
  - User action logging
  - Data access tracking
  - Security event monitoring
  - Compliance reporting

## Configuration
- Log levels: ERROR, WARN, INFO, DEBUG
- Output formats: JSON for production, readable for development
- Log rotation and retention policies
- Integration with error reporting

## Usage
```typescript
import { LoggerService } from '@/lib/services/logging/logger.service';
import { AuditLoggerService } from '@/lib/services/logging/audit-logger.service';

// Application logging
logger.info('User logged in', { userId, timestamp });

// Audit logging
auditLogger.logUserAction('PORTFOLIO_UPDATE', { userId, changes });
```

## Integration
- Used by all services for consistent logging
- Integrated with monitoring and error reporting
- Feeds into metrics collection

## Status
✅ **ACTIVE** - Core infrastructure service