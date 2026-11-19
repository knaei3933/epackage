/**
 * Sample Request Modal
 *
 * サンプルリクエストモーダル
 * 製品カードから直接サンプルリクエストフォームを開くためのモーダルコンポーネント
 */

'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { PackageProduct } from '@/types/catalog'
import PouchSampleRequestForm from './SampleRequestForm'

interface SampleRequestModalProps {
  isOpen: boolean
  onClose: () => void
  product: PackageProduct | null
}

export function SampleRequestModal({ isOpen, onClose, product }: SampleRequestModalProps) {
  // スクロール防止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-request-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-bg-primary rounded-container">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border-medium bg-bg-primary">
          <div className="flex items-center gap-3">
            {product && (
              <>
                <div className="w-10 h-10 bg-brand rounded-container flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SR</span>
                </div>
                <div>
                  <h2
                    id="sample-request-modal-title"
                    className="text-xl font-semibold text-text-primary"
                  >
                    サンプルリクエスト
                  </h2>
                  {product && (
                    <p className="text-sm text-text-muted">
                      {product.name}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-secondary hover:bg-brand-subtle rounded-container transition-colors"
            aria-label="モーダルを閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Sample Request Form */}
        <div className="p-6">
          <PouchSampleRequestForm />
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for Sample Request Modal State
 */
export interface UseSampleRequestModalResult {
  isOpen: boolean
  openSampleRequestModal: (product: PackageProduct) => void
  closeSampleRequestModal: () => void
  selectedProduct: PackageProduct | null
}

export function useSampleRequestModal(): UseSampleRequestModalResult {
  const [state, setState] = useState<{
    isOpen: boolean
    selectedProduct: PackageProduct | null
  }>({
    isOpen: false,
    selectedProduct: null,
  })

  const openSampleRequestModal = (product: PackageProduct) => {
    setState({
      isOpen: true,
      selectedProduct: product,
    })
  }

  const closeSampleRequestModal = () => {
    setState({
      isOpen: false,
      selectedProduct: null,
    })
  }

  return {
    isOpen: state.isOpen,
    openSampleRequestModal,
    closeSampleRequestModal,
    selectedProduct: state.selectedProduct,
  }
}
