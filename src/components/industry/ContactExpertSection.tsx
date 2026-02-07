'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  MessageCircle,
  FileText,
  Users,
  Award
} from 'lucide-react'

interface ContactExpertSectionProps {
  industry: string
}

export function ContactExpertSection({ industry }: ContactExpertSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    preferredTime: ''
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const experts = {
    'food-manufacturing': [
      {
        name: '田中 食品',
        title: '食品包装専門コンサルタント',
        experience: '15年',
        specialties: ['食品衛生法', '鮮度保持技術', 'コスト削減'],
        achievements: '150社以上の導入支援',
        rating: 4.9,
        projects: '200+'
      },
      {
        name: '佐藤 衛生',
        title: 'HACCPスペシャリスト',
        experience: '12年',
        specialties: ['HACCP', '品質管理', '規制対応'],
        achievements: '100社の規格取得支援',
        rating: 4.8,
        projects: '150+'
      }
    ],
    'cosmetics': [
      {
        name: '高橋 ブランド',
        title: '化粧品包装デザイナー',
        experience: '18年',
        specialties: ['プレミアムデザイン', 'ブランド戦略', 'サステナビリティ'],
        achievements: '80ブランドの成功事例',
        rating: 4.9,
        projects: '300+'
      },
      {
        name: '伊藤 認証',
        title: '化粧品規制アドバイザー',
        experience: '10年',
        specialties: ['EU規制', '国内基準', '表示対策'],
        achievements: '50社の輸出支援',
        rating: 4.7,
        projects: '100+'
      }
    ],
    'pharmaceutical': [
      {
        name: '山田 GMP',
        title: '医薬品包装エンジニア',
        experience: '20年',
        specialties: ['GMP対応', '安全包装', '規制適合'],
        achievements: '60社の製造許可取得支援',
        rating: 4.9,
        projects: '180+'
      },
      {
        name: '中田 医療',
        title: '医療用包装スペシャリスト',
        experience: '14年',
        specialties: ['医療機器', '輸送管理', '品質保証'],
        achievements: '40社の品質向上支援',
        rating: 4.8,
        projects: '120+'
      }
    ],
    'electronics': [
      {
        name: '鈴木 ESD',
        title: '電子部品包装技術者',
        experience: '16年',
        specialties: ['ESD防止', '精密保護', '自動化'],
        achievements: '120社の供給網安定化',
        rating: 4.8,
        projects: '250+'
      },
      {
        name: '渡辺 半導体',
        title: '半導体包装アドバイザー',
        experience: '12年',
        specialties: ['半導体', '高精度保護', 'クリーンルーム'],
        achievements: '80社の品質改善支援',
        rating: 4.7,
        projects: '200+'
      }
    ]
  }

  const industryExperts = experts[industry as keyof typeof experts] || experts['food-manufacturing']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your API
    console.log('Form submitted:', formData)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        preferredTime: ''
      })
    }, 3000)
  }

  const specialtiesList = {
    'food-manufacturing': ['食品衛生法対応', '鮮度保持技術', 'コスト削減30%', '安全認証取得'],
    'cosmetics': ['プレミアム包装', 'ブランド価値向上', '欧日認証', '持続可能性'],
    'pharmaceutical': ['GMP準拠', '薬機法対応', '小児安全包装', '保護機能強化'],
    'electronics': ['ESD防止', '衝撃吸収', '部品保護', '供給網安定']
  }

  const specialties = specialtiesList[industry as keyof typeof specialtiesList] || specialtiesList['food-manufacturing']

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Users className="w-8 h-8 text-navy-700" />
        <h3 className="text-2xl font-bold text-gray-900">専門家へ相談</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>無料相談・資料請求</CardTitle>
              <CardDescription>
                24時間以内に専門家からご連絡いたします
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">ご相談ありがとうございます！</h4>
                  <p className="text-gray-600">
                    専門家が24時間以内にご連絡いたします。<br />
                    しばらくお待ちください。
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        氏名 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="pl-10"
                          required
                          placeholder="山田 太郎"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        会社名 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className="pl-10"
                          required
                          placeholder="株式会社〇〇"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="pl-10"
                          required
                          placeholder="example@company.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        電話番号
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="pl-10"
                          placeholder="03-1234-5678"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ご相談内容 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="pl-10"
                        required
                        placeholder="具体的なご相談内容をご記入ください"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ご希望のご連絡時間帯
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                      >
                        <option value="">指定なし</option>
                        <option value="morning">午前中（9:00-12:00）</option>
                        <option value="afternoon">午後（13:00-18:00）</option>
                        <option value="evening">夕方以降（18:00以降）</option>
                        <option value="weekend">週末</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-navy-700 text-white hover:bg-navy-600 font-semibold py-3"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    無料相談を申し込む
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Experts & Services */}
        <div className="lg:col-span-1 space-y-6">
          {/* Industry Specialists */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">専門家紹介</CardTitle>
              <CardDescription>業界に特化したスペシャリスト</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {industryExperts.map((expert, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-navy-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-navy-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                      <p className="text-sm text-gray-600">{expert.title}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{expert.rating}</span>
                        </div>
                        <span>{expert.experience}経験</span>
                        <span>{expert.projects}プロジェクト</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {expert.specialties.slice(0, 2).map((specialty, specIndex) => (
                        <Badge key={specIndex} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">提供サービス</CardTitle>
              <CardDescription>ご相談内容に合わせたサポート</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-navy-700 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">技術相談</div>
                  <div className="text-sm text-gray-600">包装技術に関する専門的なご相談</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">規格取得支援</div>
                  <div className="text-sm text-gray-600">国内外の規格取得をサポート</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">導入支援</div>
                  <div className="text-sm text-gray-600">初回導入から導入後までのサポート</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-navy-50 border-navy-600">
            <CardHeader>
              <CardTitle className="text-navy-600">お問い合わせ</CardTitle>
              <CardDescription className="text-navy-600">その他のお問い合わせ方法</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-navy-700" />
                <div>
                  <div className="font-medium text-navy-600">電話</div>
                  <div className="text-sm text-navy-600">03-1234-5678</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-navy-700" />
                <div>
                  <div className="font-medium text-navy-600">メール</div>
                  <div className="text-sm text-navy-600">info@package-lab.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-navy-700" />
                <div>
                  <div className="font-medium text-navy-600">営業時間</div>
                  <div className="text-sm text-navy-600">9:00-18:00（土日祝休み）</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Specialty Areas */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>専門分野</CardTitle>
          <CardDescription>この業界で特に強みを持つ領域</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="bg-navy-600 text-navy-600 justify-center py-2 px-4">
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}