'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

// =====================================================
// Types
// =====================================================

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean // Require admin role
  fallback?: React.ReactNode // Custom fallback component
}

// =====================================================
// Component
// =====================================================

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // Not authenticated - redirect to signin
    if (!user) {
      const params = new URLSearchParams({
        callbackUrl: pathname,
      })
      router.push(`/auth/signin?${params.toString()}`)
      return
    }

    // Requires admin but user is not admin
    if (requireAdmin && !isAdmin) {
      router.push('/unauthorized')
      return
    }
  }, [user, isLoading, isAdmin, requireAdmin, router, pathname])

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show fallback (will redirect shortly)
  if (!user) {
    return fallback || null
  }

  // Requires admin but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">アクセス権限がありません</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            このページにアクセスするには管理者権限が必要です。
          </p>
        </div>
      </div>
    )
  }

  // Authenticated - render children
  return <>{children}</>
}

// =====================================================
// Higher-Order Component
// =====================================================

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireAdmin?: boolean }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireAdmin={options?.requireAdmin}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
