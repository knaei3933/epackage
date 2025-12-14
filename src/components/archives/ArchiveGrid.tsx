"use client";

import React from "react";
import Image from "next/image";
import { Building, Calendar, TrendingUp, Eye, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { type TradeRecord } from "@/types/archives";

interface ArchiveGridProps {
  records: TradeRecord[];
  onRecordClick: (record: TradeRecord) => void;
  loading: boolean;
}

const industryLabels = {
  manufacturing: "製造業",
  cosmetics: "化粧品",
  food: "食品",
  pharmaceutical: "医薬品",
  other: "その他",
};

const projectTypeLabels = {
  equipment_supply: "設備供給",
  consulting: "コンサルティング",
  custom_manufacturing: "カスタム製造",
  technology_transfer: "技術移転",
  other: "その他",
};

const industryColors = {
  manufacturing: "bg-navy-600 text-navy-600 border-navy-600",
  cosmetics: "bg-pink-100 text-pink-700 border-pink-200",
  food: "bg-green-100 text-green-700 border-green-200",
  pharmaceutical: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

export function ArchiveGrid({ records, onRecordClick, loading }: ArchiveGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <Building className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          検索条件に一致する実績がありません
        </h3>
        <p className="text-gray-600 mb-6">
          検索条件を調整するか、すべての実績を表示してください。
        </p>
        <Button variant="outline">
          フィルターをリセット
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <Card
          key={record.id}
          className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-navy-400"
          onClick={() => onRecordClick(record)}
        >
          {/* Featured Badge */}
          {record.featured && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-gradient-to-r from-yellow-400 to-brixa-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                特集
              </span>
            </div>
          )}

          {/* Main Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <Image
              src={record.images.find(img => img.isMain)?.url || "/images/archives/placeholder.jpg"}
              alt={record.images.find(img => img.isMain)?.alt || record.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* View Detail Button */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecordClick(record);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                詳細
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Client */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-navy-700 transition-colors duration-200">
                {record.title}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {record.clientName}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {record.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Industry Tag */}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${industryColors[record.industry]}`}>
                <Building className="h-3 w-3 mr-1" />
                {industryLabels[record.industry]}
              </span>

              {/* Project Type Tag */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <Package className="h-3 w-3 mr-1" />
                {projectTypeLabels[record.projectType]}
              </span>
            </div>

            {/* Date Range */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(record.startDate).toLocaleDateString("ja-JP")} - {new Date(record.endDate).toLocaleDateString("ja-JP")}
              </div>

              {/* Results Count */}
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {record.results.length}つの成果
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}