'use client'

import { motion } from 'framer-motion'
import { Truck, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Grid } from '@/components/ui/Grid'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/app/api/products/route'
import { Product } from '@/types/database'

export interface ProductListItemProps {
  product: Product
  index: number
  onSelect: () => void
}

export function ProductListItem({
  product,
  index,
  onSelect
}: ProductListItemProps) {
  const category = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  return (
    <MotionWrapper delay={index * 0.05}>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onSelect}>
        <div className="flex gap-6">
          {/* Image */}
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-12 h-12 text-gray-400" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name_ja}</h3>
                  <Badge variant="secondary">{category?.name_ja}</Badge>
                </div>
                <p className="text-gray-600 mb-2">{product.description_ja}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>{product.lead_time_days}日</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>最低{product.min_order_quantity.toLocaleString()}個</span>
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
          </div>

          {/* Price and Actions */}
          <div className="w-48 text-right flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-600">初期費用</p>
              <p className="text-xl font-bold text-gray-900 mb-1">
                ¥{(product.pricing_formula as any)?.base_cost?.toLocaleString() || 'お問い合わせ'}
              </p>
              <p className="text-sm text-gray-600">単価 ¥{(product.pricing_formula as any)?.per_unit_cost || '---'}/個</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="w-full">
                詳細を見る
              </Button>
              <Link href="/quote-simulator/">
                <Button variant="primary" size="sm" className="w-full">
                  見積もり
                </Button>
              </Link>
                          </div>
          </div>
        </div>
      </Card>
    </MotionWrapper>
  )
}