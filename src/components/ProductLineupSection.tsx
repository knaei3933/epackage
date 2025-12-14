'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { industrialEquipment, getEquipmentByCategory, getAllCategories } from '@/data/industrialEquipmentData'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { ChevronRight, Star, Clock, Package, Filter, Grid, List } from 'lucide-react'

interface ProductLineupSectionProps {
  className?: string
}

export function ProductLineupSection({ className = '' }: ProductLineupSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = ['all', ...getAllCategories()]
  const filteredEquipment = selectedCategory === 'all'
    ? industrialEquipment
    : getEquipmentByCategory(selectedCategory)

  const featuredEquipment = industrialEquipment.filter(eq => eq.isFeatured)
  const newEquipment = industrialEquipment.filter(eq => eq.isNew)

  return (
    <section className={`py-16 lg:py-24 bg-gray-50 ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              製品ラインナップ
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              韓国の先進技術と品質管理で製造された産業機器。お客様の生産性向上に貢献する最適なソリューションをご提供します。
            </p>
          </div>
        </MotionWrapper>

        {/* Featured & New Products */}
        <MotionWrapper delay={0.2}>
          <div className="mb-12 grid md:grid-cols-2 gap-8">
            {/* Featured Equipment */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">注目製品</h3>
              </div>
              <div className="space-y-3">
                {featuredEquipment.slice(0, 3).map((equipment, index) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{equipment.name}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* New Equipment */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <Badge variant="success" className="mr-2">NEW</Badge>
                <h3 className="text-lg font-semibold text-gray-900">新製品</h3>
              </div>
              <div className="space-y-3">
                {newEquipment.slice(0, 3).map((equipment, index) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{equipment.name}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Category Filter */}
        <MotionWrapper delay={0.3}>
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="px-6 py-2"
              >
                {category === 'all' ? '全て' : category}
              </Button>
            ))}
          </div>
        </MotionWrapper>

        {/* View Mode Toggle */}
        <MotionWrapper delay={0.4}>
          <div className="mb-8 flex justify-end">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3 py-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3 py-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </MotionWrapper>

        {/* Equipment Grid/List */}
        <MotionWrapper delay={0.5}>
          <div className={
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6 max-w-4xl mx-auto'
          }>
            {filteredEquipment.map((equipment, index) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
                viewMode={viewMode}
                index={index}
              />
            ))}
          </div>
        </MotionWrapper>

        {/* Call to Action */}
        <MotionWrapper delay={0.6}>
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                お客様のニーズに最適な機器を見つけましょう
              </h3>
              <p className="text-navy-600 mb-6 max-w-2xl mx-auto">
                詳細な仕様、価格、納期についてのお問い合わせは、専門スタッフが丁寧に対応いたします。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-navy-700 hover:bg-gray-50 px-8"
                >
                  カタログ請求
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-navy-700 px-8"
                >
                  お問い合わせ
                </Button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}

interface EquipmentCardProps {
  equipment: any
  viewMode: 'grid' | 'list'
  index: number
}

function EquipmentCard({ equipment, viewMode, index }: EquipmentCardProps) {
  return (
    <Card
      className={`group overflow-hidden hover:shadow-xl transition-all duration-300 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      {/* Equipment Image */}
      <div className={`relative overflow-hidden bg-gray-100 ${
        viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-[4/3]'
      }`}>
        <Image
          src={equipment.image}
          alt={equipment.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {equipment.isNew && (
            <Badge variant="success" size="sm">
              NEW
            </Badge>
          )}
          {equipment.isFeatured && (
            <Badge variant="warning" size="sm">
              注目
            </Badge>
          )}
        </div>
      </div>

      {/* Equipment Information */}
      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="space-y-4">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-navy-700 uppercase tracking-wide">
              {equipment.category}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{equipment.deliveryTime}</span>
            </div>
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {equipment.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {equipment.description}
          </p>

          {/* Key Features */}
          <div className="flex flex-wrap gap-2">
            {equipment.features.slice(0, viewMode === 'list' ? 4 : 3).map((feature: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                {feature}
              </span>
            ))}
            {equipment.features.length > (viewMode === 'list' ? 4 : 3) && (
              <span className="text-xs text-gray-500">
                +{equipment.features.length - (viewMode === 'list' ? 4 : 3)}
              </span>
            )}
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">容量:</span>
              <span className="ml-1 font-medium text-gray-900">{equipment.specifications.capacity}</span>
            </div>
            <div>
              <span className="text-gray-500">電力:</span>
              <span className="ml-1 font-medium text-gray-900">{equipment.specifications.power}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="primary"
              size="sm"
              className="group-hover:scale-105 transition-transform"
            >
              詳細を見る
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              お問い合わせ
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}