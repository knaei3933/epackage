'use client';

import React, { useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthPromptModalProps {
  onClose: () => void;
  /** ログイン成功時（モーダルを閉じて見積もり計算を再開する） */
  onSuccess: () => void;
  /** 会員登録画面へ遷移 */
  onRegister: () => void;
}

/**
 * 会員誘導モーダル。
 * - prompt モード: 会員登録 / ログイン ボタンを表示
 * - signin モード: ページ遷移せずインラインでログインフォームを表示（入力状態を維持）
 */
export function AuthPromptModal({ onClose, onSuccess, onRegister }: AuthPromptModalProps) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'prompt' | 'signin'>('prompt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'prompt' ? '会員限定機能' : 'ログイン'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'prompt' ? (
          <>
            <p className="text-gray-600 mb-6">
              見積もりを作成するには会員登録またはログインが必要です。
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onRegister}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                会員登録（無料）
              </button>
              <button
                onClick={() => { setMode('signin'); setError(null); }}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                ログイン
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors py-2"
              >
                後で行う
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="•••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('prompt'); setError(null); }}
              className="text-gray-500 hover:text-gray-700 transition-colors py-2"
            >
              戻る
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
