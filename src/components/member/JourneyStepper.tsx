/**
 * Journey Stepper Component (Member)
 *
 * 見積→注文→入稿→校正→承認 の顧客ジャーニー進行ステッパー
 *
 * 役割の区分（DesignWorkflowSection との補完関係）:
 * - このコンポーネント: ページをまたぐ顧客ジャーニー全体の「現在地」表示
 * - DesignWorkflowSection: 1つの注文内の作業ステップ（入稿→校正承認）の操作UI
 *
 * アニメーションは機能的案内のみ（装飾ではない）:
 * - 現在地ドットの強調リング（どこにいるかを示す）
 * - 完了チェックの描画（通過したことを確認させる）
 * - prefers-reduced-motion 時はアニメーションなし
 *
 * @client
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JOURNEY_STAGES, type JourneyStageResult } from '@/lib/journey-stage';

interface JourneyStepperProps {
  journey: JourneyStageResult;
  className?: string;
}

export function JourneyStepper({ journey, className }: JourneyStepperProps) {
  const prefersReducedMotion = useReducedMotion();
  // SSR/초기 클라이언트 렌더 일치를 위해 마운트 전에는 비애니메이션 버전 사용
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const disableAnimation = !isMounted || !!prefersReducedMotion;

  // キャンセル時はステッパーを表示しない（誤解を招くため）
  if (journey.isCancelled) {
    return null;
  }

  return (
    <nav
      aria-label="進行状況"
      className={cn('flex items-center w-full', className)}
    >
      {JOURNEY_STAGES.map((stage, index) => {
        const state = journey.stageStates[stage.key];
        const isLast = index === JOURNEY_STAGES.length - 1;

        return (
          <div
            key={stage.key}
            className={cn('flex items-center', !isLast && 'flex-1')}
          >
            {/* ステージノード */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                {state === 'current' && !disableAnimation && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary-500/30"
                    animate={{
                      scale: [1, 1.35, 1],
                      opacity: [0.7, 0.2, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                <div
                  className={cn(
                    'relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                    state === 'done' &&
                      'bg-primary-500 border-primary-500 text-white',
                    state === 'current' &&
                      'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/40',
                    state === 'upcoming' &&
                      'bg-gray-100 border-gray-300 text-gray-400'
                  )}
                >
                  {state === 'done' ? (
                    disableAnimation ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 25,
                        }}
                        className="flex"
                      >
                        <Check className="w-4 h-4" />
                      </motion.span>
                    )
                  ) : (
                    <span
                      className={cn(
                        'text-xs font-bold',
                        state === 'current' && 'text-white',
                        state === 'upcoming' && 'text-gray-400'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
              </div>
              <span
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  state === 'done' && 'text-primary-600',
                  state === 'current' && 'text-primary-700 font-bold',
                  state === 'upcoming' && 'text-gray-400'
                )}
              >
                {stage.label}
                {state === 'current' && (
                  <span className="block text-[10px] font-semibold text-primary-500 text-center">
                    進行中
                  </span>
                )}
              </span>
            </div>

            {/* 接続線 */}
            {!isLast && (
              <div className="flex-1 h-0.5 mx-1 mb-5 overflow-hidden rounded bg-gray-200">
                {state === 'done' && (
                  disableAnimation ? (
                    <div className="h-full w-full bg-primary-500" />
                  ) : (
                    <motion.div
                      className="h-full bg-primary-500"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
