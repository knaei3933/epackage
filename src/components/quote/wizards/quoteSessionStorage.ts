/**
 * 見積もりウィザードの入力を、ブラウザの sessionStorage に残す。
 * （再読み込み・戻る・別ページから戻る、で入力が消えないようにするため）
 *
 * - 「次へ」の自動保存（DB への保存）とは別。ここは、このタブの中だけ。DB には触れない。
 * - 保存するのは、入力した値だけ。計算結果・関数・Map は保存しない。
 */

export const QUOTE_SESSION_KEY = 'epackage:quote-wizard:v1';

/** 保存する QuoteState の項目（JSON にできるものだけ） */
export const PERSISTED_QUOTE_FIELDS = [
  'bagTypeId',
  'materialId',
  'width',
  'height',
  'depth',
  'sideWidth',
  'quantities',
  'quantity',
  'isUVPrinting',
  'postProcessingOptions',
  'postProcessingMultiplier',
  'thicknessSelection',
  'printingType',
  'printingColors',
  'doubleSided',
  'deliveryLocation',
  'urgency',
  'spoutPosition',
  'spoutSize',
  'hasGusset',
  'pitch',
  'totalLength',
  'rollCount',
  'materialWidth',
  'filmLayers',
  'skuCount',
  'skuQuantities',
  'quantityMode',
  'useSKUCalculation',
  'sealWidth',
  'productCategory',
  'contentsType',
  'mainIngredient',
  'distributionEnvironment',
] as const;

export type PersistedQuoteField = (typeof PERSISTED_QUOTE_FIELDS)[number];

export interface PersistedQuote {
  /** 0 始まりのステップ番号 */
  step: number;
  fields: Partial<Record<PersistedQuoteField, unknown>>;
  patternQuantities: number[][];
}

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    // プライベートモードなどで、アクセスだけで例外が出ることがある
    return null;
  }
}

export function saveQuoteSession(
  state: object,
  step: number,
  patternQuantities: number[][],
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const source = state as Record<string, unknown>;
    const fields: PersistedQuote['fields'] = {};
    for (const key of PERSISTED_QUOTE_FIELDS) {
      if (source[key] !== undefined) fields[key] = source[key];
    }
    const payload: PersistedQuote = { step, fields, patternQuantities };
    storage.setItem(QUOTE_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // 容量いっぱいなどは、静かに諦める（保存は、あれば便利な機能）
  }
}

export function loadQuoteSession(): PersistedQuote | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(QUOTE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedQuote> | null;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.fields !== 'object' || !parsed.fields) {
      return null;
    }
    const allowed = new Set<string>(PERSISTED_QUOTE_FIELDS);
    const fields: PersistedQuote['fields'] = {};
    for (const [key, value] of Object.entries(parsed.fields)) {
      if (allowed.has(key)) fields[key as PersistedQuoteField] = value;
    }
    const patternQuantities = Array.isArray(parsed.patternQuantities)
      ? parsed.patternQuantities.filter(Array.isArray).map((row) => row.map((n) => Number(n) || 0))
      : [];
    return {
      step: typeof parsed.step === 'number' ? parsed.step : 0,
      fields,
      patternQuantities,
    };
  } catch {
    return null;
  }
}

export function clearQuoteSession(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(QUOTE_SESSION_KEY);
  } catch {
    // 何もしない
  }
}
