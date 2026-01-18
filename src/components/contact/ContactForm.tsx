'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, User, Package, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput'

// お問い合わせフォームバリデーションスキーマ
const contactSchema = z.object({
  kanjiLastName: z.string()
    .min(1, '姓（漢字）を入力してください')
    .min(1, '姓（漢字）は1文字以上で入力してください')
    .max(50, '姓（漢字）は50文字以内で入力してください'),
  kanjiFirstName: z.string()
    .min(1, '名（漢字）を入力してください')
    .min(1, '名（漢字）は1文字以上で入力してください')
    .max(50, '名（漢字）は50文字以内で入力してください'),
  kanaLastName: z.string()
    .min(1, '姓（ひらがな）を入力してください')
    .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力してください')
    .max(50, '姓（ひらがな）は50文字以内で入力してください'),
  kanaFirstName: z.string()
    .min(1, '名（ひらがな）を入力してください')
    .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力してください')
    .max(50, '名（ひらがな）は50文字以内で入力してください'),
  company: z.string()
    .max(100, '会社名は100文字以内で入力してください')
    .optional(),
  phone: z.string()
    .min(1, '電話番号を入力してください')
    .regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|\+81\d{1,4}-\d{1,4}-\d{4})$/,
      '有効な電話番号を入力してください（例: 03-1234-5678）'),
  fax: z.string()
    .optional()
    .refine(val => !val || /^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|\+81\d{1,4}-\d{1,4}-\d{4})$/.test(val),
      '有効なFAX番号を入力してください（例: 03-1234-5678）'),
  email: z.string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  postalCode: z.string()
    .optional()
    .refine(val => !val || /^\d{3}-\d{4}$/.test(val), '有効な郵便番号を入力してください（例: 100-0001）'),
  address: z.string()
    .max(200, '住所は200文字以内で入力してください')
    .optional(),
  inquiryType: z.enum(['product', 'quotation', 'sample', 'delivery', 'other'], {
    required_error: 'お問い合わせ種別を選択してください'
  }),
  message: z.string()
    .min(1, 'お問い合わせ内容を入力してください')
    .min(10, 'お問い合わせ内容は10文字以上で入力してください')
    .max(800, 'お問い合わせ内容は800文字以内で入力してください'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const inquiryTypes = [
    {
      value: 'product',
      label: '商品について',
      description: '製品・仕様に関するお問い合わせ'
    },
    {
      value: 'quotation',
      label: '見積について',
      description: 'お見積もり・価格について'
    },
    {
      value: 'sample',
      label: 'サンプルについて',
      description: 'サンプル請求について'
    },
    {
      value: 'delivery',
      label: '納期・配送について',
      description: '納期・配送に関するお問い合わせ'
    },
    {
      value: 'other',
      label: 'その他',
      description: 'その他のお問い合わせ'
    }
  ]

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          inquiryType: data.inquiryType,
          subject: `お問い合わせ (${inquiryTypes.find(it => it.value === data.inquiryType)?.label})`
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '送信に失敗しました')
      }

      setSubmitStatus('success')
      reset()

      // 成功後にリダイレクト
      setTimeout(() => {
        window.location.href = '/contact/thank-you'
      }, 2000)

    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            パウチお問い合わせありがとうございます
          </h2>
          <p className="text-green-700 mb-6 text-lg">
            専門スタッフが迅速にご対応させていただきます。
            ご登録いただいたメールアドレスにてご連絡いたします。
          </p>
          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">次のステップ</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• 24時間以内にご返信いたします</li>
              <li>• 必要に応じて詳細なヒアリングをお願いします</li>
              <li>• 無料サンプルのご提案も可能です</li>
            </ul>
          </div>
          <p className="text-sm text-green-600">
            まもなくリダイレクトします...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brixa-600 rounded-full mb-4">
          <Package className="w-8 h-8 text-brixa-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          お問い合わせ
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
          パウチ製品に関するお問い合わせ、専門スタッフが詳しくご対応いたします。
        </p>
        <p className="text-gray-500">
          24時間以内のご回答、無料サンプル対応可能
        </p>
      </div>

      {/* 問い合わせ内容ガイド */}
      <div className="bg-brixa-50 border border-brixa-600 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-brixa-700" />
          より良いご対応のため
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">製品用途:</span> 何を包装するか
          </div>
          <div>
            <span className="font-medium">必要数量:</span> 月産やロット数
          </div>
          <div>
            <span className="font-medium">希望納期:</span> おおよその時期
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              送信エラーが発生しました: {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 基本情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              お客様情報
            </h3>

            {/* JapaneseNameInput */}
            <div className="mb-6">
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 会社名 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  会社名
                </label>
                <input
                  type="text"
                  {...register('company')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  placeholder="株式会社サンプル"
                />
                {errors.company && (
                  <p className="text-red-600 text-sm">{errors.company.message}</p>
                )}
              </div>

              {/* 電話番号 */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 mr-2" />
                  電話番号 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  placeholder="03-1234-5678"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm">{errors.phone.message}</p>
                )}
              </div>

              {/* FAX番号 */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 mr-2" />
                  FAX番号
                </label>
                <input
                  type="tel"
                  {...register('fax')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  placeholder="03-1234-5678"
                />
                {errors.fax && (
                  <p className="text-red-600 text-sm">{errors.fax.message}</p>
                )}
              </div>

              {/* メールアドレス */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 mr-2" />
                  メールアドレス <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  placeholder="example@company.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* 郵便番号 */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  〒 郵便番号
                </label>
                <input
                  type="text"
                  {...register('postalCode')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  placeholder="100-0001"
                />
                {errors.postalCode && (
                  <p className="text-red-600 text-sm">{errors.postalCode.message}</p>
                )}
              </div>

              {/* 住所 - Full width */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  住所
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  placeholder="東京都〇〇区〇〇1-2-3"
                />
                {errors.address && (
                  <p className="text-red-600 text-sm">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* お問い合わせ種別選択 */}
          <div className="bg-brixa-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-brixa-700" />
              お問い合わせ種別 <span className="text-red-500 ml-2">*</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inquiryTypes.map(type => (
                <div key={type.value} className="relative">
                  <input
                    {...register('inquiryType')}
                    type="radio"
                    id={type.value}
                    value={type.value}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={type.value}
                    className="block p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-brixa-600 peer-checked:bg-brixa-600 hover:border-brixa-400 border-gray-200 bg-white"
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </label>
                </div>
              ))}
            </div>
            {errors.inquiryType && (
              <p className="text-red-600 text-sm mt-2">{errors.inquiryType.message}</p>
            )}
          </div>

          {/* お問い合わせ内容 */}
          <div className="space-y-4">
            <label className="flex items-center text-lg font-medium text-gray-900">
              <MessageSquare className="w-5 h-5 mr-2" />
              お問い合わせ内容 <span className="text-red-500 ml-2">*</span>
            </label>
            <textarea
              {...register('message')}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent resize-none text-base"
              placeholder="お客様のパウチ包装に関するご要望やご質問をお聞かせください。&#10;&#10;例：&#10;・包装する製品の種類&#10;・月産数量やロットサイズ&#10;・希望の仕様や機能&#10;・予算や納期についてなど"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>10文字以上800文字以内</span>
              <span>{watch('message')?.length || 0}/800</span>
            </div>
            {errors.message && (
              <p className="text-red-600 text-sm">{errors.message.message}</p>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-12 py-4 bg-brixa-700 text-white text-lg font-semibold rounded-xl hover:bg-brixa-600 focus:outline-none focus:ring-2 focus:ring-brixa-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Send className="w-5 h-5 mr-3" />
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </div>
        </form>
      </div>

      {/* 補足情報 */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>受付時間: 平日 9:00-18:00 | メール: 24時間対応</p>
        <p className="mt-2">専門スタッフによる無料相談・無料サンプル対応中</p>
      </div>
    </div>
  )
}