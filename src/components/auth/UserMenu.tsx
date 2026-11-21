'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, Settings, FileText, ChevronDown, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  // Get display name from user - try Japanese name first, then email initial
  // Handle optional properties that might be undefined/null
  // Also check profile as fallback since user properties may not be set in dev mode
  const hasKanjiName =
    (user.kanjiLastName && user.kanjiFirstName) ||
    (profile?.kanji_last_name && profile?.kanji_first_name);

  const displayName = hasKanjiName
    ? `${user.kanjiLastName || profile?.kanji_last_name || ''} ${user.kanjiFirstName || profile?.kanji_first_name || ''}`.trim()
    : user.email?.charAt(0).toUpperCase() || 'U';

  // Determine menu items based on user role
  const isAdmin = profile?.role === 'ADMIN'

  const baseMenuItems = [
    { icon: User, label: 'プロフィール', href: '/member/profile' },
    { icon: FileText, label: '見積もり履歴', href: '/member/quotations' },
    { icon: Settings, label: '設定', href: '/member/settings' },
    { divider: true },
    { icon: LogOut, label: 'ログアウト', onClick: signOut },
  ]

  const adminMenuItems = [
    { icon: Shield, label: '管理者マイページ', href: '/admin/dashboard' },
    { icon: User, label: 'メンバーマイページ', href: '/member/dashboard' },
    ...baseMenuItems,
  ]

  const memberMenuItems = [
    { icon: User, label: 'マイページ', href: '/member/dashboard' },
    ...baseMenuItems,
  ]

  const menuItems = isAdmin ? adminMenuItems : memberMenuItems

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-text-primary hover:bg-bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        aria-label="ユーザーメニュー"
        aria-expanded={isOpen}
      >
        <div aria-hidden="true" className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-on-brand text-sm font-medium">
          {displayName?.[0] || 'U'}
        </div>
        <span className="hidden md:block text-sm font-medium">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-bg-primary rounded-container shadow-med border border-border-medium py-2 z-50">
          {menuItems.map((item, index) => {
            if ('divider' in item) {
              return <div key={index} className="border-t border-border-medium my-2" />
            }

            const Icon = item.icon

            if ('onClick' in item) {
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={index}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
