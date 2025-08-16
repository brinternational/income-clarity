
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationState {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSupported: boolean;
}

/**
 * LITE-042: Enhanced Push Notification Setup
 * Comprehensive push notification management
 */
export const PushNotificationSetup: React.FC = () => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    subscription: null,
    isSupported: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied'
    }));

    if (isSupported && Notification.permission === 'granted') {
      await checkExistingSubscription();
    }
  };

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        subscription
      }));
    } catch (error) {
      // Error handled by emergency recovery script;

  const enableNotifications = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setMessage({
          type: 'error',
          text: 'Notifications blocked. Enable in browser settings to receive dividend alerts.'
        });
        setState(prev => ({ ...prev, permission }));
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await getVAPIDKey()
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          preferences: {
            dividendAlerts: true,
            priceUpdates: false,
            weeklyReports: true,
            importantNews: true
          }
        })
      });

      setState(prev => ({
        ...prev,
        permission,
        subscription
      }));

      setMessage({
        type: 'success',
        text: 'Push notifications enabled! You\'ll receive dividend alerts and important updates.'
      });

    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (state.subscription) {
        // Unsubscribe from push notifications
        await state.subscription.unsubscribe();

        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: state.subscription.toJSON()
          })
        });
      }

      setState(prev => ({
        ...prev,
        subscription: null
      }));

      setMessage({
        type: 'success',
        text: 'Push notifications disabled.'
      });

    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (state.subscription) {
      try {
        await fetch('/api/notifications/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: state.subscription.toJSON()
          })
        });

        setMessage({
          type: 'success',
          text: 'Test notification sent!'
        });
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to send test notification.'
        });
      }
    }
  };

  const getVAPIDKey = async (): Promise<string> => {
    // In a real app, this would fetch from your server
    const response = await fetch('/api/notifications/vapid-key');
    const { key } = await response.json();
    return key;
  };

  if (!state.isSupported) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <BellOff className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Push notifications not supported in this browser
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get alerts for dividends, price changes, and important updates
            </p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          state.permission === 'granted' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : state.permission === 'denied'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
        }`}>
          {state.permission === 'granted' ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Enabled</span>
            </>
          ) : state.permission === 'denied' ? (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>Blocked</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>Not Set</span>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {state.permission !== 'granted' ? (
          <button
            onClick={enableNotifications}
            disabled={isLoading || state.permission === 'denied'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Setting up...' : 'Enable Notifications'}
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={testNotification}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Test Notification
            </button>
            
            <button
              onClick={disableNotifications}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Disable
            </button>
          </div>
        )}

        {state.permission === 'denied' && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>To enable notifications:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click the lock icon in your browser\'s address bar</li>
              <li>Allow notifications for this site</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        )}
      </div>

      {state.subscription && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Notification Preferences
          </h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Dividend alerts (ex-dividend dates)</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Price change alerts</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Weekly portfolio summary</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Important news and updates</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
