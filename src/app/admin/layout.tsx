/**
 * Admin Layout
 *
 * 관리자 페이지 공통 레이아웃
 * 알림 센터 포함
 * Error Boundary로 에러 복원력 강화
 *
 * @module app/admin
 */

import { ReactNode } from 'react'
import { AdminNotificationCenter } from '@/components/admin/Notifications'
import { AdminNavigation } from '@/components/admin/AdminNavigation'
import { ErrorBoundaryWrapper } from '@/components/error/ErrorBoundary'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ErrorBoundaryWrapper
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  EPackage Lab
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    管理画面
                  </span>
                </h1>
              </div>

              {/* Right Side: Notifications & User Menu */}
              <div className="flex items-center gap-4">
                <AdminNotificationCenter />

                {/* User Menu (can be added later) */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    A
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Navigation */}
        <AdminNavigation />

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </ErrorBoundaryWrapper>
  )
}
