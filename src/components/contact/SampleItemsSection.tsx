/**
 * Sample Items Selection Section
 *
 * サンプルアイテム選択セクション
 * 最大5つのサンプルを選択可能
 */

'use client'

import { Control, UseFormWatch, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Package } from 'lucide-react'
import type { PouchSampleRequestFormData } from './SampleRequestForm.schema'

interface SampleItemsSectionProps {
  control: Control<PouchSampleRequestFormData>
  watch: UseFormWatch<PouchSampleRequestFormData>
  errors: any
}

// 利用可能なプリセット商品
const PRESET_PRODUCTS = [
  { id: 'soft-pouch', name: 'ソフトパウチ', category: 'pouch' },
  { id: 'stand-pouch', name: 'スタンドパウチ', category: 'pouch' },
  { id: 'zipper-pouch', name: 'ジッパーパウチ', category: 'pouch' },
  { id: 'retort-pouch', name: 'レトルトパウチ', category: 'retort' },
  { id: 'spout-pouch', name: 'スパウトパウチ', category: 'liquid' },
  { id: 'transparent-pouch', name: '透明パウチ', category: 'transparent' }
]

export function SampleItemsSection({ control, watch, errors }: SampleItemsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sampleItems'
  })

  const watchedItems = watch('sampleItems')

  const handleAddItem = () => {
    if (fields.length < 5) {
      append({
        productId: '',
        productName: '',
        productCategory: 'other',
        quantity: 1
      })
    }
  }

  const handlePresetSelect = (product: typeof PRESET_PRODUCTS[0]) => {
    if (fields.length < 5) {
      append({
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        quantity: 1
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          サンプル商品の選択
        </h2>
        <p className="text-gray-600">
          最大5点までサンプルをご請求いただけます
        </p>
      </div>

      {/* プリセット商品選択 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          人気商品から選択
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRESET_PRODUCTS.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handlePresetSelect(product)}
              disabled={fields.length >= 5}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-brixa-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-brixa-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.category}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 選択されたサンプルアイテム */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            選択されたサンプル
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({fields.length}/5)
            </span>
          </h3>
          {fields.length < 5 && (
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brixa-600 text-white rounded-lg hover:bg-brixa-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              カスタム追加
            </button>
          )}
        </div>

        {errors.sampleItems && (
          <p className="text-sm text-red-600">
            {errors.sampleItems.message?.toString()}
          </p>
        )}

        {fields.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              サンプルが選択されていません
            </p>
            <p className="text-sm text-gray-500">
              上記の商品から選択するか、カスタム追加してください
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* 商品名 */}
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      商品名 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      {...control.register(`sampleItems.${index}.productName`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-brixa-500"
                      placeholder="例: ソフトパウチ"
                    />
                    {errors.sampleItems?.[index]?.productName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.sampleItems[index]?.productName.message?.toString()}
                      </p>
                    )}
                  </div>

                  {/* カテゴリ */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      カテゴリ
                    </label>
                    <select
                      {...control.register(`sampleItems.${index}.productCategory`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-brixa-500"
                    >
                      <option value="pouch">パウチ</option>
                      <option value="retort">レトルト</option>
                      <option value="liquid">液体</option>
                      <option value="transparent">透明</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  {/* 数量 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      数量 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      {...control.register(`sampleItems.${index}.quantity`, {
                        valueAsNumber: true
                      })}
                      min={1}
                      max={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-brixa-500"
                    />
                    {errors.sampleItems?.[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.sampleItems[index]?.quantity.message?.toString()}
                      </p>
                    )}
                  </div>

                  {/* 削除ボタン */}
                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 合計数量表示 */}
      {fields.length > 0 && (
        <div className="bg-brixa-50 border border-brixa-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-brixa-900">
              合計サンプル点数:
            </span>
            <span className="text-2xl font-bold text-brixa-700">
              {watchedItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}点
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
