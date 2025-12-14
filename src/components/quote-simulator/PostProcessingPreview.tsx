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
  category: 'zipper' | 'finish' | 'notch' | 'punching' | 'corner' | 'opening' | 'valve'
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
  // Zipper options
  { id: 'zipper-no', name: 'No Zipper', nameJa: 'ジッパーなし', imageName: '1.지퍼 없음.png', category: 'zipper' },
  { id: 'zipper-yes', name: 'With Zipper', nameJa: 'ジッパーあり', imageName: '1.지퍼 있음.png', category: 'zipper' },

  // Finish options
  { id: 'matte', name: 'Matte Finish', nameJa: '無光沢', imageName: '2.무광.png', category: 'finish' },
  { id: 'glossy', name: 'Glossy Finish', nameJa: '有光沢', imageName: '2.유광.png', category: 'finish' },

  // Notch options
  { id: 'notch-no', name: 'No Notch', nameJa: 'ノッチなし', imageName: '3.노치 없음.png', category: 'notch' },
  { id: 'notch-yes', name: 'With Notch', nameJa: 'ノッチあり', imageName: '3.노치 있음.png', category: 'notch' },

  // Hole punching options
  { id: 'punching-no', name: 'No Hole Punching', nameJa: '穴あけなし', imageName: '4.걸이타공 없음.png', category: 'punching' },
  { id: 'punching-yes', name: 'With Hole Punching', nameJa: '穴あけあり', imageName: '4.걸이타공 있음.png', category: 'punching' },

  // Corner options
  { id: 'corner-round', name: 'Round Corner', nameJa: '丸い角', imageName: '5.모서리_둥근.png', category: 'corner' },
  { id: 'corner-square', name: 'Square Corner', nameJa: '四角い角', imageName: '5.모서리_직각.png', category: 'corner' },

  // Opening options
  { id: 'opening-top', name: 'Top Opening', nameJa: '上開口', imageName: '6.상단 오픈.png', category: 'opening' },
  { id: 'opening-bottom', name: 'Bottom Opening', nameJa: '下開口', imageName: '6.하단 오픈.png', category: 'opening' },

  // Valve options
  { id: 'valve-no', name: 'No Valve', nameJa: 'バルブなし', imageName: '밸브 없음.png', category: 'valve' },
  { id: 'valve-yes', name: 'With Valve', nameJa: 'バルブあり', imageName: '밸브 있음.png', category: 'valve' },
]

export function PostProcessingPreview({ selectedOptions, onPreviewToggle, className }: PostProcessingPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  const getActiveImages = () => {
    const activeImages: PostProcessingOption[] = []

    // Zipper
    if (selectedOptions.zipper !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'zipper' && opt.id === (selectedOptions.zipper ? 'zipper-yes' : 'zipper-no'))!
      )
    }

    // Finish
    if (selectedOptions.finish) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'finish' && opt.id === selectedOptions.finish)!
      )
    }

    // Notch
    if (selectedOptions.notch !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'notch' && opt.id === (selectedOptions.notch ? 'notch-yes' : 'notch-no'))!
      )
    }

    // Punching
    if (selectedOptions.punching !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'punching' && opt.id === (selectedOptions.punching ? 'punching-yes' : 'punching-no'))!
      )
    }

    // Corner
    if (selectedOptions.corner) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'corner' && opt.id === (selectedOptions.corner === 'round' ? 'corner-round' : 'corner-square'))!
      )
    }

    // Opening
    if (selectedOptions.opening) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'opening' && opt.id === (selectedOptions.opening === 'top' ? 'opening-top' : 'opening-bottom'))!
      )
    }

    // Valve
    if (selectedOptions.valve !== undefined) {
      activeImages.push(
        postProcessingOptions.find(opt => opt.category === 'valve' && opt.id === (selectedOptions.valve ? 'valve-yes' : 'valve-no'))!
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