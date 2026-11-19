/**
 * Bilingual Text Component
 *
 * バイリンガルテキストコンポーネント
 * - 翻訳テキストと原文を表示
 * - 言語バッジ表示
 * - 折りたたみ対応
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface BilingualTextProps {
  content: string;
  content_translated?: string | null;
  original_language: string;
  showTranslation?: boolean;
  compact?: boolean;
}

// =====================================================
// Helper Functions
// =====================================================

function getLanguageLabel(language: string): string {
  switch (language) {
    case 'ko':
      return '韓国語';
    case 'ja':
      return '日本語';
    case 'en':
      return '英語';
    default:
      return language.toUpperCase();
  }
}

function getTranslationLabel(originalLanguage: string): string {
  switch (originalLanguage) {
    case 'ko':
      return '翻訳 (日本語)';
    case 'ja':
      return '翻訳 (韓国語)';
    case 'en':
      return '翻訳 (日本語)';
    default:
      return '翻訳';
  }
}

// =====================================================
// Main Component
// =====================================================

export function BilingualText({
  content,
  content_translated,
  original_language,
  showTranslation = true,
  compact = false,
}: BilingualTextProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const hasTranslation = content_translated && content_translated !== content;
  const languageLabel = getLanguageLabel(original_language);
  const translationLabel = getTranslationLabel(original_language);

  return (
    <div className="space-y-2">
      {/* Original Text */}
      <div className={`
        ${hasTranslation ? 'pb-2' : ''}
      `}>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-3 h-3 text-text-muted" />
          <span className="text-xs font-medium text-text-muted uppercase">
            [{languageLabel}] {languageLabel === '韓国語' ? '原文' : 'Original'}
          </span>
        </div>
        <p className="text-text-primary whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>

      {/* Translated Text */}
      {hasTranslation && showTranslation && (
        <>
          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-brand hover:text-brand transition-colors"
              aria-expanded={isExpanded}
              aria-label={`翻訳を${isExpanded ? '非表示' : '表示'}`}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {isExpanded ? '翻訳を隠す' : '翻訳を表示'}
            </button>
          )}

          {(isExpanded || !compact) && (
            <div className="pt-2 border-t border-border-medium">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-3 h-3 text-success" />
                <span className="text-xs font-medium text-success uppercase">
                  [{translationLabel}] 翻訳
                </span>
              </div>
              <p className="text-text-secondary whitespace-pre-wrap break-words">
                {content_translated}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
