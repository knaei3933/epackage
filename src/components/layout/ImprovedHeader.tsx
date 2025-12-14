'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  Phone,
  Mail,
  Shield,
  Clock,
  Package,
  Calculator,
  User,
  Search,
  Building2,
  Home,
  TrendingUp
} from 'lucide-react'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { languageNames, supportedLanguages, type Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'solid'
  showSticky?: boolean
  className?: string
}

export function ImprovedHeader({
  variant = 'default',
  showSticky = true,
  className
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const { tn } = useTranslation()

  // Handle scroll effect - disabled to prevent background color change
  useEffect(() => {
    const handleScroll = () => {
      // setIsScrolled(window.scrollY > 20) // Disabled: Keep header background consistent
      setIsScrolled(false) // Always false to maintain consistent background
    }

    if (showSticky) {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [showSticky])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-language-menu]') && !target.closest('[data-language-button]')) {
        setIsLanguageMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setIsLanguageMenuOpen(false)
    setIsMenuOpen(false)
  }

  // Navigation items
  const navigationItems = [
    {
      label: 'ホーム',
      href: '/',
      icon: Home,
      description: 'トップページ'
    },
    {
      label: '製品カタログ',
      href: '/catalog',
      icon: Package,
      highlight: true,
      description: '6種類のパウチ製品',
      badge: '人気'
    },
    {
      label: 'サービス内容',
      href: '/service',
      icon: TrendingUp,
      description: '製造・品質・納期'
    },
    {
      label: '会社情報',
      href: '/about',
      icon: Building2,
      description: 'Epackage Labについて'
    },
    {
      label: 'お見積り',
      href: '/quote-simulator',
      icon: Calculator,
      highlight: true,
      description: '無料価格計算',
      badge: 'NEW'
    }
  ]

  const headerStyles = cn(
    'w-full bg-white transition-all duration-300 border-b border-gray-100',
    // Removed scroll-based shadow effect to maintain consistent appearance
    className
  )

  return (
    <>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          headerStyles
        )}
        role="banner"
      >
        <Container size="6xl">
          <div className="flex items-center justify-between h-16 md:h-18 lg:h-20 gap-2 md:gap-4">
            {/* Enhanced Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-3 group transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-briixa-primary-500 focus:ring-offset-2 rounded-lg flex-shrink-0"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex-shrink-0">
                <Image
                  src="/images/epackage-lab-logo.png"
                  alt="Epackage Lab"
                  fill
                  sizes="(max-width: 48px) 48px, 48px"
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-base md:text-lg lg:text-xl font-bold text-briixa-primary-800 group-hover:text-briixa-primary-600 transition-colors leading-tight whitespace-nowrap">
                  Epackage Lab
                </div>
                <div className="text-xs text-briixa-primary-600 font-medium tracking-wide hidden md:block whitespace-nowrap">
                  軟包装材パッケージ専門
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center flex-1 min-w-0 overflow-hidden px-1 sm:px-2 lg:px-3">
              <ul className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1 lg:gap-1.5 xl:gap-2 overflow-x-auto scrollbar-hide" role="menubar">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <li key={item.href} role="none" className="flex-shrink-0">
                      <Link
                        href={item.href}
                        className={cn(
                          'group relative inline-flex items-center gap-1 font-medium transition-all duration-200 whitespace-nowrap',
                          'px-1.5 sm:px-2 py-2 rounded-lg text-sm text-gray-700 hover:text-briixa-primary-600 hover:bg-briixa-primary-50',
                          'focus:outline-none focus:ring-2 focus:ring-briixa-primary-500 focus:ring-offset-1',
                          'min-w-0 max-w-[120px] sm:max-w-[140px] lg:max-w-none',
                          item.highlight && 'border border-briixa-primary-200 bg-briixa-primary-50/30'
                        )}
                        role="menuitem"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="leading-tight hidden md:inline truncate">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0.5 bg-briixa-primary-100 text-briixa-primary-800 ml-1 whitespace-nowrap"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {/* Tooltip - desktop only */}
                        <div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 hidden lg:block"
                          role="tooltip"
                        >
                          {item.description}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Desktop CTA & Language */}
            <div className="hidden md:flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Language Selector */}
              <div className="relative" data-language-button>
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center gap-1 px-1.5 sm:px-2 py-2 rounded-lg transition-colors duration-200 hover:bg-briixa-primary-50 focus:outline-none focus:ring-2 focus:ring-briixa-primary-500"
                >
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 hidden md:inline truncate max-w-[60px]">{languageNames[language]}</span>
                  <ChevronDown className={cn(
                    'w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-200 flex-shrink-0',
                    isLanguageMenuOpen && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {isLanguageMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      data-language-menu
                    >
                      {supportedLanguages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm hover:bg-briixa-primary-50 transition-colors duration-200',
                            language === lang ? 'bg-briixa-primary-50 text-briixa-primary-600 font-medium' : 'text-gray-700'
                          )}
                        >
                          {languageNames[lang]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Language */}
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-briixa-primary-50 focus:outline-none focus:ring-2 focus:ring-briixa-primary-500"
                aria-label="言語変更"
              >
                <Globe className="w-5 h-5 text-gray-600" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-briixa-primary-50 focus:outline-none focus:ring-2 focus:ring-briixa-primary-500"
                aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Language Menu */}
        <AnimatePresence>
          {isLanguageMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 bg-briixa-primary-50"
            >
              <Container size="6xl">
                <div className="py-4">
                  <div className="grid grid-cols-3 gap-2">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-briixa-primary-500',
                          language === lang
                            ? 'bg-briixa-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-briixa-primary-100'
                        )}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <Container size="6xl">
                <div className="py-6">
                  {/* Mobile Quick Contact */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-briixa-primary-50 to-briixa-primary-100 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-briixa-primary-700 whitespace-nowrap">080-6942-7235</div>
                      <div className="text-sm text-gray-600">平日 9:00-18:00</div>
                    </div>
                    <Link href="/contact">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        今すぐ相談
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Navigation Items */}
                  <nav className="space-y-1" role="navigation">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            'flex items-center justify-between p-3 xl:p-4 rounded-lg xl:rounded-xl hover:bg-briixa-primary-50 transition-colors duration-200 group',
                            'focus:outline-none focus:ring-2 focus:ring-briixa-primary-500 focus:ring-offset-2',
                            item.highlight && 'bg-briixa-primary-50/30 border border-briixa-primary-200'
                          )}
                          role="menuitem"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Icon className="w-5 h-5 xl:w-6 xl:h-6 text-gray-400 group-hover:text-briixa-primary-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 text-base xl:text-lg leading-tight">{item.label}</div>
                              <div className="text-sm text-gray-500 xl:text-base mt-0.5">{item.description}</div>
                            </div>
                          </div>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="bg-briixa-primary-100 text-briixa-primary-800 text-xs px-2 py-1 ml-2 flex-shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Mobile CTA */}
                  <div className="mt-6 space-y-3">
                    <Link href="/quote-simulator" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        fullWidth
                        className="justify-center border-briixa-primary-300 text-briixa-primary-600 hover:bg-briixa-primary-50"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        無料見積もり
                      </Button>
                    </Link>
                    <Link href="/samples" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="primary"
                        fullWidth
                        className="justify-center bg-briixa-primary-600 hover:bg-briixa-primary-700"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        無料サンプル請求
                      </Button>
                    </Link>
                  </div>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

export default ImprovedHeader