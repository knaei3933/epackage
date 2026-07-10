/**
 * CSRF Protection
 */

import type { NextRequest } from 'next/server';
import { ALLOWED_ORIGINS, CSRF_PROTECTED_API_PATHS, CSRF_EXEMPT_API_PATHS } from './config';

// Helper: Validate Origin Header for CSRF Protection
// =====================================================

export function isValidOrigin(origin: string | null): boolean {
  if (!origin) {
    return false; // Originヘッダーがない場合は拒否
  }

  // 許可されたオリジンリストと比較
  return ALLOWED_ORIGINS.some(allowed => {
    // 完全一致または同じドメインのサブパス
    return origin === allowed || origin.startsWith(allowed);
  });
}

export function isCSRFProtectedPath(pathname: string): boolean {
  // 除外パス確認
  if (CSRF_EXEMPT_API_PATHS.some(exempt => pathname.startsWith(exempt))) {
    return false;
  }

  // 保護されたAPIパス確認
  return CSRF_PROTECTED_API_PATHS.some((path) =>
    pathname.startsWith(path)
  );
}

export function validateCSRFRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const { pathname } = request.nextUrl;

  // APIパスでない場合はCSRF検証をスキップ
  if (!pathname.startsWith('/api')) {
    return { valid: true };
  }

  // CSRF保護が不要なAPIパス
  if (!isCSRFProtectedPath(pathname)) {
    return { valid: true };
  }

  // GET, HEAD, OPTIONSリクエストはCSRF脆弱性なし
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { valid: true };
  }

  // POST, PUT, DELETE, PATCHリクエストについて検証
  // Originヘッダー確認 (最も信頼できる方法)
  if (origin) {
    if (!isValidOrigin(origin)) {
      return {
        valid: false,
        reason: `Invalid Origin header: ${origin}. Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`
      };
    }
    return { valid: true };
  }

  // Originがない場合 (同じサイトリクエストの可能性)
  // Refererヘッダーでフォールバック
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;

      if (!isValidOrigin(refererOrigin)) {
        return {
          valid: false,
          reason: `Invalid Referer header: ${referer}`
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        reason: 'Invalid Referer header format'
      };
    }
  }

  // OriginとRefererの両方がないリクエストを拒否
  // (ただし、開発環境では許可可能)
  if (process.env.NODE_ENV === 'development') {
    // 開発環境では警告のみ出力して許可
    console.warn('CSRF: Request without Origin or Referer header in development mode');
    return { valid: true };
  }

  return {
    valid: false,
    reason: 'Missing Origin and Referer headers'
  };
}

