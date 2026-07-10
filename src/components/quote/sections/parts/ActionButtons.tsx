/**
 * Action buttons section for ResultStep.
 */

import { motion } from 'framer-motion';
import { RefreshCw, Download, List, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface ActionButtonsProps {
  userId?: string | null;
  quotationId: string | null;
  onReset: () => void;
  handleDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  pdfStatus: 'idle' | 'success' | 'error';
  showPatternComparison: boolean;
  multiQuantityQuotesLength: number;
}

export function ActionButtons({
  userId,
  quotationId,
  onReset,
  handleDownloadPdf,
  isGeneratingPdf,
  pdfStatus,
  showPatternComparison,
  multiQuantityQuotesLength,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {/* 注文ボタン（会員限定） */}
      {userId && quotationId && (
        <button
          onClick={async () => {
            try {
              const res = await fetch(`/api/member/quotations/${quotationId}/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
              if (res.ok) {
                const data = await res.json();
                alert('注文を確定しました。注文履歴からご確認ください。');
                window.location.href = '/member/orders';
              } else {
                alert('注文の確定に失敗しました。もう一度お試しください。');
              }
            } catch (e) {
              alert('通信エラーが発生しました。');
            }
          }}
          className="px-6 py-3 bg-brixa-600 text-white rounded-lg font-medium hover:bg-brixa-700 transition-colors flex items-center"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          この内容で注文
        </button>
      )}

      <motion.button
        onClick={() => {
          if (window.confirm('新しい見積もりを作成します。現在の入力内容はリセットされます。よろしいですか？')) {
            onReset();
          }
        }}
        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <RefreshCw className="w-4 h-4 inline mr-2" />
        新しい見積もり
      </motion.button>

      {/* 見積一覧リンク（認証済みのみ） */}
      {userId && (
        <Link
          href="/member/quotations"
          className="px-6 py-3 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors flex items-center"
        >
          <List className="w-4 h-4 mr-2" />
          見積一覧
        </Link>
      )}

      <button
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center ${
          isGeneratingPdf
            ? 'bg-gray-400 cursor-not-allowed'
            : pdfStatus === 'success'
            ? 'bg-info-600 hover:bg-info-700 text-white'
            : pdfStatus === 'error'
            ? 'bg-error-600 hover:bg-error-700 text-white'
            : 'bg-navy-700 hover:bg-navy-600 text-white'
        }`}
      >
        {isGeneratingPdf ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            PDF生成中...
          </>
        ) : pdfStatus === 'success' ? (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ダウンロード完了 (自動保存済み)
          </>
        ) : pdfStatus === 'error' ? (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            失敗
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {showPatternComparison && multiQuantityQuotesLength > 0
              ? `全パターンPDFダウンロード (${multiQuantityQuotesLength}パターン・自動保存)`
              : 'PDFダウンロード (自動保存)'}
          </>
        )}
      </button>

      {/* 未認証ユーザー向け会員登録促進メッセージ */}
      {!userId && (
        <div className="w-full mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">この見積を保存するには会員登録</p>
              <p className="text-sm text-amber-700 mt-1">
                会員登録（無料）すると、見積履歴の保存・管理や、専任担当者からのご連絡が可能になります。
              </p>
              <div className="flex gap-2 mt-3">
                <Link
                  href="/auth/register?redirect=/quote-simulator"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  今すぐ会員登録
                </Link>
                <Link
                  href="/auth/signin?redirect=/quote-simulator"
                  className="px-4 py-2 border border-amber-600 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
                >
                  ログイン
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
