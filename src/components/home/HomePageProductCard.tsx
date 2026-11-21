'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { FeaturedProduct } from '@/lib/products'
import { LEAD_TIME_LABEL, minOrderLabel } from '@/lib/site-facts'

interface HomePageProductCardProps {
  product: FeaturedProduct
  delay?: number
}

// データベースの製品名に、古い呼び名「BOX型パウチ」が残っている。見積もりとカタログの呼び名（ガゼットパウチ）にそろえて出す。
// （根本は DB の値。DB は承認なしに変えない。DB を直したら、この置き換えは消してよい）
export const toDisplayProductName = (name: string) => name.replace('BOX型パウチ', 'ガゼットパウチ').replace('BOXパウチ', 'ガゼットパウチ')

export const PRODUCT_ROW_GRID = 'lg:grid-cols-[2fr_2fr_1fr_1fr_minmax(11.5rem,auto)]'

// 元のカードの先頭3つの特長。表の上の注記で1回だけ表示する（「密封性」は指示により修正済み）。
export const PRODUCT_FEATURES = ['密封性', 'コスト競争力', '迅速な納期']

const categoryNames: Record<string, string> = {
  flat_3_side: '平袋',
  stand_up: 'スタンドパウチ',
  gusset: 'ギゼットパウチ',
  box: 'ガゼットパウチ',
  box_with_valve: 'バルブ付きガゼットパウチ',
  flat_with_zip: 'ジッパー付き平袋',
  special: '特殊仕様パウチ',
  soft_pouch: 'ソフトパウチ',
  spout_pouch: 'スパウトパウチ',
  pouch: 'パウチ',
  roll_film: 'ロールフィルム',
}

// 表示だけの略称。DB の値は変更しない（大文字小文字は区別しない）。
const MATERIAL_ABBREVIATIONS: Record<string, string> = { ALUMINUM: 'AL', ALUMINIUM: 'AL', NYLON: 'NY' }
const abbreviateMaterial = (m: string) => MATERIAL_ABBREVIATIONS[m.trim().toUpperCase()] ?? m

const linkClass =
  'whitespace-nowrap inline-flex min-h-11 items-center rounded-md font-medium text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

export function HomePageProductCard({ product, delay = 0 }: HomePageProductCardProps) {
  // 最小注文数量は見積もり画面と同じ数字（DBの値ではなく定数）を出す
  const minOrder = minOrderLabel(product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム' || product.category === 'roll_film')
  const materials = (product.materials ?? []).map(abbreviateMaterial).join('、')
  const row = `lg:grid ${PRODUCT_ROW_GRID} lg:gap-4 lg:items-center`
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      className={`border-b border-border-medium py-4 text-[15px] leading-[1.8] text-text-primary ${row}`}>
      <div className="flex items-center gap-3">
        {product.image && (
          <Image
            src={product.image}
            alt={toDisplayProductName(product.name_ja)}
            width={112}
            height={112}
            sizes="(min-width: 1024px) 112px, 88px"
            className="h-[88px] w-[88px] shrink-0 rounded-inner object-cover lg:h-28 lg:w-28"
          />
        )}
        <div>
          <div className="font-medium">{toDisplayProductName(product.name_ja)}</div>
          <div className="text-sm text-text-secondary">{categoryNames[product.category] ?? product.category}</div>
        </div>
      </div>
      <div className="lg:contents">
        <div><span className="mr-2 text-sm lg:sr-only">素材</span>{materials || '—'}</div>
        <div><span className="mr-2 text-sm lg:sr-only">最小注文数</span>{minOrder}</div>
        <div><span className="mr-2 text-sm lg:sr-only">納期</span>{LEAD_TIME_LABEL}</div>
      </div>
      <div className="mt-2 flex gap-6 whitespace-nowrap lg:mt-0">
        <Link href="/catalog" className={linkClass}>詳細をご確認</Link>
        <Link href="/samples" className={linkClass}>サンプル</Link>
      </div>
    </motion.li>
  )
}
