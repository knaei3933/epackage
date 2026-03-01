/**
 * Health Check API for LM Studio
 *
 * LM Studio用ヘルスチェックAPI
 * Checks if LM Studio service is available
 */

/**
 * GET /api/health
 * LM Studioサービスの稼働状態を確認
 */
export async function GET() {
  const baseURL = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';

  try {
    // LM Studioの/modelsエンドポイントを確認（5秒タイムアウト）
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
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'LM Studio is available',
          service: 'lmstudio',
          baseURL: baseURL,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'LM Studio returned an error',
          service: 'lmstudio',
          baseURL: baseURL,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);

    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const errorMessage = isTimeout
      ? 'LM Studio connection timeout'
      : error instanceof Error
        ? error.message
        : 'Unknown error';

    return new Response(
      JSON.stringify({
        status: 'error',
        message: errorMessage,
        service: 'lmstudio',
        baseURL: baseURL,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
