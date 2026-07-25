/**
 * Designer Task Access Tokens
 *
 * Provides token-based access to designer order pages without authentication.
 * Designers can access their assigned orders via secure tokens sent via email.
 *
 * Functions:
 * - generateTaskAccessToken(): Generate and store access token for designer_task_assignments
 * - getDesignerOrderAccessUrl(): Generate access URL for designer order page
 */

import { createClient } from '@/lib/supabase/server';
import { generateUploadToken, hashToken } from '@/lib/designer-tokens';
import { logger } from '@/lib/logger';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Generate and store access token for designer task assignment
 *
 * Creates a secure access token that allows designers to access their assigned
 * orders without requiring authentication. The token is stored as a hash in
 * the database for security.
 *
 * @param assignmentId - The designer_task_assignments record ID
 * @param expiryDays - Number of days until token expires (default: 30)
 * @returns Object containing raw token (for email) and metadata, or null if failed
 *
 * @example
 * ```ts
 * const result = await generateTaskAccessToken('assignment-123', 30);
 * if (result) {
 *   // Send result.rawToken in email
 *   const url = getDesignerOrderAccessUrl(result.rawToken);
 *   await sendDesignerEmail(designerEmail, url);
 * }
 * ```
 */
export async function generateTaskAccessToken(
  assignmentId: string,
  expiryDays: number = 30
): Promise<{
  rawToken: string;
  tokenPrefix: string;
  expiresAt: Date;
} | null> {
  try {
    const supabase = await createClient();

    // Generate secure token using existing token generation function
    const { rawToken, tokenHash, tokenPrefix, expiresAt } = generateUploadToken(expiryDays);

    // Store token hash in database
    const { error } = await supabase
      .from('designer_task_assignments')
      .update({
        access_token_hash: tokenHash,
        access_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', assignmentId);

    if (error) {
      console.error('[generateTaskAccessToken] Failed to store token:', error);
      return null;
    }

    return {
      rawToken,
      tokenPrefix,
      expiresAt,
    };
  } catch (error) {
    console.error('[generateTaskAccessToken] Error:', error);
    return null;
  }
}

/**
 * Validate access token and return assignment data
 *
 * Verifies a token by hashing it and comparing with stored hash.
 * Updates last_accessed_at timestamp on successful validation.
 *
 * @param token - The raw access token from URL
 * @returns Assignment data if valid, null otherwise
 *
 * @example
 * ```ts
 * const assignment = await validateTaskAccessToken(tokenFromUrl);
 * if (!assignment) {
 *   return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
 * }
 * ```
 */
export async function validateTaskAccessToken(
  token: string
): Promise<{
  id: string;
  designer_id: string;
  order_id: string;
  status: string;
} | null> {
  try {
    const supabase = await createClient();

    // Hash the provided token
    const tokenHash = hashToken(token);

    // Look up assignment by token hash
    const { data: assignment, error } = await supabase
      .from('designer_task_assignments')
      .select('id, designer_id, order_id, status, access_token_expires_at')
      .eq('access_token_hash', tokenHash)
      .single();

    if (error || !assignment) {
      console.error('[validateTaskAccessToken] Token not found:', error);
      return null;
    }

    // Check expiration
    const expiresAt = new Date(assignment.access_token_expires_at);
    if (new Date() > expiresAt) {
      console.warn('[validateTaskAccessToken] Token expired');
      return null;
    }

    // Update last_accessed_at
    await supabase
      .from('designer_task_assignments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', assignment.id);

    return {
      id: assignment.id,
      designer_id: assignment.designer_id,
      order_id: assignment.order_id,
      status: assignment.status,
    };
  } catch (error) {
    console.error('[validateTaskAccessToken] Error:', error);
    return null;
  }
}

/**
 * Generate access URL for designer order page
 *
 * Creates the full URL that designers will use to access their assigned orders.
 * This URL should be sent in emails to designers.
 *
 * @param token - The raw access token
 * @param baseUrl - Optional base URL (defaults to NEXT_PUBLIC_SITE_URL or current origin)
 * @returns Full URL to designer order page
 *
 * @example
 * ```ts
 * const url = getDesignerOrderAccessUrl(rawToken);
 * // Returns: https://example.com/designer-order/abc123xyz...
 * ```
 */
export function getDesignerOrderAccessUrl(
  token: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || '';
  return `${base}/designer-order/${token}`;
}

/**
 * Check if token exists and is valid for an assignment
 *
 * Utility function to check if an assignment has an active access token.
 *
 * @param assignmentId - The designer_task_assignments record ID
 * @returns Object with hasToken boolean and expiresAt date if token exists
 *
 * @example
 * ```ts
 * const { hasToken, expiresAt } = await checkTaskAccessToken('assignment-123');
 * if (hasToken && expiresAt && new Date() < expiresAt) {
 *   console.log('Token is still valid');
 * }
 * ```
 */
export async function checkTaskAccessToken(
  assignmentId: string
): Promise<{
  hasToken: boolean;
  expiresAt: Date | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('designer_task_assignments')
      .select('access_token_hash, access_token_expires_at')
      .eq('id', assignmentId)
      .single();

    if (error || !data) {
      return { hasToken: false, expiresAt: null };
    }

    return {
      hasToken: !!data.access_token_hash,
      expiresAt: data.access_token_expires_at ? new Date(data.access_token_expires_at) : null,
    };
  } catch (error) {
    console.error('[checkTaskAccessToken] Error:', error);
    return { hasToken: false, expiresAt: null };
  }
}

/**
 * Cancel a designer task assignment
 *
 * タスク割当をキャンセルし、アクセストークンを即時期限切れで無効化する。
 *
 * トークン無効化の方針（AC-6 到達不能分岐の解消）:
 * - `access_token_hash` は保持する（null 化しない）。
 * - 代わりに `access_token_expires_at` を NOW() に設定し、即時期限切れにする。
 * - 理由: hash を null 化すると designer-order page.tsx 側の
 *   `.eq('access_token_hash', tokenHash)` が該当行を返さなくなり、
 *   status='cancelled' の分岐（AC-6）に到達できなくなる。
 *   hash を保持しつつ expires で無効化すれば、期限切れ判定は
 *   validateTaskAccessToken 側で行われ、cancelled 分岐は到達可能となる。
 *
 * 冪等性（OQ-3）:
 * - `.in('status', ['pending', 'in_progress'])` でプレフィルタし、
 *   既に cancelled/completed の行は affected=0 となる。
 *   これにより二重キャンセルでも状態が変化せず、呼び出し元が
 *   status を SELECT して「既に cancelled」を 200 で返せるようになる。
 *
 * AC-2: `.select('id')` で影響行数を検証する。
 * PostgREST は該当行が 0 件でも error=null を返すため、
 * error チェックだけでは「該当行なし」を検知できない。
 *
 * @param assignmentId - The designer_task_assignments record ID
 * @param actor - キャンセルを実行した主体（監査ログ用）。memberUserId は member 直接キャンセル経路用
 * @param supabaseClient - 任意の Supabase クライアント（DI）。member 経路では service role を注入して RLS bypass。
 *                         未指定時は cookie ベースの createClient（admin/cancel route は既存通り）
 * @returns success=true で更新成功（新規キャンセル）、affectedRows に影響を受けた行数。
 *          success=false は「該当行なし」または「既に cancelled/completed」を示す。
 */
export async function cancelDesignerTask(
  assignmentId: string,
  actor: { source: string; adminUserId?: string; memberUserId?: string },
  supabaseClient?: SupabaseClient<Database>
): Promise<{ success: boolean; affectedRows: number }> {
  try {
    // DI: 外部から supabase クライアントを注入可能。
    // member 直接キャンセル経路では createServiceClient（service role・RLS bypass）を注入し、
    // designer_task_assignments の UPDATE が staff ポリシーのみで弾かれるのを回避する。
    // 未指定時は cookie ベースの createClient（admin/cancel route は既存通り staff ポリシーで検証）。
    const supabase = supabaseClient ?? await createClient();

    const { data, error } = await supabase
      .from('designer_task_assignments')
      .update({
        status: 'cancelled',
        // AC-6: hash は保持し、expires で即時無効化する（null 化しない）
        access_token_expires_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      // OQ-3: pending/in_progress のみ更新。既に cancelled/completed は affected=0。
      .in('status', ['pending', 'in_progress'])
      .select('id');

    if (error) {
      logger.error('designer_task.cancel_failed', { assignmentId, actor, error });
      return { success: false, affectedRows: 0 };
    }

    const affected = Array.isArray(data) ? data.length : 0;
    if (affected === 0) {
      return { success: false, affectedRows: 0 };
    }

    logger.info('designer_task.cancelled', {
      assignmentId,
      actor,
      timestamp: new Date().toISOString(),
    });

    return { success: true, affectedRows: affected };
  } catch (error) {
    logger.error('designer_task.cancel_error', { assignmentId, actor, error });
    return { success: false, affectedRows: 0 };
  }
}
