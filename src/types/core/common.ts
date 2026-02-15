/**
 * Core Common Types
 *
 * 共通型定義 - アプリケーション全体で使用される基本型
 * @module types/core/common
 */

// =====================================================
// Base Response Types
// =====================================================

/**
 * 基本APIレスポンス構造
 */
export interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * 標準APIレスポンス（api-responses.tsから統合）
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * エラー詳細情報
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string; // Development only
}

/**
 * エラーレスポンス（api-responses.tsから統合）
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string | Record<string, string[]>;
  code?: string;
}

// =====================================================
// JSON Type
// =====================================================

/**
 * JSON型 - データベースのJSONBカラム用
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =====================================================
// ID & Timestamp Types
// =====================================================

/**
 * IDタイプ（文字列ID）
 */
export type Id = string;

/**
 * タイムスタンプタイプ（ISO 8601）
 */
export type Timestamp = string;

/**
 * 日付タイプ（ISO 8601 date string）
 */
export type DateString = string;

// =====================================================
// Utility Types
// =====================================================

/**
 * 成功/失敗結果タイプ
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

// =====================================================
// Form Types
// =====================================================

/**
 * お問い合わせフォーム
 */
export interface ContactForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  inquiryType: string;
  productInterest?: string;
  message: string;
  privacyConsent: boolean;
  newsletterConsent?: boolean;
}

/**
 * サンプルリクエストフォーム
 */
export interface SampleRequestForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address: string;
  productTypes: string[];
}

// =====================================================
// Address Types
// =====================================================

/**
 * 配送/請求先住所インターフェース
 */
export interface Address {
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  company: string;
  contactName: string;
  phone: string;
}

// =====================================================
// Pagination Types
// =====================================================

/**
 * ページネーションパラメータ
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * ページネーションされたレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    count: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * 範囲ベースページネーションレスポンス（カーソルベース）
 */
export interface RangeResponse<T> {
  data: T[];
  range: {
    offset: number;
    limit: number;
    total: number;
    remaining: number;
  };
}

// =====================================================
// Search Types
// =====================================================

/**
 * 検索パラメータ
 */
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: PaginationParams;
}

/**
 * 検索結果
 */
export interface SearchResult<T> {
  items: T[];
  total: number;
  searchTime: number; // milliseconds
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
}
