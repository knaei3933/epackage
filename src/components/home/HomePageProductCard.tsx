'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import type { Product } from '@/types/database'

interface HomePageProductCardProps {
  product: Product
  delay: number
}

const categoryNames = {
  flat_3_side: '平袋',
  stand_up: 'スタンドパウチ',
  gusset: 'ギゼットパウチ',
  box: 'BOXパウチ',
  box_with_valve: 'バルブ付きBOXパウチ',
  flat_with_zip: 'ジッパー付き平袋',
  special: '特殊仕様パウチ',
  soft_pouch: 'ソフトパウチ',
  spout_pouch: 'スポウトパウチ',
  roll_film: 'ロールフィルム'
}

const features = [
  'れもれ密封性',
  'コスト競争力',
  '迅速な納期',
  'コストカスタマイズ',
  'ISO規格対応',
  '食品包装対応'
]

export function HomePageProductCard({ product, delay }: HomePageProductCardProps) {
  return (
    <MotionWrapper delay={delay}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="aspect-video relative bg-gradient-to-br from-brixa-100 to-brixa-secondary-100 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <div className="relative w-full h-full">
              <Image
                src={product.image}
                alt={product.name_ja}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.log('Image failed to load:', product.image);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.image-fallback');
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              {/* Fallback placeholder - initially hidden */}
              <div className="image-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brixa-100 to-brixa-secondary-100" style={{ display: 'none' }}>
                <Package className="w-16 h-16 text-brixa-600" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gradient-to-br from-brixa-100 to-brixa-secondary-100">
              <Package className="w-16 h-16 text-brixa-600" />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-brixa-600 bg-brixa-50 px-2 py-1 rounded-full">
              {categoryNames[product.category] || product.category}
            </span>
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs ml-1 text-gray-600">4.8</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name_ja}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description_ja}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">最小注文数</span>
              <span className="font-medium text-gray-900">
                {product.min_order_quantity.toLocaleString()}{product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム' ? 'M' : '枚'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">納期</span>
              <span className="font-medium text-gray-900">
                {product.lead_time_days}日
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {features.slice(0, 3).map((feature, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Link href="/catalog" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-sm">
                詳細をご確認
              </Button>
            </Link>
            <Link href="/samples" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-sm">
                サンプル
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </MotionWrapper>
  )
}
