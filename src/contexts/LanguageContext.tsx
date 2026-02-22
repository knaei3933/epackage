'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Language, TranslationKeys } from '@/lib/i18n'
import { defaultLanguage, getStoredLanguage } from '@/lib/i18n'
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
  const [language, setLanguageState] = useState<Language>(defaultLang || defaultLanguage)
  const [isChanging, setIsChanging] = useState(false)

  // Japanese only - no language detection needed
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedLanguage = getStoredLanguage()

    if (storedLanguage !== language) {
      setLanguageState(storedLanguage)
    }
  }, [language])

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const setLanguage = (newLanguage: Language) => {
    // Japanese only - no actual language change
    setIsChanging(true)
    setLanguageState(newLanguage)

    setTimeout(() => {
      setIsChanging(false)
    }, 100)
  }

  const t = <K extends keyof TranslationKeys>(key: K): TranslationKeys[K] => {
    const currentLanguage = language

    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      return translations[currentLanguage][key]
    }

    if (translations[defaultLanguage] && translations[defaultLanguage][key]) {
      return translations[defaultLanguage][key]
    }

    return String(key) as unknown as TranslationKeys[K]
  }

  const tn = <K extends keyof TranslationKeys, P extends string>(
    section: K,
    path: P
  ): string => {
    const currentLanguage = language

    try {
      const sectionData = translations[currentLanguage]?.[section] || translations[defaultLanguage]?.[section]

      if (typeof sectionData === 'object' && sectionData !== null) {
        const keys = path.split('.')
        let result: Record<string, unknown> | string = sectionData
        for (const key of keys) {
          if (result && typeof result === 'object' && key in result) {
            result = (result as Record<string, unknown>)[key] as Record<string, unknown> | string
          } else {
            return path
          }
        }
        return typeof result === 'string' ? result : path
      }

      return path
    } catch (error) {
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
