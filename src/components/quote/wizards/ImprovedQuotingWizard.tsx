'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Package, Layers, Calendar, Settings } from 'lucide-react';
import { useQuote, useQuoteState, useQuoteContext, checkStepComplete, createStepSummary, getPostProcessingLimitStatusForState, canAddPostProcessingOptionForState, getSpecsValidationMessages } from '@/contexts/QuoteContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { unifiedPricingEngine, UnifiedQuoteResult, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import { safeMap } from '@/lib/array-helpers';
import EnvelopePreview from '../previews/EnvelopePreview';
import MultiQuantityStep from '../steps/MultiQuantityStep';
import MultiQuantityComparisonTable from '../shared/MultiQuantityComparisonTable';
import { MATERIAL_TYPE_LABELS, MATERIAL_TYPE_LABELS_JA, MATERIAL_DESCRIPTIONS, getMaterialLabel, getMaterialDescription, getThicknessLabel, getWeightRange } from '@/constants/materialTypes';
import { getAvailableGussetSizes, ALL_GUSSET_SIZE_OPTIONS } from '@/lib/gusset-data';
import {
  ChevronRight, ChevronLeft, Check, CheckCircle2, AlertCircle, Ticket, Printer,
  Info, Edit2, X, Phone, Mail, Clock, Calculator, RefreshCw, BarChart3, Download,
  Save, Send, Eye, Shield, Leaf, Lightbulb
} from 'lucide-react';
import { ErrorToast, useToast } from '../shared/ErrorToast';
import { KeyboardShortcutsHint } from '../shared/KeyboardShortcutsHint';
import { useKeyboardNavigation } from '../shared/useKeyboardNavigation';
import { AuthPromptModal } from '../shared/AuthPromptModal';
import { ResponsiveStepIndicators } from '../shared/ResponsiveStepIndicators';
import { UnifiedSKUQuantityStep } from '../steps/UnifiedSKUQuantityStep';
import { ParallelProductionOptions } from '../shared/ParallelProductionOptions';
import { EconomicQuantityProposal } from '../shared/EconomicQuantityProposal';
import { ResultStep } from '../sections/ResultStep';
import { OrderSummarySection } from '../shared/OrderSummarySection';
import { QuantityOptionsGrid } from '../selectors';
import { pouchCostCalculator } from '@/lib/pouch-cost-calculator';
import type { ParallelProductionOption } from '../shared/ParallelProductionOptions';
import type { EconomicQuantitySuggestionData } from '../shared/EconomicQuantityProposal';
import type { QuantityOption } from '../selectors';
import { generateQuotePDF } from '@/lib/pdf-generator';
import {
  BAG_TYPE_OPTIONS,
  SPOUT_POSITION_OPTIONS,
  MATERIAL_CATEGORIES,
  getBagTypeLabel,
  getContentsDisplay,
  validateHeight,
  validateWidth,
  shouldShowGusset
} from '@/types/quote-wizard';

// Step configuration
const STEPS = [
  { id: 'specs', title: '基本仕様', icon: Package, description: 'サイズ・素材・厚さ' },
  { id: 'post-processing', title: '後加工', icon: Settings, description: '追加仕様' },
  { id: 'sku-quantity', title: 'SKU・数量', icon: Layers, description: 'SKU数と数量設定' },
  { id: 'result', title: '見積結果', icon: Calendar, description: '価格詳細' }
];

// Component for each step
function SpecsStep() {
  const state = useQuoteState();
  const { updateBasicSpecs, updateField } = useQuote();

  // Helper functions using the exported utilities
  const isStepComplete = (step: string) => checkStepComplete(state, step);
  const getStepSummary = (step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step);

  // Validation state
  const [heightError, setHeightError] = useState<string>('');
  const [widthError, setWidthError] = useState<string>('');

  // バリデーションヒント（現在選択されている製品のサイズ制限を表示）
  const validationHint = useMemo(() => {
    const hints = {
      width: '',
      height: ''
    };

    switch (state.bagTypeId) {
      case 'flat_3_side':
        hints.width = '※ 50mm以上';
        hints.height = '※ 120mm〜355mm';
        break;
      case 'stand_up':
        hints.width = '※ 80mm以上';
        hints.height = '※ 100mm以上';
        break;
      case 'box':
        hints.width = '※ 100mm以上（幅＋側面≤335mm）';
        hints.height = '※ 100mm以上';
        break;
      case 'lap_seal':
        hints.width = '※ 100mm〜350mm';
        hints.height = '※ 100mm以上';
        break;
      case 'spout_pouch':
        hints.width = '※ 80mm以上';
        hints.height = '※ 100mm以上';
        break;
      case 'roll_film':
        hints.width = '※ 80mm〜740mm';
        hints.height = '';
        break;
      default:
        hints.width = '';
        hints.height = '';
    }

    return hints;
  }, [state.bagTypeId]);


  // Calculate available gusset sizes based on current width
  const availableGussetSizes = useMemo(() => {
    const width = state.width;
    if (!width || width < 70) return [];
    return getAvailableGussetSizes(width);
  }, [state.width]);

  // スタンドパウチが選択されたときに、深さのデフォルト値を自動設定
  useEffect(() => {
    if (shouldShowGusset(state.bagTypeId) && !state.depth) {
      const defaultDepth = availableGussetSizes.length > 0 ? availableGussetSizes[0] : 30;
      updateBasicSpecs({ depth: defaultDepth });
    }
  }, [state.bagTypeId, state.width, availableGussetSizes]);

  // バリデーション: 高さ、幅、深さ、バッグタイプが変更されたときに実行
  useEffect(() => {
    if (state.height) {
      const error = validateHeight(state.height, state.bagTypeId, state.width, state.depth);
      setHeightError(error);
    } else {
      setHeightError('');
    }
  }, [state.height, state.width, state.depth, state.bagTypeId]);

  // バリデーション: 幅が変更されたときに実行
  useEffect(() => {
    if (state.width) {
      const error = validateWidth(state.width, state.bagTypeId, state.depth);
      setWidthError(error);
    } else {
      setWidthError('');
    }
  }, [state.width, state.depth, state.bagTypeId]);

  // Enhanced material options with rich details and category
  const materials = [
    {
      id: 'pet_al',
      name: MATERIAL_TYPE_LABELS.pet_al,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_al,
      description: MATERIAL_DESCRIPTIONS.pet_al.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_al.ja,
      multiplier: 1.5,
      features: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
      featuresJa: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
      recommendedFor: 'コーヒー豆、茶葉、ナッツ、スパイス、漬物',
      category: 'high_barrier',
      popular: true,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~100g)',
          nameJa: '軽量タイプ (~100g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 50μ',
          weightRange: '~100g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~300g)',
          nameJa: '標準タイプ (~300g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ',
          weightRange: '~300g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'standard',
          name: 'レギュラータイプ (~500g)',
          nameJa: 'レギュラータイプ (~500g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+アルミ7μ+ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
          specificationEn: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    },
    {
      id: 'pet_vmpet',
      name: MATERIAL_TYPE_LABELS.pet_vmpet,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_vmpet,
      description: MATERIAL_DESCRIPTIONS.pet_vmpet.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_vmpet.ja,
      multiplier: 1.4,
      features: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
      featuresJa: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
      recommendedFor: 'スナック菓子、クッキー、煎餅',
      category: 'high_barrier',
      popular: false,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~100g)',
          nameJa: '軽量タイプ (~100g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 50μ',
          weightRange: '~100g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~300g)',
          nameJa: '標準タイプ (~300g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 70μ',
          weightRange: '~300g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'standard',
          name: 'レギュラータイプ (~500g)',
          nameJa: 'レギュラータイプ (~500g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+VMPET12μ+ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
          specificationEn: 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    },
    {
      id: 'pet_ldpe',
      name: MATERIAL_TYPE_LABELS.pet_ldpe,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_ldpe,
      description: MATERIAL_DESCRIPTIONS.pet_ldpe.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_ldpe.ja,
      multiplier: 1.0,
      features: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
      featuresJa: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
      recommendedFor: 'お菓子、乾物、パン、小物包装',
      category: 'transparent',
      popular: false,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~100g)',
          nameJa: '軽量タイプ (~100g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン50μ',
          specificationEn: 'PET 12μ + LLDPE 50μ',
          weightRange: '~100g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~300g)',
          nameJa: '標準タイプ (~300g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン70μ',
          specificationEn: 'PET 12μ + LLDPE 70μ',
          weightRange: '~300g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'standard',
          name: 'レギュラータイプ (~500g)',
          nameJa: 'レギュラータイプ (~500g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン90μ',
          specificationEn: 'PET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+直押出ポリエチレン100μ',
          specificationEn: 'PET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+直押出ポリエチレン110μ',
          specificationEn: 'PET 12μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    },
    {
      id: 'pet_ny_al',
      name: MATERIAL_TYPE_LABELS.pet_ny_al,
      nameJa: MATERIAL_TYPE_LABELS_JA.pet_ny_al,
      description: MATERIAL_DESCRIPTIONS.pet_ny_al.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.pet_ny_al.ja,
      multiplier: 1.6,
      features: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
      featuresJa: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
      recommendedFor: '米、穀物、ペットフード、重包装',
      category: 'high_barrier',
      popular: false,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light',
          name: '軽量タイプ (~50g)',
          nameJa: '軽量タイプ (~50g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 50μ',
          weightRange: '~50g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'light_medium',
          name: '軽量タイプ (~200g)',
          nameJa: '軽量タイプ (~200g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 70μ',
          weightRange: '~200g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'medium',
          name: '標準タイプ (~500g)',
          nameJa: '標準タイプ (~500g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'heavy',
          name: '高耐久タイプ (~800g)',
          nameJa: '高耐久タイプ (~800g)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'ultra',
          name: '超耐久タイプ (800g~)',
          nameJa: '超耐久タイプ (800g~)',
          specification: 'ポリエステル12μ+ナイロン16μ+アルミ7μ+直鎖状低密度ポリエチレン110μ',
          specificationEn: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'PET', thickness: 12 },
            { materialId: 'NY', thickness: 16 },
            { materialId: 'AL', thickness: 7 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ],
    },
    {
      id: 'ny_lldpe',
      name: MATERIAL_TYPE_LABELS.ny_lldpe,
      nameJa: MATERIAL_TYPE_LABELS_JA.ny_lldpe,
      description: MATERIAL_DESCRIPTIONS.ny_lldpe.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.ny_lldpe.ja,
      multiplier: 1.1,
      features: ['電子レンジ解凍可能', '透明窓表現可能', 'コストパフォーマンス良好', '軽量化に最適'],
      featuresJa: ['電子レンジ解凍可能', '透明窓表現可能', 'コストパフォーマンス良好', '軽量化に最適'],
      recommendedFor: '冷凍食品、惣菜、電子レンジ調理品',
      category: 'transparent',
      popular: false,
      ecoFriendly: false,
      thicknessOptions: [
        {
          id: 'light_50',
          name: '軽量タイプ (~50g)',
          nameJa: '軽量タイプ (~50g)',
          specification: 'ナイロン15μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'NY 15μ + LLDPE 50μ',
          weightRange: '~50g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'NY', thickness: 15 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'standard_70',
          name: '標準タイプ (~200g)',
          nameJa: '標準タイプ (~200g)',
          specification: 'ナイロン15μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'NY 15μ + LLDPE 70μ',
          weightRange: '~200g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'NY', thickness: 15 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'heavy_90',
          name: '高耐久タイプ (~500g)',
          nameJa: '高耐久タイプ (~500g)',
          specification: 'ナイロン15μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'NY 15μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'NY', thickness: 15 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'ultra_100',
          name: '超耐久タイプ (~800g)',
          nameJa: '超耐久タイプ (~800g)',
          specification: 'ナイロン15μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'NY 15μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'NY', thickness: 15 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'maximum_110',
          name: 'マキシマムタイプ (800g~)',
          nameJa: 'マキシマムタイプ (800g~)',
          specification: 'ナイロン15μ+直鎖状低密度ポリエチレン110μ',
          specificationEn: 'NY 15μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'NY', thickness: 15 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    },
    {
      id: 'kraft_vmpet_lldpe',
      name: MATERIAL_TYPE_LABELS.kraft_vmpet_lldpe,
      nameJa: MATERIAL_TYPE_LABELS_JA.kraft_vmpet_lldpe,
      description: MATERIAL_DESCRIPTIONS.kraft_vmpet_lldpe.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.kraft_vmpet_lldpe.ja,
      multiplier: 1.4,
      features: ['自然素材風の外観', 'アルミ蒸着による優れたバリア性能', '環境に優しい', '透明窓表現可能'],
      featuresJa: ['自然素材風の外観', 'アルミ蒸着による優れたバリア性能', '環境に優しい', '透明窓表現可能'],
      recommendedFor: 'ナッツ、ドライフルーツ、コーヒー豆、スパイス',
      category: 'kraft',
      popular: false,
      ecoFriendly: true,
      thicknessOptions: [
        {
          id: 'light_50',
          name: '軽量タイプ (~50g)',
          nameJa: '軽量タイプ (~50g)',
          specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 50μ',
          weightRange: '~50g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'standard_70',
          name: '標準タイプ (~200g)',
          nameJa: '標準タイプ (~200g)',
          specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 70μ',
          weightRange: '~200g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'heavy_90',
          name: '高耐久タイプ (~500g)',
          nameJa: '高耐久タイプ (~500g)',
          specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'ultra_100',
          name: '超耐久タイプ (~800g)',
          nameJa: '超耐久タイプ (~800g)',
          specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'maximum_110',
          name: 'マキシマムタイプ (800g~)',
          nameJa: 'マキシマムタイプ (800g~)',
          specification: 'クラフト紙80g/m²+アルミ蒸着ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
          specificationEn: 'Kraft 80g/m² + VMPET 12μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'VMPET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    },
    {
      id: 'kraft_pet_lldpe',
      name: MATERIAL_TYPE_LABELS.kraft_pet_lldpe,
      nameJa: MATERIAL_TYPE_LABELS_JA.kraft_pet_lldpe,
      description: MATERIAL_DESCRIPTIONS.kraft_pet_lldpe.en,
      descriptionJa: MATERIAL_DESCRIPTIONS.kraft_pet_lldpe.ja,
      multiplier: 1.3,
      features: ['自然素材風の外観', '短期バリア性能', 'コストパフォーマンス良好', '環境に優しい'],
      featuresJa: ['自然素材風の外観', '短期バリア性能', 'コストパフォーマンス良好', '環境に優しい'],
      recommendedFor: 'パン、菓子、クッキー、短期保存品',
      category: 'kraft',
      popular: false,
      ecoFriendly: true,
      thicknessOptions: [
        {
          id: 'light_50',
          name: '軽量タイプ (~50g)',
          nameJa: '軽量タイプ (~50g)',
          specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン50μ',
          specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 50μ',
          weightRange: '~50g',
          multiplier: 0.85,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 50 }
          ]
        },
        {
          id: 'standard_70',
          name: '標準タイプ (~200g)',
          nameJa: '標準タイプ (~200g)',
          specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン70μ',
          specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
          weightRange: '~200g',
          multiplier: 0.95,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 70 }
          ]
        },
        {
          id: 'heavy_90',
          name: '高耐久タイプ (~500g)',
          nameJa: '高耐久タイプ (~500g)',
          specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン90μ',
          specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 90μ',
          weightRange: '~500g',
          multiplier: 1.0,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 90 }
          ]
        },
        {
          id: 'ultra_100',
          name: '超耐久タイプ (~800g)',
          nameJa: '超耐久タイプ (~800g)',
          specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン100μ',
          specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 100μ',
          weightRange: '~800g',
          multiplier: 1.1,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 100 }
          ]
        },
        {
          id: 'maximum_110',
          name: 'マキシマムタイプ (800g~)',
          nameJa: 'マキシマムタイプ (800g~)',
          specification: 'クラフト紙80g/m²+ポリエステル12μ+直鎖状低密度ポリエチレン110μ',
          specificationEn: 'Kraft 80g/m² + PET 12μ + LLDPE 110μ',
          weightRange: '800g~',
          multiplier: 1.2,
          filmLayers: [
            { materialId: 'KRAFT', grammage: 80 },
            { materialId: 'PET', thickness: 12 },
            { materialId: 'LLDPE', thickness: 110 }
          ]
        }
      ]
    }
  ];

  // Contents dropdown options
  const PRODUCT_CATEGORIES = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'food', label: '食品', labelJa: '食品' },
    { value: 'health_supplement', label: '健康食品', labelJa: '健康食品' },
    { value: 'cosmetic', label: '化粧品', labelJa: '化粧品' },
    { value: 'quasi_drug', label: '医薬部外品', labelJa: '医薬部外品' },
    { value: 'drug', label: '医薬品', labelJa: '医薬品' },
    { value: 'other', label: 'その他', labelJa: 'その他' },
  ] as const;

  const CONTENTS_TYPES = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'solid', label: '固体', labelJa: '固体' },
    { value: 'powder', label: '粉体', labelJa: '粉体' },
    { value: 'liquid', label: '液体', labelJa: '液体' },
  ] as const;

  const MAIN_INGREDIENTS = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'general_neutral', label: '一般/中性', labelJa: '一般/中性' },
    { value: 'oil_surfactant', label: 'オイル/界面活性剤', labelJa: 'オイル/界面活性剤' },
    { value: 'acidic_salty', label: '酸性/塩分', labelJa: '酸性/塩分' },
    { value: 'volatile_fragrance', label: '揮発性/香料', labelJa: '揮発性/香料' },
    { value: 'other', label: 'その他', labelJa: 'その他' },
  ] as const;

  const DISTRIBUTION_ENVIRONMENTS = [
    { value: '', label: '選択してください', labelJa: '選択してください', disabled: true },
    { value: 'general_roomTemp', label: '一般/常温', labelJa: '一般/常温' },
    { value: 'light_oxygen_sensitive', label: '光/酸素敏感', labelJa: '光/酸素敏感' },
    { value: 'refrigerated', label: '冷凍保管', labelJa: '冷凍保管' },
    { value: 'high_temp_sterilized', label: '高温殺菌', labelJa: '高温殺菌' },
    { value: 'other', label: 'その他', labelJa: 'その他' },
  ] as const;

  // Get current values - no defaults to enforce selection
  const selectedCategory = state.productCategory;
  const selectedType = state.contentsType;
  const selectedIngredient = state.mainIngredient;
  const selectedEnvironment = state.distributionEnvironment;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Package className="w-5 h-5 mr-2 text-navy-600" />
          基本仕様の選択
        </h2>

        {/* Contents Dropdowns - 4 dropdowns in a row */}
        <div className="mb-6" data-section="contents-dropdowns">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            内容物 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Product Category */}
            <div>
              <label className="block text-base text-gray-700 mb-1">製品タイプ</label>
              <select
                value={selectedCategory}
                onChange={(e) => updateField('productCategory', e.target.value as typeof selectedCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    disabled={(cat as any).disabled}
                  >
                    {cat.labelJa}
                  </option>
                ))}
              </select>
            </div>

            {/* Contents Type */}
            <div>
              <label className="block text-base text-gray-700 mb-1">内容物の形態</label>
              <select
                value={selectedType}
                onChange={(e) => updateField('contentsType', e.target.value as typeof selectedType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {CONTENTS_TYPES.map(type => (
                  <option
                    key={type.value}
                    value={type.value}
                    disabled={(type as any).disabled}
                  >
                    {type.labelJa}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Ingredient */}
            <div>
              <label className="block text-base text-gray-700 mb-1">主成分</label>
              <select
                value={selectedIngredient}
                onChange={(e) => updateField('mainIngredient', e.target.value as typeof selectedIngredient)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {MAIN_INGREDIENTS.map(ing => (
                  <option
                    key={ing.value}
                    value={ing.value}
                    disabled={(ing as any).disabled}
                  >
                    {ing.labelJa}
                  </option>
                ))}
              </select>
            </div>

            {/* Distribution Environment */}
            <div>
              <label className="block text-base text-gray-700 mb-1">流通環境</label>
              <select
                value={selectedEnvironment}
                onChange={(e) => updateField('distributionEnvironment', e.target.value as typeof selectedEnvironment)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
              >
                {DISTRIBUTION_ENVIRONMENTS.map(env => (
                  <option
                    key={env.value}
                    value={env.value}
                    disabled={(env as any).disabled}
                  >
                    {env.labelJa}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Selection Summary */}
          <div className="mt-2 text-xs text-gray-600">
            選択: {PRODUCT_CATEGORIES.find(c => c.value === selectedCategory)?.labelJa} /
            {CONTENTS_TYPES.find(t => t.value === selectedType)?.labelJa} /
            {MAIN_INGREDIENTS.find(i => i.value === selectedIngredient)?.labelJa} /
            {DISTRIBUTION_ENVIRONMENTS.find(e => e.value === selectedEnvironment)?.labelJa}
          </div>
        </div>

        {/* Form Content - Unified responsive design */}
        <div className="space-y-6">
          {/* Bag Type Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">袋のタイプ</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BAG_TYPE_OPTIONS.map(type => (
                <button
                  key={type.id}
                  onClick={() => {                    updateBasicSpecs({                      bagTypeId: type.id,                      ...(type.id === 'lap_seal' ? { depth: 0 } : {})                    })                  }}
                  className={`p-2 border-2 rounded-lg text-left transition-all relative overflow-hidden ${state.bagTypeId === type.id
                    ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                    : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                    }`}
                >
                  {state.bagTypeId === type.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-gray-200 shadow-lg">
                      <img
                        src={type.image}
                        alt={type.nameJa}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <svg class="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                              </svg>
                            `;
                            parent.classList.add('bg-white');
                          }
                        }}
                      />
                    </div>
                    <div className="font-bold text-gray-900 text-base text-center">{type.nameJa}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Spout Position Selector - Only show for spout_pouch */}
          {state.bagTypeId === 'spout_pouch' && (
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">スパウト位置</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPOUT_POSITION_OPTIONS.map((position) => (
                  <button
                    key={position.id}
                    onClick={() => updateField('spoutPosition', position.id)}
                    className={`p-2 border-2 rounded-lg transition-all relative ${state.spoutPosition === position.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                      }`}
                  >
                    {state.spoutPosition === position.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {/* Visual box indicator showing position */}
                      <div className="relative w-16 h-16 border-2 border-gray-300 rounded">
                        {/* Position indicator dot */}
                        <div
                          className={`absolute w-3 h-3 bg-navy-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${position.id.includes('top') ? 'top-2' :
                            position.id.includes('bottom') ? 'bottom-2' :
                              'top-1/2'
                            } ${position.id.includes('left') ? 'left-2' :
                              position.id.includes('right') ? 'right-2' :
                                'left-1/2'
                            }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{position.labelJa}</span>
                    </div>
                  </button>
                ))}
              </div>
              {state.spoutPosition && (
                <div className="mt-3 p-3 bg-info-50 border border-info-200 rounded-lg">
                  <p className="text-sm text-info-800">
                    選択されたスパウト位置: <span className="font-medium">{SPOUT_POSITION_OPTIONS.find(p => p.id === state.spoutPosition)?.labelJa}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Size Input */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">サイズ (mm)</label>
            <div className={`grid grid-cols-1 gap-4 ${
              state.bagTypeId === 'roll_film' ? 'sm:grid-cols-2' :
              state.bagTypeId === 'lap_seal' || state.bagTypeId === 'box' ? 'sm:grid-cols-4' :
              'sm:grid-cols-3'
            }`}>
              <div>
                <label className="block text-base text-gray-700 mb-1">幅</label>
                <input
                  type="number"
                  min="50"
                  value={state.width ?? ''}
                  onChange={(e) => updateBasicSpecs({ width: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                    widthError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-navy-500'
                  }`}
                  placeholder={state.bagTypeId === 'roll_film' ? "300" : "200"}
                />
                {widthError ? (
                  <p className="mt-1 text-xs text-red-600">
                    {widthError}
                  </p>
                ) : validationHint.width ? (
                  <p className="mt-1 text-xs text-gray-400">
                    {validationHint.width}
                  </p>
                ) : null}
              </div>
              {/* Height input - HIDE for roll_film, SHOW pitch instead */}
              {state.bagTypeId === 'roll_film' ? (
                <div>
                  <label className="block text-base text-gray-700 mb-1">ピッチ (デザイン周期)</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={state.pitch || ''}
                    onChange={(e) => updateBasicSpecs({ pitch: parseInt(e.target.value) || undefined })}
                    className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                      !state.pitch || (state.pitch < 50 || state.pitch > 1000)
                        ? 'border-gray-300 focus:ring-navy-500'
                        : 'border-green-500 focus:ring-green-500'
                    }`}
                    placeholder="例: 200"
                  />
                  {state.pitch && state.pitch >= 50 && state.pitch <= 1000 ? (
                    <p className="mt-1 text-xs text-green-600">✓ ピッチ入力完了</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">※ 50mm以上1000mm以下で入力してください</p>
                  )}
                </div>
              ) : (
                state.bagTypeId !== 'roll_film' && (
                  <div>
                    <label className="block text-base text-gray-700 mb-1">高さ</label>
                    <input
                      type="number"
                      min="50"
                      value={state.height ?? ''}
                      onChange={(e) => {
                        const newHeight = e.target.value === '' ? undefined : parseInt(e.target.value);
                        updateBasicSpecs({ height: newHeight });
                        // バリデーション実行
                        if (newHeight !== undefined) {
                          const error = validateHeight(newHeight, state.bagTypeId, state.width, state.depth);
                          setHeightError(error);
                        } else {
                          setHeightError('');
                        }
                      }}
                      onBlur={() => {
                        // フォーカス喪失時にバリデーション再実行
                        if (state.height) {
                          const error = validateHeight(state.height, state.bagTypeId, state.width, state.depth);
                          setHeightError(error);
                        }
                      }}
                      className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                        heightError
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-navy-500'
                      }`}
                      placeholder="300"
                    />
                    {heightError ? (
                      <p className="mt-1 text-xs text-red-600">
                        {heightError}
                      </p>
                    ) : validationHint.height ? (
                      <p className="mt-1 text-xs text-gray-400">
                        {validationHint.height}
                      </p>
                    ) : null}
                  </div>
                )
              )}
                {/* Spout Gusset (底) input - Only for spout_pouch with hasGusset, placed right after height */}
                {state.bagTypeId === 'spout_pouch' && state.hasGusset && (
                  <div>
                    <label className="block text-base text-gray-700 mb-1">マチ (底)</label>
                    <select
                      value={state.depth ?? (availableGussetSizes.length > 0 ? availableGussetSizes[0] : ALL_GUSSET_SIZE_OPTIONS[0])}
                      onChange={(e) => updateBasicSpecs({ depth: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      {(state.width && availableGussetSizes.length > 0 ? availableGussetSizes : ALL_GUSSET_SIZE_OPTIONS).map((size) => (
                        <option key={size} value={size}>
                          {size}mm
                        </option>
                      ))}
                    </select>
                    {state.width && availableGussetSizes.length > 0 && (
                      <p className="mt-1 text-xs text-gray-400">
                        幅{state.width}mmで選択可能なマチサイズ
                      </p>
                    )}
                    {!state.width && (
                      <p className="mt-1 text-xs text-gray-400">
                        まず幅を入力してください
                      </p>
                    )}
                  </div>
                )}

              {/* Spout Size & Gusset Selection - Only for spout_pouch */}
              {state.bagTypeId === 'spout_pouch' && (
                <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Spout Size */}
                  <div>
                    <label className="block text-base text-gray-700 mb-1">スパウトサイズ <span className="text-red-500">*</span></label>
                    <select
                      value={state.spoutSize || ''}
                      onChange={(e) => {
                        const spoutSize = e.target.value;
                        updateField('spoutSize', spoutSize);
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="">選択してください</option>
                      <option value="9">9パイ（φ9mm）- 小型</option>
                      <option value="15">15パイ（φ15mm）- 標準小型</option>
                      <option value="18">18パイ（φ18mm）- 標準</option>
                      <option value="22">22パイ（φ22mm）- 大型</option>
                      <option value="28">28パイ（φ28mm）- 特大</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      液体製品に最適な注ぎ口サイズを選択してください
                    </p>
                  </div>

                  {/* Gusset Selection */}
                  <div>
                    <label className="block text-base text-gray-700 mb-1">マチ有無</label>
                    <select
                      value={state.hasGusset ? 'has-gusset' : 'no-gusset'}
                      onChange={(e) => {
                        const hasGussetValue = e.target.value === 'has-gusset';
                        updateField('hasGusset', hasGussetValue);
                        updateBasicSpecs({
                          hasGusset: hasGussetValue,
                          depth: hasGussetValue ? (state.depth ?? availableGussetSizes[0]) : 0
                        });
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      <option value="no-gusset">マチなし（平袋準用）</option>
                      <option value="has-gusset">マチあり（スタンドパウチ準用）</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      {state.hasGusset
                        ? 'マチあり: スタンドパウチ計算式を適用 (H×2+G+35)'
                        : 'マチなし: 平袋計算式を適用 (H×2+41)'}
                    </p>
                  </div>
                </div>
              )}

              {shouldShowGusset(state.bagTypeId) && state.bagTypeId !== 'roll_film' && (
                <div>
                  <label className="block text-base text-gray-700 mb-1">マチ (底)</label>
                  <select
                    value={state.depth ?? (availableGussetSizes.length > 0 ? availableGussetSizes[0] : ALL_GUSSET_SIZE_OPTIONS[0])}
                    onChange={(e) => updateBasicSpecs({ depth: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                  >
                    {(state.width && availableGussetSizes.length > 0 ? availableGussetSizes : ALL_GUSSET_SIZE_OPTIONS).map((size) => (
                      <option key={size} value={size}>
                        {size}mm
                      </option>
                    ))}
                  </select>
                  {state.width && availableGussetSizes.length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      幅{state.width}mmで選択可能なマチサイズ
                    </p>
                  )}
                  {!state.width && (
                    <p className="mt-1 text-xs text-gray-400">
                      まず幅を入力してください
                    </p>
                  )}
                </div>
              )}
              {/* 側面 (よこめん) - ガゼットパウチのみ */}
              {state.bagTypeId === 'box' && (
                <div>
                  <label className="block text-base text-gray-700 mb-1">側面</label>
                  <input
                    type="number"
                    min="0"
                    value={state.sideWidth ?? ''}
                    onChange={(e) => updateBasicSpecs({ sideWidth: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="例: 50"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    '※ 側面を入力してください（オプション）'
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Material Selection by Category */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">素材</label>

            {/* Help Guide */}
            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-900 font-medium">まず、包装の目的で選択してください</span>
              </div>
            </div>

            {/* Categories */}
            {MATERIAL_CATEGORIES.map(category => {
              const categoryMaterials = materials.filter(m => m.category === category.id);
              if (categoryMaterials.length === 0) return null;

              return (
                <div key={category.id} className={`mb-4 rounded-lg border-2 overflow-hidden ${category.colorClass}`}>
                  {/* Category Header */}
                  <div className={`${category.headerBg} px-4 py-2 flex items-center space-x-2 text-white`}>
                    {category.id === 'transparent' && <Eye className="w-5 h-5" />}
                    {category.id === 'high_barrier' && <Shield className="w-5 h-5" />}
                    {category.id === 'kraft' && <Leaf className="w-5 h-5" />}
                    <span className="font-bold">{category.nameJa}</span>
                  </div>

                  {/* Materials in this category */}
                  <div className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryMaterials.map(material => (
                        <button
                          key={material.id}
                          onClick={() => updateBasicSpecs({ materialId: material.id })}
                          className={`p-2 border-2 rounded-lg text-left transition-all relative overflow-hidden ${
                            state.materialId === material.id
                              ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          {state.materialId === material.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="flex items-start pr-8">
                            <div className="flex-1">
                              <div className="flex items-center space-x-1">
                                <div className="font-medium text-gray-900 text-sm">{material.nameJa}</div>
                                {material.popular && (
                                  <span className="px-1 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                                    人気
                                  </span>
                                )}
                                {material.ecoFriendly && (
                                  <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                    環境
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">{material.descriptionJa}</div>
                              {material.recommendedFor && (
                                <div className="text-xs text-indigo-600 mt-1 flex items-center">
                                  <Lightbulb className="w-3 h-3 mr-0.5" />
                                  {material.recommendedFor}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Thickness Selection */}
        {(() => {
          const selectedMaterial = materials.find(m => m.id === state.materialId);
          if (!selectedMaterial?.thicknessOptions) return null;

          const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al', 'ny_lldpe', 'kraft_vmpet_lldpe', 'kraft_pet_lldpe'];
          const isRequired = materialsWithThickness.includes(state.materialId);
          const isSelected = !!state.thicknessSelection;

          return (
            <div className={`mb-6 p-4 rounded-lg border-2 ${!isSelected && isRequired ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  厚さのタイプ
                  {isRequired && (
                    <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
                      必須
                    </span>
                  )}
                </label>
                {!isSelected && isRequired && (
                  <span className="text-xs text-amber-700 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    厚さを選択してください
                  </span>
                )}
              </div>
              <div>
                <select
                  value={state.thicknessSelection || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateBasicSpecs({ thicknessSelection: value });
                  }}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                >
                  <option value="">選択してください</option>
                  {selectedMaterial.thicknessOptions.map(thickness => (
                    <option key={thickness.id} value={thickness.id}>
                      {thickness.nameJa} - {thickness.specificationEn || thickness.specification}
                    </option>
                  ))}
                </select>
                {state.thicknessSelection && selectedMaterial.thicknessOptions.find(t => t.id === state.thicknessSelection) && (
                  <p className="mt-2 text-sm text-gray-600">
                    規格: {selectedMaterial.thicknessOptions.find(t => t.id === state.thicknessSelection)?.specificationEn || ''}
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                推奨: 中間タイプで最適なバランスです
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Use the new MultiQuantityStep component
// The old QuantityStep function has been replaced by MultiQuantityStep.tsx

// Sealing width options (シール幅オプション)
// Note: Sealing width does NOT affect pricing - priceMultiplier is always 1.0
const SEALING_WIDTH_OPTIONS = [
  { id: '5mm', name: 'シール幅 5mm', value: '5mm', priceMultiplier: 1.0, previewImage: '/images/post-processing/seal_5.jpg' },
  { id: '7-5mm', name: 'シール幅 7.5mm', value: '7.5mm', priceMultiplier: 1.0, previewImage: '/images/post-processing/seal_7.5.jpg' },
  { id: '10mm', name: 'シール幅 10mm', value: '10mm', priceMultiplier: 1.0, previewImage: '/images/post-processing/seal_10.jpg' },
];

function PostProcessingStep() {
  const state = useQuoteState();
  const { updatePostProcessing, setSealWidth } = useQuote();
  const getStepSummary = (step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step);

  // ホバー状態管理（パターンA用）
  const [hoveredOption, setHoveredOption] = useState<{option: any; element: HTMLElement} | null>(null);

  // Define post-processing groups
  const groups = [
    {
      id: 'zipper',
      name: 'ジッパー',
      icon: '🔒',
      required: true,
      options: [
        { id: 'zipper-yes', name: 'ジッパー付き', multiplier: 1.15, previewImage: '/images/post-processing/1.ジッパーあり.png' },
        { id: 'zipper-no', name: 'ジッパーなし', multiplier: 1.0, previewImage: '/images/post-processing/1.ジッパーなし.png' }
      ]
    },
    {
      id: 'finish',
      name: '表面処理',
      icon: '✨',
      required: true,
      options: [
        { id: 'glossy', name: '光沢仕上げ', multiplier: 1.08, previewImage: '/images/post-processing/2.光沢.png' },
        { id: 'matte', name: 'マット仕上げ', multiplier: 1.05, previewImage: '/images/post-processing/2.マット.png' }
      ]
    },
    {
      id: 'notch',
      name: 'ノッチ',
      icon: '✂️',
      required: false,
      options: [
        { id: 'notch-yes', name: 'Vノッチ', multiplier: 1.03, previewImage: '/images/post-processing/3.ノッチあり.png' },
        { id: 'notch-straight', name: '直線ノッチ', multiplier: 1.02, previewImage: '/images/post-processing/3.直線ノッチ.png' },
        { id: 'notch-no', name: 'ノッチなし', multiplier: 1.0, previewImage: '/images/post-processing/3.ノッチなし.png' }
      ]
    },
    {
      id: 'hang-hole',
      name: '吊り下げ穴加工',
      icon: '⭕',
      required: false,
      options: [
        { id: 'hang-hole-6mm', name: '吊り下げ穴 (6mm)', multiplier: 1.03, previewImage: '/images/post-processing/4.吊り穴あり.png' },
        { id: 'hang-hole-8mm', name: '吊り下げ穴 (8mm)', multiplier: 1.04, previewImage: '/images/post-processing/4.吊り穴あり.png' },
        { id: 'hang-hole-no', name: '吊り穴なし', multiplier: 1.0, previewImage: '/images/post-processing/4.吊り穴なし.png' }
      ]
    },
    {
      id: 'corner',
      name: '角加工',
      icon: '📐',
      required: false,
      options: [
        { id: 'corner-round', name: '角丸', multiplier: 1.06, previewImage: '/images/post-processing/5.角丸.png' },
        { id: 'corner-square', name: '角直角', multiplier: 1.0, previewImage: '/images/post-processing/5.角直.png' }
      ]
    },
    {
      id: 'valve',
      name: 'ガス抜きバルブ',
      icon: '⚙️',
      required: false,
      options: [
        { id: 'valve-no', name: 'バルブなし', multiplier: 1.0, previewImage: '/images/post-processing/バルブなし.png' },
        { id: 'valve-yes', name: 'バルブ付き', multiplier: 1.08, previewImage: '/images/post-processing/バルブあり.png' }
      ]
    },
    {
      id: 'opening',
      name: '開封位置',
      icon: '📍',
      required: false,
      options: [
        { id: 'top-open', name: '上端開封', multiplier: 1.02, previewImage: '/images/post-processing/6.上端オープン.png' },
        { id: 'bottom-open', name: '下端開封', multiplier: 1.03, previewImage: '/images/post-processing/6.下端オープン.png' }
      ]
    },
    {
      id: 'machi-printing',
      name: 'マチ印刷',
      icon: '🖨️',
      required: false,
      options: [
        { id: 'machi-printing-no', name: 'マチ印刷なし', multiplier: 1.0, previewImage: '/images/post-processing/マッチ印刷無し.png' },
        { id: 'machi-printing-yes', name: 'マチ印刷あり', multiplier: 1.05, previewImage: '/images/post-processing/マッチ印刷あり.png' }
      ]
    }
  ];

  // スパウトパウチ・ロールフィルムの場合は表面処理のみ表示
  // スタンドパウチ、ガゼットパウチ、スパウトパウチの場合は開封位置を上端開封のみに制限
  // スタンドパウチ、ガゼットパウチの場合のみマチ印刷オプションを表示
  const forceTopOpen = state.bagTypeId === 'stand_up' || state.bagTypeId === 'box' || state.bagTypeId === 'spout_pouch';
  const showMachiPrinting = state.bagTypeId === 'stand_up' || state.bagTypeId === 'box';

  const visibleGroups = state.bagTypeId === 'spout_pouch' || state.bagTypeId === 'roll_film'
    ? groups.filter(g => g.id === 'finish')
    : groups.filter(g => {
        // 合掌袋・ガゼットパウチ: ジッパーと角加工を除外
        if ((state.bagTypeId === 'lap_seal' || state.bagTypeId === 'box') && (g.id === 'zipper' || g.id === 'corner')) {
          return false;
        }
        return showMachiPrinting || g.id !== 'machi-printing';
      }).map(group => {
        // 開封位置グループで、強制上端開封が必要な場合はオプションをフィルタリング
        if (forceTopOpen && group.id === 'opening') {
          return {
            ...group,
            options: group.options.filter(opt => opt.id === 'top-open')
          };
        }
        return group;
      });

  // Zipper position options (shown conditionally)
  const zipperPositionOptions = [
    { id: 'zipper-position-any', name: 'ジッパー位置: お任せ', multiplier: 0 },
    { id: 'zipper-position-specified', name: 'ジッパー位置: 指定', multiplier: 1.05 }
  ];

  const handleToggleOption = (optionId: string, multiplier: number) => {
    const currentOptions = state.postProcessingOptions || [];

    console.log('[handleToggleOption] Clicked option:', optionId, 'Current options:', currentOptions);

    // 常に新しい選択を適用 - 同じカテゴリのオプションは自動的に除外される
    // オプションのカテゴリーを取得（visibleGroups定義から）
    const clickedGroup = visibleGroups.find(g => g.options.some(opt => opt.id === optionId));
    const clickedCategory = clickedGroup?.id; // category → id に修正

    console.log('[handleToggleOption] Category:', clickedCategory);

    // 同じカテゴリーのオプションを除外
    // 重要：選択しようとしているオプション自体はフィルタリングから除外する
    const newOptions = currentOptions.filter(id => {
      // 選択しようとしているオプションは削除（toggle処理のため）
      if (id === optionId) return false;

      // クリックされたオプションのグループを探す
      const group = visibleGroups.find(g => g.options.some(opt => opt.id === id));
      return group?.id !== clickedCategory; // category → id に修正
    });

    console.log('[handleToggleOption] After filter:', newOptions);

    // オプションを追加（既に選択されている場合はtoggle処理で削除済みのため追加）
    // 選択されていなかった場合、またはフィルタリングで削除された場合のみ追加
    const isAlreadySelected = currentOptions.includes(optionId);
    if (!isAlreadySelected || newOptions.length < currentOptions.length) {
      newOptions.push(optionId);
    }

    console.log('[handleToggleOption] Final options:', newOptions);

    // Calculate total multiplier
    const allOptions = [...zipperPositionOptions, ...visibleGroups.flatMap(g => g.options)];
    const totalMultiplier = newOptions.reduce((acc, id) => {
      const option = allOptions.find(opt => opt.id === id);
      return acc + (option ? option.multiplier - 1 : 0);
    }, 1.0);

    console.log('[handleToggleOption] Updating with multiplier:', totalMultiplier);
    updatePostProcessing(newOptions, totalMultiplier);
  };

  // Show zipper position selector only when zipper-yes is selected
  // スパウトパウチの場合はジッパー位置の選択も非表示
  // ジッパー位置UIは常に非表示（ユーザー要求により削除）
  const showZipperPosition = false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Settings className="w-5 h-5 mr-2 text-navy-600" />
          後加工オプション
        </h2>

        {/* Previous Steps Summary */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">基本仕様</h3>
            </div>
            {getStepSummary('specs')}
          </div>
        </div>

        {/* Sealing Width Selection - Pattern A (水平スクロール) */}
        {state.bagTypeId !== 'roll_film' && (
          <div className="mb-6 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 relative">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-base font-bold text-gray-900">シール幅</h3>
              {state.sealWidth && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>

            {/* Horizontal Scroll Options */}
            <div className="flex gap-2 pb-2 scrollbar-hide flex-wrap">
              {SEALING_WIDTH_OPTIONS.map((option) => {
                const isSelected = state.sealWidth === option.value;
                return (
                  <div key={option.id} className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setSealWidth(option.value)}
                      onMouseEnter={(e) => setHoveredOption({ option, element: e.currentTarget })}
                      onMouseLeave={() => setHoveredOption(null)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-navy-300'
                      }`}
                    >
                      {option.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Post-processing Groups - Pattern A (水平スクロール) */}
        {visibleGroups.map((group) => {
          const hasSelectedOption = group.options.some(opt => state.postProcessingOptions?.includes(opt.id));

          return (
            <div key={group.id} className="mb-6 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 relative">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
                {group.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">必須</span>
                )}
                {hasSelectedOption && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Horizontal Scroll Options */}
              <div className="flex gap-2 pb-2 scrollbar-hide flex-wrap">
                {group.options.map((option) => {
                  const isSelected = state.postProcessingOptions?.includes(option.id);
                  return (
                    <div key={option.id} className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleOption(option.id, option.multiplier)}
                        onMouseEnter={(e) => setHoveredOption({ option, element: e.currentTarget })}
                        onMouseLeave={() => setHoveredOption(null)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium whitespace-nowrap transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-navy-300'
                        }`}
                      >
                        {option.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Zipper position selector (conditional) - Pattern A */}
        {showZipperPosition && (
          <div className="mb-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200 relative">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-base font-bold text-gray-900">ジッパー位置</h3>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {zipperPositionOptions.map((position) => {
                const isSelected = state.postProcessingOptions?.includes(position.id);
                return (
                  <div key={position.id} className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleOption(position.id, position.multiplier)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-blue-300'
                      }`}
                    >
                      {position.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Global Hover Popup using Portal to avoid parent container constraints */}
      {hoveredOption?.option && hoveredOption.element && createPortal(
        <div className="fixed z-[9999] pointer-events-none" style={{
          left: `${hoveredOption.element.getBoundingClientRect().left + hoveredOption.element.getBoundingClientRect().width / 2}px`,
          top: `${hoveredOption.element.getBoundingClientRect().top}px`,
          transform: 'translate(-50%, -100%)',
        }}>
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-navy-300 p-2">
            <img
              src={hoveredOption.option.previewImage}
              alt={hoveredOption.option.name}
              className="w-[31rem] h-[21rem] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/pouch.png';
              }}
            />
            <p className="text-sm text-gray-700 text-center mt-1 font-medium">{hoveredOption.option.name}</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Real-time price display component
function RealTimePriceDisplay() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const state = useQuoteState();
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'increase' | 'decrease' | 'stable'>('stable');
  const [quantityQuotes, setQuantityQuotes] = useState<Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountRate: number;
    parallelProduction?: {
      enabled?: boolean;
      optionNumber?: number;
      isRecommended: boolean;
      suggestedQuantity: number;
      savingsAmount: number;
      savingsPercentage: number;
    };
    priceBreak: string;
    minimumPriceApplied: boolean;
  }>>([]);

  const previousPriceRef = useRef<number | null>(null);
  const priceResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cache key for all pricing-related state to prevent infinite loops
  const pricingCacheKey = useMemo(() => {
    return JSON.stringify({
      quantities: state.quantities || [],
      bagTypeId: state.bagTypeId,
      materialId: state.materialId,
      width: state.width,
      height: state.height,
      depth: state.depth,
      quantity: state.quantity,
      thicknessSelection: state.thicknessSelection,
      isUVPrinting: state.isUVPrinting,
      printingType: state.printingType,
      printingColors: state.printingColors,
      doubleSided: state.doubleSided,
      deliveryLocation: state.deliveryLocation,
      urgency: state.urgency
    });
  }, [
    state.quantities,
    state.bagTypeId,
    state.materialId,
    state.width,
    state.height,
    state.depth,
    state.quantity,
    state.thicknessSelection,
    state.isUVPrinting,
    state.printingType,
    state.printingColors,
    state.doubleSided,
    state.deliveryLocation,
    state.urgency
  ]);

  // Initialize previous price ref on mount
  useEffect(() => {
    if (currentPrice !== null && previousPriceRef.current === null) {
      previousPriceRef.current = currentPrice;
    }
  }, []);

  // Force recalculate when auth state changes from loading to ready
  useEffect(() => {
    // When auth finishes loading and we have a user, log for debugging
    if (!isAuthLoading && user?.id) {
      console.log('[RealTimePriceDisplay] Auth ready, user detected:', user.id);
      // The main useEffect will handle the recalculation via dependency array
    }
  }, [isAuthLoading, user?.id]);

  // Calculate real-time price whenever essential form data changes
  useEffect(() => {
    // user をキャプチャして、setTimeout実行時にも参照できるようにする
    const currentUser = user;

    const calculatePrice = async () => {
      // Capture quantities at effect run time
      const quantities = state.quantities;
      const currentQuantity = state.quantity;

      // CRITICAL: Wait for auth to complete before calculating price
      if (isAuthLoading) {
        console.log('[RealTimePriceDisplay] Auth loading, waiting...');
        return;
      }

      // Basic validation before calculation
      if (!state.materialId || !state.bagTypeId || quantities.length === 0) {
        // Only update state if values are actually different
        setCurrentPrice(prev => prev !== null ? null : prev);
        setQuantityQuotes(prev => prev.length !== 0 ? [] : prev);
        return;
      }

      setIsCalculating(true);
      try {
        // 顧客別マークアップ率を取得
        let customerMarkupRate = 0.0; // デフォルトは割引なし
        if (currentUser?.id) {
          try {
            const response = await fetch('/api/user/markup-rate', { cache: 'no-store' });
            if (response.ok) {
              const result = await response.json();
              customerMarkupRate = result.data?.markupRate ?? 0.0;
            }
          } catch (e) {
            console.warn('[calculatePrice] Failed to fetch markup rate:', e);
          }
        }

        // Calculate quotes for all quantities using unified pricing engine
        const quotes: Array<{
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          discountRate: number;
          priceBreak: string;
          minimumPriceApplied: boolean;
        }> = [];

        for (const quantity of quantities) {
          console.log('[RealTimePriceDisplay] 計算開始 - 数量:', quantity, 'markupRate:', customerMarkupRate, 'ユーザーID:', currentUser?.id);
          const quoteResult = await unifiedPricingEngine.calculateQuote({
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            quantity: quantity,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            postProcessingOptions: state.postProcessingOptions,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            deliveryLocation: state.deliveryLocation,
            urgency: state.urgency,
            // 顧客別マークアップ率
            markupRate: customerMarkupRate,
            rollCount: state.rollCount, // 롤 필름 시 롤 개수
            // SKU計算を使用（handleNextと同じ計算方法）
            useSKUCalculation: true,
            skuQuantities: state.skuCount > 1 ? state.skuQuantities : [quantity],
            // Roll film specific parameters
            materialWidth: state.materialWidth,
            filmLayers: state.filmLayers,
            // 【重要】フィルム原価計算を有効化（管理画面での詳細表示用）
            useFilmCostCalculation: true,
            // 2列生産オプション関連パラメータ
            twoColumnOptionApplied: state.twoColumnOptionApplied,
            discountedUnitPrice: state.discountedUnitPrice,
            discountedTotalPrice: state.discountedTotalPrice,
            originalUnitPrice: state.originalUnitPrice
          });
          console.log('[RealTimePriceDisplay] 計算結果 - 数量:', quantity, '価格:', quoteResult.totalPrice, '円');

          // Determine price break and discount rate
          let discountRate = 0;
          let priceBreak = '小ロット';

          if (quantity >= 50000) {
            discountRate = 0.4;
            priceBreak = '大ロット';
          } else if (quantity >= 20000) {
            discountRate = 0.3;
            priceBreak = '中ロット';
          } else if (quantity >= 10000) {
            discountRate = 0.2;
            priceBreak = '標準ロット';
          } else if (quantity >= 5000) {
            discountRate = 0.1;
            priceBreak = '小ロット';
          }

          quotes.push({
            quantity: quantity,
            unitPrice: quoteResult.unitPrice,
            totalPrice: quoteResult.totalPrice,
            discountRate: Math.round(discountRate * 100),
            priceBreak: priceBreak,
            minimumPriceApplied: quoteResult.minimumPriceApplied || false
          });
        }

        // Set current price to the first (recommended) quantity - use a ref to avoid dependency issues
        const recommendedQuote = quotes.find(q => q.quantity === currentQuantity) || quotes[0];
        const previousPrice = previousPriceRef.current;

        // CRITICAL FIX: Only update state if values have actually changed
        // This prevents infinite re-render loops
        setCurrentPrice(prev => prev !== recommendedQuote.totalPrice ? recommendedQuote.totalPrice : prev);

        // Deep comparison for quotes array to prevent unnecessary updates
        setQuantityQuotes(prev => {
          const quotesChanged = quotes.length !== prev.length ||
            quotes.some((q, i) =>
              q.quantity !== prev[i]?.quantity ||
              q.totalPrice !== prev[i]?.totalPrice
            );
          return quotesChanged ? quotes : prev;
        });

        // Detect price change for animation using ref instead of state
        if (previousPrice && recommendedQuote.totalPrice > previousPrice) {
          setPriceChange('increase');
        } else if (previousPrice && recommendedQuote.totalPrice < previousPrice) {
          setPriceChange('decrease');
        } else {
          setPriceChange('stable');
        }

        // Reset animation after delay - clean up previous timeout
        if (previousPrice && recommendedQuote.totalPrice !== previousPrice) {
          if (priceResetTimeoutRef.current) {
            clearTimeout(priceResetTimeoutRef.current);
          }
          priceResetTimeoutRef.current = setTimeout(() => setPriceChange('stable'), 500);
        }

        // Update the ref with the new price
        previousPriceRef.current = recommendedQuote.totalPrice;
      } catch (error) {
        console.error('Price calculation error:', error);
        // Only update state if values are actually different
        setCurrentPrice(prev => prev !== null ? null : prev);
        setQuantityQuotes(prev => prev.length !== 0 ? [] : prev);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculatePrice, 300); // Debounce
    return () => {
      clearTimeout(timeoutId);
      // Also clean up the price reset timeout
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
        priceResetTimeoutRef.current = null;
      }
    };
  }, [pricingCacheKey, user, isAuthLoading]); // user, isAuthLoading を依存配列に追加 - 顧客別割引率を適用

  // Cleanup price reset timeout on unmount
  useEffect(() => {
    return () => {
      if (priceResetTimeoutRef.current) {
        clearTimeout(priceResetTimeoutRef.current);
      }
    };
  }, []);

  if (!currentPrice || quantityQuotes.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl p-6 text-center">
        <div className="text-slate-600 font-medium">オプションを選択して価格を計算</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">数量別お見積もり</h3>
          {isCalculating && (
            <div className="flex items-center text-sm text-navy-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              計算中...
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {quantityQuotes.map((quote, index) => (
          <div
            key={`${quote.quantity}-${index}`}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${quote.quantity === state.quantity
              ? 'border-brixa-600 bg-brixa-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {quote.quantity.toLocaleString()}枚
                  </span>
                  {quote.quantity === state.quantity && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brixa-100 text-brixa-800">
                      現在選択
                    </span>
                  )}
                  {quote.minimumPriceApplied && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      最低価格適用
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div>単価: ¥{quote.unitPrice.toLocaleString()}（税別）</div>
                  <div>{quote.priceBreak} ({quote.discountRate}%引)</div>
                </div>

                {quote.minimumPriceApplied && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                    最小注文価格（160,000円）が適用されました
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold mb-1 transition-all duration-500 ${quote.quantity === state.quantity && priceChange === 'increase' ? 'scale-105 text-success-600' :
                  quote.quantity === state.quantity && priceChange === 'decrease' ? 'scale-95 text-error-600' :
                    'text-gray-900'
                  }`}>
                  ¥{quote.totalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">総費用（税別）</div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>素材: {state.materialId?.replace('_', ' ').toUpperCase()}</span>
            <span>タイプ: {state.bagTypeId?.replace('_', ' ')}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            サイズ: {state.bagTypeId === 'roll_film' ? `幅: ${state.width}mm / ピッチ: ${state.pitch}mm` : `${state.width}×${state.height}${state.depth > 0 ? `×${state.depth}` : ''}`}mm
            {state.thicknessSelection && ` | 厚さ: ${getThicknessLabel(state.thicknessSelection)}`}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get Japanese post-processing label
function getPostProcessingLabel(optionId: string): string {
  const postProcessingLabels: Record<string, string> = {
    'zipper-yes': 'ジッパー付き',
    'zipper-no': 'ジッパーなし',
    'zipper-position-any': 'ジッパー位置 (お任せ)',
    'zipper-position-specified': 'ジッパー位置 (指定)',
    'glossy': '光沢仕上げ',
    'matte': 'マット仕上げ',
    'notch-yes': 'Vノッチ',
    'notch-straight': '直線ノッチ',
    'notch-no': 'ノッチなし',
    'hang-hole-6mm': '吊り下げ穴 (6mm)',
    'hang-hole-8mm': '吊り下げ穴 (8mm)',
    'hang-hole-no': '吊り穴なし',
    'corner-round': '角丸',
    'corner-square': '角直角',
    'valve-yes': 'バルブ付き',
    'valve-no': 'バルブなし',
    'top-open': '上端開封',
    'bottom-open': '下端開封'
  };
  return postProcessingLabels[optionId] || optionId.replace(/-/g, ' ');
}

// OLD ResultStep component removed - using imported ResultStep from '../sections/ResultStep' instead
// This resolves the issue where the old inline component was being used instead of the updated one

// Main Wizard Component
// Main Wizard Component
export function ImprovedQuotingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<UnifiedQuoteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const state = useQuoteState();
  const { dispatch, resetQuote } = useQuote();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const isStepComplete = (step: string) => checkStepComplete(state, step);
  const { calculateMultiQuantity, canCalculateMultiQuantity } = useMultiQuantityQuote();

  // Toast notification system
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const currentStepId = STEPS[currentStep]?.id;

  const wizardRef = useRef<HTMLDivElement>(null);

  // 会員登録誘導モーダル
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleNext = async () => {
    // 認証なしで全ステップを閲覧可能に変更
    // （認証チェックを削除 - 会員登録は結果ページで促す）

    // Validate contents dropdowns before proceeding
    if (!state.productCategory || !state.contentsType || !state.mainIngredient || !state.distributionEnvironment) {
      showError('内容物のすべてのドロップダウンを選択してください。');
      // Scroll to contents section
      const contentsSection = document.querySelector('[data-section="contents-dropdowns"]');
      if (contentsSection) {
        contentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (currentStep < STEPS.length - 1) {
      // Calculate quote when moving from sku-quantity or quantity step to result step
      if (currentStepId === 'sku-quantity' || currentStepId === 'quantity') {
        setIsCalculating(true);
        try {
          // Debug logging
          console.log('[handleNext] Current state:', {
            quantityMode: state.quantityMode,
            skuCount: state.skuCount,
            skuQuantities: state.skuQuantities,
            quantity: state.quantity
          });

          // Determine total quantity for calculation
          let totalQuantity: number;
          let useSKUMode = false;

          // More robust SKU mode detection: check SKU count and quantities array validity
          // For roll_film: 1 SKU is enough (min 500m for 1 SKU, 300m for 2+ SKUs)
          // For pouch products: need 2+ SKUs (min 100 pieces each)
          const isRollFilm = state.bagTypeId === 'roll_film';
          const minQuantityPerSku = isRollFilm
            ? (state.skuCount === 1 ? 500 : 300)
            : 100;

          const hasValidSKUData = state.skuCount >= 1 &&
            state.skuQuantities &&
            state.skuQuantities.length === state.skuCount &&
            state.skuQuantities.every(qty => qty && qty >= minQuantityPerSku);

          // Debug logging for SKU mode detection
          console.log('[handleNext] hasValidSKUData Check:');
          console.log('[handleNext] - skuCount > 1:', state.skuCount > 1, '(skuCount =', state.skuCount, ')');
          console.log('[handleNext] - skuQuantities exists:', !!state.skuQuantities);
          console.log('[handleNext] - skuQuantities:', state.skuQuantities);
          console.log('[handleNext] - Length check:', state.skuQuantities?.length, '===', state.skuCount, ':', state.skuQuantities?.length === state.skuCount);
          console.log('[handleNext] - Every check (all >= 100):', state.skuQuantities?.every(qty => qty && qty >= 100));
          console.log('[handleNext] - FINAL hasValidSKUData:', hasValidSKUData);

          if (currentStepId === 'sku-quantity' && hasValidSKUData) {
            // SKU mode: sum all SKU quantities
            console.log('[handleNext] SKU mode detected (via hasValidSKUData), quantities:', state.skuQuantities);

            // Ensure quantityMode is set to 'sku' for downstream components
            if (state.quantityMode !== 'sku') {
              console.log('[handleNext] Setting quantityMode to "sku"');
              dispatch({ type: 'SET_QUANTITY_MODE', payload: 'sku' });
            }

            totalQuantity = state.skuQuantities.reduce((sum, qty) => sum + (qty || 0), 0);
            console.log('[handleNext] Calculated total quantity:', totalQuantity);
            useSKUMode = true;
          } else {
            // Single quantity mode
            console.log('[handleNext] Single quantity mode (hasValidSKUData:', hasValidSKUData, ')');
            totalQuantity = state.quantity || state.quantities[0] || 1000;
            console.log('[handleNext] Single quantity mode, quantity:', totalQuantity);
          }

          console.log(`[handleNext] Calculating quote for ${useSKUMode ? 'SKU' : 'single'} mode, total quantity: ${totalQuantity}`);

          // Get customer-specific markup rate (if logged in)
          let markupRate = 0.0; // Default 0% (no discount) - 顧客別割引率のみ適用
          console.log('[handleNext] デフォルトmarkupRate:', markupRate, 'ユーザーID:', user?.id);
          // CRITICAL: Wait for auth to complete before checking user
          // 認証が完了するまで計算を待機し、正しい顧客別割引を適用する
          if (isAuthLoading) {
            console.log('[handleNext] Auth loading, WAITING for auth to complete...');
            return; // 計算を中断して認証完了を待つ
          } else if (user?.id) {
            try {
              // Fetch customer markup rate from API
              const response = await fetch('/api/user/markup-rate', { cache: 'no-store' });
              if (response.ok) {
                const result = await response.json();
                markupRate = result.data?.markupRate ?? 0.0; // デフォルトは割引なし（0%）
                console.log('[handleNext] Customer markup rate:', markupRate);
              } else {
                console.warn('[handleNext] Failed to fetch markup rate, using default 20%');
              }
            } catch (error) {
              console.warn('[handleNext] Failed to fetch markup rate, using default 20%:', error);
            }
          }

          console.log('[handleNext] DIAGNOSTIC - calculateQuote PARAMS:', {
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            skuCount: state.skuCount,
            skuQuantities: state.skuQuantities,
            totalQuantity: totalQuantity,
            markupRate: markupRate,
            deliveryLocation: state.deliveryLocation || 'domestic',
            urgency: state.urgency || 'standard',
          });

          // Calculate quote with SKU mode if applicable
          const quoteResult = await unifiedPricingEngine.calculateQuote({
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            quantity: totalQuantity,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            postProcessingOptions: state.postProcessingOptions,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            deliveryLocation: state.deliveryLocation || 'domestic',
            urgency: state.urgency || 'standard',
            // Customer-specific markup rate
            markupRate: markupRate,
            // SKU mode parameters - Always use SKU Calculation (PouchCostCalculator) for accuracy
            useSKUCalculation: true,
            skuQuantities: useSKUMode ? state.skuQuantities : [totalQuantity],
            // Roll film specific parameters (materialWidthはQuoteContextで動的に決定)
            materialWidth: state.materialWidth,
            filmLayers: state.filmLayers,
            // 【重要】フィルム原価計算を有効化（管理画面での詳細表示用）
            useFilmCostCalculation: true,
            // 2列生産オプションパラメータ
            twoColumnOptionApplied: state.twoColumnOptionApplied,
            discountedUnitPrice: state.discountedUnitPrice,
            discountedTotalPrice: state.discountedTotalPrice,
            originalUnitPrice: state.originalUnitPrice
          });

          console.log('[handleNext] 価格計算完了 - 総額:', quoteResult.totalPrice, '円, markupRate:', markupRate, 'ユーザーID:', user?.id);

          // Enhance result with mode-specific information
          const enhancedResult = {
            ...quoteResult,
            ...(useSKUMode ? {
              skuMode: true,
              skuCount: state.skuCount,
              skuQuantities: state.skuQuantities,
              skuNames: state.skuNames,
              totalQuantities: totalQuantity,
              hasValidSKUData: true,
              displayQuantities: state.skuQuantities
            } : {
              hasValidSKUData: false,
              displayQuantities: [state.quantity],
              quantities: state.quantities,
              skuQuantities: [state.quantity],
              totalQuantities: state.quantities?.reduce((sum, qty) => sum + qty, 0) || state.quantity
            })
          };

          console.log('[handleNext] Enhanced result:', enhancedResult);
          console.log('[handleNext] Setting result with hasValidSKUData:', enhancedResult.hasValidSKUData);
          console.log('[handleNext] Setting result with skuQuantities:', enhancedResult.skuQuantities);
          setResult(enhancedResult);

          // Force state update before changing step
          await new Promise(resolve => setTimeout(resolve, 0));

          console.log('[handleNext] About to change step to result');
          setCurrentStep(currentStep + 1);
          // Scroll to top after showing results
          setTimeout(() => {
            wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } catch (error) {
          console.error('Quote calculation failed:', error);
          showError('見積もり計算でエラーが発生しました。もう一度お試しください。');
        } finally {
          setIsCalculating(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
        // Scroll to top of next step
        setTimeout(() => {
          wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Clear result when going back from result step to prevent stale data
      if (currentStepId === 'result') {
        console.log('[handleBack] Clearing result cache when leaving result step');
        setResult(null);
      }

      setCurrentStep(currentStep - 1);
      // Scroll to top when going back
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleReset = () => {
    console.log('Reset button clicked - resetting quote');
    try {
      resetQuote();
      setCurrentStep(0);
      setResult(null);
      console.log('Quote reset completed');
      // Scroll to top after reset
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error during quote reset:', error);
      showError('リセット中にエラーが発生しました。もう一度お試しください。');
    }
  };

  const canProceed = currentStepId ? isStepComplete(currentStepId) : false;
  const isLastStep = currentStep === STEPS.length - 1;

  // SKU数量MOQエラーがある場合は進行不可
  const canProceedWithValidation = useMemo(() => {
    if (!canProceed) return false;
    if (currentStepId === 'sku-quantity' && state.skuQuantityValidationError) {
      return false;
    }
    return true;
  }, [canProceed, currentStepId, state.skuQuantityValidationError]);

  // Compute validation error message for 2-column production total quantity mismatch
  // This is displayed when canProceed is false due to total quantity validation failure
  const getNavigationBlockReason = (): string | null => {
    if (currentStepId !== 'sku-quantity') return null;
    if (state.quantityMode !== 'sku') return null;
    if (!state.twoColumnOptionApplied || state.fixedTotalQuantity === undefined) return null;

    const currentTotalQuantity = state.skuQuantities.reduce((sum, qty) => sum + (qty || 0), 0);
    if (currentTotalQuantity !== state.fixedTotalQuantity) {
      const diff = currentTotalQuantity - state.fixedTotalQuantity;
      return `総数量が${diff > 0 ? '+' : ''}${diff.toLocaleString()}個です。総数量${state.fixedTotalQuantity.toLocaleString()}個を維持してください`;
    }
    return null;
  };

  // Get validation messages for specs step
  const specsValidationErrors = useMemo(() => {
    if (currentStepId === 'specs' && !canProceed) {
      return getSpecsValidationMessages(state);
    }
    return [];
  }, [currentStepId, canProceed, state]);

  const navigationBlockReason = getNavigationBlockReason();

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: canProceedWithValidation ? handleNext : undefined,
    onPrevious: currentStep > 0 ? handleBack : undefined,
    onDismiss: () => {
      toasts.forEach(toast => dismissToast(toast.id));
    },
    onConfirm: canProceedWithValidation ? handleNext : undefined,
    canProceed: canProceedWithValidation,
    canGoBack: currentStep > 0,
  });

  // Focus management on step change
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      // Focus the first heading or input after step change
      setTimeout(() => {
        const focusable = wizardRef.current?.querySelector('h1, h2, h3, input, button') as HTMLElement;
        if (focusable) {
          focusable.focus({ preventScroll: true });
        }
      }, 100);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" role="main">
      {/* Error Toast Notifications */}
      <ErrorToast toasts={toasts} onDismiss={dismissToast} />

      <div ref={wizardRef} className="max-w-7xl mx-auto p-4 lg:p-8" id="quote-wizard-content">

        {/* Enhanced Progress Bar - Hidden */}
        {false && (
        <div className="mb-4 md:mb-6 lg:mb-8 max-w-2xl mx-auto">
          <div role="progressbar" aria-valuenow={Math.round(((currentStep + 1) / STEPS.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="見積もり作成の進捗状況">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 font-medium">進捗状況</span>
              <span className="text-sm font-bold text-navy-700" aria-live="polite">
                {Math.round(((currentStep + 1) / STEPS.length) * 100)}% 完了
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5 lg:h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-navy-600 to-navy-700 h-2 md:h-2.5 lg:h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
              </div>
            </div>

            {/* Keyboard Shortcuts Hint - Desktop only */}
            <KeyboardShortcutsHint className="mb-4" />

            {/* Step Indicators - Responsive */}
            <ResponsiveStepIndicators
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={(index) => {
                if (index < currentStep) setCurrentStep(index);
              }}
              isStepCompleted={(index) => index < currentStep || (result && index === STEPS.length - 1)}
            />
          </div>
        </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Navigation - Desktop */}
          <div className="xl:col-span-1 lg:block">
            <div className="sticky top-6 space-y-4">
              {/* Envelope Preview */}
              <EnvelopePreview
                bagTypeId={state.bagTypeId}
                dimensions={{
                  width: state.width,
                  height: state.height,
                  depth: state.depth,
                  pitch: state.pitch,
                  sideWidth: state.sideWidth
                }}
                productCategory={state.productCategory}
                contentsType={state.contentsType}
                mainIngredient={state.mainIngredient}
                distributionEnvironment={state.distributionEnvironment}
                materialId={state.materialId}
                thicknessSelection={state.thicknessSelection}
                postProcessingOptions={state.postProcessingOptions}
                spoutPosition={state.spoutPosition}
              />

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">手順</h2>
                <nav className="space-y-3">
                  {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep || (result && index === STEPS.length - 1);
                    const StepIcon = step.icon;

                    return (
                      <button
                        key={step.id}
                        onClick={() => index < currentStep && setCurrentStep(index)}
                        disabled={index > currentStep}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${isActive
                          ? 'bg-navy-100 border-2 border-navy-600 shadow-md'
                          : isCompleted
                            ? 'bg-green-50 border-2 border-green-300 text-green-800 hover:bg-green-100'
                            : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isActive
                          ? 'bg-navy-600 text-white'
                          : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-500'
                          }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${isActive ? 'text-navy-900' : isCompleted ? 'text-green-800' : 'text-gray-400'}`}>
                            {step.title}
                          </div>
                          <div className={`text-xs ${isActive ? 'text-navy-600' : isCompleted ? 'text-success-600' : 'text-gray-400'}`}>
                            {step.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

            </div>
          </div>

          {/* Main Step Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-8">
              {/* Step Content */}
              {currentStepId === 'specs' && <SpecsStep />}
              {currentStepId === 'post-processing' && <PostProcessingStep />}
              {currentStepId === 'sku-quantity' && <UnifiedSKUQuantityStep />}
              {currentStepId === 'result' && result && <ResultStep result={result} multiQuantityResult={null} onReset={handleReset} />}

              {/* Navigation Block Error - Displayed when user cannot proceed due to validation */}
              {/* Specs step validation errors */}
              {specsValidationErrors.length > 0 && currentStepId === 'specs' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        次の項目を入力してください：
                      </p>
                      <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                        {specsValidationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {!canProceed && navigationBlockReason && currentStepId === 'sku-quantity' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        {navigationBlockReason}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        総数量を調整してから次へ進んでください
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              {currentStepId !== 'result' && (
                <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-6 py-3 font-medium rounded-lg transition-all flex items-center justify-center w-full sm:w-auto ${currentStep === 0
                      ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                      }`}
                    aria-label="前のステップに戻る"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    戻る
                  </button>

                  <motion.button
                    onClick={handleNext}
                    disabled={!canProceed || isCalculating || isAuthLoading}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center relative shadow-lg w-full sm:w-auto border-2 ${!canProceed || isCalculating || isAuthLoading
                      ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-info-700 border-info-800 hover:bg-info-800 hover:border-info-900 hover:shadow-xl'
                      }`}
                    style={!canProceed || isCalculating || isAuthLoading ? {} : {
                      backgroundColor: '#1e3a8a',
                      borderColor: '#1e40af',
                      color: '#FFFFFF !important'
                    }}
                    aria-label={isLastStep ? "見積もりを完了する" : "次のステップに進む"}
                    whileHover={canProceed && !isCalculating && !isAuthLoading ? {
                      scale: 1.02,
                      backgroundColor: '#1e40af',
                      borderColor: '#1e3a8a'
                    } : {}}
                    whileTap={canProceed && !isCalculating && !isAuthLoading ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="relative flex items-center" style={{
                      color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF',
                      fontWeight: 'bold'
                    }}>
                      {isAuthLoading ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                            style={{
                              borderColor: !canProceed || isCalculating || isAuthLoading ? 'currentColor' : '#FFFFFF',
                              borderTopColor: 'transparent'
                            }}
                          />
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            認証確認中...
                          </span>
                        </>
                      ) : isCalculating ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                            style={{
                              borderColor: !canProceed || isCalculating || isAuthLoading ? 'currentColor' : '#FFFFFF',
                              borderTopColor: 'transparent'
                            }}
                          />
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            計算中...
                          </span>
                        </>
                      ) : isLastStep ? (
                        <>
                          <Check className="w-4 h-4 mr-2" style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }} />
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            見積もりを完了
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }}>
                            次へ
                          </span>
                          <ChevronRight className="w-4 h-4 ml-2" style={{ color: !canProceed || isCalculating || isAuthLoading ? 'inherit' : '#FFFFFF' }} />
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content spacer for mobile bottom bar */}
        <div className="h-32 lg:hidden" aria-hidden="true" />

        {/* Bottom Action Boxes - Fixed Position */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 py-4">

            {/* Mobile Price Display */}
            {result && (
              <div className="lg:hidden mb-3 p-3 bg-gradient-to-r from-navy-50 to-blue-50 rounded-lg border-2 border-navy-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy-700">見積もり価格</span>
                  <span className="text-xl font-bold text-navy-900">
                    ¥{result.totalPrice.toLocaleString()}
                    <span className="text-xs text-navy-600 ml-1">税込</span>
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Optimized Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">

              {/* 総合見積りツール */}
              <button
                className="bg-gradient-to-r from-info-50 to-info-100 border-2 border-info-200 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 text-left"
                aria-label="総合見積りツール - すべてのオプションを網羅した詳細見積を表示"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-info-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-info-900 text-sm lg:text-base truncate">総合見積りツール</h3>
                    <p className="text-xs lg:text-sm text-info-700 hidden sm:block">すべてのオプションを網羅した詳細見積</p>
                  </div>
                </div>
              </button>

              {/* 詳細見積もり */}
              <button
                className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-300 text-left"
                aria-label="詳細見積もり - 仕様別の価格比較と分析を表示"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-green-900 text-sm lg:text-base truncate">詳細見積もり</h3>
                    <p className="text-xs lg:text-sm text-green-700 hidden sm:block">仕様別の価格比較と分析</p>
                  </div>
                </div>
              </button>

              {/* 即時相談 */}
              <a
                href="tel:050-1793-6500"
                className="bg-gradient-to-r from-navy-600 to-navy-700 text-white border-2 border-navy-600 rounded-xl p-3 lg:p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-navy-300 text-left sm:col-span-2 lg:col-span-1"
                aria-label="即時相談 - 専門家との無料相談。電話番号: 050-1793-6500"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base truncate">即時相談</h3>
                    <p className="text-xs lg:text-sm text-white/90 hidden sm:block">専門家との無料相談 050-1793-6500</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Contact Info Bar - Mobile Optimized */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-600">
                  <a
                    href="tel:050-1793-6500"
                    className="flex items-center space-x-2 hover:text-navy-700 transition-colors"
                    aria-label="電話番号: 050-1793-6500"
                  >
                    <Phone className="w-4 h-4 text-navy-600" />
                    <span className="font-medium">050-1793-6500</span>
                  </a>
                  <a
                    href="mailto:info@package-lab.com"
                    className="flex items-center space-x-2 hover:text-navy-700 transition-colors"
                    aria-label="メールアドレス: info@package-lab.com"
                  >
                    <Mail className="w-4 h-4 text-navy-600" />
                    <span className="font-medium hidden sm:inline">info@package-lab.com</span>
                    <span className="font-medium sm:hidden">メール</span>
                  </a>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-navy-600" />
                    <span className="text-xs">平日 9:00-18:00 (JST)</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center lg:text-right">
                  © 2025 Epackage Lab. 全著作権所有.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-48" />

      </div>

      {/* 会員登録誘導モーダル */}
      {showAuthPrompt && (
        <AuthPromptModal
          onClose={() => setShowAuthPrompt(false)}
          onSignIn={() => router.push('/auth/signin?redirect=/quote-simulator')}
          onRegister={() => router.push('/auth/register?redirect=/quote-simulator')}
        />
      )}
    </div>
  );
}