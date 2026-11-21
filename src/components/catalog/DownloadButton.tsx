'use client'

import React, { useState, useEffect } from 'react'
import { Download, FileText, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Template {
  filename: string
  displayName: string
  downloadUrl: string
  fileType: string
}

interface DownloadButtonProps {
  productCategory: string
  className?: string
  size?: 'sm' | 'md'
  showText?: boolean
}

interface DownloadState {
  loading: boolean
  error: string | null
  success: boolean
  progress: number
}

export function DownloadButton({
  productCategory,
  className,
  size = 'sm',
  showText = true
}: DownloadButtonProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [downloadState, setDownloadState] = useState<DownloadState>({
    loading: false,
    error: null,
    success: false,
    progress: 0
  })
  const [showTemplateList, setShowTemplateList] = useState(false)

  // Fetch available templates for the product category
  useEffect(() => {
    if (productCategory) {
      fetchTemplates()
    }
  }, [productCategory])

  const fetchTemplates = async () => {
    try {
      setDownloadState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch(`/api/download/templates/${productCategory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Handle 404 gracefully - categories without templates return empty array
      if (response.status === 404) {
        setTemplates([])
        return
      }

      if (!response.ok) {
        throw new Error('テンプレートの取得に失敗しました')
      }

      const data = await response.json()

      if (data.success && data.templates) {
        setTemplates(data.templates)
      } else {
        setTemplates([])
      }
    } catch (error) {
      // Silently handle errors - no console error for missing templates
      setTemplates([])
    } finally {
      setDownloadState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleDownload = async (template: Template) => {
    try {
      setDownloadState(prev => ({ ...prev, loading: true, error: null, progress: 0 }))

      // Create download link
      const link = document.createElement('a')
      link.href = template.downloadUrl
      link.download = template.filename
      link.style.display = 'none'

      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 90)
        }))
      }, 100)

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clear progress interval and show success
      setTimeout(() => {
        clearInterval(progressInterval)
        setDownloadState(prev => ({ ...prev, progress: 100, success: true }))

        // Reset success state after 2 seconds
        setTimeout(() => {
          setDownloadState(prev => ({ ...prev, success: false, progress: 0 }))
        }, 2000)
      }, 500)

    } catch (error) {
      console.error('Download failed:', error)
      setDownloadState(prev => ({
        ...prev,
        error: 'ダウンロードに失敗しました。もう一度お試しください。',
        loading: false,
        progress: 0
      }))
    } finally {
      // Reset loading state
      setTimeout(() => {
        setDownloadState(prev => ({ ...prev, loading: false }))
      }, 1000)
    }
  }

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'AI':
        return <FileText className="w-4 h-4" />
      case 'PDF':
        return <FileText className="w-4 h-4" />
      case 'EPS':
        return <FileText className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  // If no templates available, show disabled button
  if (templates.length === 0 && !downloadState.loading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn(
          "border-border-medium text-text-muted cursor-not-allowed",
          className
        )}
      >
        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
        {showText && <span className="text-sm">テンプレート</span>}
      </Button>
    )
  }

  // If only one template, show direct download button
  if (templates.length === 1) {
    const template = templates[0]

    return (
      <Button
        variant="outline"
        size={size}
        className={cn(
          "border-border-strong text-text-secondary hover:border-brand hover:text-brand hover:bg-success-muted relative",
          className
        )}
        onClick={() => handleDownload(template)}
        disabled={downloadState.loading}
      >
        {downloadState.loading ? (
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
        ) : downloadState.success ? (
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
        ) : (
          getFileIcon(template.fileType)
        )}

        {showText && (
          <span className="text-sm">
            {downloadState.loading ? 'ダウンロード中' :
             downloadState.success ? '完了' :
             template.fileType}
          </span>
        )}

        {/* Progress indicator */}
        {downloadState.loading && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-bg-muted overflow-hidden">
            <div
              className="h-full bg-brand transition-colors"
              style={{ width: `${downloadState.progress}%` }}
            />
          </div>
        )}
      </Button>
    )
  }

  // If multiple templates, show dropdown
  return (
    <div className="relative min-w-0">
      <Button
        variant="outline"
        size={size}
        className={cn(
          "border-border-strong text-text-secondary hover:border-brand hover:text-brand hover:bg-success-muted relative",
          className
        )}
        onClick={() => setShowTemplateList(!showTemplateList)}
        disabled={downloadState.loading}
      >
        {downloadState.loading ? (
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
        ) : downloadState.success ? (
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
        ) : (
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
        )}

        {showText && (
          <span className="text-sm">
            {downloadState.loading ? 'ダウンロード中' :
             downloadState.success ? '完了' :
             'テンプレート'}
          </span>
        )}

        {/* Progress indicator */}
        {downloadState.loading && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-bg-muted overflow-hidden">
            <div
              className="h-full bg-brand transition-colors"
              style={{ width: `${downloadState.progress}%` }}
            />
          </div>
        )}
      </Button>

      {/* Template dropdown */}
      {showTemplateList && (
        <div className="absolute bottom-full mb-2 right-0 z-50 bg-bg-primary border border-border-medium rounded-container p-2 min-w-[200px]">
          <div className="text-xs font-medium text-text-secondary px-2 py-1 border-b border-border-medium">
            デザインテンプレート
          </div>
          {templates.map((template) => (
            <button
              key={template.filename}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary hover:bg-success-muted rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleDownload(template)
                setShowTemplateList(false)
              }}
              disabled={downloadState.loading}
            >
              {getFileIcon(template.fileType)}
              <div className="flex-1 text-left">
                <div className="font-medium">{template.displayName}</div>
                <div className="text-text-muted">{template.fileType} ファイル</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showTemplateList && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTemplateList(false)}
        />
      )}
    </div>
  )
}