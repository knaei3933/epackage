'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

interface ResponsiveStepIndicatorsProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
  isStepCompleted: (index: number) => boolean;
}

export function ResponsiveStepIndicators({
  steps,
  currentStep,
  onStepClick,
  isStepCompleted,
}: ResponsiveStepIndicatorsProps) {
  // 進捗バーのパーセンテージ計算（currentStep は 0-indexed）
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <>
      {/* Mobile: Vertical Step Indicators */}
      <nav
        className="lg:hidden flex flex-col gap-1.5 mt-2 mb-4 md:mt-3 md:mb-5"
        aria-label="見積もり作成のステップ"
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = isStepCompleted(index);

          return (
            <button
              key={step.id}
              data-testid={isActive ? `step-${index + 1}-active` : `step-${index + 1}`}
              onClick={() => isCompleted && onStepClick(index)}
              disabled={!isCompleted}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all min-h-[44px] md:min-h-[48px] ${
                isActive
                  ? 'bg-navy-700 text-white shadow-lg ring-4 ring-navy-200'
                  : isCompleted
                  ? 'bg-green-50 border-2 border-green-300 text-green-800 hover:bg-green-100'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label={`${step.title} - ${
                isCompleted ? '完了' : isActive ? '現在のステップ' : '利用できません'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all font-semibold text-sm ${
                  isActive
                    ? 'bg-white/20'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-sm truncate ${
                    isActive ? 'text-white' : isCompleted ? 'text-green-800' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </div>
                <div
                  className={`text-xs truncate ${
                    isActive ? 'text-white/80' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  {step.description}
                </div>
              </div>

              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Tablet+: Horizontal Step Indicators */}
      <nav
        className="hidden lg:flex justify-between mt-3 md:mt-4 mb-3 md:mb-4 max-w-4xl mx-auto"
        aria-label="見積もり作成のステップ"
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = isStepCompleted(index);

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center relative ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <button
                data-testid={isActive ? `step-${index + 1}-active` : `step-${index + 1}`}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 font-semibold text-sm ${
                  isActive
                    ? 'bg-navy-700 text-white shadow-lg scale-110 ring-4 ring-navy-200 focus:ring-navy-400'
                    : isCompleted
                    ? 'bg-green-600 text-white shadow-md focus:ring-green-400'
                    : 'bg-gray-300 text-gray-600 focus:ring-gray-400'
                }`}
                onClick={() => isCompleted && onStepClick(index)}
                disabled={!isCompleted}
                aria-label={`${step.title} - ${
                  isCompleted ? '完了' : isActive ? '現在のステップ' : '利用できません'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
              </button>

              <div className="mt-2 text-center">
                <span
                  className={`text-xs sm:text-sm transition-colors block ${
                    isActive
                      ? 'text-navy-700 font-semibold'
                      : isCompleted
                      ? 'text-green-700 font-medium'
                      : 'text-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  {step.title}
                </span>
                <span
                  className={`text-[10px] sm:text-xs mt-0.5 block leading-tight ${
                    isActive
                      ? 'text-navy-600'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  {step.description}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-10 h-0.5 -ml-5 transition-colors duration-300 ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                  style={{ width: 'calc(100% - 44px)' }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Progress Bar */}
      <div className="hidden lg:block max-w-4xl mx-auto mb-5 md:mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-600 font-medium">進捗状況</span>
          <span className="text-xs font-bold text-navy-700" aria-live="polite">
            {progressPercent}% 完了
          </span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2 md:h-2.5 shadow-inner overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="見積もり作成の進捗状況"
        >
          <div
            className="bg-gradient-to-r from-navy-600 to-navy-700 h-2 md:h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  );
}
