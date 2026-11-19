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
        className="mx-4 w-full max-w-md rounded-container border border-border-medium bg-bg-primary p-6 shadow-high"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            id="auth-modal-title"
            className="flex items-center text-lg font-bold text-text-primary"
          >
            <Lock className="mr-2 h-5 w-5 text-brand" aria-hidden="true" />
            会員限定機能
          </h3>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mb-6 text-text-secondary">
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

        <p className="mt-4 text-center text-sm text-text-secondary">
          すでに会員の方は
          <Link
            href="/auth/signin"
            onClick={onClose}
            className="ml-1 inline-flex min-h-11 items-center text-brand underline underline-offset-4 hover:text-brand-pressed"
          >
            こちらからログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
