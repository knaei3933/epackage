/**
 * Production Progress Widget Component
 * 製造進捗ウィジェット
 *
 * Displays the 9-stage production progress with visual indicators
 */

'use client';

import React from 'react';
import { type PortalProductionStage } from '@/types/portal';
import { cn } from '@/lib/utils';

interface ProductionProgressWidgetProps {
  stages: PortalProductionStage[];
  currentStageIndex: number;
}

export function ProductionProgressWidget({ stages, currentStageIndex }: ProductionProgressWidgetProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
        製造進捗状況
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

              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className="absolute left-3 mt-8 w-0.5 h-6 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CompactProgressWidgetProps {
  stages: PortalProductionStage[];
  currentStageIndex: number;
}

export function CompactProgressWidget({ stages, currentStageIndex }: CompactProgressWidgetProps) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => {
        const isCompleted = stage.status === 'completed';
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
