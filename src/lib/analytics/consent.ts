/**
 * Cookie 同意状態管理 + Google Consent Mode v2 連携
 *
 * 同意カテゴリ（privacy page の3カテゴリと整合）:
 * - necessary: 必須（常に有効・制御不可・Consent Mode 対象外）
 * - analytics: 分析（GA4 → analytics_storage）
 * - marketing: 広告（Google Ads → ad_storage / ad_user_data / ad_personalization）
 *
 * 永続化: localStorage（epac_cookie_consent）・有効期限12ヶ月・バージョン管理
 * 法令対応: 2025年4月個人情報保護法改正（Cookie ID も個人関連情報に該当）
 */

export type ConsentCategory = 'analytics' | 'marketing';

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

const STORAGE_KEY = 'epac_cookie_consent';
const CONSENT_VERSION = 'v1';
const EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 12ヶ月

/**
 * 同意の有無（バナー表示判定用）
 * 保存済みかつ有効期限内・バージョン一致の場合のみ true
 */
export function hasConsent(): boolean {
  return loadConsent() !== null;
}

/**
 * localStorage から同意状態を読み込み
 * 期限切れ・バージョン不一致・パース失敗時は null（未同意扱い）
 */
export function loadConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    // バージョン不一致 → ポリシー変更とみなし再同意を要求
    if (parsed.version !== CONSENT_VERSION) return null;
    // 期限切れ → 再同意を要求
    if (Date.now() - parsed.timestamp > EXPIRY_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * 同意状態を localStorage に保存
 */
function persistConsent(state: Pick<ConsentState, 'analytics' | 'marketing'>): ConsentState {
  const full: ConsentState = {
    analytics: state.analytics,
    marketing: state.marketing,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    } catch {
      // localStorage 利用不可（プライベートモード等）→ セッション中のみ保持
    }
  }
  return full;
}

/**
 * Consent Mode v2 の update を発火
 * gtag 関数は内部で dataLayer.push(arguments) を実行するため、
 * 呼び出し順序は dataLayer への積まれ順で保証される（default → update）
 */
function updateGtagConsent(state: Pick<ConsentState, 'analytics' | 'marketing'>): void {
  if (typeof window === 'undefined') return;
  const update = {
    analytics_storage: state.analytics ? 'granted' : 'denied',
    ad_storage: state.marketing ? 'granted' : 'denied',
    ad_user_data: state.marketing ? 'granted' : 'denied',
    ad_personalization: state.marketing ? 'granted' : 'denied',
  };
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('consent', 'update', update);
  }
}

/**
 * 全許可（「すべて許可」ボタン）
 */
export function grantAll(): ConsentState {
  const state = persistConsent({ analytics: true, marketing: true });
  updateGtagConsent(state);
  return state;
}

/**
 * 全拒否（「すべて拒否」ボタン）
 */
export function denyAll(): ConsentState {
  const state = persistConsent({ analytics: false, marketing: false });
  updateGtagConsent(state);
  return state;
}

/**
 * 個別設定の保存（設定パネルの「選択を保存」）
 */
export function savePreferences(prefs: Pick<ConsentState, 'analytics' | 'marketing'>): ConsentState {
  const state = persistConsent(prefs);
  updateGtagConsent(state);
  return state;
}

/**
 * ページロード時に保存済み同意を gtag に反映
 * バナーコンポーネントの mount 時に呼ぶ。
 * 未同意時は default denied のまま（何もしない）。
 */
export function applyStoredConsent(): void {
  const stored = loadConsent();
  if (stored) {
    updateGtagConsent(stored);
  }
}
