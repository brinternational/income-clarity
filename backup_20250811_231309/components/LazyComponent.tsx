'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function LazyComponent({ 
  children, 
  fallback = null, 
  rootMargin = '50px', 
  threshold = 0.1,
  triggerOnce = true 
}: LazyComponentProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce]);

  const shouldRender = triggerOnce ? (hasTriggered || isIntersecting) : isIntersecting;

  return (
    <div ref={elementRef}>
      {shouldRender ? children : fallback}
    </div>
  );
}

// Skeleton loading component for dashboard cards
export function DashboardCardSkeleton() {
  return (
    <div className="premium-card p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
      
      <div className="space-y-4">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}