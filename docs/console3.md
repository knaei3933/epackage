site.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1635597,
  "manufacturerPriceKRW": 2126276.1,
  "manufacturerPriceJPY": 255153.132,
  "dutyJPY": 12757.656600000002,
  "deliveryJPY": 15358,
  "subtotalJPY": 283268.7886,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 368249.4251800001,
  "salesMarginJPY": 84980.63658000005,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 368249.4251800001
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 368249.4251800001
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
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
 [100円丸め] 丸め前 totalPrice: 352891.4251800001 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 352900 (差分: 8.574819999921601 )
 [100円丸め] 計算式: Math.ceil( 352891.4251800001 / 100) * 100 = 3529 * 100 = 352900
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 352900 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "stand_up",
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
  "calculatedFilmWidth": 635,
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
  "baseCostKRW": 2582452,
  "manufacturerPriceKRW": 3357187.6,
  "manufacturerPriceJPY": 402862.512,
  "dutyJPY": 20143.1256,
  "deliveryJPY": 15358,
  "subtotalJPY": 438363.6376,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 569872.7288800001,
  "salesMarginJPY": 131509.09128000005,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 569872.7288800001
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 569872.7288800001
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
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
 [100円丸め] 丸め前 totalPrice: 554514.7288800001 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 554600 (差分: 85.27111999993213 )
 [100円丸め] 計算式: Math.ceil( 554514.7288800001 / 100) * 100 = 5546 * 100 = 554600
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 554600 円
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] Product type changed from lap_seal to stand_up - resetting SKU quantities
 [getDefaultPostProcessingOptions] bagTypeId: stand_up isExcludedZipperCorner: false Returning defaults: Array(8)
 [calculatePostProcessingMultiplier] Input options: Array(8)
 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] glossy excluded from multiplier (calculated as additional cost)
 [calculatePostProcessingMultiplier] notch-yes (Vノッチ): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] hang-hole-6mm (吊り穴 6mm): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] corner-round (角丸): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] top-open (上端開封): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] machi-printing-no (マチ印刷なし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: Array(7)
 [SET_BASIC_SPECS] bagTypeId changed: lap_seal -> stand_up
 [SET_BASIC_SPECS] Updating post-processing options: Array(8)
 [SET_BASIC_SPECS] newPostProcessingMultiplier: 1
 [SET_BASIC_SPECS] Product type changed from lap_seal to stand_up - resetting SKU quantities
 [getDefaultPostProcessingOptions] bagTypeId: stand_up isExcludedZipperCorner: false Returning defaults: Array(8)
 [calculatePostProcessingMultiplier] Input options: Array(8)
 [calculatePostProcessingMultiplier] zipper-yes (ジッパーあり): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] glossy excluded from multiplier (calculated as additional cost)
 [calculatePostProcessingMultiplier] notch-yes (Vノッチ): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] hang-hole-6mm (吊り穴 6mm): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] corner-round (角丸): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] top-open (上端開封): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] machi-printing-no (マチ印刷なし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: Array(7)
 [SET_BASIC_SPECS] bagTypeId changed: lap_seal -> stand_up
 [SET_BASIC_SPECS] Updating post-processing options: Array(8)
 [SET_BASIC_SPECS] newPostProcessingMultiplier: 1
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [useKeyboardNavigation] ArrowRight pressed. canProceed: false onNext exists: false
 [useKeyboardNavigation] ArrowRight blocked. canProceed: false onNext exists: false
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 419000 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 620600 円
 [useKeyboardNavigation] ArrowRight pressed. canProceed: false onNext exists: false
 [useKeyboardNavigation] ArrowRight blocked. canProceed: false onNext exists: false
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 352900 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 554600 円
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "stand_up",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 30
  },
  "skuCount": 1,
  "totalQuantity": 1000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 325,
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
  "baseCostKRW": 1256855,
  "manufacturerPriceKRW": 1633911.5,
  "manufacturerPriceJPY": 196069.38,
  "dutyJPY": 9803.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 221230.84900000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 287600.10370000004,
  "salesMarginJPY": 66369.25470000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 287600.10370000004
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 287600.10370000004
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
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
 [100円丸め] 丸め前 totalPrice: 272242.10370000004 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 272300 (差分: 57.89629999996396 )
 [100円丸め] 計算式: Math.ceil( 272242.10370000004 / 100) * 100 = 2723 * 100 = 272300
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "stand_up",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 30
  },
  "skuCount": 1,
  "totalQuantity": 2000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 325,
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
  "baseCostKRW": 1256855,
  "manufacturerPriceKRW": 1633911.5,
  "manufacturerPriceJPY": 196069.38,
  "dutyJPY": 9803.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 221230.84900000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 287600.10370000004,
  "salesMarginJPY": 66369.25470000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 287600.10370000004
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 287600.10370000004
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
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
 [100円丸め] 丸め前 totalPrice: 272242.10370000004 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 272300 (差分: 57.89629999996396 )
 [100円丸め] 計算式: Math.ceil( 272242.10370000004 / 100) * 100 = 2723 * 100 = 272300
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "stand_up",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 30
  },
  "skuCount": 1,
  "totalQuantity": 3000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 325,
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
  "baseCostKRW": 1256855,
  "manufacturerPriceKRW": 1633911.5,
  "manufacturerPriceJPY": 196069.38,
  "dutyJPY": 9803.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 221230.84900000002,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 287600.10370000004,
  "salesMarginJPY": 66369.25470000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 287600.10370000004
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 287600.10370000004
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
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
 [100円丸め] 丸め前 totalPrice: 272242.10370000004 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 272300 (差分: 57.89629999996396 )
 [100円丸め] 計算式: Math.ceil( 272242.10370000004 / 100) * 100 = 2723 * 100 = 272300
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "stand_up",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 30
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 325,
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
  "baseCostKRW": 1304198,
  "manufacturerPriceKRW": 1695457.4000000001,
  "manufacturerPriceJPY": 203454.888,
  "dutyJPY": 10172.744400000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 228985.6324,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 297681.32212,
  "salesMarginJPY": 68695.68972000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 297681.32212
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 297681.32212
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
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
 [100円丸め] 丸め前 totalPrice: 282323.32212 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 282400 (差分: 76.67787999997381 )
 [100円丸め] 計算式: Math.ceil( 282323.32212 / 100) * 100 = 2824 * 100 = 282400
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 282400 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "stand_up",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 30
  },
  "skuCount": 1,
  "totalQuantity": 10000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 325,
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
  "baseCostKRW": 1919654,
  "manufacturerPriceKRW": 2495550.2,
  "manufacturerPriceJPY": 299466.02400000003,
  "dutyJPY": 14973.301200000002,
  "deliveryJPY": 15358,
  "subtotalJPY": 329797.3252,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 428736.52276,
  "salesMarginJPY": 98939.19756,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 428736.52276
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 428736.52276
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
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
 [100円丸め] 丸め前 totalPrice: 413378.52276 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 413400 (差分: 21.477239999978337 )
 [100円丸め] 計算式: Math.ceil( 413378.52276 / 100) * 100 = 4134 * 100 = 413400
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 413400 円
 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
 [useKeyboardNavigation] Calling onNext handler
 [checkStepComplete] Called with step: post-processing state: Object
 [checkStepComplete] post-processing complete: Object
 [checkStepComplete] Called with step: post-processing state: Object
 [checkStepComplete] post-processing complete: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [Fast Refresh] rebuilding
 [QuoteContext] initialState created: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [Fast Refresh] done in 63ms
 [RealTimePriceDisplay] Auth ready, user detected: 54fd7b31-b805-43cf-b92e-898ddd066875
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] Auth ready, user detected: 54fd7b31-b805-43cf-b92e-898ddd066875
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 272300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 282400 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE HIT - returning cached result
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 413400 円
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] Product type changed from stand_up to box - resetting SKU quantities
 [getDefaultPostProcessingOptions] bagTypeId: box isExcludedZipperCorner: true Returning defaults: Array(6)
 [calculatePostProcessingMultiplier] Input options: Array(6)
 [calculatePostProcessingMultiplier] glossy excluded from multiplier (calculated as additional cost)
 [calculatePostProcessingMultiplier] notch-yes (Vノッチ): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] hang-hole-6mm (吊り穴 6mm): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] top-open (上端開封): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] machi-printing-no (マチ印刷なし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: Array(5)
 [SET_BASIC_SPECS] bagTypeId changed: stand_up -> box
 [SET_BASIC_SPECS] Updating post-processing options: Array(6)
 [SET_BASIC_SPECS] newPostProcessingMultiplier: 1
 [SET_BASIC_SPECS] Product type changed from stand_up to box - resetting SKU quantities
 [getDefaultPostProcessingOptions] bagTypeId: box isExcludedZipperCorner: true Returning defaults: Array(6)
 [calculatePostProcessingMultiplier] Input options: Array(6)
 [calculatePostProcessingMultiplier] glossy excluded from multiplier (calculated as additional cost)
 [calculatePostProcessingMultiplier] notch-yes (Vノッチ): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] hang-hole-6mm (吊り穴 6mm): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] valve-no (バルブなし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] top-open (上端開封): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] machi-printing-no (マチ印刷なし): 1, 1 * 1 = 1
 [calculatePostProcessingMultiplier] Final multiplier: 1 Details: Array(5)
 [SET_BASIC_SPECS] bagTypeId changed: stand_up -> box
 [SET_BASIC_SPECS] Updating post-processing options: Array(6)
 [SET_BASIC_SPECS] newPostProcessingMultiplier: 1
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 1000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
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
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1566855,
  "manufacturerPriceKRW": 2036911.5,
  "manufacturerPriceJPY": 244429.38,
  "dutyJPY": 12221.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 272008.84900000005,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 353611.50370000006,
  "salesMarginJPY": 81602.65470000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 353611.50370000006
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 353611.50370000006
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 338253.50370000006 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 338300 (差分: 46.496299999940675 )
 [100円丸め] 計算式: Math.ceil( 338253.50370000006 / 100) * 100 = 3383 * 100 = 338300
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 2000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1566855,
  "manufacturerPriceKRW": 2036911.5,
  "manufacturerPriceJPY": 244429.38,
  "dutyJPY": 12221.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 272008.84900000005,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 353611.50370000006,
  "salesMarginJPY": 81602.65470000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 353611.50370000006
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 353611.50370000006
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 338253.50370000006 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 338300 (差分: 46.496299999940675 )
 [100円丸め] 計算式: Math.ceil( 338253.50370000006 / 100) * 100 = 3383 * 100 = 338300
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 3000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1566855,
  "manufacturerPriceKRW": 2036911.5,
  "manufacturerPriceJPY": 244429.38,
  "dutyJPY": 12221.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 272008.84900000005,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 353611.50370000006,
  "salesMarginJPY": 81602.65470000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 353611.50370000006
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 353611.50370000006
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 338253.50370000006 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 338300 (差分: 46.496299999940675 )
 [100円丸め] 計算式: Math.ceil( 338253.50370000006 / 100) * 100 = 3383 * 100 = 338300
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
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
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1614198,
  "manufacturerPriceKRW": 2098457.4,
  "manufacturerPriceJPY": 251814.88799999998,
  "dutyJPY": 12590.7444,
  "deliveryJPY": 15358,
  "subtotalJPY": 279763.6324,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 363692.72212,
  "salesMarginJPY": 83929.08971999999,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 363692.72212
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 363692.72212
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 348334.72212 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 348400 (差分: 65.27788000000874 )
 [100円丸め] 計算式: Math.ceil( 348334.72212 / 100) * 100 = 3484 * 100 = 348400
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 348400 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 130,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 10000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
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
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 2229654,
  "manufacturerPriceKRW": 2898550.2,
  "manufacturerPriceJPY": 347826.02400000003,
  "dutyJPY": 17391.3012,
  "deliveryJPY": 15358,
  "subtotalJPY": 380575.3252,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 494747.92276000004,
  "salesMarginJPY": 114172.59756000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 494747.92276000004
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 494747.92276000004
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 479389.92276000004 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 479400 (差分: 10.077239999955054 )
 [100円丸め] 計算式: Math.ceil( 479389.92276000004 / 100) * 100 = 4794 * 100 = 479400
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 479400 円
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [updateBasicSpecs] Called with specs: Object
 [updateBasicSpecs] sideWidth in payload: undefined
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth: undefined state.sideWidth: 50 newSideWidth: 50
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [checkStepComplete] Called with step: specs state: Object
 [checkStepComplete] specs result: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [RealTimePriceDisplay] 計算開始 - 数量: 1000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 180,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 1000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1566855,
  "manufacturerPriceKRW": 2036911.5,
  "manufacturerPriceJPY": 244429.38,
  "dutyJPY": 12221.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 272008.84900000005,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 353611.50370000006,
  "salesMarginJPY": 81602.65470000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 353611.50370000006
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 353611.50370000006
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 338253.50370000006 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 338300 (差分: 46.496299999940675 )
 [100円丸め] 計算式: Math.ceil( 338253.50370000006 / 100) * 100 = 3383 * 100 = 338300
 [RealTimePriceDisplay] 計算結果 - 数量: 1000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 2000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 180,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 2000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1566855,
  "manufacturerPriceKRW": 2036911.5,
  "manufacturerPriceJPY": 244429.38,
  "dutyJPY": 12221.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 272008.84900000005,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 353611.50370000006,
  "salesMarginJPY": 81602.65470000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 353611.50370000006
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 353611.50370000006
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 338253.50370000006 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 338300 (差分: 46.496299999940675 )
 [100円丸め] 計算式: Math.ceil( 338253.50370000006 / 100) * 100 = 3383 * 100 = 338300
 [RealTimePriceDisplay] 計算結果 - 数量: 2000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 3000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 180,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 3000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1566855,
  "manufacturerPriceKRW": 2036911.5,
  "manufacturerPriceJPY": 244429.38,
  "dutyJPY": 12221.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 272008.84900000005,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 353611.50370000006,
  "salesMarginJPY": 81602.65470000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 353611.50370000006
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 353611.50370000006
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 338253.50370000006 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 338300 (差分: 46.496299999940675 )
 [100円丸め] 計算式: Math.ceil( 338253.50370000006 / 100) * 100 = 3383 * 100 = 338300
 [RealTimePriceDisplay] 計算結果 - 数量: 3000 価格: 338300 円
 [RealTimePriceDisplay] 計算開始 - 数量: 5000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 180,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1614198,
  "manufacturerPriceKRW": 2098457.4,
  "manufacturerPriceJPY": 251814.88799999998,
  "dutyJPY": 12590.7444,
  "deliveryJPY": 15358,
  "subtotalJPY": 279763.6324,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 363692.72212,
  "salesMarginJPY": 83929.08971999999,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 363692.72212
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 363692.72212
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 348334.72212 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 348400 (差分: 65.27788000000874 )
 [100円丸め] 計算式: Math.ceil( 348334.72212 / 100) * 100 = 3484 * 100 = 348400
 [RealTimePriceDisplay] 計算結果 - 数量: 5000 価格: 348400 円
 [RealTimePriceDisplay] 計算開始 - 数量: 10000 markupRate: 0 ユーザーID: 54fd7b31-b805-43cf-b92e-898ddd066875
 [calculateQuote] DIAGNOSTIC ENTRY: Object
 [calculateQuote] CACHE CHECK: Object
 [calculateQuote] CACHE MISS - performing calculation
 [performSKUCalculation] ENTRY: Object
 [performSKUCalculation] AFTER DESTRUCTURING: Object
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 180,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 10000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 2229654,
  "manufacturerPriceKRW": 2898550.2,
  "manufacturerPriceJPY": 347826.02400000003,
  "dutyJPY": 17391.3012,
  "deliveryJPY": 15358,
  "subtotalJPY": 380575.3252,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 494747.92276000004,
  "salesMarginJPY": 114172.59756000002,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 494747.92276000004
}
 [calculateCostBreakdown] Rounding inconsistency detected Object
 [calculateCostBreakdown] totalCost（小数点以下保持）: 494747.92276000004
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 479389.92276000004 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 479400 (差分: 10.077239999955054 )
 [100円丸め] 計算式: Math.ceil( 479389.92276000004 / 100) * 100 = 4794 * 100 = 479400
 [RealTimePriceDisplay] 計算結果 - 数量: 10000 価格: 479400 円
 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
 [useKeyboardNavigation] Calling onNext handler
 [checkStepComplete] Called with step: post-processing state: Object
 [checkStepComplete] post-processing complete: Object
 [checkStepComplete] Called with step: post-processing state: Object
 [checkStepComplete] post-processing complete: Object
 [useKeyboardNavigation] handlersRef updated: Object
 [useKeyboardNavigation] ArrowRight pressed. canProceed: true onNext exists: true
 [useKeyboardNavigation] Calling onNext handler
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
 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 180,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 500,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [PouchCostCalculator] Loaded pricing settings from DB: 66 settings
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1566855,
  "manufacturerPriceKRW": 2036911.5,
  "manufacturerPriceJPY": 244429.38,
  "dutyJPY": 12221.469000000001,
  "deliveryJPY": 15358,
  "subtotalJPY": 272008.84900000005,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 353611.50370000006,
  "salesMarginJPY": 81602.65470000001,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 353611.50370000006
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 353611.50370000006
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 338253.50370000006 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 338300 (差分: 46.496299999940675 )
 [100円丸め] 計算式: Math.ceil( 338253.50370000006 / 100) * 100 = 3383 * 100 = 338300
 [UnifiedSKUQuantityStep] Price calculated: Object
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
 [Film Width Calculation] {
  "pouchType": "box",
  "dimensions": {
    "width": 130,
    "height": 180,
    "depth": 0
  },
  "skuCount": 1,
  "totalQuantity": 5000,
  "materialWidth": 590,
  "printableWidth": 570,
  "optimalColumnCount": 1,
  "calculatedFilmWidth": 292,
  "note": "パウチ: 1列生産"
}
 [calculateTheoreticalMeters] Object
 [calculateTheoreticalMeters] result: Object
 [calculateSKUCost] Total Film Calculation: Object
 [calculateFilmCost] DEBUG: Object
 [calculateSKUCost] Total Film Cost Breakdown: Object
 [Outsourcing Shipping] Object
 [Pouch Processing Cost] Object
 [calculateSKUCost] Total Processing Cost: Object
 [calculateSKUCost] SKU 0 Allocation: Object
 [calculateCostBreakdown] DEBUG: Object
 [PouchCostCalculator] manufacturerMargin: 0.3
 [PouchCostCalculator] salesMargin: 0.3
 [calculateCostBreakdown] PRICE CALC: Object
 [calculateCostBreakdown] Price Calculation Detail {
  "baseCostKRW": 1614198,
  "manufacturerPriceKRW": 2098457.4,
  "manufacturerPriceJPY": 251814.88799999998,
  "dutyJPY": 12590.7444,
  "deliveryJPY": 15358,
  "subtotalJPY": 279763.6324,
  "salesMargin": 0.3,
  "priceAfterSalesMargin": 363692.72212,
  "salesMarginJPY": 83929.08971999999,
  "customerMarkupRate": 0,
  "customerDiscountJPY": 0,
  "finalPriceJPY": 363692.72212
}
 [calculateCostBreakdown] totalCost（小数点以下保持）: 363692.72212
 [calculateSKUCost] Delivery Calculation: Object
 【SKU後加工オプション】
 {
  "後加工オプション": [
    "glossy",
    "hang-hole-6mm",
    "machi-printing-no",
    "notch-yes",
    "top-open",
    "valve-no"
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
 [100円丸め] 丸め前 totalPrice: 348334.72212 (型: number )
 [100円丸め] 丸め後 roundedTotalPrice: 348400 (差分: 65.27788000000874 )
 [100円丸め] 計算式: Math.ceil( 348334.72212 / 100) * 100 = 3484 * 100 = 348400
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
forward-logs-shared.ts:95 [calculateQuote] DIAGNOSTIC ENTRY: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE CHECK: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE HIT - returning cached result
forward-logs-shared.ts:95 [useKeyboardNavigation] handlersRef updated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Price calculated: Object
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
forward-logs-shared.ts:95 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: Object
forward-logs-shared.ts:95 [calculateQuote] DIAGNOSTIC ENTRY: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE CHECK: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE HIT - returning cached result
forward-logs-shared.ts:95 [useKeyboardNavigation] handlersRef updated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Price calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
forward-logs-shared.ts:95 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: Object
forward-logs-shared.ts:95 [calculateQuote] DIAGNOSTIC ENTRY: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE CHECK: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE HIT - returning cached result
forward-logs-shared.ts:95 [useKeyboardNavigation] handlersRef updated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Price calculated: Object
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Two column options calculated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
forward-logs-shared.ts:95 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: Object
forward-logs-shared.ts:95 [calculateQuote] DIAGNOSTIC ENTRY: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE CHECK: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE HIT - returning cached result
forward-logs-shared.ts:95 [useKeyboardNavigation] handlersRef updated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Price calculated: Object
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [checkStepComplete] Called with step: sku-quantity state: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity step check: Object
forward-logs-shared.ts:95 [checkStepComplete] sku-quantity single mode valid: true
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Discount cleared, resetting all related states
forward-logs-shared.ts:95 [SKU Step] DIAGNOSTIC - calculateQuote PARAMS: Object
forward-logs-shared.ts:95 [calculateQuote] DIAGNOSTIC ENTRY: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE CHECK: Object
forward-logs-shared.ts:95 [calculateQuote] CACHE HIT - returning cached result
forward-logs-shared.ts:95 [useKeyboardNavigation] handlersRef updated: Object
forward-logs-shared.ts:95 [UnifiedSKUQuantityStep] Price calculated: Object
