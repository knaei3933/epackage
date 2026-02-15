'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'

/**
 * Base skeleton component for creating loading states
 */
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  return (
    <div
      className={cn(
        "bg-bg-muted",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '40px'),
      }}
      role="status"
      aria-label="読み込み中"
    >
      <span className="sr-only">読み込み中...</span>
    </div>
  )
}

/**
 * Text skeleton with multiple lines
 */
interface TextSkeletonProps {
  lines?: number
  className?: string
  lineSpacing?: 'tight' | 'normal' | 'relaxed'
}

export function TextSkeleton({ lines = 3, className, lineSpacing = 'normal' }: TextSkeletonProps) {
  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-3',
  }

  return (
    <div className={cn("space-y-2", spacingClasses[lineSpacing], className)} role="status">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            i === lines - 1 && lines > 1 && "w-3/4" // Last line is shorter
          )}
          height="1rem"
        />
      ))}
    </div>
  )
}

/**
 * Header skeleton for page headers
 */
export function HeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="status">
      <Skeleton variant="text" width="200px" height="2rem" />
      <TextSkeleton lines={2} />
    </div>
  )
}

/**
 * Card skeleton for content cards
 */
interface CardSkeletonProps {
  showImage?: boolean
  showHeader?: boolean
  lines?: number
  className?: string
}

export function CardSkeleton({
  showImage = true,
  showHeader = true,
  lines = 3,
  className,
}: CardSkeletonProps) {
  return (
    <Card variant="default" className={cn("p-6", className)} role="status">
      {showImage && (
        <Skeleton variant="rounded" width="100%" height="200px" className="mb-4" />
      )}

      {showHeader && (
        <Skeleton variant="text" width="60%" height="1.5rem" className="mb-3" />
      )}

      <TextSkeleton lines={lines} />

      <div className="flex justify-between items-center mt-4">
        <Skeleton variant="rectangular" width="80px" height="32px" />
        <Skeleton variant="rectangular" width="100px" height="32px" />
      </div>
    </Card>
  )
}

/**
 * Table skeleton for data tables
 */
interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-hidden", className)} role="status">
      {/* Table Header */}
      {showHeader && (
        <div className="border-b border-border-medium pb-3 mb-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, i) => (
              <Skeleton key={`header-${i}`} variant="text" height="1.25rem" />
            ))}
          </div>
        </div>
      )}

      {/* Table Rows */}
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="text"
                height="1rem"
                className={colIndex === 0 ? "w-3/4" : ""}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * List skeleton for list items
 */
interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function ListSkeleton({
  items = 5,
  showAvatar = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} role="status">
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {showAvatar && (
            <Skeleton variant="circular" width={40} height={40} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height="1rem" />
            <Skeleton variant="text" width="40%" height="0.875rem" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Form skeleton for forms and inputs
 */
interface FormSkeletonProps {
  fields?: number
  showButton?: boolean
  className?: string
}

export function FormSkeleton({
  fields = 4,
  showButton = true,
  className,
}: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)} role="status">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="120px" height="1rem" />
          <Skeleton variant="rectangular" width="100%" height="40px" className="rounded-lg" />
        </div>
      ))}

      {showButton && (
        <div className="flex space-x-4">
          <Skeleton variant="rectangular" width="120px" height="40px" className="rounded-lg" />
          <Skeleton variant="rectangular" width="100px" height="40px" className="rounded-lg" />
        </div>
      )}
    </div>
  )
}

/**
 * Navigation skeleton for header/navigation
 */
export function NavigationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between", className)} role="status">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={120} height="1.5rem" />
      </div>

      {/* Navigation Items */}
      <div className="hidden lg:flex items-center space-x-8">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} variant="text" width={60} height="1rem" />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Skeleton variant="rectangular" width={80} height="32px" className="rounded-lg" />
        <Skeleton variant="rectangular" width={120} height="32px" className="rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Page skeleton that combines multiple skeleton types
 */
interface PageSkeletonProps {
  showHeader?: boolean
  showSidebar?: boolean
  content?: 'cards' | 'table' | 'list' | 'form'
  className?: string
}

export function LoadingSkeleton({
  showHeader = true,
  showSidebar = false,
  content = 'cards',
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-bg-primary", className)}>
      {/* Header Skeleton */}
      {showHeader && (
        <div className="sticky top-0 z-50 border-b border-border-medium bg-bg-primary/95 backdrop-blur-sm">
          <Container size="6xl" className="py-4">
            <NavigationSkeleton />
          </Container>
        </div>
      )}

      {/* Main Content */}
      <Container size="6xl" className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          {showSidebar && (
            <div className="lg:col-span-1">
              <Card variant="ghost" className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} variant="text" width="100%" height="1rem" />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Main Content Area */}
          <div className={showSidebar ? "lg:col-span-3" : "lg:col-span-4"}>
            {/* Page Header */}
            <div className="mb-8">
              <HeaderSkeleton />
            </div>

            {/* Content Skeleton */}
            {content === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <CardSkeleton key={i} showImage={i % 2 === 0} />
                ))}
              </div>
            )}

            {content === 'table' && (
              <Card>
                <div className="p-6">
                  <TableSkeleton rows={8} columns={5} />
                </div>
              </Card>
            )}

            {content === 'list' && (
              <Card>
                <div className="p-6">
                  <ListSkeleton items={8} showAvatar />
                </div>
              </Card>
            )}

            {content === 'form' && (
              <Card>
                <div className="p-6">
                  <FormSkeleton fields={6} />
                </div>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

/**
 * Component-specific skeletons
 */
export const skeletons = {
  header: HeaderSkeleton,
  card: CardSkeleton,
  table: TableSkeleton,
  list: ListSkeleton,
  form: FormSkeleton,
  navigation: NavigationSkeleton,
  text: TextSkeleton,
}

// Add shimmer animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }

    .animate-shimmer {
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite;
    }
  `
  document.head.appendChild(style)
}