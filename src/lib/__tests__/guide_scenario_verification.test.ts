
import { PouchCostCalculator, SKUCostParams } from '../pouch-cost-calculator';

// Mock FilmCostCalculator defaults if needed, but we rely on the implementation.

describe('Guide Scenario Verification', () => {
    const calculator = new PouchCostCalculator();

    test('01-Basic Flat Pouch 10,000 count', () => {
        // Scenario from 01-기본_평백_예시.md
        const params: SKUCostParams = {
            pouchType: 'flat_3_side',
            dimensions: {
                width: 100, // Pitch
                height: 160
            },
            skuQuantities: [10000], // 1SKU, 10k
            materialId: 'PET/AL/PET/LLDPE', // Not used directly logic relies on layers
            thicknessSelection: 'medium', // standard
            filmLayers: [
                { materialId: 'PET', thickness: 12 },
                { materialId: 'AL', thickness: 7 },
                { materialId: 'PET', thickness: 12 },
                { materialId: 'LLDPE', thickness: 90 }
            ],
            postProcessingOptions: [] // No special options
        };

        const result = calculator.calculateSKUCost(params);
        const skuResult = result.costPerSKU[0];
        const breakdown = skuResult.costBreakdown;

        console.log('Calculation Result:', JSON.stringify(breakdown, null, 2));
        console.log('Total JPY:', skuResult.costJPY);
        console.log('Unit Price JPY:', skuResult.costJPY / 10000);

        // Validation against Guide Values (approximate due to floating point and KRW rounding)
        // Base Cost Sum (KRW->JPY)
        // Guide Base Cost KRW: 1,135,680
        // Expected JPY Base (approx): 136,281
        // We can't check intermediate KRW easily without modifying the result object, 
        // but we can check the stored 'materialCost' etc which are JPY converted.

        // Reverse engineer JPY to KRW for validation
        const factor = 1 / 0.12;

        const materialKRW = breakdown.materialCost * factor;
        const printKRW = breakdown.printingCost * factor;
        const lamKRW = breakdown.laminationCost * factor;
        const slitKRW = breakdown.slitterCost * factor;
        const processKRW = breakdown.pouchProcessingCost * factor;

        const baseKRW = materialKRW + printKRW + lamKRW + slitKRW + processKRW;

        console.log('Reconstructed Base KRW:', baseKRW);
        // Expected: 1,135,680
        // Allow small margin for rounding errors
        expect(baseKRW).toBeGreaterThan(1130000);
        expect(baseKRW).toBeLessThan(1140000);

        // Manufacturing Margin
        // Guide: 454,272 KRW -> ~54,512 JPY
        // Check breakdown.manufacturingMargin
        expect(breakdown.manufacturingMargin).toBeDefined();

        // Duty
        // Guide: 79,498 KRW -> ~9,540 JPY
        // Check breakdown.duty

        // Delivery
        // Guide: 511,920 KRW (4 boxes) -> ~61,430 JPY
        // Check breakdown.delivery
        // Note: Code calculates weight dynamically. 
        // Guide Weight: 92.6kg. 
        // Code should match close to this.

        // Final Price
        // Guide: 314,117 JPY
        // Unit: 31.4 JPY
        expect(skuResult.costJPY).toBeGreaterThan(310000);
        expect(skuResult.costJPY).toBeLessThan(320000);

        // Explicit Check for 31.4
        const unitPrice = skuResult.costJPY / 10000;
        expect(Math.abs(unitPrice - 31.4)).toBeLessThan(1.0); // Strict check
    });

    test('05-Stand-up Pouch 10,000 count (2-up)', () => {
        // Scenario from 05-스탠드파우치_시나리오.md
        const params: SKUCostParams = {
            pouchType: 'stand_up',
            dimensions: {
                width: 100, // Pitch
                height: 150,
                depth: 30 // Gusset
            },
            skuQuantities: [10000],
            materialId: 'PET/AL/PET/LLDPE',
            thicknessSelection: 'medium',
            filmLayers: [
                { materialId: 'PET', thickness: 12 },
                { materialId: 'AL', thickness: 7 },
                { materialId: 'PET', thickness: 12 },
                { materialId: 'LLDPE', thickness: 90 }
            ],
            postProcessingOptions: []
        };

        const result = calculator.calculateSKUCost(params);
        const skuResult = result.costPerSKU[0];

        console.log('--- Stand-up Result ---');
        console.log('Film Width:', result.calculatedFilmWidth);
        console.log('Material Width:', result.materialWidth);
        console.log('Total Meters:', result.summary.totalWithLossMeters);
        console.log('Unit Price JPY:', skuResult.costJPY / 10000);

        // Validation
        // Guide Width: 700mm -> 2-up adopted.
        expect(result.calculatedFilmWidth).toBe(700);
        expect(result.materialWidth).toBe(760);

        // Guide Unit Price: 32.4 JPY
        const unitPrice = skuResult.costJPY / 10000;
        expect(Math.abs(unitPrice - 32.4)).toBeLessThan(1.5);
    });
});
