/**
 * Enum 真正值の wrapper（手書き・source of truth）
 *
 * ここは手書きの wrapper です。生成型ファイル `src/types/database.ts` は
 * 編集しません（supabase gen で再生成されるため）。コード側で enum の
 * 真正值を一元参照したいときは、このファイルを import してください。
 *
 * 実DB の enum 値は Supabase MCP で確認済み:
 *   - user_role: ADMIN / MEMBER / KOREA_DESIGNER / OPERATOR / SALES（5 値）
 *   - business_type: INDIVIDUAL / CORPORATION（2 値）
 *
 * 書き方のポイント:
 *   `as const` + `typeof` パターンにより、値の配列と型を 1 か所で管理します。
 *   これにより「型だけ直して実行時の値が古い」というズレを防げます。
 */

/**
 * ユーザーロール（実DB profiles.role の真正値・source of truth）
 *
 * 実DB user_role enum の全 5 値:
 *   ADMIN / MEMBER / KOREA_DESIGNER / OPERATOR / SALES
 *
 * ※ 値の追加・削除は実DB の enum 変更とセットで行ってください。
 */
export const USER_ROLES = [
  'ADMIN',
  'MEMBER',
  'KOREA_DESIGNER',
  'OPERATOR',
  'SALES',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * 事業者種別（実DB profiles.business_type の真正値・source of truth）
 *
 * 実DB business_type enum の全 2 値:
 *   INDIVIDUAL（個人） / CORPORATION（法人）
 */
export const BUSINESS_TYPES = ['INDIVIDUAL', 'CORPORATION'] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

/**
 * ユーザーステータス（実DB profiles.status の真正値・source of truth）
 *
 * 実DB user_status enum の全 4 値（Supabase MCP pg_enum で確認済み）:
 *   PENDING（承認待ち）/ ACTIVE（アクティブ）/ SUSPENDED（停止）/ DELETED（削除）
 *
 * ※ 実DBに INVITED は存在しない（pg_enum 結果 4 値・profiles.status の INVITED データ 0 件）。
 *   旧コードの INVITED は実DB未適用の dead 値のため除去した。
 */
export const USER_STATUSES = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'DELETED',
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

/**
 * 業種カテゴリ（実DB profiles.product_category の真正値・source of truth）
 *
 * 実DB product_category 型の全 6 値:
 *   COSMETICS（化粧品）/ CLOTHING（衣類）/ ELECTRONICS（家電製品）
 *   / KITCHEN（台所用品）/ FURNITURE（家具）/ OTHER（その他）
 */
export const PRODUCT_CATEGORIES = [
  'COSMETICS',
  'CLOTHING',
  'ELECTRONICS',
  'KITCHEN',
  'FURNITURE',
  'OTHER',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// =====================================================
// 表示用ラベル（日本語）
// 会員登録・プロフィール・顧客管理の各 UI で重複定義されていた
// ProductCategory → 日本語ラベルを一元化（task #17 コード品質）。
// 値とラベルのズレを防ぐため、真正値 PRODUCT_CATEGORIES から機械生成する。
// =====================================================

/**
 * ProductCategory の日本語ラベル（表示用）。
 * key アクセスでラベル取得（例: PRODUCT_CATEGORY_LABELS['COSMETICS'] → '化粧品'）。
 */
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  COSMETICS: '化粧品',
  CLOTHING: '衣類',
  ELECTRONICS: '家電製品',
  KITCHEN: '台所用品',
  FURNITURE: '家具',
  OTHER: 'その他',
};

/**
 * ProductCategory の選択肢配列（フォーム <select> / FormField options 用）。
 * { value, label } 形式で .map して描画する。
 */
export const PRODUCT_CATEGORY_OPTIONS: ReadonlyArray<{
  value: ProductCategory;
  label: string;
}> = PRODUCT_CATEGORIES.map((value) => ({
  value,
  label: PRODUCT_CATEGORY_LABELS[value],
}));

/**
 * ProductCategory 値（DB 由来の string）から日本語ラベルへ変換。
 * 不正値・空文字は空文字を返す（呼び出し側でフォールバック表示を付ける）。
 * string → ProductCategory のキャストを本関数に局所化し、各 UI での散発キャストを排除。
 */
export function getProductCategoryLabel(value: string | null | undefined): string {
  if (!value) return '';
  return PRODUCT_CATEGORY_LABELS[value as ProductCategory] ?? value;
}
