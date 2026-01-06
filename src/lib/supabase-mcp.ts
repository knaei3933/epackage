/**
 * Supabase MCP Helper Library
 *
 * Supabase MCP ToolsのTypeScriptラッパー
 * - 型安全なSQL実行
 * - エラーハンドリング
 * - 結セットの型変換
 *
 * @module lib/supabase-mcp
 */

// MCP executeSql tool の戻り値型
export interface SqlResult<T = unknown> {
  data?: T[]
  error?: {
    message: string
    code?: string
    details?: string
  }
  rowsAffected?: number
}

/**
 * Supabase MCP executeSql ツールを直接呼び出す関数
 * サーバーサイドとクライアントサイドの両方で使用可能
 *
 * @param query SQLクエリ文字列
 * @param params クエリパラメータ配列
 * @returns SqlResult<T>
 *
 * @example
 * ```ts
 * const result = await executeSql<{ id: string; name: string }>(
 *   'SELECT id, name FROM users WHERE id = $1',
 *   [userId]
 * )
 * if (result.error) throw new Error(result.error.message)
 * const users = result.data ?? []
 * ```
 */
export async function executeSql<T = unknown>(
  query: string,
  params: (string | number | boolean | null)[] = []
): Promise<SqlResult<T>> {
  try {
    // サーバーサイドの場合: Supabase MCP toolを直接使用
    if (typeof window === 'undefined') {
      // Server-side: MCP tool is available directly
      // We'll use the mcp__supabase-epackage__execute_sql tool
      // For now, fall through to the client implementation
    }

    // クライアントサイド: API経由で実行
    const response = await fetch('/api/supabase-mcp/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, params }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `HTTP error! status: ${response.status}`
      )
    }

    const result: SqlResult<T> = await response.json()

    return result
  } catch (error) {
    console.error('[executeSql] Error:', error)

    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXECUTE_ERROR',
      },
    }
  }
}

/**
 * 注文キャンセル
 * @param orderId 注文ID
 */
export async function cancelOrder(orderId: string): Promise<SqlResult> {
  return executeSql(
    `
    UPDATE orders
    SET
      status = 'CANCELLED',
      cancelled_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    `,
    [orderId]
  )
}

/**
 * 注文ステータス取得
 * @param orderId 注文ID
 */
export async function getOrderStatus(orderId: string): Promise<SqlResult<{ status: string }>> {
  return executeSql(
    `
    SELECT status
    FROM orders
    WHERE id = $1
    `,
    [orderId]
  )
}

/**
 * 注文詳細取得
 * @param orderId 注文ID
 */
export async function getOrderDetails(orderId: string): Promise<SqlResult<any>> {
  return executeSql(
    `
    SELECT
      o.*,
      json_agg(
        json_build_object(
          'id', oi.id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'specifications', oi.specifications
        )
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = $1
    GROUP BY o.id
    `,
    [orderId]
  )
}

/**
 * 注文アイテム更新（数量変更）
 * @param orderId 注文ID
 * @param itemId アイテムID
 * @param quantity 新しい数量
 */
export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  quantity: number
): Promise<SqlResult> {
  return executeSql(
    `
    UPDATE order_items
    SET
      quantity = $1,
      total_price = quantity * unit_price,
      updated_at = NOW()
    WHERE id = $2 AND order_id = $3
    `,
    [quantity, itemId, orderId]
  )
}

/**
 * 注文配送先更新
 * @param orderId 注文ID
 * @param deliveryAddress 配送先データ
 */
export async function updateOrderDeliveryAddress(
  orderId: string,
  deliveryAddress: Record<string, unknown>
): Promise<SqlResult> {
  return executeSql(
    `
    UPDATE orders
    SET
      delivery_address = $1,
      updated_at = NOW()
    WHERE id = $2
    `,
    [JSON.stringify(deliveryAddress), orderId]
  )
}

/**
 * 注文合計金額再計算
 * @param orderId 注文ID
 */
export async function recalculateOrderTotal(orderId: string): Promise<SqlResult> {
  return executeSql(
    `
    UPDATE orders o
    SET
      subtotal = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM order_items
        WHERE order_id = o.id
      ),
      tax_amount = (
        SELECT COALESCE(SUM(total_price), 0) * 0.1
        FROM order_items
        WHERE order_id = o.id
      ),
      total_amount = (
        SELECT COALESCE(SUM(total_price), 0) * 1.1
        FROM order_items
        WHERE order_id = o.id
      ),
      updated_at = NOW()
    WHERE o.id = $1
    `,
    [orderId]
  )
}

/**
 * 注文複製（再注文用）
 * @param originalOrderId 元の注文ID
 */
export async function duplicateOrder(originalOrderId: string): Promise<SqlResult<{ id: string }>> {
  return executeSql(
    `
    WITH original_order AS (
      SELECT
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        billing_address
      FROM orders
      WHERE id = $1
    ),
    new_order AS (
      INSERT INTO orders (
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        billing_address,
        status,
        subtotal,
        tax_amount,
        total_amount
      )
      SELECT
        'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        billing_address,
        'PENDING',
        0,
        0,
        0
      FROM original_order
      RETURNING id
    )
    SELECT id FROM new_order
    `,
    [originalOrderId]
  )
}

/**
 * 注文アイテム複製
 * @param newOrderId 新しい注文ID
 * @param originalOrderId 元の注文ID
 */
export async function duplicateOrderItems(
  newOrderId: string,
  originalOrderId: string
): Promise<SqlResult> {
  return executeSql(
    `
    INSERT INTO order_items (
      order_id,
      product_name,
      quantity,
      unit_price,
      total_price,
      specifications
    )
    SELECT
      $1,
      product_name,
      quantity,
      unit_price,
      total_price,
      specifications
    FROM order_items
    WHERE order_id = $2
    `,
    [newOrderId, originalOrderId]
  )
}

/**
 * 通知作成
 * @param type 通知タイプ
 * @param title タイトル
 * @param message メッセージ
 * @param relatedId 関連ID
 * @param createdFor 作成先（'admin' | userId）
 */
export async function createNotification(
  type: string,
  title: string,
  message: string,
  relatedId: string,
  createdFor: string
): Promise<SqlResult> {
  return executeSql(
    `
    INSERT INTO notifications (
      type,
      title,
      message,
      related_id,
      created_for,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, NOW()
    )
    `,
    [type, title, message, relatedId, createdFor]
  )
}

/**
 * 複数の注文取得（PDFエクスポート用）
 * @param orderIds 注文ID配列
 */
export async function getOrdersForExport(orderIds: string[]): Promise<SqlResult<any>> {
  return executeSql(
    `
    SELECT
      o.*,
      json_agg(
        json_build_object(
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price
        )
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ANY($1)
    GROUP BY o.id
    ORDER BY o.created_at DESC
    `,
    [orderIds]
  )
}

/**
 * デバッグ用: クエリログ出力
 */
export function logQuery(query: string, params: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Supabase MCP] Query:', query)
    console.log('[Supabase MCP] Params:', params)
  }
}
