'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Award, Star, TrendingUp, Palette, Globe, Leaf, Sparkles } from 'lucide-react'

export function CosmeticsContent() {
  const [activeFeature, setActiveFeature] = useState('brand')

  const features = [
    {
      id: 'brand',
      title: 'ブランド価値向上',
      description: '高級感と差別化を実現するプレミアムパッケージングデザイン',
      icon: Sparkles,
      benefits: [
        '高級感ある素材と仕上げ',
        '独自のデザインパターン',
        'ブランドコンセプトの視覚化',
        '消費者への第一印象向上'
      ],
      premiumOptions: ['金属蒸着', '特殊印刷', 'エンボス加工', '磨き仕上げ']
    },
    {
      id: 'certification',
      title: '欧日認証対応',
      description: '欧州と日本の厳しい規格をクリアする安全な包装',
      icon: Globe,
      benefits: [
        'EU Cosmetics Regulation対応',
        '日本薬事法準拠',
        '安全性検査完遂',
        '国際市場展開支援'
      ],
      certifications: ['ISO 22716', 'GMPC', 'EC 1223/2009', '厚生労働省認証']
    },
    {
      id: 'sustainability',
      title: '持続可能性',
      description: '環境配慮と美学を両立するサステナブル包装',
      icon: Leaf,
      benefits: [
        'リサイクル可能素材',
        'バイオベース素材',
        'プラスチック削減',
        'カーボンフットプリント低減'
      ],
      ecoOptions: ['PLA素材', 'パルプモールド', '植物インク', '脱プラスチック']
    }
  ]

  const successStories = [
    {
      brand: 'LUXE BEAUTY',
      category: 'プレミアムスキンケア',
      challenge: 'コモディティ化した市場での差別化不足',
      solution: '高級感包装とサステナビリティの融合',
      results: {
        brandValue: '85%向上',
        salesIncrease: '42%',
        customerLoyalty: '65%向上',
        marketShare: '3倍'
      }
    },
    {
      brand: 'NATURE GLOW',
      category: 'ナチュラルコスメ',
      challenge: '自然志向との一致した包装の不在',
      solution: 'バイオ素材使用・環境配慮デザイン',
      results: {
        ecoScore: 'A+評価',
        customerAcquisition: '38%増',
        mediaCoverage: '25件',
        premiumPositioning: '成功'
      }
    },
    {
      brand: 'TECH BEAUTY',
      category: 'テクノロジーコスメ',
      challenge: 'イノベーティブなイメージの可視化困難',
      solution: '未来感デザイン・機能的包装',
      results: {
        innovationScore: '9.2/10',
        unboxingExperience: '95%満足',
        socialMedia: '10万+',
        brandRecognition: '70%向上'
      }
    }
  ]

  const packagingTrends = [
    {
      trend: 'ミニマルラグジュアリー',
      description: 'シンプルながらも高級感を演出するデザイン',
      technologies: ['クリーンデザイン', '高質感素材', '精密加工'],
      benefits: ['高級感', '清潔感', '信頼性']
    },
    {
      trend: 'インタラクティブ包装',
      description: '消費者との対話を実現するスマート包装',
      technologies: ['AR連携', 'QRコード', 'NFCタグ'],
      benefits: ['エンゲージメント', '情報提供', '体験向上']
    },
    {
      trend: 'パーソナライゼーション',
      description: '一人ひとりのニーズに合わせたカスタム包装',
      technologies: ['オンデマンド印刷', 'データ連携', 'カスタム設計'],
      benefits: ['ロイヤリティ', '顧客満足度', '差別化']
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">
          化粧品ブランドの価値を
          <span className="text-pink-600">最大化する</span>
          <span className="text-pink-600">包装ソリューション</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          プレミアムデザイン、国際規格対応、環境配慮の3つの要素を融合。
          化粧品ブランドの販促とブランド価値向上を実現します。
        </p>
      </div>

      {/* Feature Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className={`cursor-pointer transition-all duration-300 ${
              activeFeature === feature.id
                ? 'ring-2 ring-pink-500 bg-pink-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setActiveFeature(feature.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-8 h-8 text-pink-600" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Content */}
      <div className="bg-gradient-to-br from-pink-50 to-brixa-50 rounded-xl p-8">
        {(() => {
          const feature = features.find(f => f.id === activeFeature)!
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-10 h-10 text-pink-600" />
                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
              </div>

              <p className="text-lg text-gray-700">{feature.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">主な利点</h4>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">専門オプション</h4>
                  <div className="flex flex-wrap gap-2">
                    {('premiumOptions' in feature && feature.premiumOptions) ||
                     ('certifications' in feature && feature.certifications) ||
                     ('ecoOptions' in feature && feature.ecoOptions)
                    ? ([] as string[]).concat(
                        'premiumOptions' in feature ? (feature.premiumOptions || []) : [],
                        'certifications' in feature ? (feature.certifications || []) : [],
                        'ecoOptions' in feature ? (feature.ecoOptions || []) : []
                      ).map((option, index) => (
                      <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800">
                        {option}
                      </Badge>
                    )) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Success Stories */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-pink-600" />
          <h3 className="text-2xl font-bold text-gray-900">成功事例</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-pink-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Star className="w-5 h-5 text-pink-500" />
                  <span>{story.brand}</span>
                </CardTitle>
                <CardDescription>{story.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">課題</h4>
                  <p className="text-sm text-gray-600">{story.challenge}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ソリューション</h4>
                  <p className="text-sm text-gray-600">{story.solution}</p>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-brixa-50 rounded-lg p-4">
                  <h4 className="font-semibold text-pink-900 mb-3">実績</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(story.results).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-pink-700">
                          {key === 'brandValue' && 'ブランド価値: '}
                          {key === 'salesIncrease' && '売上増加: '}
                          {key === 'customerLoyalty' && '顧客ロイヤルティ: '}
                          {key === 'marketShare' && '市場シェア: '}
                          {key === 'ecoScore' && '環境評価: '}
                          {key === 'customerAcquisition' && '顧客獲得: '}
                          {key === 'mediaCoverage' && 'メディア掲載: '}
                          {key === 'premiumPositioning' && 'プレミアムポジショニング: '}
                          {key === 'innovationScore' && 'イノベーション評価: '}
                          {key === 'unboxingExperience' && '開梱体験: '}
                          {key === 'socialMedia' && 'ソーシャルメディア: '}
                          {key === 'brandRecognition' && 'ブランド認知度: '}
                        </span>
                        <span className="text-pink-900 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Packaging Trends */}
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-8 h-8 text-pink-600" />
          <h3 className="text-2xl font-bold text-gray-900">最新包装トレンド</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packagingTrends.map((trend, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-pink-700">{trend.trend}</CardTitle>
                <CardDescription>{trend.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">技術</h4>
                    <div className="flex flex-wrap gap-1">
                      {trend.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">メリット</h4>
                    <div className="flex flex-wrap gap-1">
                      {trend.benefits.map((benefit, benefitIndex) => (
                        <Badge key={benefitIndex} variant="secondary" className="text-xs bg-pink-100 text-pink-800">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">化粧品包装で実現できる価値</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">35%+</div>
            <div>売上向上</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">85%</div>
            <div>ブランド価値向上</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">80+</div>
            <div>導入実績</div>
          </div>
        </div>

        <p className="text-lg mb-6 max-w-2xl mx-auto">
          包装はただの容器ではありません。それは消費者との最初の出会いであり、
          ブランドの約束を形にする重要なタッチポイントです。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-pink-800 hover:bg-gray-100 font-semibold px-8 py-4">
            <Sparkles className="w-5 h-5 mr-2" />
            デザインサンプル見る
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-800 font-semibold px-8 py-4">
            <TrendingUp className="w-5 h-5 mr-2" />
            成功事例詳細
          </Button>
        </div>
      </div>
    </div>
  )
}