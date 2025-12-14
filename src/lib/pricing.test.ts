import { describe, it, expect } from 'vitest';
import { PriceCalculator } from './pricing';
import { SimulationState } from '@/types/simulation';

describe('PriceCalculator', () => {
    const calculator = new PriceCalculator();

    const baseState: SimulationState = {
        orderType: 'new',
        bagType: 'flat_3_side',
        width: 100,
        height: 200,
        materialGenre: 'opp_al',
        surfaceMaterial: 'matte',
        materialComposition: 'comp_1', // PE40
        contentsType: 'solid',
        quantities: [1000],
        deliveryDate: undefined
    };

    it('calculates price for standard quantity (1000)', async () => {
        const results = await calculator.calculate(baseState);
        expect(results).toHaveLength(1);
        const result = results[0];

        // Manual calculation check:
        // Area = 100 * 200 = 20000
        // Rate = 0.0015 (Base) + 0 (Matte) + 0 (PE40) = 0.0015
        // Material Cost = 20000 * 0.0015 = 30
        // Setup = 150000 / 1000 = 150
        // Processing = 0
        // Offset = -3
        // Total = 150 + 30 + 0 - 3 = 177

        expect(result.quantity).toBe(1000);
        expect(result.unitPrice).toBe(177);
        expect(result.totalPrice).toBe(177000);
    });

    it('calculates price for high volume (50000)', async () => {
        const state = { ...baseState, quantities: [50000] };
        const results = await calculator.calculate(state);
        const result = results[0];

        // High Volume Logic:
        // Setup = 200000 / 50000 = 4
        // Rate = 0.0015 + 0.00008 = 0.00158
        // Material Cost = 20000 * 0.00158 = 31.6
        // Processing = 0
        // Offset = 0
        // Total = 4 + 31.6 + 0 + 0 = 35.6

        expect(result.quantity).toBe(50000);
        expect(result.unitPrice).toBe(35.6);
        expect(result.totalPrice).toBe(1780000);
    });

    it('applies gloss adder correctly', async () => {
        const state = { ...baseState, surfaceMaterial: 'gloss' };
        const results = await calculator.calculate(state);
        const result = results[0];

        // Rate = 0.0015 + 0.00006 = 0.00156
        // Material Cost = 20000 * 0.00156 = 31.2
        // Setup = 150
        // Offset = -3
        // Total = 150 + 31.2 - 3 = 178.2

        expect(result.unitPrice).toBe(178.2);
    });

    it('applies thickness adder correctly (PE60)', async () => {
        const state = { ...baseState, materialComposition: 'comp_2' }; // PE60
        const results = await calculator.calculate(state);
        const result = results[0];

        // Rate = 0.0015 + 0.00016 = 0.00166
        // Material Cost = 20000 * 0.00166 = 33.2
        // Setup = 150
        // Offset = -3
        // Total = 150 + 33.2 - 3 = 180.2

        expect(result.unitPrice).toBe(180.2);
    });

    it('applies processing fee for stand_up', async () => {
        const state: SimulationState = { ...baseState, bagType: 'stand_up' };
        const results = await calculator.calculate(state);
        const result = results[0];

        // Base (177) + Processing (8) = 185
        expect(result.unitPrice).toBe(185);
    });
});
