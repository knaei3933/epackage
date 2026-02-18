'use client'

import { motion } from 'framer-motion'
import { ArrowRight, X, Check, Clock, TrendingDown, MessageSquare } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const beforeAfterData = [
  {
    before: '納期が読めず、在庫過多・不足に振り回される',
    after: '28日定期納品で、安定供給を実現',
    icon: Clock
  },
  {
    before: '売れない在庫の廃棄コストで利益が圧迫される',
    after: '500枚から発注できるから、在庫ロスが最小化',
    icon: TrendingDown
  },
  {
    before: 'メール・電話のやりとりに時間を奪われる',
    after: 'オンライン完結で、24時間いつでも発注完了',
    icon: MessageSquare
  }
]

export function BeforeAfterSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <Container size="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            導入前後の変化
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            500社以上の企業様が体験した変革
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {beforeAfterData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              {/* Before */}
              <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 dark:text-gray-300 text-sm">{item.before}</p>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mb-6" />

              {/* After */}
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-900 dark:text-white font-medium text-sm">{item.after}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ROI Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center bg-gradient-to-r from-brixa-600 to-brixa-secondary-600 rounded-2xl p-8 text-white"
        >
          <p className="text-xl md:text-2xl font-bold mb-2">
            年間300万円の在庫廃棄コストを
          </p>
          <p className="text-4xl md:text-5xl font-black">
            70%削減
          </p>
          <p className="text-sm text-white/70 mt-4">
            ※ 導入企業の平均実績に基づく
          </p>
        </motion.div>
      </Container>
    </section>
  )
}
