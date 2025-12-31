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

// Post-processing options matching exact 수정사항.md requirements
export const processingOptionsConfig: ProcessingOptionConfig[] = [
  // =====================================================
  // 1. OPENING/CLOSING (開封/密閉) - 10 options
  // =====================================================

  // 1-1. Zipper (ジッパー)
  {
    id: 'zipper-yes',
    name: '지퍼 있음',
    nameJa: 'ジッパーあり',
    description: '재사용 가능한 지퍼 밀폐 기능',
    descriptionJa: '再利用可能なジッパー密閉機能',
    beforeImage: '/images/post-processing/1.지퍼 없음.png',
    afterImage: '/images/post-processing/1.지퍼 있음.png',
    thumbnail: '/images/post-processing/1.지퍼 있음.png',
    priceMultiplier: 1.12,
    features: ['지퍼 재밀폐', '신선도 유지', '소비자 편의'],
    featuresJa: ['ジッパー再密閉', '鮮度維持', '消費者に便利'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'opening-sealing',
    processingTime: '+2 business days',
    processingTimeJa: '+2営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Double-track resealable zipper',
    technicalNotesJa: 'ダブルトラック再密閉ジッパー',
    benefits: ['제품 신선도', '재사용성', '소비자 만족도'],
    benefitsJa: ['製品鮮度', '再利用性', '消費者満足度'],
    applications: ['식품', '건강식품', '베이커리 제품'],
    applicationsJa: ['食品', '健康サプリメント', 'ベーカリー製品'],
    variants: [
      {
        id: 'zipper-position-any',
        name: '지퍼 위치: 임의 지정',
        nameJa: 'ジッパー位置：任せ',
        description: '최적의 위치에 지퍼 배치 (권장)',
        descriptionJa: '最適な位置にジッパー配置（推奨）',
        image: '/images/post-processing/zipper-position-any.png',
        priceAdjustment: 0.00
      },
      {
        id: 'zipper-position-specified',
        name: '지퍼 위치: 특정 위치 지정',
        nameJa: 'ジッパー位置：指定',
        description: '특정 위치에 지퍼 배치',
        descriptionJa: '特定位置にジッパー配置',
        image: '/images/post-processing/zipper-position-specified.png',
        priceAdjustment: 0.02
      }
    ]
  },
  {
    id: 'zipper-no',
    name: '지퍼 없음',
    nameJa: 'ジッパーなし',
    description: '일반 열접 밀폐 기능',
    descriptionJa: '通常熱接着密閉機能',
    beforeImage: '/images/post-processing/1.지퍼 없음.png',
    afterImage: '/images/post-processing/1.지퍼 없음.png',
    thumbnail: '/images/post-processing/1.지퍼 없음.png',
    priceMultiplier: 1.00,
    features: ['일반 열접', '비용 효율성', '간편한 생산'],
    featuresJa: ['通常熱接着', 'コスト効率', '簡単な生産'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Heat seal without zipper mechanism',
    technicalNotesJa: 'ジッパー機構なし熱接着',
    benefits: ['비용 절감', '생산 효율', '신뢰성'],
    benefitsJa: ['コスト削減', '生産効率', '信頼性'],
    applications: ['일회용 포장', '의료품', '샘플 팩'],
    applicationsJa: ['一回用包装', '医薬品', 'サンプルパック']
  },

  // 1-2. Valve (バルブ)
  {
    id: 'valve-yes',
    name: '밸브 있음',
    nameJa: 'バルブあり',
    description: '가스 배출 밸브 기능',
    descriptionJa: 'ガス排出バルブ機能',
    beforeImage: '/images/post-processing/밸브 없음.png',
    afterImage: '/images/post-processing/밸브 있음.png',
    thumbnail: '/images/post-processing/밸브 있음.png',
    priceMultiplier: 1.08,
    features: ['가스 배출', '내용물 보호', '부풍 방지'],
    featuresJa: ['ガス排出', '内容物保護', '膨張防止'],
    compatibleWith: ['stand_up', 'gusset'],
    category: 'opening-sealing',
    processingTime: '+3 business days',
    processingTimeJa: '+3営業日',
    minimumQuantity: 2000,
    technicalNotes: 'One-way degassing valve',
    technicalNotesJa: '一方向ガス排出バルブ',
    benefits: ['신선도 유지', '품질 보호', '가스 축적 방지'],
    benefitsJa: ['鮮度維持', '品質保護', 'ガス蓄積防止'],
    applications: ['커피 원두', '로스팅 식품', '발효 식품'],
    applicationsJa: ['コーヒー豆', 'ロースト製品', '発酵食品']
  },
  {
    id: 'valve-no',
    name: '밸브 없음',
    nameJa: 'バルブなし',
    description: '일반 구조',
    descriptionJa: '通常構造',
    beforeImage: '/images/post-processing/밸브 없음.png',
    afterImage: '/images/post-processing/밸브 없음.png',
    thumbnail: '/images/post-processing/밸브 없음.png',
    priceMultiplier: 1.00,
    features: ['표준 구조', '비용 효율성'],
    featuresJa: ['標準構造', 'コスト効率'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Standard pouch structure',
    technicalNotesJa: '標準パウチ構造',
    benefits: ['비용 효율', '생산 간편함'],
    benefitsJa: ['コスト効率', '生産の簡素さ'],
    applications: ['일반 식품', '비식품 제품'],
    applicationsJa: ['一般食品', '非食品製品']
  },

  // 1-3. Notch (ノッチ)
  {
    id: 'notch-yes',
    name: '노치 있음',
    nameJa: 'ノッチあり',
    description: '쉽게 개봉을 위한 노치',
    descriptionJa: '簡単な開封のためのノッチ',
    beforeImage: '/images/post-processing/3.노치 없음.png',
    afterImage: '/images/post-processing/3.노치 있음.png',
    thumbnail: '/images/post-processing/3.노치 있음.png',
    priceMultiplier: 1.03,
    features: ['쉬운 개봉', '도구 불필요', '깨끗한 절단'],
    featuresJa: ['簡単な開封', '道具不要', 'きれいな切断'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Precision-cut tear notch',
    technicalNotesJa: '精密カットティアノッチ',
    benefits: ['소비자 편의성', '사용자 경험 향상'],
    benefitsJa: ['消費者利便性', 'ユーザー体験向上'],
    applications: ['간식', '스낵크', '의료품'],
    applicationsJa: ['間食', 'スナック', '医薬品']
  },
  {
    id: 'notch-no',
    name: '노치 없음',
    nameJa: 'ノッチなし',
    description: '깨끗한 가장자리',
    descriptionJa: 'きれいなエッジ',
    beforeImage: '/images/post-processing/3.노치 없음.png',
    afterImage: '/images/post-processing/3.노치 없음.png',
    thumbnail: '/images/post-processing/3.노치 없음.png',
    priceMultiplier: 1.00,
    features: ['깨끗한 디자인', '표준 마감'],
    featuresJa: ['クリーンなデザイン', '標準仕上げ'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'opening-sealing',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Clean edge without notch',
    technicalNotesJa: 'ノッチなしのクリーンエッジ',
    benefits: ['비용 효율', '생산 속도'],
    benefitsJa: ['コスト効率', '生産スピード'],
    applications: ['산업용 포장', '표준 제품'],
    applicationsJa: ['産業包装', '標準製品']
  },

  // 1-4. Tear Notch (ティアノッチ)
  {
    id: 'tear-notch',
    name: '티어 노치',
    nameJa: 'ティアノッチ',
    description: '강화된 티어 노치 개봉',
    descriptionJa: '強化されたティアノッチ開封',
    beforeImage: '/images/post-processing/tear-notch-before.png',
    afterImage: '/images/post-processing/tear-notch-after.png',
    thumbnail: '/images/post-processing/tear-notch-after.png',
    priceMultiplier: 1.04,
    features: ['강화된 절단', '일정된 개봉 경로', '깔끔한 마감'],
    featuresJa: ['強化された切断', '一定な開封経路', 'きれいな仕上げ'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'opening-sealing',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Reinforced tear notch for guided opening',
    technicalNotesJa: '誘導開封用強化ティアノッチ',
    benefits: ['개봉 용이성', '파손 방지', '사용자 경험'],
    benefitsJa: ['開封容易性', '破損防止', 'ユーザー体験'],
    applications: ['간식', '애견 간식', '샘플'],
    applicationsJa: ['間食', 'ペットフード', 'サンプル']
  },

  // 1-5. Easy Open Zipper (イージーオープンジッパー)
  {
    id: 'easy-open-zipper',
    name: '이지 오픈 지퍼',
    nameJa: 'イージーオープンジッパー',
    description: '손쉽게 열리는 이지 오픈 지퍼',
    descriptionJa: '手軽く開けられるイージーオープンジッパー',
    beforeImage: '/images/post-processing/easy-zipper-before.png',
    afterImage: '/images/post-processing/easy-zipper-after.png',
    thumbnail: '/images/post-processing/easy-zipper-after.png',
    priceMultiplier: 1.15,
    features: ['손쉬운 개봉', '재밀폐 가능', '고급 지퍼'],
    featuresJa: ['手軽な開封', '再密閉可能', '高級ジッパー'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'opening-sealing',
    processingTime: '+3 business days',
    processingTimeJa: '+3営業日',
    minimumQuantity: 2000,
    technicalNotes: 'Easy-open pull tab zipper with track lock',
    technicalNotesJa: 'プルタブ付きトラックロックジッパー',
    benefits: ['소비자 편의성', '접근성 향상', '재사용성'],
    benefitsJa: ['消費者利便性', 'アクセシビリティ向上', '再利用性'],
    applications: ['어린이 제품', '간식', '건강식품'],
    applicationsJa: ['子供用製品', '間食', '健康サプリメント']
  },

  // =====================================================
  // 2. SURFACE TREATMENT (表面処理) - 10 options
  // =====================================================

  // 2-1. Glossy (光沢)
  {
    id: 'glossy',
    name: '유광 처리',
    nameJa: '光沢処理',
    description: '광택 있는 표면 처리',
    descriptionJa: '光沢のある表面処理',
    beforeImage: '/images/post-processing/2.무광.png',
    afterImage: '/images/post-processing/2.유광.png',
    thumbnail: '/images/post-processing/2.유광.png',
    priceMultiplier: 1.06,
    features: ['광택 효과', '고급 느낌', '시각적 매력'],
    featuresJa: ['光沢効果', '高級感', '視覚的魅力'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'surface-treatment',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Glossy coating finish',
    technicalNotesJa: '光沢コーティング仕上げ',
    benefits: ['제품 외관 향상', '브랜드 이미지 강화'],
    benefitsJa: ['製品外観向上', 'ブランドイメージ強化'],
    applications: ['프리미엄 제품', '화장품'],
    applicationsJa: ['プレミアム製品', '化粧品']
  },

  // 2-2. Matte (マット)
  {
    id: 'matte',
    name: '무광 처리',
    nameJa: 'マット処理',
    description: '무광 표면 처리',
    descriptionJa: 'マット表面処理',
    beforeImage: '/images/post-processing/2.유광.png',
    afterImage: '/images/post-processing/2.무광.png',
    thumbnail: '/images/post-processing/2.무광.png',
    priceMultiplier: 1.04,
    features: ['무광 효과', '부드러운 질감', '글레어 방지'],
    featuresJa: ['マット効果', '滑らかな手触り', '指紋防止'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
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
    name: 'UV 코팅',
    nameJa: 'UVコーティング',
    description: 'UV 경화 코팅 처리',
    descriptionJa: 'UV硬化コーティング処理',
    beforeImage: '/images/post-processing/uv-before.png',
    afterImage: '/images/post-processing/uv-after.png',
    thumbnail: '/images/post-processing/uv-after.png',
    priceMultiplier: 1.08,
    features: ['내스크래치', '광택 유지', '내구성'],
    featuresJa: ['耐スクラッチ', '光沢維持', '耐久性'],
    compatibleWith: ['stand_up', 'flat_3_side'],
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
    name: '소프트 터치',
    nameJa: 'ソフトタッチ',
    description: '부드러운 촉감의 소프트 터치 처리',
    descriptionJa: '柔らかい手触りのソフトタッチ処理',
    beforeImage: '/images/post-processing/soft-touch-before.png',
    afterImage: '/images/post-processing/soft-touch-after.png',
    thumbnail: '/images/post-processing/soft-touch-after.png',
    priceMultiplier: 1.12,
    features: ['부드러운 촉감', '고급 느낌', '지문 방지'],
    featuresJa: ['柔らかい手触り', '高級感', '指紋防止'],
    compatibleWith: ['stand_up', 'flat_3_side'],
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
    name: '메탈릭 코팅',
    nameJa: 'メタリックコーティング',
    description: '금속 광택의 메탈릭 코팅',
    descriptionJa: '金属光沢のメタリックコーティング',
    beforeImage: '/images/post-processing/metallic-before.png',
    afterImage: '/images/post-processing/metallic-after.png',
    thumbnail: '/images/post-processing/metallic-after.png',
    priceMultiplier: 1.15,
    features: ['금속 광택', '시선 끌기', '프리미엄 느낌'],
    featuresJa: ['金属光沢', '視線を惹く', 'プレミアム感'],
    compatibleWith: ['stand_up', 'flat_3_side'],
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
    name: '걸이타공 6mm',
    nameJa: '吊り穴 6mm',
    description: '6mm 걸이타공 처리',
    descriptionJa: '6mm吊り穴処理',
    beforeImage: '/images/post-processing/4.걸이타공 없음.png',
    afterImage: '/images/post-processing/4.걸이타공 있음.png',
    thumbnail: '/images/post-processing/4.걸이타공 있음.png',
    priceMultiplier: 1.04,
    features: ['6mm 걸이타공', '소매 전시용', '공간 효율'],
    featuresJa: ['6mm吊り穴', '小売表示', '省スペース'],
    compatibleWith: ['stand_up', 'flat_3_side'],
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
        name: '6mm 걸이타공 1개',
        nameJa: '6mm吊り穴 1個',
        description: '6mm 걸이타공 1개',
        descriptionJa: '6mm吊り穴 1個',
        image: '/images/post-processing/hang-hole-6mm-single.png',
        priceAdjustment: 0.00
      },
      {
        id: 'hang-hole-6mm-double',
        name: '6mm 걸이타공 2개',
        nameJa: '6mm吊り穴 2個',
        description: '6mm 걸이타공 2개',
        descriptionJa: '6mm吊り穴 2個',
        image: '/images/post-processing/hang-hole-6mm-double.png',
        priceAdjustment: 0.01
      }
    ]
  },
  {
    id: 'hang-hole-8mm',
    name: '걸이타공 8mm',
    nameJa: '吊り穴 8mm',
    description: '8mm 걸이타공 처리',
    descriptionJa: '8mm吊り穴処理',
    beforeImage: '/images/post-processing/4.걸이타공 없음.png',
    afterImage: '/images/post-processing/4.걸이타공 있음.png',
    thumbnail: '/images/post-processing/4.걸이타공 있음.png',
    priceMultiplier: 1.05,
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
    name: '걸이타공 없음',
    nameJa: '吊り穴なし',
    description: '걸이타공 없는 깨끗한 표면',
    descriptionJa: '吊り穴なしのクリーン表面',
    beforeImage: '/images/post-processing/4.걸이타공 없음.png',
    afterImage: '/images/post-processing/4.걸이타공 없음.png',
    thumbnail: '/images/post-processing/4.걸이타공 없음.png',
    priceMultiplier: 1.00,
    features: ['깨끗한 표면', '다목적 사용'],
    featuresJa: ['クリーンな表面', '多目的使用'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Clean surface without hang holes',
    technicalNotesJa: '穴なしのクリーン表面',
    benefits: ['디자인 자유도', '비용 절감'],
    benefitsJa: ['デザイン自由度', 'コスト削減'],
    applications: ['일반 포장', '직접 팩키징'],
    applicationsJa: ['一般包装', '直接パッケージング']
  },

  // 3-2. Corner Round (角丸)
  {
    id: 'corner-round',
    name: '모서리 둥근',
    nameJa: '角丸',
    description: '안전한 둥근 모서리 처리',
    descriptionJa: '安全な角丸加工',
    beforeImage: '/images/post-processing/5.모서리_직각.png',
    afterImage: '/images/post-processing/5.모서리_둥근.png',
    thumbnail: '/images/post-processing/5.모서리_둥근.png',
    priceMultiplier: 1.05,
    features: ['안전한 취급', '부드러운 느낌', '손상에 안전'],
    featuresJa: ['安全な取り扱い', '滑らかな手触り', '手に安全'],
    compatibleWith: ['stand_up', 'flat_3_side', 'soft_pouch'],
    category: 'shape-structure',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1000,
    technicalNotes: 'Rounded corner processing',
    technicalNotesJa: '角丸加工',
    benefits: ['안전성 향상', '프리미엄 느낌'],
    benefitsJa: ['安全性向上', 'プレミアム感'],
    applications: ['어린이용품', '전자제품'],
    applicationsJa: ['子供用製品', '電子製品']
  },
  {
    id: 'corner-square',
    name: '모서리 직각',
    nameJa: '角直角',
    description: '전통적인 직각 모서리',
    descriptionJa: '伝統的な直角デザイン',
    beforeImage: '/images/post-processing/5.모서리_직각.png',
    afterImage: '/images/post-processing/5.모서리_직각.png',
    thumbnail: '/images/post-processing/5.모서리_직각.png',
    priceMultiplier: 1.00,
    features: ['전통적 디자인', '최대 공간 활용'],
    featuresJa: ['伝統的な外観', '最大スペース'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'shape-structure',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Square corner processing',
    technicalNotesJa: '直角加工',
    benefits: ['공간 효율성', '비용 절감'],
    benefitsJa: ['スペース効率', 'コスト節約'],
    applications: ['산업용 제품', '표준 포장'],
    applicationsJa: ['産業製品', '標準包装']
  },

  // 3-3. Gusset (ガゼット)
  {
    id: 'gusset-bottom',
    name: '하부 거젯',
    nameJa: '底部ガゼット',
    description: '하부에 거젯 추가하여 용량 확장',
    descriptionJa: '底部にガゼット追加で容量拡張',
    beforeImage: '/images/post-processing/gusset-bottom-before.png',
    afterImage: '/images/post-processing/gusset-bottom-after.png',
    thumbnail: '/images/post-processing/gusset-bottom-after.png',
    priceMultiplier: 1.08,
    features: ['용량 증가', '안정적인 구조', '직립 가능'],
    featuresJa: ['容量増加', '安定した構造', '自立可能'],
    compatibleWith: ['flat_3_side', 'box'],
    category: 'shape-structure',
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Bottom fold-in gusset with reinforcement',
    technicalNotesJa: '補強付き底部折り込みガゼット',
    benefits: ['내용물 증가', '안정성', '공간 효율'],
    benefitsJa: ['内容物増加', '安定性', '空間効率'],
    applications: ['대용량 제품', '베이크리', '간식'],
    applicationsJa: ['大容量製品', 'ベーカリー', '間食']
  },

  // 3-4. Die Cut Window (ダイカットウィンドウ)
  {
    id: 'die-cut-window',
    name: '다이 컷 윈도우',
    nameJa: 'ダイカットウィンドウ',
    description: '제품 확인용 윈도우',
    descriptionJa: '製品確認用ウィンドウ',
    beforeImage: '/images/post-processing/diecut-before.png',
    afterImage: '/images/post-processing/diecut-after.png',
    thumbnail: '/images/post-processing/diecut-after.png',
    priceMultiplier: 1.07,
    features: ['내용물 확인', '시각적 마케팅', '구매 유도'],
    featuresJa: ['内容物確認', '視覚的マーケティング', '購買誘導'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'shape-structure',
    processingTime: '+2 business days',
    processingTimeJa: '+2営業日',
    minimumQuantity: 2000,
    technicalNotes: 'Precision die-cut window with film lamination',
    technicalNotesJa: 'フィルムラミネート付き精密ダイカットウィンドウ',
    benefits: ['제품 홍보', '소비자 신뢰', '매출 증대'],
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
    name: '습기 장벽',
    nameJa: '湿気バリア',
    description: '고강도 습기 장벽 코팅',
    descriptionJa: '高强度湿気バリアコーティング',
    beforeImage: '/images/post-processing/moisture-before.png',
    afterImage: '/images/post-processing/moisture-after.png',
    thumbnail: '/images/post-processing/moisture-after.png',
    priceMultiplier: 1.10,
    features: ['습기 차단', '제품 보호', '유통기 연장'],
    featuresJa: ['湿気遮断', '製品保護', '賞味期限延長'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'functionality',
    processingTime: '+2-3 business days',
    processingTimeJa: '+2-3営業日',
    minimumQuantity: 2000,
    technicalNotes: 'Enhanced moisture barrier coating',
    technicalNotesJa: '強化湿気バリアコーティング',
    benefits: ['제품 신선도', '품질 보호', '유통기 연장'],
    benefitsJa: ['製品鮮度', '品質保護', '賞味期限延長'],
    applications: ['건조 식품', '의료품', '전자제품'],
    applicationsJa: ['乾燥食品', '医薬品', '電子製品']
  },

  // 4-2. Tamper Evident (開封証拠)
  {
    id: 'tamper-evident',
    name: '개봉 증거',
    nameJa: '開封証拠',
    description: '개봉 여부를 시각적으로 표시',
    descriptionJa: '開封の有無を視覚的に表示',
    beforeImage: '/images/post-processing/tamper-before.png',
    afterImage: '/images/post-processing/tamper-after.png',
    thumbnail: '/images/post-processing/tamper-after.png',
    priceMultiplier: 1.06,
    features: ['보안 기능', '위조 방지', '소비자 신뢰'],
    featuresJa: ['保安機能', '偽造防止', '消費者信頼'],
    compatibleWith: ['stand_up', 'flat_3_side'],
    category: 'functionality',
    processingTime: '+2 business days',
    processingTimeJa: '+2営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Tamper-evident band or tape',
    technicalNotesJa: '開封証拠バンドまたはテープ',
    benefits: ['보안 강화', '브랜드 보호', '소비자 안심'],
    benefitsJa: ['保安強化', 'ブランド保護', '消費者安心'],
    applications: ['의료품', '고급 식품', '화장품'],
    applicationsJa: ['医薬品', '高級食品', '化粧品']
  },

  // 4-3. Oxygen Barrier (酸素バリア)
  {
    id: 'oxygen-barrier',
    name: '산소 장벽',
    nameJa: '酸素バリア',
    description: '산소 투과 방지 기능',
    descriptionJa: '酸素透過防止機能',
    beforeImage: '/images/post-processing/oxygen-before.png',
    afterImage: '/images/post-processing/oxygen-after.png',
    thumbnail: '/images/post-processing/oxygen-after.png',
    priceMultiplier: 1.12,
    features: ['산소 차단', '산화 방지', '품질 유지'],
    featuresJa: ['酸素遮断', '酸化防止', '品質維持'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
    category: 'functionality',
    processingTime: '+3-4 business days',
    processingTimeJa: '+3-4営業日',
    minimumQuantity: 2500,
    technicalNotes: 'Enhanced oxygen barrier film lamination',
    technicalNotesJa: '強化酸素バリアフィルムラミネート',
    benefits: ['제품 보존', '유통기 연장', '품질 보증'],
    benefitsJa: ['製品保存', '賞味期限延長', '品質保証'],
    applications: ['커피', '견과류', '고급 식품'],
    applicationsJa: ['コーヒー', '坚果類', '高級食品']
  },

  // 4-4. Anti-Static (帯電防止)
  {
    id: 'anti-static',
    name: '대전기 처리',
    nameJa: '帯電防止',
    description: '정전기 발생 방지',
    descriptionJa: '静電気発生防止',
    beforeImage: '/images/post-processing/antistatic-before.png',
    afterImage: '/images/post-processing/antistatic-after.png',
    thumbnail: '/images/post-processing/antistatic-after.png',
    priceMultiplier: 1.05,
    features: ['대전기 효과', '먼지 부착 방지', '제품 보호'],
    featuresJa: ['帯電防止効果', 'ほこり付着防止', '製品保護'],
    compatibleWith: ['flat_3_side', 'gusset'],
    category: 'functionality',
    processingTime: '+1-2 business days',
    processingTimeJa: '+1-2営業日',
    minimumQuantity: 1500,
    technicalNotes: 'Anti-static coating treatment',
    technicalNotesJa: '帯電防止コーティング処理',
    benefits: ['제품 보호', '작업 환경 개선', '품질 유지'],
    benefitsJa: ['製品保護', '作業環境改善', '品質維持'],
    applications: ['전자제품', '분말 제품', '의료품'],
    applicationsJa: ['電子製品', '粉末製品', '医薬品']
  },

  // 4-5. Child Resistant (チャイルドレジスタント)
  {
    id: 'child-resistant',
    name: '어린이 보호',
    nameJa: 'チャイルドレジスタント',
    description: '어린이 개봉 방지',
    descriptionJa: '子供による開封防止',
    beforeImage: '/images/post-processing/child-before.png',
    afterImage: '/images/post-processing/child-after.png',
    thumbnail: '/images/post-processing/child-after.png',
    priceMultiplier: 1.15,
    features: ['어린이 보호', '특수 개봉', '안전성'],
    featuresJa: ['子供保護', '特別な開封', '安全性'],
    compatibleWith: ['stand_up', 'flat_3_side'],
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
    id: 'opening-top',
    name: '상단 개봉',
    nameJa: '上端開封',
    description: '상부에서 쉽게 개봉',
    descriptionJa: '上部からの簡単な開封',
    beforeImage: '/images/post-processing/6.하단 오픈.png',
    afterImage: '/images/post-processing/6.상단 오픈.png',
    thumbnail: '/images/post-processing/6.상단 오픈.png',
    priceMultiplier: 1.02,
    features: ['상단 개봉', '편리한 사용', '내용물 보호'],
    featuresJa: ['上端開封', '便利な使用', '内容物保護'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset'],
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
    id: 'opening-bottom',
    name: '하단 개봉',
    nameJa: '下端開封',
    description: '하부에서 완전 개봉',
    descriptionJa: '下部からの完全な開封',
    beforeImage: '/images/post-processing/6.상단 오픈.png',
    afterImage: '/images/post-processing/6.하단 오픈.png',
    thumbnail: '/images/post-processing/6.하단 오픈.png',
    priceMultiplier: 1.03,
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
