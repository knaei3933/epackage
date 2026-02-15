'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Lightbulb,
  DollarSign,
  Package,
  Award,
  Info,
  ChevronRight,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface QuantityRecommendation {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  savings: number; // percentage savings compared to base
  recommendationReason: string;
  confidence: number; // 0-100
  category: 'optimal' | 'economical' | 'balanced' | 'premium';
  features: string[];
  tradeoffs: string[];
}

interface OptimalQuantityRecommenderProps {
  currentQuantities: number[];
  baseUnitPrice: number;
  onQuantitySelect: (quantity: number) => void;
  className?: string;
}

export function OptimalQuantityRecommender({
  currentQuantities,
  baseUnitPrice,
  onQuantitySelect,
  className = ''
}: OptimalQuantityRecommenderProps) {
  const [recommendations, setRecommendations] = useState<QuantityRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Simulate pricing analysis - in real app this would call the actual pricing API
  const analyzePricingStructure = async () => {
    setIsAnalyzing(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysis: QuantityRecommendation[] = [
      {
        quantity: 1000,
        unitPrice: baseUnitPrice * 0.95,
        totalPrice: baseUnitPrice * 1000 * 0.95,
        savings: 5,
        recommendationReason: '小ロット最適価格 - 初期導入に最適',
        confidence: 85,
        category: 'economical',
        features: ['5%割引適用', '迅速な生産対応', 'リスク最小化'],
        tradeoffs: ['単価比較では割高', '大量生産のメリットなし']
      },
      {
        quantity: 5000,
        unitPrice: baseUnitPrice * 0.82,
        totalPrice: baseUnitPrice * 5000 * 0.82,
        savings: 18,
        recommendationReason: 'コスト効率最適化 - 最もバランスの取れた選択',
        confidence: 95,
        category: 'optimal',
        features: ['18%割引適用', '生産効率最大化', '品質安定性'],
        tradeoffs: ['初期投資やや高め', '在庫管理必要']
      },
      {
        quantity: 10000,
        unitPrice: baseUnitPrice * 0.75,
        totalPrice: baseUnitPrice * 10000 * 0.75,
        savings: 25,
        recommendationReason: '大量生産メリット最大 - 長期的に最も経済的',
        confidence: 90,
        category: 'premium',
        features: ['25%割引適用', '最適コスト実現', '優先生産対応'],
        tradeoffs: ['大規模在庫必要', '資金繰りへの影響']
      },
      {
        quantity: 20000,
        unitPrice: baseUnitPrice * 0.68,
        totalPrice: baseUnitPrice * 20000 * 0.68,
        savings: 32,
        recommendationReason: '超大量生産 - 最大限のコスト削減を実現',
        confidence: 88,
        category: 'premium',
        features: ['32%割引適用', '絶対的コスト優位', '戦略的備蓄可能'],
        tradeoffs: ['最大規模の投資', '長期保管コスト', '需要予測必須']
      }
    ];

    setRecommendations(analysis);
    setIsAnalyzing(false);
  };

  // Run analysis when component mounts or base price changes
  useEffect(() => {
    if (baseUnitPrice > 0) {
      analyzePricingStructure();
    }
  }, [baseUnitPrice]);

  // Get category styling
  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      optimal: 'from-green-500 to-emerald-600 text-white',
      economical: 'from-blue-500 to-indigo-600 text-white',
      balanced: 'from-purple-500 to-pink-600 text-white',
      premium: 'from-orange-500 to-red-600 text-white'
    };
    return styles[category] || styles.economical;
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      optimal: '最適推奨',
      economical: '経済的',
      balanced: 'バランス型',
      premium: '高級仕様'
    };
    return labels[category] || '標準';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get recommendation icon
  const getRecommendationIcon = (recommendation: QuantityRecommendation) => {
    if (recommendation.category === 'optimal') {
      return <Target className="w-5 h-5 text-green-600" />;
    }
    if (recommendation.category === 'premium') {
      return <Award className="w-5 h-5 text-orange-600" />;
    }
    return <TrendingUp className="w-5 h-5 text-blue-600" />;
  };

  const bestRecommendation = useMemo(() => {
    return recommendations.find(r => r.category === 'optimal') || recommendations[0];
  }, [recommendations]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                AI数量推奨システム
              </h3>
              <p className="text-gray-600 text-sm">
                コスト効率を最大化する最適な数量をAIが分析・提案
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Explanation Panel */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">AI推奨アルゴリズムについて</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• 生産コスト構造と規模の経済性を分析</li>
                  <li>• 数量増加による単価低下率を予測</li>
                  <li>• 在庫コストと資金効率を考慮</li>
                  <li>• 業界標準とベストプラクティスを反映</li>
                  <li>• リスクとリターンのバランスを最適化</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Status */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 rounded-lg p-6 text-center"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium">
              AIが最適数量を分析中...
            </span>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            生産コスト構造と市場データを解析しています
          </div>
        </motion.div>
      )}

      {/* Best Recommendation Highlight */}
      <AnimatePresence>
        {!isAnalyzing && bestRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    最適推奨数量
                  </h4>
                  <p className="text-gray-600 text-sm">
                    AI分析に基づく最もコスト効率の良い選択
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">
                  {bestRecommendation.quantity.toLocaleString()}個
                </div>
                <div className="text-sm text-green-600">
                  {bestRecommendation.savings}%節約可能
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">単価</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(bestRecommendation.unitPrice)}
                </div>
                <div className="text-xs text-green-600">
                  通常価格より{bestRecommendation.savings}%割引
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">総額</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(bestRecommendation.totalPrice)}
                </div>
                <div className="text-xs text-gray-500">
                  税別・送料別
                </div>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => onQuantitySelect(bestRecommendation.quantity)}
              className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              この数量を選択する
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Recommendations */}
      <AnimatePresence>
        {!isAnalyzing && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              すべての推奨オプション
            </h4>

            <div className="grid gap-4">
              {recommendations.map((recommendation, index) => {
                const isBest = recommendation.category === 'optimal';

                return (
                  <motion.div
                    key={recommendation.quantity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-white border-2 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer ${
                      isBest
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onQuantitySelect(recommendation.quantity)}
                  >
                    {/* Best Badge */}
                    {isBest && (
                      <div className="absolute -top-2 -right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        最適
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getRecommendationIcon(recommendation)}

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              {recommendation.quantity.toLocaleString()}個
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryStyle(recommendation.category)}`}>
                              {getCategoryLabel(recommendation.category)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mt-1">
                            {recommendation.recommendationReason}
                          </p>

                          <div className="flex items-center space-x-3 mt-2">
                            <div className="text-xs text-gray-500">
                              信頼度: {recommendation.confidence}%
                            </div>
                            <div className="text-xs font-semibold text-green-600">
                              {recommendation.savings}%節約
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(recommendation.unitPrice)}
                        </div>
                        <div className="text-xs text-gray-500">単価</div>
                        <div className="text-sm font-semibold text-gray-700 mt-1">
                          {formatCurrency(recommendation.totalPrice)}
                        </div>
                        <div className="text-xs text-gray-500">総額</div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-2">メリット:</div>
                        <ul className="space-y-1">
                          {recommendation.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-green-700 flex items-start">
                              <CheckCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-2">考慮点:</div>
                        <ul className="space-y-1">
                          {recommendation.tradeoffs.map((tradeoff, idx) => (
                            <li key={idx} className="text-xs text-orange-700 flex items-start">
                              <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              {tradeoff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        この数量を選択
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Educational Footer */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>
            推奨は生産コスト構造、規模の経済性、市場データを基にAIが分析しています
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          実際の価格は仕様、材料、納期により変動する場合があります
        </div>
      </div>
    </div>
  );
}

export default OptimalQuantityRecommender;