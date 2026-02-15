/**
 * Authentication & User Types
 *
 * 会員認証システムの型定義
 * - Zod スキーマ
 * - Phone validation (at least one required)
 * - Prisma ベースの型
 * - API リクエスト/レスポンスの型
 */

import { z } from 'zod';

// =====================================================
// Enums
// =====================================================

export enum BusinessType {
  INDIVIDUAL = 'INDIVIDUAL', // 個人
  CORPORATION = 'CORPORATION', // 法人
}

export enum ProductCategory {
  COSMETICS = 'COSMETICS', // 化粧品
  CLOTHING = 'CLOTHING', // 衣類
  ELECTRONICS = 'ELECTRONICS', // 家電製品
  KITCHEN = 'KITCHEN', // 台所用品
  FURNITURE = 'FURNITURE', // 家具
  OTHER = 'OTHER', // その他
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum UserStatus {
  PENDING = 'PENDING', // 承認待ち
  ACTIVE = 'ACTIVE', // アクティブ
  SUSPENDED = 'SUSPENDED', // 停止
  DELETED = 'DELETED', // 削除
}

// =====================================================
// Japanese Name Types
// =====================================================

export interface JapaneseName {
  kanji: string; // 漢字
  kana: string; // ひらがな
}

// =====================================================
// Registration Form Schema
// =====================================================

export const registrationSchema = z
  .object({
    // 認証情報（必須）
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください。')
      .email('有効なメールアドレスを入力してください。'),
    password: z
      .string()
      .min(8, 'パスワードは最低8文字以上である必要があります。')
      .regex(/[A-Z]/, 'パスワードには少なくとも1つの大文字を含める必要があります。')
      .regex(/[a-z]/, 'パスワードには少なくとも1つの小文字を含める必要があります。')
      .regex(/[0-9]/, 'パスワードには少なくとも1つの数字を含める必要があります。'),
    passwordConfirm: z.string().min(1, 'パスワード確認を入力してください。'),

    // 日本の氏名（漢字・ひらがな、姓・名別）- オプション化
    kanjiLastName: z.union([
      z.string().max(50, '姓は50文字以内で入力してください。'),
      z.literal('')
    ]).optional(),
    kanjiFirstName: z.union([
      z.string().max(50, '名は50文字以内で入力してください。'),
      z.literal('')
    ]).optional(),
    kanaLastName: z.union([
      z.string().max(50, '姓は50文字以内で入力してください。'),
      z.literal('')
    ]).optional(),
    kanaFirstName: z.union([
      z.string().max(50, '名は50文字以内で入力してください。'),
      z.literal('')
    ]).optional(),

    // 電話番号 - オプション化
    corporatePhone: z.union([
      z.string().regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号の形式ではありません。'),
      z.literal('')
    ]).optional(),
    personalPhone: z.union([
      z.string().regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号の形式ではありません。'),
      z.literal('')
    ]).optional(),

    // 事業者種別 - オプション化
    businessType: z.nativeEnum(BusinessType).optional(),

    // 会社情報（オプションフィールド）
    companyName: z.union([
      z.string().max(200, '会社名は200文字以内で入力してください。'),
      z.literal('')
    ]).optional(),
    legalEntityNumber: z.union([
      z.string().regex(/^\d{13}$/, '法人番号は13桁の数字である必要があります。'),
      z.literal('')
    ]).optional(),
    position: z.union([
      z.string().max(100, '役職は100文字以内で入力してください。'),
      z.literal('')
    ]).optional(),
    department: z.union([
      z.string().max(100, '部署名は100文字以内で入力してください。'),
      z.literal('')
    ]).optional(),
    companyUrl: z.union([
      z.string().url('有効なURLを入力してください。'),
      z.literal('')
    ]).optional(),

    // 製品カテゴリー - オプション化
    productCategory: z.nativeEnum(ProductCategory).optional(),

    // 流入経路（オプションフィールド）
    acquisitionChannel: z.union([
      z.string().max(100, '流入経路は100文字以内で入力してください。'),
      z.literal('')
    ]).optional(),

    // 住所情報 - オプション化
    postalCode: z.union([
      z.string().regex(/^\d{3}-?\d{4}$/, '有効な郵便番号を入力してください。（例：123-4567）'),
      z.literal('')
    ]).optional(),
    prefecture: z.union([
      z.string(),
      z.literal('')
    ]).optional(),
    city: z.union([
      z.string(),
      z.literal('')
    ]).optional(),
    street: z.union([
      z.string(),
      z.literal('')
    ]).optional(),

    // 個人情報の収集および利用への同意（必須）
    privacyConsent: z.literal(true, {
      errorMap: () => ({ message: '個人情報の収集および利用に同意してください。' }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードが一致しません。',
    path: ['passwordConfirm'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// =====================================================
// Login Form Schema
// =====================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('有効なメールアドレスを入力してください。'),
  password: z.string().min(1, 'パスワードを入力してください。'),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// =====================================================
// User Types
// =====================================================

export interface User {
  id: string;
  email: string;
  emailVerified?: Date | null;
  kanjiLastName?: string | null;
  kanjiFirstName?: string | null;
  kanaLastName?: string | null;
  kanaFirstName?: string | null;
  corporatePhone?: string | null;
  personalPhone?: string | null;
  businessType?: BusinessType | null;
  companyName?: string | null;
  legalEntityNumber?: string | null;
  position?: string | null;
  department?: string | null;
  companyUrl?: string | null;
  productCategory?: ProductCategory | null;
  acquisitionChannel?: string | null;
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  street?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

// =====================================================
// API Response Types
// =====================================================

export interface RegistrationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    nameKanji?: string;
    nameKana?: string;
    status: UserStatus;
  };
  error?: string;
  details?: Record<string, string[]>;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
}

// =====================================================
// Legal Entity Number API Types
// =====================================================

export interface LegalEntityInfo {
  corporateId: string; // 法人番号
  name: string; // 会社名
  prefecture: string; // 都道府県
  city: string; // 市区町村
  address: string; // 詳細住所
}

export interface LegalEntitySearchResponse {
  success: boolean;
  data?: LegalEntityInfo[];
  error?: string;
}

// =====================================================
// Header Authentication Navigation Types
// Based on docs/修正項目.md
// =====================================================

// Session type for authentication context
export interface Session {
  token: string;
  expires: string | Date; // API returns Date object
}

// AuthState for authentication context
export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Navigation item extensions for authentication
export interface NavigationItemAuth {
  requireAuth?: boolean;      // Show only when authenticated
  hideWhenAuth?: boolean;     // Hide when authenticated
  showWhenAuth?: boolean;     // Show only when authenticated
}

// =====================================================
// Password Reset Types
// =====================================================

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('有効なメールアドレスを入力してください。'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'パスワードは最低8文字以上である必要があります。')
      .regex(/[A-Z]/, 'パスワードには少なくとも1つの大文字を含める必要があります。')
      .regex(/[a-z]/, 'パスワードには少なくとも1つの小文字を含める必要があります。')
      .regex(/[0-9]/, 'パスワードには少なくとも1つの数字を含める必要があります。'),
    passwordConfirm: z.string().min(1, 'パスワード確認を入力してください。'),
    token: z.string().min(1, 'トークンが無効です。'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードが一致しません。',
    path: ['passwordConfirm'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Password Reset API Response Types
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}
