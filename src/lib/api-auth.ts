/**
 * API Authentication Middleware
 *
 * 統合認証ミドルウェアとハンドラーラッパー
 * 標準化された認証チェックを全APIルートで提供
 *
 * @module lib/api-auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, verifyMemberAuth, type AdminAuthResult } from './auth-helpers';
import type { UserRole, UserStatus } from '@/types/auth';

// =====================================================
// Types
// =====================================================

/**
 * 認証ミドルウェアオプション
 */
export interface AuthMiddlewareOptions {
  /** 管理者ロール必須 */
  requireAdmin?: boolean;
  /** 会員ロール必須 */
  requireMember?: boolean;
  /** アクティブ状態必須 */
  requireActive?: boolean;
  /** カスタムロールチェック */
  allowedRoles?: UserRole[];
  /** カスタムステータスチェック */
  allowedStatuses?: UserStatus[];
  /** 会員向け認証を使用するか（MEMBER/ADMIN/KOREAN_MEMBER/PRODUCTIONを許可） */
  useMemberAuth?: boolean;
}

/**
 * 認証済みリクエストコンテキスト
 */
export interface AuthenticatedRequest extends NextRequest {
  auth: AdminAuthResult;
}

/**
 * 認証ミドルウェア結果
 */
export type AuthMiddlewareResult = AdminAuthResult | NextResponse;

// =====================================================
// Authentication Middleware
// =====================================================

/**
 * 認証ミドルウェア作成
 *
 * APIルートで使用する認証ミドルウェアを動作生成
 *
 * @param options - 認証オプション
 * @returns 認証ミドルウェア関数
 *
 * @example
 * ```typescript
 * const adminOnlyMiddleware = createAuthMiddleware({
 *   requireAdmin: true,
 *   requireActive: true,
 * });
 *
 * export async function GET(request: NextRequest) {
 *   const authResult = await adminOnlyMiddleware(request);
 *   if (authResult instanceof NextResponse) return authResult;
 *
 *   // authResult.userId, authResult.role が使用可能
 * }
 * ```
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  return async (request: NextRequest): Promise<AuthMiddlewareResult> => {
    // 基本認証チェック - useMemberAuth オプションで切り替え
    const authResult = options.useMemberAuth
      ? await verifyMemberAuth(request)
      : await verifyAdminAuth(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 管理者ロール確認
    if (options.requireAdmin && authResult.role !== 'ADMIN') {
      console.warn('[Auth] Admin role required:', {
        userId: authResult.userId,
        role: authResult.role,
      });

      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    // 会員ロール確認
    if (options.requireMember && authResult.role !== 'MEMBER') {
      console.warn('[Auth] Member role required:', {
        userId: authResult.userId,
        role: authResult.role,
      });

      return NextResponse.json(
        { error: 'Member role required' },
        { status: 403 }
      );
    }

    // アクティブ状態確認
    if (options.requireActive && authResult.status !== 'ACTIVE') {
      console.warn('[Auth] Active status required:', {
        userId: authResult.userId,
        status: authResult.status,
      });

      return NextResponse.json(
        { error: 'Account not active' },
        { status: 403 }
      );
    }

    // カスタムロール確認
    if (options.allowedRoles && !options.allowedRoles.includes(authResult.role)) {
      console.warn('[Auth] Role not allowed:', {
        userId: authResult.userId,
        role: authResult.role,
        allowedRoles: options.allowedRoles,
      });

      return NextResponse.json(
        { error: 'Role not allowed' },
        { status: 403 }
      );
    }

    // カスタムステータス確認
    if (options.allowedStatuses && !options.allowedStatuses.includes(authResult.status)) {
      console.warn('[Auth] Status not allowed:', {
        userId: authResult.userId,
        status: authResult.status,
        allowedStatuses: options.allowedStatuses,
      });

      return NextResponse.json(
        { error: 'Account status not allowed' },
        { status: 403 }
      );
    }

    return authResult;
  };
}

// =====================================================
// Handler Wrappers
// =====================================================

/**
 * 認証付きAPIハンドラーラッパー
 *
 * APIハンドラー関数を自動認証でラップ
 *
 * @param handler - APIハンドラー関数
 * @param options - 認証オプション
 * @returns ラップされたハンドラー関数
 *
 * @example
 * ```typescript
 * // 使用前
 * export async function GET(request: NextRequest) {
 *   const authResult = await verifyAdminAuth(request);
 *   if (!authResult) return unauthorizedResponse();
 *   // ...
 * }
 *
 * // 使用後
 * export const GET = withAuth(async (request, auth) => {
 *   // auth.userId, auth.role が使用可能
 *   return NextResponse.json({ userId: auth.userId });
 * }, { requireAdmin: true });
 * ```
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, auth: AdminAuthResult) => Promise<NextResponse<T>>,
  options: AuthMiddlewareOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const middleware = createAuthMiddleware(options);
    const result = await middleware(request);

    // 認証失敗の場合、エラー応答を返す
    if (result instanceof NextResponse) {
      return result;
    }

    // 認証成功の場合、ハンドラーを実行
    try {
      return await handler(request, result as AdminAuthResult);
    } catch (error) {
      console.error('[Auth] Handler error:', error);

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * 管理者専用ハンドラーラッパー（ショートカット）
 *
 * Next.js 16対応：動的ルートパラメータを含むルートコンテキストをサポート
 *
 * @param handler - APIハンドラー関数
 * @returns ラップされたハンドラー関数
 *
 * @example
 * ```typescript
 * // 動的ルートなし
 * export const GET = withAdminAuth(async (request, auth) => {
 *   return NextResponse.json({ adminId: auth.userId });
 * });
 *
 * // 動的ルートあり (Next.js 16)
 * export const GET = withAdminAuth(async (request, auth, context) => {
 *   const { id } = await context.params;
 *   return NextResponse.json({ orderId: id });
 * });
 * ```
 */
export function withAdminAuth<T = any>(
  handler: (
    request: NextRequest,
    auth: AdminAuthResult,
    context?: { params: Promise<Record<string, string | string[]>> }
  ) => Promise<NextResponse<T>>
): (request: NextRequest, context?: { params: Promise<Record<string, string | string[]>> }) => Promise<NextResponse> {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string | string[]>> }): Promise<NextResponse> => {
    const middleware = createAuthMiddleware({
      requireAdmin: true,
      requireActive: true,
    });
    const result = await middleware(request);

    // 認証失敗の場合、エラー応答を返す
    if (result instanceof NextResponse) {
      return result;
    }

    // 認証成功の場合、ハンドラーを実行
    try {
      return await handler(request, result as AdminAuthResult, context);
    } catch (error) {
      console.error('[Auth] Handler error:', error);

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * 会員専用ハンドラーラッパー（ショートカット）
 *
 * @param handler - APIハンドラー関数
 * @returns ラップされたハンドラー関数
 *
 * @example
 * ```typescript
 * export const GET = withMemberAuth(async (request, auth) => {
 *   return NextResponse.json({ memberId: auth.userId });
 * });
 * ```
 */
export function withMemberAuth<T = any>(
  handler: (request: NextRequest, auth: AdminAuthResult) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse> {
  return withAuth(handler, {
    useMemberAuth: true,
    requireActive: true,
  });
}

// =====================================================
// Response Helpers
// =====================================================

/**
 * 未認証応答生成
 */
export function unauthorizedResponse(message = 'Authentication required'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * 権限なし応答生成
 */
export function forbiddenResponse(message = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * 認証エラー応答生成
 */
export function authErrorResponse(error: 'unauthorized' | 'forbidden', message?: string): NextResponse {
  if (error === 'unauthorized') {
    return unauthorizedResponse(message);
  }
  return forbiddenResponse(message);
}

// =====================================================
// Role Utilities
// =====================================================

/**
 * ユーザーが指定されたロールを持っているか確認
 *
 * @param auth - 認証結果
 * @param roles - 許可されたロール配列
 * @returns ロールが許可されている場合true
 */
export function hasRole(auth: AdminAuthResult, roles: UserRole[]): boolean {
  return roles.includes(auth.role);
}

/**
 * ユーザーが管理者か確認
 *
 * @param auth - 認証結果
 * @returns 管理者の場合true
 */
export function isAdmin(auth: AdminAuthResult): boolean {
  return auth.role?.toLowerCase() === 'admin';
}

/**
 * ユーザーが会員か確認
 *
 * @param auth - 認証結果
 * @returns 会員の場合true
 */
export function isMember(auth: AdminAuthResult): boolean {
  return auth.role?.toLowerCase() === 'member';
}

/**
 * ユーザーがアクティブか確認
 *
 * @param auth - 認証結果
 * @returns アクティブの場合true
 */
export function isActive(auth: AdminAuthResult): boolean {
  return auth.status === 'ACTIVE';
}

// =====================================================
// Middleware Combinations
// =====================================================

/**
 * 認証とロール確認ミドルウェア（管理者のみ）
 */
export const adminAuthMiddleware = createAuthMiddleware({
  requireAdmin: true,
  requireActive: true,
});

/**
 * 認証とロール確認ミドルウェア（会員のみ）
 */
export const memberAuthMiddleware = createAuthMiddleware({
  requireMember: true,
  requireActive: true,
});

/**
 * 認証ミドルウェア（管理者または会員）
 */
export const anyAuthMiddleware = createAuthMiddleware({
  requireActive: true,
});

// =====================================================
// Export for Testing
// =====================================================

/**
 * テスト用: モック認証結果を作成
 *
 * @internal テスト用のみ使用
 */
export function _createMockAuthResult(overrides: Partial<AdminAuthResult> = {}): AdminAuthResult {
  return {
    userId: overrides.userId || '00000000-0000-0000-0000-000000000000',
    role: overrides.role || 'ADMIN',
    status: overrides.status || 'ACTIVE',
  };
}

/**
 * テスト用: モック認証ミドルウェアを作成
 *
 * @internal テスト用のみ使用
 */
export function _createMockAuthMiddleware(
  mockAuth: AdminAuthResult | null
): (request: NextRequest) => Promise<AuthMiddlewareResult> {
  return async () => {
    if (mockAuth) {
      return mockAuth;
    }
    return NextResponse.json(
      { error: 'Mock authentication failed' },
      { status: 401 }
    );
  };
}
