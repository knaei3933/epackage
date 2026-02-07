/**
 * Data Receipt Section Component
 *
 * データ入稿セクション
 * - 顧客がアップロードしたAIファイルの表示
 * - 必須ファイルのバッジ表示
 * - ダウンロード機能
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import type { OrderFile } from './types';

interface DataReceiptSectionProps {
  orderId: string;
  fetchFn?: typeof fetch;
}

export function DataReceiptSection({ orderId, fetchFn = fetch }: DataReceiptSectionProps) {
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [orderId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn(`/api/admin/orders/${orderId}/data-receipt`);

      // Check if response is OK
      if (!response.ok) {
        setError(`ファイルの読み込みに失敗しました (${response.status})`);
        return;
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('サーバーエラーが発生しました');
        return;
      }

      const result = await response.json();

      if (result.success) {
        setFiles(result.files || []);
      } else {
        setError(result.error || 'ファイルの読み込みに失敗しました');
      }
    } catch (err) {
      console.error('Failed to load files:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: OrderFile) => {
    try {
      // Use the download API endpoint
      const downloadUrl = `/api/admin/orders/${orderId}/files/${file.id}/download`;
      console.log('[DataReceiptSection] Starting download:', downloadUrl);

      // Fetch the file with credentials
      const response = await fetch(downloadUrl, {
        credentials: 'include',
      });

      console.log('[DataReceiptSection] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DataReceiptSection] Error response:', errorText);
        alert('ファイルのダウンロードに失敗しました');
        return;
      }

      // Get content type
      const contentType = response.headers.get('content-type');
      console.log('[DataReceiptSection] Content-Type:', contentType);

      // Check if error response
      if (contentType?.includes('application/json')) {
        const json = await response.json();
        console.error('[DataReceiptSection] Error:', json);
        alert(json.error || 'ファイルのダウンロードに失敗しました');
        return;
      }

      // Get blob with correct MIME type
      const blob = await response.blob();
      console.log('[DataReceiptSection] Blob size:', blob.size, 'bytes, type:', blob.type);

      // Force AI file extension if original file has .ai extension
      let fileName = file.file_name;
      if (file.file_name.endsWith('.ai') || file.file_type?.includes('adobe')) {
        // Ensure .ai extension is preserved
        if (!fileName.endsWith('.ai')) {
          fileName = fileName.replace(/\.[^.]+$/, '.ai');
        }
      }

      // Create object URL with blob
      const url = window.URL.createObjectURL(blob, { type: blob.type });

      // Create anchor and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';

      // Important: Set the type explicitly
      a.setAttribute('type', blob.type);

      document.body.appendChild(a);

      // Trigger download
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log('[DataReceiptSection] Download completed as:', fileName);
    } catch (err) {
      console.error('[DataReceiptSection] Failed to download file:', err);
      alert('ファイルのダウンロードに失敗しました');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getRequiredFiles = () => files.filter(f => f.is_required);
  const hasRequiredFiles = () => getRequiredFiles().length > 0;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            データ入稿状況
          </h3>
          <div className="flex items-center gap-2">
            {hasRequiredFiles() ? (
              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                必須ファイル入稿済み
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                <AlertCircle className="w-4 h-4" />
                必須ファイル未入稿
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            ファイルを読み込み中...
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだファイルがアップロードされていません
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  file.is_required
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{file.file_name}</span>
                    {file.is_required && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">
                        必須
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{file.file_type}</span>
                    <span>•</span>
                    <span>{new Date(file.uploaded_at).toLocaleString('ja-JP')}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  ダウンロード
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
