'use client';

import React from 'react';
import { useSimulation } from './SimulationContext';
import { useSimulationValidation, useSimulationPricing } from './SimulationContext';
import { ORDER_TYPES, CONTENTS_TYPES, BAG_TYPES, MATERIAL_GENRES, MATERIAL_COMPOSITIONS } from '@/types/simulation';
import {
  Select,
  Container,
} from '@/components/ui';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { AlertCircle, Package, Coffee, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StepOne() {
  const {
    state,
    setOrderType,
    setContentType,
    setBagType,
    setWidth,
    setHeight,
    setMaterialGenre,
    setMaterialComposition,
  } = useSimulation();

  const { validationErrors } = useSimulationValidation();
  const { results, isLoading, getPriceRange } = useSimulationPricing();

  const priceRange = getPriceRange();

  // Helper to get icon for bag type
  const getBagIcon = (type: string) => {
    switch (type) {
      case 'flat_3_side': return <Package className="w-8 h-8 mb-2" />;
      case 'stand_up': return <Coffee className="w-8 h-8 mb-2" />;
      case 'gusset': return <ShoppingBag className="w-8 h-8 mb-2" />;
      default: return <Package className="w-8 h-8 mb-2" />;
    }
  };

  return (
    <MotionWrapper className="py-2">
      <Container size="4xl">
        <div className="space-y-4">
          {/* Header */}
          <div className="mb-4 border-b border-gray-200/50 pb-2">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">仕様選択</h2>
            <p className="text-xs text-gray-500 mt-1">
              ご希望のパッケージ仕様を選択してください。リアルタイムで概算見積もりが表示されます。
            </p>
          </div>

          {/* Main Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Left Column: Basic Info & Size */}
            <div className="md:col-span-7 space-y-4">

              {/* Order & Contents Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    注文タイプ <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={[...ORDER_TYPES]}
                    value={state.orderType}
                    onChange={(value) => setOrderType(value as 'new' | 'repeat')}
                    placeholder="選択"
                    className="w-full text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    内容物 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={[...CONTENTS_TYPES]}
                    value={state.contentsType}
                    onChange={(value) => setContentType(value as 'solid' | 'liquid' | 'powder')}
                    placeholder="選択"
                    className="w-full text-sm"
                  />
                </div>
              </div>

              {/* Bag Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  形状選択 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {BAG_TYPES.map((bagType) => {
                    const isSelected = state.bagType === bagType.value;
                    return (
                      <div key={bagType.value} className="relative group">
                        <GlassCard
                          onClick={() => setBagType(bagType.value)}
                          className={`
                            h-full flex flex-col items-center justify-center p-3 cursor-pointer
                            ${isSelected ? 'border-navy-600/50 bg-navy-50/30' : 'hover:border-navy-600'}
                          `}
                          hoverEffect={!isSelected}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="active-bag-type"
                              className="absolute inset-0 border-2 border-navy-600 rounded-2xl pointer-events-none"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <div className={`transition-colors duration-300 ${isSelected ? 'text-navy-700' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            {getBagIcon(bagType.value)}
                          </div>
                          <span className={`text-xs font-bold transition-colors duration-300 ${isSelected ? 'text-navy-600' : 'text-gray-600'}`}>
                            {bagType.label}
                          </span>
                        </GlassCard>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  サイズ (mm) <span className="text-red-500">*</span>
                </label>
                <GlassCard className="p-4 flex items-center gap-4 bg-gray-50/50">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-gray-500 font-medium">幅 (W)</span>
                    <div className="relative group">
                      <input
                        type="number"
                        value={state.width || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') setWidth(0);
                          else {
                            const num = parseInt(val);
                            if (!isNaN(num)) setWidth(num);
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 transition-all outline-none"
                        placeholder="50-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">mm</span>
                    </div>
                  </div>
                  <div className="text-gray-300 pt-5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-gray-500 font-medium">高さ (H)</span>
                    <div className="relative group">
                      <input
                        type="number"
                        value={state.height || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') setHeight(0);
                          else {
                            const num = parseInt(val);
                            if (!isNaN(num)) setHeight(num);
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 transition-all outline-none"
                        placeholder="50-1000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">mm</span>
                    </div>
                  </div>
                </GlassCard>
                <div className="flex justify-end mt-1">
                  <AnimatePresence>
                    {state.width > 0 && state.height > 0 && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded"
                      >
                        面積: {(state.width * state.height).toLocaleString()} mm²
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Right Column: Materials & Preview */}
            <div className="md:col-span-5 space-y-4">

              {/* Material Selection */}
              <GlassCard className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-navy-600 rounded-full" />
                  <h3 className="text-sm font-bold text-gray-800">素材構成</h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">素材ジャンル</label>
                    <Select
                      options={[...MATERIAL_GENRES]}
                      value={state.materialGenre}
                      onChange={setMaterialGenre}
                      placeholder="選択してください"
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">構成詳細</label>
                    <Select
                      options={[...MATERIAL_COMPOSITIONS]}
                      value={state.materialComposition}
                      onChange={setMaterialComposition}
                      placeholder="選択してください"
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </GlassCard>

              {/* Real-time Price Estimate */}
              <AnimatePresence mode="wait">
                {results && results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 text-white shadow-xl"
                  >
                    {/* Abstract Background Pattern */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-navy-600 rounded-full opacity-20 blur-xl" />
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-purple-500 rounded-full opacity-20 blur-xl" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">概算単価</span>
                        {isLoading && (
                          <span className="flex items-center gap-2 text-xs text-yellow-400">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                            計算中...
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                          ¥{priceRange.min.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 font-light mx-1">〜</span>
                        <span className="text-xl font-medium text-gray-400">
                          ¥{priceRange.max.toLocaleString()}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-gray-700/50 flex justify-between text-xs text-gray-400 font-medium">
                        <span>数量により変動</span>
                        <span>税抜価格</span>
                      </div>
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