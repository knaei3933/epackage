'use client'

import Image from 'next/image'
import { useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
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
  const { language, t, tn } = useLanguage()
  const { openModal } = useCatalog()

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
    // TODO: Open sample request modal
    console.log('Sample request for:', product.id)
  }, [product])

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
    switch (language) {
      case 'en': return product.nameEn
      case 'ja':
      default: return product.name
    }
  }

  const getDescription = () => {
    switch (language) {
      case 'en': return product.descriptionEn
      case 'ja':
      default: return product.description
    }
  }

  const getPriceDisplay = () => {
    if (product.type === 'custom' && product.pricing.basePrice === 0) {
      return tn('catalog', 'actions.contactUs')
    }
    return `${product.pricing.basePrice.toLocaleString()} ${product.pricing.currency}`
  }

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge variant="success" size="sm">
              {language === 'en' ? 'NEW' : '新商品'}
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="warning" size="sm">
              {language === 'en' ? 'FEATURED' : '注目'}
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleQuickView}
            className="bg-white/95 hover:bg-white text-brixa-700 border border-brixa-600 shadow-lg min-w-[80px] font-medium"
          >
            {language === 'en' ? 'Quick View' : '詳細'}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Name */}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {getName()}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
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
              <span className="text-xs text-gray-500">
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
            <div className="text-xl font-bold text-gray-900">
              {getPriceDisplay()}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {product.type !== 'custom' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSampleRequest}
                  className="border-brixa-400 text-brixa-700 hover:bg-brixa-50 hover:border-brixa-500 font-medium min-w-[80px]"
                >
                  {tn('catalog', 'actions.requestSample')}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleTemplateDownload}
                className="font-medium min-w-[80px]"
              >
                <span className="text-xs">
                  {language === 'en' ? 'Template' : 'テンプレート'}
                </span>
              </Button>
            </div>
          </div>

            {/* Additional Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{tn('catalog', 'details.minOrder')}: {product.minOrder.quantity} {product.minOrder.unit}</span>
              <span>{tn('catalog', 'details.leadTime')}: {product.leadTime.min}-{product.leadTime.max} {product.leadTime.unit}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}