"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Filter, Calendar, TrendingUp, Clock, Package, Award, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArchiveFilters } from "./ArchiveFilters";
import { ArchiveGrid } from "./ArchiveGrid";
import { Pagination } from "./Pagination";
import { type TradeRecord, type ArchiveFilters as FilterType, type PaginationState } from "@/types/archives";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// 動的インポートによるバンドルサイズ最適化 (Vercel Best Practices: bundle-dynamic-imports)
const ArchiveDetailModal = dynamic(
  () => import("./ArchiveDetailModal").then(m => m.ArchiveDetailModal),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
      </div>
    )
  }
);

interface ArchivePageClientProps {
  initialRecords: TradeRecord[];
}

export function ArchivePageClient({ initialRecords }: ArchivePageClientProps) {
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
        setRecords(initialRecords);
      } catch (error) {
        console.error("Failed to load records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [initialRecords]);

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
    <>
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
              className="text-xl text-brixa-100 max-w-3xl mx-auto mb-8"
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
    </>
  );
}
