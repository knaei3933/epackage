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
                      ? 'bg-blue-600 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      index === currentStep ? 'text-blue-600' : 'text-gray-600'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1">
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
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              currentStep === steps.length - 1 ? 'bg-green-500' : 'bg-blue-600'
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
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleBack}
          disabled={!canGoBack}
          className={cn(
            'px-6 py-2 rounded-lg font-medium transition-colors',
            canGoBack
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          戻る
        </button>

        <div className="text-sm text-gray-600">
          ステップ {currentStep + 1} / {steps.length}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className={cn(
            'px-6 py-2 rounded-lg font-medium transition-colors',
            canGoForward
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          )}
        >
          {canGoForward ? '次へ' : '完了'}
        </button>
      </div>
    </div>
  );
}

export default Wizard;
