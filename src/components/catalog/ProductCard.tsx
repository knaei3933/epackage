'use client'

import Image from 'next/image'
import { useCallback } from 'react'
import { useCatalog } from '@/contexts/CatalogContext'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge, TagBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { PackageProduct } from '@/types/catalog'
import { safeMap } from '@/lib/array-helpers'

interface ProductCardProps {
  product: PackageProduct
  onClick?: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { openModal, openSampleRequestModal } = useCatalog()

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick()
    } else {
      openModal(product)
    }
  }, [onClick, openModal, product])

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    openModal(product, 0)
  }, [openModal, product])

  const handleSampleRequest = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    openSampleRequestModal(product)
  }, [product, openSampleRequestModal])

  const handleTemplateDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    // Download design template for this product
    const templateFileName = `template-${product.id}.ai`
    const templatePath = `/templates/${templateFileName}`

    // Create a temporary link element for download
    const link = document.createElement('a')
    link.href = templatePath
    link.download = templateFileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [product])

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]

  const getName = () => {
    return product.name
  }

  const getDescription = () => {
    return product.description
  }

  const getPriceDisplay = () => {
    if (product.type === 'custom' && product.pricing.basePrice === 0) {
      return 'お問い合わせ'
    }
    return `${product.pricing.basePrice.toLocaleString()} ${product.pricing.currency}`
  }

  return (
    <Card
      className="group cursor-pointer hover:shadow-low transition-colors overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge variant="success" size="sm">
              新商品
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="warning" size="sm">
              注目
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleQuickView}
            className="bg-bg-primary hover:bg-bg-secondary text-brand border border-brand min-w-[80px] font-medium"
          >
            詳細
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Name */}
          <h3 className="font-semibold text-lg text-text-primary line-clamp-1">
            {getName()}
          </h3>

          {/* Description */}
          <p className="text-sm text-text-secondary line-clamp-2">
            {getDescription()}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {safeMap((product.tags || []).slice(0, 3), (tag, index) => (
              <TagBadge key={index} size="sm">
                {tag}
              </TagBadge>
            ))}
            {product.tags && product.tags.length > 3 && (
              <span className="text-xs text-text-muted">
                +{product.tags.length - 3}
              </span>
            )}
          </div>

          {/* Key Features */}
          <div className="flex flex-wrap gap-1">
            {product.features.waterproof && (
              <TagBadge variant="outline" size="sm">防水</TagBadge>
            )}
            {product.features.recyclable && (
              <TagBadge variant="outline" size="sm">リサイクル</TagBadge>
            )}
            {product.features.childSafe && (
              <TagBadge variant="outline" size="sm">チャイルドセーフ</TagBadge>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer with Price and Actions */}
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex flex-col gap-3 w-full">
          {/* Price and Action Row */}
          <div className="flex items-center justify-between w-full">
            {/* Price */}
            <div className="text-xl font-bold text-text-primary">
              {getPriceDisplay()}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {product.type !== 'custom' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSampleRequest}
                  className="border-brand-soft text-brand hover:bg-brand-muted hover:border-brand font-medium min-w-[80px]"
                >
                  サンプル依頼
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleTemplateDownload}
                className="font-medium min-w-[80px]"
              >
                <span className="text-xs">
                  テンプレート
                </span>
              </Button>
            </div>
          </div>

            {/* Additional Info */}
          <div className="mt-3 pt-3 border-t border-border-medium">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>最小注文数: {product.minOrder.quantity} {product.minOrder.unit}</span>
              <span>納期: {product.leadTime.min}-{product.leadTime.max} {product.leadTime.unit}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
