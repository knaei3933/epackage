import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * 管理者ダッシュボード関連キャッシュを一括で無効化する（NIT-1・DRY 化）
 *
 * Next.js 16 の `revalidateTag(tag, profile)` は第2引数でキャッシュプロファイルを指定する。
 * `'max'` を渡すと全プロファイルのキャッシュを無効化できる（Next 15 → 16 の破壊的変更に追従）。
 *
 * 従来、この `revalidatePath` + `revalidateTag` の 2 行ペアが 29 ファイル・35 箇所の
 * admin 側 route / action にコピペされていたため、ここへ集約した。
 * orders / quotations / users / customers などの更新後に呼び出すことで、
 * `/admin/dashboard` の統計を即時反映させる。
 *
 * 参考: `getDashboardStats` / `fetchMemberDashboardStats` と同じ `'admin-dashboard'` タグを使用。
 */
export function invalidateAdminDashboardCache(): void {
  revalidatePath('/admin/dashboard');
  revalidateTag('admin-dashboard', 'max');
}
