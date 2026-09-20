/**
 * Health Check API for Hermes / LM Studio
 *
 * Hermes mode uses the same authenticated serving preflight as chat requests.
 */

import {
  isHermesPreflightFailure,
  preflightHermesConnection,
} from '@/lib/ai/providers';

const createJsonResponse = (
  payload: Record<string, string>,
  cacheControl?: string,
  status = 200,
) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(cacheControl ? { 'Cache-Control': cacheControl } : {}),
    },
  });

const getLMStudioHealth = async () => {
  const baseURL = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${baseURL}/models`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return createJsonResponse(
        {
          status: 'ok',
          message: 'LM Studio is available',
          service: 'lmstudio',
        },
        'no-store',
      );
    }

    return createJsonResponse(
      {
          status: 'offline',
          message: 'LM Studio returned an error',
          service: 'lmstudio',
      },
      'no-store',
    );
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const errorMessage = isTimeout
      ? 'LM Studio connection timeout'
      : 'LM Studio is unavailable';

    return createJsonResponse(
      {
        status: 'offline',
        message: errorMessage,
        service: 'lmstudio',
      },
      'no-store',
    );
  }
};

export async function GET() {
  if (process.env.CHAT_PROVIDER === 'hermes') {
    const preflight = await preflightHermesConnection();

    if (isHermesPreflightFailure(preflight)) {
      return createJsonResponse(
        {
          status: 'degraded',
          service: 'hermes',
          reasonCode: preflight.reasonCode,
        },
        'no-store',
        503,
      );
    }

    return createJsonResponse(
      {
        status: 'ok',
        service: 'hermes',
        reasonCode: 'hermes_available',
      },
      'no-store',
    );
  }

  return getLMStudioHealth();
}
