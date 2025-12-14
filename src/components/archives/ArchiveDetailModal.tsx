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
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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

const industryColors = {
  manufacturing: "bg-navy-600 text-navy-600 border-navy-600",
  cosmetics: "bg-pink-100 text-pink-700 border-pink-200",
  food: "bg-green-100 text-green-700 border-green-200",
  pharmaceutical: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Featured Badge */}
            {record.featured && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-brixa-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                <Star className="h-4 w-4" />
                <span>特集</span>
              </div>
            )}

            {/* Industry Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${industryColors[record.industry]}`}>
              <Building className="h-4 w-4 mr-1" />
              {industryLabels[record.industry]}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => {/* Share functionality */}}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => {/* Download functionality */}}
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={currentImage?.url || mainImage.url}
                alt={currentImage?.alt || mainImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Image Navigation */}
              {record.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 shadow-lg"
                    onClick={handlePreviousImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 shadow-lg"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Image Thumbnails */}
            {record.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {record.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex
                        ? 'border-navy-600 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Client */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {record.title}
              </h1>
              <div className="flex items-center text-lg text-gray-600">
                <Building className="h-5 w-5 mr-2" />
                {record.clientName}
              </div>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Package className="h-4 w-4 mr-1" />
                  プロジェクトタイプ
                </div>
                <div className="font-semibold text-gray-900">
                  {projectTypeLabels[record.projectType]}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  実施期間
                </div>
                <div className="font-semibold text-gray-900">
                  {new Date(record.startDate).toLocaleDateString("ja-JP")} -
                  {new Date(record.endDate).toLocaleDateString("ja-JP")}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                プロジェクト概要
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {record.description}
              </p>
            </div>

            {/* Technical Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                技術仕様
              </h3>
              <div className="bg-navy-50 border border-navy-600 rounded-lg p-4">
                <p className="text-navy-600 font-mono text-sm">
                  {record.technicalSpec}
                </p>
              </div>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                成果
              </h3>
              <div className="space-y-2">
                {record.results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3"
                  >
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-green-900 font-medium">{result}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {record.tags && record.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  タグ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {record.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            最終更新: {new Date(record.updatedAt).toLocaleDateString("ja-JP")}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>

            <Button
              className="bg-navy-700 hover:bg-navy-600 text-white"
              onClick={() => {/* Contact form or inquiry */}}
            >
              このソリューションについて問い合わせ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}