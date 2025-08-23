/**
 * Environment API Endpoints
 * 
 * Provides RESTful API access to environment identification,
 * validation, and monitoring services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/services/logging/logger.service';
import { environmentDetectionService } from '@/lib/services/deployment/environment-detection.service';
import { deploymentVerificationService } from '@/lib/services/deployment/deployment-verification.service';
import { environmentMonitorService } from '@/lib/services/deployment/environment-monitor.service';
import { uiVerificationService } from '@/lib/services/deployment/ui-verification.service';
import { realTimeMonitorService } from '@/lib/services/deployment/real-time-monitor.service';

/**
 * GET /api/environment - Get current environment information
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'fingerprint';
    const target = url.searchParams.get('target');
    const includeComparison = url.searchParams.get('comparison') === 'true';
    const includeMonitoring = url.searchParams.get('monitoring') === 'true';

    let response: any;

    switch (action) {
      case 'fingerprint':
        // Get current environment fingerprint
        response = await environmentDetectionService.getCurrentEnvironment();
        break;

      case 'compare':
        // Compare with production environment
        response = await environmentDetectionService.compareWithProduction();
        break;

      case 'validate':
        // Validate deployment target
        if (!target) {
          return NextResponse.json({
            error: 'Target parameter required for validation',
            details: 'Use ?action=validate&target=production'
          }, { status: 400 });
        }

        const validationResult = await environmentDetectionService.validateDeploymentTarget(
          target === 'production' ? 'https://incomeclarity.ddns.net' : target
        );
        
        response = validationResult;
        break;

      case 'status':
        // Get monitoring status and environment statuses
        const monitoringStatus = environmentMonitorService.getMonitoringStatus();
        const environmentStatuses = Object.fromEntries(
          environmentMonitorService.getEnvironmentStatuses()
        );

        response = {
          monitoring: monitoringStatus,
          environments: environmentStatuses,
          alerts: environmentMonitorService.getAlerts().slice(0, 10), // Latest 10 alerts
          uiVerification: {
            latestVerification: uiVerificationService.getLatestVerification(),
            historyCount: uiVerificationService.getVerificationHistory().length
          }
        };
        break;

      case 'ui_history':
        // Get UI verification history
        response = {
          history: uiVerificationService.getVerificationHistory(),
          config: uiVerificationService.getConfig()
        };
        break;

      case 'realtime_dashboard':
        // Get real-time monitoring dashboard data
        response = realTimeMonitorService.getMonitoringDashboard();
        break;

      case 'realtime_status':
        // Get real-time monitoring status
        response = realTimeMonitorService.getMonitoringStatus();
        break;

      case 'realtime_alerts':
        // Get real-time monitoring alerts
        const alertLimit = parseInt(url.searchParams.get('limit') || '50');
        response = {
          alerts: realTimeMonitorService.getAlertHistory(alertLimit),
          status: realTimeMonitorService.getMonitoringStatus()
        };
        break;

      case 'realtime_metrics':
        // Get real-time monitoring metrics
        const metricsLimit = parseInt(url.searchParams.get('limit') || '100');
        response = {
          metrics: realTimeMonitorService.getMetricsHistory(metricsLimit),
          circuitBreakers: Object.fromEntries(realTimeMonitorService.getCircuitBreakerStatus())
        };
        break;

      case 'full':
        // Get comprehensive environment information
        const currentEnv = await environmentDetectionService.getCurrentEnvironment();
        const comparison = includeComparison ? 
          await environmentDetectionService.compareWithProduction() : null;
        const monitoring = includeMonitoring ? 
          environmentMonitorService.getMonitoringStatus() : null;

        response = {
          environment: currentEnv,
          comparison,
          monitoring,
          realTimeMonitoring: realTimeMonitorService.getMonitoringStatus(),
          timestamp: new Date().toISOString()
        };
        break;

      default:
        return NextResponse.json({
          error: 'Invalid action parameter',
          validActions: [
            'fingerprint', 'compare', 'validate', 'status', 'ui_history', 'full',
            'realtime_dashboard', 'realtime_status', 'realtime_alerts', 'realtime_metrics'
          ]
        }, { status: 400 });
    }

    const duration = Date.now() - startTime;

    logger.info('Environment API request processed', {
      action,
      target,
      duration,
      includeComparison,
      includeMonitoring
    });

    return NextResponse.json({
      success: true,
      data: response,
      metadata: {
        timestamp: new Date().toISOString(),
        duration,
        action,
        target
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Environment API request failed', error as Error, {
      url: request.url,
      duration
    });

    return NextResponse.json({
      success: false,
      error: 'Environment API request failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/environment - Perform environment operations
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { action, ...params } = body;

    let response: any;

    switch (action) {
      case 'verify_deployment':
        // Verify deployment to target environment
        const { target, expectedVersion, expectedCommit } = params;
        
        if (!target) {
          return NextResponse.json({
            error: 'Target parameter required for deployment verification'
          }, { status: 400 });
        }

        response = await deploymentVerificationService.verifyDeployment(
          target,
          expectedVersion,
          expectedCommit
        );
        break;

      case 'start_monitoring':
        // Start environment monitoring
        const { environments = ['local', 'production'] } = params;
        
        await environmentMonitorService.startMonitoring(environments);
        response = { 
          message: 'Environment monitoring started',
          environments,
          sessionId: environmentMonitorService.getMonitoringStatus().session?.id
        };
        break;

      case 'stop_monitoring':
        // Stop environment monitoring
        await environmentMonitorService.stopMonitoring();
        response = { 
          message: 'Environment monitoring stopped'
        };
        break;

      case 'resolve_alert':
        // Resolve specific alert
        const { alertId } = params;
        
        if (!alertId) {
          return NextResponse.json({
            error: 'Alert ID required for resolution'
          }, { status: 400 });
        }

        const resolved = environmentMonitorService.resolveAlert(alertId);
        response = { 
          message: resolved ? 'Alert resolved' : 'Alert not found or already resolved',
          alertId,
          resolved 
        };
        break;

      case 'update_monitoring_config':
        // Update monitoring configuration
        const { config } = params;
        
        if (!config) {
          return NextResponse.json({
            error: 'Configuration object required'
          }, { status: 400 });
        }

        environmentMonitorService.updateConfig(config);
        response = { 
          message: 'Monitoring configuration updated',
          config: environmentMonitorService.getConfig()
        };
        break;

      case 'clear_cache':
        // Clear environment detection cache
        environmentDetectionService.clearCache();
        response = { 
          message: 'Environment detection cache cleared'
        };
        break;

      case 'verify_ui_changes':
        // Perform UI verification between environments
        const { beforeUrl, afterUrl, expectedChanges } = params;
        
        if (!beforeUrl || !afterUrl) {
          return NextResponse.json({
            error: 'Both beforeUrl and afterUrl parameters required for UI verification'
          }, { status: 400 });
        }

        response = await uiVerificationService.performUIVerification(
          beforeUrl,
          afterUrl,
          expectedChanges
        );
        break;

      case 'update_ui_config':
        // Update UI verification configuration
        const { uiConfig } = params;
        
        if (!uiConfig) {
          return NextResponse.json({
            error: 'UI configuration object required'
          }, { status: 400 });
        }

        uiVerificationService.updateConfig(uiConfig);
        response = { 
          message: 'UI verification configuration updated',
          config: uiVerificationService.getConfig()
        };
        break;

      case 'start_realtime_monitoring':
        // Start real-time monitoring
        const { monitoringConfig } = params;
        
        await realTimeMonitorService.startMonitoring(monitoringConfig);
        response = { 
          message: 'Real-time monitoring started',
          status: realTimeMonitorService.getMonitoringStatus()
        };
        break;

      case 'stop_realtime_monitoring':
        // Stop real-time monitoring
        await realTimeMonitorService.stopMonitoring();
        response = { 
          message: 'Real-time monitoring stopped'
        };
        break;

      case 'update_realtime_config':
        // Update real-time monitoring configuration
        const { realtimeConfig } = params;
        
        if (!realtimeConfig) {
          return NextResponse.json({
            error: 'Real-time configuration object required'
          }, { status: 400 });
        }

        realTimeMonitorService.updateConfig(realtimeConfig);
        response = { 
          message: 'Real-time monitoring configuration updated'
        };
        break;

      case 'resolve_realtime_alert':
        // Resolve real-time monitoring alert
        const { realtimeAlertId } = params;
        
        if (!realtimeAlertId) {
          return NextResponse.json({
            error: 'Real-time alert ID required for resolution'
          }, { status: 400 });
        }

        const realtimeResolved = realTimeMonitorService.resolveAlert(realtimeAlertId);
        response = { 
          message: realtimeResolved ? 'Real-time alert resolved' : 'Alert not found or already resolved',
          alertId: realtimeAlertId,
          resolved: realtimeResolved 
        };
        break;

      case 'trigger_health_check':
        // Manually trigger health check
        response = await realTimeMonitorService.triggerHealthCheck();
        break;

      case 'test_alerts':
        // Test alert system
        await realTimeMonitorService.testAlerts();
        response = { 
          message: 'Alert system test completed',
          timestamp: new Date().toISOString()
        };
        break;

      default:
        return NextResponse.json({
          error: 'Invalid action parameter',
          validActions: [
            'verify_deployment',
            'start_monitoring', 
            'stop_monitoring',
            'resolve_alert',
            'update_monitoring_config',
            'clear_cache',
            'verify_ui_changes',
            'update_ui_config',
            'start_realtime_monitoring',
            'stop_realtime_monitoring',
            'update_realtime_config',
            'resolve_realtime_alert',
            'trigger_health_check',
            'test_alerts'
          ]
        }, { status: 400 });
    }

    const duration = Date.now() - startTime;

    logger.info('Environment API operation completed', {
      action,
      duration,
      params: Object.keys(params)
    });

    return NextResponse.json({
      success: true,
      data: response,
      metadata: {
        timestamp: new Date().toISOString(),
        duration,
        action
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Environment API operation failed', error as Error, {
      duration
    });

    return NextResponse.json({
      success: false,
      error: 'Environment API operation failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}