/**
 * Enhanced File Upload Component
 *
 * 拡張ファイルアップロードコンポーネント
 * - AIファイルは必須
 * - その他のファイル（PNG、PSD、JPGなど）は追加で提出可能
 *
 * @client
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Upload,
  X,
  AlertCircle,
  Check,
  FileText,
  Image as ImageIcon,
  FileIcon,
  Plus,
  Trash2,
} from 'lucide-react'

// ============================================================
// Types
// ============================================================

export interface UploadedFile {
  id: string
  file: File
  type: 'required' | 'optional'
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  url?: string
}

interface EnhancedFileUploadProps {
  onFilesChange?: (requiredFile: File | null, optionalFiles: File[]) => void
  onUploadComplete?: (results: { required: UploadedFile | null; optional: UploadedFile[] }) => void
  maxOptionalFiles?: number
  maxFileSize?: number // bytes
  readOnly?: boolean
  className?: string
}

// ============================================================
// Constants
// ============================================================

const REQUIRED_FILE_TYPES = ['.ai']
const OPTIONAL_FILE_TYPES = ['.png', '.jpg', '.jpeg', '.psd', '.pdf', '.svg', '.eps']
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024 // 50MB
const DEFAULT_MAX_OPTIONAL = 10

// ============================================================
// Helper Functions
// ============================================================

function getFileCategory(fileName: string): 'required' | 'optional' | 'invalid' {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  if (REQUIRED_FILE_TYPES.includes(ext)) return 'required'
  if (OPTIONAL_FILE_TYPES.includes(ext)) return 'optional'
  return 'invalid'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ============================================================
// Component
// ============================================================

export function EnhancedFileUpload({
  onFilesChange,
  onUploadComplete,
  maxOptionalFiles = DEFAULT_MAX_OPTIONAL,
  maxFileSize = DEFAULT_MAX_SIZE,
  readOnly = false,
  className = '',
}: EnhancedFileUploadProps) {
  const requiredFileInputRef = useRef<HTMLInputElement>(null)
  const optionalFileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [requiredFile, setRequiredFile] = useState<UploadedFile | null>(null)
  const [optionalFiles, setOptionalFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // ============================================================
  // Handlers
  // ============================================================

  const handleRequiredFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      const category = getFileCategory(file.name)

      // Validate
      if (category !== 'required') {
        alert('AIファイル（.ai）のみアップロードできます')
        return
      }

      if (file.size > maxFileSize) {
        alert(`ファイルサイズが大きすぎます（最大 ${formatFileSize(maxFileSize)}）`)
        return
      }

      // Create uploaded file record
      const uploadedFile: UploadedFile = {
        id: `required-${Date.now()}`,
        file,
        type: 'required',
        status: 'pending',
      }

      setRequiredFile(uploadedFile)
      onFilesChange?.(file, optionalFiles.map((f) => f.file))

      // Auto-upload
      await uploadFile(uploadedFile)
    },
    [requiredFile, optionalFiles, maxFileSize, onFilesChange]
  )

  const handleOptionalFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const newFiles: UploadedFile[] = []

      for (const file of Array.from(files)) {
        // Check limit
        if (optionalFiles.length + newFiles.length >= maxOptionalFiles) {
          alert(`追加ファイルは最大${maxOptionalFiles}個までです`)
          break
        }

        const category = getFileCategory(file.name)

        // Validate
        if (category === 'required') {
          alert('AIファイルは必須ファイルとしてアップロードしてください')
          continue
        }

        if (category === 'invalid') {
          alert(`対応していないファイル形式です: ${file.name}`)
          continue
        }

        if (file.size > maxFileSize) {
          alert(`${file.name}: ファイルサイズが大きすぎます`)
          continue
        }

        const uploadedFile: UploadedFile = {
          id: `optional-${Date.now()}-${Math.random()}`,
          file,
          type: 'optional',
          status: 'pending',
        }

        newFiles.push(uploadedFile)
      }

      if (newFiles.length > 0) {
        setOptionalFiles((prev) => {
          const updated = [...prev, ...newFiles]
          onFilesChange?.(
            requiredFile?.file || null,
            updated.map((f) => f.file)
          )
          return updated
        })

        // Auto-upload all new files
        for (const uploadedFile of newFiles) {
          await uploadFile(uploadedFile)
        }
      }
    },
    [optionalFiles, maxOptionalFiles, maxFileSize, requiredFile, onFilesChange]
  )

  const uploadFile = async (uploadedFile: UploadedFile) => {
    uploadedFile.status = 'uploading'

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile.file)
      formData.append('file_type', uploadedFile.type === 'required' ? 'ai' : 'other')
      formData.append('data_type', uploadedFile.type === 'required' ? 'design' : 'reference')

      const response = await fetch('/api/b2b/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'アップロードに失敗しました')
      }

      const data = await response.json()

      if (data.success && data.data) {
        uploadedFile.status = 'completed'
        uploadedFile.url = data.data.downloadUrl

        // Check if all files are uploaded
        const allRequiredUploaded = requiredFile?.status === 'completed'
        const allOptionalUploaded = optionalFiles.every((f) => f.status === 'completed')

        if (allRequiredUploaded && allOptionalUploaded) {
          onUploadComplete?.({
            required: requiredFile,
            optional: optionalFiles,
          })
        }
      } else {
        throw new Error('アップロードに失敗しました')
      }
    } catch (err) {
      uploadedFile.status = 'error'
      uploadedFile.error = err instanceof Error ? err.message : 'アップロードエラー'
    }

    // Force re-render
    setRequiredFile((prev) => prev ? { ...prev } : null)
    setOptionalFiles((prev) => [...prev])
  }

  const removeRequiredFile = useCallback(() => {
    if (readOnly) return
    setRequiredFile(null)
    if (requiredFileInputRef.current) {
      requiredFileInputRef.current.value = ''
    }
    onFilesChange?.(null, optionalFiles.map((f) => f.file))
  }, [readOnly, optionalFiles, onFilesChange])

  const removeOptionalFile = useCallback(
    (id: string) => {
      if (readOnly) return
      setOptionalFiles((prev) => {
        const updated = prev.filter((f) => f.id !== id)
        onFilesChange?.(requiredFile?.file || null, updated.map((f) => f.file))
        return updated
      })
    },
    [readOnly, requiredFile, onFilesChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, type: 'required' | 'optional') => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer.files
      if (type === 'required') {
        handleRequiredFileSelect(files)
      } else {
        handleOptionalFileSelect(files)
      }
    },
    [handleRequiredFileSelect, handleOptionalFileSelect]
  )

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Required AI File Section */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              デザインデータ（必須）
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Adobe Illustrator (.ai) 形式のデザインファイル
            </p>
          </div>
          {requiredFile?.status === 'completed' && (
            <Check className="w-6 h-6 text-green-600" />
          )}
        </div>

        {/* Required File Upload Area */}
        {!requiredFile ? (
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'required')}
            onClick={() => requiredFileInputRef.current?.click()}
            className="border-2 border-dashed border-red-300 hover:border-red-500 hover:bg-red-50 rounded-lg p-8 text-center cursor-pointer transition-colors"
          >
            <input
              ref={requiredFileInputRef}
              type="file"
              accept=".ai"
              onChange={(e) => handleRequiredFileSelect(e.target.files)}
              className="hidden"
              disabled={readOnly}
            />
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              AIファイルをドラッグ&ドロップまたはクリック
            </p>
            <p className="text-xs text-gray-500 mt-1">
              最大サイズ: {formatFileSize(maxFileSize)}
            </p>
          </div>
        ) : (
          <UploadedFileCard
            file={requiredFile}
            onRemove={removeRequiredFile}
            readOnly={readOnly}
          />
        )}
      </Card>

      {/* Optional Files Section */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              参考ファイル（任意）
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              参考用の画像やドキュメント（PNG, JPG, PSD, PDFなど）
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {optionalFiles.length} / {maxOptionalFiles}
          </div>
        </div>

        {/* Optional File Upload Area */}
        {optionalFiles.length < maxOptionalFiles && (
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'optional')}
            onClick={() => optionalFileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-6 text-center cursor-pointer transition-colors mb-4"
          >
            <input
              ref={optionalFileInputRef}
              type="file"
              accept={OPTIONAL_FILE_TYPES.join(',')}
              multiple
              onChange={(e) => handleOptionalFileSelect(e.target.files)}
              className="hidden"
              disabled={readOnly}
            />
            <Plus className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">
              参考ファイルを追加
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ドラッグ&ドロップまたは複数選択可能
            </p>
          </div>
        )}

        {/* Uploaded Optional Files List */}
        <div className="space-y-2">
          {optionalFiles.map((file) => (
            <UploadedFileCard
              key={file.id}
              file={file}
              onRemove={() => removeOptionalFile(file.id)}
              readOnly={readOnly}
            />
          ))}
        </div>

        {optionalFiles.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            参考ファイルはまだアップロードされていません
          </div>
        )}
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">アップロード中...</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

interface UploadedFileCardProps {
  file: UploadedFile
  onRemove: () => void
  readOnly?: boolean
}

function UploadedFileCard({ file, onRemove, readOnly }: UploadedFileCardProps) {
  const getFileIcon = () => {
    const ext = file.file.name.substring(file.file.name.lastIndexOf('.')).toLowerCase()
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      return <ImageIcon className="w-5 h-5" />
    }
    if (ext === '.ai') {
      return <FileText className="w-5 h-5" />
    }
    return <FileIcon className="w-5 h-5" />
  }

  const getStatusBadge = () => {
    switch (file.status) {
      case 'uploading':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
            アップロード中
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            完了
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            エラー
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
            待機中
          </span>
        )
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${file.status === 'error' ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className={`p-2 rounded ${file.type === 'required' ? 'bg-red-100' : 'bg-blue-100'}`}>
            {getFileIcon()}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
              {getStatusBadge()}
            </div>
            {file.error && (
              <p className="text-xs text-red-600 mt-1">{file.error}</p>
            )}
          </div>
        </div>

        {/* Remove Button */}
        {!readOnly && (
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Export default
// ============================================================

export default EnhancedFileUpload
