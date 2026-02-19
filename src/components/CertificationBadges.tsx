'use client'

import React from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Badge } from '@/components/ui/Badge'
import {
  Shield,
  Award,
  CheckCircle,
  FileCheck,
  Globe,
  Leaf,
  Star,
  Verified,
  Ribbon,
  Crown,
  File,
  Target
} from 'lucide-react'

interface CertificationBadgesProps {
  className?: string
}

interface Certification {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  status: 'active' | 'certified' | 'compliant' | 'pending'
  category: string
  validUntil?: string
  certificateNumber?: string
  issuedBy: string
  jpnEquivalent?: string
  score?: number
}

export function CertificationBadges({ className = '' }: CertificationBadgesProps) {
  const certifications: Certification[] = [
    {
      id: 'food_safety',
      name: '食品安全規格対応',
      description: '日本の食品安全基準に準拠',
      icon: Shield,
      status: 'certified',
      category: '食品安全',
      score: 95
    },
    {
      id: 'food_hygiene',
      name: '食品衛生法',
      description: '食品包装材適合証明',
      icon: CheckCircle,
      status: 'certified',
      category: '日本法規制',
      score: 98
    },
    {
      id: 'pharma_act',
      name: '薬機法',
      description: '医薬品・医療機器包装材',
      icon: FileCheck,
      status: 'certified',
      category: '日本法規制',
      validUntil: '2026-03-31',
      certificateNumber: 'PA-2023-005',
      issuedBy: '厚生労働省',
      jpnEquivalent: '医薬品医療機器等法',
      score: 97
    },
    {
      id: 'gmp',
      name: 'GMP',
      description: '医薬品製造管理規範',
      icon: Award,
      status: 'compliant',
      category: '品質管理',
      validUntil: '2025-09-30',
      certificateNumber: 'GMP-2023-006',
      issuedBy: '医薬品医療機器総合機構',
      score: 93
    },
    {
      id: 'ce_marking',
      name: 'CEマーキング',
      description: 'EU安全指令適合',
      icon: Globe,
      status: 'active',
      category: '国際認証',
      validUntil: '2026-08-31',
      certificateNumber: 'CE-2023-007',
      issuedBy: 'EU認証機関',
      score: 96
    },
    {
      id: 'halal',
      name: 'ハラル認証',
      description: 'イスラム教徒向け製品',
      icon: Crown,
      status: 'active',
      category: '宗教的認証',
      validUntil: '2025-12-31',
      certificateNumber: 'HALAL-2023-008',
      issuedBy: 'マレーシア認証機関',
      score: 88
    },
    {
      id: 'kosher',
      name: 'コーシャ認証',
      description: 'ユダヤ教徒向け製品',
      icon: Star,
      status: 'pending',
      category: '宗教的認証',
      validUntil: '2026-01-31',
      certificateNumber: 'KOSHER-2023-009',
      issuedBy: '米国コーシャ認証機関',
      score: 85
    },
    {
      id: 'carbon_neutral',
      name: 'カーボンニュートラル',
      description: '二酸化炭素排出量中和',
      icon: Leaf,
      status: 'active',
      category: '環境認証',
      validUntil: '2025-07-31',
      certificateNumber: 'CN-2023-010',
      issuedBy: '認証サステナビリティ機関',
      score: 91
    },
    {
      id: 'pl_insurance',
      name: 'PL保険',
      description: '製造物責任保険',
      icon: Shield,
      status: 'active',
      category: 'リマネジメント',
      validUntil: '2026-12-31',
      certificateNumber: 'PL-2023-011',
      issuedBy: '損害保険ジャパン',
      score: 100
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'certified':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'active':
        return 'bg-navy-600 text-navy-600 border-navy-400'
      case 'compliant':
        return 'bg-brixa-600 text-brixa-600 border-brixa-400'
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'certified':
        return '認証済み'
      case 'active':
        return '有効'
      case 'compliant':
        return '準拠'
      case 'pending':
        return '審査中'
      default:
        return '不明'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '国際標準':
        return 'bg-purple-50 text-purple-700'
      case '日本工業規格':
        return 'bg-red-50 text-red-700'
      case '日本法規制':
        return 'bg-navy-50 text-navy-600'
      case '品質管理':
        return 'bg-green-50 text-green-700'
      case '国際認証':
        return 'bg-yellow-50 text-yellow-700'
      case '環境認証':
        return 'bg-emerald-50 text-emerald-700'
      case '宗教的認証':
        return 'bg-indigo-50 text-indigo-700'
      case 'リマネジメント':
        return 'bg-pink-50 text-pink-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  // Group certifications by category
  const groupedCertifications = certifications.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = []
    }
    acc[cert.category].push(cert)
    return acc
  }, {} as Record<string, Certification[]>)

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Verified className="h-12 w-12 text-navy-700" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                認証・規格証明
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              国際標準から日本独自の規格まで、
              厳格な品質と安全基準を証明する認証を取得しています。
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge variant="success" className="bg-green-100 text-green-700 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                12認証取得済み
              </Badge>
              <Badge variant="info" className="bg-navy-600 text-navy-600 px-4 py-2">
                <Award className="h-4 w-4 mr-1" />
                法規制100%準拠
              </Badge>
            </div>
          </div>
        </MotionWrapper>

        {/* Certification Count */}
        <MotionWrapper delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: '12', label: '取得認証', icon: Award, color: 'blue' },
              { value: '100%', label: '準拠率', icon: Target, color: 'green' },
              { value: '8', label: '国際規格', icon: Globe, color: 'purple' },
              { value: '4', label: '日本規格', icon: File, color: 'red' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 bg-${stat.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`h-8 w-8 text-${stat.color}-600`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </MotionWrapper>

        {/* Certification Groups */}
        {Object.entries(groupedCertifications).map(([category, certs], categoryIndex) => (
          <MotionWrapper key={category} delay={0.3 + categoryIndex * 0.1}>
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {category}
                </h3>
                <Badge variant="secondary" className={getCategoryColor(category)}>
                  {certs.length} 認証
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certs.map((cert, certIndex) => {
                  const Icon = cert.icon
                  return (
                    <div key={cert.id} className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r from-${cert.category === '国際標準' ? 'blue' : cert.category === '日本工業規格' ? 'red' : 'blue'}-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                      <div className="relative bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            cert.status === 'certified' ? 'bg-green-100' :
                            cert.status === 'active' ? 'bg-navy-600' :
                            cert.status === 'compliant' ? 'bg-brixa-600' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              cert.status === 'certified' ? 'text-green-600' :
                              cert.status === 'active' ? 'text-navy-700' :
                              cert.status === 'compliant' ? 'text-brixa-700' : 'text-gray-600'
                            }`} />
                          </div>

                          <div className="flex flex-col items-end space-y-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(cert.status)}`}
                            >
                              {getStatusText(cert.status)}
                            </Badge>
                            {cert.score && (
                              <Badge variant="outline" className="text-xs">
                                {cert.score}点
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Certificate Info */}
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {cert.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {cert.description}
                        </p>

                        {/* Additional Info */}
                        <div className="space-y-2">
                          {cert.issuedBy && (
                            <div className="flex items-center text-xs text-gray-500">
                              <FileCheck className="h-3 w-3 mr-1" />
                              発行機関: {cert.issuedBy}
                            </div>
                          )}

                          {cert.certificateNumber && (
                            <div className="flex items-center text-xs text-gray-500">
                              <File className="h-3 w-3 mr-1" />
                              証明番号: {cert.certificateNumber}
                            </div>
                          )}

                          {cert.validUntil && (
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center text-gray-500">
                                <Leaf className="h-3 w-3 mr-1" />
                                有効期限: {cert.validUntil}
                              </div>
                              <div className="text-right">
                                {cert.status === 'certified' && (
                                  <span className="text-green-600">有効</span>
                                )}
                                {cert.status === 'pending' && (
                                  <span className="text-brixa-700">審査中</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Japanese Equivalent */}
                        {cert.jpnEquivalent && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <Target className="h-3 w-3 mr-1" />
                              日本相当: {cert.jpnEquivalent}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <button className="text-xs text-navy-700 hover:text-navy-600 transition-colors">
                            証明書を表示
                          </button>
                          <button className="text-xs text-navy-700 hover:text-navy-600 transition-colors">
                            ダウンロード
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </MotionWrapper>
        ))}

        {/* Trust Summary */}
        <MotionWrapper delay={0.6}>
          <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                信頼と品質の証明
              </h3>
              <p className="text-navy-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                全ての認証と規格は、私たちの品質へのコミットメントを証明しています。
                日本企業の厳しい基準を満たすために、継続的な改善と検証を行っています。
              </p>

              <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    <Verified className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    認証取得数
                  </div>
                  <p className="text-sm text-navy-600">
                    12の国際・国内認証を取得
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-navy-500" />
                    規格準拠
                  </div>
                  <p className="text-sm text-navy-600">
                    100%の法規制準拠率
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    <Leaf className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                    サステナビリティ
                  </div>
                  <p className="text-sm text-navy-600">
                    環境負荷の削減と持続可能な包装
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}