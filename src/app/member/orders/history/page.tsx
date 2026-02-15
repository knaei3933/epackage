/**
 * Order History Page (Redirect)
 *
 * 注文履歴ページ - メインページにリダイレクト
 *
 * Uses client-side navigation to prevent authentication issues
 * during page transitions.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // メインページの「履歴」タブにクライアントサイドで遷移
    router.replace('/member/orders?tab=history');
  }, [router]);

  // Optional: Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
        <p className="text-sm text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  );
}
