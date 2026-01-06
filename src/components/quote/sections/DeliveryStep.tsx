/**
 * DeliveryStep Component
 *
 * Handles delivery location and urgency selection
 * Extracted from ImprovedQuotingWizard for better maintainability
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Check } from 'lucide-react';
import { useQuote, useQuoteState, createStepSummary, getPostProcessingLimitStatusForState } from '@/contexts/QuoteContext';

interface DeliveryStepProps {
  getStepSummary?: (step: string) => React.ReactNode;
}

/**
 * Component for selecting delivery location and urgency
 */
export function DeliveryStep({ getStepSummary }: DeliveryStepProps) {
  const state = useQuoteState();
  const { updateDelivery } = useQuote();

  // Use the provided getStepSummary or create one from state
  const stepSummary = getStepSummary || ((step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Truck className="w-5 h-5 mr-2 text-navy-600" />
          配送と納期
        </h2>

        {/* Previous Steps Summary */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">基本仕様</h3>
            </div>
            {stepSummary('specs')}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">数量・印刷</h3>
            </div>
            {stepSummary('quantity')}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">後加工</h3>
            </div>
            {stepSummary('post-processing')}
          </div>
        </div>

        {/* Delivery Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">配送先</label>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => updateDelivery('domestic', state.urgency || 'standard')}
              className={`p-4 border-2 rounded-lg text-center transition-all relative overflow-hidden ${
                state.deliveryLocation === 'domestic'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {state.deliveryLocation === 'domestic' && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <div className="font-medium text-gray-900">国内配送</div>
              <div className="text-sm text-gray-500 mt-1">日本国内</div>
            </motion.button>
            <motion.button
              onClick={() => updateDelivery('international', state.urgency || 'standard')}
              className={`p-4 border-2 rounded-lg text-center transition-all relative overflow-hidden ${
                state.deliveryLocation === 'international'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {state.deliveryLocation === 'international' && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <div className="font-medium text-gray-900">国際配送</div>
              <div className="text-sm text-gray-500 mt-1">海外配送</div>
            </motion.button>
          </div>
        </div>

        {/* Urgency */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">納期の希望</label>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => updateDelivery(state.deliveryLocation || 'domestic', 'standard')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                state.urgency === 'standard'
                  ? 'border-navy-700 bg-navy-50'
                  : 'border-gray-200 hover:border-navy-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="font-medium text-gray-900">標準</div>
              <div className="text-sm text-gray-500 mt-1">最短4〜5週間</div>
            </motion.button>
            <motion.button
              onClick={() => updateDelivery(state.deliveryLocation || 'domestic', 'express')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                state.urgency === 'express'
                  ? 'border-navy-700 bg-navy-50'
                  : 'border-gray-200 hover:border-navy-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="font-medium text-gray-900">特急</div>
              <div className="text-sm text-gray-500 mt-1">最短3週間</div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
