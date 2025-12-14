import { motion, Variants, MotionProps } from 'framer-motion';

/**
 * Performance-optimized animation utilities
 * Optimized for mobile devices with respect for reduced motion preferences
 */

// Device detection for performance optimization
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isLowEndDevice = () => {
  if (typeof window === 'undefined') return false;
  // Check for low-end device indicators
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const isSlowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
  const isLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
  const isSlowCPU = (navigator as any).hardwareConcurrency && (navigator as any).hardwareConcurrency < 4;

  return isSlowConnection || isLowMemory || isSlowCPU;
};

// Respect reduced motion preferences
const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation settings based on device capabilities
export const getAnimationSettings = () => {
  const mobile = isMobile();
  const lowEnd = isLowEndDevice();
  const reducedMotion = shouldReduceMotion();

  return {
    isMobile: mobile,
    isLowEndDevice: lowEnd,
    reducedMotion: reducedMotion,
    // Reduce animation complexity on low-end devices
    springStiffness: lowEnd ? 100 : 200,
    springDamping: lowEnd ? 20 : 15,
    // Reduce animation duration on mobile
    fastDuration: reducedMotion ? 0.01 : (mobile ? 0.2 : 0.3),
    normalDuration: reducedMotion ? 0.01 : (mobile ? 0.3 : 0.5),
    slowDuration: reducedMotion ? 0.01 : (mobile ? 0.4 : 0.7),
    // Disable complex animations on low-end devices
    useGpuAcceleration: !lowEnd,
    enableParallax: !lowEnd && !mobile,
  };
};

// Performance-optimized variants
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: getAnimationSettings().reducedMotion ? 0 : 20,
    transitionEnd: {
      willChange: 'auto',
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: getAnimationSettings().normalDuration,
      ease: [0.25, 0.46, 0.45, 0.94],
    }
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: getAnimationSettings().fastDuration,
      ease: 'easeOut',
    }
  },
};

export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: getAnimationSettings().reducedMotion ? 0 : -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: getAnimationSettings().normalDuration,
      ease: [0.25, 0.46, 0.45, 0.94],
    }
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: getAnimationSettings().reducedMotion ? 1 : 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: getAnimationSettings().fastDuration,
      ease: 'easeOut',
    }
  },
};

// Stagger animation for lists
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: getAnimationSettings().isLowEndDevice ? 0.05 : 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: getAnimationSettings().fastDuration,
    },
  },
};

// Hover animations optimized for touch devices
export const hoverScale = {
  whileHover: !isMobile() ? {
    scale: 1.05,
    transition: {
      duration: getAnimationSettings().fastDuration,
      ease: 'easeOut',
    },
  } : undefined,
  whileTap: {
    scale: isMobile() ? 0.95 : 0.98,
    transition: {
      duration: getAnimationSettings().fastDuration,
      ease: 'easeOut',
    },
  },
};

// Parallax animation (disabled on mobile/low-end)
export const parallaxVariants: Variants = {
  hidden: { y: 0 },
  visible: {
    y: getAnimationSettings().enableParallax ? [-50, 50] : 0,
    transition: {
      duration: getAnimationSettings().slowDuration * 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};

// Optimized page transition
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: getAnimationSettings().reducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: getAnimationSettings().normalDuration,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: getAnimationSettings().reducedMotion ? 0 : -20,
    transition: {
      duration: getAnimationSettings().fastDuration,
      ease: 'easeInOut',
    },
  },
};

// Custom motion component with performance optimizations
interface OptimizedMotionProps extends MotionProps {
  children: React.ReactNode;
  disableAnimation?: boolean;
  useGpu?: boolean;
}

export const OptimizedMotion = ({
  children,
  disableAnimation = false,
  useGpu = true,
  ...props
}: OptimizedMotionProps) => {
  const settings = getAnimationSettings();

  // Disable animations if user prefers reduced motion or if disabled
  if (settings.reducedMotion || disableAnimation) {
    return <div {...(props as any)}>{children}</div>;
  }

  // Add performance optimizations
  const motionProps: MotionProps = {
    ...props,
    // Optimize for GPU acceleration
    style: {
      ...(props.style || {}),
      ...(useGpu && settings.useGpuAcceleration && {
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden' as const,
        perspective: 1000,
      }),
    },
    // Add layout animation only on capable devices
    layout: !settings.isLowEndDevice,
    // Disable animation if not needed
    animate: settings.reducedMotion ? undefined : props.animate,
    transition: {
      duration: settings.fastDuration,
      ease: 'easeOut',
      ...props.transition,
    },
  };

  return <motion.div {...motionProps}>{children}</motion.div>;
};

// Hook for performance-optimized scroll animations
export const useScrollAnimation = () => {
  const settings = getAnimationSettings();

  return {
    initial: 'hidden',
    whileInView: 'visible',
    viewport: {
      once: true,
      margin: settings.isMobile ? '-50px' : '-100px',
    },
    variants: fadeInUp,
  };
};

// Spring animation optimized for device capabilities
export const optimizedSpring = {
  type: 'spring' as const,
  stiffness: getAnimationSettings().springStiffness,
  damping: getAnimationSettings().springDamping,
  mass: getAnimationSettings().isLowEndDevice ? 0.5 : 1,
};

// Animation utilities for smooth scroll
export const smoothScroll = {
  behavior: 'smooth' as const,
  block: 'start' as const,
  inline: 'nearest' as const,
};

export default {
  fadeInUp,
  fadeIn,
  slideInLeft,
  scaleIn,
  staggerContainer,
  staggerItem,
  hoverScale,
  parallaxVariants,
  pageTransition,
  OptimizedMotion,
  useScrollAnimation,
  optimizedSpring,
  getAnimationSettings,
  smoothScroll,
};