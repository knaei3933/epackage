/**
 * B2B Quotation Confirmation Client Component
 *
 * B2B見積確認クライアントコンポーネント
 * Handles quotation details display and order confirmation
 *
 * @client
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { Quotation, QuotationItem } from '@/types/database'

// ============================================================
// Types
// ============================================================

type PaymentTerm = 'credit' | 'advance' // 掛け払い | 前払

interface Address {
  postalCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2: string
  company: string
  contactName: string
  phone: string
}

// ============================================================
// Validation Schema
// ============================================================

const confirmationSchema = z.object({
  // Payment Terms
  paymentTerm: z.enum(['credit', 'advance'], {
    required_error: '支払い条件を選択してください',
  }),

  // Shipping Address
  shippingPostalCode: z.string().min(1, '郵便番号を入力してください'),
  shippingPrefecture: z.string().min(1, '都道府県を選択してください'),
  shippingCity: z.string().min(1, '市区町村を入力してください'),
  shippingAddressLine1: z.string().min(1, '住所を入力してください'),
  shippingAddressLine2: z.string().optional(),
  shippingCompany: z.string().min(1, '会社名を入力してください'),
  shippingContactName: z.string().min(1, '担当者名を入力してください'),
  shippingPhone: z.string().min(10, '電話番号を入力してください'),

  // Billing Address
  useShippingAsBilling: z.boolean().default(true),
  billingPostalCode: z.string().optional(),
  billingPrefecture: z.string().optional(),
  billingCity: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCompany: z.string().optional(),
  billingContactName: z.string().optional(),
  billingPhone: z.string().optional(),

  // Delivery Date
  requestedDeliveryDate: z.string().min(1, '納期を指定してください'),
  deliveryNotes: z.string().optional(),

  // Terms Agreement
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: '利用規約に同意してください',
  }),
})

type ConfirmationFormData = z.infer<typeof confirmationSchema>

// ============================================================
// Props
// ============================================================

interface QuotationConfirmClientProps {
  quotation: Quotation
}

// ============================================================
// Main Component
// ============================================================

export function QuotationConfirmClient({
  quotation,
}: QuotationConfirmClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ConfirmationFormData>({
    resolver: zodResolver(confirmationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      useShippingAsBilling: true,
      requestedDeliveryDate: quotation.estimated_delivery_date
        ? new Date(quotation.estimated_delivery_date).toISOString().split('T')[0]
        : '',
    },
  })

  const useShippingAsBilling = watch('useShippingAsBilling')

  // Calculate totals
  const subtotal = (quotation.items || []).reduce(
    (sum, item) => sum + (item.unit_price || 0) * (item.quantity || 0),
    0
  )
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + tax

  // Handle form submission
  const onSubmit = async (data: ConfirmationFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create order confirmation request
      const response = await fetch('/api/b2b/orders/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotationId: quotation.id,
          paymentTerm: data.paymentTerm,
          shippingAddress: {
            postalCode: data.shippingPostalCode,
            prefecture: data.shippingPrefecture,
            city: data.shippingCity,
            addressLine1: data.shippingAddressLine1,
            addressLine2: data.shippingAddressLine2 || '',
            company: data.shippingCompany,
            contactName: data.shippingContactName,
            phone: data.shippingPhone,
          },
          billingAddress: data.useShippingAsBilling
            ? {
                postalCode: data.shippingPostalCode,
                prefecture: data.shippingPrefecture,
                city: data.shippingCity,
                addressLine1: data.shippingAddressLine1,
                addressLine2: data.shippingAddressLine2 || '',
                company: data.shippingCompany,
                contactName: data.shippingContactName,
                phone: data.shippingPhone,
              }
            : {
                postalCode: data.billingPostalCode || '',
                prefecture: data.billingPrefecture || '',
                city: data.billingCity || '',
                addressLine1: data.billingAddressLine1 || '',
                addressLine2: data.billingAddressLine2 || '',
                company: data.billingCompany || '',
                contactName: data.billingContactName || '',
                phone: data.billingPhone || '',
              },
          requestedDeliveryDate: data.requestedDeliveryDate,
          deliveryNotes: data.deliveryNotes || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '注文の確定に失敗しました')
      }

      const result = await response.json()

      // Redirect to order confirmation page
      router.push(`/member/orders/${result.orderId}/confirmation`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Quotation Details Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">見積内容</h2>

        {/* Quotation Info */}
        <div className="mb-6 pb-6 border-b">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">見積番号:</span>{' '}
              <span className="font-medium">{quotation.quotation_number}</span>
            </div>
            <div>
              <span className="text-gray-500">見積作成日:</span>{' '}
              <span className="font-medium">
                {new Date(quotation.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">有効期限:</span>{' '}
              <span className="font-medium">
                {quotation.valid_until
                  ? new Date(quotation.valid_until).toLocaleDateString('ja-JP')
                  : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">見積担当者:</span>{' '}
              <span className="font-medium">{quotation.sales_rep || '-'}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium">商品名</th>
                <th className="text-right py-2 text-sm font-medium">数量</th>
                <th className="text-right py-2 text-sm font-medium">単価</th>
                <th className="text-right py-2 text-sm font-medium">金額</th>
              </tr>
            </thead>
            <tbody>
              {(quotation.items || []).map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">
                    <div className="font-medium">{item.product_name}</div>
                    {item.specifications && (
                      <div className="text-sm text-gray-500 mt-1">
                        {formatSpecifications(item.specifications as Record<string, unknown>)}
                      </div>
                    )}
                  </td>
                  <td className="text-right py-3">{item.quantity.toLocaleString()}</td>
                  <td className="text-right py-3">
                    ¥{item.unit_price.toLocaleString()}
                  </td>
                  <td className="text-right py-3">
                    ¥{(item.unit_price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>消費税 (10%)</span>
            <span>¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>合計</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>

        {quotation.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-2">備考</h3>
            <p className="text-sm text-gray-600">{quotation.notes}</p>
          </div>
        )}
      </Card>

      {/* Payment Terms Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">支払い条件</h2>

        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              value="credit"
              className="mt-1"
              {...register('paymentTerm')}
            />
            <div>
              <div className="font-medium">掛け払い</div>
              <div className="text-sm text-gray-500 mt-1">
                翌月末払い（締め日：毎月25日）
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              value="advance"
              className="mt-1"
              {...register('paymentTerm')}
            />
            <div>
              <div className="font-medium">前払い</div>
              <div className="text-sm text-gray-500 mt-1">
                注文確認後7日以内にお支払いください
              </div>
            </div>
          </label>
        </div>

        {errors.paymentTerm && (
          <p className="text-sm text-red-600 mt-2">{errors.paymentTerm.message}</p>
        )}
      </Card>

      {/* Shipping Address Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">配送先情報</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              会社名 <span className="text-red-600">*</span>
            </label>
            <Input
              {...register('shippingCompany')}
              error={errors.shippingCompany?.message}
              placeholder="株式会社〇〇"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              担当者名 <span className="text-red-600">*</span>
            </label>
            <Input
              {...register('shippingContactName')}
              error={errors.shippingContactName?.message}
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              郵便番号 <span className="text-red-600">*</span>
            </label>
            <Input
              {...register('shippingPostalCode')}
              error={errors.shippingPostalCode?.message}
              placeholder="123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              電話番号 <span className="text-red-600">*</span>
            </label>
            <Input
              {...register('shippingPhone')}
              error={errors.shippingPhone?.message}
              placeholder="03-1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              都道府県 <span className="text-red-600">*</span>
            </label>
            <select
              {...register('shippingPrefecture')}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
            {errors.shippingPrefecture && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingPrefecture.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              市区町村 <span className="text-red-600">*</span>
            </label>
            <Input
              {...register('shippingCity')}
              error={errors.shippingCity?.message}
              placeholder="〇〇市〇〇区"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              住所 <span className="text-red-600">*</span>
            </label>
            <Input
              {...register('shippingAddressLine1')}
              error={errors.shippingAddressLine1?.message}
              placeholder="〇〇1-2-3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              建物名・部屋番号
            </label>
            <Input
              {...register('shippingAddressLine2')}
              placeholder="〇〇ビル5階"
            />
          </div>
        </div>
      </Card>

      {/* Billing Address Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">請求先情報</h2>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('useShippingAsBilling')}
              className="rounded"
            />
            <span className="text-sm">配送先と同じ</span>
          </label>
        </div>

        {!useShippingAsBilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                会社名 <span className="text-red-600">*</span>
              </label>
              <Input
                {...register('billingCompany')}
                error={errors.billingCompany?.message}
                placeholder="株式会社〇〇"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                担当者名 <span className="text-red-600">*</span>
              </label>
              <Input
                {...register('billingContactName')}
                error={errors.billingContactName?.message}
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                郵便番号 <span className="text-red-600">*</span>
              </label>
              <Input
                {...register('billingPostalCode')}
                error={errors.billingPostalCode?.message}
                placeholder="123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                電話番号 <span className="text-red-600">*</span>
              </label>
              <Input
                {...register('billingPhone')}
                error={errors.billingPhone?.message}
                placeholder="03-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                都道府県 <span className="text-red-600">*</span>
              </label>
              <select
                {...register('billingPrefecture')}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
              {errors.billingPrefecture && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.billingPrefecture.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                市区町村 <span className="text-red-600">*</span>
              </label>
              <Input
                {...register('billingCity')}
                error={errors.billingCity?.message}
                placeholder="〇〇市〇〇区"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                住所 <span className="text-red-600">*</span>
              </label>
              <Input
                {...register('billingAddressLine1')}
                error={errors.billingAddressLine1?.message}
                placeholder="〇〇1-2-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                建物名・部屋番号
              </label>
              <Input
                {...register('billingAddressLine2')}
                placeholder="〇〇ビル5階"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Delivery Date Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">納期指定</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              希望納期 <span className="text-red-600">*</span>
            </label>
            <Input
              type="date"
              {...register('requestedDeliveryDate')}
              error={errors.requestedDeliveryDate?.message}
              min={getMinDeliveryDate()}
            />
            <p className="text-sm text-gray-500 mt-1">
              最早納期: {quotation.estimated_delivery_date
                ? new Date(quotation.estimated_delivery_date).toLocaleDateString('ja-JP')
                : '-'}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              納期に関する備考
            </label>
            <textarea
              {...register('deliveryNotes')}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="特別なご要望がございましたらご記入ください"
            />
          </div>
        </div>
      </Card>

      {/* Terms Agreement */}
      <Card className="p-6">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('agreedToTerms')}
            className="mt-1 rounded"
          />
          <div className="text-sm">
            <span className="font-medium">利用規約に同意します</span>
            {errors.agreedToTerms && (
              <p className="text-red-600 mt-1">{errors.agreedToTerms.message}</p>
            )}
          </div>
        </label>
      </Card>

      {/* Submit Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          戻る
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
        >
          注文を確定する
        </Button>
      </div>
    </form>
  )
}

// ============================================================
// Utilities
// ============================================================

// Japanese prefectures list
const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
]

function formatSpecifications(spec: Record<string, unknown>): string {
  return Object.entries(spec)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

function getMinDeliveryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7) // Minimum 7 days lead time
  return date.toISOString().split('T')[0]
}
