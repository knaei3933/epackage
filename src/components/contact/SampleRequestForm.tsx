'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, User, Mail, Phone, Send, CheckCircle, Star, Box, Gift } from 'lucide-react'

// パウチサンプルリクエストバリデーションスキーマ
const pouchSampleRequestSchema = z.object({
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
  pouchSamples: z.array(z.object({
    pouchType: z.enum(['soft', 'standing', 'gusset', 'pillow', 'triangle', 'special'], {
      required_error: 'パウチタイプを選択してください'
    }),
    quantity: z.number()
      .min(1, '数量は1以上で入力してください')
      .max(5, '数量は5以下で入力してください'),
    size: z.string().optional(),
    application: z.string()
      .min(1, '使用目的を入力してください')
      .max(200, '使用目的は200文字以内で入力してください')
  })).min(1, '少なくとも1つのパウチサンプルを選択してください')
    .max(3, '最大3種類のパウチサンプルまで選択可能です'),
  message: z.string()
    .min(10, 'お問い合わせ内容は10文字以上で入力してください')
    .max(500, 'お問い合わせ内容は500文字以内で入力してください'),
  agreement: z.boolean().refine(val => val === true, '個人情報保護方針に同意してください')
})

type PouchSampleRequestFormData = z.infer<typeof pouchSampleRequestSchema>

const pouchTypes = [
  {
    value: 'soft',
    name: 'ソフトパウチ（3シール・4シール）',
    description: '最も一般的なパウチ形状',
    icon: Box
  },
  {
    value: 'standing',
    name: 'スタンドパウチ',
    description: '自立するチャック付きパウチ',
    icon: Package
  },
  {
    value: 'gusset',
    name: 'ガゼットパウチ',
    description: 'マチ付きで容量アップ',
    icon: Gift
  },
  {
    value: 'pillow',
    name: 'ピローパウチ',
    description: '定番の枕型パウチ',
    icon: Box
  },
  {
    value: 'triangle',
    name: '三角パウチ',
    description: '液体・粉末包装に最適',
    icon: Gift
  },
  {
    value: 'special',
    name: '特殊形状パウチ',
    description: 'カスタム対応',
    icon: Star
  }
]

const commonSizes = [
  '小サイズ（100x150mm）',
  '標準サイズ（150x200mm）',
  '中サイズ（200x300mm）',
  '大サイズ（300x400mm）'
]

const commonApplications = [
  '食品包装評価',
  '化粧品容器検討',
  '健康食品試験',
  '新製品開発',
  '品質比較検討',
  '展示会用サンプル',
  'その他'
]

export default function PouchSampleRequestForm() {
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
    getValues
  } = useForm<PouchSampleRequestFormData>({
    resolver: zodResolver(pouchSampleRequestSchema),
    defaultValues: {
      pouchSamples: [{ pouchType: 'soft', quantity: 1, application: '', size: '' }],
      agreement: false
    }
  })

  const watchPouchSamples = watch('pouchSamples')

  const addPouchSample = () => {
    const currentSamples = getValues('pouchSamples')
    if (currentSamples.length < 3) {
      setValue('pouchSamples', [...currentSamples, {
        pouchType: 'soft',
        quantity: 1,
        application: '',
        size: ''
      }])
    }
  }

  const removePouchSample = (index: number) => {
    const currentSamples = getValues('pouchSamples')
    if (currentSamples.length > 1) {
      setValue('pouchSamples', currentSamples.filter((_, i) => i !== index))
    }
  }

  const onSubmit = async (data: PouchSampleRequestFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/samples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          inquiryType: 'pouch_sample'
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
        window.location.href = '/samples/thank-you'
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
        <div className="bg-gradient-to-br from-green-50 to-navy-50 border-2 border-green-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            パウチサンプルご請求ありがとうございます
          </h2>
          <p className="text-green-700 mb-6 text-lg">
            専門スタッフが迅速にご対応させていただきます。<br />
            ご登録いただいたメールアドレスにてご連絡いたします。
          </p>
          <div className="bg-white rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">次のステップ</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• 24時間以内にご連絡いたします</li>
              <li>• サンプルを郵送させていただきます</li>
              <li>• パウチ仕様に関するご相談</li>
              <li>• 正式なお見積もりをご提案</li>
            </ul>
          </div>
          <p className="text-sm text-green-600">
            まもなくサンプル請求完了ページにリダイレクトします...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brixa-600 rounded-full mb-6">
          <Package className="w-8 h-8 text-brixa-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          パウチサンプルご依頼
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          6種類のパウチ製品を実際にお試しいただけます
        </p>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>完全無料</span>
          <Send className="w-4 h-4 text-navy-600 ml-4" />
          <span>迅速発送</span>
        </div>
      </div>

      {/* サンプル請求ガイド */}
      <div className="bg-gradient-to-r from-navy-50 to-navy-100 border border-navy-600 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Gift className="w-5 h-5 mr-2 text-navy-700" />
          サンプル請求について
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-800">選択可能:</span> 最大3種類のパウチ
          </div>
          <div>
            <span className="font-medium text-gray-800">数量制限:</span> 1種類あたり最大5個
          </div>
          <div>
            <span className="font-medium text-gray-800">発送時期:</span> 通常3-5営業日
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              お客様情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* パウチサンプル選択 */}
          <div className="bg-brixa-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-brixa-700" />
                パウチサンプル選択
              </h2>
              {watchPouchSamples.length < 3 && (
                <button
                  type="button"
                  onClick={addPouchSample}
                  className="px-4 py-2 bg-brixa-700 text-white rounded-lg hover:bg-brixa-600 transition-colors text-sm flex items-center"
                >
                  <Package className="w-4 h-4 mr-2" />
                  パウチを追加
                </button>
              )}
            </div>

            <div className="space-y-4">
              {watchPouchSamples.map((sample, index) => (
                <div key={index} className="bg-white p-4 border border-brixa-600 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-800 flex items-center">
                      <Box className="w-4 h-4 mr-2 text-brixa-600" />
                      サンプル {index + 1}
                    </h3>
                    {watchPouchSamples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePouchSample(index)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center"
                      >
                        削除
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        パウチタイプ <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        {...register(`pouchSamples.${index}.pouchType`)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                      >
                        {pouchTypes.map(pouch => (
                          <option key={pouch.value} value={pouch.value}>
                            {pouch.name} - {pouch.description}
                          </option>
                        ))}
                      </select>
                      {errors.pouchSamples?.[index]?.pouchType && (
                        <p className="text-red-600 text-sm">{errors.pouchSamples[index]?.pouchType?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        数量 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        {...register(`pouchSamples.${index}.quantity`, { valueAsNumber: true })}
                        min="1"
                        max="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                      />
                      {errors.pouchSamples?.[index]?.quantity && (
                        <p className="text-red-600 text-sm">{errors.pouchSamples[index]?.quantity?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        サイズ（任意）
                      </label>
                      <select
                        {...register(`pouchSamples.${index}.size`)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                      >
                        <option value="">サイズを選択してください</option>
                        {commonSizes.map((size, idx) => (
                          <option key={idx} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        使用目的 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        {...register(`pouchSamples.${index}.application`)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                      >
                        <option value="">使用目的を選択してください</option>
                        {commonApplications.map((app, idx) => (
                          <option key={idx} value={app}>
                            {app}
                          </option>
                        ))}
                      </select>
                      {errors.pouchSamples?.[index]?.application && (
                        <p className="text-red-600 text-sm">{errors.pouchSamples[index]?.application?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* お問い合わせ内容 */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2 text-gray-600" />
              お問い合わせ内容
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                メッセージ <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                {...register('message')}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent resize-none text-base"
                placeholder="どのような用途にパウチをご検討されていますか？具体的なご要望や質問などをお聞かせください。&#10;&#10;例：&#10;・包装する製品の種類と特徴&#10;・期待しているパウチの機能&#10;・希望する納期や数量&#10;・現在使用している包装の課題など"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>10文字以上500文字以内</span>
                <span>{watch('message')?.length || 0}/500</span>
              </div>
              {errors.message && (
                <p className="text-red-600 text-sm">{errors.message.message}</p>
              )}
            </div>
          </div>

          {/* 個人情報保護同意 */}
          <div className="border-t pt-6">
            <div className="space-y-4">
              <div className="p-4 bg-navy-50 border border-navy-600 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-navy-700" />
                  個人情報保護方針
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  ご提供いただいた個人情報は、パウチサンプルの発送と技術サポート提供のためのみ利用させていただきます。
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• サンプルの発送と追跡管理</p>
                  <p>• パウチ仕様に関する技術相談</p>
                  <p>製品情報とお見積もりのご提供</p>
                  <p>営業活動とアフターサォローカップ</p>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreement"
                  {...register('agreement')}
                  className="mt-1 w-5 h-5 text-brixa-700 border-gray-300 rounded focus:ring-brixa-600"
                />
                <label htmlFor="agreement" className="ml-3 text-sm text-gray-700 leading-relaxed">
                  上記の個人情報保護方針に同意します
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {errors.agreement && (
                <p className="text-red-600 text-sm">{errors.agreement.message}</p>
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-12 py-4 bg-gradient-to-r from-brixa-700 to-amber-600 text-white font-semibold rounded-xl hover:from-brixa-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-brixa-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Send className="w-5 h-5 mr-3" />
              {isSubmitting ? '送信中...' : 'サンプルをご依頼する'}
            </button>
          </div>
        </form>

        {/* 補足情報 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">受付時間: 平日 9:00-18:00 | メール: 24時間対応</p>
          <p className="mb-2">専門スタッフによる無料相談・技術サポート対応</p>
          <p>サンプル請求に関するご質問はお問い合わせフォームからもご連絡いただけます</p>
        </div>
      </div>
    </div>
  )
}