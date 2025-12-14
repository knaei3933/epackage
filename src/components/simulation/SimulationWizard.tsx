'use client';

import React from 'react';
import { useSimulation } from './SimulationContext';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { StepThree } from './StepThree';
import { Container, Button, Badge } from '@/components/ui';
import { Package, Calculator, FileText, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SimulationWizard() {
  const { currentStep, validateCurrentStep, isFormValid, resetForm, previousStep, nextStep } = useSimulation();

  const stepIcons = [
    { icon: Package, label: '基本設定', description: 'バッグタイプ、サイズ、材料を選択' },
    { icon: Calculator, label: '数量と納期', description: '数量パターンと納期を設定' },
    { icon: FileText, label: '見積り結果', description: '価格比較とPDFダウンロード' },
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <StepOne />;
      case 2: return <StepTwo />;
      case 3: return <StepThree onPrevious={previousStep} onReset={resetForm} />;
      default: return <StepOne />;
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <Container size="6xl" className="py-4">
      {/* Progress Header */}
      <div className="mb-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-slate-800 mb-1">
                  パッケージ自動見積システム
                </h1>
                <p className="text-xs text-slate-500">
                  ステップバイステップで簡単にパッケージの見積もりを作成
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                icon={<AlertCircle className="h-3.5 w-3.5" />}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-xs h-8"
              >
                リセット
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="relative px-4">
              <div className="flex items-center justify-between relative z-10">
                {stepIcons.map((step, index) => {
                  const StepIcon = step.icon;
                  const status = getStepStatus(index + 1);

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: status === 'active' ? 1.1 : status === 'completed' ? 1.05 : 1,
                          backgroundColor: status === 'completed' ? '#10b981' : status === 'active' ? '#2563eb' : '#ffffff',
                          borderColor: status === 'pending' ? '#f1f5f9' : 'transparent',
                        }}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-md border-2
                          ${status === 'active' ? 'ring-2 ring-navy-50' : ''}
                        `}
                      >
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <StepIcon className={`h-5 w-5 ${status === 'pending' ? 'text-slate-400' : 'text-white'}`} />
                        )}
                      </motion.div>
                      <div className="text-center">
                        <h3 className={`font-bold text-xs mb-0.5 transition-colors duration-300 ${status === 'active' ? 'text-indigo-700' :
                          status === 'completed' ? 'text-emerald-600' :
                            'text-slate-400'
                          }`}>
                          {step.label}
                        </h3>
                        <p className="text-[10px] text-slate-400 max-w-24 hidden sm:block leading-tight">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0 mx-10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-navy-600 to-indigo-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep - 1) / (stepIcons.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Step Indicator */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isFormValid ? "success" : "warning"} dot className="px-2 py-0.5 text-[10px]">
                  {isFormValid ? '入力完了' : '入力中'}
                </Badge>
                <span className="text-xs font-medium text-slate-500">
                  ステップ {currentStep} / {stepIcons.length}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                リアルタイム価格計算機能付き
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content with Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-4"
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer - Step 3では非表示 */}
      {currentStep < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              {currentStep === 1 && 'まず基本情報を設定してください'}
              {currentStep === 2 && '最後に数量と納期を設定して完了です'}
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={previousStep}
                  icon={<ChevronLeft className="h-3.5 w-3.5" />}
                  className="hover:bg-slate-50 h-9 text-xs"
                >
                  前のステップ
                </Button>
              )}

              {currentStep < stepIcons.length && (
                <Button
                  variant="primary"
                  onClick={() => {
                    if (validateCurrentStep()) {
                      nextStep();
                    }
                  }}
                  disabled={!isFormValid}
                  icon={<ChevronRight className="h-3.5 w-3.5" />}
                  className="bg-gradient-to-r from-navy-700 to-indigo-600 hover:from-navy-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all h-9 text-xs"
                >
                  次のステップ
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </Container>
  );
}