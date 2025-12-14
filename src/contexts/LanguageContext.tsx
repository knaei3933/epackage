'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Language, TranslationKeys } from '@/lib/i18n'
import { defaultLanguage, supportedLanguages, getBrowserLanguage, getStoredLanguage, storeLanguage } from '@/lib/i18n'
import { translations } from '@/locales'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: <K extends keyof TranslationKeys>(key: K) => TranslationKeys[K]
  tn: <K extends keyof TranslationKeys, P extends string>(section: K, path: P) => string
  isChanging: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  defaultLang?: Language
}

export function LanguageProvider({ children, defaultLang }: LanguageProviderProps) {
  // Strategy 1: Language Context Initialization Stabilization
  // Use consistent initial state for both server and client
  const [isClient, setIsClient] = useState(false)
  const [language, setLanguageState] = useState<Language>(defaultLang || defaultLanguage)
  const [isChanging, setIsChanging] = useState(false)

  // Strategy 1: Stabilized initialization - detect client-side first
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Separate effect for language detection to prevent hydration mismatch
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    // Try to get stored language first
    let initialLanguage = getStoredLanguage()

    // If no stored language, try browser language
    if (!initialLanguage || !supportedLanguages.includes(initialLanguage)) {
      initialLanguage = getBrowserLanguage()
    }

    // Fallback to default language
    if (!initialLanguage || !supportedLanguages.includes(initialLanguage)) {
      initialLanguage = defaultLanguage
    }

    // Only update if different from initial state
    if (initialLanguage !== language) {
      setLanguageState(initialLanguage)
      storeLanguage(initialLanguage) // Store immediately for consistency
    }
  }, [isClient, language])

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined' && isClient) {
      document.documentElement.lang = language
    }
  }, [language, isClient])

  const setLanguage = (newLanguage: Language) => {
    if (!supportedLanguages.includes(newLanguage)) {
      console.warn(`Unsupported language: ${newLanguage}`)
      return
    }

    setIsChanging(true)
    setLanguageState(newLanguage)
    storeLanguage(newLanguage)

    // Reset changing state after a short delay to allow for transitions
    setTimeout(() => {
      setIsChanging(false)
    }, 100)
  }

  // Strategy 1: Stabilized translation functions with consistent fallbacks
  const t = <K extends keyof TranslationKeys>(key: K): TranslationKeys[K] => {
    // During SSR or before client initialization, use default language
    const currentLanguage = isClient ? language : (defaultLang || defaultLanguage)

    // Ensure translations exist for the current language
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      return translations[currentLanguage][key]
    }

    // Fallback to default language
    if (translations[defaultLanguage] && translations[defaultLanguage][key]) {
      return translations[defaultLanguage][key]
    }

    // Final fallback - return key as string to prevent runtime errors
    return String(key) as unknown as TranslationKeys[K]
  }

  const tn = <K extends keyof TranslationKeys, P extends string>(
    section: K,
    path: P
  ): string => {
    // During SSR or before client initialization, use default language
    const currentLanguage = isClient ? language : (defaultLang || defaultLanguage)

    try {
      const sectionData = translations[currentLanguage]?.[section] || translations[defaultLanguage]?.[section]

      if (typeof sectionData === 'object' && sectionData !== null) {
        const keys = path.split('.')
        let result: Record<string, unknown> | string = sectionData
        for (const key of keys) {
          if (result && typeof result === 'object' && key in result) {
            result = (result as Record<string, unknown>)[key] as Record<string, unknown> | string
          } else {
            // Fallback to path if not found
            return path
          }
        }
        return typeof result === 'string' ? result : path
      }

      // Fallback to path if section data is not valid
      return path
    } catch (error) {
      // Prevent any runtime errors during hydration
      console.warn('Translation error:', error)
      return path
    }
  }

  const value = {
    language,
    setLanguage,
    t,
    tn,
    isChanging,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper hook for nested translations
export function useTranslation() {
  const { t, tn, language } = useLanguage()
  return { t, tn, language }
}