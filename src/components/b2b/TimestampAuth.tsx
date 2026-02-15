'use client';

/**
 * Timestamp Authority Authentication Component
 *
 * タイムスタンプ認証コンポーネント
 * - タイムスタンプ付与リクエスト
 * - TSA認証フロー
 * - 電子署名法準拠
 * - タイムスタンプトークン管理
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lock,
  FileText,
  Calendar,
  Fingerprint,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  X,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface TimestampAuthProps {
  contractId: string;
  contractNumber: string;
  onTimestampGranted?: (timestampData: TimestampData) => void;
  onError?: (error: string) => void;
  className?: string;
  tsaUrl?: string;
}

export interface TimestampData {
  /** タイムスタンプトークン */
  token: string;
  /** タイムスタンプ日時 */
  timestamp: string;
  /** TSA URL */
  tsaUrl: string;
  /** ハッシュ値 */
  hash: string;
  /** 有効期限 */
  expiresAt: string;
  /** 証明書 */
  certificate?: string;
}

interface TimestampRequest {
  contractId: string;
  contractNumber: string;
  documentHash: string;
  userId?: string;
}

interface TimestampResponse {
  success: boolean;
  timestampData?: TimestampData;
  error?: string;
}

interface TSAInfo {
  name: string;
  url: string;
  description: string;
  status: 'operational' | 'degraded' | 'down';
}

// ============================================================
// Constants
// ============================================================

// Mock TSA providers (in production, these would be real TSA services)
const TSA_PROVIDERS: Record<string, TSAInfo> = {
  default: {
    name: 'Japan Trusted TSA',
    url: 'https://tsa.example.com',
    description: '日本の電子署名法準拠TSAサービス',
    status: 'operational',
  },
  jqa: {
    name: 'JQAタイムスタンプ',
    url: 'https://tssa.jqa.jp',
    description: '日本品質保証機構認定TSA',
    status: 'operational',
  },
  mri: {
    name: 'MRIタイムスタンプ',
    url: 'https://tssa.mri.co.jp',
    description: '三菱総合研究所TSAサービス',
    status: 'operational',
  },
};

const TIMESTAMP_VALIDITY_PERIOD = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in ms

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate document hash for timestamping
 */
async function generateDocumentHash(contractData: any): Promise<string> {
  const jsonString = JSON.stringify(contractData, Object.keys(contractData).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Format timestamp to Japanese format
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Calculate expiry date
 */
function calculateExpiryDate(timestamp: string): string {
  const date = new Date(timestamp);
  const expiry = new Date(date.getTime() + TIMESTAMP_VALIDITY_PERIOD);
  return expiry.toISOString();
}

// ============================================================
// Component
// ============================================================

export default function TimestampAuth({
  contractId,
  contractNumber,
  onTimestampGranted,
  onError,
  className = '',
  tsaUrl = 'default',
}: TimestampAuthProps) {
  // State
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'error'>('idle');
  const [timestampData, setTimestampData] = useState<TimestampData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [selectedTSA, setSelectedTSA] = useState<string>(tsaUrl);
  const [showDetails, setShowDetails] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const tsaInfo = TSA_PROVIDERS[selectedTSA];

  // ============================================================
  // Handlers
  // ============================================================

  const handleRequestTimestamp = useCallback(async () => {
    setStatus('requesting');
    setError(null);

    try {
      // Generate document hash
      const hash = await generateDocumentHash({ contractId, contractNumber });
      setDocumentHash(hash);

      // Request timestamp from TSA
      const requestBody: TimestampRequest = {
        contractId,
        contractNumber,
        documentHash: hash,
      };

      const response = await fetch('/api/contract/timestamp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          tsaUrl: tsaInfo.url,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as TimestampResponse;

      if (!data.success || !data.timestampData) {
        throw new Error(data.error || 'タイムスタンプの付与に失敗しました');
      }

      setTimestampData(data.timestampData);
      setStatus('granted');

      if (onTimestampGranted) {
        onTimestampGranted(data.timestampData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(errorMessage);
      setStatus('error');

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [contractId, contractNumber, tsaInfo.url, onTimestampGranted, onError]);

  const handleValidateTimestamp = useCallback(async () => {
    if (!timestampData) return;

    setIsValidating(true);

    try {
      const response = await fetch('/api/contract/timestamp/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: timestampData.token,
          tsaUrl: timestampData.tsaUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.valid) {
        setError('タイムスタンプの検証に失敗しました');
        setStatus('error');
      } else {
        // Status remains 'granted' if valid
        setIsValidating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検証に失敗しました');
      setStatus('error');
    } finally {
      setIsValidating(false);
    }
  }, [timestampData]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                タイムスタンプ認証
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                電子署名法に基づいたタイムスタンプ付与
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                status === 'granted'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : status === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : status === 'requesting'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}
            >
              {status === 'granted' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
              {status === 'requesting' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {status === 'idle' && <Shield className="w-3.5 h-3.5" />}
              {status === 'idle' && '未付与'}
              {status === 'requesting' && '付与中'}
              {status === 'granted' && '付与済み'}
              {status === 'error' && 'エラー'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contract Info */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <FileText className="w-4 h-4" />
              契約書情報
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>
                <span className="text-gray-500">契約番号:</span>
                <p className="font-mono">{contractNumber}</p>
              </div>
              <div>
                <span className="text-gray-500">契約ID:</span>
                <p className="font-mono">{contractId}</p>
              </div>
            </div>
          </div>

          {/* TSA Selection */}
          {status === 'idle' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                タイムスタンプ局（TSA）
              </label>
              <select
                value={selectedTSA}
                onChange={(e) => setSelectedTSA(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {Object.entries(TSA_PROVIDERS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name} - {info.description}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-3.5 h-3.5" />
                <span>選択されたTSA: {tsaInfo.url}</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && status === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">エラー</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setStatus('idle');
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === 'idle' && (
              <Button
                onClick={handleRequestTimestamp}
                disabled={!contractId}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                タイムスタンプを付与
              </Button>
            )}

            {status === 'requesting' && (
              <Button disabled className="flex-1">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                タイムスタンプ付与中...
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRequestTimestamp}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再試行
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStatus('idle')}
                >
                  キャンセル
                </Button>
              </>
            )}

            {status === 'granted' && timestampData && (
              <>
                <Button
                  variant="outline"
                  onClick={handleValidateTimestamp}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      検証中...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      検証
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Timestamp Details */}
          {status === 'granted' && timestampData && (
            <div className="space-y-3 pt-3 border-t">
              {/* Success Message */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      タイムスタンプが付与されました
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      電子署名法に基づき、契約書の存在証明が付与されています
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp Info */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>タイムスタンプ詳細</span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showDetails && (
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 text-xs">付与日時</span>
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-mono text-xs">
                            {formatTimestamp(timestampData.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">有効期限</span>
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-mono text-xs">
                            {formatTimestamp(timestampData.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-xs">TSA URL</span>
                      <div className="flex items-center gap-1.5 text-gray-900">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <a
                          href={timestampData.tsaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-600 hover:underline"
                        >
                          {timestampData.tsaUrl}
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-xs">文書ハッシュ</span>
                      <div className="flex items-center gap-1.5 text-gray-900">
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs break-all">
                          {timestampData.hash}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 text-xs">トークン</span>
                      <div className="flex items-center gap-1.5 text-gray-900">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs break-all">
                          {timestampData.token.substring(0, 64)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="flex items-start gap-1.5">
          <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            本タイムスタンプサービスは日本の電子署名法および電子契約法に準拠しています。
            付与されたタイムスタンプは契約書の存在証明として法的効力を持ちます。
          </span>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Compact Badge Component
// ============================================================

interface TimestampBadgeProps {
  timestampData: TimestampData;
  onClick?: () => void;
}

export function TimestampBadge({ timestampData, onClick }: TimestampBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium border border-green-300 hover:bg-green-200 transition-colors"
      title={`タイムスタンプ: ${formatTimestamp(timestampData.timestamp)}`}
    >
      <Clock className="w-3 h-3" />
      <span>TS付与済み</span>
    </button>
  );
}

// ============================================================
// Validation Status Component
// ============================================================

interface TimestampValidationStatusProps {
  isValid: boolean;
  validatedAt?: string;
  error?: string;
}

export function TimestampValidationStatus({
  isValid,
  validatedAt,
  error,
}: TimestampValidationStatusProps) {
  if (isValid) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <CheckCircle2 className="w-4 h-4" />
        <span>タイムスタンプは有効です</span>
        {validatedAt && (
          <span className="text-xs text-gray-500">
            （検証日時: {formatTimestamp(validatedAt)}）
          </span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-700">
        <AlertCircle className="w-4 h-4" />
        <span>タイムスタンプの検証に失敗しました: {error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>タイムスタンプの検証待ち...</span>
    </div>
  );
}
