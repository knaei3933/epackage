/**
 * Production Progress Visualizer Component
 *
 * 製造進捗可視化コンポーネント
 *
 * Horizontal stepper component showing 9 production stages
 * with color-coded status, icons, and progress animation
 */

'use client';

import React, { useState } from 'react';
import type { ProductionStage, ProductionStageData } from '@/types/production';
import {
  PRODUCTION_STAGE_LABELS,
  STAGE_STATUS_LABELS,
  getProductionStages,
} from '@/types/production';

// =====================================================
// Props Interface
// =====================================================

interface ProductionProgressVisualizerProps {
  currentStage: ProductionStage;
  stages: Record<ProductionStage, ProductionStageData>;
  onStageClick?: (stage: ProductionStage) => void;
  compact?: boolean;  // Show compact version for smaller screens
  locale?: 'ja' | 'ko' | 'en';
}

// =====================================================
// Main Component
// =====================================================

export function ProductionProgressVisualizer({
  currentStage,
  stages,
  onStageClick,
  compact = false,
  locale = 'ja',
}: ProductionProgressVisualizerProps) {
  const [hoveredStage, setHoveredStage] = useState<ProductionStage | null>(null);
  const productionStages = getProductionStages();

  const currentStageIndex = productionStages.indexOf(currentStage);

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{
              width: `${calculateOverallProgress(stages)}%`,
            }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Stage Stepper */}
      <div className={compact ? 'flex flex-col gap-2' : 'flex items-center justify-between'}>
        {productionStages.map((stage, index) => {
          const stageData = stages[stage];
          const isCompleted = stageData.status === 'completed';
          const isCurrent = stage === currentStage;
          const isPending = stageData.status === 'pending';
          const isDelayed = stageData.status === 'delayed';
          const isClickable = onStageClick && (isCompleted || isCurrent || index === currentStageIndex + 1);

          const stageLabel = PRODUCTION_STAGE_LABELS[stage];
          const statusLabel = STAGE_STATUS_LABELS[stageData.status];

          return (
            <div
              key={stage}
              className={compact ? 'flex items-center gap-2' : 'flex flex-col items-center flex-1'}
              onMouseEnter={() => setHoveredStage(stage)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              <div className="relative w-full">
                {/* Connection Line */}
                {!compact && index < productionStages.length - 1 && (
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
                    onClick={() => isClickable && onStageClick(stage)}
                    disabled={!isClickable}
                    className={`
                      relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base
                      transition-all duration-300 z-10
                      ${isCompleted
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : isCurrent
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 animate-pulse'
                        : isDelayed
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-gray-200 text-gray-500'
                      }
                      ${isClickable
                        ? 'cursor-pointer hover:scale-110 hover:shadow-xl'
                        : 'cursor-default'
                      }
                      ${compact ? 'w-6 h-6 text-xs' : ''}
                    `}
                    title={stageLabel[locale]}
                  >
                    {isCompleted ? (
                      // Checkmark for completed stages
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      // Stage icon for others
                      <span>{stageLabel.icon}</span>
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
              {!compact && (
                <div className="mt-2 text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-900">
                    {index + 1}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {stageLabel[locale]}
                  </p>
                  {isDelayed && (
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${statusLabel.bgColor} ${statusLabel.color}`}>
                      {statusLabel[locale]}
                    </span>
                  )}
                </div>
              )}

              {/* Compact Label */}
              {compact && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">{index + 1}.</span>
                    <span className="text-xs font-medium text-gray-900">
                      {stageLabel[locale]}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredStage && !compact && (
        <StageTooltip
          stage={hoveredStage}
          stageData={stages[hoveredStage]}
          locale={locale}
        />
      )}
    </div>
  );
}

// =====================================================
// Tooltip Component
// =====================================================

interface StageTooltipProps {
  stage: ProductionStage;
  stageData: ProductionStageData;
  locale: 'ja' | 'ko' | 'en';
}

function StageTooltip({ stage, stageData, locale }: StageTooltipProps) {
  const stageLabel = PRODUCTION_STAGE_LABELS[stage];
  const statusLabel = STAGE_STATUS_LABELS[stageData.status];

  return (
    <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{stageLabel.icon}</span>
        <div>
          <p className="font-semibold text-gray-900">{stageLabel[locale]}</p>
          <span className={`inline-block px-2 py-0.5 text-xs rounded ${statusLabel.bgColor} ${statusLabel.color}`}>
            {statusLabel[locale]}
          </span>
        </div>
      </div>

      {stageData.completed_at && (
        <p className="text-xs text-gray-600">
          {locale === 'ja' ? '完了日時' : locale === 'ko' ? '완료일시' : 'Completed'}: {new Date(stageData.completed_at).toLocaleString(locale === 'ja' ? 'ja-JP' : locale === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
      )}

      {stageData.assigned_to && (
        <p className="text-xs text-gray-600">
          {locale === 'ja' ? '担当者' : locale === 'ko' ? '담당자' : 'Assigned'}: {stageData.assigned_to}
        </p>
      )}

      {stageData.notes && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          {stageData.notes}
        </p>
      )}

      {stageData.photos && stageData.photos.length > 0 && (
        <p className="text-xs text-gray-600 mt-2">
          {locale === 'ja' ? '写真' : locale === 'ko' ? '사진' : 'Photos'}: {stageData.photos.length}
        </p>
      )}
    </div>
  );
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Calculate overall production progress
 */
function calculateOverallProgress(
  stages: Record<ProductionStage, ProductionStageData>
): number {
  const productionStages = getProductionStages();
  let completedCount = 0;
  let inProgressWeight = 0;

  for (const stage of productionStages) {
    const data = stages[stage];
    if (data.status === 'completed') {
      completedCount += 1;
    } else if (data.status === 'in_progress') {
      inProgressWeight += 0.5;
    }
  }

  return Math.round(((completedCount + inProgressWeight) / productionStages.length) * 100);
}

// =====================================================
// Compact Variant (for Mobile)
// =====================================================

interface ProductionProgressCompactProps {
  currentStage: ProductionStage;
  stages: Record<ProductionStage, ProductionStageData>;
  locale?: 'ja' | 'ko' | 'en';
}

export function ProductionProgressCompact({
  currentStage,
  stages,
  locale = 'ja',
}: ProductionProgressCompactProps) {
  const stageLabel = PRODUCTION_STAGE_LABELS[currentStage];
  const stageData = stages[currentStage];
  const statusLabel = STAGE_STATUS_LABELS[stageData.status];
  const progress = calculateOverallProgress(stages);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      {/* Current Stage Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{stageLabel.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {stageLabel[locale]}
            </p>
            <span className={`inline-block px-2 py-0.5 text-xs rounded ${statusLabel.bgColor} ${statusLabel.color}`}>
              {statusLabel[locale]}
            </span>
          </div>
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
      {stageData.photos && stageData.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {stageData.photos.slice(0, 3).map((photo, index) => (
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
          {stageData.photos.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-600">
              +{stageData.photos.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductionProgressVisualizer;
