'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput'

// サンプルリクエストフォームバリデーションスキーマ
const sampleSchema = z.object({
  kanjiLastName: z.string()
    .min(1, '姓（漢字）を入力してください')
    .max(50, '姓（漢字）は50文字以内で入力してください'),
  kanjiFirstName: z.string()
    .min(1, '名（漢字）を入力してください')
    .max(50, '名（漢字）は50文字以内で入力してください'),
  kanaLastName: z.string()
    .min(1, '姓（ひらがな）を入力してください')
    .regex(/^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]+$/, 'ひらがなで入力してください')
    .max(50, '姓（ひらがな）は50文字以内で入力してください'),
  kanaFirstName: z.string()
    .min(1, '名（ひらがな）を入力してください')
    .regex(/^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]+$/, 'ひらがなで入力してください')
    .max(50, '名（ひらがな）は50文字以内で入力してください'),
  company: z.string()
    .max(100, '会社名は100文字以内で入力してください')
    .optional(),
  email: z.string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  phone: z.string()
    .min(1, '電話番号を入力してください')
    .regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|\+81\d{1,4}-\d{1,4}-\d{4})$/,
      '有効な電話番号を入力してください（例: 03-1234-5678）'),
  postalCode: z.string()
    .min(1, '郵便番号を入力してください')
    .regex(/^\d{3}-\d{4}$/, '有効な郵便番号を入力してください（例: 100-0001）'),
  address: z.string()
    .min(1, '住所を入力してください')
    .max(200, '住所は200文字以内で入力してください'),
  message: z.string()
    .max(800, 'ご要望・ご質問は800文字以内で入力してください')
    .optional(),
})

type SampleFormData = z.infer<typeof sampleSchema>

export default function SampleRequestFormWrapper() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    reset,
  } = useForm<SampleFormData>({
    resolver: zodResolver(sampleSchema),
  })

  const onSubmit = async (data: SampleFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          ...data,
          inquiryType: 'sample',
          subject: 'サンプルご依頼',
          message: data.message || 'パウチサンプルセットをご依頼いたします。',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '送信に失敗しました')
      }

      // 成功時にサンクユーページへリダイレクト
      router.push('/samples/thank-you')
    } catch (error) {
      console.error('Submit error:', error)
      alert('送信エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* お名前 - JapaneseNameInputControllerを使用 */}
      <div>
        <JapaneseNameInputController
          control={control}
          setValue={setValue}
          trigger={trigger}
          kanjiLastNameName="kanjiLastName"
          kanjiFirstNameName="kanjiFirstName"
          kanaLastNameName="kanaLastName"
          kanaFirstNameName="kanaFirstName"
          kanjiLastNameError={errors.kanjiLastName?.message}
          kanjiFirstNameError={errors.kanjiFirstName?.message}
          kanaLastNameError={errors.kanaLastName?.message}
          kanaFirstNameError={errors.kanaFirstName?.message}
          required
          label="お名前"
        />
      </div>

      {/* 会社名 */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          会社名
        </label>
        <input
          type="text"
          id="company"
          {...register('company')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="株式会社〇〇"
        />
        {errors.company && (
          <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
        )}
      </div>

      {/* メールアドレス */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="example@company.com"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* 電話番号 */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号 <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="03-1234-5678"
        />
        {errors.phone && (
          <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* 郵便番号 */}
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
          郵便番号 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="postalCode"
          {...register('postalCode')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="100-0001"
        />
        {errors.postalCode && (
          <p className="text-red-600 text-sm mt-1">{errors.postalCode.message}</p>
        )}
      </div>

      {/* 住所 */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          住所 <span className="text-red-600">*</span>
        </label>
        <textarea
          id="address"
          {...register('address')}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="東京都〇〇区〇〇1-2-3"
        />
        {errors.address && (
          <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* ご要望・ご質問 */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          ご要望・ご質問
        </label>
        <textarea
          id="message"
          {...register('message')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="ご要望やご質問がございましたらご記入ください"
        />
        {errors.message && (
          <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-brixa-600 text-white font-semibold rounded-lg hover:bg-brixa-700 focus:ring-4 focus:ring-brixa-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '送信中...' : 'サンプルを依頼する'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        ※ 2営業日以内にご連絡いたします
      </p>
    </form>
  )
}
