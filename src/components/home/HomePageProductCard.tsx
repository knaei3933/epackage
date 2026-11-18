'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { FeaturedProduct } from '@/lib/products'

interface HomePageProductCardProps {
  product: FeaturedProduct
  delay?: number
}

export const PRODUCT_ROW_GRID = 'md:grid-cols-[2fr_2fr_1fr_1fr_minmax(11.5rem,auto)]'

// 元のカードの先頭3つの特長。表の上の注記で1回だけ表示する（「密封性」は指示により修正済み）。
export const PRODUCT_FEATURES = ['密封性', 'コスト競争力', '迅速な納期']

const categoryNames: Record<string, string> = {
  flat_3_side: '平袋',
  stand_up: 'スタンドパウチ',
  gusset: 'ギゼットパウチ',
  box: 'BOXパウチ',
  box_with_valve: 'バルブ付きBOXパウチ',
  flat_with_zip: 'ジッパー付き平袋',
  special: '特殊仕様パウチ',
  soft_pouch: 'ソフトパウチ',
  spout_pouch: 'スパウトパウチ',
  pouch: 'パウチ',
  roll_film: 'ロールフィルム',
}

const linkClass =
  'whitespace-nowrap rounded-[4px] py-1 font-medium text-[#2D6C65] underline underline-offset-4 hover:text-[#245a54] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5EB6AC]'

export function HomePageProductCard({ product, delay = 0 }: HomePageProductCardProps) {
  const unit = product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム' ? 'M' : '枚'
  const materials = (product.materials ?? []).join('、')
  const row = `md:grid ${PRODUCT_ROW_GRID} md:gap-4 md:items-baseline`
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      className={`border-b border-[#5EB6AC]/40 py-5 text-[15px] leading-[1.8] text-[#2F333D] ${row}`}>
      <div className="flex items-center gap-3">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name_ja}
            width={56}
            height={56}
            sizes="56px"
            className="h-14 w-14 shrink-0 rounded-[4px] object-cover"
          />
        )}
        <div>
          <div className="font-medium">{product.name_ja}</div>
          <div className="text-sm text-[#2F333D]/70">{categoryNames[product.category] ?? product.category}</div>
        </div>
      </div>
      <div className="md:contents">
        <div><span className="mr-2 text-sm md:sr-only">素材</span>{materials || '—'}</div>
        <div><span className="mr-2 text-sm md:sr-only">最小注文数</span>{product.min_order_quantity.toLocaleString()}{unit}</div>
        <div><span className="mr-2 text-sm md:sr-only">納期</span>{product.lead_time_days}日</div>
      </div>
      <div className="mt-2 flex gap-6 whitespace-nowrap md:mt-0">
        <Link href="/catalog" className={linkClass}>詳細をご確認</Link>
        <Link href="/samples" className={linkClass}>サンプル</Link>
      </div>
    </motion.li>
  )
}
