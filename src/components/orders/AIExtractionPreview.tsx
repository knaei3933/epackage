/**
 * AI Extraction Preview Component
 *
 * AI抽出プレビューコンポーネント
 * - Displays AI-extracted product specifications
 * - Provides approval/rejection workflow
 * - Shows confidence scores and validation errors
 * - Integrates with files and design_revisions tables
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// =====================================================
// Types
// =====================================================

interface AIExtractionPreviewProps {
  fileId: string;
  orderId: string;
  onComplete?: () => void;
}

interface ExtractedSpecs {
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  material?: {
    type: string;
    thickness?: string;
    layers?: string[];
  };
  colors?: Array<{
    name: string;
    pantone?: string;
    hex?: string;
    cmyk?: string;
  }>;
  quantity?: number;
  features?: string[];
  printSpecs?: {
    method?: string;
    colors?: number;
    coating?: string;
  };
  specialRequirements?: string[];
}

interface ValidationResult {
  valid: boolean;
  confidence: number;
  errors: Array<{
    field: string;
    message: string;
    severity: 'critical' | 'major' | 'minor';
  }>;
  warnings: Array<{
    field: string;
    message: string;
    severity: 'info' | 'warning';
  }>;
}

// =====================================================
// Main Component
// =====================================================

export function AIExtractionPreview({ fileId, orderId, onComplete }: AIExtractionPreviewProps) {
  const [extractedData, setExtractedData] = useState<ExtractedSpecs | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<ExtractedSpecs | null>(null);

  // Load extraction results
  useEffect(() => {
    loadExtractionResults();
  }, [fileId]);

  const loadExtractionResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai-parser/extract?fileId=${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to load extraction results');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setExtractedData(result.data.specs);
        setValidation(result.data.validation);
        setEditedData(result.data.specs);
      } else {
        // No extraction results yet - might still be processing
        setExtractedData(null);
        setValidation(null);
      }
    } catch (err) {
      console.error('Failed to load extraction results:', err);
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approval
  const handleApprove = async () => {
    if (!editedData) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-parser/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileId,
          approved_data: editedData,
          create_work_order: true,
          notes: 'Customer approved AI-extracted specifications',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '承認に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        onComplete?.();
      }
    } catch (err) {
      console.error('Approval error:', err);
      setError(err instanceof Error ? err.message : '承認に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle rejection
  const handleReject = async (reason: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-parser/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileId,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('拒否に失敗しました');
      }

      onComplete?.();
    } catch (err) {
      console.error('Rejection error:', err);
      setError(err instanceof Error ? err.message : '拒否に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle re-extraction
  const handleReextract = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-parser/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileId,
        }),
      });

      if (!response.ok) {
        throw new Error('再抽出に失敗しました');
      }

      // Reload extraction results
      await loadExtractionResults();
    } catch (err) {
      console.error('Re-extraction error:', err);
      setError(err instanceof Error ? err.message : '再抽出に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get confidence level
  const getConfidenceLevel = (score: number): { label: string; color: string } => {
    if (score >= 0.9) return { label: '高', color: 'text-green-600 bg-green-50' };
    if (score >= 0.7) return { label: '中', color: 'text-yellow-600 bg-yellow-50' };
    return { label: '低', color: 'text-red-600 bg-red-50' };
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">AI抽出結果を読み込み中...</p>
          <p className="text-sm text-gray-500 mt-2">この処理には数秒かかる場合があります</p>
        </div>
      </Card>
    );
  }

  // No extraction results
  if (!extractedData || !validation) {
    return (
      <Card className="p-8">
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            AI抽出がまだ完了していません
          </h3>
          <p className="text-gray-600 mb-4">
            ファイルが処理中です。しばらくお待ちください。
          </p>
          <Button
            variant="secondary"
            onClick={loadExtractionResults}
            disabled={isProcessing}
          >
            更新
          </Button>
        </div>
      </Card>
    );
  }

  const confidenceLevel = getConfidenceLevel(validation.confidence);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Confidence Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            AI抽出結果
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceLevel.color}`}>
            信頼度: {Math.round(validation.confidence * 100)}% ({confidenceLevel.label})
          </div>
        </div>

        {/* Validation Errors */}
        {validation.errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-900 mb-2">検証エラー</h4>
            <ul className="text-sm text-red-800 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>{error.field}:</strong> {error.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Warnings */}
        {validation.warnings.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">警告</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>{warning.field}:</strong> {warning.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracted Specifications */}
        <div className="space-y-4">
          {/* Dimensions */}
          {extractedData.dimensions && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">サイズ</h4>
              <div className="text-sm text-gray-700">
                {extractedData.dimensions.width} × {extractedData.dimensions.height}
                {extractedData.dimensions.depth && ` × ${extractedData.dimensions.depth}`}
                {extractedData.dimensions.unit}
              </div>
            </div>
          )}

          {/* Material */}
          {extractedData.material && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">素材</h4>
              <div className="text-sm text-gray-700">
                <p>タイプ: {extractedData.material.type}</p>
                {extractedData.material.thickness && (
                  <p>厚さ: {extractedData.material.thickness}</p>
                )}
                {extractedData.material.layers && extractedData.material.layers.length > 0 && (
                  <p>レイヤー: {extractedData.material.layers.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Colors */}
          {extractedData.colors && extractedData.colors.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">色</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                {extractedData.colors.map((color, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {color.hex && (
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    <span>{color.name}</span>
                    {color.pantone && <span className="text-gray-500">({color.pantone})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Print Specifications */}
          {extractedData.printSpecs && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">印刷仕様</h4>
              <div className="text-sm text-gray-700">
                {extractedData.printSpecs.method && (
                  <p>印刷方式: {extractedData.printSpecs.method}</p>
                )}
                {extractedData.printSpecs.colors && (
                  <p>色数: {extractedData.printSpecs.colors}</p>
                )}
                {extractedData.printSpecs.coating && (
                  <p>コーティング: {extractedData.printSpecs.coating}</p>
                )}
              </div>
            </div>
          )}

          {/* Quantity */}
          {extractedData.quantity && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">数量</h4>
              <div className="text-sm text-gray-700">
                {extractedData.quantity.toLocaleString()} 枚
              </div>
            </div>
          )}

          {/* Features */}
          {extractedData.features && extractedData.features.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">機能</h4>
              <ul className="text-sm text-gray-700 list-disc list-inside">
                {extractedData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Special Requirements */}
          {extractedData.specialRequirements && extractedData.specialRequirements.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">特別要件</h4>
              <ul className="text-sm text-gray-700 list-disc list-inside">
                {extractedData.specialRequirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          variant="secondary"
          onClick={handleReextract}
          disabled={isProcessing || isLoading}
        >
          {isProcessing ? '処理中...' : '再抽出'}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            const reason = prompt('拒否理由を入力してください:');
            if (reason) handleReject(reason);
          }}
          disabled={isProcessing}
        >
          拒否
        </Button>
        <Button
          variant="primary"
          onClick={handleApprove}
          disabled={isProcessing || !validation.valid}
          loading={isProcessing}
        >
          承認して作業指示書を作成
        </Button>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">操作ガイド</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>承認:</strong> 抽出された仕様を確認し、作業指示書を作成します</li>
          <li>• <strong>拒否:</strong> 抽出結果を拒否し、手動入力が必要です</li>
          <li>• <strong>再抽出:</strong> AIを使用してファイルから再度仕様を抽出します</li>
        </ul>
      </Card>
    </div>
  );
}
