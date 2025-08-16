'use client';

import React from 'react';
import { 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Info,
  Bell,
  Check,
  Trash2,
  Clock,
  ExternalLink
} from 'lucide-react';
import type { Notification } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
  showActions?: boolean;
  compact?: boolean;
}

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

// Format timestamp for display
const formatTimestamp = (timestamp: Date, compact: boolean = false) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (compact) {
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  }

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  
  return timestamp.toLocaleString();
};

export function NotificationItem({ 
  notification, 
  onMarkRead, 
  onDelete, 
  showActions = true,
  compact = false 
}: NotificationItemProps) {
  const iconData = getNotificationIcon(notification.type);
  const IconComponent = iconData.icon;

  return (
    <div
      className={`p-4 transition-all duration-200 hover:bg-opacity-50 ${
        compact ? 'p-3' : 'p-4'
      } ${
        !notification.read 
          ? 'border-l-4 border-l-blue-500' 
          : 'border-l-4 border-l-transparent'
      }`}
      style={{ 
        backgroundColor: notification.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)'
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div 
          className={`rounded-lg flex-shrink-0 ${compact ? 'p-1.5' : 'p-2'}`}
          style={{ 
            backgroundColor: iconData.bgColor 
          }}
        >
          <IconComponent 
            className={compact ? 'w-3 h-3' : 'w-4 h-4'} 
            style={{ color: iconData.color }} 
          />
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 
                className={`font-medium truncate ${
                  compact ? 'text-xs' : 'text-sm'
                } ${notification.read ? 'opacity-75' : ''}`}
                style={{ color: 'var(--color-text-primary)' }}
                title={notification.title}
              >
                {notification.title}
              </h4>
              
              {!compact && (
                <p 
                  className={`text-sm mt-1 ${
                    notification.read ? 'opacity-60' : 'opacity-80'
                  }`}
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {notification.message}
                </p>
              )}
              
              {/* Timestamp and status */}
              <div className={`flex items-center space-x-2 ${compact ? 'mt-1' : 'mt-2'}`}>
                <Clock 
                  className={`opacity-50 ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} 
                  style={{ color: 'var(--color-text-secondary)' }} 
                />
                <span 
                  className={`opacity-60 ${compact ? 'text-xs' : 'text-xs'}`}
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {formatTimestamp(notification.timestamp, compact)}
                </span>
                {!notification.read && (
                  <span 
                    className={`inline-block rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
                    style={{ backgroundColor: 'var(--color-info)' }}
                    aria-label="Unread"
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 ml-2">
                {!notification.read && (
                  <button
                    onClick={onMarkRead}
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${
                      compact ? 'p-1' : 'p-1.5'
                    }`}
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
                    <Check className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                  </button>
                )}
                
                <button
                  onClick={onDelete}
                  className={`rounded-lg transition-all duration-200 hover:scale-105 ${
                    compact ? 'p-1' : 'p-1.5'
                  }`}
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
                  <Trash2 className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                </button>
              </div>
            )}
          </div>

          {/* Action URL Button */}
          {!compact && notification.actionUrl && notification.actionLabel && (
            <button
              onClick={() => {
                if (notification.actionUrl) {
                  window.open(notification.actionUrl, '_blank');
                }
              }}
              className="mt-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center space-x-1"
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
              <span>{notification.actionLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}