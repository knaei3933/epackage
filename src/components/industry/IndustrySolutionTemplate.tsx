'use client'

import { useState } from 'react'
import { HeaderSection } from '@/components/industry/HeaderSection'
import { SolutionsSection } from '@/components/industry/SolutionsSection'
import { CaseStudiesSection } from '@/components/industry/CaseStudiesSection'
import { TechnicalSpecsSection } from '@/components/industry/TechnicalSpecsSection'
import { ContactExpertSection } from '@/components/industry/ContactExpertSection'
import { IndustryNavigation } from '@/components/industry/IndustryNavigation'
import { Apple, Cpu, Pill, Sparkles } from 'lucide-react'

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
      icon: Apple,
      features: ['厳格な品質管理', '鮮度保持技術', 'コスト最適化', '安全認証'],
    },
    'cosmetics': {
      name: '化粧品業界',
      icon: Sparkles,
      features: ['プレミアム包装', 'ブランド価値向上', '欧日認証', '持続可能性'],
    },
    'pharmaceutical': {
      name: '医薬品業界',
      icon: Pill,
      features: ['GMP準拠', '薬機法対応', '小児安全包装', '保護機能強化'],
    },
    'electronics': {
      name: '電子部品業界',
      icon: Cpu,
      features: ['ESD防止', '衝撃吸収', '部品保護', '供給網安定'],
    }
  }

  const config = industryConfig[industry as keyof typeof industryConfig]

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navigation */}
      <IndustryNavigation activeIndustry={industry} />

      {/* Hero Section */}
      <HeaderSection
        title={title}
        subtitle={subtitle}
        icon={config.icon}
        features={config.features}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-bg-primary border border-border-medium rounded-container p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'solutions', label: 'ソリューション' },
                    { id: 'specs', label: '技術仕様' },
                    { id: 'cases', label: '導入事例' },
                    { id: 'contact', label: '専門家へ相談' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-muted text-on-brand-muted font-medium'
                          : 'text-text-secondary hover:bg-bg-secondary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-bg-primary border border-border-medium rounded-container p-8">
              {/* Tab Content */}
              {activeTab === 'solutions' && content}

              {activeTab === 'specs' && (
                <TechnicalSpecsSection industry={industry} />
              )}

              {activeTab === 'cases' && (
                <CaseStudiesSection industry={industry} />
              )}

              {activeTab === 'contact' && (
                <ContactExpertSection industry={industry} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Industries */}
      <div className="bg-bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-8">関連業界ソリューション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(industryConfig)
              .filter(([key]) => key !== industry)
              .map(([key, industryData]) => (
                <a
                  key={key}
                  href={`/industry/${key}`}
                  className="bg-bg-primary border border-border-medium rounded-container p-6 transition-shadow hover:border-border-strong hover:shadow-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <industryData.icon className="mb-3 h-8 w-8 text-brand" aria-hidden="true" />
                  <h3 className="font-semibold text-lg text-text-primary mb-2">{industryData.name}</h3>
                  <p className="text-text-secondary text-sm">
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