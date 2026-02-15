/**
 * Production Actions Library
 *
 * 製造開始条件チェック用ライブラリ
 * - canStartProduction: 製造開始可能かチェック
 * - getProductionStartErrorMessage: エラーメッセージ生成
 */

// ============================================================
// Types
// ============================================================

export interface ProductionValidation {
  canStart: boolean;
  missingRequirements: string[];
}

export interface OrderForProductionCheck {
  id: string;
  order_number?: string;
  payment_confirmed_at?: string | null;
  spec_approved_at?: string | null;
  contract_signed_at?: string | null;
  current_stage?: string | null;
}

// ============================================================
// Production Start Validation
// ============================================================

/**
 * Check if production can be started for an order
 *
 * Requirements:
 * - Payment must be confirmed (payment_confirmed_at)
 * - Specifications must be approved (spec_approved_at)
 * - Contract must be signed (contract_signed_at) - optional based on order type
 */
export function canStartProduction(order: OrderForProductionCheck): ProductionValidation {
  const missingRequirements: string[] = [];

  // Check payment confirmation
  if (!order.payment_confirmed_at) {
    missingRequirements.push('payment_confirmation');
  }

  // Check specification approval
  if (!order.spec_approved_at) {
    missingRequirements.push('spec_approval');
  }

  // Note: contract_signed_at is optional for some order types
  // Uncomment below if contract is always required
  // if (!order.contract_signed_at) {
  //   missingRequirements.push('contract_signature');
  // }

  return {
    canStart: missingRequirements.length === 0,
    missingRequirements,
  };
}

/**
 * Get error message for missing production requirements
 */
export function getProductionStartErrorMessage(missingRequirements: string[]): string {
  if (missingRequirements.length === 0) {
    return '';
  }

  const requirementLabels: Record<string, string> = {
    payment_confirmation: '入金確認',
    spec_approval: '仕様承認',
    contract_signature: '契約署名',
  };

  const missingLabels = missingRequirements
    .map(req => requirementLabels[req] || req)
    .join('、');

  return `製造を開始するには以下の条件が必要です: ${missingLabels}`;
}

/**
 * Get production start requirements description
 */
export function getProductionRequirementsDescription(): string[] {
  return [
    '入金確認が完了していること',
    '仕様が承認されていること',
  ];
}
