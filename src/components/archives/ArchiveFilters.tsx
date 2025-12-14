"use client";

import React from "react";
import { Building, Package, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { type ArchiveFilters as FilterType, type Industry, type ProjectType } from "@/types/archives";

interface ArchiveFiltersProps {
  filters: FilterType;
  onChange: (filters: Partial<FilterType>) => void;
}

const industryOptions: { value: Industry | null; label: string; icon: React.ComponentType<any> }[] = [
  { value: null, label: "すべての業種", icon: Building },
  { value: "manufacturing", label: "製造業", icon: Building },
  { value: "cosmetics", label: "化粧品", icon: Package },
  { value: "food", label: "食品", icon: Package },
  { value: "pharmaceutical", label: "医薬品", icon: Package },
  { value: "other", label: "その他", icon: Building },
];

const projectTypeOptions: { value: ProjectType | null; label: string; icon: React.ComponentType<any> }[] = [
  { value: null, label: "すべてのタイプ", icon: Package },
  { value: "equipment_supply", label: "設備供給", icon: Package },
  { value: "consulting", label: "コンサルティング", icon: Building },
  { value: "custom_manufacturing", label: "カスタム製造", icon: Package },
  { value: "technology_transfer", label: "技術移転", icon: Building },
  { value: "other", label: "その他", icon: Package },
];

const sortOptions: { value: FilterType["sortBy"]; label: string }[] = [
  { value: "newest", label: "最新順" },
  { value: "oldest", label: "古い順" },
  { value: "featured", label: "特集" },
  { value: "alphabetical", label: "五十音順" },
];

export function ArchiveFilters({ filters, onChange }: ArchiveFiltersProps) {
  const handleIndustryChange = (industry: Industry | null) => {
    onChange({ industry });
  };

  const handleProjectTypeChange = (projectType: ProjectType | null) => {
    onChange({ projectType });
  };

  const handleSortChange = (sortBy: FilterType["sortBy"]) => {
    onChange({ sortBy });
  };

  const handleFeaturedToggle = () => {
    onChange({ featured: filters.featured === null ? true : null });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Industry Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">業種:</span>
        <div className="relative">
          <select
            value={filters.industry || ""}
            onChange={(e) => handleIndustryChange(e.target.value as Industry | null)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          >
            {industryOptions.map((option) => (
              <option key={option.value || "all"} value={option.value || ""}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <Building className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Project Type Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">タイプ:</span>
        <div className="relative">
          <select
            value={filters.projectType || ""}
            onChange={(e) => handleProjectTypeChange(e.target.value as ProjectType | null)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          >
            {projectTypeOptions.map((option) => (
              <option key={option.value || "all"} value={option.value || ""}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <Package className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">並び替え:</span>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as FilterType["sortBy"])}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Toggle */}
      <Button
        variant={filters.featured ? "primary" : "outline"}
        size="sm"
        onClick={handleFeaturedToggle}
        className="flex items-center space-x-2"
      >
        <Star className="h-4 w-4" />
        <span>特集のみ</span>
      </Button>

      {/* Date Range Filter (未実装) */}
      <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">日付範囲 (準備中)</span>
      </div>
    </div>
  );
}