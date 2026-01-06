/**
 * Standardized API fetch wrapper with automatic credential handling
 *
 * Features:
 * - Automatic credentials: 'include' for cookie-based auth
 * - Default headers for Content-Type
 * - 401 redirect to signin
 * - Centralized error logging
 * - Typed methods for common HTTP verbs
 */

interface ApiFetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
  skipDefaultHeaders?: boolean;
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Core fetch wrapper with shared error handling and credential management
 */
async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const {
    skipAuthRedirect = false,
    skipDefaultHeaders = false,
    ...fetchOptions
  } = options;

  // Merge with default options
  const mergedOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
  };

  // Add default headers for non-GET requests unless skipped
  if (!skipDefaultHeaders && fetchOptions.method !== 'GET') {
    mergedOptions.headers = {
      ...DEFAULT_HEADERS,
      ...(fetchOptions.headers || {}),
    };
  }

  try {
    const response = await fetch(url, mergedOptions);

    // Handle 401 Unauthorized with automatic redirect
    if (response.status === 401 && !skipAuthRedirect) {
      console.warn('[API Fetch] Unauthorized request, redirecting to signin', {
        url,
        status: response.status,
      });

      // Preserve current URL for redirect after signin
      const currentPath = window.location.pathname + window.location.search;
      const signinUrl = `/auth/signin${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;

      window.location.href = signinUrl;
      throw new Error('Unauthorized - redirecting to signin');
    }

    // Handle 5xx server errors with logging
    if (response.status >= 500) {
      console.error('[API Fetch] Server error', {
        url,
        status: response.status,
        statusText: response.statusText,
        method: mergedOptions.method,
      });
    }

    // Handle 4xx client errors with logging
    if (response.status >= 400 && response.status < 500 && response.status !== 401) {
      console.warn('[API Fetch] Client error', {
        url,
        status: response.status,
        statusText: response.statusText,
        method: mergedOptions.method,
      });
    }

    return response;
  } catch (error) {
    // Log fetch errors (network issues, timeout, etc.)
    if (error instanceof Error && error.message !== 'Unauthorized - redirecting to signin') {
      console.error('[API Fetch] Request failed', {
        url,
        error: error.message,
        method: mergedOptions.method,
      });
    }
    throw error;
  }
}

/**
 * GET request with automatic credentials
 */
export async function apiGet(
  url: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request with automatic credentials and JSON body
 */
export async function apiPost(
  url: string,
  data?: unknown,
  options: ApiFetchOptions = {}
): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request with automatic credentials and JSON body
 */
export async function apiPut(
  url: string,
  data?: unknown,
  options: ApiFetchOptions = {}
): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request with automatic credentials and JSON body
 */
export async function apiPatch(
  url: string,
  data?: unknown,
  options: ApiFetchOptions = {}
): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request with automatic credentials
 */
export async function apiDelete(
  url: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * Helper function to parse JSON response with error handling
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error || response.statusText}`);
  }

  // Handle empty responses (e.g., 204 No Content)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Convenience methods that combine fetch + JSON parsing
 */
export async function getJson<T>(
  url: string,
  options?: ApiFetchOptions
): Promise<T> {
  const response = await apiGet(url, options);
  return parseResponse<T>(response);
}

export async function postJson<T>(
  url: string,
  data?: unknown,
  options?: ApiFetchOptions
): Promise<T> {
  const response = await apiPost(url, data, options);
  return parseResponse<T>(response);
}

export async function putJson<T>(
  url: string,
  data?: unknown,
  options?: ApiFetchOptions
): Promise<T> {
  const response = await apiPut(url, data, options);
  return parseResponse<T>(response);
}

export async function patchJson<T>(
  url: string,
  data?: unknown,
  options?: ApiFetchOptions
): Promise<T> {
  const response = await apiPatch(url, data, options);
  return parseResponse<T>(response);
}

export async function deleteJson<T>(
  url: string,
  options?: ApiFetchOptions
): Promise<T> {
  const response = await apiDelete(url, options);
  return parseResponse<T>(response);
}
