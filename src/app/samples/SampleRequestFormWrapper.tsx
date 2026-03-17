'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SampleRequestFormWrapper() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    message: '',
    privacyConsent: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.privacyConsent) {
      alert('個人情報保護方針に同意してください')
      return
    }

    setIsSubmitting(true)

    try {
      // 名前を姓・名に分割（簡易対応）
      const nameParts = formData.name.split(' ')
      const lastName = nameParts[0] || formData.name
      const firstName = nameParts.slice(1).join(' ') || ''

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          kanjiLastName: lastName,
          kanjiFirstName: firstName,
          kanaLastName: lastName, // 簡易対応
          kanaFirstName: firstName, // 簡易対応
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          postalCode: formData.postalCode,
          address: formData.address,
          message: formData.message || 'サンプルをご依頼いたします。',
          inquiryType: 'sample',
          privacyConsent: formData.privacyConsent
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/samples/thank-you')
      } else {
        alert('送信エラー: ' + (result.error || '不明なエラー'))
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('送信エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* お名前 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="山田 太郎"
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
          name="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="株式会社〇〇"
        />
      </div>

      {/* メールアドレス */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="example@company.com"
        />
      </div>

      {/* 電話番号 */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号 <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="03-1234-5678"
        />
      </div>

      {/* 郵便番号 */}
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
          郵便番号 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          required
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="100-0001"
        />
      </div>

      {/* 住所 */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          住所 <span className="text-red-600">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          required
          rows={2}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="東京都〇〇区〇〇1-2-3"
        />
      </div>

      {/* ご要望・ご質問 */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          ご要望・ご質問
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          placeholder="ご要望やご質問がございましたらご記入ください"
        />
      </div>

      {/* プライバシーポリシー同意 - カスタムチェックボックス */}
      <div>
        <label className="flex items-start space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.privacyConsent}
              onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
              className="peer sr-only"
              required
            />
            <div className="w-5 h-5 mt-0.5 border-2 border-gray-300 rounded bg-white transition-all duration-200 peer-checked:bg-brixa-500 peer-checked:border-brixa-500 flex items-center justify-center group-hover:border-brixa-400">
              <svg className="w-3 h-3 text-white hidden peer-checked:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span className="text-sm text-gray-600">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brixa-500 hover:underline">
              個人情報保護方針
            </a>
            に同意して送信します
          </span>
        </label>
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
