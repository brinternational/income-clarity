/**
 * Alert rules configuration and management system
 * Defines alert thresholds, priorities, and notification channels
 */

import { ErrorCategory, ErrorSeverity } from '../monitoring.service';

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertConditionType {
  THRESHOLD = 'threshold',
  RATE = 'rate',
  PERCENTAGE = 'percentage',
  ANOMALY = 'anomaly',
  ABSENCE = 'absence'
}

export enum AlertChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  PAGERDUTY = 'pagerduty',
  SMS = 'sms'
}

export interface AlertCondition {
  type: AlertConditionType;
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'ne';
  threshold: number;
  timeWindow: number; // minutes
  evaluationPeriod: number; // minutes
  filters?: Record<string, string>;
}

export interface AlertNotification {
  channel: AlertChannel;
  severity: AlertSeverity[];
  config: Record<string, any>;
  cooldown: number; // minutes
  escalation?: {
    delay: number; // minutes
    escalateTo: AlertChannel[];
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  enabled: boolean;
  conditions: AlertCondition[];
  notifications: AlertNotification[];
  tags: Record<string, string>;
  schedule?: {
    timezone: string;
    activeHours?: {
      start: string; // HH:MM
      end: string;   // HH:MM
    };
    activeDays?: number[]; // 0-6, Sunday=0
  };
  metadata: {
    createdAt: string;
    createdBy: string;
    lastModified: string;
    lastTriggered?: string;
    triggerCount: number;
  };
}

export interface AlertRuleGroup {
  name: string;
  description: string;
  rules: AlertRule[];
  enabled: boolean;
}

/**
 * Predefined alert rules for common scenarios
 */
export const DefaultAlertRules: AlertRuleGroup[] = [
  {
    name: 'Critical System Alerts',
    description: 'High-priority alerts for system failures and critical issues',
    enabled: true,
    rules: [
      {
        id: 'payment-failures-critical',
        name: 'Critical Payment Failures',
        description: 'Alert when payment processing fails',
        severity: AlertSeverity.CRITICAL,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.THRESHOLD,
            metric: 'payment_failures',
            operator: 'gte',
            threshold: 1,
            timeWindow: 5,
            evaluationPeriod: 1,
            filters: { severity: 'CRITICAL' }
          }
        ],
        notifications: [
          {
            channel: AlertChannel.PAGERDUTY,
            severity: [AlertSeverity.CRITICAL],
            config: { 
              serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
              incidentTitle: 'Critical Payment Processing Failure'
            },
            cooldown: 30,
            escalation: {
              delay: 15,
              escalateTo: [AlertChannel.SMS]
            }
          },
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.CRITICAL],
            config: {
              webhook: process.env.SLACK_CRITICAL_WEBHOOK,
              channel: '#critical-alerts',
              mention: '@channel'
            },
            cooldown: 5
          }
        ],
        tags: { team: 'platform', category: 'payment' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'database-connection-failure',
        name: 'Database Connection Failure',
        description: 'Alert when database becomes unavailable',
        severity: AlertSeverity.CRITICAL,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.THRESHOLD,
            metric: 'database_errors',
            operator: 'gte',
            threshold: 3,
            timeWindow: 5,
            evaluationPeriod: 1
          }
        ],
        notifications: [
          {
            channel: AlertChannel.PAGERDUTY,
            severity: [AlertSeverity.CRITICAL],
            config: { 
              serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
              incidentTitle: 'Database Connection Failure'
            },
            cooldown: 30
          },
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.CRITICAL],
            config: {
              webhook: process.env.SLACK_CRITICAL_WEBHOOK,
              channel: '#critical-alerts'
            },
            cooldown: 10
          }
        ],
        tags: { team: 'platform', category: 'database' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'security-breach-attempt',
        name: 'Security Breach Attempt',
        description: 'Alert on suspicious security activity',
        severity: AlertSeverity.CRITICAL,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.THRESHOLD,
            metric: 'security_events',
            operator: 'gte',
            threshold: 5,
            timeWindow: 10,
            evaluationPeriod: 2,
            filters: { type: 'suspicious_activity' }
          }
        ],
        notifications: [
          {
            channel: AlertChannel.PAGERDUTY,
            severity: [AlertSeverity.CRITICAL],
            config: { 
              serviceKey: process.env.PAGERDUTY_SECURITY_KEY,
              incidentTitle: 'Potential Security Breach Detected'
            },
            cooldown: 60
          },
          {
            channel: AlertChannel.EMAIL,
            severity: [AlertSeverity.CRITICAL],
            config: {
              to: ['security@incomeClarity.com', 'devops@incomeClarity.com'],
              subject: 'SECURITY ALERT: Potential breach detected'
            },
            cooldown: 30
          }
        ],
        tags: { team: 'security', category: 'security' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      }
    ]
  },
  {
    name: 'Performance Alerts',
    description: 'Alerts for performance degradation and resource issues',
    enabled: true,
    rules: [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        description: 'Alert when API error rate exceeds threshold',
        severity: AlertSeverity.HIGH,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.RATE,
            metric: 'api_error_rate',
            operator: 'gt',
            threshold: 0.05, // 5%
            timeWindow: 15,
            evaluationPeriod: 5
          }
        ],
        notifications: [
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.HIGH],
            config: {
              webhook: process.env.SLACK_ALERTS_WEBHOOK,
              channel: '#alerts'
            },
            cooldown: 30
          },
          {
            channel: AlertChannel.EMAIL,
            severity: [AlertSeverity.HIGH],
            config: {
              to: ['dev-team@incomeClarity.com'],
              subject: 'High Error Rate Detected'
            },
            cooldown: 60
          }
        ],
        tags: { team: 'platform', category: 'performance' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        description: 'Alert when API response time is consistently slow',
        severity: AlertSeverity.MEDIUM,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.THRESHOLD,
            metric: 'api_response_time_p95',
            operator: 'gt',
            threshold: 5000, // 5 seconds
            timeWindow: 10,
            evaluationPeriod: 5
          }
        ],
        notifications: [
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.MEDIUM, AlertSeverity.HIGH],
            config: {
              webhook: process.env.SLACK_ALERTS_WEBHOOK,
              channel: '#performance'
            },
            cooldown: 45
          }
        ],
        tags: { team: 'platform', category: 'performance' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'memory-usage-high',
        name: 'High Memory Usage',
        description: 'Alert when memory usage exceeds safe thresholds',
        severity: AlertSeverity.HIGH,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.PERCENTAGE,
            metric: 'memory_usage_percentage',
            operator: 'gt',
            threshold: 85,
            timeWindow: 10,
            evaluationPeriod: 3
          }
        ],
        notifications: [
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.HIGH],
            config: {
              webhook: process.env.SLACK_ALERTS_WEBHOOK,
              channel: '#infrastructure'
            },
            cooldown: 30
          }
        ],
        tags: { team: 'devops', category: 'infrastructure' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      }
    ]
  },
  {
    name: 'Business Alerts',
    description: 'Alerts for business metrics and user experience issues',
    enabled: true,
    rules: [
      {
        id: 'sync-failure-rate',
        name: 'High Sync Failure Rate',
        description: 'Alert when too many sync operations are failing',
        severity: AlertSeverity.MEDIUM,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.RATE,
            metric: 'sync_failure_rate',
            operator: 'gt',
            threshold: 0.25, // 25%
            timeWindow: 30,
            evaluationPeriod: 10
          }
        ],
        notifications: [
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.MEDIUM, AlertSeverity.HIGH],
            config: {
              webhook: process.env.SLACK_ALERTS_WEBHOOK,
              channel: '#product'
            },
            cooldown: 60
          }
        ],
        tags: { team: 'product', category: 'sync' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'user-signup-drop',
        name: 'User Signup Drop',
        description: 'Alert when user signups drop significantly',
        severity: AlertSeverity.MEDIUM,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.ANOMALY,
            metric: 'user_signups',
            operator: 'lt',
            threshold: -50, // 50% below normal
            timeWindow: 60,
            evaluationPeriod: 15
          }
        ],
        notifications: [
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.MEDIUM],
            config: {
              webhook: process.env.SLACK_ALERTS_WEBHOOK,
              channel: '#growth'
            },
            cooldown: 120
          }
        ],
        tags: { team: 'growth', category: 'business' },
        schedule: {
          timezone: 'America/New_York',
          activeHours: { start: '09:00', end: '18:00' },
          activeDays: [1, 2, 3, 4, 5] // Monday-Friday
        },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'revenue-drop',
        name: 'Revenue Drop Alert',
        description: 'Alert when daily revenue drops significantly',
        severity: AlertSeverity.HIGH,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.PERCENTAGE,
            metric: 'daily_revenue',
            operator: 'lt',
            threshold: -30, // 30% below expected
            timeWindow: 1440, // 24 hours
            evaluationPeriod: 60
          }
        ],
        notifications: [
          {
            channel: AlertChannel.EMAIL,
            severity: [AlertSeverity.HIGH],
            config: {
              to: ['finance@incomeClarity.com', 'leadership@incomeClarity.com'],
              subject: 'Revenue Drop Alert'
            },
            cooldown: 240 // 4 hours
          },
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.HIGH],
            config: {
              webhook: process.env.SLACK_FINANCE_WEBHOOK,
              channel: '#finance',
              mention: '@here'
            },
            cooldown: 120
          }
        ],
        tags: { team: 'finance', category: 'revenue' },
        schedule: {
          timezone: 'America/New_York',
          activeHours: { start: '08:00', end: '20:00' }
        },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      }
    ]
  },
  {
    name: 'Infrastructure Alerts',
    description: 'Alerts for infrastructure and external service issues',
    enabled: true,
    rules: [
      {
        id: 'yodlee-api-failure',
        name: 'Yodlee API Failure',
        description: 'Alert when Yodlee API is unavailable',
        severity: AlertSeverity.HIGH,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.THRESHOLD,
            metric: 'yodlee_api_errors',
            operator: 'gte',
            threshold: 5,
            timeWindow: 10,
            evaluationPeriod: 3
          }
        ],
        notifications: [
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.HIGH],
            config: {
              webhook: process.env.SLACK_ALERTS_WEBHOOK,
              channel: '#integrations'
            },
            cooldown: 30
          }
        ],
        tags: { team: 'platform', category: 'external_api' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'queue-backup',
        name: 'Queue Backup',
        description: 'Alert when job queue has too many pending jobs',
        severity: AlertSeverity.MEDIUM,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.THRESHOLD,
            metric: 'queue_depth',
            operator: 'gt',
            threshold: 1000,
            timeWindow: 15,
            evaluationPeriod: 5
          }
        ],
        notifications: [
          {
            channel: AlertChannel.SLACK,
            severity: [AlertSeverity.MEDIUM, AlertSeverity.HIGH],
            config: {
              webhook: process.env.SLACK_ALERTS_WEBHOOK,
              channel: '#infrastructure'
            },
            cooldown: 60
          }
        ],
        tags: { team: 'devops', category: 'queue' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      },
      {
        id: 'ssl-certificate-expiry',
        name: 'SSL Certificate Expiry',
        description: 'Alert when SSL certificate is about to expire',
        severity: AlertSeverity.HIGH,
        enabled: true,
        conditions: [
          {
            type: AlertConditionType.THRESHOLD,
            metric: 'ssl_certificate_days_remaining',
            operator: 'lt',
            threshold: 14, // 14 days
            timeWindow: 60,
            evaluationPeriod: 60
          }
        ],
        notifications: [
          {
            channel: AlertChannel.EMAIL,
            severity: [AlertSeverity.HIGH],
            config: {
              to: ['devops@incomeClarity.com'],
              subject: 'SSL Certificate Expiry Warning'
            },
            cooldown: 1440 // 24 hours
          }
        ],
        tags: { team: 'devops', category: 'security' },
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          lastModified: new Date().toISOString(),
          triggerCount: 0
        }
      }
    ]
  }
];

/**
 * Alert rule templates for quick setup
 */
export const AlertRuleTemplates = {
  errorRate: (metric: string, threshold: number = 0.05): Partial<AlertRule> => ({
    name: `High Error Rate - ${metric}`,
    severity: AlertSeverity.HIGH,
    conditions: [{
      type: AlertConditionType.RATE,
      metric,
      operator: 'gt',
      threshold,
      timeWindow: 15,
      evaluationPeriod: 5
    }],
    notifications: [{
      channel: AlertChannel.SLACK,
      severity: [AlertSeverity.HIGH],
      config: { channel: '#alerts' },
      cooldown: 30
    }]
  }),

  responseTime: (metric: string, threshold: number = 5000): Partial<AlertRule> => ({
    name: `Slow Response Time - ${metric}`,
    severity: AlertSeverity.MEDIUM,
    conditions: [{
      type: AlertConditionType.THRESHOLD,
      metric,
      operator: 'gt',
      threshold,
      timeWindow: 10,
      evaluationPeriod: 5
    }],
    notifications: [{
      channel: AlertChannel.SLACK,
      severity: [AlertSeverity.MEDIUM],
      config: { channel: '#performance' },
      cooldown: 45
    }]
  }),

  resourceUsage: (metric: string, threshold: number = 85): Partial<AlertRule> => ({
    name: `High Resource Usage - ${metric}`,
    severity: AlertSeverity.HIGH,
    conditions: [{
      type: AlertConditionType.PERCENTAGE,
      metric,
      operator: 'gt',
      threshold,
      timeWindow: 10,
      evaluationPeriod: 3
    }],
    notifications: [{
      channel: AlertChannel.SLACK,
      severity: [AlertSeverity.HIGH],
      config: { channel: '#infrastructure' },
      cooldown: 30
    }]
  }),

  serviceDown: (metric: string): Partial<AlertRule> => ({
    name: `Service Down - ${metric}`,
    severity: AlertSeverity.CRITICAL,
    conditions: [{
      type: AlertConditionType.ABSENCE,
      metric,
      operator: 'eq',
      threshold: 0,
      timeWindow: 5,
      evaluationPeriod: 2
    }],
    notifications: [
      {
        channel: AlertChannel.PAGERDUTY,
        severity: [AlertSeverity.CRITICAL],
        config: { incidentTitle: `Service Down: ${metric}` },
        cooldown: 30
      },
      {
        channel: AlertChannel.SLACK,
        severity: [AlertSeverity.CRITICAL],
        config: { channel: '#critical-alerts', mention: '@channel' },
        cooldown: 5
      }
    ]
  })
};

/**
 * Notification channel configurations
 */
export const NotificationChannelConfigs = {
  [AlertChannel.EMAIL]: {
    required: ['to', 'subject'],
    optional: ['from', 'template', 'templateData']
  },
  [AlertChannel.SLACK]: {
    required: ['webhook'],
    optional: ['channel', 'username', 'iconEmoji', 'mention']
  },
  [AlertChannel.WEBHOOK]: {
    required: ['url'],
    optional: ['method', 'headers', 'auth']
  },
  [AlertChannel.PAGERDUTY]: {
    required: ['serviceKey'],
    optional: ['incidentTitle', 'severity', 'client', 'clientUrl']
  },
  [AlertChannel.SMS]: {
    required: ['phoneNumber'],
    optional: ['provider', 'apiKey']
  }
};

export default {
  DefaultAlertRules,
  AlertRuleTemplates,
  NotificationChannelConfigs,
  AlertSeverity,
  AlertConditionType,
  AlertChannel
};