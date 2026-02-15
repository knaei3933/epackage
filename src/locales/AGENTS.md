<!-- Parent: ../AGENTS.md -->

# src/locales/

## Purpose

Internationalization (i18n) translations for the application. This directory contains translation files for multiple languages, type definitions, and the main translation export.

## Current Language Status

**IMPORTANT: Japanese-Only Mode**
- Currently configured for Japanese-only (`ja`) deployment
- English (`en.ts`) and Korean (`ko.ts`) translations exist but are not integrated
- Language type in `lib/i18n.ts` is restricted to: `export type Language = 'ja'`

## Files

| File | Purpose |
|------|---------|
| `index.ts` | Main export, combines all translations |
| `ja.ts` | Japanese translations (active/primary) |
| `en.ts` | English translations (inactive/not exported) |
| `ko.ts` | Korean translations (inactive/not exported) |
| `shipping-ja.json` | Shipping carrier translations (standalone JSON) |

## Translation Structure

```typescript
TranslationKeys {
  nav           // Navigation menu items
  header        // Header section text
  footer        // Footer section text
  common        // Common UI elements (buttons, labels, etc.)
  errors        // Error messages
  loading       // Loading states
  catalog       // Product catalog translations
}
```

## For AI Agents

### i18n Translation Patterns

1. **Adding new translations**:
   - Add key to `TranslationKeys` interface in `lib/i18n.ts` first
   - Add translations to ALL language files (`ja.ts`, `en.ts`, `ko.ts`)
   - Follow hierarchical structure: `section.subsection.key`

2. **Re-enabling multi-language support**:
   - Modify `lib/i18n.ts`: Change `type Language = 'ja'` to `type Language = 'ja' | 'en' | 'ko'`
   - Update `locales/index.ts`: Export `enTranslations`, `koTranslations`
   - Update `supportedLanguages` array in `lib/i18n.ts`
   - Update `languageNames` record

3. **Context usage**:
   ```typescript
   import { useLanguage } from '@/contexts/LanguageContext'
   const { t, tn } = useLanguage()

   // Simple key
   t('nav.home')  // => 'ホーム'

   // Nested path
   tn('catalog', 'actions.viewDetails')  // => '詳細をご確認'
   ```

### Dependencies

- `@/lib/i18n.ts` - Type definitions (`TranslationKeys`, `Language`)
- `@/contexts/LanguageContext.tsx` - React context for language state
- TypeScript strict mode enabled

### Language Provider Integration

The translations are consumed via `LanguageProvider` in `app/layout.tsx`:
- Wraps entire app with language context
- Provides `t()` and `tn()` helper functions
- Stores preference in `localStorage` key `epackage-language`
- Sets HTML `lang` attribute dynamically

## Notes

- The `shipping-ja.json` file appears to be a standalone carrier translation file, possibly for a specific shipping integration
- All translation objects must conform to the `TranslationKeys` interface for type safety
- The system supports nested path access via the `tn()` function for deep translation objects
