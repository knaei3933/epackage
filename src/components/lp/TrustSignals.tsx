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
    icon: <Shield className="w-6 h-6" />,
    value: '厳格な品質管理',
    label: '品質保証',
    description: '全工程で品質を担保'
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    value: '迅速対応',
    label: 'サポート体制',
    description: '24時間対応・充実のサポート'
  }
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
            className="flex items-center space-x-2 text-sm text-text-secondary"
          >
            <span className="text-brand">{signal.icon}</span>
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
            <div className="text-lg font-bold text-text-primary">{signal.value}</div>
            <div className="text-xs text-text-muted">{signal.label}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`bg-bg-secondary py-12 ${className}`}>
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
              className="rounded-container border border-border-medium bg-bg-primary p-6 transition-colors hover:border-border-dark hover:shadow-low"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand text-on-brand">
                  {signal.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-primary">{signal.value}</div>
                  <div className="text-sm font-medium text-text-secondary">{signal.label}</div>
                </div>
              </div>
              {signal.description && (
                <p className="text-sm text-text-muted">{signal.description}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
