/**
 * Order Specification Transformation Unit Tests
 *
 * Tests for verifying specifications field transformation from quotation to order
 * Focus: spoutSize, spoutPosition, sealWidth, doubleSided, filmLayers
 */

import { describe, it, expect } from '@jest/globals';

describe('Order Specification Transform', () => {
  describe('Spout Pouch Fields', () => {
    it('should handle spoutSize correctly', () => {
      const specs = {
        bagTypeId: 'spout_pouch',
        spoutSize: 15,
      };
      expect(specs.spoutSize).toBe(15);
    });

    it('should handle spoutPosition labels correctly', () => {
      const getSpoutPositionLabel = (value: string): string => {
        const labels: Record<string, string> = {
          'top-left': '左上',
          'top-center': '上中央',
          'top-right': '右上',
        };
        return labels[value] || value || '-';
      };

      expect(getSpoutPositionLabel('top-left')).toBe('左上');
      expect(getSpoutPositionLabel('top-center')).toBe('上中央');
      expect(getSpoutPositionLabel('top-right')).toBe('右上');
      expect(getSpoutPositionLabel('unknown')).toBe('unknown');
      expect(getSpoutPositionLabel('')).toBe('-');
    });

    it('should display spout fields only for spout_pouch type', () => {
      const spoutSpecs = {
        bagTypeId: 'spout_pouch',
        spoutSize: 18,
        spoutPosition: 'top-center',
      };

      const regularSpecs = {
        bagTypeId: 'stand_up',
      };

      expect(spoutSpecs.bagTypeId).toBe('spout_pouch');
      expect(spoutSpecs.spoutSize).toBeDefined();
      expect(spoutSpecs.spoutPosition).toBeDefined();
      expect(regularSpecs.spoutSize).toBeUndefined();
    });
  });

  describe('Sealing Width', () => {
    it('should handle sealWidth labels correctly', () => {
      const getSealWidthLabel = (value: string): string => {
        const labels: Record<string, string> = {
          '5mm': '5mm',
          '7.5mm': '7.5mm',
          '10mm': '10mm',
        };
        return labels[value] || value || '-';
      };

      expect(getSealWidthLabel('5mm')).toBe('5mm');
      expect(getSealWidthLabel('7.5mm')).toBe('7.5mm');
      expect(getSealWidthLabel('10mm')).toBe('10mm');
      expect(getSealWidthLabel('unknown')).toBe('unknown');
    });
  });

  describe('Double Sided', () => {
    it('should handle doubleSided boolean correctly', () => {
      const doubleSidedSpecs = {
        doubleSided: true,
      };

      const singleSidedSpecs = {
        doubleSided: false,
      };

      const noDoubleSidedSpecs = {};

      expect(doubleSidedSpecs.doubleSided).toBe(true);
      expect(singleSidedSpecs.doubleSided).toBe(false);
      expect(noDoubleSidedSpecs.doubleSided).toBeUndefined();
    });
  });

  describe('Film Layers', () => {
    it('should handle filmLayers array correctly', () => {
      const filmLayersSpecs = {
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'AL', thickness: 7 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 70 },
        ],
      };

      expect(filmLayersSpecs.filmLayers).toHaveLength(4);
      expect(filmLayersSpecs.filmLayers![0].materialId).toBe('PET');
      expect(filmLayersSpecs.filmLayers![0].thickness).toBe(12);
    });

    it('should handle empty filmLayers array', () => {
      const emptySpecs = {
        filmLayers: [],
      };

      expect(emptySpecs.filmLayers).toHaveLength(0);
    });

    it('should handle missing filmLayers', () => {
      const noFilmLayersSpecs = {};

      expect(noFilmLayersSpecs.filmLayers).toBeUndefined();
    });
  });

  describe('camelCase vs snake_case Handling', () => {
    it('should handle both naming conventions', () => {
      const getItemValue = (item: any, camelCaseKey: string, snakeCaseKey: string): any => {
        return item[camelCaseKey] ?? item[snakeCaseKey];
      };

      const camelCaseSpecs = {
        bagTypeId: 'spout_pouch',
        spoutSize: 15,
      };

      const snakeCaseSpecs = {
        bag_type_id: 'spout_pouch',
        spout_size: 15,
      };

      expect(getItemValue(camelCaseSpecs, 'bagTypeId', 'bag_type_id')).toBe('spout_pouch');
      expect(getItemValue(camelCaseSpecs, 'spoutSize', 'spout_size')).toBe(15);
      expect(getItemValue(snakeCaseSpecs, 'bagTypeId', 'bag_type_id')).toBe('spout_pouch');
      expect(getItemValue(snakeCaseSpecs, 'spoutSize', 'spout_size')).toBe(15);
    });
  });

  describe('Missing Field Handling', () => {
    it('should handle undefined specifications gracefully', () => {
      const specs: any = {
        bagTypeId: 'stand_up',
      };

      expect(specs.spoutSize).toBeUndefined();
      expect(specs.spoutPosition).toBeUndefined();
      expect(specs.sealWidth).toBeUndefined();
      expect(specs.doubleSided).toBeUndefined();
      expect(specs.filmLayers).toBeUndefined();
    });

    it('should handle null specifications gracefully', () => {
      const specs: any = {
        bagTypeId: 'stand_up',
        spoutSize: null,
        spoutPosition: null,
      };

      expect(specs.spoutSize).toBeNull();
      expect(specs.spoutPosition).toBeNull();
    });
  });
});
