'use client'

import React, { type ReactNode } from 'react'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingSkeleton } from './LoadingSkeleton'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
  headerClassName?: string
  footerClassName?: string
  mainClassName?: string
  withErrorBoundary?: boolean
  withLoadingState?: boolean
  isLoading?: boolean
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'
}

/**
 * Main layout component for the application
 * Provides consistent structure with Header, Main content area, and Footer
 */
export function Layout({
  children,
  className,
  showHeader = true,
  showFooter = true,
  headerClassName,
  footerClassName,
  mainClassName,
  withErrorBoundary = true,
  withLoadingState = false,
  isLoading = false,
  containerSize = '6xl',
}: LayoutProps) {
  const mainContent = (
    <main
      id="main-content"
      className={cn(
        "flex-1 w-full",
        "min-h-[calc(100vh-4rem)]", // Minimum height accounting for header
        mainClassName
      )}
      role="main"
      tabIndex={-1}
    >
      {withLoadingState && isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className={cn(
          "mx-auto w-full max-w-full",
          containerSize !== 'full' && `container-${containerSize === '6xl' ? 'max-w-7xl' :
            containerSize === '5xl' ? 'max-w-6xl' :
            containerSize === '4xl' ? 'max-w-5xl' :
            containerSize === '3xl' ? 'max-w-4xl' :
            containerSize === '2xl' ? 'max-w-3xl' :
            containerSize === 'xl' ? 'max-w-2xl' :
            containerSize === 'lg' ? 'max-w-lg' :
            containerSize === 'md' ? 'max-w-md' :
            containerSize === 'sm' ? 'max-w-sm' : 'max-w-full'
          }`
        )}>
          {children}
        </div>
      )}
    </main>
  )

  const content = withErrorBoundary ? (
    <ErrorBoundary>
      {mainContent}
    </ErrorBoundary>
  ) : (
    mainContent
  )

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-bg-primary",
      className
    )}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
          "bg-brixa-600 text-white px-4 py-2 rounded-md z-50",
          "focus:outline-none focus:ring-2 focus:ring-brixa-500 focus:ring-offset-2"
        )}
      >
        メインコンテンツにスキップ
      </a>

      {/* Header is handled by main layout.tsx via HeaderWrapper */}

      {/* Main Content */}
      {content}

      {/* Footer */}
      {showFooter && (
        <footer className={footerClassName}>
          <Footer />
        </footer>
      )}
    </div>
  )
}

/**
 * Simplified layout component without Header and Footer
 * Useful for authentication pages, landing pages, etc.
 */
export function SimpleLayout({
  children,
  className,
  mainClassName,
  withErrorBoundary = true,
  withLoadingState = false,
  isLoading = false,
}: Omit<LayoutProps, 'showHeader' | 'showFooter' | 'headerClassName' | 'footerClassName' | 'containerSize'>) {
  const mainContent = (
    <main
      className={cn(
        "flex-1 w-full min-h-screen flex items-center justify-center",
        mainClassName
      )}
      role="main"
    >
      {withLoadingState && isLoading ? (
        <LoadingSkeleton />
      ) : (
        children
      )}
    </main>
  )

  const content = withErrorBoundary ? (
    <ErrorBoundary>
      {mainContent}
    </ErrorBoundary>
  ) : (
    mainContent
  )

  return (
    <div className={cn(
      "min-h-screen bg-bg-primary",
      className
    )}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
          "bg-brixa-600 text-white px-4 py-2 rounded-md z-50",
          "focus:outline-none focus:ring-2 focus:ring-brixa-500 focus:ring-offset-2"
        )}
      >
        メインコンテンツにスキップ
      </a>

      {content}
    </div>
  )
}

/**
 * Centered layout component for content that should be centered on the page
 * Useful for modals, forms, focused content
 */
export function CenteredLayout({
  children,
  className,
  mainClassName,
  withErrorBoundary = true,
  withLoadingState = false,
  isLoading = false,
  containerSize = 'md',
}: Omit<LayoutProps, 'showHeader' | 'showFooter' | 'headerClassName' | 'footerClassName'>) {
  const mainContent = (
    <main
      className={cn(
        "flex-1 w-full min-h-screen flex items-center justify-center p-4",
        mainClassName
      )}
      role="main"
    >
      {withLoadingState && isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className={cn(
          "w-full",
          containerSize !== 'full' && `max-w-${
            containerSize === '6xl' ? '7xl' :
            containerSize === '5xl' ? '6xl' :
            containerSize === '4xl' ? '5xl' :
            containerSize === '3xl' ? '4xl' :
            containerSize === '2xl' ? '3xl' :
            containerSize === 'xl' ? '2xl' :
            containerSize === 'lg' ? 'lg' :
            containerSize === 'md' ? 'md' :
            containerSize === 'sm' ? 'sm' : 'full'
          }`
        )}>
          {children}
        </div>
      )}
    </main>
  )

  const content = withErrorBoundary ? (
    <ErrorBoundary>
      {mainContent}
    </ErrorBoundary>
  ) : (
    mainContent
  )

  return (
    <div className={cn(
      "min-h-screen bg-bg-primary",
      className
    )}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
          "bg-brixa-600 text-white px-4 py-2 rounded-md z-50",
          "focus:outline-none focus:ring-2 focus:ring-brixa-500 focus:ring-offset-2"
        )}
      >
        メインコンテンツにスキップ
      </a>

      {content}
    </div>
  )
}

// Export all layout components
export { Layout as default }