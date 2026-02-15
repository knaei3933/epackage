/**
 * Authenticated Fetch Utility
 *
 * Attempt 52: localStorage-based authentication with Authorization headers
 * - Automatically adds Authorization header from localStorage tokens
 * - Works with Next.js 15/16 where HttpOnly cookies don't work
 * @version 2026-02-10-attempt52
 */

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch with automatic Authorization header
 * Reads tokens from localStorage and adds them to the request
 */
export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Clone headers to avoid mutating the original
  const headers = new Headers(fetchOptions.headers);

  // Add Authorization header if not skipping auth
  if (!skipAuth) {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('sb-access-token');

    if (accessToken) {
      // Parse the base64-encoded token data to extract the actual JWT
      try {
        const tokenData = JSON.parse(atob(accessToken));
        if (tokenData.access_token) {
          headers.set('Authorization', `Bearer ${tokenData.access_token}`);
          console.log('[authFetch] Added Authorization header for:', url);
        }
      } catch (e) {
        console.warn('[authFetch] Failed to parse access token:', e);
      }
    } else {
      console.log('[authFetch] No access token found in localStorage');
    }
  }

  // Make the fetch request with Authorization header
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  return response;
}

/**
 * Wrapper for authenticated GET requests
 */
export async function authGet(url: string, options: Omit<AuthFetchOptions, 'method'> = {}) {
  return authFetch(url, { ...options, method: 'GET' });
}

/**
 * Wrapper for authenticated POST requests
 */
export async function authPost(url: string, data?: any, options: Omit<AuthFetchOptions, 'method'> = {}) {
  const headers = new Headers(options.headers);
  if (data && typeof data === 'object' && !(data instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    return authFetch(url, {
      ...options,
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }
  return authFetch(url, { ...options, method: 'POST', body: data });
}

/**
 * Wrapper for authenticated PUT requests
 */
export async function authPut(url: string, data?: any, options: Omit<AuthFetchOptions, 'method'> = {}) {
  const headers = new Headers(options.headers);
  if (data && typeof data === 'object' && !(data instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    return authFetch(url, {
      ...options,
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }
  return authFetch(url, { ...options, method: 'PUT', body: data });
}

/**
 * Wrapper for authenticated DELETE requests
 */
export async function authDelete(url: string, options: Omit<AuthFetchOptions, 'method'> = {}) {
  return authFetch(url, { ...options, method: 'DELETE' });
}

/**
 * Check if user is authenticated (has valid token in localStorage)
 */
export function isAuthenticated(): boolean {
  const accessToken = localStorage.getItem('sb-access-token');
  if (!accessToken) return false;

  try {
    const tokenData = JSON.parse(atob(accessToken));
    // Check if token is not expired
    if (tokenData.expires_at) {
      return tokenData.expires_at * 1000 > Date.now();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  const accessToken = localStorage.getItem('sb-access-token');
  if (!accessToken) return null;

  try {
    const tokenData = JSON.parse(atob(accessToken));
    return tokenData.user;
  } catch {
    return null;
  }
}

/**
 * Clear auth tokens from localStorage
 */
export function clearAuth() {
  localStorage.removeItem('sb-access-token');
  localStorage.removeItem('sb-refresh-token');
  console.log('[authFetch] Cleared auth tokens from localStorage');
}
