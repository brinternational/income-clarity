'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Clock, 
  X,
  Settings,
  BellOff,
  CheckCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  budgetId: string;
  budgetName: string;
  categoryName?: string;
  threshold?: number;
  currentPercentage?: number;
  amount?: number;
  projectedAmount?: number;
  daysRemaining?: number;
  createdAt: string;
  read: boolean;
  actionRequired: boolean;
}

interface BudgetAlertsProps {
  budgetId?: string; // If provided, show alerts for specific budget
  showOnlyUnread?: boolean;
  maxAlerts?: number;
  compact?: boolean;
  onAlertClick?: (alert: Alert) => void;
  onSettingsClick?: () => void;
}

export function BudgetAlerts({ 
  budgetId, 
  showOnlyUnread = false, 
  maxAlerts = 10, 
  compact = false,
  onAlertClick,
  onSettingsClick
}: BudgetAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    budgetThreshold: 80,
    categoryThreshold: 90,
    projectionAlerts: true,
    dailyDigest: false
  });

  useEffect(() => {
    generateMockAlerts(); // In production, this would fetch from API
  }, [budgetId, showOnlyUnread]);

  const generateMockAlerts = () => {
    setLoading(true);
    
    // Mock alerts data - in production, this would come from the API
    const mockAlerts: Alert[] = [
      {
        id: 'alert-001',
        type: 'danger',
        title: 'Budget Exceeded',
        message: 'Entertainment category has exceeded its budget by 15%. Consider reviewing recent expenses.',
        budgetId: 'budget-001',
        budgetName: 'Monthly Budget December',
        categoryName: 'ENTERTAINMENT',
        threshold: 90,
        currentPercentage: 115,
        amount: 350,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: false,
        actionRequired: true
      },
      {
        id: 'alert-002',
        type: 'warning',
        title: 'Approaching Budget Limit',
        message: 'Food category has reached 85% of its allocated budget with 12 days remaining.',
        budgetId: 'budget-001',
        budgetName: 'Monthly Budget December',
        categoryName: 'FOOD',
        threshold: 80,
        currentPercentage: 85,
        amount: 680,
        daysRemaining: 12,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        read: false,
        actionRequired: true
      },
      {
        id: 'alert-003',
        type: 'warning',
        title: 'Projected Budget Overage',
        message: 'Current spending rate suggests you may exceed your total budget by $200.',
        budgetId: 'budget-001',
        budgetName: 'Monthly Budget December',
        currentPercentage: 75,
        projectedAmount: 200,
        daysRemaining: 12,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        read: true,
        actionRequired: true
      },
      {
        id: 'alert-004',
        type: 'info',
        title: 'Budget Period Ending Soon',
        message: 'Your monthly budget period ends in 3 days. Review your performance and plan for next month.',
        budgetId: 'budget-001',
        budgetName: 'Monthly Budget December',
        daysRemaining: 3,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        read: true,
        actionRequired: false
      },
      {
        id: 'alert-005',
        type: 'success',
        title: 'Budget Goal Achieved',
        message: 'Congratulations! You\'ve stayed under budget in Transportation category for the third consecutive month.',
        budgetId: 'budget-001',
        budgetName: 'Monthly Budget December',
        categoryName: 'TRANSPORTATION',
        currentPercentage: 75,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true,
        actionRequired: false
      }
    ];

    // Filter alerts based on props
    let filteredAlerts = mockAlerts;
    
    if (budgetId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.budgetId === budgetId);
    }
    
    if (showOnlyUnread) {
      filteredAlerts = filteredAlerts.filter(alert => !alert.read);
    }
    
    filteredAlerts = filteredAlerts.slice(0, maxAlerts);
    
    setAlerts(filteredAlerts);
    setLoading(false);
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const getAlertIcon = (type: Alert['type']) => {
    const iconClasses = "w-5 h-5";
    
    switch (type) {
      case 'danger':
        return <AlertTriangle className={`${iconClasses} text-red-600`} />;
      case 'warning':
        return <TrendingUp className={`${iconClasses} text-orange-600`} />;
      case 'info':
        return <Clock className={`${iconClasses} text-blue-600`} />;
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-600`} />;
      default:
        return <Bell className={`${iconClasses} text-gray-600`} />;
    }
  };

  const getAlertBgColor = (type: Alert['type'], read: boolean) => {
    const baseClasses = read ? 'opacity-75' : '';
    
    switch (type) {
      case 'danger':
        return `bg-red-50 border-red-200 ${baseClasses}`;
      case 'warning':
        return `bg-orange-50 border-orange-200 ${baseClasses}`;
      case 'info':
        return `bg-blue-50 border-blue-200 ${baseClasses}`;
      case 'success':
        return `bg-green-50 border-green-200 ${baseClasses}`;
      default:
        return `bg-gray-50 border-gray-200 ${baseClasses}`;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const urgentCount = alerts.filter(alert => !alert.read && alert.actionRequired).length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Budget Alerts
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          {urgentCount > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              {urgentCount} alert{urgentCount !== 1 ? 's' : ''} require{urgentCount === 1 ? 's' : ''} attention
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all read
            </button>
          )}
          
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200">
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No alerts</p>
            <p className="text-sm text-gray-400">
              {showOnlyUnread ? 'No unread alerts' : 'All budgets are on track'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border-l-4 transition-all hover:bg-gray-50 cursor-pointer ${getAlertBgColor(alert.type, alert.read)}`}
              onClick={() => {
                if (!alert.read) markAsRead(alert.id);
                onAlertClick?.(alert);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${alert.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {alert.title}
                        {alert.actionRequired && !alert.read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Action Required
                          </span>
                        )}
                      </h4>
                      
                      <p className={`text-sm mt-1 ${alert.read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{alert.budgetName}</span>
                        {alert.categoryName && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {alert.categoryName.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        )}
                        <span>{formatTimeAgo(alert.createdAt)}</span>
                      </div>
                      
                      {/* Alert-specific details */}
                      {!compact && (
                        <div className="mt-3 space-y-1">
                          {alert.currentPercentage && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Current Usage:</span>
                              <span className={`font-medium ${
                                alert.currentPercentage > 100 ? 'text-red-600' : 
                                alert.currentPercentage > 90 ? 'text-orange-600' : 'text-gray-700'
                              }`}>
                                {alert.currentPercentage.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          
                          {alert.amount && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium text-gray-700">
                                {formatCurrency(alert.amount)}
                              </span>
                            </div>
                          )}
                          
                          {alert.projectedAmount && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Projected Overage:</span>
                              <span className="font-medium text-orange-600">
                                {formatCurrency(alert.projectedAmount)}
                              </span>
                            </div>
                          )}
                          
                          {alert.daysRemaining !== undefined && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Days Remaining:</span>
                              <span className="font-medium text-gray-700">
                                {alert.daysRemaining}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {!alert.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {alerts.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {alerts.length} of {alerts.length} alerts
            </span>
            
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="text-orange-600 font-medium">
                  {unreadCount} unread
                </span>
              )}
              
              {urgentCount > 0 && (
                <span className="text-red-600 font-medium">
                  {urgentCount} urgent
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}