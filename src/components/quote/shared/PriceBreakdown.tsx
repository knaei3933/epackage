'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Download,
  Mail,
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Info,
  TrendingUp,
  AlertCircle,
  FileText,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Grid } from '@/components/ui/Grid'
import { Badge } from '@/components/ui/Badge'
import { QuoteResult } from '@/lib/pricing-engine'

interface PriceBreakdownProps {
  quotes: QuoteResult[]
  customerInfo: {
    companyName: string
    contactPerson: string
    email: string
    phone?: string
  }
  onEdit: () => void
}

interface DetailedQuote {
  index: number
  product: any
  quantity: number
  quote: QuoteResult
  isExpanded: boolean
}

export function PriceBreakdown({ quotes, customerInfo, onEdit }: PriceBreakdownProps) {
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set())
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Calculate totals
  const totalMaterial = quotes.reduce((sum, quote) => sum + quote.breakdown.material, 0)
  const totalProcessing = quotes.reduce((sum, quote) => sum + quote.breakdown.processing, 0)
  const totalPrinting = quotes.reduce((sum, quote) => sum + quote.breakdown.printing, 0)
  const totalSetup = quotes.reduce((sum, quote) => sum + quote.breakdown.setup, 0)
  const totalDiscount = quotes.reduce((sum, quote) => sum + quote.breakdown.discount, 0)
  const totalDelivery = quotes.reduce((sum, quote) => sum + quote.breakdown.delivery, 0)
  const totalSubtotal = quotes.reduce((sum, quote) => sum + quote.breakdown.subtotal, 0)
  const totalPrice = quotes.reduce((sum, quote) => sum + quote.breakdown.total, 0)
  const totalQuantity = quotes.reduce((sum, quote) => 0, 0) // This would need to be passed from parent

  const averageUnitPrice = totalQuantity > 0 ? totalPrice / totalQuantity : 0
  const maxLeadTime = Math.max(...quotes.map(quote => quote.leadTimeDays))
  const minOrderQuantity = Math.max(...quotes.map(quote => quote.minOrderQuantity))

  // Toggle quote expansion
  const toggleQuoteExpansion = (index: number) => {
    const newExpanded = new Set(expandedQuotes)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQuotes(newExpanded)
  }

  // Generate PDF quotation
  const generatePdf = async () => {
    setIsGeneratingPdf(true)
    try {
      // This would integrate with a PDF generation service
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('PDF generated')
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Send quotation via email
  const sendQuotationEmail = async () => {
    setIsSendingEmail(true)
    try {
      // This would integrate with an email service
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Email sent')
    } catch (error) {
      console.error('Email sending error:', error)
    } finally {
      setIsSendingEmail(false)
    }
  }

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const getDiscountRate = () => {
    if (totalSubtotal === 0) return 0
    return Math.round((totalDiscount / totalSubtotal) * 100)
  }

  const getValidUntil = () => {
    const validDate = new Date()
    validDate.setDate(validDate.getDate() + 30)
    return validDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">見積結果</h2>
        <p className="text-gray-600">お見積もり内容をご確認ください</p>
      </div>

      {/* Customer Information */}
      <Card className="bg-gradient-to-r from-navy-50 to-navy-100 border-navy-600">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-navy-600" />
              お客様情報
            </h3>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              編集
            </Button>
          </div>

          <Grid xs={1} sm={2} lg={4} gap={4}>
            <div>
              <p className="text-sm text-gray-600">会社名</p>
              <p className="font-medium text-gray-900">{customerInfo.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ご担当者</p>
              <p className="font-medium text-gray-900">{customerInfo.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">メールアドレス</p>
              <p className="font-medium text-gray-900">{customerInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">電話番号</p>
              <p className="font-medium text-gray-900">{customerInfo.phone || '未入力'}</p>
            </div>
          </Grid>
        </div>
      </Card>

      {/* Quote Summary */}
      <div className="grid grid-cols-1 lg:3 gap-6">
        {/* Main Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Individual Quotes */}
          <div className="space-y-4">
            {quotes.map((quote, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div
                    className="p-6 bg-gradient-to-r from-brixa-50 to-brixa-100 border-b border-brixa-600 cursor-pointer"
                    onClick={() => toggleQuoteExpansion(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brixa-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            製品 {index + 1}
                          </h4>
                          <p className="text-sm text-gray-600">
                            数量: {totalQuantity.toLocaleString()}個 | 単価: {formatCurrency(quote.unitPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-brixa-700">
                            {formatCurrency(quote.totalPrice)}
                          </p>
                          <p className="text-sm text-gray-600">
                            納期: {quote.leadTimeDays}日
                          </p>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                          {expandedQuotes.has(index) ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedQuotes.has(index) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 space-y-4">
                          {/* Cost Breakdown */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">内訳</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">素材費</span>
                                <span className="font-medium">{formatCurrency(quote.breakdown.material)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">加工費</span>
                                <span className="font-medium">{formatCurrency(quote.breakdown.processing)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">印刷費</span>
                                <span className="font-medium">{formatCurrency(quote.breakdown.printing)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">セットアップ費</span>
                                <span className="font-medium">{formatCurrency(quote.breakdown.setup)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">配送費</span>
                                <span className="font-medium">{formatCurrency(quote.breakdown.delivery)}</span>
                              </div>
                              {quote.breakdown.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>数量割引</span>
                                  <span className="font-medium">-{formatCurrency(quote.breakdown.discount)}</span>
                                </div>
                              )}
                              <div className="border-t pt-2 flex justify-between font-medium">
                                <span>小計</span>
                                <span>{formatCurrency(quote.breakdown.subtotal)}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                <span>合計</span>
                                <span className="text-brixa-700">{formatCurrency(quote.breakdown.total)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Product Specifications */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">製品仕様</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">最低注文数量:</span>
                                <span className="font-medium ml-2">{quote.minOrderQuantity.toLocaleString()}個</span>
                              </div>
                              <div>
                                <span className="text-gray-600">見積有効期間:</span>
                                <span className="font-medium ml-2">{quote.validUntil.toLocaleDateString('ja-JP')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="space-y-6">
          {/* Total Price Card */}
          <Card className="bg-gradient-to-br from-brixa-600 to-amber-600 text-white border-brixa-600">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">合計見積金額</h3>
              <div className="text-4xl font-bold mb-4">
                {formatCurrency(totalPrice)}
              </div>
              <div className="text-brixa-600 text-sm space-y-1">
                <p>合計数量: {totalQuantity.toLocaleString()}個</p>
                <p>平均単価: {formatCurrency(averageUnitPrice)}</p>
              </div>
            </div>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                コスト分析
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">素材費</span>
                  <span className="font-medium">{formatCurrency(totalMaterial)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">加工費</span>
                  <span className="font-medium">{formatCurrency(totalProcessing)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">印刷費</span>
                  <span className="font-medium">{formatCurrency(totalPrinting)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">セットアップ費</span>
                  <span className="font-medium">{formatCurrency(totalSetup)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">配送費</span>
                  <span className="font-medium">{formatCurrency(totalDelivery)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 pt-2 border-t">
                    <span className="text-sm">割引率</span>
                    <span className="font-medium">{getDiscountRate()}%</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Delivery Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-navy-600" />
                納期情報
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">最大納期</span>
                  <Badge variant="info">{maxLeadTime}日</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">見積有効期間</span>
                  <span className="font-medium">{getValidUntil()}まで</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">最低注文数量</span>
                  <Badge variant="secondary">{minOrderQuantity.toLocaleString()}個</Badge>
                </div>
              </div>

              <div className="mt-4 p-3 bg-navy-50 border border-navy-600 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-navy-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-navy-600">
                    納期は製品仕様や数量によって変更される場合があります。詳細は営業担当者よりご案内いたします。
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:2 lg:4 gap-4">
            <Button
              variant="outline"
              onClick={onEdit}
              className="flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>見積修正</span>
            </Button>

            <Button
              variant="secondary"
              onClick={generatePdf}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingPdf ? '生成中...' : 'PDF見積書'}</span>
            </Button>

            <Button
              variant="primary"
              onClick={sendQuotationEmail}
              disabled={isSendingEmail}
              className="flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>{isSendingEmail ? '送信中...' : 'メール送信'}</span>
            </Button>

            <Button
              variant="success"
              className="flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>公式見積依頼</span>
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
              見積内容にご満足いただけましたら、公式見積依頼へお進みください
            </p>
          </div>
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 mb-2">重要事項</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 本見積は{getValidUntil()}まで有効です</li>
                <li>• 実際の価格は最終仕様確認後、変更される場合があります</li>
                <li>• 大口注文の場合、さらに割引が適用される場合があります</li>
                <li>• 緊急注文の場合、別途料金が発生する場合があります</li>
                <li>• 見積内容についてご不明な点がございましたら、お気軽にお問い合わせください</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}