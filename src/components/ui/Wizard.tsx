'use client';

import React, { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

export interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  children: ReactNode;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export function Wizard({ steps, currentStep, children, onComplete, onStepChange }: WizardProps) {
  const canGoBack = currentStep > 0;
  const canGoForward = currentStep < steps.length - 1;

  const handleBack = () => {
    if (canGoBack && onStepChange) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward && onStepChange) {
      onStepChange(currentStep + 1);
    } else if (!canGoForward && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                    index === currentStep
                      ? 'bg-brand text-white'
                      : index < currentStep
                      ? 'bg-success text-white'
                      : 'bg-bg-muted text-text-muted'
                  )}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      index === currentStep ? 'text-brand' : 'text-text-secondary'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-text-muted mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 mt-5">
                  <div
                    className={cn(
                      'h-full rounded transition-colors',
                      index < currentStep ? 'bg-success' : 'bg-bg-muted'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 bg-bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              currentStep === steps.length - 1 ? 'bg-success' : 'bg-brand'
            )}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {React.Children.map(children, (child, index) => (
          <div key={index} className={index === currentStep ? 'block' : 'hidden'}>
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-border-medium">
        <button
          type="button"
          onClick={handleBack}
          disabled={!canGoBack}
          className={cn(
            'px-6 py-2 rounded-lg font-medium transition-colors',
            canGoBack
              ? 'bg-bg-muted text-text-secondary hover:bg-bg-accent'
              : 'bg-bg-muted text-text-muted cursor-not-allowed'
          )}
        >
          戻る
        </button>

        <div className="text-sm text-text-secondary">
          ステップ {currentStep + 1} / {steps.length}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className={cn(
            'px-6 py-2 rounded-lg font-medium transition-colors',
            canGoForward
              ? 'bg-brand text-white hover:bg-brand-hover'
              : 'bg-success text-white hover:brightness-90'
          )}
        >
          {canGoForward ? '次へ' : '完了'}
        </button>
      </div>
    </div>
  );
}

export default Wizard;
