import { validateMOQ, isKraftMaterial } from '../moq-validator';

describe('MOQ Validator', () => {
  describe('isKraftMaterial', () => {
    it('should return true for Kraft materials', () => {
      expect(isKraftMaterial('kraft_vmpet_lldpe')).toBe(true);
      expect(isKraftMaterial('kraft_pet_lldpe')).toBe(true);
    });

    it('should return false for non-Kraft materials', () => {
      expect(isKraftMaterial('opp_cpp')).toBe(false);
      expect(isKraftMaterial('pet_cpp')).toBe(false);
      expect(isKraftMaterial('ny_cpp')).toBe(false);
      expect(isKraftMaterial('')).toBe(false);
      expect(isKraftMaterial('unknown')).toBe(false);
    });
  });

  describe('validateMOQ', () => {
    describe('Kraft material + roll film', () => {
      const materialId = 'kraft_vmpet_lldpe';
      const bagTypeId = 'roll_film';

      it('should validate quantities >= 1000m', () => {
        expect(validateMOQ(materialId, bagTypeId, 1000)).toEqual({
          valid: true,
          error: undefined
        });
        expect(validateMOQ(materialId, bagTypeId, 1500)).toEqual({
          valid: true,
          error: undefined
        });
        expect(validateMOQ(materialId, bagTypeId, 2000)).toEqual({
          valid: true,
          error: undefined
        });
      });

      it('should reject quantities < 1000m', () => {
        const result = validateMOQ(materialId, bagTypeId, 999);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain('Kraft材料');
        expect(result.error).toContain('1000m');
      });

      it('should reject zero quantity', () => {
        const result = validateMOQ(materialId, bagTypeId, 0);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Kraft material + non-roll film', () => {
      const materialId = 'kraft_vmpet_lldpe';

      it('should allow any quantity for pouches', () => {
        expect(validateMOQ(materialId, 'stand_pouch', 500)).toEqual({
          valid: true,
          error: undefined
        });
        expect(validateMOQ(materialId, 'stand_pouch', 100)).toEqual({
          valid: true,
          error: undefined
        });
      });

      it('should allow any quantity for flat pouches', () => {
        expect(validateMOQ(materialId, 'flat_3_side', 300)).toEqual({
          valid: true,
          error: undefined
        });
      });
    });

    describe('Non-Kraft materials', () => {
      it('should allow any quantity for roll film', () => {
        expect(validateMOQ('opp_cpp', 'roll_film', 300)).toEqual({
          valid: true,
          error: undefined
        });
        expect(validateMOQ('pet_cpp', 'roll_film', 100)).toEqual({
          valid: true,
          error: undefined
        });
      });

      it('should allow any quantity for other bag types', () => {
        expect(validateMOQ('opp_cpp', 'stand_pouch', 500)).toEqual({
          valid: true,
          error: undefined
        });
        expect(validateMOQ('pet_cpp', 'flat_3_side', 300)).toEqual({
          valid: true,
          error: undefined
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle empty materialId', () => {
        expect(validateMOQ('', 'roll_film', 100)).toEqual({
          valid: true,
          error: undefined
        });
      });

      it('should handle empty bagTypeId', () => {
        expect(validateMOQ('kraft_vmpet_lldpe', '', 100)).toEqual({
          valid: true,
          error: undefined
        });
      });

      it('should handle both empty', () => {
        expect(validateMOQ('', '', 100)).toEqual({
          valid: true,
          error: undefined
        });
      });
    });

    describe('Multi-SKU scenarios', () => {
      const materialId = 'kraft_vmpet_lldpe';
      const bagTypeId = 'roll_film';

      it('should validate total quantity across SKUs', () => {
        // SKU 1: 600m, SKU 2: 400m = 1000m total (valid)
        const total1 = 600 + 400;
        expect(validateMOQ(materialId, bagTypeId, total1)).toEqual({
          valid: true,
          error: undefined
        });

        // SKU 1: 500m, SKU 2: 300m = 800m total (invalid)
        const total2 = 500 + 300;
        const result = validateMOQ(materialId, bagTypeId, total2);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('1000m');
      });

      it('should validate 3 SKU scenario', () => {
        // 3 SKUs with 400m each = 1200m total (valid)
        const total = 400 + 400 + 400;
        expect(validateMOQ(materialId, bagTypeId, total)).toEqual({
          valid: true,
          error: undefined
        });
      });
    });
  });
});
