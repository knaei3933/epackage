'use client'

import { useState } from 'react'
import { X, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
}

export function AuthModal({ isOpen, onClose, featureName }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            id="auth-modal-title"
            className="text-lg font-semibold flex items-center text-gray-900 dark:text-white"
          >
            <Lock className="w-5 h-5 mr-2 text-brixa-600" />
            会員限定機能
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          「{featureName}」機能は会員登録後にご利用いただけます。
        </p>

        <div className="space-y-3">
          <Link href="/auth/register" onClick={onClose} className="block">
            <Button variant="primary" fullWidth>
              会員登録して利用する
            </Button>
          </Link>
          <Button variant="ghost" fullWidth onClick={onClose}>
            キャンセル
          </Button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
          すでに会員の方は
          <Link
            href="/auth/signin"
            onClick={onClose}
            className="text-brixa-600 hover:text-brixa-700 hover:underline ml-1"
          >
            こちらからログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
