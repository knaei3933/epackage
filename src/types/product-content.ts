/**
 * Product Content Types
 *
 * 製品詳細ページ用のコンテンツ関連タイプ定義
 */

export interface ProductFAQ {
  question_ja: string
  question_en: string
  answer_ja: string
  answer_en: string
  category?: string
}

export interface ProductDownload {
  title_ja: string
  title_en: string
  url: string
  type: 'catalog' | 'spec_sheet' | 'technical_guide'
  size?: string
}

export interface ProductCertification {
  name: string
  issuer: string
  image_url?: string
  description?: string
}

export interface ProductTechnicalDiagram {
  title: string
  url: string
  description?: string
}

export interface ProductReview {
  id: string
  client_name: string
  rating: number
  comment: string
  date: string
  industry?: string
}

export interface ProductCustomizationOption {
  name: string
  options: string[]
  default?: string
}

export interface ProductPackagingInfo {
  packaging_type: string
  pallet_quantity?: number
  carton_quantity?: number
  dimensions?: string
  weight?: string
}

export type ProductTabType =
  | 'overview'
  | 'specifications'
  | 'applications'
  | 'pricing'
  | 'faq'
  | 'downloads'
  | 'cases'
  | 'reviews'
  | 'customization'

export interface ProductTab {
  id: ProductTabType
  label: string
  icon: any
}
