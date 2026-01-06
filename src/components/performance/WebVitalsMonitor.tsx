'use client';

import { useEffect, useState } from 'react';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

interface WebVitalsData {
  LCP?: VitalMetric;
  FID?: VitalMetric;
  CLS?: VitalMetric;
  FCP?: VitalMetric;
  TTFB?: VitalMetric;
  INP?: VitalMetric;
}

/**
 * Web Vitals monitoring component for real-time performance tracking
 * Implements the latest Web Vitals library with enhanced metrics
 */
export function WebVitalsMonitor() {
  const [vitals, setVitals] = useState<WebVitalsData>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let importWebVitals: {
      onLCP: (callback: (metric: Metric) => void) => void;
      onFID: (callback: (metric: Metric) => void) => void;
      onINP: (callback: (metric: Metric) => void) => void;
      onCLS: (callback: (metric: Metric) => void) => void;
      onFCP: (callback: (metric: Metric) => void) => void;
      onTTFB: (callback: (metric: Metric) => void) => void;
    } | undefined;

    const loadWebVitals = async () => {
      try {
        importWebVitals = await import('web-vitals');

        const vitalsCollector: WebVitalsData = {};

        // Largest Contentful Paint (LCP)
        importWebVitals.onLCP((metric) => {
          const vitalMetric: VitalMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          };
          vitalsCollector.LCP = vitalMetric;
          setVitals({ ...vitalsCollector });

          // Send to analytics in production
          if (process.env.NODE_ENV === 'production') {
            sendToAnalytics(vitalMetric);
          }
        });

        // First Input Delay (FID) - Legacy
        importWebVitals.onFID((metric) => {
          const vitalMetric: VitalMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          };
          vitalsCollector.FID = vitalMetric;
          setVitals({ ...vitalsCollector });
          sendToAnalytics(vitalMetric);
        });

        // Interaction to Next Paint (INP) - New metric
        importWebVitals.onINP((metric) => {
          const vitalMetric: VitalMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          };
          vitalsCollector.INP = vitalMetric;
          setVitals({ ...vitalsCollector });
          sendToAnalytics(vitalMetric);
        });

        // Cumulative Layout Shift (CLS)
        importWebVitals.onCLS((metric) => {
          const vitalMetric: VitalMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          };
          vitalsCollector.CLS = vitalMetric;
          setVitals({ ...vitalsCollector });
          sendToAnalytics(vitalMetric);
        });

        // First Contentful Paint (FCP)
        importWebVitals.onFCP((metric) => {
          const vitalMetric: VitalMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          };
          vitalsCollector.FCP = vitalMetric;
          setVitals({ ...vitalsCollector });
          sendToAnalytics(vitalMetric);
        });

        // Time to First Byte (TTFB)
        importWebVitals.onTTFB((metric) => {
          const vitalMetric: VitalMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          };
          vitalsCollector.TTFB = vitalMetric;
          setVitals({ ...vitalsCollector });
          sendToAnalytics(vitalMetric);
        });

      } catch (error) {
        console.warn('Failed to load web-vitals:', error);
      }
    };

    loadWebVitals();

    // Performance monitoring
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} = ${entry.duration}ms`);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['measure'] });
    } catch (e) {
      // PerformanceObserver might not be available
    }

    return () => observer.disconnect();
  }, []);

  // Send metrics to analytics endpoint
  const sendToAnalytics = (metric: VitalMetric) => {
    // Send to your analytics service
    if (typeof window !== 'undefined' && 'gtag' in window && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
        custom_map: {
          metric_rating: metric.rating,
          metric_delta: metric.delta,
        },
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${metric.name}:`, {
        value: `${metric.value.toFixed(2)}${getMetricUnit(metric.name)}`,
        rating: metric.rating,
        delta: `${metric.delta.toFixed(2)}${getMetricUnit(metric.name)}`,
      });
    }
  };

  const getMetricUnit = (name: string): string => {
    switch (name) {
      case 'CLS':
        return '';
      case 'INP':
      case 'FID':
        return 'ms';
      case 'LCP':
      case 'FCP':
      case 'TTFB':
        return 'ms';
      default:
        return 'ms';
    }
  };

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (name: string, value: number): string => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return Math.round(value).toString();
  };

  const calculateOverallScore = (): number => {
    const ratings = Object.values(vitals)
      .filter(Boolean)
      .map(vital => vital.rating);

    if (ratings.length === 0) return 0;

    const goodCount = ratings.filter(rating => rating === 'good').length;
    return Math.round((goodCount / ratings.length) * 100);
  };

  if (process.env.NODE_ENV !== 'development' && !isVisible) {
    // Show small toggle button in production
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-navy-700 text-white p-2 rounded-full shadow-lg hover:bg-navy-600 transition-colors"
        title="Show Performance Metrics"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl p-4 max-w-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Performance Metrics</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            Score: <span className={calculateOverallScore() >= 90 ? 'text-green-600' : calculateOverallScore() >= 70 ? 'text-yellow-600' : 'text-red-600'}>
              {calculateOverallScore()}%
            </span>
          </div>
          {process.env.NODE_ENV === 'production' && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(vitals).map(([key, vital]) => {
          if (!vital) return null;

          return (
            <div key={vital.id} className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">{key}:</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono ${getRatingColor(vital.rating)}`}>
                  {formatValue(vital.name, vital.value)}{getMetricUnit(vital.name)}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${getRatingColor(vital.rating)} bg-opacity-10`}>
                  {vital.rating}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>LCP &lt; 2.5s</div>
          <div>INP &lt; 200ms</div>
          <div>CLS &lt; 0.1</div>
          <div>FCP &lt; 1.8s</div>
          <div>TTFB &lt; 800ms</div>
        </div>
      </div>
    </div>
  );
}

export default WebVitalsMonitor;