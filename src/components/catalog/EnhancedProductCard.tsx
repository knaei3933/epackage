'use client'

import { CLIENT_COUNT_LABEL } from '@/lib/site-facts'
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
import { Button, buttonVariants } from '@/components/ui/Button'
import Image from 'next/image'
import { CompareToggle } from '@/components/comparison'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { Product } from '@/types/database'
import { DownloadButton } from "./DownloadButton"
import { PRODUCT_CATEGORIES } from '@/lib/product-data'
import Link from 'next/link'
import { minOrderLabel } from '@/lib/site-facts'

interface EnhancedProductCardProps {
  product: Product
  index: number
  /** 省略可。詳細は製品ページ（/catalog/<id>）へのリンクで開く */
  onSelect?: (product: Product) => void
  className?: string
}

export function EnhancedProductCard({
  product,
  index,
  className
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const category = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  // Enhanced features with better organization
  const enhancedFeatures = [
    {
      icon: Clock,
      text: `${product.lead_time_days}日`,
      label: '納期',
    },
    {
      icon: Package,
      text: minOrderLabel(product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム'),
      label: '最小注文数',
    }
  ]

  // Trust indicators
  const trustIndicators = [
    { icon: Check, text: '品質保証' },
    { icon: BarChart3, text: `実績${CLIENT_COUNT_LABEL}` },
    { icon: Star, text: '高品質' }
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
        "group relative overflow-hidden rounded-container border border-border-medium bg-bg-primary transition-colors hover:border-border-dark hover:shadow-low",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
  
      {/* Enhanced Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
        {/* Main Product Image */}
        <div className="relative w-full h-full flex items-center justify-center p-0">
          {product.image && !imageFailed ? (
            <Image
              src={product.image}
              alt={product.name_ja}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
              <Package className="w-16 h-16 text-text-muted" />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className="border border-border-medium bg-bg-primary px-3 py-1 text-xs font-medium"
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
                  className="w-10 h-10 border border-border-strong bg-bg-primary rounded-full flex items-center justify-center hover:bg-bg-secondary transition-colors"
                >
                  <Info className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFavorited(!isFavorited)
                  }}
                  className="w-10 h-10 border border-border-strong bg-bg-primary rounded-full flex items-center justify-center hover:bg-bg-secondary transition-colors"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isFavorited ? "text-error fill-current" : "text-text-secondary"
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
                "w-6 h-6 border border-border-medium bg-bg-primary rounded-full flex items-center justify-center text-brand"
              )}
            >
              <indicator.icon className="w-3 h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-6 space-y-4 text-center">
        {/* Product Title and Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-2">
            {product.name_ja}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {product.description_ja}
          </p>
        </div>

        {/* Enhanced Features */}
        <div className="grid grid-cols-2 gap-2">
          {enhancedFeatures.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className={cn(
                  "flex flex-col items-center p-2 rounded-inner border border-border-medium bg-bg-secondary"
                )}
              >
                <Icon className="w-4 h-4 mb-1 text-brand" aria-hidden="true" />
                <span className={cn("text-xs font-medium text-text-primary")}>
                  {feature.text}
                </span>
                <span className={cn("text-xs text-text-muted")}>
                  {feature.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Materials */}
        <div className="flex flex-wrap gap-1 justify-center">
          {product.materials.slice(0, 3).map((material, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="text-xs border-border-strong text-text-secondary"
            >
              {material}
            </Badge>
          ))}
          {product.materials.length > 3 && (
            <Badge variant="outline" className="text-xs border-border-strong text-text-muted">
              +{product.materials.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 border-t border-border-medium pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/catalog/${product.id}`}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              詳細
            </Link>
            <CompareToggle product={product} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/samples" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <Package className="h-4 w-4 shrink-0" aria-hidden="true" />
              サンプル
            </Link>
            <Link href="/quote-simulator" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
              <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              見積もり
            </Link>
          </div>
          <DownloadButton
            productCategory={product.category}
            size="sm"
            showText={true}
            className="w-full"
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
              className="bg-bg-primary rounded-container max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-text-primary">{product.name_ja}</h3>
                <button
                  onClick={() => setShowQuickView(false)}
                  aria-label="閉じる" className="h-9 w-9 max-sm:h-11 max-sm:w-11 bg-bg-muted hover:bg-brand-subtle rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-text-secondary">{product.description_ja}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-text-muted">最小注文数:</span>
                    <p className="font-medium">{minOrderLabel(product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム')}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">納期:</span>
                    <p className="font-medium">{product.lead_time_days}日</p>
                  </div>
                </div>
                <div>
                  <span className="text-text-muted">素材:</span>
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