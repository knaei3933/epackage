/**
 * Designer Authentication Helper
 *
 * デザイナー認証ヘルパー
 *
 * Supports dual authentication:
 * 1. Middleware-based auth (x-user-id header)
 * 2. Token-based auth (from URL parameter or header)
 *
 * 二段階認証をサポート:
 * 1. ミドルウェアベース認証 (x-user-id ヘッダー)
 * 2. トークンベース認証 (URL パラメーターまたはヘッダー)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken, isTokenExpired } from './designer-tokens';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =====================================================
// Types
// =====================================================

export interface DesignerAuthResult {
  success: boolean;
  designerId?: string;
  orderId?: string;
  assignmentId?: string;
  authType: 'middleware' | 'token' | 'none';
  error?: string;
  errorKo?: string;
}

// =====================================================
// Main Auth Function
// =====================================================

/**
 * Get authenticated designer from middleware headers OR token parameter
 *
 * ミドルウェアヘッダーまたはトークンパラメーターから認証済みデザイナーを取得
 *
 * @param request - Next.js request object
 * @param orderId - Order ID from route params
 * @param token - Optional token from URL parameter or body
 * @returns Authentication result with designer info or error
 */
export async function getAuthenticatedDesignerOrToken(
  request: NextRequest,
  orderId: string,
  token?: string
): Promise<DesignerAuthResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Method 1: Check middleware-based auth (x-user-id header)
  // 方法 1: ミドルウェアベース認証を確認 (x-user-id ヘッダー)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const roleFromMiddleware = request.headers.get('x-user-role');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && roleFromMiddleware === 'KOREA_DESIGNER' && isFromMiddleware) {
    // Verify assignment exists
    // アサインメントが存在するか確認
    const { data: assignment, error } = await supabase
      .from('designer_task_assignments')
      .select('id, order_id, designer_id')
      .eq('designer_id', userIdFromMiddleware)
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        authType: 'none',
        error: 'Database error checking assignment',
        errorKo: 'アサインメント確認中にデータベースエラーが発生しました',
      };
    }

    if (assignment) {
      return {
        success: true,
        designerId: userIdFromMiddleware,
        orderId: assignment.order_id,
        assignmentId: assignment.id,
        authType: 'middleware',
      };
    }

    // Designer not assigned to this order
    // デザイナーはこの注文にアサインされていません
    return {
      success: false,
      authType: 'none',
      error: 'You are not assigned to this order',
      errorKo: '이 주문에 할당되지 않았습니다',
    };
  }

  // Method 2: Token-based auth
  // 方法 2: トークンベース認証
  if (token) {
    // Validate token format (/^[A-Za-z0-9_-]{43}$/)
    // トークン形式をバリデーション
    const tokenFormatValid = /^[A-Za-z0-9_-]{43}$/.test(token);
    if (!tokenFormatValid) {
      return {
        success: false,
        authType: 'none',
        error: 'Invalid token format',
        errorKo: '토큰 형식이 올바르지 않습니다',
      };
    }

    const tokenHash = hashToken(token);

    // Look up assignment by token hash
    // トークンハッシュでアサインメントを検索
    const { data: assignment, error } = await supabase
      .from('designer_task_assignments')
      .select('id, order_id, designer_id, access_token_expires_at')
      .eq('access_token_hash', tokenHash)
      .eq('order_id', orderId)
      .maybeSingle();

    if (error || !assignment) {
      return {
        success: false,
        authType: 'none',
        error: 'Invalid token',
        errorKo: '유효하지 않은 토큰입니다',
      };
    }

    // Check expiration
    // 有効期限を確認
    if (isTokenExpired(new Date(assignment.access_token_expires_at))) {
      return {
        success: false,
        authType: 'none',
        error: 'Token expired',
        errorKo: '토큰이 만료되었습니다',
      };
    }

    // Update last_accessed_at on successful token auth
    // トークン認証成功時に last_accessed_at を更新
    const { error: updateError } = await supabase
      .from('designer_task_assignments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', assignment.id);

    if (updateError) {
      console.error('[DesignerAuth] Failed to update last_accessed_at:', updateError);
      // Non-fatal error - continue with auth
      // 致命的ではないエラー - 認証を継続
    }

    return {
      success: true,
      designerId: assignment.designer_id,
      orderId: assignment.order_id,
      assignmentId: assignment.id,
      authType: 'token',
    };
  }

  // No valid auth method
  // 有効な認証方法がありません
  return {
    success: false,
    authType: 'none',
    error: 'Authentication required',
    errorKo: '인증이 필요합니다',
  };
}

/**
 * Extract token from request (query param, header, or body)
 *
 * リクエストからトークンを抽出 (クエリパラメータ、ヘッダー、またはボディ)
 *
 * @param request - Next.js request object
 * @returns Token string or undefined
 */
export function extractTokenFromRequest(request: NextRequest): string | undefined {
  // Try query parameter first
  // まずクエリパラメータを試す
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('token');
  if (tokenFromQuery) {
    return tokenFromQuery;
  }

  // Try authorization header (Bearer token)
  // 認証ヘッダーを試す (Bearer トークン)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try x-access-token header
  // x-access-token ヘッダーを試す
  const tokenHeader = request.headers.get('x-access-token');
  if (tokenHeader) {
    return tokenHeader;
  }

  return undefined;
}
