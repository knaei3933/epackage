'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Users, CheckCircle, Clock } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const certifications = [
  { name: 'ISO 9001', description: '品質マネジメント' },
  { name: '食品衛生法', description: '適合確認済み' },
  { name: '薬機法', description: '対応可能' },
  { name: 'FSSC 22000', description: '食品安全' }
]

const stats = [
  { value: '500+', label: '導入企業数', icon: Users },
  { value: '100%', label: '全検査合格', icon: CheckCircle },
  { value: '21日', label: '平均納期', icon: Clock },
  { value: '30%', label: 'コスト削減', icon: Award }
]

export function TrustSignalsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <Container size="6xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <stat.icon className="w-8 h-8 text-brixa-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            取得認証・規格準拠
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-brixa-50 dark:bg-brixa-900/30 text-brixa-700 dark:text-brixa-300 rounded-full text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{cert.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client Logos Placeholder */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            500社以上の企業様にご利用いただいています
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {/* Placeholder - 実際のロゴ画像に差し替え */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-24 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400 dark:text-gray-500"
              >
                企業ロゴ
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
