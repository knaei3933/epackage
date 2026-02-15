// お問い合わせ関連の型定義

export interface ContactFormData {
  name: string
  company?: string
  email: string
  phone: string
  subject: string
  message: string
  inquiryType: 'general' | 'technical' | 'sales' | 'support'
  urgency: 'low' | 'medium' | 'high'
  preferredContact: 'email' | 'phone'
}

export interface SampleRequestFormData {
  name: string
  company: string
  department?: string
  email: string
  phone: string
  postalCode?: string
  address?: string
  samples: SampleItem[]
  projectDetails: string
  timeline?: string
  budget?: string
  preferredShippingDate?: string
  specialRequirements?: string
  agreement: boolean
}

export interface SampleItem {
  productId: string
  productName: string
  quantity: number
  specifications?: string
  purpose: string
}

export interface Product {
  id: string
  name: string
  category: string
  specifications?: string[]
  description?: string
  imageUrl?: string
}

export interface ApiResponse {
  success: boolean
  message: string
  contactId?: string
  requestId?: string
  estimatedShipping?: string
  error?: string
  details?: string[] | Record<string, unknown>
}

export interface EmailTemplateData {
  customerName: string
  customerEmail: string
  subject?: string
  inquiryType?: string
  urgency?: string
  company?: string
  phone?: string
  message?: string
  samples?: SampleItem[]
  projectDetails?: string
  timestamp: string
}

// お問い合わせ種別のラベル
export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  general: '一般お問い合わせ',
  technical: '技術的なお問い合わせ',
  sales: '営業関連',
  support: 'サポート'
}

// 緊急度のラベル
export const URGENCY_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高'
}

// 希望連絡方法のラベル
export const PREFERRED_CONTACT_LABELS: Record<string, string> = {
  email: 'メール',
  phone: '電話'
}

// バリデーションエラーメッセージ
export const VALIDATION_MESSAGES = {
  name: {
    required: 'お名前を入力してください',
    minLength: 'お名前は2文字以上で入力してください',
    maxLength: 'お名前は50文字以内で入力してください'
  },
  company: {
    required: '会社名を入力してください',
    maxLength: '会社名は100文字以内で入力してください'
  },
  email: {
    required: 'メールアドレスを入力してください',
    invalid: '有効なメールアドレスを入力してください'
  },
  phone: {
    required: '電話番号を入力してください',
    invalid: '有効な電話番号を入力してください（例: 03-1234-5678）'
  },
  postalCode: {
    invalid: '郵便番号はxxx-xxxxの形式で入力してください'
  },
  subject: {
    required: '件名を入力してください',
    minLength: '件名は5文字以上で入力してください',
    maxLength: '件名は100文字以内で入力してください'
  },
  message: {
    required: 'お問い合わせ内容を入力してください',
    minLength: 'お問い合わせ内容は10文字以上で入力してください',
    maxLength: 'お問い合わせ内容は1000文字以内で入力してください'
  },
  projectDetails: {
    required: 'プロジェクト詳細を入力してください',
    minLength: 'プロジェクト詳細は10文字以上で入力してください',
    maxLength: 'プロジェクト詳細は1000文字以内で入力してください'
  },
  agreement: {
    required: '個人情報保護方針に同意してください'
  }
} as const