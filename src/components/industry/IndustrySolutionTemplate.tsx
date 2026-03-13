'use client'

import { useState } from 'react'
import { HeaderSection } from '@/components/industry/HeaderSection'
import { SolutionsSection } from '@/components/industry/SolutionsSection'
import { CaseStudiesSection } from '@/components/industry/CaseStudiesSection'
import { TechnicalSpecsSection } from '@/components/industry/TechnicalSpecsSection'
import { ROISection } from '@/components/industry/ROISection'
import { ContactExpertSection } from '@/components/industry/ContactExpertSection'
import { IndustryCalculator } from '@/components/industry/IndustryCalculator'
import { TestimonialsSection } from '@/components/industry/TestimonialsSection'
import { IndustryNavigation } from '@/components/industry/IndustryNavigation'

interface IndustrySolutionTemplateProps {
  industry: string
  title: string
  subtitle: string
  content: React.ReactNode
}

export function IndustrySolutionTemplate({
  industry,
  title,
  subtitle,
  content
}: IndustrySolutionTemplateProps) {
  const [activeTab, setActiveTab] = useState('solutions')

  const industryConfig = {
    'food-manufacturing': {
      name: '食品製造業',
      color: 'green',
      icon: '🍎',
      features: ['厳格な品質管理', '鮮度保持技術', 'コスト削減30%', '安全認証'],
      stats: {
        satisfaction: '98%',
        roi: '30%',
        delivery: '24時間',
        cases: '150+'
      }
    },
    'cosmetics': {
      name: '化粧品業界',
      color: 'pink',
      icon: '💄',
      features: ['プレミアム包装', 'ブランド価値向上', '欧日認証', '持続可能性'],
      stats: {
        satisfaction: '96%',
        roi: '25%',
        delivery: '48時間',
        cases: '80+'
      }
    },
    'pharmaceutical': {
      name: '医薬品業界',
      color: 'blue',
      icon: '💊',
      features: ['GMP準拠', '薬機法対応', '小児安全包装', '保護機能強化'],
      stats: {
        satisfaction: '99%',
        roi: '20%',
        delivery: '72時間',
        cases: '60+'
      }
    },
    'electronics': {
      name: '電子部品業界',
      color: 'purple',
      icon: '🔌',
      features: ['ESD防止', '衝撃吸収', '部品保護', '供給網安定'],
      stats: {
        satisfaction: '97%',
        roi: '35%',
        delivery: '36時間',
        cases: '120+'
      }
    }
  }

  const config = industryConfig[industry as keyof typeof industryConfig]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <IndustryNavigation activeIndustry={industry} />

      {/* Hero Section */}
      <HeaderSection
        title={title}
        subtitle={subtitle}
        icon={config.icon}
        color={config.color}
        features={config.features}
        stats={config.stats}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'solutions', label: 'ソリューション' },
                    { id: 'specs', label: '技術仕様' },
                    { id: 'roi', label: 'ROI分析' },
                    { id: 'calculator', label: '計算ツール' },
                    { id: 'cases', label: '導入事例' },
                    { id: 'testimonials', label: 'お客様の声' },
                    { id: 'contact', label: '専門家へ相談' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-navy-700 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">業界別統計</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">導入企業数</span>
                    <span className="font-semibold">{config.stats.cases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">満足度</span>
                    <span className="font-semibold">{config.stats.satisfaction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI改善率</span>
                    <span className="font-semibold">{config.stats.roi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">納期</span>
                    <span className="font-semibold">{config.stats.delivery}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Tab Content */}
              {activeTab === 'solutions' && content}

              {activeTab === 'specs' && (
                <TechnicalSpecsSection industry={industry} />
              )}

              {activeTab === 'roi' && (
                <ROISection industry={industry} />
              )}

              {activeTab === 'calculator' && (
                <IndustryCalculator industry={industry} />
              )}

              {activeTab === 'cases' && (
                <CaseStudiesSection industry={industry} />
              )}

              {activeTab === 'testimonials' && (
                <TestimonialsSection industry={industry} />
              )}

              {activeTab === 'contact' && (
                <ContactExpertSection industry={industry} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Industries */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">関連業界ソリューション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(industryConfig)
              .filter(([key]) => key !== industry)
              .map(([key, industryData]) => (
                <a
                  key={key}
                  href={`/industry/${key}`}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-3">{industryData.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{industryData.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {industryData.features.slice(0, 2).join('・')}
                  </p>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}