/**
 * Shipments API 共通定数
 *
 * Shipments 関連 API ルート群で利用する RBAC（ロールベースアクセス制御）の
 * 許可ロール配列を一元管理する。
 *
 * SECURITY: createSupabaseClient / createServiceClient は service role（RLS bypass）
 * のため、各 route は withMemberAuth の allowedRoles オプションで認可を担保する。
 * この配列は「参照元集約」のみを目的とし、配列値（ADMIN/OPERATOR/SALES の 3 値）
 * の増減は禁止されている（phase3 制約・RBAC 正規化済み）。
 *
 * @module lib/shipments-constants
 */

import { UserRole } from '@/types/auth';

/**
 * Shipments API にアクセス可能な管理系ロール。
 *
 * 値の増減は禁止（phase3 制約）。
 * - ADMIN: 全権限
 * - OPERATOR: 配送業務担当
 * - SALES: 営業担当
 *
 * 参照元（既存 3 route + Task 4 LIVE 3 route）:
 * - src/app/api/shipments/route.ts
 * - src/app/api/shipments/[id]/route.ts
 * - src/app/api/shipments/tracking/route.ts
 * - src/app/api/shipments/create/route.ts
 * - src/app/api/shipments/[id]/track/route.ts
 * - src/app/api/shipments/[id]/label/route.ts
 */
export const SHIPMENTS_ALLOWED_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.OPERATOR,
  UserRole.SALES,
];
