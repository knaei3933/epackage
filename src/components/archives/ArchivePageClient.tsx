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
import { Button, buttonVariants } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout";
import { Container } from "@/components/ui/Container";

// 動的インポートによるバンドルサイズ最適化 (Vercel Best Practices: bundle-dynamic-imports)
const ArchiveDetailModal = dynamic(
  () => import("./ArchiveDetailModal").then(m => m.ArchiveDetailModal),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageHeader
          title="パウチ導入実績"
          lead="化粧品、食品、健康食品など様々な業界のパウチ包装導入事例をご紹介します"
          actions={
            <>
              <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                パウチ導入相談
              </Link>
              <Button variant="outline" size="lg" icon={<Package className="h-5 w-5" />}>
                すべての実績 ({records.length})
              </Button>
            </>
          }
        />
      </motion.div>

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
                <p className="text-text-secondary">
                  {isLoading ? "読み込み中..." : `${filteredRecords.length}件の実績`}
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand" />
                  <span className="text-sm text-text-secondary">導入事例</span>
                </div>
              </div>
              {(filters.industry !== null || filters.projectType !== null) && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="max-sm:h-11" icon={<X className="h-4 w-4" />}>
                  フィルターをクリア
                </Button>
              )}
            </div>

            {/* Records Grid - Expanded to 2 Columns */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="rounded-container border border-border-medium bg-bg-primary p-8 animate-pulse">
                    <div className="h-8 bg-bg-muted rounded mb-6"></div>
                    <div className="space-y-4">
                      <div className="h-6 bg-bg-muted rounded"></div>
                      <div className="h-4 bg-bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-bg-muted rounded w-1/2"></div>
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
                <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  該当する実績が見つかりませんでした
                </h3>
                <p className="text-text-secondary mb-4">
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
              className="bg-bg-primary rounded-container max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
