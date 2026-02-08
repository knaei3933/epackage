'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const useAnimation = dynamic(() => import('framer-motion').then(mod => ({ default: mod.useAnimation })), { ssr: false })
import {
  Sparkles,
  Trophy,
  Target,
  Zap,
  Clock,
  Star,
  Heart,
  Gift,
  Award,
  TrendingUp,
  Users,
  MessageCircle,
  ThumbsUp,
  AlertCircle,
  Info,
  CheckCircle,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Globe,
  Languages,
  Accessibility,
  Keyboard,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Cpu,
  HardDrive,
  Zap as Bolt,
  Flame,
  Diamond,
  Crown,
  Gem,
  Medal,
  Flag,
  MapPin,
  Compass,
  Navigation,
  Route,
  Layers,
  Grid3X3,
  List,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Download,
  Share2,
  Bookmark,
  BookmarkPlus,
  RefreshCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  Fullscreen,
  Move,
  Move3d,
  MoveDiagonal,
  Expand,
  Shrink,
  Plus,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

interface UserExperienceEnhancementsProps {
  selectedOptions: string[]
  language?: 'en' | 'ja'
  onOptionsChange?: (options: string[]) => void
  enableTooltips?: boolean
  enableNotifications?: boolean
  enableAccessibility?: boolean
  enableGamification?: boolean
  enableGuidance?: boolean
  enableCollaboration?: boolean
}

interface TooltipData {
  id: string
  title: string
  titleJa: string
  content: string
  contentJa: string
  position: 'top' | 'bottom' | 'left' | 'right'
  type: 'info' | 'warning' | 'success' | 'help'
}

interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  titleJa: string
  message: string
  messageJa: string
  timestamp: number
  read: boolean
  actions?: Array<{
    label: string
    labelJa: string
    action: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }>
}

interface Achievement {
  id: string
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  icon: React.ReactNode
  points: number
  unlocked: boolean
  unlockedAt?: number
  category: 'exploration' | 'customization' | 'sharing' | 'collaboration' | 'expertise'
}

interface GuideStep {
  id: string
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  target: string // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'scroll' | 'input'
  skipable: boolean
}

interface UserPreference {
  theme: 'light' | 'dark' | 'auto'
  language: 'en' | 'ja'
  notifications: boolean
  sounds: boolean
  animations: boolean
  autoSave: boolean
  keyboardShortcuts: boolean
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  voiceCommands: boolean
}

export function UserExperienceEnhancements({
  selectedOptions,
  language = 'ja',
  onOptionsChange,
  enableTooltips = true,
  enableNotifications = true,
  enableAccessibility = true,
  enableGamification = true,
  enableGuidance = true,
  enableCollaboration = false
}: UserExperienceEnhancementsProps) {
  const [tooltips, setTooltips] = useState<TooltipData[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [showGuide, setShowGuide] = useState(false)
  const [currentGuideStep, setCurrentGuideStep] = useState(0)
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    theme: 'auto',
    language,
    notifications: true,
    sounds: true,
    animations: true,
    autoSave: true,
    keyboardShortcuts: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    voiceCommands: false
  })

  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false)
  const [showHelpCenter, setShowHelpCenter] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [voiceCommandActive, setVoiceCommandActive] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize achievements
  useEffect(() => {
    const initialAchievements: Achievement[] = [
      {
        id: 'first_selection',
        title: 'First Selection',
        titleJa: '最初の選択',
        description: 'Make your first processing option selection',
        descriptionJa: '最初の後加工オプションを選択する',
        icon: <Star className="w-6 h-6" />,
        points: 10,
        unlocked: false,
        category: 'exploration'
      },
      {
        id: 'customizer',
        title: 'Customizer',
        titleJa: 'カスタマイザー',
        description: 'Select 5 or more processing options',
        descriptionJa: '5つ以上の後加工オプションを選択する',
        icon: <Settings className="w-6 h-6" />,
        points: 25,
        unlocked: false,
        category: 'customization'
      },
      {
        id: 'sharer',
        title: 'Sharer',
        titleJa: 'シェアラー',
        description: 'Share your configuration with others',
        descriptionJa: '設定を他の人と共有する',
        icon: <Share2 className="w-6 h-6" />,
        points: 15,
        unlocked: false,
        category: 'sharing'
      },
      {
        id: 'expert',
        title: 'Expert',
        titleJa: 'エキスパート',
        description: 'Explore all processing categories',
        descriptionJa: 'すべての後加工カテゴリを探索する',
        icon: <Trophy className="w-6 h-6" />,
        points: 50,
        unlocked: false,
        category: 'expertise'
      },
      {
        id: 'premium',
        title: 'Premium User',
        titleJa: 'プレミアムユーザー',
        description: 'Unlock premium features and reach level 5',
        descriptionJa: 'プレミアム機能をアンロックし、レベル5に到達する',
        icon: <Crown className="w-6 h-6" />,
        points: 100,
        unlocked: false,
        category: 'expertise'
      }
    ]
    setAchievements(initialAchievements)
  }, [])

  // Check for achievements
  useEffect(() => {
    if (!enableGamification) return

    const updatedAchievements = [...achievements]
    let pointsAwarded = 0

    // Check first selection achievement
    if (selectedOptions.length > 0) {
      const firstSelection = updatedAchievements.find(a => a.id === 'first_selection')
      if (firstSelection && !firstSelection.unlocked) {
        firstSelection.unlocked = true
        firstSelection.unlockedAt = Date.now()
        pointsAwarded += firstSelection.points
        addNotification('success', 'achievement', firstSelection)
      }
    }

    // Check customizer achievement
    if (selectedOptions.length >= 5) {
      const customizer = updatedAchievements.find(a => a.id === 'customizer')
      if (customizer && !customizer.unlocked) {
        customizer.unlocked = true
        customizer.unlockedAt = Date.now()
        pointsAwarded += customizer.points
        addNotification('success', 'achievement', customizer)
      }
    }

    setAchievements(updatedAchievements)
    setUserPoints(prev => prev + pointsAwarded)

    // Update user level based on points
    const newLevel = Math.floor(userPoints / 100) + 1
    if (newLevel > userLevel) {
      setUserLevel(newLevel)
      addNotification('success', 'level_up', { newLevel, points: userPoints })
    }
  }, [selectedOptions, achievements, userPoints, userLevel, enableGamification])

  // Add notification
  const addNotification = useCallback((
    type: NotificationItem['type'],
    category: 'achievement' | 'level_up' | 'tip' | 'system',
    data: any
  ) => {
    if (!enableNotifications) return

    let notification: NotificationItem

    switch (category) {
      case 'achievement':
        notification = {
          id: `achievement_${data.id}_${Date.now()}`,
          type: 'success',
          title: language === 'ja' ? '実績解除！' : 'Achievement Unlocked!',
          titleJa: '実績解除！',
          message: language === 'ja'
            ? `${data.titleJa} - ${data.points}ポイント獲得`
            : `${data.title} - ${data.points} points earned`,
          messageJa: `${data.titleJa} - ${data.points}ポイント獲得`,
          timestamp: Date.now(),
          read: false
        }
        break

      case 'level_up':
        notification = {
          id: `level_up_${Date.now()}`,
          type: 'success',
          title: language === 'ja' ? 'レベルアップ！' : 'Level Up!',
          titleJa: 'レベルアップ！',
          message: language === 'ja'
            ? `レベル ${data.newLevel} に到達！`
            : `Reached level ${data.newLevel}!`,
          messageJa: `レベル ${data.newLevel} に到達！`,
          timestamp: Date.now(),
          read: false
        }
        break

      case 'tip':
        notification = {
          id: `tip_${Date.now()}`,
          type: 'info',
          title: language === 'ja' ? 'ヒント' : 'Pro Tip',
          titleJa: 'ヒント',
          message: data.message,
          messageJa: data.messageJa,
          timestamp: Date.now(),
          read: false
        }
        break

      case 'system':
        notification = {
          id: `system_${Date.now()}`,
          type: data.type,
          title: data.title,
          titleJa: data.titleJa,
          message: data.message,
          messageJa: data.messageJa,
          timestamp: Date.now(),
          read: false
        }
        break

      default:
        return
    }

    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
  }, [enableNotifications, language])

  // Keyboard shortcuts
  useEffect(() => {
    if (!userPreferences.keyboardShortcuts) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Search/Filter
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // Focus search input
      }

      // Ctrl/Cmd + S: Save configuration
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // Save configuration
      }

      // Ctrl/Cmd + Shift + S: Share configuration
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        // Share configuration
      }

      // Esc: Close modals/clear selection
      if (e.key === 'Escape') {
        // Close any open modals
      }

      // Arrow keys: Navigate options
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Navigate through options
      }

      // Space: Play/pause animations
      if (e.key === ' ' && e.target && !(e.target as Element).matches('input, textarea')) {
        e.preventDefault()
        // Toggle animation
      }

      // F11: Toggle fullscreen
      if (e.key === 'F11') {
        e.preventDefault()
        // Toggle fullscreen
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [userPreferences.keyboardShortcuts])

  // Voice commands
  const startVoiceCommands = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addNotification('warning', 'system', {
        title: 'Voice Commands Not Supported',
        titleJa: '音声コマンドはサポートされていません',
        message: 'Your browser does not support voice recognition',
        messageJa: 'お使いのブラウザは音声認識をサポートしていません'
      })
      return
    }

    setVoiceCommandActive(true)
    // Initialize speech recognition
  }, [addNotification])

  // Mark notification as read
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Get level progress
  const getLevelProgress = useCallback(() => {
    const currentLevelPoints = (userLevel - 1) * 100
    const nextLevelPoints = userLevel * 100
    const progress = ((userPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
    return Math.min(progress, 100)
  }, [userPoints, userLevel])

  // Get achievement progress
  const getAchievementProgress = useCallback(() => {
    const unlockedCount = achievements.filter(a => a.unlocked).length
    const totalCount = achievements.length
    return { unlocked: unlockedCount, total: totalCount, progress: (unlockedCount / totalCount) * 100 }
  }, [achievements])

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Gamification Dashboard */}
      {enableGamification && (
        <MotionWrapper delay={0.1}>
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  <span>{language === 'ja' ? '実績と進行状況' : 'Achievements & Progress'}</span>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                  Level {userLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Level Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? 'レベル {userLevel}' : 'Level {userLevel}'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {userPoints} / {userLevel * 100} {language === 'ja' ? 'ポイント' : 'points'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getLevelProgress()}%` }}
                    />
                  </div>
                </div>

                {/* Achievement Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {getAchievementProgress().unlocked}
                    </div>
                    <div className="text-xs text-gray-600">
                      {language === 'ja' ? '解除済み' : 'Unlocked'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {getAchievementProgress().total}
                    </div>
                    <div className="text-xs text-gray-600">
                      {language === 'ja' ? '総実績' : 'Total'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(getAchievementProgress().progress)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {language === 'ja' ? '進行状況' : 'Progress'}
                    </div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {language === 'ja' ? '最近の実績' : 'Recent Achievements'}
                  </h4>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {achievements
                      .filter(a => a.unlocked)
                      .slice(0, 5)
                      .map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex-shrink-0 bg-white rounded-lg p-3 border border-gray-200 min-w-[120px] text-center"
                        >
                          <div className="flex justify-center mb-1">
                            {achievement.icon}
                          </div>
                          <p className="text-xs font-medium text-gray-900">
                            {language === 'ja' ? achievement.titleJa : achievement.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {achievement.points} {language === 'ja' ? 'ポイント' : 'points'}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}

      {/* Interactive Guide */}
      {enableGuidance && (
        <MotionWrapper delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <span>{language === 'ja' ? 'インタラクティブガイド' : 'Interactive Guide'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuide(!showGuide)}
                >
                  {showGuide ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        {language === 'ja' ? 'ようこそ！' : 'Welcome!'}
                      </h4>
                      <p className="text-sm text-blue-800">
                        {language === 'ja'
                          ? '後加工オプションの選択を始めましょう。以下のステップに従ってください。'
                          : 'Let\'s get started with selecting your processing options. Follow these steps:'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {language === 'ja' ? '製品タイプを選択' : 'Select Product Type'}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {language === 'ja'
                              ? 'パッケージの種類を選択してください'
                              : 'Choose your package type'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {language === 'ja' ? '後加工オプションを探索' : 'Explore Processing Options'}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {language === 'ja'
                              ? '利用可能なオプションをブラウズし、プレビューで確認'
                              : 'Browse available options and preview them'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {language === 'ja' ? 'カスタマイズ' : 'Customize'}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {language === 'ja'
                              ? '複数のオプションを組み合わせて完璧な仕上げを作成'
                              : 'Combine multiple options for the perfect finish'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          4
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {language === 'ja' ? '価格を確認' : 'Check Pricing'}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {language === 'ja'
                              ? 'リアルタイムで価格と納期を確認'
                              : 'See real-time pricing and delivery times'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3 pt-4">
                      <Button variant="primary" onClick={() => setShowGuide(false)}>
                        {language === 'ja' ? '始める' : 'Get Started'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowHelpCenter(true)}>
                        <HelpCircle className="w-4 h-4 mr-2" />
                        {language === 'ja' ? 'ヘルプセンター' : 'Help Center'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </MotionWrapper>
      )}

      {/* Accessibility Features */}
      {enableAccessibility && (
        <MotionWrapper delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Accessibility className="w-5 h-5 text-green-600" />
                  <span>{language === 'ja' ? 'アクセシビリティ' : 'Accessibility'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAccessibilityMode(!isAccessibilityMode)}
                >
                  {isAccessibilityMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? '大きなテキスト' : 'Large Text'}
                    </label>
                    <Button
                      variant={userPreferences.largeText ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setUserPreferences(prev => ({ ...prev, largeText: !prev.largeText }))}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === 'ja' ? 'テキストサイズを拡大' : 'Increase text size'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? 'ハイコントラスト' : 'High Contrast'}
                    </label>
                    <Button
                      variant={userPreferences.highContrast ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setUserPreferences(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                    >
                      <Sun className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === 'ja' ? 'コントラストを向上' : 'Improve contrast'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? 'アニメーションを減らす' : 'Reduce Motion'}
                    </label>
                    <Button
                      variant={userPreferences.reducedMotion ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setUserPreferences(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))}
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === 'ja' ? 'アニメーションを削減' : 'Reduce animations'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? 'スクリーンリーダー' : 'Screen Reader'}
                    </label>
                    <Button
                      variant={userPreferences.screenReader ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setUserPreferences(prev => ({ ...prev, screenReader: !prev.screenReader }))}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === 'ja' ? '音声読み上げを有効化' : 'Enable screen reader'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? '音声コマンド' : 'Voice Commands'}
                    </label>
                    <Button
                      variant={voiceCommandActive ? 'primary' : 'outline'}
                      size="sm"
                      onClick={voiceCommandActive ? () => setVoiceCommandActive(false) : startVoiceCommands}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === 'ja' ? '音声で操作' : 'Control with voice'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? 'キーボードショートカット' : 'Keyboard Shortcuts'}
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                    >
                      <Keyboard className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {language === 'ja' ? 'ショートカットを表示' : 'Show shortcuts'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}

      {/* Notification Center */}
      {enableNotifications && (
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-20 right-4 w-80 max-h-96 overflow-hidden bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {language === 'ja' ? '通知' : 'Notifications'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearNotifications}
                    >
                      {language === 'ja' ? 'すべてクリア' : 'Clear All'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <BellOff className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      {language === 'ja' ? '新しい通知はありません' : 'No new notifications'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border ${
                          notification.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900">
                              {language === 'ja' ? notification.titleJa : notification.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {language === 'ja' ? notification.messageJa : notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <Button
          variant="primary"
          size="icon"
          onClick={() => setShowNotifications(true)}
          className="rounded-full shadow-lg relative"
        >
          <Bell className="w-5 h-5" />
          {notifications.filter(n => !n.read).length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </Button>

        {enableGuidance && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowGuide(!showGuide)}
            className="rounded-full shadow-lg bg-white"
          >
            <Compass className="w-5 h-5" />
          </Button>
        )}

        {enableAccessibility && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAccessibilityMode(!isAccessibilityMode)}
            className="rounded-full shadow-lg bg-white"
          >
            <Accessibility className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}