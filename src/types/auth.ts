/**
 * Authentication & User Types
 *
 * 회원 인증 시스템을 위한 타입 정의입니다.
 * - Zod 스키마
 * - Prisma 기반 타입
 * - API 요청/응답 타입
 */

import { z } from 'zod';

// =====================================================
// Enums
// =====================================================

export enum BusinessType {
  INDIVIDUAL = 'INDIVIDUAL', // 개인
  CORPORATION = 'CORPORATION', // 법인
}

export enum ProductCategory {
  COSMETICS = 'COSMETICS', // 화장품
  CLOTHING = 'CLOTHING', // 의류
  ELECTRONICS = 'ELECTRONICS', // 가전제품
  KITCHEN = 'KITCHEN', // 주방용품
  FURNITURE = 'FURNITURE', // 가구
  OTHER = 'OTHER', // 기타
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum UserStatus {
  PENDING = 'PENDING', // 승인 대기
  ACTIVE = 'ACTIVE', // 활성
  SUSPENDED = 'SUSPENDED', // 정지
  DELETED = 'DELETED', // 삭제
}

// =====================================================
// Japanese Name Types
// =====================================================

export interface JapaneseName {
  kanji: string; // 한자
  kana: string; // 히라가나
}

// =====================================================
// Registration Form Schema
// =====================================================

export const registrationSchema = z
  .object({
    // 인증 정보
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

    // 日本の氏名（漢字・ひらがな、姓・名別）
    kanjiLastName: z
      .string()
      .min(1, '姓（漢字）を入力してください。')
      .max(50, '姓は50文字以内で入力してください。')
      .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
    kanjiFirstName: z
      .string()
      .min(1, '名（漢字）を入力してください。')
      .max(50, '名は50文字以内で入力してください。')
      .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
    kanaLastName: z
      .string()
      .min(1, '姓（ひらがな）を入力してください。')
      .max(50, '姓は50文字以内で入力してください。')
      .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),
    kanaFirstName: z
      .string()
      .min(1, '名（ひらがな）を入力してください。')
      .max(50, '名は50文字以内で入力してください。')
      .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),

    // 전화번호 (선택적 필드)
    corporatePhone: z.union([
      z.string().regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号の形式ではありません。'),
      z.literal('')
    ]).optional(),
    personalPhone: z.union([
      z.string().regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号の形式ではありません。'),
      z.literal('')
    ]).optional(),

    // 사업자 유형
    businessType: z.nativeEnum(BusinessType, {
      errorMap: () => ({ message: '業種を選択してください。' }),
    }),

    // 회사 정보 (선택적 필드)
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

    // 제품 카테고리
    productCategory: z.nativeEnum(ProductCategory, {
      errorMap: () => ({ message: '製品カテゴリーを選択してください。' }),
    }),

    // 유입 경로 (선택적 필드)
    acquisitionChannel: z.union([
      z.string().max(100, '流入経路は100文字以内で入力してください。'),
      z.literal('')
    ]).optional(),

    // 주소 정보 (선택적 필드)
    postalCode: z.union([
      z.string().regex(/^\d{3}-?\d{4}$/, '有効な郵便番号の形式ではありません。（例：123-4567）'),
      z.literal('')
    ]).optional(),
    prefecture: z.union([z.string(), z.literal('')]).optional(),
    city: z.union([z.string(), z.literal('')]).optional(),
    street: z.union([z.string(), z.literal('')]).optional(),

    // 개인정보 수신 동의
    privacyConsent: z.literal(true, {
      errorMap: () => ({ message: '個人情報の収集および利用に同意してください。' }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードが一致しません。',
    path: ['passwordConfirm'],
  })
  .refine(
    (data) => {
      // 법인 사업자인 경우 법인번호 필수
      if (data.businessType === BusinessType.CORPORATION) {
        return !!data.legalEntityNumber && data.legalEntityNumber.length === 13;
      }
      return true;
    },
    {
      message: '法人事業者は法人番号を入力する必要があります。',
      path: ['legalEntityNumber'],
    }
  );

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
  corporateId: string; // 법인번호
  name: string; // 회사명
  prefecture: string; // 도도부현
  city: string; // 시구정촌
  address: string; // 상세주소
}

export interface LegalEntitySearchResponse {
  success: boolean;
  data?: LegalEntityInfo[];
  error?: string;
}

// =====================================================
// Header Authentication Navigation Types
// Based on docs/수정사항.md
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
