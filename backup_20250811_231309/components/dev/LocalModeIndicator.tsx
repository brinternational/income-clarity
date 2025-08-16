'use client';

import { LocalModeUtils, LOCAL_MODE_CONFIG } from '@/lib/config/local-mode';
import { localStorageAdapter } from '@/lib/storage/local-storage-adapter';
import { useEffect, useState } from 'react';

interface LocalModeIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function LocalModeIndicator({ position = 'bottom-right' }: LocalModeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);

  useEffect(() => {
    setIsVisible(LocalModeUtils.isEnabled());
    
    if (LocalModeUtils.isEnabled()) {
      const stats = localStorageAdapter.getStorageStats();
      setStorageStats(stats);
      
      // Update stats every 30 seconds
      const interval = setInterval(() => {
        const updatedStats = localStorageAdapter.getStorageStats();
        setStorageStats(updatedStats);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);

  if (!isVisible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const handleClearStorage = () => {
    if (confirm('Clear all LOCAL_MODE data? This will reset to default mock data.')) {
      localStorageAdapter.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-mono max-w-sm`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
        <span className="font-bold">LOCAL MODE</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-auto text-orange-200 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="text-xs text-orange-100 space-y-1">
        <div>🏠 Offline Mode Active</div>
        <div>👤 User: {LOCAL_MODE_CONFIG.MOCK_USER.name}</div>
        <div>💰 Location: Puerto Rico (0% tax)</div>
        
        {storageStats && (
          <div className="mt-2 pt-2 border-t border-orange-400">
            <div>📦 Storage: {storageStats.totalKeys} keys</div>
            <div>📊 Size: {Math.round(storageStats.totalSize / 1024)}KB</div>
            {storageStats.lastUpdated && (
              <div>🕒 Updated: {new Date(storageStats.lastUpdated).toLocaleTimeString()}</div>
            )}
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t border-orange-400 flex gap-2">
          <button
            onClick={handleClearStorage}
            className="text-xs bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded"
          >
            Reset Data
          </button>
          <button
            onClick={() => console.log('LOCAL_MODE Stats:', { 
              config: LOCAL_MODE_CONFIG, 
              storage: storageStats 
            })}
            className="text-xs bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded"
          >
            Debug Info
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for development
export function DevOnlyLocalModeIndicator(props: LocalModeIndicatorProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <LocalModeIndicator {...props} />;
}