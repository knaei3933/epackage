'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCw,
  Zap,
  Eye,
  Settings,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  Maximize2,
  Minimize2,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  Share2,
  Camera,
  Video,
  Image as ImageIcon,
  Grid3X3,
  Film,
  Palette,
  Move3d,
  Cpu,
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Gauge,
  Activity,
  Target,
  Sparkles,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import {
  processingOptionsConfig,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from '../shared/processingConfig'

interface RealTimePreviewEngineProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  language?: 'en' | 'ja'
  enableLiveUpdates?: boolean
}

interface PreviewState {
  isPlaying: boolean
  currentFrame: number
  totalFrames: number
  fps: number
  quality: 'low' | 'medium' | 'high' | 'ultra'
  devicePreview: 'mobile' | 'tablet' | 'desktop'
  zoomLevel: number
  rotation: { x: number; y: number; z: number }
  showGrid: boolean
  showMetrics: boolean
  autoRotate: boolean
  soundEnabled: boolean
  theme: 'light' | 'dark' | 'auto'
}

interface PerformanceMetrics {
  renderTime: number
  fps: number
  memoryUsage: number
  networkLatency: number
  cpuUsage: number
  batteryLevel?: number
}

export function RealTimePreviewEngine({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  language = 'ja',
  enableLiveUpdates = true
}: RealTimePreviewEngineProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    isPlaying: false,
    currentFrame: 0,
    totalFrames: 60,
    fps: 30,
    quality: 'high',
    devicePreview: 'desktop',
    zoomLevel: 1,
    rotation: { x: 0, y: 0, z: 0 },
    showGrid: false,
    showMetrics: false,
    autoRotate: false,
    soundEnabled: false,
    theme: 'auto'
  })

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    fps: 30,
    memoryUsage: 0,
    networkLatency: 0,
    cpuUsage: 0
  })

  const [internalSelectedOptions, setInternalSelectedOptions] = useState<string[]>(selectedOptions)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [livePreviewMode, setLivePreviewMode] = useState<'interactive' | 'animated' | 'comparison'>('interactive')
  const [realTimeUpdates, setRealTimeUpdates] = useState(enableLiveUpdates)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastFrameTime = useRef<number>(0)

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

  // Performance monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      const now = performance.now()
      const deltaTime = now - lastFrameTime.current
      lastFrameTime.current = now

      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: deltaTime,
        fps: Math.round(1000 / deltaTime),
        memoryUsage: (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
        networkLatency: Math.random() * 50 + 10, // Simulated
        cpuUsage: Math.random() * 30 + 10 // Simulated
      }))
    }

    const interval = setInterval(monitorPerformance, 1000)
    return () => clearInterval(interval)
  }, [])

  // Real-time preview update
  useEffect(() => {
    if (!realTimeUpdates) return

    const updatePreview = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return

        // Clear canvas
        const canvas = canvasRef.current!
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw base package
        drawPackage(ctx, canvas.width, canvas.height)

        // Apply selected processing options
        selectedOptionDetails.forEach(option => {
          drawProcessingEffect(ctx, option, canvas.width, canvas.height)
        })

        // Draw overlays
        if (previewState.showGrid) {
          drawGrid(ctx, canvas.width, canvas.height)
        }

        if (previewState.showMetrics) {
          drawMetrics(ctx, canvas.width, canvas.height)
        }
      }

      if (previewState.isPlaying) {
        setPreviewState(prev => ({
          ...prev,
          currentFrame: (prev.currentFrame + 1) % prev.totalFrames
        }))
      }

      animationRef.current = requestAnimationFrame(updatePreview)
    }

    updatePreview()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [selectedOptionDetails, previewState, realTimeUpdates])

  // Draw base package
  const drawPackage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Package dimensions based on device preview
    const packageWidth = previewState.devicePreview === 'mobile' ? width * 0.6 : width * 0.4
    const packageHeight = height * 0.6

    const centerX = width / 2
    const centerY = height / 2
    const x = centerX - packageWidth / 2
    const y = centerY - packageHeight / 2

    // Apply transformations
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(previewState.zoomLevel, previewState.zoomLevel)
    ctx.rotate((previewState.rotation.y * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    // Draw package base
    const gradient = ctx.createLinearGradient(x, y, x + packageWidth, y + packageHeight)
    gradient.addColorStop(0, '#3b82f6')
    gradient.addColorStop(1, '#1d4ed8')

    ctx.fillStyle = gradient
    ctx.fillRect(x, y, packageWidth, packageHeight)

    // Draw package edges
    ctx.strokeStyle = '#1e40af'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, packageWidth, packageHeight)

    // Draw package face
    const faceGradient = ctx.createLinearGradient(x + packageWidth * 0.8, y, x + packageWidth, y + packageHeight * 0.8)
    faceGradient.addColorStop(0, '#60a5fa')
    faceGradient.addColorStop(1, '#2563eb')

    ctx.fillStyle = faceGradient
    ctx.beginPath()
    ctx.moveTo(x + packageWidth, y)
    ctx.lineTo(x + packageWidth + packageWidth * 0.3, y - packageHeight * 0.1)
    ctx.lineTo(x + packageWidth + packageWidth * 0.3, y + packageHeight * 0.9)
    ctx.lineTo(x + packageWidth, y + packageHeight)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()
  }

  // Draw processing effects
  const drawProcessingEffect = (ctx: CanvasRenderingContext2D, option: ProcessingOptionConfig, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2

    ctx.save()

    // Apply animation frame offset
    const frameOffset = (previewState.currentFrame / previewState.totalFrames) * Math.PI * 2

    switch (option.category) {
      case 'opening-sealing':
        // Draw zipper/seal effects
        if (option.id.includes('zipper')) {
          ctx.strokeStyle = '#fbbf24'
          ctx.lineWidth = 3
          ctx.setLineDash([5, 5])
          ctx.lineDashOffset = frameOffset * 10
          ctx.beginPath()
          ctx.moveTo(centerX - width * 0.15, centerY - height * 0.2)
          ctx.lineTo(centerX + width * 0.15, centerY - height * 0.2)
          ctx.stroke()
          ctx.setLineDash([])
        }
        // Draw opening features (notch)
        if (option.id.includes('notch')) {
          ctx.fillStyle = '#ef4444'
          ctx.beginPath()
          ctx.arc(centerX, centerY - height * 0.2, 5, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 'surface-treatment':
        // Draw finish effects
        if (option.id.includes('glossy')) {
          const glossGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.3)
          glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
          glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = glossGradient
          ctx.fillRect(centerX - width * 0.3, centerY - height * 0.3, width * 0.6, height * 0.6)
        }
        break

      case 'shape-structure':
        // Draw display features (hang-hole)
        if (option.id.includes('hang-hole')) {
          ctx.strokeStyle = '#8b5cf6'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(centerX, centerY - height * 0.3, 8, 0, Math.PI * 2)
          ctx.stroke()
        }
        // Draw structural features (corner-round)
        if (option.id.includes('corner-round')) {
          ctx.strokeStyle = '#10b981'
          ctx.lineWidth = 4
          ctx.lineCap = 'round'
          const cornerSize = 20
          // Top-left corner
          ctx.beginPath()
          ctx.moveTo(centerX - width * 0.2 + cornerSize, centerY - height * 0.3)
          ctx.lineTo(centerX - width * 0.2, centerY - height * 0.3)
          ctx.lineTo(centerX - width * 0.2, centerY - height * 0.3 + cornerSize)
          ctx.stroke()
        }
        break

      case 'functionality':
        // Draw functionality features (e.g., tamper evident, moisture barrier indicators)
        ctx.fillStyle = '#06b6d4'
        ctx.font = '10px sans-serif'
        ctx.fillText('⚡', centerX + width * 0.1, centerY + height * 0.2)
        break
    }

    ctx.restore()
  }

  // Draw grid overlay
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1

    const gridSize = 20
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // Draw performance metrics
  const drawMetrics = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(10, 10, 200, 80)

    ctx.fillStyle = '#fff'
    ctx.font = '12px monospace'
    ctx.fillText(`FPS: ${performanceMetrics.fps}`, 20, 30)
    ctx.fillText(`Render: ${performanceMetrics.renderTime.toFixed(1)}ms`, 20, 45)
    ctx.fillText(`Memory: ${performanceMetrics.memoryUsage}MB`, 20, 60)
    ctx.fillText(`Frame: ${previewState.currentFrame}/${previewState.totalFrames}`, 20, 75)
  }

  // Control handlers
  const handlePlayPause = () => {
    setPreviewState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const handleFrameChange = (delta: number) => {
    setPreviewState(prev => ({
      ...prev,
      currentFrame: Math.max(0, Math.min(prev.totalFrames - 1, prev.currentFrame + delta))
    }))
  }

  const handleZoomChange = (delta: number) => {
    setPreviewState(prev => ({
      ...prev,
      zoomLevel: Math.max(0.5, Math.min(3, prev.zoomLevel + delta))
    }))
  }

  const handleRotationChange = (axis: 'x' | 'y' | 'z', delta: number) => {
    setPreviewState(prev => ({
      ...prev,
      rotation: {
        ...prev.rotation,
        [axis]: prev.rotation[axis] + delta
      }
    }))
  }

  const handleQualityChange = (quality: PreviewState['quality']) => {
    setPreviewState(prev => ({ ...prev, quality }))
  }

  const handleDeviceChange = (device: PreviewState['devicePreview']) => {
    setPreviewState(prev => ({ ...prev, devicePreview: device }))
  }

  const captureScreenshot = () => {
    if (canvasRef.current) {
      setIsCapturing(true)
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `preview-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
        setIsCapturing(false)
      })
    }
  }

  const recordVideo = async () => {
    if (!canvasRef.current) return

    const stream = canvasRef.current.captureStream(previewState.fps)
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    })

    const chunks: Blob[] = []
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `preview-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }

    mediaRecorder.start()

    // Record for 5 seconds
    setTimeout(() => {
      mediaRecorder.stop()
    }, 5000)
  }

  const getDeviceIcon = (device: PreviewState['devicePreview']) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'desktop': return <Monitor className="w-4 h-4" />
    }
  }

  const getQualityColor = (quality: PreviewState['quality']) => {
    switch (quality) {
      case 'low': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-blue-600'
      case 'ultra': return 'text-purple-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <MotionWrapper delay={0.1}>
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-2">
                {/* Playback Controls */}
                <div className="flex items-center space-x-1 bg-black/30 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFrameChange(-1)}
                    className="w-8 h-8 text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePlayPause}
                    className="w-8 h-8 text-white hover:bg-white/20"
                  >
                    {previewState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFrameChange(1)}
                    className="w-8 h-8 text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Frame Counter */}
                <div className="text-sm">
                  {previewState.currentFrame + 1}/{previewState.totalFrames}
                </div>

                {/* FPS Control */}
                <div className="flex items-center space-x-1">
                  <span className="text-sm">FPS:</span>
                  <select
                    value={previewState.fps}
                    onChange={(e) => setPreviewState(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                    className="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={120}>120</option>
                  </select>
                </div>
              </div>

              {/* Center Controls */}
              <div className="flex items-center space-x-4">
                {/* Quality Selector */}
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <select
                    value={previewState.quality}
                    onChange={(e) => handleQualityChange(e.target.value as PreviewState['quality'])}
                    className="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>

                {/* Device Preview */}
                <div className="flex items-center space-x-1">
                  {getDeviceIcon(previewState.devicePreview)}
                  <select
                    value={previewState.devicePreview}
                    onChange={(e) => handleDeviceChange(e.target.value as PreviewState['devicePreview'])}
                    className="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center space-x-1">
                  {previewState.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <select
                    value={previewState.theme}
                    onChange={(e) => setPreviewState(prev => ({ ...prev, theme: e.target.value as PreviewState['theme'] }))}
                    className="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                {/* Toggle Buttons */}
                <Button
                  variant={previewState.showGrid ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                  className="flex items-center space-x-1"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>

                <Button
                  variant={previewState.showMetrics ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewState(prev => ({ ...prev, showMetrics: !prev.showMetrics }))}
                  className="flex items-center space-x-1"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Metrics</span>
                </Button>

                <Button
                  variant={realTimeUpdates ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                  className="flex items-center space-x-1"
                >
                  <Wifi className="w-4 h-4" />
                  <span className="hidden sm:inline">Live</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={captureScreenshot}
                  disabled={isCapturing}
                  className="flex items-center space-x-1"
                >
                  {isCapturing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <span className="hidden sm:inline">Screenshot</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={recordVideo}
                  className="flex items-center space-x-1"
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">Record</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center space-x-1"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">Fullscreen</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>

      {/* Preview Canvas */}
      <MotionWrapper delay={0.2}>
        <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : ''} overflow-hidden`}>
          <CardContent className="p-0">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
              style={{
                imageRendering: previewState.quality === 'ultra' ? 'crisp-edges' : 'auto',
                transform: `scale(${previewState.zoomLevel})`
              }}
            />
          </CardContent>
        </Card>
      </MotionWrapper>

      {/* Performance Dashboard */}
      <MotionWrapper delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{performanceMetrics.fps}</div>
                <div className="text-sm text-gray-600">FPS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performanceMetrics.renderTime.toFixed(1)}ms</div>
                <div className="text-sm text-gray-600">Render Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{performanceMetrics.memoryUsage}MB</div>
                <div className="text-sm text-gray-600">Memory</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{performanceMetrics.networkLatency.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Latency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{performanceMetrics.cpuUsage.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">CPU Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>

      {/* Processing Impact Summary */}
      <MotionWrapper delay={0.4}>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {language === 'ja' ? '処理影響' : 'Processing Impact'}
                  </span>
                </div>
                <Badge className="bg-blue-600 text-white">
                  x{processingImpact.multiplier.toFixed(2)}
                </Badge>
                <Badge variant="outline">
                  {language === 'ja' ? processingImpact.processingTimeJa : processingImpact.processingTime}
                </Badge>
                <Badge variant="outline">
                  Min: {processingImpact.minimumQuantity.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {processingImpact.features.length} features
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>
    </div>
  )
}