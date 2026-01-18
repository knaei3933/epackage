/**
 * Transaction Utilities for Supabase
 *
 * トランザクション処理、楽観的ロック、並行性制御のためのユーティリティ関数群
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
// Optimistic Locking (楽観的ロック)
// =====================================================

/**
 * 楽観的ロックを使用したレコード更新
 *
 * @param tableName - テーブル名
 * @param id - レコードID
 * @param updateData - 更新するデータ
 * @param currentVersion - 現在のバージョン番号
 * @returns 更新結果
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
    // バージョン不一致は他のユーザーが変更したことを意味
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
 * バージョンフィールドを持つテーブルのレコードを取得します。
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
 * 楽観的ロックで安全な更新を実行します。
 * 失敗時に自動的に再試行します。
 */
export async function updateWithOptimisticLockRetry<T = Record<string, unknown>>(
  tableName: string,
  id: string,
  updateData: Partial<T>,
  maxRetries: number = 3
): Promise<OptimisticLockResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 現在のレコード取得
    const recordResult = await getRecordWithVersion<T>(tableName, id);

    if (!recordResult.success || !recordResult.data) {
      return {
        success: false,
        error: recordResult.error || 'Record not found',
        retriable: false,
      };
    }

    const currentVersion = recordResult.data.version;

    // 楽観的ロックで更新試行
    const updateResult = await updateWithOptimisticLock<T>(
      tableName,
      id,
      updateData,
      currentVersion
    );

    if (updateResult.success) {
      return updateResult;
    }

    // 再試行可能なエラーの場合は再試行
    if (updateResult.retriable && attempt < maxRetries) {
      console.warn(
        `[OptimisticLock] Retry ${attempt}/${maxRetries} for ${tableName}:${id}`
      );
      // 指数バックオフで待機
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
// Concurrent Request Simulator (テスト用)
// =====================================================

/**
 * 並列リクエストシミュレーター
 *
 * @param requests - 実行する関数配列
 * @param concurrency - 同時実行数
 * @returns すべてのリクエストの結果
 */
export async function simulateConcurrentRequests<T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 10
): Promise<PromiseSettledResult<T>[]> {
  const chunks: Array<Array<() => Promise<T>>> = [];

  // リクエストをチャンクに分割
  for (let i = 0; i < requests.length; i += concurrency) {
    chunks.push(requests.slice(i, i + concurrency));
  }

  const results: PromiseSettledResult<T>[] = [];

  // 各チャンクを並列で実行
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map((fn) => fn())
    );
    results.push(...chunkResults);
  }

  return results;
}

// =====================================================
// Atomic Operations (原子演算)
// =====================================================

/**
 * Supabase RPC関数を呼び出して原子演算を実行します。
 *
 * @param functionName - RPC関数名
 * @param params - 関数パラメータ
 * @returns 実行結果
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
 * トランザクション完全性検証のためのデータ整合性チェック
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

  // 1. 注文と注文項目の整合性チェック
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

  // 2. 在庫完全性チェック（在庫が負の製品）
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

  // 3. 孤児レコードチェック（参照する親がない子レコード）
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
 * 複数の操作を安全に実行するトランザクションラッパー
 * Supabaseは自動コミットモデルを使用しますが、エラー処理を標準化します。
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
        // ロールバックが必要ですがSupabaseは自動ロールバックをサポートしない
        // 手動ロールバックロジックを実装する必要がある場合があります
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
