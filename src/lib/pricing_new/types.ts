
export interface PricingParams {
    bagTypeId: string;
    materialId: string;
    width: number;
    height: number;
    quantity: number;
}

export interface PricingResult {
    totalPrice: number;
    unitPrice: number;
    details: {
        fixedCost: number;
        variableCostPerUnit: number;
        surcharge: number;
        materialRate: number;
        area: number;
    };
}
