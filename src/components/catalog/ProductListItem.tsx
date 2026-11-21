'use client'

import { motion } from 'framer-motion'
import { Truck, Package } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { CompareToggle } from '@/components/comparison'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Grid } from '@/components/ui/Grid'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/lib/product-data'
import { Product } from '@/types/database'
import { minOrderLabel } from '@/lib/site-facts'

export interface ProductListItemProps {
  product: Product
  index: number
  /** 省略可。詳細は製品ページ（/catalog/<id>）へのリンクで開く */
  onSelect?: () => void
}

export function ProductListItem({
  product,
  index
}: ProductListItemProps) {
  const category = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  return (
    <MotionWrapper delay={index * 0.05}>
      <Card className="p-6 hover:shadow-low transition-colors">
        <div className="flex gap-6">
          {/* Image */}
          <div className="w-32 h-32 bg-bg-secondary rounded-inner flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name_ja}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <Package className={`w-12 h-12 text-text-muted ${product.image ? 'hidden' : ''}`} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">{product.name_ja}</h3>
                  <Badge variant="secondary">{category?.name_ja}</Badge>
                </div>
                <p className="text-text-secondary mb-2">{product.description_ja}</p>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>{product.lead_time_days}日</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>最小注文数: {minOrderLabel(product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.materials?.map((material, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {material}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/catalog/${product.id}`} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                詳細を見る
              </Link>
              <CompareToggle product={product} className="w-auto" />
              <Link href="/quote-simulator" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                見積もり
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </MotionWrapper>
  )
}