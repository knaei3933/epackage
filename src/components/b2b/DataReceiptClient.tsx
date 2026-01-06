/**
 * B2B Data Receipt Client Component
 *
 * B2Bデータ入荷クライアントコンポーネント
 * Handles file upload, AI extraction, and data editing
 *
 * @client
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { Order } from '@/types/database'
import type {
  ExtractedProductData,
  ExtractionStatus,
  AIExtractionValidationResult,
  ExtractionError,
  FileUploadResponse,
  ExtractionStatusResponse,
} from '@/types/ai-extraction'

// ============================================================
// Props
// ============================================================

interface DataReceiptClientProps {
  order: Order
  canUploadData: boolean
}

// ============================================================
// Main Component
// ============================================================

export function DataReceiptClient({ order, canUploadData }: DataReceiptClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>('pending')
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedProductData | null>(null)
  const [validationResult, setValidationResult] = useState<AIExtractionValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<ExtractedProductData | null>(null)

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type (.ai files)
    if (!file.name.endsWith('.ai')) {
      setError('.aiファイルのみアップロードできます')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('ファイルサイズは50MB以下にしてください')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Auto-start upload
    uploadFile(file)
  }, [])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  // Upload file and start extraction
  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setExtractionStatus('processing')
    setExtractionProgress(0)
    setCurrentStep('ファイルをアップロード中...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('order_id', order.id)
      formData.append('data_type', 'design_file')

      // Upload file
      const uploadResponse = await fetch('/api/b2b/ai-extraction/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error?.message || 'ファイルのアップロードに失敗しました')
      }

      const uploadData: FileUploadResponse = await uploadResponse.json()

      if (!uploadData.success || !uploadData.data) {
        throw new Error('ファイルのアップロードに失敗しました')
      }

      setIsUploading(false)
      setCurrentStep('AI抽出を開始...')

      // Start polling extraction status
      pollExtractionStatus(uploadData.data.file_id)
    } catch (err) {
      setIsUploading(false)
      setExtractionStatus('failed')
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    }
  }

  // Poll extraction status
  const pollExtractionStatus = async (fileId: string) => {
    setIsExtracting(true)
    const maxAttempts = 120 // 2 minutes with 1-second intervals
    let attempts = 0

    const poll = async () => {
      attempts++

      try {
        const response = await fetch(`/api/b2b/ai-extraction/status?file_id=${fileId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('ステータスの取得に失敗しました')
        }

        const data: ExtractionStatusResponse = await response.json()

        if (data.data) {
          const { status, progress, current_step, extracted_data, validation_errors, warnings } = data.data

          setExtractionStatus(status)
          setExtractionProgress(progress || 0)
          setCurrentStep(current_step || '')

          if (status === 'completed' && extracted_data) {
            setIsExtracting(false)
            setExtractedData(extracted_data)
            setEditedData(extracted_data)

            // Set validation result
            if (validation_errors || warnings) {
              setValidationResult({
                status: warnings?.length ? 'needs_revision' : 'valid',
                confidence: {
                  overall: 0.85, // Default confidence
                  fields: {},
                  method_confidence: 0.85,
                },
                missing_fields: [],
                errors: validation_errors || [],
                warnings: warnings || [],
                suggestions: [],
              })
            }

            return
          }

          if (status === 'failed') {
            setIsExtracting(false)
            setError('データの抽出に失敗しました')
            return
          }

          // Continue polling if not complete
          if (attempts < maxAttempts && (status === 'pending' || status === 'processing')) {
            setTimeout(poll, 1000)
          } else if (attempts >= maxAttempts) {
            setIsExtracting(false)
            setError('処理がタイムアウトしました')
          }
        }
      } catch (err) {
        setIsExtracting(false)
        setError(err instanceof Error ? err.message : 'ステータスの取得に失敗しました')
      }
    }

    poll()
  }

  // Handle manual data edit
  const handleEditData = () => {
    setIsEditing(true)
  }

  // Save edited data
  const handleSaveEdits = async () => {
    if (!editedData) return

    setIsEditing(false)

    // Submit validated data
    await submitData(editedData)
  }

  // Cancel edits
  const handleCancelEdits = () => {
    setIsEditing(false)
    setEditedData(extractedData)
  }

  // Submit extracted/edited data for production
  const submitData = async (data: ExtractedProductData) => {
    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/b2b/ai-extraction/approve', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: order.id, // Using order ID as reference
          approved_data: data,
          create_work_order: true,
          notes: validationResult?.warnings.map(w => w.message).join('; ') || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'データの送信に失敗しました')
      }

      // Redirect to order detail page
      router.push(`/member/orders/${order.id}`)
      router.refresh()
    } catch (err) {
      setIsUploading(false)
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    }
  }

  // Re-upload file
  const handleReupload = () => {
    setSelectedFile(null)
    setExtractedData(null)
    setValidationResult(null)
    setError(null)
    setExtractionStatus('pending')
    setExtractionProgress(0)
    setCurrentStep('')
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-red-600 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                エラーが発生しました
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Area - Show if no data extracted yet */}
      {!extractedData && (
        <Card className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              デザインデータをアップロード
            </h2>
            <p className="text-gray-600">
              Adobe Illustrator (.ai)ファイルをドラッグ&ドロップまたはクリックしてアップロード
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isUploading || isExtracting
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ai"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading || isExtracting}
            />

            {isUploading || isExtracting ? (
              <ProcessingView
                progress={extractionProgress}
                currentStep={currentStep}
              />
            ) : (
              <UploadPromptView />
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              アップロードガイドライン
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ファイル形式: Adobe Illustrator (.ai)</li>
              <li>• 最大ファイルサイズ: 50MB</li>
              <li>• 推奨バージョン: Illustrator CS6以降</li>
              <li>• すべてのテキストをアウトライン化してください</li>
              <li>• すべての画像を埋め込みしてください</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Extracted Data Preview - Show when data is available */}
      {extractedData && (
        <>
          {/* Extraction Summary Card */}
          <ExtractionSummaryCard
            extractedData={extractedData}
            validationResult={validationResult}
            onEdit={handleEditData}
            onReupload={handleReupload}
          />

          {/* Data Details - Editable or Read-only */}
          <DataDetailsCard
            extractedData={extractedData}
            editedData={editedData}
            isEditing={isEditing}
            onEditChange={setEditedData}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancelEdits}
                  disabled={isUploading}
                >
                  キャンセル
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveEdits}
                  disabled={isUploading}
                  loading={isUploading}
                >
                  変更を保存
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={handleReupload}
                  disabled={isUploading}
                >
                  再アップロード
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEditData}
                  disabled={isUploading}
                >
                  データを編集
                </Button>
                <Button
                  variant="success"
                  onClick={() => submitData(editedData || extractedData)}
                  disabled={isUploading}
                  loading={isUploading}
                >
                  生産データとして承認
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function UploadPromptView() {
  return (
    <>
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-4 text-sm text-gray-600">
        ファイルをドラッグ&ドロップまたは
        <span className="text-blue-600 font-medium"> クリックして選択</span>
      </p>
    </>
  )
}

function ProcessingView({ progress, currentStep }: { progress: number; currentStep: string }) {
  return (
    <div className="space-y-4">
      <div className="mx-auto w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div>
        <p className="text-sm font-medium text-gray-900">処理中...</p>
        <p className="text-sm text-gray-500 mt-1">{currentStep}</p>
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{Math.round(progress * 100)}% 完了</p>
    </div>
  )
}

interface ExtractionSummaryCardProps {
  extractedData: ExtractedProductData
  validationResult: AIExtractionValidationResult | null
  onEdit: () => void
  onReupload: () => void
}

function ExtractionSummaryCard({
  extractedData,
  validationResult,
  onEdit,
  onReupload,
}: ExtractionSummaryCardProps) {
  const confidence = validationResult?.confidence?.overall || 0
  const warningCount = validationResult?.warnings?.length || 0
  const errorCount = validationResult?.errors?.length || 0

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            データ抽出完了
          </h2>
          <p className="text-sm text-gray-600">
            AIがデザインデータから製品仕様を抽出しました
          </p>
        </div>

        {/* Confidence Score Badge */}
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          confidence >= 0.9
            ? 'bg-green-100 text-green-800'
            : confidence >= 0.7
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          精度: {Math.round(confidence * 100)}%
        </div>
      </div>

      {/* Validation Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Object.keys(extractedData.dimensions).length}
          </div>
          <div className="text-sm text-gray-500">サイズ情報</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {extractedData.materials.layers.length}
          </div>
          <div className="text-sm text-gray-500">材料構成</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {extractedData.colors.front_colors.length}
          </div>
          <div className="text-sm text-gray-500">カラー数</div>
        </div>
      </div>

      {/* Issues */}
      {(errorCount > 0 || warningCount > 0) && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            検証結果
          </h3>

          {errorCount > 0 && (
            <div className="mb-3">
              <div className="flex items-center text-sm text-red-600 mb-2">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorCount} 個のエラー
              </div>
              <ul className="text-sm text-red-700 space-y-1 ml-5">
                {validationResult?.errors.slice(0, 3).map((error, i) => (
                  <li key={i}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}

          {warningCount > 0 && (
            <div>
              <div className="flex items-center text-sm text-yellow-600 mb-2">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {warningCount} 個の警告
              </div>
              <ul className="text-sm text-yellow-700 space-y-1 ml-5">
                {validationResult?.warnings.slice(0, 3).map((warning, i) => (
                  <li key={i}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

interface DataDetailsCardProps {
  extractedData: ExtractedProductData
  editedData: ExtractedProductData | null
  isEditing: boolean
  onEditChange: (data: ExtractedProductData) => void
}

function DataDetailsCard({
  extractedData,
  editedData,
  isEditing,
  onEditChange,
}: DataDetailsCardProps) {
  const data = editedData || extractedData

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        抽出データ詳細
      </h2>

      <div className="space-y-6">
        {/* Dimensions */}
        <DimensionSection
          dimensions={data.dimensions}
          isEditing={isEditing}
          onChange={(dimensions) => onEditChange({ ...data, dimensions })}
        />

        {/* Materials */}
        <MaterialSection
          materials={data.materials}
          isEditing={isEditing}
          onChange={(materials) => onEditChange({ ...data, materials })}
        />

        {/* Options */}
        <OptionsSection
          options={data.options}
          isEditing={isEditing}
          onChange={(options) => onEditChange({ ...data, options })}
        />

        {/* Colors */}
        <ColorSection
          colors={data.colors}
          isEditing={isEditing}
          onChange={(colors) => onEditChange({ ...data, colors })}
        />

        {/* Design Elements */}
        <DesignElementsSection
          designElements={data.design_elements}
          isEditing={isEditing}
          onChange={(design_elements) => onEditChange({ ...data, design_elements })}
        />

        {/* Print Specifications */}
        <PrintSpecsSection
          printSpecs={data.print_specifications}
          isEditing={isEditing}
          onChange={(print_specifications) => onEditChange({ ...data, print_specifications })}
        />

        {/* Notes */}
        {data.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">備考</h3>
            <p className="text-sm text-gray-600">{data.notes}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

// Individual data sections
function DimensionSection({
  dimensions,
  isEditing,
  onChange,
}: {
  dimensions: ExtractedProductData['dimensions']
  isEditing: boolean
  onChange: (dims: ExtractedProductData['dimensions']) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">サイズ</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">幅 (mm)</label>
          {isEditing ? (
            <Input
              type="number"
              value={dimensions.width_mm}
              onChange={(e) => onChange({ ...dimensions, width_mm: Number(e.target.value) })}
            />
          ) : (
            <div className="text-sm">{dimensions.width_mm} mm</div>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">高さ (mm)</label>
          {isEditing ? (
            <Input
              type="number"
              value={dimensions.height_mm}
              onChange={(e) => onChange({ ...dimensions, height_mm: Number(e.target.value) })}
            />
          ) : (
            <div className="text-sm">{dimensions.height_mm} mm</div>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">底マチ (mm)</label>
          {isEditing ? (
            <Input
              type="number"
              value={dimensions.gusset_mm || ''}
              onChange={(e) => onChange({ ...dimensions, gusset_mm: e.target.value ? Number(e.target.value) : undefined })}
            />
          ) : (
            <div className="text-sm">{dimensions.gusset_mm ? `${dimensions.gusset_mm} mm` : '-'}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function MaterialSection({
  materials,
  isEditing,
  onChange,
}: {
  materials: ExtractedProductData['materials']
  isEditing: boolean
  onChange: (mats: ExtractedProductData['materials']) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">材料構成</h3>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-gray-500">構成: </span>
          <span className="font-mono">{materials.raw}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">合計厚み: </span>
          <span>{materials.total_thickness_microns} μm</span>
        </div>
        {materials.layers.map((layer, i) => (
          <div key={i} className="flex items-center space-x-2 text-sm">
            <span className="px-2 py-1 bg-gray-100 rounded">{layer.position}</span>
            <span>{layer.type}</span>
            <span className="text-gray-500">{layer.thickness_microns} μm</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptionsSection({
  options,
  isEditing,
  onChange,
}: {
  options: ExtractedProductData['options']
  isEditing: boolean
  onChange: (opts: ExtractedProductData['options']) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">製品オプション</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">ジッパー:</span>
          <span className={options.zipper ? 'text-green-600' : 'text-gray-400'}>
            {options.zipper ? 'あり' : 'なし'}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">ノッチ:</span>
          <span>{options.notch}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">コーナーR:</span>
          <span>{options.corner_round}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">ハングホール:</span>
          <span className={options.hang_hole ? 'text-green-600' : 'text-gray-400'}>
            {options.hang_hole ? 'あり' : 'なし'}
          </span>
        </div>
      </div>
    </div>
  )
}

function ColorSection({
  colors,
  isEditing,
  onChange,
}: {
  colors: ExtractedProductData['colors']
  isEditing: boolean
  onChange: (cls: ExtractedProductData['colors']) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">カラー仕様</h3>
      <div className="space-y-3">
        <div className="text-sm">
          <span className="text-gray-500">カラーモード: </span>
          <span className="font-medium">{colors.mode}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500">表側カラー:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.front_colors.map((color, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded text-sm"
              >
                <span
                  className="w-6 h-6 rounded border"
                  style={{
                    backgroundColor: `rgb(${color.cmyk[3] * 2.55}, ${color.cmyk[2] * 2.55}, ${color.cmyk[1] * 2.55})`,
                  }}
                />
                <span>{color.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DesignElementsSection({
  designElements,
  isEditing,
  onChange,
}: {
  designElements: ExtractedProductData['design_elements']
  isEditing: boolean
  onChange: (de: ExtractedProductData['design_elements']) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">デザイン要素</h3>
      <div className="space-y-3 text-sm">
        {designElements.logos.length > 0 && (
          <div>
            <span className="text-gray-500">ロゴ:</span>
            <span>{designElements.logos.length} 件</span>
          </div>
        )}
        {designElements.text.length > 0 && (
          <div>
            <span className="text-gray-500">テキスト:</span>
            <span>{designElements.text.length} 件</span>
          </div>
        )}
        {designElements.graphics.length > 0 && (
          <div>
            <span className="text-gray-500">グラフィック:</span>
            <span>{designElements.graphics.length} 件</span>
          </div>
        )}
        {designElements.logos.length === 0 &&
          designElements.text.length === 0 &&
          designElements.graphics.length === 0 && (
          <div className="text-gray-400">デザイン要素は検出されませんでした</div>
        )}
      </div>
    </div>
  )
}

function PrintSpecsSection({
  printSpecs,
  isEditing,
  onChange,
}: {
  printSpecs: ExtractedProductData['print_specifications']
  isEditing: boolean
  onChange: (ps: ExtractedProductData['print_specifications']) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">印刷仕様</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-500">解像度:</span>
          <span className="ml-1">{printSpecs.resolution_dpi} DPI</span>
        </div>
        <div>
          <span className="text-gray-500">印刷方式:</span>
          <span className="ml-1">{printSpecs.print_type}</span>
        </div>
        <div>
          <span className="text-gray-500">トリミング:</span>
          <span className="ml-1">{printSpecs.bleed_mm} mm</span>
        </div>
        <div>
          <span className="text-gray-500">カラーモード:</span>
          <span className="ml-1">{printSpecs.color_mode}</span>
        </div>
      </div>
    </div>
  )
}
