/**
 * Admin Home Page - Redirect to Dashboard
 *
 * 管理画面トップページ
 * ダッシュボードにリダイレクト
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  // 管理画面のトップページにアクセスした場合、ダッシュボードにリダイレクト
  redirect('/admin/dashboard');
}
