/**
 * Sample Request Form Validation Schemas
 *
 * Zod schemas for sample request form validation
 */

import { z } from 'zod'

// 配送先スキーマ
export const deliveryDestinationSchema = z.object({
  id: z.string(),
  companyName: z.string().optional(),
  contactPerson: z.string().min(1, '担当者を入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  postalCode: z.string().optional(),
  address: z.string().min(1, '住所を入力してください'),
  sameAsCustomer: z.boolean().optional()
})

// サンプルアイテムスキーマ
export const sampleItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, '商品名を入力してください'),
  productCategory: z.string().optional(),
  quantity: z.number().int().min(1, '数量は1以上を入力してください').max(10, '数量は10以下を入力してください')
})

// パウチサンプルリクエストバリデーションスキーマ
export const pouchSampleRequestSchema = z.object({
  kanjiLastName: z.string()
    .min(1, '姓（漢字）を入力してください')
    .min(1, '姓（漢字）は1文字以上で入力してください')
    .max(50, '姓（漢字）は50文字以内で入力してください'),
  kanjiFirstName: z.string()
    .min(1, '名（漢字）を入力してください')
    .min(1, '名（漢字）は1文字以上で入力してください')
    .max(50, '名（漢字）は50文字以内で入力してください'),
  kanaLastName: z.string()
    .min(1, '姓（ひらがな）を入力してください')
    .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力してください')
    .max(50, '姓（ひらがな）は50文字以内で入力してください'),
  kanaFirstName: z.string()
    .min(1, '名（ひらがな）を入力してください')
    .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力してください')
    .max(50, '名（ひらがな）は50文字以内で入力してください'),
  company: z.string()
    .max(100, '会社名は100文字以内で入力してください')
    .optional(),
  phone: z.string()
    .min(1, '電話番号を入力してください')
    .regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|\+81\d{1,4}-\d{1,4}-\d{4})$/,
      '有効な電話番号を入力してください（例: 03-1234-5678）'),
  fax: z.string()
    .optional()
    .refine(val => !val || /^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|\+81\d{1,4}-\d{1,4}-\d{4})$/.test(val),
      '有効なFAX番号を入力してください（例: 03-1234-5678）'),
  email: z.string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  postalCode: z.string()
    .optional()
    .refine(val => !val || /^\d{3}-\d{4}$/.test(val), '有効な郵便番号を入力してください（例: 100-0001）'),
  address: z.string()
    .max(200, '住所は200文字以内で入力してください')
    .optional(),
  message: z.string()
    .min(10, 'お問い合わせ内容は10文字以上で入力してください')
    .max(500, 'お問い合わせ内容は500文字以内で入力してください'),
  agreement: z.boolean().refine(val => val === true, '個人情報保護方針に同意してください'),

  // 配送タイプ
  deliveryType: z.enum(['normal', 'other'], {
    required_error: '配送タイプを選択してください'
  }),

  // 配送先リスト（複数可能）
  deliveryDestinations: z.array(deliveryDestinationSchema).min(1, '少なくとも1つの配送先を入力してください'),

  // サンプルアイテム（最大5つ）
  sampleItems: z.array(sampleItemSchema).min(1, '少なくとも1つのサンプルを選択してください').max(5, 'サンプルは最大5点までです')
})

export type PouchSampleRequestFormData = z.infer<typeof pouchSampleRequestSchema>
export type DeliveryDestinationFormData = z.infer<typeof deliveryDestinationSchema>
