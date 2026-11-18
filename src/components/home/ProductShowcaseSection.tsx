'use client'

import Link from 'next/link'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { HomePageProductCard, PRODUCT_FEATURES, PRODUCT_ROW_GRID } from './HomePageProductCard'
import type { FeaturedProduct } from '@/lib/products'
import { buttonVariants } from '@/components/ui/Button'

interface ProductShowcaseSectionProps {
  products: FeaturedProduct[]
}

export function ProductShowcaseSection({ products }: ProductShowcaseSectionProps) {
  return (
    <section className="bg-bg-secondary py-16 md:py-24">
      <MotionWrapper delay={0.2}>
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <h2 className="[word-break:keep-all] [overflow-wrap:anywhere] font-heading text-2xl sm:text-3xl leading-[1.4] text-text-primary">
          あなたの製品に最適な
          <br />
          パッケージソリューション
        </h2>
        <p className="mt-4 max-w-[40em] leading-[1.8] text-text-primary">
          食品や化粧品、電子部品など、あらゆる製造に対応する専門パウチ製造・
          あなたのニーズに合わせて最適な包装ソリューションをご提案いたします。
        </p>

        <div className="mt-10">
          <p className="mb-4 text-sm leading-[1.8] text-text-primary">{PRODUCT_FEATURES.join('、')}</p>
          <div
            className={`hidden border-b border-brand-soft pb-3 text-sm font-medium text-text-primary lg:grid ${PRODUCT_ROW_GRID} lg:gap-4`}
            aria-hidden="true"
          >
            <span>製品名</span>
            <span>素材</span>
            <span>最小注文数</span>
            <span>納期</span>
            <span>詳細／サンプル</span>
          </div>
          <ul>
            {products.map((product, index) => (
              <HomePageProductCard key={product.id} product={product} delay={0.3 + index * 0.1} />
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <Link
            href="/catalog"
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            製品を見る
          </Link>
        </div>
      </div>
      </MotionWrapper>
    </section>
  )
}
