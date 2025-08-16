import { useState, useEffect } from 'react';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
        setIsSlowConnection(connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline, isSlowConnection, connectionType };
}