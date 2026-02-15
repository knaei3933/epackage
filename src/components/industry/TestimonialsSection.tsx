'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Star, Quote, CheckCircle, Building, TrendingUp } from 'lucide-react'

interface TestimonialsSectionProps {
  industry: string
}

export function TestimonialsSection({ industry }: TestimonialsSectionProps) {
  const testimonials = {
    'food-manufacturing': [
      {
        id: 1,
        company: 'A食品株式会社',
        industry: '惣菜メーカー',
        person: '山田 部長',
        position: '包装部長',
        avatar: '/avatars/food-1.jpg',
        rating: 5,
        content: '賞味期限が延びたことでロスが大幅に減少。コスト削減だけでなく、環境面への貢献もできて大変満足しています。',
        results: {
          costReduction: '32%',
          shelfLife: '7日延長',
          satisfaction: '98%'
        }
      },
      {
        id: 2,
        company: 'Bベーカリー',
        industry: 'パン製造',
        person: '佐藤 総務',
        position: '総務部',
        avatar: '/avatars/food-2.jpg',
        rating: 5,
        content: '輸送中の破損がほなくなりました。また、消費者からは包装デザインの良さが評判です。',
        results: {
          damageRate: '0.5%',
          designScore: '9.5/10',
          customerComplaints: '80%減少'
        }
      }
    ],
    'cosmetics': [
      {
        id: 1,
        company: 'LUXE BEAUTY',
        industry: 'プレミアムコスメ',
        person: '高橋 マーケティング',
        position: 'マーケティング部長',
        avatar: '/avatars/cosmetics-1.jpg',
        rating: 5,
        content: '包装をリニューアルしたことで、ブランドイメージが格段に向上。売上も大幅に伸びています。',
        results: {
          brandValue: '85%向上',
          salesIncrease: '42%',
          customerRetention: '65%向上'
        }
      },
      {
        id: 2,
        company: 'NATURE GLOW',
        industry: 'ナチュラルコスメ',
        person: '伊藤 環境担当',
        position: '環境推進部',
        avatar: '/avatars/cosmetics-2.jpg',
        rating: 4,
        content: 'サステナブル素材への切り替えが消費者に好評で、環境意識の高い層からの支持が集まっています。',
        results: {
          ecoRating: 'A+',
          newCustomers: '38%増加',
          mediaCoverage: '25件'
        }
      }
    ],
    'pharmaceutical': [
      {
        id: 1,
        company: '第一製薬株式会社',
        industry: '医薬品製造',
        person: '山田 GMPマネージャー',
        position: 'GMP管理部長',
        avatar: '/avatars/pharma-1.jpg',
        rating: 5,
        content: '医薬品の安定性が大幅に向上。患者からのクレームも減少し、品質管理体制として評価されています。',
        results: {
          stability: '6ヶ月延長',
          compliance: '100%',
          complaints: '80%減少'
        }
      },
      {
        id: 2,
        company: '生物医薬品KK',
        industry: 'バイオ医薬品',
        person: '佐藤 品質保証',
        position: '品質保証部長',
        avatar: '/avatars/pharma-2.jpg',
        rating: 5,
        content: '温度管理機能が非常に優れており、輸送中の品質劣化を完全に防げています。信頼性が高いです。',
        results: {
          temperatureControl: '±0.5℃',
          productLoss: '0%',
          reliability: '99.99%'
        }
      }
    ],
    'electronics': [
      {
        id: 1,
        company: '半導体製造大手',
        industry: '半導体製造',
        person: '鈴木 品質管理',
        position: '品質管理部長',
        avatar: '/avatars/electronics-1.jpg',
        rating: 5,
        content: 'ESD対策機能が非常に優れており、輸送中の静電気破損がほなくなりました。コスト面でも大変満足しています。',
        results: {
          esdFailures: '0.01%',
          costReduction: '35%',
          efficiency: '40%向上'
        }
      },
      {
        id: 2,
        company: 'スマートフォンメーカー',
        industry: 'スマートフォン部品',
        person: '田中 調達',
        position: '調達部長',
        avatar: '/avatars/electronics-2.jpg',
        rating: 4,
        content: '精密部品の破損が大幅に減少。納期も守れるようになり、生産計画が立てやすくなりました。',
        results: {
          damageRate: '0.3%',
          onTimeDelivery: '98%',
          productionEfficiency: '50%向上'
        }
      }
    ]
  }

  const testimonialList = testimonials[industry as keyof typeof testimonials] || testimonials['food-manufacturing']

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Quote className="w-8 h-8 text-navy-700" />
        <h3 className="text-2xl font-bold text-gray-900">お客様の声</h3>
      </div>

      {/* Main Testimonials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testimonialList.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-lg transition-shadow border-navy-600">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.person} />
                  <AvatarFallback>
                    {testimonial.person.split(' ')[0][0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {testimonial.rating}/5.0
                    </span>
                  </div>

                  <blockquote className="text-gray-700 italic mb-4">
                    "{testimonial.content}"
                  </blockquote>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{testimonial.person}</div>
                        <div className="text-sm text-gray-600">{testimonial.position}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {testimonial.company}
                      </Badge>
                    </div>

                    {/* Results */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">実績</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(testimonial.results).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="font-semibold text-green-700">{value}</div>
                            <div className="text-green-600">
                              {key === 'costReduction' && 'コスト削減'}
                              {key === 'shelfLife' && '賞味期限延長'}
                              {key === 'satisfaction' && '満足度'}
                              {key === 'damageRate' && '破損率'}
                              {key === 'designScore' && 'デザイン評価'}
                              {key === 'customerComplaints' && 'クレーム減少'}
                              {key === 'brandValue' && 'ブランド価値'}
                              {key === 'salesIncrease' && '売上増加'}
                              {key === 'customerRetention' && '顧客維持率'}
                              {key === 'ecoRating' && '環境評価'}
                              {key === 'newCustomers' && '新規顧客'}
                              {key === 'mediaCoverage' && 'メディア掲載'}
                              {key === 'stability' && '安定性期間'}
                              {key === 'compliance' && 'コンプライアンス'}
                              {key === 'temperatureControl' && '温度管理'}
                              {key === 'productLoss' && '製品ロス'}
                              {key === 'reliability' && '信頼性'}
                              {key === 'esdFailures' && 'ESD不良率'}
                              {key === 'efficiency' && '効率化'}
                              {key === 'onTimeDelivery' && '納期遵守率'}
                              {key === 'productionEfficiency' && '生産効率'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-navy-700 to-purple-600 rounded-xl p-8 text-white">
        <h4 className="text-xl font-bold mb-6 text-center">業界別満足度実績</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">96%+</div>
            <div className="text-sm opacity-90">平均満足度</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">120+</div>
            <div className="text-sm opacity-90">導入実績</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">85%</div>
            <div className="text-sm opacity-90">問題解決率</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">24h</div>
            <div className="text-sm opacity-90">平均対応時間</div>
          </div>
        </div>
      </div>

      {/* Additional Feedback */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-900">統計データ</CardTitle>
          <CardDescription>導入企業からのフィードバック集計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Building className="w-8 h-8 text-navy-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">4.8/5.0</div>
              <div className="text-sm text-gray-600">総合評価</div>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-600">推薦率</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">35%+</div>
              <div className="text-sm text-gray-600">平均ROI</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}