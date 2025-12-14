
import { PricingParams, PricingResult } from './types';
import { CONSTANTS } from './constants';

export class PricingEngine {
    calculate(params: PricingParams & { isUVPrinting?: boolean }): PricingResult {
        const { bagTypeId, materialId, width, height, quantity, isUVPrinting } = params;

        // 1. Determine Fixed Cost & Surcharge
        const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('hirabukuro');
        let fixedCost = 0;
        let surcharge = 0;

        if (isUVPrinting) {
            // UV Printing Logic (Replaces Base Fixed + Surcharge)
            fixedCost = CONSTANTS.UV_PRINTING_FIXED_COST;
            surcharge = quantity < CONSTANTS.SMALL_LOT_THRESHOLD ? CONSTANTS.UV_PRINTING_SURCHARGE : 0;
        } else {
            // Base Logic
            fixedCost = isFlat ? CONSTANTS.FLAT_BAG_FIXED_COST : CONSTANTS.STANDING_BAG_FIXED_COST;
            // Only apply massive surcharge for Flat Bags < 3000 (Standing Pouch seems to have it built-in or different)
            if (isFlat && quantity < CONSTANTS.SMALL_LOT_THRESHOLD) {
                surcharge = CONSTANTS.SMALL_LOT_SURCHARGE;
            }
        }

        // 2. Determine Material Rate
        // Heuristic mapping based on materialId string
        let materialRate = CONSTANTS.MATERIAL_RATES['OPP_Alu']; // Default
        const matId = materialId.toLowerCase();

        if (matId.includes('kraft')) {
            materialRate = CONSTANTS.MATERIAL_RATES['Kraft_PE'];
        } else if (matId.includes('vapor') || matId.includes('vmpet')) {
            materialRate = CONSTANTS.MATERIAL_RATES['Alu_Vapor'];
        } else if (matId.includes('pet') && !matId.includes('alu')) {
            materialRate = CONSTANTS.MATERIAL_RATES['PET'];
        }

        // 3. Calculate Variable Cost
        const area = width * height;
        const processingFee = isFlat ? CONSTANTS.FLAT_PROCESSING_FEE : CONSTANTS.STANDING_PROCESSING_FEE;
        const variableCostPerUnit = processingFee + (area * materialRate);

        // 4. Total
        const total = fixedCost + (variableCostPerUnit * quantity) + surcharge;

        if (isNaN(total) || !isFinite(total)) {
            console.error('PricingEngine Error: Invalid calculation result', { fixedCost, variableCostPerUnit, quantity, surcharge, total });
            return {
                totalPrice: 0,
                unitPrice: 0,
                details: { fixedCost, variableCostPerUnit, surcharge, materialRate, area }
            };
        }

        return {
            totalPrice: Math.round(total),
            unitPrice: Math.round(total / quantity * 100) / 100,
            details: {
                fixedCost,
                variableCostPerUnit,
                surcharge,
                materialRate,
                area
            }
        };
    }
}
