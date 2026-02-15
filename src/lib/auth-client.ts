/**
 * Client-side Authentication Helpers
 *
 * クライアントコンポーネント用認証ヘルパー関数
 * - セッショントークンの取得
 * - 管理者認証ヘッダーの作成
 *
 * DEV MODEは完全に無効化されました
 */

import { supabase } from '@/lib/supabase-browser';

export interface AuthHeaders {
  'Content-Type': string;
  'Authorization'?: string;
}

/**
 * 現在のセッショントークンを取得
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[getSessionToken] Session:', session ? 'Found' : 'Not found');
    console.log('[getSessionToken] Access token:', session?.access_token ? 'Present' : 'Missing');
    return session?.access_token || null;
  } catch (error) {
    console.error('[getSessionToken] Error:', error);
    return null;
  }
}

/**
 * 現在のユーザーIDを取得
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('[getCurrentUserId] Error:', error);
    return null;
  }
}

/**
 * 管理者用APIリクエストヘッダーを取得
 *
 * Note: 認証はミドルウェアがクッキーから行い、x-user-id ヘッダーを設定します
 * クライアントからは Authorization ヘッダーを送信する必要はありません
 */
export function getAdminAuthHeaders(): AuthHeaders {
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * fetch関数のラッパー - 管理者用APIリクエスト
 *
 * Note: 認証はクッキーとミドルウェアによって行われます
 * credentials: 'include' でクッキーを送信し、ミドルウェアが x-user-id ヘッダーを設定します
 */
export function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // クッキーを送信してミドルウェアで認証
  });
}

/**
 * 会員用APIリクエストヘッダーを取得
 */
export async function getMemberAuthHeaders(): Promise<AuthHeaders> {
  const headers: AuthHeaders = {
    'Content-Type': 'application/json',
  };

  // 通常の認証（Bearerトークン）
  const token = await getSessionToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * fetch関数のラッパー - 会員用APIリクエストに認証ヘッダーを自動付与
 */
export async function memberFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getMemberAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
}
