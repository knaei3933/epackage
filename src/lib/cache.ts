// 메모리 기반 캐시 유틸리티
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;
  private cleanupInterval: number;

  constructor(maxSize = 100, cleanupInterval = 60000) {
    this.maxSize = maxSize;
    this.cleanupInterval = cleanupInterval;

    // 주기적으로 만료된 항목 정리
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  set<T>(key: string, data: T, ttl = 300000): void { // 기본 TTL: 5분
    // 최대 크기 초과 시 가장 오래된 항목 제거
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

    // TTL 만료 확인
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

    // TTL 만료 확인
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    this.cleanup(); // 만료된 항목 정리 후 크기 반환
    return this.cache.size;
  }

  // 만료된 항목 정리
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 통계
  getStats(): { size: number; hitRate: number } {
    // Note: 실제 hit rate 계산을 위해 추가 구현 필요
    return {
      size: this.size(),
      hitRate: 0, // 추후 구현
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

// PDF 생성 관련 타입 정의
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

// PDF 생성 캐시 키 생성
export function generatePDFCacheKey(params: {
  quotationData: QuotationData;
  results: ResultData[];
  comparison: ComparisonData;
}): string {
  return `pdf:${btoa(JSON.stringify(params))}`;
}

// API 응답 캐싱 데코레이터
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl = 300000
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    // 캐시에서 데이터 확인
    const cached = memoryCache.get(key);
    if (cached) {
      return cached;
    }

    // 함수 실행 및 결과 캐싱
    const result = await fn(...args);
    memoryCache.set(key, result, ttl);

    return result;
  }) as T;
}

// 디바운스 유틸리티
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

// 스로틀 유틸리티
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

// 재시도 유틸리티
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

      // 지수 백오프로 대기
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
    }
  }

  throw lastError!;
}