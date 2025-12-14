'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Bookmark,
  Clock,
  TrendingUp,
  Hash,
  X,
  Check,
  Star,
  Package
} from 'lucide-react';

interface QuantityPattern {
  id: string;
  name: string;
  quantities: number[];
  description?: string;
  category: 'business' | 'custom' | 'recent';
  frequency?: number;
  lastUsed?: Date;
  isRecommended?: boolean;
}

interface QuantityPatternManagerProps {
  currentQuantities: number[];
  onLoadPattern: (pattern: QuantityPattern) => void;
  onSavePattern: (pattern: Omit<QuantityPattern, 'id'>) => void;
  className?: string;
}

const BUSINESS_PATTERNS: QuantityPattern[] = [
  {
    id: 'startup-kit',
    name: 'スタートアップキット',
    quantities: [500, 1000, 2000],
    description: '初期製品テストと小規模販売',
    category: 'business',
    isRecommended: true
  },
  {
    id: 'growth-phase',
    name: '成長期生産',
    quantities: [5000, 10000, 20000],
    description: '市場拡大とコスト最適化',
    category: 'business',
    isRecommended: true
  },
  {
    id: 'enterprise-scale',
    name: 'エンタープライズ規模',
    quantities: [50000, 100000, 250000],
    description: '大規模展開と最適コスト',
    category: 'business',
    isRecommended: true
  },
  {
    id: 'seasonal-demand',
    name: '季節需要対応',
    quantities: [1000, 5000, 10000, 50000],
    description: '季節変動に対応する柔軟な生産計画',
    category: 'business'
  }
];

export function QuantityPatternManager({
  currentQuantities,
  onLoadPattern,
  onSavePattern,
  className = ''
}: QuantityPatternManagerProps) {
  const [savedPatterns, setSavedPatterns] = useState<QuantityPattern[]>([]);
  const [recentPatterns, setRecentPatterns] = useState<QuantityPattern[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPatternName, setNewPatternName] = useState('');
  const [newPatternDescription, setNewPatternDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'business' | 'custom' | 'recent'>('business');

  // Load saved patterns from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('quantity-patterns');
    const recent = localStorage.getItem('recent-quantity-patterns');

    if (saved) {
      try {
        setTimeout(() => setSavedPatterns(JSON.parse(saved)), 0);
      } catch (e) {
        console.warn('Failed to load saved patterns:', e);
      }
    }

    if (recent) {
      try {
        setTimeout(() => setRecentPatterns(JSON.parse(recent)), 0);
      } catch (e) {
        console.warn('Failed to load recent patterns:', e);
      }
    }
  }, []);

  // Track current quantities as recent pattern
  useEffect(() => {
    if (currentQuantities.length >= 2) {
      const existingRecentIndex = recentPatterns.findIndex(
        pattern => JSON.stringify(pattern.quantities.sort()) === JSON.stringify(currentQuantities.sort())
      );

      const newRecentPattern: QuantityPattern = {
        id: `recent-${Date.now()}`,
        name: `数量パターン ${currentQuantities.length}件`,
        quantities: currentQuantities,
        category: 'recent',
        lastUsed: new Date(),
        frequency: existingRecentIndex >= 0 ? (recentPatterns[existingRecentIndex].frequency || 0) + 1 : 1
      };

      let updatedRecent;
      if (existingRecentIndex >= 0) {
        updatedRecent = [...recentPatterns];
        updatedRecent[existingRecentIndex] = newRecentPattern;
      } else {
        updatedRecent = [newRecentPattern, ...recentPatterns.slice(0, 4)];
      }

      setTimeout(() => {
        setRecentPatterns(updatedRecent);
        localStorage.setItem('recent-quantity-patterns', JSON.stringify(updatedRecent));
      }, 0);
    }
  }, [currentQuantities, recentPatterns]);

  const handleSavePattern = () => {
    if (!newPatternName.trim() || currentQuantities.length === 0) return;

    const newPattern: Omit<QuantityPattern, 'id'> = {
      name: newPatternName.trim(),
      quantities: currentQuantities,
      description: newPatternDescription.trim() || undefined,
      category: 'custom',
      frequency: 0
    };

    onSavePattern(newPattern);

    const patternWithId: QuantityPattern = {
      ...newPattern,
      id: `custom-${Date.now()}`
    };

    const updatedSaved = [...savedPatterns, patternWithId];
    setSavedPatterns(updatedSaved);
    localStorage.setItem('quantity-patterns', JSON.stringify(updatedSaved));

    // Reset form
    setNewPatternName('');
    setNewPatternDescription('');
    setShowSaveDialog(false);
  };

  const handleDeletePattern = (patternId: string) => {
    const updatedSaved = savedPatterns.filter(p => p.id !== patternId);
    setSavedPatterns(updatedSaved);
    localStorage.setItem('quantity-patterns', JSON.stringify(updatedSaved));
  };

  const handleLoadPattern = (pattern: QuantityPattern) => {
    onLoadPattern(pattern);
  };

  const getAllPatterns = () => {
    switch (activeTab) {
      case 'business':
        return BUSINESS_PATTERNS;
      case 'custom':
        return savedPatterns;
      case 'recent':
        return recentPatterns.slice(0, 10); // Limit recent patterns
      default:
        return [];
    }
  };

  const getPatternIcon = (pattern: QuantityPattern) => {
    if (pattern.isRecommended) return <Star className="w-4 h-4 text-yellow-500" />;
    if (pattern.category === 'business') return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (pattern.category === 'recent') return <Clock className="w-4 h-4 text-green-500" />;
    return <Bookmark className="w-4 h-4 text-gray-500" />;
  };

  const formatQuantities = (quantities: number[]) => {
    return quantities
      .sort((a, b) => a - b)
      .map(q => `${(q / 1000).toFixed(0)}K`)
      .join(', ');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">数量パターン管理</h3>
            <p className="text-sm text-gray-600">よく使う数量組み合わせを保存・活用</p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => setShowSaveDialog(true)}
          disabled={currentQuantities.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save className="w-4 h-4 mr-2" />
          現在の数量を保存
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'business'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          ビジネス
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'custom'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bookmark className="w-4 h-4 inline mr-2" />
          保存済み {savedPatterns.length > 0 && `(${savedPatterns.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'recent'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          最近使った {recentPatterns.length > 0 && `(${recentPatterns.length})`}
        </button>
      </div>

      {/* Patterns Grid */}
      <div className="grid gap-3">
        <AnimatePresence mode="wait">
          {getAllPatterns().length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8 text-gray-500"
            >
              <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>保存されたパターンがありません</p>
              <p className="text-sm">現在の数量組み合わせを保存してみましょう</p>
            </motion.div>
          ) : (
            getAllPatterns().map((pattern, index) => {
              const isCurrentlySelected = JSON.stringify(pattern.quantities.sort()) ===
                JSON.stringify(currentQuantities.sort());

              return (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-white border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                    isCurrentlySelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleLoadPattern(pattern)}
                >
                  {/* Status Indicator */}
                  {isCurrentlySelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Pattern Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPatternIcon(pattern)}
                      <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
                      {pattern.isRecommended && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          おすすめ
                        </span>
                      )}
                    </div>

                    {pattern.category === 'custom' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePattern(pattern.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Pattern Description */}
                  {pattern.description && (
                    <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                  )}

                  {/* Quantities Display */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {formatQuantities(pattern.quantities)}
                      </span>
                      <span className="text-gray-500">
                        ({pattern.quantities.length}件)
                      </span>
                    </div>

                    {pattern.frequency && pattern.frequency > 1 && (
                      <span className="text-xs text-gray-500">
                        {pattern.frequency}回使用
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {pattern.lastUsed && `最終使用: ${new Date(pattern.lastUsed).toLocaleDateString()}`}
                    </span>
                    {!isCurrentlySelected && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadPattern(pattern);
                        }}
                      >
                        このパターンを読み込む
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Save Pattern Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Save className="w-5 h-5 mr-2 text-purple-600" />
                  数量パターンを保存
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パターン名 *
                  </label>
                  <input
                    type="text"
                    value={newPatternName}
                    onChange={(e) => setNewPatternName(e.target.value)}
                    placeholder="例：小ロットテスト用"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明（任意）
                  </label>
                  <textarea
                    value={newPatternDescription}
                    onChange={(e) => setNewPatternDescription(e.target.value)}
                    placeholder="このパターンの用途や目的を記述"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    保存する数量
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentQuantities.map((qty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {qty.toLocaleString()}個
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <motion.button
                  type="button"
                  onClick={handleSavePattern}
                  disabled={!newPatternName.trim() || currentQuantities.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuantityPatternManager;