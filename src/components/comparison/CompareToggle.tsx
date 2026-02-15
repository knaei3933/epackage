'use client'

import React from 'react'
import {
  GitCompare,
  X,
  Check,
  BarChart3,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useComparison } from '@/contexts/ComparisonContext'
import { motion, AnimatePresence } from 'framer-motion'
export function CompareToggle() {
  const {
    state,
    toggleCompareMode,
    toggleProductSelection,
    isProductSelected,
    removeProduct,
    canAddMore,
    getRemainingSlots
  } = useComparison()

  const selectedProducts = state.selectedProducts

  if (!state.compareMode && selectedProducts.length === 0) {
    return (
      <Button
        variant="outline"
        onClick={toggleCompareMode}
        className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-300"
      >
        <GitCompare className="w-4 h-4" />
        <span>製品を比較</span>
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[300px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <GitCompare className="w-5 h-5 text-brixa-600" />
              <h3 className="font-semibold text-gray-900">製品比較</h3>
              {selectedProducts.length > 0 && (
                <Badge variant="metallic" className="text-xs">
                  {selectedProducts.length}/4
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCompareMode}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-gray-600">
                最大4個まで製品を選択して比較できます
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {selectedProducts.length}個の製品を選択中
                </p>
                {canAddMore && (
                  <p className="text-xs text-brixa-700 font-medium">
                    あと{getRemainingSlots}個選択できます
                  </p>
                )}
                {!canAddMore && (
                  <p className="text-xs text-red-600 font-medium">
                    最大選択数に達しました
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Selected Products */}
          <AnimatePresence>
            {selectedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <h4 className="text-sm font-medium text-gray-700">選択中の製品:</h4>
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Package className="w-4 h-4 text-brixa-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {product.name_ja}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="pt-3 border-t space-y-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={selectedProducts.length < 2}
                    onClick={() => {
                      // Navigate to comparison page or show comparison modal
                      window.location.href = '/compare'
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    詳細を比較
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Clear selection will be handled by context
                      toggleCompareMode()
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    比較を終了
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          {selectedProducts.length === 0 && (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500 mb-3">
                製品カードの比較ボタンをクリックして選択してください
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCompareMode}
                className="text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}