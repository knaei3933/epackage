/**
 * Transaction Utilities for Supabase
 *
 * 트랜잭션 처리, 낙관적 잠금, 동시성 제어를 위한 유틸리티 함수들
 */

import { createServiceClient } from './supabase';

// =====================================================
// Types
// =====================================================

export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}

export interface OptimisticLockResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  retriable?: boolean;
}

// =====================================================
// Transaction Logging
// =====================================================

export function withTransactionLogging<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[Transaction] Started: ${operationName} (ID: ${transactionId})`);

  return fn()
    .then((result) => {
      const duration = Date.now() - startTime;
      console.log(
        `[Transaction] Completed: ${operationName} (ID: ${transactionId}, ${duration}ms)`
      );
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      console.error(
        `[Transaction] Failed: ${operationName} (ID: ${transactionId}, ${duration}ms)`,
        error
      );
      throw error;
    });
}

// =====================================================
// Optimistic Locking (낙관적 잠금)
// =====================================================

/**
 * 낙관적 잠금을 사용한 레코드 업데이트
 *
 * @param tableName - 테이블 이름
 * @param id - 레코드 ID
 * @param updateData - 업데이트할 데이터
 * @param currentVersion - 현재 버전 번호
 * @returns 업데이트 결과
 */
export async function updateWithOptimisticLock<T = Record<string, unknown>>(
  tableName: string,
  id: string,
  updateData: Partial<T>,
  currentVersion: number
): Promise<OptimisticLockResult> {
  const supabase = createServiceClient();

  // Use type assertion for dynamic table operations
  type UpdateData = Partial<T> & { version: number; updated_at: string };
  const updatePayload: UpdateData = {
    ...updateData,
    version: currentVersion + 1,
    updated_at: new Date().toISOString(),
  } as UpdateData;

  const query = supabase.from(tableName).update(updatePayload).eq('id', id).eq('version', currentVersion).select().single();
  const { data, error } = await query as unknown as { data: T | null; error: { code?: string; message?: string } | null };

  if (error) {
    // 버전 불일치는 다른 사용자가 수정했음을 의미
    if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
      return {
        success: false,
        error: 'Record was modified by another user. Please refresh and try again.',
        retriable: true,
      };
    }

    return {
      success: false,
      error: error.message,
      retriable: false,
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * 버전 필드가 있는 테이블의 레코드를 가져옵니다.
 */
export async function getRecordWithVersion<T = Record<string, unknown>>(
  tableName: string,
  id: string
): Promise<{ success: boolean; data?: T & { version: number }; error?: string }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as T & { version: number },
  };
}

/**
 * 낙관적 잠금으로 안전한 업데이트를 수행합니다.
 * 실패 시 자동으로 재시도합니다.
 */
export async function updateWithOptimisticLockRetry<T = Record<string, unknown>>(
  tableName: string,
  id: string,
  updateData: Partial<T>,
  maxRetries: number = 3
): Promise<OptimisticLockResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 현재 레코드 가져오기
    const recordResult = await getRecordWithVersion<T>(tableName, id);

    if (!recordResult.success || !recordResult.data) {
      return {
        success: false,
        error: recordResult.error || 'Record not found',
        retriable: false,
      };
    }

    const currentVersion = recordResult.data.version;

    // 낙관적 잠금으로 업데이트 시도
    const updateResult = await updateWithOptimisticLock<T>(
      tableName,
      id,
      updateData,
      currentVersion
    );

    if (updateResult.success) {
      return updateResult;
    }

    // 재시도 가능한 오류인 경우 다시 시도
    if (updateResult.retriable && attempt < maxRetries) {
      console.warn(
        `[OptimisticLock] Retry ${attempt}/${maxRetries} for ${tableName}:${id}`
      );
      // 지수 백오프로 대기
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
      continue;
    }

    return updateResult;
  }

  return {
    success: false,
    error: 'Max retries exceeded',
    retriable: false,
  };
}

// =====================================================
// Concurrent Request Simulator (테스트용)
// =====================================================

/**
 * 병렬 요청 시뮬레이터
 *
 * @param requests - 실행할 함수 배열
 * @param concurrency - 동시 실행 수
 * @returns 모든 요청의 결과
 */
export async function simulateConcurrentRequests<T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 10
): Promise<PromiseSettledResult<T>[]> {
  const chunks: Array<Array<() => Promise<T>>> = [];

  // 요청을 청크로 나눔
  for (let i = 0; i < requests.length; i += concurrency) {
    chunks.push(requests.slice(i, i + concurrency));
  }

  const results: PromiseSettledResult<T>[] = [];

  // 각 청크를 병렬로 실행
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map((fn) => fn())
    );
    results.push(...chunkResults);
  }

  return results;
}

// =====================================================
// Atomic Operations (원자적 연산)
// =====================================================

/**
 * Supabase RPC 함수를 호출하여 원자적 연산을 수행합니다.
 *
 * @param functionName - RPC 함수 이름
 * @param params - 함수 매개변수
 * @returns 실행 결과
 */
export async function callRpcFunction<T = unknown>(
  functionName: string,
  params: Record<string, unknown> = {}
): Promise<TransactionResult<T>> {
  const supabase = createServiceClient();

  try {
    // Use type assertion for RPC call since functionName is dynamic
    const { data, error } = await supabase.rpc(functionName, params) as unknown as { data: T | null; error: { message?: string; details?: unknown } | null };

    if (error) {
      return {
        success: false,
        error: error.message,
        details: error,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      details: error,
    };
  }
}

// =====================================================
// Transaction Status Check
// =====================================================

/**
 * 트랜잭션 무결성 검증을 위한 데이터 일관성 체크
 */
export async function validateDataConsistency(): Promise<{
  success: boolean;
  issues: Array<{
    table: string;
    issue: string;
    count?: number;
  }>;
}> {
  type ConsistencyIssue = { table: string; issue: string; count?: number };
  const issues: ConsistencyIssue[] = [];

  const supabase = createServiceClient();

  // 1. 주문과 주문 항목의 일관성 체크
  // Use type assertion for RPC call result
  const orderItemResult = await supabase.rpc('check_order_items_consistency') as unknown as { data: ConsistencyIssue[] | null; error: { message?: string } | null };
  const { data: orderItemMismatch, error: rpcError1 } = orderItemResult;

  if (!rpcError1 && orderItemMismatch && Array.isArray(orderItemMismatch) && orderItemMismatch.length > 0) {
    issues.push({
      table: 'orders',
      issue: 'Order items count mismatch',
      count: orderItemMismatch.length,
    });
  }

  // 2. 재료 무결성 체크 (재고가 음수인 제품)
  const { data: negativeStock } = await supabase
    .from('products')
    .select('id, name, stock_quantity')
    .lt('stock_quantity', 0);

  if (negativeStock && negativeStock.length > 0) {
    issues.push({
      table: 'products',
      issue: 'Negative stock quantity',
      count: negativeStock.length,
    });
  }

  // 3. 고아 레코드 체크 (참조하는 부모가 없는 자식 레코드)
  // Use type assertion for RPC call result
  const orphanedResult = await supabase.rpc('check_orphaned_records') as unknown as { data: ConsistencyIssue[] | null; error: { message?: string } | null };
  const { data: orphanedItems, error: rpcError2 } = orphanedResult;

  if (!rpcError2 && orphanedItems && Array.isArray(orphanedItems) && orphanedItems.length > 0) {
    issues.push({
      table: 'various',
      issue: 'Orphaned records detected',
      count: orphanedItems.length,
    });
  }

  return {
    success: issues.length === 0,
    issues,
  };
}

// =====================================================
// Helper: Create Transaction Wrapper
// =====================================================

/**
 * 여러 작업을 안전하게 실행하는 트랜잭션 래퍼
 * Supabase는 자동 커밋 모델을 사용하지만, 에러 처리를 표준화합니다.
 */
export async function executeInTransaction<T>(
  operations: Array<() => Promise<unknown>>,
  options: {
    rollbackOnError?: boolean;
    continueOnError?: boolean;
  } = {}
): Promise<TransactionResult<T>> {
  const { rollbackOnError = true, continueOnError = false } = options;
  const results: unknown[] = [];
  const errors: unknown[] = [];

  for (const operation of operations) {
    try {
      const result = await operation();
      results.push(result);
    } catch (error) {
      errors.push(error);

      if (!continueOnError) {
        // 롤백이 필요하지만 Supabase는 자동 롤백을 지원하지 않음
        // 수동 롤백 로직을 구현해야 할 수 있음
        if (rollbackOnError) {
          console.error('[Transaction] Error occurred, manual rollback may be needed:', error);
        }

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Transaction failed',
          details: { errors, completedResults: results },
        };
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: continueOnError,
      data: results as T,
      error: `${errors.length} operations failed`,
      details: { errors },
    };
  }

  return {
    success: true,
    data: results as T,
  };
}
