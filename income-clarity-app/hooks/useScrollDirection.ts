import { useState, useEffect } from 'react';

interface ScrollOptions {
  threshold?: number;
  debounceMs?: number;
  initialVisible?: boolean;
}

export function useScrollDirection(options: ScrollOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isVisible, setIsVisible] = useState(options.initialVisible ?? true);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
        setIsVisible(direction === 'up');
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    
    window.addEventListener('scroll', updateScrollDirection);
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [scrollDirection]);
  
  return { direction: scrollDirection, isVisible };
}