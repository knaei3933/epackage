'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  Share2,
  Clock,
  Eye,
  FileText
} from 'lucide-react';

export default function SharedComparisonPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loadComparison, exportComparison, state } = useMultiQuantityQuote();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState('');

  const shareId = searchParams.get('id');

  useEffect(() => {
    if (shareId) {
      loadSharedComparison();
    }
  }, [shareId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const loadSharedComparison = async () => {
    if (!shareId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loadComparison(shareId);
      if (result.success) {
        setComparisonData(result.data);
      } else {
        setError(result.error || '比較結果の読み込みに失敗しました');
      }
    } catch (error) {
      console.error('Load comparison error:', error);
      setError('比較結果の読み込み中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  // ... (rest of the component logic)


  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const result = await exportComparison(format);
      if (!result.success) {
        alert(`エクスポートに失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポート中にエラーが発生しました');
    }
  };

  const handleShare = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('共有URLをクリップボードにコピーしました');
      } catch (error) {
        console.error('Copy error:', error);
        alert('URLのコピーに失敗しました');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">比較結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            比較結果の読み込みエラー
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={loadSharedComparison}
              className="w-full"
            >
              再試行
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/compare')}
              className="w-full"
            >
              新しい比較を作成
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.comparison || !comparisonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            比較結果が見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            この比較結果は存在しないか、期限切れの可能性があります。
          </p>
          <Button
            onClick={() => router.push('/compare')}
            className="w-full"
          >
            新しい比較を作成
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/compare')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                戻る
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {comparisonData.metadata?.title || '比較結果'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(comparisonData.metadata?.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {comparisonData.metadata?.viewCount || 0}回表示
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                共有
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comparison Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">比較サマリー</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {state.comparisonQuantities.length}
                  </div>
                  <div className="text-sm text-blue-700">比較数量</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {state.comparison.bestValue?.quantity.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">最適数量</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {state.comparison.bestValue?.percentage}%
                  </div>
                  <div className="text-sm text-purple-700">最大節約率</div>
                </div>
              </div>

              {/* Recommendations */}
              {state.comparison.bestValue && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h3 className="font-medium text-amber-900 mb-2">推奨事項</h3>
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>最適数量:</strong> {state.comparison.bestValue.quantity}個
                  </p>
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>想定節約額:</strong> ¥{state.comparison.bestValue.savings.toLocaleString()}
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>理由:</strong> {state.comparison.bestValue.reason}
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">詳細比較</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">数量</th>
                      <th className="text-right py-3 px-4">単価</th>
                      <th className="text-right py-3 px-4">合計価格</th>
                      <th className="text-right py-3 px-4">割引率</th>
                      <th className="text-center py-3 px-4">評価</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.comparisonQuantities.map((quantity, index) => {
                      const calculation = state.multiQuantityResults.get(quantity);
                      const isBest = state.comparison?.bestValue?.quantity === quantity;

                      return (
                        <tr key={quantity} className={`border-b ${isBest ? 'bg-green-50' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {quantity.toLocaleString()}個
                              {isBest && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  最適
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            ¥{calculation?.unitPrice?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            ¥{calculation?.totalPrice?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {calculation ? `${((calculation.totalPrice / quantity - calculation.unitPrice) / calculation.unitPrice * 100).toFixed(1)}%` : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isBest ? (
                              <span className="text-green-600 font-medium">最適</span>
                            ) : (
                              <span className="text-gray-500">
                                普通C
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Specifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本仕様</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">袋タイプ:</span>
                  <span className="ml-2 text-gray-600">{state.bagTypeId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">素材:</span>
                  <span className="ml-2 text-gray-600">{state.materialId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">サイズ:</span>
                  <span className="ml-2 text-gray-600">
                    {state.width} × {state.height} {state.depth > 0 && `× ${state.depth}`} mm
                  </span>
                </div>
                {state.thicknessSelection && (
                  <div>
                    <span className="font-medium text-gray-700">厚さ:</span>
                    <span className="ml-2 text-gray-600">{state.thicknessSelection}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">配送:</span>
                  <span className="ml-2 text-gray-600">
                    {state.deliveryLocation === 'domestic' ? '国内' : '国際'} /
                    {state.urgency === 'standard' ? '標準' : '速達'}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">エクスポート</h2>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  className="w-full justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDFでダウンロード
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excelでダウンロード
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSVでダウンロード
                </Button>
              </div>
            </div>

            {/* Validity Information */}
            {comparisonData.metadata?.expiresAt && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-amber-900 mb-2">有効期間</h3>
                <p className="text-sm text-amber-800">
                  この比較結果は{formatDate(comparisonData.metadata.expiresAt)}まで有効です。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function SharedComparisonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <SharedComparisonContent />
    </Suspense>
  );
}

function SharedComparisonContent() {
  // All the logic previously in SharedComparisonPage
  const searchParams = useSearchParams();
// ... rest of the code is copied below but I can't easily instruct replace_file_content to do this rename + wrap cleanly in one go without pasting huge block.
// Actually, I can just replace the bottom part and rename the function at top.
