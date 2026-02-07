/**
 * Pending Approval Page
 *
 * アカウント承認待ちページです。
 * - メール認証後にプロフィールを自動作成
 * - 管理者承認待ち状態を表示
 */

import { redirect } from 'next/navigation';
import PendingClient from './PendingClient';

// =====================================================
// Page Props
// =====================================================

interface PageProps {
  searchParams: Promise<{ message?: string; email?: string }>;
}

export default async function PendingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const message = params.message;
  const email = params.email;

  // Pass data to client component
  return (
    <PendingClient
      message={message}
      email={email}
    />
  );
}
