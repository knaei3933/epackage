'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import Link from 'next/link'
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
        <h2 className="text-3xl font-bold text-text-primary">
          化粧品ブランドの価値を
          <span className="text-brand">最大化する</span>
          <span className="text-brand">包装ソリューション</span>
        </h2>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
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
                ? 'ring-2 ring-brand bg-brand-muted'
                : 'hover:shadow-low'
            }`}
            onClick={() => setActiveFeature(feature.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-8 h-8 text-brand" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-brand" />
                    <span className="text-sm text-text-secondary">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Content */}
      <div className="bg-bg-secondary rounded-container p-8">
        {(() => {
          const feature = features.find(f => f.id === activeFeature)!
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-10 h-10 text-brand" />
                <h3 className="text-2xl font-bold text-text-primary">{feature.title}</h3>
              </div>

              <p className="text-lg text-text-secondary">{feature.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-text-primary">主な利点</h4>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-brand" />
                        <span className="text-text-secondary">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-text-primary">専門オプション</h4>
                  <div className="flex flex-wrap gap-2">
                    {('premiumOptions' in feature && feature.premiumOptions) ||
                     ('certifications' in feature && feature.certifications) ||
                     ('ecoOptions' in feature && feature.ecoOptions)
                    ? ([] as string[]).concat(
                        'premiumOptions' in feature ? (feature.premiumOptions || []) : [],
                        'certifications' in feature ? (feature.certifications || []) : [],
                        'ecoOptions' in feature ? (feature.ecoOptions || []) : []
                      ).map((option, index) => (
                      <Badge key={index} variant="secondary" className="bg-brand-muted text-text-primary">
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
          <Award className="w-8 h-8 text-brand" />
          <h3 className="text-2xl font-bold text-text-primary">成功事例</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <Card key={index} className="hover:shadow-low transition-shadow border-border-medium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Star className="w-5 h-5 text-brand" />
                  <span>{story.brand}</span>
                </CardTitle>
                <CardDescription>{story.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">課題</h4>
                  <p className="text-sm text-text-secondary">{story.challenge}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-text-primary mb-2">ソリューション</h4>
                  <p className="text-sm text-text-secondary">{story.solution}</p>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4">
                  <h4 className="font-semibold text-text-primary mb-3">実績</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(story.results).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-brand">
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
                        <span className="text-text-primary font-semibold">{value}</span>
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
      <div className="bg-bg-secondary rounded-container p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-8 h-8 text-brand" />
          <h3 className="text-2xl font-bold text-text-primary">最新包装トレンド</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packagingTrends.map((trend, index) => (
            <Card key={index} className="hover:shadow-low transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-brand">{trend.trend}</CardTitle>
                <CardDescription>{trend.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-text-primary">技術</h4>
                    <div className="flex flex-wrap gap-1">
                      {trend.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-text-primary">メリット</h4>
                    <div className="flex flex-wrap gap-1">
                      {trend.benefits.map((benefit, benefitIndex) => (
                        <Badge key={benefitIndex} variant="secondary" className="text-xs bg-brand-muted text-text-primary">
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
      <div className="bg-bg-secondary border border-border-medium rounded-container p-8 text-center text-text-primary">
        <h3 className="text-2xl font-bold mb-4">化粧品包装で実現できる価値</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-bg-primary text-text-primary rounded-md p-6">
            <div className="text-3xl font-bold mb-2">35%+</div>
            <div>売上向上</div>
          </div>
          <div className="bg-bg-primary text-text-primary rounded-md p-6">
            <div className="text-3xl font-bold mb-2">85%</div>
            <div>ブランド価値向上</div>
          </div>
          <div className="bg-bg-primary text-text-primary rounded-md p-6">
            <div className="text-3xl font-bold mb-2">80+</div>
            <div>導入実績</div>
          </div>
        </div>

        <p className="text-lg mb-6 max-w-2xl mx-auto">
          包装はただの容器ではありません。それは消費者との最初の出会いであり、
          ブランドの約束を形にする重要なタッチポイントです。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/samples" className={buttonVariants({ size: 'lg', variant: 'primary' })}>
            <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
            サンプルを依頼する
          </Link>
          <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            <TrendingUp className="w-5 h-5 mr-2" aria-hidden="true" />
            専門家へ相談
          </Link>
        </div>
      </div>
    </div>
  )
}