/**
 * 注文同意項目の定義（Single Source of Truth）
 *
 * 見積→注文変換時に表示する5項目の同意内容。terms_version = 'v1'。
 * 将来改定時は v2 を新設し、過去の同意は order_agreements.agreed_terms jsonb に
 * 保存された v1 テキスト本体で解釈する（過去同意の遡及解釈を防ぐ）。
 *
 * ※当面は legal/terms TSX とは独立定義（Next.js 静的 import の制約上、TSX 側から
 * 　このモジュールを import して SSoT を完全達成することは Phase F Follow-up で検討）。
 * 　Phase F (F4) で本定義と legal/page.tsx・terms/page.tsx の文面を手動照合する。
 *
 * 法的根拠: 電子消費者契約法（承諾の電子的記録）・電子署名法2条（広義の電子署名＝
 * 氏名入力を含む）・消費者契約法10条（不当条項無効）・特商法・景表法。
 *
 *条文テキストは既存 QuotationDetailClient の特約文面（法的に詳細）に基づき、
 * キャンセル条件のみ「完全不可」→「データ入稿後15,000円」に改定（AC-LEGAL-1）。
 */

export const TERMS_VERSION = 'v1' as const;

export interface ConsentItem {
  /** 安定した識別子（DB の agreed_terms.itemIds に保存・改定後も不変） */
  id: string;
  /** 同意チェック欄の見出し */
  title: string;
  /** 同意チェック欄に表示する要約文（モーダル内・常時表示） */
  summary: string;
  /** 展開時に表示する詳細本文（法的根拠を含む条文テキスト本体・agreed_terms.texts にも保存） */
  detail: string;
}

/**
 * 5項目の同意内容（Brixa terms/law 準拠・受託製造パッケージ文脈）。
 * 順序は表示順。id は安定（将来の項目追加/削除で再利用しない）。
 */
export const CONSENT_ITEMS: ConsentItem[] = [
  {
    id: 'spec_confirmation',
    title: '仕様内容の最終確認',
    summary:
      '製品・数量・単価・印刷方式・後加工の内容が見積の通り正しいことを確認しました。',
    detail:
      'ご注文いただく製品の仕様（製品名・サイズ・数量・単価・印刷方式・後加工・素材）が見積内容の通り正しいことを確認しました。数量パターンが複数ある場合は、今回ご注文いただく1パターンの内容であることを確認しました。',
  },
  {
    id: 'cancellation_policy',
    title: 'キャンセル・変更条件',
    summary:
      'データ入稿後のキャンセル・仕様変更には15,000円（税抜）のキャンセル料が発生することに同意します。',
    detail:
      'データ入稿前（データ入稿待ち状態）は、いつでも無料でキャンセル・変更いただけます。データ入稿後は当社デザイナーの製造作業が開始されるため、キャンセル・仕様変更をご希望の場合は15,000円（税抜）のキャンセル料（事務手数料）が発生します。契約成立後の仕様変更が生じた場合、当社およびお客様はその都度協議のうえ書面にて仕様変更を行うことができます。',
  },
  {
    id: 'return_exchange',
    title: '返品・交換条件',
    summary:
      '受託製造品のため、返品・交換は受入検査不合格または隠れた瑕疵の場合のみであることに同意します。',
    detail:
      '本サービスはご注文の仕様に基づく受託製造（オーダーメイド）のため、お客様都合による返品・交換は受け付けておりません。以下の場合、当社は代替品の納入または無償での再製造を行います。（1）商品が受入検査に合格しなかった場合、（2）受入検査から3ヶ月以内に隠れた瑕疵が判明した場合。ただし以下の場合は対象外となります。①お客様の指示内容に起因する場合、②指定されたデザイン・材料・製造方法等に起因する場合、③当社がその不適当を通知したにもかかわらず指示変更が行われなかった場合、④その他お客様に起因する理由または当社の責めに帰すべき事由がない場合。',
  },
  {
    id: 'refund_policy',
    title: '返金条件',
    summary:
      '返金は当社指定の方法（原則銀行振込）で行い、遅滞利息は発生しないことに同意します。',
    detail:
      '当社からお客様に返金する場合、当社が適当と認める方法（原則として銀行振込）により返金いたします。返金額には、遅滞利息・法定利息・その他の利息を付しません。配送商品の返金の際には、返金額から送料を差し引かせていただく場合がございます。',
  },
  {
    id: 'production_start',
    title: 'データ入稿後の作業開始',
    summary:
      'データ入稿により当社デザイナーの製造作業が開始されることを理解しました。',
    detail:
      'データ入稿が完了すると、当社のデザイナーが製造前のデータ確認・入稿作業を開始します。入稿後にキャンセル・変更をご希望の場合は、作業の進捗状況によりキャンセル料（15,000円・税抜）が発生する場合があります。',
  },
];

/** 全同意項目の id 配列（サーバー検証で agreedItemIds の完全一致チェックに使用） */
export const CONSENT_ITEM_IDS: string[] = CONSENT_ITEMS.map((item) => item.id);

/**
 * agreed_terms jsonb に保存する条文テキストのスナップショット。
 * 過去同意の遡及解釈を防ぐため、同意時点の条文本体を DB に保存する（R2 対応）。
 */
export const CONSENT_TEXTS_SNAPSHOT: Record<string, string> = Object.fromEntries(
  CONSENT_ITEMS.map((item) => [item.id, item.detail]),
);

/** フルネーム入力欄のプレースホルダー（AC-LEGAL-5: 「電子署名として」は過大表示のため使用禁止） */
export const FULL_NAME_PLACEHOLDER =
  'ご自身の氏名をご入力ください（同意の記録として保存されます）';

/** agreement オブジェクトの型 */
export interface OrderAgreementInput {
  fullName: string;
  agreedItemIds: string[];
  termsVersion: string;
}

/**
 * agreement オブジェクトの検証ヘルパー（クライアント・サーバー共通利用）。
 * 有効条件: fullName が空でない + agreedItemIds が5項目すべて含む + termsVersion が 'v1'。
 *
 * 注意: サーバー側ではこの関数に加え、後続の業務検証（selectedItemIds など）を実施する。
 * 本関数は agreement の正当性のみを検証するゲート（AC-API-1）。
 */
export function isValidAgreement(agreement: unknown): agreement is OrderAgreementInput {
  if (!agreement || typeof agreement !== 'object') return false;
  const a = agreement as Record<string, unknown>;
  if (typeof a.fullName !== 'string' || a.fullName.trim().length === 0) return false;
  if (!Array.isArray(a.agreedItemIds)) return false;
  // 順不同で5項目すべて含むこと（重複や余分な id は許容しない）
  if (a.agreedItemIds.length !== CONSENT_ITEM_IDS.length) return false;
  if (!CONSENT_ITEM_IDS.every((id) => (a.agreedItemIds as string[]).includes(id))) return false;
  if (a.termsVersion !== TERMS_VERSION) return false;
  return true;
}
