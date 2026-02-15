// Google Analytics 4 and Performance Monitoring
// Google Analytics 4 および性能モニタリング設定

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Send pageview to GA4
export const sendPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      custom_map: {
        dimension1: 'page_category',
        dimension2: 'user_language',
        dimension3: 'user_device',
        metric1: 'engagement_time',
      },
    });
  }
};

// Send event to GA4
export const sendEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, parameters);
  }
};

// Custom events for Epackage Lab
export const analyticsEvents = {
  // Contact form events
  CONTACT_FORM_VIEW: 'contact_form_view',
  CONTACT_FORM_START: 'contact_form_start',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  CONTACT_FORM_SUCCESS: 'contact_form_success',
  CONTACT_FORM_ERROR: 'contact_form_error',

  // Sample request events
  SAMPLE_FORM_VIEW: 'sample_form_view',
  SAMPLE_FORM_START: 'sample_form_start',
  SAMPLE_FORM_SUBMIT: 'sample_form_submit',
  SAMPLE_FORM_SUCCESS: 'sample_form_success',
  SAMPLE_FORM_ERROR: 'sample_form_error',

  // Catalog events
  CATALOG_VIEW: 'catalog_view',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_FILTER: 'product_filter',
  PRODUCT_SEARCH: 'product_search',

  // Quotation events
  QUOTATION_CALCULATE: 'quotation_calculate',
  QUOTATION_PDF_GENERATE: 'quotation_pdf_generate',
  QUOTATION_EMAIL_SEND: 'quotation_email_send',

  // Performance events
  PAGE_LOAD_COMPLETE: 'page_load_complete',
  FORM_LOAD_TIME: 'form_load_time',
  API_RESPONSE_TIME: 'api_response_time',

  // User engagement events
  SCROLL_DEPTH_25: 'scroll_depth_25',
  SCROLL_DEPTH_50: 'scroll_depth_50',
  SCROLL_DEPTH_75: 'scroll_depth_75',
  SCROLL_DEPTH_100: 'scroll_depth_100',
  TIME_ON_PAGE_30S: 'time_on_page_30s',
  TIME_ON_PAGE_60S: 'time_on_page_60s',
  TIME_ON_PAGE_120S: 'time_on_page_120s',
};

// Track Web Vitals
export const trackWebVitals = () => {
  const sendWebVital = (metric: any) => {
    sendEvent('web_vital', {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_id: metric.id,
    });

    // Also send to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric);
    }
  };

  onCLS(sendWebVital);
  onFID(sendWebVital);
  onFCP(sendWebVital);
  onLCP(sendWebVital);
  onTTFB(sendWebVital);
};

// Performance monitoring utilities
export const performanceTracker = {
  // Track form loading time
  trackFormLoad: (formName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    sendEvent('form_load_complete', {
      form_name: formName,
      load_time: Math.round(loadTime),
    });
    return loadTime;
  },

  // Track API response time
  trackApiResponse: (endpoint: string, startTime: number, success: boolean) => {
    const responseTime = performance.now() - startTime;
    sendEvent('api_response', {
      endpoint: endpoint,
      response_time: Math.round(responseTime),
      success: success,
    });
    return responseTime;
  },

  // Track page load time
  trackPageLoad: (pageName: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

        sendEvent('page_load_complete', {
          page_name: pageName,
          load_time: Math.round(loadTime),
        });
      });
    }
  },
};

// Scroll depth tracking
export const setupScrollTracking = () => {
  if (typeof window === 'undefined') return;

  let maxScroll = 0;
  const scrollThresholds = [25, 50, 75, 100];
  const trackedThresholds = new Set<number>();

  const handleScroll = () => {
    const scrollPercentage = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    maxScroll = Math.max(maxScroll, scrollPercentage);

    scrollThresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && !trackedThresholds.has(threshold)) {
        trackedThresholds.add(threshold);
        sendEvent(`scroll_depth_${threshold}`, {
          scroll_percentage: threshold,
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Track max scroll on page unload
  window.addEventListener('beforeunload', () => {
    sendEvent('max_scroll_depth', {
      max_scroll_percentage: maxScroll,
    });
  });
};

// Time on page tracking
export const setupTimeOnPageTracking = () => {
  if (typeof window === 'undefined') return;

  const timeThresholds = [30, 60, 120]; // seconds
  const startTime = Date.now();

  const trackTimeThreshold = (threshold: number) => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    if (timeOnPage >= threshold) {
      sendEvent(`time_on_page_${threshold}s`, {
        time_on_page: timeOnPage,
      });
    }
  };

  timeThresholds.forEach(threshold => {
    setTimeout(() => trackTimeThreshold(threshold), threshold * 1000);
  });
};

// Error tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  sendEvent('javascript_error', {
    error_name: error.name,
    error_message: error.message,
    error_stack: error.stack?.substring(0, 1000), // Limit stack trace length
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    context: JSON.stringify(context || {}),
  });
};

// Analytics initialization
export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Track Web Vitals
    trackWebVitals();

    // Setup scroll tracking
    setupScrollTracking();

    // Setup time on page tracking
    setupTimeOnPageTracking();

    // Setup global error tracking
    window.addEventListener('error', (event) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      trackError(new Error('Unhandled Promise Rejection'), {
        reason: event.reason,
      });
    });
  }
};

// Custom hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent: sendEvent,
    trackPageView: sendPageView,
    trackError,
    performance: performanceTracker,
  };
};

// Type declarations
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void;
  }
}