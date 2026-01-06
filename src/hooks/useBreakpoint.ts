'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

interface NavigatorWithMS extends Navigator {
  msMaxTouchPoints?: number;
}

const breakpoints = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  large: 1440
};

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width >= breakpoints.large) return 'large';
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tablet) return 'tablet';
    return 'mobile';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= breakpoints.large) {
        setBreakpoint('large');
      } else if (width >= breakpoints.desktop) {
        setBreakpoint('desktop');
      } else if (width >= breakpoints.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    // Debounce resize events
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return breakpoint;
}

// Additional hook for responsive values
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const breakpoint = useBreakpoint();

  // Check in order of specificity: mobile, tablet, desktop, large
  if (breakpoint === 'mobile' && values.mobile !== undefined) return values.mobile;
  if (breakpoint === 'tablet' && values.tablet !== undefined) return values.tablet;
  if (breakpoint === 'desktop' && values.desktop !== undefined) return values.desktop;
  if (breakpoint === 'large' && values.large !== undefined) return values.large;

  // Fallback to default or any defined value
  return values.mobile ?? values.tablet ?? values.desktop ?? values.large ?? defaultValue;
}

// Hook for touch detection
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      const navigatorWithMS = navigator as NavigatorWithMS;
      const hasTouch = 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigatorWithMS.msMaxTouchPoints ?? 0) > 0;
      setIsTouchDevice(hasTouch);
    };

    checkTouchDevice();
    window.addEventListener('touchstart', checkTouchDevice, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouchDevice);
    };
  }, []);

  return isTouchDevice;
}

// Hook for orientation
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);

    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  return orientation;
}

// Hook for viewport size
export function useViewportSize() {
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return viewportSize;
}