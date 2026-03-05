'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createPortal } from 'react-dom'

export function InactivityWarningModal() {
  const { showInactivityWarning, dismissInactivityWarning, signOut } = useAuth()
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const scrollPosition = useRef(0)

  // Lock scroll when modal is open
  useEffect(() => {
    if (showInactivityWarning) {
      // Store current scroll position
      scrollPosition.current = window.scrollY

      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Lock scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPosition.current}px`
      document.body.style.width = '100%'

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)

      return () => {
        // Restore scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollPosition.current)

        // Restore focus
        previousActiveElement.current?.focus()
      }
    }
  }, [showInactivityWarning])

  // Countdown timer
  useEffect(() => {
    if (!showInactivityWarning) {
      setCountdown(300)
      return
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showInactivityWarning])

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      dismissInactivityWarning()
      return
    }

    if (e.key !== 'Tab') return

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }, [dismissInactivityWarning])

  const handleLogoutNow = useCallback(async () => {
    dismissInactivityWarning()
    await signOut()
  }, [dismissInactivityWarning, signOut])

  if (!showInactivityWarning) return null

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="inactivity-title"
        aria-describedby="inactivity-description"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl z-10"
      >
        <h2
          id="inactivity-title"
          className="text-xl font-bold text-gray-900 mb-2"
        >
          セッションの有効期限が近づいています
        </h2>
        <p
          id="inactivity-description"
          className="text-gray-600 mb-4"
        >
          長時間操作がないため、セッションは{' '}
          <span
            className="font-bold text-red-600"
            role="timer"
            aria-live="polite"
            aria-atomic="true"
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>{' '}
          後に期限切れになります。
        </p>
        <p className="text-gray-500 text-sm mb-6">
          「続ける」をクリックしてログインを維持するか、自動的にログアウトされます。
        </p>
        <div className="flex gap-3">
          <button
            onClick={dismissInactivityWarning}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            autoFocus
          >
            続ける
          </button>
          <button
            onClick={handleLogoutNow}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            今すぐログアウト
          </button>
        </div>
      </div>
    </div>
  )

  // Use portal to render at document body
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return null
}
