/**
 * Shared Production Progress Component
 * 共用製造進捗コンポーネント
 *
 * Unified production progress component supporting:
 * - Vertical widget (Portal style) - Simple, compact
 * - Horizontal stepper (Admin style) - Full-featured with tooltips
 * - Compact dots view - For mobile/small spaces
 * - Progress percentage calculation
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// Types
// =====================================================

export type ProductionStageStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface ProductionStage {
  id: string;
  name_ja: string;
  name_en?: string;
  name_ko?: string;
  status: ProductionStageStatus;
  completed_at?: string;
  notes?: string;
  assigned_to?: string;
  photos?: string[];
}

export interface ProductionProgressProps {
  stages: ProductionStage[];
  currentStageIndex: number;
  variant?: 'vertical' | 'horizontal' | 'compact' | 'dots';
  locale?: 'ja' | 'ko' | 'en';
  onStageClick?: (stage: ProductionStage, index: number) => void;
  showPercentage?: boolean;
  className?: string;
}

// =====================================================
// Helper Functions
// =====================================================

function calculateProgress(stages: ProductionStage[], currentIndex: number): number {
  if (stages.length === 0) return 0;

  let completedCount = 0;
  let inProgressWeight = 0;

  stages.forEach((stage, index) => {
    if (stage.status === 'completed' || index < currentIndex) {
      completedCount += 1;
    } else if (stage.status === 'in_progress' || index === currentIndex) {
      inProgressWeight += 0.5;
    }
  });

  return Math.round(((completedCount + inProgressWeight) / stages.length) * 100);
}

// =====================================================
// Vertical Widget (Portal style)
// =====================================================

function VerticalProgressWidget({
  stages,
  currentStageIndex,
  locale = 'ja'
}: Pick<ProductionProgressProps, 'stages' | 'currentStageIndex' | 'locale'>) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
        {locale === 'ja' ? '製造進捗状況' : 'Production Progress'}
      </h3>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'completed';
          const isInProgress = stage.status === 'in_progress';
          const isPending = stage.status === 'pending';
          const isCurrent = index === currentStageIndex;

          return (
            <div key={stage.id} className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isInProgress || isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                  </div>
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={cn(
                    'text-sm font-medium',
                    isCompleted || isInProgress || isCurrent
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  )}>
                    {stage.name_ja}
                  </p>
                  {stage.completed_at && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(stage.completed_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                {stage.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {stage.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// Horizontal Stepper (Admin style)
// =====================================================

interface HorizontalStepperProps {
  stages: ProductionStage[];
  currentStageIndex: number;
  locale?: 'ja' | 'ko' | 'en';
  onStageClick?: (stage: ProductionStage, index: number) => void;
}

function HorizontalStepper({
  stages,
  currentStageIndex,
  locale = 'ja',
  onStageClick
}: HorizontalStepperProps) {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const progress = calculateProgress(stages, currentStageIndex);

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Stage Stepper */}
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'completed' || index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isDelayed = stage.status === 'delayed';
          const isClickable = onStageClick && (isCompleted || isCurrent || index === currentStageIndex + 1);

          return (
            <div
              key={stage.id}
              className="flex flex-col items-center flex-1"
              onMouseEnter={() => setHoveredStage(index)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              <div className="relative w-full">
                {/* Connection Line */}
                {index < stages.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 bg-gray-300">
                    {isCompleted && (
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: '100%' }}
                      />
                    )}
                  </div>
                )}

                {/* Stage Circle */}
                <div className="relative flex justify-center">
                  <button
                    onClick={() => isClickable && onStageClick(stage, index)}
                    disabled={!isClickable}
                    className={cn(
                      'relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base',
                      'transition-all duration-300 z-10',
                      isCompleted
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : isCurrent
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 animate-pulse'
                        : isDelayed
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-gray-200 text-gray-500',
                      isClickable
                        ? 'cursor-pointer hover:scale-110 hover:shadow-xl'
                        : 'cursor-default'
                    )}
                    title={stage.name_ja}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>

                  {/* Current Stage Indicator */}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stage Label */}
              <div className="mt-2 text-center">
                <p className="text-xs md:text-sm font-medium text-gray-900">
                  {index + 1}
                </p>
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                  {stage.name_ja}
                </p>
                {isDelayed && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">
                    {locale === 'ja' ? '遅延' : locale === 'ko' ? '지연' : 'Delayed'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// Compact Progress Widget
// =====================================================

function CompactProgressWidget({
  stages,
  currentStageIndex
}: Pick<ProductionProgressProps, 'stages' | 'currentStageIndex'>) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => {
        const isCompleted = stage.status === 'completed' || index < currentStageIndex;
        const isInProgress = stage.status === 'in_progress' || index === currentStageIndex;

        return (
          <React.Fragment key={stage.id}>
            {/* Progress Dot */}
            <div
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                isCompleted && 'bg-green-500',
                isInProgress && 'bg-blue-500 animate-pulse',
                !isCompleted && !isInProgress && 'bg-slate-300 dark:bg-slate-600'
              )}
              title={stage.name_ja}
            />

            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-4 flex-shrink-0',
                  index < currentStageIndex ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// =====================================================
// Dots View (Mobile)
// =====================================================

function DotsProgressView({
  stages,
  currentStageIndex,
  locale = 'ja'
}: Pick<ProductionProgressProps, 'stages' | 'currentStageIndex' | 'locale'>) {
  const progress = calculateProgress(stages, currentStageIndex);
  const currentStage = stages[currentStageIndex];

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      {/* Current Stage Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {currentStage?.name_ja}
          </p>
          <span className={cn(
            'inline-block px-2 py-0.5 text-xs rounded',
            currentStage?.status === 'completed' ? 'bg-green-100 text-green-800' :
            currentStage?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            currentStage?.status === 'delayed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          )}>
            {currentStage?.status === 'completed' ? '完了' :
             currentStage?.status === 'in_progress' ? '進行中' :
             currentStage?.status === 'delayed' ? '遅延' : '待機'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{progress}%</p>
          <p className="text-xs text-gray-600">
            {locale === 'ja' ? '進捗' : locale === 'ko' ? '진행률' : 'Progress'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage Photos Thumbnail */}
      {currentStage?.photos && currentStage.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {currentStage.photos.slice(0, 3).map((photo, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={photo}
                alt={`Stage photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {currentStage.photos.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-600">
              +{currentStage.photos.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export function ProductionProgress({
  stages,
  currentStageIndex,
  variant = 'vertical',
  locale = 'ja',
  onStageClick,
  showPercentage = true,
  className
}: ProductionProgressProps) {
  const progress = calculateProgress(stages, currentStageIndex);

  return (
    <div className={className}>
      {showPercentage && variant !== 'dots' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
            <span>{locale === 'ja' ? '進捗' : locale === 'ko' ? '진행률' : 'Progress'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {variant === 'vertical' && (
        <VerticalProgressWidget
          stages={stages}
          currentStageIndex={currentStageIndex}
          locale={locale}
        />
      )}

      {variant === 'horizontal' && (
        <HorizontalStepper
          stages={stages}
          currentStageIndex={currentStageIndex}
          locale={locale}
          onStageClick={onStageClick}
        />
      )}

      {variant === 'compact' && (
        <CompactProgressWidget
          stages={stages}
          currentStageIndex={currentStageIndex}
        />
      )}

      {variant === 'dots' && (
        <DotsProgressView
          stages={stages}
          currentStageIndex={currentStageIndex}
          locale={locale}
        />
      )}
    </div>
  );
}

export default ProductionProgress;
