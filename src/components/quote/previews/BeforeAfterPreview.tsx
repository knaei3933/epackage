'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Eye,
  Layers,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

interface BeforeAfterPreviewProps {
  beforeImage?: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  beforeLabelJa?: string
  afterLabelJa?: string
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  onClose: () => void
  language?: 'en' | 'ja'
  showComparisonSlider?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

interface ProcessingStep {
  id: string
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  duration: number
  image?: string
}

export function BeforeAfterPreview({
  beforeImage,
  afterImage,
  beforeLabel = 'Before Processing',
  afterLabel = 'After Processing',
  beforeLabelJa = '加工前',
  afterLabelJa = '加工後',
  title,
  titleJa,
  description,
  descriptionJa,
  onClose,
  language = 'ja',
  showComparisonSlider = true,
  autoPlay = false,
  autoPlayInterval = 3000
}: BeforeAfterPreviewProps) {
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'animated'>('slider')
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [imageLoading, setImageLoading] = useState({ before: true, after: true })
  const [showLabels, setShowLabels] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate processing steps for animation
  const processingSteps: ProcessingStep[] = [
    {
      id: 'original',
      title: 'Original',
      titleJa: '元の状態',
      description: 'Base packaging material',
      descriptionJa: 'ベース包装材',
      duration: 1000,
      image: beforeImage
    },
    {
      id: 'processing',
      title: 'Processing',
      titleJa: '加工中',
      description: 'Applying post-processing treatment',
      descriptionJa: '後加工処理の適用',
      duration: 1500
    },
    {
      id: 'completed',
      title: 'Completed',
      titleJa: '完成',
      description: 'Post-processing treatment applied',
      descriptionJa: '後加工処理適用完了',
      duration: 1000,
      image: afterImage
    }
  ]

  // Handle slider drag
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleSliderMove(e.clientX)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleSliderMove(moveEvent.clientX)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handleSliderMove])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleSliderMove(touch.clientX)

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0]
      handleSliderMove(touch.clientX)
    }

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }, [handleSliderMove])

  // Animation controls
  useEffect(() => {
    if (isPlaying && viewMode === 'animated') {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % processingSteps.length)
      }, autoPlayInterval)
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [isPlaying, viewMode, autoPlayInterval, processingSteps.length])

  // Image load handlers
  const handleImageLoad = (type: 'before' | 'after') => {
    setImageLoading(prev => ({ ...prev, [type]: false }))
  }

  const handleImageError = (type: 'before' | 'after') => {
    setImageLoading(prev => ({ ...prev, [type]: false }))
  }

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleReset = () => {
    setSliderPosition(50)
    setZoomLevel(1)
    setCurrentFrame(0)
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-sm">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-brixa-50 to-navy-50 flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ja' ? titleJa : title}
              </h2>
              <p className="text-gray-600 mt-1 max-w-2xl">
                {language === 'ja' ? descriptionJa : description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="metallic" className="text-sm">
                {language === 'ja' ? '高品質プレビュー' : 'HD Preview'}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowLabels(!showLabels)}
                className="relative"
                title={language === 'ja' ? 'ラベル表示切り替え' : 'Toggle labels'}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                aria-label={language === 'ja' ? '閉じる' : 'Close'}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'slider' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('slider')}
                className="flex items-center space-x-2"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ja' ? 'スライダー' : 'Slider'}</span>
              </Button>
              <Button
                variant={viewMode === 'side-by-side' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('side-by-side')}
                className="flex items-center space-x-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ja' ? '並べて比較' : 'Side by Side'}</span>
              </Button>
              <Button
                variant={viewMode === 'animated' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('animated')}
                className="flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ja' ? 'アニメーション' : 'Animated'}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {language === 'ja' ? 'ズーム' : 'Zoom'}: {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden bg-gray-100">
            <div
              ref={containerRef}
              className="relative w-full h-full flex items-center justify-center"
              style={{ cursor: viewMode === 'slider' ? 'ew-resize' : 'default' }}
            >
              {viewMode === 'slider' && (
                <div className="relative w-full h-full max-w-6xl mx-auto">
                  {/* Before Image (Right side) */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-lg"
                    style={{
                      clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center'
                    }}
                  >
                    {beforeImage ? (
                      <>
                        {imageLoading.before && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                          </div>
                        )}
                        <img
                          src={beforeImage}
                          alt={language === 'ja' ? beforeLabelJa : beforeLabel}
                          className="w-full h-full object-contain"
                          onLoad={() => handleImageLoad('before')}
                          onError={() => handleImageError('before')}
                          style={{ opacity: imageLoading.before ? 0 : 1 }}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">{language === 'ja' ? '元の画像' : 'Original Image'}</p>
                        </div>
                      </div>
                    )}
                    {showLabels && (
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {language === 'ja' ? beforeLabelJa : beforeLabel}
                      </div>
                    )}
                  </div>

                  {/* After Image (Left side) */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-lg"
                    style={{
                      clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center'
                    }}
                  >
                    {imageLoading.after && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      </div>
                    )}
                    <img
                      src={afterImage}
                      alt={language === 'ja' ? afterLabelJa : afterLabel}
                      className="w-full h-full object-contain"
                      onLoad={() => handleImageLoad('after')}
                      onError={() => handleImageError('after')}
                      style={{ opacity: imageLoading.after ? 0 : 1 }}
                    />
                    {showLabels && (
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {language === 'ja' ? afterLabelJa : afterLabel}
                      </div>
                    )}
                  </div>

                  {/* Slider Handle */}
                  <div
                    ref={sliderRef}
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-brixa-600">
                      <div className="flex space-x-1">
                        <div className="w-1 h-4 bg-gray-400"></div>
                        <div className="w-1 h-4 bg-gray-400"></div>
                      </div>
                    </div>
                  </div>

                  {/* Slider Position Indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {Math.round(sliderPosition)}%
                  </div>
                </div>
              )}

              {viewMode === 'side-by-side' && (
                <div className="grid grid-cols-2 gap-4 w-full h-full max-w-6xl mx-auto p-4">
                  {/* Before */}
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
                    {beforeImage ? (
                      <>
                        {imageLoading.before && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                          </div>
                        )}
                        <img
                          src={beforeImage}
                          alt={language === 'ja' ? beforeLabelJa : beforeLabel}
                          className="w-full h-full object-contain"
                          onLoad={() => handleImageLoad('before')}
                          onError={() => handleImageError('before')}
                          style={{
                            opacity: imageLoading.before ? 0 : 1,
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'center'
                          }}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">{language === 'ja' ? '元の画像' : 'Original Image'}</p>
                        </div>
                      </div>
                    )}
                    {showLabels && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {language === 'ja' ? beforeLabelJa : beforeLabel}
                      </div>
                    )}
                  </div>

                  {/* After */}
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
                    {imageLoading.after && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      </div>
                    )}
                    <img
                      src={afterImage}
                      alt={language === 'ja' ? afterLabelJa : afterLabel}
                      className="w-full h-full object-contain"
                      onLoad={() => handleImageLoad('after')}
                      onError={() => handleImageError('after')}
                      style={{
                        opacity: imageLoading.after ? 0 : 1,
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center'
                      }}
                    />
                    {showLabels && (
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {language === 'ja' ? afterLabelJa : afterLabel}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === 'animated' && (
                <div className="w-full h-full max-w-4xl mx-auto p-4">
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-lg h-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFrame}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        {processingSteps[currentFrame].image ? (
                          <img
                            src={processingSteps[currentFrame].image}
                            alt={language === 'ja' ? processingSteps[currentFrame].titleJa : processingSteps[currentFrame].title}
                            className="w-full h-full object-contain"
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transformOrigin: 'center'
                            }}
                          />
                        ) : (
                          <div className="text-center p-8">
                            <div className="w-24 h-24 bg-brixa-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Loader2 className="w-12 h-12 text-brixa-600 animate-spin" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {language === 'ja' ? processingSteps[currentFrame].titleJa : processingSteps[currentFrame].title}
                            </h3>
                            <p className="text-gray-600">
                              {language === 'ja' ? processingSteps[currentFrame].descriptionJa : processingSteps[currentFrame].description}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {showLabels && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {language === 'ja' ? processingSteps[currentFrame].titleJa : processingSteps[currentFrame].title}
                      </div>
                    )}

                    {/* Animation Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setCurrentFrame((prev) => Math.max(0, prev - 1))}
                        disabled={currentFrame === 0}
                        className="w-8 h-8"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setCurrentFrame((prev) => Math.min(processingSteps.length - 1, prev + 1))}
                        disabled={currentFrame === processingSteps.length - 1}
                        className="w-8 h-8"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Progress Indicators */}
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {processingSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentFrame ? 'bg-white w-8' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {language === 'ja' ? 'インタラクティブプレビュー' : 'Interactive Preview'}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadImage(afterImage, 'post-processing-preview.jpg')}
                  className="flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'ja' ? 'ダウンロード' : 'Download'}</span>
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {language === 'ja' ? 'ドラッグして比較 • クリックで拡大' : 'Drag to compare • Click to zoom'}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}