'use client';

import { useRef, useCallback } from 'react';
import { logger } from '@/lib/logger'

export function useMultiGesture() {
  const gestureRef = useRef<any>(null);

  const handleGesture = useCallback((type: string, data: any) => {
    logger.log('Gesture:', type, data);
  }, []);

  return {
    gestureRef,
    handleGesture
  };
}