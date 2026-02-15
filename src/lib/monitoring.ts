// Enhanced Performance and Error Monitoring System for Multi-Quantity System
// 多数量システムのための強化されたパフォーマンスとエラーモニタリングシステム

interface PerformanceMetrics {
  navigationStart: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
  timeToInteractive?: number
  bundleSize?: number
}

interface ErrorData {
  message: string
  stack?: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  buildVersion?: string
  context?: Record<string, any>
}

interface MultiQuantityMetrics {
  calculationTime: number
  quantityCount: number
  cacheHitRate: number
  errorRate: number
  userInteractions: number
  conversionRate: number
}

class MonitoringService {
  private static instance: MonitoringService
  private sessionId: string
  private userId: string | null = null
  private buildVersion: string
  private metrics: PerformanceMetrics = {
    navigationStart: 0
  }
  private multiQuantityMetrics: MultiQuantityMetrics = {
    calculationTime: 0,
    quantityCount: 0,
    cacheHitRate: 0,
    errorRate: 0,
    userInteractions: 0,
    conversionRate: 0
  }

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown'
    this.initializeMetrics()
    this.setupPerformanceObserver()
    this.setupErrorHandlers()
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private initializeMetrics() {
    if (typeof window !== 'undefined') {
      this.metrics.navigationStart = performance.now()
    }
  }

  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return

    // Observe Core Web Vitals
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()

        entries.forEach(entry => {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                this.metrics.firstContentfulPaint = entry.startTime
              }
              break

            case 'largest-contentful-paint':
              this.metrics.largestContentfulPaint = entry.startTime
              break

            case 'first-input':
              this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime
              break

            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                this.metrics.cumulativeLayoutShift =
                  (this.metrics.cumulativeLayoutShift || 0) + (entry as any).value
              }
              break
          }
        })
      })

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Performance observer setup failed:', error)
    }
  }

  private setupErrorHandlers() {
    if (typeof window !== 'undefined') {
      // Catch JavaScript errors
      window.addEventListener('error', (event) => {
        this.trackError(new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        })
      })

      // Catch unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(new Error(event.reason?.message || 'Unhandled Promise Rejection'), {
          reason: event.reason
        })
      })

      // Monitor fetch errors
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const startTime = performance.now()
        const url = args[0] as string

        try {
          const response = await originalFetch(...args)
          const endTime = performance.now()
          const duration = endTime - startTime

          this.trackApiCall(url, duration, response.status)

          return response
        } catch (error) {
          const endTime = performance.now()
          const duration = endTime - startTime

          this.trackApiCall(url, duration, 0, error instanceof Error ? error.message : 'Unknown error')
          throw error
        }
      }
    }
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>) {
    const errorData: ErrorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      context
    }

    this.sendError(errorData)

    // Update error rate
    this.multiQuantityMetrics.errorRate = Math.min(1, this.multiQuantityMetrics.errorRate + 0.01)
  }

  private async sendError(errorData: ErrorData) {
    try {
      // Send to error tracking service
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      })

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Monitoring Error]', errorData)
      }
    } catch (err) {
      console.warn('Failed to send error:', err)
    }
  }

  // Performance tracking
  trackPageView(path?: string) {
    if (typeof window === 'undefined') return

    const pageViewData = {
      path: path || window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent
    }

    this.sendEvent('page_view', pageViewData)
  }

  trackUserAction(action: string, properties: Record<string, any> = {}) {
    this.multiQuantityMetrics.userInteractions++

    const actionData = {
      action,
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userId: this.userId || undefined,
      sessionId: this.sessionId
    }

    this.sendEvent('user_action', actionData)
  }

  trackPerformance(metricName: string, value: number, properties: Record<string, any> = {}) {
    const performanceData = {
      metric: metricName,
      value,
      ...properties,
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined,
      sessionId: this.sessionId
    }

    this.sendEvent('performance', performanceData)
  }

  private async sendEvent(eventType: string, data: any) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          data
        })
      })
    } catch (err) {
      console.warn('Failed to send event:', err)
    }
  }

  // User identification
  setUserId(userId: string) {
    this.userId = userId
    this.trackUserAction('user_identified', { userId })
  }

  clearUserId() {
    this.userId = null
  }

  // Core Web Vitals collection
  getCoreWebVitals(): Partial<PerformanceMetrics> {
    return {
      firstContentfulPaint: this.metrics.firstContentfulPaint,
      largestContentfulPaint: this.metrics.largestContentfulPaint,
      firstInputDelay: this.metrics.firstInputDelay,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift
    }
  }

  // Multi-quantity specific tracking
  trackMultiQuantityCalculation(quantities: number[], calculationTime: number, success: boolean, cacheHit: boolean = false) {
    this.multiQuantityMetrics.calculationTime = calculationTime
    this.multiQuantityMetrics.quantityCount = quantities.length

    if (cacheHit) {
      this.multiQuantityMetrics.cacheHitRate = Math.min(1, this.multiQuantityMetrics.cacheHitRate + 0.1)
    }

    this.trackPerformance('multi_quantity_calculation', calculationTime, {
      quantityCount: quantities.length,
      minQuantity: Math.min(...quantities),
      maxQuantity: Math.max(...quantities),
      success,
      cacheHit
    })

    if (success) {
      this.trackUserAction('multi_quantity_calculated', {
        quantityCount: quantities.length,
        totalQuantities: quantities.reduce((sum, q) => sum + q, 0)
      })

      // Track conversion
      this.multiQuantityMetrics.conversionRate = Math.min(1, this.multiQuantityMetrics.conversionRate + 0.05)
    }
  }

  trackComparisonExport(format: string, success: boolean) {
    this.trackUserAction('comparison_exported', {
      format,
      success
    })
  }

  trackComparisonSave(success: boolean, error?: string) {
    this.trackUserAction('comparison_saved', {
      success,
      error
    })
  }

  trackQuoteRequest(quoteType: string, success: boolean, processingTime?: number) {
    this.trackUserAction('quote_requested', {
      quoteType,
      success,
      processingTime
    })

    if (processingTime) {
      this.trackPerformance('quote_processing_time', processingTime, {
        quoteType,
        success
      })
    }
  }

  // API call tracking
  private trackApiCall(endpoint: string, duration: number, status: number, error?: string) {
    this.trackPerformance('api_call', duration, {
      endpoint,
      status,
      success: status >= 200 && status < 400,
      error
    })
  }

  // Get multi-quantity metrics
  getMultiQuantityMetrics(): MultiQuantityMetrics {
    return { ...this.multiQuantityMetrics }
  }

  // Health check
  async performHealthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    const startTime = Date.now()

    try {
      // Check API connectivity
      const apiResponse = await fetch('/api/health', {
        method: 'GET'
      })

      const apiTime = Date.now() - startTime

      // Check Core Web Vitals
      const vitals = this.getCoreWebVitals()

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      const issues: string[] = []

      // API health check
      if (!apiResponse.ok) {
        status = 'unhealthy'
        issues.push(`API status: ${apiResponse.status}`)
      } else if (apiTime > 3000) {
        status = 'degraded'
        issues.push(`Slow API response: ${apiTime}ms`)
      }

      // Performance checks
      if (vitals.firstContentfulPaint && vitals.firstContentfulPaint > 3000) {
        status = status === 'healthy' ? 'degraded' : status
        issues.push(`Slow FCP: ${vitals.firstContentfulPaint}ms`)
      }

      if (vitals.cumulativeLayoutShift && vitals.cumulativeLayoutShift > 0.25) {
        status = status === 'healthy' ? 'degraded' : status
        issues.push(`High CLS: ${vitals.cumulativeLayoutShift}`)
      }

      return {
        status,
        details: {
          apiResponseTime: apiTime,
          apiStatus: apiResponse.status,
          vitals,
          multiQuantityMetrics: this.multiQuantityMetrics,
          issues,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        }
      }
    }
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance()

// Export types
export type { PerformanceMetrics, ErrorData, MultiQuantityMetrics }

// Convenience hooks for React components
export const useMonitoring = () => {
  const trackPageView = (path?: string) => monitoring.trackPageView(path)
  const trackUserAction = (action: string, properties?: Record<string, any>) =>
    monitoring.trackUserAction(action, properties)
  const trackError = (error: Error, context?: Record<string, any>) =>
    monitoring.trackError(error, context)

  return {
    trackPageView,
    trackUserAction,
    trackError,
    getCoreWebVitals: () => monitoring.getCoreWebVitals(),
    getMultiQuantityMetrics: () => monitoring.getMultiQuantityMetrics(),
    setUserId: (userId: string) => monitoring.setUserId(userId),
    clearUserId: () => monitoring.clearUserId(),
    performHealthCheck: () => monitoring.performHealthCheck()
  }
}