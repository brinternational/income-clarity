/**
 * 🚨 Real-time Deployment Monitoring Dashboard
 * Live deployment status and alerts in the browser
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MonitoringStatus {
  monitor: {
    running: boolean;
    pid?: number;
    uptime?: number;
    last_event?: string;
  };
  server: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    response_time?: number;
    last_check: string;
  };
  deployment: {
    last_deployment: string | null;
    build_id: string | null;
    git_commit: string | null;
  };
  performance: {
    avg_response_time: number;
    slow_requests_24h: number;
  };
  alerts: {
    total_24h: number;
    last_alert?: string;
  };
  files: {
    changes_24h: number;
    monitored_paths: string[];
  };
}

interface DeploymentEvent {
  id: string;
  type: 'status' | 'alert' | 'change' | 'health' | 'deployment';
  data: any;
  timestamp: string;
}

interface Notification {
  id: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'deployment';
  title: string;
  message: string;
  timestamp: string;
}

export default function DeploymentMonitor() {
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [events, setEvents] = useState<DeploymentEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const eventsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'unhealthy': return 'destructive';
      case 'unknown': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get event level badge variant
  const getEventLevelVariant = (level: string) => {
    switch (level) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'deployment': return 'default';
      case 'info':
      default: return 'outline';
    }
  };

  // Get event emoji
  const getEventEmoji = (type: string, level?: string) => {
    if (level === 'success') return '✅';
    if (level === 'error') return '❌';
    if (level === 'warning') return '⚠️';
    if (level === 'deployment') return '🚀';
    
    switch (type) {
      case 'status': return 'ℹ️';
      case 'alert': return '🚨';
      case 'change': return '📝';
      case 'health': return '❤️';
      case 'deployment': return '🚀';
      default: return 'ℹ️';
    }
  };

  // Load initial status
  const loadStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/monitoring/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      } else {
        setError(data.error || 'Failed to load status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      console.error('Error loading status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/monitoring/notify?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      const response = await fetch('/api/monitoring/notify', { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  // Setup Server-Sent Events
  const setupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/monitoring/subscribe');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔗 SSE Connected');
        setConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: DeploymentEvent = JSON.parse(event.data);
          
          // Add to events
          setEvents(prev => [data, ...prev.slice(0, 99)]); // Keep last 100 events
          
          // Auto-scroll if enabled
          if (autoScroll) {
            setTimeout(() => {
              eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          
          // Update status on certain events
          if (data.type === 'status' || data.type === 'health') {
            loadStatus();
          }
          
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE Error:', err);
        setConnected(false);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect SSE...');
          setupSSE();
        }, 5000);
      };

    } catch (err) {
      console.error('Error setting up SSE:', err);
      setError('Failed to connect to real-time updates');
    }
  };

  // Initialize component
  useEffect(() => {
    loadStatus();
    loadNotifications();
    setupSSE();

    // Refresh status every 30 seconds
    const statusInterval = setInterval(loadStatus, 30000);

    // Cleanup
    return () => {
      clearInterval(statusInterval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse"></div>
            Deployment Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading monitoring status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              🚨 Deployment Monitor
              {connected && <Badge variant="outline">Live</Badge>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadStatus();
                loadNotifications();
              }}
            >
              🔄 Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              ⚠️ {error}
            </div>
          )}
          
          {status && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Monitor Status */}
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {status.monitor.running ? '✅' : '❌'}
                </div>
                <div className="font-medium">Monitor</div>
                <div className="text-sm text-gray-600">
                  {status.monitor.running ? 'Running' : 'Stopped'}
                </div>
                {status.monitor.uptime && (
                  <div className="text-xs text-gray-500">
                    {formatUptime(Math.floor(status.monitor.uptime / 1000))}
                  </div>
                )}
              </div>

              {/* Server Health */}
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {status.server.status === 'healthy' ? '❤️' : '💔'}
                </div>
                <div className="font-medium">Server</div>
                <Badge variant={getStatusVariant(status.server.status)}>
                  {status.server.status}
                </Badge>
                {status.server.response_time && (
                  <div className="text-xs text-gray-500">
                    {status.server.response_time}ms
                  </div>
                )}
              </div>

              {/* Deployment Info */}
              <div className="text-center">
                <div className="text-2xl mb-1">🚀</div>
                <div className="font-medium">Deploy</div>
                <div className="text-sm text-gray-600">
                  {status.deployment.git_commit || 'No commit'}
                </div>
                {status.deployment.build_id && (
                  <div className="text-xs text-gray-500">
                    Build: {status.deployment.build_id.substring(0, 8)}
                  </div>
                )}
              </div>

              {/* Activity Summary */}
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium">Activity</div>
                <div className="text-sm text-gray-600">
                  {status.files.changes_24h} changes
                </div>
                <div className="text-xs text-gray-500">
                  {status.alerts.total_24h} alerts
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📡 Live Events
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-4 h-4"
                />
                Auto-scroll
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvents([])}
              >
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {connected ? 'Waiting for events...' : 'Connecting to live updates...'}
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-lg">
                      {getEventEmoji(event.type, event.data.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getEventLevelVariant(event.data.level || 'info')}>
                          {event.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm">
                        {event.data.message || event.data.title || 'Event occurred'}
                      </div>
                      {event.data.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {event.data.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={eventsEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              🔔 Recent Notifications
              <Button
                variant="outline"
                size="sm"
                onClick={clearNotifications}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="text-lg">
                    {getEventEmoji('alert', notification.level)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-gray-600">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(notification.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length > 5 && (
                <div className="text-center text-sm text-gray-500">
                  ... and {notifications.length - 5} more notifications
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
