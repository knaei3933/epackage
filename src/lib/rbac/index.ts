/**
 * RBAC Module Index
 *
 * ロールベースアクセス制御（RBAC）モジュールの統合エクスポート
 *
 * @module rbac
 */

// =====================================================
// Core RBAC Helpers
// =====================================================
export {
  // Types
  type Role,
  type RoleLegacy,
  type Permission,
  type RBACContext,
  type RBACCheckOptions,

  // Authentication & Authorization
  authenticateRequest,
  requirePermission,
  requireAnyPermission,
  withRBAC,

  // Server Component Helpers
  getRBACContext,
  hasPermission,
  hasAnyPermission,
} from './rbac-helpers';

// =====================================================
// Order Access Helpers
// =====================================================
export {
  // Types
  type OrderAccessResult,
  type OrderAccessInfo,
  type OrderAccessContext,

  // Core Functions
  getOrderAccessContext,
  checkOrderAccess,
  checkMultipleOrderAccess,
  requireOrderAccess,

  // Utility Functions
  isOrderOwner,
  checkOrderOwnershipClient,
} from './order-access';
