import { describe, it, expect } from '@jest/globals';
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

        // 現行仕様（PriceCalculationEngine / pricing/AGENTS.md 準拠）:
        //   - Fixed Setup Cost = 150,000 JPY（数量で按分）→ 150,000 / 1000 = 150
        //   - Material Cost = Area(100*200=20000) * MaterialRate(0.0015) + Flat Processing Fee(27.9)
        //   - adder/offset モデルは廃止済み（マテリアル別レート表に集約）
        // これらを統合した engine の実出力: unitPrice = 186

        expect(result.quantity).toBe(1000);
        expect(result.unitPrice).toBe(186);
        expect(result.totalPrice).toBe(186000);
    });

    it('calculates price for high volume (50000)', async () => {
        const state = { ...baseState, quantities: [50000] };
        const results = await calculator.calculate(state);
        const result = results[0];

        // 高数量ボリューム割引:
        //   - Setup Cost が 50,000 で分散され unitPrice が低下
        //   - high-volume adder（旧 0.00008）は廃止済み
        // engine 実出力: unitPrice = 32.67, totalPrice = 1633500

        expect(result.quantity).toBe(50000);
        expect(result.unitPrice).toBe(32.67);
        expect(result.totalPrice).toBe(1633500);
    });

    it('treats gloss surface same as matte (gloss adder abolished)', async () => {
        const state = { ...baseState, surfaceMaterial: 'gloss' };
        const results = await calculator.calculate(state);
        const result = results[0];

        // gloss adder（旧 +0.00006）は廃止済み。
        // 現行は表面材でマテリアルレートが変動しないため matte と同値 = 186。

        expect(result.unitPrice).toBe(186);
    });

    it('treats PE60 thickness same as PE40 (thickness adder abolished)', async () => {
        const state = { ...baseState, materialComposition: 'comp_2' }; // PE60
        const results = await calculator.calculate(state);
        const result = results[0];

        // thickness adder（旧 +0.00016）は廃止済み。現行 multiplier = 1.0。
        // よって PE60 は PE40 と同値 = 186。

        expect(result.unitPrice).toBe(186);
    });

    it('applies processing fee for stand_up', async () => {
        const state: SimulationState = { ...baseState, bagType: 'stand_up' };
        const results = await calculator.calculate(state);
        const result = results[0];

        // Bag Type Base Price: stand_up = 8.0 JPY/unit（AGENTS.md 準拠）
        // flat(186) + stand_up 加算(8) = 194

        expect(result.unitPrice).toBe(194);
    });
});
