/**
 * AI Specification Extractor Unit Tests
 *
 * AI仕様書抽出エンジン単体テスト
 * Unit tests for specification extraction functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { AiFileData, Layer, TextElement } from '@/types/aiFile';
import type { ProductSpecifications, PouchType, ConfidenceScore } from '../types';
import {
  detectPouchType,
  extractDimensions,
  extractMaterialLayers,
  extractProcessingFeatures,
  calculateConfidence,
  extractSpecifications,
  validateSpecifications,
  crossCheckWithQuotation,
} from '../specExtractor';

// ============================================================
// Test Data Helpers
// ============================================================

function createMockAiFileData(overrides?: Partial<AiFileData>): AiFileData {
  return {
    version: 'CC2024',
    dimensions: {
      width: 425.2, // ~150mm in points
      height: 566.93, // ~200mm in points
    },
    colors: [],
    fonts: [],
    layers: [
      {
        id: 'layer1',
        name: 'レイヤー 1',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
      },
      {
        id: 'layer2',
        name: '外層',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
      },
      {
        id: 'layer3',
        name: '中間層',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
      },
      {
        id: 'layer4',
        name: '内層',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
      },
    ],
    textElements: [
      {
        id: 'text1',
        content: 'スタンドパウチ 150x200x50',
        position: { x: 100, y: 100 },
        font: 'Arial',
        fontSize: 12,
        color: { c: 0, m: 0, y: 0, k: 100 },
        layerId: 'layer1',
        layerName: 'レイヤー 1',
      },
      {
        id: 'text2',
        content: 'PET12/AL7/PE80',
        position: { x: 100, y: 120 },
        font: 'Arial',
        fontSize: 10,
        color: { c: 0, m: 0, y: 0, k: 100 },
        layerId: 'layer2',
        layerName: '外層',
      },
    ],
    artboards: [
      {
        id: 'artboard1',
        name: 'スタンドパウチ',
        width: 425.2,
        height: 566.93,
      },
    ],
    ...overrides,
  };
}

// ============================================================
// Test Suites
// ============================================================

describe('detectPouchType', () => {
  it('should detect stand pouch from layer names', () => {
    const aiData = createMockAiFileData({
      layers: [
        { id: 'l1', name: 'stand pouch layer', visible: true, locked: false, opacity: 1, blendMode: 'normal' },
      ],
    });

    expect(detectPouchType(aiData)).toBe('stand_pouch');
  });

  it('should detect stand pouch from Japanese layer names', () => {
    const aiData = createMockAiFileData({
      layers: [
        { id: 'l1', name: 'スタンドパウチ', visible: true, locked: false, opacity: 1, blendMode: 'normal' },
      ],
    });

    expect(detectPouchType(aiData)).toBe('stand_pouch');
  });

  it('should detect flat pouch', () => {
    const aiData = createMockAiFileData({
      layers: [
        { id: 'l1', name: 'flat pouch design', visible: true, locked: false, opacity: 1, blendMode: 'normal' },
      ],
    });

    expect(detectPouchType(aiData)).toBe('flat_pouch');
  });

  it('should detect zipper pouch', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'ジッパー付き',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 12,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    expect(detectPouchType(aiData)).toBe('zipper_pouch');
  });

  it('should detect gusset pouch', () => {
    const aiData = createMockAiFileData({
      layers: [
        { id: 'l1', name: 'gusset pouch', visible: true, locked: false, opacity: 1, blendMode: 'normal' },
      ],
    });

    expect(detectPouchType(aiData)).toBe('gusset_pouch');
  });

  it('should detect three side seal pouch', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: '三方シールパウチ',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 12,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    expect(detectPouchType(aiData)).toBe('three_side_seal');
  });

  it('should return unknown for unrecognized patterns', () => {
    const aiData = createMockAiFileData({
      layers: [
        { id: 'l1', name: 'random layer name', visible: true, locked: false, opacity: 1, blendMode: 'normal' },
      ],
    });

    expect(detectPouchType(aiData)).toBe('unknown');
  });
});

describe('extractDimensions', () => {
  it('should extract dimensions from artboard', () => {
    const aiData = createMockAiFileData({
      artboards: [
        {
          id: 'artboard1',
          name: 'Test',
          width: 425.2, // ~150mm
          height: 566.93, // ~200mm
        },
      ],
    });

    const dimensions = extractDimensions(aiData);

    expect(dimensions.width).toBe(150);
    expect(dimensions.height).toBe(200);
    expect(dimensions.tolerance).toBeDefined();
  });

  it('should detect gusset from text content', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'マチ: 50mm',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 12,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const dimensions = extractDimensions(aiData);

    expect(dimensions.gusset).toBe(50);
  });

  it('should detect gusset from English text', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'Gusset: 70mm',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 12,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const dimensions = extractDimensions(aiData);

    expect(dimensions.gusset).toBe(70);
  });

  it('should return default dimensions when no artboard', () => {
    const aiData = createMockAiFileData({
      artboards: [],
    });

    const dimensions = extractDimensions(aiData);

    expect(dimensions.width).toBe(0);
    expect(dimensions.height).toBe(0);
    expect(dimensions.gusset).toBe(0);
    expect(dimensions.tolerance).toBe(5);
  });

  it('should set appropriate tolerance based on size', () => {
    const smallAiData = createMockAiFileData({
      artboards: [
        { id: 'a1', name: 'Small', width: 100, height: 100 },
      ],
    });
    const largeAiData = createMockAiFileData({
      artboards: [
        { id: 'a1', name: 'Large', width: 1000, height: 1000 },
      ],
    });

    expect(extractDimensions(smallAiData).tolerance).toBe(2);
    expect(extractDimensions(largeAiData).tolerance).toBe(3);
  });
});

describe('extractMaterialLayers', () => {
  it('should parse 3-layer material composition', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'PET12/AL7/PE80',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const materials = extractMaterialLayers(aiData);

    expect(materials).toHaveLength(3);
    expect(materials[0].layer).toBe('outer');
    expect(materials[0].material).toBe('PET');
    expect(materials[0].thickness).toBe(12);
    expect(materials[1].layer).toBe('middle');
    expect(materials[1].material).toBe('AL');
    expect(materials[2].layer).toBe('inner');
    expect(materials[2].material).toBe('PE');
  });

  it('should parse material with spaces', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'PET 12 / AL 7 / PE 80',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const materials = extractMaterialLayers(aiData);

    expect(materials).toHaveLength(3);
    expect(materials[0].thickness).toBe(12);
    expect(materials[1].thickness).toBe(7);
    expect(materials[2].thickness).toBe(80);
  });

  it('should parse Japanese slash notation', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'PET12／AL7／PE80',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const materials = extractMaterialLayers(aiData);

    expect(materials).toHaveLength(3);
  });

  it('should return default materials when none found', () => {
    const aiData = createMockAiFileData({
      textElements: [],
      layers: [
        { id: 'l1', name: 'random layer', visible: true, locked: false, opacity: 1, blendMode: 'normal' },
      ],
    });

    const materials = extractMaterialLayers(aiData);

    expect(materials.length).toBeGreaterThan(0);
    expect(materials[0].material).toBe('PET'); // Default stand pouch materials
  });

  it('should include material descriptions', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'PET12/AL7/PE80',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const materials = extractMaterialLayers(aiData);

    expect(materials[0].description).toBeTruthy();
    expect(materials[1].description).toContain('バリア');
    expect(materials[2].description).toContain('シール');
  });
});

describe('extractProcessingFeatures', () => {
  it('should detect seal width', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'シール: 10mm',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const features = extractProcessingFeatures(aiData);

    expect(features.sealWidth).toBe(10);
  });

  it('should detect notch', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'ノッチ付き',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const features = extractProcessingFeatures(aiData);

    expect(features.notch).toBeDefined();
    expect(features.notch?.type).toBe('round');
  });

  it('should detect hanging hole', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: '吊り穴 5mm',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const features = extractProcessingFeatures(aiData);

    expect(features.hangingHole).toBeDefined();
    expect(features.hangingHole?.diameter).toBe(5);
  });

  it('should detect zipper features', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'ジッパー付きパウチ',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const features = extractProcessingFeatures(aiData);

    expect(features.zipperPosition).toBe('top');
    expect(features.zipperType).toBe('standard');
  });

  it('should detect corner radius', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: '角R3',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const features = extractProcessingFeatures(aiData);

    expect(features.cornerRadius).toBe(3);
  });

  it('should detect boolean features', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'スリット　エンボス加工',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const features = extractProcessingFeatures(aiData);

    expect(features.hasSlit).toBe(true);
    expect(features.hasEmbossing).toBe(true);
  });
});

describe('calculateConfidence', () => {
  it('should calculate high confidence for complete specs', () => {
    const aiData = createMockAiFileData();
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
        { layer: 'middle', material: 'AL', thickness: 7 },
        { layer: 'inner', material: 'PE', thickness: 80 },
      ],
      processing: {
        sealWidth: 10,
        zipperPosition: 'top',
        zipperType: 'standard',
      },
      confidence: {
        overall: 0,
        breakdown: { pouchType: 0, dimensions: 0, materials: 0, processing: 0 },
        flags: [],
        level: 'low',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const confidence = calculateConfidence(specs, aiData);

    expect(confidence.overall).toBeGreaterThan(0.7);
    expect(confidence.level).toBe('high');
    expect(confidence.flags).toHaveLength(0);
  });

  it('should calculate low confidence for incomplete specs', () => {
    const aiData = createMockAiFileData();
    const specs: ProductSpecifications = {
      pouchType: 'unknown',
      dimensions: { width: 0, height: 0, gusset: 0, tolerance: 5 },
      materials: [],
      processing: {},
      confidence: {
        overall: 0,
        breakdown: { pouchType: 0, dimensions: 0, materials: 0, processing: 0 },
        flags: [],
        level: 'low',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const confidence = calculateConfidence(specs, aiData);

    expect(confidence.overall).toBeLessThan(0.6);
    expect(confidence.level).toBe('low');
    expect(confidence.flags.length).toBeGreaterThan(0);
  });

  it('should include warning flags for low confidence areas', () => {
    const aiData = createMockAiFileData();
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
      ], // Only 1 layer
      processing: {
        sealWidth: 10,
      }, // Only 1 feature
      confidence: {
        overall: 0,
        breakdown: { pouchType: 0, dimensions: 0, materials: 0, processing: 0 },
        flags: [],
        level: 'low',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const confidence = calculateConfidence(specs, aiData);

    expect(confidence.flags.some(f => f.includes('材質'))).toBe(true);
  });

  it('should calculate breakdown scores correctly', () => {
    const aiData = createMockAiFileData();
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
        { layer: 'middle', material: 'AL', thickness: 7 },
        { layer: 'inner', material: 'PE', thickness: 80 },
      ],
      processing: { sealWidth: 10 },
      confidence: {
        overall: 0,
        breakdown: { pouchType: 0, dimensions: 0, materials: 0, processing: 0 },
        flags: [],
        level: 'low',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const confidence = calculateConfidence(specs, aiData);

    expect(confidence.breakdown.pouchType).toBeGreaterThan(0);
    expect(confidence.breakdown.dimensions).toBeGreaterThan(0);
    expect(confidence.breakdown.materials).toBeGreaterThan(0);
    expect(confidence.breakdown.processing).toBeGreaterThan(0);

    // Sum of breakdown should contribute to overall
    expect(confidence.overall).toBeGreaterThan(0);
  });
});

describe('validateSpecifications', () => {
  it('should validate correct specifications', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
        { layer: 'middle', material: 'AL', thickness: 7 },
        { layer: 'inner', material: 'PE', thickness: 80 },
      ],
      processing: { sealWidth: 10 },
      confidence: {
        overall: 0.9,
        breakdown: { pouchType: 0.9, dimensions: 0.9, materials: 0.9, processing: 0.9 },
        flags: [],
        level: 'high',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const validation = validateSpecifications(specs);

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should detect invalid dimensions', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 0, height: 0, gusset: 0, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
      ],
      processing: {},
      confidence: {
        overall: 0.5,
        breakdown: { pouchType: 0.5, dimensions: 0.5, materials: 0.5, processing: 0.5 },
        flags: [],
        level: 'low',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const validation = validateSpecifications(specs);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('寸法'))).toBe(true);
  });

  it('should detect missing materials', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [],
      processing: {},
      confidence: {
        overall: 0.5,
        breakdown: { pouchType: 0.5, dimensions: 0.5, materials: 0.5, processing: 0.5 },
        flags: [],
        level: 'low',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const validation = validateSpecifications(specs);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('材質'))).toBe(true);
  });

  it('should warn about oversized dimensions', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 1200, height: 1200, gusset: 100, tolerance: 5 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
      ],
      processing: {},
      confidence: {
        overall: 0.7,
        breakdown: { pouchType: 0.7, dimensions: 0.7, materials: 0.7, processing: 0.7 },
        flags: [],
        level: 'medium',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const validation = validateSpecifications(specs);

    expect(validation.warnings.some(w => w.includes('大きすぎ'))).toBe(true);
  });

  it('should warn about incomplete material composition', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
        { layer: 'middle', material: 'AL', thickness: 7 },
      ], // Only 2 layers
      processing: {},
      confidence: {
        overall: 0.7,
        breakdown: { pouchType: 0.7, dimensions: 0.7, materials: 0.7, processing: 0.7 },
        flags: [],
        level: 'medium',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const validation = validateSpecifications(specs);

    expect(validation.warnings.some(w => w.includes('3層'))).toBe(true);
  });
});

describe('crossCheckWithQuotation', () => {
  it('should cross-check matching specifications', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
        { layer: 'middle', material: 'AL', thickness: 7 },
        { layer: 'inner', material: 'PE', thickness: 80 },
      ],
      processing: {},
      confidence: {
        overall: 0.9,
        breakdown: { pouchType: 0.9, dimensions: 0.9, materials: 0.9, processing: 0.9 },
        flags: [],
        level: 'high',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const quotationData = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50 },
      materials: ['PET', 'AL', 'PE'],
    };

    const result = crossCheckWithQuotation(specs, quotationData);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should detect pouch type mismatch', () => {
    const specs: ProductSpecifications = {
      pouchType: 'flat_pouch',
      dimensions: { width: 150, height: 200, gusset: 0, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
      ],
      processing: {},
      confidence: {
        overall: 0.8,
        breakdown: { pouchType: 0.8, dimensions: 0.8, materials: 0.8, processing: 0.8 },
        flags: [],
        level: 'high',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const quotationData = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50 },
      materials: ['PET'],
    };

    const result = crossCheckWithQuotation(specs, quotationData);

    expect(result.warnings.some(w => w.includes('パウチタイプ'))).toBe(true);
  });

  it('should detect dimension mismatch', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
      ],
      processing: {},
      confidence: {
        overall: 0.8,
        breakdown: { pouchType: 0.8, dimensions: 0.8, materials: 0.8, processing: 0.8 },
        flags: [],
        level: 'high',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const quotationData = {
      dimensions: { width: 160, height: 200, gusset: 50 },
    };

    const result = crossCheckWithQuotation(specs, quotationData);

    expect(result.warnings.some(w => w.includes('寸法'))).toBe(true);
  });

  it('should detect material mismatch', () => {
    const specs: ProductSpecifications = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50, tolerance: 2 },
      materials: [
        { layer: 'outer', material: 'PET', thickness: 12 },
        { layer: 'middle', material: 'EVOH', thickness: 5 },
        { layer: 'inner', material: 'PE', thickness: 80 },
      ],
      processing: {},
      confidence: {
        overall: 0.8,
        breakdown: { pouchType: 0.8, dimensions: 0.8, materials: 0.8, processing: 0.8 },
        flags: [],
        level: 'high',
      },
      extractedAt: new Date(),
      sourceFile: 'test.ai',
    };

    const quotationData = {
      materials: ['PET', 'AL', 'PE'],
    };

    const result = crossCheckWithQuotation(specs, quotationData);

    expect(result.warnings.some(w => w.includes('材質'))).toBe(true);
  });
});

describe('extractSpecifications', () => {
  it('should extract complete specifications', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'スタンドパウチ 150x200x50 PET12/AL7/PE80 シール10mm',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    const specs = extractSpecifications(aiData, 'test.ai');

    expect(specs.pouchType).toBe('stand_pouch');
    expect(specs.dimensions.width).toBe(150);
    expect(specs.dimensions.height).toBe(200);
    expect(specs.materials.length).toBe(3);
    expect(specs.processing.sealWidth).toBe(10);
    expect(specs.sourceFile).toBe('test.ai');
    expect(specs.extractedAt).toBeInstanceOf(Date);
  });

  it('should calculate confidence for extracted specs', () => {
    const aiData = createMockAiFileData();

    const specs = extractSpecifications(aiData, 'test.ai');

    expect(specs.confidence.overall).toBeGreaterThan(0);
    expect(specs.confidence.breakdown).toBeDefined();
    expect(specs.confidence.level).toBeDefined();
  });
});

// ============================================================
// Integration Tests
// ============================================================

describe('Integration Tests', () => {
  it('should handle complete extraction workflow', () => {
    const aiData = createMockAiFileData({
      textElements: [
        {
          id: 't1',
          content: 'スタンドパウチ W150 H200 G50 PET12/AL7/PE80 シール10mm ノッチ5mm',
          position: { x: 0, y: 0 },
          font: 'Arial',
          fontSize: 10,
          color: { c: 0, m: 0, y: 0, k: 100 },
          layerId: 'l1',
          layerName: 'Layer 1',
        },
      ],
    });

    // Extract specifications
    const specs = extractSpecifications(aiData, 'complete-test.ai');

    // Validate
    const validation = validateSpecifications(specs);
    expect(validation.isValid).toBe(true);

    // Cross-check with quotation
    const quotationData = {
      pouchType: 'stand_pouch',
      dimensions: { width: 150, height: 200, gusset: 50 },
      materials: ['PET', 'AL', 'PE'],
    };
    const crossCheck = crossCheckWithQuotation(specs, quotationData);
    expect(crossCheck.warnings).toHaveLength(0);
  });

  it('should handle low-confidence extraction workflow', () => {
    const aiData = createMockAiFileData({
      layers: [
        { id: 'l1', name: 'unknown layer', visible: true, locked: false, opacity: 1, blendMode: 'normal' },
      ],
      textElements: [],
      artboards: [],
    });

    const specs = extractSpecifications(aiData, 'low-confidence-test.ai');

    // Should have low confidence
    expect(specs.confidence.level).toBe('low');

    // Validation should fail
    const validation = validateSpecifications(specs);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
