 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
 [getDefaultPostProcessingOptions] Selected defaults: Array(8)
 [QuoteContext] initialState created: Object
 [HMR] connected
 [QuoteProvider] State updated: Object
 [AuthContext] Initializing auth context...
 [AuthContext] Fetching session from /api/auth/current-user... Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] Auth loading, waiting...
 [AuthContext] Session updated successfully Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [RealTimePriceDisplay] Auth ready, user detected: 54fd7b31-b805-43cf-b92e-898ddd066875
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] 計算開始 - 数量: 500 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 754430,
  "manufacturerPriceKRW": 980759,
  "manufacturerPriceJPY": 117691.08,
  "dutyJPY": 5884.554,
  "deliveryJPY": 15358,
  "subtotalJPY": 138933.63400000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 180613.72420000003,
  "salesMarginJPY": 41680.090200000006,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 180613.72420000003
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 180613.72420000003
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 180613.32420000003 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 180700 (差分: 86.67579999996815 )
 [100円丸め] 計算式: Math.ceil( 180613.32420000003 / 100) * 100 = 1807 * 100 = 180700
 [RealTimePriceDisplay] 計算結果 - 数量: 500 価格: 180700 円
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 883821,
  "manufacturerPriceKRW": 1148967.3,
  "manufacturerPriceJPY": 137876.076,
  "dutyJPY": 6893.803800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 160127.8798,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 208166.24374,
  "salesMarginJPY": 48038.36394000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 208166.24374
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 208166.24374
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 208165.84374 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 208200 (差分: 34.15625999998883 )
 [100円丸め] 計算式: Math.ceil( 208165.84374 / 100) * 100 = 2082 * 100 = 208200
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 208200 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1142601,
  "manufacturerPriceKRW": 1485381.3,
  "manufacturerPriceJPY": 178245.756,
  "dutyJPY": 8912.2878,
  "deliveryJPY": 15358,
  "subtotalJPY": 202516.04379999998,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 263270.85693999997,
  "salesMarginJPY": 60754.813139999984,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 263270.85693999997
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 263270.85693999997
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 263270.45693999995 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 263300 (差分: 29.54306000005454 )
 [100円丸め] 計算式: Math.ceil( 263270.45693999995 / 100) * 100 = 2633 * 100 = 263300
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 263300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1918942,
  "manufacturerPriceKRW": 2494624.6,
  "manufacturerPriceJPY": 299354.952,
  "dutyJPY": 14967.7476,
  "deliveryJPY": 15358,
  "subtotalJPY": 329680.6996,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 428584.90948000003,
  "salesMarginJPY": 98904.20988000004,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 428584.90948000003
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 428584.90948000003
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 443942.10948000004 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 444000 (差分: 57.89051999995718 )
 [100円丸め] 計算式: Math.ceil( 443942.10948000004 / 100) * 100 = 4440 * 100 = 444000
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 444000 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 3220243,
  "manufacturerPriceKRW": 4186315.9000000004,
  "manufacturerPriceJPY": 502357.90800000005,
  "dutyJPY": 25117.895400000005,
  "deliveryJPY": 15358,
  "subtotalJPY": 542833.8034000001,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 705683.9444200002,
  "salesMarginJPY": 162850.1410200001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 705683.9444200002
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 705683.9444200002
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 736398.7444200002 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 736400 (差分: 1.25557999976445 )
 [100円丸め] 計算式: Math.ceil( 736398.7444200002 / 100) * 100 = 7364 * 100 = 736400
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 736400 円
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] Kraft material selected - setting quantities to 1000m units
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
 [SET_BASIC_SPECS] Kraft material selected - setting quantities to 1000m units
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [QuoteProvider] State updated: Object
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1248926,
  "manufacturerPriceKRW": 1623603.8,
  "manufacturerPriceJPY": 194832.456,
  "dutyJPY": 9741.622800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 219932.07880000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 285911.70244,
  "salesMarginJPY": 65979.62364,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 285911.70244
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 285911.70244
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 270553.70244 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 270600 (差分: 46.29755999997724 )
 [100円丸め] 計算式: Math.ceil( 270553.70244 / 100) * 100 = 2706 * 100 = 270600
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 270600 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1248926,
  "manufacturerPriceKRW": 1623603.8,
  "manufacturerPriceJPY": 194832.456,
  "dutyJPY": 9741.622800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 219932.07880000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 285911.70244,
  "salesMarginJPY": 65979.62364,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 285911.70244
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 285911.70244
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 270553.70244 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 270600 (差分: 46.29755999997724 )
 [100円丸め] 計算式: Math.ceil( 270553.70244 / 100) * 100 = 2706 * 100 = 270600
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 270600 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 200,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 3000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1539604,
  "manufacturerPriceKRW": 2001485.2,
  "manufacturerPriceJPY": 240178.224,
  "dutyJPY": 12008.9112,
  "deliveryJPY": 15358,
  "subtotalJPY": 267545.1352,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 347808.67576,
  "salesMarginJPY": 80263.54056,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 347808.67576
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 347808.67576
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 332450.67576 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 332500 (差分: 49.324239999987185 )
 [100円丸め] 計算式: Math.ceil( 332450.67576 / 100) * 100 = 3325 * 100 = 332500
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 332500 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 2120959,
  "manufacturerPriceKRW": 2757246.7,
  "manufacturerPriceJPY": 330869.604,
  "dutyJPY": 16543.4802,
  "deliveryJPY": 15358,
  "subtotalJPY": 362771.0842,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 471602.40946,
  "salesMarginJPY": 108831.32526000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 471602.40946
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 471602.40946
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 456244.40946 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 456300 (差分: 55.590540000004694 )
 [100円丸め] 計算式: Math.ceil( 456244.40946 / 100) * 100 = 4563 * 100 = 456300
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 456300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateMaterialCost] INPUT: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] LAYER: Object
 [calculateMaterialCost] RESULT: Object
 [calculateSurfaceTreatmentCost] DEBUG: Object
 [calculateSurfaceTreatmentCost] Glossy treatment - no additional cost
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 3581748,
  "manufacturerPriceKRW": 4656272.4,
  "manufacturerPriceJPY": 558752.6880000001,
  "dutyJPY": 27937.634400000006,
  "deliveryJPY": 15358,
  "subtotalJPY": 602048.3224000001,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 782662.8191200001,
  "salesMarginJPY": 180614.49672000005,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 782662.8191200001
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 782662.8191200001
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 767304.8191200001 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 767400 (差分: 95.18087999988347 )
 [100円丸め] 計算式: Math.ceil( 767304.8191200001 / 100) * 100 = 7674 * 100 = 767400
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 767400 円
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: undefined newSideWidth: undefined
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [QuoteProvider] State updated: Object
 [checkStepComplete] Called with step: post-processing state: Object
 [checkStepComplete] post-processing complete: Object
 [checkStepComplete] Called with step: post-processing state: Object
 [checkStepComplete] post-processing complete: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1248926,
  "manufacturerPriceKRW": 1623603.8,
  "manufacturerPriceJPY": 194832.456,
  "dutyJPY": 9741.622800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 219932.07880000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 285911.70244,
  "salesMarginJPY": 65979.62364,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 285911.70244
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 285911.70244
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 270553.70244 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 270600 (差分: 46.29755999997724 )
 [100円丸め] 計算式: Math.ceil( 270553.70244 / 100) * 100 = 2706 * 100 = 270600
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 270600 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1248926,
  "manufacturerPriceKRW": 1623603.8,
  "manufacturerPriceJPY": 194832.456,
  "dutyJPY": 9741.622800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 219932.07880000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 285911.70244,
  "salesMarginJPY": 65979.62364,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 285911.70244
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 285911.70244
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 270553.70244 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 270600 (差分: 46.29755999997724 )
 [100円丸め] 計算式: Math.ceil( 270553.70244 / 100) * 100 = 2706 * 100 = 270600
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 270600 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "flat_3_side",
  "dimensions": {
    "width": 200,
    "height": 300,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 3000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 641,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1539604,
  "manufacturerPriceKRW": 2001485.2,
  "manufacturerPriceJPY": 240178.224,
  "dutyJPY": 12008.9112,
  "deliveryJPY": 15358,
  "subtotalJPY": 267545.1352,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 347808.67576,
  "salesMarginJPY": 80263.54056,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 347808.67576
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 347808.67576
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 332450.67576 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 332500 (差分: 49.324239999987185 )
 [100円丸め] 計算式: Math.ceil( 332450.67576 / 100) * 100 = 3325 * 100 = 332500
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 332500 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 2120959,
  "manufacturerPriceKRW": 2757246.7,
  "manufacturerPriceJPY": 330869.604,
  "dutyJPY": 16543.4802,
  "deliveryJPY": 15358,
  "subtotalJPY": 362771.0842,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 471602.40946,
  "salesMarginJPY": 108831.32526000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 471602.40946
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 471602.40946
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 456244.40946 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 456300 (差分: 55.590540000004694 )
 [100円丸め] 計算式: Math.ceil( 456244.40946 / 100) * 100 = 4563 * 100 = 456300
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 456300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 3581748,
  "manufacturerPriceKRW": 4656272.4,
  "manufacturerPriceJPY": 558752.6880000001,
  "dutyJPY": 27937.634400000006,
  "deliveryJPY": 15358,
  "subtotalJPY": 602048.3224000001,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 782662.8191200001,
  "salesMarginJPY": 180614.49672000005,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 782662.8191200001
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 782662.8191200001
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 767304.8191200001 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 767400 (差分: 95.18087999988347 )
 [100円丸め] 計算式: Math.ceil( 767304.8191200001 / 100) * 100 = 7674 * 100 = 767400
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 767400 円
 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
 [useKeyboardNavigation] Calling onNext handler
 [checkStepComplete] Called with step: sku-quantity state: Object
 [checkStepComplete] sku-quantity step check: Object
 [checkStepComplete] sku-quantity single mode valid: true
 [checkStepComplete] Called with step: sku-quantity state: Object
 [checkStepComplete] sku-quantity step check: Object
 [checkStepComplete] sku-quantity single mode valid: true
 [UnifiedSKUQuantityStep] Two column options calculated: Object
 [UnifiedSKUQuantityStep] Two column options calculated: Object
 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: Object
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1248926,
  "manufacturerPriceKRW": 1623603.8,
  "manufacturerPriceJPY": 194832.456,
  "dutyJPY": 9741.622800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 219932.07880000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 285911.70244,
  "salesMarginJPY": 65979.62364,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 285911.70244
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 285911.70244
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 270553.70244 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 270600 (差分: 46.29755999997724 )
 [100円丸め] 計算式: Math.ceil( 270553.70244 / 100) * 100 = 2706 * 100 = 270600
 [UnifiedSKUQuantityStep] Price calculated: Object
 [UnifiedSKUQuantityStep] Two column options calculated: Object
 [UnifiedSKUQuantityStep] Two column options calculated: Object
 [checkStepComplete] Called with step: sku-quantity state: Object
 [checkStepComplete] sku-quantity step check: Object
 [checkStepComplete] sku-quantity single mode valid: true
 [checkStepComplete] Called with step: sku-quantity state: Object
 [checkStepComplete] sku-quantity step check: Object
 [checkStepComplete] sku-quantity single mode valid: true
 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: Object
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [Film Width Calculation] {
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
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1248926,
  "manufacturerPriceKRW": 1623603.8,
  "manufacturerPriceJPY": 194832.456,
  "dutyJPY": 9741.622800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 219932.07880000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 285911.70244,
  "salesMarginJPY": 65979.62364,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 285911.70244
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 285911.70244
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
 [SKU Calculation - Using Glossy Finish] Object
 【SKU追加料金】
 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
 [100円丸め] 丸め前 totalPrice: 270553.70244 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 270600 (差分: 46.29755999997724 )
 [100円丸め] 計算式: Math.ceil( 270553.70244 / 100) * 100 = 2706 * 100 = 270600
 [UnifiedSKUQuantityStep] Price calculated: Object
 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
forward-logs-shared.ts:95 [useKeyboardNavigation] Calling onNext handler
forward-logs-shared.ts:95 [handleNext] Current state: Object
forward-logs-shared.ts:95 [handleNext] hasValidSKUData Check:
forward-logs-shared.ts:95 [handleNext] - skuCount > 1: false (skuCount = 1 )
forward-logs-shared.ts:95 [handleNext] - skuQuantities exists: true
forward-logs-shared.ts:95 [handleNext] - skuQuantities: Array(1)
forward-logs-shared.ts:95 [handleNext] - Length check: 1 === 1 : true
forward-logs-shared.ts:95 [handleNext] - Every check (all >= 100): true
forward-logs-shared.ts:95 [handleNext] - FINAL hasValidSKUData: true
forward-logs-shared.ts:95 [handleNext] SKU mode detected (via hasValidSKUData), quantities: Array(1)
forward-logs-shared.ts:95 [handleNext] Setting quantityMode to "sku"
forward-logs-shared.ts:95 [handleNext] Calculated total quantity: 500
forward-logs-shared.ts:95 [handleNext] Calculating quote for SKU mode, total quantity: 500
forward-logs-shared.ts:95 [handleNext] デフォルトmarkupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity SKU mode valid: true
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity SKU mode valid: true
forward-logs-shared.ts:95 [useKeyboardNavigation] handlersRef updated: Object
forward-logs-shared.ts:95 [handleNext] Customer markup rate: 0
forward-logs-shared.ts:95 [handleNext] DIAGNOSTIC - calculateQuote PARAMS: Object
forward-logs-shared.ts:95 [calculateQuote] DIAGNOSTIC ENTRY: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE CHECK: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE MISS - performing calculation
forward-logs-shared.ts:95 [performSKUCalculation] ENTRY: Object
forward-logs-shared.ts:95 [performSKUCalculation] AFTER DESTRUCTURING: Object
forward-logs-shared.ts:95 [Film Width Calculation] {
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
forward-logs-shared.ts:95 [calculateTheoreticalMeters] Object
forward-logs-shared.ts:95 [calculateTheoreticalMeters] result: Object
forward-logs-shared.ts:95 [calculateSKUCost] Total Film Calculation: Object
forward-logs-shared.ts:95 [calculateFilmCost] DEBUG: Object
forward-logs-shared.ts:95 [calculateSKUCost] Total Film Cost Breakdown: Object
forward-logs-shared.ts:95 [Pouch Processing Cost] Object
forward-logs-shared.ts:95 [calculateSKUCost] Total Processing Cost: Object
forward-logs-shared.ts:95 [calculateSKUCost] SKU 0 Allocation: Object
forward-logs-shared.ts:95 [calculateCostBreakdown] DEBUG: Object
forward-logs-shared.ts:95 [PouchCostCalculator] manufacturerMargin: 0.3
forward-logs-shared.ts:95 [PouchCostCalculator] salesMargin: 0.3
forward-logs-shared.ts:95 [calculateCostBreakdown] PRICE CALC: Object
forward-logs-shared.ts:95 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1248926,
  "manufacturerPriceKRW": 1623603.8,
  "manufacturerPriceJPY": 194832.456,
  "dutyJPY": 9741.622800000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 219932.07880000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 285911.70244,
  "salesMarginJPY": 65979.62364,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 285911.70244
}
forward-logs-shared.ts:95 [calculateCostBreakdown] Rounding inconsistency detected Object
forward-logs-shared.ts:95 [calculateCostBreakdown] totalCost（小数点以下保持）: 285911.70244
forward-logs-shared.ts:95 [calculateSKUCost] Delivery Calculation: Object
forward-logs-shared.ts:95 【SKU後加工オプション】
forward-logs-shared.ts:95 {
  "後加工オプション": [
    "corner-round",
    "glossy",
    "hang-hole-6mm",
    "notch-yes",
    "sealing-width-5mm",
    "top-open",
    "valve-no",
    "zipper-yes"
  ],
  "マット仕上げ": false,
  "光沢仕上げ": true
}
forward-logs-shared.ts:95 [SKU Calculation - Using Glossy Finish] Object
forward-logs-shared.ts:95 【SKU追加料金】
forward-logs-shared.ts:95 {
  "SKU数": 1,
  "追加料金": "¥0",
  "計算式": "(1 - 1) × ¥10,000 = ¥0"
}
forward-logs-shared.ts:95 [100円丸め] 丸め前 totalPrice: 270553.70244 (型: number )
forward-logs-shared.ts:95 [100円丸め] 丸め後 roundedTotalPrice: 270600 (差分: 46.29755999997724 )
forward-logs-shared.ts:95 [100円丸め] 計算式: Math.ceil( 270553.70244 / 100) * 100 = 2706 * 100 = 270600
forward-logs-shared.ts:95 [handleNext] 価格計算完了 - 総額: 270600 円, markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
forward-logs-shared.ts:95 [handleNext] Enhanced result: Object
forward-logs-shared.ts:95 [handleNext] Setting result with hasValidSKUData: true
forward-logs-shared.ts:95 [handleNext] Setting result with skuQuantities: Array(1)
forward-logs-shared.ts:95 [handleNext] About to change step to result
forward-logs-shared.ts:95 [checkStepComplete] Called with step: result state: Object
forward-logs-shared.ts:95 [checkStepComplete] Called with step: result state: Object
forward-logs-shared.ts:95 [ResultStep] Debug: Object
forward-logs-shared.ts:95 [ResultStep] Debug: Object
forward-logs-shared.ts:95 [useKeyboardNavigation] handlersRef updated: Object
forward-logs-shared.ts:95 [ResultStep] Debug: Object
forward-logs-shared.ts:95 [ResultStep] Debug: Object
