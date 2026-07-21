/**
 * OrderInquirySection
 *
 * 注文詳細ページ（/member/orders/[id]）に埋め込む「この注文についてのチャット」セクション。
 *
 * 機能（spec order-inquiry-link / AC-UI-M-1〜5）:
 * - 1注文=1スレッド（部分UNIQUE索引でデータ制約により保証）
 * - 初回（スレッド未存在）: 本文フォーム + 添付（画像/PDF/デザインデータ・100MB）
 *   → POST /api/member/inquiries へ orderId 付きで送信（type='order' 強制・件名はサーバー側で自動生成）
 * - 2回目以降（スレッド存在）: 折りたたみ表示（件名 + 初回メッセージ概要）・クリックで全メッセージ展開
 * - 409 Conflict 受領時（既存スレッドが race condition で作成されていた場合）:
 *   existingInquiryId を使って既存スレッドを再取得 → 折りたたみ表示に切替（AC-API-2 UI 側）
 *
 * 注文番号（orderNumber）は親（page.tsx）から受け取り、UI 表示にのみ使用。
 * サーバー側での件名自動生成は API が担当（クライアントはorderId を送るだけ）。
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui';
import { Loader2, MessageSquare, ChevronDown, AlertCircle, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Inquiry, InquiryStatus } from '@/types/dashboard';
import {
  fetchInquiries,
  fetchInquiry,
} from '@/lib/api/member/inquiries';
import { InquiryCreateForm } from '@/components/inquiries/InquiryCreateForm';
import { InquiryThread } from '@/components/inquiries/InquiryThread';

// =====================================================
// Constants
// =====================================================

/**
 * 折りたたみ表示のとき件名の隣に出すステータスバッジのラベル（簡易版・InquiriesClient の詳細版と統一感を持たせる）
 * resolved/closed は「解決済」・それ以外は「対応中」相当で表示。
 */
function statusBadgeLabel(status: InquiryStatus): { label: string; tone: string } {
  switch (status) {
    case 'resolved':
    case 'closed':
      return { label: '解決済', tone: 'text-green-700 dark:text-green-400' };
    case 'responded':
      return { label: '返信済', tone: 'text-blue-700 dark:text-blue-400' };
    case 'in_progress':
      return { label: '対応中', tone: 'text-indigo-700 dark:text-indigo-400' };
    case 'pending':
      return { label: '保留中', tone: 'text-gray-700 dark:text-gray-300' };
    case 'open':
    default:
      return { label: '未対応', tone: 'text-yellow-800 dark:text-yellow-400' };
  }
}

// =====================================================
// Component
// =====================================================

export interface OrderInquirySectionProps {
  /** 注文 id（POST 時の orderId・既存スレッド検索のキー） */
  orderId: string;
  /** 注文番号（UI 表示用・サーバー側の件名自動生成にも使用される） */
  orderNumber: string;
}

export function OrderInquirySection({ orderId, orderNumber }: OrderInquirySectionProps) {
  // 既存スレッドの有無・状態
  const [existingInquiry, setExistingInquiry] = useState<Inquiry | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // スレッド折りたたみ状態（スレッド存在時のみ意味を持つ・デフォルト=折りたたみ）
  const [isExpanded, setIsExpanded] = useState(false);

  // -------------------------------------------------
  // 初回マウント: この注文の既存スレッドを検索
  // GET /api/member/inquiries から全件取得 → orderId でフィルタ（1注文=1スレッドなので最大1件）
  // -------------------------------------------------
  const loadExistingInquiry = useCallback(async () => {
    setIsInitialLoading(true);
    setLoadError(null);
    try {
      const all = await fetchInquiries();
      // orderId が一致するスレッドを抽出（order_id が null の一般 inquiry は除外）
      // API レスポンスの orderId は null or string（型は optional だが実態は null 含む）
      const found = all.find((inq) => inq.orderId && inq.orderId === orderId) ?? null;
      setExistingInquiry(found);
    } catch (err) {
      // 初期ロード失敗時はフォームを表示して継続（チャット機能は死なせない）
      console.error('[OrderInquirySection] failed to load existing inquiry:', err);
      setLoadError(
        err instanceof Error ? err.message : 'お問い合わせ状況の取得に失敗しました'
      );
      setExistingInquiry(null);
    } finally {
      setIsInitialLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadExistingInquiry();
  }, [loadExistingInquiry]);

  // -------------------------------------------------
  // InquiryCreateForm のコールバック
  // -------------------------------------------------

  // 作成成功: スレッド表示へ切替
  const handleCreated = useCallback((created: Inquiry) => {
    setExistingInquiry(created);
    setIsExpanded(true); // 作成直後は展開して内容を確認できるようにする
  }, []);

  // 409 Conflict（既存スレッドが race condition で作成されていた場合）:
  // existingInquiryId で既存スレッドを再取得 → スレッド表示へ切替
  const handleConflict = useCallback(
    async (existingInquiryId: string | null) => {
      if (!existingInquiryId) {
        // 既存 id が取れない稀なケース: 全件再検索でフォールバック
        await loadExistingInquiry();
        setIsExpanded(true);
        return;
      }
      try {
        const existing = await fetchInquiry(existingInquiryId);
        setExistingInquiry(existing);
        setIsExpanded(true);
      } catch (err) {
        console.error('[OrderInquirySection] failed to fetch existing inquiry after 409:', err);
        // フォールバック: 全件再検索
        await loadExistingInquiry();
        setIsExpanded(true);
      }
    },
    [loadExistingInquiry]
  );

  // InquiryThread の close/reopen 反映
  const handleStatusChange = useCallback(
    (inquiryId: string, nextStatus: InquiryStatus) => {
      setExistingInquiry((prev) =>
        prev && prev.id === inquiryId ? { ...prev, status: nextStatus } : prev
      );
    },
    []
  );

  // =====================================================
  // Render
  // =====================================================

  // 初回ロード中
  if (isInitialLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          お問い合わせ状況を確認中...
        </div>
      </Card>
    );
  }

  // 既存スレッドあり → 折りたたみ表示
  if (existingInquiry) {
    const badge = statusBadgeLabel(existingInquiry.status);
    const previewText =
      existingInquiry.message?.trim() || '（メッセージ本文がありません）';

    return (
      <Card className="overflow-hidden">
        {/* 折りたたみヘッダ（クリックで展開/折りたたみ） */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full p-5 text-left hover:bg-bg-secondary transition-colors flex items-start justify-between gap-3"
          aria-expanded={isExpanded}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-medium text-text-primary">
                  この注文のお問い合わせ
                </h3>
                <span className={`text-xs font-medium ${badge.tone}`}>{badge.label}</span>
              </div>
              <p className="text-xs text-text-muted mb-1.5">
                {existingInquiry.inquiryNumber}
                {existingInquiry.createdAt && (
                  <>
                    {' '}
                    ・{' '}
                    {formatDistanceToNow(new Date(existingInquiry.createdAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </>
                )}
              </p>
              <p className="text-sm text-text-primary line-clamp-1">{previewText}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-text-muted shrink-0 mt-1 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* 展開時: InquiryThread（スレッド全メッセージ + 追記フォーム + close/reopen） */}
        {isExpanded && (
          <div className="border-t border-border-secondary p-4 bg-bg-primary">
            <InquiryThread
              inquiry={existingInquiry}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </Card>
    );
  }

  // スレッド未存在 → 初回作成フォーム
  return (
    <Card className="p-5 space-y-4">
      {/* ヘッダ */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
          <Package className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-text-primary">
            この注文について質問する
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            注文番号 {orderNumber} について、不明点やご要望をチャットでお伝えいただけます。
            送信後はこのページで担当者とのやり取りができます（1注文につき1スレッド）。
          </p>
        </div>
      </div>

      {/* 初期ロードエラー（フォールバックでフォーム表示中の注意喚起） */}
      {loadError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            既存のお問い合わせ状況を確認できませんでした。下記フォームから送信いただけますが、
            既にスレッドが存在する場合は既存スレッドへ案内されます。
          </p>
        </div>
      )}

      {/* フォーム（件名・種別は非表示・type='order' で送信・添付は注文チャット用100MB・デザインデータ可） */}
      <InquiryCreateForm
        prefillOrderId={orderId}
        prefillType="order"
        hideSubjectAndType
        onCreated={handleCreated}
        onConflict={handleConflict}
        submitLabel="質問を送信"
        showCancelButton={false}
      />
    </Card>
  );
}

export default OrderInquirySection;
