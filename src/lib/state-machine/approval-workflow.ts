/**
 * Approval Workflow Service (Ringi - 稟議)
 *
 * 일본식 승인 워크플로우 서비스
 * Japanese traditional approval workflow system
 */

import {
  ApprovalRequest,
  OrderState,
  OrderEvent,
  StateChangeHistory,
} from '@/types/state-machine';

// ============================================================
// Approval Request Management
// ============================================================

/**
 * Create new approval request
 * 새로운 승인 요청 생성
 */
export async function createApprovalRequest(request: {
  orderId: string;
  requestedBy: string;
  approvers: string[];
  changeType: 'status_change' | 'modification' | 'cancellation';
  requestedChange: {
    fromState?: OrderState;
    toState?: OrderState;
    description: string;
    metadata?: any;
  };
}): Promise<ApprovalRequest> {
  const id = generateApprovalId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const approvalRequest: ApprovalRequest = {
    id,
    orderId: request.orderId,
    requestedBy: request.requestedBy,
    requestedAt: now.toISOString(),
    approvers: request.approvers,
    approvals: request.approvers.map(approverId => ({
      approverId,
    })),
    status: 'pending',
    changeType: request.changeType,
    requestedChange: request.requestedChange,
    expiresAt: expiresAt.toISOString(),
  };

  // In production, save to database
  console.log('[APPROVAL REQUEST CREATED]', approvalRequest);

  return approvalRequest;
}

/**
 * Approve a request
 * 승인 요청 승인
 */
export async function approveRequest(
  approvalId: string,
  approverId: string,
  comments?: string
): Promise<ApprovalRequest> {
  // In production, fetch from database
  const request = await getApprovalRequest(approvalId);

  if (!request) {
    throw new Error('Approval request not found');
  }

  if (request.status !== 'pending') {
    throw new Error(`Request already ${request.status}`);
  }

  if (!request.approvers.includes(approverId)) {
    throw new Error('Approver not authorized');
  }

  // Check if expired
  if (new Date() > new Date(request.expiresAt)) {
    request.status = 'rejected';
    throw new Error('Approval request has expired');
  }

  // Update approval
  const approval = request.approvals.find(a => a.approverId === approverId);
  if (approval) {
    approval.approvedAt = new Date().toISOString();
    approval.comments = comments;
  }

  // Check if all required approvers have approved
  const allApproved = request.approvers.every(approverId =>
    request.approvals.some(a => a.approverId === approverId && a.approvedAt)
  );

  if (allApproved) {
    request.status = 'approved';
  }

  // In production, update database
  console.log('[APPROVAL REQUEST UPDATED]', request);

  return request;
}

/**
 * Reject a request
 * 승인 요청 거부
 */
export async function rejectRequest(
  approvalId: string,
  approverId: string,
  reason: string
): Promise<ApprovalRequest> {
  const request = await getApprovalRequest(approvalId);

  if (!request) {
    throw new Error('Approval request not found');
  }

  if (request.status !== 'pending') {
    throw new Error(`Request already ${request.status}`);
  }

  if (!request.approvers.includes(approverId)) {
    throw new Error('Approver not authorized');
  }

  // Any approver can reject
  request.status = 'rejected';

  const approval = request.approvals.find(a => a.approverId === approverId);
  if (approval) {
    approval.rejectedAt = new Date().toISOString();
    approval.comments = reason;
  }

  // In production, update database
  console.log('[APPROVAL REQUEST REJECTED]', request);

  return request;
}

/**
 * Get approval request
 * 승인 요청 조회
 */
export async function getApprovalRequest(approvalId: string): Promise<ApprovalRequest | null> {
  // In production, fetch from database
  return null;
}

/**
 * Get pending approvals for a user
 * 사용자의 보류 중 승인 목록 조회
 */
export async function getPendingApprovals(userId: string): Promise<ApprovalRequest[]> {
  // In production, fetch from database
  return [];
}

/**
 * Get approval status
 * 승인 상태 조회
 */
export function getApprovalStatus(request: ApprovalRequest): {
  status: string;
  progress: number;
  pendingApprovers: string[];
  completedApprovers: Array<{ id: string; at: string }>;
  canApprove: (userId: string) => boolean;
  canReject: (userId: string) => boolean;
} {
  const completedApprovers = request.approvals
    .filter(a => a.approvedAt || a.rejectedAt)
    .map(a => ({
      id: a.approverId,
      at: a.approvedAt || a.rejectedAt || '',
    }));

  const pendingApprovers = request.approvers.filter(approverId =>
    !request.approvals.some(a => a.approverId === approverId && (a.approvedAt || a.rejectedAt))
  );

  const progress = (completedApprovers.length / request.approvers.length) * 100;

  return {
    status: request.status,
    progress,
    pendingApprovers,
    completedApprovers,
    canApprove: (userId: string) =>
      request.status === 'pending' &&
      request.approvers.includes(userId) &&
      !request.approvals.some(a => a.approverId === userId && (a.approvedAt || a.rejectedAt)),
    canReject: (userId: string) =>
      request.status === 'pending' &&
      request.approvers.includes(userId) &&
      !request.approvals.some(a => a.approverId === userId && (a.approvedAt || a.rejectedAt)),
  };
}

// ============================================================
// Ringi Workflow Configuration
// ============================================================

/**
 * Ringi approval levels (稟議レベル)
 */
export type ApprovalLevel = 'section_chief' | 'department_manager' | 'director' | 'president';

/**
 * Approval matrix by change type and amount
 */
export const APPROVAL_MATRIX: Record<
  'status_change' | 'modification' | 'cancellation',
  Record<number, ApprovalLevel[]>
> = {
  status_change: {
    0: ['section_chief'], // No approval needed for small changes
    100000: ['section_chief', 'department_manager'], // 100k+ JPY
    1000000: ['section_chief', 'department_manager', 'director'], // 1M+ JPY
    10000000: ['section_chief', 'department_manager', 'director', 'president'], // 10M+ JPY
  },
  modification: {
    0: ['section_chief'],
    50000: ['section_chief', 'department_manager'],
    500000: ['section_chief', 'department_manager', 'director'],
    5000000: ['section_chief', 'department_manager', 'director', 'president'],
  },
  cancellation: {
    0: ['section_chief'],
    100000: ['section_chief', 'department_manager'],
    1000000: ['section_chief', 'department_manager', 'director'],
    10000000: ['section_chief', 'department_manager', 'director', 'president'],
  },
};

/**
 * Get required approval levels for a change
 */
export function getRequiredApprovalLevels(
  changeType: 'status_change' | 'modification' | 'cancellation',
  amount: number
): ApprovalLevel[] {
  const matrix = APPROVAL_MATRIX[changeType];
  let requiredLevels: ApprovalLevel[] = [];

  for (const [threshold, levels] of Object.entries(matrix)) {
    if (amount >= parseInt(threshold)) {
      requiredLevels = levels;
    }
  }

  return requiredLevels.length > 0 ? requiredLevels : ['section_chief'];
}

/**
 * Get approvers for approval level
 */
export async function getApproversForLevel(level: ApprovalLevel): Promise<string[]> {
  // In production, fetch from database based on user roles
  // This is a simplified implementation
  const roleMapping: Record<ApprovalLevel, string> = {
    section_chief: 'SECTION_CHIEF',
    department_manager: 'DEPARTMENT_MANAGER',
    director: 'DIRECTOR',
    president: 'PRESIDENT',
  };

  // Would query profiles table for users with these roles
  return [];
}

/**
 * Build approval chain for a request
 */
export async function buildApprovalChain(request: {
  orderId: string;
  changeType: 'status_change' | 'modification' | 'cancellation';
  amount: number;
  requestedBy: string;
}): Promise<string[]> {
  const requiredLevels = getRequiredApprovalLevels(
    request.changeType,
    request.amount
  );

  const approvers: string[] = [];

  for (const level of requiredLevels) {
    const levelApprovers = await getApproversForLevel(level);
    approvers.push(...levelApprovers);
  }

  return [...new Set(approvers)]; // Remove duplicates
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Generate approval ID
 */
function generateApprovalId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `APR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Format approval request for display
 */
export function formatApprovalRequest(request: ApprovalRequest): {
  id: string;
  title: string;
  description: string;
  changeTypeLabel: string;
  statusLabel: string;
  progress: number;
  createdAt: string;
  expiresAt: string;
  approvers: Array<{
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    at?: string;
    comments?: string;
  }>;
} {
  const changeTypeLabels: Record<typeof request.changeType, string> = {
    status_change: '상태 변경 (Status Change)',
    modification: '수정 (Modification)',
    cancellation: '취소 (Cancellation)',
  };

  const statusLabels: Record<typeof request.status, string> = {
    pending: '보류 중 (Pending)',
    approved: '승인됨 (Approved)',
    rejected: '거부됨 (Rejected)',
  };

  return {
    id: request.id,
    title: `${request.orderId} - ${changeTypeLabels[request.changeType]}`,
    description: request.requestedChange.description,
    changeTypeLabel: changeTypeLabels[request.changeType],
    statusLabel: statusLabels[request.status],
    progress: (request.approvals.filter(a => a.approvedAt).length / request.approvers.length) * 100,
    createdAt: request.requestedAt,
    expiresAt: request.expiresAt,
    approvers: request.approvers.map(approverId => {
      const approval = request.approvals.find(a => a.approverId === approverId);
      return {
        id: approverId,
        status: approval?.approvedAt
          ? 'approved'
          : approval?.rejectedAt
          ? 'rejected'
          : 'pending',
        at: approval?.approvedAt || approval?.rejectedAt,
        comments: approval?.comments,
      };
    }),
  };
}

/**
 * Check if approval request is expired
 */
export function isApprovalRequestExpired(request: ApprovalRequest): boolean {
  return new Date() > new Date(request.expiresAt);
}

/**
 * Get days until expiry
 */
export function getDaysUntilExpiry(request: ApprovalRequest): number {
  const now = new Date();
  const expiry = new Date(request.expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
