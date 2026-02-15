/**
 * useDraftSave Hook
 *
 * Automatically saves form data to localStorage every 30 seconds
 * Provides restore functionality to load saved data
 *
 * @example
 * ```tsx
 * const { draftData, saveDraft, restoreDraft, clearDraft, hasDraft } = useDraftSave('sample-request-form');
 * ```
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

export interface UseDraftSaveOptions<T> {
  /**
   * Save interval in milliseconds (default: 30 seconds)
   */
  interval?: number
  /**
   * Storage key for localStorage
   */
  storageKey: string
  /**
   * Whether to enable auto-save (default: true)
   */
  enabled?: boolean
  /**
   * Callback when draft is saved
   */
  onSaved?: (data: T) => void
  /**
   * Callback when draft is restored
   */
  onRestored?: (data: T) => void
  /**
   * Callback when draft is cleared
   */
  onCleared?: () => void
}

export interface UseDraftSaveResult<T> {
  /**
   * Currently saved draft data
   */
  draftData: T | null
  /**
   * Whether a draft exists in storage
   */
  hasDraft: boolean
  /**
   * Manually save current form data
   */
  saveDraft: (data: T) => void
  /**
   * Restore draft data and populate form
   */
  restoreDraft: () => T | null
  /**
   * Clear saved draft
   */
  clearDraft: () => void
  /**
   * Last saved timestamp
   */
  lastSaved: Date | null
  /**
   * Schedule an auto-save (debounced)
   */
  scheduleSave: (data: T) => void
}

/**
 * Hook for auto-saving form data to localStorage
 */
export function useDraftSave<T extends Record<string, any>>({
  storageKey,
  interval = 30000, // 30 seconds default
  enabled = true,
  onSaved,
  onRestored,
  onCleared,
}: UseDraftSaveOptions<T>): UseDraftSaveResult<T> {
  const [draftData, setDraftData] = useState<T | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Load draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as T & { timestamp: string }
        setDraftData(parsed)
        setHasDraft(true)
        setLastSaved(new Date(parsed.timestamp))
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }, [storageKey])

  // Clear save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  /**
   * Save form data to localStorage
   */
  const saveDraft = useCallback((data: T) => {
    if (!enabled || typeof window === 'undefined') return

    try {
      const dataWithTimestamp = {
        ...data,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp))
      setDraftData(dataWithTimestamp)
      setHasDraft(true)
      setLastSaved(new Date())
      onSaved?.(data)
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }, [enabled, storageKey, onSaved])

  /**
   * Restore draft data from localStorage
   */
  const restoreDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as T & { timestamp: string }
        // Remove timestamp before returning
        const { timestamp, ...data } = parsed
        setDraftData(data as unknown as T)
        onRestored?.(data as unknown as T)
        return data as unknown as T
      }
      return null
    } catch (error) {
      console.error('Error restoring draft:', error)
      return null
    }
  }, [storageKey, onRestored])

  /**
   * Clear saved draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(storageKey)
      setDraftData(null)
      setHasDraft(false)
      setLastSaved(null)
      onCleared?.()
    } catch (error) {
      console.error('Error clearing draft:', error)
    }
  }, [storageKey, onCleared])

  /**
   * Setup auto-save interval
   * Call this when form data changes to schedule a save
   */
  const scheduleSave = useCallback((data: T) => {
    if (!enabled) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Schedule new save
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(data)
    }, interval)
  }, [enabled, interval, saveDraft])

  return {
    draftData,
    hasDraft,
    saveDraft,
    restoreDraft,
    clearDraft,
    lastSaved,
    scheduleSave, // For use with form watch
  }
}

/**
 * Alternative hook for React Hook Form integration
 * Automatically watches form changes and saves to localStorage
 *
 * Note: This hook expects watch() to be called without arguments,
 * returning the entire form data object.
 */
export function useFormDraftSave<T extends Record<string, any>>(
  options: UseDraftSaveOptions<T> & {
    watch: () => T
  }
) {
  const { watch, ...draftOptions } = options
  const draftSave = useDraftSave<T>(draftOptions)
  const prevValuesRef = useRef<string>('')

  // Watch form changes and schedule saves
  useEffect(() => {
    if (!draftOptions.enabled) return

    const values = watch()
    const valuesStr = JSON.stringify(values)

    // Only save if form has values and data actually changed
    const hasValues = Object.values(values).some(
      v => v !== undefined && v !== null && v !== ''
    )

    if (hasValues && valuesStr !== prevValuesRef.current) {
      prevValuesRef.current = valuesStr
      draftSave.scheduleSave(values as T)
    }
  }, [watch, draftOptions.enabled, draftSave])

  return draftSave
}

export default useDraftSave
