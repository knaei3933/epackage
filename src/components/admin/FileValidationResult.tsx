/**
 * FileValidationResult Component
 *
 * Displays validation results for uploaded design files
 * Shows errors, warnings, and file metadata with Japanese messages
 */

'use client';

import React, { useState } from 'react';
import {
  File,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import type { ValidationResult } from '@/lib/file-validator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ============================================================
// Types
// ============================================================

interface FileValidationResultProps {
  result: ValidationResult;
  onApprove?: () => void;
  onReject?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
  showActions?: boolean;
  language?: 'ja' | 'en';
}

interface IssueItemProps {
  issue: {
    type: 'error' | 'warning';
    category: string;
    message_ja: string;
    message_en: string;
    severity: 'critical' | 'major' | 'minor';
  };
  language: 'ja' | 'en';
}

interface MetadataDisplayProps {
  metadata: ValidationResult['metadata'];
  language: 'ja' | 'en';
}

// ============================================================
// Helper Components
// ============================================================

/**
 * Issue Item Component
 */
function IssueItem({ issue, language }: IssueItemProps) {
  const isError = issue.type === 'error';
  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200',
    major: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
    minor: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
  };

  const categoryLabels: Record<string, { ja: string; en: string }> = {
    format: { ja: 'フォーマット', en: 'Format' },
    dimension: { ja: '寸法', en: 'Dimension' },
    color: { ja: 'カラー', en: 'Color' },
    font: { ja: 'フォント', en: 'Font' },
    image: { ja: '画像', en: 'Image' },
    structure: { ja: '構造', en: 'Structure' },
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
      isError ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    } dark:bg-opacity-10`}>
      {isError ? (
        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {categoryLabels[issue.category]?.[language] || issue.category}
          </span>
          <Badge variant="outline" className={`text-xs ${severityColors[issue.severity]}`}>
            {issue.severity}
          </Badge>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {language === 'ja' ? issue.message_ja : issue.message_en}
        </p>
      </div>
    </div>
  );
}

/**
 * Metadata Display Component
 */
function MetadataDisplay({ metadata, language }: MetadataDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  const labels = {
    dimensions: { ja: '寸法', en: 'Dimensions' },
    dpi: { ja: '解像度', en: 'Resolution' },
    colorMode: { ja: 'カラーモード', en: 'Color Mode' },
    pages: { ja: 'ページ数', en: 'Pages' },
    fonts: { ja: 'フォント', en: 'Fonts' },
    images: { ja: '画像数', en: 'Images' },
    aiVersion: { ja: 'AIバージョン', en: 'AI Version' },
    pdfVersion: { ja: 'PDFバージョン', en: 'PDF Version' },
    hasBleed: { ja: '塗り足し', en: 'Bleed' },
    bleedSize: { ja: '塗り足しサイズ', en: 'Bleed Size' },
    layers: { ja: 'レイヤー数', en: 'Layers' },
  };

  const formatValue = (key: string, value: any): string => {
    if (value === undefined || value === null) return '-';

    switch (key) {
      case 'dimensions':
        return value.width && value.height
          ? `${value.width} x ${value.height} pt`
          : '-';
      case 'dpi':
        return `${value} DPI`;
      case 'hasBleed':
        return value ? '✓' : '✗';
      case 'bleedSize':
        return `${value} mm`;
      case 'fonts':
        return Array.isArray(value) ? value.join(', ') : String(value);
      default:
        return String(value);
    }
  };

  const metadataItems = [
    { key: 'dimensions', value: metadata.dimensions },
    { key: 'dpi', value: metadata.dpi },
    { key: 'colorMode', value: metadata.colorMode },
    { key: 'pages', value: metadata.pages },
    { key: 'fonts', value: metadata.fonts },
    { key: 'images', value: metadata.images },
    { key: 'aiVersion', value: metadata.aiVersion },
    { key: 'pdfVersion', value: metadata.pdfVersion },
    { key: 'hasBleed', value: metadata.hasBleed },
    { key: 'bleedSize', value: metadata.bleedSize },
    { key: 'layers', value: metadata.layers },
  ].filter(item => item.value !== undefined && item.value !== null);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm font-medium">
          {language === 'ja' ? 'ファイル情報' : 'File Information'}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {expanded && (
        <div className="p-3 space-y-2">
          {metadataItems.map((item) => (
            <div key={item.key} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {labels[item.key as keyof typeof labels]?.[language] || item.key}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatValue(item.key, item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function FileValidationResult({
  result,
  onApprove,
  onReject,
  onDownload,
  onPreview,
  showActions = true,
  language = 'ja',
}: FileValidationResultProps) {
  const hasErrors = result.issues.length > 0;
  const hasWarnings = result.warnings.length > 0;
  const isCritical = result.issues.some(i => i.severity === 'critical');

  const statusConfig = {
    valid: {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      label: { ja: '有効', en: 'Valid' },
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      label: { ja: '警告あり', en: 'Warning' },
    },
    error: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      label: { ja: 'エラー', en: 'Error' },
    },
  };

  const status = result.valid
    ? 'valid'
    : isCritical
    ? 'error'
    : 'warning';

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card className={`p-6 border-2 ${config.borderColor} ${config.bgColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <File className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{result.fileName}</h3>
              <Badge variant="outline" className={config.color}>
                {result.fileType}
              </Badge>
              <Badge variant="outline" className={config.color}>
                {config.label[language]}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatFileSize(result.fileSize)}
            </p>
          </div>
        </div>
        <StatusIcon className={`w-6 h-6 ${config.color}`} />
      </div>

      {/* Issues */}
      {(hasErrors || hasWarnings) && (
        <div className="mb-4 space-y-3">
          {hasErrors && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {language === 'ja' ? 'エラー' : 'Errors'} ({result.issues.length})
              </h4>
              <div className="space-y-2">
                {result.issues.map((issue, index) => (
                  <IssueItem key={`error-${index}`} issue={issue} language={language} />
                ))}
              </div>
            </div>
          )}
          {hasWarnings && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {language === 'ja' ? '警告' : 'Warnings'} ({result.warnings.length})
              </h4>
              <div className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <IssueItem key={`warning-${index}`} issue={warning} language={language} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <MetadataDisplay metadata={result.metadata} language={language} />

      {/* Actions */}
      {showActions && (onApprove || onReject || onDownload || onPreview) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {language === 'ja' ? 'ダウンロード' : 'Download'}
            </Button>
          )}
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {language === 'ja' ? 'プレビュー' : 'Preview'}
            </Button>
          )}
          {onApprove && result.valid && (
            <Button
              variant="primary"
              size="sm"
              onClick={onApprove}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4" />
              {language === 'ja' ? '承認' : 'Approve'}
            </Button>
          )}
          {onReject && !result.valid && (
            <Button
              variant="brixa-gradient"
              size="sm"
              onClick={onReject}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {language === 'ja' ? '却下' : 'Reject'}
            </Button>
          )}
        </div>
      )}

      {/* Validation Timestamp */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {language === 'ja' ? '検証日時: ' : 'Validated: '}
        {new Date(result.validatedAt).toLocaleString(language === 'ja' ? 'ja-JP' : 'en-US')}
      </p>
    </Card>
  );
}

// ============================================================
// Export Default Component
// ============================================================

export default FileValidationResult;
