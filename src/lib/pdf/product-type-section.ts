/**
 * Product Type Section HTML Generator
 */

import type { QuoteData } from './types';
import { formatYen } from './format-helpers';

export function generateProductTypeSection(specs: QuoteData['specifications']): string {
  if (!specs) return '';

  // Get bag type identifier (supports both Japanese and English formats)
  const bagType = specs.bagType || (specs as any).productType || '';

  // Normalize bag type to English identifier
  let normalizedBagType = bagType;
  if (bagType === 'スパウトパウチ') normalizedBagType = 'spout_pouch';
  else if (bagType === 'ロールフィルム') normalizedBagType = 'roll_film';
  else if (bagType === 'ガゼットパウチ' || bagType === 'ボックスパウチ') normalizedBagType = 'box';
  else if (bagType === '合掌袋') normalizedBagType = 'lap_seal';

  switch (normalizedBagType) {
    case 'lap_seal':
      // For lap_seal (合掌袋), display side width (よこめん) only, no depth
      return `
        <div class="lap-seal-section">
          <h5>合掌袋仕様</h5>
          <table class="specs-table">
            ${(specs as any).sideWidth ? `
            <tr>
              <td class="spec-label">よこめん幅</td>
              <td>${(specs as any).sideWidth}mm</td>
            </tr>` : ''}
          </table>
        </div>
      `;
    case 'spout_pouch':
      return `
        <div class="spout-pouch-section">
          <h5>スパウト仕様</h5>
          <table class="specs-table">
            ${specs.spoutSize ? `
            <tr>
              <td class="spec-label">スパウトサイズ</td>
              <td>${specs.spoutSize}</td>
            </tr>` : ''}
            ${specs.spoutPosition ? `
            <tr>
              <td class="spec-label">スパウト位置</td>
              <td>${specs.spoutPosition}</td>
            </tr>` : ''}
            ${specs.hasGusset ? `
            <tr>
              <td class="spec-label">マチ</td>
              <td>あり</td>
            </tr>` : ''}
          </table>
        </div>
      `;
    case 'roll_film':
      // ロールフィルム仕様がある場合のみ表示
      const hasRollFilmSpecs = specs.rollFilmSpecs?.materialWidth || specs.rollFilmSpecs?.pitch || specs.rollFilmSpecs?.totalLength || specs.rollFilmSpecs?.rollCount;
      return hasRollFilmSpecs ? `
        <div class="roll-film-section">
          <h5>ロールフィルム仕様</h5>
          <table class="specs-table">
            ${specs.rollFilmSpecs?.materialWidth ? `
            <tr>
              <td class="spec-label">原反幅</td>
              <td>${specs.rollFilmSpecs.materialWidth}mm</td>
            </tr>` : ''}
            ${specs.rollFilmSpecs?.pitch ? `
            <tr>
              <td class="spec-label">ピッチ</td>
              <td>${specs.rollFilmSpecs.pitch}mm</td>
            </tr>` : ''}
            ${specs.rollFilmSpecs?.totalLength ? `
            <tr>
              <td class="spec-label">総長さ</td>
              <td>${specs.rollFilmSpecs.totalLength.toLocaleString('ja-JP')}m</td>
            </tr>` : ''}
            ${specs.rollFilmSpecs?.rollCount ? `
            <tr>
              <td class="spec-label">ロール数</td>
              <td>${specs.rollFilmSpecs.rollCount}本</td>
            </tr>` : ''}
          </table>
        </div>
      ` : ``
    case 'box':
      // For box pouch (ガゼットパウチ), display side width
      return `
        <div class="box-pouch-section">
          <h5>ガゼットパウチ仕様</h5>
          <table class="specs-table">
            ${(specs as any).sideWidth ? `
            <tr>
              <td class="spec-label">よこめん幅</td>
              <td>${(specs as any).sideWidth}mm</td>
            </tr>` : ''}
          </table>
        </div>
      `;
    default:
      return '';
  }
}

