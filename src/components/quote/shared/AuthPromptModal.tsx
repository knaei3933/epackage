'use client';

import React from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';

interface AuthPromptModalProps {
  onClose: () => void;
  onSignIn: () => void;
  onRegister: () => void;
}

export function AuthPromptModal({ onClose, onSignIn, onRegister }: AuthPromptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            会員限定機能
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            onClick={onSignIn}
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
      </div>
    </div>
  );
}
