/**
 * Knowledge Base for Epackage Lab Chatbot
 *
 * ナレッジベース管理モジュール
 * Tracked corpus with keyword-based relevance filtering
 */

import {
  KNOWLEDGE_CORPUS,
  getKnowledgeEntry as getCorpusEntry,
  type KnowledgeCorpusEntry,
} from './knowledge-corpus';

// =====================================================
// Type Definitions
// =====================================================

type KnowledgeFile = KnowledgeCorpusEntry;

interface KeywordMapping {
  [keyword: string]: string[]; // keyword -> file IDs
}

const KNOWLEDGE_FILES = new Map<string, KnowledgeFile>(
  KNOWLEDGE_CORPUS.map((entry) => [entry.id, entry]),
);

// =====================================================
// Constants - Keyword Mappings
// =====================================================

const KEYWORD_MAPPING: KeywordMapping = {
  // Single product mappings
  '平袋': ['01-flat-pouch'],
  '3面シール': ['01-flat-pouch'],
  'シール袋': ['01-flat-pouch'],

  'スタンドパウチ': ['02-stand-pouch'],
  'スタンド': ['02-stand-pouch'],
  '自立袋': ['02-stand-pouch'],

  'ガゼット': ['03-gazette-pouch'],
  '底マチ': ['03-gazette-pouch'],
  'マチ付き': ['03-gazette-pouch'],

  'スパウト': ['04-spout-pouch'],
  '注ぎ口': ['04-spout-pouch'],
  'キャップ': ['04-spout-pouch'],

  '合掌袋': ['05-chojiu-bag'],
  'サイドシール': ['05-chojiu-bag'],
  'ピロー': ['05-chojiu-bag'],

  'ロールフィルム': ['06-roll-film'],
  '巻き取り': ['06-roll-film'],
  '自動包装': ['06-roll-film'],

  '型抜き': ['07-die-cut-package'],
  '成型パウチ': ['07-die-cut-package'],

  '白版': ['08-white-plate'],
  'ホイル': ['08-white-plate'],

  // Product selection guide mappings
  'コスト': ['09-product-selection-guide'],
  '安い': ['09-product-selection-guide', '01-flat-pouch'],
  '価格': ['09-product-selection-guide'],
  '選び方': ['09-product-selection-guide'],
  'おすすめ': ['09-product-selection-guide'],
  'どの製品': ['09-product-selection-guide'],

  // Printing guide mappings
  '塗り足し': ['10-printing-guide'],
  'ドブ': ['10-printing-guide'],
  'カラーモード': ['10-printing-guide'],
  '色モード': ['10-printing-guide'],
  'カラー': ['10-printing-guide'],
  'CMYK': ['10-printing-guide'],
  '特色': ['10-printing-guide'],
  'アウトライン': ['10-printing-guide'],
  'フォント': ['10-printing-guide'],
  '解像度': ['10-printing-guide'],
  'dpi': ['10-printing-guide'],
  'レイヤー': ['10-printing-guide'],
  '安全領域': ['10-printing-guide'],
  '透明': ['10-printing-guide'],
  'アルミ': ['10-printing-guide'],

  // General mappings
  '印刷': ['10-printing-guide'],
  'データ作成': ['10-printing-guide'],
  'デザイン': ['10-printing-guide'],
  '比較': ['09-product-selection-guide'],

  // Compound mappings
  '自立': ['02-stand-pouch', '03-gazette-pouch'],
  '液体': ['04-spout-pouch'],

  // User flows mappings
  '見積もり': ['11-user-flows'],
  '統合見積もり': ['11-user-flows'],
  '見積ツール': ['11-user-flows'],
  '詳細見積もり': ['11-user-flows'],
  '電話相談': ['11-user-flows'],
  '会員登録': ['11-user-flows'],
  'ログイン': ['11-user-flows'],
  'パスワード': ['11-user-flows'],
  'マイページ': ['11-user-flows', '12-pricing-tips'],
  '見積管理': ['11-user-flows', '12-pricing-tips'],
  'ダッシュボード': ['11-user-flows'],
  '注文管理': ['11-user-flows'],
  'サンプル': ['11-user-flows'],
  '契約': ['11-user-flows'],
  '請求書': ['11-user-flows'],
  '配送': ['11-user-flows'],
  '通知': ['11-user-flows'],
  'プロフィール': ['11-user-flows'],
  'アカウント': ['11-user-flows'],
  '承認': ['11-user-flows'],
  '登録': ['11-user-flows'],

  // Pricing tips mappings
  'お得': ['12-pricing-tips'],
  '割引': ['12-pricing-tips'],
  '安く': ['12-pricing-tips'],
  '経済的数量': ['12-pricing-tips'],
  '2列生産': ['12-pricing-tips'],
  'SKU': ['12-pricing-tips'],
  '複数': ['12-pricing-tips'],
  '最安値': ['12-pricing-tips'],
  'おトク': ['12-pricing-tips'],
};

/**
 * Extract keywords from user query
 */
function extractKeywords(query: string): string[] {
  const foundKeywords: string[] = [];

  for (const keyword of Object.keys(KEYWORD_MAPPING)) {
    if (query.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
}

/**
 * Get relevant file IDs based on keywords
 */
function getRelevantFileIds(keywords: string[]): Set<string> {
  const relevantFileIds = new Set<string>();

  for (const keyword of keywords) {
    const fileIds = KEYWORD_MAPPING[keyword];
    if (fileIds) {
      fileIds.forEach(id => relevantFileIds.add(id));
    }
  }

  return relevantFileIds;
}

// =====================================================
// Public API
// =====================================================

// Constants for knowledge base limits
const MAX_KNOWLEDGE_FILES = 2;
const MAX_CHARS_PER_FILE = 500;
const MAX_TOTAL_CHARS = 1000;
const SEPARATOR = '\n\n---\n\n';
const TRUNCATION_MARKER = '...\n[要約済み]';

/**
 * Resolve selected knowledge entries without flattening them into prompt text.
 * Callers can use this surface to distinguish unmatched queries from missing data.
 */
export function getRelevantKnowledgeEntries(query: string): KnowledgeFile[] {
  const keywords = extractKeywords(query);
  const relevantFileIds = getRelevantFileIds(keywords);

  const entries: KnowledgeFile[] = [];
  for (const fileId of relevantFileIds) {
    if (entries.length >= MAX_KNOWLEDGE_FILES) break;

    const knowledgeFile = KNOWLEDGE_FILES.get(fileId);
    if (knowledgeFile) {
      entries.push(knowledgeFile);
    }
  }

  return entries;
}

/**
 * Get relevant knowledge base content based on user query
 *
 * @param query - User's question/input
 * @returns Merged relevant knowledge content (truncated to fit context)
 *
 * @example
 * ```ts
 * const knowledge = getRelevantKnowledge("スタンドパウチの特徴は？");
 * // Returns content from 02-stand-pouch.md
 * ```
 */
export function getRelevantKnowledge(query: string): string {
  const content = getRelevantKnowledgeEntries(query).map((knowledgeFile) => {
    return knowledgeFile.content.length > MAX_CHARS_PER_FILE
      ? knowledgeFile.content.substring(0, MAX_CHARS_PER_FILE) + TRUNCATION_MARKER
      : knowledgeFile.content;
  });

  const result = content.join(SEPARATOR);
  if (result.length > MAX_TOTAL_CHARS) {
    return result.substring(0, MAX_TOTAL_CHARS) + TRUNCATION_MARKER;
  }

  return result;
}

/**
 * Get all available knowledge as a single string
 * Useful for complete context when needed
 */
export function getAllKnowledge(): string {
  return KNOWLEDGE_CORPUS.map((knowledgeFile) => knowledgeFile.content).join(SEPARATOR);
}

/**
 * Clear the knowledge base cache
 * Compatibility no-op; the tracked corpus is immutable at import time.
 */
export function clearKnowledgeCache(): void {
}

/**
 * Get statistics about the knowledge base
 */
export function getKnowledgeStats() {
  return {
    totalFiles: KNOWLEDGE_CORPUS.length,
    totalKeywords: Object.keys(KEYWORD_MAPPING).length,
    fileIds: KNOWLEDGE_CORPUS.map((knowledgeFile) => knowledgeFile.id),
  };
}

/**
 * Resolve one tracked entry by ID. Missing IDs return undefined so callers can
 * fail closed instead of treating absent grounding as an empty matched answer.
 */
export function getKnowledgeEntry(id: string): KnowledgeFile | undefined {
  return getCorpusEntry(id);
}
