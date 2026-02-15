/**
 * Lazy Loading Utilities
 *
 * レイジーローディングユーティリティ
 *
 * Utilities for lazy loading components with loading states and error boundaries
 */

import React, { lazy, ComponentType, Suspense, LazyExoticComponent } from 'react';
import dynamic from 'next/dynamic';

// ============================================================
// Types
// ============================================================

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  ssr?: boolean;
  loading?: ComponentType;
}

interface DynamicImportOptions {
  loading?: ComponentType;
  ssr?: boolean;
}

// ============================================================
// Loading Components
// ============================================================

/**
 * Default loading spinner
 */
export function DefaultLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

/**
 * Default loading skeleton
 */
export function DefaultLoadingSkeleton() {
  return (
    <div className="animate-pulse p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

/**
 * Full page loading state
 */
export function FullPageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

// ============================================================
// Lazy Loading Utilities
// ============================================================

/**
 * Create a lazy loaded component with loading state
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    fallback = <DefaultLoadingSpinner />,
    ssr = true,
  } = options;

  return lazy(importFn);
}

/**
 * Create a lazy loaded component with Suspense wrapper
 */
export function lazyWithFallback<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): ComponentType<any> {
  const LazyComponent = lazy(importFn);
  const {
    fallback = <DefaultLoadingSpinner />,
  } = options;

  return function LazyWrapper(props: any) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Create a dynamically imported component for Next.js
 */
export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
): ComponentType<any> {
  const {
    loading: LoadingComponent = DefaultLoadingSpinner,
    ssr = true,
  } = options;

  return dynamic(() => importFn(), {
    loading: LoadingComponent,
    ssr,
  });
}

// ============================================================
// Predefined Lazy Components
// ============================================================

/**
 * Lazy load heavy admin components
 */
export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin/dashboard/DashboardWidget'),
  {
    loading: () => <DefaultLoadingSkeleton />,
    ssr: false,
  }
);

/**
 * Lazy load chart components
 */
export const LazyChart = dynamic(
  () => import('recharts'),
  {
    loading: () => <DefaultLoadingSpinner />,
    ssr: false,
  }
);

/**
 * Lazy load PDF generation components
 */
export const LazyPdfGenerator = dynamic(
  () => import('@/lib/pdf-generator'),
  {
    loading: () => <DefaultLoadingSpinner />,
    ssr: false,
  }
);

/**
 * Lazy load rich text editor
 */
export const LazyRichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor'),
  {
    loading: () => <DefaultLoadingSkeleton />,
    ssr: false,
  }
);

// ============================================================
// Component Wrappers
// ============================================================

/**
 * Wrap component with lazy loading and error boundary
 */
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback: React.ReactNode = <DefaultLoadingSpinner />
): ComponentType<P> {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * HOC for code splitting at route level
 */
export function splitRoute<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: React.ReactNode = <FullPageLoading />
): ComponentType<P> {
  const LazyComponent = lazy(importFn);

  return function RouteWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ============================================================
// Image Lazy Loading Utilities
// ============================================================

/**
 * Create an image lazy loading wrapper
 */
export function createLazyImage(
  src: string,
  options: {
    alt?: string;
    className?: string;
    placeholder?: string;
  } = {}
) {
  const { alt = '', className = '', placeholder = '' } = options;

  return function LazyImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
      <img
        {...props}
        src={src}
        alt={alt || props.alt}
        className={className || props.className}
        loading="lazy"
        decoding="async"
      />
    );
  };
}

/**
 * Intersection Observer lazy image component
 */
export function LazyIntersectionImage({
  src,
  alt,
  className,
  placeholder,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholder?: string;
}) {
  const [imageSrc, setImageSrc] = React.useState<string | undefined>(placeholder);
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (!imageRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && src) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(imageRef);

    return () => {
      observer.disconnect();
    };
  }, [imageRef, src]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

// ============================================================
// Export Utilities
// ============================================================

export {
  dynamic,
  lazy,
  Suspense,
};

export default {
  createLazyComponent,
  lazyWithFallback,
  createDynamicComponent,
  withLazyLoad,
  splitRoute,
  DefaultLoadingSpinner,
  DefaultLoadingSkeleton,
  FullPageLoading,
  LazyIntersectionImage,
};
