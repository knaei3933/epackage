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
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatReadTime = (minutes: number) => {
    return `約${minutes}分で読めます`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-brixa-600 to-amber-600 text-white">
        <Container size="6xl" className="py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                パウチ包装ニュース
              </h1>
              <p className="text-xl text-brixa-600 max-w-3xl mx-auto">
                Epackage Labのパウチ製品最新情報、導入事例、業界動向をお届けします
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Filters and Search */}
      <section className="py-8">
        <Container size="6xl">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="パウチ関連ニュースを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
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
                <Clock className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                >
                  <option value="latest">最新順</option>
                  <option value="popular">人気順</option>
                  <option value="views">閲覧数順</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-brixa-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              {Object.entries(categoryInfo).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-brixa-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {info.name}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Articles */}
      {filteredArticles.filter(article => article.featured).length > 0 && (
        <section className="py-12">
          <Container size="6xl">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                注目のニュース
              </h2>
              <p className="text-gray-600">
                最新の重要なパウチ包装情報や人気の記事
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredArticles.filter(article => article.featured).slice(0, 2).map((article, index) => (
                <MotionWrapper key={article.id} delay={index * 0.1}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-brixa-600 to-amber-100 flex items-center justify-center">
                        <Package className="w-16 h-16 text-brixa-600" />
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge variant="metallic" className="bg-brixa-600 text-white">
                          注目
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-black/70 text-white">
                          {categoryInfo[article.category].name}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brixa-700 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatReadTime(article.readTime)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.views.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          続きを読む
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* All Articles */}
      <section className="py-12">
        <Container size="6xl">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              すべてのニュース
            </h2>
            <p className="text-gray-600">
              {filteredArticles.length}件のパウチ包装関連記事
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <MotionWrapper key={article.id} delay={index * 0.05}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-brixa-50 to-brixa-100 flex items-center justify-center">
                        <Package className="w-12 h-12 text-brixa-600" />
                      </div>
                      {article.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="metallic" className="bg-brixa-600 text-white text-xs">
                            注目
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                          {categoryInfo[article.category].name}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brixa-700 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-brixa-600 text-brixa-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{article.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}分</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
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
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                パウチ関連ニュースが見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-4">
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
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-navy-700 to-indigo-600 text-white">
        <Container size="4xl">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              パウチ包装の最新情報をお届けします
            </h2>
            <p className="text-navy-600 mb-8 max-w-2xl mx-auto">
              新製品情報、導入事例、業界動向などをいち早くお届けします
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="secondary" className="bg-white text-navy-700 hover:bg-gray-100 px-8 py-4">
                  パウチ専門家に相談
                </Button>
              </Link>
              <Link href="/samples">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-navy-700 px-8 py-4">
                  無料サンプル請求
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}