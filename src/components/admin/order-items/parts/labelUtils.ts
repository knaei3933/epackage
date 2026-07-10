/**
 * Label formatting utilities for AdminOrderItemsEditor.
 */

import { MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import { getFilmStructureLabel } from '@/constants/materialTypes';

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
}

export function formatThicknessDisplay(specs: Record<string, unknown>): string {
  const thickness = specs?.thicknessSelection || specs?.thickness_selection;
  if (!thickness) return '-';
  return String(thickness);
}

export function getItemValue(item: Record<string, unknown>, camelCaseKey: string, snakeCaseKey: string): any {
  return item?.[camelCaseKey] ?? item?.[snakeCaseKey];
}

export function getBagTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    'flat_3_side': '三方シール平袋',
    'stand_up': 'スタンドパウチ',
    'gazette': 'ガゼットパウチ',
    'roll_film': 'ロールフィルム',
    'spout_pouch': 'スパウトパウチ',
    'zipper_pouch': 'チャック付袋',
  };
  return labels[value] || value || '-';
}

export function getMaterialLabel(value: string): string {
  const labels: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_pe': 'PET/PE',
    'cpp': 'CPP (未延伸ポリプロピレン)',
    'lldpe': 'LLDPE (直鎖状低密度ポリエチレン)',
  };
  return labels[value] || value || '-';
}

export function getThicknessLabel(value: string, materialId?: string): string {
  if (materialId) {
    const isKraft = materialId === 'kraft_vmpet_lldpe' || materialId === 'kraft_pet_lldpe';
    if (!isKraft) {
      const structureLabel = getFilmStructureLabel(materialId, value);
      if (structureLabel && structureLabel !== materialId) return structureLabel;
    }
    const options = MATERIAL_THICKNESS_OPTIONS[materialId];
    if (options) {
      const opt = options.find(o => o.id === value);
      if (opt) return opt.nameJa;
    }
  }
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

export function getPrintingLabel(type: string): string {
  const labels: Record<string, string> = {
    'digital': 'デジタル印刷',
    'gravure': 'グラビア印刷',
    'none': 'なし',
  };
  return labels[type] || type || '-';
}

export function getUrgencyLabel(value: string): string {
  const labels: Record<string, string> = {
    'standard': '標準',
    'urgent': '至急',
  };
  return labels[value] || value || '-';
}

export function getDeliveryLocationLabel(value: string): string {
  const labels: Record<string, string> = {
    'domestic': '国内',
    'international': '海外',
  };
  return labels[value] || value || '-';
}

export function getSpoutPositionLabel(value: string): string {
  const labels: Record<string, string> = {
    'top-left': '左上',
    'top-center': '上中央',
    'top-right': '右上',
  };
  return labels[value] || value || '-';
}

export function getSealWidthLabel(value: string): string {
  const labels: Record<string, string> = {
    '5mm': '5mm',
    '7.5mm': '7.5mm',
    '10mm': '10mm',
  };
  return labels[value] || value || '-';
}
