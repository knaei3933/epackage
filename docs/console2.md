forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
QuoteContext.tsx:272 [QuoteContext] initialState created: {materialWidth: 590, filmLayers: Array(4), filmLayersCount: 4}
site.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.
QuoteContext.tsx:1642 [QuoteProvider] State updated: {materialWidth: 590, filmLayers: Array(4), filmLayersCount: 4, materialId: 'pet_al'}
AuthContext.tsx:223 [AuthContext] Initializing auth context...
AuthContext.tsx:149 [AuthContext] Fetching session from /api/auth/current-user... {fetchId: 1}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
AuthContext.tsx:174 [AuthContext] Session updated successfully {fetchId: 1}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
ImprovedQuotingWizard.tsx:4013 [RealTimePriceDisplay] Auth ready, user detected: 54fd7b31-b805-43cf-b92e-898ddd066875
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
site.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:36.313Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|500|[500]|medium|1.0|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 200,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 500,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 500}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 150}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 150, lossMeters: 400, totalWithLossMeters: 550, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
pouch-cost-calculator.ts:303 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 550}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 136444.462, totalWeight: 37.77829, totalCostRounded: 136444}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 550, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 136444, printingCost: 264000, laminationCost: 73986, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 500, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 500, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 500, quantityRatio: '100.0%', allocatedFilmCostKRW: 504430, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 504430, pouchProcessingCostKRW: 200000, baseCostKRW: 704430, quantity: 500, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 704430, salesMargin: 0.3, customerMarkupRate: 0, quantity: 500, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 704430,
  "manufacturerPriceKRW": 915759,
  "manufacturerPriceJPY": 109891.08,
  "dutyJPY": 5494.554,
  "deliveryJPY": 15358,
  "subtotalJPY": 130743.634,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 169966.72420000003,
  "salesMarginJPY": 39223.09020000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 169966.72420000003
}
pouch-cost-calculator.ts:1258 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 169966, roundedFinalPriceJPY: 169967, difference: -1}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 169966.72420000003
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 3.7722825000000006, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 169966.32420000003 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 170000 (差分: 33.67579999996815 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 169966.32420000003 / 100) * 100 = 1700 * 100 = 170000
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 170000 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:37.119Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|1000|[1000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 200,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 1000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 1000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 300}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 300, lossMeters: 400, totalWithLossMeters: 700, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 700}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 173656.58800000002, totalWeight: 48.08146000000001, totalCostRounded: 173657}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 700, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 173657, printingCost: 336000, laminationCost: 94164, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 1000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 1000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 1000, quantityRatio: '100.0%', allocatedFilmCostKRW: 633821, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 633821, pouchProcessingCostKRW: 200000, baseCostKRW: 833821, quantity: 1000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 833821, salesMargin: 0.3, customerMarkupRate: 0, quantity: 1000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 833821,
  "manufacturerPriceKRW": 1083967.3,
  "manufacturerPriceJPY": 130076.076,
  "dutyJPY": 6503.803800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 151937.8798,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 197519.24374,
  "salesMarginJPY": 45581.36394000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 197519.24374
}
pouch-cost-calculator.ts:1258 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 197520, roundedFinalPriceJPY: 197519, difference: 1}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 197519.24374
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 7.544565000000001, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 197518.84374 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 197600 (差分: 81.15625999998883 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 197518.84374 / 100) * 100 = 1976 * 100 = 197600
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 197600 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:37.121Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|2000|[2000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 200,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 2000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 2000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 600}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 600, lossMeters: 400, totalWithLossMeters: 1000, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1000}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 248080.83999999997, totalWeight: 68.6878, totalCostRounded: 248081}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1000, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 248081, printingCost: 480000, laminationCost: 134520, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 2000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 2000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 2000, quantityRatio: '100.0%', allocatedFilmCostKRW: 892601, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 892601, pouchProcessingCostKRW: 200000, baseCostKRW: 1092601, quantity: 2000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1092601, salesMargin: 0.3, customerMarkupRate: 0, quantity: 2000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1092601,
  "manufacturerPriceKRW": 1420381.3,
  "manufacturerPriceJPY": 170445.756,
  "dutyJPY": 8522.2878,
  "deliveryJPY": 15358,
  "subtotalJPY": 194326.04379999998,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 252623.85694,
  "salesMarginJPY": 58297.81314000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 252623.85694
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 252623.85694
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 15.089130000000003, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 252623.45694 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 252700 (差分: 76.54305999999633 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 252623.45694 / 100) * 100 = 2527 * 100 = 252700
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 252700 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:37.124Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|5000|[5000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 200,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 5000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 1500}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 1500, lossMeters: 400, totalWithLossMeters: 1900, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1900}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 471353.596, totalWeight: 130.50682, totalCostRounded: 471354}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1900, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 471354, printingCost: 912000, laminationCost: 255588, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 5000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 5000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 5000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1668942, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1668942, pouchProcessingCostKRW: 200000, baseCostKRW: 1868942, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1868942, salesMargin: 0.3, customerMarkupRate: 0, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1868942,
  "manufacturerPriceKRW": 2429624.6,
  "manufacturerPriceJPY": 291554.952,
  "dutyJPY": 14577.7476,
  "deliveryJPY": 15358,
  "subtotalJPY": 321490.6996,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 417937.90948000003,
  "salesMarginJPY": 96447.20988000004,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 417937.90948000003
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 417937.90948000003
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 37.72282500000001, deliveryBoxes: 2, totalDeliveryJPY: 30715.199999999997, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 433295.10948000004 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 433300 (差分: 4.890519999957178 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 433295.10948000004 / 100) * 100 = 4333 * 100 = 433300
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 433300 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:37.126Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|10000|[10000]|medium|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 200,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 10000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 10000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 3000}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 3000, lossMeters: 400, totalWithLossMeters: 3400, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 3400}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 843474.856, totalWeight: 233.53852, totalCostRounded: 843475}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 3400, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 843475, printingCost: 1632000, laminationCost: 457368, slitterCost: 37400, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 10000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 10000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 10000, quantityRatio: '100.0%', allocatedFilmCostKRW: 2970243, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 2970243, pouchProcessingCostKRW: 200000, baseCostKRW: 3170243, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 3170243, salesMargin: 0.3, customerMarkupRate: 0, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 3170243,
  "manufacturerPriceKRW": 4121315.9000000004,
  "manufacturerPriceJPY": 494557.90800000005,
  "dutyJPY": 24727.895400000005,
  "deliveryJPY": 15358,
  "subtotalJPY": 534643.8034000001,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 695036.9444200002,
  "salesMarginJPY": 160393.1410200001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 695036.9444200002
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 695036.9444200002
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 75.44565000000001, deliveryBoxes: 3, totalDeliveryJPY: 46072.799999999996, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 725751.7444200002 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 725800 (差分: 48.25557999976445 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 725751.7444200002 / 100) * 100 = 7258 * 100 = 725800
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 725800 円
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
QuoteContext.tsx:1653 [updateBasicSpecs] Called with specs: {width: 1}
QuoteContext.tsx:1654 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 1, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 1, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1653 [updateBasicSpecs] Called with specs: {width: 13}
QuoteContext.tsx:1654 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 13, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 13, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1653 [updateBasicSpecs] Called with specs: {width: 130}
QuoteContext.tsx:1654 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 300, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
QuoteContext.tsx:1653 [updateBasicSpecs] Called with specs: {height: 1}
QuoteContext.tsx:1654 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 1, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: false, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 1, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: false, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:52.310Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|13|300|0|500|[500]|medium|1.0|f…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 13,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 500,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 500}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 150}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 150, lossMeters: 400, totalWithLossMeters: 550, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 550}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
 [calculateMaterialCost] RESULT: {totalCost: 136444.462, totalWeight: 37.77829, totalCostRounded: 136444}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 550, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 136444, printingCost: 264000, laminationCost: 73986, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 1.3, quantity: 500, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 500, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 500, quantityRatio: '100.0%', allocatedFilmCostKRW: 504430, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 504430, pouchProcessingCostKRW: 200000, baseCostKRW: 704430, quantity: 500, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 704430, salesMargin: 0.3, customerMarkupRate: 0, quantity: 500, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 704430,
  "manufacturerPriceKRW": 915759,
  "manufacturerPriceJPY": 109891.08,
  "dutyJPY": 5494.554,
  "deliveryJPY": 15358,
  "subtotalJPY": 130743.634,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 169966.72420000003,
  "salesMarginJPY": 39223.09020000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 169966.72420000003
}
 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 169966, roundedFinalPriceJPY: 169967, difference: -1}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 169966.72420000003
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 0.491274, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 169966.32420000003 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 170000 (差分: 33.67579999996815 )
 [100円丸め] 計算式: Math.ceil( 169966.32420000003 / 100) * 100 = 1700 * 100 = 170000
 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 170000 円
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:52.312Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|13|300|0|1000|[1000]|medium|1.0…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 13,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 1000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 1000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 300}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 300, lossMeters: 400, totalWithLossMeters: 700, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 700}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
 [calculateMaterialCost] RESULT: {totalCost: 173656.58800000002, totalWeight: 48.08146000000001, totalCostRounded: 173657}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 700, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 173657, printingCost: 336000, laminationCost: 94164, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 1.3, quantity: 1000, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 1000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 1000, quantityRatio: '100.0%', allocatedFilmCostKRW: 633821, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 633821, pouchProcessingCostKRW: 200000, baseCostKRW: 833821, quantity: 1000, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 833821, salesMargin: 0.3, customerMarkupRate: 0, quantity: 1000, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 833821,
  "manufacturerPriceKRW": 1083967.3,
  "manufacturerPriceJPY": 130076.076,
  "dutyJPY": 6503.803800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 151937.8798,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 197519.24374,
  "salesMarginJPY": 45581.36394000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 197519.24374
}
 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 197520, roundedFinalPriceJPY: 197519, difference: 1}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 197519.24374
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 0.982548, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 197518.84374 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 197600 (差分: 81.15625999998883 )
 [100円丸め] 計算式: Math.ceil( 197518.84374 / 100) * 100 = 1976 * 100 = 197600
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 197600 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:52.313Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|13|300|0|2000|[2000]|medium|1.0…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 13,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 2000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 2000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 600}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 600, lossMeters: 400, totalWithLossMeters: 1000, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1000}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
 [calculateMaterialCost] RESULT: {totalCost: 248080.83999999997, totalWeight: 68.6878, totalCostRounded: 248081}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1000, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 248081, printingCost: 480000, laminationCost: 134520, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 1.3, quantity: 2000, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 2000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 2000, quantityRatio: '100.0%', allocatedFilmCostKRW: 892601, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 892601, pouchProcessingCostKRW: 200000, baseCostKRW: 1092601, quantity: 2000, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1092601, salesMargin: 0.3, customerMarkupRate: 0, quantity: 2000, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1092601,
  "manufacturerPriceKRW": 1420381.3,
  "manufacturerPriceJPY": 170445.756,
  "dutyJPY": 8522.2878,
  "deliveryJPY": 15358,
  "subtotalJPY": 194326.04379999998,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 252623.85694,
  "salesMarginJPY": 58297.81314000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 252623.85694
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 252623.85694
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 1.965096, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 252623.45694 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 252700 (差分: 76.54305999999633 )
 [100円丸め] 計算式: Math.ceil( 252623.45694 / 100) * 100 = 2527 * 100 = 252700
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 252700 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:52.315Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|13|300|0|5000|[5000]|medium|1.0…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 13,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 5000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 1500}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 1500, lossMeters: 400, totalWithLossMeters: 1900, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1900}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 471353.596, totalWeight: 130.50682, totalCostRounded: 471354}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1900, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 471354, printingCost: 912000, laminationCost: 255588, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 1.3, quantity: 5000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 5000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 5000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1668942, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1668942, pouchProcessingCostKRW: 200000, baseCostKRW: 1868942, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1868942, salesMargin: 0.3, customerMarkupRate: 0, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1868942,
  "manufacturerPriceKRW": 2429624.6,
  "manufacturerPriceJPY": 291554.952,
  "dutyJPY": 14577.7476,
  "deliveryJPY": 15358,
  "subtotalJPY": 321490.6996,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 417937.90948000003,
  "salesMarginJPY": 96447.20988000004,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 417937.90948000003
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 417937.90948000003
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 4.912739999999999, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 417937.50948 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 418000 (差分: 62.4905199999921 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 417937.50948 / 100) * 100 = 4180 * 100 = 418000
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 418000 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:52.316Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|13|300|0|10000|[10000]|medium|1…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 13,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 10000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 300, columnCount: 1, quantity: 10000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 3.3333333333333335, result: 3000}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 3000, lossMeters: 400, totalWithLossMeters: 3400, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 3400}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 843474.856, totalWeight: 233.53852, totalCostRounded: 843475}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 3400, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 843475, printingCost: 1632000, laminationCost: 457368, slitterCost: 37400, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 1.3, quantity: 10000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 10000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 10000, quantityRatio: '100.0%', allocatedFilmCostKRW: 2970243, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 2970243, pouchProcessingCostKRW: 200000, baseCostKRW: 3170243, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 3170243, salesMargin: 0.3, customerMarkupRate: 0, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 3170243,
  "manufacturerPriceKRW": 4121315.9000000004,
  "manufacturerPriceJPY": 494557.90800000005,
  "dutyJPY": 24727.895400000005,
  "deliveryJPY": 15358,
  "subtotalJPY": 534643.8034000001,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 695036.9444200002,
  "salesMarginJPY": 160393.1410200001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 695036.9444200002
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 695036.9444200002
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 9.825479999999999, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 695036.5444200002 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 695100 (差分: 63.4555799998343 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 695036.5444200002 / 100) * 100 = 6951 * 100 = 695100
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 695100 円
QuoteContext.tsx:1653 [updateBasicSpecs] Called with specs: {height: 17}
QuoteContext.tsx:1654 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 17, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: false, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 17, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: false, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1653 [updateBasicSpecs] Called with specs: {height: 170}
QuoteContext.tsx:1654 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:53.962Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|500|[500]|medium|1.0|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 500,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 500}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 85}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 85, lossMeters: 400, totalWithLossMeters: 485, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 485}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
 [calculateMaterialCost] RESULT: {totalCost: 120319.20739999998, totalWeight: 33.313583, totalCostRounded: 120319}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 485, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 120319, printingCost: 232800, laminationCost: 65242, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 500, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 500, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 500, quantityRatio: '100.0%', allocatedFilmCostKRW: 448361, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 448361, pouchProcessingCostKRW: 200000, baseCostKRW: 648361, quantity: 500, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 648361, salesMargin: 0.3, customerMarkupRate: 0, quantity: 500, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 648361,
  "manufacturerPriceKRW": 842869.3,
  "manufacturerPriceJPY": 101144.316,
  "dutyJPY": 5057.215800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 121559.53180000001,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 158027.39134000003,
  "salesMarginJPY": 36467.85954000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 158027.39134000003
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 158027.39134000003
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 1.44165525, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 158026.99134000004 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 158100 (差分: 73.00865999996313 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 158026.99134000004 / 100) * 100 = 1581 * 100 = 158100
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 158100 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:53.965Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|1000|[1000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 1000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 1000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 170}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 170, lossMeters: 400, totalWithLossMeters: 570, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 570}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 141406.0788, totalWeight: 39.152046, totalCostRounded: 141406}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 570, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 141406, printingCost: 273600, laminationCost: 76676, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 1000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 1000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 1000, quantityRatio: '100.0%', allocatedFilmCostKRW: 521682, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 521682, pouchProcessingCostKRW: 200000, baseCostKRW: 721682, quantity: 1000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 721682, salesMargin: 0.3, customerMarkupRate: 0, quantity: 1000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 721682,
  "manufacturerPriceKRW": 938186.6,
  "manufacturerPriceJPY": 112582.39199999999,
  "dutyJPY": 5629.1196,
  "deliveryJPY": 15358,
  "subtotalJPY": 133569.5116,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 173640.36508000002,
  "salesMarginJPY": 40070.85348000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 173640.36508000002
}
pouch-cost-calculator.ts:1258 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 173641, roundedFinalPriceJPY: 173640, difference: 1}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 173640.36508000002
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 2.8833105, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 173639.96508000002 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 173700 (差分: 60.03491999997641 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 173639.96508000002 / 100) * 100 = 1737 * 100 = 173700
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 173700 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:53.967Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|2000|[2000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 2000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 2000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 340}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 340, lossMeters: 400, totalWithLossMeters: 740, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 740}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 183579.82160000002, totalWeight: 50.828972, totalCostRounded: 183580}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 740, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 183580, printingCost: 355200, laminationCost: 99545, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 2000, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 2000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 2000, quantityRatio: '100.0%', allocatedFilmCostKRW: 668325, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 668325, pouchProcessingCostKRW: 200000, baseCostKRW: 868325, quantity: 2000, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 868325, salesMargin: 0.3, customerMarkupRate: 0, quantity: 2000, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 868325,
  "manufacturerPriceKRW": 1128822.5,
  "manufacturerPriceJPY": 135458.69999999998,
  "dutyJPY": 6772.9349999999995,
  "deliveryJPY": 15358,
  "subtotalJPY": 157589.63499999998,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 204866.5255,
  "salesMarginJPY": 47276.89050000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 204866.5255
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 204866.5255
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 5.766621, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 204866.1255 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 204900 (差分: 33.874500000005355 )
 [100円丸め] 計算式: Math.ceil( 204866.1255 / 100) * 100 = 2049 * 100 = 204900
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 204900 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:53.969Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|5000|[5000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 5000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 849.9999999999999}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 850, lossMeters: 400, totalWithLossMeters: 1250, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1250}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 310101.05000000005, totalWeight: 85.85975000000002, totalCostRounded: 310101}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1250, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 310101, printingCost: 600000, laminationCost: 168150, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 5000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 5000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 5000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1108251, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1108251, pouchProcessingCostKRW: 200000, baseCostKRW: 1308251, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1308251, salesMargin: 0.3, customerMarkupRate: 0, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1308251,
  "manufacturerPriceKRW": 1700726.3,
  "manufacturerPriceJPY": 204087.156,
  "dutyJPY": 10204.3578,
  "deliveryJPY": 15358,
  "subtotalJPY": 229649.5138,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 298544.36793999997,
  "salesMarginJPY": 68894.85413999998,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 298544.36793999997
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 298544.36793999997
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 14.416552499999998, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 298543.96793999994 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 298600 (差分: 56.032060000055935 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 298543.96793999994 / 100) * 100 = 2986 * 100 = 298600
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 298600 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:53.972Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|10000|[10000]|medium|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 10000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 10000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 1699.9999999999998}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 1700, lossMeters: 400, totalWithLossMeters: 2100, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 2100}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 520969.76399999997, totalWeight: 144.24437999999998, totalCostRounded: 520970}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 2100, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 520970, printingCost: 1008000, laminationCost: 282492, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 10000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 10000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 10000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1841462, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1841462, pouchProcessingCostKRW: 200000, baseCostKRW: 2041462, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 2041462, salesMargin: 0.3, customerMarkupRate: 0, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 2041462,
  "manufacturerPriceKRW": 2653900.6,
  "manufacturerPriceJPY": 318468.072,
  "dutyJPY": 15923.4036,
  "deliveryJPY": 15358,
  "subtotalJPY": 349749.4756,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 454674.31828,
  "salesMarginJPY": 104924.84268,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 454674.31828
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 454674.31828
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 28.833104999999996, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 454673.91828 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 454700 (差分: 26.081720000016503 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 454673.91828 / 100) * 100 = 4547 * 100 = 454700
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 454700 円
QuoteContext.tsx:1653 [updateBasicSpecs] Called with specs: {thicknessSelection: 'standard'}
QuoteContext.tsx:1654 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:502 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1244 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
QuoteContext.tsx:1642 [QuoteProvider] State updated: {materialWidth: 590, filmLayers: Array(4), filmLayersCount: 4, materialId: 'pet_al'}
useKeyboardNavigation.ts:57 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
useKeyboardNavigation.ts:60 [useKeyboardNavigation] Calling onNext handler
 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
 [checkStepComplete] post-processing incomplete: {selectedCount: 0, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(0)}
 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
 [checkStepComplete] post-processing incomplete: {selectedCount: 0, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(0)}
 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:57.580Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|500|[500]|standard|1.…terialId":"LLDPE","thickness":90}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 500,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 500}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 85}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 85, lossMeters: 400, totalWithLossMeters: 485, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'standard', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 485}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 90, effectiveThickness: 90, thicknessMm: 0.09, …}
 [calculateMaterialCost] RESULT: {totalCost: 135061.6554, totalWeight: 38.578742999999996, totalCostRounded: 135062}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 485, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 135062, printingCost: 232800, laminationCost: 65242, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 500, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 500, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 500, quantityRatio: '100.0%', allocatedFilmCostKRW: 463104, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 463104, pouchProcessingCostKRW: 200000, baseCostKRW: 663104, quantity: 500, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 663104, salesMargin: 0.3, customerMarkupRate: 0, quantity: 500, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 663104,
  "manufacturerPriceKRW": 862035.2000000001,
  "manufacturerPriceJPY": 103444.224,
  "dutyJPY": 5172.211200000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 123974.4352,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 161166.76576,
  "salesMarginJPY": 37192.33056,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 161166.76576
}
 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 161166, roundedFinalPriceJPY: 161167, difference: -1}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 161166.76576
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 1.6684352500000001, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 161166.36576000002 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 161200 (差分: 33.63423999998486 )
 [100円丸め] 計算式: Math.ceil( 161166.36576000002 / 100) * 100 = 1612 * 100 = 161200
 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 161200 円
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:57.582Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|1000|[1000]|standard|…terialId":"LLDPE","thickness":90}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 1000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 1000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 170}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 170, lossMeters: 400, totalWithLossMeters: 570, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'standard', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 570}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 90, effectiveThickness: 90, thicknessMm: 0.09, …}
 [calculateMaterialCost] RESULT: {totalCost: 158732.2548, totalWeight: 45.33996599999999, totalCostRounded: 158732}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 570, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 158732, printingCost: 273600, laminationCost: 76676, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 1000, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 1000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 1000, quantityRatio: '100.0%', allocatedFilmCostKRW: 539008, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 539008, pouchProcessingCostKRW: 200000, baseCostKRW: 739008, quantity: 1000, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 739008, salesMargin: 0.3, customerMarkupRate: 0, quantity: 1000, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 739008,
  "manufacturerPriceKRW": 960710.4,
  "manufacturerPriceJPY": 115285.24799999999,
  "dutyJPY": 5764.2624,
  "deliveryJPY": 15358,
  "subtotalJPY": 136407.5104,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 177329.76352,
  "salesMarginJPY": 40922.25312000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 177329.76352
}
 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 177329, roundedFinalPriceJPY: 177330, difference: -1}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 177329.76352
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 3.3368705000000003, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 177329.36352 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 177400 (差分: 70.63647999998648 )
 [100円丸め] 計算式: Math.ceil( 177329.36352 / 100) * 100 = 1774 * 100 = 177400
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 177400 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:57.584Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|2000|[2000]|standard|…terialId":"LLDPE","thickness":90}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 2000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 2000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 340}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 340, lossMeters: 400, totalWithLossMeters: 740, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'standard', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 740}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 90, effectiveThickness: 90, thicknessMm: 0.09, …}
 [calculateMaterialCost] RESULT: {totalCost: 206073.4536, totalWeight: 58.862412, totalCostRounded: 206073}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 740, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 206073, printingCost: 355200, laminationCost: 99545, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 2000, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 2000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 2000, quantityRatio: '100.0%', allocatedFilmCostKRW: 690818, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 690818, pouchProcessingCostKRW: 200000, baseCostKRW: 890818, quantity: 2000, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 890818, salesMargin: 0.3, customerMarkupRate: 0, quantity: 2000, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 890818,
  "manufacturerPriceKRW": 1158063.4000000001,
  "manufacturerPriceJPY": 138967.608,
  "dutyJPY": 6948.380400000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 161273.9884,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 209656.18492,
  "salesMarginJPY": 48382.19652,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 209656.18492
}
 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 209655, roundedFinalPriceJPY: 209656, difference: -1}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 209656.18492
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 6.673741000000001, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
 【SKU後加工オプション】
 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 209655.78492 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 209700 (差分: 44.21507999999449 )
 [100円丸め] 計算式: Math.ceil( 209655.78492 / 100) * 100 = 2097 * 100 = 209700
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 209700 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:57.586Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|5000|[5000]|standard|…terialId":"LLDPE","thickness":90}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 5000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 849.9999999999999}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 850, lossMeters: 400, totalWithLossMeters: 1250, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'standard', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1250}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 90, effectiveThickness: 90, thicknessMm: 0.09, …}
 [calculateMaterialCost] RESULT: {totalCost: 348097.05, totalWeight: 99.42975000000001, totalCostRounded: 348097}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1250, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 348097, printingCost: 600000, laminationCost: 168150, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 5000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 5000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 5000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1146247, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1146247, pouchProcessingCostKRW: 200000, baseCostKRW: 1346247, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1346247, salesMargin: 0.3, customerMarkupRate: 0, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1346247,
  "manufacturerPriceKRW": 1750121.1,
  "manufacturerPriceJPY": 210014.532,
  "dutyJPY": 10500.726600000002,
  "deliveryJPY": 15358,
  "subtotalJPY": 235873.2586,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 306635.23618,
  "salesMarginJPY": 70761.97758,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 306635.23618
}
pouch-cost-calculator.ts:1258 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 306636, roundedFinalPriceJPY: 306635, difference: 1}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 306635.23618
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 16.6843525, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 306634.83618 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 306700 (差分: 65.16382000001613 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 306634.83618 / 100) * 100 = 3067 * 100 = 306700
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 306700 円
ImprovedQuotingWizard.tsx:4069 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:58:57.588Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|10000|[10000]|standar…terialId":"LLDPE","thickness":90}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 10000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 10000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 1699.9999999999998}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 1700, lossMeters: 400, totalWithLossMeters: 2100, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'standard', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 2100}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 90, effectiveThickness: 90, thicknessMm: 0.09, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 584803.044, totalWeight: 167.04197999999997, totalCostRounded: 584803}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 2100, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:726 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 584803, printingCost: 1008000, laminationCost: 282492, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 10000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 10000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 10000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1905295, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1905295, pouchProcessingCostKRW: 200000, baseCostKRW: 2105295, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 2105295, salesMargin: 0.3, customerMarkupRate: 0, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 2105295,
  "manufacturerPriceKRW": 2736883.5,
  "manufacturerPriceJPY": 328426.01999999996,
  "dutyJPY": 16421.301,
  "deliveryJPY": 15358,
  "subtotalJPY": 360205.32099999994,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 468266.9172999999,
  "salesMarginJPY": 108061.59629999998,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 468266.9172999999
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 468266.9172999999
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 33.368705, deliveryBoxes: 2, totalDeliveryJPY: 30715.199999999997, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1465 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 483624.1172999999 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 483700 (差分: 75.88270000007469 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 483624.1172999999 / 100) * 100 = 4837 * 100 = 483700
ImprovedQuotingWizard.tsx:4100 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 483700 円
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: zipper-yes Current options: []
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: zipper
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: []
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: ['zipper-yes']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.15
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: ['zipper-yes'] payload.multiplier: 1.15
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: ['zipper-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: [{…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.15 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: ['zipper-yes'] payload.multiplier: 1.15
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: ['zipper-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: [{…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.15 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 1, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(1)}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 1, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(1)}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: matte Current options: ['zipper-yes']
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: finish
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: ['zipper-yes']
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: (2) ['zipper-yes', 'matte']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.2
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (2) ['zipper-yes', 'matte'] payload.multiplier: 1.2
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (2) ['zipper-yes', 'matte']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: [{…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.2 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (2) ['matte', 'zipper-yes'] payload.multiplier: 1.2
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (2) ['matte', 'zipper-yes']
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: [{…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.2 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 2, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(2)}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 2, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(2)}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: notch-straight Current options: (2) ['matte', 'zipper-yes']
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: notch
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: (2) ['matte', 'zipper-yes']
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: (3) ['matte', 'zipper-yes', 'notch-straight']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.22
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (3) ['matte', 'zipper-yes', 'notch-straight'] payload.multiplier: 1.22
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (3) ['matte', 'zipper-yes', 'notch-straight']
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (2) [{…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.22 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (3) ['matte', 'notch-straight', 'zipper-yes'] payload.multiplier: 1.22
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (3) ['matte', 'notch-straight', 'zipper-yes']
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (2) [{…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.22 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 3, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(3)}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 3, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(3)}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: hang-hole-8mm Current options: (3) ['matte', 'notch-straight', 'zipper-yes']
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: hang-hole
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: (3) ['matte', 'notch-straight', 'zipper-yes']
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: (4) ['matte', 'notch-straight', 'zipper-yes', 'hang-hole-8mm']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.26
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (4) ['matte', 'notch-straight', 'zipper-yes', 'hang-hole-8mm'] payload.multiplier: 1.26
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (4) ['matte', 'notch-straight', 'zipper-yes', 'hang-hole-8mm']
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (3) [{…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.26 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (4) ['hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes'] payload.multiplier: 1.26
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (4) ['hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (3) [{…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.26 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 4, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(4)}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 4, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(4)}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: corner-square Current options: (4) ['hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes']
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: corner
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: (4) ['hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes']
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: (5) ['hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'corner-square']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.26
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (5) ['hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'corner-square'] payload.multiplier: 1.26
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (5) ['hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'corner-square']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (4) [{…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.26 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (5) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes'] payload.multiplier: 1.26
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (5) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (4) [{…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.26 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 5, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(5)}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 5, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(5)}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: valve-yes Current options: (5) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes']
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: valve
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: (5) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes']
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: (6) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'valve-yes']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.34
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (6) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'valve-yes'] payload.multiplier: 1.34
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (6) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'valve-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-yes (バルブあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (5) [{…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.34 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (6) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes'] payload.multiplier: 1.34
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (6) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-yes (バルブあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (5) [{…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.34 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 6, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(6)}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1335 [checkStepComplete] post-processing incomplete: {selectedCount: 6, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false, currentOptions: Array(6)}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: bottom-open Current options: (6) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes']
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: opening
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: (6) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes']
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: (7) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes', 'bottom-open']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.37
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (7) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes', 'bottom-open'] payload.multiplier: 1.37
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (7) ['corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes', 'bottom-open']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-yes (バルブあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] bottom-open (下端開封): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.37 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes'] payload.multiplier: 1.37
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] bottom-open (下端開封): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-yes (バルブあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.37 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1345 [checkStepComplete] post-processing complete: {selectedCount: 7, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1345 [checkStepComplete] post-processing complete: {selectedCount: 7, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:1620 [handleToggleOption] Clicked option: valve-no Current options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-yes', 'zipper-yes']
ImprovedQuotingWizard.tsx:1627 [handleToggleOption] Category: valve
ImprovedQuotingWizard.tsx:1640 [handleToggleOption] After filter: (6) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes']
ImprovedQuotingWizard.tsx:1649 [handleToggleOption] Final options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'valve-no']
ImprovedQuotingWizard.tsx:1658 [handleToggleOption] Updating with multiplier: 1.29
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'valve-no'] payload.multiplier: 1.29
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'zipper-yes', 'valve-no']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] bottom-open (下端開封): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.29 )
QuoteContext.tsx:558 [SET_POST_PROCESSING] Action received. payload.options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-no', 'zipper-yes'] payload.multiplier: 1.29
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-no', 'zipper-yes']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] bottom-open (下端開封): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-square (角直角): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-8mm (吊り穴 8mm): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] matte excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-straight (直線ノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:607 [SET_POST_PROCESSING] Calculated multiplier: 1 (ignoring payload.multiplier: 1.29 )
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1345 [checkStepComplete] post-processing complete: {selectedCount: 7, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1345 [checkStepComplete] post-processing complete: {selectedCount: 7, requiredGroups: 7, optionalGroups: Array(0), isRollFilm: false}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: undefined, …}
QuoteContext.tsx:1300 [checkStepComplete] sku-quantity single mode valid: true
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: undefined, …}
QuoteContext.tsx:1300 [checkStepComplete] sku-quantity single mode valid: true
UnifiedSKUQuantityStep.tsx:79 [UnifiedSKUQuantityStep] Component mounted, clearing applied discount
UnifiedSKUQuantityStep.tsx:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
UnifiedSKUQuantityStep.tsx:79 [UnifiedSKUQuantityStep] Component mounted, clearing applied discount
UnifiedSKUQuantityStep.tsx:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
QuoteContext.tsx:1077 [CLEAR_APPLIED_OPTION] Clearing applied option
QuoteContext.tsx:1077 [CLEAR_APPLIED_OPTION] Clearing applied option
QuoteContext.tsx:1077 [CLEAR_APPLIED_OPTION] Clearing applied option
QuoteContext.tsx:1077 [CLEAR_APPLIED_OPTION] Clearing applied option
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1300 [checkStepComplete] sku-quantity single mode valid: true
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1300 [checkStepComplete] sku-quantity single mode valid: true
UnifiedSKUQuantityStep.tsx:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1300 [checkStepComplete] sku-quantity single mode valid: true
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1300 [checkStepComplete] sku-quantity single mode valid: true
UnifiedSKUQuantityStep.tsx:275 [UnifiedSKUQuantityStep] Two column options calculated: {baseUnitPrice: 50, totalQuantity: 5000, options: null}
UnifiedSKUQuantityStep.tsx:275 [UnifiedSKUQuantityStep] Two column options calculated: {baseUnitPrice: 50, totalQuantity: 5000, options: null}
UnifiedSKUQuantityStep.tsx:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
UnifiedSKUQuantityStep.tsx:337 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: {bagTypeId: 'flat_3_side', materialId: 'pet_al', skuCount: 1, skuQuantities: Array(1), totalQuantity: 5000, …}
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:59:05.688Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|5000|[5000]|standard|…terialId":"LLDPE","thickness":90}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: undefined, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 5000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 849.9999999999999}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 850, lossMeters: 400, totalWithLossMeters: 1250, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'standard', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1250}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:570 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 90, effectiveThickness: 90, thicknessMm: 0.09, …}
film-cost-calculator.ts:596 [calculateMaterialCost] RESULT: {totalCost: 348097.05, totalWeight: 99.42975000000001, totalCostRounded: 348097}
film-cost-calculator.ts:715 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1250, postProcessingOptions: Array(7), hasGlossy: false, hasMatte: true}
film-cost-calculator.ts:742 [calculateSurfaceTreatmentCost] Matte treatment cost calculated: {widthM: 0.59, MATTE_SURFACE_COST_PER_M: 40, lengthWithLoss: 1250, cost: 29499.999999999996, roundedCost: 29500}
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 348097, printingCost: 629500, laminationCost: 168150, slitterCost: 30000, surfaceTreatmentCost: 29500, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 5000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 5000, skuCount: 1, totalPouchProcessingCostKRW: 250000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 5000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1205247, allocatedPouchProcessingCostKRW: 250000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1205247, pouchProcessingCostKRW: 250000, baseCostKRW: 1455247, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1455247, salesMargin: 0.3, customerMarkupRate: 0, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1455247,
  "manufacturerPriceKRW": 1891821.1,
  "manufacturerPriceJPY": 227018.532,
  "dutyJPY": 11350.9266,
  "deliveryJPY": 15358,
  "subtotalJPY": 253727.4586,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 329845.69618,
  "salesMarginJPY": 76118.23758000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 329845.69618
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 329845.69618
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 16.6843525, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "bottom-open",
    "corner-square",
    "hang-hole-8mm",
    "matte",
    "notch-straight",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": true,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:48 【SKUマット印刷追加費】
unified-pricing-engine.ts:49 {
  "原反幅_m": "0.59m",
  "総使用メートル": "1250m",
  "追加費_KRW": "29,500ウォン",
  "追加費_JPY": "¥3,540"
}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 333385.29618 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 333400 (差分: 14.703819999995176 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 333385.29618 / 100) * 100 = 3334 * 100 = 333400
UnifiedSKUQuantityStep.tsx:382 [UnifiedSKUQuantityStep] Price calculated: {unitPrice: 66.68, totalPrice: 333400, quantity: 5000}
UnifiedSKUQuantityStep.tsx:275 [UnifiedSKUQuantityStep] Two column options calculated: {baseUnitPrice: 66.68, totalQuantity: 5000, options: null}
UnifiedSKUQuantityStep.tsx:275 [UnifiedSKUQuantityStep] Two column options calculated: {baseUnitPrice: 66.68, totalQuantity: 5000, options: null}
useKeyboardNavigation.ts:57 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
useKeyboardNavigation.ts:60 [useKeyboardNavigation] Calling onNext handler
ImprovedQuotingWizard.tsx:4322 [handleNext] Current state: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500}
ImprovedQuotingWizard.tsx:4347 [handleNext] hasValidSKUData Check:
ImprovedQuotingWizard.tsx:4348 [handleNext] - skuCount > 1: false (skuCount = 1 )
ImprovedQuotingWizard.tsx:4349 [handleNext] - skuQuantities exists: true
ImprovedQuotingWizard.tsx:4350 [handleNext] - skuQuantities: [5000]
ImprovedQuotingWizard.tsx:4351 [handleNext] - Length check: 1 === 1 : true
ImprovedQuotingWizard.tsx:4352 [handleNext] - Every check (all >= 100): true
ImprovedQuotingWizard.tsx:4353 [handleNext] - FINAL hasValidSKUData: true
ImprovedQuotingWizard.tsx:4357 [handleNext] SKU mode detected (via hasValidSKUData), quantities: [5000]
ImprovedQuotingWizard.tsx:4361 [handleNext] Setting quantityMode to "sku"
ImprovedQuotingWizard.tsx:4366 [handleNext] Calculated total quantity: 5000
ImprovedQuotingWizard.tsx:4375 [handleNext] Calculating quote for SKU mode, total quantity: 5000
ImprovedQuotingWizard.tsx:4379 [handleNext] デフォルトmarkupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'sku', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1295 [checkStepComplete] sku-quantity SKU mode valid: true
QuoteContext.tsx:1193 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1269 [checkStepComplete] sku-quantity step check: {quantityMode: 'sku', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1295 [checkStepComplete] sku-quantity SKU mode valid: true
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
ImprovedQuotingWizard.tsx:4392 [handleNext] Customer markup rate: 0
ImprovedQuotingWizard.tsx:4401 [handleNext] DIAGNOSTIC - calculateQuote PARAMS: {bagTypeId: 'flat_3_side', materialId: 'pet_al', skuCount: 1, skuQuantities: Array(1), totalQuantity: 5000, …}
unified-pricing-engine.ts:613 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-16T20:59:08.482Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
unified-pricing-engine.ts:646 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|130|170|0|5000|[5000]|standard|…terialId":"LLDPE","thickness":90}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:657 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1321 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1344 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:466 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 130,
    "height": 170,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 381,
  "note": "パウチ: 1列生産"
}
pouch-cost-calculator.ts:876 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 170, columnCount: 1, quantity: 5000}
pouch-cost-calculator.ts:889 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5.882352941176471, result: 849.9999999999999}
pouch-cost-calculator.ts:520 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 850, lossMeters: 400, totalWithLossMeters: 1250, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'standard', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
pouch-cost-calculator.ts:303 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
pouch-cost-calculator.ts:526 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 348097, printingCost: 629500, laminationCost: 168150, slitterCost: 30000, surfaceTreatmentCost: 29500, …}
pouch-cost-calculator.ts:1137 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 13, quantity: 5000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:539 [calculateSKUCost] Total Processing Cost: {totalQuantity: 5000, skuCount: 1, totalPouchProcessingCostKRW: 250000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:598 [calculateSKUCost] SKU 0 Allocation: {quantity: 5000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1205247, allocatedPouchProcessingCostKRW: 250000}
pouch-cost-calculator.ts:1178 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1205247, pouchProcessingCostKRW: 250000, baseCostKRW: 1455247, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1188 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1202 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1203 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1455247, salesMargin: 0.3, customerMarkupRate: 0, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1222 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1455247,
  "manufacturerPriceKRW": 1891821.1,
  "manufacturerPriceJPY": 227018.532,
  "dutyJPY": 11350.9266,
  "deliveryJPY": 15358,
  "subtotalJPY": 253727.4586,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 329845.69618,
  "salesMarginJPY": 76118.23758000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 329845.69618
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 329845.69618
pouch-cost-calculator.ts:636 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 16.6843525, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "bottom-open",
    "corner-square",
    "hang-hole-8mm",
    "matte",
    "notch-straight",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": true,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:48 【SKUマット印刷追加費】
unified-pricing-engine.ts:49 {
  "原反幅_m": "0.59m",
  "総使用メートル": "1250m",
  "追加費_KRW": "29,500ウォン",
  "追加費_JPY": "¥3,540"
}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1516 [100円丸め] 丸め前 totalPrice: 333385.29618 (型: number )
unified-pricing-engine.ts:1517 [100円丸め] 丸め後 roundedTotalPrice: 333400 (差分: 14.703819999995176 )
unified-pricing-engine.ts:1518 [100円丸め] 計算式: Math.ceil( 333385.29618 / 100) * 100 = 3334 * 100 = 333400
ImprovedQuotingWizard.tsx:4443 [handleNext] 価格計算完了 - 総額: 333400 円, markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
ImprovedQuotingWizard.tsx:4465 [handleNext] Enhanced result: {unitPrice: 66.68, totalPrice: 333400, currency: 'JPY', quantity: 5000, skuCount: 1, …}
ImprovedQuotingWizard.tsx:4466 [handleNext] Setting result with hasValidSKUData: true
ImprovedQuotingWizard.tsx:4467 [handleNext] Setting result with skuQuantities: [5000]
ImprovedQuotingWizard.tsx:4473 [handleNext] About to change step to result
QuoteContext.tsx:1193 [checkStepComplete] Called with step: result state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
QuoteContext.tsx:1193 [checkStepComplete] Called with step: result state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, pitch: undefined, …}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:2815 [handleDownloadPDF] DEBUG - state.sideWidth: undefined
ImprovedQuotingWizard.tsx:2816 [handleDownloadPDF] DEBUG - state.sealWidth: 5mm
ImprovedQuotingWizard.tsx:2817 [handleDownloadPDF] DEBUG - state.bagTypeId: flat_3_side
ImprovedQuotingWizard.tsx:2818 [handleDownloadPDF] DEBUG - hasValidSKUData: true
ImprovedQuotingWizard.tsx:2863 [handleDownloadPDF] SKU mode - Building items, state.sideWidth: undefined state.sealWidth: 5mm
ImprovedQuotingWizard.tsx:2906 [handleDownloadPDF] SKU mode - Item specs: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 130, height: 170, depth: 0, …}
ImprovedQuotingWizard.tsx:3001 [handleDownloadPDF] Calculating cost breakdown...
ImprovedQuotingWizard.tsx:3014 [calculateCostBreakdown] SKU mode detected, calculating from skuCostDetails
ImprovedQuotingWizard.tsx:3018 [DIAGNOSTIC] === Cost Breakdown Analysis ===
ImprovedQuotingWizard.tsx:3019 [DIAGNOSTIC] quotationData.items.length: 1
ImprovedQuotingWizard.tsx:3020 [DIAGNOSTIC] skuCosts.length: 1
ImprovedQuotingWizard.tsx:3021 [DIAGNOSTIC] state.skuQuantities: [5000]
ImprovedQuotingWizard.tsx:3022 [DIAGNOSTIC] skuCosts costBreakdown values: [{…}]
ImprovedQuotingWizard.tsx:3028 [DIAGNOSTIC] === End Analysis ===
ImprovedQuotingWizard.tsx:3030 [calculateCostBreakdown] skuCosts length: 1
ImprovedQuotingWizard.tsx:3031 [calculateCostBreakdown] skuCosts: [{…}]
ImprovedQuotingWizard.tsx:3074 [calculateCostBreakdown] Item 0 cost_breakdown: {materialCost: 41772, printingCost: 75540, laminationCost: 20178, slitterCost: 3600, surfaceTreatmentCost: 3540, …}
ImprovedQuotingWizard.tsx:3130 [calculateCostBreakdown] totalCostBreakdown: {materialCost: 41772, printingCost: 75540, laminationCost: 20178, slitterCost: 3600, surfaceTreatmentCost: 3540, …}
ImprovedQuotingWizard.tsx:3131 [calculateCostBreakdown] itemsWithCost length: 1
ImprovedQuotingWizard.tsx:3134 [calculateCostBreakdown] itemsWithCost[0].cost_breakdown: {materialCost: 41772, printingCost: 75540, laminationCost: 20178, slitterCost: 3600, surfaceTreatmentCost: 3540, …}
ImprovedQuotingWizard.tsx:3147 [handleDownloadPDF] quotationData.total_cost_breakdown: {materialCost: 41772, printingCost: 75540, laminationCost: 20178, slitterCost: 3600, surfaceTreatmentCost: 3540, …}
ImprovedQuotingWizard.tsx:3148 [handleDownloadPDF] quotationData.items[0].cost_breakdown: {materialCost: 41772, printingCost: 75540, laminationCost: 20178, slitterCost: 3600, surfaceTreatmentCost: 3540, …}
ImprovedQuotingWizard.tsx:3152 [handleDownloadPDF] Saving quotation to database first...
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3195 [handleDownloadPDF] Quotation saved successfully, formal quoteNumber: QT20260316-1065
ImprovedQuotingWizard.tsx:3238 [ImprovedQuotingWizard] postProcessingOptions: (7) ['bottom-open', 'corner-square', 'hang-hole-8mm', 'matte', 'notch-straight', 'valve-no', 'zipper-yes']
ImprovedQuotingWizard.tsx:3239 [ImprovedQuotingWizard] postProcessingOptions.includes("notch-straight"): true
ImprovedQuotingWizard.tsx:3240 [ImprovedQuotingWizard] postProcessingOptions.includes("hang-hole-8mm"): true
ImprovedQuotingWizard.tsx:3241 [ImprovedQuotingWizard] postProcessingOptions.includes("corner-square"): true
ImprovedQuotingWizard.tsx:3320 [ImprovedQuotingWizard] specifications FULL: {
  "bagType": "三方シール平袋",
  "contents": "食品（固体） / 一般/中性 / 一般/常温",
  "size": "130×170",
  "material": "PET AL",
  "thicknessType": "PET 12μ + AL 7μ + PET 12μ + LLDPE 90μ",
  "sealWidth": "シール幅 5mm",
  "sealDirection": "上",
  "notchShape": "直線",
  "notchPosition": "指定位置",
  "hanging": "あり",
  "hangingPosition": "8mm",
  "zipperPosition": "指定位置",
  "cornerR": "R0"
}
ImprovedQuotingWizard.tsx:3321 [ImprovedQuotingWizard] specifications.notchShape: 直線
ImprovedQuotingWizard.tsx:3322 [ImprovedQuotingWizard] specifications.hanging: あり
ImprovedQuotingWizard.tsx:3323 [ImprovedQuotingWizard] specifications.hangingPosition: 8mm
ImprovedQuotingWizard.tsx:3324 [ImprovedQuotingWizard] specifications.cornerR: R0
ImprovedQuotingWizard.tsx:3325 [ImprovedQuotingWizard] specifications.machiPrinting: undefined
pdf-generator.ts:782 [PDF Generator] Received data: {quoteNumber: 'QT20260316-1065', specifications: {…}, optionalProcessing: {…}}
pdf-generator.ts:1126 [PDF HTML Generator] data.optionalProcessing: {zipper: true, notch: true, hangingHole: true, cornerProcessing: true, gasValve: true, …}
pdf-generator.ts:1126 [PDF HTML Generator] processing before: {zipper: true, notch: true, hangingHole: true, cornerProcessing: true, gasValve: true, …}
pdf-generator.ts:1126 [PDF HTML Generator] specs FULL: {
  "bagType": "三方シール平袋",
  "contents": "食品（固体） / 一般/中性 / 一般/常温",
  "size": "130×170",
  "material": "PET AL",
  "thicknessType": "PET 12μ + AL 7μ + PET 12μ + LLDPE 90μ",
  "sealWidth": "シール幅 5mm",
  "sealDirection": "上",
  "notchShape": "直線",
  "notchPosition": "指定位置",
  "hanging": "あり",
  "hangingPosition": "8mm",
  "zipperPosition": "指定位置",
  "cornerR": "R0"
}
pdf-generator.ts:1126 [PDF HTML Generator] specs.notchShape: 直線
pdf-generator.ts:1126 [PDF HTML Generator] specs.hanging: あり
pdf-generator.ts:1126 [PDF HTML Generator] specs.hangingPosition: 8mm
pdf-generator.ts:1126 [PDF HTML Generator] specs.cornerR: R0
pdf-generator.ts:1126 [PDF HTML Generator] specs.machiPrinting: undefined type: undefined truthy: false
pdf-generator.ts:1126 [PDF HTML Generator] processing after: {zipper: true, notch: true, hangingHole: true, cornerProcessing: true, gasValve: true, …}
pdf-generator.ts:1126 [PDF HTML Generator] processing.surfaceFinish: マット
pdf-generator.ts:1126 [PDF HTML Generator] hasSKUData: false
pdf-generator.ts:1126 [PDF HTML Generator] skuData: {count: 1, items: Array(1)}
pdf-generator.ts:1126 [PDF HTML Generator] === TEMPLATE GENERATION START ===
pdf-generator.ts:2100 [PDF HTML Generator] === VERIFICATION CODE START ===
pdf-generator.ts:2103 [PDF HTML Generator] machiPrinting value: undefined type: undefined
pdf-generator.ts:2105 [PDF HTML Generator] Machi printing row in HTML: false
pdf-generator.ts:891 [PDF Generator] Waiting for container to render...
pdf-generator.ts:893 [PDF Generator] Container dimensions: {scrollWidth: 794, scrollHeight: 1123, offsetWidth: 794, offsetHeight: 1123}
pdf-generator.ts:906 [PDF Generator] Starting html2canvas capture...
pdf-generator.ts:917 [PDF Generator] html2canvas onclone called
pdf-generator.ts:920 [PDF Generator] Cloned container found: {scrollWidth: 794, scrollHeight: 1123}
pdf-generator.ts:931 [PDF Generator] Canvas captured successfully: {width: 1588, height: 2246, dataSize: 624066}
pdf-generator.ts:946 [PDF Generator] Cleaning up container...
pdf-generator.ts:974 [PDF Generator] PDF dimensions: {canvasSize: {…}, a4Size: {…}, margins: {…}, contentArea: {…}, finalSize: {…}, …}
ImprovedQuotingWizard.tsx:3434 [PDF Download] Blob created, size: 318944
ImprovedQuotingWizard.tsx:3438 [PDF Download] Blob URL created: blob:http://localhost:3000/ea4ee83b-dfc2-4133-a519-d3c9491ea8d9
ImprovedQuotingWizard.tsx:3455 PDF download ready: QT20260316-1065
ImprovedQuotingWizard.tsx:3471 PDF download logged successfully
ImprovedQuotingWizard.tsx:3483 [handleDownloadPDF] Saving PDF to Storage...
ImprovedQuotingWizard.tsx:3498  POST http://localhost:3000/api/member/quotations/f55debb7-e16b-4992-9ade-b0d5e19544ea/save-pdf 500 (Internal Server Error)
handleDownloadPDF @ ImprovedQuotingWizard.tsx:3498
await in handleDownloadPDF
executeDispatch @ react-dom-client.development.js:20543
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20593
(anonymous) @ react-dom-client.development.js:21164
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20747
dispatchEvent @ react-dom-client.development.js:25693
dispatchDiscreteEvent @ react-dom-client.development.js:25661
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
ResultStep @ ImprovedQuotingWizard.tsx:3889
react_stack_bottom_frame @ react-dom-client.development.js:28038
renderWithHooksAgain @ react-dom-client.development.js:8084
renderWithHooks @ react-dom-client.development.js:7996
updateFunctionComponent @ react-dom-client.development.js:10501
beginWork @ react-dom-client.development.js:12136
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18997
workLoopSync @ react-dom-client.development.js:18825
renderRootSync @ react-dom-client.development.js:18806
performWorkOnRoot @ react-dom-client.development.js:17835
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20384
performWorkUntilDeadline @ scheduler.development.js:45
<ResultStep>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
ImprovedQuotingWizard @ ImprovedQuotingWizard.tsx:4711
react_stack_bottom_frame @ react-dom-client.development.js:28038
renderWithHooksAgain @ react-dom-client.development.js:8084
renderWithHooks @ react-dom-client.development.js:7996
updateFunctionComponent @ react-dom-client.development.js:10501
beginWork @ react-dom-client.development.js:12136
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18997
workLoopSync @ react-dom-client.development.js:18825
renderRootSync @ react-dom-client.development.js:18806
performWorkOnRoot @ react-dom-client.development.js:17835
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20384
performWorkUntilDeadline @ scheduler.development.js:45
ImprovedQuotingWizard.tsx:3511 [handleDownloadPDF] Failed to save PDF to Storage: {"error":"Internal server error","details":"cookieStore.get is not a function"}
warn @ forward-logs-shared.ts:95
handleDownloadPDF @ ImprovedQuotingWizard.tsx:3511
await in handleDownloadPDF
executeDispatch @ react-dom-client.development.js:20543
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20593
(anonymous) @ react-dom-client.development.js:21164
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20747
dispatchEvent @ react-dom-client.development.js:25693
dispatchDiscreteEvent @ react-dom-client.development.js:25661
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
ResultStep @ ImprovedQuotingWizard.tsx:3889
react_stack_bottom_frame @ react-dom-client.development.js:28038
renderWithHooksAgain @ react-dom-client.development.js:8084
renderWithHooks @ react-dom-client.development.js:7996
updateFunctionComponent @ react-dom-client.development.js:10501
beginWork @ react-dom-client.development.js:12136
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18997
workLoopSync @ react-dom-client.development.js:18825
renderRootSync @ react-dom-client.development.js:18806
performWorkOnRoot @ react-dom-client.development.js:17835
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20384
performWorkUntilDeadline @ scheduler.development.js:45
<ResultStep>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
ImprovedQuotingWizard @ ImprovedQuotingWizard.tsx:4711
react_stack_bottom_frame @ react-dom-client.development.js:28038
renderWithHooksAgain @ react-dom-client.development.js:8084
renderWithHooks @ react-dom-client.development.js:7996
updateFunctionComponent @ react-dom-client.development.js:10501
beginWork @ react-dom-client.development.js:12136
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18997
workLoopSync @ react-dom-client.development.js:18825
renderRootSync @ react-dom-client.development.js:18806
performWorkOnRoot @ react-dom-client.development.js:17835
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20384
performWorkUntilDeadline @ scheduler.development.js:45
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3681 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
forward-logs-shared.ts:95 [Fast Refresh] rebuilding
forward-logs-shared.ts:95 [Fast Refresh] done in 1111ms
