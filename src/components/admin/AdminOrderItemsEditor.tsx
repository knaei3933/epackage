/**
 * Admin Order Items Editor Component
 *
 * 管理者用商品明細編集コンポーネント
 * - 商品明細の編集機能（サイズ、素材、数量、単価など）
 * - 特定ステータス範囲でのみ編集可能
 * - 保存時にorder_itemsとordersを更新
 *
 * @client
 */

'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronDown, ChevronUp, Package, Edit2, Save, X, Check, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/dashboard';
import { getMaterialSpecification, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import { processingOptionsConfig, PROCESSING_CATEGORIES } from '@/components/quote/shared/processingConfig';
import { adminFetch } from '@/lib/auth-client';

// =====================================================
// Types
// =====================================================

interface AdminOrderItemsEditorProps {
  order: Order;
  editable?: boolean;
  onUpdate?: () => void;
}

// 編集可能なステータス
const EDITABLE_STATUSES = [
  'DATA_UPLOAD_PENDING',         // データ入稿待ち
  'DATA_UPLOADED',               // データ受領済み
  'MODIFICATION_REJECTED',       // 修正拒否（再修正可能）
  'PROOF_CREATION_PENDING',      // 校正作成中
  'PROOF_SENT',                  // 校正データ送信済み
  'PROOF_APPROVAL_PENDING',      // 校正データ顧客承認待ち
];

// =====================================================
// Helper Functions
// =====================================================

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
}

/**
 * 厚さ情報を詳細表示用にフォーマット
 * 保存された完全なスペック文字列（例: PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ）を返す
 */
function formatThicknessDisplay(specs: any): string {
  // 保存された完全なスペック文字列があれば使用
  if (specs.specification) {
    return specs.specification;
  }
  // materialIdとthicknessSelectionからスペックを生成
  if (specs.materialId && specs.thicknessSelection) {
    const spec = getMaterialSpecification(specs.materialId, specs.thicknessSelection);
    if (spec !== '-') {
      return spec;
    }
  }
  // フォールバック
  return specs.thicknessSelection || '-';
}

function getItemValue(item: any, camelCaseKey: string, snakeCaseKey: string): any {
  return item[camelCaseKey] ?? item[snakeCaseKey];
}

// =====================================================
// Helper Functions for Labels
// =====================================================

function getBagTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    'flat_pouch': '平袋',
    'flat_3_side': '合掌袋',
    'stand_up': 'スタンドパウチ',
    'gazette': 'ガゼットパウチ',
    'roll_film': 'ロールフィルム',
    'spout_pouch': 'スパウトパウチ',
    'zipper_pouch': 'チャック付袋',
  };
  return labels[value] || value || '-';
}

function getMaterialLabel(value: string): string {
  const labels: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_pe': 'PET/PE',
    'cpp': 'CPP (未延伸ポリプロピレン)',
    'lldpe': 'LLDPE (直鎖状低密度ポリエチレン)',
  };
  return labels[value] || value || '-';
}

function getThicknessLabel(value: string, materialId?: string): string {
  // materialIdに応じた厚さオプションからラベルを取得
  if (materialId) {
    const options = MATERIAL_THICKNESS_OPTIONS[materialId];
    if (options) {
      const opt = options.find(o => o.id === value);
      if (opt) return opt.nameJa;
    }
  }
  // フォールバック
  const labels: Record<string, string> = {
    'thin': '薄い',
    'medium': '標準',
    'thick': '厚い',
    'light': '軽量タイプ (~100g)',
    'heavy': '高耐久タイプ (~800g)',
    'ultra': '超耐久タイプ (800g~)',
  };
  return labels[value] || value || '-';
}

function getPrintingLabel(type: string): string {
  const labels: Record<string, string> = {
    'digital': 'デジタル印刷',
    'gravure': 'グラビア印刷',
    'none': 'なし',
  };
  return labels[type] || type || '-';
}

function getUrgencyLabel(value: string): string {
  const labels: Record<string, string> = {
    'standard': '標準',
    'urgent': '至急',
  };
  return labels[value] || value || '-';
}

function getDeliveryLocationLabel(value: string): string {
  const labels: Record<string, string> = {
    'domestic': '国内',
    'international': '海外',
  };
  return labels[value] || value || '-';
}

function getSpoutPositionLabel(value: string): string {
  const labels: Record<string, string> = {
    'top-left': '左上',
    'top-center': '上中央',
    'top-right': '右上',
  };
  return labels[value] || value || '-';
}

function getSealWidthLabel(value: string): string {
  const labels: Record<string, string> = {
    '5mm': '5mm',
    '7.5mm': '7.5mm',
    '10mm': '10mm',
  };
  return labels[value] || value || '-';
}

// =====================================================
// Editable Spec Item Component
// =====================================================

interface EditableSpecItemProps {
  label: string;
  value: string | number;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  isEditing: boolean;
  onChange: (value: string) => void;
  displayLabel?: string; // 表示用ラベル（編集モード以外で使用）
}

function EditableSpecItem({ label, value, type = 'text', options, isEditing, onChange, displayLabel }: EditableSpecItemProps) {
  if (!isEditing) {
    return (
      <div className="flex items-baseline gap-2 text-sm">
        <span className="text-text-muted flex-shrink-0">{label}:</span>
        <span className="text-text-primary">{displayLabel !== undefined ? displayLabel : value}</span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-text-muted flex-shrink-0">{label}:</span>
      {type === 'select' && options ? (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-border-secondary rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-border-secondary rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}

// =====================================================
// Order Item Edit Row Component
// =====================================================

interface OrderItemEditRowProps {
  item: any;
  isEditing: boolean;
  onEditChange: (specifications: any, quantity: number, unitPrice: number) => void;
}

function OrderItemEditRow({ item, isEditing, onEditChange }: OrderItemEditRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSpecs, setLocalSpecs] = useState(item.specifications || {});

  // 後加工オプションをカテゴリ別にグループ化
  const postProcessingOptionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof processingOptionsConfig> = {};
    processingOptionsConfig.forEach(opt => {
      if (!grouped[opt.category]) {
        grouped[opt.category] = [];
      }
      grouped[opt.category].push(opt);
    });
    return grouped;
  }, []);
  const [localQuantity, setLocalQuantity] = useState(
    getItemValue(item, 'quantity', 'quantity') || 0
  );
  const [localUnitPrice, setLocalUnitPrice] = useState(
    getItemValue(item, 'unitPrice', 'unit_price') || 0
  );

  const productName = getItemValue(item, 'productName', 'product_name') || '-';
  const totalPrice = localQuantity * localUnitPrice;

  // オプション定義
  const bagTypeOptions = [
    { value: 'flat_pouch', label: '平袋' },
    { value: 'flat_3_side', label: '合掌袋' },
    { value: 'stand_up', label: 'スタンドパウチ' },
    { value: 'gazette', label: 'ガゼットパウチ' },
    { value: 'roll_film', label: 'ロールフィルム' },
    { value: 'spout_pouch', label: 'スパウトパウチ' },
    { value: 'zipper_pouch', label: 'チャック付袋' },
  ];

  const materialOptions = [
    { value: 'pet_al', label: 'PET/AL (アルミ箔ラミネート)' },
    { value: 'pet_pe', label: 'PET/PE' },
    { value: 'cpp', label: 'CPP (未延伸ポリプロピレン)' },
    { value: 'lldpe', label: 'LLDPE (直鎖状低密度ポリエチレン)' },
  ];

  const thicknessOptions = [
    { value: 'light', label: '軽量タイプ (~100g)' },
    { value: 'medium', label: '標準タイプ (~500g)' },
    { value: 'heavy', label: '高耐久タイプ (~800g)' },
    { value: 'ultra', label: '超耐久タイプ (800g~)' },
  ];

  // materialIdに応じた厚さオプションを動的生成
  const getThicknessOptionsForMaterial = (materialId: string) => {
    const options = MATERIAL_THICKNESS_OPTIONS[materialId];
    if (!options) {
      return thicknessOptions;
    }
    return options.map(opt => ({
      value: opt.id,
      label: `${opt.nameJa} (${opt.specification})`
    }));
  };

  const printingTypeOptions = [
    { value: 'digital', label: 'デジタル印刷' },
    { value: 'gravure', label: 'グラビア印刷' },
    { value: 'none', label: 'なし' },
  ];

  const urgencyOptions = [
    { value: 'standard', label: '標準' },
    { value: 'urgent', label: '至急' },
  ];

  const deliveryLocationOptions = [
    { value: 'domestic', label: '国内' },
    { value: 'international', label: '海外' },
  ];

  const updateSpec = (key: string, value: any) => {
    const updated = { ...localSpecs, [key]: value };
    setLocalSpecs(updated);
    onEditChange(updated, localQuantity, localUnitPrice);
  };

  const updateQuantity = (value: string) => {
    const num = parseInt(value) || 0;
    setLocalQuantity(num);
    onEditChange(localSpecs, num, localUnitPrice);
  };

  const updateUnitPrice = (value: string) => {
    const num = parseInt(value) || 0;
    setLocalUnitPrice(num);
    onEditChange(localSpecs, localQuantity, num);
  };

  const togglePostProcessing = (option: string) => {
    const current = localSpecs.postProcessingOptions || [];
    const updated = current.includes(option)
      ? current.filter((o: string) => o !== option)
      : [...current, option];
    updateSpec('postProcessingOptions', updated);
  };

  return (
    <div className="border-b border-border-secondary last:border-b-0">
      {/* Main row */}
      <div
        className={cn(
          "py-3 px-4 transition-colors",
          isExpanded && "bg-muted/10"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate">{productName}</p>
            {isEditing ? (
              <div className="flex items-center gap-3 mt-1 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-text-muted">数量:</span>
                  <input
                    type="number"
                    value={localQuantity}
                    onChange={(e) => updateQuantity(e.target.value)}
                    className="w-20 px-2 py-1 border border-border-secondary rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-text-muted">単価:</span>
                  <input
                    type="number"
                    value={localUnitPrice}
                    onChange={(e) => updateUnitPrice(e.target.value)}
                    className="w-24 px-2 py-1 border border-border-secondary rounded text-sm"
                  />
                  <span className="text-text-muted">円</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                <span>数量: {formatNumber(localQuantity)}</span>
                <span>単価: {formatNumber(localUnitPrice)}円</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-text-primary">
              {formatNumber(totalPrice)}円
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded specifications */}
      {isExpanded && (
        <div className="px-4 pb-3 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {/* サイズ */}
            {isEditing ? (
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-text-muted flex-shrink-0">サイズ:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={localSpecs.width || ''}
                    onChange={(e) => updateSpec('width', parseInt(e.target.value) || 0)}
                    placeholder="幅"
                    className="w-16 px-2 py-1 border border-border-secondary rounded text-sm"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={localSpecs.height || ''}
                    onChange={(e) => updateSpec('height', parseInt(e.target.value) || 0)}
                    placeholder="高さ"
                    className="w-16 px-2 py-1 border border-border-secondary rounded text-sm"
                  />
                  {localSpecs.depth !== undefined && (
                    <>
                      <span>×</span>
                      <input
                        type="number"
                        value={localSpecs.depth || ''}
                        onChange={(e) => updateSpec('depth', parseInt(e.target.value) || 0)}
                        placeholder="マチ"
                        className="w-16 px-2 py-1 border border-border-secondary rounded text-sm"
                      />
                    </>
                  )}
                  <span className="text-text-muted">mm</span>
                </div>
              </div>
            ) : (
              localSpecs.dimensions && (
                <EditableSpecItem
                  label="サイズ"
                  value={localSpecs.dimensions}
                  isEditing={false}
                  onChange={() => {}}
                />
              )
            )}

            {/* 袋タイプ */}
            <EditableSpecItem
              label="袋タイプ"
              value={localSpecs.bagTypeId || '-'}
              type="select"
              options={bagTypeOptions}
              isEditing={isEditing}
              onChange={(v) => updateSpec('bagTypeId', v)}
              displayLabel={!isEditing ? getBagTypeLabel(localSpecs.bagTypeId || '') : undefined}
            />

            {/* 素材 */}
            {isEditing ? (
              <EditableSpecItem
                label="素材"
                value={localSpecs.materialId || '-'}
                type="select"
                options={materialOptions}
                isEditing={isEditing}
                onChange={(v) => updateSpec('materialId', v)}
              />
            ) : (
              <>
                {/* 素材ラベル */}
                {localSpecs.materialId && (
                  <div className="col-span-2">
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="text-text-muted flex-shrink-0">素材:</span>
                      <span className="text-text-primary">{getMaterialLabel(localSpecs.materialId)}</span>
                    </div>
                  </div>
                )}
                {/* 素材詳細仕様 */}
                {localSpecs.materialId && localSpecs.thicknessSelection && (() => {
                  const matSpec = getMaterialSpecification(localSpecs.materialId, localSpecs.thicknessSelection);
                  if (matSpec && matSpec !== '-') {
                    return (
                      <div className="col-span-2">
                        <div className="flex items-baseline gap-2 text-sm">
                          <span className="text-text-muted flex-shrink-0">素材詳細:</span>
                          <span className="text-text-primary text-blue-700">{matSpec}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                {/* 重量範囲 */}
                {localSpecs.materialId && localSpecs.thicknessSelection && (() => {
                  const options = MATERIAL_THICKNESS_OPTIONS[localSpecs.materialId];
                  if (options) {
                    const thickness = options.find(opt => opt.id === localSpecs.thicknessSelection);
                    if (thickness?.weightRange) {
                      return (
                        <div>
                          <div className="flex items-baseline gap-2 text-sm">
                            <span className="text-text-muted flex-shrink-0">重量:</span>
                            <span className="text-text-primary">{thickness.weightRange}</span>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
              </>
            )}

            {/* 厚さ */}
            {isEditing ? (
              <EditableSpecItem
                label="厚さ"
                value={localSpecs.thicknessSelection || '-'}
                type="select"
                options={getThicknessOptionsForMaterial(localSpecs.materialId)}
                isEditing={isEditing}
                onChange={(v) => updateSpec('thicknessSelection', v)}
              />
            ) : (
              <>
                <EditableSpecItem
                  label="厚さ"
                  value={localSpecs.thicknessSelection || '-'}
                  isEditing={false}
                  onChange={() => {}}
                  displayLabel={getThicknessLabel(localSpecs.thicknessSelection || '', localSpecs.materialId)}
                />
                {formatThicknessDisplay(localSpecs) && formatThicknessDisplay(localSpecs) !== '-' && (
                  <EditableSpecItem
                    label="厚さ詳細"
                    value={formatThicknessDisplay(localSpecs)}
                    isEditing={false}
                    onChange={() => {}}
                  />
                )}
              </>
            )}

            {/* 印刷 */}
            {isEditing ? (
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-text-muted flex-shrink-0">印刷:</span>
                <select
                  value={localSpecs.printingType || 'none'}
                  onChange={(e) => updateSpec('printingType', e.target.value)}
                  className="flex-1 px-2 py-1 border border-border-secondary rounded text-sm"
                >
                  {printingTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {localSpecs.printingType && localSpecs.printingType !== 'none' && (
                  <>
                    <input
                      type="number"
                      value={localSpecs.printingColors || 1}
                      onChange={(e) => updateSpec('printingColors', parseInt(e.target.value) || 1)}
                      placeholder="色数"
                      className="w-16 px-2 py-1 border border-border-secondary rounded text-sm"
                    />
                    <span className="text-text-muted">色</span>
                  </>
                )}
              </div>
            ) : (
              localSpecs.printingType && localSpecs.printingType !== 'none' && (
                <EditableSpecItem
                  label="印刷"
                  value={getPrintingLabel(localSpecs.printingType)}
                  isEditing={false}
                  onChange={() => {}}
                />
              )
            )}
            {/* 色数は常にフルカラー表示 */}
            {!isEditing && localSpecs.printingType && localSpecs.printingType !== 'none' && (
              <EditableSpecItem
                label="色数"
                value="フルカラー"
                isEditing={false}
                onChange={() => {}}
              />
            )}

            {/* 納期 */}
            <EditableSpecItem
              label="納期"
              value={localSpecs.urgency || '-'}
              type="select"
              options={urgencyOptions}
              isEditing={isEditing}
              onChange={(v) => updateSpec('urgency', v)}
              displayLabel={!isEditing ? getUrgencyLabel(localSpecs.urgency || '') : undefined}
            />

            {/* 配送先 */}
            <EditableSpecItem
              label="配送先"
              value={localSpecs.deliveryLocation || '-'}
              type="select"
              options={deliveryLocationOptions}
              isEditing={isEditing}
              onChange={(v) => updateSpec('deliveryLocation', v)}
              displayLabel={!isEditing ? getDeliveryLocationLabel(localSpecs.deliveryLocation || '') : undefined}
            />

            {/* スパウトパウチ専用フィールド */}
            {localSpecs.bagTypeId === 'spout_pouch' && (
              <>
                {localSpecs.spoutSize && (
                  <EditableSpecItem
                    label="スパウトサイズ"
                    value={`${localSpecs.spoutSize}mm`}
                    isEditing={false}
                    onChange={() => {}}
                  />
                )}
                {localSpecs.spoutPosition && (
                  <EditableSpecItem
                    label="スパウト位置"
                    value={getSpoutPositionLabel(localSpecs.spoutPosition)}
                    isEditing={false}
                    onChange={() => {}}
                  />
                )}
              </>
            )}

            {/* シール幅 */}
            {localSpecs.sealWidth && (
              <EditableSpecItem
                label="シール幅"
                value={getSealWidthLabel(localSpecs.sealWidth)}
                isEditing={false}
                onChange={() => {}}
              />
            )}

            {/* 両面印刷 */}
            {localSpecs.doubleSided === true && (
              <EditableSpecItem
                label="両面印刷"
                value="あり"
                isEditing={false}
                onChange={() => {}}
              />
            )}
          </div>

          {/* 素材4層構成（filmLayersが存在する場合のみ表示） */}
          {localSpecs.filmLayers && localSpecs.filmLayers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-secondary">
              <div className="text-xs text-text-muted mb-2">素材構成（4層）:</div>
              <div className="flex flex-wrap gap-2">
                {localSpecs.filmLayers.map((layer: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-background border border-border-secondary rounded text-xs"
                  >
                    <span className="font-medium">{layer.materialId || '-'}</span>
                    <span className="text-text-muted ml-1">{layer.thickness ? `${layer.thickness}μ` : ''}</span>
                  </span>
                ))}
              </div>
              {/* 保存された完全なスペックも表示 */}
              {localSpecs.specification && (
                <div className="mt-2 text-xs text-text-primary">
                  {localSpecs.specification}
                </div>
              )}
            </div>
          )}

          {/* 後加工 - カテゴリ別グループ化 */}
          {isEditing ? (
            <div className="mt-3 pt-3 border-t border-border-secondary">
              <div className="text-sm text-text-muted mb-3">後加工オプション:</div>
              {PROCESSING_CATEGORIES.map((category) => {
                const categoryOptions = postProcessingOptionsByCategory[category.id] || [];
                if (categoryOptions.length === 0) return null;

                return (
                  <div key={category.id} className="mb-4 last:mb-0">
                    <div className="text-xs font-medium text-text-primary mb-2 flex items-center gap-1.5">
                      <span>{category.icon}</span>
                      <span>{category.nameJa}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryOptions.map((opt) => {
                        const isSelected = (localSpecs.postProcessingOptions || []).includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => togglePostProcessing(opt.id)}
                            className={cn(
                              "px-2.5 py-1 rounded text-xs border transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border-secondary hover:bg-muted"
                            )}
                            title={opt.descriptionJa}
                          >
                            {opt.nameJa}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            localSpecs.postProcessingOptions && localSpecs.postProcessingOptions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border-secondary">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="text-text-muted">後加工:</span>
                  <div className="flex flex-wrap gap-2">
                    {localSpecs.postProcessingOptions.map((optId: string, idx: number) => {
                      const option = processingOptionsConfig.find(o => o.id === optId);
                      return (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-background border border-border-secondary rounded text-xs"
                          title={option?.descriptionJa}
                        >
                          {option?.nameJa || optId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export function AdminOrderItemsEditor({ order, editable = false, onUpdate }: AdminOrderItemsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [requestModification, setRequestModification] = useState(false); // 修正要求フラグ

  // 編集中のアイテムデータを管理
  const [editingItems, setEditingItems] = useState<{ [key: string]: any }>({});

  // 手動割引関連の状態
  const [discountPercentage, setDiscountPercentage] = useState(
    order.manualDiscountPercentage || 0
  );
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 編集可能チェック
  const canEdit = editable && EDITABLE_STATUSES.includes(order.status);

  // 小計（元の小計 + 手動割引額 = 割引前の小計）
  const baseSubtotal = (order.subtotal || 0) + (order.manualDiscountAmount || 0);
  const manualDiscountAmount = order.manualDiscountAmount || 0;
  const subtotal = order.subtotal || 0;
  const taxAmount = order.taxAmount || 0;
  const totalAmount = order.totalAmount || 0;

  // 編集開始
  const handleStartEdit = () => {
    setIsEditing(true);
    // 各アイテムの初期値を保存
    const initialItems: { [key: string]: any } = {};
    order.items?.forEach((item: any) => {
      initialItems[item.id] = {
        specifications: item.specifications || {},
        quantity: item.quantity || item.quantity,
        unitPrice: item.unitPrice || item.unit_price,
      };
    });
    setEditingItems(initialItems);
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItems({});
  };

  // アイテム更新ハンドラー
  const handleItemChange = (itemId: string, specifications: any, quantity: number, unitPrice: number) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: { specifications, quantity, unitPrice },
    }));
  };

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const requestBody: any = { items: editingItems };

      // 修正要求フローの場合は追加パラメータを含める
      if (requestModification) {
        requestBody.requestModification = true;
        requestBody.modificationReason = '管理者による注文仕様の修正';
      }

      const response = await fetch(`/api/admin/orders/${order.id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        const message = requestModification
          ? '修正内容を保存し、顧客承認を要求しました'
          : '商品明細を更新しました';
        setSaveMessage({ type: 'success', text: message });
        setIsEditing(false);
        setRequestModification(false);
        setTimeout(() => {
          setSaveMessage(null);
          onUpdate?.();
        }, 1500);
      } else {
        setSaveMessage({ type: 'error', text: result.error || '更新に失敗しました' });
      }
    } catch (error) {
      console.error('Failed to update order items:', error);
      setSaveMessage({ type: 'error', text: '更新に失敗しました' });
    } finally {
      setIsSaving(false);
    }

    setTimeout(() => setSaveMessage(null), 3000);
  };

  // 手動割引適用ハンドラー
  const handleApplyDiscount = async () => {
    if (discountPercentage < 0 || discountPercentage > 100) {
      setDiscountMessage({ type: 'error', text: '割引率は0〜100の間で指定してください' });
      setTimeout(() => setDiscountMessage(null), 3000);
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountMessage(null);

    try {
      const response = await adminFetch(`/api/admin/orders/${order.id}/apply-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercentage }),
      });

      const result = await response.json();

      if (result.success) {
        setDiscountMessage({ type: 'success', text: result.message || '割引を適用しました' });
        // 注文データを更新
        setTimeout(() => {
          setDiscountMessage(null);
          onUpdate?.();
        }, 1500);
      } else {
        setDiscountMessage({ type: 'error', text: result.error || '割引の適用に失敗しました' });
      }
    } catch (error) {
      console.error('Failed to apply discount:', error);
      setDiscountMessage({ type: 'error', text: '割引の適用に失敗しました' });
    } finally {
      setIsApplyingDiscount(false);
    }

    setTimeout(() => setDiscountMessage(null), 3000);
  };

  // 手動割引クリアハンドラー
  const handleClearDiscount = async () => {
    setIsApplyingDiscount(true);
    setDiscountMessage(null);

    try {
      const response = await adminFetch(`/api/admin/orders/${order.id}/apply-discount`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setDiscountPercentage(0);
        setDiscountMessage({ type: 'success', text: '手動割引をクリアしました' });
        setTimeout(() => {
          setDiscountMessage(null);
          onUpdate?.();
        }, 1500);
      } else {
        setDiscountMessage({ type: 'error', text: result.error || 'クリアに失敗しました' });
      }
    } catch (error) {
      console.error('Failed to clear discount:', error);
      setDiscountMessage({ type: 'error', text: 'クリアに失敗しました' });
    } finally {
      setIsApplyingDiscount(false);
    }

    setTimeout(() => setDiscountMessage(null), 3000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Package className="w-5 h-5" />
          商品明細
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">
            {order.items?.length || 0}点
          </span>
          {canEdit && !isEditing && (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border-secondary rounded hover:bg-muted transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              編集
            </button>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border-secondary rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
              <label className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border-secondary rounded hover:bg-muted transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={requestModification}
                  onChange={(e) => setRequestModification(e.target.checked)}
                  className="rounded"
                />
                <span>修正依頼として保存</span>
              </label>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  requestModification
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : requestModification ? '修正依頼' : '保存'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 保存メッセージ */}
      {saveMessage && (
        <div className={cn(
          "mb-4 p-3 rounded text-sm",
          saveMessage.type === 'success'
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {saveMessage.text}
        </div>
      )}

      {/* Items list */}
      <div className={cn(
        "divide-y divide-border-secondary border-y border-border-secondary mb-4",
        isEditing && "bg-blue-50/30 -mx-6 px-6"
      )}>
        {order.items?.map((item: any) => (
          <OrderItemEditRow
            key={item.id}
            item={item}
            isEditing={isEditing}
            onEditChange={(specs, qty, price) => handleItemChange(item.id, specs, qty, price)}
          />
        ))}
      </div>

      {/* Total */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">小計</span>
          <span className="text-text-primary">
            {formatNumber(baseSubtotal)}円
          </span>
        </div>

        {/* 手動割引セクション */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">手動割引</span>
            {manualDiscountAmount > 0 && (
              <span className="text-sm text-blue-700">
                -{formatNumber(manualDiscountAmount)}円
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                disabled={isApplyingDiscount}
                className="w-20 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0"
              />
              <span className="text-sm text-blue-700">%</span>
              <Percent className="w-4 h-4 text-blue-500" />
            </div>

            <div className="flex items-center gap-1">
              {discountPercentage > 0 || manualDiscountAmount > 0 ? (
                <>
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isApplyingDiscount || discountPercentage === (order.manualDiscountPercentage || 0)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingDiscount ? '適用中...' : '適用'}
                  </button>
                  <button
                    onClick={handleClearDiscount}
                    disabled={isApplyingDiscount}
                    className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    クリア
                  </button>
                </>
              ) : (
                <button
                  onClick={handleApplyDiscount}
                  disabled={isApplyingDiscount || discountPercentage === 0}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingDiscount ? '適用中...' : '適用'}
                </button>
              )}
            </div>
          </div>

          {/* 割引メッセージ */}
          {discountMessage && (
            <div className={cn(
              "text-xs p-2 rounded",
              discountMessage.type === 'success'
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
              {discountMessage.text}
            </div>
          )}

          {/* 現在の割引表示 */}
          {order.manualDiscountPercentage > 0 && (
            <div className="text-xs text-blue-600">
              現在の割引: {order.manualDiscountPercentage}% (-{formatNumber(order.manualDiscountAmount)}円)
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">小計（割引後）</span>
          <span className="text-text-primary">
            {formatNumber(subtotal)}円
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">消費税 (10%)</span>
          <span className="text-text-primary">
            {formatNumber(taxAmount)}円
          </span>
        </div>
        <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-border-secondary">
          <span className="text-text-primary">合計</span>
          <span className="text-text-primary">
            {formatNumber(totalAmount)}円
          </span>
        </div>
      </div>

      {/* 編集モードでの注意書き */}
      {isEditing && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <p>💡 編集中です。各項目を変更して「保存」ボタンを押してください。</p>
          <p className="mt-1 text-xs">※ 保存後、関連するPDFが再生成されます。</p>
        </div>
      )}
    </Card>
  );
}
