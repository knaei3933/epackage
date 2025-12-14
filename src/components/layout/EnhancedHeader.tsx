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
  MapPin,
  Clock,
  Shield,
  Award,
  TrendingUp,
  Package
} from 'lucide-react'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { languageNames, supportedLanguages, type Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { EnhancedNavigation, enhancedNavigationItems } from './EnhancedNavigation'

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'solid'
  showSticky?: boolean
  className?: string
}

export function EnhancedHeader({
  variant = 'default',
  showSticky = true,
  className
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [showCallBanner, setShowCallBanner] = useState(true)
  const { language, setLanguage } = useLanguage()
  const { tn } = useTranslation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
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

  const headerStyles = cn(
    'w-full transition-all duration-300',
    {
      // Default variant
      'bg-white border-b border-gray-200': variant === 'default',
      'bg-white/95 backdrop-blur-md shadow-lg': (variant === 'default' || variant === 'transparent') && isScrolled,

      // Transparent variant
      'bg-transparent': variant === 'transparent' && !isScrolled,

      // Solid variant
      'bg-gradient-to-r from-brixa-700 to-amber-600 text-white': variant === 'solid',
    },
    className
  )

  const textStyles = cn(
    'transition-colors duration-200',
    {
      'text-gray-900': variant !== 'solid',
      'text-white': variant === 'solid',
    }
  )

  return (
    <>
      {/* Top Call Banner */}
      <AnimatePresence>
        {showCallBanner && variant !== 'solid' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-brixa-700 to-amber-600 text-white"
          >
            <Container size="6xl">
              <div className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>0120-123-456</span>
                    <span className="text-brixa-600">•</span>
                    <span className="text-brixa-600">平日 9:00-18:00</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>info@epackage-lab.com</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>ISO9001認証</span>
                  </div>
                  <button
                    onClick={() => setShowCallBanner(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          headerStyles,
          !showCallBanner && 'border-b border-gray-200'
        )}
        role="banner"
      >
        <Container size="6xl">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className={cn(
                'flex items-center space-x-3 transition-transform duration-200 hover:scale-105',
                textStyles
              )}
            >
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                <Image
                  src="/images/ixlab-logo.png"
                  alt="Epackage Lab"
                  fill
                  sizes="(max-width: 48px) 48px, 48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden lg:block">
                <div className="text-xl font-bold">Epackage Lab</div>
                <div className="text-xs text-brixa-700">軟包装材パッケージ専門</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <EnhancedNavigation
                variant="header"
                showIcons={true}
                showSearch={true}
                showUser={true}
              />
            </div>

            {/* Desktop CTA & Language */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Quick Contact */}
              <div className="flex items-center space-x-3 text-sm">
                <div className="text-right">
                  <div className={cn('font-medium', textStyles)}>お問い合わせ</div>
                  <div className="text-brixa-700">0120-123-456</div>
                </div>
                <div className={cn('w-10 h-10 bg-brixa-600 rounded-full flex items-center justify-center', variant === 'solid' && 'bg-white/20')}>
                  <Phone className="w-5 h-5 text-brixa-700" />
                </div>
              </div>

              {/* Language Selector */}
              <div className="relative" data-language-button>
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
                    'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brixa-600',
                    variant === 'solid' && 'hover:bg-white/20 text-white',
                    textStyles
                  )}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{languageNames[language]}</span>
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isLanguageMenuOpen && 'rotate-180'
                  )} />
                </button>

                {isLanguageMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    data-language-menu
                  >
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={cn(
                          'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200',
                          language === lang && 'bg-brixa-50 text-brixa-700 font-medium'
                        )}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Mobile Language */}
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className={cn(
                  'p-2 rounded-lg transition-colors duration-200',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brixa-600',
                  variant === 'solid' && 'hover:bg-white/20 text-white',
                  textStyles
                )}
              >
                <Globe className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  'p-2 rounded-lg transition-colors duration-200',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brixa-600',
                  variant === 'solid' && 'hover:bg-white/20 text-white',
                  textStyles
                )}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Language Menu */}
        {isLanguageMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <Container size="6xl">
              <div className="py-4">
                <div className="grid grid-cols-3 gap-2">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                        language === lang
                          ? 'bg-brixa-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {languageNames[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </Container>
          </div>
        )}

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <Container size="6xl">
                <div className="py-6">
                  {/* Mobile Quick Actions */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-brixa-50 to-brixa-100 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brixa-700">0120-123-456</div>
                      <div className="text-sm text-gray-600">平日 9:00-18:00</div>
                    </div>
                    <Link href="/contact">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-brixa-700 hover:bg-brixa-600"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        今すぐ相談
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Navigation Items */}
                  <nav className="space-y-2">
                    {enhancedNavigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-brixa-50 transition-colors duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            {Icon && (
                              <Icon className="w-5 h-5 text-gray-400 group-hover:text-brixa-700" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{item.label}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500">{item.description}</div>
                              )}
                            </div>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="bg-brixa-600 text-brixa-600">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Mobile CTA */}
                  <div className="mt-6 space-y-3">
                    <Link href="/roi-calculator">
                      <Button
                        variant="outline"
                        fullWidth
                        className="justify-center"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        無料見積もり
                      </Button>
                    </Link>
                    <Link href="/samples">
                      <Button
                        variant="primary"
                        fullWidth
                        className="justify-center bg-brixa-700 hover:bg-brixa-600"
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

export default EnhancedHeader