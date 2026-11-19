"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Building,
  Package,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Clock,
  User,
  Tag,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { type TradeRecord } from "@/types/archives";

interface ArchiveDetailModalProps {
  record: TradeRecord;
  isOpen: boolean;
  onClose: () => void;
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

export function ArchiveDetailModal({ record, isOpen, onClose }: ArchiveDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? record.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === record.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && record.images.length > 1) {
      handlePreviousImage();
    } else if (e.key === 'ArrowRight' && record.images.length > 1) {
      handleNextImage();
    }
  };

  const currentImage = record.images[currentImageIndex];
  const mainImage = record.images.find(img => img.isMain) || record.images[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="bg-bg-primary rounded-container max-w-5xl w-full my-8 overflow-hidden shadow-high"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-medium bg-bg-secondary">
          <div className="flex items-center space-x-3">
            {record.featured && (
              <Badge variant="default" size="lg" className="gap-2">
                <Star className="h-4 w-4" />
                <span>特集</span>
              </Badge>
            )}

            <Badge variant="secondary" size="lg">
              <Building className="h-4 w-4 mr-1.5" />
              {industryLabels[record.industry]}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-text-primary"
              onClick={() => {/* Share functionality */}}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-text-primary"
              onClick={() => {/* Download functionality */}}
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-text-primary"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Blog Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Hero Section with Image */}
          <div className="relative">
            <div className="aspect-[21/9] bg-bg-muted relative overflow-hidden">
              <Image
                src={currentImage?.url || mainImage.url}
                alt={currentImage?.alt || mainImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />

              {/* Image Navigation Overlay */}
              {record.images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-bg-primary text-text-primary border border-border-medium hover:bg-bg-secondary rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-bg-primary text-text-primary border border-border-medium hover:bg-bg-secondary rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Article Header */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
              {record.publishedAt && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {record.publishedAt}
                </div>
              )}
              {record.author && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1.5" />
                  {record.author.name}
                  <span className="mx-2">•</span>
                  {record.author.role}
                </div>
              )}
              {record.readTime && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  読了時間 {record.readTime}分
                </div>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
              {record.title}
            </h2>

            <p className="text-xl text-text-secondary leading-relaxed">
              {record.description}
            </p>
          </div>

          {/* Main Content */}
          <div className="px-8 pb-8">
            {record.content ? (
              <div className="prose prose-lg max-w-none">
                <div
                  className="blog-content space-y-6"
                  dangerouslySetInnerHTML={{ __html: record.content }}
                />
              </div>
            ) : (
              <>
                {/* Fallback to original layout if no content */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-bg-secondary rounded-container p-5">
                      <div className="flex items-center text-sm text-text-secondary mb-2">
                        <Package className="h-4 w-4 mr-2" />
                        プロジェクトタイプ
                      </div>
                      <div className="font-bold text-text-primary">
                        {projectTypeLabels[record.projectType]}
                      </div>
                    </div>

                    <div className="bg-bg-secondary rounded-container p-5">
                      <div className="flex items-center text-sm text-text-secondary mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        実施期間
                      </div>
                      <div className="font-bold text-text-primary">
                        {new Date(record.startDate).toLocaleDateString("ja-JP")} -
                        {new Date(record.endDate).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-4">
                      技術仕様
                    </h3>
                    <div className="bg-bg-secondary border border-border-medium rounded-container p-5">
                      <p className="text-text-primary font-mono text-sm leading-relaxed">
                        {record.technicalSpec}
                      </p>
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center">
                      <TrendingUp className="h-6 w-6 mr-2 text-brand" />
                      成果
                    </h3>
                    <div className="space-y-3">
                      {record.results.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-brand-muted border border-brand-soft rounded-container p-4"
                        >
                          <div className="w-2 h-2 bg-brand rounded-full mr-4 flex-shrink-0"></div>
                          <span className="text-on-brand-muted font-medium">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            {record.tags && record.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border-medium">
                <div className="flex items-center mb-4">
                  <Tag className="h-5 w-5 text-text-secondary mr-2" />
                  <h3 className="text-lg font-bold text-text-primary">タグ</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {record.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-bg-muted hover:bg-bg-secondary text-text-secondary border border-border-medium rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Cases */}
            <div className="mt-8 pt-8 border-t border-border-medium">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                同業界の他の事例
              </h3>
              <div className="flex items-center text-brand hover:text-brand-pressed font-medium cursor-pointer">
                すべての{industryLabels[record.industry]}事例を見る
                <ArrowRight className="h-5 w-5 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-medium bg-bg-secondary">
          <div className="text-sm text-text-secondary">
            最終更新: {new Date(record.updatedAt).toLocaleDateString("ja-JP")}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>

            <Button
              onClick={() => {/* Contact form or inquiry */}}
            >
              このソリューションについて問い合わせ
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--color-text-primary);
        }

        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--color-text-primary);
        }

        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: var(--color-text-secondary);
        }

        .blog-content ul,
        .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
          color: var(--color-text-secondary);
        }

        .blog-content ul li {
          list-style-type: disc;
        }

        .blog-content ol li {
          list-style-type: decimal;
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .blog-content thead {
          background-color: var(--color-background-muted);
        }

        .blog-content th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--color-text-primary);
          border-bottom: 1px solid var(--color-border);
        }

        .blog-content td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .blog-content tbody tr:last-child td {
          border-bottom: none;
        }

        .blog-content tbody tr:hover {
          background-color: var(--color-background-subtle);
        }

        .blog-content strong {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .blog-content blockquote {
          border-left: 4px solid var(--color-brand);
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: var(--color-text-secondary);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
