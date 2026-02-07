
export const PRODUCT_CATEGORIES = {
    flat_3_side: {
        name_ja: '平袋',
        name_en: 'Three-Side Seal Bag',
        description_ja: 'シンプルでコストパフォーマンスに優れた定番パッケージ。小物や試供品、サンプル配布に最適。',
        description_en: 'Simple and cost-effective standard packaging. Ideal for small items, samples, and trial products.',
        icon: 'package',
        features: ['低コスト', 'シンプル設計', '多用途対応']
    },
    gassho: {
        name_ja: '合掌袋',
        name_en: 'Gassho Bag (Pillow Pouch)',
        description_ja: '底部にマチ付きで自立する合掌袋（ピローパウチ）。コーヒー豆や茶葉、スナック菓子の包装に最適。',
        description_en: 'Gusseted bottom pillow pouch that stands on its own. Ideal for coffee beans, tea leaves, and snack packaging.',
        icon: 'box',
        features: ['自立設計', '大容量', '底部マチ付き']
    },
    stand_up: {
        name_ja: 'スタンドパウチ',
        name_en: 'Stand Pouch',
        description_ja: '自立型で陳列性に優れ、チャック付きで再封可能。食品・健康食品・化粧品まで幅広く対応。',
        description_en: 'Self-standing with excellent display properties, resealable with zipper. Wide support for food, health products, and cosmetics.',
        icon: 'shopping-bag',
        features: ['自立設計', '再封可能', '陳列性に優れる']
    },
    box: {
        name_ja: 'BOX型パウチ',
        name_en: 'Box Pouch',
        description_ja: '箱型形状で自立性が高く、内容物の保護性に優れた立体パッケージ。',
        description_en: 'Box-shaped pouch with excellent self-standing properties and superior protection for contents.',
        icon: 'package',
        features: ['自立性', '保護性', '立体設計']
    },
    spout_pouch: {
        name_ja: 'スパウトパウチ',
        name_en: 'Spout Pouch',
        description_ja: '液体食品・化粧品・健康食品に最適なスパウト付きパウチ。軽量で持ち運びやすく、使いやすいスパウトで注ぎやすさを実現。',
        description_en: 'Spout pouch optimal for liquid foods, cosmetics, and health products. Lightweight and portable with easy-to-use spout for pouring.',
        icon: 'package-2',
        features: ['液体対応', '注ぎやすさ', '持ち運び便利']
    },
    roll_film: {
        name_ja: 'ロールフィルム',
        name_en: 'Roll Film',
        description_ja: '自動包装機に対応。大量生産に最適で、コスト削減を実現します。',
        description_en: 'Compatible with automatic packaging machines. Optimal for mass production, achieving cost reduction.',
        icon: 'archive',
        features: ['大量生産対応', '自動包装機対応', 'コスト削減']
    }
} as const;

// 共通Phase 1データ
const commonFAQs = [
    // === 注文・納期関連 ===
    {
        question_ja: '最低注文数量は?',
        question_en: 'What is the minimum order quantity?',
        answer_ja: '500個〜1000個から承っております。小ロットにも対応可能です。',
        answer_en: 'We accept orders from 500-1000 pieces. Small lot orders are also available.',
        category: 'ordering'
    },
    {
        question_ja: '納期はどのくらい?',
        question_en: 'What is the lead time?',
        answer_ja: '通常10-30営業日です。緊急対応も可能です。',
        answer_en: 'Usually 10-30 business days. Urgent orders are also possible.',
        category: 'ordering'
    },
    {
        question_ja: '分割納品は可能ですか?',
        question_en: 'Is split delivery available?',
        answer_ja: 'はい、ご相談により分割納品に対応いたします。',
        answer_en: 'Yes, split delivery is available upon consultation.',
        category: 'ordering'
    },
    {
        question_ja: 'キャンセルや変更はできますか?',
        question_en: 'Can I cancel or make changes?',
        answer_ja: '製造開始前であれば対応可能です。詳細はお問い合わせください。',
        answer_en: 'Changes are possible before production starts. Please contact us for details.',
        category: 'ordering'
    },

    // === 印刷関連 ===
    {
        question_ja: '印刷は対応していますか?',
        question_en: 'Do you support printing?',
        answer_ja: 'はい、デジタル印刷とグラビア印刷に対応しています。フルカラー印刷も可能です。',
        answer_en: 'Yes, we support both digital and gravure printing. Full-color printing is available.',
        category: 'printing'
    },
    {
        question_ja: '印刷データの形式は?',
        question_en: 'What file formats for printing?',
        answer_ja: 'AI、PDF、PSD形式を受け付けています。詳細はガイドラインをご参照ください。',
        answer_en: 'We accept AI, PDF, and PSD formats. Please refer to our guidelines for details.',
        category: 'printing'
    },
    {
        question_ja: '刷数に制限はありますか?',
        question_en: 'Is there a limit on the number of colors?',
        answer_ja: '最大8色まで対応可能です。',
        answer_en: 'Up to 8 colors are available.',
        category: 'printing'
    },
    {
        question_ja: '刷版代はかかりますか?',
        question_en: 'Is there a plate fee?',
        answer_ja: 'デジタル印刷の場合は刷版代不要です。グラビア印刷の場合は別途お見積もり。',
        answer_en: 'No plate fee for digital printing. Gravure printing requires a separate quote.',
        category: 'printing'
    },
    {
        question_ja: 'デザイン作成サポートはありますか?',
        question_en: 'Do you offer design support?',
        answer_ja: 'はい、専門のデザインチームがご支援いたします。',
        answer_en: 'Yes, our professional design team can assist you.',
        category: 'printing'
    },

    // === 仕様・素材関連 ===
    {
        question_ja: '対応可能な素材は?',
        question_en: 'What materials are available?',
        answer_ja: 'PET、AL（アルミ）、NY（ナイロン）、VMPET、CPP、透明蒸着PET、PE、PP、紙などに対応しています。',
        answer_en: 'We support PET, AL (Aluminum), NY (Nylon), VMPET, CPP, Transparent PET, PE, PP, Paper, etc.',
        category: 'specifications'
    },
    {
        question_ja: 'バリア性はありますか?',
        question_en: 'Do you have barrier properties?',
        answer_ja: 'はい、アルミ蒸着、シリカ蒸着、VMPETなど、優れたバリア性を持つ素材をご用意しています。',
        answer_en: 'Yes, we offer materials with excellent barrier properties such as aluminum lamination, silica coating, and VMPET.',
        category: 'specifications'
    },
    {
        question_ja: '耐熱性はありますか?',
        question_en: 'Is it heat resistant?',
        answer_ja: 'はい、レトルト対応製品もご用意しています。',
        answer_en: 'Yes, we also offer retort-compatible products.',
        category: 'specifications'
    },
    {
        question_ja: 'チャック付きは可能ですか?',
        question_en: 'Is zipper available?',
        answer_ja: 'はい、各種ジッパーチャックをご用意しています。',
        answer_en: 'Yes, various zipper options are available.',
        category: 'specifications'
    },
    {
        question_ja: 'スパウト取り付けは可能ですか?',
        question_en: 'Can spouts be attached?',
        answer_ja: 'はい、キャップタイプやノズルサイズなどご要望に合わせて製作可能です。',
        answer_en: 'Yes, we can manufacture according to your requirements including cap type and nozzle size.',
        category: 'specifications'
    },
    {
        question_ja: 'ガゼット（マチ）は追加できますか?',
        question_en: 'Can gussets be added?',
        answer_ja: 'はい、底マチ、サイドマチなど対応可能です。',
        answer_en: 'Yes, bottom gussets and side gussets are available.',
        category: 'specifications'
    },

    // === 食品業界向けFAQ ===
    {
        question_ja: '食品安全規格に対応していますか?',
        question_en: 'Do you meet food safety standards?',
        answer_ja: 'はい、食品衛生法適合、FSSC 22000認証取得済みです。',
        answer_en: 'Yes, we comply with food sanitation laws and are FSSC 22000 certified.',
        category: 'food'
    },
    {
        question_ja: '酸素や湿気から守りますか?',
        question_en: 'Does it protect from oxygen and moisture?',
        answer_ja: 'はい、高バリア性素材により酸素や湿気を遮断し、品質を保持します。',
        answer_en: 'Yes, high barrier materials block oxygen and moisture to maintain quality.',
        category: 'food'
    },
    {
        question_ja: '匂い移防はありますか?',
        question_en: 'Is there odor transfer protection?',
        answer_ja: 'はい、防臭機能のある素材もご用意しています。',
        answer_en: 'Yes, we also offer odor-resistant materials.',
        category: 'food'
    },
    {
        question_ja: '保存期間はどのくらいですか?',
        question_en: 'What is the shelf life?',
        answer_ja: '素材と構成によりますが、適切な包装で6ヶ月〜1年以上の保存が可能です。',
        answer_en: 'Depends on material and structure, but proper packaging can achieve 6 months to over 1 year of shelf life.',
        category: 'food'
    },

    // === 化粧品業界向けFAQ ===
    {
        question_ja: '高級感のあるデザインは可能ですか?',
        question_en: 'Can you create premium designs?',
        answer_ja: 'はい、箔押し、エンボス加工、マット/グロス仕上げなど、高級感のある加工に対応しています。',
        answer_en: 'Yes, we support premium finishes such as foil stamping, embossing, and matte/gloss coatings.',
        category: 'cosmetics'
    },
    {
        question_ja: '小容量パッケージも作れますか?',
        question_en: 'Can you make small packages?',
        answer_ja: 'はい、サンプルや試供品用の小容量パッケージも製作可能です。',
        answer_en: 'Yes, we can produce small packages for samples and trial products.',
        category: 'cosmetics'
    },
    {
        question_ja: '透明窓付きパッケージは対応できますか?',
        question_en: 'Can you make packages with transparent windows?',
        answer_ja: 'はい、内容物が見える透明窓付きデザインも可能です。',
        answer_en: 'Yes, we can create designs with transparent windows to show contents.',
        category: 'cosmetics'
    },
    {
        question_ja: '携带に便利なサイズはありますか?',
        question_en: 'Do you have portable sizes?',
        answer_ja: 'はい、バッグに入る携帯に便利なサイズもご用意しています。',
        answer_en: 'Yes, we offer portable sizes convenient for carrying in bags.',
        category: 'cosmetics'
    },

    // === 医薬品・健康食品業界向けFAQ ===
    {
        question_ja: 'チャイルドレジスタンス機能はありますか?',
        question_en: 'Is child resistance available?',
        answer_ja: 'はい、子供による誤開封を防止するチャイルドレジスタンス機能付きをご用意しています。',
        answer_en: 'Yes, we offer products with child-resistant functions to prevent accidental opening by children.',
        category: 'pharmaceutical'
    },
    {
        question_ja: '遮光性はありますか?',
        question_en: 'Is it light-resistant?',
        answer_ja: 'はい、アルミ箔やシリカ蒸着などによる優れた遮光性を持っています。',
        answer_en: 'Yes, it has excellent light resistance with aluminum foil and silica coating.',
        category: 'pharmaceutical'
    },
    {
        question_ja: 'GMP対応は可能ですか?',
        question_en: 'Can you meet GMP standards?',
        answer_ja: 'はい、GMP（適正製造規範）に準拠した製造管理が可能です。',
        answer_en: 'Yes, we can manufacture in compliance with GMP (Good Manufacturing Practice).',
        category: 'pharmaceutical'
    },
    {
        question_ja: 'バリア袋は対応できますか?',
        question_en: 'Do you have barrier pouches?',
        answer_ja: 'はい、医薬品・健康食品に適した高バリア袋をご用意しています。',
        answer_en: 'Yes, we offer high barrier pouches suitable for pharmaceuticals and health supplements.',
        category: 'pharmaceutical'
    },

    // === 電子機器業界向けFAQ ===
    {
        question_ja: '静気対策はありますか?',
        question_en: 'Do you have ESD protection?',
        answer_ja: 'はい、静気防止フィルムを使用した静電気対策パッケージをご用意しています。',
        answer_en: 'Yes, we offer ESD-protective packaging using anti-static films.',
        category: 'electronics'
    },
    {
        question_ja: '防錆効果はありますか?',
        question_en: 'Is there rust prevention?',
        answer_ja: 'はい、錆防止剤配合フィルムや防錆仕様のパッケージに対応しています。',
        answer_en: 'Yes, we support packages with VCI film or rust prevention specifications.',
        category: 'electronics'
    },
    {
        question_ja: '精密部品の保護に適していますか?',
        question_en: 'Is it suitable for precision parts?',
        answer_ja: 'はい、衝撃吸収材付きや緩衝材仕様のパッケージも製作可能です。',
        answer_en: 'Yes, we can produce packages with shock-absorbing materials or cushioning specifications.',
        category: 'electronics'
    },

    // === サンプル・見積もり関連 ===
    {
        question_ja: 'サンプルはもらえますか?',
        question_en: 'Can I get samples?',
        answer_ja: 'はい、サンプルの作成・発送が可能です。お問い合わせください。',
        answer_en: 'Yes, we can create and send samples. Please contact us.',
        category: 'sample'
    },
    {
        question_ja: '見積もりは無料ですか?',
        question_en: 'Is the quotation free?',
        answer_ja: 'はい、お見積もりは無料です。詳細な仕様をいただければ正確なお見積もりを作成いたします。',
        answer_en: 'Yes, quotations are free. Please provide detailed specifications for accurate quotes.',
        category: 'sample'
    },
    {
        question_ja: '相談から納品までの流れを教えてください',
        question_en: 'Please explain the process from consultation to delivery',
        answer_ja: 'ヒアリング→仕様確定→お見積もり→製造→検査→納品の流れです。',
        answer_en: 'Consultation → Specification → Quotation → Production → Inspection → Delivery.',
        category: 'sample'
    }
];

const commonDownloads = [
    {
        title_ja: '製品カタログ',
        title_en: 'Product Catalog',
        url: '/downloads/catalog/products.pdf',
        type: 'catalog' as const,
        size: '3.5 MB'
    },
    {
        title_ja: '技術仕様書',
        title_en: 'Technical Specifications',
        url: '/downloads/specs/general-specs.pdf',
        type: 'spec_sheet' as const,
        size: '1.5 MB'
    }
];

const commonCertifications = [
    {
        name: 'ISO 9001',
        issuer: 'ISO',
        description: '品質マネジメントシステム認証'
    },
    {
        name: '食品衛生法適合',
        issuer: '日本厚生労働省',
        description: '食品衛生法に基づく適合確認'
    }
];

// Package-Lab actual product data
export function getAllProducts(categoryFilter?: string | null, locale: string = 'ja') {
    const allProducts = [
        // 1. Three-Side Seal Pouch (平袋)
        {
            id: 'three-seal-001',
            category: 'flat_3_side' as const,
            name: '平袋',
            name_ja: '平袋',
            name_en: 'Three-Side Seal Pouch',
            name_ko: 'Three-Side Seal Pouch',
            description_ja: '3面シールのシンプルでコストパフォーマンスに優れた定番パッケージ。小物や試供品、サンプル配布に最適。',
            description_en: 'Simple three-side seal packaging with excellent cost performance. Ideal for small items, samples, and trial products.',
            specifications: {
                width_range: '50-300mm',
                height_range: '80-500mm',
                thickness_range: '50-150μm',
                materials: ['PE', 'PP', 'PET', 'Aluminum Laminated']
            },
            materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
            image: '/images/real-products/3sealpouch.png',
            pricing_formula: {
                base_cost: 8000,
                per_unit_cost: 8,
                min_quantity: 500
            },
            min_order_quantity: 500,
            lead_time_days: 30,
            sort_order: 1,
            is_active: true,
            tags: locale === 'ja'
                ? ['低コスト', '最安値', '超低コスト印刷', '試し印刷に最適']
                : ['Low Cost', 'Best Price', 'Ultra-Low Cost Print', 'Optimal for Trial Prints'],
            applications: locale === 'ja'
                ? ['試供品', 'サンプル', '小物包装', '試験印刷']
                : ['Trial Products', 'Samples', 'Small Item Packaging', 'Test Printing'],
            features: locale === 'ja'
                ? ['低コスト', 'シンプル設計', '多用途対応', '迅速生産']
                : ['Low Cost', 'Simple Design', 'Multi-Purpose', 'Quick Production'],
            // Phase 1: 基本拡張データ
            faq: commonFAQs,
            downloads: commonDownloads,
            related_case_studies: ['pouch-006'],
            certifications: commonCertifications
        },

        // 2. Stand Pouch (スタンドパウチ)
        {
            id: 'stand-pouch-001',
            category: 'stand_up' as const,
            name: 'スタンドパウチ',
            name_ja: 'スタンドパウチ',
            name_en: 'Stand Pouch',
            name_ko: 'Stand Pouch',
            description_ja: '自立型で陳列性に優れ、チャック付きで再封可能。食品・健康食品・化粧品まで幅広く対応。',
            description_en: 'Self-standing with excellent display properties, resealable with zipper. Wide support for food, health products, and cosmetics.',
            specifications: {
                width_range: '80-250mm',
                height_range: '120-350mm',
                thickness_range: '60-180μm',
                materials: ['PE', 'PP', 'PET', 'Aluminum Laminated']
            },
            materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
            image: '/images/portfolio/granola-standpouch-real.jpg',
            pricing_formula: {
                base_cost: 18000,
                per_unit_cost: 12,
                min_quantity: 500
            },
            min_order_quantity: 500,
            lead_time_days: 30,
            sort_order: 2,
            is_active: true,
            tags: locale === 'ja'
                ? ['人気No.1', 'デジタル印刷', '版代不要', '1枚から印刷']
                : ['Popular No.1', 'Digital Printing', 'No Plate Cost', 'Print from 1 piece'],
            applications: locale === 'ja'
                ? ['食品包装', '健康食品', '化粧品', 'ペットフード']
                : ['Food Packaging', 'Health Food', 'Cosmetics', 'Pet Food'],
            features: locale === 'ja'
                ? ['自立設計', '再封可能', '陳列性に優れる', 'デジタル印刷対応']
                : ['Self-Standing', 'Resealable', 'Excellent Display', 'Digital Print Ready'],
            // Phase 1: 基本拡張データ
            faq: [
                ...commonFAQs,
                {
                    question_ja: 'チャックは標準装備ですか?',
                    question_en: 'Is the zipper standard equipment?',
                    answer_ja: 'はい、ジッパーチャックが標準装備されています。',
                    answer_en: 'Yes, zipper is standard equipment.',
                    category: 'specifications'
                }
            ],
            downloads: [
                ...commonDownloads,
                {
                    title_ja: 'スタンドパウチ印刷ガイドライン',
                    title_en: 'Stand Pouch Printing Guidelines',
                    url: '/downloads/guides/stand-pouch-printing.pdf',
                    type: 'technical_guide',
                    size: '0.8 MB'
                }
            ],
            related_case_studies: ['pouch-001', 'pouch-002'],
            certifications: [
                ...commonCertifications,
                {
                    name: 'FSSC 22000',
                    issuer: 'FSSC',
                    description: '食品安全システム認証'
                }
            ]
        },

        // 3. Box Pouch (BOX型パウチ)
        {
            id: 'box-pouch-001',
            category: 'box' as const,
            name: 'BOX型パウチ',
            name_ja: 'BOX型パウチ',
            name_en: 'Box Pouch',
            name_ko: 'Box Pouch',
            description_ja: '箱型形状で自立性が高く、内容物の保護性に優れた立体パッケージ。',
            description_en: 'Box-shaped pouch with excellent self-standing properties and superior protection for contents.',
            specifications: {
                width_range: '100-250mm',
                height_range: '150-300mm',
                depth_range: '40-80mm',
                thickness_range: '100-200μm',
                materials: ['PET', 'Aluminum Laminated', 'PE']
            },
            materials: ['PET', 'ALUMINUM', 'PE'],
            image: '/images/products/gusset-bag-coffee.webp',
            pricing_formula: {
                base_cost: 28000,
                per_unit_cost: 16,
                min_quantity: 800
            },
            min_order_quantity: 800,
            lead_time_days: 30,
            sort_order: 3,
            is_active: true,
            tags: locale === 'ja'
                ? ['高級感', '自立性', '保護性', '立体設計']
                : ['Premium Feel', 'Self-Standing', 'Protective', '3D Design'],
            applications: locale === 'ja'
                ? ['高級食品', 'プレミアム製品', 'ギフト包装', '化粧品']
                : ['Premium Food', 'Premium Products', 'Gift Packaging', 'Cosmetics'],
            features: locale === 'ja'
                ? ['自立性', '保護性', '立体設計', '高級感']
                : ['Self-Standing', 'Protective', '3D Design', 'Premium Feel'],
            // Phase 1
            faq: [
                ...commonFAQs,
                {
                    question_ja: 'ギフト包装に対応していますか?',
                    question_en: 'Do you support gift packaging?',
                    answer_ja: 'はい、高級ギフト包装に最適なBOX型パウチをご用意しています。',
                    answer_en: 'Yes, our box pouch is ideal for premium gift packaging.',
                    category: 'general'
                }
            ],
            downloads: commonDownloads,
            related_case_studies: ['pouch-003'],
            certifications: commonCertifications
        },

        // 4. Spout Pouch (スパウトパウチ)
        {
            id: 'spout-pouch-001',
            category: 'spout_pouch' as const,
            name: 'スパウトパウチ',
            name_ja: 'スパウトパウチ',
            name_en: 'Spout Pouch',
            name_ko: 'Spout Pouch',
            description_ja: '液体食品・化粧品・健康食品に最適なスパウト付きパウチ。軽量で持ち運びやすく、使いやすいスパウトで注ぎやすさを実現。',
            description_en: 'Spout pouch optimal for liquid foods, cosmetics, and health products. Lightweight and portable with easy-to-use spout for pouring.',
            specifications: {
                width_range: '120-300mm',
                height_range: '200-400mm',
                capacity_range: '100-1000ml',
                thickness_range: '120-250μm',
                materials: ['PET', 'Aluminum Laminated', 'PE', 'Nylon']
            },
            materials: ['PET', 'ALUMINUM', 'PE', 'NYLON'],
            image: '/images/products/spout-pouch-1.png',
            pricing_formula: {
                base_cost: 30000,
                per_unit_cost: 18,
                min_quantity: 1000
            },
            min_order_quantity: 1000,
            lead_time_days: 30,
            sort_order: 4,
            is_active: true,
            tags: locale === 'ja'
                ? ['NEW', '液体対応', '注ぎやすさ', '高品質']
                : ['NEW', 'Liquid Compatible', 'Easy to Pour', 'High Quality'],
            applications: locale === 'ja'
                ? ['液体食品', '化粧品', '健康食品', '飲料', 'ソース']
                : ['Liquid Food', 'Cosmetics', 'Health Food', 'Beverages', 'Sauces'],
            features: locale === 'ja'
                ? ['液体対応', '注ぎやすさ', '持ち運び便利', '耐水性']
                : ['Liquid Compatible', 'Easy to Pour', 'Portable', 'Water Resistant'],
            // Phase 1
            faq: [
                ...commonFAQs,
                {
                    question_ja: 'スパウトのサイズは選べますか?',
                    question_en: 'Can I choose the spout size?',
                    answer_ja: 'はい、用途に合わせて様々なサイズのスパウトをご用意しています。',
                    answer_en: 'Yes, we have various spout sizes available for different purposes.',
                    category: 'specifications'
                }
            ],
            downloads: [
                ...commonDownloads,
                {
                    title_ja: 'スパウトパウチ技術ガイド',
                    title_en: 'Spout Pouch Technical Guide',
                    url: '/downloads/guides/spout-pouch-guide.pdf',
                    type: 'technical_guide',
                    size: '1.0 MB'
                }
            ],
            related_case_studies: ['pouch-004'],
            certifications: commonCertifications
        },

        // 5. Roll Film (ロールフィルム)
        {
            id: 'roll-film-001',
            category: 'roll_film' as const,
            name: 'ロールフィルム',
            name_ja: 'ロールフィルム',
            name_en: 'Roll Film',
            name_ko: 'Roll Film',
            description_ja: '自動包装機に対応。大量生産に最適で、コスト削減を実現します。',
            description_en: 'Compatible with automatic packaging machines. Optimal for mass production, achieving cost reduction.',
            specifications: {
                width_range: '200-1200mm',
                length_range: '100-1000m',
                thickness_range: '30-150μm',
                materials: ['PE', 'PP', 'PET', 'Aluminum Laminated']
            },
            materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
            image: '/images/auto-roll-real.jpg',
            pricing_formula: {
                base_cost: 5000,
                per_unit_cost: 5,
                min_quantity: 1000,
                unit_type: 'meter'
            },
            min_order_quantity: 1000,
            lead_time_days: 30,
            sort_order: 5,
            is_active: true,
            tags: locale === 'ja'
                ? ['大量生産対応', '必要分だけ', '在庫リスクゼロ', '自動包装機対応']
                : ['Mass Production', 'Only What You Need', 'Zero Inventory Risk', 'Auto Packaging Compatible'],
            applications: locale === 'ja'
                ? ['自動包装', '大量生産', '食品工場', '包装機械']
                : ['Automatic Packaging', 'Mass Production', 'Food Factory', 'Packaging Machinery'],
            features: locale === 'ja'
                ? ['大量生産対応', '自動包装機対応', 'コスト削減', '必要分だけ']
                : ['Mass Production Compatible', 'Auto Packaging Ready', 'Cost Reduction', 'On-Demand'],
            // Phase 1
            faq: [
                ...commonFAQs,
                {
                    question_ja: 'どの自動包装機に対応していますか?',
                    question_en: 'Which automatic packaging machines are compatible?',
                    answer_ja: '主要なメーカーの自動包装機に対応しています。詳細はお問い合わせください。',
                    answer_en: 'Compatible with major automatic packaging machines. Please contact us for details.',
                    category: 'specifications'
                }
            ],
            downloads: [
                ...commonDownloads,
                {
                    title_ja: '自動包装機対応リスト',
                    title_en: 'Compatible Machine List',
                    url: '/downloads/specs/machine-compatibility.pdf',
                    type: 'spec_sheet',
                    size: '0.5 MB'
                }
            ],
            related_case_studies: ['pouch-005'],
            certifications: commonCertifications
        },

        // 6. Gassho Bag (合掌袋/ピローパウチ)
        {
            id: 'gassho-001',
            category: 'gassho' as const,
            name: '合掌袋',
            name_ja: '合掌袋',
            name_en: 'Gassho Bag (Pillow Pouch)',
            name_ko: '합장대',
            description_ja: '底部にマチ付きで自立する合掌袋（ピローパウチ）。コーヒー豆、茶葉、スナック菓子、ナッツ類の包装に最適。自立性と収納性を兼ね備えた高級パッケージ。',
            description_en: 'Gusseted bottom pillow pouch that stands on its own. Ideal for coffee beans, tea leaves, snack packaging, and nuts. Premium packaging with both self-standing and storage properties.',
            specifications: {
                width_range: '100-250mm',
                height_range: '150-350mm',
                depth_range: '30-80mm',
                thickness_range: '70-180μm',
                materials: ['PE', 'PP', 'PET', 'Aluminum Laminated']
            },
            materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
            image: '/images/products/gassho-bag.png',
            pricing_formula: {
                base_cost: 15000,
                per_unit_cost: 10,
                min_quantity: 500
            },
            min_order_quantity: 500,
            lead_time_days: 30,
            sort_order: 6,
            is_active: true,
            tags: locale === 'ja'
                ? ['自立設計', '大容量', '高級感', 'マチ付き']
                : ['Self-Standing', 'Large Capacity', 'Premium', 'Gusseted'],
            applications: locale === 'ja'
                ? ['コーヒー豆', '茶葉', 'スナック', 'ナッツ', '穀物']
                : ['Coffee Beans', 'Tea Leaves', 'Snacks', 'Nuts', 'Grains'],
            features: locale === 'ja'
                ? ['自立設計', '底部マチ付き', '大容量', '高級感', '省スペース']
                : ['Self-Standing', 'Bottom Gusset', 'Large Capacity', 'Premium', 'Space-Saving'],
            // Phase 1
            faq: commonFAQs,
            downloads: commonDownloads,
            related_case_studies: ['pouch-002'],
            certifications: commonCertifications
        }
    ];

    // Filter by category if specified
    if (categoryFilter && categoryFilter !== 'all') {
        return allProducts.filter(product => product.category === categoryFilter);
    }

    return allProducts;
}
