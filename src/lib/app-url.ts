/**
 * Dynamic URL Generator for Email & OAuth Links
 *
 * ローカルと本番環境の両方で正しく動作するURLを生成します
 */

/**
 * リクエストから動的にアプリケーションのベースURLを取得
 *
 * @param request - NextRequest オブジェクト
 * @returns アプリケーションのベースURL（例: http://localhost:3000 或いは https://package-lab.com）
 */
export function getAppUrlFromRequest(request: Request): string {
  const url = new URL(request.url);
  const protocol = url.protocol; // http: 或いは https:
  const host = url.host;         // localhost:3000 或いは package-lab.com

  return `${protocol}//${host}`;
}

/**
 * 環境変数またはリクエストからアプリケーションURLを取得
 *
 * 優先順位:
 * 1. NEXT_PUBLIC_SITE_URL 環境変数（本番環境用）
 * 2. リクエストから動的に取得
 * 3. NEXT_PUBLIC_APP_URL 環境変数
 * 4. デフォルト値
 *
 * @param request - NextRequest オブジェクト（オプション）
 * @returns アプリケーションのベースURL
 */
export function getAppUrl(request?: Request): string {
  // 本番環境用の環境変数を最優先
  // 管理者がローカルからAPIを呼び出す場合でも正しい本番URLを返す
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl;
  }

  // リクエストがある場合は動的に取得
  if (request) {
    return getAppUrlFromRequest(request);
  }

  // フォールバック
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://package-lab.com'
  );
}

/**
 * 特定のパスを持つ完全なURLを生成
 *
 * @param path - パス（例: /auth/reset-password）
 * @param request - NextRequest オブジェクト（オプション）
 * @returns 完全なURL
 */
export function buildUrl(path: string, request?: Request): string {
  const baseUrl = getAppUrl(request);
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * クエリパラメータを含むURLを生成
 *
 * @param path - パス
 * @param params - クエリパラメータ
 * @param request - NextRequest オブジェクト（オプション）
 * @returns 完全なURL
 */
export function buildUrlWithParams(
  path: string,
  params: Record<string, string | number | boolean>,
  request?: Request
): string {
  const baseUrl = getAppUrl(request);
  const url = new URL(path, baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}
