/**
 * Array Safety Helpers
 *
 * Prevent runtime errors from null/undefined arrays
 *
 * @example
 * import { safeMap, isNonEmptyArray, first, last } from '@/lib/array-helpers';
 *
 * // Safe map - handles null/undefined arrays
 * const items = safeMap(productList, (item) => item.name);
 * // Returns empty array if productList is null/undefined
 *
 * // Type guard for non-empty arrays
 * if (isNonEmptyArray(items)) {
 *   // TypeScript knows items is [T, ...T[]]
 *   console.log(items[0]); // Safe!
 * }
 */

/**
 * Safe map - handles null/undefined arrays
 *
 * @example
 * const items = safeMap(productList, (item) => item.name);
 * // Returns empty array if productList is null/undefined
 */
export function safeMap<T, U>(
  array: T[] | null | undefined,
  callback: (item: T, index: number) => U
): U[] {
  if (!Array.isArray(array)) {
    console.warn('[safeMap] Input is not an array, returning empty array');
    return [];
  }
  return array.map(callback);
}

/**
 * Safe filter - handles null/undefined arrays
 *
 * @example
 * const activeItems = safeFilter(items, (item) => item.isActive);
 * // Returns empty array if items is null/undefined
 */
export function safeFilter<T>(
  array: T[] | null | undefined,
  callback: (item: T, index: number) => boolean
): T[] {
  if (!Array.isArray(array)) {
    console.warn('[safeFilter] Input is not an array, returning empty array');
    return [];
  }
  return array.filter(callback);
}

/**
 * Safe forEach - handles null/undefined arrays
 *
 * @example
 * safeForEach(items, (item) => console.log(item));
 * // Does nothing if items is null/undefined
 */
export function safeForEach<T>(
  array: T[] | null | undefined,
  callback: (item: T, index: number) => void
): void {
  if (!Array.isArray(array)) {
    console.warn('[safeForEach] Input is not an array, skipping');
    return;
  }
  array.forEach(callback);
}

/**
 * Safe reduce - handles null/undefined arrays
 *
 * @example
 * const total = safeReduce(numbers, (sum, n) => sum + n, 0);
 * // Returns initialValue if array is null/undefined
 */
export function safeReduce<T, U>(
  array: T[] | null | undefined,
  callback: (accumulator: U, item: T, index: number) => U,
  initialValue: U
): U {
  if (!Array.isArray(array)) {
    console.warn('[safeReduce] Input is not an array, returning initial value');
    return initialValue;
  }
  return array.reduce(callback, initialValue);
}

/**
 * Type guard for non-empty arrays
 *
 * @example
 * if (isNonEmptyArray(items)) {
 *   // TypeScript knows items is [T, ...T[]]
 *   console.log(items[0]); // Safe - guaranteed to exist
 * }
 */
export function isNonEmptyArray<T>(array: T[] | null | undefined): array is [T, ...T[]] {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Check if value is an empty array
 *
 * @example
 * if (isEmptyArray(items)) {
 *   console.log('No items to display');
 * }
 */
export function isEmptyArray<T>(array: T[] | null | undefined): boolean {
  return Array.isArray(array) && array.length === 0;
}

/**
 * Get first item safely
 *
 * @example
 * const firstItem = first(items);
 * // Returns null if items is empty/null/undefined
 */
export function first<T>(array: T[] | null | undefined): T | null {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  return array[0];
}

/**
 * Get last item safely
 *
 * @example
 * const lastItem = last(items);
 * // Returns null if items is empty/null/undefined
 */
export function last<T>(array: T[] | null | undefined): T | null {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  return array[array.length - 1];
}

/**
 * Get item at index safely
 *
 * @example
 * const item = getAt(items, 5);
 * // Returns null if index out of bounds or array is null/undefined
 */
export function getAt<T>(array: T[] | null | undefined, index: number): T | null {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return null;
  }
  return array[index];
}

/**
 * Safe array length
 *
 * @example
 * const count = arrayLength(items);
 * // Returns 0 if items is null/undefined
 */
export function arrayLength<T>(array: T[] | null | undefined): number {
  if (!Array.isArray(array)) {
    return 0;
  }
  return array.length;
}

/**
 * Safe array includes
 *
 * @example
 * const hasItem = arrayIncludes(items, 'search');
 * // Returns false if items is null/undefined
 */
export function arrayIncludes<T>(
  array: T[] | null | undefined,
  searchElement: T,
  fromIndex?: number
): boolean {
  if (!Array.isArray(array)) {
    return false;
  }
  return array.includes(searchElement, fromIndex);
}

/**
 * Safe array find
 *
 * @example
 * const found = arrayFind(items, (item) => item.id === 123);
 * // Returns undefined if items is null/undefined or not found
 */
export function arrayFind<T>(
  array: T[] | null | undefined,
  callback: (item: T, index: number) => boolean
): T | undefined {
  if (!Array.isArray(array)) {
    return undefined;
  }
  return array.find(callback);
}

/**
 * Chunk array into smaller arrays
 *
 * @example
 * const chunks = chunk([1, 2, 3, 4, 5], 2);
 * // Returns: [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[] | null | undefined, size: number): T[][] {
  if (!Array.isArray(array)) {
    return [];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Create a default array if input is null/undefined
 *
 * @example
 * const items = withDefault(productList, []);
 * // Returns productList if it's an array, otherwise []
 */
export function withDefault<T>(
  array: T[] | null | undefined,
  defaultValue: T[]
): T[] {
  return Array.isArray(array) ? array : defaultValue;
}

/**
 * Render helper for React components
 *
 * @example
 * {renderArray(items, (item) => <div key={item.id}>{item.name}</div>)}
 *
 * // Equivalent to:
 * {items?.map(item => <div key={item.id}>{item.name}</div>) ?? null}
 */
export function renderArray<T>(
  array: T[] | null | undefined,
  render: (item: T, index: number) => React.ReactNode
): React.ReactNode {
  if (!Array.isArray(array)) {
    return null;
  }
  return array.map(render);
}
