'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, User, Mail, Phone, Send, CheckCircle, Star, Box, Gift, Building, Plus, X, Copy } from 'lucide-react'
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput'

// 配送先スキーマ
const deliveryDestinationSchema = z.object({
  id: z.string(),
  companyName: z.string().optional(),
  contactPerson: z.string().min(1, '担当者を入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  postalCode: z.string().optional(),
  address: z.string().min(1, '住所を入力してください'),
  sameAsCustomer: z.boolean().optional()
})

// パウチサンプルリクエストバリデーションスキーマ
const pouchSampleRequestSchema = z.object({
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
  message: z.string()
    .min(10, 'お問い合わせ内容は10文字以上で入力してください')
    .max(500, 'お問い合わせ内容は500文字以内で入力してください'),
  agreement: z.boolean().refine(val => val === true, '個人情報保護方針に同意してください'),

  // 配送タイプ
  deliveryType: z.enum(['normal', 'other'], {
    required_error: '配送タイプを選択してください'
  }),

  // 配送先リスト（複数可能）
  deliveryDestinations: z.array(deliveryDestinationSchema).min(1, '少なくとも1つの配送先を入力してください')
})

type PouchSampleRequestFormData = z.infer<typeof pouchSampleRequestSchema>


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
    getValues,
  } = useForm<PouchSampleRequestFormData>({
    resolver: zodResolver(pouchSampleRequestSchema),
    defaultValues: {
      kanjiLastName: '',
      kanjiFirstName: '',
      kanaLastName: '',
      kanaFirstName: '',
      company: '',
      email: '',
      phone: '',
      fax: '',
      postalCode: '',
      address: '',
      agreement: false,
      deliveryType: 'normal',
      deliveryDestinations: [{
        id: 'dest-1',
        contactPerson: '',
        phone: '',
        address: '',
        sameAsCustomer: true
      }],
      message: ''
    }
  })

  const {
    fields: destinationFields,
    append: appendDestination,
    remove: removeDestination,
    update: updateDestination
  } = useFieldArray({
    control,
    name: 'deliveryDestinations'
  })

  const deliveryType = watch('deliveryType')
  const customerInfo = {
    company: watch('company'),
    phone: watch('phone'),
    postalCode: watch('postalCode'),
    address: watch('address'),
    kanjiLastName: watch('kanjiLastName'),
    kanjiFirstName: watch('kanjiFirstName')
  }

  // お客様情報を配送先にコピーする関数
  const copyCustomerInfo = (index: number) => {
    const destKey = `deliveryDestinations.${index}` as const
    setValue(`${destKey}.companyName`, customerInfo.company || '')
    setValue(`${destKey}.contactPerson`, `${customerInfo.kanjiLastName} ${customerInfo.kanjiFirstName}`)
    setValue(`${destKey}.phone`, customerInfo.phone)
    setValue(`${destKey}.postalCode`, customerInfo.postalCode || '')
    setValue(`${destKey}.address`, customerInfo.address || '')
    setValue(`${destKey}.sameAsCustomer`, true)
  }

  // 新しい配送先を追加
  const addDestination = () => {
    const newId = `dest-${Date.now()}`
    appendDestination({
      id: newId,
      contactPerson: '',
      phone: '',
      address: '',
      sameAsCustomer: false
    })
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
          パウチ製品のサンプルをご請求いただけます
        </p>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>完全無料</span>
          <Send className="w-4 h-4 text-navy-600 ml-4" />
          <span>迅速発送</span>
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

            {/* JapaneseNameInput */}
            <div className="mb-6">
              <JapaneseNameInputController
                control={control}
                setValue={setValue}
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

          {/* 配送タイプ選択 */}
          <div className="bg-brixa-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-brixa-700" />
              配送タイプ <span className="text-red-500 ml-2">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              サンプルの配送先を選択してください
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 一般配送 */}
              <label className={`relative cursor-pointer`}>
                <input
                  {...register('deliveryType')}
                  type="radio"
                  value="normal"
                  className="peer sr-only"
                  onChange={() => {
                    setValue('deliveryType', 'normal')
                    // 一般配送時、最初の配送先にお客様情報を自動コピー
                    if (destinationFields.length > 0) {
                      copyCustomerInfo(0)
                    }
                  }}
                />
                <div className={`p-4 border-2 rounded-lg transition-all ${
                  deliveryType === 'normal'
                    ? 'border-brixa-600 bg-brixa-600'
                    : 'border-gray-200 bg-white hover:border-brixa-400'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 rounded-full mb-2 ${
                      deliveryType === 'normal' ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      <Building className={`w-5 h-5 ${
                        deliveryType === 'normal' ? 'text-brixa-700' : 'text-gray-600'
                      }`} />
                    </div>
                    <h3 className={`font-semibold mb-1 ${
                      deliveryType === 'normal' ? 'text-white' : 'text-gray-900'
                    }`}>
                      一般配送
                    </h3>
                    <p className={`text-xs ${
                      deliveryType === 'normal' ? 'text-brixa-100' : 'text-gray-600'
                    }`}>
                      お客様情報に配送
                    </p>
                  </div>
                </div>
              </label>

              {/* 別の場所に配送 */}
              <label className={`relative cursor-pointer`}>
                <input
                  {...register('deliveryType')}
                  type="radio"
                  value="other"
                  className="peer sr-only"
                  onChange={() => {
                    setValue('deliveryType', 'other')
                  }}
                />
                <div className={`p-4 border-2 rounded-lg transition-all ${
                  deliveryType === 'other'
                    ? 'border-orange-600 bg-orange-600'
                    : 'border-gray-200 bg-white hover:border-orange-400'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 rounded-full mb-2 ${
                      deliveryType === 'other' ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      <Send className={`w-5 h-5 ${
                        deliveryType === 'other' ? 'text-orange-700' : 'text-gray-600'
                      }`} />
                    </div>
                    <h3 className={`font-semibold mb-1 ${
                      deliveryType === 'other' ? 'text-white' : 'text-gray-900'
                    }`}>
                      別の場所に配送
                    </h3>
                    <p className={`text-xs ${
                      deliveryType === 'other' ? 'text-orange-100' : 'text-gray-600'
                    }`}>
                      別の場所を指定
                    </p>
                  </div>
                </div>
              </label>
            </div>
            {errors.deliveryType && (
              <p className="text-red-600 text-sm mt-2">{errors.deliveryType.message}</p>
            )}
          </div>

          {/* 配送先リスト */}
          <div className="bg-orange-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-orange-600" />
                配送先 <span className="text-red-500 ml-2">*</span>
              </h2>
              <button
                type="button"
                onClick={addDestination}
                className="flex items-center px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                配送先を追加
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              サンプルを配送する場所を入力してください
            </p>

            {destinationFields.map((field, index) => (
              <div key={field.id} className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    配送先 {index + 1}
                  </h3>
                  {destinationFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDestination(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <X className="w-4 h-4 mr-1 inline" />
                      削除
                    </button>
                  )}
                </div>

                {/* お客様情報と同じチェックボックス */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`deliveryDestinations.${index}.sameAsCustomer` as const)}
                      className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          copyCustomerInfo(index)
                        }
                      }}
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700">
                        お客様情報と同じ
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCustomerInfo(index)}
                        className="ml-2 text-xs text-orange-600 hover:text-orange-700 flex items-center"
                      >
                        <Copy className="w-3 h-3 mr-1 inline" />
                        コピー
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        チェックするとお客様情報がコピーされます
                      </p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 会社名 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      会社名
                    </label>
                    <input
                      type="text"
                      {...register(`deliveryDestinations.${index}.companyName` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="株式会社〇〇"
                    />
                  </div>

                  {/* 担当者 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      担当者 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register(`deliveryDestinations.${index}.contactPerson` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="山田 太郎"
                    />
                    {errors.deliveryDestinations?.[index]?.contactPerson && (
                      <p className="text-red-600 text-xs">{errors.deliveryDestinations[index]?.contactPerson?.message}</p>
                    )}
                  </div>

                  {/* 電話番号 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register(`deliveryDestinations.${index}.phone` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="03-1234-5678"
                    />
                    {errors.deliveryDestinations?.[index]?.phone && (
                      <p className="text-red-600 text-xs">{errors.deliveryDestinations[index]?.phone?.message}</p>
                    )}
                  </div>

                  {/* 郵便番号 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      〒 郵便番号
                    </label>
                    <input
                      type="text"
                      {...register(`deliveryDestinations.${index}.postalCode` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="100-0001"
                    />
                  </div>

                  {/* 住所 - Full width */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      住所 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register(`deliveryDestinations.${index}.address` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="東京都〇〇区〇〇1-2-3"
                    />
                    {errors.deliveryDestinations?.[index]?.address && (
                      <p className="text-red-600 text-xs">{errors.deliveryDestinations[index]?.address?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
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