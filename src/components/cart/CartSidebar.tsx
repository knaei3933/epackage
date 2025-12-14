'use client'

import React from 'react'
import {
  ShoppingCart,
  X,
  Plus,
  ArrowRight,
  Calculator,
  FileText,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, cart, clearCart } = useCart()

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-brixa-700" />
            <h2 className="text-lg font-semibold text-gray-900">ショッピングカート</h2>
            {totalItems > 0 && (
              <Badge variant="metallic" className="px-2 py-1 text-xs">
                {totalItems}個
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">カートは空です</h3>
              <p className="text-gray-600 mb-6">
                製品をカートに追加して見積もりを開始しましょう
              </p>
              <div className="space-y-3 w-full max-w-xs">
                <Link href="/catalog" onClick={onClose}>
                  <Button variant="primary" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    製品カタログを見る
                  </Button>
                </Link>
                <Link href="/quote-simulator/" onClick={onClose}>
                  <Button variant="outline" className="w-full">
                    <Calculator className="w-4 h-4 mr-2" />
                    見積計算
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Cart Items Summary */}
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {item.product.name_ja}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {item.quantity.toLocaleString()}個 × {formatCurrency(item.unitPrice)}
                        </p>
                        {item.specifications.material && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Badge variant="outline" className="text-xs">
                              {item.specifications.material}
                            </Badge>
                            {item.specifications.thickness && (
                              <span className="text-gray-500">
                                {item.specifications.thickness}μm
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brixa-700">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Cart Summary */}
              {cart && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">カート概要</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">小計:</span>
                      <span className="font-medium">{formatCurrency(cart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">消費税:</span>
                      <span className="font-medium">{formatCurrency(cart.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">送料:</span>
                      <span className="font-medium">{formatCurrency(cart.shipping)}</span>
                    </div>
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>割引:</span>
                        <span className="font-medium">-{formatCurrency(cart.discount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>合計:</span>
                        <span className="text-brixa-700">{formatCurrency(cart.total)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="border-t bg-white p-4 space-y-3">
            <Link href="/cart" onClick={onClose}>
              <Button variant="primary" className="w-full justify-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                カート詳細を見る
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/quote-simulator/" onClick={onClose}>
                <Button variant="outline" className="w-full justify-center">
                  <Calculator className="w-4 h-4 mr-1" />
                  見積計算
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => {
                  clearCart()
                  onClose()
                }}
              >
                <FileText className="w-4 h-4 mr-1" />
                カートを空に
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              カートの内容は自動的に保存されます
            </p>
          </div>
        )}
      </div>
    </>
  )
}