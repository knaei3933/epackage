import { redirect } from 'next/navigation';

/**
 * 生産管理ページ
 * 現在は使用されていないため、ダッシュボードへリダイレクト
 */
export default function ProductionPage() {
  redirect('/admin/dashboard');
}
