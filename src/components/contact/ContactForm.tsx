'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, User, Package, MessageSquare, Send, CheckCircle } from 'lucide-react'

// パウチお問い合わせフォームバリデーションスキーマ
const pouchContactSchema = z.object({
  name: z.string()
    .min(1, 'お名前を入力してください')
    .min(2, 'お名前は2文字以上で入力してください')
    .max(50, 'お名前は50文字以内で入力してください'),
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
  pouchType: z.enum(['soft', 'standing', 'gusset', 'pillow', 'triangle', 'special'], {
    required_error: 'お関心のあるパウチタイプを選択してください'
  }),
  message: z.string()
    .min(1, 'お問い合わせ内容を入力してください')
    .min(10, 'お問い合わせ内容は10文字以上で入力してください')
    .max(800, 'お問い合わせ内容は800文字以内で入力してください'),
})

type PouchContactFormData = z.infer<typeof pouchContactSchema>

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<PouchContactFormData>({
    resolver: zodResolver(pouchContactSchema),
  })

  const pouchTypes = [
    {
      value: 'soft',
      label: 'ソフトパウチ',
      description: '3シール・4シール'
    },
    {
      value: 'standing',
      label: 'スタンドパウチ',
      description: '角底・チャック付き'
    },
    {
      value: 'gusset',
      label: 'ガゼットパウチ',
      description: 'マチ付き'
    },
    {
      value: 'pillow',
      label: 'ピローパウチ',
      description: '最も一般的'
    },
    {
      value: 'triangle',
      label: '三角パウチ',
      description: '液体・粉末用'
    },
    {
      value: 'special',
      label: '特殊形状パウチ',
      description: 'カスタム対応'
    }
  ]

  const onSubmit = async (data: PouchContactFormData) => {
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
          inquiryType: 'pouch',
          subject: `パウチお問い合わせ (${pouchTypes.find(pt => pt.value === data.pouchType)?.label})`
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
          パウチ専門お問い合わせ
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
          6種類のパウチ製品について、専門スタッフが詳しくご説明いたします。
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* お名前 */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  お名前 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  placeholder="山田 太郎"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm">{errors.name.message}</p>
                )}
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
            </div>
          </div>

          {/* パウチタイプ選択 */}
          <div className="bg-brixa-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-brixa-700" />
              お関心のあるパウチ <span className="text-red-500 ml-2">*</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pouchTypes.map(type => (
                <div key={type.value} className="relative">
                  <input
                    {...register('pouchType')}
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
            {errors.pouchType && (
              <p className="text-red-600 text-sm mt-2">{errors.pouchType.message}</p>
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
              {isSubmitting ? '送信中...' : 'パウチ専門家に相談する'}
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