'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Clock,
  Truck,
  Zap,
  Star,
  Heart,
  ArrowRight,
  ExternalLink,
  Check,
  Info,
  X,
  Search,
  Filter,
  BarChart3,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { Product } from '@/types/database'
import { DownloadButton } from "./DownloadButton"
import Link from 'next/link'

interface EnhancedProductCardProps {
  product: Product
  index: number
  onSelect: (product: Product) => void
  className?: string
}

export function EnhancedProductCard({
  product,
  index,
  onSelect,
  className
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)

  const category = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  // Enhanced features with better organization
  const enhancedFeatures = [
    {
      icon: Clock,
      text: `${product.lead_time_days}日`,
      label: '納期',
      color: 'blue'
    },
    {
      icon: Package,
      text: `${product.min_order_quantity.toLocaleString()}個`,
      label: '最低注文',
      color: 'green'
    },
    {
      icon: Zap,
      text: '優れた密封性',
      label: '特徴',
      color: 'purple'
    }
  ]

  // Trust indicators
  const trustIndicators = [
    { icon: Award, text: 'ISO9001認証', color: 'emerald' },
    { icon: Check, text: '品质保証', color: 'blue' },
    { icon: BarChart3, text: '実績500社', color: 'orange' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className={cn(
        "group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
  
      {/* Enhanced Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Main Product Image */}
        <div className="relative w-full h-full">
          {product.image ? (
            <>
              <img
                src={product.image}
                alt={product.name_ja}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              {/* Fallback placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Hover Overlay with Quick Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className="bg-white/95 backdrop-blur-sm border border-gray-200 px-3 py-1 text-xs font-medium"
            >
              {category?.name_ja || 'その他'}
            </Badge>
          </div>

          {/* Quick Actions on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowQuickView(true)
                  }}
                  className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <Info className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFavorited(!isFavorited)
                  }}
                  className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isFavorited ? "text-red-500 fill-current" : "text-gray-700"
                    )}
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust Indicators */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {trustIndicators.slice(0, 2).map((indicator, idx) => (
            <div
              key={idx}
              className={cn(
                "w-6 h-6 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md",
                indicator.color === 'emerald' && "text-emerald-600",
                indicator.color === 'blue' && "text-blue-600",
                indicator.color === 'orange' && "text-orange-600"
              )}
            >
              <indicator.icon className="w-3 h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-6 space-y-4">
        {/* Product Title and Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brixa-700 transition-colors line-clamp-2">
            {product.name_ja}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description_ja}
          </p>
        </div>

        {/* Enhanced Features */}
        <div className="grid grid-cols-4 gap-2">
          {enhancedFeatures.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg border",
                  feature.color === 'blue' && "border-blue-100 bg-blue-50",
                  feature.color === 'green' && "border-green-100 bg-green-50",
                  feature.color === 'purple' && "border-purple-100 bg-purple-50"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 mb-1",
                  feature.color === 'blue' && "text-blue-600",
                  feature.color === 'green' && "text-green-600",
                  feature.color === 'purple' && "text-purple-600"
                )} />
                <span className={cn("text-xs font-medium text-gray-900")}>
                  {feature.text}
                </span>
                <span className={cn("text-xs text-gray-500")}>
                  {feature.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Materials */}
        <div className="flex flex-wrap gap-1">
          {product.materials.slice(0, 3).map((material, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="text-xs border-gray-300 text-gray-600"
            >
              {material}
            </Badge>
          ))}
          {product.materials.length > 3 && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
              +{product.materials.length - 3}
            </Badge>
          )}
        </div>

        {/* Pricing Section */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">初期費用</p>
              <p className="text-xl font-bold text-gray-900">
                ¥{(product.pricing_formula as any)?.base_cost?.toLocaleString() || 'お問い合わせ'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">単価</p>
              <p className="text-lg font-semibold text-brixa-700">
                ¥{(product.pricing_formula as any)?.per_unit_cost || '---'}
                <span className="text-xs text-gray-500">/個</span>
              </p>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={cn(
                      "w-4 h-4",
                      idx < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8)</span>
            </div>
            <span className="text-xs text-gray-500">23件の評価</span>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:border-brixa-600 hover:text-brixa-700 flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(product)
            }}
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
            <span className="text-[10px] sm:text-xs">詳細</span>
          </Button>
          <Link href="/samples" className="col-span-1">
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-brixa-600 text-white hover:bg-brixa-700 border-brixa-600 flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2"
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
              <span className="text-[10px] sm:text-xs">サンプル</span>
            </Button>
          </Link>
          <Link href="/quote-simulator/" className="col-span-1">
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-brixa-600 hover:bg-brixa-700 flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
              <span className="text-[10px] sm:text-xs">見積</span>
            </Button>
          </Link>
          <DownloadButton
            productCategory={product.category}
            size="sm"
            showText={true}
          />
        </div>

              </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{product.name_ja}</h3>
                <button
                  onClick={() => setShowQuickView(false)}
                  className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-gray-600">{product.description_ja}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500">最低注文:</span>
                    <p className="font-medium">{product.min_order_quantity.toLocaleString()}個</p>
                  </div>
                  <div>
                    <span className="text-gray-500">納期:</span>
                    <p className="font-medium">{product.lead_time_days}日</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">素材:</span>
                  <p className="font-medium">{product.materials.join(', ')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Import constant from the main catalog file
const PRODUCT_CATEGORIES = {
  flat_3_side: { name_ja: '三方シール袋', name_en: 'Three-Side Seal Pouch' },
  stand_up: { name_ja: 'スタンドパウチ', name_en: 'Stand Pouch' },
  box: { name_ja: 'ボックス型パウチ', name_en: 'Box Pouch' },
  spout_pouch: { name_ja: 'スパウトパウチ', name_en: 'Spout Pouch' },
  roll_film: { name_ja: 'ロールフィルム', name_en: 'Roll Film' },
  gusset: { name_ja: 'ガセット袋', name_en: 'Gusset Bag' },
  soft_pouch: { name_ja: 'ソフトパウチ', name_en: 'Soft Pouch' },
  flat_with_zip: { name_ja: 'チャック付き平袋', name_en: 'Flat Bag with Zip' },
  special: { name_ja: '特殊仕様パウチ', name_en: 'Special Specification Pouch' }
} as const