'use client';

import { Suspense, lazy, useState, useEffect, useRef, ReactNode, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface LazyLoaderProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  preload?: boolean;
  priority?: 'low' | 'high';
  children?: ReactNode;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Performance-aware lazy loading component with mobile optimizations
 */
export const LazyLoader = ({ 
  loader, 
  fallback, 
  className = '', 
  threshold = 0.1, 
  rootMargin = '50px',
  preload = false,
  priority = 'low'
}: LazyLoaderProps) => {
  const [isIntersecting, setIsIntersecting] = useState(preload);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowEndDevice, capabilities } = useMobileDetection();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (preload || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, preload, hasLoaded]);

  // Load component when in viewport
  useEffect(() => {
    if (isIntersecting && !hasLoaded && !Component) {
      setHasLoaded(true);
      
      // Add artificial delay on low-end devices to prevent overload
      const loadDelay = isLowEndDevice ? 100 : 0;
      
      setTimeout(async () => {
        try {
          const loadedComponent = await loader();
          setComponent(() => loadedComponent.default);
        } catch (error) {
          // Error handled by emergency recovery script, loadDelay);
    }
  }, [isIntersecting, hasLoaded, Component, loader, isLowEndDevice]);

  // Preload on high priority and capable devices
  useEffect(() => {
    if (priority === 'high' && !isLowEndDevice && 'requestIdleCallback' in window) {
      const preloadComponent = () => {
        loader().then(loadedComponent => {
          setComponent(() => loadedComponent.default);
          setHasLoaded(true);
        }).catch(console.error);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadComponent);
      } else {
        setTimeout(preloadComponent, 0);
      }
    }
  }, [priority, isLowEndDevice, loader]);

  const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
    <motion.div 
      className={`animate-pulse space-y-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    </motion.div>
  );

  return (
    <div ref={containerRef} className={className}>
      {Component ? (
        <Suspense fallback={fallback || <LoadingSkeleton className="p-4" />}>
          <Component />
        </Suspense>
      ) : (
        fallback || <LoadingSkeleton className="p-4" />
      )}
    </div>
  );
};

/**
 * Optimized image component with progressive loading and mobile optimizations
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  sizes = '100vw',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const { isMobile, devicePixelRatio, isLowEndDevice, connectionType } = useMobileDetection();

  // Generate optimized image sources based on device capabilities
  const getOptimizedSrc = (originalSrc: string) => {
    // Use lower quality for low-end devices or slow connections
    const adaptiveQuality = isLowEndDevice || connectionType === 'slow-2g' 
      ? Math.min(quality * 0.7, 60)
      : quality;

    // Adjust dimensions for mobile devices
    const mobileWidth = width && isMobile ? Math.min(width, window.innerWidth) : width;
    const mobileHeight = height && isMobile ? Math.min(height, window.innerHeight) : height;

    // For demo purposes, return the original src
    // In production, this would integrate with an image optimization service
    return originalSrc;
  };

  // Progressive loading with intersection observer
  useEffect(() => {
    if (priority) {
      setCurrentSrc(getOptimizedSrc(src));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(getOptimizedSrc(src));
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority, quality, isLowEndDevice, connectionType]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}

      {/* Actual image */}
      {currentSrc && (
        <motion.img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: 'auto'
          }}
        />
      )}
    </div>
  );
};

/**
 * Battery-aware component that reduces functionality on low battery
 */
export const BatteryAwareComponent = ({ 
  children, 
  fallback,
  threshold = 0.2 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
}) => {
  const [batteryLevel, setBatteryLevel] = useState<number>(1);
  const [isCharging, setIsCharging] = useState<boolean>(true);
  const { capabilities } = useMobileDetection();

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level);
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level);
        });

        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }
  }, []);

  // Use fallback if battery is low and not charging
  const shouldUseFallback = batteryLevel < threshold && !isCharging && capabilities.batteryOptimized;

  return shouldUseFallback ? (fallback || null) : <>{children}</>;
};

/**
 * Connection-aware component that adapts to network speed
 */
export const ConnectionAwareComponent = ({ 
  children, 
  lowBandwidthFallback,
  connectionThreshold = '3g'
}: { 
  children: ReactNode;
  lowBandwidthFallback?: ReactNode;
  connectionThreshold?: string;
}) => {
  const { connectionType } = useMobileDetection();
  
  const isSlowConnection = connectionType === 'slow-2g' || 
                          connectionType === '2g' || 
                          (connectionThreshold === '3g' && connectionType === '2g');

  return isSlowConnection ? (lowBandwidthFallback || null) : <>{children}</>;
};

/**
 * Performance-aware wrapper that adapts to device capabilities
 */
export const PerformanceWrapper = ({ 
  children, 
  className = '',
  enableGPUAcceleration = true,
  enableMemoryOptimization = true 
}: {
  children: ReactNode;
  className?: string;
  enableGPUAcceleration?: boolean;
  enableMemoryOptimization?: boolean;
}) => {
  const { capabilities, isLowEndDevice } = useMobileDetection();

  const wrapperClass = `
    ${className}
    ${enableGPUAcceleration && !isLowEndDevice ? 'perf-gpu' : ''}
    ${enableMemoryOptimization ? 'memory-efficient' : ''}
    ${capabilities.enableHeavyEffects ? 'perf-will-change' : ''}
  `.trim();

  return (
    <div className={wrapperClass}>
      {children}
    </div>
  );
};