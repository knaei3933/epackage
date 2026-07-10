/**
 * Printing method recommendation display.
 */

import { Info } from 'lucide-react';

interface Recommendation {
  method: 'digital' | 'gravure';
  reason: string;
  breakevenQuantity: number;
  digitalTotalPrice: number;
  gravureTotalPrice: number;
}

interface PrintingRecommendationProps {
  recommendation: Recommendation;
  showPatternComparison: boolean;
}

export function PrintingRecommendation({ recommendation, showPatternComparison }: PrintingRecommendationProps) {
  if (showPatternComparison) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
          推
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            おすすめの印刷方法: {recommendation.method === 'gravure' ? 'グラビア印刷' : 'デジタル印刷'}
          </h3>
          <p className="text-sm text-blue-800 mb-3">{recommendation.reason}</p>
          <details className="text-xs text-blue-700 mb-3">
            <summary className="cursor-pointer hover:text-blue-900 inline-flex items-center font-medium">
              <Info className="w-3.5 h-3.5 mr-1" />
              グラビアとデジタルの違いについて
            </summary>
            <div className="mt-2 space-y-1.5 text-blue-800 leading-relaxed">
              <p>
                <span className="font-semibold">デジタル印刷</span>：版（かなばん）を作らず、プリンターのように直接印刷。
                <span className="font-semibold">少量向け</span>。初期費用がかからず、少量なら安く早く仕上がります。
              </p>
              <p>
                <span className="font-semibold">グラビア印刷</span>：専用の銅版（どうばん＝印刷の型）を作って印刷。
                <span className="font-semibold">多量向け</span>。版づくりの初期費用がかかりますが、多く刷るほど1個あたりの単価が下がり、品質も安定します。
              </p>
              <p className="text-blue-600 pt-1 border-t border-blue-200">
                つまり「<span className="font-semibold">分岐点数量</span>」は、グラビアがデジタルより安くなる<span className="font-semibold">境界の個数</span>です。
                これより多く発注するならグラビア、少ないならデジタルがお得、という目安です。
              </p>
            </div>
          </details>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-1">デジタル総額</div>
              <div className={`font-semibold ${recommendation.method === 'digital' ? 'text-blue-700' : 'text-gray-700'}`}>
                {recommendation.digitalTotalPrice >= 0
                  ? `¥${recommendation.digitalTotalPrice.toLocaleString()}`
                  : '計算不可'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-1">グラビア総額</div>
              <div className={`font-semibold ${recommendation.method === 'gravure' ? 'text-blue-700' : 'text-gray-700'}`}>
                {recommendation.gravureTotalPrice >= 0
                  ? `¥${recommendation.gravureTotalPrice.toLocaleString()}`
                  : '計算不可'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-1">分岐点数量</div>
              <div className="font-semibold text-gray-700">
                {recommendation.breakevenQuantity >= 0
                  ? `約${recommendation.breakevenQuantity.toLocaleString()}個`
                  : '－'}
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            ※ 推奨は目安です。数量・仕様変更で分岐点は前後します。印刷方式は設定で「デジタル/グラビア/自動選択」から上書き選択できます。
          </p>
        </div>
      </div>
    </div>
  );
}
