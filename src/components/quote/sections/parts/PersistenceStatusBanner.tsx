/**
 * Persistence status banner shown after auto-save.
 */

import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PersistenceStatus {
  status: 'idle' | 'success' | 'error';
  message: string;
  quotationNumber?: string | null;
}

interface PersistenceStatusBannerProps {
  persistenceStatus: PersistenceStatus;
  userId?: string | null;
  setPersistenceStatus: (status: PersistenceStatus) => void;
}

export function PersistenceStatusBanner({ persistenceStatus, userId, setPersistenceStatus }: PersistenceStatusBannerProps) {
  return (
    <>
      {persistenceStatus.status === 'success' && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">{persistenceStatus.message}</p>
            {persistenceStatus.quotationNumber && (
              <p className="text-sm text-green-700 mt-1">見積番号: {persistenceStatus.quotationNumber}</p>
            )}
            {userId && (
              <a href="/member/quotations" className="inline-block mt-2 text-sm font-medium text-green-700 underline hover:text-green-900">
                見積一覧を確認する →
              </a>
            )}
            {!userId && persistenceStatus.message.includes('一時保存') && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/auth/signin" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  ログインして見積を保存 →
                </a>
                <a href="/auth/register" className="inline-flex items-center px-4 py-2 bg-white border-2 border-blue-300 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">
                  新規会員登録
                </a>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPersistenceStatus({ status: 'idle', message: '' })}
            className="text-green-400 hover:text-green-700"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      )}
      {persistenceStatus.status === 'error' && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">見積の保存に失敗しました</p>
            <p className="text-sm text-red-700 mt-1">{persistenceStatus.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setPersistenceStatus({ status: 'idle', message: '' })}
            className="text-red-400 hover:text-red-700"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
