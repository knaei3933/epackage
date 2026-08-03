'use client';

/**
 * OrderConsentModal — 見積→注文変換時の同意取得モーダル（共通コンポーネント）
 *
 * 3経路（一覧 SpecApprovalModal / 詳細 QuotationDetailClient / 見積シミュレータ結果画面）
 * で共通利用する。5項目の同意チェック + フルネーム入力で注文確定をゲートする。
 *
 * 設計:
 * - shadcn Dialog 基盤（z-index・focus trap は Dialog に一任）
 * - 仕様サマリーは呼び出し元から `specSummary` で受け取る（未渡し時は同意のみ表示）。
 *   3経路とも呼び出し元で既に仕様を表示済みのため、実運用では未渡しが基本。
 *   プラン B1 の `hideSpecSummary` 相当（specSummary 未渡し = 仕様サマリー非表示）。
 * - 「すべてに同意する」一括ショートカットは提供しない（AC-UI-3: 個別承諾不存在リスク）。
 * - プレースホルダーは「同意の記録として保存されます」（AC-LEGAL-5: 過大表示禁止）。
 * - モーダルを開くたびに state をリセット（再注文時の再同意を確実に・AC-NONREG-1）。
 */

import { useEffect, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';
import { Check, ChevronDown, Loader2, ShieldAlert } from 'lucide-react';
import {
  CONSENT_ITEMS,
  CONSENT_ITEM_IDS,
  TERMS_VERSION,
  FULL_NAME_PLACEHOLDER,
  type OrderAgreementInput,
} from '@/lib/order-consent-terms';

interface OrderConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 同意完了時に agreement を返す。呼び出し元で実際の変換 API を呼ぶ。 */
  onConfirm: (agreement: OrderAgreementInput) => void;
  isProcessing?: boolean;
  /** 呼び出し元が組み立てた仕様サマリー（任意）。未渡し時は同意のみ表示。 */
  specSummary?: ReactNode;
}

export function OrderConsentModal({
  open,
  onOpenChange,
  onConfirm,
  isProcessing = false,
  specSummary,
}: OrderConsentModalProps) {
  const [agreedIds, setAgreedIds] = useState<Set<string>>(new Set());
  const [fullName, setFullName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // モーダルを開くたびに状態リセット（再注文時の再同意を確実に）
  useEffect(() => {
    if (open) {
      setAgreedIds(new Set());
      setFullName('');
      setExpandedId(null);
    }
  }, [open]);

  const allAgreed = agreedIds.size === CONSENT_ITEM_IDS.length;
  const canConfirm = allAgreed && fullName.trim().length > 0 && !isProcessing;

  const toggleAgree = (id: string) => {
    setAgreedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const agreement: OrderAgreementInput = {
      fullName: fullName.trim(),
      agreedItemIds: CONSENT_ITEM_IDS, // 安定した順序で返却
      termsVersion: TERMS_VERSION,
    };
    onConfirm(agreement);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isProcessing && onOpenChange(o)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            注文の確定にあたってのご同意
          </DialogTitle>
          <DialogDescription>
            ご注文を確定する前に、以下の契約事項をご確認いただき、すべてにご同意のうえお手続きください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 仕様サマリー（呼び出し元から渡された場合のみ） */}
          {specSummary && (
            <div className="bg-gray-50 rounded-lg p-4">{specSummary}</div>
          )}

          {/* 15,000円 周知バナー（AC-LEGAL-1） */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>【ご注意】</strong>
              データ入稿後は当社デザイナーの製造作業が開始されるため、キャンセルや仕様変更には
              <strong>15,000円（税抜）</strong>
              のキャンセル料が発生します。データ入稿前であれば無料でキャンセル・変更いただけます。
            </p>
          </div>

          {/* 5同意項目（個別必須・一括同意なし: AC-UI-3） */}
          <div className="space-y-2">
            {CONSENT_ITEMS.map((item, idx) => {
              const agreed = agreedIds.has(item.id);
              const expanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-lg border transition-colors ${
                    agreed ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={() => toggleAgree(item.id)}
                      id={`consent-${item.id}`}
                      disabled={isProcessing}
                      className="mt-0.5 w-5 h-5 rounded border-gray-400 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`consent-${item.id}`} className="cursor-pointer block">
                        <span className="text-sm font-semibold text-gray-900">
                          {idx + 1}. {item.title}
                        </span>
                        <span className="block text-xs text-gray-700 mt-0.5 leading-relaxed">
                          {item.summary}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : item.id)}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                        詳細を{expanded ? '閉じる' : '表示'}
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div className="px-3 pb-3 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                      {item.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* フルネーム入力（電子署名法2条 広義署名） */}
          <div className="border-t pt-4">
            <label htmlFor="order-consent-full-name" className="block text-sm font-semibold text-gray-900 mb-1">
              ご署名（ご自身の氏名）
            </label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              上記すべてにご同意のうえ、ご自身の氏名をご入力ください。入力いただいた氏名は同意の記録として保存されます。
            </p>
            <input
              id="order-consent-full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={FULL_NAME_PLACEHOLDER}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                注文を確定中...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                同意して注文を確定する
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrderConsentModal;
