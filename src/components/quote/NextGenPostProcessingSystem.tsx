'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  Eye,
  Target,
  Award,
  BarChart3,
  Layers,
  Users,
  Clock,
  DollarSign,
  Package,
  Smartphone,
  Monitor,
  Tablet,
  RotateCw,
  Download,
  Share2,
  Bookmark,
  Heart,
  Star,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Grid3X3,
  List,
  Filter,
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Wifi,
  Battery,
  Gauge,
  Activity,
  Cpu,
  Move3d,
  Camera,
  Video,
  Palette,
  Compass,
  Target as TargetIcon,
  Gem,
  Crown,
  Diamond,
  Flame
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { AdvancedPostProcessingPreview } from './AdvancedPostProcessingPreview'
import { AIRecommendationEngine } from './AIRecommendationEngine'
import { RealTimePreviewEngine } from './RealTimePreviewEngine'
import { BeforeAfterPreview } from './BeforeAfterPreview'
import {
  processingOptionsConfig,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'

interface UserProfile {
  industry?: string
  targetMarket?: string
  budgetLevel?: 'low' | 'medium' | 'high'
  volumeSize?: 'small' | 'medium' | 'large'
  priorityFactors?: ('cost' | 'quality' | 'speed' | 'sustainability')[]
  previousSelections?: string[]
  preferences?: {
    theme: 'light' | 'dark' | 'auto'
    language: 'en' | 'ja'
    notifications: boolean
    autoSave: boolean
  }
}

interface AnalyticsData {
  views: number
  interactions: number
  conversionRate: number
  popularOptions: { id: string; count: number }[]
  userPreferences: Record<string, number>
  performanceMetrics: {
    loadTime: number
    renderTime: number
    errorRate: number
  }
}

interface NextGenPostProcessingSystemProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  onPriceUpdate: (multiplier: number) => void
  language?: 'en' | 'ja'
  userProfile?: UserProfile
  enableAnalytics?: boolean
  enableCollaboration?: boolean
}

export function NextGenPostProcessingSystem({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  onPriceUpdate,
  language = 'ja',
  userProfile,
  enableAnalytics = true,
  enableCollaboration = false
}: NextGenPostProcessingSystemProps) {
  const [activeView, setActiveView] = useState<'preview' | 'ai' | 'realtime' | 'analytics'>('preview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showAdvancedMode, setShowAdvancedMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [savedConfigurations, setSavedConfigurations] = useState<Array<{ id: string; name: string; options: string[]; timestamp: number }>>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentActivity, setRecentActivity] = useState<Array<{ action: string; timestamp: number; details: any }>>([])
  const [collaborativeSession, setCollaborativeSession] = useState<{ id: string; participants: number; isActive: boolean } | null>(null)

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    views: 0,
    interactions: 0,
    conversionRate: 0,
    popularOptions: [],
    userPreferences: {},
    performanceMetrics: {
      loadTime: 0,
      renderTime: 0,
      errorRate: 0
    }
  })

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(selectedOptions)
  }, [selectedOptions])

  // Update price when selection changes
  useEffect(() => {
    onPriceUpdate(processingImpact.multiplier)
  }, [processingImpact.multiplier, onPriceUpdate])

  // Track user interactions for analytics
  useEffect(() => {
    if (!enableAnalytics) return

    setAnalyticsData(prev => ({
      ...prev,
      views: prev.views + 1,
      interactions: prev.interactions + selectedOptions.length,
      popularOptions: updatePopularOptions(prev.popularOptions, selectedOptions),
      userPreferences: updateUserPreferences(prev.userPreferences, selectedOptions),
      performanceMetrics: {
        ...prev.performanceMetrics,
        loadTime: performance.now(),
        renderTime: Math.random() * 100 + 50 // Simulated
      }
    }))

    // Log activity
    logActivity('options_changed', { selectedOptions, impact: processingImpact })
  }, [selectedOptions, enableAnalytics, processingImpact])

  // Update popular options
  const updatePopularOptions = (current: Array<{ id: string; count: number }>, newOptions: string[]) => {
    const updated = [...current]
    newOptions.forEach(optionId => {
      const existing = updated.find(opt => opt.id === optionId)
      if (existing) {
        existing.count += 1
      } else {
        updated.push({ id: optionId, count: 1 })
      }
    })
    return updated.sort((a, b) => b.count - a.count).slice(0, 10)
  }

  // Update user preferences
  const updateUserPreferences = (current: Record<string, number>, newOptions: string[]) => {
    const updated = { ...current }
    newOptions.forEach(optionId => {
      updated[optionId] = (updated[optionId] || 0) + 1
    })
    return updated
  }

  // Log user activity
  const logActivity = (action: string, details: any) => {
    setRecentActivity(prev => [
      {
        action,
        timestamp: Date.now(),
        details
      },
      ...prev.slice(0, 49) // Keep last 50 activities
    ])
  }

  // Save configuration
  const saveConfiguration = useCallback((name: string) => {
    const config = {
      id: `config_${Date.now()}`,
      name,
      options: [...selectedOptions],
      timestamp: Date.now()
    }
    setSavedConfigurations(prev => [config, ...prev])
    logActivity('configuration_saved', { name, optionCount: selectedOptions.length })

    if (notificationsEnabled) {
      // Show notification (implement toast system)
      console.log('Configuration saved successfully!')
    }
  }, [selectedOptions, notificationsEnabled])

  // Load configuration
  const loadConfiguration = useCallback((configId: string) => {
    const config = savedConfigurations.find(c => c.id === configId)
    if (config) {
      onOptionsChange(config.options)
      logActivity('configuration_loaded', { name: config.name })
    }
  }, [savedConfigurations, onOptionsChange])

  // Toggle favorite
  const toggleFavorite = useCallback((optionId: string) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(optionId)
      const updated = isFavorite
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]

      logActivity('favorite_toggled', { optionId, isFavorite: !isFavorite })
      return updated
    })
  }, [])

  // Share configuration
  const shareConfiguration = useCallback(async () => {
    const shareUrl = `${window.location.origin}/quote?product=${selectedProductType}&options=${selectedOptions.join(',')}&impact=${processingImpact.multiplier}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: language === 'ja' ? '後加工設定' : 'Processing Configuration',
          text: language === 'ja'
            ? `最適な後加工オプション: ${selectedOptions.length}個選択`
            : `Optimal processing options: ${selectedOptions.length} selected`,
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
      logActivity('configuration_shared', { optionCount: selectedOptions.length })
    } catch (error) {
      console.log('Share cancelled or failed')
    }
  }, [selectedOptions, selectedProductType, processingImpact.multiplier, language])

  // Start collaborative session
  const startCollaborativeSession = useCallback(() => {
    const session = {
      id: `session_${Date.now()}`,
      participants: 1,
      isActive: true
    }
    setCollaborativeSession(session)
    logActivity('collaboration_started', { sessionId: session.id })
  }, [])

  // Get view icon
  const getViewIcon = (view: typeof activeView) => {
    switch (view) {
      case 'preview': return <Eye className="w-5 h-5" />
      case 'ai': return <Brain className="w-5 h-5" />
      case 'realtime': return <Monitor className="w-5 h-5" />
      case 'analytics': return <BarChart3 className="w-5 h-5" />
      default: return <Settings className="w-5 h-5" />
    }
  }

  // Get view title
  const getViewTitle = (view: typeof activeView) => {
    switch (view) {
      case 'preview': return language === 'ja' ? '高度プレビュー' : 'Advanced Preview'
      case 'ai': return language === 'ja' ? 'AI 推薦' : 'AI Recommendations'
      case 'realtime': return language === 'ja' ? 'リアルタイム' : 'Real-Time Engine'
      case 'analytics': return language === 'ja' ? '分析' : 'Analytics'
      default: return language === 'ja' ? '設定' : 'Settings'
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full p-2">
                  <Gem className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {language === 'ja' ? '次世代後加工システム' : 'Next-Gen Post-Processing System'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? 'AI駆動の高度包装ソリューション' : 'AI-powered advanced packaging solutions'}
                  </p>
                </div>
              </div>

              {/* View Navigation */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {(['preview', 'ai', 'realtime', 'analytics'] as const).map((view) => (
                  <Button
                    key={view}
                    variant={activeView === view ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView(view)}
                    className="flex items-center space-x-1"
                  >
                    {getViewIcon(view)}
                    <span className="hidden sm:inline">{getViewTitle(view)}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Status Indicators */}
              <div className="flex items-center space-x-2 text-sm">
                {enableAnalytics && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="hidden sm:inline">Live</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-blue-600">
                  <Battery className="w-4 h-4" />
                  <span>Optimal</span>
                </div>
                {collaborativeSession && (
                  <div className="flex items-center space-x-1 text-purple-600">
                    <Users className="w-4 h-4" />
                    <span>{collaborativeSession.participants}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedMode(!showAdvancedMode)}
                className="flex items-center space-x-1"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {showAdvancedMode ? (language === 'ja' ? 'シンプル' : 'Simple') : (language === 'ja' ? '高度' : 'Advanced')}
                </span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto sticky top-16"
            >
              <div className="p-4 space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ja' ? '選択オプション' : 'Selected Options'}
                        </span>
                        <Badge className="bg-blue-600 text-white">
                          {selectedOptions.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ja' ? '価格乗数' : 'Price Multiplier'}
                        </span>
                        <Badge variant="outline">
                          x{processingImpact.multiplier.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ja' ? '処理時間' : 'Processing Time'}
                        </span>
                        <Badge variant="outline">
                          {language === 'ja' ? processingImpact.processingTimeJa : processingImpact.processingTime}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Saved Configurations */}
                {savedConfigurations.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>{language === 'ja' ? '保存設定' : 'Saved Configurations'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveConfiguration('Quick Save')}
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {savedConfigurations.slice(0, 5).map((config) => (
                          <div
                            key={config.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                            onClick={() => loadConfiguration(config.id)}
                          >
                            <div>
                              <p className="text-sm font-medium">{config.name}</p>
                              <p className="text-xs text-gray-500">
                                {config.options.length} options • {new Date(config.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Favorites */}
                {favorites.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{language === 'ja' ? 'お気に入り' : 'Favorites'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {favorites.slice(0, 5).map((optionId) => {
                          const option = processingOptionsConfig.find(opt => opt.id === optionId)
                          return option ? (
                            <div key={optionId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={option.thumbnail}
                                  alt={language === 'ja' ? option.nameJa : option.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                                <p className="text-sm font-medium">
                                  {language === 'ja' ? option.nameJa : option.name}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(optionId)}
                              >
                                <Heart className="w-4 h-4 text-red-500 fill-current" />
                              </Button>
                            </div>
                          ) : null
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{language === 'ja' ? '最近のアクティビティ' : 'Recent Activity'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recentActivity.slice(0, 5).map((activity, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <p className="font-medium">{activity.action}</p>
                            <p>{new Date(activity.timestamp).toLocaleTimeString()}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Collaboration */}
                {enableCollaboration && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{language === 'ja' ? '協業' : 'Collaboration'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {collaborativeSession ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              {language === 'ja' ? '参加者' : 'Participants'}
                            </span>
                            <Badge className="bg-purple-600 text-white">
                              {collaborativeSession.participants}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              {language === 'ja' ? 'ステータス' : 'Status'}
                            </span>
                            <Badge className="bg-green-600 text-white">
                              {language === 'ja' ? 'アクティブ' : 'Active'}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCollaborativeSession(null)}
                            className="w-full"
                          >
                            {language === 'ja' ? 'セッション終了' : 'End Session'}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={startCollaborativeSession}
                          className="w-full"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {language === 'ja' ? '協業開始' : 'Start Collaboration'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeView === 'preview' && (
                <AdvancedPostProcessingPreview
                  selectedProductType={selectedProductType}
                  selectedOptions={selectedOptions}
                  onOptionsChange={onOptionsChange}
                  onPriceUpdate={onPriceUpdate}
                  language={language}
                />
              )}

              {activeView === 'ai' && (
                <AIRecommendationEngine
                  selectedProductType={selectedProductType}
                  selectedOptions={selectedOptions}
                  onOptionsChange={onOptionsChange}
                  language={language}
                  userProfile={userProfile}
                />
              )}

              {activeView === 'realtime' && (
                <RealTimePreviewEngine
                  selectedProductType={selectedProductType}
                  selectedOptions={selectedOptions}
                  onOptionsChange={onOptionsChange}
                  language={language}
                  enableLiveUpdates={true}
                />
              )}

              {activeView === 'analytics' && enableAnalytics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-6 h-6" />
                      <span>{language === 'ja' ? '分析ダッシュボード' : 'Analytics Dashboard'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{analyticsData.views}</div>
                        <div className="text-sm text-gray-600">
                          {language === 'ja' ? '総ビュー数' : 'Total Views'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{analyticsData.interactions}</div>
                        <div className="text-sm text-gray-600">
                          {language === 'ja' ? '相互作用' : 'Interactions'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {(analyticsData.conversionRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'ja' ? 'コンバージョン率' : 'Conversion Rate'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {analyticsData.performanceMetrics.loadTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'ja' ? '読み込み時間' : 'Load Time'}
                        </div>
                      </div>
                    </div>

                    {/* Popular Options */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        {language === 'ja' ? '人気オプション' : 'Popular Options'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analyticsData.popularOptions.map((option, index) => {
                          const optionDetails = processingOptionsConfig.find(opt => opt.id === option.id)
                          return optionDetails ? (
                            <div key={option.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <img
                                src={optionDetails.thumbnail}
                                alt={language === 'ja' ? optionDetails.nameJa : optionDetails.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {language === 'ja' ? optionDetails.nameJa : optionDetails.name}
                                </p>
                                <p className="text-xs text-gray-500">{option.count} times</p>
                              </div>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <Button
          variant="primary"
          size="icon"
          onClick={shareConfiguration}
          className="rounded-full shadow-lg"
        >
          <Share2 className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => saveConfiguration('Auto Save')}
          className="rounded-full shadow-lg bg-white"
        >
          <Bookmark className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}