'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Info,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  ChevronDown,
  Clock
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/contexts/NotificationContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationFilter = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error';
type NotificationSort = 'newest' | 'oldest' | 'unread';

// Map notification types to appropriate icons and colors
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return { icon: Trophy, color: 'var(--color-success)', bgColor: 'rgba(16, 185, 129, 0.1)' };
    case 'info':
      return { icon: Info, color: 'var(--color-info)', bgColor: 'rgba(59, 130, 246, 0.1)' };
    case 'warning':
      return { icon: TrendingUp, color: 'var(--color-warning)', bgColor: 'rgba(251, 191, 36, 0.1)' };
    case 'error':
      return { icon: Calendar, color: 'var(--color-error)', bgColor: 'rgba(239, 68, 68, 0.1)' };
    default:
      return { icon: Bell, color: 'var(--color-text-secondary)', bgColor: 'var(--color-secondary)' };
  }
};

// Individual notification item component
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}> = ({ notification, onMarkRead, onDelete }) => {
  const iconData = getNotificationIcon(notification.type);
  const IconComponent = iconData.icon;

  return (
    <div
      className={`p-4 border-b transition-all duration-200 hover:bg-opacity-50 ${
        !notification.read 
          ? 'border-l-4 border-l-blue-500' 
          : 'border-l-4 border-l-transparent'
      }`}
      style={{ 
        borderBottomColor: 'var(--color-border)',
        backgroundColor: notification.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)'
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ 
            backgroundColor: iconData.bgColor 
          }}
        >
          <IconComponent 
            className="w-4 h-4" 
            style={{ color: iconData.color }} 
          />
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 
                className={`text-sm font-medium truncate ${
                  notification.read ? 'opacity-75' : ''
                }`}
                style={{ color: 'var(--color-text-primary)' }}
              >
                {notification.title}
              </h4>
              <p 
                className={`text-sm mt-1 ${
                  notification.read ? 'opacity-60' : 'opacity-80'
                }`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {notification.message}
              </p>
              
              {/* Timestamp */}
              <div className="flex items-center space-x-2 mt-2">
                <Clock className="w-3 h-3 opacity-50" style={{ color: 'var(--color-text-secondary)' }} />
                <span 
                  className="text-xs opacity-60"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
                {!notification.read && (
                  <span 
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-info)' }}
                    aria-label="Unread"
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <button
                  onClick={onMarkRead}
                  className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-text-secondary)'
                  }}
                  title="Mark as read"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                  }}
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
              
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-text-secondary)'
                }}
                title="Delete notification"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = 'var(--color-error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Action URL Button */}
          {notification.actionUrl && notification.actionLabel && (
            <button
              onClick={() => window.open(notification.actionUrl, '_blank')}
              className="mt-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {notification.actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main NotificationCenter component
export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications,
    hasPermission,
    requestPermission
  } = useNotifications();

  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [sort, setSort] = useState<NotificationSort>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'unread':
        if (a.read === b.read) return b.timestamp.getTime() - a.timestamp.getTime();
        return a.read ? 1 : -1;
      default: // newest
        return b.timestamp.getTime() - a.timestamp.getTime();
    }
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12 px-6">
      <div 
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      >
        <Bell className="w-8 h-8" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
      <h3 
        className="text-lg font-medium mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
      </h3>
      <p 
        className="text-sm mb-6"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {filter === 'unread' 
          ? "You've read all your notifications. Great job staying on top of your portfolio!"
          : "You'll see notifications here about dividend payments, milestone achievements, and portfolio updates."
        }
      </p>
      
      {!hasPermission && (
        <button
          onClick={requestPermission}
          className="px-4 py-2 text-sm rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Enable Notifications
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 z-50 transform transition-transform duration-300 ease-out shadow-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--color-primary)',
          borderColor: 'var(--color-border)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
      >
        {/* Header */}
        <div 
          className="sticky top-0 px-6 py-4 border-b z-10"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            borderBottomColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 
              id="notification-center-title"
              className="text-lg font-semibold flex items-center space-x-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span 
                  className="px-2 py-0.5 text-xs font-bold rounded-full"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'white'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </h2>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
              }}
              title="Close notifications"
              aria-label="Close notification center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter and Sort Controls */}
          {notifications.length > 0 && (
            <div className="mt-4 flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'var(--color-secondary)',
                      color: 'var(--color-text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                    }}
                  >
                    <Filter className="w-3 h-3" />
                    <span className="capitalize">{filter === 'all' ? 'All' : filter}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Filter Dropdown Menu */}
                  {showFilters && (
                    <div
                      className="absolute top-full left-0 mt-1 w-32 rounded-lg shadow-lg border z-20"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="py-1">
                        {(['all', 'unread', 'info', 'success', 'warning', 'error'] as NotificationFilter[]).map((filterOption) => (
                          <button
                            key={filterOption}
                            onClick={() => {
                              setFilter(filterOption);
                              setShowFilters(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors capitalize ${
                              filter === filterOption ? 'font-medium' : ''
                            }`}
                            style={{ 
                              color: filter === filterOption ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                              backgroundColor: filter === filterOption ? 'var(--color-secondary)' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              if (filter !== filterOption) {
                                e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (filter !== filterOption) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {filterOption === 'all' ? 'All' : filterOption}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'var(--color-accent)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {sortedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markAsRead(notification.id)}
                  onDelete={() => clearNotification(notification.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div 
            className="sticky bottom-0 p-4 border-t"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderTopColor: 'var(--color-border)'
            }}
          >
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all notifications?')) {
                  clearAllNotifications();
                }
              }}
              className="w-full px-4 py-2 text-sm rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = 'var(--color-error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              Clear All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}