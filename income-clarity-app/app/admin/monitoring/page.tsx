'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  Database,
  Server,
  Zap,
  Mail,
  Shield,
  RefreshCw
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    error?: string;
  }>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

interface SystemMetrics {
  errorRate: number;
  avgResponseTime: number;
  activeConnections: number;
  queueDepth: number;
  totalRequests: number;
}

interface AlertSummary {
  total: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  recent: Array<{
    id: string;
    ruleName: string;
    severity: string;
    status: string;
    startsAt: string;
    message: string;
  }>;
}

interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  topErrors: Array<{
    fingerprint: string;
    title: string;
    count: number;
  }>;
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      // Fetch health status
      const healthResponse = await fetch('/api/health?level=detailed&details=true');
      const health = await healthResponse.json();
      setHealthStatus(health);

      // Mock other data - in real implementation, these would be separate API calls
      setSystemMetrics({
        errorRate: 0.02,
        avgResponseTime: 250,
        activeConnections: 45,
        queueDepth: 12,
        totalRequests: 15430
      });

      setAlertSummary({
        total: 3,
        bySeverity: { HIGH: 1, MEDIUM: 2, LOW: 0 },
        byStatus: { firing: 2, acknowledged: 1 },
        recent: [
          {
            id: 'alert-1',
            ruleName: 'High Error Rate',
            severity: 'HIGH',
            status: 'firing',
            startsAt: new Date(Date.now() - 3600000).toISOString(),
            message: 'API error rate exceeds 5%'
          },
          {
            id: 'alert-2',
            ruleName: 'Slow Response Time',
            severity: 'MEDIUM',
            status: 'firing',
            startsAt: new Date(Date.now() - 1800000).toISOString(),
            message: 'API response time above 2s'
          }
        ]
      });

      setErrorStats({
        totalErrors: 156,
        errorsByCategory: {
          'external_api': 45,
          'database': 23,
          'validation': 34,
          'sync': 54
        },
        topErrors: [
          { fingerprint: 'abc123', title: 'Yodlee API timeout', count: 23 },
          { fingerprint: 'def456', title: 'Database connection error', count: 18 },
          { fingerprint: 'ghi789', title: 'Validation failed', count: 15 }
        ]
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !healthStatus) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchMonitoringData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(healthStatus?.status || 'unknown')}
                  <span className="ml-2 text-2xl font-bold">
                    {healthStatus?.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <div className="flex items-center mt-2">
                  {systemMetrics && systemMetrics.errorRate > 0.05 ? 
                    <TrendingUp className="h-4 w-4 text-red-500" /> :
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  }
                  <span className="ml-2 text-2xl font-bold">
                    {((systemMetrics?.errorRate || 0) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold">
                    {alertSummary?.total || 0}
                  </span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold">
                    {systemMetrics?.avgResponseTime || 0}ms
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Health Checks Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Checks</CardTitle>
              <CardDescription>
                Current status of all system components and dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthStatus?.checks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium">{check.name}</p>
                        {check.error && (
                          <p className="text-sm text-red-600">{check.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {check.responseTime}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Current system alerts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertSummary?.recent.map((alert) => (
                  <Alert key={alert.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{alert.ruleName}</p>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            Started: {new Date(alert.startsAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                
                {!alertSummary?.recent.length && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No active alerts. System is healthy!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Categories</CardTitle>
                <CardDescription>
                  Errors by category in the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorStats && Object.entries(errorStats.errorsByCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Errors</CardTitle>
                <CardDescription>
                  Most frequent errors requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorStats?.topErrors.map((error, index) => (
                    <div key={error.fingerprint} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{error.title}</p>
                        <p className="text-xs text-gray-500">{error.fingerprint}</p>
                      </div>
                      <Badge variant="destructive">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Current system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Response Time</span>
                    </div>
                    <span className="font-medium">{systemMetrics?.avgResponseTime}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Active Connections</span>
                    </div>
                    <span className="font-medium">{systemMetrics?.activeConnections}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Queue Depth</span>
                    </div>
                    <span className="font-medium">{systemMetrics?.queueDepth}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Total Requests</span>
                    </div>
                    <span className="font-medium">{systemMetrics?.totalRequests?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>
                  Resource utilization and capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disk Usage</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}