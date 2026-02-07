import { jaTranslations } from './ja'
import type { TranslationKeys, Language } from '@/lib/i18n'

export const translations: Record<Language, TranslationKeys> = {
  ja: jaTranslations,
}

// Helper function to get nested translation keys
export function getNestedTranslation<T extends Record<string, unknown>>(
  obj: T,
  path: string
): unknown {
  return path.split('.').reduce((current, key) => {
    return typeof current === 'object' && current !== null
      ? (current as Record<string, unknown>)[key]
      : undefined
  }, obj as unknown)
}
