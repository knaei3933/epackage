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
  category: 'opening-sealing' | 'surface-treatment' | 'shape-structure' | 'functionality'
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
export const processingOptionsConfig: ProcessingOptionConfig[] = [
  // =====================================================
  // 1. OPENING/CLOSING (開封/密閉) - 10 options
  // =====================================================

  // =====================================================
  // 1. OPENING/CLOSING (開封/密閉)
  // カテゴリ別に1つのみ選択可能
  // デフォルト値: 左側の項目（-no, -yes順で前者をデフォルト）
  // =====================================================

  // 1-1. Valve (バルブ) - バルブ関連を最初に配置
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
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
    compatibleWith: ['stand_up', 'gusset'],
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

  // 1-2. Zipper (ジッパー)
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Heat seal without zipper mechanism',
    technicalNotesJa: 'ジッパー機構なし熱接着',
    benefits: ['コスト削減', '生産効率', '信頼性'],
    benefitsJa: ['コスト削減', '生産効率', '信頼性'],
    applications: ['一回用包装', '医薬品', 'サンプルパック'],
    applicationsJa: ['一回用包装', '医薬品', 'サンプルパック'],
    isDefault: true  // デフォルト値
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
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
    ]
  },

  // 1-3. Notch (ノッチ)
  {
    id: 'notch-yes',
    name: 'ノッチあり',
    nameJa: 'ノッチあり',
    description: '簡単な開封のためのノッチ',
    descriptionJa: '簡単な開封のためのノッチ',
    beforeImage: '/images/post-processing/3.ノッチなし.png',
    afterImage: '/images/post-processing/3.ノッチあり.png',
    thumbnail: '/images/post-processing/3.ノッチあり.png',
    priceMultiplier: 1.0,
    features: ['簡単な開封', '道具不要', '綺麗な切断'],
    featuresJa: ['簡単な開封', '道具不要', 'きれいな切断'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Precision-cut tear notch',
    technicalNotesJa: '精密カットティアノッチ',
    benefits: ['消費者利便性', 'ユーザー体験向上'],
    benefitsJa: ['消費者利便性', 'ユーザー体験向上'],
    applications: ['スナック', '菓子', '医薬品'],
    applicationsJa: ['間食', 'スナック', '医薬品']
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Clean edge without notch',
    technicalNotesJa: 'ノッチなしのクリーンエッジ',
    benefits: ['コスト効率', '生産スピード'],
    benefitsJa: ['コスト効率', '生産スピード'],
    applications: ['産業用包装', '標準製品'],
    applicationsJa: ['産業包装', '標準製品'],
    isDefault: true  // デフォルト値
  },

  // 1-4. Tear Notch (ティアノッチ)
  {
    id: 'tear-notch',
    name: 'ティアノッチ',
    nameJa: 'ティアノッチ',
    description: '強化されたティアノッチ開封',
    descriptionJa: '強化されたティアノッチ開封',
    beforeImage: '/images/post-processing/tear-notch-before.png',
    afterImage: '/images/post-processing/tear-notch-after.png',
    thumbnail: '/images/post-processing/tear-notch-after.png',
    priceMultiplier: 1.04,
    features: ['強化された切断', '一定の開封経路', '綺麗な仕上げ'],
    featuresJa: ['強化された切断', '一定な開封経路', 'きれいな仕上げ'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Reinforced tear notch for guided opening',
    technicalNotesJa: '誘導開封用強化ティアノッチ',
    benefits: ['開封の容易さ', '破損防止', 'ユーザー体験'],
    benefitsJa: ['開封容易性', '破損防止', 'ユーザー体験'],
    applications: ['スナック', 'ペット用スナック', 'サンプル'],
    applicationsJa: ['間食', 'ペットフード', 'サンプル']
  },

  // 1-5. Easy Open Zipper (イージーオープンジッパー)
  {
    id: 'easy-open-zipper',
    name: 'イージーオープンジッパー',
    nameJa: 'イージーオープンジッパー',
    description: '手軽く開けられるイージーオープンジッパー',
    descriptionJa: '手軽く開けられるイージーオープンジッパー',
    beforeImage: '/images/post-processing/easy-zipper-before.png',
    afterImage: '/images/post-processing/easy-zipper-after.png',
    thumbnail: '/images/post-processing/easy-zipper-after.png',
    priceMultiplier: 1.15,
    features: ['簡単な開封', '再密閉可能', '高級ジッパー'],
    featuresJa: ['手軽な開封', '再密閉可能', '高級ジッパー'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'opening-sealing',
    processingTime: '+3 business days',
    processingTimeJa: '+3営業日',
    minimumQuantity: 2000,
    technicalNotes: 'Easy-open pull tab zipper with track lock',
    technicalNotesJa: 'プルタブ付きトラックロックジッパー',
    benefits: ['消費者利便性', 'アクセシビリティ向上', '再利用性'],
    benefitsJa: ['消費者利便性', 'アクセシビリティ向上', '再利用性'],
    applications: ['子供向け製品', 'スナック', '健康サプリメント'],
    applicationsJa: ['子供用製品', '間食', '健康サプリメント']
  },

  // =====================================================
  // 2. SURFACE TREATMENT (表面処理) - 10 options
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
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

  // 2-3. UV Coating (UVコーティング)
  {
    id: 'uv-coating',
    name: 'UVコーティング',
    nameJa: 'UVコーティング',
    description: 'UV硬化コーティング処理',
    descriptionJa: 'UV硬化コーティング処理',
    beforeImage: '/images/post-processing/uv-before.png',
    afterImage: '/images/post-processing/uv-after.png',
    thumbnail: '/images/post-processing/uv-after.png',
    priceMultiplier: 1.08,
    features: ['내스크래치', '광택 유지', '내구성'],
    featuresJa: ['耐スクラッチ', '光沢維持', '耐久性'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'surface-treatment',
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 1500,
    technicalNotes: 'UV cured protective coating',
    technicalNotesJa: 'UV硬化保護コーティング',
    benefits: ['제품 보호', '내구성 향상', '프리미엄 느낌'],
    benefitsJa: ['製品保護', '耐久性向上', 'プレミアム感'],
    applications: ['전자제품', '화장품', '프리미엄 식품'],
    applicationsJa: ['電子製品', '化粧品', 'プレミアム食品']
  },

  // 2-4. Soft Touch (ソフトタッチ)
  {
    id: 'soft-touch',
    name: 'ソフトタッチ',
    nameJa: 'ソフトタッチ',
    description: '柔らかい手触りのソフトタッチ処理',
    descriptionJa: '柔らかい手触りのソフトタッチ処理',
    beforeImage: '/images/post-processing/soft-touch-before.png',
    afterImage: '/images/post-processing/soft-touch-after.png',
    thumbnail: '/images/post-processing/soft-touch-after.png',
    priceMultiplier: 1.12,
    features: ['부드러운 촉감', '고급 느낌', '지문 방지'],
    featuresJa: ['柔らかい手触り', '高級感', '指紋防止'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'surface-treatment',
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 2000,
    technicalNotes: 'Soft touch matte coating with velvet feel',
    technicalNotesJa: 'ベルベット感触のマットコーティング',
    benefits: ['프리미엄 경험', '차별화', '브랜드 인지도'],
    benefitsJa: ['プレミアム体験', '差別化', 'ブランド認知'],
    applications: ['화장품', '전자제품', '고급 식품'],
    applicationsJa: ['化粧品', '電子製品', '高級食品']
  },

  // 2-5. Metallic (メタリック)
  {
    id: 'metallic',
    name: 'メタリックコーティング',
    nameJa: 'メタリックコーティング',
    description: '金属光沢のメタリックコーティング',
    descriptionJa: '金属光沢のメタリックコーティング',
    beforeImage: '/images/post-processing/metallic-before.png',
    afterImage: '/images/post-processing/metallic-after.png',
    thumbnail: '/images/post-processing/metallic-after.png',
    priceMultiplier: 1.15,
    features: ['금속 광택', '시선 끌기', '프리미엄 느낌'],
    featuresJa: ['金属光沢', '視線を惹く', 'プレミアム感'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'surface-treatment',
    processingTime: '+3-4 business days',
    processingTimeJa: '+3-4営業日',
    minimumQuantity: 2500,
    technicalNotes: 'Metallic foil transfer coating',
    technicalNotesJa: '金属箔転写コーティング',
    benefits: ['시각적 임팩트', '프리미엄 브랜딩', '구매 유도'],
    benefitsJa: ['視覚的インパクト', 'プレミアムブランディング', '購買誘導'],
    applications: ['화장품', '고급 식품', '선물용'],
    applicationsJa: ['化粧品', '高級食品', 'ギフト用']
  },

  // =====================================================
  // 3. SHAPE/STRUCTURE (形状/構造) - 10 options
  // =====================================================

  // 3-1. Hang Hole (吊り穴)
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
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
    ]
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Clean surface without hang holes',
    technicalNotesJa: '穴なしのクリーン表面',
    benefits: ['디자인 자유도', '비용 절감'],
    benefitsJa: ['デザイン自由度', 'コスト削減'],
    applications: ['一般的な包装', '直接包装'],
    applicationsJa: ['一般包装', '直接パッケージング'],
    isDefault: true  // デフォルト値
  },

  // 3-2. Corner Round (角丸)
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
    applicationsJa: ['子供用製品', '電子製品']
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Square corner processing',
    technicalNotesJa: '直角加工',
    benefits: ['空間効率', 'コスト削減'],
    benefitsJa: ['スペース効率', 'コスト節約'],
    applications: ['産業用製品', '標準包装'],
    applicationsJa: ['産業製品', '標準包装'],
    isDefault: true  // デフォルト値
  },

  // 3-3. Gusset (ガゼット)
  {
    id: 'gusset-bottom',
    name: '底部ガゼット',
    nameJa: '底部ガゼット',
    description: '底部にガゼット追加で容量拡張',
    descriptionJa: '底部にガゼット追加で容量拡張',
    beforeImage: '/images/post-processing/gusset-bottom-before.png',
    afterImage: '/images/post-processing/gusset-bottom-after.png',
    thumbnail: '/images/post-processing/gusset-bottom-after.png',
    priceMultiplier: 1.08,
    features: ['容量増加', '安定した構造', '自立可能'],
    featuresJa: ['容量増加', '安定した構造', '自立可能'],
    compatibleWith: ['flat_3_side', 'box', 'gassho'],
    category: 'shape-structure',
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Bottom fold-in gusset with reinforcement',
    technicalNotesJa: '補強付き底部折り込みガゼット',
    benefits: ['内容物増加', '安定性', '空間効率'],
    benefitsJa: ['内容物増加', '安定性', '空間効率'],
    applications: ['大容量製品', 'ベーカリー', 'スナック'],
    applicationsJa: ['大容量製品', 'ベーカリー', '間食']
  },

  // 3-4. Die Cut Window (ダイカットウィンドウ)
  {
    id: 'die-cut-window',
    name: 'ダイカットウィンドウ',
    nameJa: 'ダイカットウィンドウ',
    description: '製品確認用ウィンドウ',
    descriptionJa: '製品確認用ウィンドウ',
    beforeImage: '/images/post-processing/diecut-before.png',
    afterImage: '/images/post-processing/diecut-after.png',
    thumbnail: '/images/post-processing/diecut-after.png',
    priceMultiplier: 1.07,
    features: ['内容物確認', '視覚的マーケティング', '購入促進'],
    featuresJa: ['内容物確認', '視覚的マーケティング', '購買誘導'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'shape-structure',
    processingTime: '+2 business days',
    processingTimeJa: '+2営業日',
    minimumQuantity: 2000,
    technicalNotes: 'Precision die-cut window with film lamination',
    technicalNotesJa: 'フィルムラミネート付き精密ダイカットウィンドウ',
    benefits: ['製品宣伝', '消費者信頼', '売上増大'],
    benefitsJa: ['製品宣伝', '消費者信頼', '売上増大'],
    applications: ['간식', '베이커리', '샘플'],
    applicationsJa: ['間食', 'ベーカリー', 'サンプル']
  },

  // =====================================================
  // 4. FUNCTIONALITY (機能性) - 10 options
  // =====================================================

  // 4-1. Moisture Barrier (湿気バリア)
  {
    id: 'moisture-barrier',
    name: '湿気バリア',
    nameJa: '湿気バリア',
    description: '高强度湿気バリアコーティング',
    descriptionJa: '高强度湿気バリアコーティング',
    beforeImage: '/images/post-processing/moisture-before.png',
    afterImage: '/images/post-processing/moisture-after.png',
    thumbnail: '/images/post-processing/moisture-after.png',
    priceMultiplier: 1.10,
    features: ['湿気遮断', '製品保護', '賞味期限延長'],
    featuresJa: ['湿気遮断', '製品保護', '賞味期限延長'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'functionality',
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 2000,
    technicalNotes: 'Enhanced moisture barrier coating',
    technicalNotesJa: '強化湿気バリアコーティング',
    benefits: ['製品鮮度', '品質保護', '賞味期限延長'],
    benefitsJa: ['製品鮮度', '品質保護', '賞味期限延長'],
    applications: ['乾燥食品', '医薬品', '電子製品'],
    applicationsJa: ['乾燥食品', '医薬品', '電子製品']
  },

  // 4-2. Tamper Evident (開封証拠)
  {
    id: 'tamper-evident',
    name: '開封証拠',
    nameJa: '開封証拠',
    description: '開封の有無を視覚的に表示',
    descriptionJa: '開封の有無を視覚的に表示',
    beforeImage: '/images/post-processing/tamper-before.png',
    afterImage: '/images/post-processing/tamper-after.png',
    thumbnail: '/images/post-processing/tamper-after.png',
    priceMultiplier: 1.06,
    features: ['セキュリティ機能', '偽造防止', '消費者信頼'],
    featuresJa: ['保安機能', '偽造防止', '消費者信頼'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'functionality',
    processingTime: '+2 business days',
    processingTimeJa: '+2営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Tamper-evident band or tape',
    technicalNotesJa: '開封証拠バンドまたはテープ',
    benefits: ['セキュリティ強化', 'ブランド保護', '消費者安心'],
    benefitsJa: ['保安強化', 'ブランド保護', '消費者安心'],
    applications: ['医薬品', '高級食品', '化粧品'],
    applicationsJa: ['医薬品', '高級食品', '化粧品']
  },

  // 4-3. Oxygen Barrier (酸素バリア)
  {
    id: 'oxygen-barrier',
    name: '酸素バリア',
    nameJa: '酸素バリア',
    description: '酸素透過防止機能',
    descriptionJa: '酸素透過防止機能',
    beforeImage: '/images/post-processing/oxygen-before.png',
    afterImage: '/images/post-processing/oxygen-after.png',
    thumbnail: '/images/post-processing/oxygen-after.png',
    priceMultiplier: 1.12,
    features: ['酸素遮断', '酸化防止', '品質維持'],
    featuresJa: ['酸素遮断', '酸化防止', '品質維持'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'functionality',
    processingTime: '+3-4 business days',
    processingTimeJa: '+3-4営業日',
    minimumQuantity: 2500,
    technicalNotes: 'Enhanced oxygen barrier film lamination',
    technicalNotesJa: '強化酸素バリアフィルムラミネート',
    benefits: ['製品保存', '賞味期限延長', '品質保証'],
    benefitsJa: ['製品保存', '賞味期限延長', '品質保証'],
    applications: ['コーヒー', 'ナッツ類', '高級食品'],
    applicationsJa: ['コーヒー', '坚果類', '高級食品']
  },

  // 4-4. Anti-Static (帯電防止)
  {
    id: 'anti-static',
    name: '帯電防止',
    nameJa: '帯電防止',
    description: '静電気発生防止',
    descriptionJa: '静電気発生防止',
    beforeImage: '/images/post-processing/antistatic-before.png',
    afterImage: '/images/post-processing/antistatic-after.png',
    thumbnail: '/images/post-processing/antistatic-after.png',
    priceMultiplier: 1.05,
    features: ['帯電防止効果', 'ほこり付着防止', '製品保護'],
    featuresJa: ['帯電防止効果', 'ほこり付着防止', '製品保護'],
    compatibleWith: ['flat_3_side', 'gusset', 'gassho'],
    category: 'functionality',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Anti-static coating treatment',
    technicalNotesJa: '帯電防止コーティング処理',
    benefits: ['製品保護', '作業環境改善', '品質維持'],
    benefitsJa: ['製品保護', '作業環境改善', '品質維持'],
    applications: ['전자제품', '분말 제품', '의료품'],
    applicationsJa: ['電子製品', '粉末製品', '医薬品']
  },

  // 4-5. Child Resistant (チャイルドレジスタント)
  {
    id: 'child-resistant',
    name: 'チャイルドレジスタント',
    nameJa: 'チャイルドレジスタント',
    description: '子供による開封防止',
    descriptionJa: '子供による開封防止',
    beforeImage: '/images/post-processing/child-before.png',
    afterImage: '/images/post-processing/child-after.png',
    thumbnail: '/images/post-processing/child-after.png',
    priceMultiplier: 1.15,
    features: ['어린이 보호', '특수 개봉', '안전성'],
    featuresJa: ['子供保護', '特別な開封', '安全性'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gassho'],
    category: 'functionality',
    processingTime: '+3-4 business days',
    processingTimeJa: '+3-4営業日',
    minimumQuantity: 3000,
    technicalNotes: 'Child-resistant packaging mechanism',
    technicalNotesJa: 'チャイルドレジスタント包装機構',
    benefits: ['안전 규정 준수', '소비자 보호', '법적 준수'],
    benefitsJa: ['安全規定準拠', '消費者保護', '法的準拠'],
    applications: ['의료품', '건강식품', '위험 제품'],
    applicationsJa: ['医薬品', '健康サプリメント', '危険製品']
  },

  // Opening Position Options
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
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'gassho'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Top opening with reinforced tear line',
    technicalNotesJa: '補強 tear line付き上端開封',
    benefits: ['사용 편의성', '내용물 안전'],
    benefitsJa: ['使用利便性', '内容物安全'],
    applications: ['일반 제품', '식료품'],
    applicationsJa: ['一般製品', '食品']
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
    compatibleWith: ['stand_up', 'gusset', 'soft_pouch'],
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

export const calculateProcessingImpact = (selectedOptions: string[]): {
  multiplier: number
  processingTime: string
  processingTimeJa: string
  processingTimeDays: number
  minimumQuantity: number
  features: string[]
  featuresJa: string[]
} => {
  const options = selectedOptions.map(id => getProcessingOptionById(id)).filter(Boolean) as ProcessingOptionConfig[]

  if (options.length === 0) {
    return {
      multiplier: 1.0,
      processingTime: 'Standard production time',
      processingTimeJa: '標準生産時間',
      processingTimeDays: 0,
      minimumQuantity: 500,
      features: [],
      featuresJa: []
    }
  }

  const multiplier = options.reduce((total, option) => total * option.priceMultiplier, 1.0)
  const maxProcessingTime = options.reduce((max, option) => {
    const days = parseInt(option.processingTime) || 0
    return Math.max(max, days)
  }, 0)

  const maxMinimumQuantity = Math.max(...options.map(option => option.minimumQuantity))

  const allFeatures = [...new Set(options.flatMap(option => option.features))]
  const allFeaturesJa = [...new Set(options.flatMap(option => option.featuresJa))]

  return {
    multiplier: Math.round(multiplier * 100) / 100,
    processingTime: maxProcessingTime > 0 ? `+${maxProcessingTime} business days` : 'Standard production time',
    processingTimeJa: maxProcessingTime > 0 ? `+${maxProcessingTime}営業日` : '標準生産時間',
    processingTimeDays: maxProcessingTime,
    minimumQuantity: maxMinimumQuantity,
    features: allFeatures,
    featuresJa: allFeaturesJa
  }
}

// Processing categories matching 修正事項.md requirements
export const getProcessingCategories = [
  {
    id: 'opening-sealing',
    name: '開封/密閉',
    nameJa: '開封/密閉',
    icon: '🔓',
    description: 'Package opening and sealing functionality',
    descriptionJa: 'パッケージの開封と密閉機能'
  },
  {
    id: 'surface-treatment',
    name: '表面処理',
    nameJa: '表面処理',
    icon: '✨',
    description: 'Surface treatment finishes',
    descriptionJa: '表面仕上げ処理'
  },
  {
    id: 'shape-structure',
    name: '形状/構造',
    nameJa: '形状/構造',
    icon: '🏗️',
    description: 'Shape and structural modifications',
    descriptionJa: '形状と構造の修正'
  },
  {
    id: 'functionality',
    name: '機能性',
    nameJa: '機能性',
    icon: '⚡',
    description: 'Additional functional capabilities',
    descriptionJa: '追加機能性'
  }
] as const

/**
 * カテゴリ別のデフォルト値を取得
 * 各カテゴリでisDefault: trueが設定されているオプションを返す
 */
export const getDefaultPostProcessingOptions = (): string[] => {
  const categories: ProcessingOptionConfig['category'][] = [
    'opening-sealing',
    'surface-treatment',
    'shape-structure'
    // 'functionality' はデフォルトで選択しない（オプション）
  ];

  const defaults: string[] = [];

  for (const category of categories) {
    const defaultOption = processingOptionsConfig.find(
      option => option.category === category && option.isDefault === true
    );
    if (defaultOption) {
      defaults.push(defaultOption.id);
    }
  }

  return defaults;
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
