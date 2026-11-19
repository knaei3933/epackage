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
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button, buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { CartItemComponent } from '@/components/cart/CartItem'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'

export default function CartPageClient() {
  const { items, cart, clearCart, isLoading } = useCart()

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleRequestQuote = async () => {
    try {
      // This would open a modal for quote request details
      // For now, redirect to quote calculator with cart items
      window.location.href = '/quote-simulator/?fromCart=true'
    } catch (error) {
      console.error('Failed to request quote:', error)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <PageHeader
        title="ショッピングカート"
        lead="製品仕様を確認し、詳細な見積計算や正式な見積依頼が可能です"
        actions={
          <Link href="/catalog" className={buttonVariants({ variant: 'outline', size: 'md' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            カタログに戻る
          </Link>
        }
      >
        {totalItems > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">{items.length} 種類の製品</Badge>
            <Badge variant="default">合計 {totalItems.toLocaleString()} 個</Badge>
          </div>
        )}
      </PageHeader>

      <Container size="6xl" className="py-12">
        <MotionWrapper delay={0.2}>
          {items.length === 0 ? (
            // Empty Cart State
            <div className="text-center py-16">
              <Card className="max-w-2xl mx-auto p-12">
                <div className="w-24 h-24 bg-bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-text-muted" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">カートは空です</h2>
                <p className="text-lg text-text-secondary mb-8">
                  製品をカートに追加して、見積計算を始めましょう
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <Link href="/catalog" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}>
                      <Package className="w-5 h-5 mr-2" />
                      製品カタログを見る
                    </Link>
                  <Link href="/quote-simulator" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}>
                      <Calculator className="w-5 h-5 mr-2" />
                      まず見積計算から始める
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
                    <h2 className="text-2xl font-bold text-text-primary">カート内容 ({items.length})</h2>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="text-error hover:bg-error-muted"
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
                    <Link href="/catalog" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}>
                      <Package className="w-5 h-5 mr-2" />
                      他の製品も見る
                    </Link>
                  </Card>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {cart && (
                    <Card className="p-6 border-brand bg-brand-subtle">
                      <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                        <Calculator className="w-6 h-6 mr-2 text-brand" />
                        注文概要
                      </h3>

                      <div className="space-y-4">
                        {/* Items Summary */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-text-primary">注文内容</h4>
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-text-secondary">
                                {item.product.name_ja} ({item.quantity.toLocaleString()}個)
                              </span>
                              <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">小計:</span>
                            <span className="font-medium">{formatCurrency(cart.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">消費税 (10%):</span>
                            <span className="font-medium">{formatCurrency(cart.tax)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">送料:</span>
                            <span className="font-medium">{formatCurrency(cart.shipping)}</span>
                          </div>
                          {cart.discount > 0 && (
                            <div className="flex justify-between text-sm text-success">
                              <span>割引:</span>
                              <span className="font-medium">-{formatCurrency(cart.discount)}</span>
                            </div>
                          )}
                          <div className="border-t pt-3">
                            <div className="flex justify-between text-xl font-bold">
                              <span>合計:</span>
                              <span className="text-brand">{formatCurrency(cart.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4">
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

                          <Link href="/quote-simulator" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}>
                              <FileText className="w-5 h-5 mr-2" />
                              見積依頼フォーム
                            </Link>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Information Cards */}
                  <Card className="p-4 bg-brand-muted border-brand">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-on-brand-muted">
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

                  <Card className="p-4 bg-success-muted border-success">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-on-success-muted">
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
        <section className="py-16 bg-bg-secondary border-t border-border-medium">
          <Container size="6xl">
            <MotionWrapper delay={0.3}>
              <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
                こちらの製品もおすすめ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* This would be populated with related products */}
                <Card className="p-6 text-center hover:shadow-low transition-shadow cursor-pointer">
                  <Package className="w-12 h-12 text-brand mx-auto mb-4" />
                  <h3 className="font-semibold text-text-primary mb-2">関連製品1</h3>
                  <p className="text-sm text-text-secondary">類似の用途で人気の製品</p>
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