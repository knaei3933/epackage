"use client";

import React from "react";
import Image from "next/image";
import { Building, Calendar, TrendingUp, Eye, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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

export function ArchiveGrid({ records, onRecordClick, loading }: ArchiveGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-bg-muted rounded-container h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-text-muted mb-4">
          <Building className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          検索条件に一致する実績がありません
        </h3>
        <p className="text-text-secondary mb-6">
          検索条件を調整するか、すべての実績を表示してください。
        </p>
        <Button variant="outline">
          フィルターをリセット
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {records.map((record) => (
        <Card
          key={record.id}
          className="group cursor-pointer overflow-hidden transition-colors hover:border-border-strong hover:shadow-low"
          onClick={() => onRecordClick(record)}
        >
          {/* Featured Badge */}
          {record.featured && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="default">
                特集
              </Badge>
            </div>
          )}

          {/* Main Image */}
          <div className="relative h-48 bg-bg-muted overflow-hidden">
            <Image
              src={record.images.find(img => img.isMain)?.url || "/images/archives/standing-pouch-1.jpg"}
              alt={record.images.find(img => img.isMain)?.alt || record.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              onError={(e) => {
                // Fallback to a default image if the specific image doesn't exist
                const target = e.target as HTMLImageElement;
                target.src = "/images/archives/standing-pouch-1.jpg";
              }}
            />

            {/* View Detail Button */}
            <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                className="max-sm:h-11"
                icon={<Eye className="h-4 w-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRecordClick(record);
                }}
              >
                詳細
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Client */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-brand transition-colors duration-200">
                {record.title}
              </h3>
              <p className="text-sm text-text-secondary flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {record.clientName}
              </p>
            </div>

            {/* Description */}
            <p className="text-text-secondary text-sm mb-4 line-clamp-3">
              {record.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Industry Tag */}
              <Badge variant="secondary">
                <Building className="h-3 w-3 mr-1" />
                {industryLabels[record.industry]}
              </Badge>

              {/* Project Type Tag */}
              <Badge variant="secondary">
                <Package className="h-3 w-3 mr-1" />
                {projectTypeLabels[record.projectType]}
              </Badge>
            </div>

            {/* Date Range */}
            <div className="flex items-center justify-between text-[13px] text-text-muted">
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