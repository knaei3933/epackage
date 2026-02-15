/**
 * Authenticated Fetcher for Client-Side API Calls
 *
 * 認証付きフェッチャー - クライアント側からのAPI呼び出し用
 * Falls back to cookie-based auth if token fetch fails
 */

/**
 * Simple fetcher that uses credentials: 'include'
 * This is the most reliable method for same-origin requests with httpOnly cookies
 */
export const authFetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Don't throw error - let SWR handle the error state
    // This prevents infinite retry loops
    const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(errorData.error || 'API request failed');
  }

  return response.json();
};

/**
 * Authenticated fetch function for manual API calls
 */
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  return response;
};
