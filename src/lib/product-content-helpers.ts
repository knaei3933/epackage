/**
 * Product Content Helpers
 *
 * 製品詳細ページ用のヘルパー関数
 */

import type { TradeRecord } from '@/types/archives'
import { sampleRecords } from '@/lib/archive-data'
import type { Product } from '@/types/database'

/**
 * 関連導入事例を取得
 * @param product - 製品データ
 * @returns 関連する導入事例の配列
 */
export function getRelatedCaseStudies(product: Product): TradeRecord[] {
  if (!product.related_case_studies || product.related_case_studies.length === 0) {
    // 関連事例IDがない場合、カテゴリとタグから推測
    return getCasesByCategory(product.category)
  }

  return sampleRecords.filter(record =>
    product.related_case_studies?.includes(record.id)
  )
}

/**
 * カテゴリから導入事例を取得
 * @param category - 製品カテゴリ
 * @returns 該当する導入事例の配列
 */
export function getCasesByCategory(category: string): TradeRecord[] {
  const categoryMap: Record<string, string[]> = {
    stand_up: ['cosmetics', 'food', 'pharmaceutical'],
    spout_pouch: ['food'],
    box: ['pharmaceutical', 'cosmetics'],
    roll_film: ['food'],
    flat_3_side: ['cosmetics'],
    gassho: ['food'],
  }

  const industries = categoryMap[category] || []
  if (industries.length === 0) return []

  return sampleRecords.filter(record =>
    industries.includes(record.industry)
  )
}

/**
 * FAQをカテゴリ別にグループ化
 * @param faqs - FAQ配列
 * @returns カテゴリ別にグループ化されたFAQ
 */
export function groupFAQsByCategory(faqs: Array<{ question_ja: string; question_en: string; answer_ja: string; answer_en: string; category?: string }>) {
  const grouped: Record<string, typeof faqs> = {}

  for (const faq of faqs) {
    const category = faq.category || 'general'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(faq)
  }

  return grouped
}

/**
 * ダウンロードリンクをタイプ別にグループ化
 * @param downloads - ダウンロード配列
 * @returns タイプ別にグループ化されたダウンロード
 */
export function groupDownloadsByType(
  downloads: Array<{
    title_ja: string
    title_en: string
    url: string
    type: 'catalog' | 'spec_sheet' | 'technical_guide'
    size?: string
  }>
) {
  const grouped: Record<string, typeof downloads> = {
    catalog: [],
    spec_sheet: [],
    technical_guide: [],
  }

  for (const download of downloads) {
    if (grouped[download.type]) {
      grouped[download.type].push(download)
    }
  }

  return grouped
}

/**
 * 認証バッジのタイプからアイコンクラスを取得
 * @param name - 認証名
 * @returns アイコンクラス名
 */
export function getCertificationIcon(name: string): string {
  const iconMap: Record<string, string> = {
    'ISO 9001': 'certificate',
    'ISO 14001': 'certificate',
    'ISO 22000': 'shield',
    'FDA': 'check-circle',
    '食品衛生法': 'award',
    'FSSC 22000': 'shield-check',
  }

  return iconMap[name] || 'check-circle'
}

/**
 * 製品タブの定義を取得
 * @param product - 製品データ
 * @returns 利用可能なタブの配列
 */
export function getProductTabs(product: Product) {
  import { Info, Ruler, Package, TrendingUp, HelpCircle, Download, BookOpen, MessageSquare, Settings } from 'lucide-react'

  const tabs = [
    { id: 'overview' as const, label: '概要', icon: Info },
    { id: 'specifications' as const, label: '仕様', icon: Ruler },
    { id: 'applications' as const, label: '用途', icon: Package },
    { id: 'pricing' as const, label: '価格', icon: TrendingUp },
  ]

  // Phase 1: 基本拡張タブ
  if (product.faq && product.faq.length > 0) {
    tabs.push({ id: 'faq' as const, label: 'FAQ', icon: HelpCircle })
  }

  if (product.downloads && product.downloads.length > 0) {
    tabs.push({ id: 'downloads' as const, label: 'ダウンロード', icon: Download })
  }

  const relatedCases = getRelatedCaseStudies(product)
  if (relatedCases.length > 0) {
    tabs.push({ id: 'cases' as const, label: '導入事例', icon: BookOpen })
  }

  // Phase 2: 信頼性構築タブ
  if (product.reviews && product.reviews.length > 0) {
    tabs.push({ id: 'reviews' as const, label: 'お客様の声', icon: MessageSquare })
  }

  if (product.customization_options && product.customization_options.length > 0) {
    tabs.push({ id: 'customization' as const, label: 'カスタマイズ', icon: Settings })
  }

  return tabs
}

/**
 * レビューの平均評価を計算
 * @param reviews - レビュー配列
 * @returns 平均評価
 */
export function getAverageRating(reviews: Array<{ rating: number }>): number {
  if (!reviews || reviews.length === 0) return 0

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

/**
 * レビューを星別にカウント
 * @param reviews - レビュー配列
 * @returns 星別のカウント
 */
export function countRatingsByStar(reviews: Array<{ rating: number }>): Record<number, number> {
  const counts: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  }

  for (const review of reviews) {
    const star = Math.round(review.rating)
    if (star >= 1 && star <= 5) {
      counts[star]++
    }
  }

  return counts
}
