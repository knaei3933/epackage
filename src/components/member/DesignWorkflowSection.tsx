/**
 * Design Workflow Section Component (Improved UI)
 *
 * デザインワークフローセクションコンポーネント（改善版）
 * - ファイル入稿 → 校正確認 のワークフローを視覚化
 * - シンプルでわかりやすいUI設計
 * - 現在のアクションを明確に表示
 * - モバイルファーストのレスポンシブデザイン
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Circle, Upload, FileImage, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/dashboard';
import { OrderFileUploadSection } from '@/app/member/orders/[id]/OrderFileUploadSection';
import { DesignRevisionsSection } from '@/components/member/DesignRevisionsSection';
import { FileResubmissionSection } from '@/components/member/FileResubmissionSection';

// =====================================================
// Types
// =====================================================

interface DesignWorkflowSectionProps {
  order: Order;
}

interface DesignRevision {
  id: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface FilesResponse {
  files?: Array<{
    id: string;
  }>;
}

// =====================================================
// Step Card Component (Improved)
// =====================================================

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
  isPending?: boolean;
  children: React.ReactNode;
  guidance?: React.ReactNode;
  actionCount?: number;
  onToggle?: () => void;
  isExpanded?: boolean;
}

function StepCard({
  stepNumber,
  title,
  description,
  icon,
  isCompleted = false,
  isActive = false,
  isPending = false,
  children,
  guidance,
  actionCount = 0,
  onToggle,
  isExpanded = true,
}: StepCardProps) {
  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-200',
      isActive && 'ring-2 ring-blue-500 shadow-lg',
      isCompleted && 'bg-green-50/30',
      !isActive && !isCompleted && 'bg-white'
    )}>
      {/* ステップヘッダー（クリックで展開/折りたたみ） */}
      <div
        className={cn(
          'p-4 cursor-pointer transition-colors',
          isActive && 'bg-blue-50/50'
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* ステップインジケーター */}
          <div className="flex-shrink-0 relative">
            {isCompleted ? (
              <div className="w-12 h-12 rounded-full bg-green-500 border-4 border-green-100 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            ) : isActive ? (
              <div className="w-12 h-12 rounded-full bg-blue-500 border-4 border-blue-100 flex items-center justify-center shadow-sm animate-pulse">
                <span className="text-white font-bold text-lg">{stepNumber}</span>
              </div>
            ) : isPending ? (
              <div className="w-12 h-12 rounded-full bg-amber-500 border-4 border-amber-100 flex items-center justify-center shadow-sm">
                {icon}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 border-4 border-gray-100 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-lg">{stepNumber}</span>
              </div>
            )}
          </div>

          {/* タイトルと説明 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-bold text-lg",
                isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-700"
              )}>
                {title}
              </h3>
              {actionCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                  {actionCount}件
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>

          {/* 展開/折りたたみアイコン */}
          {onToggle && (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ガイダンスメッセージ（アクティブステップの場合） */}
      {guidance && isExpanded && (
        <div className="px-4 pb-3">
          <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-800 font-medium">{guidance}</p>
          </div>
        </div>
      )}

      {/* ステップコンテンツ */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-gray-200 pt-4">
            {children}
          </div>
        </div>
      )}
    </Card>
  );
}

// =====================================================
// Main Component (Improved)
// =====================================================

export function DesignWorkflowSection({ order }: DesignWorkflowSectionProps) {
  const [hasFiles, setHasFiles] = useState(false);
  const [pendingRevisionsCount, setPendingRevisionsCount] = useState(0);
  const [hasApprovedRevision, setHasApprovedRevision] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // ファイルとリビジョン状態を取得
  const loadWorkflowStatus = useCallback(async () => {
    try {
      setLoading(true);

      // ファイルアップロード状態を確認
      const filesResponse = await fetch(`/api/member/orders/${order.id}/data-receipt`);
      const filesResult: FilesResponse = await filesResponse.json();
      setHasFiles((filesResult.files?.length || 0) > 0);

      // リビジョン状態を確認
      const revisionsResponse = await fetch(`/api/member/orders/${order.id}/design-revisions`);
      const revisionsResult = await revisionsResponse.json();
      if (revisionsResult.success) {
        const revisions = revisionsResult.revisions || [];
        setPendingRevisionsCount(revisions.filter((r: DesignRevision) => r.approval_status === 'pending').length);
        setHasApprovedRevision(revisions.some((r: DesignRevision) => r.approval_status === 'approved'));
      }
    } catch (err) {
      console.error('[DesignWorkflowSection] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [order.id]);

  // マウント時に状態を取得
  useEffect(() => {
    loadWorkflowStatus();
  }, [loadWorkflowStatus]);

  // 現在のワークフローステップを判定
  const getCurrentStep = () => {
    // リビジョンが承認されたら完了
    if (hasApprovedRevision) return 3;

    // 保留中のリビジョンがあればStep 2
    if (pendingRevisionsCount > 0) return 2;

    // ファイルがアップロードされていれば、リビジョン待ち
    if (hasFiles) return 1.5;

    // ファイル未アップロード
    return 1;
  };

  const currentStep = getCurrentStep();

  // 初期状態：現在のステップを展開
  useEffect(() => {
    if (expandedStep === null) {
      setExpandedStep(Math.ceil(currentStep));
    }
  }, [currentStep, expandedStep]);

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          デザインワークフロー
        </h2>
        <p className="text-gray-600">
          ファイル入稿から校正承認までの進捗を確認できます
        </p>
      </div>

      {/* 進捗バー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">進捗</span>
          <span className="text-sm text-gray-600">
            {hasApprovedRevision ? '完了' : hasFiles ? '進行中' : '開始前'}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              hasApprovedRevision ? "bg-green-500 w-full" : hasFiles ? "bg-blue-500 w-1/2" : "bg-gray-400 w-0"
            )}
          ></div>
        </div>
      </div>

      {/* ステップリスト（縦積みレイアウト） */}
      <div className="space-y-4">
        {/* Step 1: ファイル入稿 */}
        <StepCard
          stepNumber={1}
          title="ファイル入稿"
          description={
            hasFiles
              ? "入稿データがアップロードされました"
              : "デザインファイル（AI）をアップロードしてください"
          }
          icon={<Upload className="w-5 h-5" />}
          isCompleted={currentStep > 1.5}
          isActive={currentStep === 1}
          isPending={currentStep === 1.5}
          guidance={currentStep === 1 && "↓ 下のフォームからファイルをアップロードしてください"}
          actionCount={hasFiles ? 0 : 1}
          onToggle={() => toggleStep(1)}
          isExpanded={expandedStep === 1}
        >
          <OrderFileUploadSection order={order} onFileUploaded={loadWorkflowStatus} />

          {/* File Re-submission Section */}
          {hasFiles && (
            <FileResubmissionSection
              orderId={order.id}
              orderNumber={order.orderNumber}
              onFileResubmitted={loadWorkflowStatus}
            />
          )}
        </StepCard>

        {/* Step 2: 校正確認 */}
        <StepCard
          stepNumber={2}
          title="校正確認"
          description={
            pendingRevisionsCount > 0
              ? `${pendingRevisionsCount}件の校正データが届きました`
              : hasFiles
              ? "韓国デザイナーが校正データを作成中です"
              : "ファイル入稿完了後に開始されます"
          }
          icon={<FileImage className="w-5 h-5" />}
          isCompleted={currentStep >= 3}
          isActive={currentStep === 2 || currentStep === 1.5}
          isPending={hasFiles && pendingRevisionsCount === 0}
          guidance={
            (currentStep === 2 || currentStep === 1.5) && pendingRevisionsCount > 0
              ? "↓ プレビューをご確認の上、承認ボタンを押してください"
              : undefined
          }
          actionCount={pendingRevisionsCount}
          onToggle={() => toggleStep(2)}
          isExpanded={expandedStep === 2}
        >
          <DesignRevisionsSection
            orderId={order.id}
            onRevisionResponded={loadWorkflowStatus}
          />
        </StepCard>
      </div>

      {/* 完了メッセージ */}
      {hasApprovedRevision && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">デザインワークフロー完了</p>
            <p className="text-sm text-green-700 mt-1">
              全ての校正データが承認されました。次のステップ（契約・制作）に進みます。
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
