// Animation hook stub

import { useEffect, useRef, useState, useMemo } from 'react';

export function useOptimizedAnimation() {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animation logic would go here
  }, []);
  
  return { elementRef };
}

// Overloads preserve precise typing of returned animated value structure
export function useStaggeredCountingAnimation(targetValues: number, duration?: number, staggerDelay?: number): number;
export function useStaggeredCountingAnimation<T extends Record<string, number>>(targetValues: T, duration?: number, staggerDelay?: number): T;
export function useStaggeredCountingAnimation(
  targetValues: Record<string, number> | number,
  duration: number = 1000,
  staggerDelay: number = 100
) {
  const [animatedValues, setAnimatedValues] = useState<any>(() => {
    if (typeof targetValues === 'number') return 0;
    const initialValues: Record<string, number> = {};
    for (const key of Object.keys(targetValues)) initialValues[key] = 0;
    return initialValues;
  });

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous animation
  if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
  startTimeRef.current = null;

    const animate = (timestamp: number) => {
  if (startTimeRef.current === null) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      
      if (typeof targetValues === 'number') {
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setAnimatedValues(targetValues * easeProgress);
        
  if (progress < 1) animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        const newValues: Record<string, number> = {};
        Object.entries(targetValues).forEach(([key, target], index) => {
          const staggeredProgress = Math.max(0, Math.min(1, (elapsed - index * staggerDelay) / duration));
          const easeProgress = staggeredProgress > 0 ? 1 - Math.pow(1 - staggeredProgress, 3) : 0;
          newValues[key] = target * easeProgress;
        });

        setAnimatedValues(newValues);

        const maxProgress = Math.min(elapsed / (duration + (Object.keys(targetValues).length - 1) * staggerDelay), 1);
  if (maxProgress < 1) animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [targetValues, duration, staggerDelay]);
  return animatedValues as typeof targetValues;
}

export function useCountingAnimation(targetValue: number | any, duration: number = 1000, options?: any) {
  // Use useMemo for stable reference
  const stableTargetValue = useMemo(() => {
    if (typeof targetValue === 'object' && targetValue !== null) {
      return { ...targetValue };
    }
    return targetValue || 0;
  }, [
    typeof targetValue === 'object' && targetValue !== null 
      ? JSON.stringify(targetValue)
      : targetValue
  ]);

  const [value, setValue] = useState(stableTargetValue);
  
  useEffect(() => {
    // Only update if values have actually changed
    const hasChanged = typeof stableTargetValue === 'object' && stableTargetValue !== null
      ? JSON.stringify(value) !== JSON.stringify(stableTargetValue)
      : value !== stableTargetValue;
    
    if (hasChanged) {
      setValue(stableTargetValue);
    }
  }, [stableTargetValue, value]);
  
  return value;
}

export function useProgressAnimation(progress: number) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // Only update if progress actually changed
    if (animatedProgress !== progress) {
      setAnimatedProgress(progress);
    }
  }, [progress, animatedProgress]);
  
  return animatedProgress;
}