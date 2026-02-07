/**
 * Design Workflow Section Component
 *
 * デザインワークフローセクションコンポーネント
 * - ファイル入稿 → 校正確認 のワークフローを視覚化
 * - 2列レイアウトでステップを並列表示
 * - 各ステップ内にコメントセクションを配置
 * - モバイル: 1列、タブレット以上: 2列
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Circle, Upload, FileImage, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/dashboard';
import { OrderFileUploadSection } from '@/app/member/orders/[id]/OrderFileUploadSection';
import { DesignRevisionsSection } from '@/components/member/DesignRevisionsSection';
import { OrderCommentsSectionWrapper } from '@/components/orders/OrderCommentsSection';

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
// Step Card Component
// =====================================================

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
  commentSection?: React.ReactNode;
  guidance?: React.ReactNode;
}

function StepCard({
  stepNumber,
  title,
  description,
  icon,
  isCompleted = false,
  isActive = false,
  children,
  commentSection,
  guidance,
}: StepCardProps) {
  return (
    <Card className={cn(
      'p-4 h-full flex flex-col min-h-[500px]', // 最小高さを設定してカードの高さを揃える
      isActive && 'ring-2 ring-blue-500',
      isCompleted && 'bg-green-50/50'
    )}>
      {/* ステップヘッダー */}
      <div className="flex items-start gap-3 mb-4">
        {/* ステップインジケーター */}
        <div className="flex-shrink-0 relative z-10">
          {isCompleted ? (
            <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          ) : isActive ? (
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center animate-pulse">
              {icon}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
              <Circle className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* タイトルと説明 */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-base",
            isActive ? "text-blue-600" : "text-text-primary",
            isCompleted && "text-green-600"
          )}>
            Step {stepNumber}: {title}
          </h3>
          <p className="text-sm text-text-muted mt-1">{description}</p>
        </div>
      </div>

      {/* ガイダンスメッセージ（アクティブステップの場合） */}
      {guidance && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{guidance}</p>
        </div>
      )}

      {/* ステップコンテンツ */}
      <div className="flex-1 space-y-4 flex flex-col">
        <div className="border-t border-border-secondary pt-4">
          {children}
        </div>

        {/* コメントセクション（各ステップ内に配置） */}
        {commentSection && (
          <div className="border-t border-border-secondary pt-4 flex-1 flex flex-col min-h-0">
            {commentSection}
          </div>
        )}
      </div>
    </Card>
  );
}

// =====================================================
// Main Component
// =====================================================

export function DesignWorkflowSection({ order }: DesignWorkflowSectionProps) {
  const [hasFiles, setHasFiles] = useState(false);
  const [pendingRevisionsCount, setPendingRevisionsCount] = useState(0);
  const [hasApprovedRevision, setHasApprovedRevision] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-2">
          デザインワークフロー
        </h2>
        <p className="text-text-muted text-sm">
          ファイル入稿から校正承認までの進捗を確認できます
        </p>
      </div>

      {/* 2列グリッドレイアウト: モバイル1列、タブレット以上2列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: ファイル入稿 */}
        <StepCard
          stepNumber={1}
          title="デザインファイル入稿"
          description="入稿データ（AI）をアップロードしてください"
          icon={<Upload className="w-5 h-5 text-blue-600" />}
          isCompleted={currentStep > 1.5}
          isActive={currentStep === 1}
          guidance={currentStep === 1 && "AIファイルをアップロードして、制作を開始してください"}
        >
          <OrderFileUploadSection order={order} onFileUploaded={loadWorkflowStatus} />
        </StepCard>

        {/* Step 2: 校正確認 */}
        <StepCard
          stepNumber={2}
          title="デザイン校正確認"
          description={
            pendingRevisionsCount > 0
              ? `校正データが届きました（${pendingRevisionsCount}件の承認待ち）`
              : "管理者がアップロードした校正データを確認・承認してください"
          }
          icon={<FileImage className="w-5 h-5 text-blue-600" />}
          isCompleted={currentStep >= 3}
          isActive={currentStep === 2 || currentStep === 1.5}
          guidance={
            (currentStep === 2 || currentStep === 1.5) && pendingRevisionsCount > 0
              ? "✓ 校正データが到着しました。プレビューを確認の上、承認ボタンを押してください"
              : undefined
          }
          commentSection={
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-sm font-medium text-text-primary mb-2">
                校正確認に関するコメント
              </h4>
              <div className="flex-1 min-h-0">
                <OrderCommentsSectionWrapper orderId={order.id} compact={true} maxHeight="400px" />
              </div>
            </div>
          }
        >
          <DesignRevisionsSection
            orderId={order.id}
            onRevisionResponded={loadWorkflowStatus}
          />
        </StepCard>
      </div>
    </Card>
  );
}
