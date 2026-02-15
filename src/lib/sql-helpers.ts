/**
 * SQL Safety Helpers
 *
 * Prevent SQL injection in dynamic Supabase queries
 *
 * @example
 * import { escapeSqlLike, buildSafeIlikeQuery } from '@/lib/sql-helpers';
 *
 * // Safe search with escape
 * const escaped = escapeSqlLike(userInput);
 * query = query.ilike('name', `%${escaped}%`);
 *
 * // Or use convenience function
 * const safeQuery = buildSafeIlikeQuery(['order_number', 'customer_name'], search);
 * query = query.or(safeQuery);
 */

/**
 * Escape user input for LIKE queries
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
