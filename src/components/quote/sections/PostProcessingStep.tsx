/**
 * PostProcessingStep Component
 *
 * Handles post-processing option selection with conflict detection
 * Extracted from ImprovedQuotingWizard for better maintainability
 */

import React from 'react';
import { Settings, Check, AlertCircle, Info } from 'lucide-react';
import { useQuote, useQuoteState, createStepSummary, getPostProcessingLimitStatusForState } from '@/contexts/QuoteContext';

export interface PostProcessingOption {
  id: string;
  name: string;
  multiplier: number;
  description: string;
  detailedDescription: string;
  previewImage: string;
  features: string[];
}

const POST_PROCESSING_OPTIONS: PostProcessingOption[] = [
  {
    id: 'zipper-yes',
    name: 'ジッパー付き',
    multiplier: 1.15,
    description: '再利用可能なジッパー付き',
    detailedDescription: '開閉が容易なジッパーを装着。内容物の新鮮度保持と再利用性を向上させます。',
    previewImage: '/images/post-processing/1.ジッパーあり.png',
    features: ['再利用可能', '気密性維持', '開閉簡単']
  },
  {
    id: 'zipper-no',
    name: 'ジッパーなし',
    multiplier: 1.0,
    description: '一回使用のシールトップ',
    detailedDescription: 'シンプルなシール構造でコスト効率に優れています。',
    previewImage: '/images/post-processing/1.ジッパーなし.png',
    features: ['コスト効率', 'シンプル構造', '安全閉鎖']
  },
  {
    id: 'glossy',
    name: '光沢仕上げ',
    multiplier: 1.08,
    description: '高光沢のプレミアム仕上げ',
    detailedDescription: '高光沢表面処理で視覚的な魅力と色彩の鮮やかさを高めます。',
    previewImage: '/images/post-processing/2.光沢.png',
    features: ['プレミアム外観', '色彩強化', 'プロの見た目']
  },
  {
    id: 'matte',
    name: 'マット仕上げ',
    multiplier: 1.05,
    description: '光沢のないエレガントな表面',
    detailedDescription: '高級感のあるマット調表面処理。光沢を抑え、指紋が目立ちにくくなります。',
    previewImage: '/images/post-processing/2.マット.png',
    features: ['エレガント外観', 'グレア軽減', '指紋防止']
  },
  {
    id: 'notch-yes',
    name: 'ノッチ付き',
    multiplier: 1.03,
    description: '開封しやすいノッチ付き',
    detailedDescription: '手で簡単に開封できるノッチ加工。スナック包装に適しています。',
    previewImage: '/images/post-processing/3.ノッチあり.png',
    features: ['手で簡単開封', '清潔な切断', '工具不要']
  },
  {
    id: 'notch-no',
    name: 'ノッチなし',
    multiplier: 1.0,
    description: 'ノッチなしのクリーンエッジ',
    detailedDescription: 'ノッチなしのクリーンなエッジデザイン。',
    previewImage: '/images/post-processing/3.ノッチなし.png',
    features: ['クリーンデザイン', 'シンプルエッジ', '標準仕上げ']
  },
  {
    id: 'hang-hole-6mm',
    name: '吊り下げ穴 (6mm)',
    multiplier: 1.03,
    description: '軽量製品用の6mm小さな吊り穴',
    detailedDescription: '店舗での吊り下げ陳列に最適な6mm穴加工。軽量製品に適しています。',
    previewImage: '/images/post-processing/4.吊り穴あり.png',
    features: ['陳列効率UP', '省スペース', '小さいサイズ']
  },
  {
    id: 'hang-hole-8mm',
    name: '吊り下げ穴 (8mm)',
    multiplier: 1.04,
    description: '標準製品用の8mm大きな吊り穴',
    detailedDescription: 'やや大きめの8mm穴加工。太い吊り下げ器具にも対応可能です。',
    previewImage: '/images/post-processing/4.吊り穴あり.png',
    features: ['陳列効率UP', '多用途', '標準サイズ']
  },
  {
    id: 'hang-hole-no',
    name: '吊り穴なし',
    multiplier: 1.0,
    description: '吊り穴なしのクリーンなデザイン',
    detailedDescription: '吊り穴なしのクリーンなデザイン。',
    previewImage: '/images/post-processing/4.吊り穴なし.png',
    features: ['クリーン外観', 'シンプルデザイン', '標準仕上げ']
  },
  {
    id: 'corner-round',
    name: '角丸',
    multiplier: 1.06,
    description: '安全でモダンな角丸加工',
    detailedDescription: 'パッケージの角を丸く加工。安全性を高め、モダンな印象を与えます。',
    previewImage: '/images/post-processing/5.角丸.png',
    features: ['安全性向上', 'モダン外観', '手当たり良好']
  },
  {
    id: 'corner-square',
    name: '角直角',
    multiplier: 1.0,
    description: '伝統的な直角デザイン',
    detailedDescription: '伝統的な直角デザインで最大スペースを確保できます。',
    previewImage: '/images/post-processing/5.角直角.png',
    features: ['伝統外観', '最大スペース', 'クラシックデザイン']
  },
  {
    id: 'valve-yes',
    name: 'バルブ付き',
    multiplier: 1.08,
    description: 'コーヒー製品用の一方弁付き',
    detailedDescription: '空気を逃がす一方通行バルブ。コーヒー豆などの脱ガスが必要な製品に最適です。',
    previewImage: '/images/post-processing/バルブあり.png',
    features: ['脱ガス機能', '湿気防止', '鮮度保持']
  },
  {
    id: 'valve-no',
    name: 'バルブなし',
    multiplier: 1.0,
    description: 'バルブなしの標準パウチ',
    detailedDescription: 'バルブなしの標準パウチ構造。',
    previewImage: '/images/post-processing/バルブなし.png',
    features: ['シンプル構造', 'コスト効率', '標準デザイン']
  },
  {
    id: 'top-open',
    name: '上端開封',
    multiplier: 1.02,
    description: '使いやすい上端開封シール',
    detailedDescription: '開封しやすい上端デザイン。使いやすさを重視した製品に適しています。',
    previewImage: '/images/post-processing/6.上端開封.png',
    features: ['アクセス容易', '便利分配', 'ユーザーフレンドリー']
  },
  {
    id: 'bottom-open',
    name: '下端開封',
    multiplier: 1.03,
    description: '製品を完全に排出する下端開封',
    detailedDescription: '製品を完全に排出できる下端開封。産業用途に適しています。',
    previewImage: '/images/post-processing/6.下端開封.png',
    features: ['完全空にする', '無駄なし', '産業用途']
  }
];

// ジッパー位置選択肢
const ZIPPER_POSITION_OPTIONS: PostProcessingOption[] = [
  {
    id: 'zipper-position-any',
    name: 'ジッパー位置: お任せ',
    multiplier: 0,
    description: 'メーカーが最適な位置を決定',
    detailedDescription: '専門家が製造工程に最適なジッパー位置を決定します。',
    previewImage: '/images/post-processing/1.ジッパーあり.png',
    features: []
  },
  {
    id: 'zipper-position-specified',
    name: 'ジッパー位置: 指定',
    multiplier: 1.05,
    description: 'お客様が位置を指定',
    detailedDescription: 'お客様のご指定位置にジッパーを配置します。追加費用がかかります。',
    previewImage: '/images/post-processing/1.ジッパーあり.png',
    features: []
  }
];

// Mutually exclusive option groups
const EXCLUSIVE_GROUPS: Record<string, string[]> = {
  'zipper-yes': ['zipper-no'],
  'zipper-no': ['zipper-yes'],
  'glossy': ['matte'],
  'matte': ['glossy'],
  'notch-yes': ['notch-no'],
  'notch-no': ['notch-yes'],
  'hang-hole-6mm': ['hang-hole-8mm', 'hang-hole-no'],
  'hang-hole-8mm': ['hang-hole-6mm', 'hang-hole-no'],
  'hang-hole-no': ['hang-hole-6mm', 'hang-hole-8mm'],
  'corner-round': ['corner-square'],
  'corner-square': ['corner-round'],
  'valve-yes': ['valve-no'],
  'valve-no': ['valve-yes'],
  'top-open': ['bottom-open'],
  'bottom-open': ['top-open']
};

interface PostProcessingStepProps {
  getStepSummary?: (step: string) => React.ReactNode;
}

/**
 * Component for selecting post-processing options
 */
export function PostProcessingStep({ getStepSummary }: PostProcessingStepProps) {
  const state = useQuoteState();
  const { updatePostProcessing } = useQuote();

  // Use the provided getStepSummary or create one from state
  const stepSummary = getStepSummary || ((step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step));

  const toggleOption = (optionId: string, multiplier: number) => {
    const currentOptions = state.postProcessingOptions || [];

    let newOptions: string[];

    if (currentOptions.includes(optionId)) {
      // If deselecting, simply remove the option
      newOptions = currentOptions.filter(id => id !== optionId);
    } else {
      // If selecting, remove mutually exclusive options first
      const exclusiveOptions = EXCLUSIVE_GROUPS[optionId] || [];
      newOptions = [
        ...currentOptions.filter(id => !exclusiveOptions.includes(id)),
        optionId
      ];
    }

    // Calculate total multiplier (including zipper position options)
    const allOptions = [...ZIPPER_POSITION_OPTIONS, ...POST_PROCESSING_OPTIONS];
    const totalMultiplier = newOptions.reduce((acc, id) => {
      const option = allOptions.find(opt => opt.id === id);
      return acc + (option ? option.multiplier - 1 : 0);
    }, 1.0);

    updatePostProcessing(newOptions, totalMultiplier);
  };

  // Helper function to check for conflicts
  const getConflictingOptions = (optionId: string): string[] => {
    const currentOptions = state.postProcessingOptions || [];
    return (EXCLUSIVE_GROUPS[optionId] || []).filter(opt => currentOptions.includes(opt));
  };

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
            {stepSummary('specs')}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">数量・印刷</h3>
            </div>
            {stepSummary('quantity')}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            追加の後加工オプションを選択してください（オプション）
          </p>

          <div className="space-y-4">
            {POST_PROCESSING_OPTIONS.map(option => {
              const conflictingOptions = getConflictingOptions(option.id);

              return (
              <div
                key={option.id}
                className={`border-2 rounded-lg overflow-hidden transition-all relative ${
                  state.postProcessingOptions?.includes(option.id)
                    ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.01]'
                    : conflictingOptions.length > 0
                    ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                    : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
                }`}
              >
                {state.postProcessingOptions?.includes(option.id) && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                {conflictingOptions.length > 0 && !state.postProcessingOptions?.includes(option.id) && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => toggleOption(option.id, option.multiplier)}
                  className="w-full text-left"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{option.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>

                        {/* Conflict Warning */}
                        {conflictingOptions.length > 0 && !state.postProcessingOptions?.includes(option.id) && (
                          <div className="mb-2 p-2 bg-amber-100 border border-amber-200 rounded">
                            <div className="text-xs text-amber-800 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="font-medium">競合オプション:</span> {conflictingOptions.map(id => {
                                const conflictOption = POST_PROCESSING_OPTIONS.find(opt => opt.id === id);
                                return conflictOption ? conflictOption.name : id;
                              }).join(', ')}
                            </div>
                            <div className="text-xs text-amber-700 mt-1">
                              選択すると現在のオプションは除外されます
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {option.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs text-navy-600 font-medium">
                          倍率: ×{option.multiplier}
                        </div>
                      </div>

                      {/* Preview Image */}
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={option.previewImage}
                            alt={option.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/pouch.png';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Description (shown when selected) */}
                  {state.postProcessingOptions?.includes(option.id) && (
                    <div className="px-4 pb-4 border-t border-navy-200">
                      <div className="pt-3 text-sm text-gray-700 bg-white rounded p-3">
                        <Info className="w-4 h-4 text-navy-600 mr-1 inline mb-1" />
                        {option.detailedDescription}
                      </div>
                    </div>
                  )}
                </button>
              </div>
            )
            })}
          </div>
        </div>

        {/* ジッパー位置選択 */}
        {state.postProcessingOptions?.includes('zipper-yes') && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              ジッパー位置の選択
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ZIPPER_POSITION_OPTIONS.map((position) => (
                <button
                  key={position.id}
                  type="button"
                  onClick={() => toggleOption(position.id, position.multiplier)}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                    state.postProcessingOptions?.includes(position.id)
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-medium text-sm">{position.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{position.description}</div>
                  {position.multiplier > 0 && (
                    <div className="text-xs text-blue-600 font-medium mt-2">
                      追加倍率: ×{position.multiplier}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.postProcessingMultiplier > 1.0 && (
          <div className="p-3 bg-navy-50 rounded-lg border border-navy-200">
            <div className="text-sm text-navy-700">
              <span className="font-medium">後加工倍率:</span> ×{state.postProcessingMultiplier.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
