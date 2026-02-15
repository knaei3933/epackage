/**
 * Sample Items Section
 *
 * サンプル1セット提供（選択機能なし）
 */

'use client'

import { Package } from 'lucide-react'
import { Control } from 'react-hook-form'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

interface SampleItemsSectionProps {
  control: Control<PouchSampleRequestFormData>
  errors: any
}

export function SampleItemsSection({ control, errors }: SampleItemsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          サンプルご依頼
        </h2>
        <p className="text-gray-600 mb-4">
          製品サンプル1セットを無料でご提供いたします
        </p>

        {/* サンプル製品一覧 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            含まれるサンプル製品
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'three-seal', name: '平袋', nameEn: 'Three-Side Seal' },
              { id: 'stand-pouch', name: 'スタンドパウチ', nameEn: 'Stand Pouch' },
              { id: 'box-pouch', name: 'BOX型パウチ', nameEn: 'Box Pouch' },
              { id: 'spout-pouch', name: 'スパウトパウチ', nameEn: 'Spout Pouch' },
              { id: 'roll-film', name: 'ロールフィルム', nameEn: 'Roll Film' },
              { id: 'gassho', name: '合掌袋', nameEn: 'Gassho Bag' }
            ].map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center"
              >
                <Package className="w-8 h-8 text-brixa-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900 text-sm mb-1">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  {product.nameEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            ※ サンプルは1種類につき1点、最大6点までご提供可能です。<br />
            ※ 営業目的のお見積もりには、別途詳細な仕様をお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  )
}
