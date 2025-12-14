'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Building2,
  Package,
  Phone,
  Calculator,
  Menu,
  Search,
  User,
  Globe,
  ShoppingCart,
  Star,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  HelpCircle,
  Mail,
  FileText,
  MessageCircle
} from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  external?: boolean
  children?: NavigationItem[]
  badge?: string | number
  highlight?: boolean
  description?: string
  comingSoon?: boolean
}

interface NavigationProps {
  items?: NavigationItem[]
  variant?: 'header' | 'sidebar' | 'mobile'
  orientation?: 'horizontal' | 'vertical'
  className?: string
  showIcons?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  showSearch?: boolean
  showUser?: boolean
}

interface MobileNavigationProps {
  items: NavigationItem[]
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

/**
 * Enhanced Search Bar Component
 */
export function EnhancedSearchBar({ isOpen, onClose, className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        { title: 'スタンドパウチ', href: '/catalog#stand-up', category: '製品' },
        { title: '会社概要', href: '/about', category: '会社情報' },
        { title: 'お見積もり', href: '/quote-simulator', category: 'ツール' },
        { title: 'お問い合わせ', href: '/contact', category: 'サポート' },
      ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      setResults(mockResults)
      setIsSearching(false)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Bar */}
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
            <Card className="p-6 shadow-2xl border-brixa-600 bg-white" ref={searchRef}>
              <div className="flex items-center space-x-3 mb-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="製品、サービス、情報を検索..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brixa-700"></div>
                  </div>
                )}

                {!isSearching && results.length === 0 && query.length >= 2 && (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>検索結果が見つかりませんでした</p>
                    <p className="text-sm mt-1">別のキーワードで試してみてください</p>
                  </div>
                )}

                <div className="space-y-2">
                  {results.map((result, index) => (
                    <Link
                      key={index}
                      href={result.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-brixa-600 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">{result.title}</div>
                          <div className="text-sm text-gray-500">{result.category}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>

                {/* Quick Links */}
                {query.length === 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">よく検索</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['スタンドパウチ', 'お見積もり', '会社概要', 'お問い合わせ'].map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="text-sm text-gray-600 hover:text-brixa-700 px-3 py-2 bg-gray-50 rounded-lg hover:bg-brixa-50 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Mega Menu Component
 */
function MegaMenu({ item, onClose }: { item: NavigationItem; onClose?: () => void }) {
  if (!item.children) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 w-screen max-w-md bg-white border border-gray-200 rounded-lg shadow-2xl z-50"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.label}</h3>
        <div className="grid grid-cols-1 gap-2">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                {child.icon && <child.icon className="w-5 h-5 text-gray-400 group-hover:text-brixa-700" />}
                <div>
                  <div className="font-medium text-gray-900">{child.label}</div>
                  {child.description && (
                    <div className="text-sm text-gray-500">{child.description}</div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brixa-700" />
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Enhanced Mobile Navigation
 */
export function EnhancedMobileNavigation({ items, isOpen, onClose, className }: MobileNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { tn } = useTranslation()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
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
          <div>
            <button
              onClick={() => toggleExpanded(item.label)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-4 text-left",
                "text-gray-700 hover:text-brixa-700 hover:bg-brixa-50",
                "focus:outline-none focus:text-brixa-700 focus:bg-brixa-50",
                "transition-colors duration-200",
                level > 0 && `pl-${8 + level * 4}`
              )}
            >
              <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-5 w-5" />}
                <div>
                  <span className="font-medium">{item.label}</span>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded && (
              <div className="bg-gray-50">
                {item.children!.map((child) => renderNavigationItem(child, level + 1))}
              </div>
            )}
          </div>
        ) : item.href ? (
          <Link
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center justify-between px-4 py-4",
              "text-gray-700 hover:text-brixa-700 hover:bg-brixa-50",
              "focus:outline-none focus:text-brixa-700 focus:bg-brixa-50",
              "transition-colors duration-200 group",
              level > 0 && `pl-${8 + level * 4}`
            )}
            {...(item.external && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="h-5 w-5" />}
              <div>
                <span className="font-medium">{item.label}</span>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
              </div>
            </div>
            {item.badge && (
              <Badge variant="secondary" className="bg-brixa-600 text-brixa-600">
                {item.badge}
              </Badge>
            )}
          </Link>
        ) : (
          <div className="flex items-center justify-between px-4 py-4 text-gray-700">
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <Badge variant="secondary" className="bg-brixa-600 text-brixa-600">
                {item.badge}
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-brixa-700 to-amber-600 text-white">
          <div>
            <h2 className="text-xl font-bold">メニュー</h2>
            <p className="text-brixa-600 text-sm">すべてのサービス</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            aria-label="閉じる"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/quote-simulator" onClick={onClose}>
              <Button variant="outline" size="sm" className="w-full justify-center">
                <Calculator className="w-4 h-4 mr-1" />
                見積もり
              </Button>
            </Link>
            <Link href="/contact" onClick={onClose}>
              <Button variant="outline" size="sm" className="w-full justify-center">
                <Mail className="w-4 h-4 mr-1" />
                お問い合わせ
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="overflow-y-auto flex-1 py-2" aria-label="Main navigation">
          {items.map(renderNavigationItem)}
        </nav>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-brixa-50 to-brixa-100">
          <div className="space-y-3">
            <Link href="/samples" onClick={onClose} className="block">
              <Button variant="outline" fullWidth className="justify-center">
                <Package className="w-4 h-4 mr-2" />
                無料サンプル請求
              </Button>
            </Link>
            <Link href="/contact" onClick={onClose} className="block">
              <Button variant="primary" fullWidth className="justify-center bg-brixa-700 hover:bg-brixa-600">
                <Phone className="w-4 h-4 mr-2" />
                専門家に相談
              </Button>
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-4">
                <a href="tel:0120-123-456" className="hover:text-brixa-700">
                  <Phone className="w-4 h-4 inline mr-1" />
                  0120-123-456
                </a>
                <span>•</span>
                <span className="text-xs">平日 9:00-18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Enhanced Navigation Items Configuration
 */
export const enhancedNavigationItems: NavigationItem[] = [
  {
    label: 'ホーム',
    href: '/',
    icon: Home,
    description: 'トップページ',
  },
  {
    label: '製品カタログ',
    href: '/catalog',
    icon: Package,
    highlight: true,
    description: '6種類のパウチ製品',
    badge: '人気',
  },
  {
    label: 'サービス内容',
    href: '/service',
    icon: TrendingUp,
    description: '製造・品質・納期',
  },
  {
    label: '会社情報',
    href: '/about',
    icon: Building2,
    description: 'Epackage Labについて',
  },
  {
    label: 'お見積り',
    href: '/quote-simulator',
    icon: Calculator,
    highlight: true,
    description: '無料価格計算',
    badge: 'NEW',
  },
  {
    label: 'サポート',
    href: '/support',
    icon: MessageCircle,
    children: [
      {
        label: 'お問い合わせ',
        href: '/contact',
        icon: Phone,
        description: '専門家に相談',
      },
      {
        label: '無料サンプル',
        href: '/samples',
        icon: Package,
        description: '実際の製品を確認',
      },
      {
        label: 'よくある質問',
        href: '/faq',
        icon: HelpCircle,
        description: 'Q&A',
      },
      {
        label: 'ブログ',
        href: '/blog',
        icon: FileText,
        description: '最新情報',
        comingSoon: true,
      },
    ],
  },
]

/**
 * Enhanced Main Navigation Component
 */
export function EnhancedNavigation({
  items = enhancedNavigationItems,
  variant = 'header',
  orientation = 'horizontal',
  className,
  showIcons = false,
  showSearch = true,
  showUser = true,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()

  if (variant === 'mobile') {
    return null // Use EnhancedMobileNavigation component directly
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={cn(
          "hidden lg:flex items-center space-x-1",
          orientation === 'vertical' && "flex-col space-y-1 space-x-0",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          const hasChildren = item.children && item.children.length > 0

          return (
            <div
              key={item.href || item.label}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  "text-gray-700 hover:text-brixa-700 hover:bg-brixa-50",
                  "focus:outline-none focus:text-brixa-700 focus:bg-brixa-50",
                  isActive && "text-brixa-700 bg-brixa-50 shadow-sm",
                  item.highlight && "border border-brixa-600",
                  item.comingSoon && "opacity-60 cursor-not-allowed"
                )}
                {...(item.external && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
              >
                {showIcons && Icon && (
                  <Icon className={cn("w-4 h-4", isActive && "text-brixa-700")} />
                )}
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs bg-brixa-600 text-brixa-600">
                    {item.badge}
                  </Badge>
                )}
                {item.comingSoon && (
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </Link>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600">
                  {showIcons && Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs bg-brixa-600 text-brixa-600">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}

              {/* Mega Menu */}
              {hasChildren && hoveredItem === item.label && (
                <MegaMenu item={item} />
              )}
            </div>
          )
        })}
      </nav>

      {/* Search Button */}
      {showSearch && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSearchOpen(true)}
          className="text-gray-700 hover:text-brixa-700 hover:bg-brixa-50"
        >
          <Search className="w-5 h-5" />
        </Button>
      )}

      {/* User Actions */}
      {showUser && (
        <div className="hidden lg:flex items-center space-x-3">
          <Link href="/quote-simulator">
            <Button
              variant="outline"
              size="sm"
              className="border-brixa-600 text-brixa-700 hover:bg-brixa-50"
            >
              <Calculator className="w-4 h-4 mr-1" />
              見積もり
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="primary"
              size="sm"
              className="bg-brixa-700 hover:bg-brixa-600"
            >
              <Phone className="w-4 h-4 mr-1" />
              相談する
            </Button>
          </Link>
        </div>
      )}

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden text-gray-700 hover:text-brixa-700 hover:bg-brixa-50"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Mobile Navigation */}
      <EnhancedMobileNavigation
        items={items}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Search Bar */}
      <EnhancedSearchBar
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}

export default EnhancedNavigation