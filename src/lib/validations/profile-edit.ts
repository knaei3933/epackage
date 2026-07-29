/**
 * Profile Edit Validation Layer（顧客管理・管理者編集用）
 *
 * 役割: camelCase（フロント form）↔ snake_case（DB profiles）の変換を局所化する。
 *
 * 構成（3 層）:
 *   1. profileEditSchema       — 基本情報（camelCase）。registrationSchema（auth.ts:59-162）
 *                                 の基本情報フィールドと「同一のバリデーション intent」を持つ。
 *                                 編集対象外（email/password/passwordConfirm/privacyConsent）は含めない。
 *                                 building は registrationSchema に無いが DB に存在（database.ts:371）するため追加。
 *   2. mapProfileEditToSnakeCase — 検証済み camelCase を profiles UPDATE 用 snake_case へ変換。
 *   3. adminEditProfileSchema  — 運用項目（status・markup_rate・markup_rate_note）。
 *                                 profiles に実在する運用フィールドのみ（database.ts:387-388）。
 *
 * ※ admin_notes は quotations テーブルのフィールドで profiles には非存在（取り違え注意・含めない）。
 *
 * 消費元:
 *   - API route（タスク#2 /api/admin/customers/[id] PATCH）: 1+2 で基本情報 UPDATE、
 *     3 で運用項目 UPDATE（status はホワイトリスト方式で FORBIDDEN を再追加）。
 *   - 編集 UI（タスク#3 詳細ページ）: 1+3 を form resolver に使用。
 */

import { z } from 'zod';
import { BusinessType, ProductCategory } from '@/types/auth';

// =====================================================
// 1. profileEditSchema — 基本情報（camelCase）
// =====================================================
// registrationSchema（auth.ts）の基本情報フィールドと同一の検証 intent。
// registrationSchema を直接再利用しない理由:
//   - registrationSchema は email/password/passwordConfirm/privacyConsent を「必須」とし、
//     管理者編集（既存ユーザー更新）には適さないため。
//   - registrationSchema は `.refine` で ZodEffects 化しており .pick 不可。
// よって基本情報フィールドを独立定義（ルールは registrationSchema と同一）。

export const profileEditSchema = z.object({
  // 日本の氏名（漢字・カタカナ、姓・名別）
  kanjiLastName: z.union([
    z.string().max(50, '姓は50文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),
  kanjiFirstName: z.union([
    z.string().max(50, '名は50文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),
  kanaLastName: z.union([
    z
      .string()
      .regex(/^[぀-ゟ゠-ヿー\s]*$/, 'ひらがなで入力してください。')
      .max(50, '姓は50文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),
  kanaFirstName: z.union([
    z
      .string()
      .regex(/^[぀-ゟ゠-ヿー\s]*$/, 'ひらがなで入力してください。')
      .max(50, '名は50文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),

  // 電話番号
  corporatePhone: z.union([
    z
      .string()
      .regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号の形式ではありません。'),
    z.literal(''),
  ]).optional(),
  personalPhone: z.union([
    z
      .string()
      .regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号の形式ではありません。'),
    z.literal(''),
  ]).optional(),

  // 事業者種別
  businessType: z.nativeEnum(BusinessType).optional(),

  // 会社情報
  companyName: z.union([
    z.string().max(200, '会社名は200文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),
  legalEntityNumber: z.union([
    z.string().regex(/^\d{13}$/, '法人番号は13桁の数字である必要があります。'),
    z.literal(''),
  ]).optional(),
  position: z.union([
    z.string().max(100, '役職は100文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),
  department: z.union([
    z.string().max(100, '部署名は100文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),
  companyUrl: z.union([
    z.string().url('有効なURLを入力してください。'),
    z.literal(''),
  ]).optional(),

  // 製品カテゴリー
  productCategory: z.nativeEnum(ProductCategory).optional(),

  // 流入経路
  acquisitionChannel: z.union([
    z.string().max(100, '流入経路は100文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),

  // 住所情報
  postalCode: z.union([
    z
      .string()
      .regex(/^\d{3}-?\d{4}$/, '有効な郵便番号を入力してください。（例：123-4567）'),
    z.literal(''),
  ]).optional(),
  prefecture: z.union([z.string(), z.literal('')]).optional(),
  city: z.union([z.string(), z.literal('')]).optional(),
  street: z.union([z.string(), z.literal('')]).optional(),

  // 建物名（registrationSchema に無いが DB profiles に存在・database.ts:371）
  building: z.union([
    z.string().max(200, '建物名は200文字以内で入力してください。'),
    z.literal(''),
  ]).optional(),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;

// =====================================================
// 2. mapProfileEditToSnakeCase — camelCase → profiles snake_case
// =====================================================
// 検証済みの基本情報（ProfileEditFormData）を profiles UPDATE 用の
// snake_case オブジェクトへ変換する。
//
// 仕様:
//   - 空文字/undefined は null へ正規化（profiles の該当カラムは string | null）。
//   - email/password/passwordConfirm/privacyConsent は含めない（編集対象外）。
//   - 戻り値は Partial（API 側で他フィールドとマージして UPDATE する）。

export function mapProfileEditToSnakeCase(
  data: ProfileEditFormData,
): {
  kanji_last_name: string | null;
  kanji_first_name: string | null;
  kana_last_name: string | null;
  kana_first_name: string | null;
  corporate_phone: string | null;
  personal_phone: string | null;
  business_type: BusinessType | null;
  company_name: string | null;
  legal_entity_number: string | null;
  position: string | null;
  department: string | null;
  company_url: string | null;
  product_category: ProductCategory | null;
  acquisition_channel: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  street: string | null;
  building: string | null;
} {
  const toNullable = (v: string | undefined): string | null =>
    v === undefined || v === '' ? null : v;

  return {
    kanji_last_name: toNullable(data.kanjiLastName),
    kanji_first_name: toNullable(data.kanjiFirstName),
    kana_last_name: toNullable(data.kanaLastName),
    kana_first_name: toNullable(data.kanaFirstName),
    corporate_phone: toNullable(data.corporatePhone),
    personal_phone: toNullable(data.personalPhone),
    business_type: data.businessType ?? null,
    company_name: toNullable(data.companyName),
    legal_entity_number: toNullable(data.legalEntityNumber),
    position: toNullable(data.position),
    department: toNullable(data.department),
    company_url: toNullable(data.companyUrl),
    product_category: data.productCategory ?? null,
    acquisition_channel: toNullable(data.acquisitionChannel),
    postal_code: toNullable(data.postalCode),
    prefecture: toNullable(data.prefecture),
    city: toNullable(data.city),
    street: toNullable(data.street),
    building: toNullable(data.building),
  };
}

// =====================================================
// 3. adminEditProfileSchema — 運用項目（管理者専用）
// =====================================================
// profiles に実在する運用フィールドのみ（database.ts:387-388）。
// registrationSchema とは分離（会員登録用スキーマは運用項目を含まないため）。
//
// ※ admin_notes は quotations テーブルのフィールドで profiles には非存在（含めない）。

export const adminEditProfileSchema = z.object({
  // status: INVITED は「管理者招待中」の内部状態で管理者が直接切替すべきでないため除外。
  //   真正は enums.ts USER_STATUSES（5値）。ここでは編集可能な 4 値のみ許可。
  //   API 側（タスク#2）は FORBIDDEN_UPDATE_FIELDS で一旦 status を除外した上で、
  //   本スキーマが検証した status のみ sanitizedUpdates へ再追加する（ホワイトリスト方式）。
  //   optional 化: markup_rate 単独更新（status 未送信）時に400にならないよう必須→任意へ。
  //   API 側 PATCH は status 未指定（undefined）時は再追加せず、Supabase が undefined を除外する。
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED']).optional(),

  // markup_rate: 顧客別マークアップ率（default 0.5 = 50%）。
  //   0 以上の安全な範囲のみ許可（上限は運用実態に照らして緩めに設定）。
  markup_rate: z.number().min(0).max(10).optional(),

  // markup_rate_note: カスタムマークアップ率の備考。
  markup_rate_note: z
    .union([z.string().max(1000, '備考は1000文字以内で入力してください。'), z.literal('')])
    .optional(),
});

export type AdminEditProfileFormData = z.infer<typeof adminEditProfileSchema>;
