'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';
import { TranslationStatusBadge } from './TranslationStatusBadge';

/**
 * RealTimeTranslation - Live translation preview component
 *
 * Features:
 * - Real-time translation preview as user types
 * - Debounced API calls to prevent excessive requests
 * - Loading indicators
 * - Error handling with retry functionality
 * - Visual feedback for translation states
 *
 * @component
 */

export interface RealTimeTranslationProps {
  sourceText: string;
  sourceLang: 'ko' | 'ja';
  onTranslationRequest?: (text: string, from: 'ko' | 'ja', to: 'ko' | 'ja') => Promise<string>;
  autoTranslate?: boolean;
  debounceMs?: number;
  placeholder?: string;
  showRawPreview?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
}

const variantStyles = {
  default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
  minimal: 'bg-transparent border-b border-gray-200 dark:border-gray-700',
  detailed: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg',
};

const RealTimeTranslation = React.forwardRef<HTMLDivElement, RealTimeTranslationProps>(
  (
    {
      sourceText,
      sourceLang,
      onTranslationRequest,
      autoTranslate = true,
      debounceMs = 800,
      placeholder = '',
      showRawPreview = false,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const [translatedText, setTranslatedText] = useState<string>('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [translationStatus, setTranslationStatus] = useState<'pending' | 'translated' | 'failed'>('pending');
    const [retryCount, setRetryCount] = useState(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    const targetLang = sourceLang === 'ko' ? 'ja' : 'ko';

    // Debounced translation function
    const debouncedTranslate = useCallback(
      debounce(async (text: string) => {
        if (!text.trim()) {
          setTranslatedText('');
          setTranslationStatus('pending');
          setError(null);
          return;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        setIsTranslating(true);
        setError(null);
        setTranslationStatus('pending');

        try {
          if (onTranslationRequest) {
            const result = await onTranslationRequest(text, sourceLang, targetLang);
            setTranslatedText(result);
            setTranslationStatus('translated');
            setRetryCount(0);
          } else {
            // Mock translation for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1500));
            setTranslatedText(`[${targetLang.toUpperCase()}] ${text} (Demo translation)`);
            setTranslationStatus('translated');
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(err.message);
            setTranslationStatus('failed');
          }
        } finally {
          setIsTranslating(false);
        }
      }, debounceMs),
      [onTranslationRequest, sourceLang, targetLang, debounceMs]
    );

    // Trigger translation when source text changes
    useEffect(() => {
      if (autoTranslate) {
        debouncedTranslate(sourceText);
      }

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [sourceText, autoTranslate, debouncedTranslate]);

    // Manual retry function
    const handleRetry = useCallback(() => {
      setRetryCount(prev => prev + 1);
      setError(null);
      debouncedTranslate(sourceText);
    }, [sourceText, debouncedTranslate]);

    // Language labels
    const langLabels = {
      ko: { name: 'Korean', native: '한국어', flag: '🇰🇷' },
      ja: { name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    };

    return (
      <div
        ref={ref}
        className={cn(variantStyles[variant], 'overflow-hidden transition-all duration-300', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {/* Language indicator */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              <span>{langLabels[sourceLang].flag}</span>
              <span>{langLabels[sourceLang].native}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>{langLabels[targetLang].native}</span>
              <span>{langLabels[targetLang].flag}</span>
            </div>

            {/* Status badge */}
            {translationStatus !== 'pending' && (
              <TranslationStatusBadge
                status={translationStatus}
                size="sm"
                animated={false}
              />
            )}
          </div>

          {/* Auto-translate indicator */}
          {autoTranslate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className={cn('w-2 h-2 rounded-full', isTranslating ? 'bg-blue-500 animate-pulse' : 'bg-green-500')} />
              <span>{isTranslating ? '翻訳中...' : '自動'}</span>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
          {/* Source Text */}
          <div className="p-4">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {langLabels[sourceLang].name} ({langLabels[sourceLang].native})
            </label>
            <div className="relative">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words min-h-[80px]">
                {sourceText || (
                  <span className="text-gray-400 italic">{placeholder || 'Enter text...'}</span>
                )}
              </p>
              {/* Character count */}
              {sourceText && (
                <span className="absolute bottom-0 right-0 text-xs text-gray-400">
                  {sourceText.length} {sourceLang === 'ko' ? '자' : '文字'}
                </span>
              )}
            </div>
          </div>

          {/* Translated Text */}
          <div className="p-4 bg-gray-50/30 dark:bg-gray-800/20">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {langLabels[targetLang].name} ({langLabels[targetLang].native})
            </label>

            <AnimatePresence mode="wait">
              {isTranslating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center min-h-[80px] gap-3"
                >
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 w-5 h-5 border-2 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    翻訳中... / 번역 중...
                  </span>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="min-h-[80px]"
                >
                  <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-lg">
                    <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                        翻訳エラー / 번역 오류
                      </p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 underline underline-offset-2"
                      >
                        再試行 / 재시도
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : translatedText ? (
                <motion.div
                  key="translated"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words min-h-[80px]">
                    {translatedText}
                  </p>
                  {/* Character count */}
                  <span className="absolute bottom-0 right-0 text-xs text-gray-400">
                    {translatedText.length} {targetLang === 'ko' ? '자' : '文字'}
                  </span>
                  {/* Confidence indicator (mock) */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${85 + Math.random() * 14}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.floor(85 + Math.random() * 14)}%
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center min-h-[80px]"
                >
                  <span className="text-gray-400 italic text-sm">
                    {sourceText ? '翻訳を待っています...' : 'テキストを入力してください...'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Raw preview (optional) */}
        {showRawPreview && translatedText && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
            <details className="group">
              <summary className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Raw JSON Response
              </summary>
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify({ original: sourceText, translated: translatedText, status: translationStatus }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  }
);

RealTimeTranslation.displayName = 'RealTimeTranslation';

export { RealTimeTranslation };

/**
 * Hook for managing real-time translation state
 */
export function useRealTimeTranslation(
  translateFn?: (text: string, from: 'ko' | 'ja', to: 'ko' | 'ja') => Promise<string>
) {
  const [state, setState] = useState({
    isTranslating: false,
    translatedText: '',
    error: null as string | null,
  });

  const translate = useCallback(async (text: string, from: 'ko' | 'ja', to: 'ko' | 'ja') => {
    setState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      const result = translateFn ? await translateFn(text, from, to) : '';
      setState({ isTranslating: false, translatedText: result, error: null });
      return result;
    } catch (err) {
      setState({
        isTranslating: false,
        translatedText: '',
        error: err instanceof Error ? err.message : 'Translation failed'
      });
      throw err;
    }
  }, [translateFn]);

  return {
    ...state,
    translate,
    reset: useCallback(() => setState({
      isTranslating: false,
      translatedText: '',
      error: null
    }), []),
  };
}
