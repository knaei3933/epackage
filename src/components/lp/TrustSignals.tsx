'use client'

import React from 'react'
import { Building2, Users, Award, Shield, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface TrustSignal {
  icon: React.ReactNode
  value: string
  label: string
  description?: string
}

const trustSignalsData: TrustSignal[] = [
  {
    icon: <Users className="w-6 h-6" />,
    value: '500社以上',
    label: '導入実績',
    description: '多くの企業様にご愛用いただいています'
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    value: '30年以上',
    label: '業界経験',
    description: '長年の実績と信頼'
  },
  {
    icon: <Award className="w-6 h-6" />,
    value: 'ISO9001',
    label: '認証取得',
    description: '品質マネジメントシステム認証'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    value: '完全対応',
    label: '食品衛生法',
    description: '食品安全規格に完全準拠'
  }
]

const certifications = [
  { name: 'ISO9001', description: '品質マネジメントシステム' },
  { name: 'ISO22000', description: '食品安全マネジメント' },
  { name: 'FSSC22000', description: '食品安全システム認証' },
  { name: '食品衛生法', description: '日本の食品衛生法に準拠' }
]

interface TrustSignalsProps {
  variant?: 'default' | 'compact' | 'minimal'
  showCertifications?: boolean
  className?: string
}

export function TrustSignals({
  variant = 'default',
  showCertifications = false,
  className = ''
}: TrustSignalsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap justify-center gap-6 ${className}`}>
        {trustSignalsData.map((signal, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 text-sm text-gray-600"
          >
            <span className="text-brixa-600">{signal.icon}</span>
            <span className="font-semibold">{signal.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center space-x-8 ${className}`}>
        {trustSignalsData.slice(0, 3).map((signal, index) => (
          <div key={index} className="text-center">
            <div className="text-lg font-bold text-brixa-700">{signal.value}</div>
            <div className="text-xs text-gray-500">{signal.label}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`py-12 bg-gradient-to-br from-gray-50 via-white to-brixa-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {trustSignalsData.map((signal, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brixa-500 to-brixa-600 rounded-lg flex items-center justify-center text-white">
                  {signal.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{signal.value}</div>
                  <div className="text-sm font-medium text-gray-600">{signal.label}</div>
                </div>
              </div>
              {signal.description && (
                <p className="text-xs text-gray-500">{signal.description}</p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {showCertifications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <h3 className="text-center text-sm font-semibold text-gray-700 mb-4">
              安全規格・認証取得
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="text-sm font-semibold text-green-800">{cert.name}</span>
                    <span className="text-xs text-green-600 ml-1">{cert.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Standalone component for certification badges
export function CertificationBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {certifications.map((cert, index) => (
        <div
          key={index}
          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Shield className="w-4 h-4 text-green-600" />
          <div>
            <span className="text-xs font-semibold text-green-800">{cert.name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
