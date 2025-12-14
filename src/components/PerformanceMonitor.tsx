'use client'

import { useEffect } from 'react'

interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      const metrics: PerformanceMetrics = {
        lcp: null,
        fid: null,
        cls: null,
        ttfb: null,
      }

      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          metrics.lcp = entry.startTime
          console.log(`LCP: ${entry.startTime.toFixed(2)}ms`)
        }

        if (entry.entryType === 'first-input') {
          const firstInput = entry as any
          metrics.fid = firstInput.processingStart - firstInput.startTime
          console.log(`FID: ${metrics.fid.toFixed(2)}ms`)
        }

        if (entry.entryType === 'layout-shift') {
          const layoutShiftEntry = entry as any
          if (!layoutShiftEntry.hadRecentInput) {
            metrics.cls = (metrics.cls || 0) + layoutShiftEntry.value
            console.log(`CLS: ${(metrics.cls || 0).toFixed(3)}`)
          }
        }
      }

      // Performance evaluation
      const performance = {
        lcp: {
          good: metrics.lcp && metrics.lcp <= 2500,
          needsImprovement: metrics.lcp && metrics.lcp > 2500 && metrics.lcp <= 4000,
          poor: metrics.lcp && metrics.lcp > 4000,
        },
        fid: {
          good: metrics.fid && metrics.fid <= 100,
          needsImprovement: metrics.fid && metrics.fid > 100 && metrics.fid <= 300,
          poor: metrics.fid && metrics.fid > 300,
        },
        cls: {
          good: metrics.cls !== null && metrics.cls <= 0.1,
          needsImprovement: metrics.cls !== null && metrics.cls > 0.1 && metrics.cls <= 0.25,
          poor: metrics.cls !== null && metrics.cls > 0.25,
        },
      }

      // Console summary
      console.group('🎯 Core Web Vitals Report')
      console.log('LCP:', metrics.lcp ? `${metrics.lcp.toFixed(0)}ms (${performance.lcp.good ? '✅ Good' : performance.lcp.needsImprovement ? '⚠️ Needs Improvement' : '❌ Poor'})` : 'N/A')
      console.log('FID:', metrics.fid ? `${metrics.fid.toFixed(0)}ms (${performance.fid.good ? '✅ Good' : performance.fid.needsImprovement ? '⚠️ Needs Improvement' : '❌ Poor'})` : 'N/A')
      console.log('CLS:', metrics.cls !== null ? `${metrics.cls.toFixed(3)} (${performance.cls.good ? '✅ Good' : performance.cls.needsImprovement ? '⚠️ Needs Improvement' : '❌ Poor'})` : 'N/A')
      console.groupEnd()
    })

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Performance observer not supported:', error)
    }

    // TTFB measurement
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      console.log(`TTFB: ${ttfb.toFixed(2)}ms`)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // This component doesn't render anything visible
  return null
}