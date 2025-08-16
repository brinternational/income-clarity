'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
    setIsInstalled(isAppInstalled);
    
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Don't show banner if already installed or dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      if (!isAppInstalled && daysSinceDismissed > 7) {
        setShowInstallBanner(true);
      }
    };
    
    // Listen for app installed event
    const handleAppInstalled = () => {
      // console.log('PWA was installed');
      // setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      
      // Track installation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'PWA Installation'
        });
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const registerServiceWorker = async () => {
    // Disable service worker in development to avoid caching issues
    if (process.env.NODE_ENV === 'development') {
      // console.log('Service Worker disabled in development');
      // Unregister any existing service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          registration.unregister();
          // console.log('Unregistered service worker:', registration);
        }
      }
      return;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        // console.log('Service Worker registered:', registration);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, show update notification
                showUpdateNotification();
              }
            });
          }
        });
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
        
      } catch (error) {
        // console.error('Service Worker registration failed:', error);
      }
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          // console.log('Background sync completed');
        }
      });
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
        return;
      }
      return;
    }
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        // console.log('User accepted the install prompt');
      // } else {
        // console.log('User dismissed the install prompt');
        // localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      // Error handled by emergency recovery script;

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Income Clarity Updated', {
        body: 'A new version is available. Restart the app to update.',
        icon: '/icons/icon-192x192.png',
        tag: 'app-update'
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Income Clarity', {
          body: 'You\'ll now receive updates about your portfolio!',
          icon: '/icons/icon-192x192.png'
        });
      }
    }
  };

  if (isInstalled) {
    return null; // Don't show install banner if already installed
  }

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Install Income Clarity</h3>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                1
              </div>
              <p>Tap the Share button at the bottom of Safari</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                2
              </div>
              <p>Scroll down and tap "Add to Home Screen"</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                3
              </div>
              <p>Tap "Add" in the top right corner</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              Once installed, Income Clarity will work offline and feel like a native app!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:bottom-8 md:right-8 md:w-96 z-50">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border backdrop-blur-xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-1"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          borderColor: 'rgba(255,255,255,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 30px rgba(59,130,246,0.1)'
        }}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-cyan-50/50"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
        
        <div className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Smartphone className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Install Income Clarity
                </h3>
                <div className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg">
                  FREE
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Transform your financial management with our premium PWA experience
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleInstallClick}
                  className="group flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Download className="w-4 h-4 group-hover:animate-bounce" />
                  <span>Install Now</span>
                </button>
                
                <button
                  onClick={dismissBanner}
                  className="text-sm font-medium text-slate-500 px-4 py-3 rounded-2xl hover:text-slate-700 hover:bg-slate-100 transition-all duration-300"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            
            <button
              onClick={dismissBanner}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300 group"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          {/* Features section */}
          <div className="mt-6 pt-4 border-t border-gradient-to-r from-transparent via-slate-200 to-transparent">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center group">
                <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-semibold text-slate-700">Works Offline</span>
              </div>
              
              <div className="text-center group">
                <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-semibold text-slate-700">Lightning Fast</span>
              </div>
              
              <div className="text-center group">
                <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-semibold text-slate-700">Native Feel</span>
              </div>
            </div>
          </div>
          
          {/* Floating decoration elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-8 left-8 w-1 h-1 bg-purple-400 rounded-full opacity-80 animate-bounce delay-1000"></div>
          <div className="absolute top-1/2 right-8 w-1 h-1 bg-cyan-400 rounded-full opacity-70 animate-bounce delay-2000"></div>
        </div>
      </div>
    </div>
  );
}