export interface ProcessingOptionConfig {
  id: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  beforeImage?: string
  afterImage: string
  thumbnail?: string
  priceMultiplier: number
  features: string[]
  featuresJa: string[]
  compatibleWith: string[]
  category: 'opening-sealing' | 'surface-treatment' | 'shape-structure' | 'functionality' | 'spout-size'
  processingTime: string // in business days
  processingTimeJa: string
  minimumQuantity: number
  technicalNotes: string
  technicalNotesJa: string
  benefits: string[]
  benefitsJa: string[]
  applications: string[]
  applicationsJa: string[]
  isDefault?: boolean  // カテゴリのデフォルト値
  variants?: {
    id: string
    name: string
    nameJa: string
    description?: string
    descriptionJa?: string
    image: string
    priceAdjustment: number
  }[]
}

// Post-processing options matching exact 修正사항.md requirements
// 配列順序はPostProcessingStep.tsxのPOST_PROCESSING_OPTIONSに合わせて調整
export const processingOptionsConfig: ProcessingOptionConfig[] = [
  // =====================================================
  // 1. ZIPPER (ジッパー)
  // =====================================================

  // 1-1. Zipper No (ジッパーなし)
  {
    id: 'zipper-no',
    name: 'ジッパーなし',
    nameJa: 'ジッパーなし',
    description: '通常熱接着密閉機能',
    descriptionJa: '通常熱接着密閉機能',
    beforeImage: '/images/post-processing/1.ジッパーなし.png',
    afterImage: '/images/post-processing/1.ジッパーなし.png',
    thumbnail: '/images/post-processing/1.ジッパーなし.png',
    priceMultiplier: 1.00,
    features: ['通常熱接着', 'コスト効率', '簡単な生産'],
    featuresJa: ['通常熱接着', 'コスト効率', '簡単な生産'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Heat seal without zipper mechanism',
    technicalNotesJa: 'ジッパー機構なし熱接着',
    benefits: ['コスト削減', '生産効率', '信頼性'],
    benefitsJa: ['コスト削減', '生産効率', '信頼性'],
    applications: ['一回用包装', '医薬品', 'サンプルパック'],
    applicationsJa: ['一回用包装', '医薬品', 'サンプルパック']
    // isDefault: false  // デフォルトは zipper-yes (ジッパー付き)
  },
  {
    id: 'zipper-yes',
    name: 'ジッパーあり',
    nameJa: 'ジッパーあり',
    description: '再利用可能なジッパー密閉機能',
    descriptionJa: '再利用可能なジッパー密閉機能',
    beforeImage: '/images/post-processing/1.ジッパーなし.png',
    afterImage: '/images/post-processing/1.ジッパーあり.png',
    thumbnail: '/images/post-processing/1.ジッパーあり.png',
    priceMultiplier: 1.0,  // Fixed price: pouch-cost-calculator.ts handles zipper surcharge (30,000 KRW)
    features: ['ジッパー再密閉', '鮮度維持', '消費者に便利'],
    featuresJa: ['ジッパー再密閉', '鮮度維持', '消費者に便利'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'opening-sealing',
    processingTime: '+2 business days',
    processingTimeJa: '+2営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Double-track resealable zipper',
    technicalNotesJa: 'ダブルトラック再密閉ジッパー',
    benefits: ['製品鮮度', '再利用性', '消費者満足度'],
    benefitsJa: ['製品鮮度', '再利用性', '消費者満足度'],
    applications: ['食品', '健康サプリメント', 'ベーカリー製品'],
    applicationsJa: ['食品', '健康サプリメント', 'ベーカリー製品'],
    variants: [
      {
        id: 'zipper-position-any',
        name: 'ジッパー位置：任せ',
        nameJa: 'ジッパー位置：任せ',
        description: '最適な位置にジッパー配置（推奨）',
        descriptionJa: '最適な位置にジッパー配置（推奨）',
        image: '/images/post-processing/zipper-position-any.png',
        priceAdjustment: 0.00
      },
      {
        id: 'zipper-position-specified',
        name: 'ジッパー位置：指定',
        nameJa: 'ジッパー位置：指定',
        description: '特定位置にジッパー配置',
        descriptionJa: '特定位置にジッパー配置',
        image: '/images/post-processing/zipper-position-specified.png',
        priceAdjustment: 0.02
      }
    ],
    isDefault: true  // デフォルト値（ジッパー付き）
  },

  // =====================================================
  // 2. SURFACE TREATMENT (表面処理)
  // =====================================================

  // 2-1. Glossy (光沢)
  {
    id: 'glossy',
    name: '光沢処理',
    nameJa: '光沢処理',
    description: '光沢のある表面処理',
    descriptionJa: '光沢のある表面処理',
    beforeImage: '/images/post-processing/2.マット.png',
    afterImage: '/images/post-processing/2.光沢.png',
    thumbnail: '/images/post-processing/2.光沢.png',
    priceMultiplier: 1.0, // デフォルト（追加費用なし）
    features: ['光沢効果', '高級感', '視覚的的魅力'],
    featuresJa: ['光沢効果', '高級感', '視覚的魅力'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'surface-treatment',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Glossy coating finish',
    technicalNotesJa: '光沢コーティング仕上げ',
    benefits: ['製品外観向上', 'ブランドイメージ強化'],
    benefitsJa: ['製品外観向上', 'ブランドイメージ強化'],
    applications: ['プレミアム製品', '化粧品'],
    applicationsJa: ['プレミアム製品', '化粧品'],
    isDefault: true  // デフォルト値
  },

  // 2-2. Matte (マット)
  {
    id: 'matte',
    name: 'マット処理',
    nameJa: 'マット処理',
    description: 'マット表面処理',
    descriptionJa: 'マット表面処理',
    beforeImage: '/images/post-processing/2.光沢.png',
    afterImage: '/images/post-processing/2.マット.png',
    thumbnail: '/images/post-processing/2.マット.png',
    priceMultiplier: 1.0, // 固定（追加費用なし）
    features: ['무광 효과', '부드러운 질감', '글레어 방지'],
    featuresJa: ['マット効果', '滑らかな手触り', '指紋防止'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'surface-treatment',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Matte coating finish',
    technicalNotesJa: 'マットコーティング仕上げ',
    benefits: ['프리미엄 느낌', '고급 이미지'],
    benefitsJa: ['プレミアム感', '高級なイメージ'],
    applications: ['고급 식품', '전자제품'],
    applicationsJa: ['高級食品', '電子製品']
  },

  // =====================================================
  // 3. NOTCH (ノッチ)
  // =====================================================

  // 3-1. Notch Yes (Vノッチ)
  {
    id: 'notch-yes',
    name: 'Vノッチ',
    nameJa: 'Vノッチ',
    description: '簡単な開封のためのVノッチ',
    descriptionJa: '簡単な開封のためのVノッチ',
    beforeImage: '/images/post-processing/3.ノッチなし.png',
    afterImage: '/images/post-processing/3.ノッチあり.png',
    thumbnail: '/images/post-processing/3.ノッチあり.png',
    priceMultiplier: 1.0,
    features: ['簡単な開封', '道具不要', '綺麗な切断'],
    featuresJa: ['簡単な開封', '道具不要', 'きれいな切断'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Precision-cut V-shaped tear notch',
    technicalNotesJa: '精密カットV型ティアノッチ',
    benefits: ['消費者利便性', 'ユーザー体験向上'],
    benefitsJa: ['消費者利便性', 'ユーザー体験向上'],
    applications: ['スナック', '菓子', '医薬品'],
    applicationsJa: ['間食', 'スナック', '医薬品'],
    isDefault: true  // デフォルト値（Vノッチ）
  },
  // 3-2. Notch Straight (直線ノッチ)
  {
    id: 'notch-straight',
    name: '直線ノッチ',
    nameJa: '直線ノッチ',
    description: '直線的なノッチ加工',
    descriptionJa: '直線的なノッチ加工',
    beforeImage: '/images/post-processing/3.ノッチなし.png',
    afterImage: '/images/post-processing/3.直線ノッチ.png',
    thumbnail: '/images/post-processing/3.直線ノッチ.png',
    priceMultiplier: 1.0,
    features: ['綺麗な切断', '直線的デザイン', '開封簡単'],
    featuresJa: ['きれいな切断', '直線的デザイン', '開封簡単'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Straight-line tear notch',
    technicalNotesJa: '直線型ティアノッチ',
    benefits: ['綺麗な開封', 'デザイン性'],
    benefitsJa: ['きれいな開封', 'デザイン性'],
    applications: ['スナック', '菓子', '食品'],
    applicationsJa: ['間食', 'スナック', '食品']
    // isDefault: false  // デフォルトは notch-yes (Vノッチ)
  },
  {
    id: 'notch-no',
    name: 'ノッチなし',
    nameJa: 'ノッチなし',
    description: 'きれいなエッジ',
    descriptionJa: 'きれいなエッジ',
    beforeImage: '/images/post-processing/3.ノッチなし.png',
    afterImage: '/images/post-processing/3.ノッチなし.png',
    thumbnail: '/images/post-processing/3.ノッチなし.png',
    priceMultiplier: 1.00,
    features: ['綺麗なデザイン', '標準仕上げ'],
    featuresJa: ['クリーンなデザイン', '標準仕上げ'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Clean edge without notch',
    technicalNotesJa: 'ノッチなしのクリーンエッジ',
    benefits: ['コスト効率', '生産スピード'],
    benefitsJa: ['コスト効率', '生産スピード'],
    applications: ['産業用包装', '標準製品'],
    applicationsJa: ['産業包装', '標準製品']
    // isDefault: false (notch-yes is left side in PostProcessingStep.tsx)
  },

  // =====================================================
  // 4. HANG HOLE (吊り穴)
  // =====================================================

  // 4-1. Hang Hole 6mm
  {
    id: 'hang-hole-6mm',
    name: '吊り穴 6mm',
    nameJa: '吊り穴 6mm',
    description: '6mm吊り穴処理',
    descriptionJa: '6mm吊り穴処理',
    beforeImage: '/images/post-processing/4.걸이타공 없음.png',
    afterImage: '/images/post-processing/4.걸이타공 있음.png',
    thumbnail: '/images/post-processing/4.걸이타공 있음.png',
    priceMultiplier: 1.0,
    features: ['6mm 걸이타공', '소매 전시용', '공간 효율'],
    featuresJa: ['6mm吊り穴', '小売表示', '省スペース'],
    compatibleWith: ['stand_up', 'flat_3_side', 'lap_seal'],
    category: 'shape-structure',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: '6mm precision punching',
    technicalNotesJa: '6mm精密パンチング',
    benefits: ['소매 호환성', '전시 효율', '가시성'],
    benefitsJa: ['小売互換性', '表示効率', '可視性'],
    applications: ['소매 제품', '매장용'],
    applicationsJa: ['小売製品', '店舗用'],
    variants: [
      {
        id: 'hang-hole-6mm-single',
        name: '6mm吊り穴 1個',
        nameJa: '6mm吊り穴 1個',
        description: '6mm吊り穴 1個',
        descriptionJa: '6mm吊り穴 1個',
        image: '/images/post-processing/hang-hole-6mm-single.png',
        priceAdjustment: 0.00
      },
      {
        id: 'hang-hole-6mm-double',
        name: '6mm吊り穴 2個',
        nameJa: '6mm吊り穴 2個',
        description: '6mm吊り穴 2個',
        descriptionJa: '6mm吊り穴 2個',
        image: '/images/post-processing/hang-hole-6mm-double.png',
        priceAdjustment: 0.01
      }
    ],
    isDefault: true  // デフォルト値（左側）
  },
  {
    id: 'hang-hole-8mm',
    name: '吊り穴 8mm',
    nameJa: '吊り穴 8mm',
    description: '8mm吊り穴処理',
    descriptionJa: '8mm吊り穴処理',
    beforeImage: '/images/post-processing/4.걸이타공 없음.png',
    afterImage: '/images/post-processing/4.걸이타공 있음.png',
    thumbnail: '/images/post-processing/4.걸이타공 있음.png',
    priceMultiplier: 1.0,
    features: ['8mm 걸이타공', '대형 제품용', '내구성'],
    featuresJa: ['8mm吊り穴', '大型製品用', '耐久性'],
    compatibleWith: ['stand_up', 'flat_3_side', 'heavy_duty'],
    category: 'shape-structure',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1500,
    technicalNotes: '8mm precision punching with reinforcement',
    technicalNotesJa: '8mm精密パンチング補強',
    benefits: ['내구성 향상', '대형 제품 지원', '안전성'],
    benefitsJa: ['耐久性向上', '大型製品対応', '安全性'],
    applications: ['대형 제품', '산업용품'],
    applicationsJa: ['大型製品', '産業用品']
  },
  {
    id: 'hang-hole-no',
    name: '吊り穴なし',
    nameJa: '吊り穴なし',
    description: '吊り穴なしのクリーン表面',
    descriptionJa: '吊り穴なしのクリーン表面',
    beforeImage: '/images/post-processing/4.걸이타공 없음.png',
    afterImage: '/images/post-processing/4.걸이타공 없음.png',
    thumbnail: '/images/post-processing/4.걸이타공 없음.png',
    priceMultiplier: 1.00,
    features: ['깨끗한 표면', '다목적 사용'],
    featuresJa: ['クリーンな表面', '多目的使用'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Clean surface without hang holes',
    technicalNotesJa: '穴なしのクリーン表面',
    benefits: ['디자인 자유도', '비용 절감'],
    benefitsJa: ['デザイン自由度', 'コスト削減'],
    applications: ['一般的な包装', '直接包装'],
    applicationsJa: ['一般包装', '直接パッケージング']
    // isDefault: false (hang-hole-6mm is left side in PostProcessingStep.tsx)
  },

  // =====================================================
  // 5. CORNER (角)
  // =====================================================

  // 5-1. Corner Round (角丸)
  {
    id: 'corner-round',
    name: '角丸',
    nameJa: '角丸',
    description: '安全な角丸加工',
    descriptionJa: '安全な角丸加工',
    beforeImage: '/images/post-processing/5.角直角.png',
    afterImage: '/images/post-processing/5.角丸.png',
    thumbnail: '/images/post-processing/5.角丸.png',
    priceMultiplier: 1.0,
    features: ['安全な取り扱い', '柔らかい感触', '怪我の防止'],
    featuresJa: ['安全な取り扱い', '滑らかな手触り', '手に安全'],
    compatibleWith: ['stand_up', 'flat_3_side', 'soft_pouch'],
    category: 'shape-structure',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Rounded corner processing',
    technicalNotesJa: '角丸加工',
    benefits: ['安全性向上', 'プレミアム感'],
    benefitsJa: ['安全性向上', 'プレミアム感'],
    applications: ['子供用品', '電子製品'],
    applicationsJa: ['子供用製品', '電子製品'],
    isDefault: true  // デフォルト値（左側）
  },
  {
    id: 'corner-square',
    name: '角直角',
    nameJa: '角直角',
    description: '伝統的な直角デザイン',
    descriptionJa: '伝統的な直角デザイン',
    beforeImage: '/images/post-processing/5.角直角.png',
    afterImage: '/images/post-processing/5.角直角.png',
    thumbnail: '/images/post-processing/5.角直角.png',
    priceMultiplier: 1.00,
    features: ['伝統的なデザイン', '最大限の空間活用'],
    featuresJa: ['伝統的な外観', '最大スペース'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Square corner processing',
    technicalNotesJa: '直角加工',
    benefits: ['空間効率', 'コスト削減'],
    benefitsJa: ['スペース効率', 'コスト節約'],
    applications: ['産業用製品', '標準包装'],
    applicationsJa: ['産業製品', '標準包装']
    // isDefault: false (明示的に削除)
  },

  // =====================================================
  // 6. VALVE (バルブ)
  // =====================================================

  // 6-1. Valve No (バルブなし)
  {
    id: 'valve-no',
    name: 'バルブなし',
    nameJa: 'バルブなし',
    description: '通常構造',
    descriptionJa: '通常構造',
    beforeImage: '/images/post-processing/バルブなし.png',
    afterImage: '/images/post-processing/バルブなし.png',
    thumbnail: '/images/post-processing/バルブなし.png',
    priceMultiplier: 1.00,
    features: ['標準構造', 'コスト効率'],
    featuresJa: ['標準構造', 'コスト効率'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Standard pouch structure',
    technicalNotesJa: '標準パウチ構造',
    benefits: ['コスト効率', '生産の簡素化'],
    benefitsJa: ['コスト効率', '生産の簡素さ'],
    applications: ['一般的な食品', '非食品製品'],
    applicationsJa: ['一般食品', '非食品製品'],
    isDefault: true  // デフォルト値
  },
  {
    id: 'valve-yes',
    name: 'バルブあり',
    nameJa: 'バルブあり',
    description: 'ガス排出バルブ機能',
    descriptionJa: 'ガス排出バルブ機能',
    beforeImage: '/images/post-processing/バルブなし.png',
    afterImage: '/images/post-processing/バルブあり.png',
    thumbnail: '/images/post-processing/バルブあり.png',
    priceMultiplier: 1.0,
    features: ['ガス排出', '内容物保護', '膨張防止'],
    featuresJa: ['ガス排出', '内容物保護', '膨張防止'],
    compatibleWith: ['stand_up', 'box'],
    category: 'opening-sealing',
    processingTime: '+3 business days',
    processingTimeJa: '+3営業日',
    minimumQuantity: 2000,
    technicalNotes: 'One-way degassing valve',
    technicalNotesJa: '一方向ガス排出バルブ',
    benefits: ['鮮度維持', '品質保護', 'ガス蓄積防止'],
    benefitsJa: ['鮮度維持', '品質保護', 'ガス蓄積防止'],
    applications: ['コーヒー豆', 'ロースト製品', '発酵食品'],
    applicationsJa: ['コーヒー豆', 'ロースト製品', '発酵食品']
  },

  // =====================================================
  // 7. OPENING POSITION (開封位置)
  // =====================================================

  // 7-1. Top Open (上端開封)
  {
    id: 'top-open',
    name: '上端開封',
    nameJa: '上端開封',
    description: '上部からの簡単な開封',
    descriptionJa: '上部からの簡単な開封',
    beforeImage: '/images/post-processing/6.하단 오픈.png',
    afterImage: '/images/post-processing/6.상단 오픈.png',
    thumbnail: '/images/post-processing/6.상단 오픈.png',
    priceMultiplier: 1.0,
    features: ['상단 개봉', '편리한 사용', '내용물 보호'],
    featuresJa: ['上端開封', '便利な使用', '内容物保護'],
    compatibleWith: ['stand_up', 'flat_3_side', 'box', 'lap_seal'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Top opening with reinforced tear line',
    technicalNotesJa: '補強 tear line付き上端開封',
    benefits: ['사용 편의성', '내용물 안전'],
    benefitsJa: ['使用利便性', '内容物安全'],
    applications: ['일반 제품', '식료품'],
    applicationsJa: ['一般製品', '食品'],
    isDefault: true  // デフォルト値
  },
  {
    id: 'bottom-open',
    name: '下端開封',
    nameJa: '下端開封',
    description: '下部からの完全な開封',
    descriptionJa: '下部からの完全な開封',
    beforeImage: '/images/post-processing/6.상단 오픈.png',
    afterImage: '/images/post-processing/6.하단 오픈.png',
    thumbnail: '/images/post-processing/6.하단 오픈.png',
    priceMultiplier: 1.0,
    features: ['하단 개봉', '완전 배출', '폐기물 최소화'],
    featuresJa: ['下端開封', '完全な空にする', '廃棄物最小化'],
    compatibleWith: ['stand_up', 'box', 'soft_pouch'],
    category: 'opening-sealing',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Bottom opening with reinforced structure',
    technicalNotesJa: '補強構造付き下端開封',
    benefits: ['완전 사용', '폐기물 제로', '산업 효율'],
    benefitsJa: ['完全使用', '廃棄物削減', '産業効率'],
    applications: ['산업용품', '대용량 제품'],
    applicationsJa: ['産業用品', '大容量製品']
  },

  // =====================================================
  // 8. SEALING WIDTH (シール幅)
  // =====================================================

  // 8-1. Sealing Width 5mm (標準)
  {
    id: 'sealing-width-5mm',
    name: 'シール幅 5mm',
    nameJa: 'シール幅 5mm',
    description: '標準的な5mmシール幅',
    descriptionJa: '標準的な5mmシール幅',
    afterImage: '/images/post-processing/seal_5.jpg',
    thumbnail: '/images/post-processing/seal_5.jpg',
    priceMultiplier: 1.0,
    features: ['標準仕様', 'コスト効率'],
    featuresJa: ['標準仕様', 'コスト効率'],
    compatibleWith: ['flat_3_side', 'stand_up', 'box', 'lap_seal', 'spout_pouch'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Standard 5mm sealing width',
    technicalNotesJa: '標準5mmシール幅',
    benefits: ['コスト削減', '生産効率', '標準仕様'],
    benefitsJa: ['コスト削減', '生産効率', '標準仕様'],
    applications: ['一般的な包装', '標準製品'],
    applicationsJa: ['一般包装', '標準製品'],
    isDefault: true
  },
  {
    id: 'sealing-width-7-5mm',
    name: 'シール幅 7.5mm',
    nameJa: 'シール幅 7.5mm',
    description: '強化された7.5mmシール幅',
    descriptionJa: '強化された7.5mmシール幅',
    afterImage: '/images/post-processing/seal_7.5.jpg',
    thumbnail: '/images/post-processing/seal_7.5.jpg',
    priceMultiplier: 1.0,
    features: ['強化シール', '中型製品対応'],
    featuresJa: ['強化シール', '中型製品対応'],
    compatibleWith: ['flat_3_side', 'stand_up', 'box', 'lap_seal', 'spout_pouch'],
    category: 'shape-structure',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Reinforced 7.5mm sealing width',
    technicalNotesJa: '補強7.5mmシール幅',
    benefits: ['強度向上', '密封性向上', '中型製品対応'],
    benefitsJa: ['強度向上', '密封性向上', '中型製品対応'],
    applications: ['中型食品', '一般製品'],
    applicationsJa: ['中型食品', '一般製品']
  },
  {
    id: 'sealing-width-10mm',
    name: 'シール幅 10mm',
    nameJa: 'シール幅 10mm',
    description: '最強の10mmシール幅',
    descriptionJa: '最強の10mmシール幅',
    afterImage: '/images/post-processing/seal_10.jpg',
    thumbnail: '/images/post-processing/seal_10.jpg',
    priceMultiplier: 1.0,
    features: ['最強シール', '重袋対応'],
    featuresJa: ['最強シール', '重袋対応'],
    compatibleWith: ['flat_3_side', 'stand_up', 'box', 'lap_seal', 'spout_pouch'],
    category: 'shape-structure',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Heavy-duty 10mm sealing width',
    technicalNotesJa: '重-duty10mmシール幅',
    benefits: ['最大強度', '密封性向上', '重袋対応'],
    benefitsJa: ['最大強度', '密封性向上', '重袋対応'],
    applications: ['重袋製品', '大容量製品', '産業用包装'],
    applicationsJa: ['重袋製品', '大容量製品', '産業包装']
  },

  // =====================================================
  // 7. MACHI PRINTING (マチ印刷有無)
  // =====================================================

  // 7-1. Machi Printing No (マチ印刷なし)
  {
    id: 'machi-printing-no',
    name: 'マチ印刷なし',
    nameJa: 'マチ印刷なし',
    description: 'マチ部分に印刷なし',
    descriptionJa: 'マチ部分に印刷なし',
    afterImage: '/images/post-processing/マッチ印刷無し.png',
    thumbnail: '/images/post-processing/マッチ印刷無し.png',
    priceMultiplier: 1.0,
    features: ['コスト効率', 'シンプルなデザイン', '標準生産'],
    featuresJa: ['コスト効率', 'シンプルなデザイン', '標準生産'],
    compatibleWith: ['stand_up', 'box'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'No printing on gusset/マチ portion',
    technicalNotesJa: 'マチ部分に印刷なし',
    benefits: ['コスト削減', '生産効率', 'シンプル仕上げ'],
    benefitsJa: ['コスト削減', '生産効率', 'シンプル仕上げ'],
    applications: ['標準包装', 'コスト重視製品'],
    applicationsJa: ['標準包装', 'コスト重視製品'],
    isDefault: true  // デフォルト値
  },
  {
    id: 'machi-printing-yes',
    name: 'マチ印刷あり',
    nameJa: 'マチ印刷あり',
    description: 'マチ部分にも印刷',
    descriptionJa: 'マチ部分にも印刷',
    afterImage: '/images/post-processing/マッチ印刷あり.png',
    thumbnail: '/images/post-processing/マッチ印刷あり.png',
    priceMultiplier: 1.05, // マチ印刷は+5%
    features: ['マチ部分に印刷', 'デザイン拡張', 'ブランド露出増加'],
    featuresJa: ['マチ部分に印刷', 'デザイン拡張', 'ブランド露出増加'],
    compatibleWith: ['stand_up', 'box'],
    category: 'shape-structure',
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Full printing on gusset/マチ portion',
    technicalNotesJa: 'マチ部分にフル印刷',
    benefits: ['ブランド露出向上', 'デザイン統一性', '高級感'],
    benefitsJa: ['ブランド露出向上', 'デザイン統一性', '高級感'],
    applications: ['プレミアム製品', 'ブランド製品', 'プロモーション包装'],
    applicationsJa: ['プレミアム製品', 'ブランド製品', 'プロモーション包装']
  },

  // =====================================================
  // SPOUT SIZE (スパウトサイズ) - スパウトパウチ専用
  // =====================================================

  {
    id: 'spout-size-9',
    name: '9パイ（φ9mm）',
    nameJa: '9パイ（φ9mm）',
    nameKo: '9파이 (φ9mm)',
    category: 'spout-size' as const,
    description: '小型スパウト - 小容量液体用',
    descriptionJa: '小型スパウト - 小容量液体用',
    descriptionKo: '소형 스파우트 - 소용량 액체용',
    icon: '🔹',
    compatibleWith: ['spout_pouch'],
    priceMultiplier: 1.0,
    features: ['小型', 'コスト効率', '小容量対応'],
    featuresJa: ['小型', 'コスト効率', '小容量対応'],
    isDefault: true,
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 5000,
    technicalNotes: '9mm diameter spout',
    technicalNotesJa: '9パイ径スパウト',
    benefits: ['コスト効率', '小容量製品対応'],
    benefitsJa: ['コスト効率', '小容量製品対応'],
    applications: ['小容量液体', 'サプリメント', '调味料'],
    applicationsJa: ['小容量液体', 'サプリメント', '調味料']
  },
  {
    id: 'spout-size-15',
    name: '15パイ（φ15mm）',
    nameJa: '15パイ（φ15mm）',
    nameKo: '15파이 (φ15mm)',
    category: 'spout-size' as const,
    description: '標準小型スパウト',
    descriptionJa: '標準小型スパウト',
    descriptionKo: '표준 소형 스파우트',
    icon: '🔸',
    compatibleWith: ['spout_pouch'],
    priceMultiplier: 1.0,
    features: ['標準サイズ', '汎用性'],
    featuresJa: ['標準サイズ', '汎用性'],
    isDefault: false,
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 5000,
    technicalNotes: '15mm diameter spout',
    technicalNotesJa: '15パイ径スパウト',
    benefits: ['汎用性', '標準サイズ'],
    benefitsJa: ['汎用性', '標準サイズ'],
    applications: ['一般液体', 'ドレッシング', 'ソース'],
    applicationsJa: ['一般液体', 'ドレッシング', 'ソース']
  },
  {
    id: 'spout-size-18',
    name: '18パイ（φ18mm）',
    nameJa: '18パイ（φ18mm）',
    nameKo: '18파이 (φ18mm)',
    category: 'spout-size' as const,
    description: '標準スパウト - 最も汎用的',
    descriptionJa: '標準スパウト - 最も汎用的',
    descriptionKo: '표준 스파우트 - 가장 범용적',
    icon: '🔷',
    compatibleWith: ['spout_pouch'],
    priceMultiplier: 1.0,
    features: ['標準', '最も汎用的', 'バランス'],
    featuresJa: ['標準', '最も汎用的', 'バランス'],
    isDefault: false,
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 5000,
    technicalNotes: '18mm diameter spout',
    technicalNotesJa: '18パイ径スパウト',
    benefits: ['最も汎用的', 'バランス良好'],
    benefitsJa: ['最も汎用的', 'バランス良好'],
    applications: ['各種液体', '化粧品', '食品'],
    applicationsJa: ['各種液体', '化粧品', '食品']
  },
  {
    id: 'spout-size-22',
    name: '22パイ（φ22mm）',
    nameJa: '22パイ（φ22mm）',
    nameKo: '22파이 (φ22mm)',
    category: 'spout-size' as const,
    description: '大型スパウト - 高粘度液体用',
    descriptionJa: '大型スパウト - 高粘度液体用',
    descriptionKo: '대형 스파우트 - 고점도 액체용',
    icon: '🔶',
    compatibleWith: ['spout_pouch'],
    priceMultiplier: 1.0,
    features: ['大型', '高粘度対応', '高速充填'],
    featuresJa: ['大型', '高粘度対応', '高速充填'],
    isDefault: false,
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 5000,
    technicalNotes: '22mm diameter spout',
    technicalNotesJa: '22パイ径スパウト',
    benefits: ['高速充填', '高粘度対応'],
    benefitsJa: ['高速充填', '高粘度対応'],
    applications: ['高粘度液体', 'ジャム', '蜂蜜'],
    applicationsJa: ['高粘度液体', 'ジャム', '蜂蜜']
  },
  {
    id: 'spout-size-28',
    name: '28パイ（φ28mm）',
    nameJa: '28パイ（φ28mm）',
    nameKo: '28파이 (φ28mm)',
    category: 'spout-size' as const,
    description: '超大型スパウト - 特殊用途',
    descriptionJa: '超大型スパウト - 特殊用途',
    descriptionKo: '초대형 스파우트 - 특수 용도',
    icon: '🔻',
    compatibleWith: ['spout_pouch'],
    priceMultiplier: 1.0,
    features: ['超大型', '特殊用途', '最大流量'],
    featuresJa: ['超大型', '特殊用途', '最大流量'],
    isDefault: false,
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 5000,
    technicalNotes: '28mm diameter spout',
    technicalNotesJa: '28パイ径スパウト',
    benefits: ['最大流量', '特殊用途対応'],
    benefitsJa: ['最大流量', '特殊用途対応'],
    applications: ['特殊工業用', '大容量充填'],
    applicationsJa: ['特殊工業用', '大容量充填']
  }
]

// Helper functions for processing options
export const getProcessingOptionById = (id: string): ProcessingOptionConfig | undefined => {
  return processingOptionsConfig.find(option => option.id === id)
}

export const getProcessingOptionsByCategory = (category: ProcessingOptionConfig['category']): ProcessingOptionConfig[] => {
  return processingOptionsConfig.filter(option => option.category === category)
}

export const getProcessingOptionsByCompatibility = (productType: string): ProcessingOptionConfig[] => {
  return processingOptionsConfig.filter(option =>
    option.compatibleWith.includes(productType)
  )
}

export const PROCESSING_CATEGORIES = [
  {
    id: 'opening-sealing',
    name: '開封/密閉',
    nameJa: '開封/密閉',
    icon: '🔓',
    description: '開封および密閉関連オプション',
    descriptionJa: '開封および密閉関連オプション'
  },
  {
    id: 'surface-treatment',
    name: '表面処理',
    nameJa: '表面処理',
    icon: '✨',
    description: '表面仕上げおよびコーティングオプション',
    descriptionJa: '表面仕上げおよびコーティングオプション'
  },
  {
    id: 'shape-structure',
    name: '形状/構造',
    nameJa: '形状/構造',
    icon: '📐',
    description: 'パッケージ形状および構造オプション',
    descriptionJa: 'パッケージ形状および構造オプション'
  },
  {
    id: 'functionality',
    name: '機能性',
    nameJa: '機能性',
    icon: '⚡',
    description: 'Additional functional capabilities',
    descriptionJa: '追加機能性'
  },
  {
    id: 'spout-size',
    name: 'スパウトサイズ',
    nameJa: 'スパウトサイズ',
    icon: '🔧',
    description: 'スパウトパウチのサイズ選択',
    descriptionJa: 'スパウトパウチのサイズ選択'
  }
] as const

/**
 * カテゴリ別のデフォルト値を取得
 * 各カテゴリでisDefault: trueが設定されているオプションを返す
 *
 * 7つのカテゴリすべてのデフォルト値を返す:
 * - zipper (zipper-no): ジッパーなし
 * - finish (glossy): 光沢仕上げ
 * - notch (notch-no): ノッチなし
 * - hang-hole (hang-hole-no): 吊り穴なし
 * - corner (corner-round): 角丸
 * - valve (valve-no): バルブなし
 * - open (top-open): 上端開封
 */
// PostProcessingStep.tsxのOPTION_CATEGORIESと同じマッピング
const OPTION_CATEGORIES: Record<string, string> = {
  'zipper-yes': 'zipper',
  'zipper-no': 'zipper',
  'glossy': 'finish',
  'matte': 'finish',
  'notch-yes': 'notch',
  'notch-straight': 'notch',
  'notch-no': 'notch',
  'hang-hole-6mm': 'hang-hole',
  'hang-hole-8mm': 'hang-hole',
  'hang-hole-no': 'hang-hole',
  'corner-round': 'corner',
  'corner-square': 'corner',
  'valve-yes': 'valve',
  'valve-no': 'valve',
  'top-open': 'open',
  'bottom-open': 'open',
  'sealing-width-5mm': 'sealing-width',
  'sealing-width-7-5mm': 'sealing-width',
  'sealing-width-10mm': 'sealing-width',
  'machi-printing-no': 'machi-printing',
  'machi-printing-yes': 'machi-printing'
};

export const getDefaultPostProcessingOptions = (bagTypeId?: string): string[] => {
  // 各カテゴリーの最初のオプションをデフォルトとして返す
  // 並び順（PostProcessingStep.tsxのOPTION_CATEGORIES順）:
  // 1. zipper → zipper-yes
  // 2. finish → glossy
  // 3. notch → notch-yes
  // 4. hang-hole → hang-hole-6mm
  // 5. corner → corner-round
  // 6. valve → valve-no
  // 7. open → top-open
  // 8. sealing-width → sealing-width-5mm (コメントアウト、自動選択しない)
  // 9. machi-printing → machi-printing-no

  // 合掌袋・ガゼットパウチはジッパー・角加工非対応
  const isExcludedZipperCorner = bagTypeId === 'lap_seal' || bagTypeId === 'box';

  // スパウトパウチは表面処理のみ対応
  const isSpoutPouch = bagTypeId === 'spout_pouch';

  const allDefaults = [
    'zipper-yes',      // ジッパー付き
    'glossy',          // 光沢仕上げ
    'notch-yes',       // Vノッチ
    'hang-hole-6mm',   // 吊り穴(6mm)
    'corner-round',    // 角丸
    'valve-no',        // バルブなし
    'top-open',        // 上端開封
    // 'sealing-width-5mm', // シール幅は自動選択しない（別途制御）
    'machi-printing-no' // マチ印刷なし
  ];

  // スパウトパウチ: 表面処理のみ
  if (isSpoutPouch) {
    const spoutDefaults = ['glossy'];
    console.log('[getDefaultPostProcessingOptions] bagTypeId:', bagTypeId, 'isSpoutPouch:', true, 'Returning defaults:', spoutDefaults);
    return spoutDefaults;
  }

  // 合掌袋・ガゼットパウチ: ジッパーと角加工を除外
  let defaults = allDefaults;
  if (isExcludedZipperCorner) {
    defaults = allDefaults.filter(id => id !== 'zipper-yes' && id !== 'corner-round');
  }

  console.log('[getDefaultPostProcessingOptions] bagTypeId:', bagTypeId, 'isExcludedZipperCorner:', isExcludedZipperCorner, 'Returning defaults:', defaults);
  return defaults;
};

/**
 * 後加工オプション配列から乗数を計算
 * processingConfig.tsのpriceMultiplierを使用
 *
 * 注意: glossyとmatteは価格乘数ではなく追加費用として計算されるため除外
 */
export const calculatePostProcessingMultiplier = (options: string[]): number => {
  if (!options || options.length === 0) {
    return 1.0;
  }

  // 価格乘数計算から除外するオプション（追加費用として計算されるもの）
  const EXCLUDED_FROM_MULTIPLIER = ['glossy', 'matte'];

  let multiplier = 1.0;

  for (const optionId of options) {
    // glossyとmatteは乘数計算から除外
    if (EXCLUDED_FROM_MULTIPLIER.includes(optionId)) {
      continue;
    }

    const option = processingOptionsConfig.find(opt => opt.id === optionId);
    if (option) {
      multiplier *= option.priceMultiplier;
    }
  }

  return multiplier;
};

/**
 * カテゴリ別に1つのみ選択可能かチェック
 * 同じカテゴリで複数選択されている場合はfalseを返す
 */
export const validateCategorySelection = (
  selectedOptions: string[],
  selectedOptionId: string
): { valid: boolean; conflictingOption?: string } => {
  const newOption = processingOptionsConfig.find(opt => opt.id === selectedOptionId);
  if (!newOption) return { valid: true };

  // 同じカテゴリで選択されている他のオプションをチェック
  const conflictingOption = selectedOptions.find(optionId => {
    if (optionId === selectedOptionId) return false;
    const existingOption = processingOptionsConfig.find(opt => opt.id === optionId);
    return existingOption?.category === newOption.category;
  });

  if (conflictingOption) {
    return { valid: false, conflictingOption };
  }

  return { valid: true };
};

/**
 * Calculate processing impact from selected options
 */
export const calculateProcessingImpact = (selectedOptions: string[]) => {
  const multiplier = calculatePostProcessingMultiplier(selectedOptions)

  // Calculate additional processing time
  const selectedOptionsData = selectedOptions
    .map(id => getProcessingOptionById(id))
    .filter((opt): opt is ProcessingOptionConfig => opt !== undefined)

  const maxProcessingTime = selectedOptionsData.reduce((max, opt) => {
    const timeValue = parseInt(opt.processingTimeJa.match(/\d+/)?.[0] || '0')
    return Math.max(max, timeValue)
  }, 0)

  const minQuantity = Math.max(...selectedOptionsData.map(opt => opt.minimumQuantity))

  return {
    multiplier,
    processingTimeJa: maxProcessingTime > 0 ? `+${maxProcessingTime}営業日` : '標準生産時間',
    minimumQuantity: minQuantity || 500
  }
}

/**
 * 後加工カテゴリ一覧を取得
 */
export const getProcessingCategories = PROCESSING_CATEGORIES
