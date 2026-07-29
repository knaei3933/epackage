/**
 * SQL Safety Helpers
 *
 * Prevent SQL injection in dynamic Supabase/PostgREST queries.
 *
 * 新規コードでは用途に応じて以下の2ヘルパを使い分け:
 * - {@link escapePostgrestFilterValue}: PostgREST の or/in フィルタ値（eq/in 演算子用・値全体をダブルクォートで保護）
 * - {@link escapeIlikePattern}: PostgREST の ilike パターン（自由テキスト検索用・% と _ をリテラル化）
 *
 * @example
 * import { escapePostgrestFilterValue, escapeIlikePattern } from '@/lib/sql-helpers';
 *
 * // 1) eq/in フィルタ（追跡番号等の完全一致・値全体をダブルクォートで保護）
 * const or = `shipment_number.eq.${escapePostgrestFilterValue(trackingNumber)}`;
 * query = query.or(or);
 *
 * // 2) ilike フィルタ（自由テキスト部分一致・% と _ をリテラル化）
 * const pattern = `%${escapeIlikePattern(search)}%`;
 * query = query.or(`name.ilike.${pattern}`);
 */

/**
 * Escape user input for LIKE queries
 *
 * @deprecated レガシ関数。新規コードでは用途に応じて以下を推奨:
 *   - PostgREST の or/in フィルタ値（eq・in）: {@link escapePostgrestFilterValue}
 *   - PostgREST の ilike パターン: {@link escapeIlikePattern}
 * 本関数は `'` もエスケープする（SQL 直書き時代の名残）が、PostgREST/Supabase 経由では不要。
 * 後方互換のため保持。
 *
 * Prevents SQL injection by escaping special characters:
 * - Backslash (\) → \\
 * - Percent (%) → \% (if you want literal %)
 * - Underscore (_) → \_ (if you want literal _)
 *
 * @example
 * escapeSqlLike("test%data") // returns "test\\%data"
 * escapeSqlLike("O'Brien") // returns "O''Brien"
 */
export function escapeSqlLike(input: string): string {
  return input
    .replace(/\\/g, '\\\\')   // Escape backslashes first
    .replace(/%/g, '\\%')     // Escape percent signs
    .replace(/_/g, '\\_')     // Escape underscores
    .replace(/'/g, "''");     // Escape single quotes (SQL standard)
}

/**
 * Escape a value for use as a PostgREST filter operand (eq/in/or).
 *
 * PostgREST の or/in フィルタは `column.op.value` 形式で、複数条件はカンマ `,` で区切り、
 * ピリオド `.` は演算子区切りとして解釈される。そのため、追跡番号のように `.` や `,`
 * を含む合法値（例: "ABC.123" や "X,Y"）をそのまま埋め込むと、PostgREST が誤って分割し、
 * 意図しないフィルタ（または全件マッチ/短絡）を引き起こす。
 *
 * 本ヘルパは値全体をダブルクォートで囲み、内部の `"` と `\` を PostgREST 仕様で
 * エスケープする（shipments route のダブルクォート方式と同等）。これにより区切り文字 `,`・
 * 演算子区切り `.` を値の一部として保護し、合法な追跡番号を破壊しない。
 *
 * @example
 * // shipment_number.eq."ABC.123" を生成（. が演算子区切りと誤認されない）
 * const or = `shipment_number.eq.${escapePostgrestFilterValue('ABC.123')}`;
 * query = query.or(or);
 *
 * @param value - フィルタ値（生のユーザ入力・追跡番号等）
 * @returns ダブルクォートで囲まれた PostgREST セーフな値
 */
export function escapePostgrestFilterValue(value: string): string {
  // \ を先にエスケープしないと、続く " のエスケープで追加された \ が二重エスケープされる
  const escaped = value
    .replace(/\\/g, '\\\\')  // \ → \\
    .replace(/"/g, '\\"');    // " → \"
  return `"${escaped}"`;
}

/**
 * Escape a user-supplied pattern for use as a PostgREST `ilike` operand.
 *
 * PostgREST の ilike は SQL LIKE と同じく `%`（0文字以上の任意文字列）と `_`（任意1文字）
 * をワイルドカードとして扱う。ユーザ入力にこれらが含まれると、意図しないワイルドカード展開
 * （例: "100%" が "100 + 任意文字列" にマッチ）が起きる。
 *
 * 本ヘルパは `%`・`_`・`\` を `\` でエスケープし、ユーザ入力をリテラルとして扱う。
 * 呼出側は通常、前後に `%` を付けて部分一致にする。
 *
 * @example
 * const pattern = `%${escapeIlikePattern(userInput)}%`;
 * query = query.or(`name.ilike.${pattern}`);
 *
 * @param pattern - エスケープ対象のユーザ入力（ワイルドカードなし）
 * @returns `%`・`_`・`\` をエスケープした ilike セーフな文字列
 */
export function escapeIlikePattern(pattern: string): string {
  // \ を先にエスケープしないと、続く % と _ のエスケープで追加された \ が二重エスケープされる
  return pattern
    .replace(/\\/g, '\\\\')  // \ → \\
    .replace(/%/g, '\\%')    // % → \%
    .replace(/_/g, '\\_');   // _ → \_
}

/**
 * Sanitize user input for general queries
 *
 * Removes dangerous characters that could be used for injection
 *
 * @example
 * sanitizeInput("test'; DROP TABLE users; --") // returns "test DROP TABLE users "
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[;'"]/g, '')    // Remove quotes and semicolons
    .replace(/--/g, '')       // Remove SQL comments
    .replace(/\/\*/g, '')     // Remove block comment start
    .replace(/\*\//g, '')     // Remove block comment end
    .trim();
}

/**
 * Build safe ILIKE query for Supabase
 *
 * @deprecated 新規コードでは {@link escapeIlikePattern} と {@link escapePostgrestFilterValue} の
 * 組み合わせを推奨。本関数は内部で {@link escapeSqlLike} を使用し、値をダブルクォートで囲まない
 * ため、カンマ `,` や演算子区切り `.` を含む値で PostgREST の or フィルタが誤分割される
 * リスクがある。外部呼出 0 件（2026-07-29 Grep 確認）。後方互換のため保持。
 *
 * @example
 * const safeQuery = buildSafeIlikeQuery(['order_number', 'customer_name'], search);
 * // Returns: "order_number.ilike.%escaped_search%,customer_name.ilike.%escaped_search%"
 *
 * @param columns - Array of column names to search
 * @param searchTerm - The search term to escape and use
 * @returns Safe OR query string for Supabase
 */
export function buildSafeIlikeQuery(columns: string[], searchTerm: string): string {
  const escaped = escapeSqlLike(searchTerm);
  return columns.map(col => `${col}.ilike.%${escaped}%`).join(',');
}

/**
 * Build safe EQ query for Supabase
 *
 * @example
 * const safeQuery = buildSafeEqQuery(['shipment_number', 'tracking_number'], identifier);
 * // Returns: "shipment_number.eq.identifier,tracking_number.eq.identifier"
 *
 * @param columns - Array of column names to match
 * @param value - The value to match (will be validated)
 * @returns Safe OR query string for Supabase
 */
export function buildSafeEqQuery(columns: string[], value: string): string {
  // Validate value doesn't contain dangerous characters
  if (/[';]/.test(value)) {
    throw new Error('Invalid value for EQ query');
  }
  return columns.map(col => `${col}.eq.${value}`).join(',');
}

/**
 * Validate column name to prevent injection
 *
 * Only allows alphanumeric characters and underscores
 *
 * @example
 * isValidColumnName('order_number') // true
 * isValidColumnName('order_number; DROP TABLE--') // false
 */
export function isValidColumnName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Validate sort direction
 *
 * @example
 * isValidSortDirection('asc') // true
 * isValidSortDirection('desc') // true
 * isValidSortDirection('INVALID') // false
 */
export function isValidSortDirection(direction: string): direction is 'asc' | 'desc' {
  return direction === 'asc' || direction === 'desc';
}

/**
 * Whitelist-based column validator
 *
 * Use this to validate column names against a whitelist
 *
 * @example
 * const ALLOWED_SORT_FIELDS = ['created_at', 'order_number', 'status'];
 * if (!validateColumn(sortField, ALLOWED_SORT_FIELDS)) {
 *   throw new Error('Invalid sort field');
 * }
 */
export function validateColumn(column: string, allowedColumns: string[]): boolean {
  return allowedColumns.includes(column);
}

/**
 * Limit string length to prevent abuse
 *
 * @example
 * const safeSearch = limitLength(search, 100);
 */
export function limitLength(input: string, maxLength: number): string {
  return input.slice(0, maxLength);
}

/**
 * Combined safe search builder
 *
 * Convenience function that combines multiple safety measures
 *
 * @deprecated 新規コードでは {@link escapeIlikePattern} と {@link escapePostgrestFilterValue} の
 * 組み合わせを推奨。本関数は内部で {@link buildSafeIlikeQuery} を呼び出し、同じく値の
 * ダブルクォート保護がない問題を引き継ぐ。外部呼出 0 件（2026-07-29 Grep 確認）。
 * 後方互換のため保持。
 *
 * @example
 * const query = buildSafeSearch(
 *   ['order_number', 'customer_name'],
 *   search,
 *   { maxLength: 100, allowedColumns: ['order_number', 'customer_name'] }
 * );
 */
export function buildSafeSearch(
  columns: string[],
  searchTerm: string,
  options?: {
    maxLength?: number;
    allowedColumns?: string[];
  }
): string {
  // Validate columns if whitelist provided
  if (options?.allowedColumns) {
    const invalidColumns = columns.filter(col =>
      !options.allowedColumns!.includes(col)
    );
    if (invalidColumns.length > 0) {
      throw new Error(`Invalid columns: ${invalidColumns.join(', ')}`);
    }
  }

  // Limit search term length
  const limitedSearch = options?.maxLength
    ? limitLength(searchTerm, options.maxLength)
    : searchTerm;

  // Build and return safe query
  return buildSafeIlikeQuery(columns, limitedSearch);
}
