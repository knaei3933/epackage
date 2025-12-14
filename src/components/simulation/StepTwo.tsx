'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSimulation } from './SimulationContext';
import { useSimulationValidation } from './SimulationContext';
import {
  Container,
} from '@/components/ui';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { Plus, X, AlertCircle, Calendar, Truck, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StepTwo() {
  const {
    state,
    setQuantities,
    setDeliveryDate,
  } = useSimulation();

  const { validationErrors } = useSimulationValidation();

  // Local state for quantities management
  const [quantityInputs, setQuantityInputs] = useState<string[]>(
    state.quantities.length > 0 ? state.quantities.map(q => q.toString()) : ['']
  );

  // Update quantities when inputs change
  useEffect(() => {
    const validQuantities = quantityInputs
      .filter(q => q && parseInt(q) >= 100)
      .map(q => parseInt(q))
      .sort((a, b) => a - b);

    if (validQuantities.length > 0) {
      // Only update if different to avoid infinite loops
      const currentSorted = [...state.quantities].sort((a, b) => a - b);
      if (JSON.stringify(validQuantities) !== JSON.stringify(currentSorted)) {
        setQuantities(validQuantities);
      }
    }
  }, [quantityInputs, setQuantities, state.quantities]);

  // Add quantity input
  const addQuantityInput = useCallback(() => {
    if (quantityInputs.length < 5) {
      setQuantityInputs(prev => [...prev, '']);
    }
  }, [quantityInputs.length]);

  // Remove quantity input
  const removeQuantityInput = useCallback((index: number) => {
    setQuantityInputs(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update quantity input
  const updateQuantityInput = useCallback((index: number, value: string) => {
    setQuantityInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
  }, []);

  // Predefined quantity presets
  const quantityPresets = [
    [1000, 3000, 5000],
    [3000, 5000, 10000],
    [5000, 10000, 20000],
  ];

  const applyQuantityPreset = useCallback((preset: number[]) => {
    const quantityStrings = preset.map(q => q.toString());
    setQuantityInputs(quantityStrings);
  }, []);

  const validateQuantity = useCallback((value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 100 || numValue > 1000000) {
      return false;
    }
    return true;
  }, []);

  return (
    <MotionWrapper className="py-2">
      <Container size="4xl">
        <div className="space-y-4">
          {/* Header */}
          <div className="mb-4 border-b border-gray-200/50 pb-2">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">数量・納期</h2>
            <p className="text-xs text-gray-500 mt-1">
              製造数量と希望納期を設定してください。複数の数量パターンを同時に比較できます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Left Column: Quantity Settings */}
            <div className="md:col-span-7 space-y-4">

              {/* Quantity Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    見積数量 (最大5パターン) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {quantityInputs.filter(q => q).length} / 5
                  </span>
                </div>

                <GlassCard className="p-4 space-y-3 bg-gray-50/50">
                  <AnimatePresence initial={false}>
                    {quantityInputs.map((quantity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative group">
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => updateQuantityInput(index, e.target.value)}
                              className={`
                                w-full h-9 px-3 text-sm border rounded-lg transition-all outline-none
                                ${quantity && !validateQuantity(quantity)
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50'
                                  : 'border-gray-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20 bg-white'}
                              `}
                              placeholder="例: 1000"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">個</span>
                          </div>

                          {quantityInputs.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1, color: "#ef4444" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeQuantityInput(index)}
                              className="p-1.5 text-gray-400 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {quantityInputs.length < 5 && (
                    <motion.button
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={addQuantityInput}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:border-navy-500 hover:text-navy-700 transition-all flex items-center justify-center gap-2 group"
                    >
                      <div className="bg-gray-100 rounded-full p-0.5 group-hover:bg-navy-600 transition-colors">
                        <Plus className="h-3 w-3" />
                      </div>
                      数量パターンを追加
                    </motion.button>
                  )}
                </GlassCard>

                {/* Presets */}
                <div className="pt-1">
                  <span className="text-xs text-gray-400 font-medium block mb-2">おすすめパターンから選択:</span>
                  <div className="flex flex-wrap gap-2">
                    {quantityPresets.map((preset, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => applyQuantityPreset(preset)}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full text-gray-600 hover:border-navy-500 hover:text-navy-700 hover:shadow-md transition-all"
                      >
                        {preset[0].toLocaleString()}〜{preset[preset.length - 1].toLocaleString()}個
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Delivery & Summary */}
            <div className="md:col-span-5 space-y-4">

              {/* Delivery Date */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-navy-50 rounded-lg text-navy-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">納期希望日</h3>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={state.deliveryDate ? state.deliveryDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDeliveryDate(e.target.value ? new Date(e.target.value) : undefined)}
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20 transition-all"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-navy-50/50 rounded-lg text-xs text-navy-600">
                    <Truck className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      通常、製造開始から<span className="font-bold">約2-3週間</span>での納品となります。
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Quantity Summary */}
              <AnimatePresence>
                {state.quantities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-gradient-to-br from-navy-50 to-navy-100 rounded-xl p-4 border border-navy-600 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-3.5 w-3.5 text-navy-700" />
                      <h3 className="text-xs font-bold text-navy-600 uppercase tracking-wider">
                        選択中の数量
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {state.quantities.map((q, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="px-2.5 py-1 bg-white text-navy-600 text-xs font-bold rounded-md border border-navy-600 shadow-sm"
                        >
                          {q.toLocaleString()}個
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Validation Errors */}
          <AnimatePresence>
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2 shadow-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <ul className="space-y-0.5">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="font-medium text-xs">{error.message}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </MotionWrapper>
  );
}