'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { languageNames, supportedLanguages, type Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

// Add suppressHydrationWarning to prevent console errors in development
const suppressHydrationWarning = process.env.NODE_ENV === 'development'

interface NavigationItem {
  label: string
  href: string
  external?: boolean
  children?: NavigationItem[]
  description?: string
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { language, setLanguage } = useLanguage()
  const { tn } = useTranslation()

  // Prevent hydration issues by setting mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Navigation structure with children - consistent rendering
  const getNavigationItems = (): NavigationItem[] => {
    if (language === 'ja') {
      return [
        {
          label: 'ホーム',
          href: '/',
          description: 'Epackage Labトップページ'
        },
        {
          label: '製品カタログ',
          href: '/catalog',
          description: 'パウチ製品一覧'
        },
        {
          label: 'サービス',
          href: '/service',
          description: '包装ソリューション',
          children: [
            { label: '製造工程', href: '/flow' },
            { label: '印刷技術', href: '/print' },
            { label: '品質管理', href: '/guide' },
          ]
        },
        {
          label: '導入事例',
          href: '/archives',
          description: '成功事例と実績'
        },
        {
          label: 'お見積り',
          href: '/quote-simulator',
          description: 'AI即時見積もり・ご相談'
        },
      ]
    } else {
      return [
        {
          label: 'Home',
          href: '/',
          description: 'Epackage Lab homepage'
        },
        {
          label: 'Products',
          href: '/catalog',
          description: 'Product catalog'
        },
        {
          label: 'Services',
          href: '/service',
          description: 'Packaging services',
          children: [
            { label: 'Manufacturing', href: '/flow' },
            { label: 'Printing', href: '/print' },
            { label: 'Quality Guide', href: '/guide' },
          ]
        },
        {
          label: 'Case Studies',
          href: '/archives',
          description: 'Success stories'
        },
        {
          label: 'Quote',
          href: '/quote-simulator',
          description: 'AI Instant Quote & Consultation'
        },
      ]
    }
  }

  const navigationItems = useMemo(() => getNavigationItems(), [language])

  // Helper function to generate unique keys
  const generateKey = (href: string, label: string, index: number, parentIndex?: string): string => {
    const prefix = parentIndex ? `${parentIndex}-` : ''
    return `${prefix}${href}-${label}-${index}`
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-language-menu]') && !target.closest('[data-language-button]')) {
        setIsLanguageMenuOpen(false)
      }
      if (!target.closest('[data-dropdown]')) {
        setDropdownOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle dropdown interactions - only after component is mounted
  const handleDropdownToggle = (label: string) => {
    if (!isMounted) return
    setDropdownOpen(dropdownOpen === label ? null : label)
    setIsLanguageMenuOpen(false)
  }

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
    setIsMenuOpen(false) // Close mobile menu after language change
  }

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    setIsLanguageMenuOpen(false) // Close language menu when opening mobile menu
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border-medium/50 bg-bg-primary/80 backdrop-blur-md transition-all duration-200 shadow-sm",
      )}
      role="banner"
      suppressHydrationWarning={true}
    >
      <Container size="6xl" className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brixa-500 focus:ring-offset-2 rounded-lg"
          aria-label="Epackage Lab - ホーム"
        >
          <div className="relative h-8 w-8 md:h-10 md:w-10">
            <Image
              src="/logo.svg"
              alt="Epackage Lab Logo"
              fill
              sizes="100vw"
              className="object-contain"
              priority
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                objectFit: 'contain'
              }}
              suppressHydrationWarning={true}
            />
          </div>
          <span className="hidden sm:block text-lg md:text-xl font-bold text-text-primary font-sans tracking-tight">
            Epackage Lab
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center space-x-1"
          role="navigation"
          aria-label="Main navigation"
          suppressHydrationWarning={true}
        >
          {navigationItems.map((item, index) => (
            <div key={generateKey(item.href, item.label, index)} className="relative" data-dropdown>
              {item.children ? (
                // Dropdown menu
                <button
                  onClick={() => handleDropdownToggle(item.label)}
                  className={cn(
                    "flex items-center space-x-1 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-brixa-600 focus:outline-none focus:text-brixa-600 rounded-lg hover:bg-bg-secondary",
                    dropdownOpen === item.label && "text-brixa-600 bg-bg-secondary"
                  )}
                  aria-expanded={dropdownOpen === item.label}
                  aria-haspopup="true"
                >
                  <span suppressHydrationWarning={true}>{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      dropdownOpen === item.label && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                // Simple link
                <Link
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-brixa-600 focus:outline-none focus:text-brixa-600 rounded-lg hover:bg-bg-secondary",
                    "after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-0.5 after:bg-brixa-600 after:transition-all after:duration-200 hover:after:w-full"
                  )}
                  {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  title={item.description}
                >
                  <span suppressHydrationWarning={true}>{item.label}</span>
                </Link>
              )}

              {/* Dropdown content - only render after mount to prevent hydration issues */}
              {isMounted && item.children && dropdownOpen === item.label && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-bg-primary border border-border-medium rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="py-2">
                    {item.children.map((child, childIndex) => (
                      child.children ? (
                        // Nested dropdown
                        <div key={generateKey(child.href, child.label, childIndex, `${index}`)} className="relative">
                          <button
                            onClick={() => handleDropdownToggle(`${item.label}-${child.label}`)}
                            className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-brixa-600 hover:bg-bg-secondary transition-colors flex items-center justify-between"
                          >
                            <span>{child.label}</span>
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {isMounted && dropdownOpen === `${item.label}-${child.label}` && (
                            <div className="absolute left-full top-0 ml-1 w-48 bg-bg-primary border border-border-medium rounded-lg shadow-lg overflow-hidden z-50">
                              <div className="py-2">
                                {child.children.map((grandChild, grandChildIndex) => (
                                  <Link
                                    key={generateKey(grandChild.href, grandChild.label, grandChildIndex, `${index}-${childIndex}`)}
                                    href={grandChild.href}
                                    className="block px-4 py-2 text-sm text-text-secondary hover:text-brixa-600 hover:bg-bg-secondary transition-colors"
                                    onClick={() => setDropdownOpen(null)}
                                  >
                                    {grandChild.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Regular dropdown item
                        <Link
                          key={generateKey(child.href, child.label, childIndex, `${index}`)}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-text-secondary hover:text-brixa-600 hover:bg-bg-secondary transition-colors"
                          onClick={() => setDropdownOpen(null)}
                        >
                          {child.label}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary"
              aria-label={`${tn('header', 'languageSelect')}: ${languageNames[language]}`}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="listbox"
              data-language-button
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium" suppressHydrationWarning={true}>
                {languageNames[language]}
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isLanguageMenuOpen && "rotate-180"
                )}
              />
            </Button>

            {isLanguageMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg bg-bg-primary border border-border-medium shadow-lg overflow-hidden"
                role="listbox"
                data-language-menu
              >
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-bg-secondary focus:outline-none focus:bg-bg-secondary",
                      language === lang
                        ? "text-brixa-600 bg-bg-secondary font-medium"
                        : "text-text-secondary"
                    )}
                    role="option"
                    aria-selected={language === lang}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <Link href="/contact" className="inline-flex">
              <Button
                variant="primary"
                size="sm"
                className="font-medium"
              >
                {tn('header', 'cta')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="lg:hidden flex items-center justify-center w-12 h-12 text-text-secondary hover:text-text-primary"
            aria-label={isMenuOpen ? tn('header', 'closeMenu') : tn('header', 'mobileMenu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </Container>

      {/* Mobile Navigation Menu */}
      <div
        id="mobile-navigation"
        className={cn(
          "lg:hidden border-t border-border-medium bg-bg-primary",
          isMenuOpen ? "block" : "hidden"
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <Container size="6xl" className="py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="space-y-1" suppressHydrationWarning={true}>
            {navigationItems.map((item, index) => (
              <div key={`${item.href}-${item.label}-${index}`} className="border-b border-border-medium/50 last:border-0">
                {item.children ? (
                  // Mobile dropdown
                  <div>
                    <button
                      onClick={() => {
                        const currentlyOpen = dropdownOpen === item.label
                        setDropdownOpen(currentlyOpen ? null : item.label)
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-base font-medium text-text-secondary rounded-lg transition-colors hover:bg-bg-secondary hover:text-text-primary focus:outline-none focus:bg-bg-secondary focus:text-text-primary flex items-center justify-between",
                        dropdownOpen === item.label && "text-brixa-600 bg-bg-secondary"
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          dropdownOpen === item.label && "rotate-180"
                        )}
                      />
                    </button>
                    {isMounted && dropdownOpen === item.label && (
                      <div className="px-4 py-2 bg-bg-secondary/50">
                        {item.children.map((child, childIndex) => (
                          child.children ? (
                            // Nested mobile dropdown
                            <div key={generateKey(child.href, child.label, childIndex, `mobile-${index}`)} className="border-l-2 border-brixa-600/20 ml-2">
                              <button
                                onClick={() => {
                                  const nestedOpen = dropdownOpen === `${item.label}-${child.label}`
                                  setDropdownOpen(nestedOpen ? null : `${item.label}-${child.label}`)
                                }}
                                className={cn(
                                  "w-full px-3 py-2 text-left text-sm text-text-secondary rounded transition-colors hover:bg-bg-primary hover:text-brixa-600 focus:outline-none focus:bg-bg-primary focus:text-brixa-600 flex items-center justify-between",
                                  dropdownOpen === `${item.label}-${child.label}` && "text-brixa-600"
                                )}
                              >
                                <span>{child.label}</span>
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 transition-transform duration-200",
                                    dropdownOpen === `${item.label}-${child.label}` && "rotate-90"
                                  )}
                                />
                              </button>
                              {isMounted && dropdownOpen === `${item.label}-${child.label}` && (
                                <div className="px-3 py-1 ml-4">
                                  {child.children.map((grandChild, grandChildIndex) => (
                                    <Link
                                      key={generateKey(grandChild.href, grandChild.label, grandChildIndex, `mobile-${index}-${childIndex}`)}
                                      href={grandChild.href}
                                      onClick={() => {
                                        setIsMenuOpen(false)
                                        setDropdownOpen(null)
                                      }}
                                      className="block px-2 py-1 text-sm text-text-secondary hover:text-brixa-600 hover:bg-bg-primary rounded transition-colors"
                                    >
                                      {grandChild.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            // Regular mobile dropdown item
                            <Link
                              key={generateKey(child.href, child.label, childIndex, `mobile-${index}`)}
                              href={child.href}
                              onClick={() => {
                                setIsMenuOpen(false)
                                setDropdownOpen(null)
                              }}
                              className="block px-3 py-2 text-sm text-text-secondary hover:text-brixa-600 hover:bg-bg-primary rounded transition-colors"
                              {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                            >
                              {child.label}
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Simple mobile link
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-4 py-3 text-base font-medium text-text-secondary rounded-lg transition-colors hover:bg-bg-secondary hover:text-text-primary focus:outline-none focus:bg-bg-secondary focus:text-text-primary",
                      "after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-0.5 after:bg-brixa-600 after:transition-all after:duration-200 hover:after:w-full"
                    )}
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    title={item.description}
                  >
                    <span suppressHydrationWarning={true}>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile CTA Button */}
            <div className="pt-4 border-t border-border-medium mt-4">
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="inline-flex">
                <Button
                  variant="primary"
                  className="w-full justify-center font-medium"
                  aria-label="Get a quote - mobile CTA"
                >
                  {tn('header', 'cta')}
                </Button>
              </Link>
            </div>
          </nav>
        </Container>
      </div>
    </header>
  )
}