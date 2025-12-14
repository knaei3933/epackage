'use client';

import React, { useState } from 'react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Save, Loader2 } from 'lucide-react';

interface SaveComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (result: { success: boolean; shareUrl?: string; error?: string }) => void;
}

export function SaveComparisonDialog({ isOpen, onClose, onSave }: SaveComparisonDialogProps) {
  const { state, saveComparison } = useMultiQuantityQuote();
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    customerName: '',
    projectName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveComparison(metadata);
      onSave?.(result);

      if (result.success) {
        // Reset form
        setMetadata({
          title: '',
          description: '',
          customerName: '',
          projectName: '',
        });
        onClose();
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            比較結果の保存
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            比較結果を保存して、後で確認したり共有したりできます。
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-gray-400">（任意）</span>
            </label>
            <Input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              placeholder="比較結果のタイトル"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明 <span className="text-gray-400">（任意）</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              rows={3}
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              placeholder="比較結果の詳細な説明"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お客様名 <span className="text-gray-400">（任意）</span>
            </label>
            <Input
              type="text"
              value={metadata.customerName}
              onChange={(e) => setMetadata(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="お客様名"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              プロジェクト名 <span className="text-gray-400">（任意）</span>
            </label>
            <Input
              type="text"
              value={metadata.projectName}
              onChange={(e) => setMetadata(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="プロジェクト名"
              disabled={isSaving}
            />
          </div>

          {/* Current comparison summary */}
          {state.comparison && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">保存される内容</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• 比較数量: {state.comparisonQuantities.length}個</div>
                <div>• 最適数量: {state.comparison.bestValue?.quantity}個</div>
                <div>• 最大節約率: {state.comparison.bestValue?.percentage}%</div>
                <div>• 有効期間: 保存から30日間</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !state.comparison}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}