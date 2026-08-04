import { getJson, putJson, apiPost } from '@/lib/api-fetch';

export async function fetchSettings(): Promise<{ data: unknown }> {
  return getJson('/api/member/settings');
}

export async function updateSettings(data: unknown): Promise<void> {
  await putJson('/api/member/settings', data);
}

// =====================================================
// アカウント削除
// =====================================================
// サーバー（/api/member/delete-account）は confirmation + currentPassword で再認証する。
// postJson だとエラー時の生レスポンスがそのまま message に流れてしまうため、
// apiPost を直接使い、error_code ごとにユーザーフレンドリーなメッセージへ変換する。
// ※ 401（未認証）は apiFetch 内で自動的にサインイン画面へリダイレクトされる。
export interface DeleteAccountPayload {
  confirmation: 'DELETE';
  currentPassword: string;
}

export async function deleteAccount(data: DeleteAccountPayload): Promise<void> {
  const response = await apiPost('/api/member/delete-account', data);

  if (!response.ok) {
    // サーバーの error_code でメッセージを切り分け
    let serverError: { error?: string; error_code?: string } = {};
    try {
      serverError = await response.json();
    } catch {
      // JSON パース失敗時は汎用メッセージへフォールバック
    }

    // パスワード誤り（再認証失敗）は明示メッセージ
    if (serverError.error_code === 'INVALID_PASSWORD') {
      throw new Error('現在のパスワードが正しくありません。');
    }

    // 削除不可（有効な契約など）はサーバー側の理由をそのまま表示
    if (serverError.error) {
      throw new Error(serverError.error);
    }

    // バリデーションエラー等の汎用フォールバック
    throw new Error('アカウント削除に失敗しました。入力内容をご確認ください。');
  }

  // 成功時は本文を消費しておく（呼び出し元は成功のみ関心・パース失敗は無視）
  try {
    await response.json();
  } catch {
    // 本文パース失敗は無視（成功のみ関心）
  }
}
