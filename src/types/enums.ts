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
 * 実DB status 型の全 5 値:
 *   PENDING（承認待ち）/ ACTIVE（アクティブ）/ SUSPENDED（停止）
 *   / DELETED（削除）/ INVITED（招待中・管理者招待）
 *
 * ※ INVITED は型には含めるが、管理者編集UI（adminEditProfileSchema）の
 *   選択肢からは除外する（招待中は管理者が直接 ACTIVE 等に切替不可）。
 *   除外は UI 側の責務（タスク#3）。型自体は 5 値すべて含める。
 */
export const USER_STATUSES = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'DELETED',
  'INVITED',
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
