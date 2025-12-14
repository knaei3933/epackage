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
  category: 'closure' | 'finish' | 'opening' | 'display' | 'structure'
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
  // 개봉/파지 기능: 지퍼 (유무)
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
    category: 'closure',
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
      },
      {
        id: 'zipper-position-top',
        name: '지퍼 위치: 상단',
        nameJa: 'ジッパー位置：上端',
        description: '상단에 지퍼 배치',
        descriptionJa: '上端にジッパー配置',
        image: '/images/post-processing/zipper-position-top.png',
        priceAdjustment: 0.00
      },
      {
        id: 'zipper-position-middle',
        name: '지퍼 위치: 중간',
        nameJa: 'ジッパー位置：中央',
        description: '중간에 지퍼 배치',
        descriptionJa: '中央にジッパー配置',
        image: '/images/post-processing/zipper-position-middle.png',
        priceAdjustment: 0.01
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
    category: 'closure',
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

  // 개봉/파지 기능: 밸브 (유무)
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
    category: 'structure',
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
    category: 'structure',
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

  // 표면 처리: 유광
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
    category: 'finish',
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
    category: 'finish',
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

  // 형태/구조: 노치 (유무)
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
    category: 'opening',
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
    category: 'opening',
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

  // 형태/구조: 모서리 (둥근/직각)
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
    category: 'structure',
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
    category: 'structure',
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

  // 기능성: 걸이타공 (유무) - 6mm / 8mm 선택
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
    category: 'display',
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
    category: 'display',
    processingTime: '+1 business day',
    processingTimeJa: '+1営業日',
    minimumQuantity: 1500,
    technicalNotes: '8mm precision punching with reinforcement',
    technicalNotesJa: '8mm精密パンチング補強',
    benefits: ['내구성 향상', '대형 제품 지원', '안전성'],
    benefitsJa: ['耐久性向上', '大型製品対応', '安全性'],
    applications: ['대형 제품', '산업용품'],
    applicationsJa: ['大型製品', '産業用品'],
    variants: [
      {
        id: 'hang-hole-8mm-single',
        name: '8mm 걸이타공 1개',
        nameJa: '8mm吊り穴 1個',
        description: '8mm 걸이타공 1개',
        descriptionJa: '8mm吊り穴 1個',
        image: '/images/post-processing/hang-hole-8mm-single.png',
        priceAdjustment: 0.00
      },
      {
        id: 'hang-hole-8mm-double',
        name: '8mm 걸이타공 2개',
        nameJa: '8mm吊り穴 2個',
        description: '8mm 걸이타공 2개',
        descriptionJa: '8mm吊り穴 2個',
        image: '/images/post-processing/hang-hole-8mm-double.png',
        priceAdjustment: 0.01
      },
      {
        id: 'hang-hole-8mm-reinforced',
        name: '8mm 걸이타공 보강',
        nameJa: '8mm吊り穴補強',
        description: '보강된 8mm 걸이타공',
        descriptionJa: '補強された8mm吊り穴',
        image: '/images/post-processing/hang-hole-8mm-reinforced.png',
        priceAdjustment: 0.02
      }
    ]
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
    category: 'display',
    processingTime: 'Standard production time',
    processingTimeJa: '標準生産時間',
    minimumQuantity: 500,
    technicalNotes: 'Clean surface without hang holes',
    technicalNotesJa: '穴なしのクリーン表面',
    benefits: ['디자인 자유도', '비용 절감'],
    benefitsJa: ['デザイン自由度', 'コスト削減'],
    applications: ['일반 포장', '직접 판키징'],
    applicationsJa: ['一般包装', '直接パッケージング'],
    variants: [
      {
        id: 'hang-hole-count-single',
        name: '걸이타공 1개',
        nameJa: '吊り穴 1個',
        description: '중앙에 1개의 걸이타공',
        descriptionJa: '中央に1個の吊り穴',
        image: '/images/post-processing/hang-hole-single.png',
        priceAdjustment: 0.00
      },
      {
        id: 'hang-hole-count-double',
        name: '걸이타공 2개',
        nameJa: '吊り穴 2個',
        description: '양쪽에 2개의 걸이타공',
        descriptionJa: '両側に2個の吊り穴',
        image: '/images/post-processing/hang-hole-double.png',
        priceAdjustment: 0.01
      },
      {
        id: 'hang-hole-count-custom',
        name: '걸이타공 맞춤',
        nameJa: '吊り穴 カスタム',
        description: '원하는 위치와 개수 지정',
        descriptionJa: '希望の位置と数を指定',
        image: '/images/post-processing/hang-hole-custom.png',
        priceAdjustment: 0.02
      }
    ]
  },

  // 기능성: 개봉 위치 (상단/하단)
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
    category: 'opening',
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
    category: 'opening',
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

// Processing categories matching 수정사항.md requirements
export const getProcessingCategories = [
  {
    id: 'opening-sealing',
    name: '개봉/파지 기능',
    nameJa: '開封/密閉機能',
    icon: '🔓',
    description: 'Package opening and sealing functionality',
    descriptionJa: 'パッケージの開封と密閉機能'
  },
  {
    id: 'surface-treatment',
    name: '표면 처리',
    nameJa: '表面処理',
    icon: '✨',
    description: 'Surface treatment finishes',
    descriptionJa: '表面仕上げ処理'
  },
  {
    id: 'shape-structure',
    name: '형태/구조',
    nameJa: '形状/構造',
    icon: '🏗️',
    description: 'Shape and structural modifications',
    descriptionJa: '形状と構造の修正'
  },
  {
    id: 'functionality',
    name: '기능성',
    nameJa: '機能性',
    icon: '⚡',
    description: 'Additional functional capabilities',
    descriptionJa: '追加機能性'
  }
] as const