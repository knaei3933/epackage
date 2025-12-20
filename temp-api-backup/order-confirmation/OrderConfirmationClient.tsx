'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Package,
  Truck,
  FileText,
  Mail,
  Phone,
  ArrowLeft,
  Download,
  Printer,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

// Mock order data - in a real app, this would come from API
const mockOrderData = {
  id: 'order-12345',
  orderNumber: 'ORD-2024-001234',
  status: 'confirmed',
  createdAt: new Date(),
  estimatedDelivery: '2024年2月15日',
  billingAddress: {
    company: '株式会社ABC商事',
    name: '田中 太郎',
    email: 'tanaka@abc-corp.jp',
    phone: '03-1234-5678',
    address: '東京都千代田区丸の内1-1-1',
    zipCode: '100-0001'
  },
  shippingAddress: {
    company: '株式会社ABC商事',
    contactName: '田中 太郎',
    phone: '03-1234-5678',
    address: '東京都千代田区丸の内1-1-1',
    zipCode: '100-0001'
  },
  items: [
    {
      name: '三方シール平袋',
      quantity: 1000,
      unitPrice: 15,
      totalPrice: 15000,
      specifications: {
        material: 'PET',
        thickness: 100,
        printing: { colors: 1, sides: 'front', method: 'digital' }
      }
    },
    {
      name: 'スタンドパウチ',
      quantity: 2000,
      unitPrice: 25,
      totalPrice: 50000,
      specifications: {
        material: 'ALUMINUM',
        thickness: 120,
        printing: { colors: 2, sides: 'both', method: 'offset' }
      }
    }
  ],
  summary: {
    subtotal: 65000,
    tax: 6500,
    shippingFee: 1200,
    total: 72700
  }
}

// Client component
export default function OrderConfirmationClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [orderData, setOrderData] = useState(mockOrderData)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    // In a real app, fetch order data based on orderId
    if (orderId) {
      // fetchOrderData(orderId).then(setOrderData)
      console.log('Order ID:', orderId)
    }
  }, [orderId])

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real app, download the PDF
      const link = document.createElement('a')
      link.href = '/api/invoices/pdf?orderId=' + orderId
      link.download = `invoice-${orderData.orderNumber}.pdf`
      link.click()
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container size="4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Message */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ご注文ありがとうございます！
            </h1>
            <p className="text-gray-600 text-lg">
              注文番号: <span className="font-semibold">{orderData.orderNumber}</span>
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 text-center">
                <FileText className="w-8 h-8 text-navy-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">注文確認</h3>
                <p className="text-sm text-gray-600">確認メールを送信しました</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 text-center">
                <Package className="w-8 h-8 text-brixa-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">ご注文準備</h3>
                <p className="text-sm text-gray-600">現在注文を処理中です</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-4 text-center">
                <Truck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">お届け予定</h3>
                <p className="text-sm text-gray-600">{orderData.estimatedDelivery}</p>
              </Card>
            </motion.div>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">注文詳細</h2>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    注文情報
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">注文番号:</span>
                      <span className="font-medium">{orderData.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">注文日時:</span>
                      <span className="font-medium">
                        {orderData.createdAt.toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ステータス:</span>
                      <Badge variant="success">確認済み</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">お届け予定:</span>
                      <span className="font-medium">{orderData.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    ご連絡先
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">会社名:</span>
                      <div className="font-medium">{orderData.billingAddress.company}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">担当者:</span>
                      <div className="font-medium">{orderData.billingAddress.name}</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">メール:</span>
                      <span className="font-medium">{orderData.billingAddress.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">電話:</span>
                      <span className="font-medium">{orderData.billingAddress.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">注文商品</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-900">商品名</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-900">数量</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-900">単価</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-900">小計</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-600">
                                素材: {item.specifications.material} |
                                厚さ: {item.specifications.thickness}μm
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {item.quantity.toLocaleString()}個
                          </td>
                          <td className="p-3 text-center">
                            ¥{item.unitPrice.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-medium">
                            ¥{item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>小計</span>
                    <span>¥{orderData.summary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>消費税</span>
                    <span>¥{orderData.summary.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>送料</span>
                    <span>
                      {orderData.summary.shippingFee === 0
                        ? '無料'
                        : `¥${orderData.summary.shippingFee.toLocaleString()}`
                      }
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-lg">合計</span>
                    <span className="font-bold text-lg text-brixa-600">
                      ¥{orderData.summary.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-4 h-4 border-2 border-brixa-600 border-t-transparent rounded-full animate-spin" />
                  <span>PDF生成中...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>請求書ダウンロード</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>印刷</span>
            </Button>

            <Link href="/catalog" className="flex-1 sm:flex-none">
              <Button variant="primary" className="w-full flex items-center justify-center space-x-2">
                <Home className="w-4 h-4" />
                <span>カタログに戻る</span>
              </Button>
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center">
            <Card className="p-6 bg-navy-50 border-navy-600">
              <h3 className="font-semibold text-gray-900 mb-2">ご不明な点がございますか？</h3>
              <p className="text-gray-600 mb-4">
                ご注文に関するご質問やサポートが必要な場合は、お気軽にお問い合わせください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  <span>03-1234-5678</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Mail className="w-4 h-4" />
                  <span>support@epackage-lab.com</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}