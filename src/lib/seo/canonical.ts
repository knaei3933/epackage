/**
 * Canonical URL Utilities for SEO
 *
 * This module provides utilities for generating canonical URLs across the application.
 * Canonical URLs help prevent duplicate content issues and consolidate SEO signals.
 */

const SITE_URL = 'https://www.package-lab.com';

/**
 * Generates a canonical URL for a given path
 * @param path - The path (e.g., '/', '/about', '/products/item')
 * @returns Full canonical URL
 */
export function getCanonicalUrl(path: string = '/'): string {
  // Remove trailing slash except for root
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

  // Remove duplicate slashes
  const cleanPath = normalizedPath.replace(/\/+/g, '/');

  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generates canonical URLs with query parameters for paginated content
 * @param path - Base path
 * @param page - Page number
 * @returns Full canonical URL with page parameter
 */
export function getPaginatedCanonicalUrl(path: string, page: number): string {
  const canonicalPath = page > 1 ? `${path}?page=${page}` : path;
  return getCanonicalUrl(canonicalPath);
}

/**
 * Generates canonical URL for dynamic routes with parameters
 * @param basePath - Base path pattern
 * @param params - Route parameters
 * @returns Full canonical URL
 */
export function getDynamicCanonicalUrl(
  basePath: string,
  params: Record<string, string | number>
): string {
  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  const path = queryString ? `${basePath}?${queryString}` : basePath;
  return getCanonicalUrl(path);
}

/**
 * Metadata helper for Next.js metadata API
 * Use this in page.tsx files to set canonical URLs
 */
export interface CanonicalMetadata {
  alternates: {
    canonical: string;
  };
}

/**
 * Creates canonical metadata for a page
 * @param path - The current page path
 * @returns Metadata object with canonical URL
 */
export function createCanonicalMetadata(path: string = '/'): CanonicalMetadata {
  return {
    alternates: {
      canonical: getCanonicalUrl(path),
    },
  };
}

/**
 * Common canonical URLs for the site
 */
export const CANONICAL_URLS = {
  HOME: getCanonicalUrl('/'),
  ABOUT: getCanonicalUrl('/about'),
  SERVICE: getCanonicalUrl('/service'),
  CONTACT: getCanonicalUrl('/contact'),
  PRIVACY: getCanonicalUrl('/privacy'),
  TERMS: getCanonicalUrl('/terms'),
  SAMPLES: getCanonicalUrl('/samples'),
  FLOW: getCanonicalUrl('/flow'),
  PRINT: getCanonicalUrl('/print'),
  CART: getCanonicalUrl('/cart'),
  COMPARE: getCanonicalUrl('/compare'),
} as const;
