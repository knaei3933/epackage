/**
 * Translation Service
 *
 * Google Cloud Translation API v2 integration with caching
 * Supports Korean <-> Japanese translation for EPAC homepage
 *
 * @module lib/translation
 */

// =====================================================
// Types
// =====================================================

export type SupportedLanguage = 'ko' | 'ja' | 'en';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  cached: boolean;
}

export interface BatchTranslationResult {
  translations: string[];
  sourceLanguage: string;
  targetLanguage: string;
  cached: boolean[];
}

export interface TranslationServiceStatus {
  available: boolean;
  configured: boolean;
  lastChecked: string;
  error?: string;
}

// =====================================================
// Cache Configuration
// =====================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class TranslationCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize = 500, defaultTtl = 24 * 60 * 60 * 1000) { // 24 hours default
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  private generateKey(text: string, source: string, target: string): string {
    // Create a simple hash for cache key
    const normalizedText = text.trim().toLowerCase();
    return `tr:${source}:${target}:${btoa(unescape(encodeURIComponent(normalizedText)))}`;
  }

  set<T>(text: string, source: string, target: string, data: T, ttl?: number): void {
    const key = this.generateKey(text, source, target);

    // LRU eviction if over capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    });
  }

  get<T>(text: string, source: string, target: string): T | null {
    const key = this.generateKey(text, source, target);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(text: string, source: string, target: string): boolean {
    const key = this.generateKey(text, source, target);
    const entry = this.cache.get(key);

    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Global cache instance
const translationCache = new TranslationCache();

// =====================================================
// Google Cloud Translation API Client
// =====================================================

const GOOGLE_TRANSLATION_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Get the API key from environment
 */
function getApiKey(): string | null {
  // Try both naming conventions
  return process.env.GOOGLE_TRANSLATION_API_KEY ||
         process.env.GOOGLE_TRANSLATE_API_KEY ||
         null;
}

/**
 * Check if the translation service is configured
 */
export function isTranslationConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Call Google Cloud Translation API
 */
async function callTranslationApi(
  texts: string[],
  source: SupportedLanguage,
  target: SupportedLanguage
): Promise<string[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Google Translation API key not configured. Set GOOGLE_TRANSLATION_API_KEY environment variable.');
  }

  // Google API expects q as array for batch translation
  const response = await fetch(`${GOOGLE_TRANSLATION_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: texts,
      source,
      target,
      format: 'text',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Translation API error: ${response.status}`;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorMessage;
    } catch {
      // Use default error message
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Extract translations from response
  const translations = data.data?.translations || [];

  return translations.map((t: { translatedText: string }) =>
    // Decode HTML entities that might be returned
    decodeHtmlEntities(t.translatedText)
  );
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
  };

  return text.replace(/&[a-zA-Z]+;|&#x?[0-9a-fA-F]+;/g, (match) => {
    return entities[match] || match;
  });
}

// =====================================================
// Public API Functions
// =====================================================

/**
 * Translate text from one language to another
 *
 * @param text - Text to translate
 * @param source - Source language code
 * @param target - Target language code
 * @param options - Optional settings
 * @returns Translation result with metadata
 */
export async function translateText(
  text: string,
  source: SupportedLanguage,
  target: SupportedLanguage,
  options?: { skipCache?: boolean }
): Promise<TranslationResult> {
  if (!text || text.trim() === '') {
    return {
      translatedText: text,
      sourceLanguage: source,
      targetLanguage: target,
      cached: false,
    };
  }

  // Same language - no translation needed
  if (source === target) {
    return {
      translatedText: text,
      sourceLanguage: source,
      targetLanguage: target,
      cached: false,
    };
  }

  // Check cache first
  if (!options?.skipCache) {
    const cached = translationCache.get<string>(text, source, target);
    if (cached !== null) {
      return {
        translatedText: cached,
        sourceLanguage: source,
        targetLanguage: target,
        cached: true,
      };
    }
  }

  // Call API
  const translations = await callTranslationApi([text], source, target);
  const translatedText = translations[0];

  // Cache the result
  translationCache.set(text, source, target, translatedText);

  return {
    translatedText,
    sourceLanguage: source,
    targetLanguage: target,
    cached: false,
  };
}

/**
 * Translate Korean text to Japanese
 *
 * @param text - Korean text to translate
 * @returns Translation result
 */
export async function translateKoreanToJapanese(text: string): Promise<TranslationResult> {
  return translateText(text, 'ko', 'ja');
}

/**
 * Translate Japanese text to Korean
 *
 * @param text - Japanese text to translate
 * @returns Translation result
 */
export async function translateJapaneseToKorean(text: string): Promise<TranslationResult> {
  return translateText(text, 'ja', 'ko');
}

/**
 * Batch translate multiple texts
 *
 * @param texts - Array of texts to translate
 * @param source - Source language code
 * @param target - Target language code
 * @param options - Optional settings
 * @returns Batch translation result with metadata
 */
export async function batchTranslate(
  texts: string[],
  source: SupportedLanguage,
  target: SupportedLanguage,
  options?: { skipCache?: boolean }
): Promise<BatchTranslationResult> {
  if (!texts || texts.length === 0) {
    return {
      translations: [],
      sourceLanguage: source,
      targetLanguage: target,
      cached: [],
    };
  }

  const results: string[] = new Array(texts.length);
  const cachedFlags: boolean[] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  // Check cache for each text
  texts.forEach((text, index) => {
    if (!text || text.trim() === '' || source === target) {
      results[index] = text;
      cachedFlags[index] = false;
      return;
    }

    if (!options?.skipCache) {
      const cached = translationCache.get<string>(text, source, target);
      if (cached !== null) {
        results[index] = cached;
        cachedFlags[index] = true;
        return;
      }
    }

    uncachedIndices.push(index);
    uncachedTexts.push(text);
  });

  // Batch translate uncached texts (Google API supports batch)
  if (uncachedTexts.length > 0) {
    const translations = await callTranslationApi(uncachedTexts, source, target);

    // Map results back to original positions
    uncachedIndices.forEach((originalIndex, i) => {
      results[originalIndex] = translations[i];
      cachedFlags[originalIndex] = false;

      // Cache the result
      translationCache.set(texts[originalIndex], source, target, translations[i]);
    });
  }

  return {
    translations: results,
    sourceLanguage: source,
    targetLanguage: target,
    cached: cachedFlags,
  };
}

/**
 * Check translation service status
 *
 * @returns Service status information
 */
export async function checkTranslationServiceStatus(): Promise<TranslationServiceStatus> {
  const now = new Date().toISOString();

  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      available: false,
      configured: false,
      lastChecked: now,
      error: 'GOOGLE_TRANSLATION_API_KEY not configured',
    };
  }

  try {
    // Test with a simple translation
    await callTranslationApi(['test'], 'en', 'ja');

    return {
      available: true,
      configured: true,
      lastChecked: now,
    };
  } catch (error) {
    return {
      available: false,
      configured: true,
      lastChecked: now,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get translation cache statistics
 */
export function getTranslationCacheStats(): { size: number; maxSize: number } {
  return translationCache.getStats();
}

// =====================================================
// Export cache instance for advanced usage
// =====================================================

export { translationCache };
