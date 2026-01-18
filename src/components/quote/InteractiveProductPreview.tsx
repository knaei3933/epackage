'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCw,
  Eye,
  Layers,
  Zap,
  Info,
  Share2,
  Download,
  X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  processingOptionsConfig,
  getProcessingOptionById,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'

interface InteractiveProductPreviewProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionToggle: (optionId: string) => void
  language?: 'en' | 'ja'
  className?: string
}

export function InteractiveProductPreview({
  selectedProductType,
  selectedOptions,
  onOptionToggle,
  language = 'ja',
  className = ''
}: InteractiveProductPreviewProps) {
  const [viewAngle, setViewAngle] = useState<'front' | 'back' | 'side'>('front')
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Get processing impact
  const processingImpact = calculateProcessingImpact(selectedOptions)

  // Get product base image
  const getProductBaseImage = useCallback(() => {
    // Base product images by type
    const baseImages: Record<string, string> = {
      flat_3_side: '/images/processing-icons/三方.png',
      stand_up: '/images/processing-icons/三方スタンド.png',
      lap_seal: '/images/processing-icons/合掌.png',
      box: '/images/processing-icons/ボックス型パウチ.png',
      spout_pouch: '/images/processing-icons/スパウト.png',
      roll_film: '/images/processing-icons/ロールフィルム.png'
    }
    return baseImages[selectedProductType] || '/images/processing-icons/三方.png'
  }, [selectedProductType])

  // Get selected options details
  const selectedOptionsDetails = selectedOptions
    .map(id => getProcessingOptionById(id))
    .filter(Boolean) as ProcessingOptionConfig[]

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setViewAngle(prev => prev === 'front' ? 'side' : prev === 'side' ? 'back' : 'front')
      } else if (e.key === 'ArrowRight') {
        setViewAngle(prev => prev === 'front' ? 'back' : prev === 'back' ? 'side' : 'front')
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen])

  // Get feature position for annotation
  const getFeaturePosition = (optionId: string) => {
    // Position annotations based on feature type
    const positions: Record<string, { x: number; y: number }> = {
      'zipper-yes': { x: 50, y: 75 }, // Top center
      'glossy': { x: 50, y: 50 }, // Center
      'matte': { x: 50, y: 50 }, // Center
      'notch-yes': { x: 85, y: 50 }, // Right side
      'hang-hole-yes': { x: 50, y: 25 }, // Top center
      'corner-round': { x: 90, y: 90 }, // Bottom right corner
      'valve-yes': { x: 20, y: 50 }, // Left side
      'top-open': { x: 50, y: 10 }, // Very top
      'bottom-open': { x: 50, y: 90 } // Bottom
    }

    return positions[optionId] || { x: 50, y: 50 }
  }

  // Handle feature selection
  const handleFeatureClick = useCallback((optionId: string) => {
    setSelectedFeature(selectedFeature === optionId ? null : optionId)
  }, [selectedFeature])

  // Render product with annotations
  const renderProduct = () => (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
      {/* Base Product Image */}
      <div className="relative">
        <img
          src={getProductBaseImage()}
          alt="Product Base"
          className="max-w-full max-h-full object-contain"
        />

        {/* Feature Annotations */}
        {selectedOptionsDetails.map((option) => {
          const position = getFeaturePosition(option.id)
          const isSelected = selectedFeature === option.id

          return (
            <motion.div
              key={option.id}
              className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 bg-green-500 rounded-full opacity-30"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />

                {/* Feature dot */}
                <button
                  onClick={() => handleFeatureClick(option.id)}
                  className={`w-full h-full bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Zap className="w-4 h-4 text-white" />
                </button>

                {/* Feature tooltip */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 z-10"
                    >
                      <Card className="shadow-xl border-gray-200">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {language === 'ja' ? option.nameJa : option.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {language === 'ja' ? option.descriptionJa : option.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                x{option.priceMultiplier.toFixed(2)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOptionToggle(option.id)}
                                className="text-red-500 hover:text-red-600 p-1 h-6"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {/* Arrow */}
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-white -mt-1 absolute left-1/2 transform -translate-x-1/2"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* View angle indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-2 rounded-full">
        <Eye className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {language === 'ja' ? '角度' : 'View'}: {viewAngle}
        </span>
      </div>
    </div>
  )

  // Render fullscreen preview
  const renderFullscreenPreview = () => (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full max-w-6xl h-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {language === 'ja' ? '製品プレビュー' : 'Product Preview'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Main Preview */}
            <div className="w-full h-full flex items-center justify-center">
              {renderProduct()}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewAngle('front')}
                    className={`text-white border-white hover:bg-white/20 ${
                      viewAngle === 'front' ? 'bg-white/20' : ''
                    }`}
                  >
                    {language === 'ja' ? '正面' : 'Front'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewAngle('back')}
                    className={`text-white border-white hover:bg-white/20 ${
                      viewAngle === 'back' ? 'bg-white/20' : ''
                    }`}
                  >
                    {language === 'ja' ? '背面' : 'Back'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewAngle('side')}
                    className={`text-white border-white hover:bg-white/20 ${
                      viewAngle === 'side' ? 'bg-white/20' : ''
                    }`}
                  >
                    {language === 'ja' ? '側面' : 'Side'}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLayers(!showLayers)}
                    className={`text-white border-white hover:bg-white/20 ${
                      showLayers ? 'bg-white/20' : ''
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="text-white border-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.share?.({
                        title: language === 'ja' ? '製品設定' : 'Product Configuration',
                        text: `Price: x${processingImpact.multiplier.toFixed(2)}`,
                        url: window.location.href
                      })
                    }}
                    className="text-white border-white hover:bg-white/20"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ja' ? 'インタラクティブプレビュー' : 'Interactive Preview'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ja'
                    ? '各機能をクリックして詳細を確認'
                    : 'Click on features to see details'}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                {language === 'ja' ? '拡大' : 'Fullscreen'}
              </Button>
            </div>

            {/* Product Preview */}
            <div ref={previewRef} className="aspect-video w-full">
              {renderProduct()}
            </div>

            {/* Info Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <Info className="w-4 h-4" />
                  {language === 'ja' ? '機能数' : 'Features'}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedOptions.length}
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <Zap className="w-4 h-4" />
                  {language === 'ja' ? '価格乗数' : 'Price'}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  x{processingImpact.multiplier.toFixed(2)}
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <RotateCw className="w-4 h-4" />
                  {language === 'ja' ? '生産時間' : 'Lead Time'}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {processingImpact.processingTimeJa}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {selectedOptionsDetails.map((option) => (
                <Badge
                  key={option.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleFeatureClick(option.id)}
                >
                  {language === 'ja' ? option.nameJa : option.name}
                </Badge>
              ))}
            </div>

            {/* Help Text */}
            {selectedOptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {language === 'ja'
                    ? 'オプションを選択するとプレビューが表示されます'
                    : 'Select options to see the interactive preview'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Preview */}
      {renderFullscreenPreview()}
    </>
  )
}