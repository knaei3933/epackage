// メモリベースキャッシュユーティリティ
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存時間（ミリ秒）
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;
  private cleanupInterval: number;

  constructor(maxSize = 100, cleanupInterval = 60000) {
    this.maxSize = maxSize;
    this.cleanupInterval = cleanupInterval;

    // 定期的に期限切れ項目整理
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  set<T>(key: string, data: T, ttl = 300000): void { // デフォルトTTL: 5分
    // 最大サイズ超過時最古項目削除
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // TTL期限切れ確認
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // TTL期限切れ確認
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    this.cleanup(); // 期限切れ項目整理後サイズ返却
    return this.cache.size;
  }

  // 期限切れ項目整理
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // キャッシュ統計
  getStats(): { size: number; hitRate: number } {
    // Note: 実際のヒット率計算には追加実装が必要
    return {
      size: this.size(),
      hitRate: 0, // 今後実装
    };
  }
}

// グローバルキャッシュインスタンス
export const memoryCache = new MemoryCache(50, 30000); // 最大50項目、30秒ごとに整理

// 見積計算キャッシュキー生成
export function generateQuotationCacheKey(params: {
  orderType: string;
  contentsType: string;
  bagType: string;
  width: number;
  height: number;
  materialGenre: string;
  surfaceMaterial: string;
  materialComposition: string;
  quantities: number[];
}): string {
  const sortedQuantities = [...params.quantities].sort((a, b) => a - b);
  const keyData = {
    ...params,
    quantities: sortedQuantities,
  };

  return `quotation:${btoa(JSON.stringify(keyData))}`;
}

// PDF生成関連タイプ定義
interface QuotationData {
  orderType: string;
  contentsType: string;
  bagType: string;
  width: number;
  height: number;
  materialGenre: string;
  surfaceMaterial: string;
  materialComposition: string;
  quantities: number[];
  deliveryDate?: string;
}

interface ResultData {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountFactor?: number;
  deliveryTime?: number;
}

interface ComparisonData {
  bestQuantity: number;
  bestUnitPrice: number;
  economyRate: number;
  recommendations: string[];
}

// PDF生成キャッシュキー生成
export function generatePDFCacheKey(params: {
  quotationData: QuotationData;
  results: ResultData[];
  comparison: ComparisonData;
}): string {
  return `pdf:${btoa(JSON.stringify(params))}`;
}

// API応答キャッシングデコレーター
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl = 300000
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    // キャッシュからデータ確認
    const cached = memoryCache.get(key);
    if (cached) {
      return cached;
    }

    // 関数実行及び結果キャッシング
    const result = await fn(...args);
    memoryCache.set(key, result, ttl);

    return result;
  }) as T;
}

// デバウンスユーティリティ
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// スロットルユーティリティ
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 再試行ユーティリティ
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // 指数バックオフで待機
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
    }
  }

  throw lastError!;
}