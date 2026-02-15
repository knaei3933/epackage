/**
 * PDF Module Exports
 *
 * PDFモジュール エクスポート
 * - 基底クラスとユーティリティ
 * - 各種PDFジェネレーター
 */

// ============================================================
// Core Exports
// ============================================================

export * from './core/base';
export * from './core/font-manager';
export * from './core/template-manager';
export * from './core/layout-helper';
export * from './core/client-adapter';

// ============================================================
// Generator Exports
// ============================================================

export * from './generators/contract-generator';
export * from './generators/specsheet-generator';
export * from './generators/quotation-generator';

// ============================================================
// Re-exports for Backward Compatibility
// ============================================================

// 既存の契約書ジェネレーター関数を再エクスポート
export {
  generateContractPdf,
  generateContractPdfBase64,
  validateContractData,
  estimateContractPdfSize,
} from './generators/contract-generator';

// 既存の仕様書ジェネレーター関数を再エクスポート
export {
  generateSpecSheetPdf,
  generateSpecSheetPdfBase64,
  validateSpecSheetData,
  estimateSpecSheetPdfSize,
} from './generators/specsheet-generator';
