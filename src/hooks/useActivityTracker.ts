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

// Role-based timeout configuration
// NOTE: Client timeout must be SHORTER than server session (30 min)
// For 1-hour inactivity timeout, we need to extend server session to 60+ min
const DEFAULT_TIMEOUT_MS = 55 * 60 * 1000      // 55 minutes (before server 60min expiry)
const DEFAULT_WARNING_MS = 50 * 60 * 1000      // 50 minutes (5 min warning)
const ADMIN_TIMEOUT_MS = 55 * 60 * 1000        // 55 minutes for admins (can be adjusted)
const ADMIN_WARNING_MS = 50 * 60 * 1000        // 50 minutes (5 min warning)

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

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    warningFiredRef.current = false

    // Persist to localStorage for cross-tab awareness
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, now.toString())
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
      if (throttleTimeout) return
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null
      }, 10000) // Throttle to 10 seconds
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
