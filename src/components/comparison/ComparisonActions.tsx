'use client';

import React, { useState } from 'react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { Button } from '@/components/ui/Button';
import { SaveComparisonDialog } from './SaveComparisonDialog';
import { ShareComparisonDialog } from './ShareComparisonDialog';
import { ExportMenu } from './ExportMenu';
import { SavedComparisonsList } from './SavedComparisonsList';
import {
  Save,
  Share2,
  Download,
  History,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

interface ComparisonActionsProps {
  className?: string;
}

export function ComparisonActions({ className = '' }: ComparisonActionsProps) {
  const { state } = useMultiQuantityQuote();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [shareData, setShareData] = useState<{ shareId?: string; shareUrl?: string }>({});

  const hasResults = state.comparison && state.multiQuantityResults.size > 0;

  const handleSave = (result: { success: boolean; shareUrl?: string; error?: string }) => {
    if (result.success && result.shareUrl) {
      setShareData({ shareUrl: result.shareUrl });
      setIsShareDialogOpen(true);
    }
  };

  const handleExport = (result: { success: boolean; format: string; error?: string }) => {
    if (result.success) {
      // Success feedback could be shown here
      console.log(`Exported as ${result.format}`);
    }
  };

  if (!hasResults) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSaveDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExportMenuOpen(true)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            エクスポート
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSavedList(!showSavedList)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            保存一覧
          </Button>
        </div>

        {/* Share Button */}
        {state.exportUrl && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            共有
          </Button>
        )}

        {/* Quick Share */}
        {state.exportUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(state.exportUrl!)}
            className="flex items-center gap-2"
            title="共有URLをコピー"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Export Menu Dropdown */}
      {isExportMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <ExportMenu
              onClose={() => setIsExportMenuOpen(false)}
              onExport={handleExport}
            />
          </div>
        </div>
      )}

      {/* Save Dialog */}
      <SaveComparisonDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSave}
      />

      {/* Share Dialog */}
      <ShareComparisonDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        shareId={shareData.shareId}
        shareUrl={shareData.shareUrl}
      />

      {/* Saved Comparisons List */}
      {showSavedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  保存された比較結果
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSavedList(false)}
                >
                  閉じる
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <SavedComparisonsList
                  onLoadComparison={() => {
                    setShowSavedList(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}