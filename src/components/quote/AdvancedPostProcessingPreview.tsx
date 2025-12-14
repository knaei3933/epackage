'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  Settings,
  Filter,
  Zap,
  TrendingUp,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Grid,
  List,
  Search,
  X,
  ChevronDown,
  Star,
  Award,
  Clock,
  Package,
  AlertCircle,
  Maximize2,
  RotateCw,
  Layers,
  Move3d,
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Share2,
  Heart,
  Bookmark,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Fullscreen,
  RefreshCw,
  Compass,
  Target,
  Sparkles,
  Zap as BoltIcon,
  Flame,
  Diamond,
  Crown,
  Gem
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { BeforeAfterPreview } from './BeforeAfterPreview'
import { ProcessingPreviewTrigger } from './ProcessingPreviewTrigger'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  getProcessingOptionsByCategory,
  getProcessingCategories,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'

// Advanced 3D Preview Component
interface AdvancedPreviewProps {
  selectedOptions: ProcessingOptionConfig[]
  productType: string
  language: 'en' | 'ja'
}

function Advanced3DPreview({ selectedOptions, productType, language }: AdvancedPreviewProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [currentAnnotation, setCurrentAnnotation] = useState<number | null>(null)

  // Auto-rotation animation
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, y: prev.y + 1 }))
    }, 50)

    return () => clearInterval(interval)
  }, [isAutoRotating])

  // Mock 3D annotations for selected options
  const annotations = useMemo(() => {
    return selectedOptions.map((option, index) => ({
      id: index,
      title: language === 'ja' ? option.nameJa : option.name,
      position: { x: 50 + (index * 20) % 40, y: 30 + (index * 15) % 40 },
      icon: getCategoryIcon(option.category)
    }))
  }, [selectedOptions, language])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'closure': return Lock
      case 'finish': return Sparkles
      case 'opening': return Package
      case 'display': return Target
      case 'structure': return Layers
      default: return Settings
    }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden">
      {/* 3D Viewport Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Mock 3D Package */}
          <motion.div
            className="w-64 h-80 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-2xl"
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: 'preserve-3d'
            }}
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            onDrag={(_, info) => {
              setRotation({ x: info.offset.y * 0.5, y: info.offset.x * 0.5 })
            }}
          >
            {/* Package Faces */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg border border-blue-400" />
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg border border-purple-400"
                 style={{ transform: 'rotateY(90deg) translateZ(128px)' }} />

            {/* Selected Processing Indicators */}
            {showAnnotations && annotations.map((annotation) => (
              <motion.div
                key={annotation.id}
                className="absolute bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200"
                style={{
                  left: `${annotation.position.x}%`,
                  top: `${annotation.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setCurrentAnnotation(currentAnnotation === annotation.id ? null : annotation.id)}
              >
                <div className="text-blue-600">
                  {typeof annotation.icon === 'string' ? (
                    annotation.icon
                  ) : (
                    React.createElement(annotation.icon as React.ComponentType<{ className?: string }>, { className: "w-4 h-4" })
                  )}
                </div>
                <AnimatePresence>
                  {currentAnnotation === annotation.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 min-w-max z-10"
                    >
                      <p className="text-sm font-semibold text-gray-900">{annotation.title}</p>
                      <p className="text-xs text-gray-600">Click for details</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 3D Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="w-8 h-8 text-white hover:bg-white/20"
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRotation({ x: 0, y: 0 })}
          className="w-8 h-8 text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAnnotations(!showAnnotations)}
          className="w-8 h-8 text-white hover:bg-white/20"
        >
          <Compass className="w-4 h-4" />
        </Button>
      </div>

      {/* Premium Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 flex items-center space-x-1">
          <Crown className="w-3 h-3" />
          <span className="text-xs font-bold">3D PREVIEW</span>
        </Badge>
      </div>
    </div>
  )
}

// AR Preview Component
function ARPreview({ selectedOptions, language }: { selectedOptions: ProcessingOptionConfig[], language: 'en' | 'ja' }) {
  const [isARSupported, setIsARSupported] = useState(false)
  const [arMode, setArMode] = useState<'off' | 'camera' | 'viewer'>('off')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-ar').then(setIsARSupported)
    }
  }, [])

  const startARCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setArMode('camera')
      }
    } catch (error) {
      console.error('Camera access denied:', error)
    }
  }

  const stopARCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setArMode('off')
  }

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {arMode === 'off' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <Smartphone className="w-16 h-16 text-white mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {language === 'ja' ? 'AR プレビュー' : 'AR Preview'}
          </h3>
          <p className="text-gray-300 text-center mb-6">
            {language === 'ja'
              ? 'ご自身の環境で包装をプレビューしてください'
              : 'Preview the packaging in your own environment'
            }
          </p>
          <div className="flex items-center space-x-4">
            <Button
              onClick={startARCamera}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              disabled={!isARSupported}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {language === 'ja' ? 'カメラで見る' : 'View in Camera'}
            </Button>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {isARSupported
                ? (language === 'ja' ? '対応済み' : 'AR Supported')
                : (language === 'ja' ? '未対応' : 'AR Not Available')
              }
            </Badge>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Package className="w-24 h-24 text-white mb-2" />
              <p className="text-white text-center">
                {language === 'ja' ? '仮想配置中...' : 'Virtual placement...'}
              </p>
            </div>
          </div>
          <Button
            onClick={stopARCamera}
            className="absolute top-4 right-4 bg-red-500 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  )
}

// Comparison Table Component
function ComparisonTable({ options, language }: { options: ProcessingOptionConfig[], language: 'en' | 'ja' }) {
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'impact'>('impact')

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.priceMultiplier - b.priceMultiplier
        case 'time':
          return parseInt(a.processingTime) - parseInt(b.processingTime)
        case 'impact':
          return (a.features.length + a.benefits.length) - (b.features.length + b.benefits.length)
        default:
          return 0
      }
    })
  }, [options, sortBy])

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-3 font-semibold">
              {language === 'ja' ? 'オプション' : 'Option'}
            </th>
            <th className="text-left p-3 font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy('price')}
                className="flex items-center space-x-1"
              >
                <span>{language === 'ja' ? '価格' : 'Price'}</span>
                <TrendingUp className="w-3 h-3" />
              </Button>
            </th>
            <th className="text-left p-3 font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy('time')}
                className="flex items-center space-x-1"
              >
                <span>{language === 'ja' ? '時間' : 'Time'}</span>
                <Clock className="w-3 h-3" />
              </Button>
            </th>
            <th className="text-left p-3 font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy('impact')}
                className="flex items-center space-x-1"
              >
                <span>{language === 'ja' ? '影響' : 'Impact'}</span>
                <Flame className="w-3 h-3" />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedOptions.map((option) => (
            <tr key={option.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={option.thumbnail}
                    alt={language === 'ja' ? option.nameJa : option.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{language === 'ja' ? option.nameJa : option.name}</p>
                    <p className="text-xs text-gray-500">{option.category}</p>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <Badge variant={option.priceMultiplier > 1 ? "secondary" : "outline"}>
                  x{option.priceMultiplier.toFixed(2)}
                </Badge>
              </td>
              <td className="p-3 text-sm text-gray-600">
                {language === 'ja' ? option.processingTimeJa : option.processingTime}
              </td>
              <td className="p-3">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{option.features.length + option.benefits.length}</span>
                  <Flame className="w-3 h-3 text-orange-500" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface AdvancedPostProcessingPreviewProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  onPriceUpdate: (multiplier: number) => void
  language?: 'en' | 'ja'
}

export function AdvancedPostProcessingPreview({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  onPriceUpdate,
  language = 'ja'
}: AdvancedPostProcessingPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'standard' | '3d' | 'ar' | 'comparison'>('standard')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [savedConfigurations, setSavedConfigurations] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonOptions, setComparisonOptions] = useState<string[]>([])

  // Get selected option details
  const selectedOptionDetails = useMemo(() => {
    return selectedOptions
      .map(id => processingOptionsConfig.find(opt => opt.id === id))
      .filter(Boolean) as ProcessingOptionConfig[]
  }, [selectedOptions])

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(selectedOptions)
  }, [selectedOptions])

  // Update price when selection changes
  useEffect(() => {
    onPriceUpdate(processingImpact.multiplier)
  }, [processingImpact.multiplier, onPriceUpdate])

  // Save configuration
  const saveConfiguration = useCallback(() => {
    const configId = `config_${Date.now()}`
    setSavedConfigurations(prev => [...prev, configId])
    // In real app, save to backend/localStorage
    console.log('Configuration saved:', { selectedOptions, configId })
  }, [selectedOptions])

  // Share configuration
  const shareConfiguration = useCallback(async () => {
    const shareUrl = `${window.location.origin}/quote?options=${selectedOptions.join(',')}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'ja' ? '後加工設定' : 'Processing Configuration',
          text: language === 'ja'
            ? '選択した後加工オプションを確認してください'
            : 'Check out my selected processing options',
          url: shareUrl
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      // Show toast notification
    }
  }, [selectedOptions, language])

  // Export configuration
  const exportConfiguration = useCallback(() => {
    const exportData = {
      productType: selectedProductType,
      selectedOptions,
      processingImpact,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `processing-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedOptions, selectedProductType, processingImpact])

  return (
    <div className="space-y-6">
      {/* Header with Premium Features */}
      <MotionWrapper delay={0.1}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-brixa-100 to-navy-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium">
              <Diamond className="w-4 h-4" />
              <span>{language === 'ja' ? '高度プレビュー' : 'Advanced Preview'}</span>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 flex items-center space-x-1">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-bold">PREMIUM</span>
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {/* Preview Mode Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={previewMode === 'standard' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('standard')}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === '3d' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('3d')}
              >
                <Move3d className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'ar' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('ar')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'comparison' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('comparison')}
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={saveConfiguration}
              title={language === 'ja' ? '設定を保存' : 'Save Configuration'}
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareConfiguration}
              title={language === 'ja' ? '共有' : 'Share'}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={exportConfiguration}
              title={language === 'ja' ? 'エクスポート' : 'Export'}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={language === 'ja' ? 'フルスクリーン' : 'Fullscreen'}
            >
              {isFullscreen ? <Maximize2 className="w-4 h-4" /> : <Fullscreen className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </MotionWrapper>

      {/* Advanced Stats Dashboard */}
      <MotionWrapper delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    {language === 'ja' ? '価格乗数' : 'Price Multiplier'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    x{processingImpact.multiplier.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-200 rounded-full p-3">
                  <TrendingUp className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    {language === 'ja' ? '最小数量' : 'Min. Quantity'}
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {processingImpact.minimumQuantity.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-200 rounded-full p-3">
                  <Package className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    {language === 'ja' ? '機能数' : 'Features'}
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {processingImpact.features.length}
                  </p>
                </div>
                <div className="bg-purple-200 rounded-full p-3">
                  <Zap className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    {language === 'ja' ? '処理時間' : 'Processing Time'}
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {language === 'ja' ? processingImpact.processingTimeJa : processingImpact.processingTime}
                  </p>
                </div>
                <div className="bg-orange-200 rounded-full p-3">
                  <Clock className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MotionWrapper>

      {/* Main Preview Area */}
      <MotionWrapper delay={0.3}>
        <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : 'h-96'} overflow-hidden`}>
          <CardContent className="p-0 h-full">
            {previewMode === 'standard' && selectedOptionDetails.length > 0 && (
              <BeforeAfterPreview
                beforeImage={selectedOptionDetails[0].beforeImage}
                afterImage={selectedOptionDetails[0].afterImage}
                beforeLabel="Before Processing"
                afterLabel="After Processing"
                beforeLabelJa="加工前"
                afterLabelJa="加工後"
                title={language === 'ja' ? selectedOptionDetails[0].nameJa : selectedOptionDetails[0].name}
                titleJa={selectedOptionDetails[0].nameJa}
                description={language === 'ja' ? selectedOptionDetails[0].descriptionJa : selectedOptionDetails[0].description}
                descriptionJa={selectedOptionDetails[0].descriptionJa}
                onClose={() => {}}
                language={language}
                showComparisonSlider={true}
                autoPlay={false}
              />
            )}

            {previewMode === '3d' && (
              <Advanced3DPreview
                selectedOptions={selectedOptionDetails}
                productType={selectedProductType}
                language={language}
              />
            )}

            {previewMode === 'ar' && (
              <ARPreview
                selectedOptions={selectedOptionDetails}
                language={language}
              />
            )}

            {previewMode === 'comparison' && (
              <div className="p-6 h-full overflow-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'ja' ? 'オプション比較' : 'Options Comparison'}
                </h3>
                <ComparisonTable
                  options={selectedOptionDetails}
                  language={language}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </MotionWrapper>

      {/* Saved Configurations */}
      {savedConfigurations.length > 0 && (
        <MotionWrapper delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bookmark className="w-5 h-5" />
                <span>{language === 'ja' ? '保存された設定' : 'Saved Configurations'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {savedConfigurations.map((configId) => (
                  <div
                    key={configId}
                    className="flex-shrink-0 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    <p className="text-sm font-medium">Config {configId.split('_')[1]}</p>
                    <p className="text-xs text-gray-500">3 options</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}
    </div>
  )
}