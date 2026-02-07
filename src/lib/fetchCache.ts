/**
 * Fetch Cache Utilities
 *
 * Next.js 16 fetch 캐싱 전략 구현
 * unstable_cache를 사용한 데이터 페칭 최적화
 *
 * @module lib/fetchCache
 */

import { unstable_cache } from 'next/cache';

// =====================================================
// Cache Configuration
// =====================================================

export interface CacheOptions {
  revalidate?: number;
  tags?: string[];
}

// Default cache durations (in seconds)
export const CACHE_DURATIONS = {
  // SHORT: 5 minutes - 자주 변경되는 데이터
  SHORT: 300,
  // MEDIUM: 1 hour - 중간 정도로 변경되는 데이터
  MEDIUM: 3600,
  // LONG: 1 day - 드물게 변경되지 않는 데이터
  LONG: 86400,
} as const;

// =====================================================
// Cache Tags
// =====================================================

export const CACHE_TAGS = {
  // Products
  PRODUCTS_ALL: 'products:all',
  PRODUCTS_FEATURED: 'products:featured',
  PRODUCTS_BY_CATEGORY: (category: string) => `products:category:${category}`,
  PRODUCT_BY_SLUG: (slug: string) => `product:${slug}`,

  // Content
  ANNOUNCEMENTS: 'announcements',
  INDUSTRY_PAGES: 'industry:pages',

  // User data (short cache due to frequent updates)
  USER_STATS: 'user:stats',
} as const;

// =====================================================
// Cached Fetch Wrappers
// =====================================================

/**
 * 캐시된 fetch 래퍼 생성
 * 데이터 페칭을 위한 안전한 캐싱 래퍼
 */
export function createCachedFetch<T>(
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): () => Promise<T> {
  const { revalidate = CACHE_DURATIONS.MEDIUM, tags = [] } = options;

  return unstable_cache(fetchFn, {
    revalidate,
    tags,
  });
}

/**
 * 제품 데이터 캐시 fetch
 */
export async function getCachedProducts(
  category?: string,
  options: CacheOptions = {}
): Promise<T[]> {
  const fetchFn = async () => {
    // 실제 Supabase fetch 로직
    const { data } = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
      next: { revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM },
    }).then(res => res.json());

    return data || [];
  };

  const cached = createCachedFetch(fetchFn, {
    revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
    tags: [
      ...(category ? [CACHE_TAGS.PRODUCTS_BY_CATEGORY(category)] : []),
      ...(options.tags || []),
    ],
  });

  return cached();
}

/**
 * 인기 제품 캐시 fetch
 */
export async function getCachedFeaturedProducts(
  limit = 6,
  options: CacheOptions = {}
): Promise<T[]> {
  const fetchFn = async () => {
    const { data } = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/products`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: true, limit }),
        next: { revalidate: options.revalidate || CACHE_DURATIONS.SHORT },
      }
    ).then(res => res.json());

    return data || [];
  };

  const cached = createCachedFetch(fetchFn, {
    revalidate: options.revalidate || CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.PRODUCTS_FEATURED, ...(options.tags || [])],
  });

  return cached();
}

/**
 * 공지사항 캐시 fetch
 */
export async function getCachedAnnouncements(
  limit = 5,
  options: CacheOptions = {}
): Promise<T[]> {
  const fetchFn = async () => {
    const { data } = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/announcements`,
      {
        next: { revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM },
      }
    ).then(res => res.json());

    return data || [];
  };

  const cached = createCachedFetch(fetchFn, {
    revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.ANNOUNCEMENTS, ...(options.tags || [])],
  });

  return cached();
}

/**
 * 대시보드 통계 캐시 fetch
 */
export async function getCachedDashboardStats(
  userId: string,
  options: CacheOptions = {}
): Promise<T> {
  const fetchFn = async () => {
    const { data } = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/member/dashboard/stats`,
      {
        next: { revalidate: options.revalidate || CACHE_DURATIONS.SHORT },
        headers: {
          // 인증 헤더 필요시 추가
          'x-user-id': userId,
        },
      }
    ).then(res => res.json());

    return data;
  };

  const cached = createCachedFetch(fetchFn, {
    revalidate: options.revalidate || CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.USER_STATS, ...(options.tags || [])],
  });

  return cached();
}

// =====================================================
// Cache Revalidation Utilities
// =====================================================

/**
 * 태그 기반 캐시 무효화 (revalidation)
 * Server Actions나 API Routes에서 사용
 */
export async function revalidateTags(tags: string[]): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    });
  } catch (error) {
    console.error('[revalidateTags] Error:', error);
  }
}

/**
 * 제품 관련 캐시 무효화
 */
export async function revalidateProducts(category?: string): Promise<void> {
  const tags = category
    ? [CACHE_TAGS.PRODUCTS_BY_CATEGORY(category)]
    : [CACHE_TAGS.PRODUCTS_ALL];

  await revalidateTags(tags);
}

/**
 * 사용자 통계 캐시 무효화
 */
export async function revalidateUserStats(): Promise<void> {
  await revalidateTags([CACHE_TAGS.USER_STATS]);
}

// =====================================================
// Export for use in Server Components
// =====================================================

export const cacheUtils = {
  createCachedFetch,
  getCachedProducts,
  getCachedFeaturedProducts,
  getCachedAnnouncements,
  getCachedDashboardStats,
  revalidateTags,
  revalidateProducts,
  revalidateUserStats,
} as const;
