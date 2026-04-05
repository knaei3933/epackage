/**
 * Hooks Index
 *
 * Centralized exports for all custom React hooks
 */

export { useFocusTrap, useFocusTrapStrict } from './useFocusTrap';
export { useDraftSave, useFormDraftSave } from './useDraftSave';

// Optimized data fetching hooks
export {
  useOptimizedFetch as default,
  useOptimizedFetch,
  useFetchWithTimeout,
  useBatchFetch,
  useInfiniteFetch,
  prefetchData,
  prefetchMultiple,
  clearCache,
  clearAllCache,
  revalidate,
  fetcher,
} from './use-optimized-fetch';

// Quotations hook
export {
  useQuotations,
  fetchQuotationsServerSide,
} from './useQuotations';
export type { UseQuotationsParams, UseQuotationsReturn } from './useQuotations';
