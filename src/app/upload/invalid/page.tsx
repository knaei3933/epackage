/**
 * Invalid Token Page
 *
 * 無効なトークンページ
 * - トークンが無効・期限切れ・キャンセルされた場合に表示
 * - 韓国語と日本語でエラーメッセージ表示
 *
 * Route: /upload/invalid
 */

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  XCircle,
  Clock,
  Mail,
  Home,
} from 'lucide-react';
import { Suspense } from 'react';

// =====================================================
// Component
// =====================================================

function InvalidTokenContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  // Get error details based on reason
  const getErrorDetails = () => {
    switch (reason) {
      case 'expired':
        return {
          icon: Clock,
          titleKo: '만료된 링크입니다',
          titleJa: 'リンクの有効期限が切れています',
          messageKo: '이 링크의 유효기간이 만료되었습니다. 새로운 링크를 요청해 주세요.',
          messageJa: 'このリンクの有効期限が切れました。新しいリンクをリクエストしてください。',
          code: 'ERROR_TOKEN_EXPIRED',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          titleKo: '취소된 요청입니다',
          titleJa: 'キャンセルされたリクエストです',
          messageKo: '이 수정 요청이 취소되었습니다. 자세한 내용은 관리자에게 문의해 주세요.',
          messageJa: 'この修正リクエストはキャンセルされました。詳細は管理者にお問い合わせください。',
          code: 'ERROR_REQUEST_CANCELLED',
        };
      default:
        return {
          icon: AlertCircle,
          titleKo: '유효하지 않은 링크입니다',
          titleJa: '無効なリンクです',
          messageKo: '이 링크가 유효하지 않거나 존재하지 않습니다. 링크를 확인하거나 관리자에게 문의해 주세요.',
          messageJa: 'このリンクは無効または存在しません。リンクを確認するか、管理者にお問い合わせください。',
          code: 'ERROR_INVALID_TOKEN',
        };
    }
  };

  const errorDetails = getErrorDetails();
  const ErrorIcon = errorDetails.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ErrorIcon className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Error Code */}
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-mono">
              {errorDetails.code}
            </span>
          </div>

          {/* Korean Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              {errorDetails.titleKo}
            </h1>
            <p className="text-slate-600 leading-relaxed">
              {errorDetails.messageKo}
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-sm">한국어 / 日本語</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Japanese Text */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              {errorDetails.titleJa}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {errorDetails.messageJa}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Contact Support */}
            <a
              href="mailto:support@epackage-lab.com"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Mail className="w-5 h-5" />
              <span>サポートにお問い合わせ</span>
            </a>

            {/* Back to Home */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              <span>ホームに戻る</span>
            </Link>
          </div>

          {/* Additional Help Text */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              <span className="font-medium">도움이 필요하신가요?</span>
              <br />
              <span className="font-medium">お困りですか?</span>
              <br />
              お問い合わせ: <a href="mailto:support@epackage-lab.com" className="text-blue-600 hover:underline">support@epackage-lab.com</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Epackage Lab. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Page Component
// =====================================================

export default function InvalidTokenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <InvalidTokenContent />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export const metadata = {
  title: '無効なリンク | Epackage Lab',
  description: 'トークンが無効または期限切れです',
};

export const dynamic = 'force-dynamic';
