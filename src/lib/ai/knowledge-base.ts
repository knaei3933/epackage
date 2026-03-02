/**
 * Knowledge Base for Epackage Lab Chatbot
 *
 * ナレッジベース管理モジュール
 * Static knowledge base loader with keyword-based relevance filtering
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// =====================================================
// Type Definitions
// =====================================================

interface KnowledgeFile {
  id: string;
  keywords: string[];
  content: string;
}

interface KeywordMapping {
  [keyword: string]: string[]; // keyword -> file IDs
}

interface KnowledgeFileConfig {
  dir: 'products' | 'general';
  filename: string;
}

// =====================================================
// Constants - File Paths
// =====================================================

const KNOWLEDGE_BASE_DIRS = {
  products: join(process.cwd(), '.omc', 'knowledge-base', 'products'),
  general: join(process.cwd(), '.omc', 'knowledge-base', 'general'),
} as const;

const KNOWLEDGE_FILES: Record<string, KnowledgeFileConfig> = {
  '01-flat-pouch': { dir: 'products', filename: '01-flat-pouch.md' },
  '02-stand-pouch': { dir: 'products', filename: '02-stand-pouch.md' },
  '03-gazette-pouch': { dir: 'products', filename: '03-gazette-pouch.md' },
  '04-spout-pouch': { dir: 'products', filename: '04-spout-pouch.md' },
  '05-chojiu-bag': { dir: 'products', filename: '05-chojiu-bag.md' },
  '06-roll-film': { dir: 'products', filename: '06-roll-film.md' },
  '07-die-cut-package': { dir: 'products', filename: '07-die-cut-package.md' },
  '08-white-plate': { dir: 'products', filename: '08-white-plate.md' },
  '09-product-selection-guide': { dir: 'products', filename: '09-product-selection-guide.md' },
  '10-printing-guide': { dir: 'products', filename: '10-printing-guide.md' },
  '11-user-flows': { dir: 'general', filename: '11-user-flows.md' },
  '12-pricing-tips': { dir: 'general', filename: '12-pricing-tips.md' },
};

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

// =====================================================
// Cache for loaded knowledge files
// =====================================================

let knowledgeCache: Map<string, KnowledgeFile> | null = null;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Load a single knowledge file from disk
 */
function loadKnowledgeFile(fileId: string, config: KnowledgeFileConfig): KnowledgeFile | null {
  try {
    const dirPath = KNOWLEDGE_BASE_DIRS[config.dir];
    const filePath = join(dirPath, config.filename);

    if (!existsSync(filePath)) {
      console.warn(`Knowledge file not found: ${filePath}`);
      return null;
    }

    const content = readFileSync(filePath, 'utf-8');

    // Extract keywords from KEYWORD_MAPPING
    const keywords = Object.entries(KEYWORD_MAPPING)
      .filter(([_, fileIds]) => fileIds.includes(fileId))
      .map(([keyword]) => keyword);

    return {
      id: fileId,
      keywords,
      content,
    };
  } catch (error) {
    console.error(`Error loading knowledge file ${config.filename}:`, error);
    return null;
  }
}

/**
 * Load all knowledge files into cache
 */
function loadKnowledgeBase(): Map<string, KnowledgeFile> {
  if (knowledgeCache) {
    return knowledgeCache;
  }

  knowledgeCache = new Map();

  for (const [fileId, config] of Object.entries(KNOWLEDGE_FILES)) {
    const knowledgeFile = loadKnowledgeFile(fileId, config);
    if (knowledgeFile) {
      knowledgeCache.set(fileId, knowledgeFile);
    }
  }

  return knowledgeCache;
}

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

/**
 * Get relevant knowledge base content based on user query
 *
 * @param query - User's question/input
 * @returns Merged relevant knowledge content
 *
 * @example
 * ```ts
 * const knowledge = getRelevantKnowledge("スタンドパウチの特徴は？");
 * // Returns content from 02-stand-pouch.md
 * ```
 */
export function getRelevantKnowledge(query: string): string {
  // Initialize knowledge base
  const knowledgeBase = loadKnowledgeBase();

  // Extract keywords from query
  const keywords = extractKeywords(query);

  // Get relevant file IDs
  const relevantFileIds = getRelevantFileIds(keywords);

  // If no keywords found, return empty string (fallback to system prompt only)
  if (relevantFileIds.size === 0) {
    return '';
  }

  // Merge relevant file contents
  const mergedContent: string[] = [];

  Array.from(relevantFileIds).forEach((fileId) => {
    const knowledgeFile = knowledgeBase.get(fileId);
    if (knowledgeFile) {
      mergedContent.push(knowledgeFile.content);
    }
  });

  return mergedContent.join('\n\n---\n\n');
}

/**
 * Get all available knowledge as a single string
 * Useful for complete context when needed
 */
export function getAllKnowledge(): string {
  const knowledgeBase = loadKnowledgeBase();
  const allContent: string[] = [];

  Array.from(knowledgeBase.values()).forEach((knowledgeFile) => {
    allContent.push(knowledgeFile.content);
  });

  return allContent.join('\n\n---\n\n');
}

/**
 * Clear the knowledge base cache
 * Useful for testing or hot-reload scenarios
 */
export function clearKnowledgeCache(): void {
  knowledgeCache = null;
}

/**
 * Get statistics about the knowledge base
 */
export function getKnowledgeStats() {
  const knowledgeBase = loadKnowledgeBase();

  return {
    totalFiles: knowledgeBase.size,
    totalKeywords: Object.keys(KEYWORD_MAPPING).length,
    fileIds: Array.from(knowledgeBase.keys()),
  };
}
