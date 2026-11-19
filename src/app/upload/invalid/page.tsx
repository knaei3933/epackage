/**
 * Invalid Token Page
 *
 * 無効なトークンページ
 * - トークンが無効・期限切れ・キャンセルされた場合に表示
 * - 韓国語と日本語でエラーメッセージ表示
 *
 * Route: /upload/invalid
 */

'use client';

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
import { PageHeader } from '@/components/layout';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';

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
      case 'revoked':
        return {
          icon: XCircle,
          titleKo: '비활성화된 링크입니다',
          titleJa: 'このリンクは無効化されています',
          messageKo: '보안상 이 링크가 비활성화되었습니다. 새로운 링크를 요청해 주세요.',
          messageJa: 'セキュリティ上、このリンクは無効化されました。新しいリンクをリクエストしてください。',
          code: 'ERROR_TOKEN_REVOKED',
        };
      case 'used':
        return {
          icon: AlertCircle,
          titleKo: '이미 사용된 링크입니다',
          titleJa: 'このリンクは既に使用済みです',
          messageKo: '이 링크는 이미 사용되었습니다. 추가 업로드가 필요한 경우 새로운 링크를 요청해 주세요.',
          messageJa: 'このリンクは既に使用されました。追加アップロードが必要な場合は新しいリンクをリクエストしてください。',
          code: 'ERROR_TOKEN_USED',
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
    <div className="min-h-screen bg-bg-primary">
      <PageHeader title={errorDetails.titleKo} lead={errorDetails.messageKo}>
        <div className="flex items-center gap-3">
          <ErrorIcon className="w-5 h-5 text-error" aria-hidden="true" />
          <Badge variant="error" className="font-mono">
            {errorDetails.code}
          </Badge>
        </div>
      </PageHeader>

      <section className="py-16 md:py-24 bg-bg-primary">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="max-w-xl">
            {/* Japanese Text */}
            <h2 className="font-heading text-2xl text-text-primary mb-3">
              {errorDetails.titleJa}
            </h2>
            <p className="text-text-secondary leading-[1.8] mb-8">
              {errorDetails.messageJa}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Contact Support */}
              <a
                href="mailto:support@epackage-lab.com"
                className={buttonVariants({ variant: 'primary', size: 'md' })}
              >
                <Mail className="w-5 h-5 mr-2" />
                <span>サポートにお問い合わせ</span>
              </a>

              {/* Back to Home */}
              <Link href="/" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
                <Home className="w-5 h-5 mr-2" />
                <span>ホームに戻る</span>
              </Link>
            </div>

            {/* Additional Help Text */}
            <div className="mt-8 p-4 bg-bg-secondary rounded-container border border-border-medium">
              <p className="text-sm text-text-secondary leading-relaxed">
                <span className="font-medium">도움이 필요하신가요?</span>
                <br />
                <span className="font-medium">お困りですか?</span>
                <br />
                お問い合わせ: <a href="mailto:support@epackage-lab.com" className="text-brand underline-offset-4 hover:underline">support@epackage-lab.com</a>
              </p>
            </div>

            {/* Footer */}
            <p className="mt-8 text-sm text-text-muted">
              © {new Date().getFullYear()} Epackage Lab. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


// =====================================================
// Page Component
// =====================================================

export default function InvalidTokenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    }>
      <InvalidTokenContent />
    </Suspense>
  );
}

// Client Components cannot export metadata
// Metadata is handled by the parent layout or through SEO components

export const dynamic = 'force-dynamic';
