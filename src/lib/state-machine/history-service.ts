/**
 * State Change History Service
 *
 * 상태 변경 이력 관리 서비스
 * Track and manage order state transition history
 */

import {
  StateChangeHistory,
  OrderState,
  OrderEvent,
  SideEffect,
} from '@/types/state-machine';

// ============================================================
// State Change History Management
// ============================================================

/**
 * Record state change in history
 * 상태 변경 기록 저장
 */
export async function recordStateChange(change: {
  orderId: string;
  fromState: OrderState;
  toState: OrderState;
  event: OrderEvent['type'];
  eventData?: any;
  changedBy: string;
  reason?: string;
  approvalRequestId?: string;
  sideEffects: SideEffect[];
}): Promise<StateChangeHistory> {
  const historyEntry: StateChangeHistory = {
    id: generateHistoryId(),
    orderId: change.orderId,
    fromState: change.fromState,
    toState: change.toState,
    event: change.event,
    eventData: change.eventData,
    changedBy: change.changedBy,
    changedAt: new Date().toISOString(),
    reason: change.reason,
    approvalRequestId: change.approvalRequestId,
    sideEffects: change.sideEffects,
  };

  // In production, save to database (order_status_history table)
  console.log('[STATE CHANGE RECORDED]', historyEntry);

  return historyEntry;
}

/**
 * Get state change history for an order
 * 주문 상태 변경 이력 조회
 */
export async function getStateHistory(orderId: string): Promise<StateChangeHistory[]> {
  // In production, fetch from database
  // SELECT * FROM order_status_history WHERE order_id = orderId ORDER BY changed_at DESC
  return [];
}

/**
 * Get state change statistics
 * 상태 변경 통계 조회
 */
export async function getStateStatistics(orderId: string): Promise<{
  totalChanges: number;
  timeInEachState: Record<OrderState, number>; // minutes
  averageTimePerState: number;
  rollbackCount: number;
  approvalCount: number;
}> {
  const history = await getStateHistory(orderId);

  const stats = {
    totalChanges: history.length,
    timeInEachState: {} as Record<OrderState, number>,
    averageTimePerState: 0,
    rollbackCount: 0,
    approvalCount: 0,
  };

  // Calculate time spent in each state
  for (let i = 0; i < history.length; i++) {
    const current = history[i];
    const next = history[i + 1];

    if (next) {
      const currentTime = new Date(current.changedAt).getTime();
      const nextTime = new Date(next.changedAt).getTime();
      const minutes = (nextTime - currentTime) / (1000 * 60);

      if (!stats.timeInEachState[current.toState]) {
        stats.timeInEachState[current.toState] = 0;
      }
      stats.timeInEachState[current.toState] += minutes;
    }

    // Count rollbacks
    if (current.event === 'ROLLBACK') {
      stats.rollbackCount++;
    }

    // Count approvals
    if (current.approvalRequestId) {
      stats.approvalCount++;
    }
  }

  // Calculate average
  const stateEntries = Object.values(stats.timeInEachState);
  if (stateEntries.length > 0) {
    stats.averageTimePerState =
      stateEntries.reduce((a, b) => a + b, 0) / stateEntries.length;
  }

  return stats;
}

/**
 * Get state timeline for visualization
 * 상태 타임라인 생성 (시각화용)
 */
export async function getStateTimeline(orderId: string): Promise<Array<{
  state: OrderState;
  enteredAt: string;
  exitedAt?: string;
  duration?: number; // minutes
  actor: string;
  reason?: string;
}>> {
  const history = await getStateHistory(orderId);
  const timeline: Array<{
    state: OrderState;
    enteredAt: string;
    exitedAt?: string;
    duration?: number;
    actor: string;
    reason?: string;
  }> = [];

  for (let i = 0; i < history.length; i++) {
    const current = history[i];
    const next = history[i + 1];

    const entry = {
      state: current.toState,
      enteredAt: current.changedAt,
      actor: current.changedBy,
      reason: current.reason,
    } as any;

    if (next) {
      entry.exitedAt = next.changedAt;
      const durationMs =
        new Date(next.changedAt).getTime() - new Date(current.changedAt).getTime();
      entry.duration = durationMs / (1000 * 60); // minutes
    }

    timeline.push(entry);
  }

  return timeline;
}

/**
 * Find problematic transitions (rollbacks, long durations)
 * 문제 전환 찾기
 */
export async function findProblematicTransitions(orderId: string): Promise<Array<{
  from: OrderState;
  to: OrderState;
  issue: 'rollback' | 'long_duration' | 'rejection';
  details: string;
}>> {
  const timeline = await getStateTimeline(orderId);
  const problems: Array<{
    from: OrderState;
    to: OrderState;
    issue: 'rollback' | 'long_duration' | 'rejection';
    details: string;
  }> = [];

  for (const entry of timeline) {
    // Check for long duration (more than 7 days)
    if (entry.duration && entry.duration > 7 * 24 * 60) {
      problems.push({
        from: entry.state,
        to: entry.state,
        issue: 'long_duration',
        details: `State ${entry.state} took ${Math.round(entry.duration / (24 * 60))} days`,
      });
    }
  }

  // Check history for rollbacks
  const history = await getStateHistory(orderId);
  for (const change of history) {
    if (change.event === 'ROLLBACK') {
      problems.push({
        from: change.fromState,
        to: change.toState,
        issue: 'rollback',
        details: change.reason || 'Rolled back from ' + change.fromState,
      });
    }
  }

  return problems;
}

// ============================================================
// History Export Functions
// ============================================================

/**
 * Export history as CSV
 * 이력을 CSV로 내보내기
 */
export async function exportHistoryAsCSV(orderId: string): Promise<string> {
  const history = await getStateHistory(orderId);

  const headers = [
    'ID',
    'Order ID',
    'From State',
    'To State',
    'Event',
    'Changed By',
    'Changed At',
    'Reason',
    'Duration (minutes)',
  ];

  const rows = history.map((change, index) => {
    const next = history[index + 1];
    let duration = '';

    if (next) {
      const durationMs =
        new Date(next.changedAt).getTime() - new Date(change.changedAt).getTime();
      duration = String(durationMs / (1000 * 60));
    }

    return [
      change.id,
      change.orderId,
      change.fromState,
      change.toState,
      change.event,
      change.changedBy,
      change.changedAt,
      change.reason || '',
      duration,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Export history as JSON
 * 이력을 JSON으로 내보내기
 */
export async function exportHistoryAsJSON(orderId: string): Promise<string> {
  const history = await getStateHistory(orderId);
  return JSON.stringify(history, null, 2);
}

/**
 * Generate state change report
 * 상태 변경 보고서 생성
 */
export async function generateStateChangeReport(orderId: string): Promise<{
  orderId: string;
  summary: {
    totalChanges: number;
    currentState: OrderState;
    totalDuration: number; // minutes
    averageStateDuration: number;
  };
  timeline: Array<{
    state: OrderState;
    enteredAt: string;
    duration?: number;
    actor: string;
  }>;
  statistics: {
    timeInEachState: Record<OrderState, number>;
    rollbackCount: number;
    approvalCount: number;
    problematicTransitions: number;
  };
}> {
  const history = await getStateHistory(orderId);
  const timeline = await getStateTimeline(orderId);
  const stats = await getStateStatistics(orderId);
  const problems = await findProblematicTransitions(orderId);

  const currentState = history.length > 0
    ? history[history.length - 1].toState
    : 'pending';

  let totalDuration = 0;
  for (const entry of timeline) {
    if (entry.duration) {
      totalDuration += entry.duration;
    }
  }

  return {
    orderId,
    summary: {
      totalChanges: history.length,
      currentState,
      totalDuration,
      averageStateDuration: stats.averageTimePerState,
    },
    timeline: timeline.map(entry => ({
      state: entry.state,
      enteredAt: entry.enteredAt,
      duration: entry.duration,
      actor: entry.actor,
    })),
    statistics: {
      timeInEachState: stats.timeInEachState,
      rollbackCount: stats.rollbackCount,
      approvalCount: stats.approvalCount,
      problematicTransitions: problems.length,
    },
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Generate history ID
 */
function generateHistoryId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `HIST-${timestamp}-${random}`.toUpperCase();
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number, locale: string = 'ja-JP'): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}分`;
  } else if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}時間${mins}分`;
  } else {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    return `${days}日${hours}時間`;
  }
}

/**
 * Get state color for visualization
 */
export function getStateColor(state: OrderState): string {
  const colors: Record<OrderState, string> = {
    pending: 'gray',
    quotation: 'blue',
    data_received: 'cyan',
    work_order: 'indigo',
    contract_sent: 'purple',
    contract_signed: 'violet',
    production: 'orange',
    stock_in: 'yellow',
    shipped: 'teal',
    delivered: 'green',
    cancelled: 'red',
  };
  return colors[state];
}
