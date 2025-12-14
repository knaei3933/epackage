"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Filter, Calendar, TrendingUp, Clock, Package, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArchiveFilters } from "./ArchiveFilters";
import { ArchiveGrid } from "./ArchiveGrid";
import { ArchiveDetailModal } from "./ArchiveDetailModal";
import { Pagination } from "./Pagination";
import { type TradeRecord, type ArchiveFilters as FilterType, type PaginationState } from "@/types/archives";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// パウチ包装導入実績データ
const sampleRecords: TradeRecord[] = [
  {
    id: "pouch-001",
    title: "化粧品ブランドソフトパウチ導入事例",
    clientName: "株式会社美容コスメ",
    industry: "cosmetics",
    projectType: "custom_manufacturing",
    description: "高品質3シールソフトパウチを導入し、製品の鮮度保持とブランド価値向上を実現。",
    technicalSpec: "ソフトパウチ（3シール）| 素材: PET/PE | 印刷: 4色グラビア | 密封性: 99.9%保持",
    results: ["製品鮮度維持期間延長", "包装コスト30%削減", "ブランドイメージ向上", "開封性改善"],
    images: [
      { id: "pouch-001-1", url: "/images/archives/cosmetics-pouch-1.jpg", alt: "化粧品用ソフトパウチ", isMain: true, sortOrder: 1 },
      { id: "pouch-001-2", url: "/images/archives/cosmetics-pouch-2.jpg", alt: "パウチ詳細仕様", isMain: false, sortOrder: 2 },
    ],
    startDate: "2024-03-01",
    endDate: "2024-05-15",
    featured: true,
    sortOrder: 1,
    tags: ["ソフトパウチ", "化粧品包装", "3シール", "鮮度保持"],
    createdAt: "2024-05-20T10:00:00Z",
    updatedAt: "2024-05-20T10:00:00Z",
  },
  {
    id: "pouch-002",
    title: "食品メーカースタンディングパウチ大量導入",
    clientName: "フードサービス株式会社",
    industry: "food",
    projectType: "custom_manufacturing",
    description: "チャック付きスタンディングパウチを大量導入し、利便性と保存性を両立した包装ソリューションを提供。",
    technicalSpec: "スタンディングパウチ（チャック付き）| 素材: PET/AL/PE | アルミ箔遮光 | 容量: 100-500g",
    results: ["製品品質維持期間延長", "消費者満足度95%向上", "物流効率40%改善", "在庫管理最適化"],
    images: [
      { id: "pouch-002-1", url: "/images/archives/standing-pouch-1.jpg", alt: "食品用スタンディングパウチ", isMain: true, sortOrder: 1 },
    ],
    startDate: "2024-01-15",
    endDate: "2024-04-30",
    featured: true,
    sortOrder: 2,
    tags: ["スタンディングパウチ", "食品包装", "チャック付き", "遮光性"],
    createdAt: "2024-05-01T09:30:00Z",
    updatedAt: "2024-05-01T09:30:00Z",
  },
  {
    id: "pouch-003",
    title: "健康食品サプリメントガゼットパウチ採用",
    clientName: "ヘルスケア株式会社",
    industry: "pharmaceutical",
    projectType: "custom_manufacturing",
    description: "ガゼットパウチ（マチ付き）を採用し、錠剤や粉末の安全性と利便性を向上。",
    technicalSpec: "ガゼットパウチ（マチ付き）| 素材: PET/PE | 防湿性バリアー | チャイルドレジスタンス付き",
    results: ["製品安全性向上", "開封しやすさ改善", "物流コスト25%削減", "ブランド信頼性向上"],
    images: [
      { id: "pouch-003-1", url: "/images/archives/gusset-pouch-1.jpg", alt: "健康食品用ガゼットパウチ", isMain: true, sortOrder: 1 },
    ],
    startDate: "2023-11-01",
    endDate: "2024-02-28",
    featured: false,
    sortOrder: 3,
    tags: ["ガゼットパウチ", "健康食品", "サプリメント", "安全性"],
    createdAt: "2024-03-01T14:20:00Z",
    updatedAt: "2024-03-01T14:20:00Z",
  },
  {
    id: "pouch-004",
    title: "精密電子部品静電気対策パウチ導入",
    clientName: "電子部品工業株式会社",
    industry: "manufacturing",
    projectType: "custom_manufacturing",
    description: "静電気防止機能付きパウチを導入し、電子部品の輸送時保護を強化。",
    technicalSpec: "静電気防止パウチ| 素材: 金属化PET/PE | 表面抵抗: 10^6-10^9Ω | 透明度: 90%以上",
    results: ["静電気障害90%削減", "輸送不良率98%改善", "コスト競争力向上", "品質保証強化"],
    images: [
      { id: "pouch-004-1", url: "/images/archives/anti-static-pouch-1.jpg", alt: "電子部品用静電気防止パウチ", isMain: true, sortOrder: 1 },
    ],
    startDate: "2023-10-01",
    endDate: "2024-01-15",
    featured: false,
    sortOrder: 4,
    tags: ["静電気防止", "電子部品", "輸送保護", "透明パウチ"],
    createdAt: "2024-01-20T11:45:00Z",
    updatedAt: "2024-01-20T11:45:00Z",
  },
  {
    id: "pouch-005",
    title: "ドリップコーヒーピローパウチ導入支援",
    clientName: "コーヒーブランド株式会社",
    industry: "food",
    projectType: "custom_manufacturing",
    description: "高品質ピローパウチでドリップコーヒー品質を維持しつつ、ブランド訴求力を向上。",
    technicalSpec: "ピローパウチ| 素材: PA/PE | 酸素バリアー性 | ヒリップ品質対応 | 耐熱性: 95℃",
    results: ["製品品質安定化", "ブランド認知度向上", "販売数量200%増加", "顧客満足度92%達成"],
    images: [
      { id: "pouch-005-1", url: "/images/archives/pillow-pouch-1.jpg", alt: "コーヒー用ピローパウチ", isMain: true, sortOrder: 1 },
    ],
    startDate: "2023-09-01",
    endDate: "2023-12-15",
    featured: true,
    sortOrder: 5,
    tags: ["ピローパウチ", "コーヒー", "ドリップ", "品質保持"],
    createdAt: "2023-12-20T16:30:00Z",
    updatedAt: "2023-12-20T16:30:00Z",
  }
];

export function ArchivePage() {
  const [records, setRecords] = useState<TradeRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TradeRecord[]>([]);
  const [filters, setFilters] = useState<FilterType>({
    industry: null,
    projectType: null,
    dateRange: {
      start: null,
      end: null
    },
    featured: false,
    searchTerm: "",
    sortBy: "newest",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 12,
    totalPages: 1,
    totalItems: 0,
  });
  const [selectedRecord, setSelectedRecord] = useState<TradeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load records on mount
  useEffect(() => {
    const loadRecords = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecords(sampleRecords);
      } catch (error) {
        console.error("Failed to load records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  // Filter records based on filters only
  useEffect(() => {
    let filtered = records;

    // Industry filter
    if (filters.industry !== null) {
      filtered = filtered.filter(record => record.industry === filters.industry);
    }

    // Project type filter
    if (filters.projectType !== null) {
      filtered = filtered.filter(record => record.projectType === filters.projectType);
    }

    // Date range filter
    if (filters.dateRange?.start) {
      const startDate = filters.dateRange.start;
      filtered = filtered.filter(record => new Date(record.startDate) >= new Date(startDate));
    }
    if (filters.dateRange?.end) {
      const endDate = filters.dateRange.end;
      filtered = filtered.filter(record => new Date(record.endDate) <= new Date(endDate));
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(record => record.featured);
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  // Update pagination when filtered records change
  useEffect(() => {
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);

    setPagination(prev => ({
      ...prev,
      totalPages,
      totalItems,
      currentPage: Math.min(prev.currentPage, totalPages || 1),
    }));
  }, [filteredRecords, pagination.itemsPerPage]);

  // Get paginated records
  const paginatedRecords = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + pagination.itemsPerPage);
  }, [filteredRecords, pagination.currentPage, pagination.itemsPerPage]);

  // Clear filters
  const clearFilters = () => {
    setFilters({
      industry: null,
      projectType: null,
      dateRange: {
        start: null,
        end: null
      },
      featured: false,
      searchTerm: "",
      sortBy: "newest",
    });
  };

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-brixa-600 to-amber-600 text-white">
        <Container size="6xl" className="py-16">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              パウチ導入実績
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-brixa-600 max-w-3xl mx-auto mb-8"
            >
              化粧品、食品、健康食品など様々な業界のパウチ包装導入事例をご紹介します
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center gap-4"
            >
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/20 backdrop-blur-sm text-white border-white hover:bg-white/30"
              >
                <Package className="w-5 h-5 mr-2" />
                すべての実績 ({records.length})
              </Button>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-brixa-700"
                >
                  パウチ導入相談
                </Button>
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      <Container size="6xl" className="py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Reduced Width */}
          <div className="lg:w-64 flex-shrink-0">
            <ArchiveFilters
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>

          {/* Main Content - Expanded Width */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {isLoading ? "読み込み中..." : `${filteredRecords.length}件の実績`}
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">導入事例</span>
                </div>
              </div>
              {(filters.industry !== null || filters.projectType !== null) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  フィルターをクリア
                </Button>
              )}
            </div>

            {/* Records Grid - Expanded to 2 Columns */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedRecords.length > 0 ? (
              <>
                <ArchiveGrid records={paginatedRecords} onRecordClick={setSelectedRecord} loading={false} />

                {/* Pagination */}
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  該当する実績が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-4">
                  フィルターを変更してもう一度お試しください
                </p>
                <Button onClick={clearFilters}>
                  すべてのフィルターをクリア
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ArchiveDetailModal
                isOpen={!!selectedRecord}
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}