'use client';

import React, { useMemo, useCallback, memo } from 'react';
// import dynamic from 'next/dynamic';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { QuantityComparison } from '@/types/multi-quantity';
// import dynamic from 'next/dynamic';

// TODO: Implement HeavyChartComponents module if needed for optimization
// const HeavyChartComponents = dynamic(() => import('./HeavyChartComponents'), {
//   loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />,
//   ssr: false
// });

interface QuantityEfficiencyChartProps {
  comparison: QuantityComparison | null;
  className?: string;
}

const COLORS = {
  primary: '#1e40af',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  gray: '#6b7280'
} as const;

// Memoized tooltip component
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm">
      <p className="text-sm font-medium text-gray-900 mb-2">{`${label.toLocaleString()}個`}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {`${entry.name}: ${entry.value.toLocaleString('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            minimumFractionDigits: 0
          })}`}
        </p>
      ))}
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

// Memoized chart data preparer
const useChartData = (comparison: QuantityComparison | null) => {
  return useMemo(() => {
    if (!comparison) return [];

    const quantities = Object.keys(comparison.economiesOfScale).map(Number);
    return quantities.sort((a, b) => a - b).map(quantity => ({
      quantity,
      unitPrice: comparison.economiesOfScale[quantity].unitPrice,
      totalSavings: comparison.economiesOfScale[quantity].totalSavings,
      efficiency: comparison.economiesOfScale[quantity].efficiency,
      priceBreak: comparison.priceBreaks.find(pb => pb.quantity === quantity)?.priceBreak || '小ロット'
    }));
  }, [comparison]);
};

// Memoized cost breakdown data
const useCostBreakdownData = (chartData: ReturnType<typeof useChartData>) => {
  return useMemo(() => {
    if (chartData.length === 0) return [];

    // Use middle quantity for demonstration
    const middleIndex = Math.floor(chartData.length / 2);
    const middleQuote = chartData[middleIndex];

    if (!middleQuote) return [];

    const totalPrice = middleQuote.unitPrice * middleQuote.quantity;
    const variableCost = totalPrice * 0.7; // 70% variable cost
    const fixedCost = totalPrice * 0.3; // 30% fixed cost

    return [
      { name: '変動費', value: variableCost, color: COLORS.primary },
      { name: '固定費', value: fixedCost, color: COLORS.secondary },
      { name: '利益', value: middleQuote.totalSavings, color: COLORS.success }
    ];
  }, [chartData]);
};

// Memoized trend analysis
const useTrendInfo = (chartData: ReturnType<typeof useChartData>) => {
  return useMemo(() => {
    if (chartData.length < 2) return { trend: 'stable' as const, change: 0 };

    const firstPrice = chartData[0].unitPrice;
    const lastPrice = chartData[chartData.length - 1].unitPrice;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      trend: change < -5 ? 'decreasing' as const : change > 5 ? 'increasing' as const : 'stable' as const,
      change: Math.abs(change)
    };
  }, [chartData]);
};

// Memoized insights data
const useInsightsData = (comparison: QuantityComparison | null, chartData: ReturnType<typeof useChartData>) => {
  return useMemo(() => {
    if (!comparison || chartData.length === 0) return null;

    const maxEfficiency = Math.max(...chartData.map(d => d.efficiency));
    const bestQuantity = chartData.find(d => d.efficiency === maxEfficiency);
    const scaleEconomy = chartData.length > 1 ?
      Math.round(((chartData[0].unitPrice - chartData[chartData.length - 1].unitPrice) / chartData[0].unitPrice) * 100) : 0;

    return {
      maxEfficiency,
      bestQuantity: bestQuantity?.quantity || 0,
      scaleEconomy
    };
  }, [comparison, chartData]);
};

// Memoized insight card component
const InsightCard = memo(({
  icon,
  title,
  value,
  subtitle
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center text-sm text-gray-600 mb-1">
        {icon}
        {title}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
      </div>
      <div className="text-xs text-gray-500">
        {subtitle}
      </div>
    </div>
  );
});

InsightCard.displayName = 'InsightCard';

// Memoized chart wrapper for performance
const ChartWrapper = memo(({
  children,
  height = 300,
  className = ""
}: {
  children: React.ReactNode;
  height?: number;
  className?: string;
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
});

ChartWrapper.displayName = 'ChartWrapper';

export default function QuantityEfficiencyChart({
  comparison,
  className = ""
}: QuantityEfficiencyChartProps) {
  const chartData = useChartData(comparison);
  const costBreakdownData = useCostBreakdownData(chartData);
  const trendInfo = useTrendInfo(chartData);
  const insightsData = useInsightsData(comparison, chartData);

  // Memoized chart configurations
  const lineChartConfig = useMemo(() => ({
    data: chartData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  }), [chartData]);

  const areaChartConfig = useMemo(() => ({
    data: chartData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  }), [chartData]);

  const barChartConfig = useMemo(() => ({
    data: chartData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  }), [chartData]);

  const pieChartConfig = useMemo(() => ({
    data: costBreakdownData,
    cx: "50%",
    cy: "50%",
    labelLine: false,
    label: ({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`,
    outerRadius: 80,
    fill: "#8884d8",
    dataKey: "value"
  }), [costBreakdownData]);

  // Memoized formatters
  const formatQuantity = useCallback((value: number) => `${(value / 1000).toFixed(1)}k`, []);
  const formatCurrency = useCallback((value: number) => `¥${(value / 1000).toFixed(1)}k`, []);
  const formatPercentage = useCallback((value: number) => `${value}%`, []);

  if (!comparison) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">比較データがありません</p>
          <p className="text-sm text-gray-500 mt-2">数量を選択して分析を開始してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            コスト効率性分析
          </h3>
          <div className="flex items-center space-x-4 flex-wrap">
            <div className="flex items-center">
              {trendInfo.trend === 'decreasing' ? (
                <TrendingDown className="w-5 h-5 text-green-600 mr-1" />
              ) : trendInfo.trend === 'increasing' ? (
                <TrendingUp className="w-5 h-5 text-red-600 mr-1" />
              ) : (
                <DollarSign className="w-5 h-5 text-gray-600 mr-1" />
              )}
              <span className="text-sm font-medium text-gray-700">
                価格トレンド: {trendInfo.trend === 'decreasing' ? '低下' : trendInfo.trend === 'increasing' ? '上昇' : '安定'}
              </span>
            </div>
            {comparison.bestValue && (
              <div className="text-sm text-purple-700 font-medium">
                最適数量: {comparison.bestValue.quantity.toLocaleString()}個
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Price Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">単価トレンド</h4>
          <ChartWrapper>
            <LineChart {...lineChartConfig}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="quantity"
                tickFormatter={formatQuantity}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="unitPrice"
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 6 }}
                activeDot={{ r: 8 }}
                name="単価"
                animationDuration={1000}
              />
            </LineChart>
          </ChartWrapper>
          <div className="mt-4 text-sm text-gray-600">
            <p>数量が増えるほど単価は低下する傾向があります</p>
          </div>
        </div>

        {/* Efficiency Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">効率性指標</h4>
          <ChartWrapper>
            <AreaChart {...areaChartConfig}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="quantity"
                tickFormatter={formatQuantity}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatPercentage}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke={COLORS.success}
                fill={COLORS.success}
                fillOpacity={0.6}
                strokeWidth={2}
                name="効率性"
                animationDuration={1000}
              />
            </AreaChart>
          </ChartWrapper>
          <div className="mt-4 text-sm text-gray-600">
            <p>効率性100%を基準としたコスト効率の推移</p>
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">コスト構成</h4>
          <ChartWrapper height={250}>
            <PieChart>
              <Pie {...pieChartConfig}>
                {costBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString('ja-JP', {
                  style: 'currency',
                  currency: 'JPY',
                  minimumFractionDigits: 0
                })}
                animationDuration={1000}
              />
            </PieChart>
          </ChartWrapper>
          <div className="mt-4 text-sm text-gray-600">
            <p>変動費、固定費、利益の構成比率（中間数量ベース）</p>
          </div>
        </div>

        {/* Total Savings Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">節約効果</h4>
          <ChartWrapper height={250}>
            <BarChart {...barChartConfig}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="quantity"
                tickFormatter={formatQuantity}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="totalSavings"
                fill={COLORS.warning}
                name="節約額"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ChartWrapper>
          <div className="mt-4 text-sm text-gray-600">
            <p>各数量での総節約額（最小数量との比較）</p>
          </div>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          分析インサイト
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            icon={<DollarSign className="w-4 h-4 mr-1" />}
            title="最適コスト効率"
            value={`${insightsData?.maxEfficiency || 0}%`}
            subtitle={`${insightsData?.bestQuantity?.toLocaleString() || 0}個で達成`}
          />
          <InsightCard
            icon={<TrendingDown className="w-4 h-4 mr-1" />}
            title="最大節約効果"
            value={`${comparison.bestValue.percentage}%`}
            subtitle={`${comparison.bestValue.quantity.toLocaleString()}個選択時`}
          />
          <InsightCard
            icon={<PieChartIcon className="w-4 h-4 mr-1" />}
            title="規模の経済"
            value={`${insightsData?.scaleEconomy || 0}%`}
            subtitle="最小から最大数量へのコスト削減率"
          />
        </div>
      </div>
    </div>
  );
}