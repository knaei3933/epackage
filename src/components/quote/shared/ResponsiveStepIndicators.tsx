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
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-container text-left transition-colors min-h-[44px] md:min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                isActive || isCompleted
                  ? 'bg-brand text-on-brand'
                  : 'border border-border-strong text-text-muted cursor-not-allowed'
              }`}
              aria-label={`${step.title} - ${
                isCompleted ? '完了' : isActive ? '現在のステップ' : '利用できません'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                  isActive || isCompleted
                    ? 'bg-bg-primary text-brand'
                    : 'border border-border-strong text-text-muted'
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
                  className="font-semibold text-sm truncate"
                >
                  {step.title}
                </div>
                <div
                  className="text-xs truncate"
                  aria-hidden="true"
                >
                  {step.description}
                </div>
              </div>

              {isActive && (
                <div className="w-2 h-2 bg-bg-primary rounded-full" aria-hidden="true" />
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
              className="flex flex-col items-center relative flex-1"
            >
              <button
                data-testid={isActive ? `step-${index + 1}-active` : `step-${index + 1}`}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 font-semibold text-sm ${
                  isActive
                    ? 'bg-brand text-on-brand ring-2 ring-brand ring-offset-2'
                    : isCompleted
                    ? 'bg-brand text-on-brand'
                    : 'border border-border-strong text-text-muted'
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
                      ? 'text-text-primary font-semibold'
                      : isCompleted
                      ? 'text-text-primary font-medium'
                      : 'text-text-muted'
                  }`}
                  aria-hidden="true"
                >
                  {step.title}
                </span>
                <span
                  className={`text-xs mt-0.5 block leading-tight ${
                    isActive || isCompleted ? 'text-text-secondary' : 'text-text-muted'
                  }`}
                  aria-hidden="true"
                >
                  {step.description}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 h-0.5 left-[calc(50%+28px)] w-[calc(100%-56px)] transition-colors duration-300 ${
                    isCompleted ? 'bg-brand' : 'bg-border-medium'
                  }`}
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
          <span className="text-xs text-text-secondary font-medium">進捗状況</span>
          <span className="text-xs font-bold text-brand" aria-live="polite">
            {progressPercent}% 完了
          </span>
        </div>
        <div
          className="w-full bg-bg-muted rounded-full h-2 md:h-2.5 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="見積もり作成の進捗状況"
        >
          <div
            className="bg-brand h-2 md:h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  );
}
