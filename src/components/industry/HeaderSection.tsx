'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowRight, CheckCircle, Star } from 'lucide-react'

interface HeaderSectionProps {
  title: string
  subtitle: string
  icon: string
  color: string
  features: string[]
  stats: {
    satisfaction: string
    roi: string
    delivery: string
    cases: string
  }
}

export function HeaderSection({
  title,
  subtitle,
  icon,
  color,
  features,
  stats
}: HeaderSectionProps) {
  const [isHovered, setIsHovered] = useState(false)

  const colorClasses = {
    green: 'from-green-600 to-green-800',
    pink: 'from-pink-600 to-pink-800',
    blue: 'from-navy-700 to-navy-600',
    purple: 'from-purple-600 to-purple-800'
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">業界専門ソリューション</span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-5xl">{icon}</span>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  {title}
                </h1>
              </div>
              <p className="text-xl text-gray-100 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">主要特長</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-gray-100">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-lg px-8 py-4 transition-all duration-300 hover:scale-105"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                導入資料ダウンロード
                <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 font-semibold text-lg px-8 py-4 transition-all duration-300"
              >
                無料相談を予約
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>4.9/5.0 ({stats.satisfaction} 満足度)</span>
              </div>
              <div>{stats.cases}社の導入実績</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{stats.roi}</div>
              <div className="text-gray-100">ROI改善率</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{stats.cases}</div>
              <div className="text-gray-100">導入事例</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{stats.satisfaction}</div>
              <div className="text-gray-100">満足度</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{stats.delivery}</div>
              <div className="text-gray-100">最短納期</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
        </svg>
      </div>
    </div>
  )
}