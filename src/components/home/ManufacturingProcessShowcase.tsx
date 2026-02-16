'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import Link from 'next/link'
import {
  Settings,
  Package,
  Shield,
  CheckCircle,
  ArrowRight,
  Clock,
  Award,
  Users
} from 'lucide-react'

// Manufacturing process data with new 4-process structure
const manufacturingProcesses = [
  {
    id: 1,
    step: '01',
    title: 'デジタル印刷',
    titleEn: 'Digital Printing',
    image: '/images/print.png',
    description: 'HP Indigo 25000を活用した高品質デジタル印刷。小ロットから大量生産まで迅速なリードタイムと正確な色再現を実現します。',
    features: ['HP Indigo 25000', '高鮮明カラー', '迅速リードタイム', 'カスタム印刷'],
    icon: Settings
  },
  {
    id: 2,
    step: '02',
    title: 'ラミネート加工',
    titleEn: 'Laminating',
    image: '/images/rami.png',
    description: 'NON-VOC環境配慮型ラミネート工法。有機溶媒を使用しない環境配慮型設備で安全で清潔な包装材を生産します。',
    features: ['NON-VOC工法', '溶剤フリー(Solvent Free)', '環境配慮材料', '安全性確保'],
    icon: Shield
  },
  {
    id: 3,
    step: '03',
    title: 'スリッティング/切断',
    titleEn: 'Slitting/Cutting',
    image: '/images/cut.png',
    description: '精密スリッティング及び切断技術。島打刃を活用しμm単位の精密な加工精度を維持します。',
    features: ['島打刃設備', 'μm単位精度', '自動品質検査', '一貫した規格'],
    icon: Settings
  },
  {
    id: 4,
    step: '04',
    title: 'パウチ加工',
    titleEn: 'Pouch Forming',
    image: '/images/pouch.png',
    description: '一貫した生産ラインシステム。印刷、ラミネート、スリッティング、パウチ加工まで一つのシステムで管理し品質の一貫性を保証します。',
    features: ['統合生産ライン', '品質一貫性', '工期短縮', '費用効率性'],
    icon: Package
  }
]

const qualityStats = [
  { value: '99.8%', label: '品質合格率', icon: CheckCircle },
  { value: '24時間', label: '生産リードタイム', icon: Clock },
  { value: '15年', label: '平均従業年数', icon: Users },
  { value: 'ISO9001', label: '国際品質規格', icon: Award }
]

const certifications = [
  { name: '食品安全規格', description: '日本の食品安全基準に対応' },
  { name: '食品衛生法', description: '食品衛生法完全準拠' }
]

export function ManufacturingProcessShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <Container size="6xl">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-navy-700 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Settings className="w-4 h-4" />
              <span>製造工程の紹介</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              一貫したパウチ製造サービス
              <span className="block text-purple-600 mt-2">印刷、ラミネート、スリッティング、パウチ加工</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                印刷、ラミネート、スリッティング、パウチ加工まで一貫して製作しています。
              NON-VOC環境配慮型設備と精密加工技術で高品質包装材を生産します。
            </p>
          </div>
        </MotionWrapper>

        {/* Manufacturing Process Timeline */}
        <div className="relative mb-20">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-200 to-navy-600 hidden md:block"></div>

          <div className="space-y-12">
            {manufacturingProcesses.map((process, index) => (
              <MotionWrapper key={process.id} delay={0.2 + index * 0.15}>
                <div className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} space-y-6 md:space-y-0 md:space-x-8`}>
                  {/* Process Card */}
                  <div className="flex-1">
                    <Card className="p-6 hover:shadow-xl transition-all duration-500 bg-white border border-gray-100">
                      <div className="flex items-start space-x-4">
                        {/* Step Number */}
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-navy-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {process.step}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {process.title}
                            </h3>
                            <p className="text-sm text-gray-500">{process.titleEn}</p>
                          </div>

                          <p className="text-gray-600 leading-relaxed">
                            {process.description}
                          </p>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">主な特徴:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {process.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Process Image */}
                  <div className="flex-1">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
                      <Image
                        src={process.image}
                        alt={process.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-purple-600 rounded-full hidden md:flex items-center justify-center">
                    <process.icon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>

        {/* Quality Stats */}
        <MotionWrapper delay={0.8}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {qualityStats.map((stat, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </MotionWrapper>

  
        </Container>
    </section>
  )
}