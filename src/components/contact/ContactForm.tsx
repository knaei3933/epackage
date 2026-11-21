'use client'

import { BUSINESS_HOURS_LABEL, REPLY_TIME_LABEL } from '@/lib/site-facts'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, User, Package, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput'

// 全角の数字・ハイフン・空白を半角にそろえる（電話・郵便番号の検証と送信に使う）
export function normalizeHalfWidth(value: string): string {
  return value
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[－−‐‑–—―ーｰ]/g, '-')
    .replace(/＋/g, '+')
    .replace(/\u3000/g, ' ')
    .trim()
}

// 通常の番号、フリーダイヤル（0120・0800）、+81 形式を通す
const PHONE_PATTERN =
  /^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10}|0120-\d{3}-\d{3}|0120\d{6}|0800-\d{3}-\d{4}|0800\d{7}|\+81\d{1,4}-\d{1,4}-\d{4}|\+81-\d{1,4}-\d{1,4}-\d{4}|\+81\d{9,10})$/
const isValidPhone = (val: string) => PHONE_PATTERN.test(normalizeHalfWidth(val))

// お問い合わせフォームバリデーションスキーマ
const contactSchema = z.object({
  kanjiLastName: z.string({ required_error: '姓（漢字）を入力してください' })
    .min(1, '姓（漢字）を入力してください')
    .min(1, '姓（漢字）は1文字以上で入力してください')
    .max(50, '姓（漢字）は50文字以内で入力してください'),
  kanjiFirstName: z.string({ required_error: '名（漢字）を入力してください' })
    .min(1, '名（漢字）を入力してください')
    .min(1, '名（漢字）は1文字以上で入力してください')
    .max(50, '名（漢字）は50文字以内で入力してください'),
  kanaLastName: z.string({ required_error: '姓（読み仮名）を入力してください' })
    .min(1, '姓（読み仮名）を入力してください')
    .regex(/^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]+$/, 'ひらがなまたはカタカナで入力してください')
    .max(50, '姓（読み仮名）は50文字以内で入力してください'),
  kanaFirstName: z.string({ required_error: '名（読み仮名）を入力してください' })
    .min(1, '名（読み仮名）を入力してください')
    .regex(/^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]+$/, 'ひらがなまたはカタカナで入力してください')
    .max(50, '名（読み仮名）は50文字以内で入力してください'),
  company: z.string()
    .max(100, '会社名は100文字以内で入力してください')
    .optional()
    .refine(val => !val || val.trim().length > 0, '会社名が空白だけです。入力するか、空にしてください'),
  phone: z.string({ required_error: '電話番号を入力してください' })
    .min(1, '電話番号を入力してください')
    .refine(isValidPhone, '有効な電話番号を入力してください（例: 03-1234-5678）'),
  fax: z.string()
    .optional()
    .refine(val => !val || isValidPhone(val),
      '有効なFAX番号を入力してください（例: 03-1234-5678）'),
  email: z.string({ required_error: 'メールアドレスを入力してください' })
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  postalCode: z.string()
    .optional()
    .refine(val => !val || /^\d{3}-?\d{4}$/.test(normalizeHalfWidth(val)), '有効な郵便番号を入力してください（例: 100-0001）'),
  address: z.string()
    .max(200, '住所は200文字以内で入力してください')
    .optional(),
  inquiryType: z.enum(['product', 'quotation', 'sample', 'order', 'other'], {
    errorMap: () => ({ message: 'お問い合わせ種別を選択してください' }),
  }),
  message: z.string({ required_error: 'お問い合わせ内容を入力してください' })
    .min(1, 'お問い合わせ内容を入力してください')
    .min(10, 'お問い合わせ内容は10文字以上で入力してください')
    .max(800, 'お問い合わせ内容は800文字以内で入力してください'),
  // 同意は画面側の確認だけに使う（API には送らない）
  privacyConsent: z.boolean().refine(val => val === true, '個人情報保護方針に同意してください'),
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
    defaultValues: { privacyConsent: false },
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
      value: 'order',
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

    // 同意は API に送らない。電話・郵便番号は半角にそろえて送る。
    const { privacyConsent: _consent, ...payload } = data
    void _consent
    const postal = payload.postalCode ? normalizeHalfWidth(payload.postalCode) : payload.postalCode

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          ...payload,
          phone: normalizeHalfWidth(payload.phone),
          fax: payload.fax ? normalizeHalfWidth(payload.fax) : payload.fax,
          postalCode: postal && /^\d{7}$/.test(postal) ? `${postal.slice(0, 3)}-${postal.slice(3)}` : postal,
          company: payload.company?.trim() || undefined,
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
        <div className="rounded-container border border-success bg-success-muted p-12 text-center">
          <CheckCircle className="mx-auto mb-6 h-10 w-10 text-success" aria-hidden="true" />
          <h2 className="text-2xl font-medium text-on-success-muted mb-4">
            パウチお問い合わせありがとうございます
          </h2>
          <p className="text-on-success-muted mb-6 text-lg">
            専門スタッフが迅速にご対応させていただきます。
            ご登録いただいたメールアドレスにてご連絡いたします。
          </p>
          <div className="rounded-container bg-bg-primary p-6 mb-6">
            <h3 className="font-semibold text-text-primary mb-3">次のステップ</h3>
            <ul className="text-left text-text-secondary space-y-2">
              <li>• {REPLY_TIME_LABEL}にご返信します</li>
              <li>• 必要に応じて詳細なヒアリングをお願いします</li>
              <li>• 無料サンプルのご提案も可能です</li>
            </ul>
          </div>
          <p className="text-sm text-on-success-muted">
            まもなくリダイレクトします...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-10">
        <Package className="mb-4 h-8 w-8 text-brand" aria-hidden="true" />
        <h2 className="mb-4 text-2xl font-medium leading-[1.4] text-text-primary md:text-[2rem] [word-break:keep-all] [overflow-wrap:anywhere]">
          お問い合わせ
        </h2>
        <p className="mb-2 max-w-[40em] text-lg text-text-secondary">
          パウチ製品に関するお問い合わせ、専門スタッフが詳しくご対応いたします。
        </p>
        <p className="text-text-muted">
          {REPLY_TIME_LABEL}にご回答します。無料サンプルにも対応しています
        </p>
      </div>

      {/* 問い合わせ内容ガイド */}
      <div className="rounded-container border border-brand-soft bg-brand-muted p-6 mb-8">
        <h3 className="font-semibold text-on-brand-muted mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-brand" aria-hidden="true" />
          より良いご対応のため
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-text-secondary">
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

      <div className="rounded-container border border-border-medium bg-bg-primary p-6 md:p-8">
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 rounded-container border border-error bg-error-muted">
            <p className="text-on-error-muted">
              送信エラーが発生しました: {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <p className="text-sm text-text-secondary">
            <span className="text-error" aria-hidden="true">*</span> は必須です
          </p>

          {/* 基本情報 */}
          <div className="rounded-container bg-bg-secondary p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-brand" />
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
                <label htmlFor="contact-company" className="text-sm font-medium text-text-primary">
                  会社名
                </label>
                <input
                  id="contact-company"
                  type="text"
                  {...register('company')}
                  data-testid="contact-company-name"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例：株式会社サンプル"
                />
                {errors.company && (
                  <p className="text-error text-sm">{errors.company.message}</p>
                )}
              </div>

              {/* 電話番号 */}
              <div className="space-y-2">
                <label htmlFor="contact-phone" className="flex items-center text-sm font-medium text-text-primary">
                  <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                  電話番号 <span className="text-error ml-1" aria-hidden="true">*</span><span className="sr-only">（必須）</span>
                </label>
                <input
                  id="contact-phone"
                  aria-required="true"
                  type="tel"
                  {...register('phone')}
                  data-testid="contact-phone-number"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例：03-1234-5678"
                />
                {errors.phone && (
                  <p className="text-error text-sm">{errors.phone.message}</p>
                )}
              </div>

              {/* FAX番号 */}
              <div className="space-y-2">
                <label htmlFor="contact-fax" className="flex items-center text-sm font-medium text-text-primary">
                  <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                  FAX番号
                </label>
                <input
                  id="contact-fax"
                  type="tel"
                  {...register('fax')}
                  data-testid="contact-fax-number"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例：03-1234-5678"
                />
                {errors.fax && (
                  <p className="text-error text-sm">{errors.fax.message}</p>
                )}
              </div>

              {/* メールアドレス */}
              <div className="space-y-2">
                <label htmlFor="contact-email" className="flex items-center text-sm font-medium text-text-primary">
                  <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                  メールアドレス <span className="text-error ml-1" aria-hidden="true">*</span><span className="sr-only">（必須）</span>
                </label>
                <input
                  id="contact-email"
                  aria-required="true"
                  type="email"
                  {...register('email')}
                  data-testid="contact-email-address"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例：example@company.com"
                />
                {errors.email && (
                  <p className="text-error text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* 郵便番号 */}
              <div className="space-y-2">
                <label htmlFor="contact-postal" className="flex items-center text-sm font-medium text-text-primary">
                  〒 郵便番号
                </label>
                <input
                  id="contact-postal"
                  type="text"
                  {...register('postalCode')}
                  data-testid="contact-postal-code"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例：100-0001"
                />
                {errors.postalCode && (
                  <p className="text-error text-sm">{errors.postalCode.message}</p>
                )}
              </div>

              {/* 住所 - Full width */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="contact-address-field" className="flex items-center text-sm font-medium text-text-primary">
                  住所
                </label>
                <input
                  id="contact-address-field"
                  type="text"
                  {...register('address')}
                  data-testid="contact-address"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例：東京都〇〇区〇〇1-2-3"
                />
                {errors.address && (
                  <p className="text-error text-sm">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* お問い合わせ種別選択 */}
          <div className="rounded-container bg-bg-secondary p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-brand" />
              お問い合わせ種別 <span className="text-error ml-2" aria-hidden="true">*</span><span className="sr-only">（必須）</span>
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
                    className="block p-4 border-2 rounded-container cursor-pointer transition-colors border-border-medium bg-bg-primary hover:border-brand-soft peer-checked:border-brand peer-checked:bg-brand-subtle peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2"
                  >
                    <div className="font-medium text-text-primary">{type.label}</div>
                    <div className="text-sm text-text-secondary">{type.description}</div>
                  </label>
                </div>
              ))}
            </div>
            {errors.inquiryType && (
              <p className="text-error text-sm mt-2">{errors.inquiryType.message}</p>
            )}
          </div>

          {/* お問い合わせ内容 */}
          <div className="space-y-4">
            <label htmlFor="contact-message-field" className="flex items-center text-lg font-medium text-text-primary">
              <MessageSquare className="w-5 h-5 mr-2" aria-hidden="true" />
              お問い合わせ内容 <span className="text-error ml-2" aria-hidden="true">*</span><span className="sr-only">（必須）</span>
            </label>
            <textarea
              id="contact-message-field"
              aria-required="true"
              {...register('message')}
              data-testid="contact-message"
              rows={6}
              className="w-full resize-none rounded-md border border-border-strong bg-bg-primary px-3 py-2 text-base text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted"
              placeholder="お客様のパウチ包装に関するご要望やご質問をお聞かせください。&#10;&#10;例：&#10;・包装する製品の種類&#10;・月産数量やロットサイズ&#10;・希望の仕様や機能&#10;・予算や納期についてなど"
            />
            <div className="flex justify-between text-sm text-text-muted">
              <span>10文字以上800文字以内</span>
              <span>{watch('message')?.length || 0}/800</span>
            </div>
            {errors.message && (
              <p className="text-error text-sm">{errors.message.message}</p>
            )}
          </div>

          {/* 個人情報の取り扱いへの同意 */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <input
                id="contact-privacy-consent"
                type="checkbox"
                aria-required="true"
                aria-invalid={errors.privacyConsent ? 'true' : undefined}
                aria-describedby={errors.privacyConsent ? 'contact-privacy-consent-error' : undefined}
                {...register('privacyConsent')}
                data-testid="contact-privacy-consent"
                className="mt-1 h-5 w-5 shrink-0 rounded-md border border-border-strong accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              />
              <label htmlFor="contact-privacy-consent" className="text-sm leading-[1.8] text-text-primary">
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">
                  個人情報保護方針
                </Link>
                に同意する <span className="text-error" aria-hidden="true">*</span><span className="sr-only">（必須）</span>
              </label>
            </div>
            {errors.privacyConsent && (
              <p id="contact-privacy-consent-error" className="text-error text-sm">{errors.privacyConsent.message}</p>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              icon={<Send className="h-5 w-5" aria-hidden="true" />}
              className="px-12"
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </Button>
          </div>
        </form>
      </div>

      {/* 補足情報 */}
      <div className="mt-8 text-center text-sm text-text-muted">
        <p>受付時間: {BUSINESS_HOURS_LABEL} | メールは{REPLY_TIME_LABEL}にご返信します</p>
        <p className="mt-2">専門スタッフによる無料相談・無料サンプル対応中</p>
      </div>
    </div>
  )
}