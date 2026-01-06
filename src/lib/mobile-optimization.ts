/**
 * Mobile and touch optimization utilities for Epackage Lab
 * Optimized for Japanese B2B mobile experience
 */

interface NavigatorWithMS extends Navigator {
  msMaxTouchPoints?: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Touch detection
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  const navigatorWithMS = navigator as NavigatorWithMS;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigatorWithMS.msMaxTouchPoints ?? 0) > 0
  );
};

// Device detection for responsive optimizations
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') return { isMobile: false, isTablet: false, isDesktop: true };

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || (isMobile && window.innerWidth >= 768);

  return {
    isMobile: isMobile && !isTablet,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isIOS: /iphone|ipad|ipod/i.test(userAgent),
    isAndroid: /android/i.test(userAgent),
    isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
  };
};

// Touch-optimized click handler
export const createTouchHandler = (callback: () => void, delay = 300) => {
  let isProcessing = false;

  return (e: React.TouchEvent | React.MouseEvent) => {
    if (isProcessing) return;

    isProcessing = true;
    e.preventDefault();

    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    callback();

    setTimeout(() => {
      isProcessing = false;
    }, delay);
  };
};

// Viewport height fix for mobile browsers
export const getViewportHeight = () => {
  if (typeof window === 'undefined') return 0;

  // Fix for mobile viewport height issues
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  return window.innerHeight;
};

// Smooth scroll with mobile consideration
export const optimizedScroll = (element: HTMLElement, options?: ScrollToOptions) => {
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isMobile) {
    // Use instant scroll on mobile for better performance
    element.scrollIntoView({
      behavior: 'instant'
    } as ScrollIntoViewOptions);
  } else {
    // Use smooth scroll on desktop
    element.scrollIntoView({
      behavior: 'smooth'
    } as ScrollIntoViewOptions);
  }
};

// Touch-friendly spacing utilities
export const getTouchSpacing = () => {
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isMobile) {
    return {
      // Minimum touch target size: 44px iOS, 48dp Android
      minTouchTarget: 48,
      // Increased spacing for touch interfaces
      buttonPadding: '12px 24px',
      formFieldSpacing: 16,
      linkSpacing: 8,
      cardSpacing: 16,
      // Larger gestures
      swipeThreshold: 50,
      tapTimeout: 300,
    };
  }

  return {
    minTouchTarget: 32,
    buttonPadding: '8px 16px',
    formFieldSpacing: 12,
    linkSpacing: 4,
    cardSpacing: 12,
    swipeThreshold: 30,
    tapTimeout: 200,
  };
};

// Mobile-safe image dimensions
export const getMobileImageSizes = () => {
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isMobile) {
    return {
      // Optimized for mobile data usage
      maxWidth: 750,
      quality: 75,
      // Progressive loading
      placeholder: 'blur',
      // Faster loading on mobile
      priority: false,
      // Mobile-optimized sizes
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    };
  }

  return {
    maxWidth: 1920,
    quality: 85,
    placeholder: 'blur',
    priority: false,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };
};

// Mobile performance optimizations
export const getMobilePerformanceSettings = () => {
  const deviceInfo = getDeviceInfo();

  if (deviceInfo.isMobile) {
    return {
      // Reduce animation complexity on mobile
      animationDuration: 0.2,
      staggerDelay: 50,
      // Disable resource-intensive features
      enableParallax: false,
      enableParticles: false,
      enable3DTransforms: false,
      // Optimize for touch
      touchAction: 'pan-y',
      // Reduce simultaneous connections
      maxConcurrentRequests: 4,
      // Optimize images
      imageQuality: 75,
      enableWebP: true,
      enableLazyLoading: true,
    };
  }

  return {
    animationDuration: 0.4,
    staggerDelay: 100,
    enableParallax: true,
    enableParticles: true,
    enable3DTransforms: true,
    touchAction: 'auto',
    maxConcurrentRequests: 6,
    imageQuality: 85,
    enableWebP: true,
    enableLazyLoading: true,
  };
};

// Mobile form optimizations
export const getMobileFormSettings = () => {
  const deviceInfo = getDeviceInfo();

  return {
    // Touch-optimized input types
    inputMode: deviceInfo.isMobile ? 'numeric' : 'text',
    // Larger tap targets
    buttonHeight: deviceInfo.isMobile ? 48 : 36,
    // Mobile-specific keyboards
    keyboardType: deviceInfo.isMobile ? 'tel' : 'text',
    // Autocomplete for mobile
    autocomplete: deviceInfo.isMobile ? 'on' : 'off',
    // Input focus behavior
    preventZoom: deviceInfo.isMobile,
    // Virtual keyboard handling
    adjustViewport: deviceInfo.isMobile,
  };
};

// Mobile-safe intersection observer
export const createMobileObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const deviceInfo = getDeviceInfo();

  const defaultOptions: IntersectionObserverInit = {
    threshold: deviceInfo.isMobile ? 0.1 : 0.2,
    rootMargin: deviceInfo.isMobile ? '50px' : '100px',
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Mobile performance monitoring
export const startMobilePerformanceMonitoring = () => {
  if (typeof window === 'undefined' || !getDeviceInfo().isMobile) return;

  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const performanceWithMemory = performance as PerformanceWithMemory;
      const memory = performanceWithMemory.memory;
      if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
        console.warn('High memory usage detected:', memory.usedJSHeapSize);
      }
    }, 30000); // Check every 30 seconds
  }

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 100) { // Tasks longer than 100ms
          console.warn('Long task detected:', entry.duration, 'ms');
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask might not be supported
    }
  }
};

// Initialize mobile optimizations
export const initializeMobileOptimizations = () => {
  // Set viewport height CSS variable
  getViewportHeight();

  // Listen for orientation changes
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', getViewportHeight);
    window.addEventListener('orientationchange', getViewportHeight);
  }

  // Start performance monitoring on mobile
  startMobilePerformanceMonitoring();

  // Add touch-safe CSS classes
  if (isTouchDevice()) {
    document.documentElement.classList.add('touch-device');
  }

  // Add device-specific CSS classes
  const deviceInfo = getDeviceInfo();
  if (deviceInfo.isMobile) document.documentElement.classList.add('mobile-device');
  if (deviceInfo.isTablet) document.documentElement.classList.add('tablet-device');
  if (deviceInfo.isIOS) document.documentElement.classList.add('ios-device');
  if (deviceInfo.isAndroid) document.documentElement.classList.add('android-device');
};

export default {
  isTouchDevice,
  getDeviceInfo,
  createTouchHandler,
  getViewportHeight,
  optimizedScroll,
  getTouchSpacing,
  getMobileImageSizes,
  getMobilePerformanceSettings,
  getMobileFormSettings,
  createMobileObserver,
  initializeMobileOptimizations,
};