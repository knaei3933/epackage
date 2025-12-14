'use client';

import React, { useState, useEffect } from 'react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  X,
  Share2,
  Copy,
  Link,
  Shield,
  Clock,
  Download,
  Loader2,
  Check,
  QrCode
} from 'lucide-react';

interface ShareComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareId?: string;
  shareUrl?: string;
}

export function ShareComparisonDialog({ isOpen, onClose, shareId: initialShareId, shareUrl: initialShareUrl }: ShareComparisonDialogProps) {
  const { shareComparison } = useMultiQuantityQuote();
  const [shareId, setShareId] = useState(initialShareId || '');
  const [shareUrl, setShareUrl] = useState(initialShareUrl || '');
  const [shareOptions, setShareOptions] = useState({
    password: '',
    expiryDays: 30,
    allowDownload: true,
    allowComment: false,
  });
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (shareUrl) {
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`);
    }
  }, [shareUrl]);

  const handleShare = async () => {
    if (!shareId) return;

    setIsSharing(true);
    try {
      const result = await shareComparison(shareId, shareOptions);
      if (result.success) {
        setShareUrl(result.shareUrl!);
        if (result.shareUrl) {
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.shareUrl)}`);
        }
      } else {
        alert(`共有に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('共有中にエラーが発生しました');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleClose = () => {
    if (!isSharing) {
      onClose();
      // Reset state
      setShareId(initialShareId || '');
      setShareUrl(initialShareUrl || '');
      setShareOptions({
        password: '',
        expiryDays: 30,
        allowDownload: true,
        allowComment: false,
      });
      setCopied(false);
    }
  };

  const getExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + shareOptions.expiryDays);
    return date.toLocaleDateString('ja-JP');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              比較結果の共有
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSharing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!shareUrl ? (
            // Share options form
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                比較結果を共有するための設定を行います。
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード <span className="text-gray-400">（任意）</span>
                </label>
                <Input
                  type="password"
                  value={shareOptions.password}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="パスワードを設定する場合に入力"
                  disabled={isSharing}
                />
                {shareOptions.password && (
                  <p className="text-xs text-gray-500 mt-1">
                    パスワードを設定すると、URLを知っている人でもパスワードが必要になります。
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  有効期間
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  value={shareOptions.expiryDays}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                  disabled={isSharing}
                >
                  <option value={7}>7日間</option>
                  <option value={30}>30日間</option>
                  <option value={90}>90日間</option>
                  <option value={365}>1年間</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getExpiryDate()}まで有効
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  許可する操作
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={shareOptions.allowDownload}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, allowDownload: e.target.checked }))}
                    disabled={isSharing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">ダウンロードを許可</span>
                  <Download className="w-4 h-4 text-gray-400" />
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={shareOptions.allowComment}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, allowComment: e.target.checked }))}
                    disabled={isSharing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">コメントを許可</span>
                </label>
              </div>
            </div>
          ) : (
            // Share result
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  共有リンクが作成されました！
                </h3>
                <p className="text-gray-600">
                  以下のリンクを使って比較結果を共有できます。
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="text-center">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 border border-gray-200 rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">QRコード</p>
                </div>
              </div>

              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  共有URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleCopy}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        コピー完了
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        コピー
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Share settings summary */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">共有設定</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    有効期間: {getExpiryDate()} まで
                  </div>
                  {shareOptions.password && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      パスワード保護あり
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Download className={`w-4 h-4 ${shareOptions.allowDownload ? 'text-green-600' : 'text-gray-400'}`} />
                    ダウンロード: {shareOptions.allowDownload ? '許可' : '禁止'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 sticky bottom-0">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSharing}
          >
            閉じる
          </Button>
          {!shareUrl && (
            <Button
              onClick={handleShare}
              disabled={isSharing || !shareId}
              className="min-w-[120px]"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  作成中...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  共有リンクを作成
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}