'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, ChevronDown, ChevronRight, Home, Building2, Package, CreditCard, Phone, BarChart3, Grid3X3, Calculator } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  external?: boolean
  children?: NavigationItem[]
  badge?: string | number
  // Authentication properties
  requireAuth?: boolean      // Show only when authenticated
  hideWhenAuth?: boolean     // Hide when authenticated
  showWhenAuth?: boolean     // Show only when authenticated
}

interface NavigationProps {
  items?: NavigationItem[]
  variant?: 'header' | 'sidebar' | 'mobile'
  orientation?: 'horizontal' | 'vertical'
  className?: string
  showIcons?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
}

interface MobileNavigationProps {
  items: NavigationItem[]
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface SidebarNavigationProps {
  items: NavigationItem[]
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

/**
 * Mobile Navigation Drawer
 */
export function MobileNavigation({ items, isOpen, onClose, className }: MobileNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.label)
    const Icon = item.icon

    return (
      <div key={item.href || item.label} className="w-full">
        {hasChildren ? (
          // Collapsible item with children
          <div>
            <button
              onClick={() => toggleExpanded(item.label)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-left",
                "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
                "focus:outline-none focus:text-text-primary focus:bg-bg-secondary",
                "transition-colors duration-200",
                level > 0 && `pl-${4 + level * 4}`
              )}
            >
              <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-5 w-5" />}
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-brixa-100 text-briixa-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded && (
              <div className="bg-bg-secondary/50">
                {item.children!.map((child) => renderNavigationItem(child, level + 1))}
              </div>
            )}
          </div>
        ) : (
          // Simple link item
          <Link
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center space-x-3 px-4 py-3",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "focus:outline-none focus:text-text-primary focus:bg-bg-secondary",
              "transition-colors duration-200",
              level > 0 && `pl-${4 + level * 4}`
            )}
            {...(item.external && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            {Icon && <Icon className="h-5 w-5" />}
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-1 text-xs font-medium bg-brixa-100 text-briixa-700 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 left-0 h-full w-80 max-w-[80vw] bg-bg-primary border-r border-border-medium shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-medium">
          <h2 className="text-lg font-semibold text-text-primary">
            メニュー
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
            aria-label="メニューを閉じる"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="overflow-y-auto flex-1 py-2" aria-label="Main navigation">
          {items.map(renderNavigationItem)}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border-medium space-y-3">
          <Link href="/contact" onClick={onClose} className="inline-flex w-full">
            <Button
              variant="primary"
              fullWidth
              className="justify-center"
            >
              お問い合わせ
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

/**
 * Sidebar Navigation Component
 */
export function SidebarNavigation({ items, className, collapsible = true, defaultCollapsed = false }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  // Filter navigation items based on authentication state
  const filteredItems = items.filter(item => {
    if (item.requireAuth && !isAuthenticated) return false
    if (item.hideWhenAuth && isAuthenticated) return false
    if (item.showWhenAuth && !isAuthenticated) return false
    return true
  })

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.label)
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <div key={item.href || item.label} className="w-full">
        {hasChildren ? (
          // Collapsible item with children
          <div>
            <button
              onClick={() => toggleExpanded(item.label)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left",
                "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
                "focus:outline-none focus:text-text-primary focus:bg-bg-secondary",
                "transition-colors duration-200 rounded-lg",
                isActive && "text-brixa-600 bg-briixa-50",
                isCollapsed && "justify-center px-2",
                level > 0 && !isCollapsed && `pl-${3 + level * 2}`
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                {!isCollapsed && (
                  <>
                    <span className="font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-brixa-100 text-briixa-700 rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                    isExpanded && "rotate-180"
                  )}
                />
              )}
            </button>

            {isExpanded && !isCollapsed && (
              <div className="mt-1 space-y-1">
                {item.children!.map((child) => renderNavigationItem(child, level + 1))}
              </div>
            )}
          </div>
        ) : (
          // Simple link item
          <Link
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "focus:outline-none focus:text-text-primary focus:bg-bg-secondary",
              "transition-colors duration-200",
              isActive && "text-brixa-600 bg-briixa-50",
              isCollapsed && "justify-center px-2",
              level > 0 && !isCollapsed && `pl-${3 + level * 2}`
            )}
            title={isCollapsed ? item.label : undefined}
            {...(item.external && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
            {!isCollapsed && (
              <>
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-brixa-100 text-briixa-700 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        )}
      </div>
    )
  }

  return (
    <Card
      variant="ghost"
      className={cn(
        "h-full flex flex-col border-r border-border-medium",
        className
      )}
    >
      {/* Sidebar Header with Toggle */}
      {collapsible && (
        <div className="flex items-center justify-between p-4 border-b border-border-medium">
          {!isCollapsed && (
            <h2 className="font-semibold text-text-primary">ナビゲーション</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-text-secondary hover:text-text-primary"
            aria-label={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
          >
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                !isCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-4",
          isCollapsed ? "px-2" : "px-4"
        )}
        aria-label="Sidebar navigation"
      >
        <div className="space-y-1">
          {filteredItems.map(renderNavigationItem)}
        </div>
      </nav>
    </Card>
  )
}

/**
 * Default Navigation Items Configuration
 */
export const defaultNavigationItems: NavigationItem[] = [
  {
    label: 'ホーム',
    href: '/',
    icon: Home,
  },
  {
    label: '製品カタログ',
    href: '/catalog',
    icon: Grid3X3,
  },
  {
    label: '会社概要',
    href: '/about',
    icon: Building2,
  },
  {
    label: 'お見積り',
    href: '/pricing',
    icon: Calculator,
  },
  {
    label: 'お問い合わせ',
    href: '/contact',
    icon: Phone,
  },
]

/**
 * Main Navigation Component
 */
export function Navigation({
  items = defaultNavigationItems,
  variant = 'header',
  orientation = 'horizontal',
  className,
  showIcons = false,
  collapsible = false,
  defaultCollapsed = false,
}: NavigationProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  // Filter navigation items based on authentication state
  const filteredItems = items.filter(item => {
    if (item.requireAuth && !isAuthenticated) return false
    if (item.hideWhenAuth && isAuthenticated) return false
    if (item.showWhenAuth && !isAuthenticated) return false
    return true
  })

  if (variant === 'mobile') {
    return null // Use MobileNavigation component directly
  }

  if (variant === 'sidebar') {
    return (
      <SidebarNavigation
        items={filteredItems}
        className={className}
        collapsible={collapsible}
        defaultCollapsed={defaultCollapsed}
      />
    )
  }

  // Header Navigation
  return (
    <nav
      className={cn(
        "flex items-center space-x-1",
        orientation === 'vertical' && "flex-col space-y-1 space-x-0",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {filteredItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "focus:outline-none focus:text-text-primary focus:bg-bg-secondary",
              "transition-colors duration-200",
              isActive && "text-brixa-600 bg-briixa-50"
            )}
            {...(item.external && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            {showIcons && Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-brixa-100 text-briixa-700 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default Navigation