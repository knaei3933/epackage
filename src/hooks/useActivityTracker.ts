'use client'

import { useEffect, useRef, useCallback } from 'react'

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click'
] as const

const STORAGE_KEY = 'epac_last_activity'

// Throttle intervals: localStorage writes are decoupled from the activity
// callback throttle so high-frequency mouse/scroll events don't block the
// main thread with synchronous storage I/O.
const ACTIVITY_THROTTLE_MS = 10_000
const STORAGE_FLUSH_MS = 60_000

// Role-based timeout configuration
// NOTE: Client timeout must be SHORTER than server session
// Configured for optimal balance between security and user experience
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000      // 30 minutes (standard session timeout)
const DEFAULT_WARNING_MS = 25 * 60 * 1000      // 25 minutes (5 min warning before timeout)
const ADMIN_TIMEOUT_MS = 60 * 60 * 1000        // 60 minutes for admins (1 hour)
const ADMIN_WARNING_MS = 55 * 60 * 1000        // 55 minutes (5 min warning)

interface UseActivityTrackerOptions {
  enabled: boolean
  userRole?: string
  onInactivityWarning?: () => void
  onInactivityTimeout: () => void
  onActivity?: () => void  // Called when user is active - for session refresh
}

// Role-based timeout calculation
const getTimeoutConfig = (role?: string) => {
  if (role === 'admin') {
    return {
      inactivityTimeoutMs: ADMIN_TIMEOUT_MS,
      warningThresholdMs: ADMIN_WARNING_MS,
    }
  }
  return {
    inactivityTimeoutMs: DEFAULT_TIMEOUT_MS,
    warningThresholdMs: DEFAULT_WARNING_MS,
  }
}

export function useActivityTracker({
  enabled,
  userRole,
  onInactivityWarning,
  onInactivityTimeout,
  onActivity,
}: UseActivityTrackerOptions) {
  const { inactivityTimeoutMs, warningThresholdMs } = getTimeoutConfig(userRole)

  const lastActivityRef = useRef<number>(Date.now())
  const warningFiredRef = useRef<boolean>(false)
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  // Decoupled storage-flush throttle: only persist to localStorage once
  // per STORAGE_FLUSH_MS window instead of on every activity event.
  const lastStorageFlushRef = useRef<number>(0)

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    warningFiredRef.current = false

    // Persist to localStorage for cross-tab awareness.
    // Throttled separately from the activity callback: high-frequency
    // mousemove/scroll events used to trigger synchronous localStorage
    // writes on every throttle tick. Now we flush at most once per
    // STORAGE_FLUSH_MS, reducing main-thread blocking while still
    // keeping cross-tab awareness reasonably fresh.
    if (typeof window !== 'undefined') {
      if (now - lastStorageFlushRef.current >= STORAGE_FLUSH_MS) {
        localStorage.setItem(STORAGE_KEY, now.toString())
        lastStorageFlushRef.current = now
      }
    }

    // Call activity callback for session refresh (activity-based, not polling)
    if (onActivity) {
      onActivity()
    }

    // Reset timers
    resetTimers()
    scheduleTimers()
  }, [onActivity, inactivityTimeoutMs, warningThresholdMs])

  // Schedule warning and timeout
  const scheduleTimers = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current
    const timeUntilWarning = warningThresholdMs - timeSinceLastActivity
    const timeUntilTimeout = inactivityTimeoutMs - timeSinceLastActivity

    // Schedule warning
    if (onInactivityWarning && timeUntilWarning > 0) {
      warningTimeoutIdRef.current = setTimeout(() => {
        if (!warningFiredRef.current) {
          warningFiredRef.current = true
          onInactivityWarning()
        }
      }, timeUntilWarning)
    }

    // Schedule timeout
    if (timeUntilTimeout > 0) {
      timeoutIdRef.current = setTimeout(() => {
        onInactivityTimeout()
      }, timeUntilTimeout)
    }
  }, [onInactivityWarning, onInactivityTimeout, inactivityTimeoutMs, warningThresholdMs])

  // Clear all timers
  const resetTimers = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = null
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current)
      warningTimeoutIdRef.current = null
    }
  }, [])

  // Setup event listeners
  useEffect(() => {
    if (!enabled) {
      resetTimers()
      return
    }

    // Initialize from localStorage (cross-tab sync)
    const storedActivity = localStorage.getItem(STORAGE_KEY)
    if (storedActivity) {
      lastActivityRef.current = parseInt(storedActivity, 10)
    }

    // Throttled activity handler (10 seconds throttle)
    let throttleTimeout: NodeJS.Timeout | null = null
    const throttledUpdateActivity = () => {
      // Throttle guard: while a throttle window is open, ignore further events
      // rather than clearing/resetting the timer on every tick. lastActivityRef
      // is kept current inside updateActivity, so the active timer stays valid.
      if (throttleTimeout) return
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null
      }, ACTIVITY_THROTTLE_MS)
      updateActivity()
    }

    // Attach event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, throttledUpdateActivity, { passive: true })
    })

    // Start timers
    scheduleTimers()

    // Check for cross-tab activity changes
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        lastActivityRef.current = parseInt(e.newValue, 10)
        warningFiredRef.current = false
        resetTimers()
        scheduleTimers()
      }
    }
    window.addEventListener('storage', storageHandler)

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, throttledUpdateActivity)
      })
      window.removeEventListener('storage', storageHandler)
      resetTimers()
      if (throttleTimeout) clearTimeout(throttleTimeout)
    }
  }, [enabled, updateActivity, scheduleTimers, resetTimers])

  return { updateActivity }
}
