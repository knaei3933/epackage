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
        className="relative z-10 mx-4 max-w-md rounded-container border border-border-medium bg-bg-primary p-6 shadow-high"
      >
        <h2
          id="inactivity-title"
          className="mb-2 text-xl font-bold text-text-primary"
        >
          セッションの有効期限が近づいています
        </h2>
        <p
          id="inactivity-description"
          className="mb-4 text-text-secondary"
        >
          長時間操作がないため、セッションは{' '}
          <span
            className="font-bold text-error"
            role="timer"
            aria-live="polite"
            aria-atomic="true"
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>{' '}
          後に期限切れになります。
        </p>
        <p className="mb-6 text-sm text-text-secondary">
          「続ける」をクリックしてログインを維持するか、自動的にログアウトされます。
        </p>
        <div className="flex gap-3">
          <button
            onClick={dismissInactivityWarning}
            className="h-10 flex-1 rounded-md bg-brand px-4 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover active:bg-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:h-11"
            autoFocus
          >
            続ける
          </button>
          <button
            onClick={handleLogoutNow}
            className="h-10 flex-1 rounded-md border border-border-strong bg-bg-primary px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:h-11"
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
