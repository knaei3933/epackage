'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'
import { useCatalog } from '@/contexts/CatalogContext'
import { Button } from '@/components/ui/Button'
import { Badge, TagBadge, CurrencyBadge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Grid, GridItem } from '@/components/ui/Grid'
import { Flex, FlexItem } from '@/components/ui/Flex'
import { Container } from '@/components/ui/Container'
import type { PackageProduct, PackageFeatures } from '@/types/catalog'
import { X, ChevronLeft, ChevronRight, Mail, Phone, MessageCircle } from 'lucide-react'

export function ProductDetailModal() {
  const {
    modalOpen,
    selectedProduct,
    currentImageIndex,
    closeModal,
    setCurrentImageIndex
  } = useCatalog()

  const [contactFormOpen, setContactFormOpen] = useState(false)

  const handlePreviousImage = useCallback(() => {
    if (selectedProduct && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    } else if (selectedProduct && currentImageIndex === 0) {
      setCurrentImageIndex(selectedProduct.images.length - 1)
    }
  }, [selectedProduct, currentImageIndex, setCurrentImageIndex])

  const handleNextImage = useCallback(() => {
    if (selectedProduct && currentImageIndex < selectedProduct.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else if (selectedProduct && currentImageIndex === selectedProduct.images.length - 1) {
      setCurrentImageIndex(0)
    }
  }, [selectedProduct, currentImageIndex, setCurrentImageIndex])

  const handleContactInquiry = useCallback(() => {
    setContactFormOpen(true)
  }, [])

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentImageIndex(index)
  }, [setCurrentImageIndex])

  const getName = () => {
    if (!selectedProduct) return ''
    return selectedProduct.name
  }

  const getDescription = () => {
    if (!selectedProduct) return ''
    return selectedProduct.description
  }

  const getPriceDisplay = () => {
    if (!selectedProduct) return ''
    if (selectedProduct.type === 'custom' && selectedProduct.pricing.basePrice === 0) {
      return 'お問い合わせ'
    }
    return `${selectedProduct.pricing.basePrice.toLocaleString()} ${selectedProduct.pricing.currency} / ${selectedProduct.pricing.unit}`
  }

  const getPackageTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      standard: 'スタンダード',
      premium: 'プレミアム',
      eco: 'エコ',
      luxury: 'ラグジュアリー',
      industrial: '工業用',
      custom: 'カスタム'
    }
    return typeMap[type] || type
  }

  const renderFeature = (key: keyof PackageFeatures, label: string) => {
    if (!selectedProduct) return null
    const enabled = selectedProduct.features[key]
    return (
      <TagBadge variant={enabled ? 'success' : 'outline'} size="sm">
        {label}: {enabled ? '✓' : '✗'}
      </TagBadge>
    )
  }

  if (!modalOpen || !selectedProduct) return null

  const currentImage = selectedProduct.images[currentImageIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{getName()}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeModal}
            className="p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <Container className="p-4">
            <Grid cols={2} gap={8} className="lg:grid-cols-2">
              {/* Image Gallery */}
              <GridItem>
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden">
                    {currentImage && (
                      <Image
                        src={currentImage.url}
                        alt={currentImage.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}

                    {/* Navigation */}
                    {selectedProduct.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handlePreviousImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    {selectedProduct.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {selectedProduct.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedProduct.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => handleThumbnailClick(index)}
                          className={`flex-shrink-0 relative aspect-[4/3] w-20 rounded overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex
                              ? 'border-navy-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </GridItem>

              {/* Product Details */}
              <GridItem>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{getName()}</h3>
                    <p className="text-gray-600 leading-relaxed">{getDescription()}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedProduct.tags.map((tag, index) => (
                        <TagBadge key={index} size="sm">{tag}</TagBadge>
                      ))}
                    </div>
                  </div>

                  {/* Price and Type */}
                  <Card>
                    <CardContent className="p-4">
                      <Flex className="items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {getPriceDisplay()}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div>最小注文数: {selectedProduct.minOrder.quantity} {selectedProduct.minOrder.unit}</div>
                            <div>納期: {selectedProduct.leadTime.min}-{selectedProduct.leadTime.max} {selectedProduct.leadTime.unit}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" size="lg">
                            {getPackageTypeName(selectedProduct.type)}
                          </Badge>
                        </div>
                      </Flex>
                    </CardContent>
                  </Card>

                  {/* Specifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>仕様</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong>寸法:</strong>
                        <div className="text-sm text-gray-600">
                          {selectedProduct.specs.dimensions.length} × {selectedProduct.specs.dimensions.width} × {selectedProduct.specs.dimensions.height} {selectedProduct.specs.dimensions.unit}
                        </div>
                      </div>
                      <div>
                        <strong>重量:</strong>
                        <div className="text-sm text-gray-600">
                          {selectedProduct.specs.weight.min} - {selectedProduct.specs.weight.max} {selectedProduct.specs.weight.unit}
                        </div>
                      </div>
                      {selectedProduct.specs.capacity.volume > 0 && (
                        <div>
                          <strong>容量:</strong>
                          <div className="text-sm text-gray-600">
                            {selectedProduct.specs.capacity.volume} {selectedProduct.specs.capacity.unit}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Materials */}
                  <Card>
                    <CardHeader>
                      <CardTitle>素材</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.category.material.map((material, index) => (
                          <TagBadge key={index} variant="outline">{material}</TagBadge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle>機能</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {renderFeature('waterproof', '防水')}
                        {renderFeature('tamperProof', '改ざん防止')}
                        {renderFeature('recyclable', 'リサイクル可能')}
                        {renderFeature('customDesign', 'カスタムデザイン')}
                        {renderFeature('barcodeCompatible', 'バーコード対応')}
                        {renderFeature('uvProtection', 'UV保護')}
                        {renderFeature('temperatureControl', '温度管理')}
                        {renderFeature('childSafe', 'チャイルドセーフ')}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Applications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>用途</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedProduct.applications.map((app, index) => (
                        <div key={index}>
                          <h4 className="font-medium text-gray-900">{app.industry}</h4>
                          <p className="text-sm text-gray-600">{app.useCase}</p>
                          <div className="text-sm text-gray-500">
                            例: {app.productExamples.join(', ')}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Contact Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={handleContactInquiry}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      お問い合わせ
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/contact?product=${selectedProduct.id}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      詳細相談
                    </Button>
                  </div>
                </div>
              </GridItem>
            </Grid>
          </Container>
        </div>
      </div>
    </div>
  )
}
