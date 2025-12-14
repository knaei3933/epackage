'use client'

import React, { useState } from 'react'
import {
  Trash2,
  Plus,
  Minus,
  Edit,
  Package,
  Calculator,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import type { CartItem } from '@/types/cart'
import { useCart } from '@/contexts/CartContext'

interface CartItemComponentProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateQuantity, updateSpecifications, removeItem } = useCart()
  const [isEditingSpecs, setIsEditingSpecs] = useState(false)
  const [tempSpecifications, setTempSpecifications] = useState(item.specifications)

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= item.product.min_order_quantity) {
      updateQuantity(item.id, newQuantity)
    }
  }

  const handleSpecificationUpdate = () => {
    updateSpecifications(item.id, tempSpecifications)
    setIsEditingSpecs(false)
  }

  const handleSpecificationCancel = () => {
    setTempSpecifications(item.specifications)
    setIsEditingSpecs(false)
  }

  const getMaterialName = (material: string) => {
    const materialNames: { [key: string]: string } = {
      'PE': 'ポリエチレン',
      'PP': 'ポリプロピレン',
      'PET': 'PETフィルム',
      'ALUMINUM': 'アルミニウム',
      'PAPER_LAMINATE': 'ラミネート紙',
      '特殊素材': '特殊素材'
    }
    return materialNames[material] || material
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Package className="w-6 h-6 text-brixa-600" />
                <h3 className="text-lg font-semibold text-gray-900">{item.product.name_ja}</h3>
                <Badge variant="secondary" className="text-xs">
                  {item.product.category.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.product.description_ja}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {item.product.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">仕様詳細</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                className="flex items-center space-x-1"
              >
                <Edit className="w-3 h-3" />
                <span>編集</span>
              </Button>
            </div>

            {isEditingSpecs ? (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">素材</label>
                    <select
                      value={tempSpecifications.material || ''}
                      onChange={(e) => setTempSpecifications({
                        ...tempSpecifications,
                        material: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-brixa-600"
                    >
                      <option value="">選択してください</option>
                      {item.product.materials.map((material) => (
                        <option key={material} value={material}>
                          {getMaterialName(material)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">厚さ (μm)</label>
                    <Input
                      type="number"
                      value={tempSpecifications.thickness || ''}
                      onChange={(e) => setTempSpecifications({
                        ...tempSpecifications,
                        thickness: parseInt(e.target.value) || undefined
                      })}
                      placeholder="例: 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">幅 (mm)</label>
                    <Input
                      type="number"
                      value={tempSpecifications.width || ''}
                      onChange={(e) => setTempSpecifications({
                        ...tempSpecifications,
                        width: parseInt(e.target.value) || undefined
                      })}
                      placeholder="例: 200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">高さ (mm)</label>
                    <Input
                      type="number"
                      value={tempSpecifications.height || ''}
                      onChange={(e) => setTempSpecifications({
                        ...tempSpecifications,
                        height: parseInt(e.target.value) || undefined
                      })}
                      placeholder="例: 300"
                    />
                  </div>
                </div>

                {tempSpecifications.printing && (
                  <div className="space-y-4 pt-4 border-t">
                    <h5 className="font-medium text-gray-900">印刷仕様</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">色数</label>
                        <Input
                          type="number"
                          min="1"
                          max="8"
                          value={tempSpecifications.printing.colors}
                          onChange={(e) => setTempSpecifications({
                            ...tempSpecifications,
                            printing: {
                              colors: parseInt(e.target.value) || 1,
                              sides: tempSpecifications.printing?.sides || "front",
                              method: tempSpecifications.printing?.method || "offset"
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">面</label>
                        <select
                          value={tempSpecifications.printing.sides}
                          onChange={(e) => setTempSpecifications({
                            ...tempSpecifications,
                            printing: {
                              colors: tempSpecifications.printing?.colors || 1,
                              sides: e.target.value as 'front' | 'back' | 'both',
                              method: tempSpecifications.printing?.method || "offset"
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-brixa-600"
                        >
                          <option value="front">片面</option>
                          <option value="back">裏面</option>
                          <option value="both">両面</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">方式</label>
                        <select
                          value={tempSpecifications.printing.method}
                          onChange={(e) => setTempSpecifications({
                            ...tempSpecifications,
                            printing: {
                              colors: tempSpecifications.printing?.colors || 1,
                              sides: tempSpecifications.printing?.sides || "front",
                              method: e.target.value as 'digital' | 'offset' | 'flexographic'
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-brixa-600"
                        >
                          <option value="digital">デジタル</option>
                          <option value="offset">オフセット</option>
                          <option value="flexographic">フレキソ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSpecificationUpdate}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSpecificationCancel}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {tempSpecifications.material && (
                  <div>
                    <span className="text-gray-600">素材:</span>
                    <span className="ml-2 font-medium">{getMaterialName(tempSpecifications.material)}</span>
                  </div>
                )}
                {tempSpecifications.thickness && (
                  <div>
                    <span className="text-gray-600">厚さ:</span>
                    <span className="ml-2 font-medium">{tempSpecifications.thickness}μm</span>
                  </div>
                )}
                {tempSpecifications.width && (
                  <div>
                    <span className="text-gray-600">幅:</span>
                    <span className="ml-2 font-medium">{tempSpecifications.width}mm</span>
                  </div>
                )}
                {tempSpecifications.height && (
                  <div>
                    <span className="text-gray-600">高さ:</span>
                    <span className="ml-2 font-medium">{tempSpecifications.height}mm</span>
                  </div>
                )}
                {tempSpecifications.printing && (
                  <div className="col-span-2">
                    <span className="text-gray-600">印刷:</span>
                    <span className="ml-2 font-medium">
                      {tempSpecifications.printing.colors}色 /
                      {tempSpecifications.printing.sides === 'front' ? '片面' :
                       tempSpecifications.printing.sides === 'back' ? '裏面' : '両面'} /
                      {tempSpecifications.printing.method === 'digital' ? 'デジタル' :
                       tempSpecifications.printing.method === 'offset' ? 'オフセット' : 'フレキソ'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quantity and Price */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quantity Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(Math.max(1, item.quantity - 1000))}
                disabled={item.quantity <= 1000}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                min={item.product.min_order_quantity}
                step={1000}
                className="w-24 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1000)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              最低注文数量: {item.product.min_order_quantity.toLocaleString()}個
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">単価:</span>
              <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">数量:</span>
              <span className="font-medium">{item.quantity.toLocaleString()}個</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>小計:</span>
                <span className="text-brixa-700">{formatCurrency(item.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Lead Time */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>納期: 約 {item.product.lead_time_days} 日</span>
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-2 flex flex-col items-end space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeItem(item.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            削除
          </Button>

          <div className="text-right">
            <p className="text-lg font-bold text-brixa-700">
              {formatCurrency(item.totalPrice)}
            </p>
            <p className="text-xs text-gray-500">税別</p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`/quote-simulator/?productId=${item.productId}`, '_blank')}
            className="w-full"
          >
            <Calculator className="w-4 h-4 mr-1" />
            詳細計算
          </Button>
        </div>
      </div>
    </Card>
  )
}