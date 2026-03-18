forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
site.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.
QuoteContext.tsx:272 [QuoteContext] initialState created: {materialWidth: 590, filmLayers: Array(4), filmLayersCount: 4}
QuoteContext.tsx:1727 [QuoteProvider] State updated: {materialWidth: 590, filmLayers: Array(4), filmLayersCount: 4, materialId: 'pet_al'}
AuthContext.tsx:223 [AuthContext] Initializing auth context...
AuthContext.tsx:149 [AuthContext] Fetching session from /api/auth/current-user... {fetchId: 1}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
AuthContext.tsx:174 [AuthContext] Session updated successfully {fetchId: 1}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
ImprovedQuotingWizard.tsx:4105 [RealTimePriceDisplay] Auth ready, user detected: 54fd7b31-b805-43cf-b92e-898ddd066875
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
site.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:02.219Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|500|[500]|medium|1.0|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:473 [Film Width Calculation] {
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
pouch-cost-calculator.ts:882 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 200, columnCount: 1, quantity: 500}
pouch-cost-calculator.ts:895 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5, result: 100}
pouch-cost-calculator.ts:509 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 100, lossMeters: 400, totalWithLossMeters: 500, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 500}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
 [calculateMaterialCost] RESULT: {totalCost: 124040.41999999998, totalWeight: 34.3439, totalCostRounded: 124040}
 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 500, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 124040, printingCost: 237500, laminationCost: 66375, slitterCost: 30000, surfaceTreatmentCost: 0, …}
 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 500, pricePerCm: 0.4, …}
 [calculateSKUCost] Total Processing Cost: {totalQuantity: 500, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 500, quantityRatio: '100.0%', allocatedFilmCostKRW: 457915, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 457915, pouchProcessingCostKRW: 200000, baseCostKRW: 657915, quantity: 500, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 657915, salesMargin: 0.3, customerMarkupRate: 0, quantity: 500, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 657915,
  "manufacturerPriceKRW": 855289.5,
  "manufacturerPriceJPY": 102634.73999999999,
  "dutyJPY": 5131.737,
  "deliveryJPY": 15358,
  "subtotalJPY": 123124.47699999998,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 160061.82009999998,
  "salesMarginJPY": 36937.3431,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 160061.82009999998
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 160061.82009999998
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 3.7722825000000006, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
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
unified-pricing-engine.ts:1665 [100円丸め] 丸め前 totalPrice: 160061.4201 (型: number )
unified-pricing-engine.ts:1666 [100円丸め] 丸め後 roundedTotalPrice: 160100 (差分: 38.57990000001155 )
unified-pricing-engine.ts:1667 [100円丸め] 計算式: Math.ceil( 160061.4201 / 100) * 100 = 1601 * 100 = 160100
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 160100 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:02.478Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|1000|[1000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:473 [Film Width Calculation] {
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
pouch-cost-calculator.ts:882 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 200, columnCount: 1, quantity: 1000}
pouch-cost-calculator.ts:895 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5, result: 200}
pouch-cost-calculator.ts:509 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 200, lossMeters: 400, totalWithLossMeters: 600, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 600}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:594 [calculateMaterialCost] RESULT: {totalCost: 148848.50400000002, totalWeight: 41.212680000000006, totalCostRounded: 148849}
film-cost-calculator.ts:714 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 600, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:727 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:531 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 148849, printingCost: 285000, laminationCost: 79650, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1138 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 1000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:551 [calculateSKUCost] Total Processing Cost: {totalQuantity: 1000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:595 [calculateSKUCost] SKU 0 Allocation: {quantity: 1000, quantityRatio: '100.0%', allocatedFilmCostKRW: 543499, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1180 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 543499, pouchProcessingCostKRW: 200000, baseCostKRW: 743499, quantity: 1000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1190 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1208 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1210 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 743499, salesMargin: 0.3, customerMarkupRate: 0, quantity: 1000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1228 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 743499,
  "manufacturerPriceKRW": 966548.7000000001,
  "manufacturerPriceJPY": 115985.844,
  "dutyJPY": 5799.2922,
  "deliveryJPY": 15358,
  "subtotalJPY": 137143.1362,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 178286.07706,
  "salesMarginJPY": 41142.94086,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 178286.07706
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 178286.07706
pouch-cost-calculator.ts:638 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 7.544565000000001, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1614 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1665 [100円丸め] 丸め前 totalPrice: 178285.67706000002 (型: number )
unified-pricing-engine.ts:1666 [100円丸め] 丸め後 roundedTotalPrice: 178300 (差分: 14.322939999983646 )
unified-pricing-engine.ts:1667 [100円丸め] 計算式: Math.ceil( 178285.67706000002 / 100) * 100 = 1783 * 100 = 178300
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 178300 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:02.480Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|2000|[2000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:473 [Film Width Calculation] {
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
pouch-cost-calculator.ts:882 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 200, columnCount: 1, quantity: 2000}
pouch-cost-calculator.ts:895 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5, result: 400}
pouch-cost-calculator.ts:509 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 400, lossMeters: 400, totalWithLossMeters: 800, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 800}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:594 [calculateMaterialCost] RESULT: {totalCost: 198464.67200000002, totalWeight: 54.95024, totalCostRounded: 198465}
film-cost-calculator.ts:714 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 800, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:727 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:531 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 198465, printingCost: 380000, laminationCost: 106200, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1138 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 2000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:551 [calculateSKUCost] Total Processing Cost: {totalQuantity: 2000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
 [calculateSKUCost] SKU 0 Allocation: {quantity: 2000, quantityRatio: '100.0%', allocatedFilmCostKRW: 714665, allocatedPouchProcessingCostKRW: 200000}
 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 714665, pouchProcessingCostKRW: 200000, baseCostKRW: 914665, quantity: 2000, deliveryJPY: 15358}
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 914665, salesMargin: 0.3, customerMarkupRate: 0, quantity: 2000, deliveryJPY: 15358}
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 914665,
  "manufacturerPriceKRW": 1189064.5,
  "manufacturerPriceJPY": 142687.74,
  "dutyJPY": 7134.387,
  "deliveryJPY": 15358,
  "subtotalJPY": 165180.12699999998,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 214734.16509999998,
  "salesMarginJPY": 49554.038100000005,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 214734.16509999998
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 214734.16509999998
 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 15.089130000000003, deliveryBoxes: 1, totalDeliveryJPY: 15357.599999999999, perBoxCostJPY: 15357.599999999999}
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
 [100円丸め] 丸め前 totalPrice: 214733.7651 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 214800 (差分: 66.23490000001038 )
 [100円丸め] 計算式: Math.ceil( 214733.7651 / 100) * 100 = 2148 * 100 = 214800
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 214800 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:02.482Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|5000|[5000]|medium|1.…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 200, columnCount: 1, quantity: 5000}
 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5, result: 1000}
 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 1000, lossMeters: 400, totalWithLossMeters: 1400, isKraftMaterial: false, kraftMinimumApplied: false, …}
 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 1400}
 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:594 [calculateMaterialCost] RESULT: {totalCost: 347313.17600000004, totalWeight: 96.16292000000001, totalCostRounded: 347313}
film-cost-calculator.ts:714 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 1400, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:727 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:531 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 347313, printingCost: 665000, laminationCost: 185850, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1138 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 5000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:551 [calculateSKUCost] Total Processing Cost: {totalQuantity: 5000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:595 [calculateSKUCost] SKU 0 Allocation: {quantity: 5000, quantityRatio: '100.0%', allocatedFilmCostKRW: 1228163, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1180 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 1228163, pouchProcessingCostKRW: 200000, baseCostKRW: 1428163, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1190 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1208 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1210 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 1428163, salesMargin: 0.3, customerMarkupRate: 0, quantity: 5000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1228 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1428163,
  "manufacturerPriceKRW": 1856611.9000000001,
  "manufacturerPriceJPY": 222793.428,
  "dutyJPY": 11139.671400000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 249291.0994,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 324078.42922,
  "salesMarginJPY": 74787.32981999998,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 324078.42922
}
pouch-cost-calculator.ts:1264 [calculateCostBreakdown] Rounding inconsistency detected {sumOfRoundedItems: 324079, roundedFinalPriceJPY: 324078, difference: 1}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 324078.42922
pouch-cost-calculator.ts:638 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 37.72282500000001, deliveryBoxes: 2, totalDeliveryJPY: 30715.199999999997, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1614 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1665 [100円丸め] 丸め前 totalPrice: 339435.62922 (型: number )
unified-pricing-engine.ts:1666 [100円丸め] 丸め後 roundedTotalPrice: 339500 (差分: 64.37077999999747 )
unified-pricing-engine.ts:1667 [100円丸め] 計算式: Math.ceil( 339435.62922 / 100) * 100 = 3395 * 100 = 339500
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 339500 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:02.488Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'flat_3_side|pet_al|200|300|0|10000|[10000]|medium|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
pouch-cost-calculator.ts:473 [Film Width Calculation] {
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
pouch-cost-calculator.ts:882 [calculateTheoreticalMeters] {pouchType: 'flat_3_side', dimensions: {…}, pitch: 200, columnCount: 1, quantity: 10000}
pouch-cost-calculator.ts:895 [calculateTheoreticalMeters] result: {pouchesPerMeter: 5, result: 2000}
pouch-cost-calculator.ts:509 [calculateSKUCost] Total Film Calculation: {totalSecuredMeters: 2000, lossMeters: 400, totalWithLossMeters: 2400, isKraftMaterial: false, kraftMinimumApplied: false, …}
pouch-cost-calculator.ts:969 [calculateFilmCost] DEBUG: {materialId: 'pet_al', thicknessSelection: 'medium', filmLayersReceived: Array(4), baseLayers: Array(4), adjustedLayers: Array(4), …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.59, lengthWithLoss: 2400}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:594 [calculateMaterialCost] RESULT: {totalCost: 595394.0160000001, totalWeight: 164.85072000000002, totalCostRounded: 595394}
film-cost-calculator.ts:714 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.59, lengthWithLoss: 2400, postProcessingOptions: Array(0), hasGlossy: false, hasMatte: false}
film-cost-calculator.ts:727 [calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0
pouch-cost-calculator.ts:531 [calculateSKUCost] Total Film Cost Breakdown: {materialCost: 595394, printingCost: 1140000, laminationCost: 318600, slitterCost: 30000, surfaceTreatmentCost: 0, …}
pouch-cost-calculator.ts:1138 [Pouch Processing Cost] {pouchType: 'flat_3_side', finalPouchType: 'flat_3_side', widthCM: 20, quantity: 10000, pricePerCm: 0.4, …}
pouch-cost-calculator.ts:551 [calculateSKUCost] Total Processing Cost: {totalQuantity: 10000, skuCount: 1, totalPouchProcessingCostKRW: 200000, note: '各SKUの固定費用を合算（按分なし）'}
pouch-cost-calculator.ts:595 [calculateSKUCost] SKU 0 Allocation: {quantity: 10000, quantityRatio: '100.0%', allocatedFilmCostKRW: 2083994, allocatedPouchProcessingCostKRW: 200000}
pouch-cost-calculator.ts:1180 [calculateCostBreakdown] DEBUG: {filmCostTotalKRW: 2083994, pouchProcessingCostKRW: 200000, baseCostKRW: 2283994, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1190 [PouchCostCalculator] manufacturerMargin: 0.3
pouch-cost-calculator.ts:1208 [PouchCostCalculator] salesMargin: 0.3
pouch-cost-calculator.ts:1210 [calculateCostBreakdown] PRICE CALC: {baseCostKRW: 2283994, salesMargin: 0.3, customerMarkupRate: 0, quantity: 10000, deliveryJPY: 15358}
pouch-cost-calculator.ts:1228 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 2283994,
  "manufacturerPriceKRW": 2969192.2,
  "manufacturerPriceJPY": 356303.064,
  "dutyJPY": 17815.1532,
  "deliveryJPY": 15358,
  "subtotalJPY": 389476.2172,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 506319.08236000006,
  "salesMarginJPY": 116842.86516000004,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 506319.08236000006
}
pouch-cost-calculator.ts:1276 [calculateCostBreakdown] totalCost（小数点以下保持）: 506319.08236000006
pouch-cost-calculator.ts:638 [calculateSKUCost] Delivery Calculation: {totalDeliveryWeight: 75.44565000000001, deliveryBoxes: 3, totalDeliveryJPY: 46072.799999999996, perBoxCostJPY: 15357.599999999999}
unified-pricing-engine.ts:48 【SKU後加工オプション】
unified-pricing-engine.ts:49 {
  "後加工オプション": [],
  "マット仕上げ": false,
  "光沢仕上げ": false
}
unified-pricing-engine.ts:1614 [SKU Calculation - Using Glossy Finish] {hasGlossyFinishing: false, note: 'マット印刷追加費は適用されません'}
unified-pricing-engine.ts:48 【SKU追加料金】
unified-pricing-engine.ts:49 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
unified-pricing-engine.ts:1665 [100円丸め] 丸め前 totalPrice: 537033.88236 (型: number )
unified-pricing-engine.ts:1666 [100円丸め] 丸め後 roundedTotalPrice: 537100 (差分: 66.1176399999531 )
unified-pricing-engine.ts:1667 [100円丸め] 計算式: Math.ceil( 537033.88236 / 100) * 100 = 5371 * 100 = 537100
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 537100 円
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'flat_3_side', materialId: 'pet_al', width: 200, height: 300, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: true, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {bagTypeId: 'roll_film'}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:432 [SET_BASIC_SPECS] Product type changed from flat_3_side to roll_film - resetting SKU quantities
processingConfig.ts:920 [getDefaultPostProcessingOptions] bagTypeId: roll_film isExcludedZipperCorner: false Returning defaults: (8) ['zipper-yes', 'glossy', 'notch-yes', 'hang-hole-6mm', 'corner-round', 'valve-no', 'top-open', 'machi-printing-no']
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (8) ['zipper-yes', 'glossy', 'notch-yes', 'hang-hole-6mm', 'corner-round', 'valve-no', 'top-open', 'machi-printing-no']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] glossy excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-yes (Vノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-6mm (吊り穴 6mm): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-round (角丸): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] top-open (上端開封): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] machi-printing-no (マチ印刷なし): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (7) [{…}, {…}, {…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:457 [SET_BASIC_SPECS] bagTypeId changed: flat_3_side -> roll_film
QuoteContext.tsx:458 [SET_BASIC_SPECS] Updating post-processing options: (8) ['zipper-yes', 'glossy', 'notch-yes', 'hang-hole-6mm', 'corner-round', 'valve-no', 'top-open', 'machi-printing-no']
QuoteContext.tsx:459 [SET_BASIC_SPECS] newPostProcessingMultiplier: 1
QuoteContext.tsx:432 [SET_BASIC_SPECS] Product type changed from flat_3_side to roll_film - resetting SKU quantities
processingConfig.ts:920 [getDefaultPostProcessingOptions] bagTypeId: roll_film isExcludedZipperCorner: false Returning defaults: (8) ['zipper-yes', 'glossy', 'notch-yes', 'hang-hole-6mm', 'corner-round', 'valve-no', 'top-open', 'machi-printing-no']
QuoteContext.tsx:286 [calculatePostProcessingMultiplier] Input options: (8) ['zipper-yes', 'glossy', 'notch-yes', 'hang-hole-6mm', 'corner-round', 'valve-no', 'top-open', 'machi-printing-no']
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
QuoteContext.tsx:302 [calculatePostProcessingMultiplier] glossy excluded from multiplier (calculated as additional cost)
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] notch-yes (Vノッチ): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] hang-hole-6mm (吊り穴 6mm): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] corner-round (角丸): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] top-open (上端開封): 1, 1 * 1 = 1
QuoteContext.tsx:311 [calculatePostProcessingMultiplier] machi-printing-no (マチ印刷なし): 1, 1 * 1 = 1
QuoteContext.tsx:317 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: (7) [{…}, {…}, {…}, {…}, {…}, {…}, {…}]
QuoteContext.tsx:457 [SET_BASIC_SPECS] bagTypeId changed: flat_3_side -> roll_film
QuoteContext.tsx:458 [SET_BASIC_SPECS] Updating post-processing options: (8) ['zipper-yes', 'glossy', 'notch-yes', 'hang-hole-6mm', 'corner-round', 'valve-no', 'top-open', 'machi-printing-no']
QuoteContext.tsx:459 [SET_BASIC_SPECS] newPostProcessingMultiplier: 1
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 200, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 200, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:07.877Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|200|0|0|500|[500]|medium|1.0|fals…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:736 [UnifiedPricingEngine] Loaded pricing settings from DB: 66 settings
 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 900, laminationCostKRW: 119475, slitterCostKRW: 30000, processingCost: 17937}
 【素材費計算】
 {
  "パウチタイプ": "roll_film",
  "サイズ": "200×undefinedmm",
  "数量": "500個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "900m",
  "理論メートル": "100m",
  "確保メートル": "500m",
  "素材費_KRW": "219,169.188ウォン",
  "素材費_JPY": "¥26,300.303"
}
 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 500, totalMeters: 900, lossMeters: 400, perColorPerMeter: 475, …}
 【表面仕上げ】
 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
 【光沢仕上げ】
 {
  "note": "マット印刷追加費は適用されません"
}
 [Delivery Cost By Weight] {packageCount: 2, totalDeliveryCostKRW: 161000, surcharge: 24150, totalWithSurcharge: 185150, deliveryCostJPY: 22218}
 [Delivery Cost Roll Film] {totalMeters: 900, deliveryMeters: 500, filmWidthM: 0.59, deliveryWeightKg: '33.53', packageCount: 2, …}
 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 95537.30256
 【最終価格計算】
 {
  "製造者価格": "¥124,198.493",
  "輸入原価": "¥130,408.418",
  "販売マージン率": "30%",
  "販売マージン額": "¥39,122.525",
  "配送料": "¥22,218",
  "最終販売価格": "¥191,748.943",
  "note": "配送料は販売マージン計算対象外"
}
 💰 最終価格サマリー
 (index)Value(index)Value数量'500個'単価'JPY383.498'総額'JPY191,749'Object
 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 191749 円
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:08.116Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|200|0|0|1000|[1000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 1400, laminationCostKRW: 185850, slitterCostKRW: 30000, processingCost: 25902}
 【素材費計算】
 {
  "パウチタイプ": "roll_film",
  "サイズ": "200×undefinedmm",
  "数量": "1,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "1400m",
  "理論メートル": "200m",
  "確保メートル": "500m",
  "素材費_KRW": "340,929.848ウォン",
  "素材費_JPY": "¥40,911.582"
}
 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 1000, totalMeters: 1400, lossMeters: 400, perColorPerMeter: 475, …}
 【表面仕上げ】
 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
 【光沢仕上げ】
 {
  "note": "マット印刷追加費は適用されません"
}
 [Delivery Cost By Weight] {packageCount: 3, totalDeliveryCostKRW: 295500, surcharge: 44325, totalWithSurcharge: 339825, deliveryCostJPY: 40779}
 [Delivery Cost Roll Film] {totalMeters: 1400, deliveryMeters: 1000, filmWidthM: 0.59, deliveryWeightKg: '67.06', packageCount: 3, …}
 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 146613.58176
 【最終価格計算】
 {
  "製造者価格": "¥190,597.656",
  "輸入原価": "¥200,127.539",
  "販売マージン率": "30%",
  "販売マージン額": "¥60,038.262",
  "配送料": "¥40,779",
  "最終販売価格": "¥300,944.801",
  "note": "配送料は販売マージン計算対象外"
}
 💰 最終価格サマリー
 (index)Value(index)Value数量'1,000個'単価'JPY300.945'総額'JPY300,945'Object
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 300945 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:08.117Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|200|0|0|2000|[2000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 2400, laminationCostKRW: 318600, slitterCostKRW: 30000, processingCost: 41832}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "200×undefinedmm",
  "数量": "2,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "2400m",
  "理論メートル": "400m",
  "確保メートル": "500m",
  "素材費_KRW": "584,451.168ウォン",
  "素材費_JPY": "¥70,134.14"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 2000, totalMeters: 2400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 5, totalDeliveryCostKRW: 559500, surcharge: 83925, totalWithSurcharge: 643425, deliveryCostJPY: 77211}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 2400, deliveryMeters: 2000, filmWidthM: 0.59, deliveryWeightKg: '134.12', packageCount: 6, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 248766.14016
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥323,395.982",
  "輸入原価": "¥339,565.781",
  "販売マージン率": "30%",
  "販売マージン額": "¥101,869.734",
  "配送料": "¥77,211",
  "最終販売価格": "¥518,646.516",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'2,000個'単価'JPY259.324'総額'JPY518,647'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 518647 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:08.117Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|200|0|0|5000|[5000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 5400, laminationCostKRW: 716850, slitterCostKRW: 54000, processingCost: 92502}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "200×undefinedmm",
  "数量": "5,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "5400m",
  "理論メートル": "1000m",
  "確保メートル": "1000m",
  "素材費_KRW": "1,315,015.128ウォン",
  "素材費_JPY": "¥157,801.815"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 5000, totalMeters: 5400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 13, totalDeliveryCostKRW: 1413500, surcharge: 212025, totalWithSurcharge: 1625524.9999999998, deliveryCostJPY: 195062.99999999997}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 5400, deliveryMeters: 5000, filmWidthM: 0.59, deliveryWeightKg: '335.30', packageCount: 13, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 558103.81536
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥725,534.96",
  "輸入原価": "¥761,811.708",
  "販売マージン率": "30%",
  "販売マージン額": "¥228,543.512",
  "配送料": "¥195,063",
  "最終販売価格": "¥1,185,418.22",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'5,000個'単価'JPY237.084'総額'JPY1,185,418'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 1185418 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:08.118Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|200|0|0|10000|[10000]|medium|1.0|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 10400, laminationCostKRW: 1380600, slitterCostKRW: 104000, processingCost: 178152}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "200×undefinedmm",
  "数量": "10,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "10400m",
  "理論メートル": "2000m",
  "確保メートル": "2000m",
  "素材費_KRW": "2,532,621.728ウォン",
  "素材費_JPY": "¥303,914.607"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 10000, totalMeters: 10400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 25, totalDeliveryCostKRW: 2799000, surcharge: 419850, totalWithSurcharge: 3218849.9999999995, deliveryCostJPY: 386261.99999999994}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 10400, deliveryMeters: 10000, filmWidthM: 0.59, deliveryWeightKg: '670.59', packageCount: 26, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 1074866.60736
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥1,397,326.59",
  "輸入原価": "¥1,467,192.919",
  "販売マージン率": "30%",
  "販売マージン額": "¥440,157.876",
  "配送料": "¥386,262",
  "最終販売価格": "¥2,293,612.795",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'10,000個'単価'JPY229.361'総額'JPY2,293,613'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 2293613 円
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {width: 1}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 1, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 1, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {width: 13}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 13, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 13, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {width: 130}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: undefined, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {pitch: 1}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: 1, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: 1, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {pitch: 13}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: 13, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: 13, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {pitch: 130}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 130, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:09.980Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|130|0|0|500|[500]|medium|1.0|fals…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 900, laminationCostKRW: 119475, slitterCostKRW: 30000, processingCost: 17937}
 【素材費計算】
 {
  "パウチタイプ": "roll_film",
  "サイズ": "130×undefinedmm",
  "数量": "500個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "900m",
  "理論メートル": "65m",
  "確保メートル": "500m",
  "素材費_KRW": "219,169.188ウォン",
  "素材費_JPY": "¥26,300.303"
}
 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 500, totalMeters: 900, lossMeters: 400, perColorPerMeter: 475, …}
 【表面仕上げ】
 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
 【光沢仕上げ】
 {
  "note": "マット印刷追加費は適用されません"
}
 [Delivery Cost By Weight] {packageCount: 2, totalDeliveryCostKRW: 161000, surcharge: 24150, totalWithSurcharge: 185150, deliveryCostJPY: 22218}
 [Delivery Cost Roll Film] {totalMeters: 900, deliveryMeters: 500, filmWidthM: 0.59, deliveryWeightKg: '33.53', packageCount: 2, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 95537.30256
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥124,198.493",
  "輸入原価": "¥130,408.418",
  "販売マージン率": "30%",
  "販売マージン額": "¥39,122.525",
  "配送料": "¥22,218",
  "最終販売価格": "¥191,748.943",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'500個'単価'JPY383.498'総額'JPY191,749'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 191749 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:09.984Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|130|0|0|1000|[1000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 1400, laminationCostKRW: 185850, slitterCostKRW: 30000, processingCost: 25902}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "130×undefinedmm",
  "数量": "1,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "1400m",
  "理論メートル": "130m",
  "確保メートル": "500m",
  "素材費_KRW": "340,929.848ウォン",
  "素材費_JPY": "¥40,911.582"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 1000, totalMeters: 1400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 3, totalDeliveryCostKRW: 295500, surcharge: 44325, totalWithSurcharge: 339825, deliveryCostJPY: 40779}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 1400, deliveryMeters: 1000, filmWidthM: 0.59, deliveryWeightKg: '67.06', packageCount: 3, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 146613.58176
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥190,597.656",
  "輸入原価": "¥200,127.539",
  "販売マージン率": "30%",
  "販売マージン額": "¥60,038.262",
  "配送料": "¥40,779",
  "最終販売価格": "¥300,944.801",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'1,000個'単価'JPY300.945'総額'JPY300,945'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 300945 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:09.986Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|130|0|0|2000|[2000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 2400, laminationCostKRW: 318600, slitterCostKRW: 30000, processingCost: 41832}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "130×undefinedmm",
  "数量": "2,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "2400m",
  "理論メートル": "260m",
  "確保メートル": "500m",
  "素材費_KRW": "584,451.168ウォン",
  "素材費_JPY": "¥70,134.14"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 2000, totalMeters: 2400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 5, totalDeliveryCostKRW: 559500, surcharge: 83925, totalWithSurcharge: 643425, deliveryCostJPY: 77211}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 2400, deliveryMeters: 2000, filmWidthM: 0.59, deliveryWeightKg: '134.12', packageCount: 6, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 248766.14016
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥323,395.982",
  "輸入原価": "¥339,565.781",
  "販売マージン率": "30%",
  "販売マージン額": "¥101,869.734",
  "配送料": "¥77,211",
  "最終販売価格": "¥518,646.516",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'2,000個'単価'JPY259.324'総額'JPY518,647'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 518647 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:09.988Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|130|0|0|5000|[5000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 5400, laminationCostKRW: 716850, slitterCostKRW: 54000, processingCost: 92502}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "130×undefinedmm",
  "数量": "5,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "5400m",
  "理論メートル": "650m",
  "確保メートル": "650m",
  "素材費_KRW": "1,315,015.128ウォン",
  "素材費_JPY": "¥157,801.815"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 5000, totalMeters: 5400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 13, totalDeliveryCostKRW: 1413500, surcharge: 212025, totalWithSurcharge: 1625524.9999999998, deliveryCostJPY: 195062.99999999997}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 5400, deliveryMeters: 5000, filmWidthM: 0.59, deliveryWeightKg: '335.30', packageCount: 13, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 558103.81536
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥725,534.96",
  "輸入原価": "¥761,811.708",
  "販売マージン率": "30%",
  "販売マージン額": "¥228,543.512",
  "配送料": "¥195,063",
  "最終販売価格": "¥1,185,418.22",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'5,000個'単価'JPY237.084'総額'JPY1,185,418'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 1185418 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:09.990Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|130|0|0|10000|[10000]|medium|1.0|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 10400, laminationCostKRW: 1380600, slitterCostKRW: 104000, processingCost: 178152}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "130×undefinedmm",
  "数量": "10,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "10400m",
  "理論メートル": "1300m",
  "確保メートル": "1300m",
  "素材費_KRW": "2,532,621.728ウォン",
  "素材費_JPY": "¥303,914.607"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 10000, totalMeters: 10400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 25, totalDeliveryCostKRW: 2799000, surcharge: 419850, totalWithSurcharge: 3218849.9999999995, deliveryCostJPY: 386261.99999999994}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 10400, deliveryMeters: 10000, filmWidthM: 0.59, deliveryWeightKg: '670.59', packageCount: 26, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 1074866.60736
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥1,397,326.59",
  "輸入原価": "¥1,467,192.919",
  "販売マージン率": "30%",
  "販売マージン額": "¥440,157.876",
  "配送料": "¥386,262",
  "最終販売価格": "¥2,293,612.795",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'10,000個'単価'JPY229.361'総額'JPY2,293,613'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 2293613 円
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {width: 1}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 1, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 1, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {width: 16}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 16, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 16, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: false, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: false, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {width: 160}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 130, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {pitch: 1}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 1, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 1, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {pitch: 16}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 16, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 16, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: false, hasDismiss: true, hasConfirm: false}
QuoteContext.tsx:1738 [updateBasicSpecs] Called with specs: {pitch: 160}
QuoteContext.tsx:1739 [updateBasicSpecs] sideWidth in payload: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:496 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: specs state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1239 [checkStepComplete] specs result: {hasValidWidth: true, requiresHeight: false, hasValidHeight: true, hasBasicSpecs: true, requiresThickness: true, …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: false, hasDismiss: true, hasConfirm: true}
 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:12.671Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|160|0|0|500|[500]|medium|1.0|fals…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 900, laminationCostKRW: 119475, slitterCostKRW: 30000, processingCost: 17937}
 【素材費計算】
 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "500個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "900m",
  "理論メートル": "80m",
  "確保メートル": "500m",
  "素材費_KRW": "219,169.188ウォン",
  "素材費_JPY": "¥26,300.303"
}
 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 500, totalMeters: 900, lossMeters: 400, perColorPerMeter: 475, …}
 【表面仕上げ】
 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
 【光沢仕上げ】
 {
  "note": "マット印刷追加費は適用されません"
}
 [Delivery Cost By Weight] {packageCount: 2, totalDeliveryCostKRW: 161000, surcharge: 24150, totalWithSurcharge: 185150, deliveryCostJPY: 22218}
 [Delivery Cost Roll Film] {totalMeters: 900, deliveryMeters: 500, filmWidthM: 0.59, deliveryWeightKg: '33.53', packageCount: 2, …}
 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 95537.30256
 【最終価格計算】
 {
  "製造者価格": "¥124,198.493",
  "輸入原価": "¥130,408.418",
  "販売マージン率": "30%",
  "販売マージン額": "¥39,122.525",
  "配送料": "¥22,218",
  "最終販売価格": "¥191,748.943",
  "note": "配送料は販売マージン計算対象外"
}
 💰 最終価格サマリー
 (index)Value(index)Value数量'500個'単価'JPY383.498'総額'JPY191,749'Object
 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 191749 円
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:12.672Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|160|0|0|1000|[1000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 1400, laminationCostKRW: 185850, slitterCostKRW: 30000, processingCost: 25902}
 【素材費計算】
 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "1,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "1400m",
  "理論メートル": "160m",
  "確保メートル": "500m",
  "素材費_KRW": "340,929.848ウォン",
  "素材費_JPY": "¥40,911.582"
}
 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 1000, totalMeters: 1400, lossMeters: 400, perColorPerMeter: 475, …}
 【表面仕上げ】
 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
 【光沢仕上げ】
 {
  "note": "マット印刷追加費は適用されません"
}
 [Delivery Cost By Weight] {packageCount: 3, totalDeliveryCostKRW: 295500, surcharge: 44325, totalWithSurcharge: 339825, deliveryCostJPY: 40779}
 [Delivery Cost Roll Film] {totalMeters: 1400, deliveryMeters: 1000, filmWidthM: 0.59, deliveryWeightKg: '67.06', packageCount: 3, …}
 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 146613.58176
 【最終価格計算】
 {
  "製造者価格": "¥190,597.656",
  "輸入原価": "¥200,127.539",
  "販売マージン率": "30%",
  "販売マージン額": "¥60,038.262",
  "配送料": "¥40,779",
  "最終販売価格": "¥300,944.801",
  "note": "配送料は販売マージン計算対象外"
}
 💰 最終価格サマリー
 (index)Value(index)Value数量'1,000個'単価'JPY300.945'総額'JPY300,945'Object
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 300945 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:12.674Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|160|0|0|2000|[2000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 2400, laminationCostKRW: 318600, slitterCostKRW: 30000, processingCost: 41832}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "2,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "2400m",
  "理論メートル": "320m",
  "確保メートル": "500m",
  "素材費_KRW": "584,451.168ウォン",
  "素材費_JPY": "¥70,134.14"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 2000, totalMeters: 2400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 5, totalDeliveryCostKRW: 559500, surcharge: 83925, totalWithSurcharge: 643425, deliveryCostJPY: 77211}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 2400, deliveryMeters: 2000, filmWidthM: 0.59, deliveryWeightKg: '134.12', packageCount: 6, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 248766.14016
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥323,395.982",
  "輸入原価": "¥339,565.781",
  "販売マージン率": "30%",
  "販売マージン額": "¥101,869.734",
  "配送料": "¥77,211",
  "最終販売価格": "¥518,646.516",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'2,000個'単価'JPY259.324'総額'JPY518,647'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 518647 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:12.675Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|160|0|0|5000|[5000]|medium|1.0|fa…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 5400, laminationCostKRW: 716850, slitterCostKRW: 54000, processingCost: 92502}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "5,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "5400m",
  "理論メートル": "800m",
  "確保メートル": "800m",
  "素材費_KRW": "1,315,015.128ウォン",
  "素材費_JPY": "¥157,801.815"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 5000, totalMeters: 5400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 13, totalDeliveryCostKRW: 1413500, surcharge: 212025, totalWithSurcharge: 1625524.9999999998, deliveryCostJPY: 195062.99999999997}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 5400, deliveryMeters: 5000, filmWidthM: 0.59, deliveryWeightKg: '335.30', packageCount: 13, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 558103.81536
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥725,534.96",
  "輸入原価": "¥761,811.708",
  "販売マージン率": "30%",
  "販売マージン額": "¥228,543.512",
  "配送料": "¥195,063",
  "最終販売価格": "¥1,185,418.22",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'5,000個'単価'JPY237.084'総額'JPY1,185,418'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 1185418 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:12.676Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|160|0|0|10000|[10000]|medium|1.0|…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 10400, laminationCostKRW: 1380600, slitterCostKRW: 104000, processingCost: 178152}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "10,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "10400m",
  "理論メートル": "1600m",
  "確保メートル": "1600m",
  "素材費_KRW": "2,532,621.728ウォン",
  "素材費_JPY": "¥303,914.607"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 10000, totalMeters: 10400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 25, totalDeliveryCostKRW: 2799000, surcharge: 419850, totalWithSurcharge: 3218849.9999999995, deliveryCostJPY: 386261.99999999994}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 10400, deliveryMeters: 10000, filmWidthM: 0.59, deliveryWeightKg: '670.59', packageCount: 26, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 1074866.60736
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥1,397,326.59",
  "輸入原価": "¥1,467,192.919",
  "販売マージン率": "30%",
  "販売マージン額": "¥440,157.876",
  "配送料": "¥386,262",
  "最終販売価格": "¥2,293,612.795",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'10,000個'単価'JPY229.361'総額'JPY2,293,613'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 2293613 円
useKeyboardNavigation.ts:57 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
useKeyboardNavigation.ts:60 [useKeyboardNavigation] Calling onNext handler
QuoteContext.tsx:1187 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1344 [checkStepComplete] post-processing complete: {selectedCount: 1, requiredGroups: 1, optionalGroups: Array(7), isRollFilm: true}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: post-processing state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1344 [checkStepComplete] post-processing complete: {selectedCount: 1, requiredGroups: 1, optionalGroups: Array(7), isRollFilm: true}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
useKeyboardNavigation.ts:57 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
useKeyboardNavigation.ts:60 [useKeyboardNavigation] Calling onNext handler
QuoteContext.tsx:1187 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1264 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1295 [checkStepComplete] sku-quantity single mode valid: true
QuoteContext.tsx:1187 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1264 [checkStepComplete] sku-quantity step check: {quantityMode: 'single', skuCount: 1, skuQuantities: Array(1), quantity: 500, twoColumnOptionApplied: null, …}
QuoteContext.tsx:1295 [checkStepComplete] sku-quantity single mode valid: true
UnifiedSKUQuantityStep.tsx:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
UnifiedSKUQuantityStep.tsx:337 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: {bagTypeId: 'roll_film', materialId: 'pet_al', skuCount: 1, skuQuantities: Array(1), totalQuantity: 500, …}
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:20.936Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
unified-pricing-engine.ts:796 [calculateQuote] CACHE CHECK: {cacheKey: 'roll_film|pet_al|160|0|0|500|[500]|medium|1.0|fals…terialId":"LLDPE","thickness":70}]|none|none|none', hasCache: false}
unified-pricing-engine.ts:807 [calculateQuote] CACHE MISS - performing calculation
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: undefined, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
UnifiedSKUQuantityStep.tsx:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 900, laminationCostKRW: 119475, slitterCostKRW: 30000, processingCost: 17937}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "500個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "900m",
  "理論メートル": "80m",
  "確保メートル": "500m",
  "素材費_KRW": "219,169.188ウォン",
  "素材費_JPY": "¥26,300.303"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 500, totalMeters: 900, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 2, totalDeliveryCostKRW: 161000, surcharge: 24150, totalWithSurcharge: 185150, deliveryCostJPY: 22218}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 900, deliveryMeters: 500, filmWidthM: 0.59, deliveryWeightKg: '33.53', packageCount: 2, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 95537.30256
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥124,198.493",
  "輸入原価": "¥130,408.418",
  "販売マージン率": "30%",
  "販売マージン額": "¥39,122.525",
  "配送料": "¥22,218",
  "最終販売価格": "¥191,748.943",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'500個'単価'JPY383.498'総額'JPY191,749'Object
UnifiedSKUQuantityStep.tsx:382 [UnifiedSKUQuantityStep] Price calculated: {unitPrice: 383.498, totalPrice: 191749, quantity: 500}
UnifiedSKUQuantityStep.tsx:657 [handleApplyTwoColumnOption] Called with optionType: 2 {twoColumnOptions: {…}, isApplying: false, quoteStateTwoColumnOptionApplied: null}
UnifiedSKUQuantityStep.tsx:676 [handleApplyTwoColumnOption] Proceeding with option application
UnifiedSKUQuantityStep.tsx:703 [handleApplyTwoColumnOption] Selected option: {columnCount: 2, columnWidth: 160, quantity: 1000, unitPrice: 230, totalPrice: 230000, …}
UnifiedSKUQuantityStep.tsx:790 [UnifiedSKUQuantityStep] Applied 2-column 2 option: {option: {…}, preserveSKUCount: false, adjustedQuantityPerSKU: 1000, adjustedTotalQuantity: 1000}
UnifiedSKUQuantityStep.tsx:796 [handleApplyTwoColumnOption] Option application completed successfully
UnifiedSKUQuantityStep.tsx:801 [handleApplyTwoColumnOption] setIsApplying(false) called
QuoteContext.tsx:995 [APPLY_TWO_COLUMN_OPTION] Applied option: {optionType: 2, unitPrice: 230, totalPrice: 230000, originalUnitPrice: 383.498, quantity: 1000}
QuoteContext.tsx:1046 [APPLY_TWO_COLUMN_OPTION] Single SKU: {effectiveOriginalUnitPrice: 383.498, optionType: 2, unitPrice: 230, totalPrice: 230000}
QuoteContext.tsx:995 [APPLY_TWO_COLUMN_OPTION] Applied option: {optionType: 2, unitPrice: 230, totalPrice: 230000, originalUnitPrice: 383.498, quantity: 1000}
QuoteContext.tsx:1046 [APPLY_TWO_COLUMN_OPTION] Single SKU: {effectiveOriginalUnitPrice: 383.498, optionType: 2, unitPrice: 230, totalPrice: 230000}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1264 [checkStepComplete] sku-quantity step check: {quantityMode: 'sku', skuCount: 1, skuQuantities: Array(1), quantity: 1000, twoColumnOptionApplied: 2, …}
QuoteContext.tsx:1282 [checkStepComplete] 2列生産総数量チェック: {currentTotalQuantity: 1000, fixedTotalQuantity: 1000, totalQuantityValid: true}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1264 [checkStepComplete] sku-quantity step check: {quantityMode: 'sku', skuCount: 1, skuQuantities: Array(1), quantity: 1000, twoColumnOptionApplied: 2, …}
QuoteContext.tsx:1282 [checkStepComplete] 2列生産総数量チェック: {currentTotalQuantity: 1000, fixedTotalQuantity: 1000, totalQuantityValid: true}
UnifiedSKUQuantityStep.tsx:308 [UnifiedSKUQuantityStep] Price calculation skipped - 2-column option applied
UnifiedSKUQuantityStep.tsx:442 [UnifiedSKUQuantityStep] Skipping clear - 2-column option just applied
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:25.498Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 500, quantity: 500, …}
 【2列生産割引適用】
 {
  "適用オプション": "倍数量（31% OFF）",
  "割引単価": "¥230/個",
  "割引総額": "¥230,000"
}
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 900, laminationCostKRW: 119475, slitterCostKRW: 30000, processingCost: 17937}
 【素材費計算】
 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "500個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "900m",
  "理論メートル": "80m",
  "確保メートル": "500m",
  "素材費_KRW": "219,169.188ウォン",
  "素材費_JPY": "¥26,300.303"
}
 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 500, totalMeters: 900, lossMeters: 400, perColorPerMeter: 475, …}
 【表面仕上げ】
 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
 【光沢仕上げ】
 {
  "note": "マット印刷追加費は適用されません"
}
 [Delivery Cost By Weight] {packageCount: 2, totalDeliveryCostKRW: 161000, surcharge: 24150, totalWithSurcharge: 185150, deliveryCostJPY: 22218}
 [Delivery Cost Roll Film] {totalMeters: 900, deliveryMeters: 500, filmWidthM: 0.59, deliveryWeightKg: '33.53', packageCount: 2, …}
 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 95537.30256
 【最終価格計算】
 {
  "製造者価格": "¥124,198.493",
  "輸入原価": "¥130,408.418",
  "販売マージン率": "30%",
  "販売マージン額": "¥39,122.525",
  "配送料": "¥22,218",
  "最終販売価格": "¥191,748.943",
  "note": "配送料は販売マージン計算対象外"
}
 💰 最終価格サマリー
 (index)Value(index)Value数量'500個'単価'JPY383.498'総額'JPY191,749'Object
 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 230000 円
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:25.500Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
 【2列生産割引適用】
 {
  "適用オプション": "倍数量（31% OFF）",
  "割引単価": "¥230/個",
  "割引総額": "¥230,000"
}
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 1400, laminationCostKRW: 185850, slitterCostKRW: 30000, processingCost: 25902}
 【素材費計算】
 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "1,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "1400m",
  "理論メートル": "160m",
  "確保メートル": "500m",
  "素材費_KRW": "340,929.848ウォン",
  "素材費_JPY": "¥40,911.582"
}
 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 1000, totalMeters: 1400, lossMeters: 400, perColorPerMeter: 475, …}
 【表面仕上げ】
 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
 【光沢仕上げ】
 {
  "note": "マット印刷追加費は適用されません"
}
 [Delivery Cost By Weight] {packageCount: 3, totalDeliveryCostKRW: 295500, surcharge: 44325, totalWithSurcharge: 339825, deliveryCostJPY: 40779}
 [Delivery Cost Roll Film] {totalMeters: 1400, deliveryMeters: 1000, filmWidthM: 0.59, deliveryWeightKg: '67.06', packageCount: 3, …}
 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 146613.58176
 【最終価格計算】
 {
  "製造者価格": "¥190,597.656",
  "輸入原価": "¥200,127.539",
  "販売マージン率": "30%",
  "販売マージン額": "¥60,038.262",
  "配送料": "¥40,779",
  "最終販売価格": "¥300,944.801",
  "note": "配送料は販売マージン計算対象外"
}
 💰 最終価格サマリー
 (index)Value(index)Value数量'1,000個'単価'JPY300.945'総額'JPY300,945'Object
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 230000 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:25.501Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 2000, quantity: 2000, …}
 【2列生産割引適用】
 {
  "適用オプション": "倍数量（31% OFF）",
  "割引単価": "¥230/個",
  "割引総額": "¥230,000"
}
 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 2400, laminationCostKRW: 318600, slitterCostKRW: 30000, processingCost: 41832}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "2,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "2400m",
  "理論メートル": "320m",
  "確保メートル": "500m",
  "素材費_KRW": "584,451.168ウォン",
  "素材費_JPY": "¥70,134.14"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 2000, totalMeters: 2400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 5, totalDeliveryCostKRW: 559500, surcharge: 83925, totalWithSurcharge: 643425, deliveryCostJPY: 77211}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 2400, deliveryMeters: 2000, filmWidthM: 0.59, deliveryWeightKg: '134.12', packageCount: 6, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 248766.14016
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥323,395.982",
  "輸入原価": "¥339,565.781",
  "販売マージン率": "30%",
  "販売マージン額": "¥101,869.734",
  "配送料": "¥77,211",
  "最終販売価格": "¥518,646.516",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'2,000個'単価'JPY259.324'総額'JPY518,647'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 230000 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:25.502Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 5000, quantity: 5000, …}
unified-pricing-engine.ts:48 【2列生産割引適用】
unified-pricing-engine.ts:49 {
  "適用オプション": "倍数量（31% OFF）",
  "割引単価": "¥230/個",
  "割引総額": "¥230,000"
}
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 5400, laminationCostKRW: 716850, slitterCostKRW: 54000, processingCost: 92502}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "5,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "5400m",
  "理論メートル": "800m",
  "確保メートル": "800m",
  "素材費_KRW": "1,315,015.128ウォン",
  "素材費_JPY": "¥157,801.815"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 5000, totalMeters: 5400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 13, totalDeliveryCostKRW: 1413500, surcharge: 212025, totalWithSurcharge: 1625524.9999999998, deliveryCostJPY: 195062.99999999997}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 5400, deliveryMeters: 5000, filmWidthM: 0.59, deliveryWeightKg: '335.30', packageCount: 13, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 558103.81536
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥725,534.96",
  "輸入原価": "¥761,811.708",
  "販売マージン率": "30%",
  "販売マージン額": "¥228,543.512",
  "配送料": "¥195,063",
  "最終販売価格": "¥1,185,418.22",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'5,000個'単価'JPY237.084'総額'JPY1,185,418'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 230000 円
ImprovedQuotingWizard.tsx:4161 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:25.503Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 10000, quantity: 10000, …}
unified-pricing-engine.ts:48 【2列生産割引適用】
unified-pricing-engine.ts:49 {
  "適用オプション": "倍数量（31% OFF）",
  "割引単価": "¥230/個",
  "割引総額": "¥230,000"
}
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 10400, laminationCostKRW: 1380600, slitterCostKRW: 104000, processingCost: 178152}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "10,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "10400m",
  "理論メートル": "1600m",
  "確保メートル": "1600m",
  "素材費_KRW": "2,532,621.728ウォン",
  "素材費_JPY": "¥303,914.607"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 10000, totalMeters: 10400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 25, totalDeliveryCostKRW: 2799000, surcharge: 419850, totalWithSurcharge: 3218849.9999999995, deliveryCostJPY: 386261.99999999994}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 10400, deliveryMeters: 10000, filmWidthM: 0.59, deliveryWeightKg: '670.59', packageCount: 26, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 1074866.60736
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥1,397,326.59",
  "輸入原価": "¥1,467,192.919",
  "販売マージン率": "30%",
  "販売マージン額": "¥440,157.876",
  "配送料": "¥386,262",
  "最終販売価格": "¥2,293,612.795",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'10,000個'単価'JPY229.361'総額'JPY2,293,613'Object
ImprovedQuotingWizard.tsx:4192 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 230000 円
useKeyboardNavigation.ts:57 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
useKeyboardNavigation.ts:60 [useKeyboardNavigation] Calling onNext handler
ImprovedQuotingWizard.tsx:4405 [handleNext] Current state: {quantityMode: 'sku', skuCount: 1, skuQuantities: Array(1), quantity: 1000}
ImprovedQuotingWizard.tsx:4430 [handleNext] hasValidSKUData Check:
ImprovedQuotingWizard.tsx:4431 [handleNext] - skuCount > 1: false (skuCount = 1 )
ImprovedQuotingWizard.tsx:4432 [handleNext] - skuQuantities exists: true
ImprovedQuotingWizard.tsx:4433 [handleNext] - skuQuantities: [1000]
ImprovedQuotingWizard.tsx:4434 [handleNext] - Length check: 1 === 1 : true
ImprovedQuotingWizard.tsx:4435 [handleNext] - Every check (all >= 100): true
ImprovedQuotingWizard.tsx:4436 [handleNext] - FINAL hasValidSKUData: true
ImprovedQuotingWizard.tsx:4440 [handleNext] SKU mode detected (via hasValidSKUData), quantities: [1000]
ImprovedQuotingWizard.tsx:4449 [handleNext] Calculated total quantity: 1000
ImprovedQuotingWizard.tsx:4458 [handleNext] Calculating quote for SKU mode, total quantity: 1000
ImprovedQuotingWizard.tsx:4462 [handleNext] デフォルトmarkupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
QuoteContext.tsx:1187 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1264 [checkStepComplete] sku-quantity step check: {quantityMode: 'sku', skuCount: 1, skuQuantities: Array(1), quantity: 1000, twoColumnOptionApplied: 2, …}
QuoteContext.tsx:1282 [checkStepComplete] 2列生産総数量チェック: {currentTotalQuantity: 1000, fixedTotalQuantity: 1000, totalQuantityValid: true}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: sku-quantity state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1264 [checkStepComplete] sku-quantity step check: {quantityMode: 'sku', skuCount: 1, skuQuantities: Array(1), quantity: 1000, twoColumnOptionApplied: 2, …}
QuoteContext.tsx:1282 [checkStepComplete] 2列生産総数量チェック: {currentTotalQuantity: 1000, fixedTotalQuantity: 1000, totalQuantityValid: true}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: true, hasPrevious: true, hasDismiss: true, hasConfirm: true}
ImprovedQuotingWizard.tsx:4475 [handleNext] Customer markup rate: 0
ImprovedQuotingWizard.tsx:4484 [handleNext] DIAGNOSTIC - calculateQuote PARAMS: {bagTypeId: 'roll_film', materialId: 'pet_al', skuCount: 1, skuQuantities: Array(1), totalQuantity: 1000, …}
unified-pricing-engine.ts:763 [calculateQuote] DIAGNOSTIC ENTRY: {timestamp: '2026-03-18T21:30:33.291Z', useSKUCalculation: true, skuQuantities: Array(1), totalSKUQuantity: 1000, quantity: 1000, …}
unified-pricing-engine.ts:48 【2列生産割引適用】
unified-pricing-engine.ts:49 {
  "適用オプション": "倍数量（31% OFF）",
  "割引単価": "¥230/個",
  "割引総額": "¥230,000"
}
unified-pricing-engine.ts:1470 [performSKUCalculation] ENTRY: {markupRate_param: 0, markupRate_will_default_to: 0, skuQuantities: Array(1)}
unified-pricing-engine.ts:1493 [performSKUCalculation] AFTER DESTRUCTURING: {markupRate_used: 0}
unified-pricing-engine.ts:48 【後加工乗数】
unified-pricing-engine.ts:49 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "適用乗数": "1.00"
}
unified-pricing-engine.ts:891 [Processing Cost] Roll film: lamination + slitter only {materialWidthM: 0.59, totalMeters: 1400, laminationCostKRW: 185850, slitterCostKRW: 30000, processingCost: 25902}
unified-pricing-engine.ts:48 【素材費計算】
unified-pricing-engine.ts:49 {
  "パウチタイプ": "roll_film",
  "サイズ": "160×undefinedmm",
  "数量": "1,000個",
  "原反幅": "590mm (0.59m)",
  "総使用メートル": "1400m",
  "理論メートル": "160m",
  "確保メートル": "500m",
  "素材費_KRW": "340,929.848ウォン",
  "素材費_JPY": "¥40,911.582"
}
unified-pricing-engine.ts:2157 [Printing Cost Roll Film] {filmWidthM: 0.59, lengthInMeters: 1000, totalMeters: 1400, lossMeters: 400, perColorPerMeter: 475, …}
unified-pricing-engine.ts:48 【表面仕上げ】
unified-pricing-engine.ts:49 {
  "マット仕上げ": false,
  "光沢仕上げ": true,
  "選択オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no",
    "zipper-yes"
  ]
}
unified-pricing-engine.ts:48 【光沢仕上げ】
unified-pricing-engine.ts:49 {
  "note": "マット印刷追加費は適用されません"
}
unified-pricing-engine.ts:2440 [Delivery Cost By Weight] {packageCount: 3, totalDeliveryCostKRW: 295500, surcharge: 44325, totalWithSurcharge: 339825, deliveryCostJPY: 40779}
unified-pricing-engine.ts:2312 [Delivery Cost Roll Film] {totalMeters: 1400, deliveryMeters: 1000, filmWidthM: 0.59, deliveryWeightKg: '67.06', packageCount: 3, …}
unified-pricing-engine.ts:1146 [UnifiedPricingEngine] manufacturerMargin: 0.3 baseCost: 146613.58176
unified-pricing-engine.ts:48 【最終価格計算】
unified-pricing-engine.ts:49 {
  "製造者価格": "¥190,597.656",
  "輸入原価": "¥200,127.539",
  "販売マージン率": "30%",
  "販売マージン額": "¥60,038.262",
  "配送料": "¥40,779",
  "最終販売価格": "¥300,944.801",
  "note": "配送料は販売マージン計算対象外"
}
unified-pricing-engine.ts:65 💰 最終価格サマリー
unified-pricing-engine.ts:66 (index)Value(index)Value数量'1,000個'単価'JPY300.945'総額'JPY300,945'Object
ImprovedQuotingWizard.tsx:4526 [handleNext] 価格計算完了 - 総額: 230000 円, markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
ImprovedQuotingWizard.tsx:4548 [handleNext] Enhanced result: {unitPrice: 230, totalPrice: 230000, currency: 'JPY', quantity: 1000, filmUsage: 1400, …}
ImprovedQuotingWizard.tsx:4549 [handleNext] Setting result with hasValidSKUData: true
ImprovedQuotingWizard.tsx:4550 [handleNext] Setting result with skuQuantities: [1000]
ImprovedQuotingWizard.tsx:4556 [handleNext] About to change step to result
QuoteContext.tsx:1187 [checkStepComplete] Called with step: result state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
QuoteContext.tsx:1187 [checkStepComplete] Called with step: result state: {bagTypeId: 'roll_film', materialId: 'pet_al', width: 160, height: undefined, pitch: 160, …}
ImprovedQuotingWizard.tsx:3773 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3773 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
useKeyboardNavigation.ts:28 [useKeyboardNavigation] handlersRef updated: {hasNext: false, hasPrevious: true, hasDismiss: true, hasConfirm: false}
pouch-cost-calculator.ts:309 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
pouch-cost-calculator.ts:1606 [ParallelProductionOption] Start {count: 2, rollWidth: 590, effectiveMaterialWidth: 570, filmWidth: 160, totalFilmWidth: 320, …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.57, lengthWithLoss: 1400}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:594 [calculateMaterialCost] RESULT: {totalCost: 335539.848, totalWeight: 92.90316, totalCostRounded: 335540}
film-cost-calculator.ts:714 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.57, lengthWithLoss: 1400, postProcessingOptions: Array(8), hasGlossy: true, hasMatte: false}
film-cost-calculator.ts:735 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
pouch-cost-calculator.ts:1635 [ParallelProductionOption] filmCostResult {materialCost: 335540, printingCost: 665000, laminationCost: 179550, slitterCost: 30000, deliveryCostJPY: 56311.2, …}
pouch-cost-calculator.ts:1672 [ParallelProductionOption] Discount Applied {count: 2, discountableCost: 1180090, nonDiscountableCost: 86311, discountedCost: 2183167, totalDiscountedCost: 2269478, …}
pouch-cost-calculator.ts:1606 [ParallelProductionOption] Start {count: 3, rollWidth: 590, effectiveMaterialWidth: 570, filmWidth: 160, totalFilmWidth: 480, …}
pouch-cost-calculator.ts:1635 [ParallelProductionOption] filmCostResult {materialCost: 335540, printingCost: 665000, laminationCost: 179550, slitterCost: 30000, deliveryCostJPY: 56311.2, …}
pouch-cost-calculator.ts:1672 [ParallelProductionOption] Discount Applied {count: 3, discountableCost: 1180090, nonDiscountableCost: 86311, discountedCost: 3186243, totalDiscountedCost: 3272554, …}
pouch-cost-calculator.ts:1606 [ParallelProductionOption] Start {count: 4, rollWidth: 760, effectiveMaterialWidth: 740, filmWidth: 160, totalFilmWidth: 640, …}
film-cost-calculator.ts:542 [calculateMaterialCost] INPUT: {layers: Array(4), widthM: 0.74, lengthWithLoss: 1400}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'AL', grammage: undefined, thickness: 7, effectiveThickness: 7, thicknessMm: 0.007, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'PET', grammage: undefined, thickness: 12, effectiveThickness: 12, thicknessMm: 0.012, …}
film-cost-calculator.ts:569 [calculateMaterialCost] LAYER: {materialId: 'LLDPE', grammage: undefined, thickness: 70, effectiveThickness: 70, thicknessMm: 0.07, …}
film-cost-calculator.ts:594 [calculateMaterialCost] RESULT: {totalCost: 435613.13600000006, totalWeight: 120.61112000000001, totalCostRounded: 435613}
film-cost-calculator.ts:714 [calculateSurfaceTreatmentCost] DEBUG: {widthM: 0.74, lengthWithLoss: 1400, postProcessingOptions: Array(8), hasGlossy: true, hasMatte: false}
film-cost-calculator.ts:735 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
pouch-cost-calculator.ts:1635 [ParallelProductionOption] filmCostResult {materialCost: 435613, printingCost: 665000, laminationCost: 233100, slitterCost: 30000, deliveryCostJPY: 70389, …}
pouch-cost-calculator.ts:1672 [ParallelProductionOption] Discount Applied {count: 4, discountableCost: 1333713, nonDiscountableCost: 100389, discountedCost: 4734681, totalDiscountedCost: 4835070, …}
ImprovedQuotingWizard.tsx:3773 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3773 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
pouch-cost-calculator.ts:309 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
pouch-cost-calculator.ts:1606 [ParallelProductionOption] Start {count: 2, rollWidth: 590, effectiveMaterialWidth: 570, filmWidth: 160, totalFilmWidth: 320, …}
pouch-cost-calculator.ts:1635 [ParallelProductionOption] filmCostResult {materialCost: 335540, printingCost: 665000, laminationCost: 179550, slitterCost: 30000, deliveryCostJPY: 56311.2, …}
pouch-cost-calculator.ts:1672 [ParallelProductionOption] Discount Applied {count: 2, discountableCost: 1180090, nonDiscountableCost: 86311, discountedCost: 2183167, totalDiscountedCost: 2269478, …}
pouch-cost-calculator.ts:1606 [ParallelProductionOption] Start {count: 3, rollWidth: 590, effectiveMaterialWidth: 570, filmWidth: 160, totalFilmWidth: 480, …}
pouch-cost-calculator.ts:1635 [ParallelProductionOption] filmCostResult {materialCost: 335540, printingCost: 665000, laminationCost: 179550, slitterCost: 30000, deliveryCostJPY: 56311.2, …}
pouch-cost-calculator.ts:1672 [ParallelProductionOption] Discount Applied {count: 3, discountableCost: 1180090, nonDiscountableCost: 86311, discountedCost: 3186243, totalDiscountedCost: 3272554, …}
pouch-cost-calculator.ts:1606 [ParallelProductionOption] Start {count: 4, rollWidth: 760, effectiveMaterialWidth: 740, filmWidth: 160, totalFilmWidth: 640, …}
pouch-cost-calculator.ts:1635 [ParallelProductionOption] filmCostResult {materialCost: 435613, printingCost: 665000, laminationCost: 233100, slitterCost: 30000, deliveryCostJPY: 70389, …}
pouch-cost-calculator.ts:1672 [ParallelProductionOption] Discount Applied {count: 4, discountableCost: 1333713, nonDiscountableCost: 100389, discountedCost: 4734681, totalDiscountedCost: 4835070, …}
ImprovedQuotingWizard.tsx:3773 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
ImprovedQuotingWizard.tsx:3773 [ResultStep] Debug: {resultHasValidSKUData: true, resultSkuQuantities: Array(1), resultSkuCount: 1, stateSkuCount: 1, stateSkuQuantities: Array(1), …}
