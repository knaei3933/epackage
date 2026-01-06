/**
 * useQuotePersistence Hook
 *
 * Extracts save and load logic from ImprovedQuotingWizard component.
 * Handles local storage persistence for draft quotes.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuoteState } from '@/contexts/QuoteContext';
import type { QuoteState } from '@/contexts/QuoteContext';

const STORAGE_KEY = 'epackage_quote_draft';
const STORAGE_VERSION = 1;

interface StoredQuote {
  version: number;
  timestamp: number;
  state: QuoteState;
}

interface PersistenceState {
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  hasStoredData: boolean;
  error: string | null;
}

/**
 * Hook for persisting quote state to local storage
 */
export function useQuotePersistence() {
  const state = useQuoteState();
  const [persistenceState, setPersistenceState] = useState<PersistenceState>({
    isSaving: false,
    isLoading: false,
    lastSaved: null,
    hasStoredData: false,
    error: null
  });

  /**
   * Save current quote state to local storage
   */
  const saveQuote = useCallback(async (): Promise<boolean> => {
    setPersistenceState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const storedQuote: StoredQuote = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        state
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedQuote));

      setPersistenceState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasStoredData: true
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setPersistenceState(prev => ({
        ...prev,
        isSaving: false,
        error: `保存に失敗しました: ${message}`
      }));
      return false;
    }
  }, [state]);

  /**
   * Load quote state from local storage
   */
  const loadQuote = useCallback(async (): Promise<QuoteState | null> => {
    setPersistenceState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setPersistenceState(prev => ({
          ...prev,
          isLoading: false,
          hasStoredData: false
        }));
        return null;
      }

      const parsed: StoredQuote = JSON.parse(stored);

      // Version check
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Stored quote version mismatch, ignoring');
        setPersistenceState(prev => ({
          ...prev,
          isLoading: false,
          error: '保存された見積もりのバージョンが異なります'
        }));
        return null;
      }

      // Check if data is stale (older than 7 days)
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > sevenDaysMs) {
        setPersistenceState(prev => ({
          ...prev,
          isLoading: false,
          error: '保存された見積もりの有効期限が切れています'
        }));
        return null;
      }

      setPersistenceState(prev => ({
        ...prev,
        isLoading: false,
        lastSaved: new Date(parsed.timestamp),
        hasStoredData: true
      }));

      return parsed.state;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setPersistenceState(prev => ({
        ...prev,
        isLoading: false,
        error: `読み込みに失敗しました: ${message}`
      }));
      return null;
    }
  }, []);

  /**
   * Clear stored quote data
   */
  const clearStoredQuote = useCallback((): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPersistenceState(prev => ({
        ...prev,
        hasStoredData: false,
        lastSaved: null
      }));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setPersistenceState(prev => ({
        ...prev,
        error: `削除に失敗しました: ${message}`
      }));
      return false;
    }
  }, []);

  /**
   * Check if there's a stored quote available
   */
  const hasStoredQuote = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const parsed: StoredQuote = JSON.parse(stored);

      // Version and age check
      if (parsed.version !== STORAGE_VERSION) return false;

      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > sevenDaysMs) return false;

      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Get the age of the stored quote in days
   */
  const getStoredQuoteAge = useCallback((): number | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: StoredQuote = JSON.parse(stored);
      const ageMs = Date.now() - parsed.timestamp;
      return Math.floor(ageMs / (24 * 60 * 60 * 1000));
    } catch {
      return null;
    }
  }, []);

  // Auto-save on state changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only auto-save if there's meaningful data
      if (state.bagTypeId && state.materialId && state.width > 0 && state.height > 0) {
        saveQuote();
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [state, saveQuote]);

  // Check for stored data on mount
  useEffect(() => {
    const hasStored = hasStoredQuote();
    setPersistenceState(prev => ({ ...prev, hasStoredData: hasStored }));
  }, [hasStoredQuote]);

  return {
    ...persistenceState,
    saveQuote,
    loadQuote,
    clearStoredQuote,
    hasStoredQuote,
    getStoredQuoteAge
  };
}
