'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Calculator,
  FileText,
  AlertCircle,
  CheckCircle,
  CreditCard
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { CartItemComponent } from '@/components/cart/CartItem'
import { useCart } from '@/contexts/CartContext'

export default function CartPageClient() {
  const { items, cart, clearCart, requestQuote, isLoading } = useCart()

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleRequestQuote = async () => {
    try {
      // This would open a modal for quote request details
      // For now, redirect to quote calculator with cart items
      window.location.href = '/roi-calculator/?fromCart=true'
    } catch (error) {
      console.error('Failed to request quote:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brixa-50">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brixa-600/30 via-transparent to-navy-600/30"></div>
        <Container size="6xl" className="relative z-10 py-8">
          <MotionWrapper delay={0.1}>
            <Link href="/catalog">
              <Button variant="outline" className="inline-flex items-center mb-6 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                カタログに戻る
              </Button>
            </Link>

            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brixa-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">ショッピングカート</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                製品仕様を確認し、詳細な見積計算や正式な見積依頼が可能です
              </p>
              {totalItems > 0 && (
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <Badge variant="secondary" className="text-lg px-6 py-3 bg-brixa-600 text-brixa-600 border-brixa-600">
                    {items.length} 種類の製品
                  </Badge>
                  <Badge variant="secondary" className="text-lg px-6 py-3 bg-navy-600 text-navy-600 border-navy-600">
                    合計 {totalItems.toLocaleString()} 個
                  </Badge>
                </div>
              )}
            </div>
          </MotionWrapper>
        </Container>
      </section>

      <Container size="6xl" className="py-12">
        <MotionWrapper delay={0.2}>
          {items.length === 0 ? (
            // Empty Cart State
            <div className="text-center py-16">
              <Card className="max-w-2xl mx-auto p-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">カートは空です</h2>
                <p className="text-lg text-gray-600 mb-8">
                  製品をカートに追加して、見積計算を始めましょう
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <Link href="/catalog">
                    <Button variant="primary" size="lg" className="w-full">
                      <Package className="w-5 h-5 mr-2" />
                      製品カタログを見る
                    </Button>
                  </Link>
                  <Link href="/roi-calculator/">
                    <Button variant="outline" size="lg" className="w-full">
                      <Calculator className="w-5 h-5 mr-2" />
                      まず見積計算から始める
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          ) : (
            // Cart with Items
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">カート内容 ({items.length})</h2>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      すべて削除
                    </Button>
                  </div>

                  {items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}

                  {/* Continue Shopping */}
                  <Card className="p-6 text-center">
                    <Link href="/catalog">
                      <Button variant="outline" size="lg" className="w-full">
                        <Package className="w-5 h-5 mr-2" />
                        他の製品も見る
                      </Button>
                    </Link>
                  </Card>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {cart && (
                    <Card className="p-6 bg-gradient-to-br from-brixa-50 to-brixa-100 border-brixa-600">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Calculator className="w-6 h-6 mr-2 text-brixa-600" />
                        注文概要
                      </h3>

                      <div className="space-y-4">
                        {/* Items Summary */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">注文内容</h4>
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.product.name_ja} ({item.quantity.toLocaleString()}個)
                              </span>
                              <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">小計:</span>
                            <span className="font-medium">{formatCurrency(cart.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">消費税 (10%):</span>
                            <span className="font-medium">{formatCurrency(cart.tax)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">送料:</span>
                            <span className="font-medium">{formatCurrency(cart.shipping)}</span>
                          </div>
                          {cart.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>割引:</span>
                              <span className="font-medium">-{formatCurrency(cart.discount)}</span>
                            </div>
                          )}
                          <div className="border-t pt-3">
                            <div className="flex justify-between text-xl font-bold">
                              <span>合計:</span>
                              <span className="text-brixa-700">{formatCurrency(cart.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4">
                          <Link href="/checkout">
                            <Button
                              variant="primary"
                              size="lg"
                              className="w-full bg-gradient-to-r from-brixa-600 to-amber-600 hover:from-brixa-700 hover:to-amber-700"
                            >
                              <CreditCard className="w-5 h-5 mr-2" />
                              レジに進む
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="lg"
                            onClick={handleRequestQuote}
                            disabled={isLoading}
                            className="w-full"
                          >
                            <Calculator className="w-5 h-5 mr-2" />
                            {isLoading ? '処理中...' : '詳細見積計算'}
                          </Button>

                          <Link href="/roi-calculator/">
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full"
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              見積依頼フォーム
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Information Cards */}
                  <Card className="p-4 bg-navy-50 border-navy-600">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-navy-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-navy-600">
                        <h4 className="font-semibold mb-1">ご注意</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• 表示価格は参考価格です</li>
                          <li>• 実際の価格は仕様や数量により変動します</li>
                          <li>• 大口注文の場合、割引が適用される場合があります</li>
                          <li>• 正確なお見積もりについては詳細計算をご利用ください</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-700">
                        <h4 className="font-semibold mb-1">カートの特長</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• 自動保存で内容が失われません</li>
                          <li>• 仕様の詳細なカスタマイズが可能</li>
                          <li>• リアルタイム価格計算機能</li>
                          <li>• 複数製品の同時見積対応</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </MotionWrapper>
      </Container>

      {/* Related Products Section */}
      {items.length > 0 && (
        <section className="py-16 bg-white border-t">
          <Container size="6xl">
            <MotionWrapper delay={0.3}>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                こちらの製品もおすすめ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* This would be populated with related products */}
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <Package className="w-12 h-12 text-brixa-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">関連製品1</h3>
                  <p className="text-sm text-gray-600">類似の用途で人気の製品</p>
                </Card>
                {/* Add more related products as needed */}
              </div>
            </MotionWrapper>
          </Container>
        </section>
      )}
    </div>
  )
}