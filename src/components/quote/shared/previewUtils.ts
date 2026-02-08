import { useEffect, useRef, useCallback, useMemo, useState } from 'react'

// Image preloading utility
export class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>()
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>()

  preload(src: string): Promise<HTMLImageElement> {
    // Return cached image if already loaded
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!)
    }

    // Return existing loading promise if currently loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!
    }

    // Create new loading promise
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        this.cache.set(src, img)
        this.loadingPromises.delete(src)
        resolve(img)
      }

      img.onerror = () => {
        this.loadingPromises.delete(src)
        reject(new Error(`Failed to load image: ${src}`))
      }

      // Start loading
      img.src = src
    })

    this.loadingPromises.set(src, promise)
    return promise
  }

  preloadMultiple(srcs: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(srcs.map(src => this.preload(src)))
  }

  clearCache(): void {
    this.cache.clear()
    this.loadingPromises.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

// Global image preloader instance
export const globalImagePreloader = new ImagePreloader()

// Hook for lazy loading images with intersection observer
export function useLazyLoading(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, options])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setError('Failed to load image')
  }, [])

  return {
    ref: imgRef,
    src: imageSrc,
    isLoading,
    error,
    onLoad: handleLoad,
    onError: handleError
  }
}

// Hook for optimized image loading with caching
export function useOptimizedImage(src: string, preload = false) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cachedImage = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!src) return

    const loadImage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (preload || cachedImage.current) {
          const img = await globalImagePreloader.preload(src)
          cachedImage.current = img
        }

        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    }

    loadImage()
  }, [src, preload])

  return {
    isLoading,
    error,
    cachedImage: cachedImage.current
  }
}

// Debounce utility for search and filter operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

// Memoized filter utility for performance
export function useFilteredOptions<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
) {
  return useMemo(() => {
    return items.filter(filterFn)
  }, [items, filterFn, ...dependencies])
}

// Virtual scrolling utility for large lists
export function useVirtualScrolling(
  items: any[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex: visibleRange.startIndex
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()

  startTimer(label: string): () => number {
    const startTime = performance.now()

    return (): number => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }

      this.metrics.get(label)!.push(duration)
      return duration
    }
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label)
    if (!times || times.length === 0) return 0

    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  getMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, { average: number; count: number; min: number; max: number }> = {}

    for (const [label, times] of this.metrics.entries()) {
      if (times.length === 0) continue

      const average = times.reduce((sum, time) => sum + time, 0) / times.length
      const min = Math.min(...times)
      const max = Math.max(...times)

      result[label] = {
        average: Math.round(average * 100) / 100,
        count: times.length,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100
      }
    }

    return result
  }

  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor()

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const timerRef = useRef<(() => number) | null>(null)

  const startTiming = useCallback(() => {
    timerRef.current = globalPerformanceMonitor.startTimer(componentName)
  }, [componentName])

  const endTiming = useCallback((): number => {
    if (timerRef.current) {
      const duration = timerRef.current()
      timerRef.current = null
      return duration
    }
    return 0
  }, [])

  return { startTiming, endTiming }
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null)

  useEffect(() => {
    if (!('memory' in performance)) return

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory
      setMemoryUsage({
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      })
    }

    updateMemoryUsage()
    const interval = setInterval(updateMemoryUsage, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return memoryUsage
}

// Image optimization utilities
export function optimizeImageSrc(src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
} = {}): string {
  const { width, height, quality = 80, format = 'auto' } = options

  // If it's already an optimized URL, return as-is
  if (src.includes('?') && (src.includes('width=') || src.includes('height='))) {
    return src
  }

  // Build optimization parameters
  const params = new URLSearchParams()

  if (width) params.set('width', width.toString())
  if (height) params.set('height', height.toString())
  params.set('quality', quality.toString())
  params.set('format', format)

  // Add parameters to URL
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}${params.toString()}`
}

// Hook for responsive image loading
export function useResponsiveImage(src: string, breakpoints: {
  sm?: { width?: number; height?: number };
  md?: { width?: number; height?: number };
  lg?: { width?: number; height?: number };
  xl?: { width?: number; height?: number };
}) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('md')
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src)

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      let breakpoint = 'md'

      if (width < 640) breakpoint = 'sm'
      else if (width >= 640 && width < 768) breakpoint = 'sm'
      else if (width >= 768 && width < 1024) breakpoint = 'md'
      else if (width >= 1024 && width < 1280) breakpoint = 'lg'
      else if (width >= 1280) breakpoint = 'xl'

      setCurrentBreakpoint(breakpoint)
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  useEffect(() => {
    const breakpointConfig = breakpoints[currentBreakpoint as keyof typeof breakpoints]
    if (breakpointConfig) {
      setOptimizedSrc(optimizeImageSrc(src, breakpointConfig))
    }
  }, [src, currentBreakpoint, breakpoints])

  return {
    src: optimizedSrc,
    breakpoint: currentBreakpoint
  }
}