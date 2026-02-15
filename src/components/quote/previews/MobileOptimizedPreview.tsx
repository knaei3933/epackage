'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { PanInfo } from 'framer-motion'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Smartphone,
  Tablet,
  Monitor,
  Hand,
  ZoomOut,
  RotateCw,
  Maximize2,
  Heart,
  Share2,
  Download,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Battery,
  Wifi,
  Compass,
  Camera,
  Video,
  Image as ImageIcon,
  Move,
  RotateCcw,
  Framer,
  Layers,
  Sparkles,
  Zap,
  Target,
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  processingOptionsConfig,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from '../shared/processingConfig'

interface MobileOptimizedPreviewProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  language?: 'en' | 'ja'
  deviceType?: 'mobile' | 'tablet' | 'desktop'
}

interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'longPress'
  startPoint: { x: number; y: number }
  endPoint?: { x: number; y: number }
  scale?: number
  rotation?: number
  duration?: number
}

interface MobileViewState {
  currentPage: number
  totalPages: number
  zoomLevel: number
  rotation: number
  isFullscreen: boolean
  showControls: boolean
  autoHideControls: boolean
  orientation: 'portrait' | 'landscape'
  viewMode: 'grid' | 'list' | 'carousel' | 'detail'
  sortMode: 'popularity' | 'price' | 'name' | 'newest'
  filterCategories: string[]
  searchQuery: string
}

export function MobileOptimizedPreview({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  language = 'ja',
  deviceType = 'mobile'
}: MobileOptimizedPreviewProps) {
  const [viewState, setViewState] = useState<MobileViewState>({
    currentPage: 0,
    totalPages: 0,
    zoomLevel: 1,
    rotation: 0,
    isFullscreen: false,
    showControls: true,
    autoHideControls: true,
    orientation: 'portrait',
    viewMode: 'grid',
    sortMode: 'popularity',
    filterCategories: [],
    searchQuery: ''
  })

  const [touchGesture, setTouchGesture] = useState<TouchGesture | null>(null)
  const [selectedOption, setSelectedOption] = useState<ProcessingOptionConfig | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [isComparing, setIsComparing] = useState(false)
  const [compareOptions, setCompareOptions] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait')

  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const gestureStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(selectedOptions)
  }, [selectedOptions])

  // Get compatible options
  const compatibleOptions = useMemo(() => {
    return processingOptionsConfig.filter(option =>
      option.compatibleWith.includes(selectedProductType)
    )
  }, [selectedProductType])

  // Filter and sort options
  const filteredAndSortedOptions = useMemo(() => {
    let options = [...compatibleOptions]

    // Apply search filter
    if (viewState.searchQuery) {
      const query = viewState.searchQuery.toLowerCase()
      options = options.filter(option =>
        option.name.toLowerCase().includes(query) ||
        option.nameJa.toLowerCase().includes(query) ||
        option.description.toLowerCase().includes(query) ||
        option.descriptionJa.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (viewState.filterCategories.length > 0) {
      options = options.filter(option =>
        viewState.filterCategories.includes(option.category)
      )
    }

    // Apply sorting
    options.sort((a, b) => {
      switch (viewState.sortMode) {
        case 'price':
          return a.priceMultiplier - b.priceMultiplier
        case 'name':
          return language === 'ja' ? a.nameJa.localeCompare(b.nameJa) : a.name.localeCompare(b.name)
        case 'popularity':
          return b.features.length - a.features.length
        case 'newest':
          return b.id.localeCompare(a.id) // Simple reverse sort
        default:
          return 0
      }
    })

    return options
  }, [compatibleOptions, viewState.searchQuery, viewState.filterCategories, viewState.sortMode, language])

  // Update total pages
  useEffect(() => {
    const itemsPerPage = viewState.viewMode === 'grid' ? 6 : 1
    setViewState(prev => ({
      ...prev,
      totalPages: Math.ceil(filteredAndSortedOptions.length / itemsPerPage)
    }))
  }, [filteredAndSortedOptions.length, viewState.viewMode])

  // Device orientation detection
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setDeviceOrientation(isLandscape ? 'landscape' : 'portrait')
      setViewState(prev => ({ ...prev, orientation: isLandscape ? 'landscape' : 'portrait' }))
    }

    window.addEventListener('resize', handleOrientationChange)
    handleOrientationChange()

    return () => window.removeEventListener('resize', handleOrientationChange)
  }, [])

  // Auto-hide controls
  useEffect(() => {
    if (!viewState.autoHideControls || !viewState.showControls) return

    const timer = setTimeout(() => {
      setViewState(prev => ({ ...prev, showControls: false }))
    }, 3000)

    return () => clearTimeout(timer)
  }, [viewState.showControls, viewState.autoHideControls])

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    gestureStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    setViewState(prev => ({ ...prev, showControls: true }))
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!gestureStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - gestureStartRef.current.x
    const deltaY = touch.clientY - gestureStartRef.current.y
    const deltaTime = Date.now() - gestureStartRef.current.time

    // Detect swipe gesture
    if (Math.abs(deltaX) > 50 && deltaTime < 500) {
      const direction = deltaX > 0 ? 'right' : 'left'
      handleSwipe(direction)
    }

    // Detect pinch gesture (for zoom)
    if (e.touches.length === 2) {
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      )

      // Calculate zoom based on pinch distance
      const zoomLevel = Math.max(0.5, Math.min(3, distance / 200))
      setViewState(prev => ({ ...prev, zoomLevel }))
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    gestureStartRef.current = null
  }, [])

  // Handle swipe gestures
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (viewState.viewMode === 'carousel' || viewState.viewMode === 'detail') {
      if (direction === 'left' && viewState.currentPage < viewState.totalPages - 1) {
        setViewState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
      } else if (direction === 'right' && viewState.currentPage > 0) {
        setViewState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
      }
    }
  }, [viewState.viewMode, viewState.currentPage, viewState.totalPages])

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setViewState(prev => ({
      ...prev,
      zoomLevel: Math.max(0.5, Math.min(3, prev.zoomLevel + delta))
    }))
  }, [])

  // Handle rotation
  const handleRotation = useCallback((delta: number) => {
    setViewState(prev => ({
      ...prev,
      rotation: (prev.rotation + delta) % 360
    }))
  }, [])

  // Toggle favorite
  const toggleFavorite = useCallback((optionId: string) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(optionId)
      return isFavorite
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    })
  }, [])

  // Toggle bookmark
  const toggleBookmark = useCallback((optionId: string) => {
    setBookmarks(prev => {
      const isBookmarked = prev.includes(optionId)
      return isBookmarked
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    })
  }, [])

  // Start/stop recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false)
      setRecordingTime(0)
    } else {
      setIsRecording(true)
      const startTime = Date.now()
      const interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      // Stop recording after 30 seconds max
      setTimeout(() => {
        clearInterval(interval)
        setIsRecording(false)
        setRecordingTime(0)
      }, 30000)
    }
  }, [isRecording])

  // Share configuration
  const shareConfiguration = useCallback(async () => {
    const shareUrl = `${window.location.origin}/quote?product=${selectedProductType}&options=${selectedOptions.join(',')}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: language === 'ja' ? '後加工設定' : 'Processing Configuration',
          text: language === 'ja'
            ? `選択されたオプション: ${selectedOptions.length}個`
            : `Selected options: ${selectedOptions.length}`,
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        // Show toast notification
      }
    } catch (error) {
      console.log('Share cancelled')
    }
  }, [selectedOptions, selectedProductType, language])

  // Get device-specific styling
  const getDeviceStyles = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          container: 'max-w-md mx-auto',
          gridCols: 'grid-cols-2',
          textSize: 'text-sm',
          padding: 'p-3',
          cardHeight: 'h-48'
        }
      case 'tablet':
        return {
          container: 'max-w-2xl mx-auto',
          gridCols: 'grid-cols-3',
          textSize: 'text-base',
          padding: 'p-4',
          cardHeight: 'h-56'
        }
      case 'desktop':
        return {
          container: 'max-w-4xl mx-auto',
          gridCols: 'grid-cols-4',
          textSize: 'text-base',
          padding: 'p-6',
          cardHeight: 'h-64'
        }
      default:
        return {
          container: 'max-w-md mx-auto',
          gridCols: 'grid-cols-2',
          textSize: 'text-sm',
          padding: 'p-3',
          cardHeight: 'h-48'
        }
    }
  }

  const deviceStyles = getDeviceStyles()

  return (
    <div
      ref={containerRef}
      className={`${deviceStyles.container} min-h-screen bg-gray-50 ${viewState.isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-30"
      >
        <div className={`${deviceStyles.padding} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewState(prev => ({ ...prev, showControls: !prev.showControls }))}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className={`font-bold ${deviceStyles.textSize}`}>
                {language === 'ja' ? '後加工プレビュー' : 'Processing Preview'}
              </h1>
              <p className="text-xs text-gray-600">
                {selectedOptions.length} {language === 'ja' ? '選択済み' : 'selected'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Recording Indicator */}
            {isRecording && (
              <div className="flex items-center space-x-1 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-xs font-medium">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Device Status */}
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Wifi className="w-4 h-4" />
              <Battery className="w-4 h-4" />
              {deviceOrientation === 'landscape' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Quick Stats Bar */}
      <AnimatePresence>
        {viewState.showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`${deviceStyles.padding} bg-white border-b border-gray-200`}
          >
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-blue-600">
                  x{processingImpact.multiplier.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">
                  {language === 'ja' ? '価格' : 'Price'}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  {processingImpact.minimumQuantity.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">
                  {language === 'ja' ? '最小数量' : 'Min Qty'}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">
                  {processingImpact.features.length}
                </p>
                <p className="text-xs text-gray-600">
                  {language === 'ja' ? '機能' : 'Features'}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-600">
                  {Math.round(viewState.zoomLevel * 100)}%
                </p>
                <p className="text-xs text-gray-600">
                  {language === 'ja' ? 'ズーム' : 'Zoom'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter Bar */}
      <AnimatePresence>
        {viewState.showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`${deviceStyles.padding} bg-white border-b border-gray-200`}
          >
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ja' ? '検索...' : 'Search...'}
                  value={viewState.searchQuery}
                  onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewState.viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, viewMode: 'grid' }))}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewState.viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, viewMode: 'list' }))}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewState.viewMode === 'carousel' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, viewMode: 'carousel' }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-gray-600">
                {language === 'ja' ? '並び替え:' : 'Sort:'}
              </span>
              <select
                value={viewState.sortMode}
                onChange={(e) => setViewState(prev => ({ ...prev, sortMode: e.target.value as any }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="popularity">{language === 'ja' ? '人気順' : 'Popular'}</option>
                <option value="price">{language === 'ja' ? '価格順' : 'Price'}</option>
                <option value="name">{language === 'ja' ? '名前順' : 'Name'}</option>
                <option value="newest">{language === 'ja' ? '新着順' : 'Newest'}</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`${deviceStyles.padding}`}>
        {viewState.viewMode === 'carousel' && (
          /* Carousel View */
          <div className="relative">
            <div
              ref={carouselRef}
              className="overflow-hidden rounded-lg"
              style={{ touchAction: 'pan-y' }}
            >
              <motion.div
                className="flex"
                animate={{ x: -viewState.currentPage * 100 + '%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {filteredAndSortedOptions.map((option) => (
                  <div key={option.id} className="w-full flex-shrink-0 px-2">
                    <Card className={`${deviceStyles.cardHeight} overflow-hidden`}>
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full">
                          <img
                            src={option.afterImage}
                            alt={language === 'ja' ? option.nameJa : option.name}
                            className="w-full h-full object-cover"
                            style={{
                              transform: `scale(${viewState.zoomLevel}) rotate(${viewState.rotation}deg)`
                            }}
                          />

                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Option Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="font-bold text-lg mb-1">
                              {language === 'ja' ? option.nameJa : option.name}
                            </h3>
                            <p className="text-sm opacity-90 line-clamp-2 mb-2">
                              {language === 'ja' ? option.descriptionJa : option.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge className="bg-white/20 text-white border-white/30">
                                x{option.priceMultiplier.toFixed(2)}
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleFavorite(option.id)}
                                  className="text-white hover:bg-white/20"
                                >
                                  <Heart className={`w-4 h-4 ${favorites.includes(option.id) ? 'fill-current text-red-500' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleBookmark(option.id)}
                                  className="text-white hover:bg-white/20"
                                >
                                  <Bookmark className={`w-4 h-4 ${bookmarks.includes(option.id) ? 'fill-current text-blue-500' : ''}`} />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Zoom Controls */}
                          <div className="absolute top-4 right-4 flex flex-col space-y-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleZoom(0.2)}
                              className="bg-white/20 text-white hover:bg-white/30"
                            >
                              <Search className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleZoom(-0.2)}
                              className="bg-white/20 text-white hover:bg-white/30"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRotation(90)}
                              className="bg-white/20 text-white hover:bg-white/30"
                            >
                              <RotateCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Page Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {Array.from({ length: viewState.totalPages }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === viewState.currentPage ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSwipe('left')}
              disabled={viewState.currentPage >= viewState.totalPages - 1}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSwipe('right')}
              disabled={viewState.currentPage <= 0}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}

        {viewState.viewMode === 'grid' && (
          /* Grid View */
          <div className={`grid ${deviceStyles.gridCols} gap-4`}>
            {filteredAndSortedOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.id)
              const isFavorite = favorites.includes(option.id)
              const isBookmarked = bookmarks.includes(option.id)

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={`${deviceStyles.cardHeight} overflow-hidden cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardContent className="p-0 h-full relative">
                      <img
                        src={option.afterImage}
                        alt={language === 'ja' ? option.nameJa : option.name}
                        className="w-full h-32 object-cover"
                      />

                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex space-x-1">
                        {isSelected && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {language === 'ja' ? '選択済み' : 'Selected'}
                          </Badge>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className={`font-semibold ${deviceStyles.textSize} mb-1 line-clamp-1`}>
                          {language === 'ja' ? option.nameJa : option.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {language === 'ja' ? option.descriptionJa : option.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            x{option.priceMultiplier.toFixed(2)}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(option.id)}
                              className="w-6 h-6"
                            >
                              <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(option.id)}
                              className="w-6 h-6"
                            >
                              <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current text-blue-500' : 'text-gray-400'}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {viewState.viewMode === 'list' && (
          /* List View */
          <div className="space-y-3">
            {filteredAndSortedOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.id)
              const isFavorite = favorites.includes(option.id)
              const isBookmarked = bookmarks.includes(option.id)

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card className={`overflow-hidden cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={option.thumbnail}
                          alt={language === 'ja' ? option.nameJa : option.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1">
                            {language === 'ja' ? option.nameJa : option.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {language === 'ja' ? option.descriptionJa : option.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              x{option.priceMultiplier.toFixed(2)}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {option.features.slice(0, 2).map((feature, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleFavorite(option.id)}
                                  className="w-6 h-6"
                                >
                                  <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleBookmark(option.id)}
                                  className="w-6 h-6"
                                >
                                  <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current text-blue-500' : 'text-gray-400'}`} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <Button
          variant="primary"
          size="icon"
          onClick={toggleRecording}
          className={`rounded-full shadow-lg ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
        >
          {isRecording ? <Video className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={shareConfiguration}
          className="rounded-full shadow-lg bg-white"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Touch Gesture Indicators */}
      <AnimatePresence>
        {touchGesture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
          >
            {touchGesture.type === 'swipe' && (
              <span>
                {language === 'ja' ? 'スワイプ' : 'Swipe'} {touchGesture.endPoint!.x > touchGesture.startPoint.x ? '→' : '←'}
              </span>
            )}
            {touchGesture.type === 'pinch' && (
              <span>{language === 'ja' ? 'ピンチ' : 'Pinch'}: {Math.round((touchGesture.scale || 1) * 100)}%</span>
            )}
            {touchGesture.type === 'tap' && (
              <span>{language === 'ja' ? 'タップ' : 'Tap'}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}