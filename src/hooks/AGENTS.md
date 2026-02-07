# src/hooks/ - Custom React Hooks

<!-- Parent: ../AGENTS.md -->

## Purpose

Custom React hooks for reusable stateful logic, data fetching, form handling, and UI interactions. This directory contains hooks that encapsulate complex behaviors to keep components clean and maintainable.

## Directory Structure

```
hooks/
├── index.ts                      # Main exports barrel file
├── useBreakpoint.ts              # Responsive breakpoint detection
├── useDraftSave.ts               # Auto-save form data to localStorage
├── useFilterState.ts             # URL-synced filter state management
├── useFocusTrap.ts               # Accessibility focus trap for modals
├── use-optimized-fetch.ts        # SWR-based optimized data fetching
├── useNotifications.ts           # SWR polling for notifications
├── useNotificationSubscription.ts# Supabase Realtime notifications
├── useSupabaseClient.ts          # Dynamic Supabase client initialization
└── quote/                        # Quote-related hooks
    ├── index.ts                  # Quote hooks barrel file
    ├── useQuoteCalculation.ts    # Price calculation logic
    ├── useQuoteValidation.ts     # Quote state validation
    └── useQuotePersistence.ts    # localStorage persistence for quotes
```

## Key Hooks

### Data Fetching

**`useOptimizedFetch`** (use-optimized-fetch.ts)
- SWR-based data fetching with caching, deduplication, and error retry
- Features: timeout support, batch fetching, infinite scroll, prefetching
- Exports: `useFetchWithTimeout`, `useBatchFetch`, `useInfiniteFetch`, `prefetchData`, `clearCache`

**`useNotifications`** (useNotifications.ts)
- SWR polling (30s default) for notification list
- DEV_MODE compatible with mock user headers
- Returns: notifications array, unreadCount, isLoading, error, mutate

**`useNotificationSubscription`** (useNotificationSubscription.ts)
- Supabase Realtime subscription for live notifications
- Actions: markAsRead, markAllAsRead, deleteNotification, refresh
- Skips Realtime in DEV_MODE

**`useSupabaseClient`** (useSupabaseClient.ts)
- Dynamic import of Supabase browser client
- Prevents build-time SSR issues
- Returns: { supabase, loading }

### State Management

**`useFilterState`** (useFilterState.ts)
- URL-synced filter state for catalog/product filtering
- Syncs with Next.js useSearchParams, useRouter
- Features: active filter count, clear all, URL persistence
- State: searchQuery, category, materials, priceRange, MOQ, leadTime, sortBy, viewMode

**`useDraftSave`** (useDraftSave.ts)
- Auto-saves form data to localStorage (30s default interval)
- Includes `useFormDraftSave` for React Hook Form integration
- Features: debounce, timestamp, version check, callbacks
- Returns: draftData, hasDraft, saveDraft, restoreDraft, clearDraft, lastSaved, scheduleSave

### Quote Hooks (quote/)

**`useQuoteCalculation`**
- Extracted from ImprovedQuotingWizard for price calculations
- Debounced calculation (300ms default)
- Multi-quantity comparison with discount rates
- Integrates with `unifiedPricingEngine` and QuoteContext
- Returns: currentPrice, quantityQuotes, isCalculating, priceChange, error, leadTime, triggerFullCalculation

**`useQuoteValidation`**
- Step-by-step validation for quote wizard
- Validates: specs, quantity, post-processing, delivery
- Checks: required fields, size constraints, material thickness, mutually exclusive options
- Returns: stepValidations, isStepValid, isStepComplete, getStepErrors, getStepWarnings

**`useQuotePersistence`**
- localStorage draft quote persistence with 7-day expiry
- Auto-saves on state changes (2s debounce)
- Version checking and stale data detection
- Returns: isSaving, isLoading, lastSaved, hasStoredData, saveQuote, loadQuote, clearStoredQuote, hasStoredQuote, getStoredQuoteAge

### UI/Accessibility

**`useFocusTrap`** (useFocusTrap.ts)
- Accessibility hook for modals and overlays
- Cycles Tab focus within container, handles Shift+Tab reverse
- Optional: autoFocus, returnFocusRef, escape key custom event
- Also exports `useFocusTrapStrict` using FocusEvent API

**`useBreakpoint`** (useBreakpoint.ts)
- Responsive breakpoint detection: mobile (0), tablet (640), desktop (1024), large (1440)
- Additional hooks: `useResponsiveValue<T>`, `useIsTouchDevice`, `useOrientation`, `useViewportSize`
- Debounced resize handling (100ms)

## For AI Agents

### Hook Patterns

When creating or modifying hooks:

1. **Naming Convention**: Always prefix with `use` (e.g., `useUserProfile`)
2. **Client-Side Only**: Add `'use client'` directive at top for Next.js App Router
3. **TypeScript**: Always define input and output interfaces
4. **Cleanup**: Return cleanup functions from useEffect for subscriptions/timeouts
5. **SSR Safety**: Check `typeof window === 'undefined'` for browser APIs
6. **DEV_MODE Support**: Add localStorage-based dev mode detection for mock data

### Common Dependencies

- **React**: useState, useEffect, useCallback, useMemo, useRef
- **Next.js**: useRouter, useSearchParams, usePathname
- **SWR**: useSWR, useSWRInfinite (data fetching, caching)
- **Supabase**: @supabase/supabase-js (Realtime, client)
- **Context**: QuoteContext, AuthContext, MultiQuantityQuoteContext
- **Forms**: react-hook-form (useFormContext, watch)

### Quote Hook Integration

Quote hooks integrate deeply with:
- `src/contexts/QuoteContext.tsx` - Global quote state
- `src/lib/unified-pricing-engine.ts` - Price calculations
- `src/contexts/MultiQuantityQuoteContext.tsx` - Multi-quantity logic

### Adding New Hooks

1. Create hook file in appropriate location (root or subdirectory)
2. Export from relevant `index.ts` barrel file
3. Add TypeScript interfaces for options and return values
4. Include JSDoc comments with usage examples
5. Handle SSR/browser API checks
6. Add cleanup functions for side effects
7. Update this AGENTS.md with hook description

## Dependencies

**Internal:**
- `src/contexts/QuoteContext.tsx` - Quote state management
- `src/contexts/MultiQuantityQuoteContext.tsx` - Multi-quantity logic
- `src/lib/unified-pricing-engine.ts` - Price calculation
- `src/lib/unified-notifications.ts` - Notification types
- `src/lib/supabase-browser.ts` - Browser Supabase client

**External (package.json):**
- `react` / `react-dom` - Core React
- `next` - Next.js (useRouter, useSearchParams, usePathname)
- `swr` - Data fetching and caching
- `@supabase/supabase-js` - Supabase client and Realtime
- `react-hook-form` - Form state integration (optional)

## Related Directories

- `src/contexts/` - React Context providers (state used by hooks)
- `src/lib/` - Utility functions (pricing, notifications, Supabase)
- `src/components/` - Components that consume these hooks
- `src/app/` - Next.js App Router pages using hooks
