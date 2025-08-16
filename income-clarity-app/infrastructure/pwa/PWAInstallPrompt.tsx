
'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Download, X, Star, Shield, Zap } from 'lucide-react';
import { logger } from '@/lib/logger'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * LITE-042: Enhanced PWA Install Prompt
 * Beautiful, informative install experience
 */
export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (navigator as any).standalone === true;
    setIsInstalled(isInstalled);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // logger.log('PWA install accepted');
    // } else {
      // logger.log('PWA install dismissed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
        {/* Prompt Card */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-2xl max-w-md w-full transform transition-transform">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Install Income Clarity
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get the app experience
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Faster Performance
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Native app-like speed and responsiveness
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Works Offline
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Access your portfolio data without internet
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Never miss important dividend alerts
                  </div>
                </div>
              </div>
            </div>

            {/* Device Preview */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center space-y-2">
                  <Smartphone className="h-8 w-8 text-gray-400" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Mobile</div>
                </div>
                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex flex-col items-center space-y-2">
                  <Monitor className="h-8 w-8 text-gray-400" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Desktop</div>
                </div>
              </div>
            </div>

            {/* iOS Instructions */}
            {isIOS && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Install on iOS:
                </div>
                <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>1. Tap the share button in Safari</li>
                  <li>2. Scroll down and tap "Add to Home Screen"</li>
                  <li>3. Tap "Add" to confirm</li>
                </ol>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex space-x-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 px-4 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Maybe Later
            </button>
            
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
