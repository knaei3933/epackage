/**
 * Designer Upload Tokens
 *
 * designer_upload_tokens テーブルのアクセストークンを管理する。
 * 現状は生成時に 30 日の有効期限を設定するのみで、
 * 期限切れを待たずに即時無効化する経路が存在しなかった。
 * そのため task 側 (designer_task_assignments) の cancelDesignerTask と
 * 対称な revokeUploadToken を提供し、管理者による即時無効化を可能にする。
 *
 * Functions:
 * - revokeUploadToken(): designer_upload_tokens の status を revoked に更新
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * アップロードトークンを即時無効化する
 *
 * designer_upload_tokens テーブルの status を revoked に更新し、
 * 期限切れ (30 日) を待たずにトークンを無効化する。
 * task 側の cancelDesignerTask と同一パターンで、
 * 監査ログは当関数内で出力する。
 *
 * AC-2: `.select('id')` で影響行数を検証する。
 * PostgREST は該当行が 0 件でも error=null を返すため、
 * error チェックだけでは「該当行なし」を検知できない。
 *
 * @param tokenId - designer_upload_tokens レコードの ID
 * @param actor - 無効化を実行した主体（監査ログ用）
 * @returns success=true で更新成功、affectedRows に影響を受けた行数
 */
export async function revokeUploadToken(
  tokenId: string,
  actor: { source: string; adminUserId?: string }
): Promise<{ success: boolean; affectedRows: number }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('designer_upload_tokens')
      .update({ status: 'revoked' })
      .eq('id', tokenId)
      .select('id');

    if (error) {
      logger.error('designer_upload_token.revoke_failed', { tokenId, actor, error });
      return { success: false, affectedRows: 0 };
    }

    const affected = Array.isArray(data) ? data.length : 0;
    if (affected === 0) {
      return { success: false, affectedRows: 0 };
    }

    logger.info('designer_upload_token.revoked', {
      tokenId,
      actor,
      timestamp: new Date().toISOString(),
    });

    return { success: true, affectedRows: affected };
  } catch (error) {
    logger.error('designer_upload_token.revoke_failed', { tokenId, actor, error });
    return { success: false, affectedRows: 0 };
  }
}
