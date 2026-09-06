'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  isCompletePostalCode,
  JAPANESE_PREFECTURES,
  lookupPostalAddress,
  matchPrefecture,
  normalizePostalCodeInput,
  type PostalAddress,
} from '@/lib/address/postal-code';

export interface ResolvedPostalAddress extends Omit<PostalAddress, 'prefecture'> {
  /** Registry text resolved against the supplied prefecture options. */
  prefecture: string;
}

export interface UsePostalCodeLookupOptions {
  /** Callers own form state and may transform the shared registry values. */
  onAddressFound: (address: ResolvedPostalAddress) => void;
  prefectureOptions?: readonly string[];
}

export interface UsePostalCodeLookupResult {
  lookupPostalCode: (value: string) => Promise<void>;
  isSearchingPostal: boolean;
  postalSearchError: string | null;
  clearPostalSearchError: () => void;
}

/**
 * Client hook for the signup postal lookup. It centralizes normalization,
 * loading/error state, and stale-response handling while leaving form writes
 * to each caller.
 */
export function usePostalCodeLookup({
  onAddressFound,
  prefectureOptions = JAPANESE_PREFECTURES,
}: UsePostalCodeLookupOptions): UsePostalCodeLookupResult {
  const [isSearchingPostal, setIsSearchingPostal] = useState(false);
  const [postalSearchError, setPostalSearchError] = useState<string | null>(null);
  const requestTokenRef = useRef(0);
  const onAddressFoundRef = useRef(onAddressFound);

  useEffect(() => {
    onAddressFoundRef.current = onAddressFound;
  }, [onAddressFound]);

  const lookupPostalCode = useCallback(async (value: string) => {
    if (!isCompletePostalCode(value)) {
      setPostalSearchError('郵便番号を正しく入力してください（例: 123-4567）');
      return;
    }

    const token = requestTokenRef.current + 1;
    requestTokenRef.current = token;
    setIsSearchingPostal(true);
    setPostalSearchError(null);

    try {
      const result = await lookupPostalAddress(value);
      if (requestTokenRef.current !== token) {
        return;
      }

      const prefecture =
        matchPrefecture(result.prefecture, prefectureOptions) ?? result.prefecture;
      onAddressFoundRef.current({ ...result, prefecture });
    } catch (error) {
      if (requestTokenRef.current !== token) {
        return;
      }
      setPostalSearchError(
        error instanceof Error ? error.message : '住所検索に失敗しました。',
      );
    } finally {
      if (requestTokenRef.current === token) {
        setIsSearchingPostal(false);
      }
    }
  }, [prefectureOptions]);

  const clearPostalSearchError = useCallback(() => {
    setPostalSearchError(null);
  }, []);

  return {
    lookupPostalCode,
    isSearchingPostal,
    postalSearchError,
    clearPostalSearchError,
  };
}

export { normalizePostalCodeInput };
