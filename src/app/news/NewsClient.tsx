'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  User,
  Tag,
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Package,
  Megaphone,
  Eye,
  Star
} from 'lucide-react'
import { formatDateJa } from '@/utils/formatters'
import { Button, buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import { headingFont } from '@/components/home/fonts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import Link from 'next/link'

interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  authorRole?: string
  publishedAt: string
  updatedAt: string
  category: 'pouch-product' | 'pouch-case' | 'pouch-industry' | 'pouch-technology'
  tags: string[]
  featured: boolean
  imageUrl?: string
  readTime: number
  views: number
}

// パウチ包装専門のサンプルニュースデータ
const samplePouchNews: NewsArticle[] = [
  {
    id: 'pouch-news-001',
    title: '新ソフトパウチシリーズ「高バリア仕様」を発売開始',
    slug: 'high-barrier-soft-pouch-series',
    excerpt: '酸素透過率を80%低減した新ソフトパウチシリーズ。食品鮮度保持期間を大幅に延長し、化粧品や健康食品に最適。',
    content: '詳細なコンテンツ...',
    author: '田中 健一',
    authorRole: '製品開発部長',
    publishedAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    category: 'pouch-product',
    tags: ['ソフトパウチ', '高バリア', '食品包装', '新製品'],
    featured: true,
    imageUrl: '/images/news/high-barrier-pouch.jpg',
    readTime: 5,
    views: 1250
  },
  {
    id: 'pouch-news-002',
    title: 'スタンディングパウチ包装展示会2024に出展決定',
    slug: 'standing-pouch-expo-2024',
    excerpt: 'パウチ包装専門展示会に出展。最新のスタンディングパウチ技術と environmentally friendly素材を披露予定。',
    content: '詳細なコンテンツ...',
    author: '鈴木 美咲',
    authorRole: 'マーケティングマネージャー',
    publishedAt: '2024-11-28T14:30:00Z',
    updatedAt: '2024-11-28T14:30:00Z',
    category: 'pouch-industry',
    tags: ['展示会', 'スタンディングパウチ', 'イベント', '業界ニュース'],
    featured: true,
    imageUrl: '/images/news/standing-pouch-expo.jpg',
    readTime: 3,
    views: 890
  },
  {
    id: 'pouch-news-003',
    title: '大手健康食品メーカーにガゼットパウチを納品開始',
    slug: 'gusset-pouch-health-food-supplier',
    excerpt: '国内大手健康食品メーカーB社向けにマチ付きガゼットパウチの安定供給を開始。月産50万枚の生産体制を確立。',
    content: '詳細なコンテンツ...',
    author: '山田 太郎',
    authorRole: '営業部長',
    publishedAt: '2024-11-25T09:15:00Z',
    updatedAt: '2024-11-25T09:15:00Z',
    category: 'pouch-case',
    tags: ['ガゼットパウチ', '健康食品', '導入事例', 'B2B'],
    featured: false,
    imageUrl: '/images/news/gusset-pouch-case.jpg',
    readTime: 4,
    views: 670
  },
  {
    id: 'pouch-news-004',
    title: 'ピローパウチ製造工程の自動化システムを導入',
    slug: 'pillow-pouch-automation-system',
    excerpt: 'AI搭載のピローパウチ自動製造システムを導入。生産効率を60%向上し、品質安定性を大幅に改善。',
    content: '詳細なコンテンツ...',
    author: '佐藤 隆人',
    authorRole: '生産技術部長',
    publishedAt: '2024-11-20T16:45:00Z',
    updatedAt: '2024-11-20T16:45:00Z',
    category: 'pouch-technology',
    tags: ['ピローパウチ', '自動化', '生産技術', 'AI'],
    featured: true,
    imageUrl: '/images/news/pillow-pouch-automation.jpg',
    readTime: 7,
    views: 2100
  },
  {
    id: 'pouch-news-005',
    title: '化粧品ブランドにチャック付きソフトパウチが採用',
    slug: 'cosmetics-soft-pouch-with-zipper',
    excerpt: 'プレミアム化粧品ブランドC社の新製品に再封可能なチャック付きソフトパウチを採用。高級感と機能性を両立。',
    content: '詳細なコンテンツ...',
    author: '中村 恵子',
    authorRole: '営業担当',
    publishedAt: '2024-11-18T11:20:00Z',
    updatedAt: '2024-11-18T11:20:00Z',
    category: 'pouch-case',
    tags: ['化粧品', 'ソフトパウチ', 'チャック付き', '成功事例'],
    featured: false,
    imageUrl: '/images/news/cosmetics-soft-pouch.jpg',
    readTime: 5,
    views: 980
  },
  {
    id: 'pouch-news-006',
    title: '2024年パウチ包装市場動向調査レポートを公開',
    slug: 'pouch-packaging-market-trends-2024',
    excerpt: 'ソフトパウチ、スタンディングパウチなどの市場動向と将来予測をまとめた調査レポートを無料公開。',
    content: '詳細なコンテンツ...',
    author: '岡田 次郎',
    authorRole: '市場調査担当',
    publishedAt: '2024-11-15T13:00:00Z',
    updatedAt: '2024-11-15T13:00:00Z',
    category: 'pouch-industry',
    tags: ['市場動向', 'パウチ包装', '調査レポート', '業界分析'],
    featured: false,
    imageUrl: '/images/news/pouch-market-report.jpg',
    readTime: 8,
    views: 1450
  },
  {
    id: 'pouch-news-007',
    title: '特殊形状パウチの多品種小ロット生産ラインを増強',
    slug: 'special-shape-pouch-production-line',
    excerpt: '顧客ニーズの多様化に対応するため、特殊形状パウチの柔性生産システムを導入。最小ロット500枚から対応可能に。',
    content: '詳細なコンテンツ...',
    author: '藤本 雄一',
    authorRole: '製造部長',
    publishedAt: '2024-11-10T10:30:00Z',
    updatedAt: '2024-11-10T10:30:00Z',
    category: 'pouch-product',
    tags: ['特殊形状パウチ', '多品種小ロット', '生産体制', '柔軟性'],
    featured: false,
    imageUrl: '/images/news/special-shape-pouch.jpg',
    readTime: 4,
    views: 780
  },
  {
    id: 'pouch-news-008',
    title: '三角パウチの液体充填適性評価試験を完了',
    slug: 'triangle-pouch-liquid-filling-test',
    excerpt: '液体製品向け三角パウチの充填・密封性能に関する厳格な評価試験を完了。液漏れ防止性能を確認。',
    content: '詳細なコンテンツ...',
    author: '松本 直樹',
    authorRole: '品質保証部長',
    publishedAt: '2024-11-05T14:15:00Z',
    updatedAt: '2024-11-05T14:15:00Z',
    category: 'pouch-technology',
    tags: ['三角パウチ', '液体充填', '品質評価', '密封性能'],
    featured: false,
    imageUrl: '/images/news/triangle-pouch-test.jpg',
    readTime: 6,
    views: 650
  }
]

const INNER = 'mx-auto max-w-[1120px] px-4 sm:px-6'
const H2 = 'font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] [overflow-wrap:anywhere] md:text-[2rem]'
const CONTROL = 'h-10 w-full rounded-md border border-border-strong bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11'
const SELECT = CONTROL.replace('w-full ', '')
const CHIP = 'min-h-10 rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:min-h-11'
const CHIP_ON = 'border-brand bg-brand text-on-brand'
const CHIP_OFF = 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'

const categoryInfo = {
  'pouch-product': { name: 'パウチ製品', icon: Package, color: 'green' },
  'pouch-case': { name: '導入事例', icon: Star, color: 'blue' },
  'pouch-industry': { name: '業界動向', icon: TrendingUp, color: 'purple' },
  'pouch-technology': { name: '技術革新', icon: Megaphone, color: 'orange' }
}

export function NewsClient() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        setArticles(samplePouchNews)
        setFilteredArticles(samplePouchNews)
      } catch (error) {
        console.error('Failed to load articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticles()
  }, [])

  useEffect(() => {
    let filtered = [...articles]

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case 'popular':
          return b.views - a.views
        case 'views':
          return b.views - a.views
        default:
          return 0
      }
    })

    setFilteredArticles(filtered)
  }, [articles, selectedCategory, searchTerm, sortBy])

  const formatReadTime = (minutes: number) => {
    return `約${minutes}分で読めます`
  }

  return (
    <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageHeader
          title="パウチ包装ニュース"
          lead="Epackage Labのパウチ製品最新情報、導入事例、業界動向をお届けします"
        />
      </motion.div>

      {/* Filters and Search */}
      <section className="py-8">
        <div className={INNER}>
          <div className="rounded-container border border-border-medium bg-bg-primary p-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="パウチ関連ニュースを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${CONTROL} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-text-secondary" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`${SELECT} px-4`}
                >
                  <option value="all">すべてのカテゴリー</option>
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-text-secondary" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`${SELECT} px-4`}
                >
                  <option value="latest">最新順</option>
                  <option value="popular">人気順</option>
                  <option value="views">閲覧数順</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border-medium pt-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`${CHIP} ${selectedCategory === 'all' ? CHIP_ON : CHIP_OFF}`}
              >
                すべて
              </button>
              {Object.entries(categoryInfo).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`${CHIP} ${selectedCategory === key ? CHIP_ON : CHIP_OFF}`}
                >
                  {info.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {filteredArticles.filter(article => article.featured).length > 0 && (
        <section className="bg-bg-secondary py-16">
          <div className={INNER}>
            <div className="mb-8">
              <h2 className={H2}>
                注目のニュース
              </h2>
              <p className="mt-2 text-text-secondary">
                最新の重要なパウチ包装情報や人気の記事
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {filteredArticles.filter(article => article.featured).slice(0, 2).map((article, index) => (
                <MotionWrapper key={article.id} delay={index * 0.1}>
                  <Card className="group overflow-hidden transition-colors hover:border-border-strong hover:shadow-low">
                    <div className="relative">
                      <div className="flex aspect-video items-center justify-center bg-bg-secondary">
                        <Package className="h-16 w-16 text-brand" />
                      </div>
                      <div className="absolute left-4 top-4">
                        <Badge variant="default">
                          注目
                        </Badge>
                      </div>
                      <div className="absolute right-4 top-4">
                        <Badge variant="secondary">
                          {categoryInfo[article.category].name}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="mb-2 text-xl font-bold text-text-primary transition-colors group-hover:text-brand">
                          {article.title}
                        </h3>
                        <p className="mb-4 line-clamp-2 text-text-secondary">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateJa(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatReadTime(article.readTime)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{article.views.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="max-sm:h-11" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                          続きを読む
                        </Button>
                      </div>
                    </div>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-16">
        <div className={INNER}>
          <div className="mb-8">
            <h2 className={H2}>
              すべてのニュース
            </h2>
            <p className="mt-2 text-text-secondary">
              {filteredArticles.length}件のパウチ包装関連記事
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-bg-muted"></div>
                  <div className="space-y-3 p-6">
                    <div className="h-4 w-3/4 rounded-inner bg-bg-muted"></div>
                    <div className="h-3 w-full rounded-inner bg-bg-muted"></div>
                    <div className="h-3 w-5/6 rounded-inner bg-bg-muted"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article, index) => (
                <MotionWrapper key={article.id} delay={index * 0.05}>
                  <Card className="group overflow-hidden transition-colors hover:border-border-strong hover:shadow-low">
                    <div className="relative">
                      <div className="flex aspect-video items-center justify-center bg-bg-secondary">
                        <Package className="h-12 w-12 text-brand" />
                      </div>
                      {article.featured && (
                        <div className="absolute left-4 top-4">
                          <Badge variant="default">
                            注目
                          </Badge>
                        </div>
                      )}
                      <div className="absolute right-4 top-4">
                        <Badge variant="secondary">
                          {categoryInfo[article.category].name}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-text-primary transition-colors group-hover:text-brand">
                          {article.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-text-secondary">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="mb-4 flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="rounded-inner bg-bg-muted px-2 py-1 text-[13px] text-text-secondary">
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-[13px] text-text-muted">
                            +{article.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[13px] text-text-muted">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateJa(article.publishedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border-medium pt-4">
                        <div className="flex items-center gap-3 text-[13px] text-text-muted">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.readTime}分</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="max-sm:h-11">
                          続きを読む
                        </Button>
                      </div>
                    </div>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          )}

          {!isLoading && filteredArticles.length === 0 && (
            <div className="py-16 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-text-muted" />
              <h3 className="mb-2 text-lg font-bold text-text-primary">
                パウチ関連ニュースが見つかりませんでした
              </h3>
              <p className="mb-4 text-text-secondary">
                検索条件を変更してもう一度お試しください
              </p>
              <Button onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}>
                フィルターをリセット
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-inverted py-16 text-text-inverse md:py-24">
        <div className={INNER}>
          <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] [overflow-wrap:anywhere] md:text-[2rem]">
            パウチ包装の最新情報をお届けします
          </h2>
          <p className="mt-4 max-w-[40em] leading-[1.8]">
            新製品情報、導入事例、業界動向などをいち早くお届けします
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
            <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              パウチ専門家に相談
            </Link>
            <Link href="/samples" className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft">
              無料サンプル請求
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
