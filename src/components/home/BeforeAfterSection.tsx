'use client'

import { motion } from 'framer-motion'

const beforeAfterData = [
  {
    before: '納期が読めず、在庫過多・不足に振り回される',
    after: '28日定期納品で、安定供給を実現',
  },
  {
    before: '売れない在庫の廃棄コストで利益が圧迫される',
    after: '500枚から発注できるから、在庫ロスが最小化',
  },
  {
    before: 'メール・電話のやりとりに時間を奪われる',
    after: 'オンライン完結で、24時間いつでも発注完了',
  },
]

export function BeforeAfterSection() {
  return (
    <section className="bg-bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <h2 className="[word-break:keep-all] [overflow-wrap:anywhere] font-heading text-2xl sm:text-3xl leading-[1.4] text-text-primary md:text-4xl">
          導入前後の変化
        </h2>
        <p className="mt-3 leading-[1.8] text-text-primary">100社以上の企業様が体験した変革</p>

        <div className="mt-10 grid grid-cols-2 gap-x-0">
          <h3 className="pr-6 text-sm font-medium text-text-primary md:pr-12">導入前</h3>
          <h3 className="border-l border-brand-soft pl-6 text-sm font-medium text-brand md:pl-12">導入後</h3>
          {beforeAfterData.map((item, index) => (
            <motion.div
              key={item.before}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="col-span-2 grid grid-cols-2"
            >
              <p className="py-5 pr-6 text-[15px] leading-[1.8] text-text-primary md:pr-12">{item.before}</p>
              <p className="border-l border-brand-soft py-5 pl-6 text-[15px] font-medium leading-[1.8] text-text-primary md:pl-12">
                {item.after}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 max-w-[40em] border-t border-brand-soft pt-6">
          <p className="leading-[1.8] text-text-primary">年間300万円の在庫廃棄コストを</p>
          <p className="font-heading text-4xl text-brand">70%削減</p>
          <p className="mt-2 text-sm leading-[1.8] text-text-primary">※ 導入企業の平均実績に基づく</p>
        </div>
      </div>
    </section>
  )
}
