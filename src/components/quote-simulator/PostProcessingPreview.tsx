'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Eye, EyeOff } from 'lucide-react'

interface PostProcessingOption {
  id: string
  name: string
  nameJa: string
  imageName: string
  category: 'opening-sealing' | 'surface-treatment' | 'shape-structure' | 'functionality'
}

interface PostProcessingPreviewProps {
  selectedOptions: {
    zipper?: boolean
    finish?: 'matte' | 'glossy'
    notch?: boolean
    punching?: boolean
    corner?: 'round' | 'square'
    opening?: 'top' | 'bottom'
    valve?: boolean
  }
  onPreviewToggle?: (show: boolean) => void
  className?: string
}

const postProcessingOptions: PostProcessingOption[] = [
  // Zipper options -> opening-sealing
  { id: 'zipper-no', name: 'No Zipper', nameJa: 'ジッパーなし', imageName: '1.지퍼 없음.png', category: 'opening-sealing' },
  { id: 'zipper-yes', name: 'With Zipper', nameJa: 'ジッパーあり', imageName: '1.지퍼 있음.png', category: 'opening-sealing' },

  // Finish options -> surface-treatment
  { id: 'matte', name: 'Matte Finish', nameJa: '無光沢', imageName: '2.무광.png', category: 'surface-treatment' },
  { id: 'glossy', name: 'Glossy Finish', nameJa: '有光沢', imageName: '2.유광.png', category: 'surface-treatment' },

  // Notch options -> opening-sealing
  { id: 'notch-no', name: 'No Notch', nameJa: 'ノッチなし', imageName: '3.노치 없음.png', category: 'opening-sealing' },
  { id: 'notch-yes', name: 'With Notch', nameJa: 'ノッチあり', imageName: '3.노치 있음.png', category: 'opening-sealing' },

  // Hole punching options -> shape-structure
  { id: 'punching-no', name: 'No Hole Punching', nameJa: '穴あけなし', imageName: '4.걸이타공 없음.png', category: 'shape-structure' },
  { id: 'punching-yes', name: 'With Hole Punching', nameJa: '穴あけあり', imageName: '4.걸이타공 있음.png', category: 'shape-structure' },

  // Corner options -> shape-structure
  { id: 'corner-round', name: 'Round Corner', nameJa: '丸い角', imageName: '5.모서리_둥근.png', category: 'shape-structure' },
  { id: 'corner-square', name: 'Square Corner', nameJa: '四角い角', imageName: '5.모서리_직각.png', category: 'shape-structure' },

  // Opening options -> opening-sealing
  { id: 'opening-top', name: 'Top Opening', nameJa: '上開口', imageName: '6.상단 오픈.png', category: 'opening-sealing' },
  { id: 'opening-bottom', name: 'Bottom Opening', nameJa: '下開口', imageName: '6.하단 오픈.png', category: 'opening-sealing' },

  // Valve options -> opening-sealing
  { id: 'valve-no', name: 'No Valve', nameJa: 'バルブなし', imageName: '밸브 없음.png', category: 'opening-sealing' },
  { id: 'valve-yes', name: 'With Valve', nameJa: 'バルブあり', imageName: '밸브 있음.png', category: 'opening-sealing' },
]

export function PostProcessingPreview({ selectedOptions, onPreviewToggle, className }: PostProcessingPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  const getActiveImages = () => {
    const activeImages: PostProcessingOption[] = []

    // Zipper -> opening-sealing
    if (selectedOptions.zipper !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'opening-sealing' && opt.id === (selectedOptions.zipper ? 'zipper-yes' : 'zipper-no'))!
      )
    }

    // Finish -> surface-treatment
    if (selectedOptions.finish) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'surface-treatment' && opt.id === selectedOptions.finish)!
      )
    }

    // Notch -> opening-sealing
    if (selectedOptions.notch !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'opening-sealing' && opt.id === (selectedOptions.notch ? 'notch-yes' : 'notch-no'))!
      )
    }

    // Punching -> shape-structure
    if (selectedOptions.punching !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'shape-structure' && opt.id === (selectedOptions.punching ? 'punching-yes' : 'punching-no'))!
      )
    }

    // Corner -> shape-structure
    if (selectedOptions.corner) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'shape-structure' && opt.id === (selectedOptions.corner === 'round' ? 'corner-round' : 'corner-square'))!
      )
    }

    // Opening -> opening-sealing
    if (selectedOptions.opening) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'opening-sealing' && opt.id === (selectedOptions.opening === 'top' ? 'opening-top' : 'opening-bottom'))!
      )
    }

    // Valve -> opening-sealing
    if (selectedOptions.valve !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'opening-sealing' && opt.id === (selectedOptions.valve ? 'valve-yes' : 'valve-no'))!
      )
    }

    return activeImages
  }

  const togglePreview = () => {
    const newState = !showPreview
    setShowPreview(newState)
    onPreviewToggle?.(newState)
  }

  const activeImages = getActiveImages()

  if (activeImages.length === 0) {
    return null
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b border-border-medium">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            後加工プレビュー (Post-Processing Preview)
          </h3>
          <button
            onClick={togglePreview}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreview ? '非表示' : '表示'}</span>
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeImages.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="aspect-square relative overflow-hidden rounded-lg border border-border-medium bg-bg-primary">
                  <Image
                    src={`/images/post-processing/${option.imageName}`}
                    alt={option.nameJa}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 150px"
                  />
                </div>
                <div className="text-center">
                  <Badge variant="secondary" size="sm" className="text-xs">
                    {option.nameJa}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-text-secondary border-t border-border-medium pt-3">
            <p>※ 画像は参考です。実際の製品仕様とは異なる場合があります。</p>
            <p>※ Images are for reference only. Actual product specifications may vary.</p>
          </div>
        </div>
      )}
    </Card>
  )
}

export default PostProcessingPreview