'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Truck,
  CreditCard,
  FileText,
  User,
  MapPin,
  Shield,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { useCheckout } from '@/contexts/CheckoutContext'
import { useCart } from '@/contexts/CartContext'
import { JAPANESE_PREFECTURES, PAYMENT_TERMS } from '@/types/checkout'
import Link from 'next/link'

export function CheckoutClient() {
  const {
    state,
    setBillingAddress,
    setShippingAddress,
    setPaymentMethod,
    setCurrentStep,
    setProcessing,
    setErrors,
    clearErrors,
    canProceedToNextStep,
    validateCurrentStep,
    resetCheckout
  } = useCheckout()

  const { items, clearCart } = useCart()
  const [showPassword, setShowPassword] = useState(false)
  const [showCVV, setShowCVV] = useState(false)

  const steps = [
    { id: 0, name: '請求先情報', icon: FileText },
    { id: 1, name: '配送先情報', icon: MapPin },
    { id: 2, name: '支払方法', icon: CreditCard },
    { id: 3, name: '注文確認', icon: Check }
  ]

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(state.currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(Math.max(0, state.currentStep - 1))
  }

  const handlePlaceOrder = async () => {
    if (!validateCurrentStep()) return

    setProcessing(true)
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Create order object
      const order = {
        id: `order-${Date.now()}`,
        orderNumber: `ORD-${Date.now()}`,
        items: state.orderItems,
        billingAddress: state.billingAddress,
        shippingAddress: state.shippingAddress,
        paymentMethod: state.paymentMethod,
        summary: state.summary,
        status: 'pending_approval',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // In a real app, this would send to your API
      console.log('Order placed:', order)

      // Clear cart and checkout state
      clearCart()
      resetCheckout()

      // Redirect to order confirmation page
      window.location.href = `/order-confirmation?orderId=${order.id}`
    } catch (error) {
      console.error('Order processing failed:', error)
      setErrors({ general: ['注文処理に失敗しました。もう一度お試しください。'] })
    } finally {
      setProcessing(false)
    }
  }

  const copyBillingToShipping = () => {
    if (state.billingAddress) {
      setShippingAddress({
        company: state.billingAddress.company,
        department: state.billingAddress.department,
        contactName: state.billingAddress.name,
        phone: state.billingAddress.phone,
        zipCode: state.billingAddress.zipCode,
        prefecture: state.billingAddress.prefecture,
        address: state.billingAddress.address,
        building: state.billingAddress.building
      })
    }
  }

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return <BillingAddressForm />
      case 1:
        return <ShippingAddressForm />
      case 2:
        return <PaymentMethodForm />
      case 3:
        return <OrderConfirmation />
      default:
        return null
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <Container size="4xl">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">カートは空です</h1>
            <p className="text-gray-600 mb-8">
              まず製品をカートに追加してから、チェックアウトに進んでください。
            </p>
            <Link href="/catalog">
              <Button variant="primary" size="lg">
                製品カタログへ
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container size="6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">チェックアウト</h1>
          <p className="text-gray-600">
            B2B包装ソリューションの注文手続き
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = state.currentStep === step.id
              const isCompleted = state.currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-brixa-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm mt-2 font-medium ${
                        isActive ? 'text-brixa-700' : isCompleted ? 'text-green-600' : 'text-gray-600'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        state.currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={state.currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>前へ</span>
              </Button>

              {state.currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={!canProceedToNextStep() || state.isProcessing}
                  className="flex items-center space-x-2"
                >
                  <span>次へ</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePlaceOrder}
                  disabled={state.isProcessing || !validateCurrentStep()}
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  {state.isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>処理中...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>注文を確定する</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">注文概要</h3>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.product.name_ja}
                        </div>
                        <div className="text-gray-600">
                          数量: {item.quantity.toLocaleString()}個
                        </div>
                        {item.specifications && (
                          <div className="text-xs text-gray-500">
                            素材: {item.specifications.material} |
                            厚さ: {item.specifications.thickness}μm
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ¥{item.totalPrice.toLocaleString()}
                        </div>
                        <div className="text-gray-600 text-xs">
                          ¥{item.unitPrice}/個
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {state.summary && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>小計</span>
                      <span>¥{state.summary.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>消費税</span>
                      <span>¥{state.summary.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>送料</span>
                      <span>
                        {state.summary.shippingFee === 0 ? '無料' : `¥${state.summary.shippingFee.toLocaleString()}`}
                      </span>
                    </div>
                    {state.summary.installationFee && (
                      <div className="flex justify-between text-sm">
                        <span>設置費用</span>
                        <span>¥{state.summary.installationFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold text-lg">合計</span>
                      <span className="font-bold text-lg text-brixa-700">
                        ¥{state.summary.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Delivery Info */}
                {state.summary && (
                  <div className="mt-4 p-3 bg-brixa-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-brixa-900">
                      <Truck className="w-4 h-4" />
                      <span>
                        納期: {state.summary.estimatedDelivery}
                      </span>
                    </div>
                    <div className="text-sm text-brixa-800 mt-1">
                      支払条件: {state.summary.paymentTerms}
                    </div>
                  </div>
                )}
              </Card>

              {/* Security Badge */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>セキュアな決済システム</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  SSL暗号化通信で保護されています
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

// Billing Address Form Component
function BillingAddressForm() {
  const { state, setBillingAddress, errors } = useCheckout()
  const [formData, setFormData] = useState({
    company: '',
    department: '',
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    prefecture: '',
    address: '',
    building: '',
    taxId: ''
  })

  useEffect(() => {
    if (state.billingAddress) {
      setFormData({
        company: state.billingAddress.company || '',
        department: state.billingAddress.department || '',
        name: state.billingAddress.name || '',
        email: state.billingAddress.email || '',
        phone: state.billingAddress.phone || '',
        zipCode: state.billingAddress.zipCode || '',
        prefecture: state.billingAddress.prefecture || '',
        address: state.billingAddress.address || '',
        building: state.billingAddress.building || '',
        taxId: state.billingAddress.taxId || ''
      })
    }
  }, [state.billingAddress])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBillingAddress(formData as any)
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">請求先情報</h2>

      {errors.billingAddress && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              請求先情報を正しく入力してください
            </span>
          </div>
          {errors.billingAddress.map((error, index) => (
            <div key={index} className="text-sm text-red-700 mt-1">
              • {error}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会社名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              部署名
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              都道府県 <span className="text-red-500">*</span>
            </label>
            <select
              name="prefecture"
              value={formData.prefecture}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            >
              <option value="">選択してください</option>
              {JAPANESE_PREFECTURES.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            住所 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="市区町村、番地"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            建物名・部屋番号
          </label>
          <input
            type="text"
            name="building"
            value={formData.building}
            onChange={handleInputChange}
            placeholder="建物名、部屋番号など"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            税務署番号
          </label>
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={handleInputChange}
            placeholder="T1234567890123"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
          />
        </div>
      </form>
    </Card>
  )
}

// Shipping Address Form Component
function ShippingAddressForm() {
  const { state, setShippingAddress, errors } = useCheckout()
  const [formData, setFormData] = useState({
    company: '',
    department: '',
    contactName: '',
    phone: '',
    zipCode: '',
    prefecture: '',
    address: '',
    building: '',
    deliveryInstructions: ''
  })

  useEffect(() => {
    if (state.shippingAddress) {
      setFormData({
        company: state.shippingAddress.company || '',
        department: state.shippingAddress.department || '',
        contactName: state.shippingAddress.contactName || '',
        phone: state.shippingAddress.phone || '',
        zipCode: state.shippingAddress.zipCode || '',
        prefecture: state.shippingAddress.prefecture || '',
        address: state.shippingAddress.address || '',
        building: state.shippingAddress.building || '',
        deliveryInstructions: state.shippingAddress.deliveryInstructions || ''
      })
    }
  }, [state.shippingAddress])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const copyFromBilling = () => {
    if (state.billingAddress) {
      const shippingData = {
        company: state.billingAddress.company,
        department: state.billingAddress.department,
        contactName: state.billingAddress.name,
        phone: state.billingAddress.phone,
        zipCode: state.billingAddress.zipCode,
        prefecture: state.billingAddress.prefecture,
        address: state.billingAddress.address,
        building: state.billingAddress.building,
        deliveryInstructions: ''
      }
      setFormData(shippingData as any)
      setShippingAddress(shippingData as any)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShippingAddress(formData as any)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">配送先情報</h2>
        {state.billingAddress && (
          <Button
            variant="outline"
            size="sm"
            onClick={copyFromBilling}
            className="text-sm"
          >
            請求先と同じ
          </Button>
        )}
      </div>

      {errors.shippingAddress && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              配送先情報を正しく入力してください
            </span>
          </div>
          {errors.shippingAddress.map((error, index) => (
            <div key={index} className="text-sm text-red-700 mt-1">
              • {error}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会社名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              部署名
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              都道府県 <span className="text-red-500">*</span>
            </label>
            <select
              name="prefecture"
              value={formData.prefecture}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
              required
            >
              <option value="">選択してください</option>
              {JAPANESE_PREFECTURES.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            住所 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="市区町村、番地"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            建物名・部屋番号
          </label>
          <input
            type="text"
            name="building"
            value={formData.building}
            onChange={handleInputChange}
            placeholder="建物名、部屋番号など"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            配送に関する指示
          </label>
          <textarea
            name="deliveryInstructions"
            value={formData.deliveryInstructions}
            onChange={handleInputChange}
            rows={3}
            placeholder="受付時間、玄関渡しなどの配達に関するご希望があればご記入ください"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
          />
        </div>
      </form>
    </Card>
  )
}

// Payment Method Form Component
function PaymentMethodForm() {
  const { state, setPaymentMethod, errors } = useCheckout()
  const [showPassword, setShowPassword] = useState(false)
  const [showCVV, setShowCVV] = useState(false)
  const [paymentType, setPaymentType] = useState<'invoice' | 'credit_card' | 'bank_transfer'>('invoice')
  const [formData, setFormData] = useState({
    purchaseOrder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: '',
    accountNumber: ''
  })

  const handlePaymentTypeChange = (type: 'invoice' | 'credit_card' | 'bank_transfer') => {
    setPaymentType(type)
    setPaymentMethod({
      type,
      details: type === 'credit_card' ? {} : undefined,
      purchaseOrder: type === 'invoice' ? formData.purchaseOrder : undefined,
      approvalRequired: type === 'invoice'
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Update payment method in real-time
    setPaymentMethod({
      type: paymentType,
      details: paymentType === 'credit_card' ? {
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName
      } : undefined,
      purchaseOrder: paymentType === 'invoice' ? formData.purchaseOrder : undefined,
      approvalRequired: paymentType === 'invoice'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentMethod({
      type: paymentType,
      details: paymentType === 'credit_card' ? {
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName
      } : undefined,
      purchaseOrder: paymentType === 'invoice' ? formData.purchaseOrder : undefined,
      approvalRequired: paymentType === 'invoice'
    })
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">支払方法</h2>

      {errors.paymentMethod && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              支払方法を正しく選択してください
            </span>
          </div>
          {errors.paymentMethod.map((error, index) => (
            <div key={index} className="text-sm text-red-700 mt-1">
              • {error}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            支払方法の選択 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentType === 'invoice'
                  ? 'border-brixa-600 bg-brixa-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePaymentTypeChange('invoice')}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentType"
                  value="invoice"
                  checked={paymentType === 'invoice'}
                  onChange={() => handlePaymentTypeChange('invoice')}
                  className="text-brixa-700 focus:ring-brixa-600"
                />
                <div>
                  <div className="font-medium">請求書払い</div>
                  <div className="text-sm text-gray-600">30日後支払い</div>
                </div>
              </div>
            </div>

            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentType === 'credit_card'
                  ? 'border-brixa-600 bg-brixa-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePaymentTypeChange('credit_card')}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentType"
                  value="credit_card"
                  checked={paymentType === 'credit_card'}
                  onChange={() => handlePaymentTypeChange('credit_card')}
                  className="text-brixa-700 focus:ring-brixa-600"
                />
                <div>
                  <div className="font-medium">クレジットカード</div>
                  <div className="text-sm text-gray-600">即時決済</div>
                </div>
              </div>
            </div>

            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentType === 'bank_transfer'
                  ? 'border-brixa-600 bg-brixa-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePaymentTypeChange('bank_transfer')}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentType"
                  value="bank_transfer"
                  checked={paymentType === 'bank_transfer'}
                  onChange={() => handlePaymentTypeChange('bank_transfer')}
                  className="text-brixa-700 focus:ring-brixa-600"
                />
                <div>
                  <div className="font-medium">銀行振込</div>
                  <div className="text-sm text-gray-600">前払い</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        {paymentType === 'invoice' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                購入発注番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="purchaseOrder"
                value={formData.purchaseOrder}
                onChange={handleInputChange}
                placeholder="PO-2024-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                貴社の購買管理システムで発行された番号をご記入ください
              </p>
            </div>
          </div>
        )}

        {/* Credit Card Details */}
        {paymentType === 'credit_card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カード番号 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  有効期限 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCVV ? "text" : "password"}
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCVV(!showCVV)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カード名義人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                placeholder="TARO YAMADA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brixa-600"
                required
              />
            </div>
          </div>
        )}

        {/* Bank Transfer Details */}
        {paymentType === 'bank_transfer' && (
          <div className="space-y-4">
            <div className="p-4 bg-navy-50 border border-navy-600 rounded-lg">
              <h4 className="font-medium text-navy-600 mb-2">銀行振込情報</h4>
              <div className="text-sm text-navy-600 space-y-1">
                <p><strong>銀行名:</strong> 三菱UFJ銀行</p>
                <p><strong>支店名:</strong> 本店営業部</p>
                <p><strong>口座種別:</strong> 普通</p>
                <p><strong>口座番号:</strong> 1234567</p>
                <p><strong>口座名義:</strong> 株式会社Epackage Lab</p>
              </div>
              <p className="text-sm text-navy-600 mt-3">
                注文確認後、7日以内にご入金ください。
              </p>
            </div>
          </div>
        )}
      </form>
    </Card>
  )
}

// Order Confirmation Component
function OrderConfirmation() {
  const { state, errors } = useCheckout()
  const { items } = useCart()

  if (errors.general) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">エラー</span>
        </div>
        {errors.general.map((error, index) => (
          <div key={index} className="text-sm text-red-700 mt-1">
            • {error}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Billing Address */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">請求先情報</h3>
        {state.billingAddress && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">会社名:</span> {state.billingAddress.company}
              </div>
              <div>
                <span className="font-medium">担当者:</span> {state.billingAddress.name}
              </div>
              <div>
                <span className="font-medium">メール:</span> {state.billingAddress.email}
              </div>
              <div>
                <span className="font-medium">電話:</span> {state.billingAddress.phone}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">住所:</span><br />
                〒{state.billingAddress.zipCode} {state.billingAddress.prefecture}<br />
                {state.billingAddress.address}<br />
                {state.billingAddress.building && `${state.billingAddress.building}`}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Shipping Address */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">配送先情報</h3>
        {state.shippingAddress && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">会社名:</span> {state.shippingAddress.company}
              </div>
              <div>
                <span className="font-medium">担当者:</span> {state.shippingAddress.contactName}
              </div>
              <div>
                <span className="font-medium">電話:</span> {state.shippingAddress.phone}
              </div>
              <div>
                <span className="font-medium">メール:</span> {state.billingAddress?.email}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">住所:</span><br />
                〒{state.shippingAddress.zipCode} {state.shippingAddress.prefecture}<br />
                {state.shippingAddress.address}<br />
                {state.shippingAddress.building && `${state.shippingAddress.building}`}
              </div>
              {state.shippingAddress.deliveryInstructions && (
                <div className="md:col-span-2">
                  <span className="font-medium">配送指示:</span><br />
                  {state.shippingAddress.deliveryInstructions}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Order Items */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">注文内容</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name_ja}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.product.description_ja}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">数量: </span>
                    <span className="font-medium">{item.quantity.toLocaleString()}個</span>
                    <span className="text-gray-600 mx-2">|</span>
                    <span className="text-gray-600">単価: </span>
                    <span className="font-medium">¥{item.unitPrice.toLocaleString()}/個</span>
                  </div>
                  {item.specifications && (
                    <div className="mt-1 text-xs text-gray-500">
                      素材: {item.specifications.material} |
                      厚さ: {item.specifications.thickness}μm |
                      印刷: {item.specifications.printing?.colors}色 {item.specifications.printing?.sides}面
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    ¥{item.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">支払方法</h3>
        {state.paymentMethod && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-medium">
              {state.paymentMethod.type === 'invoice' && '請求書払い（30日後）'}
              {state.paymentMethod.type === 'credit_card' && 'クレジットカード'}
              {state.paymentMethod.type === 'bank_transfer' && '銀行振込'}
            </div>
            {state.paymentMethod.purchaseOrder && (
              <p className="text-sm text-gray-600 mt-1">
                購入発注番号: {state.paymentMethod.purchaseOrder}
              </p>
            )}
            {state.paymentMethod.approvalRequired && (
              <p className="text-sm text-brixa-700 mt-1">
                ※承認が必要なため、注文処理に追加時間がかかる場合があります
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Final Summary */}
      <Card className="p-6 bg-gradient-to-r from-brixa-50 to-brixa-100 border-brixa-600">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最終確認</h3>
        {state.summary && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>小計</span>
              <span>¥{state.summary.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>消費税 (10%)</span>
              <span>¥{state.summary.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>送料</span>
              <span>
                {state.summary.shippingFee === 0 ? '無料' : `¥${state.summary.shippingFee.toLocaleString()}`}
              </span>
            </div>
            {state.summary.installationFee && (
              <div className="flex justify-between text-sm">
                <span>設置費用</span>
                <span>¥{state.summary.installationFee.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-lg">合計金額</span>
              <span className="font-bold text-xl text-brixa-700">
                ¥{state.summary.total.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-brixa-600 rounded-lg">
          <div className="flex items-center space-x-2 text-brixa-900">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              注文確定前の最終確認
            </span>
          </div>
          <p className="text-sm text-brixa-800 mt-1">
            上記の内容でよろしければ、「注文を確定する」ボタンをクリックしてください。
            注文確定後は変更できませんのでご注意ください。
          </p>
        </div>
      </Card>
    </div>
  )
}