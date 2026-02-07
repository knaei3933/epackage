'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import type { ProductFAQ } from '@/types/product-content'

interface ProductFAQProps {
  faqs: ProductFAQ[]
  locale?: 'ja' | 'en'
}

/**
 * ProductFAQ コンポーネント
 *
 * FAQセクションをアコーディオンスタイルで表示
 * - カテゴリフィルタリング
 * - 検索機能
 * - モバイル最適化
 */
export function ProductFAQ({ faqs, locale = 'ja' }: ProductFAQProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // カテゴリの抽出
  const categories = useMemo(() => {
    const cats = new Set<string>()
    for (const faq of faqs) {
      if (faq.category) {
        cats.add(faq.category)
      }
    }
    return Array.from(cats)
  }, [faqs])

  // FAQのフィルタリング
  const filteredFAQs = useMemo(() => {
    let filtered = faqs

    // カテゴリフィルタリング
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory)
    }

    // 検索フィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq => {
        const question = locale === 'ja' ? faq.question_ja : faq.question_en
        const answer = locale === 'ja' ? faq.answer_ja : faq.answer_en
        return (
          question.toLowerCase().includes(query) ||
          answer.toLowerCase().includes(query)
        )
      })
    }

    return filtered
  }, [faqs, selectedCategory, searchQuery, locale])

  // アコーディオンの開閉
  const toggleItem = (index: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  // すべてを開く/閉じる
  const toggleAll = () => {
    if (openItems.size === filteredFAQs.length) {
      setOpenItems(new Set())
    } else {
      setOpenItems(new Set(filteredFAQs.map((_, i) => i.toString())))
    }
  }

  const isOpen = (index: string) => openItems.has(index)

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2 text-brixa-600" />
            {locale === 'ja' ? 'よくある質問' : 'Frequently Asked Questions'}
          </h3>
          <button
            onClick={toggleAll}
            className="text-sm text-brixa-600 hover:text-brixa-700 font-medium transition-colors"
          >
            {openItems.size === filteredFAQs.length
              ? (locale === 'ja' ? 'すべて閉じる' : 'Close All')
              : (locale === 'ja' ? 'すべて開く' : 'Open All')}
          </button>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'ja' ? 'キーワードで検索...' : 'Search by keyword...'}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-brixa-600"
          />
        </div>

        {/* カテゴリフィルター */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-brixa-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'ja' ? 'すべて' : 'All'}
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-brixa-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryLabel(category, locale)}
              </button>
            ))}
          </div>
        )}

        {/* FAQリスト */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {locale === 'ja'
                ? '該当する質問が見つかりませんでした。'
                : 'No questions found.'}
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <MotionWrapper key={index} delay={index * 0.05}>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleItem(index.toString())}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {locale === 'ja' ? faq.question_ja : faq.question_en}
                    </span>
                    {isOpen(index.toString()) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen(index.toString()) && (
                    <div className="px-6 pb-4 pt-2 text-gray-700 border-t border-gray-100">
                      <p className="leading-relaxed">
                        {locale === 'ja' ? faq.answer_ja : faq.answer_en}
                      </p>
                    </div>
                  )}
                </div>
              </MotionWrapper>
            ))
          )}
        </div>

        {/* 結果数表示 */}
        {searchQuery || selectedCategory ? (
          <div className="text-sm text-gray-500 text-center">
            {locale === 'ja' ? `${filteredFAQs.length}件の質問` : `${filteredFAQs.length} questions`}
          </div>
        ) : null}
      </div>
    </Card>
  )
}

/**
 * カテゴリラベルを取得
 */
function getCategoryLabel(category: string, locale: 'ja' | 'en'): string {
  const labels: Record<string, { ja: string; en: string }> = {
    ordering: { ja: 'ご注文', en: 'Ordering' },
    printing: { ja: '印刷', en: 'Printing' },
    specifications: { ja: '仕様', en: 'Specifications' },
    general: { ja: '一般', en: 'General' },
    shipping: { ja: '配送', en: 'Shipping' },
    payment: { ja: '支払い', en: 'Payment' },
  }

  return labels[category]?.[locale] || category
}
