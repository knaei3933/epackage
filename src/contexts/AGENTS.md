<!-- Parent: ../AGENTS.md -->

# Contexts Directory

**Purpose:** React Context providers for global state management across the application.

## Overview

This directory contains all React Context providers that manage application-wide state. Each context handles a specific domain of the application state, providing a clean separation of concerns and enabling components to access shared state through custom hooks.

## Key Files

### AuthContext.tsx
Authentication and user session management.

**Key Features:**
- User authentication state (sign in, sign out, sign up)
- Profile management and updates
- Session handling with server-side httpOnly cookies
- DEV MODE support for development/testing
- Automatic session refresh (every minute, extends 5 minutes before expiry)
- Password reset functionality
- Role-based access control (`isAdmin`, `isAuthenticated`)

**Custom Hooks:**
- `useAuth()` - Access auth context (must be used within `AuthProvider`)

**Key State:**
- `user: User | null` - Current user data
- `session: Session | null` - Current session
- `profile: Profile | null` - User profile
- `isAuthenticated: boolean` - Authentication status
- `isAdmin: boolean` - Admin role check
- `isLoading: boolean` - Loading state

**Important Notes:**
- Uses server-side API routes (`/api/auth/*`) for all auth operations
- Session is managed via httpOnly cookies for security
- DEV MODE stores mock user in localStorage for testing
- Session auto-refreshes every minute to maintain 30-minute expiry

### QuoteContext.tsx
Quote/inquiry wizard state management for the quoting system.

**Key Features:**
- Product specification state (bag type, material, dimensions)
- Quantity management (single and SKU-based)
- Post-processing options with category validation
- Roll film support (pitch, length, roll count)
- Film structure layers for different materials
- Automatic material width calculation
- Two-column production option support

**Custom Hooks:**
- `useQuote()` - Access quote actions/functions
- `useQuoteState()` - Access quote state only
- `useQuoteContext()` - Access both state and functions

**Helper Functions:**
- `checkStepComplete(state, step)` - Validate wizard step completion
- `getPostProcessingLimitStatusForState(state)` - Check post-processing limits
- `canAddPostProcessingOptionForState(state)` - Check if option can be added
- `createStepSummary(state, getLimitStatus, step)` - Generate step summary

**Key State:**
- `bagTypeId`, `materialId`, `width`, `height`, `depth`, `sideWidth`
- `quantities: number[]`, `quantity: number`
- `postProcessingOptions: string[]`
- `skuCount`, `skuQuantities: number[]`, `quantityMode`
- `pitch`, `totalLength`, `rollCount`, `materialWidth`, `filmLayers`
- `twoColumnOptionApplied`, `discountedUnitPrice`, `originalUnitPrice`

**Post-Processing Validation:**
- Maximum 10 post-processing items
- Category-based constraints (e.g., zipper category allows only one selection)
- Automatic multiplier calculation
- Roll film and spout pouch only allow finish options (glossy/matte)

### LanguageContext.tsx
Internationalization (i18n) and language management.

**Key Features:**
- Language state management (currently Japanese-only)
- Translation functions (`t` for flat keys, `tn` for nested paths)
- HTML lang attribute updates on language change
- Client-side language detection from localStorage

**Custom Hooks:**
- `useLanguage()` - Access language context
- `useTranslation()` - Alias for convenience

**Key State:**
- `language: Language` - Current language ('ja' for Japanese)
- `isChanging: boolean` - Language transition state

**Functions:**
- `t<K>(key: K)` - Get translation by key
- `tn<K, P>(section: K, path: P)` - Get nested translation

### Other Contexts
- `CatalogContext.tsx` - Product catalog state
- `ComparisonContext.tsx` - Product comparison feature
- `LoadingContext.tsx` - Global loading states
- `CartContext.tsx` - Shopping cart functionality
- `MultiQuantityQuoteContext.tsx` - Multi-quantity quote handling

## Dependencies

### Internal
- `@/lib/supabase-browser` - Supabase client for AuthContext
- `@/lib/supabase` - Auth utilities
- `@/lib/i18n` - Internationalization utilities
- `@/locales` - Translation data
- `@/types/auth` - Authentication type definitions
- `@/lib/unified-pricing-engine` - Quote calculation engine
- `@/components/quote/postProcessingLimits` - Post-processing validation
- `@/components/quote/processingConfig` - Processing options configuration
- `@/lib/material-width-selector` - Material width calculation
- `@/lib/gusset-data` - Gusset size validation
- `@/lib/film-cost-calculator` - Film structure utilities

### External
- `react` - Context hooks (createContext, useContext, useReducer)
- `next/navigation` - Router for navigation after sign out
- `@supabase/supabase-js` - Supabase types

## For AI Agents

### Context Patterns for State Management

When working with contexts in this directory:

1. **Reading Context State:**
   ```typescript
   // For function/actions only (stable reference)
   const { updateField, dispatch } = useQuote()

   // For state only
   const state = useQuoteState()

   // For both (combined)
   const { state, updateField } = useQuoteContext()
   ```

2. **Auth Context Usage:**
   ```typescript
   const { user, isAuthenticated, isAdmin, signIn, signOut } = useAuth()

   // Check authentication
   if (!isAuthenticated) {
     // Redirect or show login
   }

   // Check admin role
   if (isAdmin) {
     // Show admin features
   }
   ```

3. **Quote Context Dispatch Actions:**
   ```typescript
   // Direct dispatch
   dispatch({ type: 'SET_BASIC_SPECS', payload: { bagTypeId: 'stand_up' } })

   // Helper functions (preferred)
   updateBasicSpecs({ bagTypeId: 'stand_up', materialId: 'pet_al' })
   updateField('width', 200)
   ```

4. **Step Validation:**
   ```typescript
   import { checkStepComplete } from '@/contexts/QuoteContext'

   const isSpecsComplete = checkStepComplete(state, 'specs')
   const isPostProcessingComplete = checkStepComplete(state, 'post-processing')
   ```

5. **Language Context:**
   ```typescript
   const { t, tn, language } = useLanguage()

   // Flat key
   const title = t('common.title')

   // Nested path
   const subtitle = tn('quote', 'specs.subtitle')
   ```

### Common Patterns

- **Split Context Pattern:** QuoteContext uses separate providers for state and functions to prevent unnecessary re-renders
- **Reducer Pattern:** QuoteContext uses useReducer for complex state logic with many action types
- **Server-First Auth:** AuthContext relies on server-side APIs for security (httpOnly cookies)
- **Auto-Refresh:** AuthContext automatically refreshes sessions to maintain user login state
- **Category Validation:** Post-processing options enforce category constraints (one per category)

### Important Notes

- All Auth operations go through server-side API routes
- DEV MODE in AuthContext uses localStorage mock users for testing
- QuoteContext handles both single quantity and SKU-based calculations
- Post-processing has a 10-item maximum with category constraints
- LanguageContext is Japanese-only but structured for future expansion

## File Structure

```
contexts/
├── AGENTS.md                    # This file
├── AuthContext.tsx              # Authentication & user session
├── QuoteContext.tsx             # Quote wizard state
├── LanguageContext.tsx          # i18n & translations
├── CatalogContext.tsx           # Product catalog
├── ComparisonContext.tsx        # Product comparison
├── LoadingContext.tsx           # Loading states
├── CartContext.tsx              # Shopping cart
└── MultiQuantityQuoteContext.tsx # Multi-quantity quotes
```

## Related Documentation

- `../lib/AGENTS.md` - Library utilities including auth and pricing engines
- `../types/AGENTS.md` - TypeScript type definitions
- `../components/quote/AGENTS.md` - Quote components that use these contexts
