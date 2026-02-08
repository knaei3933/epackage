'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Maximize2,
  Image as ImageIcon,
  Zap,
  TrendingUp,
  CheckCircle,
  Info,
  ChevronRight,
  Loader2,
  Package,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { BeforeAfterPreview } from './BeforeAfterPreview'

interface ProcessingPreviewTriggerProps {
  option: {
    id: string
    name: string
    nameJa: string
    description: string
    descriptionJa: string
    afterImage: string
    beforeImage?: string
    priceMultiplier: number
    features: string[]
    featuresJa: string[]
    compatibleWith: string[]
  }
  isSelected?: boolean
  onToggle?: (optionId: string) => void
  onPreview?: (optionId: string) => void
  language?: 'en' | 'ja'
  variant?: 'compact' | 'detailed' | 'minimal'
  showPriceImpact?: boolean
  interactive?: boolean
}

interface QuickPreviewProps {
  option: ProcessingPreviewTriggerProps['option']
  language: 'en' | 'ja'
  onOpenFullPreview: () => void
}

function QuickPreview({ option, language, onOpenFullPreview }: QuickPreviewProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [hoverState, setHoverState] = useState(false)

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setHoverState(true)}
      onMouseLeave={() => setHoverState(false)}
      onClick={onOpenFullPreview}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-100 border-2 border-transparent group-hover:border-brixa-300 transition-all duration-300">
        {/* Loading State */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Main Image */}
        <img
          src={option.afterImage}
          alt={language === 'ja' ? option.nameJa : option.name}
          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            setImageLoading(false)
            e.currentTarget.src = '/images/products/stand-pouch.jpg'
          }}
          style={{ opacity: imageLoading ? 0 : 1 }}
        />

        {/* Overlay Actions */}
        <AnimatePresence>
          {hoverState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-3"
            >
              <div className="text-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {language === 'ja' ? option.nameJa : option.name}
                  </h4>
                  <Maximize2 className="w-4 h-4" />
                </div>
                <p className="text-xs opacity-90 line-clamp-2">
                  {language === 'ja' ? option.descriptionJa : option.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                    x{option.priceMultiplier.toFixed(2)}
                  </Badge>
                  <span className="text-xs">
                    {language === 'ja' ? 'クリックして詳細' : 'Click for details'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Preview Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0 flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{language === 'ja' ? 'プレビュー' : 'Preview'}</span>
          </Badge>
        </div>
      </div>
    </div>
  )
}

export function ProcessingPreviewTrigger({
  option,
  isSelected = false,
  onToggle,
  onPreview,
  language = 'ja',
  variant = 'detailed',
  showPriceImpact = true,
  interactive = true
}: ProcessingPreviewTriggerProps) {
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Handle preview action
  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(option.id)
    }
    setShowFullPreview(true)
  }, [option.id, onPreview])

  // Handle toggle selection
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggle) {
      onToggle(option.id)
    }
  }, [option.id, onToggle])

  // Image loading handlers
  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
  }, [])

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoading(false)
    e.currentTarget.src = '/images/products/stand-pouch.jpg'
  }, [])

  // Price impact calculation
  const priceImpact = option.priceMultiplier - 1
  const priceImpactPercentage = Math.round(priceImpact * 100)
  const hasPriceIncrease = priceImpact > 0

  // Render different variants
  if (variant === 'compact') {
    return (
      <>
        <div
          ref={triggerRef}
          className={`relative group cursor-pointer transition-all duration-300 ${
            isSelected
              ? 'ring-2 ring-brixa-500 bg-brixa-50/50'
              : 'hover:shadow-lg hover:-translate-y-1'
          }`}
          onClick={handlePreview}
        >
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <img
                src={option.afterImage}
                alt={language === 'ja' ? option.nameJa : option.name}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ opacity: imageLoading ? 0 : 1 }}
              />
              {interactive && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {language === 'ja' ? option.nameJa : option.name}
                </h3>
                {onToggle && (
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={handleToggle}
                    className="flex-shrink-0 ml-2"
                  >
                    {isSelected ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate mt-1">
                {language === 'ja' ? option.descriptionJa : option.description}
              </p>
              {showPriceImpact && (
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={isSelected ? "metallic" : "outline"} className="text-xs">
                    x{option.priceMultiplier.toFixed(2)}
                  </Badge>
                  {hasPriceIncrease && (
                    <span className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{priceImpactPercentage}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Preview Modal */}
        <AnimatePresence>
          {showFullPreview && (
            <BeforeAfterPreview
              beforeImage={option.beforeImage}
              afterImage={option.afterImage}
              beforeLabel="Before"
              afterLabel="After"
              beforeLabelJa="加工前"
              afterLabelJa="加工後"
              title={option.name}
              titleJa={option.nameJa}
              description={option.description}
              descriptionJa={option.descriptionJa}
              onClose={() => setShowFullPreview(false)}
              language={language}
              showComparisonSlider={true}
              autoPlay={false}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  if (variant === 'minimal') {
    return (
      <>
        <div
          ref={triggerRef}
          className={`relative group cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'bg-brixa-100 border-brixa-300'
              : 'hover:bg-gray-50'
          } p-2 rounded-lg border border-gray-200`}
          onClick={handlePreview}
        >
          <div className="flex items-center space-x-2">
            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              <img
                src={option.afterImage}
                alt={language === 'ja' ? option.nameJa : option.name}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ opacity: imageLoading ? 0 : 1 }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {language === 'ja' ? option.nameJa : option.name}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  x{option.priceMultiplier.toFixed(2)}
                </Badge>
                {interactive && (
                  <Eye className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="flex-shrink-0"
              >
                {isSelected ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Full Preview Modal */}
        <AnimatePresence>
          {showFullPreview && (
            <BeforeAfterPreview
              beforeImage={option.beforeImage}
              afterImage={option.afterImage}
              beforeLabel="Before"
              afterLabel="After"
              beforeLabelJa="加工前"
              afterLabelJa="加工後"
              title={option.name}
              titleJa={option.nameJa}
              description={option.description}
              descriptionJa={option.descriptionJa}
              onClose={() => setShowFullPreview(false)}
              language={language}
              showComparisonSlider={true}
              autoPlay={false}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // Detailed variant (default)
  return (
    <>
      <div
        ref={triggerRef}
        className={`relative group cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'ring-2 ring-brixa-500 shadow-lg transform scale-[1.02]'
            : 'hover:shadow-xl hover:-translate-y-2'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={interactive ? handlePreview : undefined}
      >
        <Card className="overflow-hidden border-2 border-gray-200 transition-all duration-300">
          <CardContent className="p-0">
            {/* Image Section */}
            <div className="relative h-40 bg-gray-100 overflow-hidden">
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              )}
              <img
                src={option.afterImage}
                alt={language === 'ja' ? option.nameJa : option.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ opacity: imageLoading ? 0 : 1 }}
              />

              {/* Overlay Effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Interactive Preview Badge */}
              {interactive && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900 border-white flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {language === 'ja' ? 'プレビュー' : 'Preview'}
                    </span>
                  </Badge>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 left-3">
                  <Badge variant="metallic" className="bg-brixa-600 text-white border-0 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {language === 'ja' ? '選択済み' : 'Selected'}
                    </span>
                  </Badge>
                </div>
              )}

              {/* Price Impact Badge */}
              {showPriceImpact && hasPriceIncrease && (
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-semibold">+{priceImpactPercentage}%</span>
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-brixa-700 transition-colors">
                    {language === 'ja' ? option.nameJa : option.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {language === 'ja' ? option.descriptionJa : option.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {(language === 'ja' ? option.featuresJa : option.features).slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {(language === 'ja' ? option.featuresJa : option.features).length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{(language === 'ja' ? option.featuresJa : option.features).length - 2} {language === 'ja' ? '他' : 'more'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={isSelected ? "metallic" : "outline"} className="text-sm">
                    x{option.priceMultiplier.toFixed(2)}
                  </Badge>
                  {hasPriceIncrease && (
                    <span className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{priceImpactPercentage}%
                    </span>
                  )}
                </div>

                {onToggle && (
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={handleToggle}
                    className="flex items-center space-x-1"
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">{language === 'ja' ? '選択済み' : 'Selected'}</span>
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-xs">{language === 'ja' ? '選択' : 'Select'}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hover Quick Preview */}
        {isHovered && interactive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-20 w-80 p-3 bg-white rounded-lg shadow-2xl border border-gray-200 -bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <QuickPreview
              option={option}
              language={language}
              onOpenFullPreview={handlePreview}
            />
          </motion.div>
        )}
      </div>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {showFullPreview && (
          <BeforeAfterPreview
            beforeImage={option.beforeImage}
            afterImage={option.afterImage}
            beforeLabel="Before Processing"
            afterLabel="After Processing"
            beforeLabelJa="加工前"
            afterLabelJa="加工後"
            title={option.name}
            titleJa={option.nameJa}
            description={option.description}
            descriptionJa={option.descriptionJa}
            onClose={() => setShowFullPreview(false)}
            language={language}
            showComparisonSlider={true}
            autoPlay={false}
          />
        )}
      </AnimatePresence>
    </>
  )
}